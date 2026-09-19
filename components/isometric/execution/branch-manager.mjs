import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { IsoMaxSolver } from '../solver.mjs';
import { deriveNativeFrontierConsequence } from '../frontier.mjs';
import { CONCLUSION_EXACT_VALUE, CONCLUSION_FORCED_MOVE } from '../certificate.mjs';
import { CENTER_ORDER, promotedColumn } from '../move-order.mjs';
import { positive, validateTaskResult } from './task.mjs';
// Reintegrate the existing priority/failure/dispatch executor. Its default
// quotient result contract remains unchanged; no second executor is introduced.
import { createSearchWorkerExecutor } from '../../../research/semantic-quotient/state-identity-unification/src/quotient-search-worker-executor.mjs';

export const defaultIsoMaxWorkers = () => Math.max(1, availableParallelism() - 1);

/** Native ordinary-value session. Worker pools/class IDs never cross identity
 * domains. The manager owns proof dependencies; workers execute native residue.
 * Custom certificate indexes and optional RBA resolvers are not serialized. */
export class IsoMaxBranchManager {
  constructor({ workers = defaultIsoMaxWorkers(), taskNodes = 65536,
    maxTasks = 262144 } = {}) {
    this.workerCount = positive(workers, 'workers', 256);
    this.taskNodes = positive(taskNodes, 'taskNodes');
    this.maxTasks = positive(maxTasks, 'maxTasks');
    this.workers = []; this.executor = null; this.busy = false; this.closed = false;
    this.lastStats = null;
  }

  async start() {
    if (this.closed) throw new Error('IsoMax manager is closed');
    if (this.executor) return;
    const ready = [];
    try {
      for (let id = 0; id < this.workerCount; id++) {
        const worker = new Worker(new URL('./worker.mjs', import.meta.url), {
          workerData:{workerId:id}, execArgv:[],
          resourceLimits:{maxOldGenerationSizeMb:Math.max(16,Math.floor(4096/(this.workerCount+1)))},
        });
        this.workers.push(worker);
        ready.push(new Promise((resolve,reject) => {
          const timer = setTimeout(()=>finish(new Error('IsoMax worker startup timeout')),10000);
          const onError = error => finish(error);
          const onExit = code => finish(new Error('IsoMax worker exited during startup: '+code));
          const onMessage = message => finish(message?.type === 'ready' && message.workerId === id
            ? null : new Error('invalid IsoMax worker readiness'));
          const finish = error => {
            clearTimeout(timer); worker.off('error',onError); worker.off('exit',onExit); worker.off('message',onMessage);
            error ? reject(error) : resolve();
          };
          worker.once('error',onError); worker.once('exit',onExit); worker.once('message',onMessage);
        }));
      }
      await Promise.all(ready);
      this.executor = createSearchWorkerExecutor(this.workers,{validateResult:validateTaskResult});
    } catch (error) {
      await Promise.allSettled(this.workers.map(w=>w.terminate()));
      await Promise.allSettled(ready); this.workers=[]; this.closed=true; throw error;
    }
  }

  async solveMoves(moves = [], { timeoutMs = 120000, signal, onProgress, selectMove = true } = {}) {
    if (this.busy || this.closed) throw new Error('IsoMax manager is busy or closed');
    positive(timeoutMs,'timeoutMs',120000);
    if (!Array.isArray(moves)) throw new TypeError('moves must be an array');
    if (onProgress !== undefined && typeof onProgress !== 'function') throw new TypeError('invalid progress callback');
    this.busy=true;
    const started=performance.now(), abortBuffer=new SharedArrayBuffer(4), abort=new Int32Array(abortBuffer);
    let failure=null, progressTimer, root, answer, resultReadyMs=null;
    const fail=error=>{failure??=error;Atomics.store(abort,0,1);};
    this.abortRun=fail;
    const onAbort=()=>fail(new Error('ISOMAX_ABORTED'));
    const timer=setTimeout(()=>fail(new Error('ISOMAX_TIMEOUT: '+timeoutMs+' ms; no exact root result')),timeoutMs);
    signal?.addEventListener('abort',onAbort,{once:true});
    if(signal?.aborted) onAbort();
    const solver=new IsoMaxSolver(), nodes=new Map(), pending=new Map();
    const metrics={nodes:0,managerExpansions:0,exactTasks:0,splitTasks:0,retiredTasks:0,
      qReuses:0,submitted:0,maxPending:0,maxActive:0,maxReady:0,workerExecutionMs:0,
      workerTasks:Array(this.workerCount).fill(0),workerNodes:Array(this.workerCount).fill(0)};
    const snapshot=()=>({elapsedMs:performance.now()-started,rootWdl:answer?.value??null,
      metrics:{...metrics,workerTasks:[...metrics.workerTasks],workerNodes:[...metrics.workerNodes]},
      managerNodes:nodes.size,executor:this.executor?.stats()??null});
    const notify=()=>{try{onProgress?.(snapshot());}catch(error){fail(error);}};
    const build=moves=>{
      const state=solver.createState(moves), key=Array.from(state.gameplayKey()).join(':');
      let node=nodes.get(key);
      if(node){metrics.qReuses++;return node;}
      if(nodes.size>=this.maxTasks) throw new Error('ISOMAX_MANAGER_CAPACITY: no exact root result');
      node={id:nodes.size,moves:[...moves],side:state.sideToMove,value:null,edges:null,
        parents:new Set(),pending:false,needed:null,directMove:undefined};
      nodes.set(key,node); return node;
    };
    const complete=(node,value)=>{
      if(![-1,0,1].includes(value)) throw new Error('invalid manager WDL');
      if(node.value!==null){if(node.value!==value)throw new Error('conflicting exact task results');return;}
      node.value=value;
      const queue=[...node.parents];
      for(let i=0;i<queue.length;i++){
        const parent=queue[i];
        if(parent.value!==null)continue;
        const target=parent.side===0?1:-1, values=parent.edges.map(e=>e.node.value);
        if(values.includes(target)){parent.value=target;queue.push(...parent.parents);}
        else if(values.every(v=>v!==null)){
          parent.value=parent.side===0?Math.max(...values):Math.min(...values);
          queue.push(...parent.parents);
        }
      }
    };
    const expand=node=>{
      if(node.edges || node.value!==null || node.pending)return;
      const state=solver.createState(node.moves), native=deriveNativeFrontierConsequence(state);
      metrics.managerExpansions++;
      if(native?.kind===CONCLUSION_EXACT_VALUE){
        if(node===root){
          if(state.isTerminal())node.directMove=null;
          else if(native.distance===1){
            const own=state.sideToMove===0?state.p0Class:state.p1Class;
            node.directMove=CENTER_ORDER.find(c=>state.canPlay(c)&&solver.pool.hasSingletonAt(own,state.heights[c]*7+c));
          }else node.directMove=CENTER_ORDER.find(c=>state.canPlay(c));
        }
        complete(node,native.value);return;
      }
      let order;
      if(native?.kind===CONCLUSION_FORCED_MOVE)order=[solver.columnForForcedCell(state,native.cell)];
      else {
        const promoted=state.ply>moves.length?promotedColumn(state):-1;
        order=promoted<0?CENTER_ORDER:[promoted,...CENTER_ORDER.filter(c=>c!==promoted)];
      }
      node.edges=[];
      for(const column of order)if(state.canPlay(column)){
        const child=build([...node.moves,column]);
        node.edges.push({column,node:child});child.parents.add(node);
      }
      if(!node.edges.length)throw new Error('ongoing manager state has no legal action');
      const target=node.side===0?1:-1, values=node.edges.map(e=>e.node.value);
      if(values.includes(target))complete(node,target);
      else if(values.every(v=>v!==null))complete(node,node.side===0?Math.max(...values):Math.min(...values));
    };
    const rootAnswer=()=>{
      if(root.value===null)return null;
      if(!selectMove)return {value:root.value,move:null};
      if(root.directMove!==undefined)return {value:root.value,move:root.directMove};
      // Completion order must never change the center-first root witness.
      for(const edge of root.edges){
        if(edge.node.value===null)return null;
        if(edge.node.value===root.value)return {value:root.value,move:edge.column};
      }
      throw new Error('exact root lacks a preserving action');
    };
    const required=()=>{
      const live=new Set(), leaves=[];
      const visit=node=>{
        if(node.value!==null||live.has(node))return;
        live.add(node);
        if(!node.edges){if(!node.pending)leaves.push(node);return;}
        for(const e of node.edges)visit(e.node);
      };
      if(root.value===null)visit(root);
      else if(selectMove && root.directMove===undefined){
        for(const edge of root.edges){
          if(edge.node.value===root.value)break;
          visit(edge.node);
        }
      }
      return {live,leaves};
    };
    const submit=node=>{
      const neededBuffer=new SharedArrayBuffer(4);
      node.needed=new Int32Array(neededBuffer);Atomics.store(node.needed,0,1);node.pending=true;
      metrics.submitted++; // executor chooses the worker
      const promise=this.executor.submit({type:'isomax-task',jobId:node.id,moves:node.moves,
        rootPly:moves.length,nodeBudget:this.taskNodes,abort:abortBuffer,needed:neededBuffer})
        .then(message=>{
          if(message.jobId!==node.id)throw new Error('worker result has wrong manager job identity');
          node.pending=false;node.needed=null;
          metrics.nodes+=message.nodes;metrics.workerExecutionMs+=message.executionMs;
          metrics.workerTasks[message.workerId]++;metrics.workerNodes[message.workerId]+=message.nodes;
          if(message.kind==='exact'){metrics.exactTasks++;complete(node,message.value);}
          else if(message.kind==='split'){metrics.splitTasks++;if(!answer)expand(node);}
          else metrics.retiredTasks++;
        });
      pending.set(node,promise);
      promise.then(()=>pending.delete(node),()=>pending.delete(node));
      // Other tasks can fail while one awaited reply wins the race.
      promise.catch(fail);
    };
    try{
      if(failure)throw failure;
      root=build(moves);expand(root);
      answer=rootAnswer();
      if(!answer){
        await this.start();
        progressTimer=setInterval(notify,1000);
        while(!answer){
          if(failure)throw failure;
          let supply=required(), expansions=0;
          // Proactively fill a bounded reservoir. Forced moves remain one edge.
          // Larger unfinished tasks split at real value dependencies on yield.
          while(supply.leaves.length+pending.size<this.workerCount*2 && supply.leaves.length && expansions++<64){
            expand(supply.leaves[0]);answer=rootAnswer();
            if(answer)break;
            supply=required();
          }
          if(answer)break;
          for(const node of pending.keys())if(!supply.live.has(node)&&node.needed)Atomics.store(node.needed,0,0);
          metrics.maxReady=Math.max(metrics.maxReady,Math.min(supply.leaves.length,this.workerCount*2));
          for(const node of supply.leaves){
            if(pending.size>=this.workerCount*2)break;
            submit(node);
          }
          metrics.maxPending=Math.max(metrics.maxPending,pending.size);
          metrics.maxActive=Math.max(metrics.maxActive,this.executor.stats().active);
          if(!pending.size)throw new Error('unresolved IsoMax root has no work');
          await Promise.race(pending.values());answer=rootAnswer();
        }
      }
      resultReadyMs=performance.now()-started;
      // Retire only queued work. Busy workers finish their bounded native task;
      // the root never waits for a whole unbounded sibling proof.
      for(const node of pending.keys())if(node.needed)Atomics.store(node.needed,0,0);
      await Promise.all(pending.values());
      if(failure)throw failure;
      this.lastStats=snapshot();
      return {...answer,...this.lastStats,resultReadyMs,cleanup:'tasks-drained; session workers retained'};
    }catch(error){
      fail(error);
      await Promise.allSettled(pending.values());
      this.lastStats=snapshot();
      await this.close().catch(()=>{});
      throw failure;
    }finally{
      clearTimeout(timer);clearInterval(progressTimer);
      signal?.removeEventListener('abort',onAbort);this.busy=false;this.abortRun=null;
    }
  }

  async close(){
    if(this.closed && !this.workers.length)return;
    if(this.busy)this.abortRun?.(new Error('ISOMAX_ABORTED: session closed'));
    this.closed=true;
    let failure=null;
    if(this.executor){
      try{await this.executor.drain();this.executor.close();}catch(error){failure=error;try{this.executor.close();}catch{}}
    }
    const stopped=await Promise.allSettled(this.workers.map(w=>w.terminate()));
    this.workers=[];
    if(stopped.some(s=>s.status==='rejected'))throw new Error('IsoMax worker termination failed');
    if(failure)throw failure;
  }
}

export async function solveIsoMax(moves=[],options={}){
  const manager=new IsoMaxBranchManager(options);
  try{return await manager.solveMoves(moves,options);}
  finally{await manager.close();}
}

import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { IsoMaxSolver } from '../solver.mjs';
import { IsoMaxTransitionCache } from '../isomax-index.mjs';
import { deriveNativeFrontierConsequence } from '../frontier.mjs';
import { CONCLUSION_EXACT_VALUE, CONCLUSION_FORCED_MOVE } from '../certificate.mjs';
import { CENTER_ORDER, promotedColumn } from '../move-order.mjs';
import { positive, validateTaskResult } from './task.mjs';
// Reintegrate the existing priority/failure/dispatch executor. Its default
// quotient result contract remains unchanged; no second executor is introduced.
import { createSearchWorkerExecutor } from '../../../research/semantic-quotient/state-identity-unification/src/quotient-search-worker-executor.mjs';

// Measured bounded default. Wide speculative dispatch lost badly at 15 workers;
// keep all CPU counts available explicitly without making that regression default.
export const defaultIsoMaxWorkers = () => Math.max(1, Math.min(4, availableParallelism() - 1));

/** Native ordinary-value session. Worker pools/class IDs never cross identity
 * domains. The manager owns proof dependencies; workers execute native residue.
 * Custom certificate indexes and optional RBA resolvers are not serialized. */
export class IsoMaxBranchManager {
  // OWNER-PROTECTED EXECUTION — do not remove/weaken this or adjacent comments.
  // Current task orchestration is NEES E3. If branch exposure/claim/reconciliation
  // moves to E2 cadence (for example issue #102), that hot machinery must satisfy
  // NEES-EXTREME rather than inheriting these object/Promise orchestration forms.
  // Keep proactive bounded worker queuing integrated with the native kernel.
  // Do not silently replace this entry with a serial solve or per-node RPC.
  // Numeric exact q deduplication is intentional; no string-key reconstruction.
  // Manager/task objects belong outside worker recursion. Preserve dependency
  // continuations and cleanup; busy-core counts alone are not solve speed.
  // OWNER-PROTECTED PREPARATION POLICY — do not remove/weaken this comment.
  // 128K helped one/two workers, but cost more time/memory at four; retain 64K
  // there. Explicit taskNodes remains available. Polling/retention/time/memory
  // limits are separate contracts, not enlarged by this scheduling policy.
  constructor({ workers = defaultIsoMaxWorkers(), taskNodes = workers <= 2 ? 131072 : 65536,
    maxTasks = 262144, readyReserve = 0, rankCutDepth = workers === 4 ? 3 : 0 } = {}) {
    this.workerCount = positive(workers, 'workers', 256);
    this.taskNodes = positive(taskNodes, 'taskNodes');
    this.maxTasks = positive(maxTasks, 'maxTasks');
    if (!Number.isSafeInteger(readyReserve) || readyReserve < 0 || readyReserve > this.maxTasks)
      throw new RangeError('invalid readyReserve');
    this.readyReserve = readyReserve;
    if (!Number.isSafeInteger(rankCutDepth) || rankCutDepth < 0 || rankCutDepth > 42)
      throw new RangeError('invalid rankCutDepth');
    this.rankCutDepth = rankCutDepth;
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
          workerData:{workerId:id,workerCount:this.workerCount}, execArgv:[],
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
    const solver=new IsoMaxSolver(), nodes=new IsoMaxTransitionCache({pool:solver.pool}), pending=new Map();
    const metrics={nodes:0,managerExpansions:0,exactTasks:0,splitTasks:0,retiredTasks:0,
      busyRetiredTasks:0,retiredTaskNodes:0,zeroNodeRetiredTasks:0,controlChecks:0,
      qReuses:0,submitted:0,maxPending:0,maxActive:0,maxReady:0,
      readySamples:0,readyLeavesTotal:0,maxReadyLeaves:0,idleWithReadyEvents:0,workerExecutionMs:0,
      requiredCalls:0,requiredMs:0,transitionCacheHits:0,transitionCacheStores:0,
      nativeExactHits:0,recursiveChildren:0,forcedTransitions:0,
      preparedNodeSlots:0,preflightTransitions:0,
      warmEntryStarts:0,warmClassStarts:0,localEntryGrowth:0,localClassGrowth:0,workerResets:0,
      taskExecutionMsMin:null,taskExecutionMsMax:0,taskExecutionMsBuckets:[0,0,0,0,0,0],
      workerTasks:Array(this.workerCount).fill(0),workerNodes:Array(this.workerCount).fill(0)};
    const outstandingLimit=this.workerCount+this.readyReserve;
    const cutPly=Math.min(42,moves.length+this.rankCutDepth);
    const snapshot=()=>({elapsedMs:performance.now()-started,rootWdl:answer?.value??null,
      scheduler:{workers:this.workerCount,taskNodes:this.taskNodes,readyReserve:this.readyReserve,
        rankCutDepth:this.rankCutDepth,outstandingLimit},
      // Ordinary worker profile only: cache and native exact returns do not
      // expand. These are entries, not distinct q states. Transition counters
      // include an attempted child rejected at the scheduled quantum boundary.
      // Aggregate existing counters here; never add reporting to recursion.
      metrics:{...metrics,expandedEntries:metrics.nodes-metrics.transitionCacheHits-metrics.nativeExactHits,
        transitionAttempts:metrics.recursiveChildren+metrics.forcedTransitions,
        taskExecutionMsBuckets:[...metrics.taskExecutionMsBuckets],
        workerTasks:[...metrics.workerTasks],workerNodes:[...metrics.workerNodes]},
      managerNodes:nodes.count,executor:this.executor?.stats()??null});
    const notify=()=>{try{onProgress?.(snapshot());}catch(error){fail(error);}};
    const build=moves=>{
      const state=solver.createState(moves);
      let node=nodes.get(state);
      if(node){metrics.qReuses++;return node;}
      if(nodes.count>=this.maxTasks) throw new Error('ISOMAX_MANAGER_CAPACITY: no exact root result');
      node={id:nodes.count,moves:[...moves],side:state.sideToMove,value:null,edges:null,
        parents:new Set(),pending:false,needed:null,directMove:undefined};
      nodes.set(state,node); return node;
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
      const scanStarted=performance.now(), live=new Set(), leaves=[];
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
      metrics.requiredCalls++;metrics.requiredMs+=performance.now()-scanStarted;
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
          metrics.controlChecks+=message.metrics?.controlChecks??0;
          metrics.transitionCacheHits+=message.metrics?.transitionCacheHits??0;
          metrics.transitionCacheStores+=message.metrics?.transitionCacheStores??0;
          metrics.nativeExactHits+=message.metrics?.nativeExactHits??0;
          metrics.recursiveChildren+=message.metrics?.recursiveChildren??0;
          metrics.forcedTransitions+=message.metrics?.forcedTransitions??0;
          metrics.preparedNodeSlots+=message.preparedNodeSlots??0;
          metrics.preflightTransitions+=message.preflightTransitions??0;
          metrics.warmEntryStarts+=message.localEntriesBefore??0;
          metrics.warmClassStarts+=message.localClassesBefore??0;
          metrics.localEntryGrowth+=Math.max(0,(message.localEntries??0)-(message.localEntriesBefore??0));
          metrics.localClassGrowth+=Math.max(0,(message.localClasses??0)-(message.localClassesBefore??0));
          if(message.workerReset)metrics.workerResets++;
          metrics.taskExecutionMsMin=metrics.taskExecutionMsMin===null?message.executionMs:
            Math.min(metrics.taskExecutionMsMin,message.executionMs);
          metrics.taskExecutionMsMax=Math.max(metrics.taskExecutionMsMax,message.executionMs);
          const durationBucket=message.executionMs<1?0:message.executionMs<4?1:message.executionMs<16?2:
            message.executionMs<64?3:message.executionMs<256?4:5;
          metrics.taskExecutionMsBuckets[durationBucket]++;
          metrics.workerTasks[message.workerId]++;metrics.workerNodes[message.workerId]+=message.nodes;
          if(message.kind==='exact'){metrics.exactTasks++;complete(node,message.value);}
          else if(message.kind==='split'){
            metrics.splitTasks++;
            if(!answer)for(const frame of message.frames.toReversed()){
              if(!Array.isArray(frame.moves)||frame.moves.length<node.moves.length ||
                node.moves.some((c,i)=>frame.moves[i]!==c) || !Array.isArray(frame.values))
                throw new Error('invalid native dependency continuation');
              const owner=build(frame.moves);
              expand(owner);
              for(const known of frame.values){
                if(!Number.isInteger(known.column)||known.column<0||known.column>=7)
                  throw new Error('invalid continuation column');
                // Construct in the frame's orientation. The manager's existing
                // representative may be reflected; its pool establishes q.
                complete(build([...frame.moves,known.column]),known.value);
              }
            }
          }
          else {
            metrics.retiredTasks++;
            if(message.nodes>0)metrics.busyRetiredTasks++;
            else metrics.zeroNodeRetiredTasks++;
            metrics.retiredTaskNodes+=message.nodes;
          }
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
          // OWNER-PROTECTED E3 POLICY — retain this qualification boundary.
          // Four-worker rank3 exposes shallow q convergence before private work;
          // it qualified on 96 roots. This is admission, not a depth/value cutoff.
          // Preserve the 64-expansion turn bound, capacity and worker limits.
          // Other worker counts retain the control; do not generalize blindly.
          while((supply.leaves.length+pending.size<outstandingLimit ||
            (this.rankCutDepth!==0 && supply.leaves.some(n=>n.moves.length<cutPly))) &&
            supply.leaves.length && expansions++<64){
            expand(this.rankCutDepth===0?supply.leaves[0]:
              (supply.leaves.find(n=>n.moves.length<cutPly)??supply.leaves[0]));answer=rootAnswer();
            if(answer)break;
            supply=required();
          }
          if(answer)break;
          for(const node of pending.keys())if(!supply.live.has(node)&&node.needed)Atomics.store(node.needed,0,0);
          metrics.readySamples++;
          metrics.readyLeavesTotal+=supply.leaves.length;
          metrics.maxReadyLeaves=Math.max(metrics.maxReadyLeaves,supply.leaves.length);
          if(supply.leaves.length&&this.executor.stats().idle>0)metrics.idleWithReadyEvents++;
          metrics.maxReady=Math.max(metrics.maxReady,Math.min(supply.leaves.length,this.workerCount*2));
          for(const node of supply.leaves){
            if(pending.size>=outstandingLimit)break;
            submit(node);
          }
          metrics.maxPending=Math.max(metrics.maxPending,pending.size);
          metrics.maxActive=Math.max(metrics.maxActive,this.executor.stats().active);
          if(!pending.size)throw new Error('unresolved IsoMax root has no work');
          await Promise.race(pending.values());answer=rootAnswer();
        }
      }
      resultReadyMs=performance.now()-started;
      // Retire queued work at entry and busy work at its scheduled local poll;
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

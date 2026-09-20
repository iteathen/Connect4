import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import {
  CTRL_ABORT,
  CTRL_PUB_WAKE,
  CTRL_SESSION,
  CTRL_WORK_WAKE,
  PRIORITY_BANDS,
  SESSION_STOP,
  WC_BAND_BASE,
  WC_BRANCHES,
  WC_CONTROL_CHECKS,
  WC_CONTINUATION_YIELDS,
  WC_HELPER_WAITS,
  WC_LOCAL_PRIMARY,
  WC_LOCAL_RECLAIMS,
  WC_OCC_EXACT_CONSUMED,
  WC_OCC_PUBLISHED,
  WC_PATH_REPLAY_APPLIES,
  WC_RETIRE_OCC,
  WC_SURPLUS_LOCAL,
  WC_SURPLUS_REMOTE,
  WC_WORK_CLAIMS,
  WC_WORDS,
  createSurplusPool,
  openSurplusPool,
  stopSurplusPool,
} from './surplus-pool.mjs';

export const defaultIsoMaxSurplusWorkers=()=>Math.max(1,Math.min(4,availableParallelism()-1));

function positive(value,name,maximum=1<<28){
  if(!Number.isSafeInteger(value)||value<1||value>maximum)throw new RangeError('invalid '+name);
  return value;
}
function waitReady(worker,type,id=null){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(new Error('surplus worker startup timeout')),10000);
    const onError=e=>finish(e),onExit=c=>finish(new Error('surplus worker exited during startup: '+c));
    const onMessage=m=>{
      if(m?.type!==type)return;
      if(id!==null&&m.workerId!==id)return finish(new Error('invalid surplus worker readiness'));
      finish(null);
    };
    const finish=e=>{
      clearTimeout(timer);worker.off('error',onError);worker.off('exit',onExit);worker.off('message',onMessage);
      e?reject(e):resolve();
    };
    worker.on('error',onError);worker.on('exit',onExit);worker.on('message',onMessage);
  });
}

export class IsoMaxSurplusBranchManager {
  constructor({
    workers=defaultIsoMaxSurplusWorkers(),
    maxQ=262144,
    workCapacity=maxQ,
    occurrenceCapacity=Math.min(1<<20,maxQ*2),
    queueCapacity=Math.min(1<<20,maxQ*2),
    publicationCapacity=Math.min(1<<20,maxQ*2),
    workerClassReserve=Math.max(131072,Math.floor(1048576/workers)),
    workerEntryReserve=Math.max(262144,Math.floor(4194304/workers)),
  }={}) {
    this.workerCount=positive(workers,'workers',256);
    this.maxQ=positive(maxQ,'maxQ');
    this.workCapacity=positive(workCapacity,'workCapacity');
    this.occurrenceCapacity=positive(occurrenceCapacity,'occurrenceCapacity');
    this.queueCapacity=positive(queueCapacity,'queueCapacity');
    this.publicationCapacity=positive(publicationCapacity,'publicationCapacity');
    this.workerClassReserve=positive(workerClassReserve,'workerClassReserve',2**26);
    this.workerEntryReserve=positive(workerEntryReserve,'workerEntryReserve',2**26);
    this.workers=new Array(this.workerCount).fill(null);
    this.reconciler=null;this.startPromise=null;this.busy=false;this.closed=false;this.session=null;this.lastStats=null;
  }

  async start(){
    if(this.closed)throw new Error('IsoMax surplus manager is closed');
    if(this.startPromise)return this.startPromise;
    this.startPromise=this.#start();
    try{await this.startPromise;}catch(error){this.startPromise=null;throw error;}
  }
  async #start(){
    const pending=[];
    if(!this.reconciler){
      const worker=new Worker(new URL('./surplus-reconciler.mjs',import.meta.url),{
        execArgv:[],resourceLimits:{maxOldGenerationSizeMb:Math.max(32,Math.floor(4096/(this.workerCount+2)))},
      });
      this.reconciler=worker;pending.push(waitReady(worker,'surplus-reconciler-idle'));
      worker.on('error',e=>this.#abort(e));
      worker.on('exit',code=>{
        if(this.closed)return;
        if(this.reconciler===worker)this.reconciler=null;
        if(this.session)this.#abort(new Error('surplus reconciler exited: '+code));
      });
    }
    for(let id=0;id<this.workerCount;id++){
      if(this.workers[id])continue;
      const worker=new Worker(new URL('./surplus-worker.mjs',import.meta.url),{
        workerData:{workerId:id,workerCount:this.workerCount},execArgv:[],
        resourceLimits:{maxOldGenerationSizeMb:Math.max(16,Math.floor(4096/(this.workerCount+2)))},
      });
      this.workers[id]=worker;pending.push(waitReady(worker,'surplus-ready',id));
      worker.on('error',()=>this.#markDead(id));
      worker.on('exit',()=>{if(!this.closed)this.#markDead(id);});
    }
    await Promise.all(pending);
  }

  #wake(shared){
    Atomics.add(shared.control,CTRL_PUB_WAKE,1);Atomics.notify(shared.control,CTRL_PUB_WAKE,Infinity);
    Atomics.add(shared.control,CTRL_WORK_WAKE,1);Atomics.notify(shared.control,CTRL_WORK_WAKE,Infinity);
  }
  #markDead(id){
    const s=this.session;if(!s||s.done[id])return;
    s.done[id]=1;Atomics.store(s.shared.workerAlive,id,0);this.#wake(s.shared);s.checkDone();
  }
  #abort(error){
    const s=this.session;if(!s)return;
    if(s.failure===null){
      s.failure=error;
      s.rejectFailure?.(error);
    }
    Atomics.store(s.shared.control,CTRL_ABORT,1);stopSurplusPool(s.shared);this.#wake(s.shared);
  }

  async solveMoves(moves=[],{
    timeoutMs=120000,signal,onProgress,progressIntervalMs=1000,
  }={}){
    if(this.busy||this.closed)throw new Error('IsoMax surplus manager is busy or closed');
    positive(timeoutMs,'timeoutMs',120000);
    if(!Array.isArray(moves)||moves.length>42||moves.some(c=>!Number.isInteger(c)||c<0||c>6))
      throw new TypeError('moves must be a legal replay array');
    if(onProgress!==undefined&&typeof onProgress!=='function')throw new TypeError('invalid progress callback');
    await this.start();
    if(!this.reconciler||this.workers.some(w=>!w)){this.startPromise=null;await this.start();}

    this.busy=true;
    const started=performance.now();
    const descriptor=createSurplusPool({
      workerCount:this.workerCount,workCapacity:this.workCapacity,
      occurrenceCapacity:this.occurrenceCapacity,queueCapacity:this.queueCapacity,
      publicationCapacity:this.publicationCapacity,
    });
    const shared=openSurplusPool(descriptor);
    for(let id=0;id<this.workerCount;id++)Atomics.store(shared.workerAlive,id,this.workers[id]?1:0);

    let resultMessage=null,resultReadyAt=null,resolveReady,resolveResult,resolveDone,rejectFailure;
    const ready=new Promise(res=>{resolveReady=res;});
    const result=new Promise(res=>{resolveResult=res;});
    const workersDone=new Promise(res=>{resolveDone=res;});
    const failure=new Promise((_,rej)=>{rejectFailure=rej;});
    // Failure can happen before the sequential solve flow reaches its next
    // await (for example a 1 ms timeout before reconciler readiness). Attach a
    // handler immediately so Node never observes a transient unhandled
    // rejection; Promise.race below still propagates the same failure.
    void failure.catch(()=>{});
    const session={
      shared,done:new Uint8Array(this.workerCount),failure:null,rejectFailure,
      counters:Array.from({length:this.workerCount},()=>new Int32Array(WC_WORDS)),
      localClasses:new Int32Array(this.workerCount),localEntries:new Int32Array(this.workerCount),
      checkDone:()=>{for(let i=0;i<this.workerCount;i++)if(!session.done[i])return;resolveDone();},
    };
    this.session=session;

    const onRec=m=>{
      if(m?.type==='surplus-reconciler-ready'){resolveReady();return;}
      if(m?.type==='surplus-progress'){try{onProgress?.(m.snapshot);}catch(e){this.#abort(e);}return;}
      if(m?.type==='surplus-result'){
        resultMessage=m;
        if(resultReadyAt===null)resultReadyAt=performance.now();
        resolveResult(m);return;
      }
      if(m?.type==='surplus-reconciler-error'){
        const e=session.failure??new Error(m.message??'surplus reconciliation failed');
        if(m.snapshot)this.lastStats=m.snapshot;
        this.#abort(e);
      }
    };
    const onRecError=e=>{this.#abort(e);};
    this.reconciler.on('message',onRec);this.reconciler.on('error',onRecError);

    const listeners=[];
    for(let id=0;id<this.workerCount;id++){
      const worker=this.workers[id];
      const onMessage=m=>{
        if(m?.workerId!==id)return;
        if(m.type==='surplus-session-done'){
          const src=m.counters??[];
          for(let i=0;i<Math.min(src.length,WC_WORDS);i++)session.counters[id][i]=src[i]|0;
          session.localClasses[id]=m.localClasses??0;session.localEntries[id]=m.localEntries??0;
          session.done[id]=1;session.checkDone();
        }else if(m.type==='surplus-error'){
          session.failure??=new Error(m.message??'surplus evaluator failed');
          this.#markDead(id);this.#abort(session.failure);
        }
      };
      worker.on('message',onMessage);listeners.push([worker,onMessage]);
    }

    let timeoutReason=null;
    const timer=setTimeout(()=>{
      timeoutReason=new Error('ISOMAX_TIMEOUT: '+timeoutMs+' ms; no exact surplus root result');
      this.#abort(timeoutReason);
    },timeoutMs);
    const onAbort=()=>this.#abort(new Error('ISOMAX_ABORTED'));
    signal?.addEventListener('abort',onAbort,{once:true});if(signal?.aborted)onAbort();

    try{
      this.reconciler.postMessage({
        type:'isomax-surplus-reconcile',pool:descriptor,moves:[...moves],maxQ:this.maxQ,progressIntervalMs,
      });
      await Promise.race([ready,failure]);
      for(let id=0;id<this.workerCount;id++){
        if(!this.workers[id]){this.#markDead(id);continue;}
        this.workers[id].postMessage({
          type:'isomax-surplus-session',pool:descriptor,rootPly:moves.length,
          classCapacity:this.workerClassReserve,entryCapacity:this.workerEntryReserve,
        });
      }
      const message=await Promise.race([result,failure]);
      // Result-ready and cleanup remain distinct timing concepts, but metrics
      // are authoritative only after every live worker has left the shared
      // session and published its counters.
      await workersDone;
      if(session.failure&&!resultMessage)throw session.failure;

      const aggregate=new Int32Array(WC_WORDS);
      for(const c of session.counters)for(let i=0;i<WC_WORDS;i++)aggregate[i]+=c[i];
      const workerMetrics={
        workClaims:aggregate[WC_WORK_CLAIMS],
        localReclaims:aggregate[WC_LOCAL_RECLAIMS],
        helperWaits:aggregate[WC_HELPER_WAITS],
        occurrencesPublished:aggregate[WC_OCC_PUBLISHED],
        occurrenceExactConsumed:aggregate[WC_OCC_EXACT_CONSUMED],
        branches:aggregate[WC_BRANCHES],
        localPrimary:aggregate[WC_LOCAL_PRIMARY],
        surplusLocal:aggregate[WC_SURPLUS_LOCAL],
        surplusRemote:aggregate[WC_SURPLUS_REMOTE],
        occurrenceRetires:aggregate[WC_RETIRE_OCC],
        pathReplayApplies:aggregate[WC_PATH_REPLAY_APPLIES],
        controlChecks:aggregate[WC_CONTROL_CHECKS],
        continuationYields:aggregate[WC_CONTINUATION_YIELDS],
        claimsByBand:Array.from({length:PRIORITY_BANDS},(_,b)=>aggregate[WC_BAND_BASE+b]),
        localClasses:Array.from(session.localClasses),localEntries:Array.from(session.localEntries),
      };
      const elapsedMs=performance.now()-started;
      const resultReadyMs=(resultReadyAt??performance.now())-started;
      const out={
        value:message.value,move:message.move<0?null:message.move,
        elapsedMs,resultReadyMs,cleanupMs:Math.max(0,elapsedMs-resultReadyMs),
        scheduler:{architecture:'surplus-opportunity-pull',workers:this.workerCount},
        metrics:{...(message.metrics??{}),worker:workerMetrics},
        memory:process.memoryUsage(),
        cleanup:'surplus pool stopped; workers retained',
      };
      this.lastStats=out;return out;
    }catch(error){
      this.#abort(timeoutReason??session.failure??error);
      await Promise.race([workersDone,new Promise(res=>setTimeout(res,1000))]);
      throw timeoutReason??session.failure??error;
    }finally{
      clearTimeout(timer);signal?.removeEventListener('abort',onAbort);
      this.reconciler?.off('message',onRec);this.reconciler?.off('error',onRecError);
      for(const [w,l]of listeners)w.off('message',l);
      this.session=null;this.busy=false;
    }
  }

  async close(){
    if(this.closed&&this.workers.every(w=>!w)&&!this.reconciler)return;
    this.closed=true;if(this.session)this.#abort(new Error('ISOMAX_ABORTED: surplus session closed'));
    const all=[this.reconciler,...this.workers].filter(Boolean);this.reconciler=null;this.workers.fill(null);
    const stopped=await Promise.allSettled(all.map(w=>w.terminate()));
    if(stopped.some(x=>x.status==='rejected'))throw new Error('surplus worker termination failed');
  }
}

export async function solveIsoMaxSurplus(moves=[],options={}){
  const manager=new IsoMaxSurplusBranchManager(options);
  try{return await manager.solveMoves(moves,options);}
  finally{await manager.close();}
}

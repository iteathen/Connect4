import { parentPort, workerData } from 'node:worker_threads';
import { IsoMaxSolver } from '../solver.mjs';
import { CENTER_ORDER } from '../move-order.mjs';
import {
  CTRL_ABORT,
  CTRL_PUB_WAKE,
  CTRL_SESSION,
  CTRL_WORK_WAKE,
  MAX_MOVES,
  OCC_EXACT,
  OCC_LINKED,
  OCC_PUBLISHED,
  OCC_RETIRED,
  PUB_EXACT,
  PUB_FAILURE,
  PUB_OCCURRENCE,
  PUB_RETIRE_OCCURRENCE,
  PUB_WORK_RETIRED,
  SESSION_RUNNING,
  WC_BAND_BASE,
  WC_BRANCHES,
  WC_CONTROL_CHECKS,
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
  WORK_EXACT,
  WORK_READY,
  WORK_RETIRED,
  WORK_RUNNING,
  WORK_WRITING,
  allocateOccurrence,
  claimHighest,
  claimSpecific,
  completeWork,
  openSurplusPool,
  publish,
} from './surplus-pool.mjs';

if (!parentPort) throw new Error('IsoMax surplus worker requires parentPort');

const workRetired=Symbol('surplus work retired');
const workerIndex=workerData.workerId;
const workerCount=workerData.workerCount;

class SurplusDistributor {
  constructor(worker) {
    this.worker=worker;
    this.columns=new Int8Array((MAX_MOVES+1)*7);
    this.occSlots=new Int32Array((MAX_MOVES+1)*7);this.occSlots.fill(-1);
    this.occGenerations=new Int32Array((MAX_MOVES+1)*7);
    this.claimScratch=new Int32Array(4);
  }

  publishBlocking(kind,a=0,b=0,c=0,d=0,e=0,f=0,g=0) {
    const shared=this.worker.shared;
    while(!publish(shared,kind,a,b,c,d,e,f,g)){
      if(Atomics.load(shared.control,CTRL_ABORT) ||
         Atomics.load(shared.control,CTRL_SESSION)!==SESSION_RUNNING)throw new Error('ISOMAX_SURPLUS_ABORTED');
      const epoch=Atomics.load(shared.control,CTRL_PUB_WAKE);
      Atomics.wait(shared.control,CTRL_PUB_WAKE,epoch,2);
    }
  }

  retireOccurrence(slot,generation) {
    if(slot<0)return;
    this.publishBlocking(PUB_RETIRE_OCCURRENCE,slot,generation);
    this.worker.counters[WC_RETIRE_OCC]++;
  }

  waitOccurrence(slot,generation) {
    const shared=this.worker.shared;
    while(true){
      if(Atomics.load(shared.occGeneration,slot)!==generation)throw new Error('surplus occurrence generation changed');
      const state=Atomics.load(shared.occState,slot);
      if(state===OCC_LINKED||state===OCC_EXACT||state===OCC_RETIRED)return state;
      if(state!==OCC_PUBLISHED)throw new Error('invalid surplus occurrence state '+state);
      if(Atomics.load(shared.control,CTRL_ABORT))throw new Error('ISOMAX_SURPLUS_ABORTED');
      Atomics.wait(shared.occState,slot,OCC_PUBLISHED,10);
    }
  }

  publishWorkExact(slot,generation,attempt,value,rootMove=-1) {
    const shared=this.worker.shared;
    if(!completeWork(shared,slot,generation,attempt,value,rootMove))
      throw new Error('surplus exact completion lost work ownership');
    this.publishBlocking(PUB_EXACT,slot,generation,attempt,value,rootMove,workerIndex);
  }

  resolveOccurrence(solver,state,column,slot,generation) {
    const shared=this.worker.shared;
    while(true){
      const occState=this.waitOccurrence(slot,generation);
      if(occState===OCC_RETIRED)throw new Error('needed surplus occurrence retired');
      if(occState===OCC_EXACT){
        this.worker.counters[WC_OCC_EXACT_CONSUMED]++;
        return Atomics.load(shared.occResult,slot);
      }

      const work=Atomics.load(shared.occWork,slot);
      const workGeneration=Atomics.load(shared.occWorkGeneration,slot);
      if(work<0||work>=shared.workCapacity||workGeneration<=0)throw new Error('linked surplus occurrence lacks work');

      const stateCode=Atomics.load(shared.workState,work);
      if(stateCode===WORK_EXACT){
        this.worker.counters[WC_OCC_EXACT_CONSUMED]++;
        return Atomics.load(shared.workResult,work);
      }

      if(stateCode===WORK_READY){
        if(claimSpecific(shared,work,workGeneration,workerIndex,this.claimScratch)){
          this.worker.counters[WC_LOCAL_RECLAIMS]++;
          this.worker.counters[WC_SURPLUS_LOCAL]++;
          const attempt=this.claimScratch[2];
          const priorWork=this.worker.activeWork;
          const priorGeneration=this.worker.activeGeneration;
          const priorAttempt=this.worker.activeAttempt;
          this.worker.activeWork=work;this.worker.activeGeneration=workGeneration;this.worker.activeAttempt=attempt;
          state.applyUnchecked(column);solver.metrics.recursiveChildren++;
          let value;
          try{
            value=solver.solveNode(state);
          }catch(error){
            if(error!==workRetired)throw error;
            Atomics.store(shared.workState,work,WORK_RETIRED);
            Atomics.notify(shared.workState,work,Infinity);
            this.publishBlocking(PUB_WORK_RETIRED,work,workGeneration,attempt,workerIndex);
            value=null;
          }finally{
            state.undo();
            this.worker.activeWork=priorWork;this.worker.activeGeneration=priorGeneration;this.worker.activeAttempt=priorAttempt;
          }
          if(value!==null){
            this.publishWorkExact(work,workGeneration,attempt,value,-1);
            return value;
          }
        }
        // A helper may win READY -> RUNNING between our state read and CAS.
        // Re-read on the next iteration instead of treating the stale READY
        // snapshot as an impossible state.
        continue;
      }

      if(stateCode===WORK_RUNNING){
        this.worker.counters[WC_HELPER_WAITS]++;
        this.worker.counters[WC_SURPLUS_REMOTE]++;
        Atomics.wait(shared.workState,work,WORK_RUNNING,10);
        continue;
      }

      if(stateCode===WORK_RETIRED||stateCode===WORK_WRITING){
        Atomics.wait(shared.workState,work,stateCode,10);
        continue;
      }
      throw new Error('invalid canonical surplus work state '+stateCode);
    }
  }

  solveChildren(solver,state,maximizing,lower,upper,promoted) {
    const ply=state.ply,base=ply*7;
    let count=0;
    if(promoted>=0&&state.canPlay(promoted))this.columns[base+count++]=promoted;
    for(let i=0;i<CENTER_ORDER.length;i++){
      const column=CENTER_ORDER[i];
      if(column===promoted||!state.canPlay(column))continue;
      this.columns[base+count++]=column;
    }
    if(count===0)throw new Error('ongoing surplus state has no legal moves');
    this.worker.counters[WC_BRANCHES]++;

    for(let i=0;i<count;i++)this.occSlots[base+i]=-1;
    try{
      // Publish only alternatives. The current worker keeps column[0] in its
      // native call stack and does not round-trip it through global scheduling.
      for(let i=1;i<count;i++){
        const column=this.columns[base+i];
        const slot=allocateOccurrence(
          this.worker.shared,workerIndex,this.worker.activeWork,this.worker.activeAttempt,
          state,column,i,
        );
        if(slot<0)throw new Error('ISOMAX_SURPLUS_OCCURRENCE_CAPACITY');
        const generation=Atomics.load(this.worker.shared.occGeneration,slot);
        this.occSlots[base+i]=slot;this.occGenerations[base+i]=generation;
        this.publishBlocking(PUB_OCCURRENCE,slot,generation,this.worker.activeWork,
          this.worker.activeAttempt,column,i,workerIndex);
        this.worker.counters[WC_OCC_PUBLISHED]++;
      }

      let best=maximizing?-1:1;
      for(let i=0;i<count;i++){
        const column=this.columns[base+i];
        let childValue;
        if(i===0){
          this.worker.counters[WC_LOCAL_PRIMARY]++;
          state.applyUnchecked(column);solver.metrics.recursiveChildren++;
          try{childValue=solver.solveNode(state);}
          finally{state.undo();}
        }else{
          const slot=this.occSlots[base+i],generation=this.occGenerations[base+i];
          childValue=this.resolveOccurrence(solver,state,column,slot,generation);
          this.retireOccurrence(slot,generation);
          this.occSlots[base+i]=-1;
        }

        if(maximizing){
          if(childValue>best)best=childValue;
          if(best>=upper)break;
        }else{
          if(childValue<best)best=childValue;
          if(best<=lower)break;
        }
      }
      return best;
    }finally{
      // A cutoff, retirement or failure invalidates any alternatives this
      // frame published but never consumed.
      for(let i=1;i<count;i++){
        const slot=this.occSlots[base+i];
        if(slot>=0){
          this.retireOccurrence(slot,this.occGenerations[base+i]);
          this.occSlots[base+i]=-1;
        }
      }
    }
  }
}

class SurplusEvaluator {
  constructor() {
    this.solver=new IsoMaxSolver();
    this.state=this.solver.createState();
    this.shared=null;
    this.activeWork=-1;
    this.activeGeneration=0;
    this.activeAttempt=0;
    this.externalRootPly=0;
    this.counters=new Int32Array(WC_WORDS);
    this.claimScratch=new Int32Array(4);
    this.distributor=new SurplusDistributor(this);
    this.solver.branchDistributor=this.distributor;
    this.solver.checkTaskControl=(state)=>this.checkTaskControl(state);
  }

  prepareSession(message) {
    this.shared=openSurplusPool(message.pool);
    this.externalRootPly=message.rootPly;
    const classCapacity=message.classCapacity;
    const entryCapacity=message.entryCapacity;
    const additional=Math.max(1,classCapacity-this.solver.pool.classCount);
    this.solver.pool.prepareSearchStorage(additional);
    this.solver.transitionCache.prepareSearchStorage(entryCapacity);
    this.counters.fill(0);
  }

  finishSession() {
    while(this.state.ply>0)this.state.undo();
    this.solver.nextControlNode=Infinity;
    this.solver.pool.releaseSearchStorage();
    this.solver.transitionCache.sealed=false;
    this.shared=null;
  }

  checkTaskControl() {
    this.counters[WC_CONTROL_CHECKS]++;
    const shared=this.shared;
    if(Atomics.load(shared.control,CTRL_ABORT))throw new Error('ISOMAX_SURPLUS_ABORTED');
    if(this.activeWork>=0&&Atomics.load(shared.workNeeded,this.activeWork)===0)throw workRetired;
    this.solver.nextControlNode=this.solver.metrics.nodes+512;
  }

  resetMetrics() {
    for(const key of Object.keys(this.solver.metrics))this.solver.metrics[key]=0;
    this.solver.orderingRootPly=this.externalRootPly;
    this.solver.nextControlNode=0;
  }

  publishBlocking(kind,a=0,b=0,c=0,d=0,e=0,f=0,g=0) {
    this.distributor.publishBlocking(kind,a,b,c,d,e,f,g);
  }

  replayWork(slot) {
    const shared=this.shared,length=Atomics.load(shared.workPathLength,slot);
    if(length<0||length>MAX_MOVES)throw new Error('invalid surplus work replay');
    const base=slot*MAX_MOVES;
    let common=Math.min(this.state.ply,length),prefix=0;
    while(prefix<common&&(this.state.moveCells[prefix]%7)===shared.workPath[base+prefix])prefix++;
    common=prefix;
    while(this.state.ply>common)this.state.undo();
    for(let i=common;i<length;i++){
      const column=shared.workPath[base+i];
      if(!this.state.canPlay(column))throw new Error('invalid surplus work path');
      this.state.applyUnchecked(column);this.counters[WC_PATH_REPLAY_APPLIES]++;
    }
    return this.state;
  }

  runClaim(slot,generation,attempt) {
    const shared=this.shared;
    this.activeWork=slot;this.activeGeneration=generation;this.activeAttempt=attempt;
    this.resetMetrics();
    const state=this.replayWork(slot);
    let value,retired=false;
    try{
      value=this.solver.solveNode(state);
    }catch(error){
      if(error===workRetired)retired=true;
      else throw error;
    }
    if(retired){
      Atomics.store(shared.workState,slot,WORK_RETIRED);
      Atomics.notify(shared.workState,slot,Infinity);
      this.publishBlocking(PUB_WORK_RETIRED,slot,generation,attempt,workerIndex);
      return;
    }

    let move=-1;
    if(state.ply===this.externalRootPly&&!state.isTerminal()){
      move=this.solver.selectMoveForValue(state,value);
    }
    this.distributor.publishWorkExact(slot,generation,attempt,value,move);
  }

  runSession(message) {
    this.prepareSession(message);
    const shared=this.shared;
    try{
      while(Atomics.load(shared.control,CTRL_SESSION)===SESSION_RUNNING &&
            !Atomics.load(shared.control,CTRL_ABORT)){
        if(claimHighest(shared,workerIndex,this.claimScratch)){
          this.counters[WC_WORK_CLAIMS]++;
          this.counters[WC_BAND_BASE+this.claimScratch[3]]++;
          this.runClaim(this.claimScratch[0],this.claimScratch[1],this.claimScratch[2]);
          continue;
        }
        const epoch=Atomics.load(shared.control,CTRL_WORK_WAKE);
        if(Atomics.load(shared.control,CTRL_SESSION)!==SESSION_RUNNING ||
           Atomics.load(shared.control,CTRL_ABORT))break;
        Atomics.wait(shared.control,CTRL_WORK_WAKE,epoch,50);
      }
    }finally{
      this.finishSession();
    }
    return Array.from(this.counters);
  }
}

const evaluator=new SurplusEvaluator();
let running=false;
parentPort.on('message',message=>{
  if(message?.type!=='isomax-surplus-session'){
    parentPort.postMessage({type:'surplus-error',workerId:workerIndex,message:'unsupported surplus worker message'});return;
  }
  if(running){
    parentPort.postMessage({type:'surplus-error',workerId:workerIndex,message:'surplus session already running'});return;
  }
  running=true;
  try{
    const counters=evaluator.runSession(message);
    parentPort.postMessage({
      type:'surplus-session-done',workerId:workerIndex,counters,
      localClasses:evaluator.solver.pool.classCount,
      localEntries:evaluator.solver.transitionCache.count,
    });
  }catch(error){
    try{
      const shared=openSurplusPool(message.pool);
      Atomics.store(shared.control,CTRL_FAILURE,1);Atomics.store(shared.control,CTRL_ABORT,1);
      publish(shared,PUB_FAILURE,workerIndex);
      Atomics.add(shared.control,CTRL_WORK_WAKE,1);Atomics.notify(shared.control,CTRL_WORK_WAKE,Infinity);
      Atomics.add(shared.control,CTRL_PUB_WAKE,1);Atomics.notify(shared.control,CTRL_PUB_WAKE,Infinity);
    }catch{}
    parentPort.postMessage({type:'surplus-error',workerId:workerIndex,message:error?.message??String(error)});
  }finally{running=false;}
});
parentPort.postMessage({type:'surplus-ready',workerId:workerIndex});

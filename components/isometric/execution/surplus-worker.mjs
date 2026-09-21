import { parentPort, workerData } from 'node:worker_threads';
import { IsoMaxSolver } from '../solver.mjs';
import { CENTER_ORDER } from '../move-order.mjs';
import {
  CTRL_ABORT,
  CTRL_OCC_FREE_WAKE,
  CTRL_PUB_WAKE,
  CTRL_SESSION,
  CTRL_SURPLUS_CREDITS,
  CTRL_SURPLUS_RESERVED,
  CTRL_WORK_WAKE,
  CTRL_WORKER_READY,
  MAX_MOVES,
  OCC_EXACT,
  OCC_LINKED,
  OCC_PUBLISHED,
  OCC_RETIRED,
  OCC_ROLE_CONTINUATION,
  OCC_ROLE_SURPLUS,
  PUB_CONTINUATION_START,
  PUB_EXACT,
  PUB_FAILURE,
  PUB_OCCURRENCE,
  PUB_OCCURRENCE_EXACT,
  PUB_RETIRE_OCCURRENCE,
  PUB_WORK_RETIRED,
  SESSION_RUNNING,
  WC_BAND_BASE,
  WC_BRANCHES,
  WC_CONTROL_CHECKS,
  WC_CONTINUATION_YIELDS,
  WC_DEMAND_RESERVATIONS,
  WC_HELPER_WAITS,
  WC_HELPER_REPLAY_APPLIES,
  WC_LOCAL_PRIMARY,
  WC_LOCAL_RECLAIMS,
  WC_OCC_EXACT_CONSUMED,
  WC_OCC_PUBLISHED,
  WC_PATH_REPLAY_APPLIES,
  WC_RETIRE_OCC,
  WC_RETIREMENT_WASTE_NODES,
  WC_REMOTE_CACHE_TRANSITIONS,
  WC_SOLVER_CACHE_HITS,
  WC_SOLVER_CACHE_STORES,
  WC_SOLVER_FORCED_TRANSITIONS,
  WC_SOLVER_NATIVE_EXACT,
  WC_SOLVER_NODES,
  WC_SOLVER_RECURSIVE_CHILDREN,
  WC_SURPLUS_LOCAL,
  WC_SURPLUS_REMOTE,
  WC_UNPUBLISHED_LOCAL,
  WC_WORK_CLAIMS,
  WC_WORDS,
  WORK_EXACT,
  WORK_READY,
  WORK_RETIRED,
  WORK_RUNNING,
  WORK_UNUSED,
  WORK_WRITING,
  allocateOccurrence,
  claimHighest,
  completeWork,
  openSurplusPool,
  publish,
} from './surplus-pool.mjs';

if (!parentPort) throw new Error('IsoMax surplus worker requires parentPort');

const workRetired=Symbol('surplus work retired');
const continuationResolved=Symbol('surplus continuation resolved');
const sessionStopped=Symbol('surplus session stopped');
const workerIndex=workerData.workerId;
const workerCount=workerData.workerCount;

class SurplusDistributor {
  constructor(worker) {
    this.worker=worker;
    this.columns=new Int8Array((MAX_MOVES+1)*7);
    this.occSlots=new Int32Array((MAX_MOVES+1)*7);this.occSlots.fill(-1);
    this.occGenerations=new Int32Array((MAX_MOVES+1)*7);
    this.allocateScratch=new Int32Array(1);
  }

  allocateOpportunity(state,column,orderRank,role) {
    const shared=this.worker.shared;
    let slot=allocateOccurrence(
      shared,workerIndex,this.worker.activeWork,this.worker.activeAttempt,
      state,column,orderRank,role,this.allocateScratch,
    );
    if(slot>=0)return slot;

    // Bounded global backpressure: give reconciliation one short chance to
    // retire/recycle consumed occurrences. Never grow the arena in recursion.
    const epoch=Atomics.load(shared.control,CTRL_OCC_FREE_WAKE);
    Atomics.wait(shared.control,CTRL_OCC_FREE_WAKE,epoch,2);
    slot=allocateOccurrence(
      shared,workerIndex,this.worker.activeWork,this.worker.activeAttempt,
      state,column,orderRank,role,this.allocateScratch,
    );
    return slot;
  }

  publishBlocking(kind,a=0,b=0,c=0,d=0,e=0,f=0,g=0) {
    const shared=this.worker.shared;
    while(!publish(shared,kind,a,b,c,d,e,f,g)){
      if(Atomics.load(shared.control,CTRL_ABORT))throw new Error('ISOMAX_SURPLUS_ABORTED');
      if(Atomics.load(shared.control,CTRL_SESSION)!==SESSION_RUNNING)throw sessionStopped;
      const epoch=Atomics.load(shared.control,CTRL_PUB_WAKE);
      Atomics.wait(shared.control,CTRL_PUB_WAKE,epoch,2);
    }
  }

  retireOccurrence(slot,generation) {
    if(slot<0)return;
    if(Atomics.load(this.worker.shared.control,CTRL_SESSION)!==SESSION_RUNNING)return;
    this.publishBlocking(PUB_RETIRE_OCCURRENCE,slot,generation);
    this.worker.counters[WC_RETIRE_OCC]++;
  }


  publishWorkExact(slot,generation,attempt,value,rootMove=-1) {
    const shared=this.worker.shared;
    if(!completeWork(shared,slot,generation,attempt,value,rootMove)){
      throw new Error(
        'surplus exact completion lost work ownership'+
        ';slot='+slot+
        ';expectedGeneration='+generation+
        ';actualGeneration='+Atomics.load(shared.workGeneration,slot)+
        ';expectedAttempt='+attempt+
        ';actualAttempt='+Atomics.load(shared.workAttempt,slot)+
        ';state='+Atomics.load(shared.workState,slot)+
        ';needed='+Atomics.load(shared.workNeeded,slot)+
        ';owner='+Atomics.load(shared.workWorker,slot)
      );
    }
    this.publishBlocking(PUB_EXACT,slot,generation,attempt,value,rootMove,workerIndex);
  }

  solveOccurrenceLocally(solver,state,column,slot,generation) {
    const ply=state.ply;
    this.worker.counters[WC_LOCAL_RECLAIMS]++;
    this.worker.counters[WC_SURPLUS_LOCAL]++;

    // Branch Manager owns helper arbitration. The worker only announces that
    // this already-needed child is now the live local continuation, then keeps
    // native recursion moving without waiting on READY/RUNNING helper state.
    this.publishBlocking(PUB_CONTINUATION_START,slot,generation,workerIndex);

    let value,remoteResolved=false;
    const nodeStart=solver.metrics.nodes,wasteStart=this.worker.claimWasteNodes;
    this.worker.pushContinuation(ply,slot,generation);
    state.applyUnchecked(column);solver.metrics.recursiveChildren++;
    try{
      value=solver.solveNode(state);
    }catch(error){
      if(error===continuationResolved&&this.worker.interruptPly===ply){
        this.worker.recordRetirementWaste(nodeStart,wasteStart);
        value=this.worker.interruptValue;
        remoteResolved=true;
        this.worker.counters[WC_OCC_EXACT_CONSUMED]++;
      }else throw error;
    }finally{
      state.undo();
      this.worker.popContinuation(ply,slot);
    }

    if(!remoteResolved){
      this.publishBlocking(PUB_OCCURRENCE_EXACT,slot,generation,value,workerIndex);
    }
    return value;
  }

  rememberExactChild(solver,state,column,value,sourceKind=0,sourceSlot=-1,sourceGeneration=0) {
    const cache=solver.transitionCache;
    state.applyUnchecked(column);
    this.worker.counters[WC_REMOTE_CACHE_TRANSITIONS]++;
    try{
      const hash=cache.prepareKey(state);
      const key0=cache.scratch[0],key1=cache.scratch[1],support=cache.scratch[2]>>>0;
      const existing=cache.getPreparedUnchecked(key0,key1,support,hash);
      if(existing===undefined){
        solver.storeExact(key0,key1,support,hash,value);
      }else if(existing!==value){
        let sourceMoves='';
        if(sourceKind===2&&sourceSlot>=0&&sourceSlot<this.worker.shared.workCapacity){
          const length=Atomics.load(this.worker.shared.workPathLength,sourceSlot);
          const base=sourceSlot*MAX_MOVES;
          sourceMoves=Array.from(
            {length},
            (_,i)=>this.worker.shared.workPath[base+i]+1,
          ).join('');
        }else if(sourceKind===1&&sourceSlot>=0&&sourceSlot<this.worker.shared.occurrenceCapacity){
          const length=Atomics.load(this.worker.shared.occPathLength,sourceSlot);
          const base=sourceSlot*MAX_MOVES;
          sourceMoves=Array.from(
            {length},
            (_,i)=>this.worker.shared.occPath[base+i]+1,
          ).join('');
        }
        throw new Error(
          'remote exact value contradicts local transition cache'+
          ';worker='+workerIndex+
          ';sourceKind='+sourceKind+
          ';sourceSlot='+sourceSlot+
          ';sourceGeneration='+sourceGeneration+
          ';column='+column+
          ';localValue='+existing+
          ';remoteValue='+value+
          ';p0='+key0+
          ';p1='+key1+
          ';support='+(support>>>0)+
          ';moves='+Array.from(
            {length:state.ply},
            (_,i)=>(state.moveCells[i]%7)+1,
          ).join('')+
          ';sourceMoves='+sourceMoves
        );
      }
    }finally{
      state.undo();
    }
    return value;
  }

  resolvePublishedChild(solver,state,column,slot,generation) {
    const shared=this.worker.shared;
    if(Atomics.load(shared.control,CTRL_ABORT))throw new Error('ISOMAX_SURPLUS_ABORTED');
    if(Atomics.load(shared.control,CTRL_SESSION)!==SESSION_RUNNING)throw sessionStopped;
    if(Atomics.load(shared.occGeneration,slot)!==generation)
      throw new Error('surplus occurrence generation changed');

    // Exact is the only manager result the recursive worker needs to consume.
    // Otherwise continue locally immediately. READY/RUNNING/priority/leader
    // state belongs to Branch Manager and is deliberately not interpreted here.
    if(Atomics.load(shared.occState,slot)===OCC_EXACT){
      this.worker.counters[WC_OCC_EXACT_CONSUMED]++;
      return this.rememberExactChild(
        solver,state,column,Atomics.load(shared.occResult,slot),1,slot,generation,
      );
    }
    return this.solveOccurrenceLocally(solver,state,column,slot,generation);
  }

  reserveManagerDemand(limit){
    const control=this.worker.shared.control;
    let reserved=0;
    while(reserved<limit){
      const available=Atomics.load(control,CTRL_SURPLUS_CREDITS);
      if(available<=0)break;
      if(Atomics.compareExchange(
        control,CTRL_SURPLUS_CREDITS,available,available-1,
      )!==available)continue;
      Atomics.add(control,CTRL_SURPLUS_RESERVED,1);
      reserved++;
    }
    this.worker.counters[WC_DEMAND_RESERVATIONS]+=reserved;
    return reserved;
  }

  solveLocalChildren(solver,state,maximizing,lower,upper,count,base){
    let best=maximizing?-1:1;
    for(let i=0;i<count;i++){
      const column=this.columns[base+i];
      if(i===0)this.worker.counters[WC_LOCAL_PRIMARY]++;
      else this.worker.counters[WC_UNPUBLISHED_LOCAL]++;
      state.applyUnchecked(column);solver.metrics.recursiveChildren++;
      let childValue;
      try{childValue=solver.solveNode(state);}
      finally{state.undo();}
      if(maximizing){
        if(childValue>best)best=childValue;
        if(best>=upper)break;
      }else{
        if(childValue<best)best=childValue;
        if(best<=lower)break;
      }
    }
    return best;
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
    if(count===1){
      const column=this.columns[base];
      state.applyUnchecked(column);solver.metrics.recursiveChildren++;
      try{return solver.solveNode(state);}
      finally{state.undo();}
    }
    this.worker.counters[WC_BRANCHES]++;

    if(workerCount===1)return this.solveLocalChildren(
      solver,state,maximizing,lower,upper,count,base,
    );

    // Branch Manager publishes the global execution budget. This worker does
    // not inspect peer workers or decide whether external capacity exists.
    const demand=this.reserveManagerDemand(count-1);
    if(demand===0)return this.solveLocalChildren(
      solver,state,maximizing,lower,upper,count,base,
    );
    const publishCount=1+demand;

    for(let i=0;i<count;i++)this.occSlots[base+i]=-1;
    try{
      for(let i=0;i<publishCount;i++){
        const column=this.columns[base+i];
        const role=i===0?OCC_ROLE_CONTINUATION:OCC_ROLE_SURPLUS;
        const slot=this.allocateOpportunity(state,column,i,role);
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
        const slot=this.occSlots[base+i],generation=this.occGenerations[base+i];
        let childValue;

        if(i===0){
          this.worker.counters[WC_LOCAL_PRIMARY]++;
          let remoteResolved=false;
          const nodeStart=solver.metrics.nodes,wasteStart=this.worker.claimWasteNodes;
          this.worker.pushContinuation(ply,slot,generation);
          state.applyUnchecked(column);solver.metrics.recursiveChildren++;
          try{
            childValue=solver.solveNode(state);
          }catch(error){
            if(error===continuationResolved&&this.worker.interruptPly===ply){
              this.worker.recordRetirementWaste(nodeStart,wasteStart);
              childValue=this.worker.interruptValue;
              remoteResolved=true;
              this.worker.counters[WC_OCC_EXACT_CONSUMED]++;
            }else throw error;
          }finally{
            state.undo();
            this.worker.popContinuation(ply,slot);
          }
          if(!remoteResolved){
            this.publishBlocking(PUB_OCCURRENCE_EXACT,slot,generation,childValue,workerIndex);
          }
          this.retireOccurrence(slot,generation);this.occSlots[base+i]=-1;
        }else if(slot>=0){
          childValue=this.resolvePublishedChild(solver,state,column,slot,generation);
          this.retireOccurrence(slot,generation);this.occSlots[base+i]=-1;
        }else{
          this.worker.counters[WC_UNPUBLISHED_LOCAL]++;
          state.applyUnchecked(column);solver.metrics.recursiveChildren++;
          try{childValue=solver.solveNode(state);}
          finally{state.undo();}
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
      for(let i=0;i<count;i++){
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
    this.helperGraceMs=1;
    this.controlQuantum=512;
    this.helperControlQuantum=512;
    this.activeControlQuantum=512;
    this.counters=new Int32Array(WC_WORDS);
    this.claimScratch=new Int32Array(4);
    this.continuationPly=new Int8Array(MAX_MOVES+1);
    this.continuationSlot=new Int32Array(MAX_MOVES+1);this.continuationSlot.fill(-1);
    this.continuationGeneration=new Int32Array(MAX_MOVES+1);
    this.continuationDepth=0;
    this.claimWasteNodes=0;
    this.interruptPly=-1;
    this.interruptValue=0;
    this.distributor=new SurplusDistributor(this);
    this.solver.branchDistributor=this.distributor;
    this.solver.checkTaskControl=(state)=>this.checkTaskControl(state);
  }

  prepareSession(message) {
    this.shared=openSurplusPool(message.pool);
    this.externalRootPly=message.rootPly;
    this.helperGraceMs=message.helperGraceMs;
    if(!Number.isSafeInteger(this.helperGraceMs)||this.helperGraceMs<1||this.helperGraceMs>1000)
      throw new RangeError('invalid surplus helperGraceMs');
    this.controlQuantum=message.controlQuantum;
    if(!Number.isSafeInteger(this.controlQuantum)||this.controlQuantum<1||this.controlQuantum>1<<20)
      throw new RangeError('invalid surplus controlQuantum');
    this.helperControlQuantum=message.helperControlQuantum;
    if(!Number.isSafeInteger(this.helperControlQuantum)||this.helperControlQuantum<1||
       this.helperControlQuantum>1<<20)
      throw new RangeError('invalid surplus helperControlQuantum');
    this.activeControlQuantum=this.controlQuantum;
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

  pushContinuation(ply,slot,generation){
    const depth=this.continuationDepth++;
    this.continuationPly[depth]=ply;
    this.continuationSlot[depth]=slot;
    this.continuationGeneration[depth]=generation;
  }

  popContinuation(ply,slot){
    const depth=this.continuationDepth-1;
    if(depth<0||this.continuationPly[depth]!==ply||this.continuationSlot[depth]!==slot)
      throw new Error('surplus continuation stack corruption');
    this.continuationSlot[depth]=-1;this.continuationDepth=depth;
  }

  recordRetirementWaste(nodeStart,wasteStart) {
    const span=this.solver.metrics.nodes-nodeStart;
    const already=this.claimWasteNodes-wasteStart;
    const delta=span-already;
    if(delta>0){
      this.counters[WC_RETIREMENT_WASTE_NODES]+=delta;
      this.claimWasteNodes+=delta;
    }
  }

  checkTaskControl() {
    this.counters[WC_CONTROL_CHECKS]++;
    const shared=this.shared;
    if(Atomics.load(shared.control,CTRL_ABORT))throw new Error('ISOMAX_SURPLUS_ABORTED');
    if(Atomics.load(shared.control,CTRL_SESSION)!==SESSION_RUNNING)throw sessionStopped;
    if(this.activeWork>=0&&Atomics.load(shared.workNeeded,this.activeWork)===0)throw workRetired;

    // Continuations remain native/local, but canonical exact knowledge may
    // resolve an ancestor branch while this worker is deeper in recursion.
    // Unwind only to that branch frame at the amortized control boundary.
    for(let depth=0;depth<this.continuationDepth;depth++){
      const slot=this.continuationSlot[depth],generation=this.continuationGeneration[depth];
      if(slot<0||Atomics.load(shared.occGeneration,slot)!==generation)continue;
      if(Atomics.load(shared.occState,slot)===OCC_EXACT){
        this.interruptPly=this.continuationPly[depth];
        this.interruptValue=Atomics.load(shared.occResult,slot);
        throw continuationResolved;
      }
    }
    this.solver.nextControlNode=this.solver.metrics.nodes+this.activeControlQuantum;
  }

  resetMetrics() {
    for(const key of Object.keys(this.solver.metrics))this.solver.metrics[key]=0;
    this.solver.orderingRootPly=this.externalRootPly;
    this.continuationDepth=0;this.claimWasteNodes=0;this.interruptPly=-1;
    this.solver.nextControlNode=0;
  }

  publishBlocking(kind,a=0,b=0,c=0,d=0,e=0,f=0,g=0) {
    this.distributor.publishBlocking(kind,a,b,c,d,e,f,g);
  }

  replayWork(slot) {
    const shared=this.shared,length=Atomics.load(shared.workPathLength,slot);
    const helperReplay=length>this.externalRootPly;
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
      if(helperReplay)this.counters[WC_HELPER_REPLAY_APPLIES]++;
    }
    return this.state;
  }

  runClaim(slot,generation,attempt) {
    const shared=this.shared;
    this.activeWork=slot;this.activeGeneration=generation;this.activeAttempt=attempt;
    const pathLength=Atomics.load(shared.workPathLength,slot);
    this.activeControlQuantum=pathLength>this.externalRootPly
      ? this.helperControlQuantum : this.controlQuantum;
    this.resetMetrics();
    const state=this.replayWork(slot);
    let value,retired=false,stopped=false;
    try{
      value=this.solver.solveNode(state);
    }catch(error){
      if(error===workRetired)retired=true;
      else if(error===sessionStopped)stopped=true;
      else throw error;
    }
    if(retired||stopped){
      this.recordRetirementWaste(0,0);
      Atomics.store(shared.workNeeded,slot,0);
      Atomics.store(shared.workState,slot,WORK_RETIRED);
      Atomics.notify(shared.workState,slot,Infinity);
      if(retired&&Atomics.load(shared.control,CTRL_SESSION)===SESSION_RUNNING)
        this.publishBlocking(PUB_WORK_RETIRED,slot,generation,attempt,workerIndex);
      return;
    }

    let move=-1;
    if(state.ply===this.externalRootPly&&!state.isTerminal()){
      // Root value is already exact. Select the physical witness from this
      // worker's warm local cache without creating fresh surplus work whose
      // only purpose would be post-value move reconstruction.
      const distributor=this.solver.branchDistributor;
      this.solver.branchDistributor=null;
      try{move=this.solver.selectMoveForValue(state,value);}
      finally{this.solver.branchDistributor=distributor;}
    }
    this.distributor.publishWorkExact(slot,generation,attempt,value,move);
  }

  accumulateSolverMetrics() {
    const metrics=this.solver.metrics;
    this.counters[WC_SOLVER_NODES]+=metrics.nodes;
    this.counters[WC_SOLVER_CACHE_HITS]+=metrics.transitionCacheHits;
    this.counters[WC_SOLVER_NATIVE_EXACT]+=metrics.nativeExactHits;
    this.counters[WC_SOLVER_RECURSIVE_CHILDREN]+=metrics.recursiveChildren;
    this.counters[WC_SOLVER_FORCED_TRANSITIONS]+=metrics.forcedTransitions;
    this.counters[WC_SOLVER_CACHE_STORES]+=metrics.transitionCacheStores;
  }

  tryClaimWork(){
    const shared=this.shared;
    if(!claimHighest(shared,workerIndex,this.claimScratch))return false;
    Atomics.store(shared.workerIdle,workerIndex,0);
    this.counters[WC_WORK_CLAIMS]++;
    this.counters[WC_BAND_BASE+this.claimScratch[3]]++;
    if(Atomics.load(shared.workPathLength,this.claimScratch[0])>this.externalRootPly)
      this.counters[WC_SURPLUS_REMOTE]++;
    this.runClaim(this.claimScratch[0],this.claimScratch[1],this.claimScratch[2]);
    this.accumulateSolverMetrics();
    return true;
  }

  runSession(message) {
    this.prepareSession(message);
    const shared=this.shared;
    // Session-start barrier only: make every live worker visible as idle before
    // any one of them can claim the external root and enter recursion.
    Atomics.store(shared.workerIdle,workerIndex,1);
    Atomics.add(shared.control,CTRL_WORKER_READY,1);
    Atomics.notify(shared.control,CTRL_WORKER_READY,Infinity);
    while(Atomics.load(shared.control,CTRL_SESSION)===SESSION_RUNNING &&
          !Atomics.load(shared.control,CTRL_ABORT)){
      let alive=0;
      for(let id=0;id<workerCount;id++)alive+=Number(Atomics.load(shared.workerAlive,id)!==0);
      const ready=Atomics.load(shared.control,CTRL_WORKER_READY);
      if(ready>=alive)break;
      Atomics.wait(shared.control,CTRL_WORKER_READY,ready,10);
    }

    try{
      while(Atomics.load(shared.control,CTRL_SESSION)===SESSION_RUNNING &&
            !Atomics.load(shared.control,CTRL_ABORT)){
        // If this succeeds it clears our idle token. On failure, preserve an
        // already-advertised token; only producers consume it.
        if(this.tryClaimWork())continue;
        if(Atomics.load(shared.control,CTRL_SESSION)!==SESSION_RUNNING ||
           Atomics.load(shared.control,CTRL_ABORT))break;

        // Advertise actual idle demand. A producer atomically consumes this
        // token before publishing surplus; the work itself remains global and
        // may be claimed by any worker. Recheck after publication visibility
        // to close the idle-advertise race.
        const epoch=Atomics.load(shared.control,CTRL_WORK_WAKE);
        Atomics.store(shared.workerIdle,workerIndex,1);
        if(this.tryClaimWork())continue;
        if(Atomics.load(shared.control,CTRL_SESSION)!==SESSION_RUNNING ||
           Atomics.load(shared.control,CTRL_ABORT))break;
        Atomics.wait(shared.control,CTRL_WORK_WAKE,epoch);
      }
    }finally{
      Atomics.store(shared.workerIdle,workerIndex,0);
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

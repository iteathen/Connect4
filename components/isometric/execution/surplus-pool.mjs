// Corrected #102 shared substrate: global scheduling owns only surplus branch
// opportunities. The worker's current recursive continuation remains local.

export const MAX_MOVES = 42;
export const PRIORITY_BANDS = 8;

export const SESSION_IDLE = 0;
export const SESSION_RUNNING = 1;
export const SESSION_STOP = 2;

export const WORK_UNUSED = 0;
export const WORK_WRITING = 1;
export const WORK_READY = 2;
export const WORK_RUNNING = 3;
export const WORK_EXACT = 4;
export const WORK_RETIRED = 5;

export const OCC_UNUSED = 0;
export const OCC_PUBLISHED = 1;
export const OCC_LINKED = 2;
export const OCC_EXACT = 3;
export const OCC_RETIRED = 4;

export const OCC_ROLE_SURPLUS = 0;
export const OCC_ROLE_CONTINUATION = 1;

export const PUB_OCCURRENCE = 1;
export const PUB_EXACT = 2;
export const PUB_RETIRE_OCCURRENCE = 3;
export const PUB_WORK_RETIRED = 4;
export const PUB_FAILURE = 5;
export const PUB_OCCURRENCE_EXACT = 6;
export const PUB_CONTINUATION_START = 7;

export const CTRL_ABORT = 0;
export const CTRL_SESSION = 1;
export const CTRL_WORK_WAKE = 2;
export const CTRL_PUB_WAKE = 3;
export const CTRL_OCC_NEXT = 4;
export const CTRL_WORK_NEXT = 5;
export const CTRL_FAILURE = 6;
export const CTRL_OCC_FREE_WAKE = 7;
export const CTRL_WORDS = 16;

export const WC_WORK_CLAIMS = 0;
export const WC_LOCAL_RECLAIMS = 1;
export const WC_HELPER_WAITS = 2;
export const WC_OCC_PUBLISHED = 3;
export const WC_OCC_EXACT_CONSUMED = 4;
export const WC_BRANCHES = 5;
export const WC_LOCAL_PRIMARY = 6;
export const WC_SURPLUS_LOCAL = 7;
export const WC_SURPLUS_REMOTE = 8;
export const WC_RETIRE_OCC = 9;
export const WC_PATH_REPLAY_APPLIES = 10;
export const WC_CONTROL_CHECKS = 11;
export const WC_CONTINUATION_YIELDS = 12;
export const WC_REMOTE_CACHE_TRANSITIONS = 13;
export const WC_BAND_BASE = 16;
export const WC_WORDS = 24;

function positive(value, name, maximum = 1 << 28) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError('invalid ' + name);
  }
  return value;
}
function sabI32(length) {
  return new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);
}
function initRing(sequenceBuffer, lanes, capacity) {
  const seq = new Int32Array(sequenceBuffer);
  for (let lane = 0; lane < lanes; lane++) {
    const base = lane * capacity;
    for (let i = 0; i < capacity; i++) seq[base + i] = i;
  }
}

export function createSurplusPool({
  workerCount,
  workCapacity = 262144,
  occurrenceCapacity = 524288,
  queueCapacity = 262144,
  publicationCapacity = 262144,
} = {}) {
  positive(workerCount, 'workerCount', 256);
  positive(workCapacity, 'workCapacity');
  positive(occurrenceCapacity, 'occurrenceCapacity');
  positive(queueCapacity, 'queueCapacity');
  positive(publicationCapacity, 'publicationCapacity');

  const descriptor = Object.freeze({
    workerCount, workCapacity, occurrenceCapacity, queueCapacity, publicationCapacity,
    bands: PRIORITY_BANDS,
    control: sabI32(CTRL_WORDS),

    workState: sabI32(workCapacity),
    workGeneration: sabI32(workCapacity),
    workTicket: sabI32(workCapacity),
    workPriority: sabI32(workCapacity),
    workQ: sabI32(workCapacity),
    workWorker: sabI32(workCapacity),
    workNeeded: sabI32(workCapacity),
    workAttempt: sabI32(workCapacity),
    workResult: sabI32(workCapacity),
    workRootMove: sabI32(workCapacity),
    workPathLength: sabI32(workCapacity),
    workPath: new SharedArrayBuffer(workCapacity * MAX_MOVES),
    workFreeSequence: sabI32(workCapacity),
    workFreeSlot: sabI32(workCapacity),
    workFreeEnqueue: sabI32(1),
    workFreeDequeue: sabI32(1),

    occState: sabI32(occurrenceCapacity),
    occGeneration: sabI32(occurrenceCapacity),
    occWork: sabI32(occurrenceCapacity),
    occWorkGeneration: sabI32(occurrenceCapacity),
    occResult: sabI32(occurrenceCapacity),
    occNeeded: sabI32(occurrenceCapacity),
    occPublisherWorker: sabI32(occurrenceCapacity),
    occRole: sabI32(occurrenceCapacity),
    occLeader: sabI32(occurrenceCapacity),
    occLeaderGeneration: sabI32(occurrenceCapacity),
    occParentWork: sabI32(occurrenceCapacity),
    occParentAttempt: sabI32(occurrenceCapacity),
    occAction: sabI32(occurrenceCapacity),
    occOrderRank: sabI32(occurrenceCapacity),
    occPathLength: sabI32(occurrenceCapacity),
    occPath: new SharedArrayBuffer(occurrenceCapacity * MAX_MOVES),
    occFreeSequence: sabI32(occurrenceCapacity),
    occFreeSlot: sabI32(occurrenceCapacity),
    occFreeEnqueue: sabI32(1),
    occFreeDequeue: sabI32(1),

    queueSequence: sabI32(PRIORITY_BANDS * queueCapacity),
    queueSlot: sabI32(PRIORITY_BANDS * queueCapacity),
    queueGeneration: sabI32(PRIORITY_BANDS * queueCapacity),
    queueTicket: sabI32(PRIORITY_BANDS * queueCapacity),
    queueEnqueue: sabI32(PRIORITY_BANDS),
    queueDequeue: sabI32(PRIORITY_BANDS),

    publicationSequence: sabI32(publicationCapacity),
    publicationKind: sabI32(publicationCapacity),
    publicationA: sabI32(publicationCapacity),
    publicationB: sabI32(publicationCapacity),
    publicationC: sabI32(publicationCapacity),
    publicationD: sabI32(publicationCapacity),
    publicationE: sabI32(publicationCapacity),
    publicationF: sabI32(publicationCapacity),
    publicationG: sabI32(publicationCapacity),
    publicationEnqueue: sabI32(1),
    publicationDequeue: sabI32(1),

    workerAlive: sabI32(workerCount),
    workerCounters: sabI32(workerCount * WC_WORDS),
  });
  initRing(descriptor.queueSequence, PRIORITY_BANDS, queueCapacity);
  initRing(descriptor.publicationSequence, 1, publicationCapacity);
  initRing(descriptor.workFreeSequence, 1, workCapacity);
  initRing(descriptor.occFreeSequence, 1, occurrenceCapacity);
  const pool = openSurplusPool(descriptor);
  pool.workQ.fill(-1);
  pool.workWorker.fill(-1);
  pool.workRootMove.fill(-1);
  pool.occWork.fill(-1);
  pool.occWorkGeneration.fill(-1);
  pool.occPublisherWorker.fill(-1);
  pool.occLeader.fill(-1);
  pool.occLeaderGeneration.fill(-1);
  pool.occParentWork.fill(-1);
  pool.occAction.fill(-1);
  pool.workerAlive.fill(1);
  return descriptor;
}

export function openSurplusPool(d) {
  return {
    descriptor:d,
    workerCount:d.workerCount, workCapacity:d.workCapacity,
    occurrenceCapacity:d.occurrenceCapacity, queueCapacity:d.queueCapacity,
    publicationCapacity:d.publicationCapacity, bands:d.bands,
    control:new Int32Array(d.control),

    workState:new Int32Array(d.workState),
    workGeneration:new Int32Array(d.workGeneration),
    workTicket:new Int32Array(d.workTicket),
    workPriority:new Int32Array(d.workPriority),
    workQ:new Int32Array(d.workQ),
    workWorker:new Int32Array(d.workWorker),
    workNeeded:new Int32Array(d.workNeeded),
    workAttempt:new Int32Array(d.workAttempt),
    workResult:new Int32Array(d.workResult),
    workRootMove:new Int32Array(d.workRootMove),
    workPathLength:new Int32Array(d.workPathLength),
    workPath:new Uint8Array(d.workPath),
    workFreeSequence:new Int32Array(d.workFreeSequence),
    workFreeSlot:new Int32Array(d.workFreeSlot),
    workFreeEnqueue:new Int32Array(d.workFreeEnqueue),
    workFreeDequeue:new Int32Array(d.workFreeDequeue),

    occState:new Int32Array(d.occState),
    occGeneration:new Int32Array(d.occGeneration),
    occWork:new Int32Array(d.occWork),
    occWorkGeneration:new Int32Array(d.occWorkGeneration),
    occResult:new Int32Array(d.occResult),
    occNeeded:new Int32Array(d.occNeeded),
    occPublisherWorker:new Int32Array(d.occPublisherWorker),
    occRole:new Int32Array(d.occRole),
    occLeader:new Int32Array(d.occLeader),
    occLeaderGeneration:new Int32Array(d.occLeaderGeneration),
    occParentWork:new Int32Array(d.occParentWork),
    occParentAttempt:new Int32Array(d.occParentAttempt),
    occAction:new Int32Array(d.occAction),
    occOrderRank:new Int32Array(d.occOrderRank),
    occPathLength:new Int32Array(d.occPathLength),
    occPath:new Uint8Array(d.occPath),
    occFreeSequence:new Int32Array(d.occFreeSequence),
    occFreeSlot:new Int32Array(d.occFreeSlot),
    occFreeEnqueue:new Int32Array(d.occFreeEnqueue),
    occFreeDequeue:new Int32Array(d.occFreeDequeue),

    queueSequence:new Int32Array(d.queueSequence),
    queueSlot:new Int32Array(d.queueSlot),
    queueGeneration:new Int32Array(d.queueGeneration),
    queueTicket:new Int32Array(d.queueTicket),
    queueEnqueue:new Int32Array(d.queueEnqueue),
    queueDequeue:new Int32Array(d.queueDequeue),

    publicationSequence:new Int32Array(d.publicationSequence),
    publicationKind:new Int32Array(d.publicationKind),
    publicationA:new Int32Array(d.publicationA),
    publicationB:new Int32Array(d.publicationB),
    publicationC:new Int32Array(d.publicationC),
    publicationD:new Int32Array(d.publicationD),
    publicationE:new Int32Array(d.publicationE),
    publicationF:new Int32Array(d.publicationF),
    publicationG:new Int32Array(d.publicationG),
    publicationEnqueue:new Int32Array(d.publicationEnqueue),
    publicationDequeue:new Int32Array(d.publicationDequeue),

    workerAlive:new Int32Array(d.workerAlive),
    workerCounters:new Int32Array(d.workerCounters),
  };
}

function reserveEnqueue(sequence,enqueue,lane,capacity) {
  const base=lane*capacity;
  for(let spin=0;spin<1024;spin++){
    const pos=Atomics.load(enqueue,lane);
    const cell=base+(pos%capacity);
    const seq=Atomics.load(sequence,cell);
    const diff=seq-pos;
    if(diff===0){
      if(Atomics.compareExchange(enqueue,lane,pos,pos+1)===pos)return pos;
      continue;
    }
    if(diff<0)return -1;
  }
  return -1;
}
function commitEnqueue(sequence,lane,capacity,pos) {
  Atomics.store(sequence,lane*capacity+(pos%capacity),pos+1);
}
function reserveDequeue(sequence,dequeue,lane,capacity) {
  const base=lane*capacity;
  for(let spin=0;spin<1024;spin++){
    const pos=Atomics.load(dequeue,lane);
    const cell=base+(pos%capacity);
    const seq=Atomics.load(sequence,cell);
    const diff=seq-(pos+1);
    if(diff===0){
      if(Atomics.compareExchange(dequeue,lane,pos,pos+1)===pos)return pos;
      continue;
    }
    if(diff<0)return -1;
  }
  return -1;
}
function commitDequeue(sequence,lane,capacity,pos) {
  Atomics.store(sequence,lane*capacity+(pos%capacity),pos+capacity);
}

export function enqueueWork(pool, slot, generation, band) {
  if (band < 0 || band >= pool.bands) throw new RangeError('invalid surplus priority band');
  if (Atomics.load(pool.workGeneration, slot) !== generation ||
      Atomics.load(pool.workState, slot) !== WORK_READY) return false;
  const pos=reserveEnqueue(pool.queueSequence,pool.queueEnqueue,band,pool.queueCapacity);
  if(pos<0)return false;
  const cell=band*pool.queueCapacity+(pos%pool.queueCapacity);
  const ticket=Atomics.add(pool.workTicket,slot,1)+1;
  Atomics.store(pool.workPriority,slot,band);
  pool.queueSlot[cell]=slot;
  pool.queueGeneration[cell]=generation;
  pool.queueTicket[cell]=ticket;
  commitEnqueue(pool.queueSequence,band,pool.queueCapacity,pos);
  Atomics.add(pool.control,CTRL_WORK_WAKE,1);
  Atomics.notify(pool.control,CTRL_WORK_WAKE);
  return true;
}

export function claimHighest(pool, workerIndex, scratch) {
  for (let band=pool.bands-1; band>=0; band--) {
    for(;;){
      const pos=reserveDequeue(pool.queueSequence,pool.queueDequeue,band,pool.queueCapacity);
      if(pos<0)break;
      const cell=band*pool.queueCapacity+(pos%pool.queueCapacity);
      const slot=pool.queueSlot[cell], gen=pool.queueGeneration[cell], ticket=pool.queueTicket[cell];
      commitDequeue(pool.queueSequence,band,pool.queueCapacity,pos);
      if (slot<0||slot>=pool.workCapacity ||
          Atomics.load(pool.workGeneration,slot)!==gen ||
          Atomics.load(pool.workTicket,slot)!==ticket ||
          Atomics.load(pool.workPriority,slot)!==band ||
          Atomics.load(pool.workNeeded,slot)===0 ||
          Atomics.compareExchange(pool.workState,slot,WORK_READY,WORK_RUNNING)!==WORK_READY) continue;
      // Slot reuse is generation-safe only if identity is rechecked after the
      // claim CAS. Otherwise an old queue record can race retire/reuse and
      // transiently claim a new generation whose ticket/band happen to match.
      if(Atomics.load(pool.workGeneration,slot)!==gen ||
         Atomics.load(pool.workTicket,slot)!==ticket ||
         Atomics.load(pool.workPriority,slot)!==band){
        Atomics.compareExchange(pool.workState,slot,WORK_RUNNING,WORK_READY);
        Atomics.add(pool.control,CTRL_WORK_WAKE,1);
        Atomics.notify(pool.control,CTRL_WORK_WAKE);
        continue;
      }
      Atomics.store(pool.workWorker,slot,workerIndex);
      const attempt=Atomics.add(pool.workAttempt,slot,1)+1;
      scratch[0]=slot; scratch[1]=gen; scratch[2]=attempt; scratch[3]=band;
      return true;
    }
  }
  return false;
}

export function claimSpecific(pool, slot, generation, workerIndex, scratch) {
  if (slot<0||slot>=pool.workCapacity ||
      Atomics.load(pool.workGeneration,slot)!==generation ||
      Atomics.load(pool.workNeeded,slot)===0) return false;
  if (Atomics.compareExchange(pool.workState,slot,WORK_READY,WORK_RUNNING)!==WORK_READY) return false;
  if(Atomics.load(pool.workGeneration,slot)!==generation){
    Atomics.compareExchange(pool.workState,slot,WORK_RUNNING,WORK_READY);
    Atomics.add(pool.control,CTRL_WORK_WAKE,1);
    Atomics.notify(pool.control,CTRL_WORK_WAKE);
    return false;
  }
  Atomics.store(pool.workWorker,slot,workerIndex);
  const attempt=Atomics.add(pool.workAttempt,slot,1)+1;
  scratch[0]=slot; scratch[1]=generation; scratch[2]=attempt;
  scratch[3]=Atomics.load(pool.workPriority,slot);
  return true;
}

function enqueueWorkFree(pool,slot) {
  const pos=reserveEnqueue(pool.workFreeSequence,pool.workFreeEnqueue,0,pool.workCapacity);
  if(pos<0)throw new Error('ISOMAX_SURPLUS_WORK_FREE_RING_CAPACITY');
  const cell=pos%pool.workCapacity;
  pool.workFreeSlot[cell]=slot;
  commitEnqueue(pool.workFreeSequence,0,pool.workCapacity,pos);
}

function dequeueWorkFree(pool,scratch) {
  const pos=reserveDequeue(pool.workFreeSequence,pool.workFreeDequeue,0,pool.workCapacity);
  if(pos<0)return false;
  const cell=pos%pool.workCapacity;
  scratch[0]=pool.workFreeSlot[cell];
  commitDequeue(pool.workFreeSequence,0,pool.workCapacity,pos);
  return true;
}

export function allocateWork(pool,scratch) {
  let slot=-1;
  if(dequeueWorkFree(pool,scratch)){
    slot=scratch[0];
  }else{
    for(;;){
      const next=Atomics.load(pool.control,CTRL_WORK_NEXT);
      if(next>=pool.workCapacity)return -1;
      if(Atomics.compareExchange(pool.control,CTRL_WORK_NEXT,next,next+1)===next){
        slot=next;break;
      }
    }
  }
  const generation=Atomics.add(pool.workGeneration,slot,1)+1;
  Atomics.store(pool.workState,slot,WORK_WRITING);
  Atomics.store(pool.workTicket,slot,0);
  Atomics.store(pool.workPriority,slot,0);
  Atomics.store(pool.workQ,slot,-1);
  Atomics.store(pool.workWorker,slot,-1);
  Atomics.store(pool.workNeeded,slot,1);
  Atomics.store(pool.workAttempt,slot,0);
  Atomics.store(pool.workResult,slot,0);
  Atomics.store(pool.workRootMove,slot,-1);
  Atomics.store(pool.workPathLength,slot,0);
  scratch[0]=slot;
  scratch[1]=generation;
  return slot;
}

export function releaseWork(pool,slot,generation) {
  if(slot<0||slot>=pool.workCapacity)return false;
  if(Atomics.load(pool.workGeneration,slot)!==generation)return false;
  const state=Atomics.load(pool.workState,slot);
  if(state!==WORK_EXACT&&state!==WORK_RETIRED)return false;
  Atomics.store(pool.workNeeded,slot,0);
  Atomics.store(pool.workQ,slot,-1);
  Atomics.store(pool.workWorker,slot,-1);
  Atomics.store(pool.workPriority,slot,0);
  Atomics.store(pool.workPathLength,slot,0);
  Atomics.store(pool.workState,slot,WORK_UNUSED);
  enqueueWorkFree(pool,slot);
  return true;
}

function enqueueOccurrenceFree(pool,slot) {
  const pos=reserveEnqueue(pool.occFreeSequence,pool.occFreeEnqueue,0,pool.occurrenceCapacity);
  if(pos<0)throw new Error('ISOMAX_SURPLUS_OCCURRENCE_FREE_RING_CAPACITY');
  const cell=pos%pool.occurrenceCapacity;
  pool.occFreeSlot[cell]=slot;
  commitEnqueue(pool.occFreeSequence,0,pool.occurrenceCapacity,pos);
  Atomics.add(pool.control,CTRL_OCC_FREE_WAKE,1);
  Atomics.notify(pool.control,CTRL_OCC_FREE_WAKE,Infinity);
}

function dequeueOccurrenceFree(pool,scratch) {
  const pos=reserveDequeue(pool.occFreeSequence,pool.occFreeDequeue,0,pool.occurrenceCapacity);
  if(pos<0)return false;
  const cell=pos%pool.occurrenceCapacity;
  scratch[0]=pool.occFreeSlot[cell];
  commitDequeue(pool.occFreeSequence,0,pool.occurrenceCapacity,pos);
  return true;
}

export function releaseOccurrence(pool,slot,generation) {
  if(slot<0||slot>=pool.occurrenceCapacity)return false;
  if(Atomics.load(pool.occGeneration,slot)!==generation)return false;
  if(Atomics.load(pool.occNeeded,slot)!==0)return false;
  if(Atomics.load(pool.occState,slot)!==OCC_RETIRED)return false;
  Atomics.store(pool.occWork,slot,-1);
  Atomics.store(pool.occWorkGeneration,slot,-1);
  Atomics.store(pool.occResult,slot,0);
  Atomics.store(pool.occPublisherWorker,slot,-1);
  Atomics.store(pool.occRole,slot,OCC_ROLE_SURPLUS);
  Atomics.store(pool.occLeader,slot,-1);
  Atomics.store(pool.occLeaderGeneration,slot,-1);
  Atomics.store(pool.occParentWork,slot,-1);
  Atomics.store(pool.occParentAttempt,slot,0);
  Atomics.store(pool.occAction,slot,-1);
  Atomics.store(pool.occOrderRank,slot,0);
  Atomics.store(pool.occPathLength,slot,0);
  Atomics.store(pool.occState,slot,OCC_UNUSED);
  enqueueOccurrenceFree(pool,slot);
  return true;
}

export function allocateOccurrence(pool, workerIndex, parentWork, parentAttempt, state, column, orderRank, role = OCC_ROLE_SURPLUS, scratch = null) {
  let slot=-1;
  const localScratch=scratch??new Int32Array(1);
  if(dequeueOccurrenceFree(pool,localScratch)){
    slot=localScratch[0];
  }else{
    for(;;){
      const next=Atomics.load(pool.control,CTRL_OCC_NEXT);
      if(next>=pool.occurrenceCapacity)return -1;
      if(Atomics.compareExchange(pool.control,CTRL_OCC_NEXT,next,next+1)===next){
        slot=next;break;
      }
    }
  }
  const gen=Atomics.add(pool.occGeneration,slot,1)+1;
  Atomics.store(pool.occState,slot,OCC_PUBLISHED);
  Atomics.store(pool.occWork,slot,-1);
  Atomics.store(pool.occWorkGeneration,slot,-1);
  Atomics.store(pool.occNeeded,slot,1);
  Atomics.store(pool.occPublisherWorker,slot,workerIndex);
  Atomics.store(pool.occRole,slot,role);
  Atomics.store(pool.occLeader,slot,-1);
  Atomics.store(pool.occLeaderGeneration,slot,-1);
  Atomics.store(pool.occParentWork,slot,parentWork);
  Atomics.store(pool.occParentAttempt,slot,parentAttempt);
  Atomics.store(pool.occAction,slot,column);
  Atomics.store(pool.occOrderRank,slot,orderRank);
  const base=slot*MAX_MOVES;
  for(let ply=0;ply<state.ply;ply++) pool.occPath[base+ply]=state.moveCells[ply]%7;
  pool.occPath[base+state.ply]=column;
  Atomics.store(pool.occPathLength,slot,state.ply+1);
  return slot;
}

export function publish(pool,kind,a=0,b=0,c=0,d=0,e=0,f=0,g=0) {
  const pos=reserveEnqueue(pool.publicationSequence,pool.publicationEnqueue,0,pool.publicationCapacity);
  if(pos<0)return false;
  const cell=pos%pool.publicationCapacity;
  pool.publicationKind[cell]=kind;
  pool.publicationA[cell]=a;pool.publicationB[cell]=b;pool.publicationC[cell]=c;
  pool.publicationD[cell]=d;pool.publicationE[cell]=e;pool.publicationF[cell]=f;pool.publicationG[cell]=g;
  commitEnqueue(pool.publicationSequence,0,pool.publicationCapacity,pos);
  Atomics.add(pool.control,CTRL_PUB_WAKE,1);
  Atomics.notify(pool.control,CTRL_PUB_WAKE);
  return true;
}
export function dequeuePublication(pool,scratch) {
  const pos=reserveDequeue(pool.publicationSequence,pool.publicationDequeue,0,pool.publicationCapacity);
  if(pos<0)return false;
  const cell=pos%pool.publicationCapacity;
  scratch[0]=pool.publicationKind[cell];scratch[1]=pool.publicationA[cell];
  scratch[2]=pool.publicationB[cell];scratch[3]=pool.publicationC[cell];
  scratch[4]=pool.publicationD[cell];scratch[5]=pool.publicationE[cell];
  scratch[6]=pool.publicationF[cell];scratch[7]=pool.publicationG[cell];
  commitDequeue(pool.publicationSequence,0,pool.publicationCapacity,pos);
  return true;
}

export function completeWork(pool,slot,generation,attempt,value,rootMove=-1) {
  if (value!==-1&&value!==0&&value!==1) throw new Error('invalid surplus exact WDL');
  if (Atomics.load(pool.workGeneration,slot)!==generation ||
      Atomics.load(pool.workAttempt,slot)!==attempt ||
      Atomics.load(pool.workState,slot)!==WORK_RUNNING) return false;
  Atomics.store(pool.workResult,slot,value);
  Atomics.store(pool.workRootMove,slot,rootMove);
  Atomics.store(pool.workState,slot,WORK_EXACT);
  Atomics.notify(pool.workState,slot,Infinity);
  return true;
}
export function stopSurplusPool(pool) {
  Atomics.store(pool.control,CTRL_SESSION,SESSION_STOP);
  Atomics.add(pool.control,CTRL_WORK_WAKE,1); Atomics.notify(pool.control,CTRL_WORK_WAKE,Infinity);
  Atomics.add(pool.control,CTRL_PUB_WAKE,1); Atomics.notify(pool.control,CTRL_PUB_WAKE,Infinity);
}

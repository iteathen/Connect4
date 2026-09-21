import {
  MAX_ACTIONS,
  completeExposure,
  releaseQRef,
  recycleQIfDead,
} from './shared-tt.mjs';

export const EVENT_EXACT=1;
export const EVENT_DUPLICATE=2;
export const EVENT_RELEASE=3;
export const BRANCH_HOLD_SLOTS=MAX_ACTIONS+1;

function positive(value,name,maximum=2**24){
  if(!Number.isSafeInteger(value)||value<1||value>maximum)throw new RangeError('invalid '+name);
  return value;
}
function powerOfTwo(value,name){
  positive(value,name);
  if((value&(value-1))!==0)throw new RangeError(name+' must be a power of two');
  return value;
}
function sab(Type,length){return new SharedArrayBuffer(Type.BYTES_PER_ELEMENT*length);}

export function createSharedEvents({
  workerCount,
  branchCapacity=2048,
  eventCapacity=4096,
}={}){
  positive(workerCount,'workerCount',256);
  powerOfTwo(branchCapacity,'branchCapacity');
  powerOfTwo(eventCapacity,'eventCapacity');
  const branchSlots=workerCount*branchCapacity;
  const eventSlots=workerCount*eventCapacity;
  const descriptor={
    workerCount,branchCapacity,eventCapacity,
    branchWrite:sab(Int32Array,workerCount),
    branchRead:sab(Int32Array,workerCount),
    branchStartQ:sab(Int32Array,branchSlots),
    branchStartGeneration:sab(Int32Array,branchSlots),
    branchDecisionQ:sab(Int32Array,branchSlots),
    branchDecisionGeneration:sab(Int32Array,branchSlots),
    branchFirstAction:sab(Int32Array,branchSlots),
    branchMask:sab(Int32Array,branchSlots),
    branchRetainedAction:sab(Int32Array,branchSlots),
    branchMaximizing:sab(Int32Array,branchSlots),
    branchRunToken:sab(Int32Array,branchSlots),
    branchChildQ:sab(Int32Array,branchSlots*MAX_ACTIONS),
    branchChildGeneration:sab(Int32Array,branchSlots*MAX_ACTIONS),
    branchChildEval:sab(Int32Array,branchSlots*MAX_ACTIONS),

    pendingBranchPosition:sab(Int32Array,workerCount),
    pendingRefCount:sab(Int32Array,workerCount),
    pendingQ:sab(Int32Array,workerCount*BRANCH_HOLD_SLOTS),
    pendingGeneration:sab(Int32Array,workerCount*BRANCH_HOLD_SLOTS),

    eventWrite:sab(Int32Array,workerCount),
    eventRead:sab(Int32Array,workerCount),
    eventKind:sab(Int32Array,eventSlots),
    eventQ:sab(Int32Array,eventSlots),
    eventGeneration:sab(Int32Array,eventSlots),
    eventValue:sab(Int32Array,eventSlots),
    eventAux:sab(Int32Array,eventSlots),
  };
  // -1 is the only "no branch transaction" sentinel. Zero is a valid first
  // ring position and must never be confused with an untouched worker ledger.
  new Int32Array(descriptor.pendingBranchPosition).fill(-1);
  return descriptor;
}

export function openSharedEvents(descriptor){
  if(!descriptor||!Number.isInteger(descriptor.workerCount))throw new TypeError('invalid shared event descriptor');
  const events={
    ...descriptor,
    branchWrite:new Int32Array(descriptor.branchWrite),
    branchRead:new Int32Array(descriptor.branchRead),
    branchStartQ:new Int32Array(descriptor.branchStartQ),
    branchStartGeneration:new Int32Array(descriptor.branchStartGeneration),
    branchDecisionQ:new Int32Array(descriptor.branchDecisionQ),
    branchDecisionGeneration:new Int32Array(descriptor.branchDecisionGeneration),
    branchFirstAction:new Int32Array(descriptor.branchFirstAction),
    branchMask:new Int32Array(descriptor.branchMask),
    branchRetainedAction:new Int32Array(descriptor.branchRetainedAction),
    branchMaximizing:new Int32Array(descriptor.branchMaximizing),
    branchRunToken:new Int32Array(descriptor.branchRunToken),
    branchChildQ:new Int32Array(descriptor.branchChildQ),
    branchChildGeneration:new Int32Array(descriptor.branchChildGeneration),
    branchChildEval:new Int32Array(descriptor.branchChildEval),
    pendingBranchPosition:new Int32Array(descriptor.pendingBranchPosition),
    pendingRefCount:new Int32Array(descriptor.pendingRefCount),
    pendingQ:new Int32Array(descriptor.pendingQ),
    pendingGeneration:new Int32Array(descriptor.pendingGeneration),
    eventWrite:new Int32Array(descriptor.eventWrite),
    eventRead:new Int32Array(descriptor.eventRead),
    eventKind:new Int32Array(descriptor.eventKind),
    eventQ:new Int32Array(descriptor.eventQ),
    eventGeneration:new Int32Array(descriptor.eventGeneration),
    eventValue:new Int32Array(descriptor.eventValue),
    eventAux:new Int32Array(descriptor.eventAux),
  };
  return events;
}

export function beginBranch(events,workerId){
  const write=Atomics.load(events.branchWrite,workerId);
  const read=Atomics.load(events.branchRead,workerId);
  if(write-read>=events.branchCapacity)throw new Error('ISOMAX_BRANCH_DESCRIPTOR_CAPACITY');
  if(Atomics.load(events.pendingRefCount,workerId)!==0){
    throw new Error('worker started a branch while prior q refs were pending');
  }
  Atomics.store(events.pendingBranchPosition,workerId,write);
  return write;
}

export function holdBranchRef(events,workerId,qIndex,generation){
  const count=Atomics.load(events.pendingRefCount,workerId);
  if(count>=BRANCH_HOLD_SLOTS)throw new Error('ISOMAX_BRANCH_HOLD_CAPACITY');
  const base=workerId*BRANCH_HOLD_SLOTS+count;
  events.pendingQ[base]=qIndex;
  events.pendingGeneration[base]=generation;
  Atomics.store(events.pendingRefCount,workerId,count+1);
}

export function publishBranch(events,workerId,position,
  startQ,startGeneration,decisionQ,decisionGeneration,firstAction,
  mask,retainedAction,maximizing,runToken,
  childQ,childGeneration,childEval,childBase=0){
  const write=Atomics.load(events.branchWrite,workerId);
  if(write!==position||Atomics.load(events.pendingBranchPosition,workerId)!==position){
    throw new Error('branch publication position changed');
  }
  const local=position&(events.branchCapacity-1);
  const slot=workerId*events.branchCapacity+local;
  events.branchStartQ[slot]=startQ;
  events.branchStartGeneration[slot]=startGeneration;
  events.branchDecisionQ[slot]=decisionQ;
  events.branchDecisionGeneration[slot]=decisionGeneration;
  events.branchFirstAction[slot]=firstAction;
  events.branchMask[slot]=mask;
  events.branchRetainedAction[slot]=retainedAction;
  events.branchMaximizing[slot]=maximizing?1:0;
  events.branchRunToken[slot]=runToken;
  const base=slot*MAX_ACTIONS;
  for(let action=0;action<MAX_ACTIONS;action++){
    events.branchChildQ[base+action]=childQ[childBase+action];
    events.branchChildGeneration[base+action]=childGeneration[childBase+action];
    events.branchChildEval[base+action]=childEval[childBase+action];
  }
  // Publishing write transfers every pending q pin to this immutable descriptor.
  // If the worker dies after this store but before clearing the ledger, recovery
  // sees branchWrite > pendingBranchPosition and must not release those refs.
  Atomics.store(events.branchWrite,workerId,position+1);
  Atomics.store(events.pendingRefCount,workerId,0);
  Atomics.store(events.pendingBranchPosition,workerId,-1);
  return slot;
}

/** Manager-only consumer.
 * out: startQ,startGen,decisionQ,decisionGen,firstAction,mask,retained,maximizing,runToken,slot.
 */
export function consumeBranch(events,workerId,out,childQ,childGeneration,childEval){
  const read=Atomics.load(events.branchRead,workerId);
  if(read===Atomics.load(events.branchWrite,workerId))return false;
  const local=read&(events.branchCapacity-1);
  const slot=workerId*events.branchCapacity+local;
  out[0]=events.branchStartQ[slot];
  out[1]=events.branchStartGeneration[slot];
  out[2]=events.branchDecisionQ[slot];
  out[3]=events.branchDecisionGeneration[slot];
  out[4]=events.branchFirstAction[slot];
  out[5]=events.branchMask[slot];
  out[6]=events.branchRetainedAction[slot];
  out[7]=events.branchMaximizing[slot];
  out[8]=events.branchRunToken[slot];
  out[9]=slot;
  const base=slot*MAX_ACTIONS;
  for(let action=0;action<MAX_ACTIONS;action++){
    childQ[action]=events.branchChildQ[base+action];
    childGeneration[action]=events.branchChildGeneration[base+action];
    childEval[action]=events.branchChildEval[base+action];
  }
  Atomics.store(events.branchRead,workerId,read+1);
  return true;
}

/** Release only q pins from a branch that never became visible. */
export function recoverUnpublishedBranch(events,tt,workerId){
  const position=Atomics.load(events.pendingBranchPosition,workerId);
  if(position<0)return 0;
  const count=Atomics.load(events.pendingRefCount,workerId);
  if(Atomics.load(events.branchWrite,workerId)>position){
    // Published descriptors remain manager-visible; normal consumption owns
    // the exposure-inflight release.
    Atomics.store(events.pendingRefCount,workerId,0);
    Atomics.store(events.pendingBranchPosition,workerId,-1);
    return 0;
  }
  let released=0;
  const base=workerId*BRANCH_HOLD_SLOTS;
  for(let index=0;index<count;index++){
    const qIndex=events.pendingQ[base+index];
    const generation=events.pendingGeneration[base+index];
    const remaining=releaseQRef(tt,qIndex,generation);
    if(remaining===0)recycleQIfDead(tt,qIndex,generation);
    released++;
  }
  Atomics.store(events.pendingRefCount,workerId,0);
  Atomics.store(events.pendingBranchPosition,workerId,-1);
  completeExposure(tt);
  return released;
}

export function publishEvent(events,workerId,kind,qIndex,generation,value=0,aux=0){
  const write=Atomics.load(events.eventWrite,workerId);
  const read=Atomics.load(events.eventRead,workerId);
  if(write-read>=events.eventCapacity)throw new Error('ISOMAX_WORKER_EVENT_CAPACITY');
  const local=write&(events.eventCapacity-1);
  const slot=workerId*events.eventCapacity+local;
  events.eventKind[slot]=kind;
  events.eventQ[slot]=qIndex;
  events.eventGeneration[slot]=generation;
  events.eventValue[slot]=value;
  events.eventAux[slot]=aux;
  Atomics.store(events.eventWrite,workerId,write+1);
  return slot;
}

export function consumeEvent(events,workerId,out){
  const read=Atomics.load(events.eventRead,workerId);
  if(read===Atomics.load(events.eventWrite,workerId))return false;
  const local=read&(events.eventCapacity-1);
  const slot=workerId*events.eventCapacity+local;
  out[0]=events.eventKind[slot];
  out[1]=events.eventQ[slot];
  out[2]=events.eventGeneration[slot];
  out[3]=events.eventValue[slot];
  out[4]=events.eventAux[slot];
  Atomics.store(events.eventRead,workerId,read+1);
  return true;
}

import { MAX_ACTIONS } from './shared-tt.mjs';

export const EVENT_EXACT = 1;
export const EVENT_DUPLICATE = 2;
export const EVENT_RELEASE = 3;

function positive(value, name, maximum = 2 ** 24) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new RangeError('invalid ' + name);
  return value;
}

function powerOfTwo(value, name) {
  positive(value, name);
  if ((value & (value - 1)) !== 0) throw new RangeError(name + ' must be a power of two');
  return value;
}

function sab(Type, length) {
  return new SharedArrayBuffer(Type.BYTES_PER_ELEMENT * length);
}

export function createSharedEvents({
  workerCount,
  branchCapacity = 2048,
  eventCapacity = 4096,
} = {}) {
  positive(workerCount, 'workerCount', 256);
  powerOfTwo(branchCapacity, 'branchCapacity');
  powerOfTwo(eventCapacity, 'eventCapacity');
  const branchSlots = workerCount * branchCapacity;
  const eventSlots = workerCount * eventCapacity;
  return {
    workerCount,
    branchCapacity,
    eventCapacity,
    branchWrite: sab(Int32Array, workerCount),
    branchRead: sab(Int32Array, workerCount),
    branchParentQ: sab(Int32Array, branchSlots),
    branchParentGeneration: sab(Int32Array, branchSlots),
    branchMask: sab(Int32Array, branchSlots),
    branchRetainedAction: sab(Int32Array, branchSlots),
    branchMaximizing: sab(Int32Array, branchSlots),
    branchRunToken: sab(Int32Array, branchSlots),
    branchChildQ: sab(Int32Array, branchSlots * MAX_ACTIONS),
    branchChildGeneration: sab(Int32Array, branchSlots * MAX_ACTIONS),
    branchChildEval: sab(Int32Array, branchSlots * MAX_ACTIONS),
    eventWrite: sab(Int32Array, workerCount),
    eventRead: sab(Int32Array, workerCount),
    eventKind: sab(Int32Array, eventSlots),
    eventQ: sab(Int32Array, eventSlots),
    eventGeneration: sab(Int32Array, eventSlots),
    eventValue: sab(Int32Array, eventSlots),
    eventAux: sab(Int32Array, eventSlots),
  };
}

export function openSharedEvents(descriptor) {
  if (!descriptor || !Number.isInteger(descriptor.workerCount)) throw new TypeError('invalid shared event descriptor');
  return {
    ...descriptor,
    branchWrite: new Int32Array(descriptor.branchWrite),
    branchRead: new Int32Array(descriptor.branchRead),
    branchParentQ: new Int32Array(descriptor.branchParentQ),
    branchParentGeneration: new Int32Array(descriptor.branchParentGeneration),
    branchMask: new Int32Array(descriptor.branchMask),
    branchRetainedAction: new Int32Array(descriptor.branchRetainedAction),
    branchMaximizing: new Int32Array(descriptor.branchMaximizing),
    branchRunToken: new Int32Array(descriptor.branchRunToken),
    branchChildQ: new Int32Array(descriptor.branchChildQ),
    branchChildGeneration: new Int32Array(descriptor.branchChildGeneration),
    branchChildEval: new Int32Array(descriptor.branchChildEval),
    eventWrite: new Int32Array(descriptor.eventWrite),
    eventRead: new Int32Array(descriptor.eventRead),
    eventKind: new Int32Array(descriptor.eventKind),
    eventQ: new Int32Array(descriptor.eventQ),
    eventGeneration: new Int32Array(descriptor.eventGeneration),
    eventValue: new Int32Array(descriptor.eventValue),
    eventAux: new Int32Array(descriptor.eventAux),
  };
}

/**
 * Worker-only producer. childQ/childGeneration/childEval are fixed 7-word
 * caller-owned scratch indexed by canonical action.
 */
export function publishBranch(events, workerId, parentQ, parentGeneration, mask,
  retainedAction, maximizing, runToken, childQ, childGeneration, childEval, childBase = 0) {
  const write = Atomics.load(events.branchWrite, workerId);
  const read = Atomics.load(events.branchRead, workerId);
  if ((write - read) >= events.branchCapacity) throw new Error('ISOMAX_BRANCH_DESCRIPTOR_CAPACITY');
  const local = write & (events.branchCapacity - 1);
  const slot = workerId * events.branchCapacity + local;
  events.branchParentQ[slot] = parentQ;
  events.branchParentGeneration[slot] = parentGeneration;
  events.branchMask[slot] = mask;
  events.branchRetainedAction[slot] = retainedAction;
  events.branchMaximizing[slot] = maximizing ? 1 : 0;
  events.branchRunToken[slot] = runToken;
  const base = slot * MAX_ACTIONS;
  for (let action = 0; action < MAX_ACTIONS; action++) {
    events.branchChildQ[base + action] = childQ[childBase + action];
    events.branchChildGeneration[base + action] = childGeneration[childBase + action];
    events.branchChildEval[base + action] = childEval[childBase + action];
  }
  Atomics.store(events.branchWrite, workerId, write + 1);
  return slot;
}

/** Manager-only consumer. out header: parentQ,parentGen,mask,retained,maximizing,runToken,slot. */
export function consumeBranch(events, workerId, out, childQ, childGeneration, childEval) {
  const read = Atomics.load(events.branchRead, workerId);
  if (read === Atomics.load(events.branchWrite, workerId)) return false;
  const local = read & (events.branchCapacity - 1);
  const slot = workerId * events.branchCapacity + local;
  out[0] = events.branchParentQ[slot];
  out[1] = events.branchParentGeneration[slot];
  out[2] = events.branchMask[slot];
  out[3] = events.branchRetainedAction[slot];
  out[4] = events.branchMaximizing[slot];
  out[5] = events.branchRunToken[slot];
  out[6] = slot;
  const base = slot * MAX_ACTIONS;
  for (let action = 0; action < MAX_ACTIONS; action++) {
    childQ[action] = events.branchChildQ[base + action];
    childGeneration[action] = events.branchChildGeneration[base + action];
    childEval[action] = events.branchChildEval[base + action];
  }
  Atomics.store(events.branchRead, workerId, read + 1);
  return true;
}

export function publishEvent(events, workerId, kind, qIndex, generation, value = 0, aux = 0) {
  const write = Atomics.load(events.eventWrite, workerId);
  const read = Atomics.load(events.eventRead, workerId);
  if ((write - read) >= events.eventCapacity) throw new Error('ISOMAX_WORKER_EVENT_CAPACITY');
  const local = write & (events.eventCapacity - 1);
  const slot = workerId * events.eventCapacity + local;
  events.eventKind[slot] = kind;
  events.eventQ[slot] = qIndex;
  events.eventGeneration[slot] = generation;
  events.eventValue[slot] = value;
  events.eventAux[slot] = aux;
  Atomics.store(events.eventWrite, workerId, write + 1);
  return slot;
}

/** Manager-only consumer. out: kind,qIndex,generation,value,aux. */
export function consumeEvent(events, workerId, out) {
  const read = Atomics.load(events.eventRead, workerId);
  if (read === Atomics.load(events.eventWrite, workerId)) return false;
  const local = read & (events.eventCapacity - 1);
  const slot = workerId * events.eventCapacity + local;
  out[0] = events.eventKind[slot];
  out[1] = events.eventQ[slot];
  out[2] = events.eventGeneration[slot];
  out[3] = events.eventValue[slot];
  out[4] = events.eventAux[slot];
  Atomics.store(events.eventRead, workerId, read + 1);
  return true;
}

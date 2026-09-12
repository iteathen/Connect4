import { assertTacticalCode } from './quotient-negamax-domain-contract.mjs';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

export function buildSharedQuotientGraph(spec, options = {}) {
  if (!spec || typeof spec !== 'object') throw new TypeError('shared quotient graph requires a domain spec');
  const maxStates = options.maxStates ?? 2_000_000;
  if (!Number.isInteger(maxStates) || maxStates < 1) throw new RangeError('shared quotient graph maxStates must be positive');

  const { kernel } = createSlot64ResidualQuotientKernel(spec, {
    cacheEdges: true,
    prefixClasses: options.prefixClasses ?? 4096,
  });

  for (let stateId = 0; stateId < kernel.states.count; stateId += 1) {
    if (kernel.states.count > maxStates) {
      throw new Error(`shared quotient graph exceeded bounded state capacity ${maxStates}`);
    }
    for (let column = 0; column < spec.columns; column += 1) kernel.advance(stateId, column);
  }
  if (kernel.states.count > maxStates) throw new Error(`shared quotient graph exceeded bounded state capacity ${maxStates}`);

  const stateCount = kernel.states.count;
  const edgeCount = stateCount * spec.columns;
  if (!Number.isSafeInteger(edgeCount) || edgeCount < 1) throw new RangeError('shared quotient graph edge count overflow');
  const edgeBytes = Int32Array.BYTES_PER_ELEMENT * edgeCount;
  const tacticalBytes = Int16Array.BYTES_PER_ELEMENT * stateCount;
  const rankBytes = Uint8Array.BYTES_PER_ELEMENT * stateCount;
  if (![edgeBytes, tacticalBytes, rankBytes].every(Number.isSafeInteger)) {
    throw new RangeError('shared quotient graph buffer size overflow');
  }

  const edgeBuffer = new SharedArrayBuffer(edgeBytes);
  const edges = new Int32Array(edgeBuffer);
  if (!(kernel.states.edges instanceof Int32Array) || kernel.states.edges.length < edgeCount) {
    throw new Error('shared quotient graph edge cache is incomplete');
  }
  edges.set(kernel.states.edges.subarray(0, edgeCount));

  const tacticalBuffer = new SharedArrayBuffer(tacticalBytes);
  const tactical = new Int16Array(tacticalBuffer);
  const rankBuffer = new SharedArrayBuffer(rankBytes);
  const ranks = new Uint8Array(rankBuffer);
  for (let stateId = 0; stateId < stateCount; stateId += 1) {
    const code = kernel.tacticalCode(stateId);
    assertTacticalCode(code, spec.columns);
    tactical[stateId] = code;
    const rank = kernel.supportAccess.rankAt(kernel.states.support[stateId]);
    if (!Number.isInteger(rank) || rank < 0 || rank > kernel.cellCount) {
      throw new Error(`shared quotient graph rank drift at state ${stateId}: ${rank}`);
    }
    ranks[stateId] = rank;
  }

  return Object.freeze({
    kind: 'connect4-shared-precompiled-quotient-graph-v1',
    spec: Object.freeze({ columns: spec.columns, rows: spec.rows, connect: spec.connect }),
    rootId: kernel.rootId,
    stateCount,
    edgeCount,
    residualClassCount: kernel.classes.size,
    centerOrder: Object.freeze([...kernel.centerOrder]),
    edgeBuffer,
    tacticalBuffer,
    rankBuffer,
  });
}

#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT_SEQUENCE = '466565554644';
const C = 2, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const d of seq) {
    const next = kernel.advance(id, Number(d) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${seq}`);
    id = next;
  }
  return id;
}

function hasCell([lo, hi], cell) {
  return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0);
}
function cellsOf(term) {
  const out = [];
  for (let cell = 0; cell < 42; cell++) if (hasCell(term, cell)) out.push(cell);
  return out;
}
function terms(kernel, id, player) {
  const classId = player === 0 ? kernel.states.p0At(id) : kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(cellsOf);
}
function hasSingleton(kernel, id, cell) {
  return terms(kernel, id, 0).some((term) => term.length === 1 && term[0] === cell);
}
function rank(kernel, id) {
  return kernel.supportAccess.rankAt(kernel.states.supportAt(id));
}
function coord(col, rowOneBased) {
  return `${String.fromCharCode(65 + col)}${rowOneBased}`;
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const root = replay(kernel, ROOT_SEQUENCE);
assert.equal(rank(kernel, root), 12);
assert.equal(hasSingleton(kernel, root, C3), true);
assert.equal(hasSingleton(kernel, root, G3), true);

const initialStutters = [];
const initialHeights = [0, 0, 0, 4, 4, 4, 0];
for (const col of [0, 1, 3, 4, 5]) {
  const lowerRow = initialHeights[col] + 1;
  const upperRow = lowerRow + 1;
  const afterP0 = kernel.advance(root, col);
  if (afterP0 === domain.QN_TERMINAL_WIN) {
    initialStutters.push({ column: col + 1, lower: coord(col, lowerRow), upper: coord(col, upperRow), status: 'P0_terminal_on_trigger' });
    continue;
  }
  assert(afterP0 >= 0);
  const afterP1 = kernel.advance(afterP0, col);
  if (afterP1 === domain.QN_TERMINAL_WIN) {
    initialStutters.push({ column: col + 1, lower: coord(col, lowerRow), upper: coord(col, upperRow), status: 'P1_terminal_on_response' });
    continue;
  }
  assert(afterP1 >= 0);
  initialStutters.push({
    column: col + 1,
    lower: coord(col, lowerRow),
    upper: coord(col, upperRow),
    status: 'exact_stutter_for_latent_targets',
    supportRankDelta: rank(kernel, afterP1) - rank(kernel, root),
    phaseDisplacementMod2: 0,
    C3StillLive: hasSingleton(kernel, afterP1, C3),
    G3StillLive: hasSingleton(kernel, afterP1, G3),
  });
}

for (const x of initialStutters.filter((x) => x.status === 'exact_stutter_for_latent_targets')) {
  assert.equal(x.supportRankDelta, 2);
  assert.equal(x.C3StillLive, true);
  assert.equal(x.G3StillLive, true);
}

function tailCase(name, prefix, resolvedCol, remainingTargetCell) {
  const start = replay(kernel, ROOT_SEQUENCE + prefix);
  assert.equal(rank(kernel, start), 16);
  assert.equal(hasSingleton(kernel, start, remainingTargetCell), true, `${name}: remaining singleton drift`);

  const row4 = kernel.advance(start, resolvedCol);
  if (row4 === domain.QN_TERMINAL_WIN) return { name, status: 'P0_terminal_on_tail4' };
  assert(row4 >= 0);

  const row5 = kernel.advance(row4, resolvedCol);
  if (row5 === domain.QN_TERMINAL_WIN) {
    return {
      name,
      status: 'P1_terminal_on_tail5',
      tailPair: [coord(resolvedCol, 4), coord(resolvedCol, 5)],
    };
  }
  assert(row5 >= 0);
  const singletonAfterPair = hasSingleton(kernel, row5, remainingTargetCell);

  const row6 = kernel.advance(row5, resolvedCol);
  const p0TerminalOnOddTail = row6 === domain.QN_TERMINAL_WIN;
  if (!p0TerminalOnOddTail) assert(row6 >= 0);

  return {
    name,
    status: 'tail_pair_plus_odd_event',
    tailPair: [coord(resolvedCol, 4), coord(resolvedCol, 5)],
    pairRankDelta: rank(kernel, row5) - rank(kernel, start),
    pairPhaseDisplacementMod2: 0,
    remainingSingletonAfterPair: singletonAfterPair,
    oddTailEvent: coord(resolvedCol, 6),
    oddTailEventPlayer: 'P0',
    p0TerminalOnOddTail,
    remainingSingletonAfterOddTail: p0TerminalOnOddTail ? null : hasSingleton(kernel, row6, remainingTargetCell),
  };
}

const tails = [
  tailCase('C_resolved_P0_owned_C1', '3733', C, G3),
  tailCase('C_resolved_P1_owned_C1', '7333', C, G3),
  tailCase('G_resolved_P1_owned_G1', '3777', G, C3),
  tailCase('G_resolved_P0_owned_G1', '7377', G, C3),
];

console.log(`TEMPORAL_STUTTER_TAIL_CONTROL=${JSON.stringify({
  kind: 'standard7x6-temporal-contract-stutter-tail-v1',
  attribution: {
    researchDirectionInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT_SEQUENCE,
  initialStutters,
  tails,
  exactStutterDefinition: 'two-ply macro leaves C/G support coordinates unchanged, returns P0 to move, has zero column-phase displacement, preserves both live singleton facts, and contains no terminal P0 move',
  theoremBoundary: 'Initial stutter classification is exact only at the fixed latent-contract state. Tail controls classify the immediate C4/C5 or G4/G5 pair and following row-6 event after one target is discharged. They do not prove arbitrary continuation safety after the odd tail event.',
  authority: 'Pure C4-0010 transitions/residuals plus exact support rank. No solved W/D/L labels and no recursive q-frontier search.',
})}`);

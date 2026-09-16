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
function columnName(col) { return String.fromCharCode(65 + col); }

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

function phaseDebtCase(name, prefix, resolvedCol, remainingCol, remainingTarget) {
  let id = replay(kernel, ROOT_SEQUENCE + prefix);
  assert.equal(rank(kernel, id), 16);
  assert.equal(hasSingleton(kernel, id, remainingTarget), true);

  // Consume resolved target's upper tail as P0 row4, P1 row5, P0 row6.
  for (const expectedPlayer of [0, 1, 0]) {
    const next = kernel.advance(id, resolvedCol);
    if (next === domain.QN_TERMINAL_WIN) throw new Error(`${name}: unexpected terminal in tail by P${expectedPlayer}`);
    assert(next >= 0);
    id = next;
  }
  assert.equal(rank(kernel, id), 19);
  assert.equal(hasSingleton(kernel, id, remainingTarget), true);

  // It is now P1 to move. Enumerate exactly one repair/skip action.
  const options = [];
  for (let col = 0; col < 7; col++) {
    const next = kernel.advance(id, col);
    if (next === domain.QN_TERMINAL_WIN) {
      options.push({ column: col + 1, name: columnName(col), status: 'P1_terminal_safe' });
      continue;
    }
    if (!Number.isSafeInteger(next) || next < 0) {
      options.push({ column: col + 1, name: columnName(col), status: 'illegal_or_full' });
      continue;
    }

    const singletonLive = hasSingleton(kernel, next, remainingTarget);
    let p0TargetTerminalNext = false;
    const targetAttempt = kernel.advance(next, remainingCol);
    if (targetAttempt === domain.QN_TERMINAL_WIN) p0TargetTerminalNext = true;

    options.push({
      column: col + 1,
      name: columnName(col),
      status: p0TargetTerminalNext ? 'poisoned_middle_support' : 'one_slot_phase_debt_repair_candidate',
      singletonLive,
      returnsP0ToMove: true,
      remainingTargetColumnUntouched: col !== remainingCol,
    });
  }

  const poisoned = options.filter((x) => x.status === 'poisoned_middle_support');
  const repairs = options.filter((x) => x.status === 'one_slot_phase_debt_repair_candidate' || x.status === 'P1_terminal_safe');
  assert.equal(poisoned.some((x) => x.column === remainingCol + 1), true, `${name}: remaining middle support not poisoned`);
  assert.equal(repairs.length > 0, true, `${name}: no local phase-debt repair candidate`);

  return {
    name,
    resolvedColumn: columnName(resolvedCol),
    remainingTarget: columnName(remainingCol) + '3',
    phaseDebtAfterOddTail: 1,
    options,
    repairOptionCount: repairs.length,
  };
}

const cases = [
  phaseDebtCase('C_resolved_P0_owned_C1', '3733', C, G, G3),
  phaseDebtCase('C_resolved_P1_owned_C1', '7333', C, G, G3),
  phaseDebtCase('G_resolved_P1_owned_G1', '3777', G, C, C3),
  phaseDebtCase('G_resolved_P0_owned_G1', '7377', G, C, C3),
];

console.log(`TAIL_PHASE_DEBT_CONTROL=${JSON.stringify({
  kind: 'standard7x6-tail-phase-debt-one-slot-interface-v1',
  attribution: {
    researchDirectionInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT_SEQUENCE,
  cases,
  interpretation: 'After target discharge, tail pair C4/C5 or G4/G5 is stutter-like and the unmatched P0 row6 event leaves one unit of turn-phase debt for the remaining latent target. The remaining target-column middle move is poisoned for P1; any separately qualified non-target repair candidate spends one P1 slot and returns P0 to move with the target still latent.',
  theoremBoundary: 'This is a one-response interface control only. A listed repair candidate is safe for the remaining latent-target observation at this step; it is not automatically compatible with every other active WSL/CPC/NDC obligation.',
  authority: 'Pure C4-0010 transitions/residuals. No solved W/D/L labels and no recursive q-frontier search.',
})}`);

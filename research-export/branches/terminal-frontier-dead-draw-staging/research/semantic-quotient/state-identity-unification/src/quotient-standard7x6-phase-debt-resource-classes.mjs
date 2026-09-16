#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const REPAIRS = [0, 1, 3, 4, 5]; // A,B,D,E,F

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const d of seq) {
    const next = kernel.advance(id, Number(d) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${seq}`);
    id = next;
  }
  return id;
}
function heightsOf(seq) {
  const h = Array(7).fill(0);
  for (const d of seq) h[Number(d) - 1]++;
  return h;
}
function phase(h) { return h.map((x) => x & 1).join(''); }
function coord(col, rowOneBased) { return `${String.fromCharCode(65 + col)}${rowOneBased}`; }
function colName(col) { return String.fromCharCode(65 + col); }
function hasCell([lo, hi], cell) {
  return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0);
}
function cellsOf(term) {
  const out = [];
  for (let cell = 0; cell < 42; cell++) if (hasCell(term, cell)) out.push(cell);
  return out;
}
function key(term) { return term.map((cell) => coord(cell % 7, Math.floor(cell / 7) + 1)).join('-'); }
function terms(kernel, id, player) {
  const classId = player === 0 ? kernel.states.p0At(id) : kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(cellsOf);
}
function hasSingleton(kernel, id, cell) {
  return terms(kernel, id, 0).some((term) => term.length === 1 && term[0] === cell);
}
function sizeProfile(ts) {
  const out = {};
  for (const t of ts) out[t.length] = (out[t.length] ?? 0) + 1;
  return out;
}
function difference(before, after) {
  const aset = new Set(after.map(key));
  return before.filter((t) => !aset.has(key(t)));
}
function changedOwnProfile(before, after) {
  return { before: sizeProfile(before), after: sizeProfile(after), countDelta: after.length - before.length };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const cases = [
  { name: 'C_resolved_P0_owned_C1', prefix: '3733', resolved: C, remaining: G, target: G3 },
  { name: 'C_resolved_P1_owned_C1', prefix: '7333', resolved: C, remaining: G, target: G3 },
  { name: 'G_resolved_P1_owned_G1', prefix: '3777', resolved: G, remaining: C, target: C3 },
  { name: 'G_resolved_P0_owned_G1', prefix: '7377', resolved: G, remaining: C, target: C3 },
];

const rows = [];
for (const c of cases) {
  const tailDigits = String(c.resolved + 1).repeat(3);
  const seq = ROOT + c.prefix + tailDigits;
  const beforeId = replay(kernel, seq);
  const beforeH = heightsOf(seq);
  assert.equal(seq.length, 19);
  assert.equal(hasSingleton(kernel, beforeId, c.target), true);
  const p0Before = terms(kernel, beforeId, 0);
  const p1Before = terms(kernel, beforeId, 1);

  for (const repairCol of REPAIRS) {
    const landingRow = beforeH[repairCol] + 1;
    const afterId = kernel.advance(beforeId, repairCol);
    if (!Number.isSafeInteger(afterId) || afterId < 0) throw new Error(`${c.name}:${colName(repairCol)} repair not nonterminal/legal`);
    const afterH = beforeH.slice(); afterH[repairCol]++;
    const p0After = terms(kernel, afterId, 0);
    const p1After = terms(kernel, afterId, 1);
    const eliminated = difference(p0Before, p0After);
    assert.equal(hasSingleton(kernel, afterId, c.target), true);

    const remainingCapacity = 6 - afterH[repairCol];
    const supportClass = remainingCapacity === 5 ? 'ODD_CHAIN_5' : remainingCapacity === 1 ? 'ODD_TAIL_1' : `ODD_CHAIN_${remainingCapacity}`;
    const newlyPlayable = remainingCapacity > 0 ? coord(repairCol, afterH[repairCol] + 1) : null;

    let sameColumnFollow = null;
    if (remainingCapacity > 0) {
      const p0next = kernel.advance(afterId, repairCol);
      if (p0next === domain.QN_TERMINAL_WIN) {
        sameColumnFollow = { p0Advance: newlyPlayable, status: 'P0_terminal' };
      } else {
        assert(p0next >= 0);
        const afterP0H = afterH.slice(); afterP0H[repairCol]++;
        if (afterP0H[repairCol] < 6) {
          const p1Landing = coord(repairCol, afterP0H[repairCol] + 1);
          const p1next = kernel.advance(p0next, repairCol);
          sameColumnFollow = {
            p0Advance: newlyPlayable,
            p1CandidateResponse: p1Landing,
            status: p1next === domain.QN_TERMINAL_WIN ? 'P1_terminal_response' : (p1next >= 0 ? 'nonterminal_same_column_response' : 'invalid_response'),
          };
        } else {
          sameColumnFollow = { p0Advance: newlyPlayable, status: 'column_exhausted_after_P0' };
        }
      }
    }

    rows.push({
      case: c.name,
      remainingTarget: coord(c.remaining, 3),
      repairColumn: colName(repairCol),
      repairLanding: coord(repairCol, landingRow),
      phaseBefore: phase(beforeH),
      phaseAfter: phase(afterH),
      supportClass,
      remainingCapacity,
      newlyPlayable,
      p0RequirementsEliminatedByRepair: eliminated.map(key),
      p0EliminatedSizeProfile: sizeProfile(eliminated),
      p1ResidualChange: changedOwnProfile(p1Before, p1After),
      remainingTargetSingletonLive: true,
      sameColumnFollow,
    });
  }
}

function coarseKey(row) {
  return JSON.stringify({
    supportClass: row.supportClass,
    remainingCapacity: row.remainingCapacity,
    p0EliminatedSizeProfile: row.p0EliminatedSizeProfile,
    p1CountDelta: row.p1ResidualChange.countDelta,
    sameColumnStatus: row.sameColumnFollow?.status ?? null,
  });
}
const coarseGroups = new Map();
for (const row of rows) {
  const k = coarseKey(row);
  if (!coarseGroups.has(k)) coarseGroups.set(k, []);
  coarseGroups.get(k).push(`${row.case}:${row.repairColumn}`);
}

console.log(`PHASE_DEBT_RESOURCE_CLASSES=${JSON.stringify({
  kind: 'standard7x6-phase-debt-resource-classification-v1',
  attribution: {
    researchDirectionInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  supportPrediction: {
    AB: 'ODD_CHAIN_5',
    DEF: 'ODD_TAIL_1',
  },
  rows,
  coarseGroups: [...coarseGroups.entries()].map(([signature, members]) => ({ signature: JSON.parse(signature), members })),
  theoremBoundary: 'ODD_CHAIN_5 versus ODD_TAIL_1 is exact at the E/P support-phase layer. Coarse groups include limited WSL/P1-residual observations but are not proof of full C/N contract equivalence. Exact location-specific eliminated requirements are retained to expose where the coarse quotient fails.',
  authority: 'Pure C4-0010 transitions/residuals and support arithmetic. No solved W/D/L labels and no recursive q-frontier search.',
})}`);

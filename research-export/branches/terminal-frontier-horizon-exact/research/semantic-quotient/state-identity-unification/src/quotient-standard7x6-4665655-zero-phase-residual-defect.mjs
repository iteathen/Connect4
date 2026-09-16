#!/usr/bin/env node
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const SEQUENCE = '4665655546';

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function heights(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) {
    const cell = kernel.supportAccess.landingAt(support, c);
    out.push(cell === 0xff ? DOMAIN.rows : Math.floor(cell / DOMAIN.columns));
  }
  return out;
}
function hasCell([lo, hi], cell) {
  return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0);
}
function cellsOf(term) {
  const out = [];
  for (let cell = 0; cell < DOMAIN.columns * DOMAIN.rows; cell += 1) if (hasCell(term, cell)) out.push(cell);
  return out;
}
function coord(cell) {
  return { cell, column: (cell % DOMAIN.columns) + 1, row: Math.floor(cell / DOMAIN.columns) + 1 };
}
function terms(kernel, stateId, player) {
  const classId = player === 0 ? kernel.states.p0At(stateId) : kernel.states.p1At(stateId);
  return kernel.classes.terms(classId).map(cellsOf);
}
function termKey(term) { return [...term].sort((a,b)=>a-b).join('.'); }
function subsetsOfSize(items, size, start = 0, prefix = [], out = []) {
  if (prefix.length === size) { out.push([...prefix]); return out; }
  for (let i = start; i <= items.length - (size - prefix.length); i += 1) {
    prefix.push(items[i]); subsetsOfSize(items, size, i + 1, prefix, out); prefix.pop();
  }
  return out;
}
function hitsAll(candidate, requirements) {
  const set = new Set(candidate);
  return requirements.every(req => req.some(cell => set.has(cell)));
}
function minimalHitters(requirements, maxSize = 4) {
  const universe = [...new Set(requirements.flat())].sort((a,b)=>a-b);
  const found = [];
  for (let size = 1; size <= Math.min(maxSize, universe.length); size += 1) {
    for (const candidate of subsetsOfSize(universe, size)) {
      if (!hitsAll(candidate, requirements)) continue;
      if (found.some(prev => prev.every(x => candidate.includes(x)))) continue;
      found.push(candidate);
    }
  }
  return found;
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const stateId = replay(kernel, SEQUENCE);
const h = heights(kernel, stateId);
const phase = h.map(x => x & 1);
if (phase.some(Boolean)) throw new Error(`expected zero phase, got ${phase}`);

const p0 = terms(kernel, stateId, 0);
const responseMask = new Set();
for (let row0 = 1; row0 < DOMAIN.rows; row0 += 2) {
  for (let col0 = 0; col0 < DOMAIN.columns; col0 += 1) responseMask.add(row0 * DOMAIN.columns + col0);
}
const covered = p0.filter(term => term.some(cell => responseMask.has(cell)));
const uncovered = p0.filter(term => !term.some(cell => responseMask.has(cell)));
const hitterSets = minimalHitters(uncovered, 4);

function baseOwnerRelativeToP0(cell) {
  const row0 = Math.floor(cell / DOMAIN.columns);
  const ply = SEQUENCE.length;
  const N = (DOMAIN.columns - 1) * DOMAIN.rows - ply + row0 + 1;
  return ((N - 1) & 1) === 0 ? 'P0' : 'P1';
}

const uncoveredRows = uncovered.map(term => ({
  key: termKey(term),
  size: term.length,
  cells: term.map(coord),
  baseOwners: term.map(baseOwnerRelativeToP0),
  allBaseP0Owned: term.every(cell => baseOwnerRelativeToP0(cell) === 'P0'),
}));

const candidateCells = [...new Set(uncovered.flat())].sort((a,b)=>a-b).map(cell => ({
  ...coord(cell),
  currentlyPlayable: (() => {
    const c = cell % DOMAIN.columns, r = Math.floor(cell / DOMAIN.columns);
    return h[c] === r;
  })(),
  baseOwner: baseOwnerRelativeToP0(cell),
  incidenceInUncovered: uncovered.filter(term => term.includes(cell)).length,
}));

console.log(`ZERO_PHASE_RESIDUAL_DEFECT=${JSON.stringify({
  kind: 'standard7x6-46656555-46-zero-phase-residual-defect-v1',
  attribution: {
    researchDirectionInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  sequence: SEQUENCE,
  supportRank: SEQUENCE.length,
  heights: h,
  phase,
  pairedResponseMaskRowsOneBased: [2,4,6],
  p0ResidualCount: p0.length,
  pairedResponseCoveredCount: covered.length,
  pairedResponseUncoveredCount: uncovered.length,
  uncoveredRequirements: uncoveredRows,
  uncoveredCandidateCells: candidateCells,
  staticMinimalHittersUpTo4: hitterSets.map(set => set.map(coord)),
  theoremBoundary: {
    responseMask: 'At this zero-phase P0-to-move support, vertical P1 follow-up pairs give P1 the upper cell of each remaining two-event column pair, i.e. one-based rows 2,4,6.',
    defectMeaning: 'A P0 residual missing the response mask is not blocked by the qualified vertical paired-response theorem. Static hitters are target obligations only; they are not certified strategic blockers.',
    cpcObservation: 'Base CPC ownership is reported only as a zero-reservation parity fact; reservations, deadlines and response policies may change strategic ownership and must remain explicit.',
  },
  authority: 'Pure C4-0010 residual/support state. No external W/D/L values and no recursive search.',
})}`);

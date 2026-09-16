#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CENTER_ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));
const PONS_INVALID_MOVE = -1000;

function env(name) { const value = process.env[name]; if (!value) throw new Error(`${name} is required`); return value; }
function runCensus() {
  const child = spawnSync(process.execPath, [CENSUS], { env: process.env, encoding: 'utf-8', timeout: 20 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`census failed: ${(child.stderr ?? '').slice(-8000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find(value => value.startsWith('PROOF_FRONTIER_CENSUS='));
  if (!line) throw new Error('missing PROOF_FRONTIER_CENSUS');
  return JSON.parse(line.slice('PROOF_FRONTIER_CENSUS='.length));
}
function parsePons(sequence, line) {
  const fields = line.trim().split(/\s+/);
  const scores = sequence.length === 0 ? fields : fields[0] === sequence ? fields.slice(1) : null;
  if (!scores || scores.length !== 7) throw new Error(`invalid Pons line ${sequence}: ${line}`);
  return scores.map(Number);
}
function analyze(sequences) {
  const child = spawnSync(env('PONS_SOLVER_PATH'), ['-a', '-b', env('PONS_BOOK_PATH')], { input: `${sequences.join('\n')}\n`, encoding: 'utf-8', timeout: 120000, maxBuffer: Math.max(2 * 1048576, sequences.length * 256) });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Pons failed: ${(child.stderr ?? '').slice(-8000)}`);
  const lines = child.stdout.split(/\r?\n/).filter(Boolean);
  if (lines.length !== sequences.length) throw new Error(`Pons lines ${lines.length} != ${sequences.length}`);
  return sequences.map((sequence, index) => parsePons(sequence, lines[index]));
}
function choose(scores, sequence) {
  let bestScore = -Infinity, bestColumn = -1;
  for (const column of CENTER_ORDER) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE) continue;
    if (score > bestScore) { bestScore = score; bestColumn = column; }
  }
  if (bestColumn < 0 || bestScore <= 0) throw new Error(`no winning witness at ${sequence}`);
  return { column: bestColumn, score: bestScore };
}
function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function rank(kernel, stateId) { const support = kernel.states.supportAt(stateId); return kernel.supportAccess.rankAt(support); }
function legal(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), result = [];
  for (let column = 0; column < 7; column += 1) if (kernel.supportAccess.landingAt(support, column) !== 0xff) result.push(column);
  return result;
}
function landingRow(kernel, stateId, column) {
  const landing = kernel.supportAccess.landingAt(kernel.states.supportAt(stateId), column);
  return landing === 0xff ? -1 : Math.floor(landing / 7);
}
const immediateMemo = new Map(), overloadMemo = new Map(), shallowMemo = new Map();
function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 0) for (const column of legal(kernel, stateId)) if (kernel.advance(stateId, column) === domain.QN_TERMINAL_WIN) { value = true; break; }
  immediateMemo.set(stateId, value); return value;
}
function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 1) {
    const moves = legal(kernel, stateId); value = moves.length > 0;
    for (const column of moves) { const child = kernel.advance(stateId, column); if (child < 0 || !immediate(kernel, child)) { value = false; break; } }
  }
  overloadMemo.set(stateId, value); return value;
}
function shallow(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else for (const column of legal(kernel, stateId)) { const child = kernel.advance(stateId, column); if (child >= 0 && overload(kernel, child)) { value = 'E(O)'; break; } }
  shallowMemo.set(stateId, value); return value;
}
function localProof(kernel, stateId) {
  if (immediate(kernel, stateId)) return true;
  if (shallow(kernel, stateId) === 'E(O)') return true;
  for (const rootColumn of legal(kernel, stateId)) {
    const defender = kernel.advance(stateId, rootColumn); if (defender < 0) continue;
    let valid = true;
    for (const reply of legal(kernel, defender)) { const attacker = kernel.advance(defender, reply); if (attacker < 0 || shallow(kernel, attacker) === 'H') { valid = false; break; } }
    if (valid) return true;
  }
  return false;
}
function popcount32(value) { let x = value >>> 0; x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; }
function termSize(term) { return popcount32(term[0]) + popcount32(term[1]); }
function sizeHist(terms) { const bins = [0,0,0,0,0]; for (const term of terms) bins[termSize(term)] += 1; return bins.join('.'); }
function supportHeights(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), heights = [];
  for (let c = 0; c < 7; c += 1) { const cell = kernel.supportAccess.landingAt(support, c); heights.push(cell === 0xff ? 6 : Math.floor(cell / 7)); }
  return heights;
}
function canonicalHeights(heights) { const a = heights.join('.'), b = [...heights].reverse().join('.'); return a <= b ? a : b; }
function profile(kernel, stateId) {
  const p0 = kernel.classes.terms(kernel.states.p0At(stateId));
  const p1 = kernel.classes.terms(kernel.states.p1At(stateId));
  return `${canonicalHeights(supportHeights(kernel, stateId))}|0:${sizeHist(p0)}|1:${sizeHist(p1)}`;
}
function inc(map, key) { map.set(key, (map.get(key) ?? 0) + 1); }
function object(map) { return Object.fromEntries([...map.entries()].sort((a,b) => String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true }))); }

const census = runCensus();
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, { cacheEdges: true, prefixClasses: 4096, responseClosure: true, searchStorage: Object.freeze({ states: 1048576, classes: 1048576, chunksPerSlot: 262144 }) });
kernel.prepareSearchStorage();
const unresolved = [];
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (immediate(kernel, stateId) || localProof(kernel, stateId)) continue;
  unresolved.push({ stateId, sequence: representative.sequence });
}
if (unresolved.length !== 723) throw new Error(`expected 723 unresolved, got ${unresolved.length}`);
const scores = analyze(unresolved.map(row => row.sequence));
const oneHard = [], distanceHist = new Map(), pairHist = new Map(), rowPairHist = new Map(), selectedHist = new Map(), replyHist = new Map(), profileBuckets = new Map();
let sameColumn = 0;
for (let i = 0; i < unresolved.length; i += 1) {
  const root = unresolved[i], witness = choose(scores[i], root.sequence);
  const selectedRow = landingRow(kernel, root.stateId, witness.column);
  const defender = kernel.advance(root.stateId, witness.column);
  const hard = [];
  for (const reply of legal(kernel, defender)) {
    const attacker = kernel.advance(defender, reply);
    if (attacker < 0) throw new Error(`terminal defender reply under winning witness ${root.sequence}`);
    if (shallow(kernel, attacker) === 'H') hard.push({ reply, attacker, replyRow: landingRow(kernel, defender, reply) });
  }
  if (hard.length !== 1) continue;
  const item = hard[0], distance = Math.abs(witness.column - item.reply);
  if (distance === 0) sameColumn += 1;
  inc(distanceHist, distance); inc(pairHist, `${witness.column + 1}->${item.reply + 1}`); inc(rowPairHist, `${selectedRow}->${item.replyRow}`); inc(selectedHist, witness.column + 1); inc(replyHist, item.reply + 1);
  const key = profile(kernel, item.attacker);
  let bucket = profileBuckets.get(key); if (!bucket) { bucket = []; profileBuckets.set(key, bucket); } bucket.push(root.sequence);
  oneHard.push({ sequence: root.sequence, selectedMove: witness.column + 1, hardReply: item.reply + 1, distance, selectedRow: selectedRow + 1, replyRow: item.replyRow + 1, hardState: item.attacker, profile: key });
}
const topProfiles = [...profileBuckets.entries()].map(([key, sequences]) => ({ key, states: sequences.length, examples: sequences.slice(0, 12) })).sort((a,b) => b.states - a.states || a.key.localeCompare(b.key)).slice(0, 30);
console.log(`ONE_HARD_GEOMETRY=${JSON.stringify({
  kind: 'standard7x6-depth8-one-hard-geometry-v1',
  attribution: { researchDirectionAndStructuralTarget: 'Josh Oshiro', formalizationImplementationAndQualification: 'OpenAI ChatGPT' },
  unresolvedRoots: unresolved.length,
  oneHardRoots: oneHard.length,
  sameColumnStackResponses: sameColumn,
  sameColumnFraction: sameColumn / Math.max(1, oneHard.length),
  selectedToHardDistanceHistogram: object(distanceHist),
  selectedToHardColumnPairHistogram: object(pairHist),
  selectedMoveHistogram: object(selectedHist),
  hardReplyHistogram: object(replyHist),
  landingRowPairHistogramOneBased: object(rowPairHist),
  supportPlusResidualSizeProfiles: profileBuckets.size,
  largestProfileSize: topProfiles[0]?.states ?? 0,
  topProfiles,
  examples: oneHard.slice(0, 60),
  materializedQStates: kernel.states.count,
  discoveryAuthority: 'Pons chooses only the canonical exact-winning root witness; all one-hard classification and structural profiles use C4-0010 transitions/residuals only.',
  theoremStatus: 'diagnostic only; no profile is asserted to be a proof equivalence or sufficient winning predicate'
})}`);

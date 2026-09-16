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
const MAX_FRONTIER_WIDTH = 16;
const MAX_FRONTIER_LAYERS = 8;

function requiredEnv(name) { const value = process.env[name]; if (!value) throw new Error(`${name} is required`); return value; }
function runCensus() {
  const child = spawnSync(process.execPath, [CENSUS], { env: process.env, encoding: 'utf-8', timeout: 20 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`proof-frontier census failed: ${(child.stderr ?? '').slice(-8000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find(value => value.startsWith('PROOF_FRONTIER_CENSUS='));
  if (!line) throw new Error('missing PROOF_FRONTIER_CENSUS');
  return JSON.parse(line.slice('PROOF_FRONTIER_CENSUS='.length));
}
function parsePonsLine(sequence, line) {
  const fields = line.trim().split(/\s+/);
  const scoreFields = sequence.length === 0 ? fields : fields[0] === sequence ? fields.slice(1) : null;
  if (!scoreFields || scoreFields.length !== DOMAIN.columns) throw new Error(`invalid Pons line for ${sequence}`);
  return scoreFields.map((field, column) => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) throw new RangeError(`invalid Pons score ${field} at ${sequence}/${column + 1}`);
    return score;
  });
}
function analyzeBatch(sequences) {
  if (!sequences.length) return [];
  const child = spawnSync(requiredEnv('PONS_SOLVER_PATH'), ['-a', '-b', requiredEnv('PONS_BOOK_PATH')], {
    input: `${sequences.join('\n')}\n`, encoding: 'utf-8', timeout: 120000, maxBuffer: Math.max(2 * 1048576, sequences.length * 256),
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Pons batch failed: ${(child.stderr ?? '').slice(-8000)}`);
  const lines = (child.stdout ?? '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length !== sequences.length) throw new Error(`Pons returned ${lines.length} lines for ${sequences.length} inputs`);
  return sequences.map((sequence, index) => parsePonsLine(sequence, lines[index]));
}
function choose(scores, sequence) {
  let bestScore = -Infinity, bestColumn = -1;
  for (const column of CENTER_ORDER) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE) continue;
    if (score > bestScore) { bestScore = score; bestColumn = column; }
  }
  if (bestColumn < 0 || bestScore <= 0) throw new Error(`no winning discovery witness at ${sequence}`);
  return { column: bestColumn, score: bestScore };
}
function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function rank(kernel, stateId) { return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId)); }
function legal(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) if (kernel.supportAccess.landingAt(support, c) !== 0xff) out.push(c);
  return out;
}
function heights(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) {
    const landing = kernel.supportAccess.landingAt(support, c);
    out.push(landing === 0xff ? DOMAIN.rows : Math.floor(landing / DOMAIN.columns));
  }
  return out;
}
function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}
function termKey(term) { return `${term[0] >>> 0}:${term[1] >>> 0}`; }
function termStats(terms) {
  const sizeHistogram = {};
  for (const [lo, hi] of terms) {
    const size = popcount32(lo) + popcount32(hi);
    sizeHistogram[size] = (sizeHistogram[size] ?? 0) + 1;
  }
  return { count: terms.length, sizeHistogram };
}
function stateDescriptor(kernel, stateId) {
  const p0Terms = kernel.classes.terms(kernel.states.p0At(stateId));
  const p1Terms = kernel.classes.terms(kernel.states.p1At(stateId));
  return { heights: heights(kernel, stateId), p0: termStats(p0Terms), p1: termStats(p1Terms), p0Terms, p1Terms };
}
function sharedTermCount(left, right) {
  const keys = new Set(left.map(termKey));
  let count = 0;
  for (const term of right) if (keys.has(termKey(term))) count += 1;
  return count;
}
function pairDescriptor(kernel, left, right) {
  const a = stateDescriptor(kernel, left.stateId), b = stateDescriptor(kernel, right.stateId);
  return {
    supportHeights: [a.heights, b.heights],
    sameP0Class: kernel.states.p0At(left.stateId) === kernel.states.p0At(right.stateId),
    sameP1Class: kernel.states.p1At(left.stateId) === kernel.states.p1At(right.stateId),
    p0TermStats: [a.p0, b.p0],
    p1TermStats: [a.p1, b.p1],
    sharedP0Terms: sharedTermCount(a.p0Terms, b.p0Terms),
    sharedP1Terms: sharedTermCount(a.p1Terms, b.p1Terms),
    p0SymmetricDifferenceTerms: a.p0Terms.length + b.p0Terms.length - 2 * sharedTermCount(a.p0Terms, b.p0Terms),
    p1SymmetricDifferenceTerms: a.p1Terms.length + b.p1Terms.length - 2 * sharedTermCount(a.p1Terms, b.p1Terms),
  };
}

const immediateMemo = new Map(), overloadMemo = new Map(), shallowMemo = new Map();
function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 0) for (const c of legal(kernel, stateId)) if (kernel.advance(stateId, c) === domain.QN_TERMINAL_WIN) { value = true; break; }
  immediateMemo.set(stateId, value); return value;
}
function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 1) {
    const moves = legal(kernel, stateId); value = moves.length > 0;
    for (const c of moves) { const child = kernel.advance(stateId, c); if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) { value = false; break; } }
  }
  overloadMemo.set(stateId, value); return value;
}
function shallow(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error('shallow requires P0-to-move');
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else for (const c of legal(kernel, stateId)) { const child = kernel.advance(stateId, c); if (child >= 0 && overload(kernel, child)) { value = 'E(O)'; break; } }
  shallowMemo.set(stateId, value); return value;
}
function localRank3Closed(kernel, stateId) {
  if (shallow(kernel, stateId) !== 'H') return true;
  for (const rootColumn of legal(kernel, stateId)) {
    const defender = kernel.advance(stateId, rootColumn); if (defender < 0) continue;
    let valid = true;
    for (const reply of legal(kernel, defender)) {
      const attacker = kernel.advance(defender, reply);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0 || shallow(kernel, attacker) === 'H') { valid = false; break; }
    }
    if (valid) return true;
  }
  return false;
}
function chosenStep(kernel, stateId, witnessColumn, sequence) {
  const defender = kernel.advance(stateId, witnessColumn);
  if (defender === domain.QN_TERMINAL_WIN) return [];
  if (defender < 0) throw new Error(`illegal chosen witness ${sequence}/${witnessColumn + 1}`);
  const hard = [];
  for (const reply of legal(kernel, defender)) {
    const attacker = kernel.advance(defender, reply);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) throw new Error(`winning witness permits terminal P1 reply ${sequence}/${witnessColumn + 1}/${reply + 1}`);
    if (shallow(kernel, attacker) === 'H') hard.push({ stateId: attacker, sequence: `${sequence}${witnessColumn + 1}${reply + 1}`, reply });
  }
  return hard;
}
function dedupe(nodes) { const map = new Map(); for (const node of nodes) if (!map.has(node.stateId)) map.set(node.stateId, node); return [...map.values()]; }

const census = runCensus();
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 1048576, classes: 1048576, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();

const roots = [];
for (const rep of census.representativeQuotientStates) {
  const stateId = replay(kernel, rep.sequence);
  if (!localRank3Closed(kernel, stateId)) roots.push({ stateId, sequence: rep.sequence });
}
if (roots.length !== 723) throw new Error(`expected 723 unresolved roots, got ${roots.length}`);

const rootScores = analyzeBatch(roots.map(x => x.sequence));
const binarySeeds = [];
for (let i = 0; i < roots.length; i += 1) {
  let current = roots[i], pairs = 0, score = rootScores[i];
  while (true) {
    const witness = choose(score, current.sequence);
    const hard = chosenStep(kernel, current.stateId, witness.column, current.sequence);
    pairs += 1;
    if (hard.length === 0) break;
    if (hard.length === 1) {
      current = hard[0];
      if (pairs >= 16) break;
      score = analyzeBatch([current.sequence])[0];
      continue;
    }
    if (hard.length === 2) binarySeeds.push({ rootSequence: roots[i].sequence, prefixPairs: pairs, witnessColumn: witness.column, witnessScore: witness.score, hard: dedupe(hard) });
    break;
  }
}
if (binarySeeds.length !== 13) throw new Error(`expected 13 binary seeds, got ${binarySeeds.length}`);

const records = [];
for (const seed of binarySeeds) {
  if (seed.hard.length !== 2) throw new Error(`binary seed q-normalized width drifted to ${seed.hard.length}`);
  let frontier = seed.hard;
  const widthHistory = [frontier.length];
  let status = 'depth-cap';
  let exactQNormalizationSavings = 0;
  const transitions = [];
  for (let layer = 0; layer < MAX_FRONTIER_LAYERS; layer += 1) {
    const scores = analyzeBatch(frontier.map(node => node.sequence));
    const raw = [];
    const nodeSteps = [];
    for (let i = 0; i < frontier.length; i += 1) {
      const node = frontier[i];
      if (shallow(kernel, node.stateId) !== 'H') { nodeSteps.push({ sequence: node.sequence, base: shallow(kernel, node.stateId), hardCount: 0 }); continue; }
      const witness = choose(scores[i], node.sequence);
      const hard = chosenStep(kernel, node.stateId, witness.column, node.sequence);
      raw.push(...hard);
      nodeSteps.push({ sequence: node.sequence, witness: witness.column + 1, hardCount: hard.length, hardReplyColumns: hard.map(x => x.reply + 1) });
    }
    const next = dedupe(raw);
    exactQNormalizationSavings += raw.length - next.length;
    transitions.push({ fromWidth: frontier.length, rawWidth: raw.length, toWidth: next.length, nodes: nodeSteps });
    widthHistory.push(next.length);
    if (next.length === 0) { status = 'closed'; frontier = next; break; }
    if (next.length > MAX_FRONTIER_WIDTH) { status = 'overflow'; frontier = next; break; }
    frontier = next;
  }
  const [left, right] = seed.hard;
  records.push({
    rootSequence: seed.rootSequence,
    prefixPairs: seed.prefixPairs,
    initialWitnessColumn: seed.witnessColumn + 1,
    initialWitnessScore: seed.witnessScore,
    initialHardReplyColumns: seed.hard.map(x => x.reply + 1),
    initialHardReplyDistance: Math.abs(seed.hard[0].reply - seed.hard[1].reply),
    initialHardRepliesMirrorPair: seed.hard[0].reply + seed.hard[1].reply === 6,
    pair: pairDescriptor(kernel, left, right),
    status,
    widthHistory,
    exactQNormalizationSavings,
    transitions,
  });
}
records.sort((a,b) => (a.status === b.status ? a.rootSequence.localeCompare(b.rootSequence) : a.status.localeCompare(b.status)));
const overflow = records.filter(x => x.status === 'overflow');
const closed = records.filter(x => x.status === 'closed');
if (closed.length !== 12 || overflow.length !== 1) throw new Error(`expected 12 closed / 1 overflow, got ${closed.length}/${overflow.length}`);

const bad = overflow[0];
const simpleFields = [
  ['prefixPairs', r => r.prefixPairs],
  ['initialWitnessColumn', r => r.initialWitnessColumn],
  ['initialHardReplyColumns', r => r.initialHardReplyColumns.join(',')],
  ['initialHardReplyDistance', r => r.initialHardReplyDistance],
  ['initialHardRepliesMirrorPair', r => r.initialHardRepliesMirrorPair],
  ['sameP0Class', r => r.pair.sameP0Class],
  ['sameP1Class', r => r.pair.sameP1Class],
  ['sharedP0Terms', r => r.pair.sharedP0Terms],
  ['sharedP1Terms', r => r.pair.sharedP1Terms],
  ['p0SymmetricDifferenceTerms', r => r.pair.p0SymmetricDifferenceTerms],
  ['p1SymmetricDifferenceTerms', r => r.pair.p1SymmetricDifferenceTerms],
  ['firstRawWidth', r => r.transitions[0]?.rawWidth ?? null],
  ['firstToWidth', r => r.transitions[0]?.toWidth ?? null],
];
const uniqueBadFeatureValues = [];
for (const [name, fn] of simpleFields) {
  const badValue = JSON.stringify(fn(bad));
  const matchingClosed = closed.filter(r => JSON.stringify(fn(r)) === badValue).length;
  if (matchingClosed === 0) uniqueBadFeatureValues.push({ feature: name, value: fn(bad) });
}

console.log(`BINARY_FRONTIER_DIFFERENTIAL=${JSON.stringify({
  kind: 'standard7x6-binary-frontier-differential-v1',
  attribution: { researchDirectionAndStructuralTarget: 'Josh Oshiro', formalizationImplementationAndQualification: 'OpenAI ChatGPT' },
  sourceUnresolvedRoots: roots.length,
  binarySeeds: binarySeeds.length,
  closedBinarySeeds: closed.length,
  overflowBinarySeeds: overflow.length,
  closedFraction: closed.length / binarySeeds.length,
  overflowRoot: bad.rootSequence,
  overflowWidthHistory: bad.widthHistory,
  uniqueBadFeatureValues,
  records,
  materializedQStates: kernel.states.count,
  proofAuthority: 'Pons chooses concrete legal P0 discovery witnesses only. Closed binary frontiers are constructive I/O/E/A plus exact-q hard-frontier proofs. Differential descriptors are discovery data, not theorem premises.',
  theoremStatus: 'differential control; no feature reported here is promoted to theorem without independent structural derivation and falsification',
})}`);

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
const MAX_FRONTIER_WIDTH = Number(process.env.LOW_WIDTH_MAX_FRONTIER ?? 16);
const MAX_FRONTIER_LAYERS = Number(process.env.LOW_WIDTH_MAX_LAYERS ?? 8);
if (!Number.isSafeInteger(MAX_FRONTIER_WIDTH) || MAX_FRONTIER_WIDTH < 4 || MAX_FRONTIER_WIDTH > 64) throw new RangeError('LOW_WIDTH_MAX_FRONTIER must be 4..64');
if (!Number.isSafeInteger(MAX_FRONTIER_LAYERS) || MAX_FRONTIER_LAYERS < 1 || MAX_FRONTIER_LAYERS > 16) throw new RangeError('LOW_WIDTH_MAX_LAYERS must be 1..16');

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
function dedupe(nodes) {
  const map = new Map();
  for (const node of nodes) if (!map.has(node.stateId)) map.set(node.stateId, node);
  return [...map.values()];
}
function inc(map, key) { map.set(key, (map.get(key) ?? 0) + 1); }
function numObj(map) { return Object.fromEntries([...map.entries()].sort((a,b) => Number(a[0]) - Number(b[0]))); }

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
let oneHardCount = 0;
const lowWidthSeeds = [];
for (let i = 0; i < roots.length; i += 1) {
  let current = roots[i];
  let pairs = 0;
  let score = rootScores[i];
  while (true) {
    const witness = choose(score, current.sequence);
    const hard = chosenStep(kernel, current.stateId, witness.column, current.sequence);
    pairs += 1;
    if (pairs === 1 && hard.length === 1) oneHardCount += 1;
    if (hard.length === 0) break;
    if (hard.length === 1) {
      current = hard[0];
      if (pairs >= 16) break;
      score = analyzeBatch([current.sequence])[0];
      continue;
    }
    if (hard.length >= 2 && hard.length <= 4) lowWidthSeeds.push({ rootSequence: roots[i].sequence, prefixPairs: pairs, frontier: dedupe(hard), rawWidth: hard.length });
    break;
  }
}
if (oneHardCount !== 290) throw new Error(`expected 290 initial one-hard roots, got ${oneHardCount}`);
if (lowWidthSeeds.length !== 20) throw new Error(`expected 20 low-width re-expansion seeds, got ${lowWidthSeeds.length}`);

let active = lowWidthSeeds.map((seed, index) => ({ id: index, ...seed, initialWidth: seed.frontier.length, maxWidth: seed.frontier.length, widthHistory: [seed.frontier.length], layers: 0 }));
const closed = [], overflow = [], depthCapped = [];
const widthTransitionHistogram = new Map();
const normalizationSavings = [];

for (let layer = 0; layer < MAX_FRONTIER_LAYERS && active.length; layer += 1) {
  const all = [];
  for (const seed of active) for (const node of seed.frontier) all.push({ seedId: seed.id, node });
  const scores = analyzeBatch(all.map(x => x.node.sequence));
  const bySeed = new Map(active.map(seed => [seed.id, []]));
  let rawProduced = 0;
  for (let i = 0; i < all.length; i += 1) {
    const { seedId, node } = all[i];
    if (shallow(kernel, node.stateId) !== 'H') continue;
    const witness = choose(scores[i], node.sequence);
    const hard = chosenStep(kernel, node.stateId, witness.column, node.sequence);
    rawProduced += hard.length;
    bySeed.get(seedId).push(...hard);
  }

  const next = [];
  for (const seed of active) {
    const raw = bySeed.get(seed.id);
    const frontier = dedupe(raw);
    normalizationSavings.push(raw.length - frontier.length);
    inc(widthTransitionHistogram, `${seed.frontier.length}->${frontier.length}`);
    const updated = { ...seed, frontier, layers: seed.layers + 1, maxWidth: Math.max(seed.maxWidth, frontier.length), widthHistory: [...seed.widthHistory, frontier.length] };
    if (frontier.length === 0) closed.push(updated);
    else if (frontier.length > MAX_FRONTIER_WIDTH) overflow.push(updated);
    else next.push(updated);
  }
  active = next;
}
for (const seed of active) depthCapped.push(seed);

const closedInitialWidth = new Map(), statusByInitialWidth = new Map();
for (const seed of lowWidthSeeds) statusByInitialWidth.set(seed.frontier.length, { total: 0, closed: 0, overflow: 0, capped: 0 });
for (const seed of lowWidthSeeds) statusByInitialWidth.get(seed.frontier.length).total += 1;
for (const seed of closed) { inc(closedInitialWidth, seed.initialWidth); statusByInitialWidth.get(seed.initialWidth).closed += 1; }
for (const seed of overflow) statusByInitialWidth.get(seed.initialWidth).overflow += 1;
for (const seed of depthCapped) statusByInitialWidth.get(seed.initialWidth).capped += 1;

console.log(`LOW_WIDTH_FRONTIER_CHAIN=${JSON.stringify({
  kind: 'standard7x6-low-width-branching-frontier-pilot-v1',
  attribution: { researchDirectionAndStructuralTarget: 'Josh Oshiro', formalizationImplementationAndQualification: 'OpenAI ChatGPT' },
  sourceUnresolvedRoots: roots.length,
  initialOneHardRoots: oneHardCount,
  lowWidthReexpansionSeeds: lowWidthSeeds.length,
  seedWidthHistogram: numObj(lowWidthSeeds.reduce((m,s)=>(inc(m,s.frontier.length),m),new Map())),
  maxFrontierWidth: MAX_FRONTIER_WIDTH,
  maxFrontierLayers: MAX_FRONTIER_LAYERS,
  structurallyClosedSeeds: closed.length,
  overflowSeeds: overflow.length,
  depthCappedSeeds: depthCapped.length,
  closedInitialWidthHistogram: numObj(closedInitialWidth),
  statusByInitialWidth: Object.fromEntries([...statusByInitialWidth.entries()].sort((a,b)=>a[0]-b[0])),
  widthTransitionHistogram: Object.fromEntries([...widthTransitionHistogram.entries()].sort()),
  totalExactQNormalizationSavings: normalizationSavings.reduce((a,b)=>a+b,0),
  closedExamples: closed.map(seed => ({ rootSequence: seed.rootSequence, prefixPairs: seed.prefixPairs, initialWidth: seed.initialWidth, widthHistory: seed.widthHistory, maxWidth: seed.maxWidth, frontierLayers: seed.layers })),
  overflowExamples: overflow.slice(0,20).map(seed => ({ rootSequence: seed.rootSequence, prefixPairs: seed.prefixPairs, initialWidth: seed.initialWidth, widthHistory: seed.widthHistory, maxWidth: seed.maxWidth })),
  cappedExamples: depthCapped.slice(0,20).map(seed => ({ rootSequence: seed.rootSequence, prefixPairs: seed.prefixPairs, initialWidth: seed.initialWidth, widthHistory: seed.widthHistory, maxWidth: seed.maxWidth })),
  materializedQStates: kernel.states.count,
  proofAuthority: 'Pons chooses concrete legal P0 discovery witnesses only. A closed seed is independently checkable: every P1 reply is either structural I/E(O) or appears in the next exact-q-normalized hard frontier, and every frontier layer consumes two plies until the frontier is empty. Exact scores are not proof premises.',
  progressMeasure: 'remaining board plies decreases by two per branching frontier layer',
  theoremStatus: 'constructive proof for closed low-width seeds only; overflow and depth-capped seeds remain unresolved',
})}`);

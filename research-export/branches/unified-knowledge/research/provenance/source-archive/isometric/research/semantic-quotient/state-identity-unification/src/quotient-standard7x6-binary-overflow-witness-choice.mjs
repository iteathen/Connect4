#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const TARGET_SEQUENCE = '46656555';
const PONS_INVALID_MOVE = -1000;
const MAX_WIDTH = 16;
const MAX_LAYERS = 10;

function requiredEnv(name) { const value = process.env[name]; if (!value) throw new Error(`${name} is required`); return value; }
function parsePonsLine(sequence, line) {
  const fields = line.trim().split(/\s+/);
  const scoreFields = sequence.length === 0 ? fields : fields[0] === sequence ? fields.slice(1) : null;
  if (!scoreFields || scoreFields.length !== DOMAIN.columns) throw new Error(`invalid Pons line for ${sequence}: ${line}`);
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
function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`replay crossed terminal/illegal edge at ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function rank(kernel, stateId) { return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId)); }
function legal(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), out = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) if (kernel.supportAccess.landingAt(support, column) !== 0xff) out.push(column);
  return out;
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
    for (const column of moves) {
      const child = kernel.advance(stateId, column);
      if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) { value = false; break; }
    }
  }
  overloadMemo.set(stateId, value); return value;
}
function shallow(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error('shallow requires P0-to-move');
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else for (const column of legal(kernel, stateId)) {
    const child = kernel.advance(stateId, column);
    if (child >= 0 && overload(kernel, child)) { value = 'E(O)'; break; }
  }
  shallowMemo.set(stateId, value); return value;
}
function hardForMove(kernel, stateId, sequence, column) {
  const defender = kernel.advance(stateId, column);
  if (defender === domain.QN_TERMINAL_WIN) return { terminal: true, hard: [], kinds: ['I'] };
  if (defender < 0) return null;
  const hard = [], kinds = [];
  for (const reply of legal(kernel, defender)) {
    const attacker = kernel.advance(defender, reply);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) return null;
    const kind = shallow(kernel, attacker);
    kinds.push(kind);
    if (kind === 'H') hard.push({ stateId: attacker, sequence: `${sequence}${column + 1}${reply + 1}`, reply });
  }
  const dedup = new Map(); for (const item of hard) if (!dedup.has(item.stateId)) dedup.set(item.stateId, item);
  return { terminal: false, hard: [...dedup.values()], kinds };
}
function chooseMinimumHard(kernel, node, scores) {
  const candidates = [];
  for (const column of legal(kernel, node.stateId)) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE || score <= 0) continue;
    const result = hardForMove(kernel, node.stateId, node.sequence, column);
    if (!result) continue;
    candidates.push({ column, score, hard: result.hard, kinds: result.kinds, terminal: result.terminal });
  }
  if (!candidates.length) throw new Error(`no positive discovery candidate at ${node.sequence}`);
  candidates.sort((a,b) => a.hard.length - b.hard.length || Number(b.terminal) - Number(a.terminal) || b.score - a.score || Math.abs(a.column - 3) - Math.abs(b.column - 3) || a.column - b.column);
  return { chosen: candidates[0], candidates: candidates.map(c => ({ move: c.column + 1, score: c.score, hardCount: c.hard.length, terminal: c.terminal })) };
}
function dedupe(nodes) { const map = new Map(); for (const node of nodes) if (!map.has(node.stateId)) map.set(node.stateId, node); return [...map.values()]; }

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 524288, classes: 1048576, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();
const root = { stateId: replay(kernel, TARGET_SEQUENCE), sequence: TARGET_SEQUENCE };
if (rank(kernel, root.stateId) !== TARGET_SEQUENCE.length) throw new Error('target rank drift');

let frontier = [root];
const widthHistory = [1];
const layers = [];
let status = 'depth-cap';
for (let layer = 0; layer < MAX_LAYERS; layer += 1) {
  const scores = analyzeBatch(frontier.map(node => node.sequence));
  const raw = [];
  const decisions = [];
  for (let index = 0; index < frontier.length; index += 1) {
    const node = frontier[index];
    const base = shallow(kernel, node.stateId);
    if (base !== 'H') { decisions.push({ sequence: node.sequence, base }); continue; }
    const { chosen, candidates } = chooseMinimumHard(kernel, node, scores[index]);
    decisions.push({ sequence: node.sequence, chosenMove: chosen.column + 1, chosenScore: chosen.score, chosenHardCount: chosen.hard.length, candidates });
    raw.push(...chosen.hard);
  }
  const next = dedupe(raw);
  layers.push({ layer, fromWidth: frontier.length, rawWidth: raw.length, toWidth: next.length, normalizationSavings: raw.length - next.length, decisions });
  widthHistory.push(next.length);
  if (next.length === 0) { status = 'closed'; frontier = next; break; }
  if (next.length > MAX_WIDTH) { status = 'overflow'; frontier = next; break; }
  frontier = next;
}

console.log(`BINARY_OVERFLOW_WITNESS_CHOICE=${JSON.stringify({
  kind: 'standard7x6-binary-overflow-witness-choice-v1',
  attribution: { researchDirectionAndStructuralTarget: 'Josh Oshiro', formalizationImplementationAndQualification: 'OpenAI ChatGPT' },
  targetSequence: TARGET_SEQUENCE,
  maxWidth: MAX_WIDTH,
  maxLayers: MAX_LAYERS,
  status,
  widthHistory,
  layers,
  materializedQStates: kernel.states.count,
  discoveryAuthority: 'Pinned Pons scores restrict candidate P0 moves to exact value-preserving choices during discovery. Candidate ranking minimizes structurally unresolved q consequences. If the frontier closes, the frozen moves and all P1 replies form an independently checkable I/O/E/A proof and score values are no longer proof premises.',
  theoremStatus: status === 'closed' ? 'constructive proof for this target after freezing discovered witnesses; structural witness-selection theorem still missing' : 'diagnostic only; target remains unresolved under this bounded witness-selection policy',
})}`);

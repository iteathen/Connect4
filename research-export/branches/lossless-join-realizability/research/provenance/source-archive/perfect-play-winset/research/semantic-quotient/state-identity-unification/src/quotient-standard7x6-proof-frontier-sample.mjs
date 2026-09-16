#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CELL_COUNT = DOMAIN.columns * DOMAIN.rows;
const CENTER_ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);
const PONS_INVALID_MOVE = -1000;
const SRC = new URL('./', import.meta.url);
const PREFIX_RUNNER = fileURLToPath(new URL('quotient-standard7x6-perfect-play-closure-campaign.mjs', SRC));

function envInteger(name, fallback, minimum, maximum) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be an integer in ${minimum}..${maximum}, got ${raw}`);
  }
  return value;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function parsePonsLine(sequence, line) {
  const fields = line.trim().split(/\s+/);
  const scoreFields = sequence.length === 0 ? fields : fields.slice(1);
  if (sequence.length > 0 && fields[0] !== sequence) throw new Error(`Pons prefix mismatch: ${fields[0]} != ${sequence}`);
  if (scoreFields.length !== DOMAIN.columns) throw new Error(`Pons action vector length drift at ${sequence || '<root>'}`);
  return scoreFields.map(field => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) throw new RangeError(`invalid Pons score ${field}`);
    return score;
  });
}

function analyzeBatch(sequences) {
  const solver = requiredEnv('PONS_SOLVER_PATH');
  const book = requiredEnv('PONS_BOOK_PATH');
  const child = spawnSync(solver, ['-a', '-b', book], {
    input: `${sequences.join('\n')}\n`, encoding: 'utf-8', timeout: 120000,
    maxBuffer: Math.max(2 * 1048576, sequences.length * 256),
  });
  if (child.error?.code === 'ETIMEDOUT') throw new Error('Pons batch timed out');
  if (child.status !== 0) throw new Error(`Pons batch failed: ${(child.stderr ?? '').slice(-2000)}`);
  const lines = (child.stdout ?? '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length !== sequences.length) throw new Error(`Pons batch cardinality mismatch ${lines.length}/${sequences.length}`);
  return sequences.map((sequence, index) => Object.freeze({ sequence, scores: Object.freeze(parsePonsLine(sequence, lines[index])) }));
}

function emptyState() {
  return Object.freeze({ board: new Int8Array(CELL_COUNT).fill(-1), heights: new Uint8Array(DOMAIN.columns), p0: 0n, p1: 0n, ply: 0 });
}
function owns(board, player, c, r) {
  return c >= 0 && c < DOMAIN.columns && r >= 0 && r < DOMAIN.rows && board[r * DOMAIN.columns + c] === player;
}
function wins(board, player, c, r) {
  for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let length = 1;
    for (const direction of [-1, 1]) {
      let x = c + dc * direction, y = r + dr * direction;
      while (owns(board, player, x, y)) { length += 1; x += dc * direction; y += dr * direction; }
    }
    if (length >= DOMAIN.connect) return true;
  }
  return false;
}
function play(state, column) {
  if (state.heights[column] >= DOMAIN.rows) throw new RangeError('frontier sample attempted full column');
  const board = state.board.slice(), heights = state.heights.slice();
  const row = heights[column]++, player = state.ply & 1, cell = row * DOMAIN.columns + column;
  board[cell] = player;
  const bit = 1n << BigInt(cell);
  const next = Object.freeze({ board, heights, p0: player === 0 ? state.p0 | bit : state.p0,
    p1: player === 1 ? state.p1 | bit : state.p1, ply: state.ply + 1 });
  return Object.freeze({ state: next, win: wins(board, player, column, row) });
}
function key(state) { return `${state.p0.toString(16)}:${state.p1.toString(16)}`; }
function legalColumns(state) {
  const out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) if (state.heights[c] < DOMAIN.rows) out.push(c);
  return out;
}
function add(map, state, sequence) { if (!map.has(key(state))) map.set(key(state), { state, sequence }); }
function winningWitness(scores) {
  let bestScore = -Infinity, bestColumn = -1;
  for (const column of CENTER_ORDER) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE) continue;
    if (score > bestScore) { bestScore = score; bestColumn = column; }
  }
  if (bestColumn < 0 || bestScore <= 0) throw new Error(`missing +1 proof witness; best=${bestScore}`);
  return bestColumn;
}

function buildFrontier(depth) {
  let current = new Map();
  add(current, emptyState(), '');
  for (let ply = 0; ply < depth; ply += 1) {
    const target = (ply & 1) === 0 ? 1 : -1;
    const nodes = [...current.values()];
    const analyses = analyzeBatch(nodes.map(node => node.sequence));
    const next = new Map();
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i], scores = analyses[i].scores;
      if (target === 1) {
        const column = winningWitness(scores);
        const moved = play(node.state, column);
        if (!moved.win) add(next, moved.state, `${node.sequence}${column + 1}`);
      } else {
        for (const column of legalColumns(node.state)) {
          if (scores[column] >= 0 || scores[column] === PONS_INVALID_MOVE) {
            throw new Error(`-1 proof node has non-losing/invalid legal action ${node.sequence}/${column + 1}: ${scores[column]}`);
          }
          const moved = play(node.state, column);
          if (moved.win) throw new Error('loss proof node contains immediate physical win');
          add(next, moved.state, `${node.sequence}${column + 1}`);
        }
      }
    }
    current = next;
  }
  return [...current.values()];
}

function evenSample(list, count) {
  if (count <= 0 || list.length === 0) return [];
  if (count >= list.length) return [...list];
  if (count === 1) return [list[Math.floor(list.length / 2)]];
  const result = [], seen = new Set();
  for (let i = 0; i < count; i += 1) {
    const index = Math.round(i * (list.length - 1) / (count - 1));
    if (!seen.has(index)) { seen.add(index); result.push(list[index]); }
  }
  return result;
}

async function classifyLeaves(leaves) {
  const [{ createSlot64ResidualQuotientKernel }, domain] = await Promise.all([
    import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', SRC)),
    import(new URL('quotient-negamax-domain-contract.mjs', SRC)),
  ]);
  const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
    cacheEdges: true, prefixClasses: 4096, responseClosure: true,
    searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 262144 }),
  });
  kernel.prepareSearchStorage();
  const out = [];
  for (const leaf of leaves) {
    let stateId = kernel.rootId;
    for (const digit of leaf.sequence) {
      const child = kernel.advance(stateId, Number(digit) - 1);
      if (!Number.isSafeInteger(child) || child < 0) throw new Error(`replay failure at ${leaf.sequence}`);
      stateId = child;
    }
    const tacticalCode = kernel.tacticalCode(stateId);
    const exact = domain.tacticalExactValue(tacticalCode);
    if (exact !== null && exact !== 1) throw new Error(`static tactical contradiction at ${leaf.sequence}`);
    const bound = kernel.frontierBoundCode(stateId);
    if (bound === domain.FRONTIER_BOUND_MOVER_NO_WIN || bound === domain.FRONTIER_BOUND_DRAW) {
      throw new Error(`static frontier contradiction at ${leaf.sequence}`);
    }
    out.push(Object.freeze({ sequence: leaf.sequence, stateId, tacticalCode, staticExact: exact, frontierBoundCode: bound,
      group: exact !== null ? 'static-exact' : tacticalCode >= 0 ? 'forced' : 'open' }));
  }
  return Object.freeze(out);
}

function runPrefix(sequence, timeoutMs) {
  const child = spawnSync(process.execPath, ['--expose-gc', PREFIX_RUNNER], {
    encoding: 'utf-8', maxBuffer: 4 * 1048576, timeout: timeoutMs,
    env: { ...process.env, PREFIX_CASE_MODE: '1', PREFIX_SEQUENCE: sequence,
      PREFIX_EXPECTED_WDL: '1', PREFIX_STRONG_SCORE: '1' },
  });
  if (child.error?.code === 'ETIMEDOUT') return Object.freeze({ status: 'timeout', sequence, timeoutMs });
  const line = (child.stdout ?? '').split(/\r?\n/).find(entry => entry.startsWith('PREFIX_CASE='));
  if (!line) return Object.freeze({ status: 'process-failure', sequence, exitStatus: child.status, signal: child.signal,
    stderr: (child.stderr ?? '').slice(-1000) });
  return Object.freeze(JSON.parse(line.slice('PREFIX_CASE='.length)));
}

function sortedNumeric(rows, field) { return rows.map(row => row[field]).filter(Number.isFinite).sort((a, b) => a - b); }
function quantile(sorted, q) {
  if (!sorted.length) return null;
  const p = (sorted.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo);
}
function groupStats(rows) {
  const resolved = rows.filter(row => row.status === 'resolved');
  const calls = sortedNumeric(resolved, 'calls'), times = sortedNumeric(resolved, 'searchMs');
  const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  return Object.freeze({ total: rows.length, resolved: resolved.length,
    censored: rows.length - resolved.length,
    callsMean: mean(calls), callsMedian: quantile(calls, 0.5), callsP90: quantile(calls, 0.9), callsMax: calls.at(-1) ?? null,
    searchMsMean: mean(times), searchMsMedian: quantile(times, 0.5), searchMsP90: quantile(times, 0.9), searchMsMax: times.at(-1) ?? null,
    maxStates: resolved.length ? Math.max(...resolved.map(row => row.states)) : null,
    maxClasses: resolved.length ? Math.max(...resolved.map(row => row.classes)) : null });
}

const frontierDepth = envInteger('FRONTIER_DEPTH', 8, 2, 12);
const sampleCount = envInteger('SAMPLE_COUNT', 32, 4, 128);
const sampleTimeoutMs = envInteger('SAMPLE_TIMEOUT_MS', 5000, 1000, 30000);
if ((frontierDepth & 1) !== 0) throw new RangeError('sample frontier depth must be even');

const started = performance.now();
const frontier = buildFrontier(frontierDepth);
const classified = await classifyLeaves(frontier);
const open = classified.filter(row => row.group === 'open').sort((a, b) => a.sequence.localeCompare(b.sequence));
const forced = classified.filter(row => row.group === 'forced').sort((a, b) => a.sequence.localeCompare(b.sequence));
const staticExact = classified.filter(row => row.group === 'static-exact');

let openTarget = Math.min(open.length, Math.ceil(sampleCount * 0.75));
let forcedTarget = Math.min(forced.length, sampleCount - openTarget);
if (openTarget + forcedTarget < sampleCount) {
  const spareOpen = Math.min(open.length - openTarget, sampleCount - openTarget - forcedTarget);
  openTarget += spareOpen;
  forcedTarget += Math.min(forced.length - forcedTarget, sampleCount - openTarget - forcedTarget);
}
const selected = [
  ...evenSample(open, openTarget).map(row => Object.freeze({ ...row, sampleGroup: 'open' })),
  ...evenSample(forced, forcedTarget).map(row => Object.freeze({ ...row, sampleGroup: 'forced' })),
];

const results = [];
for (let i = 0; i < selected.length; i += 1) {
  const leaf = selected[i];
  const result = Object.freeze({ ...runPrefix(leaf.sequence, sampleTimeoutMs), sampleGroup: leaf.sampleGroup,
    tacticalCode: leaf.tacticalCode, frontierStateId: leaf.stateId });
  results.push(result);
  console.log(`PROOF_FRONTIER_SAMPLE=${JSON.stringify({ index: i + 1, count: selected.length, ...result })}`);
}

const openResults = results.filter(row => row.sampleGroup === 'open');
const forcedResults = results.filter(row => row.sampleGroup === 'forced');
const openStats = groupStats(openResults), forcedStats = groupStats(forcedResults), totalStats = groupStats(results);
const allResolved = totalStats.censored === 0;
const estimatedRecursiveCalls = allResolved
  ? open.length * (openStats.callsMean ?? 0) + forced.length * (forcedStats.callsMean ?? 0)
  : null;
const estimatedSearchMs = allResolved
  ? open.length * (openStats.searchMsMean ?? 0) + forced.length * (forcedStats.searchMsMean ?? 0)
  : null;
const worst = results.filter(row => row.status === 'resolved').sort((a, b) => b.calls - a.calls).slice(0, 12);

console.log(`PROOF_FRONTIER_SAMPLE_SUMMARY=${JSON.stringify({
  kind: 'standard7x6-proof-frontier-discharge-sample-v1', frontierDepth,
  ponsSourceCommit: process.env.PONS_SOURCE_COMMIT ?? null,
  ponsBookSha256: process.env.PONS_BOOK_SHA256 ?? null,
  frontierPhysicalStates: classified.length,
  staticExactStates: staticExact.length,
  recursiveOpenPopulation: open.length,
  recursiveForcedPopulation: forced.length,
  recursivePopulation: open.length + forced.length,
  sampleCount: selected.length, sampleTimeoutMs,
  openSample: openStats, forcedSample: forcedStats, combinedSample: totalStats,
  allSampledStatesResolved: allResolved,
  estimatedIndependentRecursiveCallsForPopulation: estimatedRecursiveCalls,
  estimatedIndependentSearchMsForPopulation: estimatedSearchMs,
  estimateMethod: 'deterministic evenly spaced stratification by tactical-open versus forced; engineering estimate, not a random-sample confidence interval',
  worstSampledResolvedStates: worst,
  elapsedMs: performance.now() - started,
  interpretation: {
    nextGate: 'attempt all-frontier discharge only if censoring/capacity evidence and projected work are acceptable',
    proofAuthority: 'each sampled state counts only when current quotient solver independently returns +1',
    rootTrigger: 'standard quotient full-root search is not launched',
  },
})}`);

#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CELL_COUNT = DOMAIN.columns * DOMAIN.rows;
const CENTER_ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);
const SRC = new URL('./', import.meta.url);
const PONS_INVALID_MOVE = -1000;

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
  let scoreFields;
  if (sequence.length === 0) scoreFields = fields;
  else {
    if (fields[0] !== sequence) throw new Error(`Pons prefix mismatch: ${fields[0]} != ${sequence}`);
    scoreFields = fields.slice(1);
  }
  if (scoreFields.length !== DOMAIN.columns) {
    throw new Error(`Pons returned ${scoreFields.length} action scores for ${sequence || '<root>'}`);
  }
  return scoreFields.map((field, column) => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) {
      throw new RangeError(`invalid Pons score ${field} at ${sequence || '<root>'}/${column + 1}`);
    }
    return score;
  });
}

function analyzeBatch(sequences) {
  if (!Array.isArray(sequences) || sequences.length === 0) return Object.freeze([]);
  const solver = requiredEnv('PONS_SOLVER_PATH');
  const book = requiredEnv('PONS_BOOK_PATH');
  const maxMs = envInteger('PONS_BATCH_MS', 120000, 1000, 300000);
  const started = performance.now();
  const child = spawnSync(solver, ['-a', '-b', book], {
    input: `${sequences.join('\n')}\n`,
    encoding: 'utf-8',
    timeout: maxMs,
    maxBuffer: Math.max(2 * 1048576, sequences.length * 256),
  });
  if (child.error?.code === 'ETIMEDOUT') throw new Error(`Pons batch exceeded ${maxMs} ms for ${sequences.length} positions`);
  if (child.status !== 0) throw new Error(`Pons batch failed: ${(child.stderr ?? '').slice(-4000)}`);
  const lines = (child.stdout ?? '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length !== sequences.length) {
    throw new Error(`Pons batch returned ${lines.length} lines for ${sequences.length} inputs`);
  }
  const analyses = sequences.map((sequence, index) => Object.freeze({
    sequence,
    scores: Object.freeze(parsePonsLine(sequence, lines[index])),
  }));
  return Object.freeze({ analyses: Object.freeze(analyses), elapsedMs: performance.now() - started });
}

function emptyState() {
  return Object.freeze({
    board: new Int8Array(CELL_COUNT).fill(-1),
    heights: new Uint8Array(DOMAIN.columns),
    p0: 0n,
    p1: 0n,
    ply: 0,
  });
}

function owns(board, player, c, r) {
  return c >= 0 && c < DOMAIN.columns && r >= 0 && r < DOMAIN.rows
    && board[r * DOMAIN.columns + c] === player;
}

function wins(board, player, c, r) {
  for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let length = 1;
    for (const direction of [-1, 1]) {
      let x = c + dc * direction;
      let y = r + dr * direction;
      while (owns(board, player, x, y)) {
        length += 1;
        x += dc * direction;
        y += dr * direction;
      }
    }
    if (length >= DOMAIN.connect) return true;
  }
  return false;
}

function legalColumns(state) {
  const columns = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (state.heights[column] < DOMAIN.rows) columns.push(column);
  }
  return columns;
}

function play(state, column) {
  if (!Number.isSafeInteger(column) || column < 0 || column >= DOMAIN.columns
      || state.heights[column] >= DOMAIN.rows) {
    throw new RangeError(`illegal proof-frontier move ${column + 1} at ply ${state.ply}`);
  }
  const board = state.board.slice();
  const heights = state.heights.slice();
  const row = heights[column]++;
  const player = state.ply & 1;
  const cell = row * DOMAIN.columns + column;
  board[cell] = player;
  const bit = 1n << BigInt(cell);
  const p0 = player === 0 ? state.p0 | bit : state.p0;
  const p1 = player === 1 ? state.p1 | bit : state.p1;
  const next = Object.freeze({ board, heights, p0, p1, ply: state.ply + 1 });
  return Object.freeze({ state: next, win: wins(board, player, column, row), player, row });
}

function physicalKey(state) {
  return `${state.p0.toString(16)}:${state.p1.toString(16)}`;
}

function addMerged(map, state, sequence, multiplicity) {
  const key = physicalKey(state);
  const existing = map.get(key);
  if (existing) {
    existing.multiplicity += multiplicity;
    return existing;
  }
  const node = { state, sequence, multiplicity };
  map.set(key, node);
  return node;
}

function sumMultiplicity(nodes) {
  let total = 0;
  for (const node of nodes.values()) total += node.multiplicity;
  return total;
}

function chooseWinningWitness(scores, sequence) {
  let bestScore = -Infinity;
  let bestColumn = -1;
  for (const column of CENTER_ORDER) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE) continue;
    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }
  if (bestColumn < 0 || bestScore <= 0) {
    throw new Error(`root-win proof hypothesis has no winning witness at ${sequence || '<root>'}; best=${bestScore}`);
  }
  return Object.freeze({ column: bestColumn, score: bestScore });
}

function validateLosingNode(scores, node) {
  const legal = legalColumns(node.state);
  for (const column of legal) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE) throw new Error(`Pons marks legal move invalid at ${node.sequence}/${column + 1}`);
    if (score >= 0) {
      throw new Error(`loss-target node has a non-losing action at ${node.sequence}/${column + 1}: ${score}`);
    }
  }
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (!legal.includes(column) && scores[column] !== PONS_INVALID_MOVE) {
      throw new Error(`Pons marks full-column move legal at ${node.sequence}/${column + 1}`);
    }
  }
  return legal;
}

function buildProofFrontier(frontierDepth) {
  let current = new Map();
  addMerged(current, emptyState(), '', 1);
  const levels = [];
  let oraclePositions = 0;
  let oracleMs = 0;
  let terminalWitnesses = 0;

  for (let ply = 0; ply <= frontierDepth; ply += 1) {
    const targetWdl = (ply & 1) === 0 ? 1 : -1;
    levels.push(Object.freeze({
      ply,
      targetWdl,
      uniquePhysicalStates: current.size,
      proofPathMultiplicity: sumMultiplicity(current),
    }));
    if (ply === frontierDepth) break;

    const nodes = [...current.values()];
    const batch = analyzeBatch(nodes.map(node => node.sequence));
    oraclePositions += nodes.length;
    oracleMs += batch.elapsedMs;
    const next = new Map();

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      const scores = batch.analyses[index].scores;
      if (targetWdl === 1) {
        const witness = chooseWinningWitness(scores, node.sequence);
        const moved = play(node.state, witness.column);
        if (moved.win) {
          terminalWitnesses += node.multiplicity;
          continue;
        }
        addMerged(next, moved.state, `${node.sequence}${witness.column + 1}`, node.multiplicity);
      } else {
        const legal = validateLosingNode(scores, node);
        for (const column of legal) {
          const moved = play(node.state, column);
          if (moved.win) {
            throw new Error(`loss-target node has immediate physical win at ${node.sequence}/${column + 1}`);
          }
          addMerged(next, moved.state, `${node.sequence}${column + 1}`, node.multiplicity);
        }
      }
    }
    current = next;
  }

  const frontierNodes = [...current.values()];
  const validation = analyzeBatch(frontierNodes.map(node => node.sequence));
  oraclePositions += frontierNodes.length;
  oracleMs += validation.elapsedMs;
  for (let index = 0; index < frontierNodes.length; index += 1) {
    const best = chooseWinningWitness(validation.analyses[index].scores, frontierNodes[index].sequence);
    if (best.score <= 0) throw new Error('frontier target validation drifted');
  }

  return Object.freeze({
    frontierDepth,
    levels: Object.freeze(levels),
    frontierNodes: Object.freeze(frontierNodes),
    oraclePositions,
    oracleMs,
    terminalWitnesses,
  });
}

async function classifyQuotientFrontier(proof) {
  const [{ createSlot64ResidualQuotientKernel }, domain] = await Promise.all([
    import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', SRC)),
    import(new URL('quotient-negamax-domain-contract.mjs', SRC)),
  ]);
  const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
    cacheEdges: true,
    prefixClasses: 4096,
    responseClosure: true,
    searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 262144 }),
  });
  kernel.prepareSearchStorage();

  const quotient = new Map();
  let staticExact = 0;
  let immediateWins = 0;
  let tacticalLosses = 0;
  let tacticalDraws = 0;
  let moverNoWin = 0;
  let opponentNoWin = 0;
  let bilateralDraw = 0;
  let noFrontierBound = 0;

  for (const leaf of proof.frontierNodes) {
    let stateId = kernel.rootId;
    for (const digit of leaf.sequence) {
      const column = Number(digit) - 1;
      const child = kernel.advance(stateId, column);
      if (!Number.isSafeInteger(child) || child < 0) {
        throw new Error(`proof-frontier replay crossed terminal/illegal transition at ${leaf.sequence}`);
      }
      stateId = child;
    }
    const rank = kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));
    if (rank !== proof.frontierDepth) throw new Error(`quotient frontier rank drift: ${rank}`);

    const frontierBoundCode = kernel.frontierBoundCode(stateId);
    const tacticalCode = kernel.tacticalCode(stateId);
    const tacticalExact = domain.tacticalExactValue(tacticalCode);
    if (tacticalExact !== null) {
      staticExact += 1;
      if (tacticalExact !== 1) {
        throw new Error(`quotient static exact result contradicts +1 proof target at ${leaf.sequence}: ${tacticalExact}`);
      }
      if (tacticalCode >= domain.TACTICAL_IMMEDIATE_BASE) immediateWins += 1;
      else if (tacticalCode === domain.TACTICAL_LOSS) tacticalLosses += 1;
      else tacticalDraws += 1;
    }
    if (frontierBoundCode === domain.FRONTIER_BOUND_NONE) noFrontierBound += 1;
    else if (frontierBoundCode === domain.FRONTIER_BOUND_MOVER_NO_WIN) {
      moverNoWin += 1;
      throw new Error(`sound mover-no-win bound contradicts +1 proof target at ${leaf.sequence}`);
    } else if (frontierBoundCode === domain.FRONTIER_BOUND_OPPONENT_NO_WIN) opponentNoWin += 1;
    else if (frontierBoundCode === domain.FRONTIER_BOUND_DRAW) {
      bilateralDraw += 1;
      throw new Error(`sound draw bound contradicts +1 proof target at ${leaf.sequence}`);
    }

    const existing = quotient.get(stateId);
    if (existing) {
      existing.physicalStates += 1;
      existing.proofPathMultiplicity += leaf.multiplicity;
    } else {
      quotient.set(stateId, {
        stateId,
        sequence: leaf.sequence,
        physicalStates: 1,
        proofPathMultiplicity: leaf.multiplicity,
        frontierBoundCode,
        tacticalCode,
      });
    }
  }

  const merged = [...quotient.values()].sort((a, b) =>
    b.physicalStates - a.physicalStates || b.proofPathMultiplicity - a.proofPathMultiplicity || a.stateId - b.stateId);

  return Object.freeze({
    quotientStates: quotient.size,
    quotientCompression: proof.frontierNodes.length / Math.max(1, quotient.size),
    localStatePoolCount: kernel.states.count,
    localClassCount: kernel.classes.size,
    staticExact,
    immediateWins,
    tacticalLosses,
    tacticalDraws,
    moverNoWin,
    opponentNoWin,
    bilateralDraw,
    noFrontierBound,
    topMerges: Object.freeze(merged.slice(0, 20)),
    representatives: Object.freeze(merged.map(entry => Object.freeze({ ...entry }))),
  });
}

const frontierDepth = envInteger('FRONTIER_DEPTH', 8, 2, 12);
if ((frontierDepth & 1) !== 0) throw new RangeError('proof-frontier census currently requires even depth so frontier target is +1');

const started = performance.now();
const proof = buildProofFrontier(frontierDepth);
for (const level of proof.levels) console.log(`PROOF_FRONTIER_LEVEL=${JSON.stringify(level)}`);
const quotient = await classifyQuotientFrontier(proof);

console.log(`PROOF_FRONTIER_CENSUS=${JSON.stringify({
  kind: 'standard7x6-root-win-proof-frontier-census-v1',
  frontierDepth,
  rootHypothesisWdl: 1,
  construction: 'OR at +1 nodes using one pinned-Pons exact winning witness; AND at -1 nodes using every legal move',
  oracleAuthority: 'move selection and consistency control only; no Pons score is a quotient proof publication',
  ponsSourceCommit: process.env.PONS_SOURCE_COMMIT ?? null,
  ponsBookAssetId: Number(process.env.PONS_BOOK_ASSET_ID ?? 0) || null,
  ponsBookSha256: process.env.PONS_BOOK_SHA256 ?? null,
  oraclePositionsAnalyzed: proof.oraclePositions,
  oracleAnalysisMs: proof.oracleMs,
  terminalWitnessMultiplicityBeforeFrontier: proof.terminalWitnesses,
  levels: proof.levels,
  frontierPhysicalStates: proof.frontierNodes.length,
  frontierProofPathMultiplicity: sumMultiplicity(new Map(proof.frontierNodes.map((node, index) => [index, node]))),
  quotientStates: quotient.quotientStates,
  quotientCompression: quotient.quotientCompression,
  quotientLocalStatePoolCount: quotient.localStatePoolCount,
  quotientLocalClassCount: quotient.localClassCount,
  staticExactFrontierStates: quotient.staticExact,
  immediateWinFrontierStates: quotient.immediateWins,
  opponentNoWinFrontierStates: quotient.opponentNoWin,
  noFrontierBoundStates: quotient.noFrontierBound,
  topQuotientMerges: quotient.topMerges,
  representativeQuotientStates: quotient.representatives,
  elapsedMs: performance.now() - started,
  interpretation: {
    proofMeaning: 'If every quotient frontier obligation independently proves +1, the selected witness/all-replies certificate propagates an exact +1 proof to the empty root.',
    currentScope: 'census only; this campaign does not recursively solve the frontier obligations',
    rootTrigger: 'the standard quotient full-root search is not launched',
  },
})}`);

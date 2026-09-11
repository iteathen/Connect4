import { createConnectWinningLines } from '../../components/bsfp/geometry.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

const ILLEGAL = 0xffffffff;
const TERMINAL_TAG = 0x80000000;
const PAYLOAD_MASK = 0x7fffffff;
const UNKNOWN_VALUE = 0x7f;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function minimalAntichain(masks) {
  const out = [];
  for (const mask of masks) {
    let redundant = false;
    for (const existing of out) {
      if ((existing & mask) === existing) {
        redundant = true;
        break;
      }
    }
    if (redundant) continue;
    let write = 0;
    for (let index = 0; index < out.length; index += 1) {
      const existing = out[index];
      if ((existing & mask) === mask) continue;
      out[write++] = existing;
    }
    out.length = write;
    out.push(mask >>> 0);
  }
  out.sort((a, b) => a - b);
  return out;
}

function encodeMasks(masks) {
  return masks.map((mask) => mask.toString(16)).join('.');
}

function stateKey(supportIndex, p0Residual, p1Residual) {
  return `${supportIndex}|${encodeMasks(p0Residual)}/${encodeMasks(p1Residual)}`;
}

function createGeometry({ columns, rows, connect }) {
  const cellCount = columns * rows;
  assert(cellCount <= 20, 'MQ4 flat replay controls are intentionally bounded to <=20 cells');
  const lines = createConnectWinningLines({ columns, rows, connect });
  assert(lines.length > 0 && lines.length < 31, 'u32 residual masks require 1..30 winning lines in these controls');

  const lineCellMasks = new Uint32Array(lines.length);
  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    let mask = 0;
    for (const cell of lines[lineId]) mask = (mask | (1 << cell)) >>> 0;
    lineCellMasks[lineId] = mask;
  }

  const supportBase = rows + 1;
  const supportWeights = new Uint32Array(columns);
  let supportCapacity = 1;
  for (let column = 0; column < columns; column += 1) {
    supportWeights[column] = supportCapacity;
    supportCapacity *= supportBase;
  }

  const support = Array.from({ length: supportCapacity });
  for (let supportIndex = 0; supportIndex < supportCapacity; supportIndex += 1) {
    let encoded = supportIndex;
    let rank = 0;
    const landings = [];
    for (let column = 0; column < columns; column += 1) {
      const height = encoded % supportBase;
      encoded = Math.floor(encoded / supportBase);
      rank += height;
      if (height < rows) {
        landings.push(Object.freeze({
          column,
          cell: height * columns + column,
          nextSupportIndex: supportIndex + supportWeights[column],
        }));
      }
    }
    support[supportIndex] = Object.freeze({ rank, landings: Object.freeze(landings) });
  }

  return Object.freeze({ columns, rows, connect, cellCount, lineCellMasks, support });
}

function moverTransition(residuals, cellBit) {
  const next = [];
  for (const residual of residuals) {
    if ((residual & cellBit) === 0) {
      next.push(residual);
      continue;
    }
    const reduced = (residual & ~cellBit) >>> 0;
    if (reduced === 0) return Object.freeze({ terminal: true, residuals: null });
    next.push(reduced);
  }
  return Object.freeze({ terminal: false, residuals: minimalAntichain(next) });
}

function opponentTransition(residuals, cellBit) {
  const next = [];
  for (const residual of residuals) {
    if ((residual & cellBit) === 0) next.push(residual);
  }
  return next;
}

function transitionFromState(g, state, rank, landing) {
  const mover = rank & 1;
  const cellBit = (1 << landing.cell) >>> 0;
  const moverResidual = mover === 0 ? state.p0Residual : state.p1Residual;
  const opponentResidual = mover === 0 ? state.p1Residual : state.p0Residual;
  const moved = moverTransition(moverResidual, cellBit);
  if (moved.terminal) {
    return Object.freeze({
      terminal: true,
      score: Math.trunc((g.cellCount + 1 - rank) / 2),
      childKey: null,
    });
  }
  const blockedOpponent = opponentTransition(opponentResidual, cellBit);
  const p0Residual = mover === 0 ? moved.residuals : blockedOpponent;
  const p1Residual = mover === 1 ? moved.residuals : blockedOpponent;
  return Object.freeze({
    terminal: false,
    score: null,
    childKey: stateKey(landing.nextSupportIndex, p0Residual, p1Residual),
    childState: Object.freeze({ supportIndex: landing.nextSupportIndex, p0Residual, p1Residual }),
  });
}

function buildAutomaton(g) {
  const ranks = Array.from({ length: g.cellCount + 1 }, () => new Map());
  const rootResidual = minimalAntichain([...g.lineCellMasks]);
  const root = Object.freeze({ supportIndex: 0, p0Residual: rootResidual, p1Residual: rootResidual });
  ranks[0].set(stateKey(0, rootResidual, rootResidual), root);

  for (let rank = 0; rank < g.cellCount; rank += 1) {
    const next = ranks[rank + 1];
    for (const state of ranks[rank].values()) {
      const support = g.support[state.supportIndex];
      for (const landing of support.landings) {
        const transition = transitionFromState(g, state, rank, landing);
        if (transition.terminal) continue;
        if (!next.has(transition.childKey)) next.set(transition.childKey, transition.childState);
      }
    }
  }
  return Object.freeze({ ranks });
}

function assignDenseIds(g, automaton) {
  const idByKey = new Map();
  const states = [];
  for (let rank = 0; rank <= g.cellCount; rank += 1) {
    for (const [key, state] of automaton.ranks[rank]) {
      const id = states.length;
      idByKey.set(key, id);
      states.push(Object.freeze({ id, rank, key, state }));
    }
  }
  assert(states.length < TERMINAL_TAG, 'dense state IDs must fit below terminal tag bit');
  assert(states.length > 0 && states[0].rank === 0, 'root must receive dense ID zero');
  return Object.freeze({ idByKey, states });
}

function compileFlat(g, dense) {
  const entries = new Uint32Array(dense.states.length * g.columns);
  entries.fill(ILLEGAL);
  const rankById = new Uint8Array(dense.states.length);
  let encodedChildren = 0;
  let encodedTerminals = 0;

  for (const item of dense.states) {
    rankById[item.id] = item.rank;
    const support = g.support[item.state.supportIndex];
    for (const landing of support.landings) {
      const transition = transitionFromState(g, item.state, item.rank, landing);
      const slot = item.id * g.columns + landing.column;
      if (transition.terminal) {
        assert(transition.score > 0 && transition.score < PAYLOAD_MASK, 'terminal score must fit tagged payload');
        entries[slot] = (TERMINAL_TAG | transition.score) >>> 0;
        encodedTerminals += 1;
      } else {
        const childId = dense.idByKey.get(transition.childKey);
        assert(childId !== undefined, `missing dense child for ${transition.childKey}`);
        assert(dense.states[childId].rank === item.rank + 1, 'nonterminal transition must advance exactly one rank');
        entries[slot] = childId >>> 0;
        encodedChildren += 1;
      }
    }
  }

  const serialized = new Uint8Array(entries.byteLength);
  serialized.set(new Uint8Array(entries.buffer, entries.byteOffset, entries.byteLength));
  const decoded = new Uint32Array(serialized.buffer);
  assert(decoded.length === entries.length, 'serialized flat table length mismatch');

  return Object.freeze({
    entries: decoded,
    rankById,
    stateCount: dense.states.length,
    entryCount: decoded.length,
    entryBytes: Uint32Array.BYTES_PER_ELEMENT,
    flatTransitionBytes: decoded.byteLength,
    encodedChildren,
    encodedTerminals,
  });
}

function directSolve(g, dense) {
  const values = new Int8Array(dense.states.length);
  values.fill(UNKNOWN_VALUE);

  for (let id = dense.states.length - 1; id >= 0; id -= 1) {
    const item = dense.states[id];
    const support = g.support[item.state.supportIndex];
    if (support.landings.length === 0) {
      values[id] = 0;
      continue;
    }
    let best = -Infinity;
    for (const landing of support.landings) {
      const transition = transitionFromState(g, item.state, item.rank, landing);
      let score;
      if (transition.terminal) score = transition.score;
      else {
        const childId = dense.idByKey.get(transition.childKey);
        assert(childId !== undefined && values[childId] !== UNKNOWN_VALUE, 'missing direct child value');
        score = -values[childId];
      }
      if (score > best) best = score;
    }
    values[id] = best;
  }
  return values;
}

function replayDecodedFlat(g, flat) {
  const reachable = new Uint8Array(flat.stateCount);
  reachable[0] = 1;
  let invalidTargetCount = 0;
  let invalidRankTargetCount = 0;

  for (let id = 0; id < flat.stateCount; id += 1) {
    if (reachable[id] === 0) continue;
    const rank = flat.rankById[id];
    for (let column = 0; column < g.columns; column += 1) {
      const encoded = flat.entries[id * g.columns + column] >>> 0;
      if (encoded === ILLEGAL || (encoded & TERMINAL_TAG) !== 0) continue;
      const childId = encoded;
      if (childId >= flat.stateCount) {
        invalidTargetCount += 1;
        continue;
      }
      if (flat.rankById[childId] !== rank + 1) invalidRankTargetCount += 1;
      reachable[childId] = 1;
    }
  }

  let orphanStateCount = 0;
  for (const bit of reachable) if (bit === 0) orphanStateCount += 1;

  const values = new Int8Array(flat.stateCount);
  values.fill(UNKNOWN_VALUE);
  for (let id = flat.stateCount - 1; id >= 0; id -= 1) {
    let best = -Infinity;
    let legal = 0;
    for (let column = 0; column < g.columns; column += 1) {
      const encoded = flat.entries[id * g.columns + column] >>> 0;
      if (encoded === ILLEGAL) continue;
      legal += 1;
      let score;
      if ((encoded & TERMINAL_TAG) !== 0) {
        score = encoded & PAYLOAD_MASK;
      } else {
        assert(encoded < flat.stateCount, 'decoded flat child out of range during solve');
        assert(values[encoded] !== UNKNOWN_VALUE, 'decoded flat child was not solved before parent');
        score = -values[encoded];
      }
      if (score > best) best = score;
    }
    values[id] = legal === 0 ? 0 : best;
  }

  return Object.freeze({ values, orphanStateCount, invalidTargetCount, invalidRankTargetCount });
}

function compareDecodedTable(g, dense, flat, directValues, replay) {
  let encodedTransitionMismatches = 0;
  let actionScoreMismatches = 0;
  let stateScoreMismatches = 0;

  for (const item of dense.states) {
    const support = g.support[item.state.supportIndex];
    const landingByColumn = new Map(support.landings.map((landing) => [landing.column, landing]));
    let decodedBest = -Infinity;
    let legal = 0;

    for (let column = 0; column < g.columns; column += 1) {
      const encoded = flat.entries[item.id * g.columns + column] >>> 0;
      const landing = landingByColumn.get(column);
      if (landing === undefined) {
        if (encoded !== ILLEGAL) encodedTransitionMismatches += 1;
        continue;
      }
      legal += 1;
      const expected = transitionFromState(g, item.state, item.rank, landing);
      let expectedScore;
      let decodedScore;
      if (expected.terminal) {
        expectedScore = expected.score;
        if (encoded === ILLEGAL || (encoded & TERMINAL_TAG) === 0 || (encoded & PAYLOAD_MASK) !== expected.score) {
          encodedTransitionMismatches += 1;
          continue;
        }
        decodedScore = encoded & PAYLOAD_MASK;
      } else {
        const expectedChildId = dense.idByKey.get(expected.childKey);
        expectedScore = -directValues[expectedChildId];
        if (encoded !== expectedChildId) {
          encodedTransitionMismatches += 1;
          continue;
        }
        decodedScore = -replay.values[encoded];
      }
      if (decodedScore !== expectedScore) actionScoreMismatches += 1;
      if (decodedScore > decodedBest) decodedBest = decodedScore;
    }

    const expectedState = directValues[item.id];
    const decodedState = legal === 0 ? 0 : decodedBest;
    if (decodedState !== expectedState || replay.values[item.id] !== expectedState) stateScoreMismatches += 1;
  }

  return Object.freeze({ encodedTransitionMismatches, actionScoreMismatches, stateScoreMismatches });
}

function digestTable(entries) {
  let hash = 0x811c9dc5;
  for (const value of entries) {
    hash ^= value & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
    hash ^= (value >>> 8) & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
    hash ^= (value >>> 16) & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
    hash ^= (value >>> 24) & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function runCase(spec) {
  const started = performance.now();
  const g = createGeometry(spec);
  const automaton = buildAutomaton(g);
  const dense = assignDenseIds(g, automaton);
  const flat = compileFlat(g, dense);
  const directValues = directSolve(g, dense);
  const replay = replayDecodedFlat(g, flat);
  const comparison = compareDecodedTable(g, dense, flat, directValues, replay);

  assert(replay.orphanStateCount === 0, 'decoded flat replay left reachable automaton states orphaned');
  assert(replay.invalidTargetCount === 0, 'decoded flat replay found an out-of-range child ID');
  assert(replay.invalidRankTargetCount === 0, 'decoded flat replay found a non-rank+1 child target');
  assert(comparison.encodedTransitionMismatches === 0, 'materialized flat transition does not match semantic transition');
  assert(comparison.actionScoreMismatches === 0, 'decoded flat action score mismatch');
  assert(comparison.stateScoreMismatches === 0, 'decoded flat state score mismatch');

  return Object.freeze({
    geometry: `${g.columns}x${g.rows}:c${g.connect}`,
    stateCount: flat.stateCount,
    entryCount: flat.entryCount,
    entryBytes: flat.entryBytes,
    flatTransitionBytes: flat.flatTransitionBytes,
    encodedChildren: flat.encodedChildren,
    encodedTerminals: flat.encodedTerminals,
    orphanStateCount: replay.orphanStateCount,
    invalidTargetCount: replay.invalidTargetCount,
    invalidRankTargetCount: replay.invalidRankTargetCount,
    encodedTransitionMismatches: comparison.encodedTransitionMismatches,
    actionScoreMismatches: comparison.actionScoreMismatches,
    stateScoreMismatches: comparison.stateScoreMismatches,
    rootStrongScore: replay.values[0],
    tableDigestFnv1a32: digestTable(flat.entries),
    elapsedMs: performance.now() - started,
  });
}

const cases = [];
for (const spec of CASES) {
  const result = runCase(spec);
  cases.push(result);
  console.error(`[semantic-quotient MQ4 flat] ${result.geometry} states=${result.stateCount} bytes=${result.flatTransitionBytes} digest=${result.tableDigestFnv1a32} transitionMismatch=${result.encodedTransitionMismatches} actionMismatch=${result.actionScoreMismatches} stateMismatch=${result.stateScoreMismatches} elapsedMs=${result.elapsedMs.toFixed(1)}`);
  if (global.gc) global.gc();
}

console.log(JSON.stringify({
  kind: 'connect4-semantic-quotient-mq4-materialized-flat-replay',
  status: 'pass',
  encoding: {
    word: 'u32',
    illegal: '0xffffffff',
    terminal: 'high-bit | positive strong score',
    child: 'dense state ID with high bit clear',
  },
  claims: {
    flatTableMaterialized: true,
    flatTableSerializedAndDecoded: true,
    decodedTableReachabilityComplete: true,
    decodedTableRankTransitionsExact: true,
    decodedTableStrongStateScoreEquivalent: true,
    decodedTablePerColumnActionScoreEquivalent: true,
    productionSolverClaim: false,
    standard7x6Claim: false,
  },
  cases,
}, null, 2));

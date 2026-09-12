import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';

const MAX_PROFILE_CACHE_ENTRIES = 32;
const profileCache = new Map();

function normalizeSpec(spec) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new TypeError('live-line ordering requires a domain spec object');
  }
  const { columns, rows, connect } = spec;
  if (!Number.isInteger(columns) || columns < 1) throw new RangeError('live-line columns must be positive');
  if (!Number.isInteger(rows) || rows < 1) throw new RangeError('live-line rows must be positive');
  if (!Number.isInteger(connect) || connect < 1) throw new RangeError('live-line connect must be positive');
  const cellCount = columns * rows;
  if (!Number.isSafeInteger(cellCount) || cellCount < 1 || cellCount > 64) {
    throw new RangeError('live-line frontier currently supports 1..64 cells');
  }
  return Object.freeze({ columns, rows, connect, cellCount });
}

function cacheKey(spec) {
  return `${spec.columns}x${spec.rows}c${spec.connect}`;
}

function rememberProfile(key, profile) {
  if (profileCache.has(key)) profileCache.delete(key);
  while (profileCache.size >= MAX_PROFILE_CACHE_ENTRIES) {
    const oldest = profileCache.keys().next().value;
    profileCache.delete(oldest);
  }
  profileCache.set(key, profile);
  return profile;
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function assertPlayer(player, label) {
  if (player !== 0 && player !== 1) throw new RangeError(`${label} must be 0 or 1`);
}

function assertCell(profile, cell) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= profile.cellCount) {
    throw new RangeError(`live-line cell ${cell} is outside 0..${profile.cellCount - 1}`);
  }
}

function assertWordRange(array, offset, length, label) {
  if (!(array instanceof Uint32Array)) throw new TypeError(`${label} must be Uint32Array`);
  if (!Number.isInteger(offset) || offset < 0 || offset + length > array.length) {
    throw new RangeError(`${label} range [${offset}, ${offset + length}) exceeds length ${array.length}`);
  }
}

function buildProfile(inputSpec) {
  const spec = normalizeSpec(inputSpec);
  const key = cacheKey(spec);
  const prior = profileCache.get(key);
  if (prior) {
    profileCache.delete(key);
    profileCache.set(key, prior);
    return prior;
  }

  const lines = createConnectWinningLines(spec);
  if (!Array.isArray(lines)) throw new TypeError('winning-line geometry must return an array');
  const wordCount = Math.max(1, Math.ceil(lines.length / 32));
  const through = new Uint32Array(spec.cellCount * wordCount);
  const all = new Uint32Array(wordCount);

  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    const line = lines[lineId];
    if (!Array.isArray(line) || line.length !== spec.connect) {
      throw new Error(`winning-line ${lineId} does not contain ${spec.connect} cells`);
    }
    const word = lineId >>> 5;
    const bit = (1 << (lineId & 31)) >>> 0;
    all[word] = (all[word] | bit) >>> 0;
    const seen = new Set();
    for (const cell of line) {
      assertCell(spec, cell);
      if (seen.has(cell)) throw new Error(`winning-line ${lineId} repeats cell ${cell}`);
      seen.add(cell);
      const at = cell * wordCount + word;
      through[at] = (through[at] | bit) >>> 0;
    }
  }

  const profile = Object.freeze({
    kind: 'connect4-live-winning-line-frontier-profile-v3',
    columns: spec.columns,
    rows: spec.rows,
    connect: spec.connect,
    cellCount: spec.cellCount,
    lineCount: lines.length,
    wordCount,
    stateWords: wordCount * 2,
    through,
    all,
  });
  return rememberProfile(key, profile);
}

export function createLiveLineMoveOrder(spec) {
  const profile = buildProfile(spec);
  const rootSeed = new Uint32Array(profile.stateWords);
  rootSeed.set(profile.all, 0);
  rootSeed.set(profile.all, profile.wordCount);

  function createRootSeed() {
    return new Uint32Array(rootSeed);
  }

  function advanceInto(source, sourceOffset, mover, cell, target, targetOffset) {
    assertPlayer(mover, 'mover');
    assertCell(profile, cell);
    assertWordRange(source, sourceOffset, profile.stateWords, 'live-line source');
    assertWordRange(target, targetOffset, profile.stateWords, 'live-line target');

    const sourceEnd = sourceOffset + profile.stateWords;
    const targetEnd = targetOffset + profile.stateWords;
    const overlapping = source === target && sourceOffset < targetEnd && targetOffset < sourceEnd;
    if (overlapping && targetOffset > sourceOffset) {
      for (let index = profile.stateWords - 1; index >= 0; index -= 1) {
        target[targetOffset + index] = source[sourceOffset + index];
      }
    } else {
      for (let index = 0; index < profile.stateWords; index += 1) {
        target[targetOffset + index] = source[sourceOffset + index];
      }
    }

    const words = profile.wordCount;
    const blockedPlayer = 1 - mover;
    const blockedBase = blockedPlayer * words;
    const throughBase = cell * words;
    for (let word = 0; word < words; word += 1) {
      const at = blockedBase + word;
      target[targetOffset + at] = (target[targetOffset + at] & ~profile.through[throughBase + word]) >>> 0;
    }
    return target;
  }

  function advanceSeed(seed, mover, cell) {
    assertWordRange(seed, 0, profile.stateWords, 'live-line seed');
    if (seed.length !== profile.stateWords) {
      throw new TypeError(`live-line seed must be Uint32Array(${profile.stateWords})`);
    }
    const next = new Uint32Array(profile.stateWords);
    advanceInto(seed, 0, mover, cell, next, 0);
    return next;
  }

  function valueAtSeed(seed, player, cell) {
    assertWordRange(seed, 0, profile.stateWords, 'live-line seed');
    if (seed.length !== profile.stateWords) {
      throw new TypeError(`live-line seed must be Uint32Array(${profile.stateWords})`);
    }
    assertPlayer(player, 'player');
    assertCell(profile, cell);
    const words = profile.wordCount;
    const playerBase = player * words;
    const throughBase = cell * words;
    let value = 0;
    for (let word = 0; word < words; word += 1) {
      value += popcount32(seed[playerBase + word] & profile.through[throughBase + word]);
    }
    return value;
  }

  function valueAtStack(stack, stateOffset, player, cell) {
    assertWordRange(stack, stateOffset, profile.stateWords, 'live-line stack');
    assertPlayer(player, 'player');
    assertCell(profile, cell);
    const words = profile.wordCount;
    const playerBase = stateOffset + player * words;
    const throughBase = cell * words;
    let value = 0;
    for (let word = 0; word < words; word += 1) {
      value += popcount32(stack[playerBase + word] & profile.through[throughBase + word]);
    }
    return value;
  }

  function orderLegal(kernel, stateId, seed) {
    if (!kernel || typeof kernel !== 'object'
        || !kernel.states || !kernel.supportAccess
        || kernel.columns !== profile.columns) {
      throw new TypeError('live-line orderLegal requires a compatible quotient kernel');
    }
    if (!Number.isInteger(stateId) || stateId < 0 || stateId >= kernel.states.count) {
      throw new RangeError(`live-line state ${stateId} is outside current kernel state count ${kernel.states.count}`);
    }
    if (!(seed instanceof Uint32Array) || seed.length !== profile.stateWords) {
      throw new TypeError(`live-line seed must be Uint32Array(${profile.stateWords})`);
    }
    const supportIndex = kernel.states.support[stateId];
    const rank = kernel.supportAccess.rankAt(supportIndex);
    if (!Number.isInteger(rank) || rank < 0 || rank > profile.cellCount) {
      throw new Error(`live-line kernel rank drift at state ${stateId}: ${rank}`);
    }
    const mover = rank & 1;
    const scored = [];
    for (let column = 0; column < kernel.columns; column += 1) {
      const landingCell = kernel.supportAccess.landingAt(supportIndex, column);
      if (landingCell === 0xff) continue;
      assertCell(profile, landingCell);
      scored.push(Object.freeze({
        column,
        landingCell,
        value: valueAtSeed(seed, mover, landingCell),
      }));
    }
    scored.sort((left, right) => right.value - left.value || left.column - right.column);
    return Object.freeze(scored);
  }

  return Object.freeze({
    profile,
    createRootSeed,
    advanceInto,
    advanceSeed,
    valueAtSeed,
    valueAtStack,
    orderLegal,
  });
}

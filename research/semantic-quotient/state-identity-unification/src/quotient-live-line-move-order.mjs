import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';

const profileCache = new Map();

function cacheKey(spec) {
  return `${spec.columns}x${spec.rows}c${spec.connect}`;
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function buildProfile(spec) {
  const key = cacheKey(spec);
  const prior = profileCache.get(key);
  if (prior) return prior;

  const cellCount = spec.columns * spec.rows;
  if (!Number.isSafeInteger(cellCount) || cellCount < 1 || cellCount > 64) {
    throw new RangeError('live-line frontier currently supports 1..64 cells');
  }

  const lines = createConnectWinningLines(spec);
  const wordCount = Math.max(1, Math.ceil(lines.length / 32));
  const through = new Uint32Array(cellCount * wordCount);
  const all = new Uint32Array(wordCount);

  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    const word = lineId >>> 5;
    const bit = (1 << (lineId & 31)) >>> 0;
    all[word] = (all[word] | bit) >>> 0;
    for (const cell of lines[lineId]) {
      const at = cell * wordCount + word;
      through[at] = (through[at] | bit) >>> 0;
    }
  }

  const profile = Object.freeze({
    kind: 'connect4-live-winning-line-frontier-profile-v2',
    ...spec,
    cellCount,
    lineCount: lines.length,
    wordCount,
    stateWords: wordCount * 2,
    through,
    all,
  });
  profileCache.set(key, profile);
  return profile;
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
    if (mover !== 0 && mover !== 1) throw new RangeError('mover must be 0 or 1');
    if (!Number.isInteger(cell) || cell < 0 || cell >= profile.cellCount) throw new RangeError('cell out of range');
    const words = profile.wordCount;
    const blockedPlayer = 1 - mover;
    const blockedBase = blockedPlayer * words;
    const throughBase = cell * words;
    for (let index = 0; index < profile.stateWords; index += 1) {
      target[targetOffset + index] = source[sourceOffset + index];
    }
    for (let word = 0; word < words; word += 1) {
      const at = blockedBase + word;
      target[targetOffset + at] = (target[targetOffset + at] & ~profile.through[throughBase + word]) >>> 0;
    }
  }

  function advanceSeed(seed, mover, cell) {
    if (!(seed instanceof Uint32Array) || seed.length !== profile.stateWords) {
      throw new TypeError(`live-line seed must be Uint32Array(${profile.stateWords})`);
    }
    const next = new Uint32Array(profile.stateWords);
    advanceInto(seed, 0, mover, cell, next, 0);
    return next;
  }

  function valueAtSeed(seed, player, cell) {
    if (player !== 0 && player !== 1) throw new RangeError('player must be 0 or 1');
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
    const supportIndex = kernel.states.support[stateId];
    const mover = kernel.supportAccess.rankAt(supportIndex) & 1;
    const scored = [];
    for (let column = 0; column < kernel.columns; column += 1) {
      const landingCell = kernel.supportAccess.landingAt(supportIndex, column);
      if (landingCell === 0xff) continue;
      scored.push(Object.freeze({
        column,
        landingCell,
        value: valueAtSeed(seed, mover, landingCell),
      }));
    }
    scored.sort((left, right) => right.value - left.value || left.column - right.column);
    return scored;
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

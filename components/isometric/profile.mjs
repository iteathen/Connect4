import { CELL_COUNT, COLUMNS, ROWS, WINNING_LINES } from '../domain/index.mjs';

export const FRONTIER_WORDS = 20;
export const SLOT_WORDS = 2;
export const FRONTIER_SLOTS = FRONTIER_WORDS / SLOT_WORDS;

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function cardinality(lo, hi) {
  return popcount32(lo) + popcount32(hi);
}

function pairKey(lo, hi) {
  return `${lo >>> 0}:${hi >>> 0}`;
}

function comparePair(a, b) {
  const countDelta = cardinality(a[0], a[1]) - cardinality(b[0], b[1]);
  if (countDelta !== 0) return countDelta;
  const ah = a[1] >>> 0;
  const bh = b[1] >>> 0;
  if (ah !== bh) return ah < bh ? -1 : 1;
  const al = a[0] >>> 0;
  const bl = b[0] >>> 0;
  return al === bl ? 0 : al < bl ? -1 : 1;
}

function subsetOf(aLo, aHi, bLo, bHi) {
  return (((aLo & ~bLo) >>> 0) === 0) && (((aHi & ~bHi) >>> 0) === 0);
}

function lineMask(line) {
  let lo = 0;
  let hi = 0;
  for (const cell of line) {
    if (cell < 32) lo = (lo | ((2 ** cell) >>> 0)) >>> 0;
    else hi = (hi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
  }
  return [lo >>> 0, hi >>> 0];
}

function enumerateNonemptySubsets(line) {
  const result = [];
  const limit = 1 << line.length;
  for (let subset = 1; subset < limit; subset += 1) {
    let lo = 0;
    let hi = 0;
    for (let index = 0; index < line.length; index += 1) {
      if ((subset & (1 << index)) === 0) continue;
      const cell = line[index];
      if (cell < 32) lo = (lo | ((2 ** cell) >>> 0)) >>> 0;
      else hi = (hi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
    }
    result.push([lo >>> 0, hi >>> 0]);
  }
  return result;
}

function reflectCell(cell) {
  const row = Math.floor(cell / COLUMNS);
  const column = cell - row * COLUMNS;
  return row * COLUMNS + (COLUMNS - 1 - column);
}

function reflectMaskPair(lo, hi) {
  let outLo = 0;
  let outHi = 0;
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const source = cell < 32
      ? (((lo >>> cell) & 1) !== 0)
      : (((hi >>> (cell - 32)) & 1) !== 0);
    if (!source) continue;
    const target = reflectCell(cell);
    if (target < 32) outLo = (outLo | ((2 ** target) >>> 0)) >>> 0;
    else outHi = (outHi | ((2 ** (target - 32)) >>> 0)) >>> 0;
  }
  return [outLo >>> 0, outHi >>> 0];
}

function buildProfile() {
  if (COLUMNS !== 7 || ROWS !== 6 || CELL_COUNT !== 42 || WINNING_LINES.length !== 69) {
    throw new Error('Isometric WSL-625 profile requires the accepted standard 7x6 domain');
  }

  const byKey = new Map();
  for (const line of WINNING_LINES) {
    for (const [lo, hi] of enumerateNonemptySubsets(line)) byKey.set(pairKey(lo, hi), [lo, hi]);
  }
  const terms = [...byKey.values()].sort(comparePair);
  if (terms.length !== 625) throw new Error(`WSL-625 vocabulary drifted: ${terms.length}`);

  const idByKey = new Map(terms.map((term, id) => [pairKey(term[0], term[1]), id]));
  const lo = new Uint32Array(terms.length);
  const hi = new Uint32Array(terms.length);
  const termCardinality = new Uint8Array(terms.length);
  for (let id = 0; id < terms.length; id += 1) {
    lo[id] = terms[id][0] >>> 0;
    hi[id] = terms[id][1] >>> 0;
    termCardinality[id] = cardinality(lo[id], hi[id]);
  }

  const terminal = terms.length;
  const reduce = new Uint16Array(terms.length * CELL_COUNT);
  for (let id = 0; id < terms.length; id += 1) {
    for (let cell = 0; cell < CELL_COUNT; cell += 1) {
      const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
      const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
      const contains = (((lo[id] & bitLo) >>> 0) !== 0) || (((hi[id] & bitHi) >>> 0) !== 0);
      if (!contains) {
        reduce[id * CELL_COUNT + cell] = id;
        continue;
      }
      const nextLo = (lo[id] & ~bitLo) >>> 0;
      const nextHi = (hi[id] & ~bitHi) >>> 0;
      if (nextLo === 0 && nextHi === 0) {
        reduce[id * CELL_COUNT + cell] = terminal;
        continue;
      }
      const nextId = idByKey.get(pairKey(nextLo, nextHi));
      if (nextId === undefined) throw new Error('WSL vocabulary is not closed under one-cell reduction');
      reduce[id * CELL_COUNT + cell] = nextId;
    }
  }

  const initialIds = new Uint16Array(WINNING_LINES.length);
  for (let line = 0; line < WINNING_LINES.length; line += 1) {
    const [lineLo, lineHi] = lineMask(WINNING_LINES[line]);
    const id = idByKey.get(pairKey(lineLo, lineHi));
    if (id === undefined) throw new Error('winning line missing from WSL vocabulary');
    initialIds[line] = id;
  }
  initialIds.sort();

  const containsMasks = new Uint32Array(CELL_COUNT * FRONTIER_WORDS);
  const singletonTermMasks = new Uint32Array(FRONTIER_WORDS);
  let strictSupersetDense = new Uint32Array(terms.length * FRONTIER_WORDS);
  for (let termId = 0; termId < terms.length; termId += 1) {
    const word = termId >>> 5;
    const bit = 1 << (termId & 31);
    if (termCardinality[termId] === 1) singletonTermMasks[word] |= bit;
    for (let cell = 0; cell < CELL_COUNT; cell += 1) {
      const bitLo = cell < 32 ? ((2 ** cell) >>> 0) : 0;
      const bitHi = cell >= 32 ? ((2 ** (cell - 32)) >>> 0) : 0;
      if ((((lo[termId] & bitLo) >>> 0) !== 0) || (((hi[termId] & bitHi) >>> 0) !== 0)) {
        containsMasks[cell * FRONTIER_WORDS + word] |= bit;
      }
    }
    for (let candidate = 0; candidate < terms.length; candidate += 1) {
      if (candidate === termId) continue;
      if (!subsetOf(lo[termId], hi[termId], lo[candidate], hi[candidate])) continue;
      strictSupersetDense[termId * FRONTIER_WORDS + (candidate >>> 5)] |= 1 << (candidate & 31);
    }
  }

  const strictSupersetStarts = new Uint32Array(terms.length + 1);
  let strictSupersetEntryCount = 0;
  for (let termId = 0; termId < terms.length; termId += 1) {
    strictSupersetStarts[termId] = strictSupersetEntryCount;
    const base = termId * FRONTIER_WORDS;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      if (strictSupersetDense[base + word] !== 0) strictSupersetEntryCount += 1;
    }
  }
  strictSupersetStarts[terms.length] = strictSupersetEntryCount;
  const strictSupersetWordIndex = new Uint8Array(strictSupersetEntryCount);
  const strictSupersetWordMask = new Uint32Array(strictSupersetEntryCount);
  let write = 0;
  for (let termId = 0; termId < terms.length; termId += 1) {
    const base = termId * FRONTIER_WORDS;
    for (let word = 0; word < FRONTIER_WORDS; word += 1) {
      const mask = strictSupersetDense[base + word] >>> 0;
      if (mask === 0) continue;
      strictSupersetWordIndex[write] = word;
      strictSupersetWordMask[write] = mask;
      write += 1;
    }
  }
  strictSupersetDense = null;

  const reflectedTermIds = new Uint16Array(terms.length);
  for (let id = 0; id < terms.length; id += 1) {
    const [rLo, rHi] = reflectMaskPair(lo[id], hi[id]);
    const reflected = idByKey.get(pairKey(rLo, rHi));
    if (reflected === undefined) throw new Error('horizontal reflection left the WSL vocabulary');
    reflectedTermIds[id] = reflected;
  }

  let initialPlayableLo = 0;
  let initialPlayableHi = 0;
  for (let column = 0; column < COLUMNS; column += 1) {
    const cell = column;
    if (cell < 32) initialPlayableLo = (initialPlayableLo | ((2 ** cell) >>> 0)) >>> 0;
    else initialPlayableHi = (initialPlayableHi | ((2 ** (cell - 32)) >>> 0)) >>> 0;
  }

  // OWNER-PROTECTED PRELOAD — do not remove/weaken this comment.
  // Standard-profile cell masks are immutable prepared data, not state.
  // Keep both unsigned halves: cell 31 must not leak signedness and cells
  // 32..41 must not wrap into the low word. No exponentiation in recursion.
  const cellLo = new Uint32Array(CELL_COUNT), cellHi = new Uint32Array(CELL_COUNT);
  for (let cell = 0; cell < CELL_COUNT; cell++) {
    if (cell < 32) cellLo[cell] = (1 << cell) >>> 0;
    else cellHi[cell] = (1 << (cell - 32)) >>> 0;
  }
  // OWNER-PROTECTED ENCODING GUARD — do not remove/weaken this comment.
  // Singleton metadata projects directly from residual words 0 and 1 ONLY
  // because singleton term ID equals cell ID in this generated vocabulary.
  // Check the actual mapping, not equal cardinalities. Reject encoding drift
  // before any recursive consumer can use the projection.
  for (let id = 0; id < terms.length; id++) {
    if ((termCardinality[id] === 1) !== (id < CELL_COUNT) ||
        (id < CELL_COUNT && (lo[id] !== cellLo[id] || hi[id] !== cellHi[id])))
      throw new Error('WSL singleton prefix no longer matches cell identity');
  }

  return Object.freeze({
    columns: COLUMNS,
    rows: ROWS,
    cellCount: CELL_COUNT,
    cellLo,
    cellHi,
    lineCount: WINNING_LINES.length,
    count: terms.length,
    terminal,
    lo,
    hi,
    cardinality: termCardinality,
    reduce,
    initialIds,
    containsMasks,
    singletonTermMasks,
    strictSupersetStarts,
    strictSupersetWordIndex,
    strictSupersetWordMask,
    reflectedTermIds,
    initialPlayableLo,
    initialPlayableHi,
    subset(a, b) {
      return subsetOf(lo[a], hi[a], lo[b], hi[b]);
    },
    reflectCell,
    reflectMaskPair,
  });
}

export const ISOMETRIC_PROFILE = buildProfile();

import { createConnectWinningLines } from './geometry.mjs';
import {
  createResidualState,
  normalizeResidualRequirements,
  residualRequirementsImply,
} from './residual-winspace.mjs';

const U32_BITS = 32;

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

function nonnegativeBigInt(value, label) {
  if (typeof value !== 'bigint' || value < 0n) throw new RangeError(`${label} must be a nonnegative bigint mask`);
  return value;
}

function popcount(mask) {
  let value = mask;
  let count = 0;
  while (value !== 0n) {
    value &= value - 1n;
    count += 1;
  }
  return count;
}

function requirementOrder(left, right) {
  const delta = popcount(left) - popcount(right);
  if (delta !== 0) return delta;
  return left < right ? -1 : left > right ? 1 : 0;
}

function setPackedBit(words, bitIndex) {
  const word = Math.floor(bitIndex / U32_BITS);
  const bit = bitIndex & (U32_BITS - 1);
  words[word] = (words[word] | (1 << bit)) >>> 0;
}

function assertWordVector(words, wordCount, label) {
  if (!(words instanceof Uint32Array)) throw new TypeError(`${label} must be a Uint32Array`);
  if (words.length !== wordCount) throw new RangeError(`${label} must contain exactly ${wordCount} u32 words`);
  return words;
}

/** Exact bitset inclusion: every set bit in left must also be set in right. */
export function packedRequirementClosureSubset(left, right) {
  if (!(left instanceof Uint32Array) || !(right instanceof Uint32Array)) {
    throw new TypeError('packed requirement closures must be Uint32Array values');
  }
  if (left.length !== right.length) throw new RangeError('packed requirement closures must have equal word counts');
  for (let word = 0; word < left.length; word += 1) {
    if ((left[word] & ~right[word]) !== 0) return false;
  }
  return true;
}

function collectResidualUniverse(winningLineMasks) {
  const unique = new Set();
  for (const lineMask of winningLineMasks) {
    for (let subset = lineMask; subset !== 0n; subset = (subset - 1n) & lineMask) {
      unique.add(subset.toString());
    }
  }
  return [...unique].map(BigInt).sort(requirementOrder);
}

/**
 * Fixed-width implementation representation of one geometry's residual
 * requirement lattice. For standard 7x6 connect-4 this is WSL-625.
 *
 * A normalized requirement antichain A is represented by the bitset Up(A):
 * every lattice requirement that contains at least one member of A. Exact
 * monotone-DNF implication is then ordinary packed bitset inclusion:
 *
 *   A implies B  iff  Up(A) subset_of Up(B)
 */
export function createPackedResidualRequirementLattice({ columns, rows, connect }) {
  const width = positiveSafeInteger(columns, 'columns');
  const height = positiveSafeInteger(rows, 'rows');
  const length = positiveSafeInteger(connect, 'connect');
  const lines = createConnectWinningLines({ columns: width, rows: height, connect: length });
  const winningLineMasks = Object.freeze(lines.map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  }));
  const requirementMasks = Object.freeze(collectResidualUniverse(winningLineMasks));
  const requirementCount = requirementMasks.length;
  const wordCount = Math.ceil(requirementCount / U32_BITS);
  const idByMask = new Map(requirementMasks.map((mask, index) => [mask.toString(), index]));
  const upwardClosureWords = new Uint32Array(requirementCount * wordCount);

  for (let baseId = 0; baseId < requirementCount; baseId += 1) {
    const base = requirementMasks[baseId];
    const row = upwardClosureWords.subarray(baseId * wordCount, (baseId + 1) * wordCount);
    for (let candidateId = 0; candidateId < requirementCount; candidateId += 1) {
      const candidate = requirementMasks[candidateId];
      if ((base & ~candidate) === 0n) setPackedBit(row, candidateId);
    }
  }

  function requirementId(mask) {
    const normalized = nonnegativeBigInt(mask, 'requirement');
    if (normalized === 0n) throw new RangeError('empty requirement is terminal and has no residual lattice ID');
    const id = idByMask.get(normalized.toString());
    if (id === undefined) throw new RangeError('requirement is outside this geometry residual lattice');
    return id;
  }

  function upwardClosureForRequirement(maskOrId) {
    const id = typeof maskOrId === 'number'
      ? maskOrId
      : requirementId(maskOrId);
    if (!Number.isSafeInteger(id) || id < 0 || id >= requirementCount) throw new RangeError('requirement ID is out of range');
    return upwardClosureWords.slice(id * wordCount, (id + 1) * wordCount);
  }

  function encodeRequirements(requirements) {
    const normalized = normalizeResidualRequirements(requirements);
    const words = new Uint32Array(wordCount);
    for (const requirement of normalized) {
      const id = requirementId(requirement);
      const source = upwardClosureWords.subarray(id * wordCount, (id + 1) * wordCount);
      for (let word = 0; word < wordCount; word += 1) words[word] = (words[word] | source[word]) >>> 0;
    }
    return words;
  }

  function requirementsImplyPacked(antecedent, consequent) {
    const left = encodeRequirements(antecedent);
    const right = encodeRequirements(consequent);
    return packedRequirementClosureSubset(left, right);
  }

  function assertImplicationEquivalent(antecedent, consequent) {
    const expected = residualRequirementsImply(antecedent, consequent);
    const actual = requirementsImplyPacked(antecedent, consequent);
    if (actual !== expected) throw new Error('packed residual requirement implication disagrees with maintained semantic implication');
    return actual;
  }

  function encodeResidualState(state) {
    const normalized = createResidualState(state);
    return Object.freeze({
      supportIndex: normalized.supportIndex,
      sideToMove: normalized.sideToMove,
      p0ClosureWords: encodeRequirements(normalized.p0Requirements),
      p1ClosureWords: encodeRequirements(normalized.p1Requirements),
    });
  }

  /** Candidate >= reference in the C4-0006 P0-favourable residual order. */
  function residualStateAtLeastAsFavorablePacked(candidate, reference) {
    const left = encodeResidualState(candidate);
    const right = encodeResidualState(reference);
    if (left.supportIndex !== right.supportIndex || left.sideToMove !== right.sideToMove) {
      throw new RangeError('packed residual dominance requires identical support and side-to-move context');
    }
    // reference.p0 implies candidate.p0; candidate.p1 implies reference.p1
    return packedRequirementClosureSubset(right.p0ClosureWords, left.p0ClosureWords)
      && packedRequirementClosureSubset(left.p1ClosureWords, right.p1ClosureWords);
  }

  return Object.freeze({
    kind: 'connect4-packed-residual-requirement-lattice',
    columns: width,
    rows: height,
    connect: length,
    winningLineCount: winningLineMasks.length,
    winningLineMasks,
    requirementCount,
    wordCount,
    packedBytesPerClosure: wordCount * 4,
    requirementMasks,
    requirementId,
    upwardClosureForRequirement,
    encodeRequirements,
    requirementsImplyPacked,
    assertImplicationEquivalent,
    encodeResidualState,
    residualStateAtLeastAsFavorablePacked,
    /** Flat row-major requirementCount x wordCount table for device upload. */
    upwardClosureTableU32() {
      return upwardClosureWords.slice();
    },
    validatePackedClosure(words, label = 'closure') {
      return assertWordVector(words, wordCount, label);
    },
  });
}

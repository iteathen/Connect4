export const PROOF_LOWER_MASK = 0b00000011;
export const PROOF_UPPER_MASK = 0b00001100;
export const HINT_BEST_MOVE_MASK = 0b01110000;

const PROOF_MIN = -1;
const PROOF_MAX = 1;
const HINT_NONE = 7;
const HINT_MAX_COLUMN = 6;

export const INITIAL_SEARCH_RECORD = ((PROOF_MAX + 1) << 2) | (HINT_NONE << 4);

function assertProofValue(value, label) {
  if (!Number.isInteger(value) || value < PROOF_MIN || value > PROOF_MAX) {
    throw new RangeError(`${label} must be an integer in ${PROOF_MIN}..${PROOF_MAX}, got ${value}`);
  }
}

function assertBestMove(bestMove) {
  if (!Number.isInteger(bestMove) || bestMove < -1 || bestMove > HINT_MAX_COLUMN) {
    throw new RangeError(`best-move hint must be an integer in -1..${HINT_MAX_COLUMN}, got ${bestMove}`);
  }
}

export function assertSearchRecord(record) {
  if (!Number.isInteger(record) || record < 0 || record > 0x7f) {
    throw new RangeError(`packed search record must be an integer in 0..127, got ${record}`);
  }
  const lower = record & PROOF_LOWER_MASK;
  const upper = (record & PROOF_UPPER_MASK) >>> 2;
  if (lower > 2 || upper > 2 || lower > upper) {
    throw new Error(`packed search record has invalid proof bounds: ${record}`);
  }
  return record;
}

export function proofLower(record) {
  assertSearchRecord(record);
  return (record & PROOF_LOWER_MASK) - 1;
}

export function proofUpper(record) {
  assertSearchRecord(record);
  return ((record & PROOF_UPPER_MASK) >>> 2) - 1;
}

export function bestMoveHint(record) {
  assertSearchRecord(record);
  const best = (record & HINT_BEST_MOVE_MASK) >>> 4;
  return best === HINT_NONE ? -1 : best;
}

export function withProofLower(record, value) {
  assertSearchRecord(record);
  assertProofValue(value, 'proof lower');
  return assertSearchRecord((record & ~PROOF_LOWER_MASK) | (value + 1));
}

export function withProofUpper(record, value) {
  assertSearchRecord(record);
  assertProofValue(value, 'proof upper');
  return assertSearchRecord((record & ~PROOF_UPPER_MASK) | ((value + 1) << 2));
}

export function withBestMoveHint(record, bestMove) {
  assertSearchRecord(record);
  assertBestMove(bestMove);
  const encoded = bestMove < 0 ? HINT_NONE : bestMove;
  return (record & ~HINT_BEST_MOVE_MASK) | (encoded << 4);
}

export function withProofBounds(record, lower, upper) {
  assertSearchRecord(record);
  assertProofValue(lower, 'proof lower');
  assertProofValue(upper, 'proof upper');
  if (lower > upper) throw new Error(`contradictory proof bounds: ${lower} > ${upper}`);
  return (record & ~(PROOF_LOWER_MASK | PROOF_UPPER_MASK))
    | (lower + 1)
    | ((upper + 1) << 2);
}

export function exactProofRecord(value, bestMove = -1) {
  assertProofValue(value, 'exact proof value');
  assertBestMove(bestMove);
  let record = withProofBounds(INITIAL_SEARCH_RECORD, value, value);
  if (bestMove >= 0) record = withBestMoveHint(record, bestMove);
  return record;
}

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

export function proofLower(record) {
  return (record & PROOF_LOWER_MASK) - 1;
}

export function proofUpper(record) {
  return ((record & PROOF_UPPER_MASK) >>> 2) - 1;
}

export function bestMoveHint(record) {
  const best = (record & HINT_BEST_MOVE_MASK) >>> 4;
  return best === HINT_NONE ? -1 : best;
}

export function withProofLower(record, value) {
  assertProofValue(value, 'proof lower');
  return (record & ~PROOF_LOWER_MASK) | (value + 1);
}

export function withProofUpper(record, value) {
  assertProofValue(value, 'proof upper');
  return (record & ~PROOF_UPPER_MASK) | ((value + 1) << 2);
}

export function withBestMoveHint(record, bestMove) {
  assertBestMove(bestMove);
  const encoded = bestMove < 0 ? HINT_NONE : bestMove;
  return (record & ~HINT_BEST_MOVE_MASK) | (encoded << 4);
}

export function withProofBounds(record, lower, upper) {
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

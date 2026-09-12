export const PROOF_LOWER_MASK = 0b00000011;
export const PROOF_UPPER_MASK = 0b00001100;
export const HINT_BEST_MOVE_MASK = 0b01110000;

export const INITIAL_SEARCH_RECORD = ((1 + 1) << 2) | (7 << 4);

export function proofLower(record) {
  return (record & PROOF_LOWER_MASK) - 1;
}

export function proofUpper(record) {
  return ((record & PROOF_UPPER_MASK) >>> 2) - 1;
}

export function bestMoveHint(record) {
  const best = (record & HINT_BEST_MOVE_MASK) >>> 4;
  return best === 7 ? -1 : best;
}

export function withProofLower(record, value) {
  return (record & ~PROOF_LOWER_MASK) | ((value + 1) & 3);
}

export function withProofUpper(record, value) {
  return (record & ~PROOF_UPPER_MASK) | (((value + 1) & 3) << 2);
}

export function withBestMoveHint(record, bestMove) {
  return (record & ~HINT_BEST_MOVE_MASK) | (((bestMove < 0 ? 7 : bestMove) & 7) << 4);
}

export function withProofBounds(record, lower, upper) {
  return (record & ~(PROOF_LOWER_MASK | PROOF_UPPER_MASK))
    | ((lower + 1) & 3)
    | (((upper + 1) & 3) << 2);
}

export function exactProofRecord(value, bestMove = -1) {
  let record = withProofBounds(INITIAL_SEARCH_RECORD, value, value);
  if (bestMove >= 0) record = withBestMoveHint(record, bestMove);
  return record;
}

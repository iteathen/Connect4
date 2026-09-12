export const QN_ILLEGAL = -2;
export const QN_TERMINAL_WIN = -1;

export const TACTICAL_NONE = -100;
export const TACTICAL_DRAW = -101;
export const TACTICAL_LOSS = -102;
export const TACTICAL_IMMEDIATE_BASE = 64;

export const FRONTIER_BOUND_NONE = 0;
export const FRONTIER_BOUND_MOVER_NO_WIN = 1;
export const FRONTIER_BOUND_OPPONENT_NO_WIN = 2;
export const FRONTIER_BOUND_DRAW = 3;

export const WDL_MIN = -1;
export const WDL_MAX = 1;

function assertInteger(value, label) {
  if (!Number.isInteger(value)) throw new TypeError(`${label} must be an integer, got ${value}`);
}

export function assertWdlValue(value, label = 'WDL value') {
  assertInteger(value, label);
  if (value < WDL_MIN || value > WDL_MAX) {
    throw new RangeError(`${label} must be in ${WDL_MIN}..${WDL_MAX}, got ${value}`);
  }
  return value;
}

export function assertWdlInterval(lower, upper, label = 'WDL interval') {
  assertWdlValue(lower, `${label} lower`);
  assertWdlValue(upper, `${label} upper`);
  if (lower > upper) throw new Error(`${label} is contradictory: ${lower} > ${upper}`);
  return [lower, upper];
}

export function assertSearchWindow(alpha, beta, label = 'search window') {
  assertInteger(alpha, `${label} alpha`);
  assertInteger(beta, `${label} beta`);
  if (alpha < -2 || alpha > 1 || beta < -1 || beta > 2 || alpha >= beta) {
    throw new RangeError(`${label} must satisfy -2 <= alpha < beta <= 2, got [${alpha}, ${beta})`);
  }
  return [alpha, beta];
}

function assertTacticalColumns(columns) {
  assertInteger(columns, 'tactical columns');
  if (columns < 1 || columns > TACTICAL_IMMEDIATE_BASE) {
    throw new RangeError(`tactical columns must be in 1..${TACTICAL_IMMEDIATE_BASE}, got ${columns}`);
  }
}

export function tacticalExactValue(code) {
  if (!Number.isInteger(code)) return null;
  if (code >= TACTICAL_IMMEDIATE_BASE) return 1;
  if (code === TACTICAL_LOSS) return -1;
  if (code === TACTICAL_DRAW) return 0;
  return null;
}

export function tacticalImmediateColumn(code) {
  return Number.isInteger(code) && code >= TACTICAL_IMMEDIATE_BASE
    ? code - TACTICAL_IMMEDIATE_BASE
    : -1;
}

export function tacticalForcedColumn(code, columns) {
  assertTacticalColumns(columns);
  return Number.isInteger(code) && code >= 0 && code < columns ? code : -1;
}

export function assertTacticalCode(code, columns) {
  assertTacticalColumns(columns);
  assertInteger(code, 'tactical code');
  if (code === TACTICAL_NONE || code === TACTICAL_DRAW || code === TACTICAL_LOSS) return code;
  if (code >= TACTICAL_IMMEDIATE_BASE) {
    const column = tacticalImmediateColumn(code);
    if (column >= 0 && column < columns) return code;
  }
  if (code >= 0 && code < columns) return code;
  throw new Error(`unexpected tactical code ${code} for ${columns} columns`);
}

export function applyFrontierBoundCode(code, lower, upper) {
  assertInteger(code, 'frontier bound code');
  assertWdlInterval(lower, upper, 'stored proof interval');
  let nextLower = lower;
  let nextUpper = upper;
  if (code === FRONTIER_BOUND_NONE) return [nextLower, nextUpper];
  if (code === FRONTIER_BOUND_MOVER_NO_WIN) nextUpper = Math.min(nextUpper, 0);
  else if (code === FRONTIER_BOUND_OPPONENT_NO_WIN) nextLower = Math.max(nextLower, 0);
  else if (code === FRONTIER_BOUND_DRAW) {
    nextLower = Math.max(nextLower, 0);
    nextUpper = Math.min(nextUpper, 0);
  } else {
    throw new Error(`unexpected frontier bound code ${code}`);
  }
  if (nextLower > nextUpper) {
    throw new Error(
      `frontier bound ${code} contradicts stored proof interval [${lower}, ${upper}]: `
      + `[${nextLower}, ${nextUpper}]`,
    );
  }
  return [nextLower, nextUpper];
}

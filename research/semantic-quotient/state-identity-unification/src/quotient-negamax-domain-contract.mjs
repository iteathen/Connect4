export const QN_ILLEGAL = -2;
export const QN_TERMINAL_WIN = -1;

export const TACTICAL_NONE = -100;
export const TACTICAL_DRAW = -101;
export const TACTICAL_LOSS = -102;
export const TACTICAL_IMMEDIATE_BASE = 64;

export function tacticalExactValue(code) {
  if (code >= TACTICAL_IMMEDIATE_BASE) return 1;
  if (code === TACTICAL_LOSS) return -1;
  if (code === TACTICAL_DRAW) return 0;
  return null;
}

export function tacticalImmediateColumn(code) {
  return code >= TACTICAL_IMMEDIATE_BASE ? code - TACTICAL_IMMEDIATE_BASE : -1;
}

export function tacticalForcedColumn(code, columns) {
  return Number.isInteger(code) && code >= 0 && code < columns ? code : -1;
}

export function assertTacticalCode(code, columns) {
  if (code === TACTICAL_NONE || code === TACTICAL_DRAW || code === TACTICAL_LOSS) return;
  if (code >= TACTICAL_IMMEDIATE_BASE) {
    const column = tacticalImmediateColumn(code);
    if (column >= 0 && column < columns) return;
  }
  if (tacticalForcedColumn(code, columns) >= 0) return;
  throw new Error(`unexpected tactical code ${code}`);
}

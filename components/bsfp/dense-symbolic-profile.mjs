import { createWinningLineMasksU32 } from './geometry.mjs';
import { BSFP_4X3_CONNECT3_SUPPORT } from './support-lattice.mjs';

const GEOMETRY = Object.freeze({ columns: 4, rows: 3, connect: 3 });
const CELL_COUNT = GEOMETRY.columns * GEOMETRY.rows;
const ASSIGNMENT_COUNT = 2 ** CELL_COUNT;
const BOARD_MASK = ASSIGNMENT_COUNT - 1;

function buildFilledMasks() {
  const masks = new Uint32Array(BSFP_4X3_CONNECT3_SUPPORT.itemCapacity);
  for (let supportIndex = 0; supportIndex < masks.length; supportIndex += 1) {
    const heights = BSFP_4X3_CONNECT3_SUPPORT.decodeHeights(supportIndex);
    let mask = 0;
    for (let column = 0; column < GEOMETRY.columns; column += 1) {
      for (let row = 0; row < heights[column]; row += 1) {
        mask = (mask | (1 << (row * GEOMETRY.columns + column))) >>> 0;
      }
    }
    masks[supportIndex] = mask;
  }
  return masks;
}

export function encodeBsfpWdlU32(value) {
  if (value !== -1 && value !== 0 && value !== 1) throw new RangeError('BSFP W/D/L value must be -1, 0, or 1');
  return value + 1;
}

export function decodeBsfpWdlU32(value) {
  if (value !== 0 && value !== 1 && value !== 2) throw new RangeError('encoded BSFP W/D/L must be 0, 1, or 2');
  return value - 1;
}

export function ownershipMaskFromCells(cells) {
  if (!cells || typeof cells.length !== 'number' || cells.length < CELL_COUNT) {
    throw new RangeError('cells must cover the 4x3 geometry');
  }
  let mask = 0;
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const value = cells[cell];
    if (value !== 0 && value !== 1 && value !== 2) throw new RangeError('cell encoding must be 0, 1, or 2');
    if (value === 2) mask = (mask | (1 << cell)) >>> 0;
  }
  return mask;
}

export const BSFP_4X3_CONNECT3_DENSE_PROFILE = Object.freeze({
  kind: 'connect4-bsfp-dense-symbolic-profile',
  geometry: GEOMETRY,
  cellCount: CELL_COUNT,
  assignmentCount: ASSIGNMENT_COUNT,
  boardMask: BOARD_MASK,
  support: BSFP_4X3_CONNECT3_SUPPORT,
  tableElements: BSFP_4X3_CONNECT3_SUPPORT.itemCapacity * ASSIGNMENT_COUNT,
  tableBytes: BSFP_4X3_CONNECT3_SUPPORT.itemCapacity * ASSIGNMENT_COUNT * 4,
  ranks: BSFP_4X3_CONNECT3_SUPPORT.ranks,
  filledMasks: buildFilledMasks(),
  winningLineMasks: createWinningLineMasksU32(GEOMETRY),
  resultEncoding: Object.freeze({ loss: 0, draw: 1, win: 2, perspective: 'player0' }),
});

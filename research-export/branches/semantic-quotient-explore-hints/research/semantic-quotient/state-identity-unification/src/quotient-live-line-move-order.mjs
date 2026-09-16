import { createConnectWinningLines } from '../../../../components/bsfp/geometry.mjs';

const profileCache = new Map();

function cacheKey(spec) {
  return `${spec.columns}x${spec.rows}c${spec.connect}`;
}

function cellBit(cell) {
  if (cell < 32) return [((2 ** cell) >>> 0), 0];
  return [0, ((2 ** (cell - 32)) >>> 0)];
}

function buildProfile(spec) {
  const key = cacheKey(spec);
  const prior = profileCache.get(key);
  if (prior) return prior;

  const cellCount = spec.columns * spec.rows;
  if (!Number.isSafeInteger(cellCount) || cellCount < 1 || cellCount > 64) {
    throw new RangeError('live-line move ordering currently supports 1..64 cells');
  }

  const lines = createConnectWinningLines(spec);
  const lineLo = new Uint32Array(lines.length);
  const lineHi = new Uint32Array(lines.length);
  const memberships = new Uint16Array(cellCount);

  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    let lo = 0;
    let hi = 0;
    for (const cell of lines[lineId]) {
      const [bitLo, bitHi] = cellBit(cell);
      lo = (lo | bitLo) >>> 0;
      hi = (hi | bitHi) >>> 0;
      memberships[cell] += 1;
    }
    lineLo[lineId] = lo;
    lineHi[lineId] = hi;
  }

  const offsets = new Uint32Array(cellCount + 1);
  for (let cell = 0; cell < cellCount; cell += 1) offsets[cell + 1] = offsets[cell] + memberships[cell];
  const lineIds = lines.length <= 0xffff ? new Uint16Array(offsets[cellCount]) : new Uint32Array(offsets[cellCount]);
  const cursors = new Uint32Array(offsets);
  for (let lineId = 0; lineId < lines.length; lineId += 1) {
    for (const cell of lines[lineId]) lineIds[cursors[cell]++] = lineId;
  }

  const profile = Object.freeze({
    kind: 'connect4-live-line-incidence-profile-v1',
    ...spec,
    cellCount,
    lineCount: lines.length,
    lineLo,
    lineHi,
    offsets,
    lineIds,
  });
  profileCache.set(key, profile);
  return profile;
}

export function createLiveLineMoveOrder(spec, centerOrder) {
  const profile = buildProfile(spec);
  const centerRank = new Int16Array(spec.columns);
  centerRank.fill(0x7fff);
  for (let index = 0; index < centerOrder.length; index += 1) centerRank[centerOrder[index]] = index;

  function valueAt(cell, opponentLo, opponentHi) {
    const start = profile.offsets[cell];
    const end = profile.offsets[cell + 1];
    let value = 0;
    for (let at = start; at < end; at += 1) {
      const lineId = profile.lineIds[at];
      if ((((profile.lineLo[lineId] & opponentLo) >>> 0) !== 0)
        || (((profile.lineHi[lineId] & opponentHi) >>> 0) !== 0)) continue;
      value += 1;
    }
    return value;
  }

  function orderLegal(kernel, stateId, occupancy) {
    const supportIndex = kernel.states.support[stateId];
    const mover = kernel.supportAccess.rankAt(supportIndex) & 1;
    const opponentLo = mover === 0 ? occupancy.p1Lo : occupancy.p0Lo;
    const opponentHi = mover === 0 ? occupancy.p1Hi : occupancy.p0Hi;
    const scored = [];
    for (const column of centerOrder) {
      const landingCell = kernel.supportAccess.landingAt(supportIndex, column);
      if (landingCell === 0xff) continue;
      scored.push({
        column,
        landingCell,
        value: valueAt(landingCell, opponentLo, opponentHi),
        centerRank: centerRank[column],
      });
    }
    scored.sort((left, right) => right.value - left.value || left.centerRank - right.centerRank || left.column - right.column);
    return scored;
  }

  return Object.freeze({ profile, valueAt, orderLegal });
}

export function addOccupancyStone(occupancy, player, cell) {
  const [bitLo, bitHi] = cellBit(cell);
  if (player === 0) {
    return Object.freeze({
      p0Lo: (occupancy.p0Lo | bitLo) >>> 0,
      p0Hi: (occupancy.p0Hi | bitHi) >>> 0,
      p1Lo: occupancy.p1Lo >>> 0,
      p1Hi: occupancy.p1Hi >>> 0,
    });
  }
  return Object.freeze({
    p0Lo: occupancy.p0Lo >>> 0,
    p0Hi: occupancy.p0Hi >>> 0,
    p1Lo: (occupancy.p1Lo | bitLo) >>> 0,
    p1Hi: (occupancy.p1Hi | bitHi) >>> 0,
  });
}

export const EMPTY_OCCUPANCY = Object.freeze({ p0Lo: 0, p0Hi: 0, p1Lo: 0, p1Hi: 0 });

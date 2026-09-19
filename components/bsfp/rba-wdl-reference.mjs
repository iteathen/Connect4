import { performance } from 'node:perf_hooks';
import { createConnectWinningLines } from './geometry.mjs';

// Isolated Node qualification profile, not a CUDA implementation or NDC proof.
export const RBA_PROFILE = 'connect4-rba-wdl-reference-v1';
export const RBA_RESEARCH_REVISION = '104abfbe4444fcd315ac807b46ce2be8da13df39';
export const subset = (a, b) => (a & ~b) === 0n;
const bit = i => 1n << BigInt(i);
const numericOrder = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export function normalizeBoundary(values, maximal = false, metrics = null) {
  const start = performance.now();
  const result = [];
  for (const value of new Set(values)) {
    if (typeof value !== 'bigint' || value < 0n) throw new RangeError('boundary mask must be nonnegative bigint');
    if (result.some(other => maximal ? subset(value, other) : subset(other, value))) continue;
    for (let i = result.length - 1; i >= 0; i--) {
      if (maximal ? subset(result[i], value) : subset(value, result[i])) result.splice(i, 1);
    }
    result.push(value);
  }
  result.sort(numericOrder);
  if (metrics) {
    metrics.normalizationCalls++;
    metrics.normalizationMs += performance.now() - start;
  }
  return Object.freeze(result);
}

/** Exact local-skyline law: Max{a & b} = Max union_a Max_b{a & b}.
 * Factor order is caller order, never chosen by ordered-prefix sampling.
 */
export function intersectLowerBoundaries(left, right, metrics = null, charge = () => {}) {
  const candidates = [];
  for (const a of left) {
    const projected = [];
    for (const b of right) {
      charge();
      projected.push(a & b);
      if (metrics) metrics.projectionQueries++;
    }
    const local = normalizeBoundary(projected, true, metrics);
    if (metrics) {
      metrics.localSkylineRecords += local.length;
      metrics.maximumLocalSkyline = Math.max(metrics.maximumLocalSkyline, local.length);
    }
    for (const value of local) candidates.push(value);
  }
  return normalizeBoundary(candidates, true, metrics);
}

export function createRbaFiber(geometry, heights) {
  const { columns, rows, connect } = geometry;
  if (![columns, rows, connect].every(v => Number.isSafeInteger(v) && v > 0)
      || !Number.isSafeInteger(columns * rows)) throw new RangeError('invalid RBA geometry');
  if (!Array.isArray(heights) || heights.length !== columns
      || heights.some(h => !Number.isInteger(h) || h < 0 || h > rows)) throw new RangeError('invalid RBA support');
  let occupied = 0n;
  for (let c = 0; c < columns; c++) for (let r = 0; r < heights[c]; r++) occupied |= bit(r * columns + c);
  const lineMasks = createConnectWinningLines(geometry).map(line => line.reduce((m, c) => m | bit(c), 0n));
  const shapes = [...new Set(lineMasks.map(line => line & ~occupied).filter(Boolean))].sort(numericOrder);
  const n = shapes.length;
  const top = bit(n) - 1n;
  const up = shapes.map(shape => shapes.reduce((m, other, i) => subset(shape, other) ? m | bit(i) : m, 0n));
  const ids = new Map(shapes.map((shape, i) => [shape, i]));
  function encode(requirements) {
    let result = 0n;
    for (const requirement of requirements) {
      const id = ids.get(requirement);
      if (id === undefined) throw new RangeError('requirement outside support-local residual shape domain');
      result |= up[id];
    }
    return result;
  }
  function assertUpset(value) {
    if (typeof value !== 'bigint' || value < 0n || !subset(value, top)) throw new RangeError('invalid fiber upset');
    for (let i = 0; i < n; i++) if ((value & bit(i)) && !subset(up[i], value)) throw new RangeError('fiber coordinate is not an upset');
  }
  function pack(mover, opponent) {
    assertUpset(mover); assertUpset(opponent);
    return mover | ((top ^ opponent) << BigInt(n));
  }
  function unpack(value) {
    if (typeof value !== 'bigint' || value < 0n || !subset(value, (top << BigInt(n)) | top)) throw new RangeError('invalid fiber state');
    const m = value & top, o = top ^ (value >> BigInt(n));
    assertUpset(m); assertUpset(o);
    return [m, o];
  }
  return Object.freeze({ profile: RBA_PROFILE, geometry: Object.freeze({ ...geometry }),
    key: JSON.stringify([RBA_PROFILE, columns, rows, connect, heights]),
    heights: Object.freeze(heights.slice()), rank: heights.reduce((a, b) => a + b, 0),
    occupied, lineMasks: Object.freeze(lineMasks), shapes: Object.freeze(shapes),
    up: Object.freeze(up), top, full: top | (top << BigInt(n)), encode, pack, unpack });
}

/** Join-preserving cofactor on principal upsets. null is the adjoined WIN_NOW top. */
export function createRbaCofactor(parent, child, column, owner) {
  const { columns, rows } = parent.geometry;
  if (child.geometry.columns !== columns || child.geometry.rows !== rows
      || child.geometry.connect !== parent.geometry.connect
      || !Number.isInteger(column) || column < 0 || column >= columns
      || parent.heights[column] >= rows
      || child.heights.some((h, c) => h !== parent.heights[c] + (c === column ? 1 : 0))) {
    throw new RangeError('cofactor requires one exact legal support edge');
  }
  if (typeof owner !== 'boolean') throw new TypeError('owner must be boolean');
  const landing = bit(parent.heights[column] * columns + column);
  const images = parent.shapes.map(shape => {
    if (!(shape & landing)) return child.encode([shape]);
    if (!owner) return 0n;
    const residual = shape & ~landing;
    return residual === 0n ? null : child.encode([residual]);
  });
  const terminal = normalizeBoundary(parent.up.filter((_, i) => images[i] === null));
  const minCache = new Map(), maxCache = new Map(); // fiber + action + owner scoped exact coordinate keys
  function rightAdjoint(target) {
    if (maxCache.has(target)) return maxCache.get(target);
    let result = 0n;
    for (let i = 0; i < images.length; i++) if (images[i] !== null && subset(images[i], target)) result |= parent.up[i];
    maxCache.set(target, result);
    return result;
  }
  function minimalCovers(target, metrics, charge) {
    if (minCache.has(target)) return minCache.get(target);
    let covers = [0n];
    // Cover every child upset bit using principal parent images. Terminal
    // principals are excluded; the separate immediate-win branch owns them.
    for (let i = 0; i < child.shapes.length; i++) {
      if (!(target & bit(i))) continue;
      const options = normalizeBoundary(parent.up.filter((_, j) => images[j] !== null && (images[j] & bit(i))));
      const next = [];
      for (const cover of covers) for (const option of options) { charge(); next.push(cover | option); }
      covers = normalizeBoundary(next, false, metrics);
      if (!covers.length) break;
    }
    minCache.set(target, covers);
    return covers;
  }
  return Object.freeze({ images: Object.freeze(images), terminal, rightAdjoint, minimalCovers });
}

export function solveRbaWdl(geometry, {
  minimumHeights = Array(geometry.columns).fill(0),
  maxSupports = 4096, maxCandidates = 2_000_000, maxFrontier = 50_000,
  onSupport = null,
} = {}) {
  for (const limit of [maxSupports, maxCandidates, maxFrontier]) if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('RBA limits must be positive safe integers');
  createRbaFiber(geometry, minimumHeights); // validate before cone construction
  const coneSize = minimumHeights.reduce((a, h) => a * (geometry.rows - h + 1), 1);
  if (!Number.isSafeInteger(coneSize) || coneSize > maxSupports) throw new RangeError('RBA_SUPPORT_LIMIT: incomplete, no WDL result');
  const start = performance.now();
  const metrics = { supports: 0, generatedCandidates: 0, projectionQueries: 0,
    localSkylineRecords: 0, maximumLocalSkyline: 0, maximumActionBoundary: 0,
    normalizationCalls: 0, normalizationMs: 0, boundaryRecords: 0, maximumBoundary: 0 };
  const charge = () => {
    if (++metrics.generatedCandidates > maxCandidates) throw new RangeError('RBA_CANDIDATE_LIMIT: incomplete, no WDL result');
  };
  // Enumerate support skeletons only. Neither physical boards nor q interiors
  // are generated by this construction. All children are finalized first.
  let supports = [[]];
  for (const minimum of minimumHeights) {
    const next = [];
    for (const prefix of supports) for (let h = minimum; h <= geometry.rows; h++) next.push([...prefix, h]);
    supports = next;
  }
  supports.sort((a, b) => b.reduce((x, y) => x + y, 0) - a.reduce((x, y) => x + y, 0));
  const completed = new Map(); // VALUE_BOUNDARY_ITEM: invocation geometry/profile + exact support + threshold/polarity
  const supportKey = h => h.join(',');
  for (const heights of supports) {
    const fiber = createRbaFiber(geometry, heights);
    let upper0 = [], upper1 = [], lowerMinus1 = [fiber.full], lower0 = [fiber.full];
    let actions = 0;
    for (let column = 0; column < geometry.columns; column++) {
      if (heights[column] === geometry.rows) continue;
      actions++;
      const childHeights = heights.slice(); childHeights[column]++;
      const child = completed.get(supportKey(childHeights));
      if (!child) throw new Error('RBA incomplete child publication');
      const own = createRbaCofactor(fiber, child.fiber, column, true);
      const opp = createRbaCofactor(fiber, child.fiber, column, false);
      const actionUpper = lower => {
        const candidates = own.terminal.map(m => fiber.pack(m, fiber.top));
        for (const generator of lower) {
          const [childMover, childOpponent] = child.fiber.unpack(generator);
          const cap = opp.rightAdjoint(childMover);
          for (const minimum of own.minimalCovers(childOpponent, metrics, charge)) {
            charge(); candidates.push(fiber.pack(minimum, cap));
          }
        }
        return normalizeBoundary(candidates, false, metrics);
      };
      const actionLower = upper => {
        const candidates = [];
        for (const generator of upper) {
          const [childMover, childOpponent] = child.fiber.unpack(generator);
          const cap = own.rightAdjoint(childOpponent); // excludes WIN_NOW, including on full-board edge
          for (const minimum of opp.minimalCovers(childMover, metrics, charge)) {
            charge(); candidates.push(fiber.pack(cap, minimum));
          }
        }
        return normalizeBoundary(candidates, true, metrics);
      };
      const u0 = actionUpper(child.lower0), u1 = actionUpper(child.lowerMinus1);
      const lm1 = actionLower(child.upper1), l0 = actionLower(child.upper0);
      metrics.maximumActionBoundary = Math.max(metrics.maximumActionBoundary, u0.length, u1.length, lm1.length, l0.length);
      upper0 = normalizeBoundary([...upper0, ...u0], false, metrics);
      upper1 = normalizeBoundary([...upper1, ...u1], false, metrics);
      lowerMinus1 = intersectLowerBoundaries(lowerMinus1, lm1, metrics, charge);
      lower0 = intersectLowerBoundaries(lower0, l0, metrics, charge);
      if (Math.max(upper0.length, upper1.length, lowerMinus1.length, lower0.length) > maxFrontier) throw new RangeError('RBA_FRONTIER_LIMIT: incomplete, no WDL result');
    }
    if (!actions) { upper0 = [0n]; upper1 = []; lowerMinus1 = []; lower0 = [fiber.full]; }
    const entry = Object.freeze({ fiber, upper0: Object.freeze(upper0), upper1: Object.freeze(upper1),
      lowerMinus1: Object.freeze(lowerMinus1), lower0: Object.freeze(lower0) });
    completed.set(supportKey(heights), entry);
    metrics.supports++;
    metrics.boundaryRecords += upper0.length + upper1.length + lowerMinus1.length + lower0.length;
    metrics.maximumBoundary = Math.max(metrics.maximumBoundary, upper0.length, upper1.length, lowerMinus1.length, lower0.length);
    onSupport?.(entry);
  }
  function evaluate({ heights, p0Requirements, p1Requirements }) {
    const entry = completed.get(supportKey(heights));
    if (!entry) throw new RangeError('support outside completed RBA cone');
    const { fiber } = entry;
    const a = fiber.encode(p0Requirements), b = fiber.encode(p1Requirements);
    const q = fiber.rank & 1 ? fiber.pack(b, a) : fiber.pack(a, b);
    const win = entry.upper1.some(g => subset(g, q));
    const drawOrWin = entry.upper0.some(g => subset(g, q));
    const loss = entry.lowerMinus1.some(g => subset(q, g));
    const drawOrLoss = entry.lower0.some(g => subset(q, g));
    if (win === drawOrLoss || loss === drawOrWin) throw new Error('RBA threshold complement contradiction');
    const current = win ? 1 : loss ? -1 : 0;
    return fiber.rank & 1 ? -current || 0 : current;
  }
  const root = completed.get(supportKey(minimumHeights));
  const rootWdl = minimumHeights.every(h => h === 0) ? evaluate({ heights: minimumHeights,
    p0Requirements: root.fiber.lineMasks, p1Requirements: root.fiber.lineMasks }) : null;
  return Object.freeze({ profile: RBA_PROFILE, researchRevision: RBA_RESEARCH_REVISION,
    rootWdl, metrics: Object.freeze({ ...metrics, elapsedMs: performance.now() - start }),
    evaluate, frontierAt: heights => completed.get(supportKey(heights)) });
}


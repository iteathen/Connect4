import { packedAntichain42CollectiveSource, packedAntichain42CollectiveFunctions } from './packed-antichain-42-collective.mjs';

export const COMPACT_OWNERSHIP_42_METRIC_STRIDE = 12;

const source = `
function compactNormalizeObserved(candidateLo, candidateHi, candidatePopcount, outputLo, outputHi, counts, status, checks, metrics, start, end, outputBase, segment, capacity, direction, item, phaseClass) {
  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  const metricBase = item * gpu.u32(12);
  if (lane === gpu.u32(0)) {
    counts[segment] = gpu.u32(0);
    status[segment] = gpu.u32(0);
    metrics[metricBase + gpu.u32(4)] = metrics[metricBase + gpu.u32(4)] + gpu.u64(end - start);
    metrics[metricBase + gpu.u32(5)] = metrics[metricBase + gpu.u32(5)] + gpu.u64(1);
    if (phaseClass === gpu.u32(0)) metrics[metricBase + gpu.u32(8)] = metrics[metricBase + gpu.u32(8)] + gpu.u64(end - start);
    else if (phaseClass === gpu.u32(1)) metrics[metricBase + gpu.u32(9)] = metrics[metricBase + gpu.u32(9)] + gpu.u64(end - start);
    else if (phaseClass === gpu.u32(2)) metrics[metricBase + gpu.u32(10)] = metrics[metricBase + gpu.u32(10)] + gpu.u64(end - start);
    else metrics[metricBase + gpu.u32(11)] = metrics[metricBase + gpu.u32(11)] + gpu.u64(end - start);
  }
  let initial = start + lane;
  while (initial < end) { checks[initial] = gpu.u32(0); initial = initial + stride; }
  gpu.barrier.block();
  let priorScans = gpu.u64(0);
  let duplicateHits = gpu.u64(0);
  let phase = gpu.u32(0);
  while (phase < gpu.u32(43)) {
    let target = phase;
    if (direction !== gpu.u32(0)) target = gpu.u32(42) - phase;
    const frontierCount = counts[segment];
    gpu.barrier.block();
    let i = start + lane;
    while (i < end) {
      if (candidatePopcount[i] === target) {
        const low = candidateLo[i];
        const high = candidateHi[i];
        let dominated = false;
        let tested = gpu.u32(0);
        let j = gpu.u32(0);
        while (j < frontierCount) {
          const otherLow = outputLo[outputBase + j];
          const otherHigh = outputHi[outputBase + j];
          tested++;
          if (direction === gpu.u32(0)) {
            if ((otherLow & ~low) === gpu.u32(0) && (otherHigh & ~high) === gpu.u32(0)) dominated = true;
          } else {
            if ((low & ~otherLow) === gpu.u32(0) && (high & ~otherHigh) === gpu.u32(0)) dominated = true;
          }
          if (dominated) break;
          j++;
        }
        if (!dominated) {
          let prior = start;
          while (prior < i) {
            if (candidatePopcount[prior] === target && candidateLo[prior] === low && candidateHi[prior] === high) {
              dominated = true;
              duplicateHits = duplicateHits + gpu.u64(1);
              break;
            }
            prior++;
          }
          if (prior < i) priorScans = priorScans + gpu.u64(prior - start + gpu.u32(1));
          else priorScans = priorScans + gpu.u64(i - start);
        }
        checks[i] = tested;
        if (!dominated) {
          const slot = gpu.atomic.add(counts, segment, gpu.u32(1));
          if (slot < capacity) { outputLo[outputBase + slot] = low; outputHi[outputBase + slot] = high; }
          else { gpu.atomic.cas(status, segment, gpu.u32(0), gpu.u32(1)); }
        }
      }
      i = i + stride;
    }
    gpu.barrier.block();
    if (status[segment] !== gpu.u32(0)) {
      if (priorScans !== gpu.u64(0)) gpu.atomic.add(metrics, metricBase + gpu.u32(2), priorScans);
      if (duplicateHits !== gpu.u64(0)) gpu.atomic.add(metrics, metricBase + gpu.u32(3), duplicateHits);
      return gpu.u32(0);
    }
    phase++;
  }
  if (priorScans !== gpu.u64(0)) gpu.atomic.add(metrics, metricBase + gpu.u32(2), priorScans);
  if (duplicateHits !== gpu.u64(0)) gpu.atomic.add(metrics, metricBase + gpu.u32(3), duplicateHits);
  return counts[segment];
}

function compactNormalize(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, count, wb, segment, capacity, direction, item, phaseClass) {
  const result = compactNormalizeObserved(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, cb + count, wb + gpu.u32(5) * capacity, segment, capacity, direction, item, phaseClass);
  let sum = gpu.u64(0);
  let i = gpu.thread.x();
  while (i < count) { sum = sum + gpu.u64(checks[cb + i]); i = i + gpu.blockDim.x(); }
  gpu.atomic.add(metrics, item * gpu.u32(12) + gpu.u32(1), sum);
  return result;
}

function compactCopy(workLo, workHi, sourceBase, targetBase, count) {
  let i = gpu.thread.x();
  while (i < count) { workLo[targetBase + i] = workLo[sourceBase + i]; workHi[targetBase + i] = workHi[sourceBase + i]; i = i + gpu.blockDim.x(); }
  gpu.barrier.block();
}

function compactCombine(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, wb, segment, capacity, tileSize, leftBank, leftCount, rightBank, rightCount, targetBank, direction, intersection, item, phaseClass) {
  const leftBase = wb + leftBank * capacity;
  const rightBase = wb + rightBank * capacity;
  const outputBase = wb + gpu.u32(5) * capacity;
  let total = leftCount + rightCount;
  if (intersection !== gpu.u32(0)) total = leftCount * rightCount;
  let start = gpu.u32(0);
  let retained = gpu.u32(0);
  while (start < total) {
    let count = total - start;
    if (count > tileSize) count = tileSize;
    if (intersection !== gpu.u32(0)) {
      packedPairTile42(workLo, workHi, workLo, workHi, lo, hi, pop, leftBase, rightBase, rightCount, start, count, cb, direction);
      if (gpu.thread.x() === gpu.u32(0)) {
        const metricBase = item * gpu.u32(12);
        metrics[metricBase] = metrics[metricBase] + gpu.u64(count);
        if (phaseClass === gpu.u32(1)) metrics[metricBase + gpu.u32(6)] = metrics[metricBase + gpu.u32(6)] + gpu.u64(count);
        else if (phaseClass === gpu.u32(3)) metrics[metricBase + gpu.u32(7)] = metrics[metricBase + gpu.u32(7)] + gpu.u64(count);
      }
    } else {
      let i = gpu.thread.x();
      while (i < count) {
        const index = start + i;
        let src = leftBase + index;
        if (index >= leftCount) src = rightBase + index - leftCount;
        lo[cb + i] = workLo[src]; hi[cb + i] = workHi[src];
        pop[cb + i] = packedPopcount42(workLo[src], workHi[src]);
        i = i + gpu.blockDim.x();
      }
    }
    let copy = gpu.thread.x();
    while (copy < retained) {
      lo[cb + count + copy] = workLo[outputBase + copy]; hi[cb + count + copy] = workHi[outputBase + copy];
      pop[cb + count + copy] = packedPopcount42(workLo[outputBase + copy], workHi[outputBase + copy]);
      copy = copy + gpu.blockDim.x();
    }
    gpu.barrier.block();
    retained = compactNormalize(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, count + retained, wb, segment, capacity, direction, item, phaseClass);
    if (status[segment] !== gpu.u32(0)) return gpu.u32(0);
    start = start + count;
  }
  compactCopy(workLo, workHi, outputBase, wb + targetBank * capacity, retained);
  return retained;
}

function solveCompactRank42(rankLo, rankHi, rankCounts, items, slots, children, landingLo, landingHi, universeLo, universeHi, terminalOffsets, terminalLo, terminalHi, lo, hi, pop, workLo, workHi, control, status, checks, errors, metrics, rank, rankOffset, shardStart, shardCount, rankCapacity, capacity, tileSize, columns, maxRank) {
  const segment = gpu.block.x();
  if (segment >= shardCount) return;
  const lane = gpu.thread.x();
  const slot = shardStart + segment;
  const item = items[rankOffset + slot];
  const mover = rank & gpu.u32(1);
  const currentBase = mover * rankCapacity * gpu.u32(2);
  const childBase = (gpu.u32(1) - mover) * rankCapacity * gpu.u32(2);
  const wb = segment * gpu.u32(6) * capacity;
  const cb = segment * (tileSize + capacity);
  const uLo = universeLo[item];
  const uHi = universeHi[item];
  if (lane === gpu.u32(0)) {
    status[segment] = gpu.atomic.add(errors, gpu.u32(0), gpu.u32(0));
    rankCounts[currentBase + slot * gpu.u32(2)] = gpu.u32(0);
    rankCounts[currentBase + slot * gpu.u32(2) + gpu.u32(1)] = gpu.u32(0);
  }
  gpu.barrier.block();
  if (status[segment] !== gpu.u32(0) || rank === maxRank) return;
  let aggregateWins = gpu.u32(0);
  let aggregateLosses = gpu.u32(0);
  if (mover === gpu.u32(0)) {
    aggregateLosses = gpu.u32(1);
    if (lane === gpu.u32(0)) { workLo[wb + capacity] = uLo; workHi[wb + capacity] = uHi; }
  } else {
    aggregateWins = gpu.u32(1);
    if (lane === gpu.u32(0)) { workLo[wb] = gpu.u32(0); workHi[wb] = gpu.u32(0); }
  }
  gpu.barrier.block();
  let column = gpu.u32(0);
  while (column < columns) {
    const edge = item * columns + column;
    const child = children[edge];
    if (child !== gpu.u32(4294967295)) {
      const bitLo = landingLo[edge];
      const bitHi = landingHi[edge];
      const childSlot = slots[child];
      let moveWins = gpu.u32(0);
      let moveLosses = gpu.u32(0);
      let direction = gpu.u32(0);
      while (direction < gpu.u32(2)) {
        const childIndex = childBase + childSlot * gpu.u32(2) + direction;
        const childCount = rankCounts[childIndex];
        const sourceBase = childIndex * capacity;
        let i = lane;
        while (i < childCount) {
          const valueLo = rankLo[sourceBase + i];
          const valueHi = rankHi[sourceBase + i];
          const owns = (valueLo & bitLo) !== gpu.u32(0) || (valueHi & bitHi) !== gpu.u32(0);
          let valid = true;
          if (direction === gpu.u32(0) && mover === gpu.u32(1) && owns) valid = false;
          if (direction === gpu.u32(1) && mover === gpu.u32(0) && !owns) valid = false;
          lo[cb + i] = valueLo & ~bitLo; hi[cb + i] = valueHi & ~bitHi;
          pop[cb + i] = gpu.u32(99);
          if (valid) pop[cb + i] = packedPopcount42(lo[cb + i], hi[cb + i]);
          i = i + gpu.blockDim.x();
        }
        gpu.barrier.block();
        const count = compactNormalize(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, childCount, wb, segment, capacity, direction, item, gpu.u32(0));
        if (status[segment] !== gpu.u32(0)) { if (lane === gpu.u32(0)) gpu.atomic.cas(errors, gpu.u32(0), gpu.u32(0), gpu.u32(1)); return; }
        compactCopy(workLo, workHi, wb + gpu.u32(5) * capacity, wb + (gpu.u32(2) + direction) * capacity, count);
        if (direction === gpu.u32(0)) moveWins = count;
        else moveLosses = count;
        direction++;
      }

      let term = terminalOffsets[edge];
      const termEnd = terminalOffsets[edge + gpu.u32(1)];
      while (term < termEnd) {
        const qLo = terminalLo[term];
        const qHi = terminalHi[term];
        let complementCount = gpu.u32(0);
        let cell = gpu.u32(0);
        while (cell < gpu.u32(42)) {
          let cellLo = gpu.u32(0);
          let cellHi = gpu.u32(0);
          if (cell < gpu.u32(32)) cellLo = gpu.u32(1) << cell;
          else cellHi = gpu.u32(1) << (cell - gpu.u32(32));
          if ((qLo & cellLo) !== gpu.u32(0) || (qHi & cellHi) !== gpu.u32(0)) {
            if (lane === gpu.u32(0)) {
              let valueLo = cellLo;
              let valueHi = cellHi;
              if (mover === gpu.u32(0)) { valueLo = uLo & ~cellLo; valueHi = uHi & ~cellHi; }
              workLo[wb + gpu.u32(4) * capacity + complementCount] = valueLo;
              workHi[wb + gpu.u32(4) * capacity + complementCount] = valueHi;
            }
            complementCount++;
          }
          cell++;
        }
        gpu.barrier.block();
        let oppositeCount = moveWins;
        if (mover === gpu.u32(0)) oppositeCount = moveLosses;
        const oppositeDirection = gpu.u32(1) - mover;
        const oppositeBank = gpu.u32(2) + oppositeDirection;
        oppositeCount = compactCombine(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, wb, segment, capacity, tileSize, oppositeBank, oppositeCount, gpu.u32(4), complementCount, oppositeBank, oppositeDirection, gpu.u32(1), item, gpu.u32(1));
        if (status[segment] !== gpu.u32(0)) { if (lane === gpu.u32(0)) gpu.atomic.cas(errors, gpu.u32(0), gpu.u32(0), gpu.u32(1)); return; }
        if (mover === gpu.u32(0)) moveLosses = oppositeCount;
        else moveWins = oppositeCount;
        if (lane === gpu.u32(0)) {
          let terminalValueLo = qLo;
          let terminalValueHi = qHi;
          if (mover === gpu.u32(1)) { terminalValueLo = uLo & ~qLo; terminalValueHi = uHi & ~qHi; }
          workLo[wb + gpu.u32(4) * capacity] = terminalValueLo;
          workHi[wb + gpu.u32(4) * capacity] = terminalValueHi;
        }
        gpu.barrier.block();
        let ownCount = moveWins;
        if (mover === gpu.u32(1)) ownCount = moveLosses;
        const ownBank = gpu.u32(2) + mover;
        ownCount = compactCombine(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, wb, segment, capacity, tileSize, ownBank, ownCount, gpu.u32(4), gpu.u32(1), ownBank, mover, gpu.u32(0), item, gpu.u32(2));
        if (status[segment] !== gpu.u32(0)) { if (lane === gpu.u32(0)) gpu.atomic.cas(errors, gpu.u32(0), gpu.u32(0), gpu.u32(1)); return; }
        if (mover === gpu.u32(0)) moveWins = ownCount;
        else moveLosses = ownCount;
        term++;
      }
      aggregateWins = compactCombine(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, wb, segment, capacity, tileSize, gpu.u32(0), aggregateWins, gpu.u32(2), moveWins, gpu.u32(0), gpu.u32(0), mover, item, gpu.u32(3));
      if (status[segment] !== gpu.u32(0)) { if (lane === gpu.u32(0)) gpu.atomic.cas(errors, gpu.u32(0), gpu.u32(0), gpu.u32(1)); return; }
      aggregateLosses = compactCombine(lo, hi, pop, workLo, workHi, control, status, checks, metrics, cb, wb, segment, capacity, tileSize, gpu.u32(1), aggregateLosses, gpu.u32(3), moveLosses, gpu.u32(1), gpu.u32(1), gpu.u32(1) - mover, item, gpu.u32(3));
      if (status[segment] !== gpu.u32(0)) { if (lane === gpu.u32(0)) gpu.atomic.cas(errors, gpu.u32(0), gpu.u32(0), gpu.u32(1)); return; }
    }
    column++;
  }
  let direction = gpu.u32(0);
  while (direction < gpu.u32(2)) {
    let count = aggregateWins;
    if (direction === gpu.u32(1)) count = aggregateLosses;
    const destination = (currentBase + slot * gpu.u32(2) + direction) * capacity;
    let i = lane;
    while (i < count) { rankLo[destination + i] = workLo[wb + direction * capacity + i]; rankHi[destination + i] = workHi[wb + direction * capacity + i]; i = i + gpu.blockDim.x(); }
    gpu.barrier.block();
    if (lane === gpu.u32(0)) rankCounts[currentBase + slot * gpu.u32(2) + direction] = count;
    direction++;
  }
}

function recordCompactRank42(rankCounts, items, report, rank, rankOffset, rankCount, rankCapacity) {
  const slot = gpu.block.x() * gpu.blockDim.x() + gpu.thread.x();
  if (slot >= rankCount) return;
  const item = items[rankOffset + slot];
  const index = (rank & gpu.u32(1)) * rankCapacity * gpu.u32(2) + slot * gpu.u32(2);
  report[item * gpu.u32(4)] = rankCounts[index];
  report[item * gpu.u32(4) + gpu.u32(2)] = rankCounts[index + gpu.u32(1)];
}

function verifyCompactRank42(rankLo, rankHi, rankCounts, items, expectedOffsets, expectedLo, expectedHi, report, rank, rankOffset, rankCount, rankCapacity, capacity) {
  const slot = gpu.block.x();
  if (slot >= rankCount) return;
  const item = items[rankOffset + slot];
  let direction = gpu.u32(0);
  while (direction < gpu.u32(2)) {
    const channel = item * gpu.u32(2) + direction;
    const index = (rank & gpu.u32(1)) * rankCapacity * gpu.u32(2) + slot * gpu.u32(2) + direction;
    const count = rankCounts[index];
    const start = expectedOffsets[channel];
    const end = expectedOffsets[channel + gpu.u32(1)];
    if (gpu.thread.x() === gpu.u32(0)) {
      report[channel * gpu.u32(2)] = count;
      report[channel * gpu.u32(2) + gpu.u32(1)] = gpu.u32(0);
      if (count !== end - start) report[channel * gpu.u32(2) + gpu.u32(1)] = gpu.u32(1);
    }
    gpu.barrier.block();
    let i = gpu.thread.x();
    while (i < count) {
      let found = false;
      let j = start;
      while (j < end) {
        if (rankLo[index * capacity + i] === expectedLo[j] && rankHi[index * capacity + i] === expectedHi[j]) { found = true; break; }
        j++;
      }
      if (!found) gpu.atomic.cas(report, channel * gpu.u32(2) + gpu.u32(1), gpu.u32(0), gpu.u32(1));
      i = i + gpu.blockDim.x();
    }
    let expected = start + gpu.thread.x();
    while (expected < end) {
      let found = false;
      let actual = gpu.u32(0);
      while (actual < count) {
        if (rankLo[index * capacity + actual] === expectedLo[expected] && rankHi[index * capacity + actual] === expectedHi[expected]) { found = true; break; }
        actual++;
      }
      if (!found) gpu.atomic.cas(report, channel * gpu.u32(2) + gpu.u32(1), gpu.u32(0), gpu.u32(1));
      expected = expected + gpu.blockDim.x();
    }
    direction++;
  }
}
`;

const descriptor = (name, pointers, scalars, returns = 'void', kind = 'device', wide = []) => ({
  name, kind, returns, parameters: [
    ...pointers.map((name) => ({ name, type: 'ptr<u32>' })),
    ...wide.map((name) => ({ name, type: 'ptr<u64>' })),
    ...scalars.map((name) => ({ name, type: 'u32' })),
  ],
});
const common = ['lo', 'hi', 'pop', 'workLo', 'workHi', 'control', 'status', 'checks'];
export const compactOwnership42DeviceProgram = {
  source: packedAntichain42CollectiveSource + source,
  compile: { headerProfile: 'cuda-cccl' },
  functions: [
    ...packedAntichain42CollectiveFunctions,
    descriptor('compactNormalizeObserved', ['candidateLo', 'candidateHi', 'candidatePopcount', 'outputLo', 'outputHi', 'counts', 'status', 'checks'], ['start', 'end', 'outputBase', 'segment', 'capacity', 'direction', 'item', 'phaseClass'], 'u32', 'device', ['metrics']),
    descriptor('compactNormalize', common, ['cb', 'count', 'wb', 'segment', 'capacity', 'direction', 'item', 'phaseClass'], 'u32', 'device', ['metrics']),
    descriptor('compactCopy', ['workLo', 'workHi'], ['sourceBase', 'targetBase', 'count']),
    descriptor('compactCombine', common, ['cb', 'wb', 'segment', 'capacity', 'tileSize', 'leftBank', 'leftCount', 'rightBank', 'rightCount', 'targetBank', 'direction', 'intersection', 'item', 'phaseClass'], 'u32', 'device', ['metrics']),
    descriptor('solveCompactRank42', ['rankLo', 'rankHi', 'rankCounts', 'items', 'slots', 'children', 'landingLo', 'landingHi', 'universeLo', 'universeHi', 'terminalOffsets', 'terminalLo', 'terminalHi', ...common, 'errors'], ['rank', 'rankOffset', 'shardStart', 'shardCount', 'rankCapacity', 'capacity', 'tileSize', 'columns', 'maxRank'], 'void', 'kernel', ['metrics']),
    descriptor('recordCompactRank42', ['rankCounts', 'items', 'report'], ['rank', 'rankOffset', 'rankCount', 'rankCapacity'], 'void', 'kernel'),
    descriptor('verifyCompactRank42', ['rankLo', 'rankHi', 'rankCounts', 'items', 'expectedOffsets', 'expectedLo', 'expectedHi', 'report'], ['rank', 'rankOffset', 'rankCount', 'rankCapacity', 'capacity'], 'void', 'kernel'),
  ],
};

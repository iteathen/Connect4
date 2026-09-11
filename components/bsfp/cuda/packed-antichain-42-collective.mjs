// Block collectives shared by the primitive plans and the compact BSFP profile.
// Every lane must call with identical scalar bounds. Input and output are disjoint.
export const packedAntichain42CollectiveSource = `
function packedPopcount42(low, high) {
  let count = gpu.u32(0);
  while (low !== gpu.u32(0)) { low = low & (low - gpu.u32(1)); count++; }
  while (high !== gpu.u32(0)) { high = high & (high - gpu.u32(1)); count++; }
  return count;
}

function packedPairTile42(leftLo, leftHi, rightLo, rightHi, candidateLo, candidateHi, candidatePopcount, leftBase, rightBase, rightCount, pairStart, pairCount, candidateBase, direction) {
  let i = gpu.thread.x();
  while (i < pairCount) {
    const pair = pairStart + i;
    const a = leftBase + pair / rightCount;
    const b = rightBase + pair % rightCount;
    let low = leftLo[a] | rightLo[b];
    let high = leftHi[a] | rightHi[b];
    if (direction !== gpu.u32(0)) { low = leftLo[a] & rightLo[b]; high = leftHi[a] & rightHi[b]; }
    candidateLo[candidateBase + i] = low;
    candidateHi[candidateBase + i] = high;
    candidatePopcount[candidateBase + i] = packedPopcount42(low, high);
    i = i + gpu.blockDim.x();
  }
}

function packedNormalize42(candidateLo, candidateHi, candidatePopcount, outputLo, outputHi, counts, status, checks, start, end, outputBase, segment, capacity, direction) {
  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  if (lane === gpu.u32(0)) { counts[segment] = gpu.u32(0); status[segment] = gpu.u32(0); }
  let initial = start + lane;
  while (initial < end) { checks[initial] = gpu.u32(0); initial = initial + stride; }
  gpu.barrier.block();
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
            if (candidatePopcount[prior] === target && candidateLo[prior] === low && candidateHi[prior] === high) { dominated = true; break; }
            prior++;
          }
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
    if (status[segment] !== gpu.u32(0)) return gpu.u32(0);
    phase++;
  }
  return counts[segment];
}

// Exact alternative to packedNormalize42. Candidates are counted and scattered
// once by cardinality, then only the selected bucket is traversed in each phase.
// bucketOffsets/cursors are relative to bucketBase; invalid popcounts are omitted.
function packedNormalize42Bucketed(candidateLo, candidateHi, candidatePopcount, outputLo, outputHi, counts, status, checks, bucketIndices, bucketCounts, bucketOffsets, bucketCursors, start, end, outputBase, segment, capacity, direction, bucketBase) {
  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  const metaBase = segment * gpu.u32(43);
  if (lane === gpu.u32(0)) { counts[segment] = gpu.u32(0); status[segment] = gpu.u32(0); }
  let bucket = lane;
  while (bucket < gpu.u32(43)) {
    bucketCounts[metaBase + bucket] = gpu.u32(0);
    bucketOffsets[metaBase + bucket] = gpu.u32(0);
    bucketCursors[metaBase + bucket] = gpu.u32(0);
    bucket = bucket + stride;
  }
  let initial = start + lane;
  while (initial < end) {
    checks[initial] = gpu.u32(0);
    const cardinality = candidatePopcount[initial];
    if (cardinality < gpu.u32(43)) gpu.atomic.add(bucketCounts, metaBase + cardinality, gpu.u32(1));
    initial = initial + stride;
  }
  gpu.barrier.block();
  if (lane === gpu.u32(0)) {
    let offset = gpu.u32(0);
    let b = gpu.u32(0);
    while (b < gpu.u32(43)) {
      bucketOffsets[metaBase + b] = offset;
      bucketCursors[metaBase + b] = offset;
      offset = offset + bucketCounts[metaBase + b];
      b++;
    }
  }
  gpu.barrier.block();
  let scatter = start + lane;
  while (scatter < end) {
    const cardinality = candidatePopcount[scatter];
    if (cardinality < gpu.u32(43)) {
      const position = gpu.atomic.add(bucketCursors, metaBase + cardinality, gpu.u32(1));
      bucketIndices[bucketBase + position] = scatter;
    }
    scatter = scatter + stride;
  }
  gpu.barrier.block();

  let phase = gpu.u32(0);
  while (phase < gpu.u32(43)) {
    let target = phase;
    if (direction !== gpu.u32(0)) target = gpu.u32(42) - phase;
    const frontierCount = counts[segment];
    const bucketStart = bucketOffsets[metaBase + target];
    const bucketEnd = bucketStart + bucketCounts[metaBase + target];
    gpu.barrier.block();
    let position = bucketStart + lane;
    while (position < bucketEnd) {
      const i = bucketIndices[bucketBase + position];
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
        let priorPosition = bucketStart;
        while (priorPosition < position) {
          const prior = bucketIndices[bucketBase + priorPosition];
          if (candidateLo[prior] === low && candidateHi[prior] === high) { dominated = true; break; }
          priorPosition++;
        }
      }
      checks[i] = tested;
      if (!dominated) {
        const slot = gpu.atomic.add(counts, segment, gpu.u32(1));
        if (slot < capacity) { outputLo[outputBase + slot] = low; outputHi[outputBase + slot] = high; }
        else { gpu.atomic.cas(status, segment, gpu.u32(0), gpu.u32(1)); }
      }
      position = position + stride;
    }
    gpu.barrier.block();
    if (status[segment] !== gpu.u32(0)) return gpu.u32(0);
    phase++;
  }
  return counts[segment];
}

// Exact duplicate-first variant of the bucketed reducer. Equality within a
// cardinality bucket is resolved before any frontier-dominance scan. This does
// not change identity or dominance semantics; it only changes work ordering.
function packedNormalize42BucketedDedupFirst(candidateLo, candidateHi, candidatePopcount, outputLo, outputHi, counts, status, checks, bucketIndices, bucketCounts, bucketOffsets, bucketCursors, start, end, outputBase, segment, capacity, direction, bucketBase) {
  const lane = gpu.thread.x();
  const stride = gpu.blockDim.x();
  const metaBase = segment * gpu.u32(43);
  if (lane === gpu.u32(0)) { counts[segment] = gpu.u32(0); status[segment] = gpu.u32(0); }
  let bucket = lane;
  while (bucket < gpu.u32(43)) {
    bucketCounts[metaBase + bucket] = gpu.u32(0);
    bucketOffsets[metaBase + bucket] = gpu.u32(0);
    bucketCursors[metaBase + bucket] = gpu.u32(0);
    bucket = bucket + stride;
  }
  let initial = start + lane;
  while (initial < end) {
    checks[initial] = gpu.u32(0);
    const cardinality = candidatePopcount[initial];
    if (cardinality < gpu.u32(43)) gpu.atomic.add(bucketCounts, metaBase + cardinality, gpu.u32(1));
    initial = initial + stride;
  }
  gpu.barrier.block();
  if (lane === gpu.u32(0)) {
    let offset = gpu.u32(0);
    let b = gpu.u32(0);
    while (b < gpu.u32(43)) {
      bucketOffsets[metaBase + b] = offset;
      bucketCursors[metaBase + b] = offset;
      offset = offset + bucketCounts[metaBase + b];
      b++;
    }
  }
  gpu.barrier.block();
  let scatter = start + lane;
  while (scatter < end) {
    const cardinality = candidatePopcount[scatter];
    if (cardinality < gpu.u32(43)) {
      const position = gpu.atomic.add(bucketCursors, metaBase + cardinality, gpu.u32(1));
      bucketIndices[bucketBase + position] = scatter;
    }
    scatter = scatter + stride;
  }
  gpu.barrier.block();

  let phase = gpu.u32(0);
  while (phase < gpu.u32(43)) {
    let target = phase;
    if (direction !== gpu.u32(0)) target = gpu.u32(42) - phase;
    const frontierCount = counts[segment];
    const bucketStart = bucketOffsets[metaBase + target];
    const bucketEnd = bucketStart + bucketCounts[metaBase + target];
    gpu.barrier.block();
    let position = bucketStart + lane;
    while (position < bucketEnd) {
      const i = bucketIndices[bucketBase + position];
      const low = candidateLo[i];
      const high = candidateHi[i];
      let dominated = false;
      let priorPosition = bucketStart;
      while (priorPosition < position) {
        const prior = bucketIndices[bucketBase + priorPosition];
        if (candidateLo[prior] === low && candidateHi[prior] === high) { dominated = true; break; }
        priorPosition++;
      }
      let tested = gpu.u32(0);
      if (!dominated) {
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
      }
      checks[i] = tested;
      if (!dominated) {
        const slot = gpu.atomic.add(counts, segment, gpu.u32(1));
        if (slot < capacity) { outputLo[outputBase + slot] = low; outputHi[outputBase + slot] = high; }
        else { gpu.atomic.cas(status, segment, gpu.u32(0), gpu.u32(1)); }
      }
      position = position + stride;
    }
    gpu.barrier.block();
    if (status[segment] !== gpu.u32(0)) return gpu.u32(0);
    phase++;
  }
  return counts[segment];
}
`;

const parameter = (name, type) => Object.freeze({ name, type });
const fn = (name, pointers, scalars, returns) => Object.freeze({
  name, kind: 'device', returns,
  parameters: Object.freeze([...pointers.map((name) => parameter(name, 'ptr<u32>')), ...scalars.map((name) => parameter(name, 'u32'))]),
});
export const packedAntichain42CollectiveFunctions = Object.freeze([
  fn('packedPopcount42', [], ['low', 'high'], 'u32'),
  fn('packedPairTile42', ['leftLo', 'leftHi', 'rightLo', 'rightHi', 'candidateLo', 'candidateHi', 'candidatePopcount'],
    ['leftBase', 'rightBase', 'rightCount', 'pairStart', 'pairCount', 'candidateBase', 'direction'], 'void'),
  fn('packedNormalize42', ['candidateLo', 'candidateHi', 'candidatePopcount', 'outputLo', 'outputHi', 'counts', 'status', 'checks'],
    ['start', 'end', 'outputBase', 'segment', 'capacity', 'direction'], 'u32'),
  fn('packedNormalize42Bucketed', ['candidateLo', 'candidateHi', 'candidatePopcount', 'outputLo', 'outputHi', 'counts', 'status', 'checks', 'bucketIndices', 'bucketCounts', 'bucketOffsets', 'bucketCursors'],
    ['start', 'end', 'outputBase', 'segment', 'capacity', 'direction', 'bucketBase'], 'u32'),
  fn('packedNormalize42BucketedDedupFirst', ['candidateLo', 'candidateHi', 'candidatePopcount', 'outputLo', 'outputHi', 'counts', 'status', 'checks', 'bucketIndices', 'bucketCounts', 'bucketOffsets', 'bucketCursors'],
    ['start', 'end', 'outputBase', 'segment', 'capacity', 'direction', 'bucketBase'], 'u32'),
]);

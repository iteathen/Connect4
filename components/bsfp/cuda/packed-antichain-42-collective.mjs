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
    // Freeze the completed earlier phases before ANY lane reserves a new slot.
    // Same-cardinality distinct masks cannot dominate each other.
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
    // Uniform exit: no truncated frontier is consumed by a later phase.
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
]);

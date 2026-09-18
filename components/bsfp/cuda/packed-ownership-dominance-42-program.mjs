const source = `
function markDominatedPacked42(candidateLo, candidateHi, frontierLo, frontierHi, flags, checks, candidateCount, frontierCount) {
  const i = gpu.thread.globalX();
  if (i >= candidateCount) return;

  const candidateLow = candidateLo[i];
  const candidateHigh = candidateHi[i];
  const notCandidateLow = candidateLow ^ gpu.u32(4294967295);
  const notCandidateHigh = candidateHigh ^ gpu.u32(4294967295);
  let dominated = gpu.u32(0);
  let tested = gpu.u32(0);
  let j = gpu.u32(0);

  while (j < frontierCount) {
    const frontierLow = frontierLo[j];
    const frontierHigh = frontierHi[j];
    tested++;
    if ((frontierLow & notCandidateLow) === gpu.u32(0) && (frontierHigh & notCandidateHigh) === gpu.u32(0)) {
      dominated = gpu.u32(1);
      break;
    }
    j++;
  }

  flags[i] = dominated;
  checks[i] = tested;
}
`;

export const packedOwnershipDominance42DeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'markDominatedPacked42',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'candidateLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'frontierLo', type: 'ptr<u32>' }),
        Object.freeze({ name: 'frontierHi', type: 'ptr<u32>' }),
        Object.freeze({ name: 'flags', type: 'ptr<u32>' }),
        Object.freeze({ name: 'checks', type: 'ptr<u32>' }),
        Object.freeze({ name: 'candidateCount', type: 'u32' }),
        Object.freeze({ name: 'frontierCount', type: 'u32' }),
      ]),
    }),
  ]),
});

const source = `
function evaluateBsfpRank4x3(table, ranks, filledMasks, lineMasks, targetRank, itemCapacity, assignmentCount, lineCount) {
  const i = gpu.thread.globalX();
  const total = itemCapacity * assignmentCount;
  if (i >= total) return;

  const supportIndex = i / assignmentCount;
  if (ranks[supportIndex] !== targetRank) return;

  const ownershipMask = i % assignmentCount;
  const filledMask = filledMasks[supportIndex];
  const mover = targetRank & gpu.u32(1);
  let aggregate = mover === gpu.u32(0) ? gpu.u32(0) : gpu.u32(2);
  let hasMove = gpu.u32(0);
  let divisor = gpu.u32(1);
  let column = gpu.u32(0);

  while (column < gpu.u32(4)) {
    const row = (supportIndex / divisor) % gpu.u32(4);
    if (row < gpu.u32(3)) {
      hasMove = gpu.u32(1);
      const landingCell = row * gpu.u32(4) + column;
      const landingBit = gpu.u32(1) << landingCell;
      let immediateWin = gpu.u32(0);
      let lineIndex = gpu.u32(0);

      while (lineIndex < lineCount) {
        const lineMask = lineMasks[lineIndex];
        if ((lineMask & landingBit) !== gpu.u32(0)) {
          const otherMask = lineMask ^ landingBit;
          if ((otherMask & filledMask) === otherMask) {
            const ownedMask = mover === gpu.u32(0)
              ? ownershipMask ^ gpu.u32(4095)
              : ownershipMask;
            if ((ownedMask & otherMask) === otherMask) immediateWin = gpu.u32(1);
          }
        }
        lineIndex++;
      }

      let moveValue = gpu.u32(1);
      if (immediateWin === gpu.u32(1)) {
        moveValue = mover === gpu.u32(0) ? gpu.u32(2) : gpu.u32(0);
      } else {
        const childSupportIndex = supportIndex + divisor;
        const childOwnershipMask = mover === gpu.u32(0)
          ? ownershipMask & (gpu.u32(4095) ^ landingBit)
          : ownershipMask | landingBit;
        moveValue = table[childSupportIndex * assignmentCount + childOwnershipMask];
      }

      if (mover === gpu.u32(0)) {
        if (moveValue > aggregate) aggregate = moveValue;
      } else {
        if (moveValue < aggregate) aggregate = moveValue;
      }
    }

    divisor = divisor * gpu.u32(4);
    column++;
  }

  table[i] = hasMove === gpu.u32(0) ? gpu.u32(1) : aggregate;
}
`;

export const denseBsfp4x3DeviceProgram = Object.freeze({
  source,
  compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  functions: Object.freeze([
    Object.freeze({
      name: 'evaluateBsfpRank4x3',
      kind: 'kernel',
      returns: 'void',
      parameters: Object.freeze([
        Object.freeze({ name: 'table', type: 'ptr<u32>' }),
        Object.freeze({ name: 'ranks', type: 'ptr<u32>' }),
        Object.freeze({ name: 'filledMasks', type: 'ptr<u32>' }),
        Object.freeze({ name: 'lineMasks', type: 'ptr<u32>' }),
        Object.freeze({ name: 'targetRank', type: 'u32' }),
        Object.freeze({ name: 'itemCapacity', type: 'u32' }),
        Object.freeze({ name: 'assignmentCount', type: 'u32' }),
        Object.freeze({ name: 'lineCount', type: 'u32' }),
      ]),
    }),
  ]),
});

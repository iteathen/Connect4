import { BSFP_INVALID_ITEM_U32 } from '../support-lattice.mjs';

export function createBsfpSupportPredecessorDeviceLibraryRequest(profile) {
  if (!profile || profile.kind !== 'connect4-bsfp-support-lattice-profile') {
    throw new TypeError('profile must be a Connect4 BSFP support-lattice profile');
  }

  const { columns, radix } = profile;
  const source = `
function deriveSupportPredecessor(sourceIndex, emissionLane) {
  if (emissionLane >= gpu.u32(${columns})) return gpu.u32(${BSFP_INVALID_ITEM_U32});

  let divisor = gpu.u32(1);
  let column = gpu.u32(0);
  while (column < emissionLane) {
    divisor = divisor * gpu.u32(${radix});
    column++;
  }

  const columnHeight = (sourceIndex / divisor) % gpu.u32(${radix});
  if (columnHeight === gpu.u32(0)) return gpu.u32(${BSFP_INVALID_ITEM_U32});
  return sourceIndex - divisor;
}
`;

  return Object.freeze({
    source,
    functions: Object.freeze([
      Object.freeze({
        name: 'deriveSupportPredecessor',
        kind: 'device',
        returns: 'u32',
        parameters: Object.freeze([
          Object.freeze({ name: 'sourceIndex', type: 'u32' }),
          Object.freeze({ name: 'emissionLane', type: 'u32' }),
        ]),
      }),
    ]),
    exports: Object.freeze(['deriveSupportPredecessor']),
    compile: Object.freeze({ headerProfile: 'cuda-cccl' }),
  });
}

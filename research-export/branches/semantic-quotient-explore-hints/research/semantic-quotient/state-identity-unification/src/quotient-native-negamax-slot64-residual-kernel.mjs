import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { createLocalQuotientProofStore } from './quotient-local-proof-store.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { installSlot64ResidualPool } from './quotient-slot64-residual-pool-v2.mjs';

export function createSlot64ResidualQuotientKernel(spec, options = {}) {
  const substrate = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const residual = installSlot64ResidualPool(substrate, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  const proofStore = createLocalQuotientProofStore(substrate.states);

  const stateSpacePort = Object.freeze({
    columns: substrate.columns,
    cellCount: substrate.cellCount,
    rootId: substrate.rootId,
    centerOrder: substrate.centerOrder,
    proofStore,
    rankAt: (stateId) => substrate.supportAccess.rankAt(substrate.states.support[stateId]),
    isLegal: (stateId, column) => substrate.supportAccess.landingAt(substrate.states.support[stateId], column) !== 0xff,
    transition: substrate.advance,
    tacticalCode: substrate.tacticalCode,
  });

  const kernel = Object.freeze({
    ...substrate,
    kind: 'connect4-slot64-quotient-state-space',
    createWdlSolver(config = {}) {
      const engine = createQuotientNegamaxEngine(stateSpacePort, config);
      return Object.freeze({
        run: engine.run,
        rootActionValues: engine.rootActionValues,
        metrics: engine.metrics,
      });
    },
  });

  return Object.freeze({ kernel, residual, proofStore });
}

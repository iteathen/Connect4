import {
  FRONTIER_BOUND_DRAW,
  FRONTIER_BOUND_MOVER_NO_WIN,
  FRONTIER_BOUND_NONE,
  FRONTIER_BOUND_OPPONENT_NO_WIN,
} from './quotient-negamax-domain-contract.mjs';
import { createLiveLineMoveOrder } from './quotient-live-line-move-order.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { installPrefixTermIdPool } from './quotient-term-id-prefix-pool.mjs';

export function createScaledTermIdQuotientNativeNegamaxKernel(spec, options = {}) {
  const substrate = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const termId = installPrefixTermIdPool(substrate, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  const proofStore = substrate.proofStore;
  const frontierOrder = createLiveLineMoveOrder(spec);

  function frontierBoundCode(stateId) {
    const supportIndex = substrate.states.support[stateId];
    const mover = substrate.supportAccess.rankAt(supportIndex) & 1;
    const p0Class = substrate.states.p0Class[stateId];
    const p1Class = substrate.states.p1Class[stateId];
    const ownClass = mover === 0 ? p0Class : p1Class;
    const opponentClass = mover === 0 ? p1Class : p0Class;
    const ownEmpty = substrate.classes.isEmpty(ownClass);
    const opponentEmpty = substrate.classes.isEmpty(opponentClass);
    if (ownEmpty && opponentEmpty) return FRONTIER_BOUND_DRAW;
    if (ownEmpty) return FRONTIER_BOUND_MOVER_NO_WIN;
    if (opponentEmpty) return FRONTIER_BOUND_OPPONENT_NO_WIN;
    return FRONTIER_BOUND_NONE;
  }

  const stateSpacePort = Object.freeze({
    columns: substrate.columns,
    cellCount: substrate.cellCount,
    rootId: substrate.rootId,
    centerOrder: substrate.centerOrder,
    proofStore,
    frontierOrder,
    rankAt: (stateId) => substrate.supportAccess.rankAt(substrate.states.support[stateId]),
    isLegal: (stateId, column) => substrate.supportAccess.landingAt(substrate.states.support[stateId], column) !== 0xff,
    landingCellAt: (stateId, column) => substrate.supportAccess.landingAt(substrate.states.support[stateId], column),
    transition: substrate.advance,
    tacticalCode: substrate.tacticalCode,
    frontierBoundCode,
  });

  const kernel = Object.freeze({
    ...substrate,
    kind: 'connect4-scaled-term-id-quotient-state-space',
    frontierOrder,
    frontierBoundCode,
    createWdlSolver(config = {}) {
      const engine = createQuotientNegamaxEngine(stateSpacePort, config);
      return Object.freeze({
        run: engine.run,
        rootActionValues: engine.rootActionValues,
        metrics: engine.metrics,
      });
    },
  });

  return Object.freeze({ kernel, termId, proofStore });
}

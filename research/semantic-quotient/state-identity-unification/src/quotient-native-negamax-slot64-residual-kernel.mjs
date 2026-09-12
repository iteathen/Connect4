import {
  FRONTIER_BOUND_DRAW,
  FRONTIER_BOUND_MOVER_NO_WIN,
  FRONTIER_BOUND_NONE,
  FRONTIER_BOUND_OPPONENT_NO_WIN,
} from './quotient-negamax-domain-contract.mjs';
import { createLiveLineMoveOrder } from './quotient-live-line-move-order.mjs';
import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { installSlot64ResidualPool } from './quotient-slot64-residual-pool-v2.mjs';
import { createPairedResponseClosure } from './quotient-paired-response-closure.mjs';

export function createSlot64ResidualQuotientKernel(spec, options = {}) {
  if (options.responseClosure !== undefined && typeof options.responseClosure !== 'boolean') {
    throw new TypeError('responseClosure must be boolean');
  }
  const substrate = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const residual = installSlot64ResidualPool(substrate, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  const proofStore = substrate.proofStore;
  const frontierOrder = createLiveLineMoveOrder(spec);
  const responseClosure = options.responseClosure === false ? null
    : createPairedResponseClosure(spec, substrate.supportAccess, substrate.classes, residual.vocabulary);

  function frontierBoundCode(stateId) {
    const supportIndex = substrate.states.support[stateId];
    const mover = substrate.supportAccess.rankAt(supportIndex) & 1;
    const p0Class = substrate.states.p0Class[stateId];
    const p1Class = substrate.states.p1Class[stateId];
    const ownClass = mover === 0 ? p0Class : p1Class;
    const opponentClass = mover === 0 ? p1Class : p0Class;
    const ownEmpty = substrate.classes.isEmpty(ownClass);
    const opponentEmpty = substrate.classes.isEmpty(opponentClass);
    const moverNoWin = ownEmpty || (responseClosure !== null && responseClosure.moverNoWin(supportIndex, ownClass));
    if (moverNoWin && opponentEmpty) return FRONTIER_BOUND_DRAW;
    if (moverNoWin) return FRONTIER_BOUND_MOVER_NO_WIN;
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
    kind: 'connect4-slot64-quotient-state-space',
    frontierOrder,
    frontierBoundCode,
    responseClosureProfile: responseClosure?.profile ?? null,
    memoryStats() {
      const base = substrate.memoryStats();
      const responseClosureBytes = responseClosure?.profile.retainedTypedBytes ?? 0;
      return Object.freeze({ ...base, responseClosureBytes, totalTypedBytes: base.totalTypedBytes + responseClosureBytes });
    },
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

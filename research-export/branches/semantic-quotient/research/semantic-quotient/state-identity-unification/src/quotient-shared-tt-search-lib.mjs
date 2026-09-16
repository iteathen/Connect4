import { QN_ILLEGAL } from './quotient-negamax-domain-contract.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { createPackedProofStore } from './quotient-packed-proof-store.mjs';

export function createSharedTtGraphSearcher(shared, options = {}) {
  const { spec, graph, arena } = shared;
  const { columns, rows } = spec;
  const edges = new Int32Array(graph.edgeBuffer);
  const tactical = new Int16Array(graph.tacticalBuffer);
  const ranks = new Uint8Array(graph.rankBuffer);
  const proofStore = createPackedProofStore(arena.recordBuffer);

  const engine = createQuotientNegamaxEngine(Object.freeze({
    columns,
    cellCount: columns * rows,
    rootId: graph.rootId,
    centerOrder: graph.centerOrder,
    proofStore,
    rankAt: (stateId) => ranks[stateId],
    isLegal: (stateId, column) => edges[stateId * columns + column] !== QN_ILLEGAL,
    transition: (stateId, column) => edges[stateId * columns + column],
    tacticalCode: (stateId) => tactical[stateId],
  }), {
    etc: options.etc !== false,
    etcMinRemaining: options.etcMinRemaining ?? 0,
    workerSalt: options.workerSalt ?? 0,
  });

  return Object.freeze({
    search: engine.search,
    solveState: engine.solveState,
    solveRoot: engine.solveRoot,
    solveRootColumn: engine.solveRootColumn,
    metrics: engine.metrics,
    proofStore,
  });
}

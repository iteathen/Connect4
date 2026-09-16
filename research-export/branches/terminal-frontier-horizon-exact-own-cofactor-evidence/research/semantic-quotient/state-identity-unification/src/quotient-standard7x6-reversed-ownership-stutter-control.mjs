#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import {
  Export_transport_snapshot,
  Verify_neutral_pair_transport,
} from './quotient-guarded-braid-transport.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const START_SEQUENCE = `${ROOT}3`;
const OFF_SYSTEM_SEQUENCE = `${START_SEQUENCE}2`;
const RECOVERED_SEQUENCE = `${OFF_SYSTEM_SEQUENCE}2`;
const B = 1, C = 2, G = 6, C3 = 16, G3 = 20;

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function phaseBits(engine, state) { return engine.heights(state).map((height) => height & 1).join(''); }
function landingCoord(engine, state, column) {
  const cell = engine.landing(state, column);
  return cell === 0xff ? 'FULL' : engine.coord(cell);
}
function targetInterface(engine, state) {
  return {
    C3: { live: engine.singleton(state, 0, C3), supportDistance: engine.targetDistance(state, C3) },
    G3: { live: engine.singleton(state, 0, G3), supportDistance: engine.targetDistance(state, G3) },
  };
}
function opponentTerminalSurface(engine, state) {
  return {
    enabledSingletons: engine.enabledSingletons(state, 1).map(engine.coord),
    terminalActions: engine.terminalActions(state, 1).map((x) => engine.coord(x.cell)),
  };
}
function transportSnapshot(engine, state) {
  return Export_transport_snapshot({
    claimId: 'standard7x6-latent-C3-G3-after-P0-C1',
    sideToMove: (engine.rank(state) & 1) === 0 ? 'P0' : 'P1',
    claimInterface: {
      targets: targetInterface(engine, state),
      opponentTerminalSurface: opponentTerminalSurface(engine, state),
    },
    phase: { fullGF2ColumnParity: phaseBits(engine, state) },
    supportOrdering: {
      nextC: landingCoord(engine, state, C),
      nextG: landingCoord(engine, state, G),
    },
    responseResources: {
      crossSupportResponse: 'G1',
      nextTargetCells: [landingCoord(engine, state, C), landingCoord(engine, state, G)],
    },
    obligations: [{
      id: 'support-pair:P0:C1->P1:G1',
      deadlineClock: 'P1_turn',
      remaining: 1,
      response: ['G1'],
    }],
    progressRank: [engine.mu(state)],
  });
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const engine = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });

const start = replay(kernel, START_SEQUENCE);
assert.equal(engine.rank(start), 13, 'expected P1-turn post-C1 scheduler state');
assert.equal(engine.landing(start, B), B, 'B1 must be the current B landing cell');

const afterB1 = kernel.advance(start, B);
assert.notEqual(afterB1, domain.QN_TERMINAL_WIN, 'P1:B1 is terminal; no stutter recovery exists');
assert(Number.isSafeInteger(afterB1) && afterB1 >= 0, 'P1:B1 must be legal');
assert.equal(engine.rank(afterB1), 14);
assert.equal(engine.landing(afterB1, B), 7 + B, 'candidate response must be B2');

const afterB2 = kernel.advance(afterB1, B);
assert.notEqual(afterB2, domain.QN_TERMINAL_WIN, 'P0:B2 is terminal success, not a stutter');
assert(Number.isSafeInteger(afterB2) && afterB2 >= 0, 'P0:B2 must be legal');
assert.equal(engine.rank(afterB2), 15);

const beforePhysical = {
  targetInterface: targetInterface(engine, start),
  phaseBits: phaseBits(engine, start),
  opponentTerminalSurface: opponentTerminalSurface(engine, start),
  targetSupportOrdering: { C: landingCoord(engine, start, C), G: landingCoord(engine, start, G) },
  mu: engine.mu(start),
};
const afterPhysical = {
  targetInterface: targetInterface(engine, afterB2),
  phaseBits: phaseBits(engine, afterB2),
  opponentTerminalSurface: opponentTerminalSurface(engine, afterB2),
  targetSupportOrdering: { C: landingCoord(engine, afterB2, C), G: landingCoord(engine, afterB2, G) },
  mu: engine.mu(afterB2),
};

const before = transportSnapshot(engine, start);
const after = transportSnapshot(engine, afterB2);
const transport = Verify_neutral_pair_transport({
  before,
  after,
  events: [
    { id: 'P1:B1', legal: true, terminal: false, clockTicks: { P1_turn: 1 } },
    { id: 'P0:B2', legal: true, terminal: false, clockTicks: { P1_turn: 0 } },
  ],
});

assert.equal(transport.ok, false, 'reversed-ownership B1->B2 unexpectedly qualified as exact stutter');

console.log(`REVERSED_OWNERSHIP_STUTTER_CONTROL=${JSON.stringify({
  kind: 'standard7x6-reversed-ownership-same-column-stutter-control-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT,
  activatedSchedulerSequence: START_SEQUENCE,
  candidate: {
    offSystemEvent: 'P1:B1',
    responseEvent: 'P0:B2',
    intermediateSequence: OFF_SYSTEM_SEQUENCE,
    finalSequence: RECOVERED_SEQUENCE,
  },
  beforePhysical,
  afterPhysical,
  transport,
  qualifiedAsExactStutter: transport.ok,
  interpretation: transport.ok
    ? 'The reversed-ownership pair preserves the declared claim interface, obligations/deadlines, response resources, phase, support order, and strictly decreases the finite repair resource.'
    : `The reversed-ownership pair is not an exact stutter under the accepted latent contract. Guard failure: ${transport.reason}. The pair must not be used to reset/re-enter that scheduler contract without a different exact consequence theorem.`,
  theoremBoundary: 'Falsifies or qualifies only the P0:C1, P1:B1, P0:B2 seam at 466565554644322 against the accepted latent C3/G3 scheduler contract. It does not infer W/D/L, does not use solved labels, and does not generalize to A/D/E/F.',
  authority: 'Exact C4-0010 transitions/residuals plus the existing latent-target support-pair deadline P0:C1 -> P1:G1 on next_P1_turn. No recursive board search and no oracle premise.',
})}`);

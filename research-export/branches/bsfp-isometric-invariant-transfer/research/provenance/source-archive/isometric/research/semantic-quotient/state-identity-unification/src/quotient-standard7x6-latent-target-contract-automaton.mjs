#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT_SEQUENCE = '466565554644';
const C = 2;
const G = 6;
const C3 = 2 * 7 + C;
const G3 = 2 * 7 + G;

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const d of seq) {
    const next = kernel.advance(id, Number(d) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${seq}`);
    id = next;
  }
  return id;
}

function hasCell([lo, hi], cell) {
  return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0);
}

function cellsOf(term) {
  const out = [];
  for (let cell = 0; cell < 42; cell++) if (hasCell(term, cell)) out.push(cell);
  return out;
}

function terms(kernel, id, player) {
  const classId = player === 0 ? kernel.states.p0At(id) : kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(cellsOf);
}

function hasSingleton(kernel, id, cell) {
  return terms(kernel, id, 0).some((term) => term.length === 1 && term[0] === cell);
}

function coord(col, rowOneBased) {
  return `${String.fromCharCode(65 + col)}${rowOneBased}`;
}

// Generic C-layer prototype object. The automaton owns activation/deadline state;
// snapshot response-capacity/matroid logic remains a derived view of active demands.
const TEMPORAL_CONTRACT_SCHEMA = Object.freeze({
  version: 1,
  fields: Object.freeze([
    'states',
    'initialState',
    'eventGuards',
    'requiredActions',
    'forbiddenActions',
    'resourceClaims',
    'phaseEffects',
    'deadlines',
    'consequences',
    'ndcGuards',
  ]),
});

// The fixed hinge compiles to two latent target contracts plus a support-pair
// contract. The support-pair is Baseinverse-shaped, but named-rule authority is
// deliberately not used by the verifier.
const COMPOSITE_CONTRACT = Object.freeze({
  kind: 'two-latent-target-cross-pair-v1',
  targets: Object.freeze({
    C: Object.freeze({ chain: ['C1', 'C2', 'C3'], target: 'C3' }),
    G: Object.freeze({ chain: ['G1', 'G2', 'G3'], target: 'G3' }),
  }),
  supportPair: Object.freeze({
    cells: ['C1', 'G1'],
    responseRelation: Object.freeze({ 'P0:C1': 'P1:G1', 'P0:G1': 'P1:C1' }),
    responseDeadline: 'next_P1_turn',
  }),
  targetResponses: Object.freeze({
    'P0:C2': 'P1:C3',
    'P0:G2': 'P1:G3',
  }),
  forbiddenOldResponses: Object.freeze(['P0:C1->P1:C2', 'P0:G1->P1:G2']),
  schemaVersion: TEMPORAL_CONTRACT_SCHEMA.version,
});

function stateKey(state) {
  return `${state.c},${state.g}`;
}

function enumerateTargetOnlySchedules() {
  const terminalTraces = [];
  const decisionStates = new Set();
  const edges = [];

  function visit(state, trace) {
    decisionStates.add(stateKey(state));
    if (state.c === 3 && state.g === 3) {
      terminalTraces.push(trace);
      return;
    }

    for (const attackCol of ['c', 'g']) {
      if (state[attackCol] >= 3) continue;
      const next = { ...state };
      const col = attackCol === 'c' ? C : G;
      const otherCol = attackCol === 'c' ? G : C;
      const otherKey = attackCol === 'c' ? 'g' : 'c';
      const attackRow = next[attackCol] + 1;

      // A P0 move at row 3 would take a live singleton target and is failure.
      assert.notEqual(attackRow, 3, `policy exposed ${coord(col, 3)} to P0`);
      next[attackCol]++;
      const attack = { player: 0, col, row: attackRow, cell: coord(col, attackRow) };

      let response;
      if (attackRow === 1) {
        // Cross-pair the two directly playable support cells.
        assert.equal(next[otherKey], 0, 'cross-pair response lost direct playability');
        next[otherKey]++;
        response = { player: 1, col: otherCol, row: 1, cell: coord(otherCol, 1), reason: 'cross_support_pair' };
      } else {
        // Once P0 advances the middle support event, the corresponding target is
        // immediately playable and must be consumed on this P1 turn.
        assert.equal(attackRow, 2);
        next[attackCol]++;
        response = { player: 1, col, row: 3, cell: coord(col, 3), reason: 'latent_target_response' };
      }

      const nextTrace = [...trace, attack, response];
      edges.push({ from: stateKey(state), attack, response, to: stateKey(next) });
      visit(next, nextTrace);
    }
  }

  visit({ c: 0, g: 0 }, []);
  return { terminalTraces, decisionStates: [...decisionStates].sort(), edges };
}

function verifyConcreteTrace(kernel, rootId, trace) {
  let id = rootId;
  let ply = ROOT_SEQUENCE.length;
  const events = [];

  for (const event of trace) {
    assert.equal(ply & 1, event.player, `turn drift before ${event.cell}`);
    if (event.player === 1 && event.row === 3) {
      const target = event.col === C ? C3 : G3;
      assert.equal(hasSingleton(kernel, id, target), true, `missing live singleton before ${event.cell}`);
    }

    const next = kernel.advance(id, event.col);
    const moverTerminal = next === domain.QN_TERMINAL_WIN;
    events.push({ ...event, moverTerminal });

    if (moverTerminal) {
      if (event.player === 0) throw new Error(`P0 terminal escaped contract at ${event.cell}`);
      return { status: 'P1_terminal', events };
    }
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`illegal contract event ${event.cell}`);

    id = next;
    ply++;

    if (event.player === 1 && event.row === 3) {
      const target = event.col === C ? C3 : G3;
      assert.equal(hasSingleton(kernel, id, target), false, `target singleton survived P1 ownership at ${event.cell}`);
    }
  }

  assert.equal(hasSingleton(kernel, id, C3), false, 'C3 singleton remained after completed contract');
  assert.equal(hasSingleton(kernel, id, G3), false, 'G3 singleton remained after completed contract');
  return { status: 'both_targets_discharged', events };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const rootId = replay(kernel, ROOT_SEQUENCE);
assert.equal(hasSingleton(kernel, rootId, C3), true, 'C3 hinge singleton drift');
assert.equal(hasSingleton(kernel, rootId, G3), true, 'G3 hinge singleton drift');

const abstract = enumerateTargetOnlySchedules();
assert.deepEqual(abstract.decisionStates, ['0,0', '1,1', '1,3', '3,1', '3,3']);
assert.equal(abstract.terminalTraces.length, 4);

const concrete = abstract.terminalTraces.map((trace) => verifyConcreteTrace(kernel, rootId, trace));
assert.equal(concrete.every((x) => x.status === 'both_targets_discharged' || x.status === 'P1_terminal'), true);

console.log(`LATENT_TARGET_CONTRACT_AUTOMATON=${JSON.stringify({
  kind: 'standard7x6-latent-target-cross-pair-temporal-contract-v1',
  attribution: {
    researchDirectionInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rootSequence: ROOT_SEQUENCE,
  temporalContractSchema: TEMPORAL_CONTRACT_SCHEMA,
  compositeContract: COMPOSITE_CONTRACT,
  abstractScheduler: {
    decisionStates: abstract.decisionStates,
    edgeCount: abstract.edges.length,
    completeTargetOnlyAttackerSchedules: abstract.terminalTraces.length,
    edges: abstract.edges,
  },
  concreteEmbedding: concrete,
  theoremBoundary: 'Exact for the two C/G support chains with P0 choosing target-chain advances. It proves the cross-pair + target-response temporal contract embeds legally in the fixed C4 state for every target-only attacker schedule. Off-subsystem P0 moves require a separately proved stutter/phase-preservation composition rule and are not covered here.',
  authority: 'Abstract scheduler plus exact C4-0010 transitions/residuals. No solved W/D/L labels and no recursive q-frontier search.',
})}`);

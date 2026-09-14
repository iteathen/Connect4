#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C3 = 16, G3 = 20;
const REFUSALS = Object.freeze({ A: 0, B: 1, D: 3, E: 4, F: 5 });
const refusalName = process.argv[2] ?? null;
if (refusalName !== null && !(refusalName in REFUSALS)) throw new Error('usage: refusal-root-action-routing [A|B|D|E|F]');

function col(c) { return String.fromCharCode(65 + c); }
function coord(cell) { return `${col(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function replay(kernel, sequence) {
  let state = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(state, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    state = next;
  }
  return state;
}
function rank(kernel, state) { return kernel.supportAccess.rankAt(kernel.states.supportAt(state)); }
function landing(kernel, state, column) { return kernel.supportAccess.landingAt(kernel.states.supportAt(state), column); }
function legal(kernel, state) { const out = []; for (let c = 0; c < 7; c++) if (landing(kernel, state, c) !== 0xff) out.push(c); return out; }

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const rho = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: 100000 });
const e = rho.repair;

function targets(state) {
  return {
    C3: { live: e.singleton(state, 0, C3), distance: e.singleton(state, 0, C3) ? e.targetDistance(state, C3) : null },
    G3: { live: e.singleton(state, 0, G3), distance: e.singleton(state, 0, G3) ? e.targetDistance(state, G3) : null },
  };
}
function enabled(state, player) { return e.enabledSingletons(state, player).map(coord); }
function terminals(state, player) {
  if ((rank(kernel, state) & 1) !== player) return [];
  return e.terminalActions(state, player).map((x) => coord(x.cell));
}
function classifyAction(rootState, action) {
  const cell = landing(kernel, rootState, action);
  if (cell === 0xff) return { action: col(action), status: 'unavailable' };
  const afterP0 = kernel.advance(rootState, action);
  if (afterP0 === domain.QN_TERMINAL_WIN) {
    return { action: col(action), cell: coord(cell), status: 'P0_terminal_now', exactWin: true };
  }
  assert(afterP0 >= 0 && (rank(kernel, afterP0) & 1) === 1);
  const p1Immediate = terminals(afterP0, 1);
  if (p1Immediate.length) {
    return {
      action: col(action), cell: coord(cell), status: 'P1_terminal_override', exactWin: false,
      p1TerminalCells: p1Immediate, p0Threats: enabled(afterP0, 0), targetsAfterP0: targets(afterP0),
    };
  }

  const threats = e.enabledSingletons(afterP0, 0);
  if (threats.length >= 2) {
    const replies = [];
    let allClose = true;
    for (const reply of legal(kernel, afterP0)) {
      const replyCell = landing(kernel, afterP0, reply);
      const child = kernel.advance(afterP0, reply);
      assert(child >= 0 && child !== domain.QN_TERMINAL_WIN);
      const p0Terminal = terminals(child, 0);
      if (!p0Terminal.length) allClose = false;
      replies.push({ reply: col(reply), replyCell: coord(replyCell), p0TerminalCells: p0Terminal });
    }
    return {
      action: col(action), cell: coord(cell), status: allClose ? 'P0_response_capacity_circuit' : 'multi_threat_unclosed',
      exactWin: allClose, p0Threats: threats.map(coord), replies, targetsAfterP0: targets(afterP0),
    };
  }

  if (threats.length === 1) {
    const threat = threats[0];
    const replies = [];
    let blockState = null;
    let nonblocksClose = true;
    for (const reply of legal(kernel, afterP0)) {
      const replyCell = landing(kernel, afterP0, reply);
      const child = kernel.advance(afterP0, reply);
      assert(child >= 0 && child !== domain.QN_TERMINAL_WIN);
      if (replyCell === threat) {
        blockState = child;
        replies.push({ reply: col(reply), replyCell: coord(replyCell), route: 'forced_block' });
      } else {
        const p0Terminal = terminals(child, 0);
        if (!p0Terminal.length) nonblocksClose = false;
        replies.push({ reply: col(reply), replyCell: coord(replyCell), route: p0Terminal.length ? 'nonblock_exposes_P0_terminal' : 'nonblock_unclosed', p0TerminalCells: p0Terminal });
      }
    }
    assert(blockState !== null, 'single threat lacks exact block reply');
    const afterBlockP0Immediate = terminals(blockState, 0);
    const afterBlockP1Obligations = enabled(blockState, 1);
    const blockTargets = targets(blockState);
    const rhoResults = {};
    for (const [name, target] of [['C3', C3], ['G3', G3]]) {
      if (!blockTargets[name].live || blockTargets[name].distance !== 1) continue;
      const proof = rho.prove(blockState, target);
      rhoResults[name] = {
        proved: proof.proved,
        kind: proof.kind,
        exactLoss: proof.exactLoss === true,
        witness: proof.witness ?? null,
        witnessKind: proof.witnessKind ?? null,
        measure: proof.measure ?? null,
        obligations: proof.obligations ?? null,
        forcedDefense: proof.forcedDefense ?? null,
      };
    }
    const exactChildWin = afterBlockP0Immediate.length > 0 || Object.values(rhoResults).some((x) => x.proved);
    return {
      action: col(action), cell: coord(cell),
      status: nonblocksClose && exactChildWin ? 'forced_block_then_qualified_child' : 'forced_block_open',
      exactWin: nonblocksClose && exactChildWin,
      threat: coord(threat), nonblocksClose, replies,
      afterBlock: { targets: blockTargets, p0Immediate: afterBlockP0Immediate, p1Obligations: afterBlockP1Obligations, rhoResults },
    };
  }

  return {
    action: col(action), cell: coord(cell), status: 'no_immediate_P0_threat', exactWin: false,
    targetsAfterP0: targets(afterP0), p1ObligationsAfterP0: enabled(afterP0, 1),
  };
}

const names = refusalName ? [refusalName] : ['A', 'B', 'D', 'E', 'F'];
const rows = [];
for (const name of names) {
  const sequence = ROOT + '3' + String(REFUSALS[name] + 1);
  const state = replay(kernel, sequence);
  assert.equal(rank(kernel, state) & 1, 0, `${sequence}: expected P0 turn`);
  const rootP0Immediate = terminals(state, 0);
  const rootP1Obligations = enabled(state, 1);
  const actions = legal(kernel, state).map((action) => classifyAction(state, action));
  rows.push({
    refusal: name,
    sequence,
    targets: targets(state),
    rootP0Immediate,
    rootP1Obligations,
    exactWinningActions: actions.filter((x) => x.exactWin).map((x) => x.action),
    actions,
  });
}

console.log(`REFUSAL_ROOT_ACTION_ROUTING=${JSON.stringify({
  kind: 'standard7x6-refusal-root-action-routing-v2',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  rows,
  theoremBoundary: 'Exact one-action routing at each offsystem refusal root after P0:C1. An action is promoted only when every immediate P1 reply closes by an exact terminal/response-capacity certificate or a qualified obligation-first rho child. Open actions remain unknown; no universal witness is assumed across refusal columns.',
  authority: 'Exact C4-0010 transitions/terminal facts plus the obligation-first rho research calculus. No solved labels, symmetry assumption, deadline reset, q equality, or cap increase.',
})}`);

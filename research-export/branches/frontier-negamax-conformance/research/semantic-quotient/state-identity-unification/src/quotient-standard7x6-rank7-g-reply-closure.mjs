#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CHILD = '46656557';
const F = 5;
const D = 3;
const C = 2;
const F5 = 4 * 7 + F;
const C1 = C;
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-rank7-g5-kappa-child-probe.mjs', import.meta.url));
const ACTION_MAP = Object.freeze({ A: 'D', B: 'B', C: 'G', D: 'E', E: 'D', F: 'D', G: 'D' });

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}

function assertForcedBlock(kernel, e, state, witnessColumn, expectedThreatCell, expectedBlockColumn, label) {
  const actionCell = e.landing(state, witnessColumn);
  const afterP0 = kernel.advance(state, witnessColumn);
  assert(Number.isSafeInteger(afterP0) && afterP0 >= 0 && afterP0 !== domain.QN_TERMINAL_WIN, `${label}: witness must be legal nonterminal`);
  assert.equal(e.terminalActions(afterP0, 1).length, 0, `${label}: P1 immediate terminal override`);
  assert(new Set(e.enabledSingletons(afterP0, 0)).has(expectedThreatCell), `${label}: expected P0 singleton missing`);
  const routes = [];
  let block = null;
  for (const reply of e.legal(afterP0)) {
    const replyCell = e.landing(afterP0, reply);
    const child = kernel.advance(afterP0, reply);
    assert.notEqual(child, domain.QN_TERMINAL_WIN, `${label}: unexpected P1 terminal`);
    assert(Number.isSafeInteger(child) && child >= 0);
    if (replyCell === expectedThreatCell) {
      assert.equal(reply, expectedBlockColumn, `${label}: block column drift`);
      block = child;
      routes.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'forced_block' });
      continue;
    }
    const terminal = e.terminalActions(child, 0).find((x) => x.cell === expectedThreatCell) ?? null;
    assert(terminal, `${label}: nonblock ${e.coord(replyCell)} failed to expose terminal`);
    routes.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'nonblock_exposes_P0_terminal' });
  }
  assert(block !== null, `${label}: forced block missing`);
  return { actionCell: e.coord(actionCell), afterP0, block, routes };
}

function runLeaf(reply, action) {
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, REPLY: reply, ACTION: action },
  });
  if (child.error) throw child.error;
  assert.equal(child.status, 0, `G leaf ${reply}/${action} process failure: ${(child.stderr ?? '').slice(-4000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('RANK7_G5_KAPPA_CHILD_PROBE='));
  assert(line, `G leaf ${reply}/${action} output missing`);
  const x = JSON.parse(line.slice('RANK7_G5_KAPPA_CHILD_PROBE='.length));
  assert.equal(x.reply, reply);
  assert.equal(x.rootAction, action);
  assert.equal(x.proved, true, `G leaf ${reply}/${action} no longer proved`);
  return {
    reply,
    rootAction: action,
    proofKind: x.proofKind,
    targetDistance: x.targetDistance,
    witness: x.witness,
    witnessKind: x.witnessKind,
    forcedObligation: x.forcedObligation ?? null,
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });
const root = replay(kernel, CHILD);
assert.equal(e.rank(root) % 2, 0, 'rank7 G child must be P0 turn');

const f5 = assertForcedBlock(kernel, e, root, F, F5, F, 'F4->F5');
assert.equal(f5.block, replay(kernel, '4665655766'), 'F5 block state identity drift');
const c1 = assertForcedBlock(kernel, e, f5.block, D, C1, C, 'D2->C1');
assert.equal(c1.block, replay(kernel, '466565576643'), 'C1 block state identity drift');

const leaves = Object.entries(ACTION_MAP).map(([reply, action]) => runLeaf(reply, action));
assert.equal(leaves.length, 7);
assert.deepEqual(leaves.map((x) => x.reply), ['A','B','C','D','E','F','G']);

console.log(`RANK7_G_REPLY_CLOSURE=${JSON.stringify({
  kind: 'standard7x6-rank7-g-reply-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  childSequence: CHILD,
  witnessChain: ['F4', 'forced P1:F5', 'D2', 'forced P1:C1', 'G2'],
  f5Routes: f5.routes,
  c1Routes: c1.routes,
  leaves,
  proved: true,
  theoremBoundary: 'Exact only for the P1:G child 46656557 from rank7 parent 4665655. F4 and D2 are tactical forced-block certificates; after G2 every legal P1 reply is re-executed in a fresh kernel with its exact qualified top-level kappa/rho witness. No symmetry, solved W/D/L, q equality, or resource-limit widening is used.',
})}`);

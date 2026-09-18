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
const CASES = Object.freeze([
  { reply: 'A', child: '46656551', postF5: '4665655166', postC1: '466565516643' },
  { reply: 'B', child: '46656552', postF5: '4665655266', postC1: '466565526643' },
]);
const F = 5;
const D = 3;
const C = 2;
const F5 = 4 * 7 + F;
const C1 = C;
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-target-distance-sequence-probe.mjs', import.meta.url));

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}

function force(kernel, e, state, action, threatCell, blockColumn, label) {
  const actionCell = e.landing(state, action);
  const afterP0 = kernel.advance(state, action);
  assert(Number.isSafeInteger(afterP0) && afterP0 >= 0 && afterP0 !== domain.QN_TERMINAL_WIN, `${label}: action must be legal nonterminal`);
  assert.equal(e.terminalActions(afterP0, 1).length, 0, `${label}: P1 immediate terminal override`);
  assert(new Set(e.enabledSingletons(afterP0, 0)).has(threatCell), `${label}: singleton missing`);
  let block = null;
  const routes = [];
  for (const reply of e.legal(afterP0)) {
    const replyCell = e.landing(afterP0, reply);
    const child = kernel.advance(afterP0, reply);
    assert.notEqual(child, domain.QN_TERMINAL_WIN, `${label}: unexpected P1 terminal`);
    assert(Number.isSafeInteger(child) && child >= 0);
    if (replyCell === threatCell) {
      assert.equal(reply, blockColumn, `${label}: block-column drift`);
      block = child;
      routes.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'forced_block' });
    } else {
      const terminal = e.terminalActions(child, 0).find((x) => x.cell === threatCell) ?? null;
      assert(terminal, `${label}: nonblock ${e.coord(replyCell)} failed to expose P0 terminal`);
      routes.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'nonblock_exposes_P0_terminal' });
    }
  }
  assert(block !== null, `${label}: forced block missing`);
  return { actionCell: e.coord(actionCell), block, routes };
}

function runKappa(sequence) {
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, SEQUENCE: sequence, TARGET: 'G5', MAX_TARGET_DISTANCE: '4', ACTION: 'G' },
  });
  if (child.error) throw child.error;
  assert.equal(child.status, 0, `G5 kappa subprocess failed: ${(child.stderr ?? '').slice(-4000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('TARGET_DISTANCE_SEQUENCE_PROBE='));
  assert(line, 'G5 kappa output missing');
  const x = JSON.parse(line.slice('TARGET_DISTANCE_SEQUENCE_PROBE='.length));
  assert.equal(x.sequence, sequence);
  assert.equal(x.target, 'G5');
  assert.equal(x.rootAction, 'G');
  assert.equal(x.proved, true, `${sequence}: G5 kappa no longer proved`);
  return {
    proofKind: x.proofKind,
    targetDistance: x.targetDistance,
    measure: x.measure,
    witness: x.witness,
    witnessKind: x.witnessKind,
    stats: x.stats,
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });

const rows = [];
for (const item of CASES) {
  const child = replay(kernel, item.child);
  assert.equal(e.rank(child) % 2, 0, `${item.reply}: rank7 child must be P0 turn`);
  const f5 = force(kernel, e, child, F, F5, F, `${item.reply}:F4->F5`);
  assert.equal(f5.block, replay(kernel, item.postF5), `${item.reply}: F5 block state drift`);
  const c1 = force(kernel, e, f5.block, D, C1, C, `${item.reply}:D2->C1`);
  assert.equal(c1.block, replay(kernel, item.postC1), `${item.reply}: C1 block state drift`);
  const kappa = runKappa(item.postC1);
  rows.push({
    reply: item.reply,
    childSequence: item.child,
    witnessChain: ['F4', 'forced P1:F5', 'D2', 'forced P1:C1', 'G1'],
    f5Routes: f5.routes,
    c1Routes: c1.routes,
    kappa,
    proved: true,
  });
}

console.log(`RANK7_AB_REPLY_CLOSURE=${JSON.stringify({
  kind: 'standard7x6-rank7-ab-reply-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: '4665655',
  rows,
  provedReplies: rows.map((x) => x.reply),
  proved: rows.every((x) => x.proved),
  theoremBoundary: 'Exact only for P1:A and P1:B children of rank7 state 4665655. Each branch rechecks F4->forced F5, D2->forced C1, then independently re-executes the higher-distance G5 kappa theorem with root G. No symmetry between A/B is assumed; both exact histories are verified separately. No external W/D/L, q equality, or cap widening.',
})}`);

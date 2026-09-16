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
const START = '4665655466';
const D = 3;
const C3 = 2 * 7 + 2;
const G3 = 2 * 7 + 6;
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-target-distance-sequence-probe.mjs', import.meta.url));

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const digit of seq) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${seq}`);
    id = next;
  }
  return id;
}
function runTarget(sequence, target) {
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, SEQUENCE: sequence, TARGET: target, MAX_TARGET_DISTANCE: '2' },
  });
  if (child.error) return { target, proved: false, proofKind: 'execution_error', error: { kind: 'execution_error', message: child.error.message } };
  if (child.status !== 0) return { target, proved: false, proofKind: 'process_failure', error: { kind: 'process_failure', message: (child.stderr ?? '').slice(-4000) } };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('TARGET_DISTANCE_SEQUENCE_PROBE='));
  assert(line, 'target probe output missing');
  return JSON.parse(line.slice('TARGET_DISTANCE_SEQUENCE_PROBE='.length));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });
const root = replay(kernel, START);
assert.equal(e.rank(root) % 2, 0);
assert.equal(e.coord(e.landing(root, D)), 'D3');
const afterD3 = kernel.advance(root, D);
assert(Number.isSafeInteger(afterD3) && afterD3 >= 0 && afterD3 !== domain.QN_TERMINAL_WIN);
assert.equal(e.singleton(afterD3, 0, C3), true, 'D3 failed to create C3 singleton');
assert.equal(e.singleton(afterD3, 0, G3), true, 'D3 failed to create G3 singleton');
assert.equal(e.targetDistance(afterD3, C3), 2);
assert.equal(e.targetDistance(afterD3, G3), 2);
assert.equal(e.terminalActions(afterD3, 1).length, 0, 'P1 terminal override after D3');

const branches = [];
let proved = true;
for (const reply of e.legal(afterD3)) {
  const replyCell = e.landing(afterD3, reply);
  const child = kernel.advance(afterD3, reply);
  const sequence = START + '4' + String(reply + 1);
  if (child === domain.QN_TERMINAL_WIN) {
    proved = false;
    branches.push({ reply: e.col(reply), replyCell: e.coord(replyCell), sequence, route: 'P1_terminal' });
    continue;
  }
  assert(Number.isSafeInteger(child) && child >= 0);
  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    branches.push({ reply: e.col(reply), replyCell: e.coord(replyCell), sequence, route: 'immediate_P0_terminal', terminals: immediate.map((x) => e.coord(x.cell)) });
    continue;
  }

  const candidates = [];
  let selected = null;
  for (const target of ['C3', 'G3']) {
    const result = runTarget(sequence, target);
    candidates.push({
      target,
      proved: result.proved,
      proofKind: result.proofKind,
      targetLive: result.targetLive,
      targetDistance: result.targetDistance,
      witness: result.witness,
      witnessKind: result.witnessKind,
      measure: result.measure,
      error: result.error,
      stats: result.stats,
    });
    if (result.proved === true) { selected = candidates[candidates.length - 1]; break; }
  }
  if (!selected) proved = false;
  branches.push({
    reply: e.col(reply), replyCell: e.coord(replyCell), sequence,
    route: selected ? 'dual_target_kappa' : 'dual_target_unproved',
    selected,
    candidates,
  });
}

console.log(`RANK7_D_POST_F5_DUAL_KAPPA_HANDOFF=${JSON.stringify({
  kind: 'standard7x6-rank7-d-post-f5-dual-kappa-handoff-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  startSequence: START,
  witness: 'D3',
  createdTargets: [{ target: 'C3', distance: 2 }, { target: 'G3', distance: 2 }],
  branches,
  proved,
  theoremBoundary: 'Exact only for 4665655466 via P0:D3. D3 creates simultaneous latent C3/G3 distance-two targets; every legal P1 reply must be discharged by immediate P0 terminality or at least one independently executed C3/G3 kappa certificate. Resource failure blocks promotion and is not loss.',
})}`);

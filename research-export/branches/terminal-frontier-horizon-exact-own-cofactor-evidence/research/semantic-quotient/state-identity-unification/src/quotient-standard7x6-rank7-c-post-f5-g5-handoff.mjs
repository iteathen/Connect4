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
const START = '4665655366';
const D = 3;
const G5 = 4 * 7 + 6;
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
function runChild(sequence) {
  const child = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, SEQUENCE: sequence, TARGET: 'G5', MAX_TARGET_DISTANCE: '4' },
  });
  if (child.error) return { proved: false, proofKind: 'execution_error', error: child.error.message };
  assert.equal(child.status, 0, `target child probe failed: ${(child.stderr ?? '').slice(-4000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('TARGET_DISTANCE_SEQUENCE_PROBE='));
  assert(line, 'target child probe output missing');
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
assert.equal(e.coord(e.landing(root, D)), 'D2');
const afterD2 = kernel.advance(root, D);
assert(Number.isSafeInteger(afterD2) && afterD2 >= 0 && afterD2 !== domain.QN_TERMINAL_WIN);
assert.equal(e.singleton(afterD2, 0, G5), true, 'D2 failed to create G5 singleton');
assert.equal(e.targetDistance(afterD2, G5), 4, 'G5 distance drift after D2');
assert.equal(e.terminalActions(afterD2, 1).length, 0, 'P1 terminal override after D2');

const branches = [];
let proved = true;
for (const reply of e.legal(afterD2)) {
  const replyCell = e.landing(afterD2, reply);
  const child = kernel.advance(afterD2, reply);
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
  const certificate = runChild(sequence);
  if (certificate.proved !== true) proved = false;
  branches.push({
    reply: e.col(reply), replyCell: e.coord(replyCell), sequence,
    route: certificate.proved === true ? 'G5_kappa' : 'G5_kappa_unproved',
    certificate: {
      proved: certificate.proved,
      proofKind: certificate.proofKind,
      targetDistance: certificate.targetDistance,
      measure: certificate.measure,
      witness: certificate.witness,
      witnessKind: certificate.witnessKind,
      error: certificate.error,
      stats: certificate.stats,
    },
  });
}

console.log(`RANK7_C_POST_F5_G5_HANDOFF=${JSON.stringify({
  kind: 'standard7x6-rank7-c-post-f5-g5-handoff-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  startSequence: START,
  witness: 'D2',
  createdTarget: 'G5',
  createdDistance: 4,
  branches,
  proved,
  theoremBoundary: 'Exact only for 4665655366 via P0:D2. D2 creates latent G5@d4; every legal P1 reply is discharged by immediate P0 terminality or an independently executed higher-distance kappa certificate. Any resource failure remains unknown and prevents promotion.',
})}`);

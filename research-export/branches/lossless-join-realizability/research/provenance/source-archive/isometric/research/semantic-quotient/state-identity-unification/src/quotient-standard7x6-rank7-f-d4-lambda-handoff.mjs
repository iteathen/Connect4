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
const START = '46656556';
const G = 6;
const D4 = 3 * 7 + 3;
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-generic-target-distance-sequence-probe.mjs', import.meta.url));

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
    encoding: 'utf-8',
    timeout: 300000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, SEQUENCE: sequence, TARGET: 'D4', MAX_TARGET_DISTANCE: '2' },
  });
  if (child.error) return { proved: false, proofKind: 'execution_error', error: { kind: 'execution_error', message: child.error.message } };
  if (child.status !== 0) return { proved: false, proofKind: 'process_failure', error: { kind: 'process_failure', message: (child.stderr ?? '').slice(-4000) } };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('GENERIC_TARGET_DISTANCE_SEQUENCE_PROBE='));
  assert(line, 'generic target child probe output missing');
  return JSON.parse(line.slice('GENERIC_TARGET_DISTANCE_SEQUENCE_PROBE='.length));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });
const root = replay(kernel, START);
assert.equal(e.rank(root) % 2, 0, 'rank7 F child must be P0 turn');
assert.equal(e.coord(e.landing(root, G)), 'G1', 'F child G support landing drift');

const afterG1 = kernel.advance(root, G);
assert(Number.isSafeInteger(afterG1) && afterG1 >= 0 && afterG1 !== domain.QN_TERMINAL_WIN, 'P0:G1 must be legal nonterminal');
assert.equal(e.singleton(afterG1, 0, D4), true, 'G1 failed to create exact D4 singleton');
assert.equal(e.targetDistance(afterG1, D4), 2, 'D4 support distance drift after G1');
assert.equal(e.terminalActions(afterG1, 1).length, 0, 'P1 immediate terminal override after G1');

const branches = [];
let proved = true;
for (const reply of e.legal(afterG1)) {
  const replyCell = e.landing(afterG1, reply);
  const child = kernel.advance(afterG1, reply);
  const sequence = START + '7' + String(reply + 1);
  if (child === domain.QN_TERMINAL_WIN) {
    proved = false;
    branches.push({ reply: e.col(reply), replyCell: e.coord(replyCell), sequence, route: 'P1_terminal' });
    continue;
  }
  assert(Number.isSafeInteger(child) && child >= 0);
  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    branches.push({
      reply: e.col(reply), replyCell: e.coord(replyCell), sequence,
      route: 'immediate_P0_terminal', terminals: immediate.map((x) => e.coord(x.cell)),
    });
    continue;
  }
  const certificate = runChild(sequence);
  if (certificate.proved !== true) proved = false;
  branches.push({
    reply: e.col(reply), replyCell: e.coord(replyCell), sequence,
    route: certificate.proved === true ? 'D4_lambda' : 'D4_lambda_unproved',
    certificate: {
      proved: certificate.proved,
      proofKind: certificate.proofKind,
      targetLive: certificate.targetLive,
      targetDistance: certificate.targetDistance,
      measure: certificate.measure,
      witness: certificate.witness,
      witnessKind: certificate.witnessKind,
      exactLoss: certificate.exactLoss,
      obligations: certificate.obligations,
      forcedDefense: certificate.forcedDefense,
      error: certificate.error,
      stats: certificate.stats,
    },
  });
}

console.log(`RANK7_F_D4_LAMBDA_HANDOFF=${JSON.stringify({
  kind: 'standard7x6-rank7-f-d4-lambda-handoff-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  startSequence: START,
  witness: 'G1',
  createdTarget: 'D4',
  createdDistance: 2,
  branches,
  proved,
  theoremBoundary: 'Exact only for rank7 P1:F child 46656556 via P0:G1. G1 creates D4@d2. Every legal P1 reply must close by immediate P0 terminality or an independently executed generic lambda=(target distance,mu) certificate for D4. This does not import the C/G resolved-tail delta coordinate. Resource failure remains unknown.',
})}`);

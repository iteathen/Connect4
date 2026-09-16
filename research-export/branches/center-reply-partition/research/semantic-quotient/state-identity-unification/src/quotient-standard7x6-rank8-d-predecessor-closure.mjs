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
const PREDECESSOR = '46656555';
const CHILD = '466565554';
const D = 3;
const CHILD_CONTROL = fileURLToPath(new URL('./quotient-standard7x6-rank9-full-reply-closure.mjs', import.meta.url));

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}

function qualifyRank9Child() {
  const child = spawnSync(process.execPath, [CHILD_CONTROL], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  assert.equal(child.signal, null, `rank9 child control signaled ${child.signal}`);
  assert.equal(child.status, 0, `rank9 child control failed: ${(child.stderr || child.stdout).slice(-16000)}`);
  const line = child.stdout.split(/\r?\n/).find((x) => x.startsWith('RANK9_FULL_REPLY_CLOSURE='));
  assert(line, 'rank9 child theorem output missing');
  const result = JSON.parse(line.slice('RANK9_FULL_REPLY_CLOSURE='.length));
  assert.equal(result.parent, CHILD, 'rank9 child theorem root drift');
  assert.equal(result.sideToMove, 'P1', 'rank9 child side-to-move drift');
  assert.equal(result.proved, true, 'rank9 child no longer proved');
  assert.deepEqual(result.coveredP1Replies, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'rank9 child reply coverage drift');
  return {
    kind: result.kind,
    parent: result.parent,
    coveredP1Replies: result.coveredP1Replies,
    theoremBoundary: result.theoremBoundary,
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });

const root = replay(kernel, PREDECESSOR);
assert.equal(e.rank(root), 8, 'rank8 predecessor rank drift');
const landing = e.landing(root, D);
assert.notEqual(landing, 0xff, 'P0:D must be legal at rank8 predecessor');
const landingCell = e.coord(landing);
const afterD = kernel.advance(root, D);
assert(Number.isSafeInteger(afterD) && afterD >= 0 && afterD !== domain.QN_TERMINAL_WIN, 'P0:D unexpectedly terminal/invalid');
assert.equal(e.rank(afterD), 9, 'rank8 D-child rank drift');
assert.equal(afterD, replay(kernel, CHILD), 'P0:D child does not equal exact rank9 theorem root');

const childCertificate = qualifyRank9Child();
const result = {
  kind: 'standard7x6-rank8-d-predecessor-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  predecessor: PREDECESSOR,
  sideToMove: 'P0',
  witness: 'D',
  witnessCell: landingCell,
  childSequence: CHILD,
  childCertificate,
  proved: true,
  promotedConsequence: `${PREDECESSOR} is structurally P0-winning via exact P0:${landingCell} into qualified child ${CHILD}`,
  theoremBoundary: 'Exact only for P0-turn state 46656555 via its D-column action into exact child 466565554. The child is discharged by re-executing the complete seven-reply rank9 structural theorem. No claim is made about alternative P0 actions, solved/external WDL, symmetry, phase-only forcing, q equality, implicit frame rules, or widened resource limits.',
  authority: 'Exact C4-0010 transition identity plus the independently executable rank9 universal predecessor theorem.',
};
console.log(`RANK8_D_PREDECESSOR_CLOSURE=${JSON.stringify(result)}`);

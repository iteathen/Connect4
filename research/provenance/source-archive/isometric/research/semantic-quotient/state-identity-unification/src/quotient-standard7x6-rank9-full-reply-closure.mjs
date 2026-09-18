#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PARENT = '466565554';
const HERE = dirname(fileURLToPath(import.meta.url));
const EASY = join(HERE, 'quotient-standard7x6-rank9-reply-family-control.mjs');
const C_CLOSURE = join(HERE, 'quotient-standard7x6-rank9-c-reply-composed-closure.mjs');
const F_CLOSURE = join(HERE, 'quotient-standard7x6-d3-reply-horizon-closure.mjs');

function run(script, prefix) {
  const child = spawnSync(process.execPath, [script], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  assert.equal(child.signal, null, `${prefix} child signaled ${child.signal}`);
  assert.equal(child.status, 0, `${prefix} child failed: ${(child.stderr || child.stdout).slice(-12000)}`);
  const line = child.stdout.split(/\r?\n/).find((x) => x.startsWith(prefix));
  assert(line, `${prefix} output missing`);
  return JSON.parse(line.slice(prefix.length));
}
function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}

const easy = run(EASY, 'RANK9_REPLY_FAMILY_CONTROL=');
assert.equal(easy.parent, PARENT);
assert.equal(easy.provedEasyReplyCount, 5);
assert.equal(easy.remainingUnclosedReply, 'C');
assert.equal(easy.knownFReply?.sequence, PARENT + '6');
const easyMap = new Map(easy.easyReplies.map((row) => [row.reply, row]));
for (const reply of ['A', 'B', 'D', 'E', 'G']) {
  assert.equal(easyMap.get(reply)?.proved, true, `easy reply ${reply} drift`);
  assert.equal(easyMap.get(reply)?.witness, 'F4', `easy reply ${reply} witness drift`);
}

const cProof = run(C_CLOSURE, 'RANK9_C_REPLY_COMPOSED_CLOSURE=');
assert.equal(cProof.parent, PARENT);
assert.equal(cProof.reply, 'C');
assert.equal(cProof.proved, true);

const fProof = run(F_CLOSURE, 'D3_REPLY_HORIZON_CLOSURE=');
assert.equal(fProof.predecessor, PARENT + '6');
assert.equal(fProof.proved, true);
assert.equal(fProof.witness, 'D3');

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const root = replay(kernel, PARENT);
const branches = [];
for (let reply = 0; reply < 7; reply += 1) {
  const child = kernel.advance(root, reply);
  assert(Number.isSafeInteger(child) && child >= 0 && child !== domain.QN_TERMINAL_WIN, `rank9 P1 reply ${reply + 1} invalid/terminal`);
  const sequence = PARENT + String(reply + 1);
  assert.equal(child, replay(kernel, sequence), `rank9 child ${sequence} identity drift`);
  const letter = String.fromCharCode(65 + reply);
  if (letter === 'C') {
    branches.push({ reply: letter, sequence, route: 'composed_C_reply_theorem', witnessChain: cProof.witnessChain });
  } else if (letter === 'F') {
    branches.push({ reply: letter, sequence, route: 'qualified_F_child_D3_theorem', witness: fProof.witness });
  } else {
    const row = easyMap.get(letter);
    assert(row, `missing easy theorem for ${letter}`);
    branches.push({ reply: letter, sequence, route: 'F4_dual_threat_capacity_theorem', witness: row.witness, threats: row.threats });
  }
}
assert.equal(branches.length, 7);
assert.deepEqual(branches.map((x) => x.reply), ['A', 'B', 'C', 'D', 'E', 'F', 'G']);

const result = {
  kind: 'standard7x6-rank9-full-reply-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: PARENT,
  sideToMove: 'P1',
  branches,
  coveredP1Replies: branches.map((x) => x.reply),
  proved: true,
  promotedConsequence: `${PARENT} is structurally P0-winning: every legal P1 reply is closed by an exact independently executable certificate`,
  theoremBoundary: 'Exact only for P1-turn state 466565554. A/B/D/E/G consume exhaustive F4->{C1,F5} double-threat response-capacity certificates; C consumes the exact D3/D4/C2/C3/G1 composed theorem; F consumes the exact 4665655546 D3 reply-horizon theorem. No solved/external WDL premise, phase-only forced inference, symmetry, q equality, implicit frame rule, or cap widening is used.',
  authority: 'Exact C4-0010 transitions plus independently executable structural theorem controls on all seven legal P1 replies.',
};
console.log(`RANK9_FULL_REPLY_CLOSURE=${JSON.stringify(result)}`);

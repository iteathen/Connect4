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
const PREDECESSOR = '4665655546';
const D = 3;
const D4 = 3 * 7 + D;
const LATENT_SEQUENCE = '466565554644';
const LATENT_CONTROL = fileURLToPath(new URL('./quotient-standard7x6-latent-c1-full-closure.mjs', import.meta.url));

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}

function qualifyLatentChild() {
  const child = spawnSync(process.execPath, [LATENT_CONTROL], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  assert.equal(child.status, 0, `latent child control failed: ${(child.stderr ?? '').slice(-8000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('LATENT_C1_FULL_CLOSURE='));
  assert(line, 'latent child certificate output missing');
  const result = JSON.parse(line.slice('LATENT_C1_FULL_CLOSURE='.length));
  assert.equal(result.rootSequence, LATENT_SEQUENCE, 'latent child certificate root drift');
  assert.equal(result.proved, true, 'latent child no longer proved');
  assert.equal(result.witness, 'C1', 'latent child witness drift');
  return {
    kind: result.kind,
    rootSequence: result.rootSequence,
    witness: result.witness,
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
assert.equal(e.rank(root), 10);
const afterD3 = kernel.advance(root, D);
assert(Number.isSafeInteger(afterD3) && afterD3 >= 0 && afterD3 !== domain.QN_TERMINAL_WIN, 'P0:D3 must be legal nonterminal');
assert.equal(e.rank(afterD3), 11);

const branches = [];
let latentCertificate = null;
let allClosed = true;
for (const reply of e.legal(afterD3)) {
  const replyCell = e.landing(afterD3, reply);
  const child = kernel.advance(afterD3, reply);
  if (child === domain.QN_TERMINAL_WIN) {
    allClosed = false;
    branches.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'P1_terminal' });
    continue;
  }
  assert(Number.isSafeInteger(child) && child >= 0);
  assert.equal(e.rank(child), 12);

  if (replyCell === D4) {
    assert.equal(reply, D, 'D4 block must be D-column reply');
    const expected = replay(kernel, LATENT_SEQUENCE);
    assert.equal(child, expected, 'D4 child does not match latent theorem root');
    latentCertificate ??= qualifyLatentChild();
    branches.push({
      reply: 'D', replyCell: 'D4', sequence: LATENT_SEQUENCE,
      route: 'exact_latent_child_certificate', certificate: latentCertificate,
    });
    continue;
  }

  const terminals = e.terminalActions(child, 0);
  const d4 = terminals.find((x) => x.cell === D4) ?? null;
  if (!d4) {
    allClosed = false;
    branches.push({
      reply: e.col(reply), replyCell: e.coord(replyCell),
      sequence: PREDECESSOR + '4' + String(reply + 1),
      route: 'nonblock_without_P0_D4_terminal',
      observedP0Terminals: terminals.map((x) => e.coord(x.cell)),
    });
    continue;
  }
  const terminal = kernel.advance(child, D);
  assert.equal(terminal, domain.QN_TERMINAL_WIN, `${e.col(reply)} nonblock D4 certificate drift`);
  branches.push({
    reply: e.col(reply), replyCell: e.coord(replyCell),
    sequence: PREDECESSOR + '4' + String(reply + 1),
    route: 'nonblock_exposes_immediate_P0_D4_terminal',
    P0Terminal: 'D4',
  });
}

assert.equal(branches.length, 7, 'D3 horizon must contain seven legal P1 replies');
assert.equal(branches.filter((x) => x.route === 'exact_latent_child_certificate').length, 1, 'expected exactly one D4 latent branch');
assert.equal(branches.filter((x) => x.route === 'nonblock_exposes_immediate_P0_D4_terminal').length, 6, 'expected six tactical nonblock closures');

const result = {
  kind: 'standard7x6-d3-reply-horizon-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  predecessor: PREDECESSOR,
  sideToMove: 'P0',
  witness: 'D3',
  afterP0Sequence: PREDECESSOR + '4',
  branches,
  proved: allClosed,
  promotedConsequence: allClosed ? `${PREDECESSOR} has a qualified structural P0-winning predecessor certificate via P0:D3` : null,
  theoremBoundary: 'Exact only for 4665655546 via P0:D3. Six P1 non-D4 replies are closed by the exact immediate P0:D4 terminal certificate; the sole D4 block reaches exact state 466565554644 and consumes its independently executable latent-C1 winning certificate. Unique zero phase is not used as a forced-reply premise. This does not prove any earlier predecessor, the center opening, or the empty-board root.',
  authority: 'Exact C4-0010 transitions/terminal certificates plus the independently qualified executable latent-C1 theorem under the hardened research calculus. No solved W/D/L labels, phase-forced inference, symmetry premise, or unrestricted recursion.',
};
console.log(`D3_REPLY_HORIZON_CLOSURE=${JSON.stringify(result)}`);
assert.equal(result.proved, true, 'D3 reply horizon did not close');

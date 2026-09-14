#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PARENT = '466565554';
const C = 2;
const D = 3;
const G = 6;
const C3 = 2 * 7 + 2;
const G3 = 2 * 7 + 6;
const D4 = 3 * 7 + 3;
const HERE = dirname(fileURLToPath(import.meta.url));
const PROBE = join(HERE, 'quotient-standard7x6-rank9-c-reply-kappa-child-probe.mjs');

function makeKernel() {
  const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
    cacheEdges: true,
    prefixClasses: 4096,
    responseClosure: true,
    searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
  });
  kernel.prepareSearchStorage();
  return kernel;
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
function parseProbe(stdout) {
  const line = stdout.split(/\r?\n/).find((x) => x.startsWith('RANK9_C_REPLY_KAPPA_CHILD_PROBE='));
  assert(line, `child probe summary missing: ${stdout.slice(-1000)}`);
  return JSON.parse(line.slice(line.indexOf('=') + 1));
}
function runChild(reply, action = null) {
  const env = { ...process.env, REPLY: reply };
  if (action !== null) env.ACTION = action;
  else delete env.ACTION;
  const run = spawnSync(process.execPath, [PROBE], {
    encoding: 'utf8',
    env,
    maxBuffer: 16 * 1024 * 1024,
  });
  assert.equal(run.signal, null, `child probe ${reply}/${action ?? '-'} signaled ${run.signal}`);
  assert.equal(run.status, 0, `child probe ${reply}/${action ?? '-'} failed: ${run.stderr || run.stdout}`);
  return parseProbe(run.stdout);
}

const kernel = makeKernel();
const lex = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: 100000 });
const e = lex.repair;

// Exact P1:C child from the rank9 parent.
const cChild = replay(kernel, PARENT + '3');
assert.equal(e.rank(cChild), 10);
assert.equal(e.coord(e.landing(cChild, D)), 'D3');
const afterD3 = kernel.advance(cChild, D);
assert(Number.isSafeInteger(afterD3) && afterD3 >= 0 && afterD3 !== domain.QN_TERMINAL_WIN);
assert.equal(e.terminalActions(afterD3, 1).length, 0, 'P1 terminal override after D3');
assert(new Set(e.enabledSingletons(afterD3, 0)).has(D4), 'D3 threat missing');
let d4Block = null;
const d3Routes = [];
for (const reply of e.legal(afterD3)) {
  const cell = e.landing(afterD3, reply);
  const child = kernel.advance(afterD3, reply);
  assert(Number.isSafeInteger(child) && child >= 0 && child !== domain.QN_TERMINAL_WIN);
  if (cell === D4) {
    d4Block = child;
    d3Routes.push({ reply: e.col(reply), cell: e.coord(cell), route: 'forced_D4_block' });
  } else {
    assert(e.terminalActions(child, 0).some((x) => x.cell === D4), `D3 nonblock ${e.coord(cell)} lacks D4 terminal`);
    d3Routes.push({ reply: e.col(reply), cell: e.coord(cell), route: 'P0_D4_terminal' });
  }
}
assert(d4Block !== null);
assert.equal(d4Block, replay(kernel, PARENT + '344'));
assert.equal(e.singleton(d4Block, 0, C3), true);
assert.equal(e.targetDistance(d4Block, C3), 1);
assert.equal(e.singleton(d4Block, 0, G3), true);
assert.equal(e.targetDistance(d4Block, G3), 2);

// Exact P0:C2 continuation: only C3 block survives.
assert.equal(e.coord(e.landing(d4Block, C)), 'C2');
const afterC2 = kernel.advance(d4Block, C);
assert(Number.isSafeInteger(afterC2) && afterC2 >= 0 && afterC2 !== domain.QN_TERMINAL_WIN);
assert.equal(e.terminalActions(afterC2, 1).length, 0, 'P1 terminal override after C2');
assert(new Set(e.enabledSingletons(afterC2, 0)).has(C3), 'C3 threat missing');
let c3Block = null;
const c2Routes = [];
for (const reply of e.legal(afterC2)) {
  const cell = e.landing(afterC2, reply);
  const child = kernel.advance(afterC2, reply);
  assert(Number.isSafeInteger(child) && child >= 0 && child !== domain.QN_TERMINAL_WIN);
  if (cell === C3) {
    c3Block = child;
    c2Routes.push({ reply: e.col(reply), cell: e.coord(cell), route: 'forced_C3_block' });
  } else {
    assert(e.terminalActions(child, 0).some((x) => x.cell === C3), `C2 nonblock ${e.coord(cell)} lacks C3 terminal`);
    c2Routes.push({ reply: e.col(reply), cell: e.coord(cell), route: 'P0_C3_terminal' });
  }
}
assert(c3Block !== null);
assert.equal(c3Block, replay(kernel, PARENT + '34433'));
assert.equal(e.singleton(c3Block, 0, G3), true);
assert.equal(e.targetDistance(c3Block, G3), 2);
assert.equal(e.coord(e.landing(c3Block, G)), 'G1');

// Execution-composed kappa: every post-G1 P1 reply is proved in its own fresh kernel.
// D5 requires top-level action C isolation; the other replies use the unrestricted hardened rho engine.
const childRoutes = {};
for (const reply of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
  const proof = runChild(reply, reply === 'D' ? 'C' : null);
  assert.equal(proof.reply, reply);
  assert.equal(proof.blockSequence, PARENT + '34433');
  assert.equal(proof.supportWitness, 'G1');
  assert.equal(proof.proved, true, `post-G1 reply ${reply} did not prove: ${JSON.stringify(proof)}`);
  childRoutes[reply] = {
    proofKind: proof.proofKind,
    replyCell: proof.replyCell,
    rootAction: proof.rootAction,
    witness: proof.witness ?? null,
    witnessKind: proof.witnessKind ?? null,
    forcedDefense: proof.forcedDefense ?? null,
    measure: proof.measure ?? null,
  };
}

const summary = {
  kind: 'standard7x6-rank9-c-reply-composed-closure-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  parent: PARENT,
  reply: 'C',
  witnessChain: ['D3', 'forced P1:D4', 'C2', 'forced P1:C3', 'G1'],
  forcedD4BlockSequence: PARENT + '344',
  forcedC3BlockSequence: PARENT + '34433',
  d3Routes,
  c2Routes,
  postG1Routes: childRoutes,
  proved: true,
  interpretation: 'The sole hard rank9 P1:C child closes exactly. D3 forces D4; C2 forces C3; G1 then enters a distance-two support re-entry whose seven P1 replies close by fresh-kernel immediate-terminal or obligation-first rho certificates. D5 uses top-level C as an exact resolved-tail descent witness. Sharding is execution isolation only; no proof or quotient limit is widened.',
  theoremBoundary: 'This theorem classifies only the exact P1:C child from 466565554. It uses tactical singleton/terminal forcing plus independently re-executed hardened rho certificates. It assumes no solved W/D/L labels, column/player symmetry, q equality, implicit frame rule, or resource-failure outcome.',
};
console.log(`RANK9_C_REPLY_COMPOSED_CLOSURE=${JSON.stringify(summary)}`);

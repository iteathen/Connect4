#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import { createResolvedTailLexicographicProofEngine } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6;
const C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const BRANCH_COMPOSER = fileURLToPath(new URL('./quotient-standard7x6-rho-action-branch-composition.mjs', import.meta.url));
const REFUSAL_COLUMNS = Object.freeze({ A: 0, B: 1, D: 3, E: 4, F: 5 });
const OFFSYSTEM = new Set(Object.values(REFUSAL_COLUMNS));
const DIRECT_SIDE_THREAT = new Set(['D', 'E', 'F']);
const refusalName = process.argv[2];
if (!(refusalName in REFUSAL_COLUMNS)) throw new Error('usage: expired-response-refusal-closure <A|B|D|E|F>');
const refusalCol = REFUSAL_COLUMNS[refusalName];

function replay(kernel, sequence) {
  let id = kernel.rootId;
  for (const digit of sequence) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${sequence}`);
    id = next;
  }
  return id;
}
function col(c) { return String.fromCharCode(65 + c); }
function coord(cell) { return `${col(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function runBranchComposition(sequence) {
  const child = spawnSync(process.execPath, [BRANCH_COMPOSER, sequence, 'C3', 'G'], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) return { proved: false, kind: 'branch_composer_process_error', error: (child.stderr ?? '').slice(-8000) };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('RHO_ACTION_BRANCH_COMPOSITION='));
  if (!line) return { proved: false, kind: 'branch_composer_output_missing', error: (child.stdout ?? '').slice(-8000) };
  return JSON.parse(line.slice('RHO_ACTION_BRANCH_COMPOSITION='.length));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });

const activatedSequence = ROOT + '3'; // P0:C1 activates P1:G1 response deadline on the next P1 turn.
const activated = replay(kernel, activatedSequence);
assert.equal(e.rank(activated), 13);
assert.equal(e.landing(activated, G), G, 'G1 not directly playable at response activation');
const refusalCell = e.landing(activated, refusalCol);
assert.notEqual(refusalCell, 0xff, `${refusalName}: refusal event illegal`);
const refusal = kernel.advance(activated, refusalCol);
assert.notEqual(refusal, domain.QN_TERMINAL_WIN, `${refusalName}: refusal event is P1 terminal`);
assert(Number.isSafeInteger(refusal) && refusal >= 0);
assert.equal(e.rank(refusal), 14);
const refusalSequence = activatedSequence + String(refusalCol + 1);
assert.equal(e.singleton(refusal, 0, C3), true);
assert.equal(e.singleton(refusal, 0, G3), true);
assert.equal(e.targetDistance(refusal, C3), 1);
assert.equal(e.targetDistance(refusal, G3), 2);
assert.equal(e.terminalActions(refusal, 0).length, 0, `${refusalName}: immediate P0 terminal changes refusal class`);

// D/E/F were previously routed through a universal P0:G1 witness. The logical-map audit
// falsified that witness: exact P1 continuations reach two-obligation response-capacity losses.
// These three refusal roots instead have an exact side-threat witness P0:A1. That move creates
// the single playable P0:B1 threat; every nonblock exposes an immediate P0:B1 terminal, while
// the exact B1 block enters a qualified obligation-first rho(C3) child.
if (DIRECT_SIDE_THREAT.has(refusalName)) {
  const witnessCol = 0;
  const witnessCell = e.landing(refusal, witnessCol);
  assert.equal(coord(witnessCell), 'A1', `${refusalName}: expected A1 witness`);
  const afterWitness = kernel.advance(refusal, witnessCol);
  assert(afterWitness >= 0 && afterWitness !== domain.QN_TERMINAL_WIN);
  const threats = e.enabledSingletons(afterWitness, 0);
  assert.equal(threats.length, 1, `${refusalName}: A1 witness no longer creates one exact P0 threat`);
  assert.equal(coord(threats[0]), 'B1', `${refusalName}: A1 witness threat changed`);

  const branches = [];
  let blockState = null;
  let allNonblocksClose = true;
  for (const reply of e.legal(afterWitness)) {
    const replyCell = e.landing(afterWitness, reply);
    const child = kernel.advance(afterWitness, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      allNonblocksClose = false;
      branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal_override' });
      continue;
    }
    assert(child >= 0);
    if (replyCell === threats[0]) {
      blockState = child;
      branches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'forced_B1_block' });
      continue;
    }
    const terminal = e.terminalActions(child, 0).find((x) => x.cell === threats[0]);
    if (!terminal) allNonblocksClose = false;
    branches.push({
      reply: col(reply), replyCell: coord(replyCell),
      route: terminal ? 'nonblock_exposes_P0_B1_terminal' : 'nonblock_unclosed',
      terminalCells: e.terminalActions(child, 0).map((x) => coord(x.cell)),
    });
  }
  assert(blockState !== null, `${refusalName}: exact B1 block missing`);
  assert.equal(e.singleton(blockState, 0, C3), true);
  assert.equal(e.targetDistance(blockState, C3), 1);
  const rho = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates: 100000 });
  const childProof = rho.prove(blockState, C3);
  const proved = allNonblocksClose && childProof.proved;
  const result = {
    kind: 'standard7x6-expired-response-offsystem-refusal-closure-v2',
    attribution: {
      researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
      formalizationImplementationQualification: 'OpenAI ChatGPT',
    },
    refusalColumn: refusalName,
    refusalCell: coord(refusalCell),
    refusalSequence,
    expiredObligation: 'P0:C1 -> P1:G1 by next_P1_turn',
    obligationDisposition: 'expired_unsatisfied; never reset',
    P0Witness: 'A1',
    witnessRoute: 'A1 creates exact B1 threat; B1 block enters obligation-first rho(C3)',
    branches,
    forcedBlockChild: {
      target: 'C3',
      proof: {
        proved: childProof.proved,
        kind: childProof.kind,
        witness: childProof.witness ?? null,
        witnessKind: childProof.witnessKind ?? null,
        measure: childProof.measure ?? null,
        exactLoss: childProof.exactLoss === true,
        obligations: childProof.obligations ?? null,
        forcedDefense: childProof.forcedDefense ?? null,
      },
    },
    proved,
    promotedConsequence: proved ? `${refusalSequence} in W via P0:A1` : null,
    theoremBoundary: proved
      ? `Exact only for ${refusalName}-column refusal after P0:C1 at 466565554644. It uses the independently checked A1/B1 side-threat circuit and an obligation-first rho(C3) child. It does not reuse the falsified universal G1 witness or assume column symmetry.`
      : `Exact only for ${refusalName}-column refusal after P0:C1. Unclosed alternatives remain unknown; proof failure is not interpreted as loss.`,
    authority: 'Exact C4-0010 transitions/terminal certificates plus the qualified obligation-first rho research calculus under unchanged bounds. No solved W/D/L labels, external oracle premise, deadline reset, or unrestricted q-frontier recursion.',
  };
  console.log(`EXPIRED_RESPONSE_REFUSAL_CLOSURE=${JSON.stringify(result)}`);
  assert.equal(proved, true, `${refusalName}: side-threat refusal closure theorem failed`);
  process.exit(0);
}

// A/B retain the deeper G1 seizure proof. They do not have the D/E/F one-ply side-threat witness.
assert.equal(e.landing(refusal, G), G, `${refusalName}: G1 ceased to be directly playable`);
const afterG1 = kernel.advance(refusal, G);
assert.notEqual(afterG1, domain.QN_TERMINAL_WIN);
assert(afterG1 >= 0 && e.rank(afterG1) === 15);
assert.equal(e.singleton(afterG1, 0, C3), true);
assert.equal(e.singleton(afterG1, 0, G3), true);
assert.equal(e.targetDistance(afterG1, C3), 1);
assert.equal(e.targetDistance(afterG1, G3), 1);

const topBranches = [];
let allClosed = true;
for (const reply of e.legal(afterG1)) {
  const replyCell = e.landing(afterG1, reply);
  const child = kernel.advance(afterG1, reply);
  if (child === domain.QN_TERMINAL_WIN) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P1_terminal_after_G1' });
    continue;
  }
  assert(child >= 0 && e.rank(child) === 16);
  const childSequence = refusalSequence + '7' + String(reply + 1);
  const immediate = e.terminalActions(child, 0);
  if (immediate.length) {
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'immediate_P0_terminal', terminalCells: immediate.map((x) => coord(x.cell)) });
    continue;
  }
  if (!OFFSYSTEM.has(reply)) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'nonterminal_non_offsystem_unclassified' });
    continue;
  }
  assert.equal(e.singleton(child, 0, C3), true, `${refusalName}/${col(reply)}: C3 died before dual-target handoff`);
  assert.equal(e.singleton(child, 0, G3), true, `${refusalName}/${col(reply)}: G3 died before dual-target handoff`);
  assert.equal(e.targetDistance(child, C3), 1);
  assert.equal(e.targetDistance(child, G3), 1);

  const g2Cell = e.landing(child, G);
  assert.equal(coord(g2Cell), 'G2', `${refusalName}/${col(reply)}: G2 not directly playable`);
  const afterG2 = kernel.advance(child, G);
  if (afterG2 === domain.QN_TERMINAL_WIN) {
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'P0_terminal_on_G2' });
    continue;
  }
  assert(afterG2 >= 0 && e.rank(afterG2) === 17);
  assert.equal(coord(e.landing(afterG2, G)), 'G3');

  const forceReplies = [];
  let forcedBlockClosed = true;
  let blockedLeafSequence = null;
  for (const response of e.legal(afterG2)) {
    const responseCell = e.landing(afterG2, response);
    const afterP1 = kernel.advance(afterG2, response);
    if (afterP1 === domain.QN_TERMINAL_WIN) {
      forcedBlockClosed = false;
      forceReplies.push({ response: col(response), responseCell: coord(responseCell), route: 'P1_terminal_override' });
      continue;
    }
    assert(afterP1 >= 0 && e.rank(afterP1) === 18);
    if (responseCell !== G3) {
      const terminal = e.terminalActions(afterP1, 0).find((x) => x.cell === G3);
      if (!terminal) {
        forcedBlockClosed = false;
        forceReplies.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_without_G3_terminal' });
      } else {
        forceReplies.push({ response: col(response), responseCell: coord(responseCell), route: 'nonblock_exposes_P0_G3_terminal' });
      }
      continue;
    }
    assert.equal(e.singleton(afterP1, 0, G3), false);
    assert.equal(e.singleton(afterP1, 0, C3), true);
    assert.equal(e.targetDistance(afterP1, C3), 1);
    blockedLeafSequence = childSequence + '77';
    forceReplies.push({ response: 'G', responseCell: 'G3', route: 'forced_G3_block_to_C3_rho_leaf', leafSequence: blockedLeafSequence });
  }

  if (!forcedBlockClosed || blockedLeafSequence === null) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'G3_forced_block_macro_unclosed', forceReplies });
    continue;
  }
  const leafProof = runBranchComposition(blockedLeafSequence);
  if (!leafProof.proved) {
    allClosed = false;
    topBranches.push({ reply: col(reply), replyCell: coord(replyCell), route: 'branch_composed_rho_leaf_unproved', forceReplies, blockedLeafSequence, leafProof });
    continue;
  }
  topBranches.push({
    reply: col(reply), replyCell: coord(replyCell), route: 'G2_forced_G3_block_to_branch_composed_rho',
    forceReplies, blockedLeafSequence,
    leafCertificate: {
      selectedAction: leafProof.selectedAction,
      beforeMeasure: leafProof.beforeMeasure,
      afterP0Measure: leafProof.afterP0Measure,
      branchCount: leafProof.branchCount,
      certificate: leafProof.certificate,
    },
  });
}

const result = {
  kind: 'standard7x6-expired-response-offsystem-refusal-closure-v2',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  refusalColumn: refusalName,
  refusalCell: coord(refusalCell),
  refusalSequence,
  expiredObligation: 'P0:C1 -> P1:G1 by next_P1_turn',
  obligationDisposition: 'expired_unsatisfied; never reset',
  P0Witness: 'G1',
  witnessRoute: 'G1 seizure; G2 forced G3 block; branch-composed obligation-first rho(C3)',
  branchCount: topBranches.length,
  branches: topBranches,
  proved: allClosed,
  promotedConsequence: allClosed ? `${refusalSequence} in W via P0:G1` : null,
  theoremBoundary: allClosed
    ? `Exact only for ${refusalName}-column refusal after P0:C1 at 466565554644. It proves that exact refusal state is a P0-winning predecessor through its independently qualified deeper G1 route. It does not imply the same witness for D/E/F or assume column-renaming symmetry.`
    : `Exact only for ${refusalName}-column refusal after P0:C1. Unclosed alternatives remain unknown; proof failure is not interpreted as loss.`,
  authority: 'Exact C4-0010 transitions/terminal certificates plus independently qualified obligation-first rho=(delta,mu) branch-composition certificates under unchanged bounds. No solved W/D/L labels, external oracle premise, or unrestricted q-frontier recursion.',
};
console.log(`EXPIRED_RESPONSE_REFUSAL_CLOSURE=${JSON.stringify(result)}`);
assert.equal(allClosed, true, `${refusalName}: offsystem refusal closure theorem failed`);

#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createGenericTargetAuxLexProofEngine } from './quotient-standard7x6-generic-target-aux-lex-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const sequence = process.env.SEQUENCE;
const targetName = process.env.TARGET;
const actionName = process.env.ACTION;
const maxTargetDistance = Number(process.env.MAX_TARGET_DISTANCE ?? '5');
assert(sequence, 'SEQUENCE is required');
assert(/^[A-G][1-6]$/.test(targetName ?? ''), 'TARGET must be A1..G6');
assert(/^[A-G]$/.test(actionName ?? ''), 'ACTION must be A..G');
const action = actionName.charCodeAt(0) - 65;
const CHILD_PROBE = fileURLToPath(new URL('./quotient-standard7x6-theta-sequence-probe.mjs', import.meta.url));

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const digit of seq) {
    const next = kernel.advance(id, Number(digit) - 1);
    assert(Number.isSafeInteger(next) && next >= 0, `bad replay ${seq}`);
    id = next;
  }
  return id;
}
function targetCell(name) {
  return (Number(name[1]) - 1) * 7 + (name.charCodeAt(0) - 65);
}
function less(a, b) {
  assert(a.distance !== null && b.distance !== null);
  return a.distance < b.distance
    || (a.distance === b.distance && (a.chi < b.chi
      || (a.chi === b.chi && a.mu < b.mu)));
}
function le(a, b) {
  assert(a.distance !== null && b.distance !== null);
  return a.distance < b.distance
    || (a.distance === b.distance && (a.chi < b.chi
      || (a.chi === b.chi && a.mu <= b.mu)));
}
function runChild(childSequence) {
  const env = { ...process.env, SEQUENCE: childSequence, TARGET: targetName, MAX_TARGET_DISTANCE: String(maxTargetDistance) };
  delete env.ACTION;
  const child = spawnSync(process.execPath, [CHILD_PROBE], {
    encoding: 'utf-8', timeout: 300000, maxBuffer: 32 * 1024 * 1024, env,
  });
  if (child.error) return { proved: false, proofKind: 'execution_error', error: { kind: 'execution_error', message: child.error.message } };
  if (child.status !== 0) return { proved: false, proofKind: 'process_failure', error: { kind: 'process_failure', message: (child.stderr ?? '').slice(-4000) } };
  const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('THETA_SEQUENCE_PROBE='));
  assert(line, 'theta child output missing');
  return JSON.parse(line.slice('THETA_SEQUENCE_PROBE='.length));
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();
const proof = createGenericTargetAuxLexProofEngine(kernel, { maxProofStates: 1, maxTargetDistance });
const e = proof.repair;
const state = replay(kernel, sequence);
const target = targetCell(targetName);
assert.equal(e.rank(state) % 2, 0, 'theta branch root must be P0 turn');

const current = proof.measure(state, target);
const immediate = e.terminalActions(state, 0);
const obligations = [...new Set(e.enabledSingletons(state, 1))].sort((a, b) => a - b);
let result;

if (immediate.length) {
  result = { proved: true, proofKind: 'immediate_P0_terminal', current, terminals: immediate.map((x) => e.coord(x.cell)), branches: [] };
} else if (current.distance === null || current.distance < 1 || current.distance > maxTargetDistance) {
  result = { proved: false, proofKind: 'outside_theta_invariant', current, branches: [] };
} else if (obligations.length >= 2) {
  result = { proved: false, proofKind: 'forced_obligation_capacity_loss', exactLoss: true, current, obligations: obligations.map(e.coord), branches: [] };
} else {
  const targetColumn = target % 7;
  const aux = new Set(proof.auxiliaryColumns(target));
  const normal = new Set([targetColumn, 0, 1, 3, 4, 5]);
  const actionCell = e.landing(state, action);
  let rootRejected = null;
  if (actionCell === 0xff) rootRejected = { reason: 'action_illegal' };
  else if (obligations.length === 1) {
    if (actionCell !== obligations[0]) rootRejected = { reason: 'forced_defense_mismatch', obligation: e.coord(obligations[0]) };
  } else if (!normal.has(action)) {
    rootRejected = { reason: 'nonforced_auxiliary_action_outside_theta_basis', auxiliary: aux.has(action) };
  }

  if (rootRejected) {
    result = { proved: false, proofKind: 'root_action_rejected', current, rootRejected, branches: [] };
  } else {
    const afterP0 = kernel.advance(state, action);
    if (afterP0 === domain.QN_TERMINAL_WIN) {
      result = { proved: true, proofKind: 'P0_terminal_root_action', current, action: actionName, actionCell: e.coord(actionCell), branches: [] };
    } else {
      assert(Number.isSafeInteger(afterP0) && afterP0 >= 0);
      const afterMeasure = proof.measure(afterP0, target);
      if (afterMeasure.distance === null || !less(afterMeasure, current)) {
        result = { proved: false, proofKind: 'root_action_no_theta_descent', current, afterMeasure, action: actionName, actionCell: e.coord(actionCell), branches: [] };
      } else {
        const branches = [];
        let proved = true;
        for (const reply of e.legal(afterP0)) {
          const replyCell = e.landing(afterP0, reply);
          const child = kernel.advance(afterP0, reply);
          const childSequence = sequence + String(action + 1) + String(reply + 1);
          if (child === domain.QN_TERMINAL_WIN) {
            assert(new Set(e.enabledSingletons(afterP0, 1)).has(replyCell), `P1 terminal ${e.coord(replyCell)} lacks enabled singleton premise`);
            proved = false;
            branches.push({ reply: e.col(reply), replyCell: e.coord(replyCell), childSequence, route: 'P1_terminal' });
            continue;
          }
          assert(Number.isSafeInteger(child) && child >= 0);
          const childImmediate = e.terminalActions(child, 0);
          if (childImmediate.length) {
            branches.push({ reply: e.col(reply), replyCell: e.coord(replyCell), childSequence, route: 'immediate_P0_terminal', terminals: childImmediate.map((x) => e.coord(x.cell)) });
            continue;
          }
          const childMeasure = proof.measure(child, target);
          if (childMeasure.distance === null || !le(childMeasure, afterMeasure) || childMeasure.distance < 1 || childMeasure.distance > maxTargetDistance) {
            proved = false;
            branches.push({ reply: e.col(reply), replyCell: e.coord(replyCell), childSequence, route: 'outside_theta_child', childMeasure, afterMeasure });
            continue;
          }
          const cert = runChild(childSequence);
          if (cert.proved !== true) proved = false;
          branches.push({
            reply: e.col(reply), replyCell: e.coord(replyCell), childSequence,
            route: cert.proved === true ? 'theta_child' : 'theta_child_unproved',
            certificate: {
              proved: cert.proved, proofKind: cert.proofKind, targetDistance: cert.targetDistance,
              measure: cert.measure, witness: cert.witness, witnessKind: cert.witnessKind,
              exactLoss: cert.exactLoss, obligations: cert.obligations, forcedDefense: cert.forcedDefense,
              error: cert.error, stats: cert.stats,
            },
          });
        }
        result = {
          proved,
          proofKind: proved ? 'branch_complete_theta_root_action' : 'branch_incomplete_theta_root_action',
          current, afterMeasure, action: actionName, actionCell: e.coord(actionCell), branches,
        };
      }
    }
  }
}

console.log(`THETA_ROOT_BRANCH_PROBE=${JSON.stringify({
  kind: 'standard7x6-theta-root-branch-probe-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  sequence, target: targetName, rootAction: actionName, maxTargetDistance,
  ...result,
  theoremBoundary: 'Exact fixed-root-action decomposition for theta=(distance,chi,mu). The root action is checked against the same normal/forced action basis and strict theta descent; every P1 child is then discharged independently in a fresh theta kernel. Execution ownership only; no limit widening or semantic identity change.',
})}`);

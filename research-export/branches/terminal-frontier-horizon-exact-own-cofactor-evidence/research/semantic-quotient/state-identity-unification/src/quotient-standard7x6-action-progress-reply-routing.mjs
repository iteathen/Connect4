#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const REPAIRS = Object.freeze([0, 1, 3, 4, 5]);

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const d of seq) {
    const next = kernel.advance(id, Number(d) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${seq}`);
    id = next;
  }
  return id;
}
function rank(kernel, id) { return kernel.supportAccess.rankAt(kernel.states.supportAt(id)); }
function landing(kernel, id, col) { return kernel.supportAccess.landingAt(kernel.states.supportAt(id), col); }
function heights(kernel, id) {
  const support = kernel.states.supportAt(id), out = [];
  for (let c = 0; c < 7; c++) {
    const cell = kernel.supportAccess.landingAt(support, c);
    out.push(cell === 0xff ? 6 : Math.floor(cell / 7));
  }
  return out;
}
function capacity(kernel, id, col) { return 6 - heights(kernel, id)[col]; }
function colName(col) { return String.fromCharCode(65 + col); }
function coord(cell) { return `${colName(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function hasCell([lo, hi], cell) { return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0); }
function cellsOf(term) { const out=[]; for(let cell=0; cell<42; cell++) if(hasCell(term,cell)) out.push(cell); return out; }
function terms(kernel,id,p){ const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id); return kernel.classes.terms(cid).map(cellsOf); }
function hasSingleton(kernel,id,cell){ return terms(kernel,id,0).some((term)=>term.length===1&&term[0]===cell); }
function targetSupportDistance(kernel,id,target){ return Math.max(0,2-heights(kernel,id)[target%7]); }

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const cases = [
  { name: 'C_resolved_P0_owned_C1', prefix: '3733', resolved: C, target: G3 },
  { name: 'C_resolved_P1_owned_C1', prefix: '7333', resolved: C, target: G3 },
  { name: 'G_resolved_P1_owned_G1', prefix: '3777', resolved: G, target: C3 },
  { name: 'G_resolved_P0_owned_G1', prefix: '7377', resolved: G, target: C3 },
];

const replyRows = [];
const chainReselectionRows = [];
for (const c of cases) {
  const rank19 = replay(kernel, ROOT + c.prefix + String(c.resolved + 1).repeat(3));
  for (const selectedCol of REPAIRS) {
    const afterRepair = kernel.advance(rank19, selectedCol);
    assert(afterRepair >= 0 && rank(kernel, afterRepair) === 20);
    const cap20 = capacity(kernel, afterRepair, selectedCol);
    const family = cap20 === 1 ? 'tail_consumption' : 'chain_consumption';
    assert([1,5].includes(cap20));

    const afterP0 = kernel.advance(afterRepair, selectedCol);
    assert(afterP0 >= 0 && afterP0 !== domain.QN_TERMINAL_WIN);
    assert.equal(rank(kernel, afterP0), 21);
    assert.equal(hasSingleton(kernel, afterP0, c.target), true);

    for (let p1Col = 0; p1Col < 7; p1Col++) {
      const p1Cell = landing(kernel, afterP0, p1Col);
      if (p1Cell === 0xff) continue;
      const afterP1 = kernel.advance(afterP0, p1Col);
      assert.notEqual(afterP1, domain.QN_TERMINAL_WIN, 'prior control established no immediate P1 terminal reply');
      assert(afterP1 >= 0 && rank(kernel, afterP1) === 22);
      const supportDistance = targetSupportDistance(kernel, afterP1, c.target);
      const targetEnabled = landing(kernel, afterP1, c.target % 7) === c.target;
      assert.equal(targetEnabled, supportDistance === 0);
      assert.equal(hasSingleton(kernel, afterP1, c.target), true);

      let route;
      let p0TargetTerminal = false;
      if (targetEnabled) {
        const targetWin = kernel.advance(afterP1, c.target % 7);
        assert.equal(targetWin, domain.QN_TERMINAL_WIN, `${c.name}:${colName(selectedCol)}:${colName(p1Col)} enabled singleton did not terminate`);
        route = 'enabled_target_singleton_immediate_P0_terminal';
        p0TargetTerminal = true;
      } else if (family === 'tail_consumption') {
        assert.equal(capacity(kernel, afterP1, selectedCol), 0);
        route = 'exhausted_tail_handoff';
      } else if (p1Col === selectedCol) {
        route = 'chain_same_column_deeper';
      } else {
        route = 'chain_off_channel_continue';
      }

      const row = {
        member: `${c.name}:${colName(selectedCol)}->P1:${colName(p1Col)}`,
        family,
        selectedColumn: colName(selectedCol),
        p1ReplyColumn: colName(p1Col),
        p1ReplyCell: coord(p1Cell),
        target: coord(c.target),
        targetSupportDistance: supportDistance,
        targetEnabled,
        p0TargetTerminal,
        selectedCapacityAfterReply: capacity(kernel, afterP1, selectedCol),
        route,
      };
      replyRows.push(row);

      if (family === 'chain_consumption' && !targetEnabled) {
        const before = capacity(kernel, afterP1, selectedCol);
        const nextP0 = kernel.advance(afterP1, selectedCol);
        const reselection = {
          member: row.member,
          selectedColumn: row.selectedColumn,
          beforeCapacity: before,
          target: row.target,
          targetSupportDistance: supportDistance,
          route,
        };
        if (nextP0 === domain.QN_TERMINAL_WIN) {
          reselection.outcome = 'P0_terminal_on_reselection';
          reselection.afterCapacity = null;
          reselection.targetSingletonStillLive = null;
        } else {
          assert(nextP0 >= 0 && rank(kernel, nextP0) === 23);
          const after = capacity(kernel, nextP0, selectedCol);
          assert.equal(after, before - 1, 'selected chain capacity did not strictly decrease on reselection');
          assert.equal(hasSingleton(kernel, nextP0, c.target), true, 'reselection killed latent target singleton');
          reselection.outcome = 'nonterminal_strict_capacity_descent';
          reselection.afterCapacity = after;
          reselection.targetSingletonStillLive = true;
        }
        chainReselectionRows.push(reselection);
      }
    }
  }
}

assert.equal(replyRows.length, 108);
const routeCounts = Object.fromEntries([...new Set(replyRows.map((r) => r.route))].sort().map((route) => [route, replyRows.filter((r) => r.route === route).length]));
assert.equal(routeCounts.enabled_target_singleton_immediate_P0_terminal, 20);
assert.equal(routeCounts.exhausted_tail_handoff, 48);
assert.equal(routeCounts.chain_same_column_deeper, 8);
assert.equal(routeCounts.chain_off_channel_continue, 32);
assert.equal(chainReselectionRows.length, 40);

const reselectionCounts = Object.fromEntries([...new Set(chainReselectionRows.map((r) => r.outcome))].sort().map((outcome) => [outcome, chainReselectionRows.filter((r) => r.outcome === outcome).length]));
const nonterminalReselections = chainReselectionRows.filter((r) => r.outcome === 'nonterminal_strict_capacity_descent');
const capacityTransitions = [...new Set(nonterminalReselections.map((r) => `${r.beforeCapacity}->${r.afterCapacity}`))].sort();

const targetTerminalCertificate = {
  theorem: 'enabled_live_P0_singleton_on_P0_turn_implies_immediate_terminal_predecessor',
  exactInstances: routeCounts.enabled_target_singleton_immediate_P0_terminal,
  premises: [
    'P0 to move',
    'live P0 singleton residual {t}',
    'target cell t enabled/legal',
    'prior P1 event nonterminal',
  ],
  consequence: 'P0 claims t and C4-0010 residual cofactor reaches empty term / QN_TERMINAL_WIN',
};

console.log(`ACTION_PROGRESS_REPLY_ROUTING=${JSON.stringify({
  kind: 'standard7x6-action-progress-reply-routing-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  exactP1ReplyTransitions: replyRows.length,
  routeCounts,
  targetTerminalCertificate,
  chainReselection: {
    exactContexts: chainReselectionRows.length,
    outcomeCounts: reselectionCounts,
    nonterminalCapacityTransitions: capacityTransitions,
    allNonterminalReselectionsPreserveTargetSingleton: nonterminalReselections.every((r) => r.targetSingletonStillLive === true),
  },
  firstUnprovedPremise: {
    id: 'guarded_reply_routing_after_nonterminal_chain_reselection_or_tail_handoff',
    statement: 'For the 88 non-target-support reply branches, compose the next P0 action contract with exact action-conditioned R/C/N guards: chain branches may reselect the same column and strictly descend or terminate; exhausted-tail branches require a new selected action or re-entry theorem. Prove that every P1 reply after that next action routes to terminal, re-entry, capacity-circuit closure, or another strict resource descent.',
  },
  replyRows,
  chainReselectionRows,
  interpretation: 'The immediate reply horizon now has an exact structural routing partition. Twenty P1 replies complete support for the live target singleton and therefore hand P0 an immediate terminal predecessor certificate. The remaining chain replies admit another same-column P0 action whose capacity either strictly decreases again or is already terminal. Tail branches are irreversibly exhausted and must hand off to another action-conditioned contract rather than a state-like progress class.',
  theoremBoundary: 'This is a bounded two-P0-event routing control only on the retained exact latent-contract domain. It is not recursive search and does not establish center-opening W membership or later-policy closure.',
  authority: 'Exact C4-0010 support/residual transitions only. No solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.',
})}`);

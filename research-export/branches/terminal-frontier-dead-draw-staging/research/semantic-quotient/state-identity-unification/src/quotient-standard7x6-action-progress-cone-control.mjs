#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import {
  ActionProgressCone,
  Canonicalize_action_progress_cone,
} from './quotient-action-progress-cone.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const REPAIRS = Object.freeze([0, 1, 3, 4, 5]); // A,B,D,E,F
const ref = (id) => ({ $ref: id });

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
function phaseBits(kernel, id) { return heights(kernel, id).map((h) => h & 1).join(''); }
function coord(cell) { return `${String.fromCharCode(65 + (cell % 7))}${Math.floor(cell / 7) + 1}`; }
function colName(col) { return String.fromCharCode(65 + col); }
function supportTail(cap) {
  if (cap === 0) return 'EXHAUSTED';
  if (cap === 1) return 'ODD_TAIL_1';
  return `${cap & 1 ? 'ODD' : 'EVEN'}_CHAIN_${cap}`;
}
function hasCell([lo, hi], cell) { return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0); }
function cellsOf(term) { const out = []; for (let cell = 0; cell < 42; cell++) if (hasCell(term, cell)) out.push(cell); return out; }
function terms(kernel, id, player) {
  const classId = player === 0 ? kernel.states.p0At(id) : kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(cellsOf);
}
function termKey(term) { return term.map(coord).join('-'); }
function contains(term, cell) { return term.includes(cell); }
function cofactorKey(term, cell) { return term.filter((x) => x !== cell).map(coord).join('-'); }
function hasSingleton(kernel, id, cell) { return terms(kernel, id, 0).some((term) => term.length === 1 && term[0] === cell); }
function localIncidence(kernel, id, cell) {
  if (cell === 0xff || cell === null) return null;
  const p0 = terms(kernel, id, 0).filter((term) => contains(term, cell));
  const p1 = terms(kernel, id, 1).filter((term) => contains(term, cell));
  return {
    cell: coord(cell),
    p0Incident: p0.map(termKey).sort(),
    p1Incident: p1.map(termKey).sort(),
    p0Cofactors: p0.map((term) => cofactorKey(term, cell)).sort(),
    p1Cofactors: p1.map((term) => cofactorKey(term, cell)).sort(),
  };
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value === null || typeof value !== 'object') return value;
  const out = {}; for (const k of Object.keys(value).sort()) out[k] = stable(value[k]); return out;
}
function key(value) { return JSON.stringify(stable(value)); }

function progressEvent({ label, actionCell, targetCell, beforeCapacity, afterCapacity, terminal }) {
  const beforeTail = supportTail(beforeCapacity), afterTail = supportTail(afterCapacity);
  return {
    id: label,
    variables: [
      { id: 'a', type: 'cell', concrete: coord(actionCell) },
      { id: 't', type: 'cell', concrete: coord(targetCell) },
    ],
    nodes: [
      { id: 'action', layer: 'E', kind: 'selected_off_target_action', attrs: { cell: ref('a') } },
      { id: 'before', layer: 'E', kind: 'selected_column_support_tail_before', attrs: { class: beforeTail } },
      { id: 'after', layer: 'E', kind: 'selected_column_support_tail_after', attrs: { class: afterTail } },
      { id: 'phase', layer: 'P', kind: 'selected_column_GF2_toggle', attrs: { action: ref('a') } },
      { id: 'targetBefore', layer: 'R', kind: 'live_p0_singleton_before', attrs: { cell: ref('t') } },
      { id: 'targetAfter', layer: 'R', kind: 'live_p0_singleton_after', attrs: { cell: ref('t') } },
      { id: 'terminal', layer: 'terminal', kind: 'selected_action_terminal_status', attrs: { value: terminal } },
      { id: 'result', layer: 'claim', kind: 'strict_selected_column_capacity_descent', attrs: { delta: afterCapacity - beforeCapacity } },
    ],
    edges: [
      { from: 'action', to: 'after', role: 'consumes_selected_support_event' },
      { from: 'before', to: 'result', role: 'rank_precondition' },
      { from: 'after', to: 'result', role: 'rank_consequence' },
      { from: 'phase', to: 'result', role: 'phase_accounting' },
      { from: 'targetBefore', to: 'targetAfter', role: 'nonincident_R_preservation' },
      { from: 'targetAfter', to: 'result', role: 'latent_target_guard' },
      { from: 'terminal', to: 'result', role: 'terminal_guard' },
    ],
  };
}

const progressClaim = {
  id: 'selected_off_target_column_capacity_descent',
  observations: [{ role: 'selected_action_progress', node: 'result' }],
};

function p1Replies(kernel, p1State, selectedCol, target) {
  const rows = [];
  const afterP0Capacity = capacity(kernel, p1State, selectedCol);
  for (let col = 0; col < 7; col++) {
    const replyCell = landing(kernel, p1State, col);
    if (replyCell === 0xff) continue;
    const incidence = localIncidence(kernel, p1State, replyCell);
    const next = kernel.advance(p1State, col);
    const category = col === selectedCol ? 'selected_column' : (replyCell === target ? 'target_claim' : 'other_channel');
    if (next === domain.QN_TERMINAL_WIN) {
      rows.push({
        replyColumn: colName(col), replyCell: coord(replyCell), category,
        status: 'P1_terminal', inputIncidence: incidence,
        selectedCapacityUpperBound: afterP0Capacity - (col === selectedCol ? 1 : 0),
      });
      continue;
    }
    assert(Number.isSafeInteger(next) && next >= 0, `invalid P1 reply ${colName(col)}`);
    const afterReplyCapacity = capacity(kernel, next, selectedCol);
    assert(afterReplyCapacity <= afterP0Capacity, 'selected-column capacity increased after P1 reply');
    const targetLive = hasSingleton(kernel, next, target);
    if (replyCell !== target) assert.equal(targetLive, true, 'non-target P1 reply unexpectedly killed remaining singleton');
    if (replyCell === target) assert.equal(targetLive, false, 'P1 target claim did not discharge singleton');
    rows.push({
      replyColumn: colName(col), replyCell: coord(replyCell), category,
      status: 'nonterminal', inputIncidence: incidence,
      rank: rank(kernel, next), phaseBits: phaseBits(kernel, next),
      selectedCapacity: afterReplyCapacity,
      selectedSupportTail: supportTail(afterReplyCapacity),
      remainingTargetSingletonLive: targetLive,
      remainingTargetSupportDistance: Math.max(0, 2 - heights(kernel, next)[target % 7]),
      nextSelectedCellIncidence: localIncidence(kernel, next, landing(kernel, next, selectedCol)),
    });
  }
  return rows;
}

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

const rows = [];
for (const c of cases) {
  const seq = ROOT + c.prefix + String(c.resolved + 1).repeat(3);
  const rank19 = replay(kernel, seq);
  assert.equal(rank(kernel, rank19), 19);
  const beforeRepairHeights = heights(kernel, rank19);
  for (const repairCol of REPAIRS) {
    const afterRepair = kernel.advance(rank19, repairCol);
    assert(afterRepair >= 0);
    assert.equal(rank(kernel, afterRepair), 20);
    assert.equal(hasSingleton(kernel, afterRepair, c.target), true);

    const beforeCapacity = capacity(kernel, afterRepair, repairCol);
    assert([1, 5].includes(beforeCapacity));
    const actionCell = landing(kernel, afterRepair, repairCol);
    assert.notEqual(actionCell, 0xff);
    const selectedActionIncidence = localIncidence(kernel, afterRepair, actionCell);
    const p1State = kernel.advance(afterRepair, repairCol);
    assert.notEqual(p1State, domain.QN_TERMINAL_WIN, `${c.name}:${colName(repairCol)} selected P0 action became terminal unexpectedly`);
    assert(p1State >= 0);
    assert.equal(rank(kernel, p1State), 21);
    assert.equal(hasSingleton(kernel, p1State, c.target), true);

    const afterCapacity = capacity(kernel, p1State, repairCol);
    assert.equal(afterCapacity, beforeCapacity - 1);
    const family = beforeCapacity === 1 ? 'tail_consumption' : 'chain_consumption';
    if (family === 'tail_consumption') assert.equal(afterCapacity, 0);
    if (family === 'chain_consumption') assert.equal(afterCapacity, 4);

    const event = progressEvent({
      label: `${c.name}:${colName(repairCol)}`,
      actionCell, targetCell: c.target, beforeCapacity, afterCapacity, terminal: 'nonterminal',
    });
    const cone = ActionProgressCone(
      progressClaim,
      { opaqueNonincident: { case: c.name, selectedActionIncidence } },
      event,
      'action',
    );
    const canonical = Canonicalize_action_progress_cone(cone);
    const replies = p1Replies(kernel, p1State, repairCol, c.target);

    rows.push({
      member: `${c.name}:${colName(repairCol)}`,
      family,
      target: coord(c.target),
      selectedColumn: colName(repairCol),
      selectedActionCell: coord(actionCell),
      beforeCapacity, afterP0Capacity: afterCapacity,
      beforeSupportTail: supportTail(beforeCapacity), afterP0SupportTail: supportTail(afterCapacity),
      phaseBefore: phaseBits(kernel, afterRepair), phaseAfterP0: phaseBits(kernel, p1State),
      targetSingletonPreservedByP0: true,
      selectedActionIncidence,
      canonicalProgressKey: canonical.canonicalKey,
      replies,
    });
  }
}
assert.equal(rows.length, 20);

const canonicalByFamily = {};
for (const family of ['chain_consumption', 'tail_consumption']) {
  const familyRows = rows.filter((row) => row.family === family);
  canonicalByFamily[family] = new Set(familyRows.map((row) => row.canonicalProgressKey)).size;
}
assert.equal(canonicalByFamily.chain_consumption, 1, 'A/B support-progress theorem failed to canonicalize');
assert.equal(canonicalByFamily.tail_consumption, 1, 'D/E/F tail-progress theorem failed to canonicalize');
assert.equal(new Set(rows.map((row) => row.canonicalProgressKey)).size, 2, 'expected exactly chain and tail progress theorem classes');

const replySummary = {};
for (const family of ['chain_consumption', 'tail_consumption']) {
  const familyRows = rows.filter((row) => row.family === family);
  const replies = familyRows.flatMap((row) => row.replies.map((reply) => ({ member: row.member, ...reply })));
  replySummary[family] = {
    selectedActions: familyRows.length,
    replyTransitions: replies.length,
    p1TerminalReplies: replies.filter((r) => r.status === 'P1_terminal').length,
    targetClaimReplies: replies.filter((r) => r.category === 'target_claim').length,
    sameSelectedColumnReplies: replies.filter((r) => r.category === 'selected_column').length,
    otherChannelReplies: replies.filter((r) => r.category === 'other_channel').length,
    allNonterminalRepliesKeepSelectedCapacityNonincreasing: replies.filter((r) => r.status === 'nonterminal').every((r) => Number.isInteger(r.selectedCapacity)),
    allNonTargetNonterminalRepliesPreserveSingleton: replies.filter((r) => r.status === 'nonterminal' && r.category !== 'target_claim').every((r) => r.remainingTargetSingletonLive === true),
  };
}

const actionConditionedRClasses = {};
for (const family of ['chain_consumption', 'tail_consumption']) {
  actionConditionedRClasses[family] = new Set(rows.filter((row) => row.family === family).map((row) => key(row.selectedActionIncidence))).size;
}

const anyImmediateP1Terminal = Object.values(replySummary).some((summary) => summary.p1TerminalReplies > 0);
const nextMissingPremise = anyImmediateP1Terminal
  ? {
      id: 'classify_immediate_P1_terminal_alternatives_under_selected_column_progress',
      statement: 'At least one exact immediate P1 reply is terminal after a selected-column progress action; classify that terminal branch before the resource rank can participate in a winning-policy induction.',
    }
  : {
      id: 'prove_repeated_selected_column_progress_guard_invariance',
      statement: 'The selected-column support rank strictly descends for this exact one-round domain, but using it inductively requires a theorem that terminal/C/N/incident-R guards remain sufficient after arbitrary nonterminal P1 off-channel replies until re-entry, target discharge, or selected-column exhaustion.',
    };

console.log(`ACTION_PROGRESS_CONE_CONTROL=${JSON.stringify({
  kind: 'standard7x6-action-conditioned-progress-cone-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  physicalRank20States: rows.length,
  supportProgressTheoremClasses: 2,
  canonicalByFamily,
  exactSupportRank: {
    measure: 'selected_column_remaining_capacity',
    p0SelectedActionDelta: -1,
    p1ReplyMonotonicity: 'never increases selected-column remaining capacity',
    boundary: 'support-level well-founded component only; not sufficient for W membership without guarded policy induction',
  },
  replySummary,
  actionConditionedRClasses,
  rows,
  nextMissingPremise,
  interpretation: 'Action conditioning recovers theorem reuse without reconstructing state identity: all 8 A/B selected-column actions share one strict support-progress theorem and all 12 D/E/F actions share one tail-consumption theorem. Exact selected-action R incidence remains opaque to the support claim but is retained per action for stronger continuation claims. Immediate P1 replies are enumerated solely to expose terminal/target/guard failures of the rank.',
  theoremBoundary: 'This establishes one selected P0 action and its immediate P1 reply horizon over the retained 20-state domain. It does not prove repeated-policy invariance, center-opening W, q equality, later-strategy equivalence, provenance equivalence, or a 69-to-28 line reduction.',
  authority: 'Exact C4-0010 support/residual transitions plus claim-relative dependency slicing. No solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.',
})}`);

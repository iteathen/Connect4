#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 16, G3 = 20;

const G3_RESIDUAL = Object.freeze([
  '466565554644323332','466565554644353336','466565554644363335','466565554644343335',
  '466565554644353334','466565554644353333','466565554644343333','466565554644323336',
  '466565554644363332','466565554644323335','466565554644353332','466565554644323334',
  '466565554644343332','466565554644323333','466565554644313334','466565554644343331',
  '466565554644313333',
]);
const C3_RESIDUAL = Object.freeze([
  '466565554644757774','466565554644757776','466565554644757777',
  '466565554644747775','466565554644767775',
]);
const RESIDUAL = new Set([...G3_RESIDUAL, ...C3_RESIDUAL]);
assert.equal(RESIDUAL.size, 22, 'residual inventory duplicate/drift');

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
function replay(k, sequence) {
  let id = k.rootId;
  for (const d of sequence) {
    id = k.advance(id, Number(d) - 1);
    assert(Number.isSafeInteger(id) && id >= 0, `bad replay ${sequence}`);
  }
  return id;
}
function targetName(target) { return target === C3 ? 'C3' : 'G3'; }
function resolvedColumn(target) { return target === G3 ? C : G; }
function countBy(rows, keyFn) {
  const out = {};
  for (const row of rows) { const k = keyFn(row); out[k] = (out[k] ?? 0) + 1; }
  return out;
}
function bump(obj, key, n = 1) { obj[key] = (obj[key] ?? 0) + n; }

const k = makeKernel();
const e = createRepairCapacityProofEngine(k, { maxProofStates: 1 });

const roots = [];
for (const fam of [
  { family: 'C_first', resolved: C, target: G3, replies1: [0,1,3,4,5,6] },
  { family: 'G_first', resolved: G, target: C3, replies1: [0,1,2,3,4,5] },
]) {
  for (const r1 of fam.replies1) {
    const s16seq = ROOT + `${fam.resolved + 1}${r1 + 1}${fam.resolved + 1}${fam.resolved + 1}`;
    const s16 = replay(k, s16seq);
    assert.equal(e.rank(s16), 16);
    const threat = e.landing(s16, fam.resolved);
    assert(new Set(e.enabledSingletons(s16, 1)).has(threat), `${s16seq}: missing forced resolved-column deadline`);
    const s17 = k.advance(s16, fam.resolved);
    assert(s17 >= 0 && e.rank(s17) === 17);
    for (const r2 of e.legal(s17)) {
      const replyCell = e.landing(s17, r2);
      const s18 = k.advance(s17, r2);
      if (s18 === domain.QN_TERMINAL_WIN) {
        assert(new Set(e.enabledSingletons(s17, 1)).has(replyCell));
        continue;
      }
      assert(s18 >= 0 && e.rank(s18) === 18);
      roots.push({
        family: fam.family,
        r1,
        r2,
        target: fam.target,
        sequence: s16seq + String(fam.resolved + 1) + String(r2 + 1),
        state: s18,
      });
    }
  }
}
assert.equal(roots.length, 84, 'rank18 domain drift');
const generated = new Set(roots.map((x) => x.sequence));
for (const seq of RESIDUAL) assert(generated.has(seq), `residual root missing from exact domain: ${seq}`);
assert.equal(roots.filter((x) => RESIDUAL.has(x.sequence)).length, 22);
assert.equal(roots.filter((x) => !RESIDUAL.has(x.sequence)).length, 62);

function measure(state, target) {
  return {
    delta: Math.max(0, 6 - e.heights(state)[resolvedColumn(target)]),
    mu: e.mu(state),
  };
}

// Exact one-turn obligation mapping. An enabled P1 singleton at a P0-turn node is a mandatory
// next-turn defense unless P0 wins now. Its only direct blocking action is to occupy that exact
// landing cell. Distinct enabled singleton cells therefore compete for the same single temporal
// response slot (the current P0 move). We verify the claimed capacity defect/forced response by
// enumerating every legal P0 action rather than importing the generic finite Hall control.
function responseCapacityAtP0(state, target) {
  assert.equal(e.rank(state) & 1, 0, 'response-capacity node must be P0 turn');
  const p0Immediate = e.terminalActions(state, 0);
  const obligations = [...new Set(e.enabledSingletons(state, 1))];
  const base = {
    obligationCount: obligations.length,
    obligations: obligations.map(e.coord),
    measure: measure(state, target),
    targetLive: e.singleton(state, 0, target),
    targetDistance: e.singleton(state, 0, target) ? e.targetDistance(state, target) : null,
  };
  if (p0Immediate.length) {
    return { ...base, kind: 'P0_terminal_available', terminalColumns: p0Immediate.map((x) => e.col(x.column)) };
  }
  if (obligations.length === 0) return { ...base, kind: 'no_current_P1_obligation' };

  if (obligations.length >= 2) {
    const actionChecks = [];
    let allNonterminalActionsLose = true;
    for (const action of e.legal(state)) {
      const actionCell = e.landing(state, action);
      const afterP0 = k.advance(state, action);
      assert(afterP0 !== domain.QN_TERMINAL_WIN, 'P0 terminal escaped prior terminalActions census');
      assert(afterP0 >= 0);
      const p1Terminal = e.terminalActions(afterP0, 1);
      if (p1Terminal.length === 0) allNonterminalActionsLose = false;
      actionChecks.push({
        action: e.col(action), actionCell: e.coord(actionCell),
        p1Terminal: p1Terminal.map((x) => e.coord(x.cell)),
      });
    }
    return {
      ...base,
      kind: allNonterminalActionsLose ? 'verified_multi_obligation_capacity_defect' : 'multi_obligation_not_capacity_defect',
      temporalResponseSlots: 1,
      allNonterminalActionsLose,
      actionChecks,
    };
  }

  const threat = obligations[0];
  const forcedColumn = threat % 7;
  assert.equal(e.landing(state, forcedColumn), threat, 'enabled singleton is not the current landing cell');
  const nonBlocking = [];
  let allNonblockingLose = true;
  for (const action of e.legal(state)) {
    if (action === forcedColumn) continue;
    const afterP0 = k.advance(state, action);
    assert(afterP0 !== domain.QN_TERMINAL_WIN, 'P0 terminal escaped prior terminalActions census');
    assert(afterP0 >= 0);
    const p1Terminal = e.terminalActions(afterP0, 1);
    if (p1Terminal.length === 0) allNonblockingLose = false;
    nonBlocking.push({ action: e.col(action), p1Terminal: p1Terminal.map((x) => e.coord(x.cell)) });
  }
  if (!allNonblockingLose) {
    return { ...base, kind: 'singleton_not_forced', forcedColumn: e.col(forcedColumn), nonBlocking };
  }

  const afterBlock = k.advance(state, forcedColumn);
  if (afterBlock === domain.QN_TERMINAL_WIN) {
    return { ...base, kind: 'verified_forced_singleton_defense', forcedColumn: e.col(forcedColumn), forcedCell: e.coord(threat), blockRoute: 'P0_terminal' };
  }
  assert(afterBlock >= 0 && e.rank(afterBlock) === e.rank(state) + 1);
  const replies = [];
  const routeCounts = {};
  for (const reply of e.legal(afterBlock)) {
    const replyCell = e.landing(afterBlock, reply);
    const child = k.advance(afterBlock, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      assert(new Set(e.enabledSingletons(afterBlock, 1)).has(replyCell));
      bump(routeCounts, 'P1_terminal');
      replies.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'P1_terminal' });
      continue;
    }
    assert(child >= 0 && e.rank(child) === e.rank(state) + 2);
    const p0Terminal = e.terminalActions(child, 0);
    if (p0Terminal.length) {
      bump(routeCounts, 'immediate_P0_terminal');
      replies.push({ reply: e.col(reply), replyCell: e.coord(replyCell), route: 'immediate_P0_terminal' });
      continue;
    }
    const nextObligations = e.enabledSingletons(child, 1);
    const live = e.singleton(child, 0, target);
    const distance = live ? e.targetDistance(child, target) : null;
    const route = nextObligations.length >= 2 ? 'next_multi_obligation'
      : nextObligations.length === 1 ? 'next_single_obligation'
      : live && distance === 1 ? 'distance1_no_obligation'
      : live && distance === 2 ? 'distance2_no_obligation'
      : 'outside_known_handoff';
    bump(routeCounts, route);
    replies.push({
      reply: e.col(reply), replyCell: e.coord(replyCell), route,
      nextObligations: nextObligations.map(e.coord),
      targetLive: live, targetDistance: distance, measure: measure(child, target),
    });
  }
  return {
    ...base,
    kind: 'verified_forced_singleton_defense',
    forcedColumn: e.col(forcedColumn),
    forcedCell: e.coord(threat),
    allNonblockingLose,
    routeCounts,
    replies,
  };
}

function classifyRoot(root) {
  const state = root.state;
  const label = RESIDUAL.has(root.sequence) ? 'residual' : 'qualified_positive';
  const rootCapacity = responseCapacityAtP0(state, root.target);
  const actions = [];
  const childKinds = {};
  const forcedBlockRoutes = {};
  for (const action of e.legal(state)) {
    const actionCell = e.landing(state, action);
    const afterP0 = k.advance(state, action);
    if (afterP0 === domain.QN_TERMINAL_WIN) {
      actions.push({ action: e.col(action), actionCell: e.coord(actionCell), route: 'P0_terminal_now' });
      continue;
    }
    assert(afterP0 >= 0 && e.rank(afterP0) === 19);
    const p1Terminal = e.terminalActions(afterP0, 1);
    if (p1Terminal.length) {
      actions.push({
        action: e.col(action), actionCell: e.coord(actionCell), route: 'immediate_P1_terminal_exposure',
        p1Obligations: e.enabledSingletons(afterP0, 1).map(e.coord),
        p1Terminal: p1Terminal.map((x) => e.coord(x.cell)),
      });
      continue;
    }
    const children = [];
    for (const reply of e.legal(afterP0)) {
      const replyCell = e.landing(afterP0, reply);
      const child = k.advance(afterP0, reply);
      assert(child !== domain.QN_TERMINAL_WIN, 'terminal reply escaped terminalActions census');
      assert(child >= 0 && e.rank(child) === 20);
      const cap = responseCapacityAtP0(child, root.target);
      bump(childKinds, cap.kind);
      if (cap.kind === 'verified_forced_singleton_defense') {
        for (const [route, n] of Object.entries(cap.routeCounts ?? {})) bump(forcedBlockRoutes, route, n);
      }
      children.push({ reply: e.col(reply), replyCell: e.coord(replyCell), capacity: cap });
    }
    actions.push({ action: e.col(action), actionCell: e.coord(actionCell), route: 'P1_safe_first_horizon', children });
  }
  const p1SafeActions = actions.filter((x) => x.route === 'P1_safe_first_horizon').length;
  const p1UnsafeActions = actions.filter((x) => x.route === 'immediate_P1_terminal_exposure').length;
  const terminalActions = actions.filter((x) => x.route === 'P0_terminal_now').length;
  const signature = [
    `rO${rootCapacity.obligationCount}`,
    `safe${p1SafeActions}`,
    `unsafe${p1UnsafeActions}`,
    `term${terminalActions}`,
    ...Object.entries(childKinds).sort().map(([name,n]) => `${name}:${n}`),
    ...Object.entries(forcedBlockRoutes).sort().map(([name,n]) => `fb-${name}:${n}`),
  ].join('|');
  return {
    sequence: root.sequence,
    family: root.family,
    target: targetName(root.target),
    r1: e.col(root.r1), r2: e.col(root.r2), label,
    rootCapacity, p1SafeActions, p1UnsafeActions, terminalActions,
    childKinds, forcedBlockRoutes, signature, actions,
  };
}

const rows = roots.map(classifyRoot);
const positives = rows.filter((x) => x.label === 'qualified_positive');
const residuals = rows.filter((x) => x.label === 'residual');
assert.equal(positives.length, 62);
assert.equal(residuals.length, 22);

function aggregate(group) {
  const childKinds = {}, forcedBlockRoutes = {};
  for (const row of group) {
    for (const [name,n] of Object.entries(row.childKinds)) bump(childKinds, name, n);
    for (const [name,n] of Object.entries(row.forcedBlockRoutes)) bump(forcedBlockRoutes, name, n);
  }
  return {
    roots: group.length,
    rootObligationCounts: countBy(group, (x) => String(x.rootCapacity.obligationCount)),
    safeActionCounts: countBy(group, (x) => String(x.p1SafeActions)),
    unsafeActionCounts: countBy(group, (x) => String(x.p1UnsafeActions)),
    childKinds,
    forcedBlockRoutes,
    signatureCount: new Set(group.map((x) => x.signature)).size,
  };
}

const positiveSignatures = new Map();
for (const row of positives) {
  const list = positiveSignatures.get(row.signature) ?? [];
  list.push(row.sequence); positiveSignatures.set(row.signature, list);
}
const matchedOpposite = residuals.flatMap((row) => {
  const matches = positiveSignatures.get(row.signature) ?? [];
  return matches.slice(0, 2).map((positive) => ({ signature: row.signature, residual: row.sequence, positive }));
});

const exactCapacityDefects = rows.flatMap((row) => row.actions.flatMap((a) =>
  (a.children ?? []).filter((c) => c.capacity.kind === 'verified_multi_obligation_capacity_defect')
    .map((c) => ({ root: row.sequence, label: row.label, action: a.action, reply: c.reply, obligations: c.capacity.obligations }))));
const exactForcedDefenses = rows.flatMap((row) => row.actions.flatMap((a) =>
  (a.children ?? []).filter((c) => c.capacity.kind === 'verified_forced_singleton_defense')
    .map((c) => ({ root: row.sequence, label: row.label, action: a.action, reply: c.reply, forcedCell: c.capacity.forcedCell, routes: c.capacity.routeCounts ?? {} }))));

console.log(`POSTBLOCK_RESIDUAL_RESPONSE_CAPACITY_DIFFERENTIAL=${JSON.stringify({
  kind: 'standard7x6-postblock-residual-response-capacity-differential-v1',
  attribution: {
    researchDirectionStructuralArchitectureInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  exactRank18Roots: rows.length,
  qualifiedPositiveRoots: positives.length,
  residualRoots: residuals.length,
  residualInventory: { G3: G3_RESIDUAL, C3: C3_RESIDUAL },
  positive: aggregate(positives),
  residual: aggregate(residuals),
  exactCapacityDefectChildren: exactCapacityDefects.length,
  exactForcedDefenseChildren: exactForcedDefenses.length,
  matchedOppositeSignaturePairs: matchedOpposite.length,
  matchedOppositeSamples: matchedOpposite.slice(0, 12),
  residualProfiles: residuals.map((x) => ({
    sequence: x.sequence, family: x.family, target: x.target, r1: x.r1, r2: x.r2,
    rootCapacity: x.rootCapacity, p1SafeActions: x.p1SafeActions, p1UnsafeActions: x.p1UnsafeActions,
    childKinds: x.childKinds, forcedBlockRoutes: x.forcedBlockRoutes, signature: x.signature,
  })),
  capacityDefectSamples: exactCapacityDefects.slice(0, 20),
  forcedDefenseSamples: exactForcedDefenses.slice(0, 20),
  interpretation: matchedOpposite.length === 0
    ? 'The exact one-turn P1-obligation/forced-defense profile separates every retained residual root from all 62 already-qualified rank18 positives under this observation. This is a candidate guarded theorem interface, not yet a proof of the residual roots.'
    : 'The exact one-turn P1-obligation/forced-defense profile is not a sufficient separator: at least one residual root and qualified positive share the same profile. Preserve the matched counterexamples and refine only with downstream dependency information.',
  theoremBoundary: 'Diagnostic only. A multi-obligation capacity defect is certified only after exhaustive enumeration verifies that every legal nonterminal P0 action admits an immediate exact enabled-singleton P1 terminal response. A one-obligation forced defense is certified only after every nonblocking P0 action is similarly eliminated. No generic Hall control, solved WDL label, q equality, recursive forced-defense theorem, center-opening W claim, or root solve is assumed.',
})}`);

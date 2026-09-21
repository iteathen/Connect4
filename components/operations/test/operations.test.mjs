import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

import {
  AUTHORITY_REQUIRING_OWNER_APPROVAL,
  CANDIDATE_STATUS,
  OPPORTUNITY_STATUS,
  ROLE_GAP_STATUS,
  TRANSPORT_PROFILE,
  CandidateQueue,
  CoordinationLedger,
  OpportunityPipeline,
  RoleGapQueue,
  formatExchange,
  loadOperationsState,
  requiresOwnerApproval,
} from '../index.mjs';

const STATE_URL = new URL('../state.json', import.meta.url);
const REGISTRY_URL = new URL('../../../.agent/coordination.json', import.meta.url);

test('seeded operations state loads and validates every record', () => {
  const { roleGaps, candidates, opportunities, ledger } = loadOperationsState(STATE_URL);
  assert.equal(roleGaps.list().length, 2);
  assert.equal(candidates.list().length, 2);
  assert.equal(opportunities.list().length, 3);
  assert.equal(ledger.list().length, 2);
});

test('every role gap is a clean bounded seam with an integration owner', () => {
  const { roleGaps } = loadOperationsState(STATE_URL);
  for (const gap of roleGaps.list()) {
    assert.equal(roleGaps.isCleanBoundedSeam(gap), true, gap.role_id);
    assert.ok(gap.release_trigger.length > 0, gap.role_id);
  }
});

test('registry declares the same durable project-operations roles as state', () => {
  const registry = JSON.parse(readFileSync(REGISTRY_URL, 'utf8'));
  const campaign = registry.active_campaigns.find((entry) => entry.campaign_id === 'project-operations');
  assert.ok(campaign, 'project-operations campaign must exist in registry');
  const registryRoleIds = campaign.roles.map((role) => role.role_id).sort();
  assert.deepEqual(registryRoleIds, ['capacity-manager', 'dev-budget']);

  const { roleGaps } = loadOperationsState(STATE_URL);
  const stateRoleIds = roleGaps.list().map((gap) => gap.role_id).sort();
  assert.deepEqual(stateRoleIds, registryRoleIds);
});

test('role gap queue rejects unbounded seams and missing integration owners', () => {
  const queue = new RoleGapQueue();
  assert.throws(() => queue.addGap({
    role_id: 'x',
    role: 'r',
    campaign_id: 'c',
    seam: { bounded: false, scope: 's' },
    integration_owner: 'o',
    release_trigger: 't',
  }), RangeError);

  assert.throws(() => queue.addGap({
    role_id: 'x',
    role: 'r',
    campaign_id: 'c',
    seam: { bounded: true, scope: 's' },
    release_trigger: 't',
  }), RangeError);

  assert.throws(() => queue.addGap({
    role_id: 'x',
    role: 'r',
    campaign_id: 'c',
    seam: { bounded: true, scope: 's' },
    integration_owner: 'o',
  }), RangeError);

  assert.throws(() => queue.addGap(null), RangeError);
});

test('role gap queue rejects duplicate role ids', () => {
  const queue = new RoleGapQueue();
  const gap = {
    role_id: 'dup',
    role: 'r',
    campaign_id: 'c',
    seam: { bounded: true, scope: 's' },
    integration_owner: 'o',
    release_trigger: 't',
  };
  queue.addGap(gap);
  assert.throws(() => queue.addGap(gap), RangeError);
});

test('candidate queue requires a matching bounded seam with the same integration owner', () => {
  const gaps = new RoleGapQueue();
  gaps.addGap({
    role_id: 'capacity-manager',
    role: 'agent-capacity-and-recruiting',
    campaign_id: 'project-operations',
    seam: { bounded: true, scope: 'recruiting only' },
    integration_owner: 'isomax-director',
    release_trigger: 't',
  });

  const candidates = new CandidateQueue([], gaps);
  const ok = candidates.add({
    candidate_id: 'c1',
    target_role_id: 'capacity-manager',
    source: 'scouting',
    capability: 'queue maintenance',
    integration_owner: 'isomax-director',
  });
  assert.equal(ok.status, CANDIDATE_STATUS.QUEUED);

  assert.throws(() => candidates.add({
    candidate_id: 'c2',
    target_role_id: 'capacity-manager',
    source: 'scouting',
    capability: 'x',
    integration_owner: 'different-owner',
  }), RangeError, 'integration owner must match gap owner');

  assert.throws(() => candidates.add({
    candidate_id: 'c3',
    target_role_id: 'missing-role',
    source: 'scouting',
    capability: 'x',
    integration_owner: 'isomax-director',
  }), RangeError, 'target role must exist');
});

test('coordination ledger measures nominal headcount and coordination cost separately', () => {
  const { ledger } = loadOperationsState(STATE_URL);
  assert.equal(ledger.nominalHeadcount(), 2);
  assert.equal(ledger.coordinationCost(), 0.4);
  assert.ok(ledger.netCapacity() > 0, 'seeded double-duty bridges must not add more coordination cost than headcount gained');
});

test('coordination ledger records only valid numeric entries', () => {
  const ledger = new CoordinationLedger();
  assert.throws(() => ledger.record({ role_id: 'r', nominal_headcount: -1, coordination_cost: 0 }), RangeError);
  assert.throws(() => ledger.record({ role_id: 'r', nominal_headcount: 0, coordination_cost: -0.1 }), RangeError);
  assert.throws(() => ledger.record({ role_id: '', nominal_headcount: 0, coordination_cost: 0 }), RangeError);
  assert.throws(() => ledger.record({}), RangeError);
  const entry = ledger.record({ role_id: 'r', nominal_headcount: 1, coordination_cost: 0.5 });
  assert.equal(entry.role_id, 'r');
});

test('every dev-budget opportunity is owner-reviewable with effort, upside, constraints, obligations, risk', () => {
  const { opportunities } = loadOperationsState(STATE_URL);
  for (const opportunity of opportunities.list()) {
    for (const field of ['expected_effort', 'upside', 'constraints', 'obligations', 'risk']) {
      assert.ok(opportunity[field], `${opportunity.proposal_id} must provide ${field}`);
    }
    assert.ok(Array.isArray(opportunity.constraints), opportunity.proposal_id);
    assert.ok(Array.isArray(opportunity.obligations), opportunity.proposal_id);
    assert.ok(Array.isArray(opportunity.risk), opportunity.proposal_id);
  }
});

test('opportunity pipeline rejects records missing owner-review fields', () => {
  const pipeline = new OpportunityPipeline();
  assert.throws(() => pipeline.add({
    proposal_id: 'bad',
    title: 't',
    resource_gap: 'r',
    source_type: 's',
    expected_effort: 'low',
    upside: 'u',
    constraints: [],
    obligations: [],
    risk: [],
  }), RangeError, 'constraints/obligations/risk must be non-empty arrays');
});

test('opportunity approval requires an explicit owner approver', () => {
  const pipeline = new OpportunityPipeline();
  const proposal = pipeline.add({
    proposal_id: 'p1',
    title: 't',
    resource_gap: 'r',
    source_type: 's',
    expected_effort: 'low',
    upside: 'u',
    constraints: ['c'],
    obligations: ['o'],
    risk: ['r'],
    status: OPPORTUNITY_STATUS.PROPOSAL,
  });

  assert.throws(() => pipeline.promote(proposal.proposal_id, OPPORTUNITY_STATUS.APPROVED), RangeError);

  pipeline.approve(proposal.proposal_id, 'IX-DIRECTOR');
  assert.equal(proposal.status, OPPORTUNITY_STATUS.APPROVED);
  assert.equal(proposal.approved_by, 'IX-DIRECTOR');
});

test('rejected proposals cannot be promoted', () => {
  const pipeline = new OpportunityPipeline();
  const proposal = pipeline.add({
    proposal_id: 'p2',
    title: 't',
    resource_gap: 'r',
    source_type: 's',
    expected_effort: 'low',
    upside: 'u',
    constraints: ['c'],
    obligations: ['o'],
    risk: ['r'],
  });
  pipeline.promote(proposal.proposal_id, OPPORTUNITY_STATUS.REJECTED);
  assert.throws(() => pipeline.promote(proposal.proposal_id, OPPORTUNITY_STATUS.PROPOSAL), RangeError);
});

test('authority boundary covers every owner-approval-required action', () => {
  assert.deepEqual(AUTHORITY_REQUIRING_OWNER_APPROVAL, [
    'spend_funds',
    'commit_funds',
    'accept_money',
    'accept_legal_terms',
    'sign_agreement',
    'change_licensing',
    'promise_deliverables',
    'make_public_commercial_commitment',
    'grant_repository_access',
    'redirect_solver_architecture',
  ]);
  for (const action of AUTHORITY_REQUIRING_OWNER_APPROVAL) {
    assert.equal(requiresOwnerApproval(action), true, action);
  }
  assert.equal(requiresOwnerApproval('research_only'), false);
});

test('AX/GH-OPS exchange messages follow the declared transport profile', () => {
  const message = formatExchange({
    id: 'OPS-001',
    from: 'IX-DIRECTOR',
    role_id: 'capacity-manager',
    to: 'all',
    intent: 'INFORM',
    task: 'OPS-role-gap-queue',
    state: 'active',
  });
  const lines = message.split('\n');
  assert.equal(lines[0], TRANSPORT_PROFILE);
  assert.equal(lines[1], 'EXCHANGE: OPS-001');
  assert.equal(lines[2], 'FROM: IX-DIRECTOR');
  assert.equal(lines[3], 'ROLE_ID: capacity-manager');
  assert.equal(lines[4], 'TO: all');
  assert.equal(lines[5], 'INTENT: INFORM');
  assert.equal(lines[6], 'TASK: OPS-role-gap-queue');
  assert.equal(lines[7], 'STATE: active');

  const withParent = formatExchange({
    id: 'OPS-002',
    from: 'IX-DIRECTOR',
    role_id: 'dev-budget',
    to: 'all',
    intent: 'PROPOSE',
    task: 'OPS-opportunity-001',
    parent: 'OPS-001',
    state: 'draft',
  });
  assert.ok(withParent.includes('PARENT: OPS-001'));
});

test('exchange formatter requires all load-bearing fields', () => {
  assert.throws(() => formatExchange({ id: 'OPS-003', from: 'X', role_id: 'r' }), RangeError);
  assert.throws(() => formatExchange({}), RangeError);
  assert.throws(() => formatExchange(null), RangeError);
});

test('gap and candidate status transitions stay within declared states', () => {
  const gaps = new RoleGapQueue();
  const gap = gaps.addGap({
    role_id: 'capacity-manager',
    role: 'agent-capacity-and-recruiting',
    campaign_id: 'project-operations',
    seam: { bounded: true, scope: 'recruiting only' },
    integration_owner: 'isomax-director',
    release_trigger: 't',
  });
  assert.equal(gap.status, ROLE_GAP_STATUS.OPEN);

  assert.throws(() => gaps.addGap({
    role_id: 'x',
    role: 'r',
    campaign_id: 'c',
    seam: { bounded: true, scope: 's' },
    integration_owner: 'o',
    release_trigger: 't',
    status: 'not-a-status',
  }), RangeError);
});
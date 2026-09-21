import { readFileSync } from 'node:fs';

export const TRANSPORT_PROFILE = 'AX/GH-OPS';

export const ROLE_GAP_STATUS = Object.freeze({
  OPEN: 'open',
  STAFFED: 'staffed',
  PAUSED: 'paused',
});

export const CANDIDATE_STATUS = Object.freeze({
  QUEUED: 'queued',
  INTERVIEWING: 'interviewing',
  RECRUITED: 'recruited',
  ONBOARDED: 'onboarded',
  REJECTED: 'rejected',
});

export const OPPORTUNITY_STATUS = Object.freeze({
  RESEARCH: 'research',
  PROPOSAL: 'proposal',
  OWNER_REVIEW: 'owner-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const PROPOSAL_REQUIRED_FIELDS = Object.freeze([
  'expected_effort',
  'upside',
  'constraints',
  'obligations',
  'risk',
]);

export const AUTHORITY_REQUIRING_OWNER_APPROVAL = Object.freeze([
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

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new RangeError(`${name} must be a non-empty string`);
  }
}

function requireNonEmptyArray(value, name) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new RangeError(`${name} must be a non-empty array`);
  }
}

export function validateRoleGap(gap) {
  const problems = [];
  if (!gap || typeof gap !== 'object') return ['role gap must be an object'];
  if (typeof gap.role_id !== 'string' || gap.role_id === '') problems.push('role_id is required');
  if (typeof gap.role !== 'string' || gap.role === '') problems.push('role is required');
  if (typeof gap.campaign_id !== 'string' || gap.campaign_id === '') problems.push('campaign_id is required');
  if (!gap.seam || typeof gap.seam !== 'object') {
    problems.push('seam is required');
  } else {
    if (gap.seam.bounded !== true) problems.push('seam.bounded must be true');
    if (typeof gap.seam.scope !== 'string' || gap.seam.scope === '') problems.push('seam.scope is required');
  }
  if (typeof gap.integration_owner !== 'string' || gap.integration_owner === '') problems.push('integration_owner is required');
  if (typeof gap.release_trigger !== 'string' || gap.release_trigger === '') problems.push('release_trigger is required');
  if (gap.status !== undefined && !Object.values(ROLE_GAP_STATUS).includes(gap.status)) {
    problems.push(`status must be one of ${Object.values(ROLE_GAP_STATUS).join(', ')}`);
  }
  return problems;
}

export function validateCandidate(candidate) {
  const problems = [];
  if (!candidate || typeof candidate !== 'object') return ['candidate must be an object'];
  if (typeof candidate.candidate_id !== 'string' || candidate.candidate_id === '') problems.push('candidate_id is required');
  if (typeof candidate.target_role_id !== 'string' || candidate.target_role_id === '') problems.push('target_role_id is required');
  if (typeof candidate.source !== 'string' || candidate.source === '') problems.push('source is required');
  if (typeof candidate.capability !== 'string' || candidate.capability === '') problems.push('capability is required');
  if (typeof candidate.integration_owner !== 'string' || candidate.integration_owner === '') problems.push('integration_owner is required');
  if (candidate.status !== undefined && !Object.values(CANDIDATE_STATUS).includes(candidate.status)) {
    problems.push(`status must be one of ${Object.values(CANDIDATE_STATUS).join(', ')}`);
  }
  return problems;
}

export function validateOpportunity(opportunity) {
  const problems = [];
  if (!opportunity || typeof opportunity !== 'object') return ['opportunity must be an object'];
  if (typeof opportunity.proposal_id !== 'string' || opportunity.proposal_id === '') problems.push('proposal_id is required');
  if (typeof opportunity.title !== 'string' || opportunity.title === '') problems.push('title is required');
  if (typeof opportunity.resource_gap !== 'string' || opportunity.resource_gap === '') problems.push('resource_gap is required');
  if (typeof opportunity.source_type !== 'string' || opportunity.source_type === '') problems.push('source_type is required');
  for (const field of PROPOSAL_REQUIRED_FIELDS) {
    if (opportunity[field] === undefined || opportunity[field] === null || opportunity[field] === '') {
      problems.push(`${field} is required`);
    }
  }
  for (const field of ['constraints', 'obligations', 'risk']) {
    if (opportunity[field] !== undefined && !Array.isArray(opportunity[field])) problems.push(`${field} must be an array`);
    if (Array.isArray(opportunity[field]) && opportunity[field].length === 0) {
      problems.push(`${field} must be non-empty`);
    }
  }
  if (opportunity.status !== undefined && !Object.values(OPPORTUNITY_STATUS).includes(opportunity.status)) {
    problems.push(`status must be one of ${Object.values(OPPORTUNITY_STATUS).join(', ')}`);
  }
  return problems;
}

export class RoleGapQueue {
  constructor(gaps = []) {
    this.gaps = new Map();
    for (const gap of gaps) this.addGap(gap);
  }

  addGap(gap) {
    const problems = validateRoleGap(gap);
    if (problems.length > 0) throw new RangeError(`invalid role gap: ${problems.join('; ')}`);
    if (this.gaps.has(gap.role_id)) throw new RangeError(`duplicate role gap ${gap.role_id}`);
    this.gaps.set(gap.role_id, {
      role_id: gap.role_id,
      role: gap.role,
      campaign_id: gap.campaign_id,
      seam: { bounded: true, scope: gap.seam.scope },
      integration_owner: gap.integration_owner,
      release_trigger: gap.release_trigger,
      status: gap.status ?? ROLE_GAP_STATUS.OPEN,
    });
    return this.gaps.get(gap.role_id);
  }

  get(roleId) {
    return this.gaps.get(roleId);
  }

  list() {
    return [...this.gaps.values()];
  }

  open() {
    return this.list().filter((gap) => gap.status === ROLE_GAP_STATUS.OPEN);
  }

  isCleanBoundedSeam(gap) {
    return (
      gap?.seam?.bounded === true
      && typeof gap.seam.scope === 'string'
      && gap.seam.scope !== ''
      && typeof gap.integration_owner === 'string'
      && gap.integration_owner !== ''
    );
  }
}

export class CandidateQueue {
  constructor(candidates = [], roleGapQueue) {
    this.candidates = new Map();
    this.roleGapQueue = roleGapQueue ?? new RoleGapQueue();
    for (const candidate of candidates) this.add(candidate);
  }

  add(candidate) {
    const problems = validateCandidate(candidate);
    if (problems.length > 0) throw new RangeError(`invalid candidate: ${problems.join('; ')}`);
    const gap = this.roleGapQueue.get(candidate.target_role_id);
    if (!gap) throw new RangeError(`candidate targets unknown role gap ${candidate.target_role_id}`);
    if (gap.integration_owner !== candidate.integration_owner) {
      throw new RangeError(`candidate integration owner ${candidate.integration_owner} does not match gap owner ${gap.integration_owner}`);
    }
    if (this.candidates.has(candidate.candidate_id)) throw new RangeError(`duplicate candidate ${candidate.candidate_id}`);
    this.candidates.set(candidate.candidate_id, {
      candidate_id: candidate.candidate_id,
      target_role_id: candidate.target_role_id,
      source: candidate.source,
      capability: candidate.capability,
      integration_owner: candidate.integration_owner,
      status: candidate.status ?? CANDIDATE_STATUS.QUEUED,
    });
    return this.candidates.get(candidate.candidate_id);
  }

  get(candidateId) {
    return this.candidates.get(candidateId);
  }

  list() {
    return [...this.candidates.values()];
  }

  byTargetRole(roleId) {
    return this.list().filter((candidate) => candidate.target_role_id === roleId);
  }
}

export class OpportunityPipeline {
  constructor(opportunities = []) {
    this.opportunities = new Map();
    for (const opportunity of opportunities) this.add(opportunity);
  }

  add(opportunity) {
    const problems = validateOpportunity(opportunity);
    if (problems.length > 0) throw new RangeError(`invalid opportunity: ${problems.join('; ')}`);
    if (this.opportunities.has(opportunity.proposal_id)) throw new RangeError(`duplicate proposal ${opportunity.proposal_id}`);
    this.opportunities.set(opportunity.proposal_id, {
      proposal_id: opportunity.proposal_id,
      title: opportunity.title,
      resource_gap: opportunity.resource_gap,
      source_type: opportunity.source_type,
      expected_effort: opportunity.expected_effort,
      upside: opportunity.upside,
      constraints: opportunity.constraints ?? [],
      obligations: opportunity.obligations ?? [],
      risk: opportunity.risk ?? [],
      status: opportunity.status ?? OPPORTUNITY_STATUS.RESEARCH,
      approved_by: opportunity.approved_by ?? null,
    });
    return this.opportunities.get(opportunity.proposal_id);
  }

  get(proposalId) {
    return this.opportunities.get(proposalId);
  }

  list() {
    return [...this.opportunities.values()];
  }

  promote(proposalId, to, { approvedBy = null } = {}) {
    const opportunity = this.opportunities.get(proposalId);
    if (!opportunity) throw new RangeError(`unknown proposal ${proposalId}`);
    if (opportunity.status === OPPORTUNITY_STATUS.REJECTED) throw new RangeError('rejected proposal cannot be promoted');
    if (to === OPPORTUNITY_STATUS.APPROVED && opportunity.approved_by === null) {
      throw new RangeError('owner approval required before approval');
    }
    opportunity.status = to;
    if (approvedBy !== null) opportunity.approved_by = approvedBy;
    return opportunity;
  }

  approve(proposalId, approvedBy) {
    requireString(approvedBy, 'approvedBy');
    const opportunity = this.opportunities.get(proposalId);
    if (!opportunity) throw new RangeError(`unknown proposal ${proposalId}`);
    opportunity.approved_by = approvedBy;
    return this.promote(proposalId, OPPORTUNITY_STATUS.APPROVED);
  }
}

export class CoordinationLedger {
  constructor() {
    this.exchanges = [];
  }

  record(entry) {
    if (!entry || typeof entry !== 'object') throw new RangeError('ledger entry must be an object');
    if (typeof entry.role_id !== 'string' || entry.role_id === '') throw new RangeError('role_id is required');
    if (typeof entry.nominal_headcount !== 'number' || !Number.isFinite(entry.nominal_headcount) || entry.nominal_headcount < 0) {
      throw new RangeError('nominal_headcount must be a non-negative number');
    }
    if (typeof entry.coordination_cost !== 'number' || !Number.isFinite(entry.coordination_cost) || entry.coordination_cost < 0) {
      throw new RangeError('coordination_cost must be a non-negative number');
    }
    this.exchanges.push({
      role_id: entry.role_id,
      nominal_headcount: entry.nominal_headcount,
      coordination_cost: entry.coordination_cost,
      note: entry.note ?? null,
    });
    return this.exchanges.at(-1);
  }

  list() {
    return [...this.exchanges];
  }

  nominalHeadcount() {
    return this.exchanges.reduce((sum, entry) => sum + entry.nominal_headcount, 0);
  }

  coordinationCost() {
    return this.exchanges.reduce((sum, entry) => sum + entry.coordination_cost, 0);
  }

  netCapacity() {
    return this.nominalHeadcount() - this.coordinationCost();
  }
}

export function formatExchange(exchange) {
  if (!exchange || typeof exchange !== 'object') throw new RangeError('exchange must be an object');
  const required = ['id', 'from', 'role_id', 'to', 'intent', 'task', 'state'];
  for (const field of required) {
    if (typeof exchange[field] !== 'string' || exchange[field] === '') throw new RangeError(`exchange field ${field} is required`);
  }
  const lines = [
    TRANSPORT_PROFILE,
    `EXCHANGE: ${exchange.id}`,
    `FROM: ${exchange.from}`,
    `ROLE_ID: ${exchange.role_id}`,
    `TO: ${exchange.to}`,
    `INTENT: ${exchange.intent}`,
    `TASK: ${exchange.task}`,
  ];
  if (exchange.parent) lines.push(`PARENT: ${exchange.parent}`);
  lines.push(`STATE: ${exchange.state}`);
  return lines.join('\n');
}

export function requiresOwnerApproval(action) {
  return AUTHORITY_REQUIRING_OWNER_APPROVAL.includes(action);
}

export function loadOperationsState(fileUrl) {
  const raw = JSON.parse(readFileSync(fileUrl, 'utf8'));
  const roleGaps = new RoleGapQueue(raw.role_gaps ?? []);
  const candidates = new CandidateQueue(raw.candidates ?? [], roleGaps);
  const opportunities = new OpportunityPipeline(raw.opportunities ?? []);
  const ledger = new CoordinationLedger();
  for (const entry of raw.ledger ?? []) ledger.record(entry);
  return { roleGaps, candidates, opportunities, ledger, raw };
}
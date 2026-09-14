const VERSION = 1;

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value === null || typeof value !== 'object') return value;
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
  return out;
}

function canonical(value) { return JSON.stringify(stable(value)); }
function requireString(value, name) {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(`${name} must be a non-empty string`);
  return value;
}
function normalizeRank(rank, name) {
  if (!Array.isArray(rank) || rank.length === 0 || rank.some((x) => !Number.isSafeInteger(x) || x < 0)) {
    throw new TypeError(`${name} must be a non-empty array of nonnegative safe integers`);
  }
  return Object.freeze([...rank]);
}
function lexLess(left, right) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) {
    if (left[i] < right[i]) return true;
    if (left[i] > right[i]) return false;
  }
  return false;
}
function normalizeObligations(items = []) {
  if (!Array.isArray(items)) throw new TypeError('obligations must be an array');
  const seen = new Set();
  return Object.freeze(items.map((item, index) => {
    if (!item || typeof item !== 'object') throw new TypeError(`obligations[${index}] must be an object`);
    const id = requireString(item.id, `obligations[${index}].id`);
    if (seen.has(id)) throw new Error(`duplicate obligation id ${id}`);
    seen.add(id);
    const deadlineClock = requireString(item.deadlineClock, `obligations[${index}].deadlineClock`);
    if (!Number.isSafeInteger(item.remaining) || item.remaining < 0) throw new TypeError(`obligations[${index}].remaining must be a nonnegative safe integer`);
    return Object.freeze({ id, deadlineClock, remaining: item.remaining, responseKey: canonical(item.response ?? null) });
  }).sort((a, b) => a.id.localeCompare(b.id)));
}
function normalizeClockTicks(events = []) {
  const totals = new Map();
  for (const [index, event] of events.entries()) {
    if (!event || typeof event !== 'object') throw new TypeError(`events[${index}] must be an object`);
    requireString(event.id, `events[${index}].id`);
    if (event.legal !== true) throw new Error(`transport event ${event.id} is not certified legal`);
    if (event.terminal === true) throw new Error(`transport event ${event.id} crosses a terminal boundary`);
    const ticks = event.clockTicks ?? {};
    if (!ticks || typeof ticks !== 'object' || Array.isArray(ticks)) throw new TypeError(`events[${index}].clockTicks must be an object`);
    for (const [clock, amount] of Object.entries(ticks)) {
      requireString(clock, 'clock name');
      if (!Number.isSafeInteger(amount) || amount < 0) throw new TypeError(`clock tick ${clock} must be a nonnegative safe integer`);
      totals.set(clock, (totals.get(clock) ?? 0) + amount);
    }
  }
  return totals;
}

export function Export_transport_snapshot(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') throw new TypeError('transport snapshot descriptor required');
  return Object.freeze({
    kind: 'guarded-braid-transport-snapshot-v1',
    version: VERSION,
    claimId: requireString(descriptor.claimId, 'claimId'),
    sideToMove: requireString(descriptor.sideToMove, 'sideToMove'),
    claimInterfaceKey: canonical(descriptor.claimInterface),
    phaseKey: canonical(descriptor.phase),
    supportOrderingKey: canonical(descriptor.supportOrdering),
    responseResourcesKey: canonical(descriptor.responseResources),
    obligations: normalizeObligations(descriptor.obligations),
    progressRank: normalizeRank(descriptor.progressRank, 'progressRank'),
  });
}

function fail(reason, detail = null) { return Object.freeze({ ok: false, reason, detail }); }
function pass(detail) { return Object.freeze({ ok: true, ...detail }); }

export function Verify_obligation_conservation(before, after, events, options = {}) {
  const ticks = normalizeClockTicks(events);
  const prior = new Map(before.obligations.map((x) => [x.id, x]));
  const next = new Map(after.obligations.map((x) => [x.id, x]));
  const dispositions = new Map((options.dispositions ?? []).map((x) => [x.id, x]));

  for (const [id, obligation] of prior) {
    const carried = next.get(id);
    if (!carried) {
      const disposition = dispositions.get(id);
      if (!disposition || !['discharged', 'terminal_superseded'].includes(disposition.kind)) {
        return fail('obligation_dropped_without_discharge', { id });
      }
      if (disposition.kind === 'terminal_superseded') {
        return fail('terminal_supersession_not_allowed_inside_nonterminal_transport', { id });
      }
      continue;
    }
    if (carried.deadlineClock !== obligation.deadlineClock) return fail('obligation_deadline_clock_changed', { id });
    if (carried.responseKey !== obligation.responseKey) return fail('obligation_response_resource_changed', { id });
    const elapsed = ticks.get(obligation.deadlineClock) ?? 0;
    const maximumRemaining = obligation.remaining - elapsed;
    if (maximumRemaining < 0) return fail('obligation_deadline_expired', { id, before: obligation.remaining, elapsed });
    if (carried.remaining > maximumRemaining) {
      return fail('obligation_deadline_regenerated', { id, before: obligation.remaining, after: carried.remaining, elapsed, maximumRemaining });
    }
  }

  for (const id of next.keys()) {
    if (prior.has(id)) continue;
    const disposition = dispositions.get(id);
    if (!disposition || disposition.kind !== 'created') return fail('obligation_created_without_derivation', { id });
  }
  return pass({ ticks: Object.fromEntries([...ticks.entries()].sort()) });
}

export function Verify_claim_interface_preservation(before, after) {
  const fields = ['claimId', 'sideToMove', 'claimInterfaceKey', 'phaseKey', 'supportOrderingKey', 'responseResourcesKey'];
  for (const field of fields) {
    if (before[field] !== after[field]) return fail('claim_interface_changed', { field, before: before[field], after: after[field] });
  }
  return pass({ preservedFields: fields });
}

export function Verify_neutral_pair_transport({ before, after, events, dispositions = [] }) {
  if (!before || !after) throw new TypeError('before/after transport snapshots required');
  if (!Array.isArray(events) || events.length !== 2) return fail('neutral_pair_requires_exactly_two_events');
  let ticks;
  try { ticks = normalizeClockTicks(events); } catch (error) { return fail('event_guard_failed', { message: error.message }); }
  const iface = Verify_claim_interface_preservation(before, after);
  if (!iface.ok) return iface;
  const obligations = Verify_obligation_conservation(before, after, events, { dispositions });
  if (!obligations.ok) return obligations;
  if (!lexLess(after.progressRank, before.progressRank)) {
    return fail('well_founded_resource_did_not_strictly_decrease', { before: before.progressRank, after: after.progressRank });
  }
  return pass({
    kind: 'guarded-neutral-pair-transport-certificate-v1',
    claimId: before.claimId,
    clockTicks: Object.fromEntries([...ticks.entries()].sort()),
    progress: { before: before.progressRank, after: after.progressRank },
    denials: Object.freeze([
      'no_full_state_equality',
      'no_q_equality',
      'no_player_renaming',
      'no_implicit_frame_rule',
      'no_later_strategy_equivalence',
    ]),
  });
}

export function Verify_guarded_interchange({ start, left, right }) {
  if (!start || !left?.finish || !right?.finish) throw new TypeError('start and both path finishes required');
  for (const path of [left, right]) {
    try { normalizeClockTicks(path.events ?? []); } catch (error) { return fail('interchange_path_guard_failed', { path: path.name ?? null, message: error.message }); }
    const iface = Verify_claim_interface_preservation(start, path.start ?? start);
    if (!iface.ok) return fail('interchange_start_mismatch', { path: path.name ?? null, detail: iface });
  }
  const finish = Verify_claim_interface_preservation(left.finish, right.finish);
  if (!finish.ok) return fail('interchange_finish_contract_mismatch', { detail: finish });
  if (canonical(left.finish.obligations) !== canonical(right.finish.obligations)) return fail('interchange_finish_obligation_mismatch');
  if (canonical(left.finish.progressRank) !== canonical(right.finish.progressRank)) return fail('interchange_finish_resource_mismatch');
  return pass({ kind: 'guarded-interchange-certificate-v1' });
}

const VERSION = 2;

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
    if (!Number.isSafeInteger(item.remaining) || item.remaining <= 0) {
      throw new TypeError(`obligations[${index}].remaining must be a positive safe integer for a live obligation`);
    }
    return Object.freeze({ id, deadlineClock, remaining: item.remaining, responseKey: canonical(item.response ?? null) });
  }).sort((a, b) => a.id.localeCompare(b.id)));
}
function normalizeCreatedObligation(item, where) {
  if (!item || typeof item !== 'object') throw new TypeError(`${where} must be an object`);
  const [normalized] = normalizeObligations([item]);
  return normalized;
}
function normalizeEventTrace(events = []) {
  if (!Array.isArray(events)) throw new TypeError('events must be an array');
  const totals = new Map();
  const ids = new Set();
  const discharges = new Map();
  const creates = new Map();
  const eventById = new Map();
  for (const [index, event] of events.entries()) {
    if (!event || typeof event !== 'object') throw new TypeError(`events[${index}] must be an object`);
    const eventId = requireString(event.id, `events[${index}].id`);
    if (ids.has(eventId)) throw new Error(`duplicate transport event id ${eventId}`);
    ids.add(eventId);
    if (event.legal !== true) throw new Error(`transport event ${eventId} is not certified legal`);
    if (event.terminal === true) throw new Error(`transport event ${eventId} crosses a terminal boundary`);
    const ticks = event.clockTicks ?? {};
    if (!ticks || typeof ticks !== 'object' || Array.isArray(ticks)) throw new TypeError(`events[${index}].clockTicks must be an object`);
    for (const [clock, amount] of Object.entries(ticks)) {
      requireString(clock, 'clock name');
      if (!Number.isSafeInteger(amount) || amount < 0) throw new TypeError(`clock tick ${clock} must be a nonnegative safe integer`);
      totals.set(clock, (totals.get(clock) ?? 0) + amount);
    }
    const eventDischarges = event.discharges ?? [];
    if (!Array.isArray(eventDischarges)) throw new TypeError(`events[${index}].discharges must be an array`);
    for (const obligationId of eventDischarges) {
      requireString(obligationId, `events[${index}].discharges[]`);
      if (discharges.has(obligationId)) throw new Error(`obligation ${obligationId} discharged by multiple transport events`);
      discharges.set(obligationId, eventId);
    }
    const eventCreates = event.creates ?? [];
    if (!Array.isArray(eventCreates)) throw new TypeError(`events[${index}].creates must be an array`);
    for (const [createIndex, created] of eventCreates.entries()) {
      const obligation = normalizeCreatedObligation(created, `events[${index}].creates[${createIndex}]`);
      if (creates.has(obligation.id)) throw new Error(`obligation ${obligation.id} created by multiple transport events`);
      creates.set(obligation.id, { eventId, obligation });
    }
    eventById.set(eventId, event);
  }
  return { totals, discharges, creates, eventById };
}
function normalizeClockTicks(events = []) { return normalizeEventTrace(events).totals; }

export function Export_transport_snapshot(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') throw new TypeError('transport snapshot descriptor required');
  return Object.freeze({
    kind: 'guarded-braid-transport-snapshot-v2',
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
function normalizeDispositions(items = []) {
  if (!Array.isArray(items)) throw new TypeError('dispositions must be an array');
  const out = new Map();
  for (const [index, disposition] of items.entries()) {
    if (!disposition || typeof disposition !== 'object') throw new TypeError(`dispositions[${index}] must be an object`);
    const id = requireString(disposition.id, `dispositions[${index}].id`);
    if (out.has(id)) throw new Error(`duplicate disposition ${id}`);
    out.set(id, disposition);
  }
  return out;
}

export function Verify_obligation_conservation(before, after, events, options = {}) {
  let trace;
  try { trace = normalizeEventTrace(events); } catch (error) { return fail('event_guard_failed', { message: error.message }); }
  let dispositions;
  try { dispositions = normalizeDispositions(options.dispositions ?? []); } catch (error) { return fail('disposition_guard_failed', { message: error.message }); }
  const prior = new Map(before.obligations.map((x) => [x.id, x]));
  const next = new Map(after.obligations.map((x) => [x.id, x]));
  const consumedDischarges = new Set();
  const consumedCreates = new Set();

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
      const eventId = typeof disposition.eventId === 'string' ? disposition.eventId : null;
      if (!eventId || trace.discharges.get(id) !== eventId) {
        return fail('obligation_discharge_not_event_certified', { id, eventId, certifiedEventId: trace.discharges.get(id) ?? null });
      }
      consumedDischarges.add(id);
      continue;
    }
    if (dispositions.has(id)) return fail('carried_obligation_has_disposition', { id, disposition: dispositions.get(id) });
    if (carried.deadlineClock !== obligation.deadlineClock) return fail('obligation_deadline_clock_changed', { id });
    if (carried.responseKey !== obligation.responseKey) return fail('obligation_response_resource_changed', { id });
    const elapsed = trace.totals.get(obligation.deadlineClock) ?? 0;
    const maximumRemaining = obligation.remaining - elapsed;
    if (carried.remaining > maximumRemaining) {
      return fail('obligation_deadline_regenerated', { id, before: obligation.remaining, after: carried.remaining, elapsed, maximumRemaining: Math.max(0, maximumRemaining) });
    }
    if (maximumRemaining <= 0) {
      return fail('obligation_deadline_expired', { id, before: obligation.remaining, elapsed, maximumRemaining: Math.max(0, maximumRemaining) });
    }
  }

  for (const [id, obligation] of next) {
    if (prior.has(id)) continue;
    const disposition = dispositions.get(id);
    if (!disposition || disposition.kind !== 'created') return fail('obligation_created_without_derivation', { id });
    const eventId = typeof disposition.eventId === 'string' ? disposition.eventId : null;
    const certified = trace.creates.get(id);
    if (!eventId || !certified || certified.eventId !== eventId || canonical(certified.obligation) !== canonical(obligation)) {
      return fail('obligation_creation_not_event_certified', {
        id, eventId, certifiedEventId: certified?.eventId ?? null,
        certifiedObligation: certified?.obligation ?? null, afterObligation: obligation,
      });
    }
    consumedCreates.add(id);
  }

  for (const [id, eventId] of trace.discharges) {
    if (!consumedDischarges.has(id)) return fail('unaccounted_discharge_effect', { id, eventId });
  }
  for (const [id, certified] of trace.creates) {
    if (!consumedCreates.has(id)) return fail('unaccounted_creation_effect', { id, eventId: certified.eventId });
  }
  return pass({ ticks: Object.fromEntries([...trace.totals.entries()].sort()) });
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
    kind: 'guarded-neutral-pair-transport-certificate-v2',
    claimId: before.claimId,
    clockTicks: Object.fromEntries([...ticks.entries()].sort()),
    progress: { before: before.progressRank, after: after.progressRank },
    obligationEffects: Object.freeze(dispositions.map((x) => Object.freeze({ ...x }))),
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
    const pathStart = path.start ?? start;
    try { normalizeEventTrace(path.events ?? []); } catch (error) {
      return fail('interchange_path_guard_failed', { path: path.name ?? null, message: error.message });
    }
    const iface = Verify_claim_interface_preservation(start, pathStart);
    if (!iface.ok) return fail('interchange_start_mismatch', { path: path.name ?? null, detail: iface });
    const obligations = Verify_obligation_conservation(pathStart, path.finish, path.events ?? [], { dispositions: path.dispositions ?? [] });
    if (!obligations.ok) return fail('interchange_path_transport_failed', { path: path.name ?? null, detail: obligations });
  }
  const finish = Verify_claim_interface_preservation(left.finish, right.finish);
  if (!finish.ok) return fail('interchange_finish_contract_mismatch', { detail: finish });
  if (canonical(left.finish.obligations) !== canonical(right.finish.obligations)) return fail('interchange_finish_obligation_mismatch');
  if (canonical(left.finish.progressRank) !== canonical(right.finish.progressRank)) return fail('interchange_finish_resource_mismatch');
  return pass({ kind: 'guarded-interchange-certificate-v2' });
}

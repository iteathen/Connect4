// Guarded claim-relative theorem composition substrate.
// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const REF = '$ref';
const FACT_GROUPS = ['preconditions', 'conclusions'];

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isObject(value)) return value;
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = stableValue(value[key]);
  return out;
}
function stableStringify(value) { return JSON.stringify(stableValue(value)); }
function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
function ref(id) { return { [REF]: id }; }
function isRef(value) { return isObject(value) && Object.keys(value).length === 1 && typeof value[REF] === 'string'; }

function assertTerm(term, variables, where) {
  if (isRef(term)) {
    if (!variables.has(term[REF])) throw new Error(`${where}: undeclared variable ${term[REF]}`);
    return;
  }
  if (term === null || ['string', 'number', 'boolean'].includes(typeof term)) return;
  throw new TypeError(`${where}: fact args must be primitive literals or {$ref}`);
}
function assertFact(fact, variables, where) {
  if (!isObject(fact)) throw new TypeError(`${where}: fact must be object`);
  if (typeof fact.layer !== 'string' || !fact.layer) throw new TypeError(`${where}: fact.layer required`);
  if (typeof fact.predicate !== 'string' || !fact.predicate) throw new TypeError(`${where}: fact.predicate required`);
  if (!Array.isArray(fact.args)) throw new TypeError(`${where}: fact.args must be array`);
  fact.args.forEach((term, i) => assertTerm(term, variables, `${where}.args[${i}]`));
}
function normalizeSection(section, variables, name) {
  const value = section ?? {};
  if (!isObject(value)) throw new TypeError(`${name} must be object`);
  const out = {};
  for (const group of FACT_GROUPS) {
    const facts = value[group] ?? [];
    if (!Array.isArray(facts)) throw new TypeError(`${name}.${group} must be array`);
    facts.forEach((fact, i) => assertFact(fact, variables, `${name}.${group}[${i}]`));
    out[group] = facts.map(clone);
  }
  return out;
}
function normalizeTerminal(terminal) {
  const value = terminal ?? {};
  const accepts = value.accepts ?? ['continue'];
  const emits = value.emits ?? ['continue'];
  const closes = value.closes ?? [];
  for (const [name, list] of Object.entries({ accepts, emits, closes })) {
    if (!Array.isArray(list) || list.some((x) => typeof x !== 'string' || !x)) throw new TypeError(`terminal.${name} must be string array`);
  }
  const emitSet = new Set(emits);
  for (const closed of closes) if (!emitSet.has(closed)) throw new Error(`terminal.closes contains non-emitted alternative ${closed}`);
  return { accepts: [...new Set(accepts)].sort(), emits: [...new Set(emits)].sort(), closes: [...new Set(closes)].sort() };
}
function normalizeProvenance(provenance, variables) {
  const value = provenance ?? {};
  const mode = value.mode ?? 'unobserved';
  if (!['unobserved', 'value-only', 'observable'].includes(mode)) throw new Error(`unsupported provenance mode ${mode}`);
  return { mode, ...normalizeSection(value, variables, 'provenance') };
}

/** Validate and freeze a typed theorem pre/post contract. */
export function Export_typed_theorem_contract(descriptor) {
  if (!isObject(descriptor)) throw new TypeError('theorem contract must be object');
  if (typeof descriptor.id !== 'string' || !descriptor.id) throw new TypeError('contract.id required');
  if (typeof descriptor.claimId !== 'string' || !descriptor.claimId) throw new TypeError('contract.claimId required');
  const variables = descriptor.variables ?? [];
  if (!Array.isArray(variables)) throw new TypeError('contract.variables must be array');
  const variableMap = new Map();
  for (const variable of variables) {
    if (!isObject(variable) || typeof variable.id !== 'string' || !variable.id || typeof variable.type !== 'string' || !variable.type) {
      throw new TypeError('variables require id and type');
    }
    if (variableMap.has(variable.id)) throw new Error(`duplicate variable ${variable.id}`);
    variableMap.set(variable.id, variable);
  }
  const core = normalizeSection(descriptor, variableMap, 'contract');
  const frame = normalizeSection(descriptor.frame, variableMap, 'frame');
  const temporalResource = normalizeSection(descriptor.temporalResource, variableMap, 'temporalResource');
  const provenance = normalizeProvenance(descriptor.provenance, variableMap);
  const terminal = normalizeTerminal(descriptor.terminal);
  return Object.freeze({
    id: descriptor.id,
    claimId: descriptor.claimId,
    authority: clone(descriptor.authority ?? null),
    variables: Object.freeze(variables.map((v) => Object.freeze(clone(v)))),
    preconditions: Object.freeze(core.preconditions),
    conclusions: Object.freeze(core.conclusions),
    frame: Object.freeze({ preconditions: Object.freeze(frame.preconditions), conclusions: Object.freeze(frame.conclusions) }),
    temporalResource: Object.freeze({ preconditions: Object.freeze(temporalResource.preconditions), conclusions: Object.freeze(temporalResource.conclusions) }),
    terminal: Object.freeze({ accepts: Object.freeze(terminal.accepts), emits: Object.freeze(terminal.emits), closes: Object.freeze(terminal.closes) }),
    provenance: Object.freeze({ mode: provenance.mode, preconditions: Object.freeze(provenance.preconditions), conclusions: Object.freeze(provenance.conclusions) }),
    metadata: Object.freeze(clone(descriptor.metadata ?? {})),
  });
}

function variableMap(contract) { return new Map(contract.variables.map((v) => [v.id, v])); }
function termType(term, vars) {
  return isRef(term) ? vars.get(term[REF])?.type ?? null : `literal:${typeof term}`;
}
function concreteOf(term, vars) {
  if (!isRef(term)) return term;
  return vars.get(term[REF])?.concrete ?? undefined;
}
function termKey(term, vars) {
  if (!isRef(term)) return `lit:${stableStringify(term)}`;
  const variable = vars.get(term[REF]);
  return `var:${variable?.type}:${stableStringify(variable?.concrete ?? null)}`;
}
function compatibleTerms(providerTerm, providerVars, consumerTerm, consumerVars, bindings) {
  if (!isRef(consumerTerm)) {
    const concrete = concreteOf(providerTerm, providerVars);
    return concrete !== undefined ? Object.is(concrete, consumerTerm) : (!isRef(providerTerm) && Object.is(providerTerm, consumerTerm));
  }
  const consumerVar = consumerVars.get(consumerTerm[REF]);
  const providerType = termType(providerTerm, providerVars);
  if (isRef(providerTerm)) {
    const providerVar = providerVars.get(providerTerm[REF]);
    if (!providerVar || providerVar.type !== consumerVar.type) return false;
    if (consumerVar.concrete !== undefined && providerVar.concrete !== undefined && !Object.is(consumerVar.concrete, providerVar.concrete)) return false;
  } else if (consumerVar.type !== providerType && consumerVar.type !== 'literal') {
    return false;
  }
  if (consumerVar.concrete !== undefined) {
    const concrete = concreteOf(providerTerm, providerVars);
    if (concrete === undefined || !Object.is(concrete, consumerVar.concrete)) return false;
  }
  const current = bindings.get(consumerTerm[REF]);
  const candidate = termKey(providerTerm, providerVars);
  if (current !== undefined && current !== candidate) return false;
  bindings.set(consumerTerm[REF], candidate);
  return true;
}
function sameFactHead(provider, consumer) {
  return provider.layer === consumer.layer && provider.predicate === consumer.predicate && stableStringify(provider.value ?? null) === stableStringify(consumer.value ?? null) && provider.args.length === consumer.args.length;
}
function matchFact(provider, providerVars, consumer, consumerVars, bindings) {
  if (!sameFactHead(provider, consumer)) return false;
  const trial = new Map(bindings);
  for (let i = 0; i < provider.args.length; i++) {
    if (!compatibleTerms(provider.args[i], providerVars, consumer.args[i], consumerVars, trial)) return false;
  }
  bindings.clear();
  for (const [k, v] of trial) bindings.set(k, v);
  return true;
}
function firstSeparator(providers, providerVars, premise, consumerVars) {
  const samePredicate = providers.filter((fact) => fact.layer === premise.layer && fact.predicate === premise.predicate);
  if (samePredicate.length === 0) return { kind: 'missing_predicate', premise: clone(premise) };
  for (const candidate of samePredicate) {
    if (candidate.args.length !== premise.args.length) return { kind: 'arity', premise: clone(premise), candidate: clone(candidate) };
    if (stableStringify(candidate.value ?? null) !== stableStringify(premise.value ?? null)) return { kind: 'value', premise: clone(premise), candidate: clone(candidate) };
    for (let i = 0; i < premise.args.length; i++) {
      const pt = termType(candidate.args[i], providerVars);
      const ct = termType(premise.args[i], consumerVars);
      if (isRef(candidate.args[i]) && isRef(premise.args[i]) && pt !== ct) return { kind: 'type', arg: i, providerType: pt, consumerType: ct };
      const pc = concreteOf(candidate.args[i], providerVars), cc = concreteOf(premise.args[i], consumerVars);
      if (pc !== undefined && cc !== undefined && !Object.is(pc, cc)) return { kind: 'concrete_binding', arg: i, provider: pc, consumer: cc };
    }
  }
  return { kind: 'incompatible_binding', premise: clone(premise), candidates: samePredicate.map(clone) };
}
function unifyFactSets(providerContract, providerFacts, consumerContract, consumerFacts) {
  const providerVars = variableMap(providerContract), consumerVars = variableMap(consumerContract);
  const used = new Set();
  const bindings = new Map();
  const discharged = [];
  function visit(index) {
    if (index === consumerFacts.length) return true;
    const premise = consumerFacts[index];
    for (let i = 0; i < providerFacts.length; i++) {
      if (used.has(i)) continue;
      const before = new Map(bindings);
      if (!matchFact(providerFacts[i], providerVars, premise, consumerVars, bindings)) continue;
      used.add(i); discharged.push({ premiseIndex: index, conclusionIndex: i });
      if (visit(index + 1)) return true;
      discharged.pop(); used.delete(i); bindings.clear(); for (const [k, v] of before) bindings.set(k, v);
    }
    return false;
  }
  const ok = visit(0);
  if (!ok) {
    for (const premise of consumerFacts) {
      const individuallyMatchable = providerFacts.some((candidate) => matchFact(candidate, providerVars, premise, consumerVars, new Map()));
      if (!individuallyMatchable) {
        return Object.freeze({ ok: false, separator: firstSeparator(providerFacts, providerVars, premise, consumerVars) });
      }
    }
    return Object.freeze({ ok: false, separator: Object.freeze({ kind: 'joint_binding_conflict', premises: consumerFacts.map(clone) }) });
  }
  return Object.freeze({ ok: true, binding: Object.freeze(Object.fromEntries(bindings)), discharged: Object.freeze(discharged.map(Object.freeze)) });
}

/** Prove that upstream theorem conclusions discharge downstream ordinary premises. */
export function Unify_conclusion_with_premise(upstream, downstream) {
  return unifyFactSets(upstream, upstream.conclusions, downstream, downstream.preconditions);
}
/** Prove that the opaque/load-bearing frame observed downstream is explicitly provided upstream. */
export function Verify_opaque_frame_condition(upstream, downstream) {
  return unifyFactSets(upstream, upstream.frame.conclusions, downstream, downstream.frame.preconditions);
}
/** Prove temporal, deadline, resource, and turn-state compatibility. */
export function Verify_temporal_resource_compatibility(upstream, downstream) {
  return unifyFactSets(upstream, upstream.temporalResource.conclusions, downstream, downstream.temporalResource.preconditions);
}
/** Ensure no live terminal alternative disappears between theorem contracts. */
export function Verify_terminal_complete_composition(upstream, downstream) {
  const closed = new Set(upstream.terminal.closes);
  const accepted = new Set(downstream.terminal.accepts);
  const live = upstream.terminal.emits.filter((alternative) => !closed.has(alternative));
  const missing = live.filter((alternative) => !accepted.has(alternative));
  return Object.freeze(missing.length === 0
    ? { ok: true, liveAlternatives: Object.freeze(live), closedAlternatives: Object.freeze([...closed]) }
    : { ok: false, separator: Object.freeze({ kind: 'unhandled_terminal_alternative', alternatives: Object.freeze(missing) }) });
}
function Verify_provenance_compatibility(upstream, downstream) {
  if (downstream.provenance.mode === 'observable' && upstream.provenance.mode !== 'observable') {
    return Object.freeze({ ok: false, separator: Object.freeze({ kind: 'provenance_not_available', upstreamMode: upstream.provenance.mode, downstreamMode: downstream.provenance.mode }) });
  }
  return unifyFactSets(upstream, upstream.provenance.conclusions, downstream, downstream.provenance.preconditions);
}

function adjacencyCertificate(upstream, downstream) {
  const premise = Unify_conclusion_with_premise(upstream, downstream);
  if (!premise.ok) return { ok: false, stage: 'premise', separator: premise.separator };
  const frame = Verify_opaque_frame_condition(upstream, downstream);
  if (!frame.ok) return { ok: false, stage: 'frame', separator: frame.separator };
  const temporalResource = Verify_temporal_resource_compatibility(upstream, downstream);
  if (!temporalResource.ok) return { ok: false, stage: 'temporal_resource', separator: temporalResource.separator };
  const terminal = Verify_terminal_complete_composition(upstream, downstream);
  if (!terminal.ok) return { ok: false, stage: 'terminal', separator: terminal.separator };
  const provenance = Verify_provenance_compatibility(upstream, downstream);
  if (!provenance.ok) return { ok: false, stage: 'provenance', separator: provenance.separator };
  return Object.freeze({ ok: true, upstream: upstream.id, downstream: downstream.id, premise, frame, temporalResource, terminal, provenance });
}

/** Compose an ordered theorem chain. No state equality or implicit frame preservation is inferred. */
export function Compose_theorem_chain(contracts) {
  if (!Array.isArray(contracts) || contracts.length < 2) throw new TypeError('Compose_theorem_chain requires at least two contracts');
  const chain = contracts.map((contract) => Export_typed_theorem_contract(contract));
  const links = [];
  for (let i = 0; i + 1 < chain.length; i++) {
    const link = adjacencyCertificate(chain[i], chain[i + 1]);
    if (!link.ok) {
      return Object.freeze({ ok: false, failedLink: i, upstream: chain[i].id, downstream: chain[i + 1].id, stage: link.stage, separator: Object.freeze(clone(link.separator)) });
    }
    links.push(link);
  }
  return Object.freeze({
    ok: true,
    theoremIds: Object.freeze(chain.map((x) => x.id)),
    links: Object.freeze(links),
    certificate: Object.freeze({
      claimBoundary: 'composition of declared typed theorem contracts only',
      stateEqualityImplied: false,
      qEqualityImplied: false,
      provenanceImpliedBeyondContracts: false,
      laterStrategyImplied: false,
    }),
  });
}

export const GuardedCompositionTerms = Object.freeze({ ref });

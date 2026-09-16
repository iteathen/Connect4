// Claim-relative typed-event theorem reuse substrate.
// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const ALLOWED_LAYERS = new Set(['E', 'P', 'R', 'C', 'N', 'terminal', 'provenance', 'claim']);
const REF_KEY = '$ref';
const DEFAULT_MAX_PERMUTATIONS = 100_000;

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

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function factorial(n) {
  let out = 1;
  for (let i = 2; i <= n; i++) out *= i;
  return out;
}

function* permutations(values) {
  if (values.length < 2) {
    yield values.slice();
    return;
  }
  const a = values.slice();
  function* visit(k) {
    if (k === a.length) {
      yield a.slice();
      return;
    }
    for (let i = k; i < a.length; i++) {
      [a[k], a[i]] = [a[i], a[k]];
      yield* visit(k + 1);
      [a[k], a[i]] = [a[i], a[k]];
    }
  }
  yield* visit(0);
}

function collectRefs(value, out = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, out);
    return out;
  }
  if (!isObject(value)) return out;
  if (Object.keys(value).length === 1 && typeof value[REF_KEY] === 'string') {
    out.add(value[REF_KEY]);
    return out;
  }
  for (const item of Object.values(value)) collectRefs(item, out);
  return out;
}

function rewriteRefs(value, refMapper) {
  if (Array.isArray(value)) return value.map((item) => rewriteRefs(item, refMapper));
  if (!isObject(value)) return value;
  if (Object.keys(value).length === 1 && typeof value[REF_KEY] === 'string') return refMapper(value[REF_KEY]);
  const out = {};
  for (const [key, item] of Object.entries(value)) out[key] = rewriteRefs(item, refMapper);
  return out;
}

function assertEventModel(event) {
  if (!isObject(event)) throw new TypeError('event must be an object');
  if (!Array.isArray(event.nodes) || !Array.isArray(event.edges) || !Array.isArray(event.variables)) {
    throw new TypeError('event requires nodes, edges, and variables arrays');
  }
  const nodeIds = new Set();
  for (const node of event.nodes) {
    if (!isObject(node) || typeof node.id !== 'string' || node.id.length === 0) throw new TypeError('node.id must be non-empty string');
    if (nodeIds.has(node.id)) throw new Error(`duplicate node id ${node.id}`);
    if (!ALLOWED_LAYERS.has(node.layer)) throw new Error(`unsupported semantic layer ${node.layer}`);
    if (typeof node.kind !== 'string' || node.kind.length === 0) throw new TypeError(`node ${node.id} requires kind`);
    nodeIds.add(node.id);
  }
  const variableIds = new Set();
  for (const variable of event.variables) {
    if (!isObject(variable) || typeof variable.id !== 'string' || variable.id.length === 0) throw new TypeError('variable.id must be non-empty string');
    if (variableIds.has(variable.id)) throw new Error(`duplicate variable id ${variable.id}`);
    if (typeof variable.type !== 'string' || variable.type.length === 0) throw new TypeError(`variable ${variable.id} requires type`);
    variableIds.add(variable.id);
  }
  for (const edge of event.edges) {
    if (!isObject(edge) || !nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new Error('edge endpoints must name existing nodes');
    if (typeof edge.role !== 'string' || edge.role.length === 0) throw new TypeError('edge.role must be non-empty string');
  }
  const usedRefs = new Set();
  for (const node of event.nodes) collectRefs(node.attrs ?? {}, usedRefs);
  for (const edge of event.edges) collectRefs(edge.attrs ?? {}, usedRefs);
  for (const id of usedRefs) if (!variableIds.has(id)) throw new Error(`undeclared typed variable reference ${id}`);
  return { nodeIds, variableIds };
}

function normalizeObservations(claim, context, event) {
  if (!isObject(claim) || typeof claim.id !== 'string' || claim.id.length === 0) throw new TypeError('claim.id must be non-empty string');
  const observations = typeof claim.observations === 'function'
    ? claim.observations({ context, event })
    : claim.observations;
  if (!Array.isArray(observations) || observations.length === 0) throw new TypeError(`claim ${claim.id} requires observations`);
  return observations.map((item) => {
    if (!isObject(item) || typeof item.role !== 'string' || typeof item.node !== 'string') {
      throw new TypeError('claim observations require role and node strings');
    }
    return { role: item.role, node: item.node };
  });
}

/**
 * Return the exact backward dependency slice needed by a claim observation.
 * Edges are directed prerequisite -> consequence.
 */
export function DependencyCone_of_claim(claim, context, event) {
  const { nodeIds } = assertEventModel(event);
  const observations = normalizeObservations(claim, context, event);
  for (const observation of observations) {
    if (!nodeIds.has(observation.node)) throw new Error(`observation root ${observation.node} not present in event graph`);
  }

  const incoming = new Map(event.nodes.map((node) => [node.id, []]));
  for (const edge of event.edges) incoming.get(edge.to).push(edge);
  const live = new Set(observations.map((x) => x.node));
  const stack = [...live];
  while (stack.length) {
    const id = stack.pop();
    for (const edge of incoming.get(id)) {
      if (!live.has(edge.from)) {
        live.add(edge.from);
        stack.push(edge.from);
      }
    }
  }

  const nodes = event.nodes.filter((node) => live.has(node.id)).map(clone);
  const edges = event.edges.filter((edge) => live.has(edge.from) && live.has(edge.to)).map(clone);
  const usedVariables = new Set();
  for (const node of nodes) collectRefs(node.attrs ?? {}, usedVariables);
  for (const edge of edges) collectRefs(edge.attrs ?? {}, usedVariables);
  const variables = event.variables.filter((variable) => usedVariables.has(variable.id)).map(clone);

  return Object.freeze({
    claimId: claim.id,
    eventId: event.id ?? null,
    observations: observations.map(clone),
    nodes,
    edges,
    variables,
    opaqueNonincidentContext: clone(context?.opaqueNonincident ?? null),
  });
}

function variableSkeleton(variable) {
  return stableStringify({ type: variable.type, attrs: variable.attrs ?? {} });
}

function refTypeSkeleton(value, variableById) {
  return rewriteRefs(value, (id) => {
    const variable = variableById.get(id);
    if (!variable) throw new Error(`unknown variable ${id}`);
    return { $type: variable.type, attrs: variable.attrs ?? {} };
  });
}

function observationRoles(cone) {
  const roles = new Map(cone.nodes.map((node) => [node.id, []]));
  for (const observation of cone.observations) roles.get(observation.node).push(observation.role);
  for (const values of roles.values()) values.sort();
  return roles;
}

function refinedNodePartitions(cone) {
  const variableById = new Map(cone.variables.map((v) => [v.id, v]));
  const roles = observationRoles(cone);
  const base = new Map();
  for (const node of cone.nodes) {
    base.set(node.id, stableStringify({
      layer: node.layer,
      kind: node.kind,
      attrs: refTypeSkeleton(node.attrs ?? {}, variableById),
      observationRoles: roles.get(node.id),
    }));
  }
  const baseUnique = [...new Set(base.values())].sort();
  const basePalette = new Map(baseUnique.map((value, index) => [value, `c${index}`]));
  let colors = new Map([...base].map(([id, signature]) => [id, basePalette.get(signature)]));
  for (;;) {
    const signatures = new Map();
    for (const node of cone.nodes) {
      const incoming = cone.edges
        .filter((edge) => edge.to === node.id)
        .map((edge) => [edge.role, stableValue(refTypeSkeleton(edge.attrs ?? {}, variableById)), colors.get(edge.from)])
        .sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)));
      const outgoing = cone.edges
        .filter((edge) => edge.from === node.id)
        .map((edge) => [edge.role, stableValue(refTypeSkeleton(edge.attrs ?? {}, variableById)), colors.get(edge.to)])
        .sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)));
      signatures.set(node.id, stableStringify({ base: base.get(node.id), incoming, outgoing }));
    }
    const unique = [...new Set(signatures.values())].sort();
    const palette = new Map(unique.map((value, index) => [value, `c${index}`]));
    const next = new Map([...signatures].map(([id, signature]) => [id, palette.get(signature)]));
    let samePartition = true;
    for (let i = 0; i < cone.nodes.length && samePartition; i++) {
      for (let j = i + 1; j < cone.nodes.length; j++) {
        const beforeSame = colors.get(cone.nodes[i].id) === colors.get(cone.nodes[j].id);
        const afterSame = next.get(cone.nodes[i].id) === next.get(cone.nodes[j].id);
        if (beforeSame !== afterSame) { samePartition = false; break; }
      }
    }
    colors = next;
    if (samePartition) break;
  }
  const groups = new Map();
  for (const node of cone.nodes) {
    const color = colors.get(node.id);
    if (!groups.has(color)) groups.set(color, []);
    groups.get(color).push(node.id);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, ids]) => ({ key, ids: ids.sort() }));
}

function variablePartitions(cone) {
  const groups = new Map();
  for (const variable of cone.variables) {
    const key = variableSkeleton(variable);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(variable.id);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, ids]) => ({ key, ids: ids.sort() }));
}

function partitionPermutationCount(partitions) {
  return partitions.reduce((total, partition) => total * factorial(partition.ids.length), 1);
}

function* mappingsForPartitions(partitions, prefix, startIndex = 0, at = 0, current = new Map()) {
  if (at === partitions.length) {
    yield new Map(current);
    return;
  }
  let offset = startIndex;
  for (let i = 0; i < at; i++) offset += partitions[i].ids.length;
  const ids = partitions[at].ids;
  for (const ordering of permutations(ids)) {
    for (let i = 0; i < ordering.length; i++) current.set(ordering[i], `${prefix}${offset + i}`);
    yield* mappingsForPartitions(partitions, prefix, startIndex, at + 1, current);
    for (const id of ordering) current.delete(id);
  }
}

function serializeUnderMapping(cone, nodeMap, variableMap) {
  const rewrite = (value) => rewriteRefs(value, (id) => ({ $ref: variableMap.get(id) }));
  const nodeById = new Map(cone.nodes.map((node) => [node.id, node]));
  const variables = cone.variables
    .map((variable) => ({
      id: variableMap.get(variable.id),
      type: variable.type,
      attrs: stableValue(variable.attrs ?? {}),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const nodes = [...nodeMap.entries()]
    .map(([oldId, newId]) => {
      const node = nodeById.get(oldId);
      return {
        id: newId,
        layer: node.layer,
        kind: node.kind,
        attrs: stableValue(rewrite(node.attrs ?? {})),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  const edges = cone.edges
    .map((edge) => ({
      from: nodeMap.get(edge.from),
      to: nodeMap.get(edge.to),
      role: edge.role,
      attrs: stableValue(rewrite(edge.attrs ?? {})),
    }))
    .sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)));
  const observations = cone.observations
    .map((observation) => ({ role: observation.role, node: nodeMap.get(observation.node) }))
    .sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)));
  return stableValue({ claimId: cone.claimId, observations, variables, nodes, edges });
}

/**
 * Exact canonicalization under structure-preserving node and typed-variable renaming.
 * Concrete variable bindings and opaque nonincident context are intentionally absent
 * from the canonical key.
 */
export function Canonicalize_typed_cone(cone, options = {}) {
  if (!isObject(cone) || typeof cone.claimId !== 'string') throw new TypeError('invalid dependency cone');
  const nodePartitions = refinedNodePartitions(cone);
  const variablePartitionsList = variablePartitions(cone);
  const permutationCount = partitionPermutationCount(nodePartitions) * partitionPermutationCount(variablePartitionsList);
  const maxPermutations = options.maxPermutations ?? DEFAULT_MAX_PERMUTATIONS;
  if (!Number.isSafeInteger(maxPermutations) || maxPermutations < 1) throw new RangeError('maxPermutations must be a positive safe integer');
  if (permutationCount > maxPermutations) {
    throw new RangeError(`typed-cone canonicalization requires ${permutationCount} permutations; limit is ${maxPermutations}`);
  }

  let bestKey = null;
  let bestCanonical = null;
  let bestNodeMap = null;
  let bestVariableMap = null;
  for (const variableMap of mappingsForPartitions(variablePartitionsList, 'v')) {
    for (const nodeMap of mappingsForPartitions(nodePartitions, 'n')) {
      const canonical = serializeUnderMapping(cone, nodeMap, variableMap);
      const key = stableStringify(canonical);
      if (bestKey === null || key < bestKey) {
        bestKey = key;
        bestCanonical = canonical;
        bestNodeMap = new Map(nodeMap);
        bestVariableMap = new Map(variableMap);
      }
    }
  }

  return Object.freeze({
    claimId: cone.claimId,
    canonicalKey: bestKey,
    canonical: bestCanonical,
    nodeRenaming: Object.freeze(Object.fromEntries(bestNodeMap)),
    variableRenaming: Object.freeze(Object.fromEntries(bestVariableMap)),
    permutationCount,
  });
}

function firstDifference(left, right, path = '$') {
  if (Object.is(left, right)) return null;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return { path, left, right };
    if (left.length !== right.length) return { path: `${path}.length`, left: left.length, right: right.length };
    for (let i = 0; i < left.length; i++) {
      const diff = firstDifference(left[i], right[i], `${path}[${i}]`);
      if (diff) return diff;
    }
    return null;
  }
  if (isObject(left) || isObject(right)) {
    if (!isObject(left) || !isObject(right)) return { path, left, right };
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    for (const key of keys) {
      if (!(key in left) || !(key in right)) return { path: `${path}.${key}`, left: left[key], right: right[key] };
      const diff = firstDifference(left[key], right[key], `${path}.${key}`);
      if (diff) return diff;
    }
    return null;
  }
  return { path, left, right };
}

function inverseRenaming(renaming) {
  return new Map(Object.entries(renaming).map(([oldId, canonicalId]) => [canonicalId, oldId]));
}

function concreteBindings(cone) {
  return new Map(cone.variables.map((variable) => [variable.id, variable.concrete ?? null]));
}

/** Return an explicit isomorphism witness or the first canonical separating field. */
export function Verify_structure_preserving_renaming(leftCone, rightCone, options = {}) {
  const left = Canonicalize_typed_cone(leftCone, options);
  const right = Canonicalize_typed_cone(rightCone, options);
  if (left.canonicalKey !== right.canonicalKey) {
    return Object.freeze({
      isomorphic: false,
      claimId: leftCone.claimId === rightCone.claimId ? leftCone.claimId : null,
      separator: firstDifference(left.canonical, right.canonical),
    });
  }

  const rightNodeInverse = inverseRenaming(right.nodeRenaming);
  const rightVariableInverse = inverseRenaming(right.variableRenaming);
  const leftConcrete = concreteBindings(leftCone);
  const rightConcrete = concreteBindings(rightCone);
  const nodeRenaming = {};
  for (const [oldId, canonicalId] of Object.entries(left.nodeRenaming)) nodeRenaming[oldId] = rightNodeInverse.get(canonicalId);
  const variableRenaming = {};
  const typedBindings = [];
  const rightVariableById = new Map(rightCone.variables.map((v) => [v.id, v]));
  for (const [oldId, canonicalId] of Object.entries(left.variableRenaming)) {
    const targetId = rightVariableInverse.get(canonicalId);
    variableRenaming[oldId] = targetId;
    typedBindings.push({
      fromVariable: oldId,
      toVariable: targetId,
      type: rightVariableById.get(targetId).type,
      fromConcrete: leftConcrete.get(oldId),
      toConcrete: rightConcrete.get(targetId),
    });
  }
  typedBindings.sort((a, b) => a.fromVariable.localeCompare(b.fromVariable));

  return Object.freeze({
    isomorphic: true,
    claimId: leftCone.claimId,
    canonicalKey: left.canonicalKey,
    nodeRenaming: Object.freeze(nodeRenaming),
    variableRenaming: Object.freeze(variableRenaming),
    typedBindings: Object.freeze(typedBindings),
  });
}

export function TypedEventSignature(claim, context, event, options = {}) {
  const cone = DependencyCone_of_claim(claim, context, event);
  const canonical = Canonicalize_typed_cone(cone, options);
  return Object.freeze({
    claimId: cone.claimId,
    eventId: cone.eventId,
    cone,
    canonicalKey: canonical.canonicalKey,
    canonical: canonical.canonical,
    nodeRenaming: canonical.nodeRenaming,
    variableRenaming: canonical.variableRenaming,
    permutationCount: canonical.permutationCount,
    opaqueNonincidentContext: cone.opaqueNonincidentContext,
  });
}

/**
 * Reuse a theorem only for its declared claim. Opaque context survives untouched and
 * the certificate explicitly denies stronger state/output equivalences.
 */
export function Instantiate_theorem_with_opaque_nonincident_context(theorem, exemplarSignature, targetSignature, options = {}) {
  if (!isObject(theorem) || typeof theorem.id !== 'string' || typeof theorem.claimId !== 'string') throw new TypeError('invalid theorem descriptor');
  if (theorem.claimId !== exemplarSignature.claimId || theorem.claimId !== targetSignature.claimId) {
    throw new Error(`theorem ${theorem.id} claim mismatch`);
  }
  const witness = Verify_structure_preserving_renaming(exemplarSignature.cone, targetSignature.cone, options);
  if (!witness.isomorphic) {
    return Object.freeze({ instantiated: false, theoremId: theorem.id, claimId: theorem.claimId, separator: witness.separator });
  }
  return Object.freeze({
    instantiated: true,
    theoremId: theorem.id,
    claimId: theorem.claimId,
    conclusion: theorem.conclusion ?? null,
    renamingWitness: witness,
    opaqueNonincidentContext: clone(targetSignature.opaqueNonincidentContext),
    boundary: Object.freeze({
      theoremReuseOnlyForClaim: true,
      impliesQEquality: false,
      impliesFullSuccessorEquivalence: false,
      impliesProvenanceEquivalence: false,
      impliesLaterStrategyEquivalence: false,
    }),
  });
}

export const TypedRef = Object.freeze({
  of(id) {
    if (typeof id !== 'string' || id.length === 0) throw new TypeError('typed reference id must be non-empty string');
    return Object.freeze({ [REF_KEY]: id });
  },
});

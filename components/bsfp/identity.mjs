import { residualStateKey } from './residual-winspace.mjs';

export const BSFP_IDENTITY = Object.freeze({
  Q: 'Q_ITEM', REPRESENTATION: 'REPRESENTATION_ITEM', PROOF: 'PROOF_ITEM', VALUE: 'VALUE_BOUNDARY_ITEM',
});

// Exact, typed serialization. No digest is authoritative; unsupported values
// are rejected rather than silently omitted/coerced by JSON.stringify.
function canonical(value) {
  if (typeof value === 'bigint') return ['bigint', value.toString()];
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return [typeof value, value];
  if (typeof value === 'number' && Number.isSafeInteger(value)) return ['integer', value];
  if (Array.isArray(value)) {
    if (Reflect.ownKeys(value).length !== value.length + 1) throw new TypeError('identity array must be dense with no extra premises');
    const items = [];
    for (let i = 0; i < value.length; i++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) throw new TypeError('identity cannot evaluate accessor premises');
      items.push(canonical(descriptor.value));
    }
    return ['array', items];
  }
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    const keys = Reflect.ownKeys(value);
    if (keys.some(k => typeof k !== 'string')) throw new TypeError('identity cannot omit symbol premises');
    return ['record', keys.sort().map(k => {
      const descriptor = Object.getOwnPropertyDescriptor(value, k);
      if (!Object.hasOwn(descriptor, 'value')) throw new TypeError('identity cannot evaluate accessor premises');
      return [k, canonical(descriptor.value)];
    })];
  }
  throw new TypeError('identity requires exact finite data');
}

function geometryTuple({ columns, rows, connect }) {
  if (![columns, rows, connect].every(x => Number.isSafeInteger(x) && x > 0)) throw new RangeError('invalid identity geometry');
  return [columns, rows, connect];
}

export function bsfpIdentity(kind, geometry, profile, data) {
  if (!Object.values(BSFP_IDENTITY).includes(kind)) throw new RangeError('unknown BSFP identity domain');
  if (typeof profile !== 'string' || !profile.length) throw new TypeError('identity profile revision is required');
  return Object.freeze({ kind, scope: JSON.stringify([geometryTuple(geometry), profile]),
    exact: JSON.stringify(canonical(data)) });
}

export function gameplayIdentity(geometry, state) {
  // residualStateKey normalizes exact DNF antichains. Geometry is explicit
  // here; the legacy residualStateKey helper is geometry-local, not global.
  return bsfpIdentity(BSFP_IDENTITY.Q, geometry, 'c4-q-v1', residualStateKey(state));
}

export function proofIdentity(q, { revision, requiredPremises }, premises) {
  if (q.kind !== BSFP_IDENTITY.Q) throw new TypeError('ProofKey requires Q_ITEM');
  if (typeof revision !== 'string' || !revision.length || !Array.isArray(requiredPremises)
      || requiredPremises.some(k => typeof k !== 'string') || new Set(requiredPremises).size !== requiredPremises.length) {
    throw new TypeError('proof profile must declare its exact premise schema');
  }
  if (!premises || Object.getPrototypeOf(premises) !== Object.prototype
      || requiredPremises.some(k => !Object.hasOwn(premises, k))) throw new TypeError('missing required proof premise');
  // Retain ALL supplied premises, including any extra deadline/resource fact.
  return Object.freeze({ kind: BSFP_IDENTITY.PROOF, scope: JSON.stringify([q.scope, revision, [...requiredPremises].sort()]),
    exact: JSON.stringify([q.exact, canonical(premises)]) });
}

export function valueBoundaryIdentity(fiber, threshold, polarity, generator) {
  if (![-1, 0, 1].includes(threshold) || !['upper', 'lower'].includes(polarity)) throw new RangeError('invalid WDL boundary threshold/polarity');
  fiber.unpack(generator); // validate the full canonical generator
  return bsfpIdentity(BSFP_IDENTITY.VALUE, fiber.geometry, fiber.profile,
    { support: fiber.heights, threshold, polarity, generator });
}

/** Bind a reusable-fact map to ONE domain/profile. Cross-profile access fails;
 * equal full keys share facts only within that binding.
 */
export function createBsfpFactCache(exemplar) {
  if (!Object.values(BSFP_IDENTITY).includes(exemplar.kind) || typeof exemplar.scope !== 'string') throw new TypeError('invalid identity exemplar');
  const { kind, scope } = exemplar;
  const facts = new Map();
  function check(identity) {
    if (identity.kind !== kind || identity.scope !== scope) throw new TypeError('BSFP identity profile mismatch');
    if (typeof identity.exact !== 'string') throw new TypeError('missing exact identity');
  }
  return Object.freeze({
    get(identity) { check(identity); return facts.get(identity.exact); },
    set(identity, fact) { check(identity); facts.set(identity.exact, fact); },
    get size() { return facts.size; },
  });
}

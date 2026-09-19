// Exact, immutable proof data. No JSON omissions, getters, prototypes or hashes.
export const PROOF_PROFILE = 'isomax-guarded-canonical-context-v1';

export function snapshotProofData(value, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return value;
  if (!value || typeof value !== 'object' || ancestors.has(value)) throw new TypeError('proof data must be finite acyclic plain data');
  const array = Array.isArray(value);
  if (!array && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    throw new TypeError('proof data must use plain records');
  }
  ancestors.add(value);
  const keys = Reflect.ownKeys(value).filter((key) => !(array && key === 'length'));
  if (array && (keys.length !== value.length || keys.some((key, i) => key !== String(i)))) {
    throw new TypeError('proof arrays must be dense and have no extra properties');
  }
  const result = array ? [] : {};
  for (const key of keys.sort()) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError('proof data cannot contain hidden, symbol or accessor properties');
    }
    Object.defineProperty(result, key, { value: snapshotProofData(descriptor.value, ancestors), enumerable: true });
  }
  ancestors.delete(value);
  return Object.freeze(result);
}

export function proofDataKey(value) {
  return JSON.stringify(snapshotProofData(value));
}

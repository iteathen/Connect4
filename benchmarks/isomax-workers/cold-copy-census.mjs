// Qualification only. Install for a synchronous cold preparation call and
// restore before recursion. Counts describe logical TypedArray.set traffic,
// not hardware transactions, allocator zeroing, fills or scalar rehash stores.
const prototype = Object.getPrototypeOf(Uint8Array.prototype);
let measuring = false;

export function censusColdCopies(action) {
  if (measuring) throw new Error('nested cold-copy census');
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'set');
  const counts = { operations: 0, sourceBytes: 0, destinationBytes: 0 };
  measuring = true;
  Object.defineProperty(prototype, 'set', { ...descriptor, value(source, offset) {
    if (!ArrayBuffer.isView(source) || !source.BYTES_PER_ELEMENT)
      throw new Error('cold-copy census requires a typed source');
    const result = descriptor.value.call(this, source, offset);
    counts.operations++;
    counts.sourceBytes += source.length * source.BYTES_PER_ELEMENT;
    counts.destinationBytes += source.length * this.BYTES_PER_ELEMENT;
    return result;
  } });
  try { return { value: action(), ...counts }; }
  finally { Object.defineProperty(prototype, 'set', descriptor); measuring = false; }
}

// Temporary instance wrappers, restored even on failure; never wrap recursion.
export function censusColdMethods(entries, action) {
  const restore = [];
  try {
    for (const { owner, name, record } of entries) {
      const descriptor = Object.getOwnPropertyDescriptor(owner, name), original = owner[name];
      restore.push(() => descriptor ? Object.defineProperty(owner, name, descriptor) : delete owner[name]);
      Object.defineProperty(owner, name, { configurable: true, writable: true, value(...args) {
        const start = performance.now();
        try { return original.apply(this, args); }
        finally { record(performance.now() - start); }
      } });
    }
    return action();
  } finally { for (let i = restore.length - 1; i >= 0; i--) restore[i](); }
}

// C4-0006/0007 guarded response profile. See the proof and adversarial controls
// in 2026-09-12-incremental-response-closure.md. This is a compiled closure of
// one jointly executable response policy, not unconditional row ownership.
export function createPairedResponseClosure(spec, supportAccess, classes, vocabulary) {
  const { columns, rows, connect } = spec;
  const cells = columns * rows;
  if (!Number.isInteger(columns) || columns < 1 || !Number.isInteger(rows) || rows < 1
      || !Number.isSafeInteger(cells) || cells > 64 || !Number.isInteger(connect) || connect < 1) {
    throw new RangeError('paired response closure requires a valid at-most-64-cell domain');
  }
  if (typeof supportAccess?.hasEvenColumnRemainders !== 'function'
      || typeof classes?.everyTermInMask !== 'function') throw new TypeError('paired response closure ports are missing');
  if (!vocabulary || vocabulary.cellCount !== cells || !Number.isInteger(vocabulary.count)
      || vocabulary.count < 1 || vocabulary.count > 640
      || !(vocabulary.lo instanceof Uint32Array) || !(vocabulary.hi instanceof Uint32Array)
      || vocabulary.lo.length !== vocabulary.count || vocabulary.hi.length !== vocabulary.count) {
    throw new RangeError('paired response vocabulary does not match the domain');
  }
  let responseLo = 0, responseHi = 0;
  // With even remaining height in every column, the second event of each pair
  // has the same row parity as the top cell. The guard is essential.
  for (let r = (rows - 1) & 1; r < rows; r += 2) for (let c = 0; c < columns; c += 1) {
    const cell = r * columns + c, bit = (1 << (cell & 31)) >>> 0;
    if (cell < 32) responseLo = (responseLo | bit) >>> 0;
    else responseHi = (responseHi | bit) >>> 0;
  }
  const covered = new Uint32Array(20);
  for (let id = 0; id < vocabulary.count; id += 1) {
    if ((vocabulary.lo[id] & responseLo) !== 0 || (vocabulary.hi[id] & responseHi) !== 0) {
      covered[id >>> 5] |= 1 << (id & 31);
    }
  }
  return Object.freeze({
    moverNoWin(supportIndex, moverClass) {
      return supportAccess.hasEvenColumnRemainders(supportIndex)
        && classes.everyTermInMask(moverClass, covered);
    },
    profile: Object.freeze({ kind: 'guarded-adjacent-response-coverage-v1',
      retainedTypedBytes: covered.byteLength, perStateBytes: 0, perClassBytes: 0,
      responseLo, responseHi, result: 'side-to-move upper bound zero' }),
  });
}

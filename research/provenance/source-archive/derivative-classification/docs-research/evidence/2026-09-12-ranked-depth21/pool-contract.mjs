import assert from 'node:assert/strict';
import { createQuotientNativeNegamaxSupportLayoutKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-support-layout-kernel.mjs';
import { createSupportLayoutTermIdQuotientNativeNegamaxKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-term-id-support-layout-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createChunkedTermIdQuotientNativeNegamaxKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-chunked-term-id-kernel.mjs';
import { createChunkedResidualQuotientKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-chunked-residual-kernel.mjs';
import { createClassFirstChunkedResidualQuotientKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-chunked-class-first-kernel.mjs';
import { createSlot64ResidualQuotientKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs';
import { createTermIdQuotientNativeNegamaxKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-term-id-kernel.mjs';
import { createBoundedCacheTermIdQuotientNativeNegamaxKernel } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-term-id-bounded-cache-kernel.mjs';
import { installSlot64ResidualPool } from '../../../../research/semantic-quotient/state-identity-unification/src/quotient-slot64-residual-pool.mjs';
const spec = { columns: 4, rows: 3, connect: 3 };
for (const create of [createQuotientNativeNegamaxSupportLayoutKernel, createSupportLayoutTermIdQuotientNativeNegamaxKernel,
  createScaledTermIdQuotientNativeNegamaxKernel, createChunkedTermIdQuotientNativeNegamaxKernel,
  createChunkedResidualQuotientKernel, createClassFirstChunkedResidualQuotientKernel, createSlot64ResidualQuotientKernel,
  createTermIdQuotientNativeNegamaxKernel, createBoundedCacheTermIdQuotientNativeNegamaxKernel,
  function originalSlot64(spec, options) { const k = createQuotientNativeNegamaxSupportLayoutKernel(spec, options); installSlot64ResidualPool(k, spec, options); return k; }]) {
  const wrap = create(spec, { prefixClasses: 8, supportLayout: 'packed' }), k = wrap.kernel ?? wrap;
  for (let id = 0; id < k.states.count; id++) for (let column = 0; column < spec.columns; column++) k.advance(id, column);
  for (let id = 0; id < k.classes.size; id++) {
    let lo = 0, hi = 0;
    for (const [a, b] of k.classes.terms(id)) {
      if (a !== 0 && b === 0 && (a & (a - 1)) === 0) lo |= a;
      if (b !== 0 && a === 0 && (b & (b - 1)) === 0) hi |= b;
    }
    assert.equal(k.classes.singletonWord(id, 0), lo >>> 0);
    assert.equal(k.classes.singletonWord(id, 1), hi >>> 0);
  }
  // Older retained controls expose their own support API. Their new scalar
  // contract is checked above; shared support-layout consumers are checked below.
  for (let id = 0; k.supportAccess && id < k.states.count; id++) {
    const p0 = k.states.p0Class[id], p1 = k.states.p1Class[id];
    const support = k.states.support[id], rank = k.supportAccess.rankAt(support);
    let expected = -100;
    if ((k.classes.isEmpty(p0) && k.classes.isEmpty(p1)) || rank === k.cellCount) expected = -101;
    else {
      const own = rank & 1 ? p1 : p0, opponent = rank & 1 ? p0 : p1;
      let threats = 0, forced = -1;
      for (const column of k.centerOrder) {
        const cell = k.supportAccess.landingAt(support, column);
        if (cell === 255) continue;
        const lo = cell < 32 ? (1 << cell) >>> 0 : 0, hi = cell >= 32 ? (1 << (cell - 32)) >>> 0 : 0;
        if (k.classes.hasSingletonAt(own, lo, hi)) { expected = 64 + column; break; }
        if (k.classes.hasSingletonAt(opponent, lo, hi)) { threats++; if (forced < 0) forced = column; }
      }
      if (expected === -100) expected = threats > 1 ? -102 : threats === 1 ? forced : -100;
    }
    assert.equal(k.tacticalCode(id), expected, `${create.name} tactical state ${id}`);
  }
  console.log(JSON.stringify({ implementation: create.name, states: k.states.count, classes: k.classes.size, status: 'passed' }));
}

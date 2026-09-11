import { createSupportLayoutTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-term-id-support-layout-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';

const spec = { columns: 7, rows: 6, connect: 4 };
const variants = {
  'table-dense': createSupportLayoutTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'table' }),
  'packed-dense': createSupportLayoutTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'packed' }),
  'table-prefix4k': createScaledTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'table', prefixClasses: 4096 }),
  'packed-prefix4k': createScaledTermIdQuotientNativeNegamaxKernel(spec, { cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 }),
};
const result = Object.fromEntries(Object.entries(variants).map(([name, wrap]) => [name, {
  totalTypedBytes: wrap.kernel.memoryStats().totalTypedBytes,
  supportBytes: wrap.kernel.memoryStats().supportBytes,
  residualBytes: wrap.kernel.classes.memoryStats().totalTypedBytes,
  transitionCacheBytes: wrap.kernel.classes.memoryStats().transitionCacheBytes,
  supportStates: wrap.kernel.support.itemCapacity,
  vocabularyTerms: wrap.kernel.classes.termVocabulary.count,
}]));
console.log(`SCALED_7X6_MEMORY=${JSON.stringify(result)}`);

import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { installPrefixTermIdPool } from './quotient-term-id-prefix-pool.mjs';

export function createScaledTermIdQuotientNativeNegamaxKernel(spec, options = {}) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const termId = installPrefixTermIdPool(kernel, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  return Object.freeze({ kernel, termId });
}

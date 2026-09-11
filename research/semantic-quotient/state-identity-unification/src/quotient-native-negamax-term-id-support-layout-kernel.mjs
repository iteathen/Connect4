import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { installDenseTermIdPool } from './quotient-term-id-pool.mjs';

export function createSupportLayoutTermIdQuotientNativeNegamaxKernel(spec, options = {}) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, options);
  const termId = installDenseTermIdPool(kernel, spec);
  return Object.freeze({ kernel, termId });
}

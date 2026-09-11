import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { installSlot64ResidualPool } from './quotient-slot64-residual-pool-v2.mjs';

export function createSlot64ResidualQuotientKernel(spec, options = {}) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const residual = installSlot64ResidualPool(kernel, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  return Object.freeze({ kernel, residual });
}

import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { installChunkedResidualPool } from './quotient-chunked-residual-pool.mjs';

export function createChunkedResidualQuotientKernel(spec, options = {}) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const residual = installChunkedResidualPool(kernel, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  return Object.freeze({ kernel, residual });
}

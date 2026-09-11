import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { installClassFirstChunkedResidualPool } from './quotient-chunked-residual-class-first-pool.mjs';

export function createClassFirstChunkedResidualQuotientKernel(spec, options = {}) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const residual = installClassFirstChunkedResidualPool(kernel, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  return Object.freeze({ kernel, residual });
}

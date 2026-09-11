import { createQuotientNativeNegamaxSupportLayoutKernel } from './quotient-native-negamax-support-layout-kernel.mjs';
import { installChunkedTermIdPool } from './quotient-term-id-chunked-pool.mjs';

export function createChunkedTermIdQuotientNativeNegamaxKernel(spec, options = {}) {
  const kernel = createQuotientNativeNegamaxSupportLayoutKernel(spec, {
    ...options,
    supportLayout: options.supportLayout ?? 'packed',
  });
  const chunked = installChunkedTermIdPool(kernel, spec, {
    prefixClasses: options.prefixClasses ?? 4096,
  });
  return Object.freeze({ kernel, chunked });
}

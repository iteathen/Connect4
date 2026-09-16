import { readFileSync, writeFileSync } from 'node:fs';

function replaceOne(path, from, to, label) {
  const before = readFileSync(path, 'utf8');
  const count = before.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  writeFileSync(path, before.replace(from, to));
}

const contractPath = 'components/bsfp/cuda/tensor-overflow-contract.mjs';
writeFileSync(contractPath, `// CUDA-JS-Tensor SPEC-0005 resolved-plan workspace ceiling.\n// This is intentionally separate from the larger SPEC-0009 device-callable A/B workspace.\nexport const TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES = 64 * 1024 * 1024;\n`);

const normalizer = 'components/bsfp/cuda/tensor-packed42-overflow-normalizer.mjs';
replaceOne(
  normalizer,
  "} from 'cuda-js-tensor';\n",
  "} from 'cuda-js-tensor';\n\nimport { TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES } from './tensor-overflow-contract.mjs';\n",
  'normalizer contract import',
);
replaceOne(
  normalizer,
  'const DEFAULT_MAX_WORKSPACE_BYTES = 128 * 1024 * 1024;',
  'const DEFAULT_MAX_WORKSPACE_BYTES = TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES;',
  'normalizer workspace default',
);
replaceOne(
  normalizer,
  "  if (!['simt', 'prefer-cublaslt', 'cublaslt'].includes(normalized.backend)) throw new RangeError('Tensor overflow backend must be simt, prefer-cublaslt, or cublaslt');\n\n  const session = await TensorSession.open({",
  "  if (!['simt', 'prefer-cublaslt', 'cublaslt'].includes(normalized.backend)) throw new RangeError('Tensor overflow backend must be simt, prefer-cublaslt, or cublaslt');\n  if (normalized.maxWorkspaceBytes > TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES) {\n    throw new RangeError(`Tensor overflow resolved-plan workspace must not exceed ${TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES} bytes`);\n  }\n\n  const session = await TensorSession.open({",
  'normalizer resolved-plan ceiling',
);

const service = 'components/bsfp/cuda/packed42-pair-reducer-tensor-service.mjs';
replaceOne(
  service,
  "} from './index.mjs';\n",
  "} from './index.mjs';\nimport { TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES } from './tensor-overflow-contract.mjs';\n",
  'reducer contract import',
);
replaceOne(
  service,
  'maxWorkspaceBytes: options.tensorMaxWorkspaceBytes ?? 128 * 1024 * 1024,',
  'maxWorkspaceBytes: options.tensorMaxWorkspaceBytes ?? TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES,',
  'reducer resolved-plan fallback',
);

const runner = 'experiments/cuda-bsfp-compact-hybrid/run.mjs';
replaceOne(
  runner,
  "import { SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION } from '../../components/bsfp/cuda/index.mjs';\n",
  "import { SEGMENTED_PACKED_ANTICHAIN_42_DIRECTION } from '../../components/bsfp/cuda/index.mjs';\nimport { TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES } from '../../components/bsfp/cuda/tensor-overflow-contract.mjs';\n",
  'runner contract import',
);
replaceOne(
  runner,
  "const tensorMaxWorkspaceBytes = envPositive('BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES', 192 * 1024 * 1024);",
  "const tensorMaxWorkspaceBytes = envPositive('BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES', TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES);",
  'runner resolved-plan default',
);
replaceOne(
  runner,
  "if (!['simt', 'prefer-cublaslt', 'cublaslt'].includes(tensorBackend)) throw new RangeError('BSFP_HYBRID_TENSOR_BACKEND must be simt, prefer-cublaslt, or cublaslt');\n\nlet runtime;",
  "if (!['simt', 'prefer-cublaslt', 'cublaslt'].includes(tensorBackend)) throw new RangeError('BSFP_HYBRID_TENSOR_BACKEND must be simt, prefer-cublaslt, or cublaslt');\nif (tensorMaxWorkspaceBytes > TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES) {\n  throw new RangeError(`BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES must not exceed ${TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES} for the resolved-plan profile`);\n}\n\nlet runtime;",
  'runner workspace preflight',
);
replaceOne(
  runner,
  '  runtime = await openCudaRuntime({ compiler: true, driver: { memory: { maxAllocationBytes: tensorMaxWorkspaceBytes } } });',
  '  runtime = await openCudaRuntime({ compiler: true });',
  'runner CUDA-JS memory decoupling',
);

const testPath = 'components/bsfp/cuda/test/tensor-packed42-overflow-normalizer.test.mjs';
replaceOne(
  testPath,
  "} from '../../index.mjs';\n",
  "} from '../../index.mjs';\nimport { TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES } from '../tensor-overflow-contract.mjs';\n",
  'test contract import',
);
replaceOne(
  testPath,
  "      maxWorkspaceBytes: 8 * 1024 * 1024,\n      backend: 'simt',",
  "      backend: 'simt',",
  'test exercise default workspace',
);
replaceOne(
  testPath,
  "    try {\n      const packed = packedFixture(entry.values);",
  "    try {\n      assert.equal(normalizer.options.maxWorkspaceBytes, TENSOR_OVERFLOW_RESOLVED_PLAN_MAX_WORKSPACE_BYTES);\n      const packed = packedFixture(entry.values);",
  'test assert shared default',
);

const docs = 'docs/specs/profiles/C4-0009-P2-compact-hybrid-v0.md';
replaceOne(
  docs,
  'The candidate workspace uses four u32 arrays when checks are included: low mask, high mask, popcount, and comparison count. Output frontiers use two u32 arrays. Metadata and status arrays are bounded by segment capacity.\n\n',
  'The candidate workspace uses four u32 arrays when checks are included: low mask, high mask, popcount, and comparison count. Output frontiers use two u32 arrays. Metadata and status arrays are bounded by segment capacity.\n\n### Tensor overflow workspace contracts\n\nThe integrated overflow normalizer uses CUDA-JS-Tensor `ResolvedTensorPlan`. Under accepted Tensor SPEC-0005 its resolved-plan workspace ceiling is **64 MiB**, and P2 uses that value as the shared default and maximum for `BSFP_HYBRID_TENSOR_MAX_WORKSPACE_BYTES`. The separate full-shape Tensor A/B gate uses the SPEC-0009 device-callable program profile and retains its independently qualified larger workspace allowance; that allowance must not be forwarded into the resolved-plan solver path. CUDA-JS device-allocation policy is a third, independent contract and P2 no longer derives `maxAllocationBytes` from the Tensor workspace option.\n\n',
  'profile workspace contract documentation',
);

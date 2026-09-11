import { existsSync, readFileSync } from 'node:fs';

const forbiddenPaths = [
  'components/bsfp',
  'components/cuda-bsfp',
  'components/minimax',
  'components/minimax-alpha-beta',
  'components/hybrid',
  'components/hybrid-confluence',
  'MINIMAX_BRANCH.md',
  'BSFP_BRANCH.md',
  'HYBRID_BRANCH.md',
];

const violations = forbiddenPaths.filter((path) => existsSync(path));

const routingFiles = [
  'README.md',
  'AGENT_LOCAL.md',
  'REPOSITORY_STRUCTURE.md',
  'STATUS.md',
  'next_step.yaml',
];

const requiredSolverHeads = [
  'solver/minimax-alpha-beta',
  'solver/cuda-bsfp',
  'solver/hybrid-confluence',
];

for (const file of routingFiles) {
  if (!existsSync(file)) {
    violations.push(`missing routing file: ${file}`);
    continue;
  }

  const text = readFileSync(file, 'utf8');
  for (const branch of requiredSolverHeads) {
    if (!text.includes(branch)) {
      violations.push(`${file} does not name canonical solver head ${branch}`);
    }
  }
}

if (violations.length > 0) {
  console.error('main-role verification failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('main-role verification passed');
}

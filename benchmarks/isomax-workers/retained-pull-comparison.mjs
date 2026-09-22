// Research-only wrapper for D.multiworker-economics.q-activation-carry-prototype-r2.
// It leaves repository production source unchanged: the exact checked-out tree is
// copied to a disposable directory, a revision-pinned structural patch is applied
// there, and the unchanged retained-pull benchmark is executed against that copy.
// This file intentionally changes a path already owned by the existing economics
// workflow so the prototype receives the same Linux/Windows corpus and limits.

import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyQActivationCarryPrototype } from './q-activation-carry-runtime-patch.mjs';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const temporary = mkdtempSync(path.join(tmpdir(), 'isomax-qcarry-r2-'));
const targetRoot = path.join(temporary, 'repo');

try {
  cpSync(sourceRoot, targetRoot, {
    recursive: true,
    filter(source) {
      const relative = path.relative(sourceRoot, source);
      if (!relative) return true;
      return relative.split(path.sep)[0] !== '.git';
    },
  });

  applyQActivationCarryPrototype(targetRoot);
  const benchmark = path.join(
    targetRoot,
    'benchmarks/isomax-workers/retained-pull-comparison.prototype-base.mjs',
  );
  const run = spawnSync(process.execPath, [benchmark, ...process.argv.slice(2)], {
    cwd: targetRoot,
    env: {
      ...process.env,
      ISOMAX_Q_ACTIVATION_CARRY_PROTOTYPE: 'r2',
    },
    stdio: 'inherit',
    windowsHide: true,
  });
  if (run.error) throw run.error;
  if (run.signal) throw new Error(`q-carry prototype benchmark terminated by ${run.signal}`);
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

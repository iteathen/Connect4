// Research-only wrapper for D.multiworker-economics.parent-necessity-r2.
// Production source remains untouched: copy the exact checked-out tree to a
// disposable directory, apply the revision-pinned manager-only scheduling
// prototype there, then execute the unchanged retained-pull benchmark.

import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyParentNecessityPrototype } from './parent-necessity-runtime-patch.mjs';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const temporary = mkdtempSync(path.join(tmpdir(), 'isomax-parent-necessity-r2-'));
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

  applyParentNecessityPrototype(targetRoot);
  const benchmark = path.join(
    targetRoot,
    'benchmarks/isomax-workers/retained-pull-comparison.prototype-base.mjs',
  );
  const run = spawnSync(process.execPath, [benchmark, ...process.argv.slice(2)], {
    cwd: targetRoot,
    env: {
      ...process.env,
      ISOMAX_PARENT_NECESSITY_PROTOTYPE: 'r2',
    },
    stdio: 'inherit',
    windowsHide: true,
  });
  if (run.error) throw run.error;
  if (run.signal) throw new Error(`parent-necessity prototype benchmark terminated by ${run.signal}`);
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

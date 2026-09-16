import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const fixtureDigest = payload => crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

// Bounded evidence observer: captures operands before recovery, never selects
// solver work and never uses optimized output as an expected frontier.
export function createOverflowCapture(directory, geometry, maximumPerDirection = 2) {
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true }).trim();
  const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8', windowsHide: true }).trim().length > 0;
  const counts = [0, 0];
  fs.mkdirSync(directory, { recursive: true });
  return ({ job, initialRequiredAtLeast }) => {
    if (counts[job.direction] >= maximumPerDirection) return;
    const payload = { schemaVersion: 1, source: { revision, dirty }, geometry,
      context: job.context, direction: job.direction, initialRequiredAtLeast,
      left: job.left, right: job.right };
    const sha256 = fixtureDigest(payload);
    const target = path.join(directory, sha256 + '.json');
    // Unique file then atomic rename leaves no partial fixture at the final name.
    const temporary = target + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify({ sha256, payload }) + '\n', { flush: true });
    fs.renameSync(temporary, target);
    counts[job.direction]++;
    console.error(JSON.stringify({ kind: 'overflow-fixture-captured', sha256, context: job.context,
      direction: job.direction, candidates: job.product, initialRequiredAtLeast }));
  };
}

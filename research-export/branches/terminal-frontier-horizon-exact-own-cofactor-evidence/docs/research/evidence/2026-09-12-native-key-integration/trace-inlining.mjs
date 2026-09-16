import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { writeFile, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const here = new URL('./', import.meta.url), src = new URL('../../../../research/semantic-quotient/state-identity-unification/src/', here);
const hashes = {};
for (const name of await readdir(src)) if (name.endsWith('.mjs')) {
  hashes[name] = createHash('sha256').update(await readFile(new URL(name, src))).digest('hex');
}
const config = { domain: { columns: 7, rows: 6, connect: 4 }, depth: 8, timeoutMs: 60000, reservationBudgetBytes: 2 * 1024 ** 3 };
const child = spawn(process.execPath, ['--trace-turbo-inlining', '--max-old-space-size=2048',
  fileURLToPath(new URL('quotient-bounded-search.mjs', src)), '--child', JSON.stringify(config)],
  { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let out = '', err = '', timedOut = false;
child.stdout.on('data', b => { out += b; }); child.stderr.on('data', b => { err += b; });
const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, 60000);
try {
  const [code, signal] = await once(child, 'close');
  await writeFile(new URL('inlining.log', here), out);
  await writeFile(new URL('inlining.stderr', here), err);
  await writeFile(new URL('inlining-source-hashes.json', here), JSON.stringify(hashes, null, 2));
  console.log(JSON.stringify({ code, signal, timedOut, childExited: true }));
  process.exitCode = timedOut ? 124 : code ?? 1;
} finally { clearTimeout(timer); }

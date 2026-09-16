#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const refusal = process.argv[2];
const action = process.argv[3];
if (!/^[DEF]$/.test(refusal ?? '') || !/^[A-G]$/.test(action ?? '')) throw new Error('usage: high-refusal-root-action <D|E|F> <A-G>');
const ROOT = '4665655546443';
const sequence = ROOT + String(refusal.charCodeAt(0) - 64);
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-expired-response-rho-probe.mjs', import.meta.url));
const child = spawnSync(process.execPath, [PROBE, sequence, 'C3', action], {
  encoding: 'utf-8', timeout: 420000, maxBuffer: 32 * 1024 * 1024,
});
if (child.error) throw child.error;
assert.equal(child.status, 0, (child.stderr ?? '').slice(-8000));
const line = (child.stdout ?? '').split(/\r?\n/).find((x) => x.startsWith('EXPIRED_RESPONSE_RHO_PROBE='));
assert(line, 'rho probe output missing');
const proof = JSON.parse(line.slice('EXPIRED_RESPONSE_RHO_PROBE='.length));
console.log(`HIGH_REFUSAL_ROOT_ACTION=${JSON.stringify({ refusal, action, sequence, ...proof })}`);
assert.equal(proof.proved, true, `${refusal}: root action ${action} did not close (${proof.kind})`);

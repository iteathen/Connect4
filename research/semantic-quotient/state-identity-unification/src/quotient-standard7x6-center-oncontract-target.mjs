#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const target = process.argv[2];
const action = process.argv[3] ?? null;
if (!['C3','G3'].includes(target)) throw new Error('usage: oncontract-target <C3|G3> [A-G]');
if (action !== null && !/^[A-G]$/.test(action)) throw new Error(`bad action ${action}`);
const PROBE = fileURLToPath(new URL('./quotient-standard7x6-expired-response-rho-probe.mjs', import.meta.url));
const args = [PROBE, '46656555464437', target];
if (action !== null) args.push(action);
const child = spawnSync(process.execPath, args, {encoding:'utf-8',timeout:420000,maxBuffer:32*1024*1024});
if (child.error) throw child.error;
assert.equal(child.status, 0, (child.stderr ?? '').slice(-8000));
const line = (child.stdout ?? '').split(/\r?\n/).find(x => x.startsWith('EXPIRED_RESPONSE_RHO_PROBE='));
assert(line, 'rho probe output missing');
const proof = JSON.parse(line.slice('EXPIRED_RESPONSE_RHO_PROBE='.length));
console.log(`CENTER_ONCONTRACT_TARGET=${JSON.stringify({target,action,...proof})}`);
assert.equal(proof.proved, true, `${target}${action?`/${action}`:''} unproved (${proof.kind})`);

#!/usr/bin/env node
// Exact reverse checker for FOUR proposed P1 short-delay certificates.
// No oracle or candidate search. Witness files are output of previous
// scoped discovery and are not trusted as correct without this check.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {fileURLToPath} from 'node:url';
import {verifyTurnSixDelayCertificate} from './turn6-third-move-dual.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const rows=[1,2,3].map(i=>JSON.parse(fs.readFileSync(
  path.join(dir,'TURN6_REPLY'+i+'_DELAY_CERTIFICATE_0_1.json'),'utf8')));
rows.push(JSON.parse(fs.readFileSync(
  path.join(dir,'TURN6_CENTER_ONLY_DELAY_CERTIFICATE_0_1.json'),'utf8')));
const witnesses=rows.map(x=>x.witness[0]);
assert.deepEqual(witnesses.map(x=>x.P1Turn6),[1,2,3,4]);
const start=performance.now(),verified=verifyTurnSixDelayCertificate(witnesses);
assert.deepEqual(verified.coveredP1Turn6Replies,[1,2,3,4,5,6,7]);
assert.equal(verified.allSevenP1RepliesCoveredByReflection,true);
assert.equal(verified.oracleCalls,0);
assert.equal(verified.recursiveSolveCalls,0);
const copy=()=>JSON.parse(JSON.stringify(witnesses));
const missing=copy();missing[0].cases.pop();
assert.throws(()=>verifyTurnSixDelayCertificate(missing),/missing, duplicate/);
const illegal=copy();illegal[0].cases[0].P1First=8;
assert.throws(()=>verifyTurnSixDelayCertificate(illegal),/illegal|invalid|losing/);
// An adversarial first-win test is also performed in the isolated evidence
// campaign: find a LEGAL alternative reply permitting a P0 immediate win.
// It must be explicitly recorded as found or not found, not manufactured.
const result={
 schema:'connect4.turn6.complete-third-move-dual-roundtrip.v0_1',
 status:'EXACT_BOUNDED_DELAY_CERTIFICATE',
 coverage:'all seven P1 turn-6 replies, represented by four exact horizontal-reflection classes',
 verified,
 negativeControls:{missingP0CaseRejected:true,illegalDefensiveActionRejected:true},
 directVerificationMs:+(performance.now()-start).toFixed(3),
 candidateDiscoveryReplayed:false,oracleUsed:false,gameTreeSolverUsed:false,
 scopeLimit:'Only prevents P0 victory through P0 third move; not eventual WDL or win proof.'
};
console.log(JSON.stringify(result,null,2));

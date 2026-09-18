#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const ROOT='466565554644';
const refusalName=process.argv[2], responseName=process.argv[3];
if(!/^[DEF]$/.test(refusalName??'')||!/^[ABDEF]$/.test(responseName??'')) throw new Error('usage: high-refusal-rho-leaf <D|E|F> <A|B|D|E|F>');
const refusal=refusalName.charCodeAt(0)-65, response=responseName.charCodeAt(0)-65;
const C3=16,G=6;
const COMPOSER=fileURLToPath(new URL('./quotient-standard7x6-rho-action-branch-composition.mjs',import.meta.url));
const {kernel}=createSlot64ResidualQuotientKernel({columns:7,rows:6,connect:4},{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
kernel.prepareSearchStorage();
const e=createRepairCapacityProofEngine(kernel,{maxProofStates:1});
function coord(cell){return `${String.fromCharCode(65+cell%7)}${Math.floor(cell/7)+1}`}
function replay(seq){let id=kernel.rootId;for(const d of seq){id=kernel.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${seq}`)}return id}
const prefix=ROOT+'3'+String(refusal+1)+'7'+String(response+1);
const child=replay(prefix);assert.equal(e.rank(child),16);assert.equal(e.terminalActions(child,0).length,0,`${refusalName}/${responseName}: branch is immediate P0 terminal, not rho leaf`);
assert.equal(coord(e.landing(child,G)),'G2');const g2=kernel.advance(child,G);assert(g2>=0&&g2!==domain.QN_TERMINAL_WIN&&e.rank(g2)===17);
assert.equal(coord(e.landing(g2,G)),'G3');const g3=kernel.advance(g2,G);assert(g3>=0&&g3!==domain.QN_TERMINAL_WIN&&e.rank(g3)===18);
assert.equal(e.singleton(g3,0,C3),true);assert.equal(e.targetDistance(g3,C3),1);
const leafSequence=prefix+'77';
const p=spawnSync(process.execPath,[COMPOSER,leafSequence,'C3','G'],{encoding:'utf-8',timeout:270000,maxBuffer:32*1024*1024});
if(p.error)throw p.error;assert.equal(p.status,0,`composer process failed: ${(p.stderr??'').slice(-2000)}`);
const line=(p.stdout??'').split(/\r?\n/).find(x=>x.startsWith('RHO_ACTION_BRANCH_COMPOSITION='));assert(line,'composer output missing');const proof=JSON.parse(line.slice('RHO_ACTION_BRANCH_COMPOSITION='.length));
console.log(`HIGH_REFUSAL_RHO_LEAF=${JSON.stringify({refusal:refusalName,response:responseName,leafSequence,proved:proof.proved,kind:proof.kind??null,selectedAction:proof.selectedAction??null,beforeMeasure:proof.beforeMeasure??null,afterP0Measure:proof.afterP0Measure??null,certificate:proof.certificate??null})}`);
assert.equal(proof.proved,true,`${refusalName}/${responseName}: rho leaf does not close`);

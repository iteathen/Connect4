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
const C=2,G=6,C3=16,G3=20;
const OFF=new Set([0,1,3,4,5]);
const replyName=process.argv[2], stage=process.argv[3];
if(!/^[DEF]$/.test(replyName??'') || !['snapshot','seized','top','force','rho'].includes(stage)) throw new Error('usage: diagnostic <D|E|F> <snapshot|seized|top|force|rho>');
const reply=replyName.charCodeAt(0)-65;
const COMPOSER=fileURLToPath(new URL('./quotient-standard7x6-rho-action-branch-composition.mjs',import.meta.url));
const {kernel}=createSlot64ResidualQuotientKernel({columns:7,rows:6,connect:4},{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
kernel.prepareSearchStorage();
const e=createRepairCapacityProofEngine(kernel,{maxProofStates:1});
function col(c){return String.fromCharCode(65+c)}
function coord(cell){return `${col(cell%7)}${Math.floor(cell/7)+1}`}
function replay(seq){let id=kernel.rootId;for(const d of seq){id=kernel.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${seq}`)}return id}
function compose(seq){const p=spawnSync(process.execPath,[COMPOSER,seq,'C3','G'],{encoding:'utf-8',timeout:270000,maxBuffer:32*1024*1024});if(p.error)throw p.error;if(p.status!==0)return{proved:false,kind:'process',error:(p.stderr??'').slice(-4000)};const line=(p.stdout??'').split(/\r?\n/).find(x=>x.startsWith('RHO_ACTION_BRANCH_COMPOSITION='));return line?JSON.parse(line.slice('RHO_ACTION_BRANCH_COMPOSITION='.length)):{proved:false,kind:'output'} }
const afterC1=replay(ROOT+'3');
const landing=e.landing(afterC1,reply);
assert(['D5','E5','F5'].includes(coord(landing)));
const refusal=kernel.advance(afterC1,reply);assert(refusal>=0&&refusal!==domain.QN_TERMINAL_WIN&&e.rank(refusal)===14);
const refusalSeq=ROOT+'3'+String(reply+1);
function targetSnapshot(id){return {C3:{singleton:e.singleton(id,0,C3),distance:e.targetDistance(id,C3)},G3:{singleton:e.singleton(id,0,G3),distance:e.targetDistance(id,G3)},P0Terminals:e.terminalActions(id,0).map(x=>coord(x.cell)),P1Terminals:e.terminalActions(id,1).map(x=>coord(x.cell))}}
const snap=targetSnapshot(refusal);
assert.equal(coord(e.landing(refusal,G)),'G1');
assert.deepEqual({c:snap.C3,g:snap.G3},{c:{singleton:true,distance:1},g:{singleton:true,distance:2}});
assert.equal(snap.P0Terminals.length,0);
if(stage==='snapshot'){console.log(`HIGH_REFUSAL_DIAGNOSTIC=${JSON.stringify({reply:replyName,stage,snap,proved:true})}`);process.exit(0)}
const afterG1=kernel.advance(refusal,G);assert(afterG1>=0&&afterG1!==domain.QN_TERMINAL_WIN&&e.rank(afterG1)===15);
const seized=targetSnapshot(afterG1);
assert.deepEqual({c:seized.C3,g:seized.G3},{c:{singleton:true,distance:1},g:{singleton:true,distance:1}});
assert.equal(seized.P1Terminals.length,0,`${replyName}: P1 gained immediate terminal after G1 seizure: ${seized.P1Terminals}`);
if(stage==='seized'){console.log(`HIGH_REFUSAL_DIAGNOSTIC=${JSON.stringify({reply:replyName,stage,seized,proved:true})}`);process.exit(0)}
const leaves=[];
for(const r of e.legal(afterG1)){
 const cell=e.landing(afterG1,r), child=kernel.advance(afterG1,r);
 assert.notEqual(child,domain.QN_TERMINAL_WIN,`${replyName}/${col(r)}: P1 terminal after G1 at ${coord(cell)}`);assert(child>=0&&e.rank(child)===16);
 const imm=e.terminalActions(child,0);if(imm.length)continue;
 assert(OFF.has(r),`${replyName}/${col(r)}: nonterminal response outside off-system at ${coord(cell)}`);
 assert.equal(e.singleton(child,0,C3),true);assert.equal(e.singleton(child,0,G3),true);assert.equal(e.targetDistance(child,C3),1);assert.equal(e.targetDistance(child,G3),1);
 leaves.push({r,child,seq:refusalSeq+'7'+String(r+1),cell:coord(cell)});
}
if(stage==='top'){console.log(`HIGH_REFUSAL_DIAGNOSTIC=${JSON.stringify({reply:replyName,stage,leaves:leaves.map(x=>({response:col(x.r),cell:x.cell})),proved:true})}`);process.exit(0)}
const rhoLeaves=[];
for(const leaf of leaves){
 assert.equal(coord(e.landing(leaf.child,G)),'G2');const g2=kernel.advance(leaf.child,G);
 if(g2===domain.QN_TERMINAL_WIN)continue;assert(g2>=0&&e.rank(g2)===17);assert.equal(coord(e.landing(g2,G)),'G3');
 let block=null;
 for(const r of e.legal(g2)){
  const cell=e.landing(g2,r), ch=kernel.advance(g2,r);
  assert.notEqual(ch,domain.QN_TERMINAL_WIN,`${replyName}/${col(leaf.r)}/${col(r)}: P1 terminal override at ${coord(cell)}`);assert(ch>=0&&e.rank(ch)===18);
  if(cell!==G3){assert(e.terminalActions(ch,0).some(x=>x.cell===G3),`${replyName}/${col(leaf.r)}/${col(r)}: G3 nonblock without P0 terminal`);continue}
  assert.equal(e.singleton(ch,0,G3),false);assert.equal(e.singleton(ch,0,C3),true);assert.equal(e.targetDistance(ch,C3),1);block=leaf.seq+'77';
 }
 assert(block,`${replyName}/${col(leaf.r)}: no exact G3 block leaf`);rhoLeaves.push({response:col(leaf.r),seq:block});
}
if(stage==='force'){console.log(`HIGH_REFUSAL_DIAGNOSTIC=${JSON.stringify({reply:replyName,stage,rhoLeaves,proved:true})}`);process.exit(0)}
for(const leaf of rhoLeaves){const proof=compose(leaf.seq);assert.equal(proof.proved,true,`${replyName}/${leaf.response}: rho leaf unproved (${proof.kind??'unknown'})`)}
console.log(`HIGH_REFUSAL_DIAGNOSTIC=${JSON.stringify({reply:replyName,stage:'rho',rhoLeaves,proved:true})}`);

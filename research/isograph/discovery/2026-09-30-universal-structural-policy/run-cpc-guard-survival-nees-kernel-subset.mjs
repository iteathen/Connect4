#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
const D=Number(process.argv[3]??15);
const memoCapacity=Number(process.argv[4]??(1<<22));
assert(library);
assert(Number.isInteger(D)&&D>=1&&(D&1),'target horizon must be odd');
assert(Number.isInteger(memoCapacity)&&memoCapacity>=1&&(memoCapacity&(memoCapacity-1))===0,'memo capacity must be power of two');
const EXPECTED='2f459989bca348ff1b840da0978262404a0d8f36';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  prepareConnect4GuardSurvival32,
  loadConnect4GuardSurvivalRoot32,
  proveConnect4GuardSurvival32,
}=await load('cpc-connect4-guard-survival');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const sequence='4444415666';
const moves=Array.from(sequence,c=>Number(c)-1);
const root=connect4RbaFromMoves(moves,{geometry:g,canonical:false});
const rank=root.words[g.metaOffset]>>>2;
const attacker=rank&1;
const defender=1-attacker;

function oddDefenderMaskFromMoves(){
  const heights=new Uint8Array(g.columns);
  let mask=0;
  for(let ply=0;ply<moves.length;ply+=1){
    const c=moves[ply],row=heights[c]++;
    if((row&1)===0&&(ply&1)===defender)mask|=1<<(c*3+(row>>>1));
  }
  return mask>>>0;
}

const oddDefenderMask=oddDefenderMaskFromMoves();
const ctx=prepareConnect4GuardSurvival32({geometry:g,memoCapacity});
loadConnect4GuardSurvivalRoot32(ctx,root.words,0,root.basis,0,root.basis.length);
const started=process.hrtime.bigint();
const code=proveConnect4GuardSurvival32(ctx,D,oddDefenderMask);
const elapsedNs=process.hrtime.bigint()-started;

console.log(JSON.stringify({
  schema:'connect4.cpc_guard_survival_nees_kernel_subset.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  root:{sequence,rank,attacker:attacker+1,support:Array.from(root.words.slice(0,g.columns))},
  targetHorizon:D,
  absolutePly:rank+D,
  oddDefenderMask,
  result:{
    accept:code===1,
    code,
    failedTrigger:code>1?code-1:null,
  },
  runtime:{
    elapsedNs:String(elapsedNs),
    memoCapacity,
    memoStoredKeyWords:ctx.memo.storedKeyWords,
    frameWords:ctx.words.length,
    frameBasis:ctx.basis.length,
  },
  boundary:[
    'Root ingress and fixture decoding are COLD; all repeated proof execution is delegated to the NEES-ledgered JSMinSys guard-survival kernel.',
    'The E0/E1 kernel uses caller-owned RBA frame spans, numeric response masks, fixed typed scratch, and the exact typed RBA proof memo.',
    'No physical bitboard, 49-bit position code, Map, Set, string key, or per-node aggregate allocation is part of the proof kernel.',
    'Acceptance is a constructive survival lower certificate only; rejection is not an attacker upper bound.'
  ]
},null,2));

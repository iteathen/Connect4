#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  ingress, rank, mover, terminal, legal, cofactor, proveAttacker
} from './run-cpc-attacker-completion-proof-classes.mjs';

const TRAINING='444441566';
const MAX_TRIALS=12000;
const TARGET=30;
const MIN_NON_IMMEDIATE=6;

function nextRand(x){
  x^=(x<<13);x^=(x>>>17);x^=(x<<5);
  return x>>>0;
}

function samplePrefix(seed,targetRank){
  let q=ingress(''),sequence='',x=seed>>>0;
  for(let ply=0;ply<targetRank;ply++){
    const ls=legal(q);
    if(!ls.length)return null;
    x=nextRand(x||1);
    const start=x%ls.length;
    let moved=false;
    for(let k=0;k<ls.length;k++){
      const c=ls[(start+k)%ls.length];
      const tr=cofactor(q,c);
      if(tr.term)continue;
      q=tr.q;sequence+=String(c+1);moved=true;break;
    }
    if(!moved)return null;
  }
  assert.equal(terminal(q),0);
  return {q,sequence};
}

const accepted=[],seen=new Set(),constructorCounts={};
let attemptedProofs=0,nonImmediate=0;

for(let trial=1;trial<=MAX_TRIALS;trial++){
  // Bias into the middle/late game where exact CPC constructors are exercised,
  // while retaining multiple ranks and both movers.
  const targetRank=8+(trial%19); // 8..26
  const sample=samplePrefix((0x243f6a88^Math.imul(trial,0x9e3779b1))>>>0,targetRank);
  if(!sample)continue;
  if(sample.sequence.startsWith(TRAINING))continue;
  if(sample.sequence==='2232'||sample.sequence==='32612636')continue;
  if(seen.has(sample.sequence))continue;
  seen.add(sample.sequence);

  const attacker=mover(sample.q);
  attemptedProofs++;
  const cert=proveAttacker(sample.q,attacker,4);
  if(!cert)continue;

  const constructor=cert.constructor;
  const isNonImmediate=constructor!=='IMMEDIATE_TERMINAL';
  // Keep a broad corpus, but do not allow immediate-win examples to crowd out
  // the proof-class constructors that need real qualification.
  if(!isNonImmediate && accepted.filter(x=>x.constructor==='IMMEDIATE_TERMINAL').length>=10)continue;

  accepted.push({
    sequence:sample.sequence,
    rank:rank(sample.q),
    attacker:attacker+1,
    upper:cert.upper,
    constructor,
    certificate:cert,
  });
  constructorCounts[constructor]=(constructorCounts[constructor]??0)+1;
  if(isNonImmediate)nonImmediate++;

  if(accepted.length>=TARGET&&nonImmediate>=MIN_NON_IMMEDIATE)break;
}

assert(accepted.length>=16,'insufficient fresh A_D certificates: '+accepted.length);
assert(nonImmediate>=4,'insufficient non-immediate fresh A_D certificates: '+nonImmediate);

console.log(JSON.stringify({
  schema:'connect4.cpc_attacker_completion_fresh_structural.v1',
  theoremVersion:'0.1',
  oracleUsed:false,
  solvedInputsUsed:false,
  trainingPrefixExcluded:TRAINING,
  generator:{
    kind:'deterministic xorshift32 legal nonterminal CPC/RBA prefixes',
    maxTrials:MAX_TRIALS,
    attemptedProofs,
    accepted:accepted.length,
    constructorCounts,
    nonImmediate,
  },
  certificates:accepted,
  freezeBoundary:[
    'Every certificate was produced before any oracle query.',
    'Only the frozen A_D proof grammar is used: exact RBA cofactors, native CPC tactical closure, and exact CPC_RESTRICT transport.',
    'CPC_NONE is not expanded.',
    'These positions are fresh with respect to the consumed 444441566 training prefix.'
  ]
},null,2));

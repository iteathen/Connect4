#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
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
const parentSequence='44444156666623222242';
const trigger=2; // zero-based column 3
const response=6; // zero-based column 7
const childSequence=parentSequence+String(trigger+1)+String(response+1);
const parentMoves=Array.from(parentSequence,c=>Number(c)-1);
const childMoves=Array.from(childSequence,c=>Number(c)-1);
const parent=connect4RbaFromMoves(parentMoves,{geometry:g,canonical:false});
const child=connect4RbaFromMoves(childMoves,{geometry:g,canonical:false});
assert.equal(parent.words[g.metaOffset]&3,0);
assert.equal(child.words[g.metaOffset]&3,0);

function oddDefenderMask(moves){
  const attacker=moves.length&1,defender=1-attacker,heights=new Uint8Array(7);
  let mask=0;
  for(let ply=0;ply<moves.length;ply++){
    const c=moves[ply],row=heights[c]++;
    if((row&1)===0&&(ply&1)===defender)mask|=1<<(c*3+(row>>>1));
  }
  return mask>>>0;
}
function remainderParity(words){
  const odd=[],even=[],full=[];
  for(let c=0;c<7;c++){
    const rem=6-words[c];
    if(rem===0)full.push(c+1);
    else (rem&1?odd:even).push(c+1);
  }
  return {odd,even,full};
}
function guards(words,mask){
  const out=[];
  for(let c=0;c<7;c++){
    const h=words[c];
    if(!(h>=1&&h<=5&&(h&1)))continue;
    const count=(h+1)>>>1,required=((1<<count)-1)<<(c*3);
    if((mask&required)===required)out.push({column:c+1,height:h});
  }
  return out;
}

const parentMask=oddDefenderMask(parentMoves);
const childMask=oddDefenderMask(childMoves);
const ctx=prepareConnect4GuardSurvival32({geometry:g,memoCapacity:4194304});
loadConnect4GuardSurvivalRoot32(ctx,child.words,0,child.basis,0,child.basis.length);
const started=process.hrtime.bigint();
const code=proveConnect4GuardSurvival32(ctx,15,childMask);
const elapsedNs=process.hrtime.bigint()-started;

console.log(JSON.stringify({
  schema:'connect4.cpc_cross_pool_response_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  parent:{
    sequence:parentSequence,
    rank:parentMoves.length,
    support:Array.from(parent.words.slice(0,7)),
    oddDefenderMask:parentMask,
    guards:guards(parent.words,parentMask),
    remainderParity:remainderParity(parent.words)
  },
  realized:{
    triggerColumn:trigger+1,
    responseColumn:response+1,
    childSequence,
    childRank:childMoves.length,
    childSupport:Array.from(child.words.slice(0,7)),
    childOddDefenderMask:childMask,
    childGuards:guards(child.words,childMask),
    childRemainderParity:remainderParity(child.words)
  },
  downstream:{
    horizon:15,
    absolutePly:childMoves.length+15,
    code,
    accept:code===1,
    failedTrigger:code>1?code-1:null,
    elapsedNs:String(elapsedNs)
  },
  boundary:[
    'Discovery probe only: response column 7 is not licensed by the current frozen response grammar at the parent state.',
    'The probe asks whether the exact child independently satisfies the already-qualified D15 survival class.',
    'A positive child result would motivate a structural licensing theorem; it would not by itself license the move.',
    'No oracle, solved W/D/L, best-move label, or physical-board identity is used.'
  ]
},null,2));

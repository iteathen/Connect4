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
const parentSequence='444441566666232222423311';
const trigger=4; // zero-based column 5
const parentHorizon=13;
const childHorizon=parentHorizon-2;
const parentMoves=Array.from(parentSequence,c=>Number(c)-1);
const parent=connect4RbaFromMoves(parentMoves,{geometry:g,canonical:false});
assert.equal(parent.words[g.metaOffset]&3,0);

function oddDefenderMask(moves){
  const attacker=moves.length&1,defender=1-attacker,heights=new Uint8Array(7);
  let mask=0;
  for(let ply=0;ply<moves.length;ply++){
    const c=moves[ply],row=heights[c]++;
    if((row&1)===0&&(ply&1)===defender)mask|=1<<(c*3+(row>>>1));
  }
  return mask>>>0;
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
function remainderParity(words){
  const odd=[],even=[],full=[];
  for(let c=0;c<7;c++){
    const rem=6-words[c];
    if(!rem)full.push(c+1);
    else (rem&1?odd:even).push(c+1);
  }
  return {odd,even,full};
}

const triggeredSequence=parentSequence+String(trigger+1);
const triggeredMoves=Array.from(triggeredSequence,c=>Number(c)-1);
const triggered=connect4RbaFromMoves(triggeredMoves,{geometry:g,canonical:false});
assert.equal(triggered.words[g.metaOffset]&3,0,'trigger unexpectedly terminal');

const parentMask=oddDefenderMask(parentMoves);
const rows=[];
for(let response=0;response<7;response++){
  if(triggered.words[response]>=6)continue;
  const childSequence=triggeredSequence+String(response+1);
  let child;
  try{
    child=connect4RbaFromMoves(Array.from(childSequence,c=>Number(c)-1),{geometry:g,canonical:false});
  }catch{
    continue;
  }
  const term=child.words[g.metaOffset]&3;
  const childMoves=Array.from(childSequence,c=>Number(c)-1);
  const childMask=oddDefenderMask(childMoves);
  if(term){
    rows.push({
      responseColumn:response+1,
      terminal:term,
      childSequence,
      childRank:childMoves.length,
      childSupport:Array.from(child.words.slice(0,7)),
      childOddDefenderMask:childMask,
      childGuards:[],
      downstream:null
    });
    continue;
  }
  const ctx=prepareConnect4GuardSurvival32({geometry:g,memoCapacity:4194304});
  loadConnect4GuardSurvivalRoot32(ctx,child.words,0,child.basis,0,child.basis.length);
  const started=process.hrtime.bigint();
  const code=proveConnect4GuardSurvival32(ctx,childHorizon,childMask);
  const elapsedNs=process.hrtime.bigint()-started;
  rows.push({
    responseColumn:response+1,
    terminal:0,
    childSequence,
    childRank:childMoves.length,
    childSupport:Array.from(child.words.slice(0,7)),
    childOddDefenderMask:childMask,
    childGuards:guards(child.words,childMask),
    childRemainderParity:remainderParity(child.words),
    downstream:{
      horizon:childHorizon,
      absolutePly:childMoves.length+childHorizon,
      code,
      accept:code===1,
      failedTrigger:code>1?code-1:null,
      elapsedNs:String(elapsedNs)
    }
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_d13_trigger5_all_legal_response_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  parent:{
    sequence:parentSequence,
    rank:parentMoves.length,
    horizon:parentHorizon,
    support:Array.from(parent.words.slice(0,7)),
    oddDefenderMask:parentMask,
    guards:guards(parent.words,parentMask),
    remainderParity:remainderParity(parent.words)
  },
  trigger:{
    column:trigger+1,
    sequence:triggeredSequence,
    support:Array.from(triggered.words.slice(0,7)),
    remainderParity:remainderParity(triggered.words)
  },
  responses:rows,
  boundary:[
    'Discovery probe only. Every physically legal defender response is tested, including responses not licensed by the current frozen grammar.',
    'A positive unlicensed child only identifies a candidate missing structural response theorem; it does not license that response.',
    'Each nonterminal child is evaluated only by the already-qualified NEES guard-survival class at D11.',
    'No oracle, solved W/D/L, best-move label, or physical-board identity is used by the downstream proof.'
  ]
},null,2));

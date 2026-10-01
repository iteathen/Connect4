#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
const D=27,triggerColumn=5,memoCapacity=4194304;
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');
const {
  prepareConnect4GuardSurvival32,
  loadConnect4GuardSurvivalRoot32,
  diagnoseConnect4GuardSurvivalTrigger32,
}=await load('cpc-connect4-guard-survival');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const sequence='4444415666';
const moves=Array.from(sequence,c=>Number(c)-1);
const root=connect4RbaFromMoves(moves,{geometry:g,canonical:false});
const rank=q=>q.words[g.metaOffset]>>>2;
const mover=q=>rank(q)&1;
const terminal=q=>q.words[g.metaOffset]&3;
const attacker=mover(root),defender=1-attacker;
const CPC_KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

function oddDefenderMaskFromMoves(){
  const heights=new Uint8Array(g.columns);
  let mask=0;
  for(let ply=0;ply<moves.length;ply+=1){
    const c=moves[ply],row=heights[c]++;
    if((row&1)===0&&(ply&1)===defender)mask|=1<<(c*3+(row>>>1));
  }
  return mask>>>0;
}
function guardsFrom(q,mask){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const h=q.words[c];
    if(!(h>=1&&h<=5&&(h&1)))continue;
    const count=(h+1)>>>1,required=((1<<count)-1)<<(c*3);
    if((mask&required)===required)out.push({column:c+1,height:h});
  }
  return out;
}
function cpcSummary(q){
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  return {
    kind:CPC_KIND.get(kind),
    interval:[scratch.interval[0]-2,scratch.interval[1]-2],
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask32:scratch.preemptionMask32[0]>>>0,
    precursorCount:scratch.precursorCount[0],
  };
}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function earliest(q,id,player){
  const first=player===mover(q)?1:2,remaining=g.cellCount-rank(q),needs=[];
  const n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++){
    const cell=g.shapeCells[base+i],need=g.cellRow[cell]-q.words[g.cellColumn[cell]]+1;
    if(need<=0)return null;
    needs.push(need);
  }
  needs.sort((a,b)=>a-b);
  let slot=first;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
}
function residualProfile(q){
  const residuals=activeMinimal(q,attacker);
  const histogram={};
  for(const id of residuals){
    const d=earliest(q,id,attacker);
    if(d!==null)histogram[d]=(histogram[d]??0)+1;
  }
  return {count:residuals.length,deadlineHistogram:histogram};
}
function cofactor(q,column){
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,column,q.words[column],
    words,0,basisBuf,0,seen,sizes,0
  );
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}

const oddMask=oddDefenderMaskFromMoves();
const ctx=prepareConnect4GuardSurvival32({geometry:g,memoCapacity});
loadConnect4GuardSurvivalRoot32(ctx,root.words,0,root.basis,0,root.basis.length);
const out=new Uint32Array(18);
const started=process.hrtime.bigint();
const candidateMask=diagnoseConnect4GuardSurvivalTrigger32(ctx,D,oddMask,triggerColumn,out,0);
const elapsedNs=process.hrtime.bigint()-started;

const first=cofactor({words:root.words,basis:root.basis},triggerColumn);
assert.equal(first.term,0);
const responses=[];
for(let rcol=0;rcol<7;rcol++)if(candidateMask&(1<<rcol)){
  const code=out[4+rcol],nextMask=out[11+rcol]>>>0;
  const second=cofactor(first.q,rcol);
  responses.push({
    responseColumn:rcol+1,
    terminal:second.term,
    childCode:code,
    childAccept:code===1,
    childFailedTrigger:code>1?code-1:null,
    nextOddDefenderMask:nextMask,
    childRank:second.term?rank(second.q):rank(second.q),
    childSupport:Array.from(second.q.words.slice(0,g.columns)),
    childGuards:second.term?[]:guardsFrom(second.q,nextMask),
    childCpc:second.term?null:cpcSummary(second.q),
    attackerResidualProfile:second.term?null:residualProfile(second.q),
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_nees_d27_trigger6_diagnostic.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  root:{sequence,rank:rank(root),support:Array.from(root.words.slice(0,g.columns)),guards:guardsFrom(root,oddMask)},
  horizon:D,
  absolutePly:rank(root)+D,
  triggerColumn:triggerColumn+1,
  candidateMask:candidateMask>>>0,
  guardMask:out[1]>>>0,
  triggerTerminal:out[2],
  responses,
  runtime:{elapsedNs:String(elapsedNs),memoCapacity},
  boundary:[
    'This is a diagnostic projection of the already-frozen NEES guard-survival response grammar; it adds no legal response.',
    'Each childCode is the existing D25 survival result after exact trigger/response cofactors: 1 means closed/survives; 2..8 identifies that child class first unclosed attacker trigger.',
    'Failure remains grammar incompleteness only, not an attacker forced-completion certificate.',
    'No oracle, solved W/D/L, best-move labels, or physical-board identity is used by the proof diagnostic.'
  ]
},null,2));

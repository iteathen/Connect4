#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

const source=JSON.parse(readFileSync(
  'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_PAIR_STAR_COMPOSITION_PROBE_0_1.json','utf8'
));

const moves=s=>Array.from(s,c=>Number(c)-1);
function evalCpc(sequence,attacker){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  const interval=[scratch.interval[0]-2,scratch.interval[1]-2],attackerValue=attacker===0?1:-1;
  let polarity='UNRESOLVED';
  if(kind===CPC_EXACT){
    polarity=interval[0]===attackerValue?'ATTACKER':interval[0]===0?'DRAW':'DEFENDER';
  }
  const mask=scratch.preemptionMask32[0]>>>0,allowed=[];
  for(let c=0;c<g.columns;c++)if(mask&(1<<c))allowed.push(c+1);
  return {
    sequence,
    rank:q.words[g.metaOffset]>>>2,
    mover:((q.words[g.metaOffset]>>>2)&1)+1,
    terminal:q.words[g.metaOffset]&3,
    kind:KIND.get(kind),
    interval,
    polarity,
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    allowedColumns:allowed,
    precursorCount:scratch.precursorCount[0],
  };
}

const rows=[];
for(const row of source.rows){
  const attacker=row.attacker-1;
  const endpoints=[];
  for(const ep of row.endpoints){
    const base=evalCpc(ep.sequence,attacker);
    const continuation=[];
    if(base.kind==='CPC_RESTRICT'&&base.allowedColumns.length){
      for(const c of base.allowedColumns){
        const next=evalCpc(base.sequence+String(c),attacker);
        continuation.push({defenderForcedColumn:c,next});
      }
    }
    endpoints.push({
      branch:ep.theoremBranch,
      defenderReply:ep.defenderReply??null,
      pairStarTerminal:!!ep.pairStarTerminal,
      base,
      continuation
    });
  }
  rows.push({
    label:row.label,
    attacker:row.attacker,
    guardPassed:row.guardPassed,
    endpoints
  });
}

function endpointClass(ep){
  if(ep.pairStarTerminal)return 'ATTACKER_TERMINAL';
  if(ep.base.polarity==='ATTACKER')return 'CPC_ATTACKER_EXACT';
  if(ep.base.polarity==='DEFENDER')return 'CPC_DEFENDER_EXACT';
  if(ep.base.polarity==='DRAW')return 'CPC_DRAW_EXACT';
  if(ep.base.kind==='CPC_RESTRICT'){
    if(!ep.continuation.length)return 'RESTRICT_EMPTY';
    const ps=ep.continuation.map(x=>x.next.polarity);
    if(ps.every(x=>x==='ATTACKER'))return 'RESTRICT_TO_ATTACKER_EXACT';
    if(ps.some(x=>x==='DEFENDER'||x==='DRAW'))return 'RESTRICT_TO_BAD_EXACT';
    return 'RESTRICT_TO_UNRESOLVED';
  }
  return ep.base.kind;
}

const compact=rows.map(r=>{
  const classes=r.endpoints.map(endpointClass);
  const hist={};
  for(const c of classes)hist[c]=(hist[c]??0)+1;
  return {
    label:r.label,
    guardPassed:r.guardPassed,
    endpointCount:r.endpoints.length,
    classHistogram:hist,
    allPolaritySafe:r.guardPassed&&classes.every(c=>!['CPC_DEFENDER_EXACT','CPC_DRAW_EXACT','RESTRICT_TO_BAD_EXACT'].includes(c)),
    allClosedAttacker:r.guardPassed&&classes.every(c=>['ATTACKER_TERMINAL','CPC_ATTACKER_EXACT','RESTRICT_TO_ATTACKER_EXACT'].includes(c)),
    unresolvedClasses:[...new Set(classes.filter(c=>!['ATTACKER_TERMINAL','CPC_ATTACKER_EXACT','RESTRICT_TO_ATTACKER_EXACT'].includes(c)))]
  };
});

console.log(JSON.stringify({
  schema:'connect4.cpc_pair_star_forced_continuation.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  compact,
  summary:{
    allClosedLabels:compact.filter(x=>x.allClosedAttacker).map(x=>x.label),
    polaritySafeLabels:compact.filter(x=>x.allPolaritySafe).map(x=>x.label),
  },
  boundary:[
    'Only exact CPC restriction actions are transported; unrestricted defender branching is not expanded here.',
    'This remains training-side composition evidence and does not promote pair-star as a value theorem unless every endpoint is polarity-safe and closed.'
  ]
},null,2));

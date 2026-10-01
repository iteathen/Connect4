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
const evidence=JSON.parse(readFileSync(
  'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_PAIR_STAR_HUB_LADDER_0_1.json','utf8'
));

function moves(s){return Array.from(s,c=>Number(c)-1);}
function evalCpc(sequence,attacker){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:true});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  const interval=[scratch.interval[0]-2,scratch.interval[1]-2];
  const attackerValue=attacker===0?1:-1;
  return {
    sequence,
    rank:q.words[g.metaOffset]>>>2,
    mover:((q.words[g.metaOffset]>>>2)&1)+1,
    terminal:q.words[g.metaOffset]&3,
    basisSize:q.basis.length,
    kind:KIND.get(kind),
    absoluteInterval:interval,
    exactAttackerWin:kind===CPC_EXACT&&interval[0]===attackerValue&&interval[1]===attackerValue,
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask32:scratch.preemptionMask32[0]>>>0,
    precursorCount:scratch.precursorCount[0],
    projected:{
      p0Count:scratch.projectedCount[0],
      p1Count:scratch.projectedCount[1],
      p0Forks:scratch.projectedForks[0],
      p1Forks:scratch.projectedForks[1],
    }
  };
}

const rows=[];
for(const state of evidence.states){
  const attacker=(state.attacker-1);
  if(!state.firstWinGuard.passed){
    rows.push({
      label:state.label,
      stateSequence:state.sequence,
      attacker:state.attacker,
      guardPassed:false,
      endpoints:[]
    });
    continue;
  }
  const endpoints=[];
  if(state.e3Depth===0){
    const sequence=state.sequence+'5';
    endpoints.push({
      theoremBranch:'DIRECT_HUB',
      cpc:evalCpc(sequence,attacker)
    });
  }else{
    for(const b of state.branches){
      if(b.kind==='FIRST_WIN_GUARD_FAIL')continue;
      assert(Number.isInteger(b.defenderReply));
      const sequence=state.sequence+'5'+String(b.defenderReply)+'5';
      endpoints.push({
        theoremBranch:b.hub,
        defenderReply:b.defenderReply,
        pairStarTerminal:!!b.terminal,
        cpc:evalCpc(sequence,attacker)
      });
    }
  }
  rows.push({
    label:state.label,
    stateSequence:state.sequence,
    attacker:state.attacker,
    guardPassed:true,
    endpoints
  });
}

const compact=rows.map(r=>({
  label:r.label,
  guardPassed:r.guardPassed,
  endpointCount:r.endpoints.length,
  kinds:Object.fromEntries([...new Set(r.endpoints.map(e=>e.cpc.kind))].map(k=>[k,r.endpoints.filter(e=>e.cpc.kind===k).length])),
  exactAttackerWins:r.endpoints.filter(e=>e.cpc.exactAttackerWin).length,
  restrictions:r.endpoints.filter(e=>e.cpc.kind==='CPC_RESTRICT').length,
  none:r.endpoints.filter(e=>e.cpc.kind==='CPC_NONE').length,
  endpoints:r.endpoints.map(e=>({
    branch:e.theoremBranch,
    defenderReply:e.defenderReply??null,
    terminal:e.cpc.terminal,
    kind:e.cpc.kind,
    interval:e.cpc.absoluteInterval,
    exactAttackerWin:e.cpc.exactAttackerWin,
    forced:e.cpc.forcedColumn,
    preemptionCount:e.cpc.preemptionCount,
    precursorCount:e.cpc.precursorCount,
  }))
}));

console.log(JSON.stringify({
  schema:'connect4.cpc_pair_star_composition_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  sourceEvidence:'CPC_PAIR_STAR_HUB_LADDER_0_1.json',
  rows,
  compact,
  conclusion:'Probe native CPC exactly at the terminal-or-singleton endpoints guaranteed by the qualified pair-star theorem. This is training-side composition evidence only; no new rule is promoted from frequency counts.',
},null,2));

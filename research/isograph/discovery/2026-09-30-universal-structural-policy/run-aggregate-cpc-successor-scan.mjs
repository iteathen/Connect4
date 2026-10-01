#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-aggregate-cpc-successor-scan.mjs <JSMinSys checkout>');

const EXPECTED_SHA='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED_SHA);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

const roots=[
  {id:'candidate2',sequence:'4444415662',survivalLower:3},
  {id:'candidate3',sequence:'4444415663',survivalLower:3},
  {id:'candidate6',sequence:'4444415666',survivalLower:5},
];

function movesOf(sequence){return Array.from(sequence,c=>Number(c)-1);}
function legalColumns(sequence){
  const h=Array(g.columns).fill(0);
  for(const c of movesOf(sequence))h[c]++;
  return h.flatMap((x,c)=>x<g.rows?[c]:[]);
}
function absoluteInterval(scratch){return [scratch.interval[0]-2,scratch.interval[1]-2];}
function maskColumns(mask){
  const out=[];
  for(let c=0;c<g.columns;c++)if(mask&(1<<c))out.push(c+1);
  return out;
}
function bitCells(bits){
  const out=[];
  for(let cell=0;cell<g.cellCount;cell++)if(bits[cell>>>5]&(1<<(cell&31)))
    out.push({cell,column:(cell%g.columns)+1,row:Math.floor(cell/g.columns)+1});
  return out;
}
function playableFromSequence(sequence,cell){
  const h=Array(g.columns).fill(0);
  for(const c of movesOf(sequence))h[c]++;
  return h[g.cellColumn[cell]]===g.cellRow[cell];
}

const resultRows=[];
for(const root of roots){
  const attacker=root.sequence.length&1;
  const setups=[];
  for(const column of legalColumns(root.sequence)){
    const sequence=root.sequence+String(column+1);
    const q=connect4RbaFromMoves(movesOf(sequence),{geometry:g,canonical:false});
    const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
    const interval=absoluteInterval(scratch);
    const terminal=q.words[g.metaOffset]&3;
    const p0Singles=bitCells(scratch.activeSingletonCells);
    const p1Singles=bitCells(scratch.activeSingletonCellsOther);
    const attackerSingles=attacker===0?p0Singles:p1Singles;
    const defenderSingles=attacker===0?p1Singles:p0Singles;
    const playableAttackerSingles=attackerSingles.filter(x=>playableFromSequence(sequence,x.cell));
    const playableDefenderSingles=defenderSingles.filter(x=>playableFromSequence(sequence,x.cell));
    const exactValue=kind===CPC_EXACT?interval[0]:null;
    const attackerAbsoluteValue=attacker===0?1:-1;
    const exactAttackerWin=exactValue===attackerAbsoluteValue;
    setups.push({
      setupColumn:column+1,
      sequence,
      terminalCode:terminal,
      basisSize:q.basis.length,
      cpc:{
        kind,
        kindName:KIND.get(kind),
        absoluteInterval:interval,
        exactAttackerWin,
        forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
        preemptionMask32:scratch.preemptionMask32[0]>>>0,
        preemptionColumns:maskColumns(scratch.preemptionMask32[0]>>>0),
        preemptionCount:scratch.preemptionCount[0],
        precursorCount:scratch.precursorCount[0],
        aggregateSingletonProfile:{
          attacker:attackerSingles.map(({cell,...x})=>x),
          defender:defenderSingles.map(({cell,...x})=>x),
          playableAttacker:playableAttackerSingles.map(({cell,...x})=>x),
          playableDefender:playableDefenderSingles.map(({cell,...x})=>x),
        }
      }
    });
  }
  resultRows.push({...root,attacker:attacker+1,setups});
}

console.log(JSON.stringify({
  schema:'connect4.aggregate_cpc_successor_scan.v1',
  createdAt:new Date().toISOString(),
  jsMinSysSha:EXPECTED_SHA,
  oracleUsed:false,
  solvedInputsUsed:false,
  oneCpcCallPerSuccessor:true,
  semantics:[
    'Each legal attacker setup is followed by exactly one native CPC evaluation over the successor complete active residual basis.',
    'The CPC-produced singleton bitsets are read only as aggregate proof diagnostics; the residual basis is not rescanned by obligation type.',
    'This is theorem-discovery evidence, not a move-selection rule and not ordinary recursive game-tree search.'
  ],
  roots:resultRows
},null,2));

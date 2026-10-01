#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...a)=>execFileSync('git',['-C',library,...a],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const moves=s=>Array.from(s,c=>Number(c)-1);

function q(sequence){
  const x=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {sequence,words:x.words,basis:x.basis};
}
function support(x){return Array.from({length:7},(_,c)=>x.words[c]);}
function playerIds(x,p){
  const base=p?g.p1Offset:g.p0Offset,out=[];
  for(let i=0;i<x.basis.length;i++)if(x.words[base+(i>>>5)]&(1<<(i&31)))out.push(x.basis[i]);
  return out;
}
function minimal(x,p){
  const ids=playerIds(x,p);
  return ids.filter(id=>!ids.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function cells(id){
  const out=[],base=id*4,n=g.shapeSize[id];
  for(let i=0;i<n;i++){
    const cell=g.shapeCells[base+i];
    out.push({cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1});
  }
  return out;
}
function diff(a,b){
  const A=new Set(a),B=new Set(b);
  return {
    onlyA:[...A].filter(x=>!B.has(x)),
    onlyB:[...B].filter(x=>!A.has(x)),
    common:[...A].filter(x=>B.has(x))
  };
}
function digestDiff(ids){
  return ids.map(id=>({id,size:g.shapeSize[id],cells:cells(id)}));
}
function compare(a,b){
  assert.deepEqual(support(a),support(b),'support mismatch');
  assert.deepEqual(Array.from(a.basis),Array.from(b.basis),'basis mismatch at common support');
  const m0=diff(minimal(a,0),minimal(b,0));
  const m1=diff(minimal(a,1),minimal(b,1));
  const raw0=diff(playerIds(a,0),playerIds(b,0));
  const raw1=diff(playerIds(a,1),playerIds(b,1));
  const exactWords=Array.from(a.words).every((v,i)=>v===b.words[i]);
  return {
    A:a.sequence,B:b.sequence,support:support(a),exactWords,
    minimal:{
      p0:{onlyA:digestDiff(m0.onlyA),onlyB:digestDiff(m0.onlyB),commonCount:m0.common.length},
      p1:{onlyA:digestDiff(m1.onlyA),onlyB:digestDiff(m1.onlyB),commonCount:m1.common.length}
    },
    activeCoordinateSymDiff:{
      p0:raw0.onlyA.length+raw0.onlyB.length,
      p1:raw1.onlyA.length+raw1.onlyB.length
    }
  };
}

const states={
  c6_23:q('444441566623'),
  c6_32:q('444441566632'),
  c2_36:q('444441566236'),
  c2_63:q('444441566263'),
  c3_26:q('444441566326'),
  c3_62:q('444441566362')
};
const names=Object.keys(states);
for(const n of names)assert.deepEqual(support(states[n]),[1,1,1,5,1,3,0],n);

const comparisons=[];
for(const a of ['c6_23','c6_32'])
  for(const b of ['c2_36','c2_63','c3_26','c3_62'])
    comparisons.push({left:a,right:b,...compare(states[a],states[b])});

comparisons.sort((x,y)=>{
  const dx=x.activeCoordinateSymDiff.p0+x.activeCoordinateSymDiff.p1;
  const dy=y.activeCoordinateSymDiff.p0+y.activeCoordinateSymDiff.p1;
  return dx-dy;
});

console.log(JSON.stringify({
  schema:'connect4.cpc_two_cell_stutter_isomorphism_probe.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  commonSupport:[1,1,1,5,1,3,0],
  states:Object.fromEntries(Object.entries(states).map(([k,v])=>[k,{sequence:v.sequence,support:support(v),basisSize:v.basis.length,minimalP0:minimal(v,0).length,minimalP1:minimal(v,1).length}])),
  comparisons,
  conclusion:comparisons[0].exactWords
    ?'At least one exact CPC/RBA state identity exists after the two-cell insertion.'
    :'No exact state identity in this finite comparison; inspect the smallest typed residual symmetric difference for a possible stutter quotient.',
  boundary:[
    'This is a structural comparison among consumed-training descendants only.',
    'No oracle value or W/D/L label is used.',
    'Same support fixes the induced residual basis; differences are therefore typed residual-coordinate differences rather than support/basis artifacts.',
    'A useful quotient must be independently proved observation-preserving before promotion.'
  ]
},null,2));

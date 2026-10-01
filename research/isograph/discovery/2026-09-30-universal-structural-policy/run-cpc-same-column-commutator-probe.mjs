#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...a)=>execFileSync('git',['-C',library,...a],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const moves=s=>Array.from(s,c=>Number(c)-1);

function q(sequence){
  const x=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {sequence,words:x.words,basis:x.basis};
}
function support(x){return Array.from({length:g.columns},(_,c)=>x.words[c]);}
function activeIds(x,p){
  const base=p?g.p1Offset:g.p0Offset,out=[];
  for(let i=0;i<x.basis.length;i++)if(x.words[base+(i>>>5)]&(1<<(i&31)))out.push(x.basis[i]);
  return out;
}
function minimal(x,p){
  const ids=activeIds(x,p);
  return ids.filter(id=>!ids.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){
  const out=[],base=id*4,n=g.shapeSize[id];
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function cellName(cell){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1};}
function orientationOfLine(line){
  const base=line*4;
  const c0=g.lineColumn[base],c1=g.lineColumn[base+1];
  const r0=g.lineRow[base],r1=g.lineRow[base+1];
  if(c0===c1)return 'V';
  if(r0===r1)return 'H';
  return 'D';
}
const shapeOrientations=Array.from({length:g.shapeCount},()=>new Set());
for(let line=0;line<g.lineCount;line++){
  const o=orientationOfLine(line);
  for(let bits=1;bits<16;bits++)shapeOrientations[g.lineShape[line*16+bits]].add(o);
}
function digest(id){
  return {id,size:g.shapeSize[id],cells:shapeCells(id).map(cellName),orientations:[...shapeOrientations[id]].sort()};
}
function diff(a,b){
  const A=new Set(a),B=new Set(b);
  return {
    onlyA:[...A].filter(x=>!B.has(x)),
    onlyB:[...B].filter(x=>!A.has(x))
  };
}
function compare(A,B){
  assert.deepEqual(support(A),support(B),'support mismatch');
  assert.deepEqual(Array.from(A.basis),Array.from(B.basis),'basis mismatch');
  const out={support:support(A),players:[]};
  for(let p=0;p<2;p++){
    const raw=diff(activeIds(A,p),activeIds(B,p));
    const min=diff(minimal(A,p),minimal(B,p));
    out.players.push({
      player:p,
      activeSymDiff:raw.onlyA.length+raw.onlyB.length,
      minimalSymDiff:min.onlyA.length+min.onlyB.length,
      minimalOnlyA:min.onlyA.map(digest),
      minimalOnlyB:min.onlyB.map(digest),
      activeOrientationCounts:{
        onlyA:countOrientations(raw.onlyA),
        onlyB:countOrientations(raw.onlyB)
      }
    });
  }
  return out;
}
function countOrientations(ids){
  const counts={H:0,V:0,D:0,mixed:0};
  for(const id of ids){
    const os=[...shapeOrientations[id]];
    if(os.length===1)counts[os[0]]++;
    else counts.mixed++;
  }
  return counts;
}

const parent='444441566';
const centralColumn=6;
const external=[1,2,3,4,5,7];
const rows=[];
for(const d of external){
  // Order A: D6, A6, Dd. Order B: Dd, A6, D6.
  const A=q(parent+'66'+String(d));
  const B=q(parent+String(d)+'66');
  const delta=compare(A,B);
  rows.push({
    externalDefenderColumn:d,
    orderA:A.sequence,
    orderB:B.sequence,
    exactWords:Array.from(A.words).every((v,i)=>v===B.words[i]),
    swappedCells:[
      {column:centralColumn,row:3,orderA:'DEFENDER',orderB:'ATTACKER'},
      {column:centralColumn,row:4,orderA:'ATTACKER',orderB:'DEFENDER'}
    ],
    delta
  });
}

const verticalLinesThroughCentralPair=[];
const lower=(3-1)*g.columns+(centralColumn-1),upper=(4-1)*g.columns+(centralColumn-1);
for(let line=0;line<g.lineCount;line++){
  const base=line*4,cells=Array.from({length:4},(_,i)=>(g.lineRow[base+i])*g.columns+g.lineColumn[base+i]);
  if(cells.includes(lower)||cells.includes(upper)){
    if(orientationOfLine(line)==='V')verticalLinesThroughCentralPair.push({
      cells:cells.map(cellName),
      containsLower:cells.includes(lower),
      containsUpper:cells.includes(upper)
    });
  }
}
assert(verticalLinesThroughCentralPair.every(x=>x.containsLower&&x.containsUpper),
  'expected every vertical line through central pair to contain both');

console.log(JSON.stringify({
  schema:'connect4.cpc_same_column_commutator_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  parent,
  centralPair:{column:centralColumn,rows:[3,4]},
  verticalLinesThroughCentralPair,
  rows,
  conclusion:[
    'same support/rank and identical occupancy outside the central pair',
    'the two orders differ only by swapping player ownership of the central adjacent cells',
    'every vertical Connect-4 line through either central cell contains both cells, so vertical line viability is invariant under the ownership swap',
    'any CPC/RBA residual-coordinate delta must therefore be induced by horizontal/diagonal line incidences through the swapped cells'
  ],
  boundary:[
    'This is a transition-delta probe, not a W/D/L or remoteness theorem.',
    'External defender columns are consumed-training descendants only.',
    'A generic same-column commutator theorem would need boundary cases for adjacent pairs outside rows 3-4.'
  ]
},null,2));
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

const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3;
const C3=2,C5=4,C7=6;
const C3R5=4*7+2;
const C5R4=3*7+4;
const sequence='4444415666662322224233177716111';

const ing=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
const root={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};

function step(q,c){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(c>=0&&c<7&&q.words[c]<6);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,c,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function legalColumns(q){
  const out=[];
  for(let c=0;c<7;c++)if(q.words[c]<6)out.push(c+1);
  return out;
}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return !!(q.words[base+(index>>>5)]&(1<<(index&31)));
}
function hasActiveSingleton(q,player,cell){
  for(let i=0;i<q.n;i++){
    if(q.basis[i]!==cell)continue;
    if(coordHas(q,player,i))return true;
  }
  return false;
}
function exactRbaEqual(a,b){
  if(a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function stateRecord(q){
  return {
    rank:q.words[g.metaOffset]>>>2,
    mover:((q.words[g.metaOffset]>>>2)&1)+1,
    terminal:q.terminal,
    support:support(q),
    legalColumns:legalColumns(q),
    basisSize:q.n,
    rbaWords:Array.from(q.words),
  };
}
function terminalEdge(q,p2Column,p1Column){
  assert.equal(((q.words[g.metaOffset]>>>2)&1),P2);
  const afterP2=step(q,p2Column);
  const triggerNonterminal=afterP2.terminal===0;
  let afterP1=null;
  if(triggerNonterminal)afterP1=step(afterP2,p1Column);
  return {
    p2Column:p2Column+1,
    p2Terminal:afterP2.terminal,
    supportAfterP2:support(afterP2),
    p1Column:p1Column+1,
    p1Terminal:afterP1?.terminal??null,
    supportAfterP1:afterP1?support(afterP1):null,
    accept:triggerNonterminal&&afterP1.terminal===P1_WIN,
  };
}
function transferEdge(q,p2Column,p1Column,expectedSupport){
  assert.equal(((q.words[g.metaOffset]>>>2)&1),P2);
  const afterP2=step(q,p2Column);
  assert.equal(afterP2.terminal,0);
  const afterP1=step(afterP2,p1Column);
  const accept=afterP1.terminal===0&&
    (!expectedSupport||JSON.stringify(support(afterP1))===JSON.stringify(expectedSupport));
  return {
    p2Column:p2Column+1,
    p2Terminal:afterP2.terminal,
    supportAfterP2:support(afterP2),
    p1Column:p1Column+1,
    p1Terminal:afterP1.terminal,
    state:stateRecord(afterP1),
    accept,
    child:afterP1,
  };
}

assert.equal(root.terminal,0);
assert.equal(root.words[g.metaOffset]>>>2,31);
assert.equal((root.words[g.metaOffset]>>>2)&1,P2);
assert.deepEqual(support(root),[6,6,3,6,1,6,3]);
assert.deepEqual(legalColumns(root),[3,5,7]);
const singletonC3=hasActiveSingleton(root,P1,C3R5);
const singletonC5=hasActiveSingleton(root,P1,C5R4);
assert.equal(singletonC3,true);
assert.equal(singletonC5,true);

const directC3=terminalEdge(root,C3,C3);

// P2:c5 -> P1:c7 -> A
const q5=step(root,C5);assert.equal(q5.terminal,0);
const A=step(q5,C7);assert.equal(A.terminal,0);
assert.deepEqual(support(A),[6,6,3,6,2,6,4]);
assert.deepEqual(legalColumns(A),[3,5,7]);
const A_c3=terminalEdge(A,C3,C3);
const A_c5=terminalEdge(A,C5,C5);
const A_c7=transferEdge(A,C7,C7,[6,6,3,6,2,6,6]);
const ZA=A_c7.child;
assert.deepEqual(legalColumns(ZA),[3,5]);
const ZA_c3=terminalEdge(ZA,C3,C3);
const ZA_c5=terminalEdge(ZA,C5,C5);

// P2:c7 -> P1:c7 -> B
const q7=step(root,C7);assert.equal(q7.terminal,0);
const B=step(q7,C7);assert.equal(B.terminal,0);
assert.deepEqual(support(B),[6,6,3,6,1,6,5]);
assert.deepEqual(legalColumns(B),[3,5,7]);
const B_c3=terminalEdge(B,C3,C3);
const B_c5=transferEdge(B,C5,C7,[6,6,3,6,2,6,6]);
const ZB=B_c5.child;
const B_c7=transferEdge(B,C7,C5,[6,6,3,6,2,6,6]);
const ZC=B_c7.child;
for(const z of [ZB,ZC])assert.deepEqual(legalColumns(z),[3,5]);
const ZB_c3=terminalEdge(ZB,C3,C3);
const ZB_c5=terminalEdge(ZB,C5,C5);
const ZC_c3=terminalEdge(ZC,C3,C3);
const ZC_c5=terminalEdge(ZC,C5,C5);

const sinkEquality={
  ZA_ZB:exactRbaEqual(ZA,ZB),
  ZA_ZC:exactRbaEqual(ZA,ZC),
  ZB_ZC:exactRbaEqual(ZB,ZC),
};

const allEdges=[
  directC3,A_c3,A_c5,A_c7,ZA_c3,ZA_c5,
  B_c3,B_c5,B_c7,ZB_c3,ZB_c5,ZC_c3,ZC_c5
];
const accept=allEdges.every(x=>x.accept);

console.log(JSON.stringify({
  schema:'connect4.cpc_three_column_phase_transfer_win.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md',
  root:{
    sequence,
    rank:31,
    mover:2,
    support:support(root),
    legalColumns:legalColumns(root),
    activeP1Singletons:[
      {column:3,row:5,active:singletonC3},
      {column:5,row:4,active:singletonC5},
    ],
  },
  policy:{
    directC3,
    afterP2C5:{
      responseColumn:7,
      stateA:stateRecord(A),
      branches:{c3:A_c3,c5:A_c5,c7:A_c7},
      sinkZA:{
        state:stateRecord(ZA),
        branches:{c3:ZA_c3,c5:ZA_c5},
      },
    },
    afterP2C7:{
      responseColumn:7,
      stateB:stateRecord(B),
      branches:{c3:B_c3,c5:B_c5,c7:B_c7},
      sinkZB:{
        state:stateRecord(ZB),
        branches:{c3:ZB_c3,c5:ZB_c5},
      },
      sinkZC:{
        state:stateRecord(ZC),
        branches:{c3:ZC_c3,c5:ZC_c5},
      },
    },
  },
  sinkEquality,
  accept,
  conclusion:accept?[
    'The frozen three-column phase-transfer policy closes every legal Player-2 branch from the exact rank-31 state.',
    'Every terminal edge is an exact first Player-1 win; every transport edge is legal and nonterminal.',
    'Equal sink support vectors were not merged: all three exact RBA sink orientations were qualified separately.',
    'The rank-31 current state is therefore an exact Player-1 win under this finite CPC obligation policy.',
  ]:[
    'At least one frozen phase-transfer edge failed; the theorem is rejected or requires narrowing.'
  ],
  boundary:[
    'All transitions use exact RBA cofactors and current active singleton attachment.',
    'No oracle, Pons, solved W/D/L input, local game-tree value, minimax, best-move table, physical identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.',
    'No support-only state equivalence is assumed.'
  ]
},null,2));

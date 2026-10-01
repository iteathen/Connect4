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
function rank(x){return x.words[g.metaOffset]>>>2;}
function ids(x,p){
  const base=p?g.p1Offset:g.p0Offset,out=[];
  for(let i=0;i<x.basis.length;i++)if(x.words[base+(i>>>5)]&(1<<(i&31)))out.push(x.basis[i]);
  return out;
}
function minimal(x,p){
  const all=ids(x,p);
  return all.filter(id=>!all.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function implies(left,right){
  // OR-of-AND minimal residual formulas:
  // phi(left) => phi(right) iff every left term contains some right term.
  for(const l of left){
    let ok=false;
    for(const r of right)if(connect4RbaShapeSubset(g,r,l)){ok=true;break;}
    if(!ok)return false;
  }
  return true;
}
function firstImplicationFailure(left,right){
  for(const l of left){
    let ok=false;
    for(const r of right)if(connect4RbaShapeSubset(g,r,l)){ok=true;break;}
    if(!ok)return l;
  }
  return null;
}
function cells(id){
  const out=[],base=id*4,n=g.shapeSize[id];
  for(let i=0;i<n;i++){
    const cell=g.shapeCells[base+i];
    out.push({cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1});
  }
  return out;
}
function dominance(A,B){
  assert.deepEqual(support(A),support(B));
  assert.equal(rank(A)&1,rank(B)&1);
  const a0=minimal(A,0),a1=minimal(A,1),b0=minimal(B,0),b1=minimal(B,1);
  // Historical RID convention:
  // A >= B for absolute P0 iff phi_P0(B)=>phi_P0(A) and phi_P1(A)=>phi_P1(B).
  const p0=implies(b0,a0),p1=implies(a1,b1);
  return {
    dominates:p0&&p1,
    p0Implication:p0,
    p1Implication:p1,
    p0Failure:p0?null:firstImplicationFailure(b0,a0),
    p1Failure:p1?null:firstImplicationFailure(a1,b1),
    minimalCounts:{A:{p0:a0.length,p1:a1.length},B:{p0:b0.length,p1:b1.length}}
  };
}

const parent='444441566',external=[1,2,3,4,5,7];
const rows=[];
for(const d of external){
  // A = candidate6 then P0 attacks column6, P1 external response.
  // B = P1 external placement first, then P0/P1 consume the column6 adjacent pair.
  const A=q(parent+'66'+String(d));
  const B=q(parent+String(d)+'66');
  const A_ge_B=dominance(A,B),B_ge_A=dominance(B,A);
  rows.push({
    externalDefenderColumn:d,
    A:A.sequence,
    B:B.sequence,
    support:support(A),
    A_ge_B,
    B_ge_A,
    relation:A_ge_B.dominates&&B_ge_A.dominates?'MUTUAL':
      A_ge_B.dominates?'A_DOMINATES_B':
      B_ge_A.dominates?'B_DOMINATES_A':'INCOMPARABLE',
    failures:{
      A_ge_B:{
        p0:A_ge_B.p0Failure===null?null:{id:A_ge_B.p0Failure,cells:cells(A_ge_B.p0Failure)},
        p1:A_ge_B.p1Failure===null?null:{id:A_ge_B.p1Failure,cells:cells(A_ge_B.p1Failure)}
      },
      B_ge_A:{
        p0:B_ge_A.p0Failure===null?null:{id:B_ge_A.p0Failure,cells:cells(B_ge_A.p0Failure)},
        p1:B_ge_A.p1Failure===null?null:{id:B_ge_A.p1Failure,cells:cells(B_ge_A.p1Failure)}
      }
    }
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_same_column_commutator_dominance.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  relationAuthority:'historical RID residual implication order over exact same-support CPC/RBA minimal residual formulas',
  rows,
  summary:Object.fromEntries([...new Set(rows.map(x=>x.relation))].map(rel=>[rel,rows.filter(x=>x.relation===rel).map(x=>x.externalDefenderColumn)])),
  interpretation:[
    'A is the candidate-6 same-column ownership-swap endpoint; B is the alternate-order endpoint at identical support/rank.',
    'B_DOMINATES_A means A is structurally no easier for P0 and no harder for P1 than B under the historical residual implication preorder.',
    'The historical preorder had zero transition violations in bounded standard-7x6 depth-8 controls and zero exact-distance monotonicity violations in complete small-board controls; those are qualification clues, not a universal proof.'
  ],
  boundary:[
    'No oracle W/D/L or strong score is used.',
    'This consumed-boundary probe does not itself prove universal RID monotonicity or exact-distance dominance on 7x6.',
    'A consistent direction would motivate a formal proof from the exact RBA cofactor laws and fresh qualification before use in v5.'
  ]
},null,2));
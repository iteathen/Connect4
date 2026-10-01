#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const library=process.argv[2],EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';assert(library);
const git=(...a)=>execFileSync('git',['-C',library,...a],{encoding:'utf8'}).trim();assert.equal(git('rev-parse','HEAD'),EXPECTED);
const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const g=prepareConnect4RbaGeometry({columns:7,rows:6}),profile=prepareConnect4RbaExecutionProfile(g);
const baseSeq='4444415666662322224233177716115';
const ing=connect4RbaFromMoves(Array.from(baseSeq,c=>+c-1),{geometry:g,canonical:false});
const base={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};
assert.equal(base.words[g.metaOffset]>>>2,31);assert.deepEqual(Array.from(base.words.slice(0,7)),[5,6,3,6,2,6,3]);
function step(q,c){const w=new Uint32Array(g.keyWords),b=new Uint32Array(g.maxBasis),s=new Uint32Array(g.shapeWordCount),z=new Uint32Array(1);const t=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,c,w,0,b,0,s,z,0);return {words:w,basis:b,n:z[0],terminal:t};}
function eq(a,b){if(a.n!==b.n)return false;for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;return true;}
function support(q){return Array.from(q.words.slice(0,7));}
const a1=step(base,0),a2=step(a1,6); // P2 c1, P1 c7
const b1=step(base,6),b2=step(b1,0); // P2 c7, P1 c1
assert.equal(a1.terminal,0);assert.equal(a2.terminal,0);assert.equal(b1.terminal,0);assert.equal(b2.terminal,0);
const wordDiff=[];for(let i=0;i<g.keyWords;i++)if(a2.words[i]!==b2.words[i])wordDiff.push({index:i,a:a2.words[i],b:b2.words[i]});
const basisDiff=[];for(let i=0;i<Math.max(a2.n,b2.n);i++)if(a2.basis[i]!==b2.basis[i])basisDiff.push({index:i,a:a2.basis[i]??null,b:b2.basis[i]??null});
console.log(JSON.stringify({
 schema:'connect4.cpc_rank30_c5_escape_commutation.v1',jsMinSysSha:EXPECTED,oracleUsed:false,solvedInputsUsed:false,
 base:{sequence:baseSeq,rank:31,mover:2,support:support(base)},
 branchA:{moves:[1,7],support:support(a2),rank:a2.words[g.metaOffset]>>>2,basisSize:a2.n},
 branchB:{moves:[7,1],support:support(b2),rank:b2.words[g.metaOffset]>>>2,basisSize:b2.n},
 exactRbaEqual:eq(a2,b2),wordDiff,basisDiff,
 conclusion:[
  'This probe tests whether the two cross-reservoir escape/response orders collapse to the same exact RBA state.',
  'Exact equality is stronger than support equality and automatically consumes any neutral/gray ownership quotient already represented by RBA.'
 ],
 boundary:[
  'No oracle, Pons, solved W/D/L, local game-tree values, minimax, best-move table, physical identity, or sealed holdout is used.',
  'Production CPC and JSMinSys are read-only and unchanged.'
 ]
},null,2));

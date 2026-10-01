#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const library=process.argv[2],EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
assert(library);const git=(...a)=>execFileSync('git',['-C',library,...a],{encoding:'utf8'}).trim();assert.equal(git('rev-parse','HEAD'),EXPECTED);
const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const g=prepareConnect4RbaGeometry({columns:7,rows:6}),profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P1_WIN=3,DRAW=2,P2_WIN=1;
function from(seq){const x=connect4RbaFromMoves(Array.from(seq,c=>+c-1),{geometry:g,canonical:false});return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};}
function step(q,c){const w=new Uint32Array(g.keyWords),b=new Uint32Array(g.maxBasis),s=new Uint32Array(g.shapeWordCount),z=new Uint32Array(1);const t=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,c,w,0,b,0,s,z,0);return {words:w,basis:b,n:z[0],terminal:t};}
function support(q){return Array.from(q.words.slice(0,7));}
function key(q){let s='';for(let i=0;i<g.keyWords;i++)s+=q.words[i].toString(36)+'.';return s;}
function solveRoot(root){
 const memo=new Map();let nodes=0,hits=0;
 function solve(q){nodes++;const t=q.words[g.metaOffset]&3;if(t)return t;const k=key(q),m=memo.get(k);if(m!==undefined){hits++;return m;}const p=(q.words[g.metaOffset]>>>2)&1;let best=p===P1?0:4;for(let c=0;c<7;c++)if(q.words[c]<6){const v=solve(step(q,c));if(p===P1){if(v>best)best=v;if(best===P1_WIN)break;}else{if(v<best)best=v;if(best===P2_WIN)break;}}if(best===0||best===4)best=DRAW;memo.set(k,best);return best;}
 const value=solve(root),moves=[];for(let c=0;c<7;c++)if(root.words[c]<6)moves.push({column:c+1,value:solve(step(root,c))});
 return {value,bestMoves:moves.filter(x=>x.value===value).map(x=>x.column),moves,nodes,memoSize:memo.size,memoHits:hits};
}
const parentSeq='4444415666662322224233177716111';
const parent=from(parentSeq);
assert.equal(parent.words[g.metaOffset]>>>2,31);assert.equal((parent.words[g.metaOffset]>>>2)&1,1);
assert.deepEqual(support(parent),[6,6,3,6,1,6,3]);
const rows=[];
for(const d of [2,4,6]){
 const child=step(parent,d);assert.equal(child.terminal,0);
 const disc=solveRoot(child);
 rows.push({p2Column:d+1,rank:child.words[g.metaOffset]>>>2,support:support(child),discovery:disc});
}
console.log(JSON.stringify({
 schema:'connect4.rba_three_column_phase_transfer_discovery.v1',jsMinSysSha:EXPECTED,
 oracleUsed:false,solvedInputsUsed:false,ordinaryGameTreeSearchUsed:true,proofPremiseAllowed:false,
 parent:{sequence:parentSeq,rank:31,mover:2,support:support(parent),legalColumns:[3,5,7]},
 rows,valueEncoding:{1:'P2_WIN',2:'DRAW',3:'P1_WIN'},
 boundary:[
  'Discovery/falsification only; values are forbidden as structural theorem or runtime policy premises.',
  'The rank-31 three-column state is reached through previously identified CPC-forced handoffs.',
  'No Pons, external oracle, solved database, opening book, best-move table, physical identity, or sealed holdout is used.',
  'Production CPC and JSMinSys are unchanged.'
 ]
},null,2));

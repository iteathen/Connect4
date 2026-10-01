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
function step(q,c){const w=new Uint32Array(g.keyWords),b=new Uint32Array(g.maxBasis),s=new Uint32Array(g.shapeWordCount),z=new Uint32Array(1);const t=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,c,w,0,b,0,s,z,0);return {words:w,basis:b,n:z[0],terminal:t};}
function coordHas(q,p,i){const b=p?g.p1Offset:g.p0Offset;return !!(q.words[b+(i>>>5)]&(1<<(i&31)));}
function active(q,p){const out=[];for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);return out;}
function desc(id){const n=g.shapeSize[id],b=id*4,cells=[];for(let i=0;i<n;i++){const cell=g.shapeCells[b+i];cells.push({cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1});}return {diagnosticId:id,size:n,cells};}
function diff(a,b){const A=new Set(a),B=new Set(b);return {onlyA:a.filter(x=>!B.has(x)).map(desc),onlyB:b.filter(x=>!A.has(x)).map(desc)};}
const a=step(step(base,0),6),b=step(step(base,6),0);
assert.deepEqual(Array.from(a.words.slice(0,7)),Array.from(b.words.slice(0,7)));
assert.deepEqual(Array.from(a.basis.slice(0,a.n)),Array.from(b.basis.slice(0,b.n)));
const wordDiff=[];for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])wordDiff.push({index:i,a:a.words[i],b:b.words[i],xor:(a.words[i]^b.words[i])>>>0});
const p0a=active(a,0),p0b=active(b,0),p1a=active(a,1),p1b=active(b,1);
console.log(JSON.stringify({
 schema:'connect4.cpc_rank30_c5_escape_orientation_diff.v1',jsMinSysSha:EXPECTED,oracleUsed:false,solvedInputsUsed:false,
 geometry:{keyWords:g.keyWords,coordWords:g.coordWords,p0Offset:g.p0Offset,p1Offset:g.p1Offset,metaOffset:g.metaOffset},
 support:Array.from(a.words.slice(0,7)),basisSize:a.n,wordDiff,
 player1:diff(p0a,p0b),player2:diff(p1a,p1b),
 branchA:{moves:[1,7]},branchB:{moves:[7,1]},
 conclusion:[
  'The two escape orders share support and basis but retain a typed RBA ownership distinction.',
  'The symmetric coordinate difference identifies the minimum semantic state needed before any quotient or response-debt compression.'
 ],
 boundary:[
  'No oracle, solved W/D/L, local game-tree values, Pons, minimax, physical identity, or sealed holdout is used.',
  'Production CPC and JSMinSys are unchanged.'
 ]
},null,2));

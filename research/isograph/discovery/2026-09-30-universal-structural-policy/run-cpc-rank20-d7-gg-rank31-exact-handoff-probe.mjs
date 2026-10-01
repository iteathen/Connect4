#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const LEAF='444441566666232222425511575377';
const ACTION='3';
const QUAL=JSON.parse(readFileSync(resolve(import.meta.dirname,'CPC_RANK31_C3_TARGET_RESERVOIR_QUALIFICATION_0_1.json'),'utf8'));
const ROOT=QUAL.state.sequence;
const candidateSeq=LEAF+ACTION;
const git=(...a)=>execFileSync('git',['-C',library,...a],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});
function jq(s){const x=connect4RbaFromMoves([...s].map(c=>Number(c)-1),{geometry:g,canonical:false});return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};}
function cells(id){const a=[],b=id*4;for(let i=0;i<g.shapeSize[id];i++)a.push(g.shapeCells[b+i]);return a.sort((x,y)=>x-y);}
function has(q,p,i){const base=p?g.p1Offset:g.p0Offset;return (q.words[base+(i>>>5)]&(1<<(i&31)))!==0;}
function norm(q,p){const arr=[];for(let i=0;i<q.n;i++)if(has(q,p,i))arr.push(cells(q.basis[i]));return arr.filter((a,i)=>!arr.some((b,j)=>i!==j&&b.length<a.length&&b.every(x=>a.includes(x)))).map(x=>x.join(',')).sort();}
function desc(q){return {rank:q.words[g.metaOffset]>>>2,mover:(q.words[g.metaOffset]>>>2)&1,support:Array.from(q.words.slice(0,7)),p0:norm(q,0),p1:norm(q,1),terminal:q.terminal};}
const a=desc(jq(candidateSeq)),b=desc(jq(ROOT));
const jsEqual=JSON.stringify(a)===JSON.stringify(b);

const repoRoot=resolve(import.meta.dirname,'../../../..');
const {createSlot64ResidualQuotientKernel}=await import(pathToFileURL(resolve(repoRoot,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const {kernel}=createSlot64ResidualQuotientKernel({columns:7,rows:6,connect:4},{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});kernel.prepareSearchStorage();
function replay(s){let id=kernel.rootId;for(const d of s){id=kernel.advance(id,Number(d)-1);assert(id>=0);}return id;}
function termCells(t){const out=[];for(let x=0;x<42;x++){const yes=x<32?(((t[0]>>>x)&1)!==0):(((t[1]>>>(x-32))&1)!==0);if(yes)out.push(x);}return out;}
function semDesc(id){const support=[];for(let c=0;c<7;c++){const x=kernel.supportAccess.landingAt(kernel.states.supportAt(id),c);support.push(x===0xff?6:Math.floor(x/7));}const terms=p=>kernel.classes.terms(p===0?kernel.states.p0At(id):kernel.states.p1At(id)).map(termCells).map(x=>x.join(',')).sort();return {rank:kernel.supportAccess.rankAt(kernel.states.supportAt(id)),support,p0:terms(0),p1:terms(1)};}
const sa=semDesc(replay(candidateSeq)),sb=semDesc(replay(ROOT));
const semanticEqual=JSON.stringify(sa)===JSON.stringify(sb);
const accept=jsEqual&&semanticEqual&&QUAL.accept===true;
console.log(JSON.stringify({schema:'connect4.cpc_rank20_d7_gg_rank31_exact_handoff_probe.v1',jsMinSysSha:EXPECTED,leafSequence:LEAF,actionColumn:3,candidateSequence:candidateSeq,qualifiedSequence:ROOT,candidateJs:a,qualifiedJs:b,jsExactQEqual:jsEqual,candidateSemantic:sa,qualifiedSemantic:sb,semanticExactQEqual:semanticEqual,qualifiedTargetReservoirAccepted:QUAL.accept,accept,oracleUsed:false,solvedInputsUsed:false,productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,conclusion:accept?'Exact q equality holds after P0:c3; the rank30 leaf inherits the qualified rank31 target-reservoir win by exact handoff.':'The support collision does not establish exact q equality; reject the handoff.'},null,2));

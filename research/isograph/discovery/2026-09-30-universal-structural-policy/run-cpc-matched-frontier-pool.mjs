#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-matched-frontier-pool.mjs <JSMinSys checkout>');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const moves=s=>Array.from(s,c=>Number(c)-1);

function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const mover=q=>rank(q)&1;
const terminal=q=>q.words[g.metaOffset]&3;
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function shapeCells(id){const out=[],base=id*4,n=g.shapeSize[id];for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
function cellName(cell){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1};}
function activeMinimal(q,player){
  const base=player?g.p1Offset:g.p0Offset,ids=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))ids.push(q.basis[i]);
  return ids.filter(id=>!ids.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function pooledTemplate(q){
  const pool=[],responseCells=[],verticalMate=new Map();
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],remaining=g.rows-h;
    if(!remaining)continue;
    let start=h;
    if(remaining&1){pool.push(h*g.columns+c);start+=1;}
    for(let r=start;r+1<g.rows;r+=2){
      const lo=r*g.columns+c,hi=(r+1)*g.columns+c;
      responseCells.push(hi);verticalMate.set(lo,hi);
    }
  }
  return {pool,responseCells,verticalMate};
}
function perfectMatchings(xs){
  if(!xs.length)return [[]];
  const [a,...tail]=xs,out=[];
  for(let i=0;i<tail.length;i++){
    const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));
    for(const m of perfectMatchings(rest))out.push([[a,b],...m]);
  }
  return out;
}
function matchingMap(m){
  const x=new Map();
  for(const [a,b] of m){x.set(a,b);x.set(b,a);}
  return x;
}
function coversByMatching(id,responseSet,m){
  const cells=shapeCells(id),set=new Set(cells);
  if(cells.some(c=>responseSet.has(c)))return {covered:true,mode:'VERTICAL'};
  for(const [a,b] of m)if(set.has(a)&&set.has(b))return {covered:true,mode:'POOL_PAIR',edge:[a,b]};
  return {covered:false,mode:null};
}
function terminalPolarity(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  const ac=attacker===0?3:1;
  return code===ac?'ATTACKER':'DEFENDER';
}
let cofactorCount=0;
function cofactor(q,c){
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,c,q.words[c],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}

// Explicit one-policy executor. Once a pool pair is consumed, both columns enter
// their declared vertical suffix. The original mate maps remain valid because
// all response cells are fixed physical cells from the root template.
function verifyPolicy(q,attacker,matching){
  const t=pooledTemplate(q),poolMate=matchingMap(matching);
  const rootResponse=new Map(t.verticalMate);
  for(const [a,b] of matching){rootResponse.set(a,b);rootResponse.set(b,a);}
  const memo=new Map(),inProgress=new Set();
  function key(x){return Array.from(x.words).join(',')+'|'+Array.from(x.basis).join(',');}
  function walk(x){
    if(terminal(x)!==0)return true;
    const k=key(x);if(memo.has(k))return memo.get(k);
    if(inProgress.has(k))throw new Error('policy cycle');
    inProgress.add(k);
    for(const c of legal(x)){
      const cell=x.words[c]*g.columns+c;
      const first=cofactor(x,c),p1=terminalPolarity(first.term,attacker);
      if(p1==='ATTACKER'){memo.set(k,false);inProgress.delete(k);return false;}
      if(p1==='DRAW'||p1==='DEFENDER')continue;
      const mate=rootResponse.get(cell);
      if(mate===undefined){memo.set(k,false);inProgress.delete(k);return false;}
      const rc=g.cellColumn[mate],rr=g.cellRow[mate];
      if(first.q.words[rc]!==rr){memo.set(k,false);inProgress.delete(k);return false;}
      const second=cofactor(first.q,rc),p2=terminalPolarity(second.term,attacker);
      if(p2==='DRAW'||p2==='DEFENDER')continue;
      if(!walk(second.q)){memo.set(k,false);inProgress.delete(k);return false;}
    }
    memo.set(k,true);inProgress.delete(k);return true;
  }
  const safe=walk(q);
  return {safe,states:memo.size};
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];
const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(rank(q),10);assert.equal(terminal(q),0);
  const t=pooledTemplate(q),responseSet=new Set(t.responseCells),
    residuals=activeMinimal(q,attacker);
  const matchings=perfectMatchings(t.pool).map(m=>{
    const residualCoverage=residuals.map(id=>({id,...coversByMatching(id,responseSet,m)}));
    const uncovered=residualCoverage.filter(x=>!x.covered).map(x=>x.id);
    const pairCovered=residualCoverage.filter(x=>x.mode==='POOL_PAIR').map(x=>({id:x.id,edge:x.edge.map(cellName)}));
    let explicit=null;
    if(uncovered.length===0)explicit=verifyPolicy(q,attacker,m);
    return {
      edges:m.map(e=>e.map(cellName)),
      uncovered,
      pairCovered,
      completeCoverage:uncovered.length===0,
      explicitPolicy:explicit
    };
  });
  rows.push({
    ...root,
    pool:t.pool.map(cellName),
    verticalResponseCells:t.responseCells.map(cellName),
    activeMinimalResidualCount:residuals.length,
    matchings
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_matched_frontier_pool.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:[
    'partition the even frontier pool into fixed pairs',
    'pool trigger -> defender occupies its fixed mate',
    'non-pool lower trigger -> defender occupies its fixed vertical upper mate',
    'sufficient root coverage: every active minimal attacker residual either intersects a vertical response cell or contains both endpoints of at least one pool pair',
    'when root coverage is complete, explicitly execute the resulting policy against every legal attacker trigger as an independent bounded check'
  ],
  rows,
  work:{cofactorCount},
  boundary:[
    'Consumed-boundary theorem-discovery control.',
    'A matching that covers only some defects is not a safety certificate.',
    'No oracle values or solved outcomes are used.',
    'Do not promote the theorem unless a complete-coverage case passes explicit policy execution and then fresh structural qualification.'
  ]
},null,2));

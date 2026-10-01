#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-bc-ladder-template-gap.mjs <JSMinSys checkout>');
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
function activeMinimal(q,player){
  const base=player===0?g.p0Offset:g.p1Offset,ids=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))ids.push(q.basis[i]);
  return ids.filter(id=>!ids.some(other=>other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)));
}
function shapeCells(id){const out=[],base=id*4;for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[base+i]);return out;}
function cellName(cell){return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1};}
let cfCount=0;
function cofactor(q,c){
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(g,profile,q.words,0,q.basis,0,q.basis.length,c,q.words[c],words,0,basisBuf,0,seen,sizes,0);
  cfCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}
function pairingsAll(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(let i=0;i<tail.length;i++){
    const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));
    for(const p of pairingsAll(rest))out.push([[a,b],...p]);
  }
  return out;
}
function optionalMatchings(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(const p of optionalMatchings(tail))out.push(p);
  for(let i=0;i<tail.length;i++){
    const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));
    for(const p of optionalMatchings(rest))out.push([[a,b],...p]);
  }
  return out;
}
function product(arrays,i=0,prefix=[],out=[]){
  if(i===arrays.length){out.push(prefix.slice());return out;}
  for(const v of arrays[i]){prefix.push(v);product(arrays,i+1,prefix,out);prefix.pop();}
  return out;
}
function templates(q){
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),odds=[],evens=[];
  for(let c=0;c<g.columns;c++){if(!rem[c])continue;(rem[c]&1?odds:evens).push(c);}
  if(odds.length&1)return [];
  const out=[];
  for(const opairs of pairingsAll(odds))for(const epairs of optionalMatchings(evens)){
    const pairs=[...opairs,...epairs],paired=new Set(pairs.flat());
    const choices=pairs.map(([a,b])=>{
      const parity=rem[a]&1,ls=[];
      for(let L=1;L<=Math.min(rem[a],rem[b]);L++)if((L&1)===parity)ls.push(L);
      return ls;
    });
    if(choices.some(x=>!x.length))continue;
    for(const lengths of product(choices)){
      const vertical=new Set(),cross=[],pairDesc=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];
        pairDesc.push({cols:[a+1,b+1],length:L});
        for(let j=0;j<L;j++){
          const ca=(q.words[a]+j)*g.columns+a,cb=(q.words[b]+j)*g.columns+b;
          cross.push([ca,cb]);
        }
        for(const c of [a,b])for(let r=q.words[c]+L;r+1<g.rows;r+=2)vertical.add((r+1)*g.columns+c);
      }
      let valid=true;
      for(let c=0;c<g.columns;c++)if(!paired.has(c)){
        if(rem[c]&1){valid=false;break;}
        for(let r=q.words[c];r+1<g.rows;r+=2)vertical.add((r+1)*g.columns+c);
      }
      if(valid)out.push({pairs:pairDesc,vertical,cross});
    }
  }
  return out;
}
function covers(id,T){
  const cs=shapeCells(id);
  if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);
  return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
function bestBc6(q,attacker){
  const residuals=activeMinimal(q,attacker);
  const candidates=templates(q).filter(T=>T.pairs.some(p=>p.cols[0]===2&&p.cols[1]===3&&p.length===6));
  let best=null;
  for(const T of candidates){
    const uncovered=residuals.filter(id=>!covers(id,T));
    if(!best||uncovered.length<best.uncovered.length)best={T,uncovered};
  }
  return {
    candidateTemplates:candidates.length,
    activeMinimalResiduals:residuals.length,
    best:best&&{
      pairs:best.T.pairs,
      uncovered:best.uncovered.map(id=>({id,size:g.shapeSize[id],cells:shapeCells(id).map(cellName)}))
    }
  };
}
const roots=[
  {id:'c6_r4',sequence:'444441566614'},
  {id:'c6_r5',sequence:'444441566615'},
  {id:'c6_r6',sequence:'444441566616'},
];
const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(rank(q),12);assert.equal(terminal(q),0);
  const first=cofactor(q,0);
  assert.equal(first.term,0);
  const branches=[];
  for(const d of legal(first.q)){
    if(d===1||d===2)continue; // outside B/C responses only
    const second=cofactor(first.q,d);
    if(second.term!==0){branches.push({responseColumn:d+1,terminal:second.term});continue;}
    branches.push({
      responseColumn:d+1,
      support:Array.from(second.q.words.slice(0,g.columns)),
      bcHeights:[second.q.words[1],second.q.words[2]],
      bc6:bestBc6(second.q,attacker)
    });
  }
  rows.push({...root,triggerColumn:1,branches});
}
console.log(JSON.stringify({
  schema:'connect4.cpc_bc_ladder_template_gap.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,solvedInputsUsed:false,
  rows,work:{cofactorCount:cfCount},
  interpretation:[
    'Each branch is after the c6 first-failure column-1 attacker trigger and one defender response outside B/C.',
    'The diagnostic forces a full six-level synchronized B/C channel and optimizes only the disjoint companion pairings.',
    'Uncovered residuals are the exact remaining proof burden outside that ladder channel.'
  ],
  boundary:[
    'Consumed-training theorem-discovery diagnostic only.',
    'A small uncovered set does not imply a valid certificate switch.',
    'Any promoted rule must preserve exact response legality, first-win order, and all uncovered residual obligations.'
  ]
},null,2));
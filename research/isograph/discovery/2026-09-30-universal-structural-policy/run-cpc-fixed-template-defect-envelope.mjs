#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});

function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)));
}
function cells(id){
  const out=[],n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function earliest(q,id,player){
  const rank=q.words[g.metaOffset]>>>2,mover=rank&1,remaining=g.cellCount-rank,first=player===mover?1:2;
  const needs=cells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
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
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]);
  const odds=[],evens=[];
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
      const vertical=new Set(),cross=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];
        for(let j=0;j<L;j++)cross.push([(q.words[a]+j)*g.columns+a,(q.words[b]+j)*g.columns+b]);
        for(const c of [a,b])for(let r=q.words[c]+L;r+1<g.rows;r+=2)vertical.add((r+1)*g.columns+c);
      }
      let valid=true;
      for(let c=0;c<g.columns;c++)if(!paired.has(c)){
        if(rem[c]&1){valid=false;break;}
        for(let r=q.words[c];r+1<g.rows;r+=2)vertical.add((r+1)*g.columns+c);
      }
      if(valid)out.push({pairs:pairs.map((p,i)=>({cols:p.map(c=>c+1),length:lengths[i]})),vertical,cross});
    }
  }
  return out;
}
function covers(id,T){
  const cs=cells(id);
  if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);
  return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
function envelope(sequence){
  const q=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  const rank=q.words[g.metaOffset]>>>2,attacker=rank&1;
  const residuals=activeMinimal(q,attacker).map(id=>({id,deadline:earliest(q,id,attacker)})).filter(x=>x.deadline!==null);
  const ts=templates(q);
  const maxHorizon=Math.min(g.cellCount-rank,15);
  const horizons=[];
  for(let D=1;D<=maxHorizon;D+=2){
    const critical=residuals.filter(r=>r.deadline<=D);
    let minUncovered=Infinity,best=null;
    for(const T of ts){
      const uncovered=critical.filter(r=>!covers(r.id,T));
      if(uncovered.length<minUncovered){
        minUncovered=uncovered.length;
        best={pairs:T.pairs,uncovered:uncovered.map(r=>r.id)};
      }
    }
    if(!ts.length){minUncovered=null;best=null;}
    horizons.push({D,criticalResidualCount:critical.length,minUncovered,best});
  }
  return {sequence,rank,attacker:attacker+1,basisSize:q.basis.length,minimalResidualCount:residuals.length,templateCount:ts.length,horizons};
}
const states=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
  {id:'candidate6_split_2_then_3',sequence:'444441566623'},
  {id:'candidate6_split_3_then_2',sequence:'444441566632'},
];
const rows=states.map(s=>({...s,...envelope(s.sequence)}));

function defects(row){return row.horizons.map(h=>[h.D,h.minUncovered]);}
assert.equal(rows[0].horizons.find(x=>x.D===3).minUncovered,0);
assert(rows[0].horizons.find(x=>x.D===5).minUncovered>0);
assert.equal(rows[1].horizons.find(x=>x.D===3).minUncovered,0);
assert(rows[1].horizons.find(x=>x.D===5).minUncovered>0);
for(const r of rows.slice(2)){
  assert.equal(r.horizons.find(x=>x.D===5).minUncovered,0);
  assert(r.horizons.find(x=>x.D===7).minUncovered>0);
}

console.log(JSON.stringify({
  schema:'connect4.cpc_fixed_template_defect_envelope.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  obligationSource:'minimal active generators of native RBA/CPC residual coordinate',
  definition:'delta_D(P)=minimum, over every qualified complete synchronized-response template, of the count of active minimal attacker residuals with optimistic completion rank <= D that the template does not cover',
  rows,
  compact:rows.map(r=>({id:r.id,defects:defects(r)})),
  soundness:[
    'delta_D(P)=0 is exactly a constructive fixed-template survival-through-D certificate in this response-template family.',
    'delta_D(P)>0 proves only that no single template in this family covers all D-critical residuals; it is not a forced-win or upper-distance certificate.',
    'The minimization removes arbitrary template identity, so the envelope is invariant to rematching within the qualified family.'
  ]
},null,2));

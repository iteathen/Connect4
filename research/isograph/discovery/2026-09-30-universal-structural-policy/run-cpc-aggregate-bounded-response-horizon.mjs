#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [library]=process.argv.slice(2);
assert.ok(library);

const EXPECTED_JSMINSYS_SHA='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED_JSMINSYS_SHA);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const W=g.columns,H=g.rows;

function coordHas(words,base,index){
  return (words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeResiduals(q,player){
  const base=player?g.p1Offset:g.p0Offset,out=[];
  for(let i=0;i<q.basis.length;i++){
    if(!coordHas(q.words,base,i))continue;
    const shape=q.basis[i],size=g.shapeSize[shape],cells=[];
    for(let j=0;j<size;j++)cells.push(g.shapeCells[shape*4+j]);
    out.push({basisIndex:i,shape,cells});
  }
  return out;
}
function earliestOptimistic(q,player,cells){
  const rank=q.words[g.metaOffset]>>>2;
  const mover=rank&1;
  const remaining=g.cellCount-rank;
  const first=player===mover?1:2;
  const needs=cells.map(cell=>{
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    return r-q.words[c]+1;
  }).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){
    while(slot<need)slot+=2;
    if(slot>remaining)return null;
    slot+=2;
  }
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
function completeResponseTemplates(q){
  const rem=Array.from({length:W},(_,c)=>H-q.words[c]);
  const odds=[],evens=[];
  for(let c=0;c<W;c++){
    if(rem[c]===0)continue;
    (rem[c]&1?odds:evens).push(c);
  }
  if(odds.length&1)return [];
  const out=[];
  for(const opairs of pairingsAll(odds)){
    for(const epairs of optionalMatchings(evens)){
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
          for(let j=0;j<L;j++){
            const ca=(q.words[a]+j)*W+a;
            const cb=(q.words[b]+j)*W+b;
            cross.push([ca,cb]);
          }
          for(const c of [a,b])
            for(let r=q.words[c]+L;r+1<H;r+=2)vertical.add((r+1)*W+c);
        }
        let valid=true;
        for(let c=0;c<W;c++)if(!paired.has(c)){
          if(rem[c]&1){valid=false;break;}
          for(let r=q.words[c];r+1<H;r+=2)vertical.add((r+1)*W+c);
        }
        if(valid)out.push({
          pairs:pairs.map((p,i)=>({columns:p.map(c=>c+1),length:lengths[i]})),
          vertical,cross
        });
      }
    }
  }
  return out;
}
function covers(cells,T){
  if(cells.some(cell=>T.vertical.has(cell)))return true;
  const set=new Set(cells);
  return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
function aggregateBoundedResponseHorizon(q,attacker){
  const residuals=activeResiduals(q,attacker).map(r=>({
    ...r,
    deadline:earliestOptimistic(q,attacker,r.cells),
  })).filter(r=>r.deadline!==null).sort((a,b)=>a.deadline-b.deadline||a.cells.length-b.cells.length);
  let best={horizon:-1,template:null,firstUncovered:[]};
  for(const T of completeResponseTemplates(q)){
    const uncovered=residuals.filter(r=>!covers(r.cells,T));
    const first=uncovered.length?uncovered[0].deadline:Infinity;
    const rank=q.words[g.metaOffset]>>>2;
    const horizon=Number.isFinite(first)?first-2:g.cellCount-rank;
    if(horizon>best.horizon)best={horizon,template:T,firstUncovered:uncovered.slice(0,8)};
  }
  return {
    activeResidualCount:activeResiduals(q,attacker).length,
    horizon:best.horizon,
    templatePairs:best.template?.pairs??null,
    firstUncovered:best.firstUncovered.map(r=>({
      deadline:r.deadline,
      shape:r.shape,
      cells:r.cells.map(cell=>({column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1}))
    }))
  };
}

const root='444441566';
const rows=[];
for(const candidate of [2,3,6]){
  const sequence=root+candidate;
  const q=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  const rank=q.words[g.metaOffset]>>>2,attacker=rank&1;
  const result=aggregateBoundedResponseHorizon(q,attacker);
  rows.push({candidate,sequence,rank,attacker:attacker+1,basisSize:q.basis.length,result});
}
assert.deepEqual(rows.map(r=>r.result.horizon),[3,3,5]);

console.log(JSON.stringify({
  schema:'connect4.cpc_aggregate_bounded_response_horizon.v1',
  createdAt:new Date().toISOString(),
  jsMinSysSha:EXPECTED_JSMINSYS_SHA,
  oracleUsed:false,
  solvedInputsUsed:false,
  inputRepresentation:'prepared JSMinSys RBA q / active residual basis used by CPC',
  aggregation:'enumerate complete synchronized-response templates; for each template scan all active attacker residuals and return the earliest uncovered optimistic completion rank',
  rows,
  theoremConnection:[
    'Native CPC long-range response closure is the all-residuals-covered boolean case.',
    'The bounded horizon generalization retains the same aggregate residual basis but returns first-uncovered deadline minus two instead of only success/failure.',
    'No per-obligation tactical rule names or oracle values are required.',
  ]
},null,2));

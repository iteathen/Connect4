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

const moves=s=>Array.from(s,c=>Number(c)-1);
function qOf(s){return connect4RbaFromMoves(moves(s),{geometry:g,canonical:false});}
function terminal(q){return q.words[g.metaOffset]&3;}
function rank(q){return q.words[g.metaOffset]>>>2;}
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)));
}
function cells(id){const out=[],n=g.shapeSize[id],base=id*4;for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
function earliest(q,id,player){
  const r=rank(q),mover=r&1,remaining=g.cellCount-r,first=player===mover?1:2;
  const needs=cells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
}
function pairingsAll(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(let i=0;i<tail.length;i++){const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));for(const p of pairingsAll(rest))out.push([[a,b],...p]);}
  return out;
}
function optionalMatchings(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(const p of optionalMatchings(tail))out.push(p);
  for(let i=0;i<tail.length;i++){const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));for(const p of optionalMatchings(rest))out.push([[a,b],...p]);}
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
    const choices=pairs.map(([a,b])=>{const parity=rem[a]&1,ls=[];for(let L=1;L<=Math.min(rem[a],rem[b]);L++)if((L&1)===parity)ls.push(L);return ls;});
    if(choices.some(x=>!x.length))continue;
    for(const lengths of product(choices)){
      const vertical=new Set(),cross=[],response=new Map(),pairDesc=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];pairDesc.push({cols:[a+1,b+1],length:L});
        for(let j=0;j<L;j++){
          const ca=(q.words[a]+j)*g.columns+a,cb=(q.words[b]+j)*g.columns+b;
          cross.push([ca,cb]);response.set(ca,cb);response.set(cb,ca);
        }
        for(const c of [a,b])for(let r=q.words[c]+L;r+1<g.rows;r+=2){
          const lo=r*g.columns+c,hi=(r+1)*g.columns+c;
          vertical.add(hi);response.set(lo,hi);
        }
      }
      let valid=true;
      for(let c=0;c<g.columns;c++)if(!paired.has(c)){
        if(rem[c]&1){valid=false;break;}
        for(let r=q.words[c];r+1<g.rows;r+=2){
          const lo=r*g.columns+c,hi=(r+1)*g.columns+c;
          vertical.add(hi);response.set(lo,hi);
        }
      }
      if(valid)out.push({pairs:pairDesc,vertical,cross,response});
    }
  }
  return out;
}
function covers(id,T){
  const cs=cells(id);if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
function baseH(q,attacker){
  const residuals=activeMinimal(q,attacker).map(id=>({id,deadline:earliest(q,id,attacker)})).filter(x=>x.deadline!==null).sort((a,b)=>a.deadline-b.deadline);
  let best={horizon:-1,template:null};
  for(const T of templates(q)){
    const uncovered=residuals.filter(r=>!covers(r.id,T));
    const first=uncovered.length?uncovered[0].deadline:Infinity;
    const h=Number.isFinite(first)?first-2:g.cellCount-rank(q);
    if(h>best.horizon)best={horizon:h,template:T};
  }
  return best;
}
function oneSwitch(sequence){
  const q=qOf(sequence);assert.equal(terminal(q),0);
  const attacker=rank(q)&1,base=baseH(q,attacker),policies=[];
  for(const T of templates(q)){
    let guaranteed=Infinity,valid=true;
    const branches=[];
    for(const c of legal(q)){
      const frontier=q.words[c]*g.columns+c;
      const mate=T.response.get(frontier);
      if(mate===undefined){valid=false;branches.push({attackerColumn:c+1,status:'NO_TEMPLATE_RESPONSE'});break;}
      const afterAttack=qOf(sequence+String(c+1));
      if(terminal(afterAttack)){
        valid=false;branches.push({attackerColumn:c+1,status:'ATTACKER_TERMINAL'});break;
      }
      const rc=g.cellColumn[mate];
      if(afterAttack.words[rc]!==g.cellRow[mate]){
        valid=false;branches.push({attackerColumn:c+1,status:'RESPONSE_NOT_LEGAL',responseColumn:rc+1});break;
      }
      const successorSequence=sequence+String(c+1)+String(rc+1);
      const successor=qOf(successorSequence);
      if(terminal(successor)){
        // A defender terminal ends the game before any later attacker terminal.
        guaranteed=Math.min(guaranteed,g.cellCount-rank(q));
        branches.push({attackerColumn:c+1,responseColumn:rc+1,status:'DEFENDER_TERMINAL',successorH:null});
        continue;
      }
      const h=baseH(successor,attacker).horizon;
      guaranteed=Math.min(guaranteed,2+h);
      branches.push({attackerColumn:c+1,responseColumn:rc+1,status:'SWITCH',successorH:h,totalFromRoot:2+h});
    }
    if(valid)policies.push({pairs:T.pairs,guaranteedH:guaranteed,branches});
  }
  policies.sort((a,b)=>b.guaranteedH-a.guaranteedH);
  return {
    sequence,
    baseH:base.horizon,
    oneSwitchH:policies.length?policies[0].guaranteedH:-1,
    bestPolicy:policies[0]??null,
    policyCount:policies.length,
  };
}

const rows=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'}
].map(s=>({...s,...oneSwitch(s.sequence)}));

for(const r of rows)assert(r.oneSwitchH>=r.baseH);
console.log(JSON.stringify({
  schema:'connect4.cpc_one_switch_survival.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  theoremBoundary:[
    'A policy consists of one complete synchronized-response template for the first attacker move, its exact legal partner response, then a freshly certified complete response template in the exact successor.',
    'The guaranteed horizon is the minimum over all legal attacker first moves of two plies plus the successor CPC-basis survival horizon, maximized over the initial complete templates.',
    'This is a constructive one-switch defender certificate only; it does not infer an upper bound or exact remoteness and does not authorize move selection.'
  ]
},null,2));

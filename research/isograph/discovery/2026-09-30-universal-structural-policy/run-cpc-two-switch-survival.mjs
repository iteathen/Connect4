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
const qMemo=new Map();
function qOf(s){
  let q=qMemo.get(s);
  if(!q){q=connect4RbaFromMoves(moves(s),{geometry:g,canonical:false});qMemo.set(s,q);}
  return q;
}
const terminal=q=>q.words[g.metaOffset]&3;
const rank=q=>q.words[g.metaOffset]>>>2;
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
const templateMemo=new Map();
function templates(q,sequence){
  let memo=templateMemo.get(sequence);
  if(memo)return memo;
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),odds=[],evens=[];
  for(let c=0;c<g.columns;c++){if(!rem[c])continue;(rem[c]&1?odds:evens).push(c);}
  if(odds.length&1){templateMemo.set(sequence,[]);return [];}
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
  templateMemo.set(sequence,out);
  return out;
}
function covers(id,T){
  const cs=cells(id);if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
const baseMemo=new Map();
function baseH(sequence,attacker){
  const key=sequence+'|'+attacker;
  if(baseMemo.has(key))return baseMemo.get(key);
  const q=qOf(sequence);
  const residuals=activeMinimal(q,attacker).map(id=>({id,deadline:earliest(q,id,attacker)})).filter(x=>x.deadline!==null).sort((a,b)=>a.deadline-b.deadline);
  let best={horizon:-1,pairs:null};
  for(const T of templates(q,sequence)){
    const uncovered=residuals.filter(r=>!covers(r.id,T));
    const first=uncovered.length?uncovered[0].deadline:Infinity;
    const h=Number.isFinite(first)?first-2:g.cellCount-rank(q);
    if(h>best.horizon)best={horizon:h,pairs:T.pairs};
  }
  baseMemo.set(key,best);
  return best;
}

const switchMemo=new Map();
let evaluatedStates=0, evaluatedPolicies=0, evaluatedBranches=0;
function switchH(sequence,attacker,switchesLeft){
  const key=sequence+'|'+attacker+'|'+switchesLeft;
  if(switchMemo.has(key))return switchMemo.get(key);
  evaluatedStates++;
  const q=qOf(sequence);
  assert.equal(terminal(q),0);
  if(switchesLeft===0){
    const b=baseH(sequence,attacker);
    const result={horizon:b.horizon,pairs:b.pairs,depth:0};
    switchMemo.set(key,result);return result;
  }

  let best={horizon:-1,pairs:null,branches:null,depth:switchesLeft};
  const fullRemaining=g.cellCount-rank(q);
  for(const T of templates(q,sequence)){
    evaluatedPolicies++;
    let guaranteed=Infinity,valid=true;
    const branches=[];
    for(const c of legal(q)){
      evaluatedBranches++;
      const frontier=q.words[c]*g.columns+c;
      const mate=T.response.get(frontier);
      if(mate===undefined){valid=false;break;}
      const attackSequence=sequence+String(c+1);
      const afterAttack=qOf(attackSequence);
      if(terminal(afterAttack)){valid=false;break;}
      const rc=g.cellColumn[mate];
      if(afterAttack.words[rc]!==g.cellRow[mate]){valid=false;break;}
      const successorSequence=attackSequence+String(rc+1);
      const successor=qOf(successorSequence);
      if(terminal(successor)){
        guaranteed=Math.min(guaranteed,fullRemaining);
        branches.push({attackerColumn:c+1,responseColumn:rc+1,status:'DEFENDER_TERMINAL',branchH:fullRemaining});
        continue;
      }
      const next=switchH(successorSequence,attacker,switchesLeft-1);
      const total=2+next.horizon;
      guaranteed=Math.min(guaranteed,total);
      branches.push({attackerColumn:c+1,responseColumn:rc+1,status:'SWITCH',successorH:next.horizon,totalFromRoot:total});
    }
    if(valid&&guaranteed>best.horizon)best={horizon:guaranteed,pairs:T.pairs,branches,depth:switchesLeft};
  }
  switchMemo.set(key,best);return best;
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'}
];
const rows=[];
for(const root of roots){
  const q=qOf(root.sequence),attacker=rank(q)&1;
  const base=baseH(root.sequence,attacker);
  const one=switchH(root.sequence,attacker,1);
  const two=switchH(root.sequence,attacker,2);
  assert(two.horizon>=one.horizon&&one.horizon>=base.horizon);
  rows.push({
    ...root,
    attacker:attacker+1,
    baseH:base.horizon,
    oneSwitchH:one.horizon,
    twoSwitchH:two.horizon,
    bestTwoSwitchPolicy:{
      pairs:two.pairs,
      branches:two.branches
    }
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_two_switch_survival.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  work:{evaluatedStates,evaluatedPolicies,evaluatedBranches,qStates:qMemo.size,templateStates:templateMemo.size},
  theoremBoundary:[
    'This is a bounded constructive certificate-family experiment: at most two synchronized-response template switches.',
    'Every response is the exact partner prescribed by the current complete template; each successor is recomputed from the full CPC/RBA residual basis.',
    'The result is a sound survival lower bound only.',
    'This bounded experiment is not proposed as the final runtime operator; if useful, the next step is to compress the switch closure into an invariant rather than recurse physical branches.'
  ]
},null,2));

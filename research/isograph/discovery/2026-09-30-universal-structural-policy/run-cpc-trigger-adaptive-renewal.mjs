#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
const maxD=Number(process.argv[3]??15);
assert(library);
assert(Number.isInteger(maxD)&&maxD>=3&&(maxD&1),'max horizon must be odd >=3');
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
const terminal=q=>q.words[g.metaOffset]&3;
const mover=q=>rank(q)&1;
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function keyOf(q){return Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',');}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){const out=[],n=g.shapeSize[id],base=id*4;for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
function earliest(q,id,player){
  const r=rank(q),first=player===mover(q)?1:2,remaining=g.cellCount-r;
  const needs=shapeCells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
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

const templateMemo=new Map();
function templates(q){
  const qk=keyOf(q);
  const prior=templateMemo.get(qk);if(prior)return prior;
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),odds=[],evens=[];
  for(let c=0;c<g.columns;c++){if(!rem[c])continue;(rem[c]&1?odds:evens).push(c);}
  if(odds.length&1){templateMemo.set(qk,[]);return [];}
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
      const vertical=new Set(),cross=[],response=new Map(),pairDesc=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];pairDesc.push({cols:[a+1,b+1],length:L});
        for(let j=0;j<L;j++){
          const ca=(q.words[a]+j)*g.columns+a,cb=(q.words[b]+j)*g.columns+b;
          cross.push([ca,cb]);response.set(ca,cb);response.set(cb,ca);
        }
        for(const c of [a,b])for(let r=q.words[c]+L;r+1<g.rows;r+=2){
          const lo=r*g.columns+c,hi=(r+1)*g.columns+c;vertical.add(hi);response.set(lo,hi);
        }
      }
      let valid=true;
      for(let c=0;c<g.columns;c++)if(!paired.has(c)){
        if(rem[c]&1){valid=false;break;}
        for(let r=q.words[c];r+1<g.rows;r+=2){
          const lo=r*g.columns+c,hi=(r+1)*g.columns+c;vertical.add(hi);response.set(lo,hi);
        }
      }
      if(valid)out.push({pairs:pairDesc,vertical,cross,response});
    }
  }
  templateMemo.set(qk,out);return out;
}
function covers(id,T){
  const cs=shapeCells(id);if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}

const baseMemo=new Map();
function baseSafe(q,attacker,D){
  const mk=keyOf(q)+'|A'+attacker+'|B'+D;
  if(baseMemo.has(mk))return baseMemo.get(mk);
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);
  const critical=activeMinimal(q,attacker)
    .map(id=>({id,deadline:earliest(q,id,attacker)}))
    .filter(x=>x.deadline!==null&&x.deadline<=D);
  if(!critical.length){const r={safe:true,pairs:[],critical:0};baseMemo.set(mk,r);return r;}
  for(const T of templates(q)){
    if(critical.every(r=>covers(r.id,T))){
      const r={safe:true,pairs:T.pairs,critical:critical.length};baseMemo.set(mk,r);return r;
    }
  }
  const r={safe:false,pairs:null,critical:critical.length};baseMemo.set(mk,r);return r;
}

let cofactorCount=0;
const cofactorMemo=new Map();
function cofactor(q,column){
  const qk=keyOf(q),mk=qk+'|C'+column;
  if(cofactorMemo.has(mk))return cofactorMemo.get(mk);
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,column,q.words[column],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  const out={term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
  cofactorMemo.set(mk,out);return out;
}
function responseSuccessor(q,T,attacker,column){
  const frontier=q.words[column]*g.columns+column,mate=T.response.get(frontier);
  if(mate===undefined)return {ok:false,reason:'NO_RESPONSE'};
  const first=cofactor(q,column);
  if(first.term){
    const attackerTerminal=attacker===0?3:1;
    if(first.term===attackerTerminal)return {ok:false,reason:'ATTACKER_TERMINAL'};
    return {ok:true,closed:true,reason:'NON_ATTACKER_TERMINAL'};
  }
  const rc=g.cellColumn[mate],rr=g.cellRow[mate];
  if(first.q.words[rc]!==rr)return {ok:false,reason:'ILLEGAL_RESPONSE'};
  const second=cofactor(first.q,rc);
  if(second.term)return {ok:true,closed:true,responseColumn:rc+1,reason:'DEFENDER_OR_DRAW_TERMINAL'};
  assert.equal(mover(second.q),attacker);
  return {ok:true,closed:false,q:second.q,responseColumn:rc+1};
}

const responseOptionMemo=new Map();
function adaptiveResponseOptions(q,column){
  const mk=keyOf(q)+'|R'+column;
  if(responseOptionMemo.has(mk))return responseOptionMemo.get(mk);
  const frontier=q.words[column]*g.columns+column,byMate=new Map();
  for(const T of templates(q)){
    const mate=T.response.get(frontier);
    if(mate!==undefined&&!byMate.has(mate))byMate.set(mate,{mate,template:T});
  }
  const out=[...byMate.values()];
  responseOptionMemo.set(mk,out);return out;
}

const classMemo=new Map();
let classCalls=0,responseOptionsTested=0,branchTests=0,memoHits=0;
function classS(q,attacker,D){
  assert(D>=3&&(D&1));
  const qk=keyOf(q),mk=qk+'|A'+attacker+'|SAD'+D;
  if(classMemo.has(mk)){memoHits++;return classMemo.get(mk);}
  classCalls++;
  const base=baseSafe(q,attacker,D);
  if(base.safe){
    const r={accept:true,class:'B'+D,witness:base.pairs};
    classMemo.set(mk,r);return r;
  }
  if(D===3){
    const r={accept:false,class:'OUTSIDE_SAD3'};
    classMemo.set(mk,r);return r;
  }

  const branchWitnesses=[];
  for(const c of legal(q)){
    branchTests++;
    let found=null;
    for(const option of adaptiveResponseOptions(q,c)){
      responseOptionsTested++;
      const tr=responseSuccessor(q,option.template,attacker,c);
      if(!tr.ok)continue;
      if(tr.closed){
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:true,
          templatePairs:option.template.pairs,childClass:'CLOSED'
        };
        break;
      }
      const child=classS(tr.q,attacker,D-2);
      if(child.accept){
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:false,
          templatePairs:option.template.pairs,childClass:child.class
        };
        break;
      }
    }
    if(!found){
      const r={accept:false,class:'OUTSIDE_SAD'+D,failedTrigger:c+1};
      classMemo.set(mk,r);return r;
    }
    branchWitnesses.push(found);
  }

  const r={
    accept:true,class:'AD_R'+(D-2)+'_TO_S'+D,
    witnessByTrigger:branchWitnesses
  };
  classMemo.set(mk,r);return r;
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];
const horizons=[];for(let d=3;d<=maxD;d+=2)horizons.push(d);
const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q),membership=[];
  for(const D of horizons){
    const c=classS(q,attacker,D);
    membership.push({D,accept:c.accept,class:c.class,witness:c.witness??null,witnessByTrigger:c.witnessByTrigger??null,failedTrigger:c.failedTrigger??null});
  }
  rows.push({...root,attacker:attacker+1,membership});
}

console.log(JSON.stringify({
  schema:'connect4.cpc_trigger_adaptive_renewal_spectrum.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  requestedMaxHorizon:maxD,
  horizons,
  rows,
  work:{
    classCalls,memoHits,responseOptionsTested,branchTests,cofactorCount,
    classMemoSize:classMemo.size,baseMemoSize:baseMemo.size,templateMemoSize:templateMemo.size,
    responseOptionMemoSize:responseOptionMemo.size,cofactorMemoSize:cofactorMemo.size
  },
  boundary:[
    'S_D is a bounded constructive defender survival proof class, not exact remoteness.',
    'Each observed attacker trigger may select its own complete synchronized-response template; the exact mate is then transported by CPC/RBA cofactor.',
    'Failure of S_D is not an attacker forced-completion certificate.',
    'The spectrum tests the sound quantifier swap from exists-template-for-all-triggers to for-all-triggers-exists-template; it is not unrestricted legal-response minimax.'
  ]
},null,2));

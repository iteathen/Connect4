#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
const maxD=Number(process.argv[3]??15);
assert(library,'usage: node run-cpc-long-horizon-renewal-ladder.mjs <JSMinSys checkout> [maxOddHorizon]');
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
const MAX_COFACTORS=2_000_000;
const MAX_BRANCH_TESTS=1_000_000;
let cofactorCount=0,branchTests=0,templateTests=0,baseTests=0;

function moves(s){return Array.from(s,c=>Number(c)-1);}
function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
function rank(q){return q.words[g.metaOffset]>>>2;}
function terminal(q){return q.words[g.metaOffset]&3;}
function mover(q){return rank(q)&1;}
function legal(q){
  const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;
}
function key(q){
  return Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',');
}
function coordHas(words,base,index){
  return (words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){
  const out=[],n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function earliest(q,id,player){
  const r=rank(q),first=player===mover(q)?1:2,remaining=g.cellCount-r;
  const needs=shapeCells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
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

const templateMemo=new Map();
function templates(q){
  const k=key(q);if(templateMemo.has(k))return templateMemo.get(k);
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),odds=[],evens=[];
  for(let c=0;c<g.columns;c++){
    if(rem[c]===0)continue;(rem[c]&1?odds:evens).push(c);
  }
  if(odds.length&1){templateMemo.set(k,[]);return [];}
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
  templateMemo.set(k,out);return out;
}
function covers(id,T){
  const cs=shapeCells(id);
  if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);
  return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}

const baseMemo=new Map();
function baseSafe(q,attacker,D){
  const mk=key(q)+'|B'+D+'|'+attacker;if(baseMemo.has(mk))return baseMemo.get(mk);
  baseTests++;
  const critical=activeMinimal(q,attacker).map(id=>({id,deadline:earliest(q,id,attacker)}))
    .filter(x=>x.deadline!==null&&x.deadline<=D);
  if(!critical.length){
    const v={safe:true,pairs:[],critical:0};baseMemo.set(mk,v);return v;
  }
  for(const T of templates(q)){
    if(critical.every(r=>covers(r.id,T))){
      const v={safe:true,pairs:T.pairs,critical:critical.length};baseMemo.set(mk,v);return v;
    }
  }
  const v={safe:false,pairs:null,critical:critical.length};baseMemo.set(mk,v);return v;
}
function budget(){
  if(cofactorCount>MAX_COFACTORS||branchTests>MAX_BRANCH_TESTS){
    const e=new Error('semantic renewal budget exceeded');e.code='BUDGET';throw e;
  }
}
function cofactor(q,column){
  budget();
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis);
  const seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,column,q.words[column],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}
function responseSuccessor(q,T,attacker,column){
  branchTests++;budget();
  const frontier=q.words[column]*g.columns+column,mate=T.response.get(frontier);
  if(mate===undefined)return {ok:false,reason:'NO_RESPONSE'};
  const first=cofactor(q,column),attackerTerminal=attacker===0?3:1;
  if(first.term){
    if(first.term===attackerTerminal)return {ok:false,reason:'ATTACKER_TERMINAL'};
    return {ok:true,closed:true,responseColumn:null};
  }
  const rc=g.cellColumn[mate],rr=g.cellRow[mate];
  if(first.q.words[rc]!==rr)return {ok:false,reason:'RESPONSE_NOT_LEGAL'};
  const second=cofactor(first.q,rc);
  if(second.term)return {ok:true,closed:true,responseColumn:rc+1};
  if(mover(second.q)!==attacker)return {ok:false,reason:'TURN_TRANSPORT'};
  return {ok:true,closed:false,q:second.q,responseColumn:rc+1};
}

const sMemo=new Map(),sInProgress=new Set();
function inS(q,attacker,D){
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);assert(D>=3&&(D&1));
  const mk=key(q)+'|S'+D+'|'+attacker;
  if(sMemo.has(mk))return sMemo.get(mk);
  if(sInProgress.has(mk))throw new Error('unexpected renewal cycle');
  sInProgress.add(mk);
  const b=baseSafe(q,attacker,D);
  if(b.safe){
    const v={accept:true,kind:'BASE',pairs:b.pairs};sMemo.set(mk,v);sInProgress.delete(mk);return v;
  }
  if(D===3){
    const v={accept:false,kind:'OUT'};sMemo.set(mk,v);sInProgress.delete(mk);return v;
  }
  for(const T of templates(q)){
    templateTests++;
    let valid=true;const children=[];
    for(const c of legal(q)){
      const tr=responseSuccessor(q,T,attacker,c);
      if(!tr.ok){valid=false;break;}
      if(tr.closed){children.push({attackerColumn:c+1,responseColumn:tr.responseColumn,closed:true});continue;}
      const child=inS(tr.q,attacker,D-2);
      if(!child.accept){valid=false;break;}
      children.push({attackerColumn:c+1,responseColumn:tr.responseColumn,closed:false,childKind:child.kind});
    }
    if(valid){
      const v={accept:true,kind:'RENEW',pairs:T.pairs,children};
      sMemo.set(mk,v);sInProgress.delete(mk);return v;
    }
  }
  const v={accept:false,kind:'OUT'};sMemo.set(mk,v);sInProgress.delete(mk);return v;
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];
const horizons=[];for(let d=3;d<=maxD;d+=2)horizons.push(d);
const rows=[];
let budgetExceeded=false,budgetMessage=null;
try{
  for(const root of roots){
    const q=ingress(root.sequence),attacker=mover(q),ladder=[];
    for(const D of horizons){
      const r=inS(q,attacker,D);
      ladder.push({
        horizon:D,accept:r.accept,kind:r.kind,
        pairs:r.pairs??null,
        rootChildren:r.children??null
      });
    }
    rows.push({...root,attacker,ladder,maxCertified:ladder.filter(x=>x.accept).at(-1)?.horizon??null});
  }
}catch(e){
  if(e.code!=='BUDGET')throw e;
  budgetExceeded=true;budgetMessage=e.message;
}

console.log(JSON.stringify({
  schema:'connect4.cpc_long_horizon_renewal_ladder.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  requestedMaxHorizon:maxD,
  rows,
  work:{
    cofactorCount,branchTests,templateTests,baseTests,
    semanticStates:templateMemo.size,
    sMemoEntries:sMemo.size,
    baseMemoEntries:baseMemo.size,
    budgetExceeded,budgetMessage,
    limits:{cofactors:MAX_COFACTORS,branchTests:MAX_BRANCH_TESTS}
  },
  interpretation:'S_D is a constructive defender survival proof class: fixed B_D or one exact synchronized-response renewal into S_(D-2), evaluated entirely on support + typed CPC/RBA residual state.',
  boundary:[
    'No oracle value or solved outcome is used.',
    'This is theorem-discovery qualification of the semantic renewal grammar, not a final runtime move finder.',
    'Failure to enter S_D is not an attacker upper bound.',
    'Stop rather than infer anything if the explicit work budget is exceeded.'
  ]
},null,2));

#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-semantic-renewal-operator.mjs <JSMinSys checkout>');

const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {
  prepareConnect4RbaGeometry,
  connect4RbaShapeSubset,
}=await load('rba-connect4-geometry');
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
function rank(q){return q.words[g.metaOffset]>>>2;}
function terminal(q){return q.words[g.metaOffset]&3;}
function mover(q){return rank(q)&1;}
function legal(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function coordHas(words,base,index){
  return (words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id &&
    g.shapeSize[other]<g.shapeSize[id] &&
    connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){
  const out=[],n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function earliest(q,id,player){
  const r=rank(q),first=player===mover(q)?1:2,remaining=g.cellCount-r;
  const needs=shapeCells(id)
    .map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1)
    .sort((a,b)=>a-b);
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
  for(const v of arrays[i]){
    prefix.push(v);product(arrays,i+1,prefix,out);prefix.pop();
  }
  return out;
}
function templates(q){
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]);
  const odds=[],evens=[];
  for(let c=0;c<g.columns;c++){
    if(rem[c]===0)continue;
    (rem[c]&1?odds:evens).push(c);
  }
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
      const vertical=new Set(),cross=[],response=new Map(),pairDesc=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];
        pairDesc.push({cols:[a+1,b+1],length:L});
        for(let j=0;j<L;j++){
          const ca=(q.words[a]+j)*g.columns+a;
          const cb=(q.words[b]+j)*g.columns+b;
          cross.push([ca,cb]);
          response.set(ca,cb);response.set(cb,ca);
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
  const cs=shapeCells(id);
  if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);
  return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
function baseSafe(q,attacker,D){
  assert.equal(terminal(q),0);
  assert.equal(mover(q),attacker);
  const critical=activeMinimal(q,attacker)
    .map(id=>({id,deadline:earliest(q,id,attacker)}))
    .filter(x=>x.deadline!==null&&x.deadline<=D);
  if(!critical.length)return {safe:true,pairs:[],critical:0};
  for(const T of templates(q)){
    if(critical.every(r=>covers(r.id,T)))
      return {safe:true,pairs:T.pairs,critical:critical.length};
  }
  return {safe:false,pairs:null,critical:critical.length};
}

let cofactorCount=0;
function cofactor(q,column){
  assert.equal(terminal(q),0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords);
  const basisBuf=new Uint32Array(g.maxBasis);
  const seen=new Uint32Array(g.shapeWordCount);
  const sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,
    q.words,0,q.basis,0,q.basis.length,
    column,q.words[column],
    words,0,basisBuf,0,
    seen,sizes,0
  );
  cofactorCount++;
  const n=sizes[0];
  return {term,q:{words,basis:basisBuf.slice(0,n)}};
}

function responseSuccessor(q,T,attacker,column){
  const frontier=q.words[column]*g.columns+column;
  const mate=T.response.get(frontier);
  if(mate===undefined)return {ok:false,reason:'NO_TEMPLATE_RESPONSE'};

  const first=cofactor(q,column);
  if(first.term){
    const attackerTerminal=(attacker===0?3:1);
    if(first.term===attackerTerminal)return {ok:false,reason:'ATTACKER_TERMINAL'};
    return {ok:true,closed:true,reason:'NON_ATTACKER_TERMINAL_AFTER_TRIGGER'};
  }

  const rc=g.cellColumn[mate],rr=g.cellRow[mate];
  if(first.q.words[rc]!==rr)return {ok:false,reason:'RESPONSE_NOT_LEGAL'};
  const second=cofactor(first.q,rc);
  if(second.term)return {ok:true,closed:true,reason:'DEFENDER_OR_DRAW_TERMINAL',responseColumn:rc+1};
  assert.equal(mover(second.q),attacker);
  return {ok:true,closed:false,q:second.q,responseColumn:rc+1};
}

let renewalTemplateTests=0,renewalBranchTests=0;
function renewInto(q,attacker,classify){
  assert.equal(terminal(q),0);
  assert.equal(mover(q),attacker);
  for(const T of templates(q)){
    renewalTemplateTests++;
    let valid=true;
    const branches=[];
    for(const c of legal(q)){
      renewalBranchTests++;
      const tr=responseSuccessor(q,T,attacker,c);
      if(!tr.ok){valid=false;break;}
      if(tr.closed){
        branches.push({attackerColumn:c+1,responseColumn:tr.responseColumn??null,class:'CLOSED'});
        continue;
      }
      const childClass=classify(tr.q,attacker);
      if(!childClass.accept){valid=false;break;}
      branches.push({
        attackerColumn:c+1,
        responseColumn:tr.responseColumn,
        class:childClass.class,
        witness:childClass.witness??null
      });
    }
    if(valid)return {renewing:true,pairs:T.pairs,branches};
  }
  return {renewing:false,pairs:null,branches:null};
}

function classB3(q,attacker){
  const b=baseSafe(q,attacker,3);
  return {accept:b.safe,class:'B3',witness:b.pairs};
}
function classS5(q,attacker){
  const b5=baseSafe(q,attacker,5);
  if(b5.safe)return {accept:true,class:'B5',witness:b5.pairs};
  const r3=renewInto(q,attacker,classB3);
  if(r3.renewing)return {accept:true,class:'R3_TO_S5',witness:r3.pairs};
  return {accept:false,class:'OUTSIDE_S5'};
}
function classS7(q,attacker){
  const b7=baseSafe(q,attacker,7);
  if(b7.safe)return {accept:true,class:'B7',witness:b7.pairs};
  const r5=renewInto(q,attacker,classS5);
  if(r5.renewing)return {accept:true,class:'R5_TO_S7',witness:r5.pairs,branches:r5.branches};
  return {accept:false,class:'OUTSIDE_S7'};
}

const renewalControls=[
  ['c6_14','444441566614',true],
  ['c6_41','444441566641',true],
  ['c6_56','444441566656',true],
  ['c6_65','444441566665',true],
  ['c3_22','444441566322',true],
  ['c2_12','444441566212',false],
  ['c2_21','444441566221',false],
  ['c2_33','444441566233',false],
  ['c2_45','444441566245',false],
  ['c2_54','444441566254',false],
  ['c2_66','444441566266',false],
  ['c2_77','444441566277',false],
  ['c3_13','444441566313',false],
  ['c3_31','444441566331',false],
  ['c3_45','444441566345',false],
  ['c3_54','444441566354',false],
  ['c3_66','444441566366',false],
  ['c3_77','444441566377',false],
];

const renewalRows=renewalControls.map(([label,sequence,expected])=>{
  const q=ingress(sequence),attacker=mover(q);
  const base=baseSafe(q,attacker,3);
  assert(base.safe,'renewal control expected B3');
  const r=renewInto(q,attacker,classB3);
  assert.equal(r.renewing,expected,label+' semantic renewal mismatch');
  return {label,sequence,expectedRepairable:expected,semanticRenewal:r.renewing,pairs:r.pairs};
});

const roots=[
  {id:'candidate2',sequence:'4444415662',expectedS7:false},
  {id:'candidate3',sequence:'4444415663',expectedS7:false},
  {id:'candidate6',sequence:'4444415666',expectedS7:true},
];
const rootRows=roots.map(row=>{
  const q=ingress(row.sequence),attacker=mover(q);
  const b3=baseSafe(q,attacker,3),b5=baseSafe(q,attacker,5),b7=baseSafe(q,attacker,7);
  const s5=classS5(q,attacker);
  const s7=classS7(q,attacker);
  assert(s5.accept,row.id+' expected S5 membership');
  assert.equal(s7.accept,row.expectedS7,row.id+' S7 membership mismatch');
  return {
    ...row,
    base:{B3:b3.safe,B5:b5.safe,B7:b7.safe},
    S5:{accept:s5.accept,class:s5.class,witness:s5.witness},
    S7:{accept:s7.accept,class:s7.class,witness:s7.witness,branches:s7.branches??null},
  };
});

console.log(JSON.stringify({
  schema:'connect4.cpc_semantic_renewal_operator.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  transitionAuthority:'connect4RbaCofactorKnownHeight on support + CPC/RBA residual coordinate; no move-history replay in renewal evaluation',
  proofClasses:{
    B3:'fixed complete response template survives through 3',
    B5:'fixed complete response template survives through 5',
    R3_TO_S5:'one exact template response transition sends every attacker trigger into B3 or a closed defender/draw terminal',
    R5_TO_S7:'one exact template response transition sends every attacker trigger into S5=B5 union R3_TO_S5 or a closed defender/draw terminal',
  },
  renewalControls:renewalRows,
  roots:rootRows,
  work:{cofactorCount,renewalTemplateTests,renewalBranchTests},
  conclusion:'The prior two-switch distinction [5,5,7] is reproduced directly on the CPC semantic state using exact RBA cofactors and proof-class transitions, without replaying physical move histories. Candidate 6 is in S7 via R5 renewal; candidates 2/3 are in S5 but not S7 under this grammar.',
  boundary:[
    'This is a rank-local CPC proof automaton, not a value solver.',
    'S7 membership is a constructive survival lower certificate only.',
    'The operator still quantifies over qualified response templates and legal current triggers; no unbounded recursion or minimax/negamax is used.',
    'No finite forced-completion upper bound for candidates 2/3 follows, so v5 remains unlicensed.'
  ]
},null,2));

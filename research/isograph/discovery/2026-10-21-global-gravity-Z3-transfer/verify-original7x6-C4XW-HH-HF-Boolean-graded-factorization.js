"use strict";
/* C4XW: exact original7x6 real residual HH/HF Boolean field factorization.
   Frozen: docs/research/2026-10-23-frozen-C4XW-HH-HF-graded-Boolean-shared-factor-correspondence.md
   SOURCE truth, not game WLD, no oracle, no full future branching. */
const insist=(p,m)=>{if(!p)throw Error('C4XW '+m);};
const K=[],dims=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
const key=(c,r)=>c+','+r;
for(const [name,dc,dr] of dims)for(let c=1;c<=7;c++)for(let r=1;r<=6;r++){
 const cs=Array.from({length:4},(_,i)=>[c+dc*i,r+dr*i]);
 if(cs.every(([x,y])=>x>=1&&x<=7&&y>=1&&y<=6))K.push({name,cs,ids:cs.map(v=>key(...v))});
}
const directions=Object.fromEntries(dims.map(([d])=>[d,K.filter(x=>x.name===d).length]));
insist(K.length===69&&directions.H===24&&directions.V===21&&directions.R===12&&directions.F===12,'original69');
function build(w){
 const q={h:Array(7).fill(0),P:[new Set(),new Set()],events:[]};
 for(let i=0;i<w.length;i++){
  const col=Number(w[i]),p=i%2;
  insist(q.h[col-1]<6,'gravity legal');
  const s=key(col,++q.h[col-1]);
  q.P[p].add(s);
  const claim=K.some(L=>L.ids.every(v=>q.P[p].has(v)));
  insist(!claim,'source is firstwinnerfree at every true physical prefix');
  q.events.push({col,p,s});
 }
 return q;
}
const minSource=(q,p)=>{
 const o=new Map();
 for(const line of K){
  if(line.ids.some(s=>q.P[1-p].has(s)))continue;
  const miss=line.ids.filter(s=>!q.P[p].has(s)).sort();
  if(!miss.length)continue;
  const k=miss.join('|');
  if(!o.has(k))o.set(k,{miss,original:[]});
  o.get(k).original.push({name:line.name,cs:line.cs});
 }
 const values=[...o.values()];
 return values.filter(x=>!values.some(y=>y.miss.length<x.miss.length&&y.miss.every(s=>x.miss.includes(s))));
};
function findMin(q,p,cells,dir){
 const k=cells.map(v=>key(...v)).sort().join('|');
 const match=minSource(q,p).find(x=>x.miss.join('|')===k);
 insist(match&&match.original.some(o=>o.name===dir),'exact normalized SOURCE original '+dir+' physical K4 '+k);
 return match.original.filter(o=>o.name===dir);
}
const q8=build('42142544'),q17=build('42142544223336111');
const q8HLeft=findMin(q8,0,[[2,3],[3,3],[1,3]],'H');
const q8HRight=findMin(q8,0,[[2,3],[3,3],[5,3]],'H');
const q17DH=findMin(q17,1,[[6,2],[5,2]],'H');
const q17DF=findMin(q17,1,[[6,2],[5,3],[7,1]],'F');
insist(q8.h.join(',')==='1,2,0,4,1,0,0'&&q17.h.join(',')==='4,4,3,4,1,1,0','actual source gravity profiles');
const bool3=[];
for(let n=0;n<8;n++){
 const a=n&1?1:0,b=n&2?1:0,c=n&4?1:0;
 const raw=Number(Boolean(a&&(b||c))),poly=a*b+a*c-a*b*c;
 insist(raw===poly,'abstract 3 generator squarefree Möbius');
 bool3.push({bits:[a,b,c],value:raw});
}
function test(carrier){
 let trueCount=0,coeff=0,tests=0,samples=[];
 for(let n=0;n<16;n++){
  const v=Array.from({length:4},(_,i)=>n&(1<<i)?1:0),[a,b,c,d]=v;
  let raw,fac,poly;
  if(carrier==='HH'){
   raw=Number(Boolean((a&&b&&c)||(a&&b&&d)));
   fac=Number(Boolean(a*b&&(c||d)));
   poly=a*b*c+a*b*d-a*b*c*d;
  }else{
   raw=Number(Boolean((a&&b)||(a&&c&&d)));
   fac=Number(Boolean(a&&(b||(c&&d))));
   poly=a*b+a*c*d-a*b*c*d;
  }
  insist(raw===fac&&fac===poly,carrier+' direct/structured polynomial agreement '+n);
  const pop=v.reduce((x,y)=>x+y,0);
  trueCount+=raw;
  coeff+=raw*((4-pop)%2?-1:1);
  tests++;
  samples.push(raw);
 }
 insist(coeff===-1,'negative shared-causal-squarefree overlap in '+carrier);
 return {physicalOwnerBitAssignments:tests,trueValuations:trueCount,
  fourVariableHighestMoebiusCoefficient:coeff,
  truthTableInteger:samples.reduce((sum,v,i)=>sum+v*2**i,0)};
}
const HH=test('HH'),HF=test('HF');
const report={
 schema:'C4XW_0_1',proof_status:'EXACT_TWO_SOURCE_BOOLEAN_FACTORING_NOT_GAME_OR_POLICY_EQUIVALENCE',
 original7x6K4directions:directions,
 sources:{q8:{word:'42142544',rank:8,mover:'P0',h:q8.h,P0OriginalMinWSL:minSource(q8,0).length},
          q17b6:{word:'42142544223336111',rank:17,mover:'P1',h:q17.h,P1OriginalMinWSL:minSource(q17,1).length}},
 originalK4provenance:{q8HH:[q8HLeft,q8HRight],q17HF:[q17DH,q17DF]},
 abstractThreeVariableFunction:'a*(b OR c) = a*b + a*c - a*b*c',
 abstractThreeVariableAssignments:bool3.length,
 guardedSubstitutions:{
  HH:'a=f1*f2, b=yL, c=yR; f1=c2r3 f2=c3r3 yL=c1r3 yR=c5r3',
  HF:'a=e, b=x, c=y*z; e=c6r2 x=c5r2 y=c5r3 z=c7r1'
 },
 exactTruthControls:{HH,HF},
 sourceDegrees:{HH:[3,3],HF:[2,3]},
 identicalAbstractBooleanOperator:true,identicalPhysicalActionSemantics:false,
 firstwinningOrGravityTransportProved:false,
 zeroGameValueQueries:true,rootWLDProved:false,
 historicalOOO_C6EquivalenceProved:false};
console.log(JSON.stringify(report,null,2));
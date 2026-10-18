// FROZEN actual standard7x6 GEOMETRY-ONLY L2 insufficiency falsifier.
// Independent physical WDL/complete L2 uses BRANCHING REFERENCE ONLY.
// A same h, same delta/GF2-phase/legal mask pair with distinct perfect
// WDL or full original L2 best labels disproves any h-only classifier.
// Original source R0/R1 checked independently against exact-q reference.
// No root VALUE queried or precomputed in any purported source producer.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
const core=createExactQCore({width:W,height:H,connect:K});
const lines=[],byCell=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let m=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dr)*W+c+j*dc;m|=1n<<BigInt(id);ids.push(id);}
  lines.push(m);for(const id of ids)byCell[id].push(m);
 }
if(lines.length!==69)throw Error('wrong physical winning-line geometry');
function fresh(){return{h:Array(W).fill(0),P:[0n,0n],n:0,history:'',terminal:null};}
function legal(s){return s.h.flatMap((n,c)=>n<H?[c]:[]);}
function step(s,c){
 const r=s.h[c],p=s.n&1,id=r*W+c,P=s.P.slice(),h=s.h.slice();
 if(s.terminal!==null||r>=H)throw Error('illegal gravity/first-win move');
 P[p]|=bit(c,r);h[c]++;
 const win=byCell[id].some(m=>(P[p]&m)===m);
 return {h,P,n:s.n+1,history:s.history+(c+1),
  terminal:win?(p===0?1:-1):s.n+1===N?0:null};
}
const memo=new Map(),counts={
 schema:'connect4.standard7x6.same_support_height_phase_insufficiency_v0_1',
 W,H,K,originalWinLines:69,seedStart:0x17C4D3A7,
 randomNonwinningTrajectories:0,candidateActualPhysicalRoots:0,
 uniqueActualRootPositions:0,lateRootsAnalyzed:0,
 perfectReferenceCalls:0,uniqueReferenceStates:0,
 independentQualifiedQWitnessChecks:0,
 invalidOriginalLegalHistory:0,
 sameHeightValueDifferentWitness:null,
 sameHeightSameValueDifferentL2Witness:null,
 rootValueOrBestMasksComputedInSourceOnlyCandidate:false,
 conclusion:'FALSIFIER_ONLY_NOT_ZERO_STRATEGIC_BRANCH_SOURCE_L2',
 seedFinal:null
};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function ordinary(s){
 counts.perfectReferenceCalls++;
 if(s.terminal!==null)return s.terminal;
 const k=key(s);if(memo.has(k))return memo.get(k);
 counts.uniqueReferenceStates++;
 let V=(s.n&1)?1:-1;
 for(const a of legal(s)){
  const x=ordinary(step(s,a));
  V=(s.n&1)?Math.min(V,x):Math.max(V,x);
 }
 memo.set(k,V);return V;
}
function root(s){
 const V=ordinary(s),actionValues=legal(s).map(a=>[a+1,ordinary(step(s,a))]);
 const best=actionValues.filter(([_,v])=>v===V).map(([a])=>a);
 return {s,V,actionValues,best};
}
function display(z){
 const {s,V,actionValues,best}=z;
 const source=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 return {history:s.history,n:s.n,h:s.h,P0:String(s.P[0]),P1:String(s.P[1]),
  residualCounts:[source.R0.length,source.R1.length],
  sourceQKey:core.key(source),mover:s.n&1,
  WDL:V,allOriginalLiteralOptimalColumns:best,
  allLiteralActionValues:actionValues};
}
function corroborate(z){
 const q=core.fromPhysical({h:z.s.h,p0:z.s.P[0],p1:z.s.P[1]});
 const r=core.solve(q,{maxStates:500000,maxTransitions:1500000}).answer;
 counts.independentQualifiedQWitnessChecks++;
 if(r.value!==z.V||r.bestMoves.map(x=>x+1).join(',')!==z.best.join(','))
  throw Error('independent exact-q oracle disagrees physical-grid root L2');
}
let rng=counts.seedStart>>>0;
function rand(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng;}
const candidates=new Map();
for(let game=0;game<4800;game++){
 counts.randomNonwinningTrajectories++;
 let s=fresh();
 while(s.n<N){
  if(s.n>=34&&s.n<=40&&legal(s).length>=2){
   counts.candidateActualPhysicalRoots++;
   const k=key(s);
   if(!candidates.has(k))candidates.set(k,s);
  }
  const choices=legal(s).map(a=>step(s,a)).filter(q=>q.terminal===null);
  if(!choices.length)break;
  s=choices[rand()%choices.length];
 }
}
counts.uniqueActualRootPositions=candidates.size;
const prior=new Map();
for(const s of candidates.values()){
 if(counts.lateRootsAnalyzed>=7500)break;
 const val=root(s);counts.lateRootsAnalyzed++;
 const hkey=s.h.join(',');
 const old=prior.get(hkey);
 if(old){
  if(old.V!==val.V&&!counts.sameHeightValueDifferentWitness){
   corroborate(old);corroborate(val);
   counts.sameHeightValueDifferentWitness={
    identicalH:s.h,
    identicalDelta:s.h.slice(1).map((v,i)=>v-s.h[i]),
    identicalGF2Gradient:s.h.slice(1).map((v,i)=>(v-s.h[i])&1),
    A:display(old),B:display(val)};
  }
  if(old.V===val.V&&old.best.join(',')!==val.best.join(',')&&
    !counts.sameHeightSameValueDifferentL2Witness){
   corroborate(old);corroborate(val);
   counts.sameHeightSameValueDifferentL2Witness={
    identicalH:s.h,
    identicalDelta:s.h.slice(1).map((v,i)=>v-s.h[i]),
    identicalGF2Gradient:s.h.slice(1).map((v,i)=>(v-s.h[i])&1),
    A:display(old),B:display(val)};
  }
 }else prior.set(hkey,val);
 if(counts.sameHeightValueDifferentWitness&&
    counts.sameHeightSameValueDifferentL2Witness)break;
}
counts.seedFinal=rng;
console.log(JSON.stringify(counts,null,2));

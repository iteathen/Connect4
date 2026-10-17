// Independent actual-7x6 physical-control falsifier of source phase/cocycle.
// Genuine legal first-win-stopped prefixes; hypothetical full future schedule
// used only for independently testing XOR owner phase. No WDL oracle.
// The source-only phase producer is a separate module frozen BEFORE this test.
import {createColumnRowPhase} from './standard7x6-column-row-phase-cocycle.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
const phase=createColumnRowPhase({width:W,height:H,connect:K}),lines=[],dirs=[
 [1,0,'horizontal'],[0,1,'vertical'],[1,1,'rising'],[1,-1,'falling']];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy,name] of dirs){
  const cc=c+(K-1)*dx,rr=r+(K-1)*dy;
  if(cc>=W||rr<0||rr>=H)continue;
  const cells=Array.from({length:K},(_,i)=>[c+i*dx,r+i*dy]);
  const mask=cells.reduce((s,[x,y])=>s|bit(x,y),0n);
  lines.push({mask,cells,name});
 }
if(lines.length!==69)throw Error('wrong 7x6 geometry');
let seed=0x72C04F11>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function fresh(){return {h:Array(W).fill(0),P:[0n,0n],n:0,history:''};}
function next(st,c){
 if(c<0||c>=W||st.h[c]>=H)throw Error('illegal gravity move');
 const h=st.h.slice(),p=st.n&1,row=h[c]++,x=bit(c,row),P=st.P.slice();
 P[p]|=x;
 const win=lines.some(line=>(line.mask&P[p])===line.mask);
 return {h,P,n:st.n+1,history:st.history+String(c+1),win};
}
function legal(st){return st.h.flatMap((z,c)=>z<H?[c]:[]);}
function fromHistory(hist){
 let s=fresh();
 for(const c of hist){s=next(s,Number(c)-1);if(s.win)throw Error('canonical source already first won');}
 return s;
}
function physicalQ(st){
 const support=st.P[0]|st.P[1],R=[[],[]];
 for(let p=0;p<2;p++)for(const line of lines)
  if((line.mask&st.P[1-p])===0n){
   const g=line.mask&~support;if(g===0n)throw Error('physical source terminal');
   R[p].push(g);
  }
 // Independent quadratic subset filter, no shared producer normalizer.
 function min(arr){
  const unique=[...new Set(arr.map(String))].map(BigInt);
  return unique.filter(a=>!unique.some(b=>a!==b&&(a&b)===b))
    .sort((a,b)=>a<b?-1:a>b?1:0);
 }
 return {h:st.h.slice(),R0:min(R[0]),R1:min(R[1])};
}
function canonicalFamily(f){return f.map(String).sort().join('|');}
function physicalSchedule(st){
 const running=st.h.slice(),seq=[];
 while(seq.length<N-st.n){
  const actions=[];for(let c=0;c<W;c++)if(running[c]<H)actions.push(c);
  const c=actions[rand()%actions.length];seq.push(c);running[c]++;
 }
 return seq;
}
const results={schema:'connect4.standard7x6.row_column_phase_trueboard_control_v0_1',
 date:'2026-10-17',W,H,K,winlines:lines.length,seedStart:seed,
 genuineNonterminalPhysicalSources:0,sourcePhaseActionChecks:0,
 ownerPhaseChecks:0,linePairRelativePhaseChecks:0,
 horizontalPairChecks:0,verticalPairChecks:0,risingPairChecks:0,fallingPairChecks:0,
 twoPlySwappedSourcePairsChecked:0,oddFreePairsChecked:0,
 phaseCommuteChecks:0,twoPlyResidualPhysicalMismatch:0,
 canonical:[],twoPlyCanonicalPairDetails:[],wrongUpdate:0,wrongOwner:0,
 wrongLinePhase:0,strategicFutureWDLQueries:0,geometry:{originalWinningLines:69}};
let inspectedExchange=0;
function inspect(st,doExchange){
 if(st.win||st.n>=N)throw Error('nonterminal source required');
 results.genuineNonterminalPhysicalSources++;
 const n=st.n,base=phase.phase(st.h),source=physicalQ(st);
 if(!base.every((x,c)=>x===((n-st.h[c])&1)))throw Error('phase not defined by other-column move count');
 for(const c of legal(st)){
  const after=phase.columnsAfterMove(st.h,c),physical=next(st,c);
  results.sourcePhaseActionChecks++;
  if(!after.h.every((h,i)=>h===physical.h[i])||
   !after.κ.every((z,i)=>z===(((n+1)-physical.h[i])&1))){
   results.wrongUpdate++;throw Error('phase clock disagrees physical support');
  }
 }
 const seq=physicalSchedule(st),got=phase.ownersFromSchedule(st.h,seq);
 const directH=st.h.slice(),futureByCell=new Map();
 for(let z=0;z<seq.length;z++){
  const c=seq[z],r=directH[c]++,id=r*W+c;
  const f=got.future[z];
  const p=(n+z)&1;
  let others=0;
  for(let v=0;v<z;v++)if(seq[v]!==c)others++;
  if(f.c!==c||f.r!==r||f.owner!==p||f.β!==(others&1)||f.λ!==((r&1)^base[c])){
   results.wrongOwner++;throw Error('row/column/interleaving phase mismatch');
  }
  results.ownerPhaseChecks++;
  futureByCell.set(id,{...f});
 }
 for(const line of lines){
  const target=line.cells.map(([c,r])=>futureByCell.get(r*W+c)).filter(Boolean);
  for(let j=1;j<target.length;j++){
   const e=target[0],f=target[j];
   const d=phase.difference(st.h,e.c,e.r,f.c,f.r);
   const physicalOwnerDifference=e.owner^f.owner;
   const phaseDifference=d^e.β^f.β;
   results.linePairRelativePhaseChecks++;
   results[line.name+'PairChecks']++;
   if(physicalOwnerDifference!==phaseDifference){
    results.wrongLinePhase++;throw Error('geometry edge parity mismatch');
   }
  }
 }
 if(!doExchange)return;
 const actions=legal(st);
 for(let ia=0;ia<actions.length;ia++)for(let ib=ia+1;ib<actions.length;ib++){
  const a=actions[ia],b=actions[ib],firstA=next(st,a),firstB=next(st,b);
  if(firstA.win||firstB.win)continue;
  const physAB=next(firstA,b),physBA=next(firstB,a);
  if(physAB.win||physBA.win||physAB.n>=N)continue;
  const ex=phase.exchange(source,a,b);
  if(!ex.bothTwoPlyNonterminal)throw Error('source terminal assumption disagrees physical');
  const qAB=physicalQ(physAB),qBA=physicalQ(physBA);
  results.twoPlySwappedSourcePairsChecked++;
  results.phaseCommuteChecks++;
  const hkey=h=>h.join(',');
  if(hkey(qAB.h)!==hkey(qBA.h)||hkey(qAB.h)!==hkey(ex.AB.h)||
     hkey(ex.AB.h)!==hkey(ex.BA.h)||
     hkey(ex.phaseAfterAB)!==hkey(ex.phaseAfterBA))
   throw Error('source height+phase two-play transport not abelian');
  const correct=canonicalFamily(qAB.R0)===canonicalFamily(ex.AB.R0)&&
    canonicalFamily(qAB.R1)===canonicalFamily(ex.AB.R1)&&
    canonicalFamily(qBA.R0)===canonicalFamily(ex.BA.R0)&&
    canonicalFamily(qBA.R1)===canonicalFamily(ex.BA.R1);
  if(!correct){
   results.twoPlyResidualPhysicalMismatch++;
   throw Error('source XOR exchange mismatch physical q');
  }
  if(ex.oddGeneratorCount===0){
   results.oddFreePairsChecked++;
   if(!ex.equalResidual)throw Error('odd-incidence necessary condition violated');
  }
  if(st.history==='44444')results.twoPlyCanonicalPairDetails.push({
   firstActionsOneBased:[a+1,b+1],oddSourceGenerators:ex.oddGeneratorCount,
   normalizedResultEqual:ex.equalResidual,
   resultingP0Generators:[qAB.R0.length,qBA.R0.length],
   resultingP1Generators:[qAB.R1.length,qBA.R1.length]
  });
 }
}
for(const hist of ['44444','444444','444441','4444442']){
 const st=fromHistory(hist);
 const k=phase.phase(st.h);
 results.canonical.push({history:hist,n:st.n,h:st.h,κ:k,
   legalColumns:legal(st).map(c=>c+1),residualGenerators:[
     physicalQ(st).R0.length,physicalQ(st).R1.length]});
 inspect(st,true);
}
for(let game=0;game<1700;game++){
 let st=fresh();
 const sampled=new Set([0,3,5,6,7,10,13,17,21,26,30,34,37,39]);
 while(st.n<N){
  if(sampled.has(st.n))inspect(st,inspectedExchange++<950);
  const safe=legal(st).filter(c=>!next(st,c).win);
  if(!safe.length)break;
  st=next(st,safe[rand()%safe.length]);
 }
}
results.seedFinal=seed;
console.log(JSON.stringify(results,null,2));

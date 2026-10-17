// Independent true-standard-7x6 source-q transition, geometry and GF2
// full-cell edge-code falsifier of the 4-ribbon unfold. FROZEN before run.
// Reference core is qualified branching-capable, but here it is ONLY asked
// to build q or perform a SINGLE deterministic literal action (NO solve).
// The source candidate NEVER recursively evaluates strategic game futures.
import {createFourRibbonSourceLift} from './standard7x6-four-ribbon-source-lift.mjs';
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
const W=7,H=6,K=4,N=W*H;
const geom={width:W,height:H,connect:K};
const lift=createFourRibbonSourceLift(geom),core=createExactQCore(geom);
const stats={schema:'connect4.7x6.exact_four_ribbon_q_conjugacy_v0_1',
 date:'2026-10-17',W,H,K,originalGeometricKLines:core.lineCount,
 orderedStrands:lift.strands.length,physicalOccurrenceCount:lift.occurrences.reduce((s,a)=>s+a.length,0),
 windowsByDirection:lift.groups,windowMasksAgreed:false,
 edges:lift.edges.length,gf2CoboundaryRank:null,independentCycleParityConstraints:null,
 fullOwnerAssignmentChecks:0,fullOwnerRoundTrips:0,monochromeKLineChecks:0,
 firstWinStoppedPhysicalSourceStates:0,distinctQIdentities:0,
 literalActionOnePlyTransitionChecks:0,terminalWinTokens:0,terminalDrawTokens:0,
 nonterminalCofactorExactEqualities:0,sourceRoundTripChecks:0,
 wrongGeometry:0,wrongGF2:0,wrongTransitions:0,
 noGameValueOrStrategyReferenceQueries:true,sourceGameSemanticValueFanout:0,
 canonical:[],centerCompleteRemainingCrossSideRequirements:null,
 byPly:{},seedStart:0x7C43F11A,seedFinal:null};
function assert(cond,msg){if(!cond)throw Error(msg);}
const newMasks=lift.windows.map(x=>String(x.mask)).sort();
const oldMasks=core.lines.map(String).sort();
assert(newMasks.length===oldMasks.length&&newMasks.every((x,i)=>x===oldMasks[i]),'original 69 line masks mismatch');
stats.windowMasksAgreed=true;
const dirs=['horizontal','vertical','rising','falling'];
for(let id=0;id<N;id++){
 const refs=lift.occurrences[id];
 assert(refs.length===4,'cell did not occur exactly four times');
 assert(new Set(refs.map(o=>lift.strands[o.strand].direction)).size===4,'cell direction repetition');
 for(const ref of refs)
  assert(lift.strands[ref.strand].physicalCellIDs[ref.index]===id,'occurrence copy points to wrong physical cell');
}
assert(lift.strands.length===H+W+2*(W+H-1),'non-symbolic strands');
assert(lift.occurrences.reduce((s,a)=>s+a.length,0)===4*N,'physical copies missing');
assert(lift.edges.length===H*(W-1)+W*(H-1)+2*(W-1)*(H-1),'edges missing');
// GF(2) Gaussian elimination on incidence matrix, INDEPENDENT of graph
// producer's spanning-tree/coboundary-rank claim.
const pivots=new Map();let rank=0;
for(const e of lift.edges){
 let row=(1n<<BigInt(e.x))^(1n<<BigInt(e.y));
 for(let b=N-1;b>=0;b--){
  if((row&(1n<<BigInt(b)))===0n)continue;
  if(pivots.has(b))row^=pivots.get(b);
  else{pivots.set(b,row);rank++;break;}
 }
}
stats.gf2CoboundaryRank=rank;
stats.independentCycleParityConstraints=lift.edges.length-rank;
assert(rank===N-1&&stats.independentCycleParityConstraints===90,'full-grid GF2 rank/cycle count wrong');
let rng=stats.seedStart>>>0;
const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng;};
for(let repeat=0;repeat<700;repeat++){
 const owners=Array.from({length:N},()=>rand()&1),delta=lift.edgeCode(owners);
 const d=lift.decodeEdgeCode(delta,owners[0]);
 assert(d.owner.every((z,i)=>z===owners[i]),'GF2 edge owner reconstruction mismatched physical bits');
 assert(d.cycleRank===stats.independentCycleParityConstraints,'cycle rank mismatch');
 stats.fullOwnerAssignmentChecks++;
 stats.fullOwnerRoundTrips++;
 const srcMono=lift.windowMonoByEdgeBits(owners);
 for(let i=0;i<lift.windows.length;i++){
  const win=lift.windows[i],expected=win.physicalCellIDs.every(id=>owners[id]===owners[win.physicalCellIDs[0]])?1:0;
  stats.monochromeKLineChecks++;
  if(srcMono[i]!==expected){stats.wrongGF2++;throw Error('K-window local zero-edge mismatch');}
 }
}
function fresh(){
 return {h:Array(W).fill(0),p0:0n,p1:0n,n:0,history:''};
}
function physicalMove(st,c){
 const row=st.h[c],h=st.h.slice(),id=row*W+c,stone=1n<<BigInt(id),mover=st.n%2;
 h[c]++;const p0=st.p0|(mover===0?stone:0n),p1=st.p1|(mover===1?stone:0n);
 const win=core.lines.some(g=>(g&(mover===0?p0:p1))===g);
 return {h,p0,p1,n:st.n+1,history:st.history+(c+1),win};
}
function canonical(str){
 let st=fresh();for(const ch of str){const c=Number(ch)-1;
  assert(c>=0&&c<W&&st.h[c]<H,'invalid canonical move');
  st=physicalMove(st,c);assert(!st.win,'canonical first-win stopped violation');}
 return st;
}
const qkeys=new Set();
function inspect(st,canon=false){
 const q=core.fromPhysical({h:st.h,p0:st.p0,p1:st.p1});
 const encoded=lift.encode(q),unfolded=lift.decode(encoded);
 assert(core.key(unfolded)===core.key(q),'ribbon source-state round-trip mismatch');
 stats.sourceRoundTripChecks++;
 const qkey=core.key(q);qkeys.add(qkey);
 const actions=core.legal(q),actual=encoded.legal;
 assert(actions.join(',')===actual.join(','),'literal legal mask mismatch');
 const b=stats.byPly[st.n]??(stats.byPly[st.n]={sources:0,actions:0,wins:0,draws:0,live:0});
 b.sources++;stats.firstWinStoppedPhysicalSourceStates++;
 for(const action of actions){
  const expected=core.next(q,action),got=lift.next(encoded,action);
  stats.literalActionOnePlyTransitionChecks++;b.actions++;
  if('terminal' in expected){
   if(got.terminal!==expected.terminal||got.kind!==expected.kind){
    stats.wrongTransitions++;throw Error('terminal FIRST win / DRAW is not conjugate');
   }
   if(got.kind==='win'){stats.terminalWinTokens++;b.wins++;}
   else{stats.terminalDrawTokens++;b.draws++;}
  }else{
   assert(!!got.lifted,'ribbon action failed to create source successor');
   const actualQ=lift.decode(got.lifted);
   if(core.key(expected.q)!==core.key(actualQ)){
    stats.wrongTransitions++;
    throw Error('source q cofactor not preserved by ribbon interval representation');
   }
   stats.nonterminalCofactorExactEqualities++;b.live++;
  }
 }
 if(canon)stats.canonical.push({
  history:st.history,heights:st.h,remaining:N-st.n,originalR:[q.R0.length,q.R1.length],
  legalLiteralColumns:actions.map(c=>c+1),
  futurePhaseKappa:st.h.map(z=>(st.n-z)&1)
 });
 return q;
}
for(const str of ['','4','44444','444444','444441','4444442']){
 const st=canonical(str),q=inspect(st,true);
 if(str==='444444'){
  const span=g=>{
   let seenLeft=false,seenRight=false,seenCenter=false;
   for(let id=0;id<N;id++)if((g&(1n<<BigInt(id)))!==0n){
    const c=id%W;seenLeft||=c<3;seenRight||=c>3;seenCenter||=c===3;
   }
   return seenLeft&&seenRight&&!seenCenter;
  };
  const count=[q.R0.filter(span).length,q.R1.filter(span).length];
  const examples=[q.R0.filter(span).slice(0,2),q.R1.filter(span).slice(0,2)]
   .map(arr=>arr.map(g=>Array.from({length:N},(_,id)=>id)
      .filter(id=>(g&(1n<<BigInt(id)))!==0n).map(id=>[id%W+1,Math.floor(id/W)+1])));
  stats.centerCompleteRemainingCrossSideRequirements={
   history:'444444',centerColumnFullyOccupied:true,centerFutureHeight:6,
   residualGeneratorsCrossingLeftRightFutureOfFilledCenter:[...count],
   examples,
   interpretation:'Any such generator is coupled by an original K-line that passes through an already occupied center square; physical future-only disconnected left/right adjacency is NOT game independence.'
  };
 }
}
for(let run=0;run<1450;run++){
 let st=fresh();
 while(st.n<N){
  if(st.n===0||st.n===5||st.n===9||st.n===14||st.n===19||st.n===24||
    st.n===29||st.n===34||st.n===37||st.n===39)
     inspect(st);
  const possible=[];
  for(const c of st.h.flatMap((x,c)=>x<H?[c]:[])){
   const cand=physicalMove(st,c);
   if(!cand.win)possible.push(c);
  }
  if(!possible.length)break;
  const c=possible[rand()%possible.length],later=physicalMove(st,c);
  assert(!later.win,'sample generation already first won');
  st=later;
 }
}
stats.distinctQIdentities=qkeys.size;stats.seedFinal=rng;
console.log(JSON.stringify(stats,null,2));

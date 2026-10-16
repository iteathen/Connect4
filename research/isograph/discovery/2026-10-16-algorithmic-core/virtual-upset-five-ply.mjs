// Exact virtual cofactor composition across a *potentially full* column.
// No successor q materialization; no search for winning policies; no
// independent strategic game-state recursion; no oracle values.
// Fixed scope: P0 / P1 / P0 / P1 / P0 immediate-first-win by third own turn.
//
// Normalized residual antichain R defines monotone upset predicate
//   U_R(S) = exists r in R such that r subseteq S.
// Under legal NONTERMINAL owner P0 placement x:
//   U_R0_child(S) = U_R0_parent(S | x)
//   U_R1_child(S) = U_R1_parent(S) if S disjoint from x.
// Early terminal and legal support masks must be checked first.
//
// Child response-cover calculations use upset predicates rather than
// exact equality of normalized child antichain generators.
// This is sound at this fixed horizon because a singleton below a queried
// pair either wins immediately, or is separately tested as an immediate or
// upper-latent threat; P1 singleton {x_b} is an earlier terminal guard.

const subset=(a,b)=>(a&b)===a;
const bitcount=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
export function createVirtualUpsetFivePly({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
   throw Error('unsupported geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function upset(R,S,stats){
  stats.upsetMembershipTests++;
  if(bitcount(S)>=3)stats.degreeThreeQueries++;
  for(const r of R){
   stats.residualComparisons++;
   if(subset(r,S))return true;
  }
  return false;
 }
 function baseInput(q){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(n=>!Number.isInteger(n)||n<0||n>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    q.R0.some(x=>typeof x!=='bigint'||x===0n)||
    q.R1.some(x=>typeof x!=='bigint'||x===0n))
     throw Error('invalid nonterminal residual q');
  return q.h.reduce((a,b)=>a+b,0);
 }
 // Pure source-state bounded P1/P0/P1/P0 adaptive-response kernel:
 // accepts support h and virtual normalized-residual UPSET oracles.
 // Does not build/materialize any ordinary q.
 function cover(h,has0,has1,stats){
  const n=h.reduce((a,b)=>a+b,0);
  if((n&1)!==1||n===N)throw Error('P1-mover support required');
  let L=0n,covered=0n;
  const masks=Array(W).fill(0n);
  let processedFirst=0,validInitial=0;
  for(let b=0;b<W;b++){
   if(h[b]>=H)continue;
   stats.firstP1ColumnScans++;processedFirst++;
   const xb=bit(b,h[b]),mb=1n<<BigInt(b);
   L|=mb;
   if(has1(xb)){stats.firstP1WinningGuards++;continue;}
   if(n+1===N){stats.firstP1DrawGuards++;continue;}
   validInitial++;
   for(let a=0;a<W;a++){
    const ry=h[a]+Number(a===b);
    if(ry>=H)continue;
    stats.adaptiveP0Incidences++;
    const ya=bit(a,ry);
    if(has0(ya)){
     masks[a]|=mb;stats.immediateP0Wins++;continue;
    }
    if(n+2===N){stats.p0DrawGuards++;continue;}
    let T=0n,U=0n,B=0n,leg=0n;
    for(let c=0;c<W;c++){
     const rz=h[c]+Number(c===b)+Number(c===a);
     if(rz>=H)continue;
     stats.secondP1LandingScans++;
     const z=bit(c,rz),bc=1n<<BigInt(c);
     leg|=bc;
     // Upset over pair includes singleton sources. The duplicate implied
     // singleton cases are covered by earlier immediate-win/first-win guards.
     if(has0(z)||has0(z|ya))T|=bc;
     if(has1(z)||has1(z|xb))B|=bc;
     if(rz+1<H){
      const u=bit(c,rz+1);
      if(has0(u)||has0(u|ya))U|=bc;
     }
    }
    if(B!==0n){stats.secondP1WinningGuards++;continue;}
    const t=bitcount(T);
    if(t>=2||(t===1&&(T&U)!==0n)||(t===0&&U===leg)){
     masks[a]|=mb;stats.adaptiveP0Successful++;
    }
   }
  }
  for(const m of masks)covered|=m;
  stats.outputCoverMasks+=W;
  return {initialLegalMask:L,initialValidP1Actions:validInitial,
    coverByP0Column:masks,coveredP1Mask:covered,allP1RepliesCovered:covered===L,
    firstP1ActionsScanned:processedFirst};
 }
 function compute(q,{maxChecks=Number.MAX_SAFE_INTEGER,deadlineAt=Infinity}={}){
  const rank=baseInput(q);
  if(rank%2!==0||rank===N)throw Error('P0 root-to-5ply needs P0 mover');
  const s={rootRank:rank,sourceQRead:1,
    rootP0ActionLabels:0,rootImmediateP0Terminal:0,
    rootP0LastMoveDraw:0,virtualCofactorQueries:0,
    virtualP1ChildDescriptors:0,sourceQChildMaterializations:0,
    recursiveGameStateSolves:0,independentContinuationsExpanded:0,
    sourceShapeDegreeMaxQuery:0,upsetMembershipTests:0,
    degreeThreeQueries:0,residualComparisons:0,
    firstP1ColumnScans:0,firstP1WinningGuards:0,
    firstP1DrawGuards:0,adaptiveP0Incidences:0,
    secondP1LandingScans:0,immediateP0Wins:0,p0DrawGuards:0,
    secondP1WinningGuards:0,adaptiveP0Successful:0,
    outputCoverMasks:0};
  let chosen=0n,immediate=0n;
  const initialActionResults=[];
  for(let a=0;a<W;a++){
   if(q.h[a]>=H)continue;
   if(Date.now()>=deadlineAt||s.upsetMembershipTests>=maxChecks)
    return {status:'BUDGET_EXHAUSTED',statistics:s,
      forcedP0FirstActionsMask:chosen,actionResults:initialActionResults};
   s.rootP0ActionLabels++;
   const x=bit(a,q.h[a]),aMask=1n<<BigInt(a);
   if(upset(q.R0,x,s)){
    s.rootImmediateP0Terminal++;chosen|=aMask;immediate|=aMask;
    initialActionResults.push({a,kind:'P0_WIN_FIRST',universal:true});
    continue;
   }
   if(rank+1===N){
    s.rootP0LastMoveDraw++;
    initialActionResults.push({a,kind:'DRAW_FIRST',universal:false});
    continue;
   }
   const nextH=q.h.slice();nextH[a]++;
   // All future child query sets exclude x by the new h frontier.
   const has0=S=>{
    s.virtualCofactorQueries++;
    if((S&x)!==0n)throw Error('virtual child query contains first played cell');
    return upset(q.R0,S|x,s);
   };
   const has1=S=>{
    s.virtualCofactorQueries++;
    if((S&x)!==0n)throw Error('virtual child query contains first played cell');
    return upset(q.R1,S,s);
   };
   const after=cover(nextH,has0,has1,s);
   if(after.allP1RepliesCovered)chosen|=aMask;
   initialActionResults.push({a,kind:'VIRTUAL_SOURCE_COVER',
     universal:after.allP1RepliesCovered,
     p1LegalMask:after.initialLegalMask,
     P0CoverByColumn:after.coverByP0Column,
     p1CoveredMask:after.coveredP1Mask});
   if(s.upsetMembershipTests>=maxChecks)
    return {status:'BUDGET_EXHAUSTED',statistics:s,
     forcedP0FirstActionsMask:chosen,actionResults:initialActionResults};
  }
  return {status:'COMPLETE_FIVE_PLY_FIXED_HORIZON',
    rootSupport:q.h.slice(),forcedP0FirstActionsMask:chosen,
    immediateWinningFirstActionsMask:immediate,
    actionResults:initialActionResults,statistics:s,
    scope:'P0 forced immediate win on its first, second or third own turn under at most two adversarial intervening P1 replies; exact fixed horizon only, not WDL'};
 }
 return Object.freeze({compute,cover,
  name:'virtual-residual-upset-cofactor-five-ply',bit,
  qualifier:'source residual upset substitution on fixed support; no game-tree searching'});
}

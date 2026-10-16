// Exact rule-derived P0 OR / P1 AND / P0 OR horizon compression.
//
// All P0 winning-first-or-second-move action values are pulled back from
// the ORIGINAL normalized residual-q state. No game-tree search, policy
// guessing, oracle, recursive cofactor descent or intermediate child q
// object is used. Result is not an eventual WDL value.
//
// The core identity is for a P0 landing x, next landing z_c:
// T'_c = [ {z_c} in R0 ] OR [ {x,z_c} in R0 ]
// U'_c = [ {upper(z_c)} in R0 ] OR [ {x,upper(z_c)} in R0 ]
// B'_c = [ {z_c} in R1 ].
// Plug these into the exact one-P1-response threat polynomial.
//
// Optional omitPairs/omitUpper simulate deliberately UNSOUND controls and
// are not enabled by default; they are used only by a separate falsifier.
function pc(x){let n=0;for(;x;x&=x-1n)n++;return n;}
export function createDirectTwoMovePullback({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('invalid finite gravity board');
 const bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{omitPairs=false,omitUpper=false}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   q.R0.some(x=>typeof x!=='bigint')||q.R1.some(x=>typeof x!=='bigint'))
   throw Error('invalid residual q');
  const rank=q.h.reduce((a,n)=>a+n,0);
  if((rank&1)!==0)throw Error('P0-turn required for two-move direct pullback');
  const own=new Set(q.R0.map(String)),opponent=new Set(q.R1.map(String));
  let certified=0n,immediate=0n,
    residualMembershipChecks=0,pairSourceAntecedentHits=0,
    latentSourceAntecedentHits=0,
    supportedFirstActions=0,threeQuantifierCompositionCalls=0,
    answerPolynomialTermsChecked=0;
  const actionEvidence=[];
  function has(pool,m){residualMembershipChecks++;return pool.has(String(m));}
  for(let a=0;a<W;a++){
   const h0=q.h[a];
   if(h0>=H)continue;
   supportedFirstActions++;
   const actionMask=1n<<BigInt(a),x=bit(a,h0);
   if(has(own,x)){
    certified|=actionMask;immediate|=actionMask;
    actionEvidence.push({action:a,case:'P0_TERMINAL_WIN',certified:true});
    continue;
   }
   if(rank+1===W*H){
    actionEvidence.push({action:a,case:'FULL_BOARD_DRAW',certified:false});
    continue;
   }
   const heightChild=q.h.slice();heightChild[a]++;
   let L=0n,T=0n,U=0n,B=0n;
   for(let c=0;c<W;c++){
    const zrow=heightChild[c];
    if(zrow>=H)continue;
    const colMask=1n<<BigInt(c),z=bit(c,zrow);
    L|=colMask;
    const oneThreat=has(own,z);
    const pairThreat=!omitPairs&&has(own,z|x);
    if(pairThreat)pairSourceAntecedentHits++;
    if(oneThreat||pairThreat)T|=colMask;
    if(has(opponent,z))B|=colMask;
    if(!omitUpper&&zrow+1<H){
     const upper=bit(c,zrow+1);
     const oneUpper=has(own,upper);
     const pairUpper=!omitPairs&&has(own,upper|x);
     if(oneUpper||pairUpper){U|=colMask;latentSourceAntecedentHits++;}
     if(pairUpper)pairSourceAntecedentHits++;
    }
   }
   threeQuantifierCompositionCalls++;
   const threats=pc(T);
   // Exact boolean polynomial from the gravity/one-opponent-reply law:
   // all P1 immediate threats blocked and
   // >=2 current P0 threats, or same-column relay, or all upper relays.
   const ready=threats>=2||(threats===1&&(T&U)!==0n)||
     (threats===0&&U===L);
   answerPolynomialTermsChecked+=threats>=2?1:threats===1?2:3;
   const forced=B===0n&&ready;
   if(forced)certified|=actionMask;
   actionEvidence.push({
    action:a,case:'DIRECT_OR_AND_OR_PULLBACK',certified:forced,
    P1LegalReplyMask:'0x'+L.toString(16),
    childP0ThreatMask:'0x'+T.toString(16),
    childP0UpperLatentMask:'0x'+U.toString(16),
    childP1ImmediateWinMask:'0x'+B.toString(16)
   });
  }
  return {
   status:'EXACT_BOUNDED_TWO_P0_MOVES',
   forcedWinningFirstActionsMask:certified,
   immediateWinningFirstActionsMask:immediate,
   actionEvidence,
   metrics:{
    parentQObjectsRead:1,intermediateQStatesConstructed:0,
    independentP1ChildStatesEvaluated:0,gameTreeSearchCalls:0,
    P0CandidateActionsScanned:supportedFirstActions,
    threeQuantifierCompositionCalls,
    residualMembershipChecks,pairSourceAntecedentHits,
    latentSourceAntecedentHits,
    answerPolynomialTermsChecked
   },
   scope:'P0 first or immediately subsequent own move forced win, not arbitrary-horizon WDL'
  };
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}

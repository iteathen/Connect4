// ORIGINAL 7x6 first-win-stopped q SOURCE proof producer.
// Follows ONE strategically forced opponent reply lane at each rank.
// No recursive WDL, no game-tree expansion or alternative q future values.
// If selected forced ladder fails, returns INCOMPLETE; no backtracking.
// Frozen theorem: docs/research/2026-10-17-one-lane-forced-threat-ladder-source-win-witness.md
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createSourceGravityResponseCover} from './standard7x6-source-gravity-response-cover.mjs';
export function createSingleForcedThreatLadder({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid first-win gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 const core=createExactQCore({width:W,height:H,connect:K});
 const local=createSourceGravityResponseCover({width:W,height:H,connect:K});
 function compute(q,{maxSourceTests=300000}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||!Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('first-win stopped exact q expected');
  const originalPlayer=q.h.reduce((a,b)=>a+b,0)&1;
  const stat={
   sourceOriginalCurrentActionScans:0,
   sourceResidualMembershipChecks:0,
   staticSingleThreatCandidatesConsidered:0,
   selectedOneLaneForcedTwoPlyTransitions:0,
   sourceQStatesMaterializedAlongOneLane:0,
   directSourceBoundaryChecks:0,
   sourceStrategicContinuationLaneFanoutMax:0,
   independentFutureGameWDLValueQueries:0,
   hiddenAlternativeGameContinuationGraphsConstructed:0,
   selectedForcedRounds:0,
   sourceMaximumFutureLaneDepth:0
  };
  function charge(){stat.sourceResidualMembershipChecks++;
    if(stat.sourceResidualMembershipChecks>maxSourceTests)
     throw Error('original source algebra structural operation guard exceeded');}
  function inspectForcedCandidates(node,p){
   const {h,R0,R1}=node,n=h.reduce((s,x)=>s+x,0),own=p===0?R0:R1,
    enemy=p===0?R1:R0,sets=[new Set(own.map(String)),new Set(enemy.map(String))];
   const legal=h.flatMap((v,c)=>v<H?[c]:[]);
   const picked=[];
   for(const a of legal){
    stat.sourceOriginalCurrentActionScans++;
    const x=bit(a,h[a]);charge();if(sets[0].has(String(x)))continue;
    if(n+1>=N)continue;
    const nextFrontier=legal.flatMap(d=>{
     const row=h[d]+(d===a?1:0);
     return row<H?[{d,row,y:bit(d,row)}]:[];
    });
    let counterWin=false;for(const f of nextFrontier){charge();
     if(sets[1].has(String(f.y))){counterWin=true;break;}
    }
    if(counterWin)continue;
    const S=[];
    for(const f of nextFrontier){
     charge();const first=sets[0].has(String(f.y));
     charge();const second=sets[0].has(String(x|f.y));
     if(first||second)S.push(f.d);
    }
    if(S.length!==1)continue;
    const b=S[0],landing=nextFrontier.find(x=>x.d===b),zRow=landing.row+1;
    const z=zRow<H?bit(b,zRow):null;
    if(z!==null){
      charge();const already=sets[0].has(String(z));
      charge();const xPair=sets[0].has(String(x|z));
      if(already||xPair)continue; // the direct stacked source theorem already wins
    }
    const sourceIncidence=own.reduce((score,G)=>{
      charge();return score+((G&x)!==0n?1:0);
    },0);
    stat.staticSingleThreatCandidatesConsidered++;
    picked.push({a,b,sourceIncidence,
      directThreatRow:landing.row,
      sourceProof:{
       selectedPAction:a+1,
       uniqueForcedOpponentBlockColumn:b+1,
       rankAtPAction:n,
       allOpponentImmediateWinningColumnsExcluded:true,
       singleCurrentlyPlayableOwnerWinningThreat:true,
       originalOwnerThreatKind:'singleton target or contracted original two-cell generator',
       permittedOpponentDeviationOutcome:'immediate owner P win at blocked column',
       noAlternativeForcedLaneEvaluated:true
      }});
   }
   // FIXED deterministic source q-only priority; no future q is
   // created for unselected candidates. Same rule at every forced rank.
   picked.sort((a,b)=>b.sourceIncidence-a.sourceIncidence||
     a.a-b.a||a.b-b.b);
   return picked[0]??null;
  }
  function run(node,p,depth){
   const n=node.h.reduce((s,x)=>s+x,0);
   if((n&1)!==p)throw Error('source forced chain parity violation');
   stat.sourceMaximumFutureLaneDepth=Math.max(stat.sourceMaximumFutureLaneDepth,depth);
   stat.directSourceBoundaryChecks++;
   const direct=local.compute(node);
   if(direct.status==='VALID_CONTINUATION'){
    return {status:'VALID_CONTINUATION',winningOriginalFirstAction:direct.selectedOriginalLiteralColumn,
     forcedRoundsFromThisNode:0,proofSteps:[{kind:'DIRECT_SOURCE_NEXT_OWNER_TURN_WIN',
      literalPAction:direct.selectedOriginalLiteralColumn,
      sourceCertificate:direct.sourceCertificate}]};
   }
   const candidate=inspectForcedCandidates(node,p);
   if(!candidate)
    return {status:'INCOMPLETE',reason:'NO_DIRECT_OR_ONE_SELECTED_FORCED_THREAT_CERTIFICATE',proofSteps:[]};
   stat.sourceStrategicContinuationLaneFanoutMax=Math.max(stat.sourceStrategicContinuationLaneFanoutMax,1);
   // EXACTLY ONE candidate p action and the matching unique forced
   // opponent reply are used to construct future q. Other moves are
   // proven locally losing for opponent (immediate p next first-win).
   const aStep=core.next(node,candidate.a);
   stat.sourceQStatesMaterializedAlongOneLane++;
   if(aStep.terminal!==undefined)
    return {status:'INCOMPLETE',reason:'UNEXPECTED_TERMINAL_ON_SELECTED_SOURCE_P_ACTION',proofSteps:[]};
   const bStep=core.next(aStep.q,candidate.b);
   stat.sourceQStatesMaterializedAlongOneLane++;
   stat.selectedOneLaneForcedTwoPlyTransitions++;
   stat.selectedForcedRounds++;
   if(bStep.terminal!==undefined)
    return {status:'INCOMPLETE',reason:'BLOCKING_REPLY_EARLY_TERMINAL_OR_DRAW',proofSteps:[]};
   const suffix=run(bStep.q,p,depth+1);
   if(suffix.status!=='VALID_CONTINUATION')
    return {status:'INCOMPLETE',reason:'SELECTED_SINGLE_STRATEGIC_LANE_DID_NOT_PROVE_WIN',
     selectedFailureLane:[candidate.sourceProof,...(suffix.selectedFailureLane??[])],proofSteps:[]};
   return {status:'VALID_CONTINUATION',
     winningOriginalFirstAction:candidate.a+1,
     forcedRoundsFromThisNode:suffix.forcedRoundsFromThisNode+1,
     proofSteps:[{kind:'SINGLE_WIN_THREAT_FORCES_ONE_BLOCKING_REPLY',
      ...candidate.sourceProof},...suffix.proofSteps]};
  }
  const answer=run(q,originalPlayer,0);
  return {status:answer.status,
    selectedOriginalLiteralColumn:answer.winningOriginalFirstAction??null,
    certifiedOwner:answer.status==='VALID_CONTINUATION'?originalPlayer:null,
    sourceForcedReplyRounds:answer.forcedRoundsFromThisNode??0,
    reason:answer.reason??'ONE_LANE_SOURCE_GUARANTEED_FIRST_WIN',
    certificate:answer.status==='VALID_CONTINUATION'?
      {mover:originalPlayer,proofSteps:answer.proofSteps,
       allOpponentNonForcedRepliesLoseImmediately:true,
       noDifferentlyValuedFutureGameQueries:true,
       selectedSingleForcedReplyLaneOnly:true}:null,
    failedSelectedLaneSourceDetails:answer.selectedFailureLane??null,
    statistics:stat};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}

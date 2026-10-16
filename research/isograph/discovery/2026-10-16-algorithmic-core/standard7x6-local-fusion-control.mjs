#!/usr/bin/env node
// Bounded STANDARD 7x6 independent falsifier. This file is VALIDATION ONLY:
// physically replays game-rule positions and scans literal opponent responses
// to compare two algebraic one-/two-turn value predicates derived elsewhere
// solely from support and residual cofactors (no search-selected policy).
import {createUniversalOneReplyFusion} from './universal-one-reply-fusion.mjs';
import {createOneReplyThreatPolynomial} from './universal-reply-threat-polynomial.mjs';
import {createDirectTwoMovePullback} from './direct-two-move-pullback.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';

const cfg={width:7,height:6,connect:4},MAX_MOVES=30000,
 MAX_LOOKUPS=50000,MAX_MS=30000,MAX_ATTEMPTS=4000,TARGET=12;
const SEED=0x4c2a7f16;
const physical=independentPhysical(cfg),fusion=createUniversalOneReplyFusion(cfg),
 polynomial=createOneReplyThreatPolynomial(cfg),direct=createDirectTwoMovePullback(cfg);
let rng=SEED;
function word(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
function index(max){
 const limit=Math.floor(0x100000000/max)*max;
 let x;do{x=word();}while(x>=limit);
 return x%max;
}
const hex=x=>'0x'+x.toString(16);
function replay(sequence,metrics){
 let state=physical.empty();
 for(const text of sequence){
  const col=Number(text)-1,next=physical.transition(state,col);
  metrics.validationPhysicalMoves++;
  metrics.validationPhysicalMoves++;
  if(next.terminal!==undefined)throw Error('premature first-win replay '+sequence);
  state=next.state;
 }
 return state;
}
const mirror=mask=>{
 let res=0n;
 for(let c=0;c<7;c++)if(mask&(1n<<BigInt(c)))res|=1n<<BigInt(6-c);
 return res;
};
function physicalNextP0(s,metrics){
 for(const c of physical.legal(s)){
  metrics.validationPhysicalMoves++;metrics.validationImmediateP0Trials++;
  if(physical.transition(s,c).terminal===1)return true;
 }
 return false;
}
export function runStandard7x6FusionControl(){
 const start=Date.now(),deadline=start+MAX_MS;
 const metrics={
  validationPhysicalMoves:0,validationImmediateP0Trials:0,
  fixtureGenerationPhysicalMoves:0,
  fixtureGenerationPhysicalMoves:0,
  residualMembershipChecks:0,
  firstOpponentStates:0,p1LiteralRepliesValidated:0,
  P0PositionsValidated:0,P0FirstActionsValidated:0,
  qIntermediateQConstructedByOneStepReference:0,
  qIntermediateQConstructedByDirectPullback:0,
  polynomialComparisons:0,physicalDisagreements:0,
  structuralReferenceDisagreements:0,mirrorDisagreements:0,
  randomAttempts:0,randomLatePositions:0,
  P1PositiveStates:0,P0WinningActionsCertified:0
 };
 const cases=[],seen=new Set();
 const maxOneState=7*(1+7*(1+7));
 function checkBudget(){
  if(Date.now()>=deadline||metrics.validationPhysicalMoves+maxOneState>MAX_MOVES||
     metrics.residualMembershipChecks+maxOneState>MAX_LOOKUPS)
   throw Error('predeclared 7x6 local validation budget exhausted');
 }
 function validateP1(s,label){
  checkBudget();
  if((s.rank&1)!==1)throw Error('P1 check at wrong rank');
  const q=physical.qfrom(s),f=fusion.analyzeOpponentReplies(q),
    p=polynomial.evaluate(q);
  metrics.residualMembershipChecks+=f.singletonMembershipLookups;
  metrics.polynomialComparisons++;
  if(p!==f.allOpponentRepliesCovered)
   throw Error('polynomial/fused P1 universality mismatch '+label);
  let truth=0n;
  for(const c of physical.legal(s)){
   const next=physical.transition(s,c);
   metrics.validationPhysicalMoves++;metrics.p1LiteralRepliesValidated++;
   if(next.terminal===undefined&&physicalNextP0(next.state,metrics))
    truth|=1n<<BigInt(c);
  }
  if(truth!==f.opponentRepliesLeavingImmediateP0Win){
   metrics.physicalDisagreements++;
   throw Error('exact P1 favorable reply mask differs from physical '+label);
  }
  const reflected=physical.reflected(s),
    other=fusion.analyzeOpponentReplies(physical.qfrom(reflected));
  if(mirror(f.opponentRepliesLeavingImmediateP0Win)!==
     other.opponentRepliesLeavingImmediateP0Win){
   metrics.mirrorDisagreements++;
   throw Error('P1 favorable reply mask reflection failure '+label);
  }
  metrics.firstOpponentStates++;
  if(f.allOpponentRepliesCovered)metrics.P1PositiveStates++;
  cases.push({label,ply:s.rank,sequence:s.sequence,h:s.h,
    P1ReplyGoodMask:hex(f.opponentRepliesLeavingImmediateP0Win),
    polynomial:p,threatMask:hex(f.existingP0WinMask),
    upperMask:hex(f.upperLatentP0Mask)});
 }
 function validateP0(s,label){
  checkBudget();
  if((s.rank&1)!==0)throw Error('P0 direct check at wrong rank');
  const q=physical.qfrom(s),p=direct.compute(q),
    baseline=fusion.p0WinsWithinTwoOwnMoves(q);
  metrics.residualMembershipChecks+=p.metrics.residualMembershipChecks;
  metrics.qIntermediateQConstructedByOneStepReference+=
    baseline.P0ContinuationQStatesConstructed;
  if(p.forcedWinningFirstActionsMask!==baseline.certifiedP0WinningActionsMask){
   metrics.structuralReferenceDisagreements++;
   throw Error('P0 direct source cofactor pullback mismatch '+label);
  }
  let physicalMask=0n;
  for(const a of physical.legal(s)){
   const first=physical.transition(s,a);metrics.validationPhysicalMoves++;
   let possible=first.terminal===1;
   if(first.terminal===undefined){
    possible=true;
    for(const c of physical.legal(first.state)){
     const second=physical.transition(first.state,c);
     metrics.validationPhysicalMoves++;
     if(second.terminal!==undefined||!physicalNextP0(second.state,metrics)){
      possible=false;break;
     }
    }
   }
   if(possible)physicalMask|=1n<<BigInt(a);
   metrics.P0FirstActionsValidated++;
  }
  if(physicalMask!==p.forcedWinningFirstActionsMask){
   metrics.physicalDisagreements++;
   throw Error('P0 direct OR-AND-OR action set differs from physical '+label);
  }
  const reflected=physical.reflected(s),
    mir=direct.compute(physical.qfrom(reflected));
  if(mirror(p.forcedWinningFirstActionsMask)!==mir.forcedWinningFirstActionsMask){
   metrics.mirrorDisagreements++;
   throw Error('direct P0 action set reflection failed '+label);
  }
  metrics.P0PositionsValidated++;
  metrics.P0WinningActionsCertified+=p.actionEvidence.filter(x=>x.certified).length;
  cases.push({label,ply:s.rank,sequence:s.sequence,h:s.h,
    forcedP0ActionMask:hex(p.forcedWinningFirstActionsMask),
    baselineChildQsBuilt:baseline.P0ContinuationQStatesConstructed,
    directChildQsBuilt:0});
 }
 try{
  const origin=replay('44444',metrics);
  validateP1(origin,'44444-P1-turn6');
  for(const c of physical.legal(origin)){
   const s=physical.transition(origin,c).state;
   validateP0(s,'44444-P1-column-'+(c+1));
  }
  // Seed-generated, strictly legal first-win-stopped fixtures, no
  // outcome or strategy labels consulted. Only validation uses replay.
  for(let attempt=0;attempt<MAX_ATTEMPTS&&metrics.randomLatePositions<TARGET;attempt++){
   metrics.randomAttempts++;
   let s=physical.empty(),prev=null;
   while(s.rank<35){
    const eligible=[];
    for(const c of physical.legal(s)){
     if(Date.now()>deadline||metrics.validationPhysicalMoves>=MAX_MOVES)
      throw Error('fixture-generation move/time validation budget exhausted');
     const possible=physical.transition(s,c);
     metrics.validationPhysicalMoves++;metrics.fixtureGenerationPhysicalMoves++;
     if(possible.terminal===undefined)eligible.push(possible.state);
    }
    if(eligible.length===0)break;
    prev=s;s=eligible[index(eligible.length)];
   }
   if(s.rank!==35)continue;
   const k=physical.key(s);
   if(seen.has(k))continue;
   seen.add(k);
   if(!prev||prev.rank!==34)throw Error('late predecessor missing');
   validateP1(s,'seeded-rank35-'+(metrics.randomLatePositions+1));
   validateP0(prev,'seeded-rank34-'+(metrics.randomLatePositions+1));
   metrics.randomLatePositions++;
  }
  return {schema:'connect4.standard7x6.ranklocal-fusion.v0_1',
   date:'2026-10-16',status:metrics.randomLatePositions===TARGET?'PASS':'PARTIAL',
   seed:hex(BigInt(SEED)),scope:'P1 one-reply exact mask, P0 OR-AND-OR two-own-move mask; no eventual game WDL claim',
   budget:{maxPhysicalMoves:MAX_MOVES,maxResidualLookups:MAX_LOOKUPS,maxMs:MAX_MS,
     maxRandomAttempts:MAX_ATTEMPTS,targetLatePositions:TARGET},
   metrics,cases,elapsedMs:Date.now()-start,externalOracleCalls:0,
   solverSearchCalls:0,producerForwardDiscoveryCalls:0,
   outputIsNotGlobalBranchElimination:true};
 }catch(e){
  return {schema:'connect4.standard7x6.ranklocal-fusion.v0_1',status:'FAIL_OR_BUDGET',
   reason:String(e),seed:hex(BigInt(SEED)),metrics,cases,elapsedMs:Date.now()-start};
 }
}
if(process.argv[1]?.endsWith('standard7x6-local-fusion-control.mjs')){
 const x=runStandard7x6FusionControl();console.log(JSON.stringify(x,null,2));
 if(x.status!=='PASS')process.exitCode=1;
}

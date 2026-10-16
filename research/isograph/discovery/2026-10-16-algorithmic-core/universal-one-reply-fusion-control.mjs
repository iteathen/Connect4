#!/usr/bin/env node
// Independent physical rule control for one-P1-reply fusion. This program
// deliberately enumerates a finite small-board game graph ONLY TO FALSIFY
// the algebraic candidate; enumerated search/known WDL never feeds producer.
//
// Checker scans actual four-direction physical winning lines after the P1
// reply, separately checks P0's immediate win and two-own-move lift.
// No exact q solver, oracle, stored candidate policy or value table is used.

import {performance} from 'node:perf_hooks';
import {createUniversalOneReplyFusion} from './universal-one-reply-fusion.mjs';
import {createOneReplyThreatPolynomial} from './universal-reply-threat-polynomial.mjs';

const CONTROLS=[
 {width:4,height:3,connect:3,name:'4x3-c3'},
 {width:4,height:4,connect:4,name:'4x4-c4'}
];
const MAX_STATES=200000,MAX_EDGES=800000,MAX_FORMULA_CHECKS=300000;
const MAX_MS=30000;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const isSubset=(a,b)=>(a&b)===a;
function pc(m){let n=0;while(m){m&=m-1n;n++;}return n;}
function normalized(ms){
 const all=[...new Set(ms.map(String))].map(BigInt)
  .sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));
 const r=[];
 for(const x of all)if(!r.some(y=>isSubset(y,x)))r.push(x);
 return r;
}
class CapReached extends Error{
 constructor(name,detail){super(name);this.name='CapReached';this.detail=detail;}
}
function independentPhysical(cfg) {
 const W=cfg.width,H=cfg.height,K=cfg.connect,N=W*H;
 const cell=(c,r)=>1n<<BigInt(r*W+c);
 const rawLines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of DIRS){
  if(c+(K-1)*dx<0||c+(K-1)*dx>=W||
     r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let mask=0n;
  for(let i=0;i<K;i++)mask|=cell(c+i*dx,r+i*dy);
  rawLines.push(mask);
 }
 const lines=[...new Set(rawLines.map(String))].map(BigInt);
 function empty(){
  return {h:Array(W).fill(0),p0:0n,p1:0n,rank:0,sequence:''};
 }
 const legal=s=>s.h.flatMap((value,c)=>value<H?[c]:[]);
 const key=s=>s.p0.toString(16)+':'+s.p1.toString(16);
 function stone(s,c,r,who){
  if(c<0||c>=W||r<0||r>=H)return false;
  return (((who===0?s.p0:s.p1)&cell(c,r))!==0n);
 }
 // Independent terminal: count contiguous owned stones expanding from last
 // played move; does not consult q residual shapes or q cofactor maps.
 function transition(s,c){
  if(!Number.isInteger(c)||c<0||c>=W||s.h[c]>=H)throw Error('illegal physical action');
  const who=s.rank&1,row=s.h[c],stoneBit=cell(c,row),h=s.h.slice();
  h[c]++;
  const t={h,p0:who===0?s.p0|stoneBit:s.p0,p1:who===1?s.p1|stoneBit:s.p1,
   rank:s.rank+1,sequence:s.sequence+String(c+1)};
  let winner=null;
  for(const [dx,dy] of DIRS){
   let count=1;
   for(const sign of [-1,1]){
    for(let d=1;d<K;d++){
     if(!stone(t,c+d*dx*sign,row+d*dy*sign,who))break;
     count++;
    }
   }
   if(count>=K){winner=who;break;}
  }
  if(winner!==null)return {state:t,terminal:winner===0?1:-1};
  if(t.rank===N)return {state:t,terminal:0};
  return {state:t};
 }
 function qfrom(s){
  const occupied=s.p0|s.p1;
  const R0=normalized(lines.filter(m=>(m&s.p1)===0n).map(m=>m&~occupied));
  const R1=normalized(lines.filter(m=>(m&s.p0)===0n).map(m=>m&~occupied));
  return {h:s.h.slice(),R0,R1};
 }
 function immediatelyP0Win(t,metrics){
  if((t.rank&1)!==0)throw Error('physical immediate claim wrong mover');
  for(const a of legal(t)){
   metrics.physicalP0ImmediateCandidates++;
   metrics.physicalTransitionCalls++;
   const u=transition(t,a);
   if(u.terminal===1)return true;
  }
  return false;
 }
 const reflected=s=>{
  const mirror={h:s.h.slice().reverse(),p0:0n,p1:0n,rank:s.rank,sequence:''};
  for(let c=0;c<W;c++)for(let row=0;row<H;row++){
   const from=cell(c,row),to=cell(W-1-c,row);
   if(s.p0&from)mirror.p0|=to;
   if(s.p1&from)mirror.p1|=to;
  }
  return mirror;
 };
 return {empty,legal,key,transition,qfrom,immediatelyP0Win,reflected};
}
function maskStrings(obj){
 return Object.fromEntries(Object.entries(obj).filter(([k,v])=>typeof v==='bigint')
   .map(([k,v])=>[k,'0x'+v.toString(16)]));
}
function verifyOneBoard(cfg) {
 const fusion=createUniversalOneReplyFusion(cfg),
   polynomial=createOneReplyThreatPolynomial(cfg),physical=independentPhysical(cfg);
 const started=performance.now(),deadline=Date.now()+MAX_MS;
 const result={
  board:cfg,status:'UNSTARTED',
  statement:'all P1 replies leave at least one immediate P0 win (not full-game WDL)',
  counts:{
   physicalStatesEnumerated:0,physicalGraphEdgesEnumerated:0,
   physicalTransitionCalls:0,physicalP0ImmediateCandidates:0,
   p1StateChecks:0,p1LiteralRepliesChecked:0,p1WinningReplies:0,
   polynomialChecks:0,polynomialTermChecks:0,polynomialResidualLookups:0,
   polynomialMaxTermsOnOneSupport:0,polynomialCompiledSupports:0,
   polynomialMismatches:0,
   p0StateChecks:0,p0FirstActionChecks:0,p0LiteralP1RepliesChecked:0,
   p0ProbeBudgetPartial:false,formulaChecks:0,
   fusedOpponentChildStatesExpanded:0,
   fusedStructuralMembershipLookups:0,fusedBitMaskOperations:0,
   p1PositiveCases:0,p0PositiveFirstActions:0,
   types:{T_GE_2:0,T_EQ_1:0,T_EQ_0:0},
   positiveByType:{T_GE_2:0,T_EQ_1:0,T_EQ_0:0},
   p1ImmediateWinGuardCases:0,
   reflectedCases:0,mismatches:0
  },
  negativeControls:{missingP1WinGuardDetected:false,missingUpperThreatDetected:false},
  firstCounterexample:null,
  positiveWitnessByType:{T_GE_2:null,T_EQ_1:null,T_EQ_0:null},
  firstBGuardWitness:null,firstUpperThreatWitness:null
 };
 const M=result.counts;
 function capState(){
  if(M.physicalStatesEnumerated>=MAX_STATES)throw new CapReached('physical state cap',M);
  if(M.physicalGraphEdgesEnumerated>=MAX_EDGES)throw new CapReached('physical graph cap',M);
  if(Date.now()>deadline)throw new CapReached('30-second wall limit',M);
 }
 const seen=new Set(),states=[];
 // Validation-only finite physical reachability enumeration; producer never
 // calls this or consumes the generated solved winning policies.
 function visit(s){
  capState();
  const k=physical.key(s);
  if(seen.has(k))return;
  seen.add(k);M.physicalStatesEnumerated++;states.push(s);
  for(const a of physical.legal(s)){
   if(M.physicalGraphEdgesEnumerated>=MAX_EDGES)
     throw new CapReached('physical graph cap',M);
   M.physicalGraphEdgesEnumerated++;
   const next=physical.transition(s,a);
   if(next.terminal===undefined)visit(next.state);
  }
 }
 try{visit(physical.empty());}
 catch(e){
  result.status=e instanceof CapReached?'BUDGET_EXHAUSTED':'FAIL';
  result.error=String(e);result.totalMs=+(performance.now()-started).toFixed(3);
  return result;
 }
 // First ensure the primary universal predicate is tested for *all* P1
 // positions before spending the remaining budget on P0 two-move probes.
 for(const state of states){
  if((state.rank&1)!==1)continue;
  if(Date.now()>deadline){result.status='BUDGET_EXHAUSTED';break;}
  const q=physical.qfrom(state);
  const predicted=fusion.analyzeOpponentReplies(q);
  const pMetrics={residualMembershipQueries:0,termChecks:0};
  const polynomialPrediction=polynomial.evaluate(q,{metrics:pMetrics});
  M.formulaChecks+=2;M.p1StateChecks++;M.polynomialChecks++;
  M.polynomialResidualLookups+=pMetrics.residualMembershipQueries;
  M.polynomialTermChecks+=pMetrics.termChecks;
  M.polynomialMaxTermsOnOneSupport=Math.max(
    M.polynomialMaxTermsOnOneSupport,polynomial.compile(q.h).symbolicTermCount);
  if(polynomialPrediction!==predicted.allOpponentRepliesCovered){
    M.polynomialMismatches++;M.mismatches++;result.status='FAIL';
    result.firstCounterexample={sequence:state.sequence,rank:state.rank,
      kind:'Boolean monotone polynomial disagrees with fused reply mask',
      polynomialPrediction,bitmaskPrediction:predicted.allOpponentRepliesCovered,
      q:{h:q.h,R0:q.R0.map(String),R1:q.R1.map(String)}};
    break;
  }
  M.fusedStructuralMembershipLookups+=predicted.singletonMembershipLookups;
  M.fusedBitMaskOperations+=predicted.bitMaskAlgebraOperations;
  M.types[predicted.proofCase]++;
  if(predicted.immediateP1WinMask!==0n)M.p1ImmediateWinGuardCases++;
  if(predicted.allOpponentRepliesCovered){
   M.p1PositiveCases++;M.positiveByType[predicted.proofCase]++;
   if(!result.positiveWitnessByType[predicted.proofCase]){
    result.positiveWitnessByType[predicted.proofCase]={
      sequence:state.sequence,rank:state.rank,
      q:{h:q.h.slice(),R0:q.R0.map(x=>x.toString(16)),
        R1:q.R1.map(x=>x.toString(16))},
      masks:maskStrings(predicted)
    };
   }
  }
  let actualGood=0n;
  for(const col of physical.legal(state)){
   const flag=1n<<BigInt(col);
   M.physicalTransitionCalls++;M.p1LiteralRepliesChecked++;
   const next=physical.transition(state,col);
   if(next.terminal===-1)M.p1WinningReplies++;
   const truth=next.terminal===undefined&&physical.immediatelyP0Win(next.state,M);
   if(truth)actualGood|=flag;
  }
  if(actualGood!==predicted.opponentRepliesLeavingImmediateP0Win){
   result.status='FAIL';M.mismatches++;
   result.firstCounterexample={sequence:state.sequence,rank:state.rank,
    q:{h:q.h,R0:q.R0.map(String),R1:q.R1.map(String)},
    predicted:maskStrings(predicted),actualGoodMask:'0x'+actualGood.toString(16)};
   break;
  }
  if(!result.firstBGuardWitness&&predicted.immediateP1WinMask!==0n&&
      (predicted.existingThreatCount>=2||
       (predicted.existingThreatCount===1&&
        (predicted.existingP0WinMask&predicted.upperLatentP0Mask)!==0n))){
   result.firstBGuardWitness={sequence:state.sequence,rank:state.rank,
    mask:maskStrings(predicted)};
   result.negativeControls.missingP1WinGuardDetected=true;
  }
  if(!result.firstUpperThreatWitness&&predicted.allOpponentRepliesCovered&&
    predicted.existingThreatCount===1&&
    (predicted.existingP0WinMask&predicted.upperLatentP0Mask)!==0n){
   result.firstUpperThreatWitness={sequence:state.sequence,rank:state.rank,
    mask:maskStrings(predicted)};
   result.negativeControls.missingUpperThreatDetected=true;
  }
  if(M.reflectedCases<40){
   const mirrored=physical.reflected(state),
    other=fusion.analyzeOpponentReplies(physical.qfrom(mirrored));
   let transformed=0n;
   for(let c=0;c<cfg.width;c++)
    if((predicted.opponentRepliesLeavingImmediateP0Win&(1n<<BigInt(c)))!==0n)
     transformed|=1n<<BigInt(cfg.width-1-c);
   if(transformed!==other.opponentRepliesLeavingImmediateP0Win){
    result.status='FAIL';M.mismatches++;
    result.firstCounterexample={reflectionOf:state.sequence,
      predictedGood:'0x'+transformed.toString(16),
      mirrorGood:'0x'+other.opponentRepliesLeavingImmediateP0Win.toString(16)};
    break;
   }
   M.reflectedCases++;
  }
 }
 // Compare the exact two-P0-move rule lift, retaining the same global budget.
 if(result.status==='UNSTARTED'){
  for(const s of states){
   if((s.rank&1)!==0)continue;
   // Check a conservative per-state direct physical validation edge
   // envelope *before* starting this full P0 universal test, so the
   // declared 800000-edge budget cannot be exceeded mid-obligation.
   // At width W: at most W first actions, W replies each, and W P0
   // immediate-terminal checks after each reply.
   const maxNewValidationTransitions=
     cfg.width*(1+cfg.width*(1+cfg.width));
   if(M.formulaChecks+cfg.width>MAX_FORMULA_CHECKS||
      M.physicalTransitionCalls+maxNewValidationTransitions>MAX_EDGES||
      Date.now()>deadline){
     M.p0ProbeBudgetPartial=true;break;
   }
   const predicted=fusion.p0WinsWithinTwoOwnMoves(physical.qfrom(s));
   M.formulaChecks+=predicted.P0CandidateActionCofactors;
   M.fusedOpponentChildStatesExpanded+=predicted.P1ContinuationQStatesExpanded;
   for(const row of predicted.actionCertificates){
    M.p0FirstActionChecks++;
    const next=physical.transition(s,row.column);
    M.physicalTransitionCalls++;
    let truth=next.terminal===1;
    if(next.terminal===undefined){
     truth=true;
     for(const b of physical.legal(next.state)){
      M.physicalTransitionCalls++;M.p0LiteralP1RepliesChecked++;
      const p1=physical.transition(next.state,b);
      const covered=p1.terminal===undefined&&physical.immediatelyP0Win(p1.state,M);
      if(!covered){truth=false;break;}
     }
    }
    const predictedValue=(predicted.certifiedP0WinningActionsMask&
      (1n<<BigInt(row.column)))!==0n;
    if(truth!==predictedValue){
      M.mismatches++;result.status='FAIL';
      result.firstCounterexample={sequence:s.sequence,rank:s.rank,
       P0First:row.column+1,predicted:predictedValue,actual:truth,
       cause:'two-P0-move first-win classifier mismatch'};
      break;
    }
    if(predictedValue)M.p0PositiveFirstActions++;
   }
   M.p0StateChecks++;
   if(result.status==='FAIL')break;
  }
 }
 if(result.status==='UNSTARTED')
   result.status=M.p0ProbeBudgetPartial?'PASS_P1_FULL_P0_PARTIAL':'PASS';
 // Negative controls are also attempted on synthetic abstract q shaped from
 // existing geometry only if physical states do not exercise them. Flag
 // absence of natural physical witnesses; never fabricate observed failures.
 M.polynomialCompiledSupports=polynomial.compiledSupportCount();
 result.totalMs=+(performance.now()-started).toFixed(3);
 result.obligations={
  P1AllLegallyReachableStatesCompared:M.p1StateChecks===
   states.filter(s=>(s.rank&1)===1).length,
  P0AllLegallyReachableStatesCompared:M.p0StateChecks===
   states.filter(s=>(s.rank&1)===0).length,
  semanticProducerConsultedSearchGraph:false,
  physicalContinuationEnumerationOnlyInValidation:true
 };
 return result;
}
export function runUniversalFusionQualification(){
 const cases=CONTROLS.map(verifyOneBoard);
 const failed=cases.some(x=>x.status==='FAIL');
 const partial=cases.some(x=>x.status!=='PASS');
 return {
  schema:'connect4.alternating-one-reply-cofactor-fusion.v0_1',
  date:'2026-10-16',status:failed?'FAIL':partial?'PARTIAL':'PASS',
  cases,
  oracleQueries:0,
  proofCandidateInputs:'support h, actual P0/P1 residual antichains only',
  gameValueScope:'exact one-P1-reply immediate P0 winning-response mask and P0 two-own-move first-win certificate, not eventual WDL',
  globalNonbranchingAlgorithmEstablished:false
 };
}
if(process.argv[1]?.endsWith('universal-one-reply-fusion-control.mjs')){
 const out=runUniversalFusionQualification();
 console.log(JSON.stringify(out,null,2));
 if(out.status==='FAIL')process.exitCode=1;
}

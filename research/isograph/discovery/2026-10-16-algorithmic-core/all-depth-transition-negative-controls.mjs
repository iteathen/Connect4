#!/usr/bin/env node
// Adversarial checks for two incorrect simplifications:
// 1. Keep mover-contraction but OMIT opponent blocker cofactor;
// 2. Treat column phase (even capacity parity) as sufficient legality.
//
// Validation only; neither simplification is used in owner-mask producer.
import {createAllDepthOwnerMaskLift} from './all-depth-owner-mask-lift.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';

const G={width:7,height:6,connect:4};
const exact=createExactQCore(G),physical=independentPhysical(G);
const subset=(a,b)=>(a&b)===a;
const size=x=>{let n=0;for(;x;x&=x-1n)n++;return n;};
const min=masks=>{
 const sorted=[...new Set(masks.map(String))].map(BigInt)
  .sort((a,b)=>size(a)-size(b)||(a<b?-1:a>b?1:0)),r=[];
 for(const x of sorted)if(!r.some(y=>subset(y,x)))r.push(x);
 return r;
};
const hex=x=>'0x'+x.toString(16);
export function runAllDepthNegativeControls(){
 let first=physical.empty();
 for(const c of [0,1]){
  const e=physical.transition(first,c);
  if(e.terminal!==undefined)throw Error('unexpected terminal 12');
  first=e.state;
 }
 const fromPhysics=physical.qfrom(first),base=exact.createEmpty(),
   p0Stone=exact.bit(0,0),p1Stone=exact.bit(1,0);
 const genuine=createAllDepthOwnerMaskLift(G,base);
 genuine.apply(0);genuine.apply(1);
 const actual=genuine.deriveResidualQForValidation();
 if(exact.key(fromPhysics)!==exact.key(actual))
  throw Error('source cofactor 12 positive control failed');
 const missingBlockedP0=min(base.R0.map(x=>x&~p0Stone));
 const falseBlocker=missingBlockedP0.some(x=>!actual.R0.includes(x));
 if(!falseBlocker)throw Error('removing blocked requirements escaped negative control');
 const changed=missingBlockedP0.filter(x=>!actual.R0.includes(x)).map(hex);

 let center=physical.empty();
 for(let k=0;k<6;k++){
  const e=physical.transition(center,3);
  if(e.terminal!==undefined)throw Error('center-six prematurely terminal');
  center=e.state;
 }
 const h=center.h,phi=h.map(v=>(6-v)&1);
 const centerEmptyPhase=phi[0]===phi[3];
 const realCenterLegal=physical.legal(center).includes(3);
 if(!centerEmptyPhase||realCenterLegal)throw Error('phase-only capacity negative test failed');
 let seventh1=physical.transition(center,0).state;
 let seventh2=physical.transition(center,1).state;
 const q1=physical.qfrom(seventh1),q2=physical.qfrom(seventh2);
 const samePhaseWeight=q1.h.filter(v=>v%2===1).length===q2.h.filter(v=>v%2===1).length;
 if(!samePhaseWeight||exact.key(q1)===exact.key(q2))
  throw Error('rank7 phase-weight non-injectivity negative control failed');
 return {
  schema:'connect4.all-depth-owner-mask.negative-controls.v0_1',
  date:'2026-10-16',status:'PASS',
  blockerGuard:{
   legalPhysicalPrefix:'12',expectedR0Count:actual.R0.length,
   missingBlockerR0Count:missingBlockedP0.length,
   incorrectExtraResiduals:changed,
   mutationRejected:falseBlocker
  },
  columnCapacityGuard:{
   legalPrefix:'444444',
   centerHeight:h[3],emptyWingHeight:h[0],
   centerAndEmptyWingSameEvenPhase:centerEmptyPhase,
   centerColumnLegallyPlayable:realCenterLegal,
   phaseOnlyLegalityRejected:true
  },
  phaseDoesNotProveRank7OutcomeEquivalence:{
   histories:['4444441','4444442'],
   equalPhaseHammingWeight:samePhaseWeight,
   exactOrientationSensitiveQEqual:false,
   interpretation:'same phase weight does not prove q future-game equivalence or WDL equality'
  },
  oracleCalls:0,searchDrivenCandidate:false
 };
}
if(process.argv[1]?.endsWith('all-depth-transition-negative-controls.mjs')){
 console.log(JSON.stringify(runAllDepthNegativeControls(),null,2));
}

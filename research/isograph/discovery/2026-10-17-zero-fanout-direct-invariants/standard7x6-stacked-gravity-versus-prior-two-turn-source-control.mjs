// Frozen marginal-control BEFORE execution. Compare same ORIGINAL 7x6 q
// for 12 already committed true physical-success source witnesses.
// Both "old" and "new" operators use only original source predicates,
// ZERO future game value queries; this is NOT a claim of incremental
// difference against every prior proof family in the research repository.
// Physical validity of all witnesses separately frozen and checked
// in STANDARD7X6_STACKED_GRAVITY_SOURCE_WINNING_CONTINUATION_RESULTS_0_1.json
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createStackedGravityThreatCertificate} from './standard7x6-stacked-gravity-threat-source-certificate.mjs';
import {createDirectTwoTurnFrontier} from './direct-two-turn-frontier-operator.mjs';
import {createDirectZeroFanout} from './direct-zero-fanout-operator.mjs';
const W=7,H=6,K=4,geom={width:W,height:H,connect:K};
const core=createExactQCore(geom),newer=createStackedGravityThreatCertificate(geom),
 baseline=createDirectTwoTurnFrontier(geom);
const histories=[
 '61211176647235555437321517257666233',
 '6121117664723555543732151725766623372',
 '4743347313171354545177714561',
 '47433473131713545451777145613655222',
 '4743347313171354545177714561365522266',
 '7221746565673334',
 '352171747543622265632142564665133731',
 '35217174754362226563214256466513373151',
 '3115764225351417322322735',
 '3115764225351417322322735341441765476',
 '52553774171124544341',
 '5255377417112454434115'
];
const report={
 schema:'connect4.7x6.stacked_gravity_vs_original_two_turn_source_margin_v0_1',
 board:{W,H,K},sourceHistoriesCompared:0,
 priorDirectExactIndividualSelectedActionCount:0,
 previouslyUncertifiedSelectedActionNewlyCertified:0,
 previousFullL2RootOutcomeOpenButNewValidContinuation:0,
 bothSourceCertified:0,
 mismatchesOrLostPriorFullValues:0,
 strategicFutureGameValueQueries:0,
 originalLiteralMoveAndSourceDetails:[]
};
for(const history of histories){
 let q=core.createEmpty();
 for(const c of history){
  const out=core.next(q,Number(c)-1);
  if(out.terminal!==undefined)throw Error('fixture is NOT first-win-stopped nonterminal');
  q=out.q;
 }
 const fresh=newer.compute(q),old=baseline.compute(q);
 if(fresh.status!=='VALID_CONTINUATION')throw Error('saved new witness not reproducible');
 const literal=fresh.selectedOriginalLiteralColumn;
 const e=old.firstActionSourceProofs?.find(z=>z.column===literal-1);
 if(!e)throw Error('old source action missing');
 const p=q.h.reduce((s,x)=>s+x,0)&1;
 if(e.value!==null){
  if(e.value!==(p===0?1:-1)){report.mismatchesOrLostPriorFullValues++;throw Error('old local source certificate contradictory');}
  report.priorDirectExactIndividualSelectedActionCount++;report.bothSourceCertified++;
 }else report.previouslyUncertifiedSelectedActionNewlyCertified++;
 if(old.status==='INCOMPLETE')report.previousFullL2RootOutcomeOpenButNewValidContinuation++;
 report.sourceHistoriesCompared++;
 report.originalLiteralMoveAndSourceDetails.push({
  history,ply:history.length,player:p,
  originalLiteralColumnSelectedByNewSource:literal,
  singleTargetColumn:fresh.proof.uniqueStackedColumn,
  oldSelectedActionReason:e.reason,
  oldSelectedActionExactValue:e.value,
  oldFullRootLevel2Known:old.status!=='INCOMPLETE',
  newSourceOneBestMoveCertified:true,
  sampleOnlyNotGlobalMarginalRate:true
 });
}
console.log(JSON.stringify(report,null,2));

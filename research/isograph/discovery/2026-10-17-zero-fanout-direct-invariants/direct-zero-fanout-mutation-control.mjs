// Guard and exact-label mutation falsifiers for the SOURCE-ONLY direct
// zero-game-fanout operator. Synthetic normalized-shape q records test
// the algebra's structural guards; the independent full-board physical
// control is the source of physical reachability/exact WDL qualification.
import {createDirectZeroFanout} from './direct-zero-fanout-operator.mjs';
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';

export function runDirectZeroFanoutMutationControl() {
 const geometry={width:4,height:4,connect:4},
  classify=createDirectZeroFanout(geometry),core=createExactQCore(geometry),
  bit=(c,r)=>1n<<BigInt(r*4+c),
  report={schema:'connect4.direct-zero-fanout-mutation-control.v0_1',
   status:'PASS',cases:[],zeroStrategicFutureEvaluations:true};
 function test(name,q,predicate) {
  const result=classify.compute(q);
  if(!predicate(result))
   throw Error('failed exact structural source guard '+name+': '+JSON.stringify({q:{
    h:q.h,R0:q.R0.map(String),R1:q.R1.map(String)
   },result}));
  if(result.statistics.futureStrategicBranches!==0||
     result.statistics.futureGameStates!==0||
     result.statistics.quantifiedFutureObligations!==0||
     result.statistics.precomputedGameValueQueries!==0)
   throw Error('zero-fanout invariant violated '+name);
  report.cases.push({name,status:result.status,certificate:result.proofKind||null,
   value:result.value,bestMoves:result.bestMoves});
 }
 const all0=[0,0,0,0],none=[];
 test('two duplicated opponent singleton requirements do not make two distinct threatened columns',
  {h:all0,R0:[],R1:[bit(0,0),bit(0,0)]},r=>r.status==='INCOMPLETE');
 test('opponent singleton cells above the current frontier are not immediate threats',
  {h:all0,R0:[],R1:[bit(0,1),bit(1,1)]},r=>r.status==='INCOMPLETE');
 test('opponent two threats plus immediate mover win certifies only mover winning moves',
  {h:all0,R0:[bit(0,0)],R1:[bit(1,0),bit(2,0)]},
  r=>r.proofKind==='TWO_DISTINCT_OPPONENT_LIVE_SINGLETONS'&&r.value===1&&
    JSON.stringify(r.bestMoves)==='[0]'&&
    JSON.stringify(r.actionValues.map(([,v])=>v))==='[1,-1,-1,-1]');
 test('opponent two threats without own immediate win makes every legal action a losing tie',
  {h:all0,R0:[],R1:[bit(1,0),bit(2,0)]},
  r=>r.value===-1&&JSON.stringify(r.bestMoves)==='[0,1,2,3]');
 test('source R0 requirement not containing any safe gravity pair disqualifies draw',
  {h:[2,2,4,4],R0:[bit(0,2)],R1:[]},r=>r.status==='INCOMPLETE');
 test('an apparently paired lower landing but uncovered upper-cell requirement is unsafe',
  {h:[0,2,4,4],R0:[bit(0,1)|bit(1,2)],R1:[]},
  r=>r.status==='INCOMPLETE');
 test('a live R1 winning requirement disqualifies the source paired-DRAW theorem',
  {h:[4,4,2,2],R0:[bit(2,2)|bit(3,2)],R1:[bit(2,2)]},
  r=>r.status==='INCOMPLETE');
 const safe={h:[4,4,2,2],R0:[bit(2,2)|bit(3,2)],R1:[]};
 test('different columns at same height form a safe paired DRAW and both best moves',
  safe,r=>r.proofKind==='SAFE_GRAVITY_PAIRING_AND_NO_P1_WIN_PATH'&&r.value===0&&
    JSON.stringify(r.bestMoves)==='[2,3]'&&r.structuralCertificate.blocks.some(x=>x.type==='horizontal'));
 // Independent q semantics of the synthetic-but-source-compatible safe
 // residual instance: used only AFTER the pairing proof was constructed.
 const reference=core.solve(safe).answer;
 if(reference.value!==0||JSON.stringify(reference.bestMoves)!=='[2,3]')
   throw Error('independent exact q safe horizontal pairing disagrees');
 report.independentGenericSourceQDrawReference={value:reference.value,
   bestMoves:reference.bestMoves};
 return report;
}

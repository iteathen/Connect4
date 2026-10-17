// Static/source-only neutral-capacity bisimulation controls, including
// the exact generic 1+3 vs 2+2 inert-token distribution and guards.
// Independent ordinary q minimax appears only as a falsification oracle.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createInertCapacityBisimulation} from './inert-capacity-bisimulation.mjs';

export function runInertCapacityGenericControl(){
 const geom={width:4,height:4,connect:4},
  core=createExactQCore(geom),proto=createInertCapacityBisimulation(geom),
  qA={h:[3,1,4,4],R0:[],R1:[]},
  qB={h:[2,2,4,4],R0:[],R1:[]},
  qModified={h:[2,2,4,4],R0:[1n<<BigInt(3*4+0)],R1:[]},
  k1=proto.compareFutureGames(qA,qB),
  k2=proto.compareFutureGames(qA,qModified);
 if(k1.status!=='EXACT_DYNAMIC_FULL_FUTURE_BISIMULATION'||k1.sourceA.neutralPoolTokens!==4
    ||k1.sourceB.neutralPoolTokens!==4||k2.status!=='NOT_CERTIFIED')
    throw Error('generic neutral capacity/broken upper active cell control failed');
 const vA=core.solve(qA),vB=core.solve(qB);
 if(vA.answer.value!==0||vB.answer.value!==0||vA.answer.bestMoves.length!==2||vB.answer.bestMoves.length!==2)
   throw Error('independent generic empty-upset full-game draw failed');
 // Legally reachable source with different-capacity P1 children.
 const original=core.createEmpty();
 let q=original;
 for(const raw of '1111222324334'){
  const next=core.next(q,Number(raw)-1);
  if(next.terminal!==undefined)throw Error('physical known source terminal unexpectedly');
  q=next.q;
 }
 const rootClass=proto.compute(q);
 const branch3=core.next(q,2),branch4=core.next(q,3);
 if(branch3.terminal!==undefined||branch4.terminal!==undefined)
  throw Error('legal different-capacity source terminated immediately');
 const future=proto.compareFutureGames(branch3.q,branch4.q);
 if(future.status!=='EXACT_DYNAMIC_FULL_FUTURE_BISIMULATION')throw Error('legally reachable source failed dynamic cross-capacity equivalence');
 const left=core.solve(branch3.q),right=core.solve(branch4.q);
 if(left.answer.value!==right.answer.value)throw Error('future values differ despite source dynamic equality');
 const shapes=[branch3.q.h.slice().sort().join(','),branch4.q.h.slice().sort().join(',')];
 if(shapes[0]===shapes[1])throw Error('future states accidentally have a fixed height-preserving permutation');
 // Deliberately weak/incomplete next-cell-only test; first cell not in R
 // but a higher cell is, so declaring this column inert must FAIL.
 const unsafe={h:[0,4,4,4],R0:[1n<<BigInt(2*4+0)],R1:[]};
 const unsafeOut=proto.compute(unsafe);
 if(unsafeOut.inertLiteralColumns.length!==0)
  throw Error('next-cell-only inert false proof accepted: higher residual is live');
 return {schema:'connect4.inert-capacity-generic-control.v0_1',status:'PASS',
  genericNeutralPartitions:[[1,3],[2,2]],
  genericTokens:4,
  genericFutureBisimilar:true,genericIndependentWDLResults:[vA.answer.value,vB.answer.value],
  bogusFutureActiveCellMutationRejected:true,
  topLandingInertButUpperCellLiveMutationRejected:true,
  physicalHistory:'1111222324334',
  physicalP1NeutralActionsOneBased:[3,4],
  physicalNeutralTokenPool:rootClass.initialNeutralPoolCapacity,
  physicalDifferentChildCapacityProfiles:shapes,
  physicalDynamicFullFutureBisimilar:true,
  physicalIndependentWDLResults:[left.answer.value,right.answer.value],
  physicalSourceOriginalInertLabelsOneBased:rootClass.inertLiteralColumns.map(x=>x+1),
  sourceProducerSearchedGameplay:false};
}

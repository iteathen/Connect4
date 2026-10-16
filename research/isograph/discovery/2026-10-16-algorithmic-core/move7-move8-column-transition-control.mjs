#!/usr/bin/env node
// Exact rank-5 to rank-8 standard7x6 column-capacity boundary qualification.
// Producer: virtual-upset-five-ply rule algebra. All legal prefix enumeration,
// cofactor physical replay and ordinary child-q construction are VALIDATION
// only. No WDL or searched policy is consulted by the candidate rule.
import {createVirtualUpsetFivePly} from './virtual-upset-five-ply.mjs';
import {createUniversalResponseCover} from './universal-response-cover-operator.mjs';
import {createDirectTwoMovePullback} from './direct-two-move-pullback.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';

const G={width:7,height:6,connect:4};
const MAX_CHECKS=400000,MAX_SOURCE_UPSET=500000,MAX_MS=30000;
const virtual=createVirtualUpsetFivePly(G),cover=createUniversalResponseCover(G),
 directTwo=createDirectTwoMovePullback(G),core=createExactQCore(G),
 physical=independentPhysical(G);
const rank=q=>q.h.reduce((s,v)=>s+v,0);
const mask=x=>'0x'+x.toString(16);
const colMask=q=>q.h.reduce((bits,h,c)=>h<6?bits|(1n<<BigInt(c)):bits,0n);
const phase=q=>q.h.map(n=>(6-n)&1);
const phaseWeight=q=>phase(q).reduce((s,n)=>s+n,0);
const upset=(R,S,stats)=>{
 stats.sourceUpsetLookups++;
 for(const r of R){stats.residualContainmentComparisons++;
  if((r&S)===r)return true;}
 return false;
};
function reflectQ(q){
 const refCell=c=>c<0?null:c;
 const reflectMask=mask=>{
  let out=0n;
  for(let c=0;c<7;c++)for(let r=0;r<6;r++){
   const source=1n<<BigInt(r*7+c);
   if(mask&source)out|=1n<<BigInt(r*7+6-c);
  }return out;
 };
 const sort=arr=>arr.map(reflectMask).sort((a,b)=>
  {let n=0,m=0;for(let x=a;x;x&=x-1n)n++;for(let x=b;x;x&=x-1n)m++;
   return n-m||(a<b?-1:a>b?1:0);});
 return {h:q.h.slice().reverse(),R0:sort(q.R0),R1:sort(q.R1)};
}
function sourceMasks(q){
 return {height:q.h,legal:mask(colMask(q)),
  phase:phase(q).join(''),phaseWeight:phaseWeight(q),
  residual0:q.R0.length,residual1:q.R1.length};
}
export function runMove7Move8Control(){
 const t=Date.now(),deadline=t+MAX_MS;
 const M={physicalReplayEdges:0,physicalGeometryQChecks:0,
  coreCofactorQChecks:0,phaseUpdateChecks:0,
  virtualCofactorUpsetChecks:0,sourceUpsetLookups:0,
  residualContainmentComparisons:0,virtualCofactorDisagreements:0,
  firstWinTerminalEdges:0,priorColumnFull:false,
  columnFirstFilledAtMove6:0,columnFirstFilledAtMove7:0,
  columnFirstFilledAtMove8:0,columnNotFilledThroughMove8:0,
  move6P1RepliesChecked:0,move7P0ActionsChecked:0,move8P1ActionsChecked:0,
  centerFullMove7States:0,centerNotFullMove7States:0,
  move8ZeroPhaseOnCenterFull:0,move8WeightTwoPhaseOnCenterFull:0,
  fixedHorizonVirtualRoots:0,virtualRootThreeOwnTurnWinActions:0,
  virtualRootUpSetMembershipTests:0,virtualRootDegreeThreeQueries:0,
  virtualRootResidualComparisons:0,
  rank7CoverComparisonStates:0,rank7CoverResponseRows:0,
  rank7CoverMismatches:0,rank8TwoOwnMoveStates:0,
  rank8TwoOwnMovePositiveActions:0,
  centerRank7ReflectionPairs:0,centerRank7ReflectionMismatches:0,
  rank8DistinctQ:0,singletonChecks:0,pairChecks:0,tripleChecks:0,
  totalPartialQChecks:0};
 const samples={rank5:null,rank6:[],rank7CenterFull:[],rank8CenterFull:[],
  rank8PositiveExamples:[],crossingFirstFillByPly:{}};
 const rank8Keys=new Set(),rank7Center=new Map(),stray=[];
 const src=physical.empty();
 function invariant(s,q,origin){
  if(s.rank!==rank(q)||s.h.some((n,i)=>n!==q.h[i]))
   throw Error('rank/support mismatch '+origin);
  const fromPhysical=physical.qfrom(s);
  if(core.key(fromPhysical)!==core.key(q))
   throw Error('exact q vs physical residual mismatch '+origin);
  M.physicalGeometryQChecks++;
 }
 function makeMove(s,q,c,prefix){
  if(Date.now()>deadline||M.totalPartialQChecks>=MAX_CHECKS||
     M.sourceUpsetLookups>=MAX_SOURCE_UPSET)
   throw Error('predeclared virtual transition check budget exhausted');
  const physically=physical.transition(s,c),algebraically=core.next(q,c);
  M.physicalReplayEdges++;
  const pt=physically.terminal,at=algebraically.terminal;
  if(pt!==at&&!(pt===undefined&&at===undefined))
   throw Error('physical/cofactor terminal disagreement '+prefix);
  if(pt!==undefined){M.firstWinTerminalEdges++;return null;}
  invariant(physically.state,algebraically.q,prefix);
  M.coreCofactorQChecks++;
  const parentPhase=phase(q),childPhase=phase(algebraically.q);
  for(let k=0;k<7;k++)
   if(childPhase[k]!==((parentPhase[k]+Number(k===c))%2))
    throw Error('phase GF2 update invalid '+prefix);
  M.phaseUpdateChecks++;
  return {s:physically.state,q:algebraically.q};
 }
 function compareVirtualU(prev,next,moved,triplesPerEdge,pairsPerEdge){
  const landing=core.bit(moved,prev.h[moved]);
  const mover=rank(prev)&1;
  const cells=[];
  for(let c=0;c<7;c++)for(let row=next.h[c];row<6;row++)
   cells.push(core.bit(c,row));
  const sets=[];
  for(const x of cells){sets.push(x);M.singletonChecks++;}
  let pairs=0;
  outer:for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){
   if(pairs>=pairsPerEdge)break outer;
   sets.push(cells[i]|cells[j]);pairs++;M.pairChecks++;
  }
  let countTriples=0;
  outer2:for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)
   for(let k=j+1;k<cells.length;k++){
    if(countTriples>=triplesPerEdge)break outer2;
    sets.push(cells[i]|cells[j]|cells[k]);
    countTriples++;M.tripleChecks++;
   }
  for(const S of sets){
   if(M.totalPartialQChecks+2>MAX_CHECKS||M.sourceUpsetLookups+4>MAX_SOURCE_UPSET)
    throw Error('source virtual-upset check budget exhausted');
   for(let who=0;who<2;who++){
    const Ri=who===0?'R0':'R1';
    const expected=upset(prev[Ri],who===mover?(S|landing):S,M);
    const actual=upset(next[Ri],S,M);
    M.totalPartialQChecks++;
    if(expected!==actual){
     M.virtualCofactorDisagreements++;
     throw Error('false virtual cofactor upset identity on '+Ri+' support '+prev.h+' to '+next.h+' query '+S);
    }
    M.virtualCofactorUpsetChecks++;
   }
  }
 }
 function replayPrefix(s){
  let node={s, q:core.createEmpty()};
  for(let i=0;i<5;i++){
   node=makeMove(node.s,node.q,3,'44444-'+i);
   if(!node)throw Error('early center-five terminal');
  }
  return node;
 }
 try {
  const initial=replayPrefix(src);
  invariant(initial.s,initial.q,'44444');
  samples.rank5=sourceMasks(initial.q);
  const allRank6=[];
  for(const b of physical.legal(initial.s)){
   const six=makeMove(initial.s,initial.q,b,'turn6-'+(b+1));
   if(!six)throw Error('unexpected terminal move 6');
   M.move6P1RepliesChecked++;
   samples.rank6.push({P1move6:b+1,...sourceMasks(six.q)});
   allRank6.push({b,six});
  }
  const everyRank7=[];
  for(const {b,six} of allRank6){
   const virtualResult=virtual.compute(six.q,{
    maxChecks:150000,deadlineAt:deadline});
   if(virtualResult.status!=='COMPLETE_FIVE_PLY_FIXED_HORIZON')
    throw Error('virtual source predicate unfinished at move 6');
   M.fixedHorizonVirtualRoots++;
   M.virtualRootUpSetMembershipTests+=virtualResult.statistics.upsetMembershipTests;
   M.virtualRootDegreeThreeQueries+=virtualResult.statistics.degreeThreeQueries;
   M.virtualRootResidualComparisons+=virtualResult.statistics.residualComparisons;
   for(const action of virtualResult.actionResults)
    M.virtualRootThreeOwnTurnWinActions+=Number(action.universal);
   for(const a of physical.legal(six.s)){
    const seven=makeMove(six.s,six.q,a,'move7-'+(b+1)+'-'+(a+1));
    if(!seven)throw Error('unexpected move7 terminal');
    M.move7P0ActionsChecked++;
    compareVirtualU(six.q,seven.q,a,16,10000); // exhaustive all singles+pairs
    const predicted=virtualResult.actionResults.find(z=>z.a===a);
    if(!predicted)throw Error('missing algebraic initial P0 action');
    const reference=cover.compute(seven.q);
    M.rank7CoverComparisonStates++;
    M.rank7CoverResponseRows+=reference.statistics.P0ReplyActionLabels;
    if(predicted.universal!==reference.universalBoundedP0Win||
       predicted.p1CoveredMask!==reference.coveredInitialP1Mask||
       predicted.P0CoverByColumn?.some((x,i)=>x!==reference.responseCoverByP0Column[i])){
      M.rank7CoverMismatches++;
      throw Error('virtual five-ply vs exact child response covers at '+seven.s.sequence);
    }
    if(seven.q.h[3]===6){M.centerFullMove7States++;
     if(b===3){rank7Center.set(a,seven.q);
      samples.rank7CenterFull.push({sequence:seven.s.sequence,move7:a+1,
       phase:phase(seven.q).join(''),mask:mask(colMask(seven.q)),
       shortHorizon:predicted.universal});}
    }else M.centerNotFullMove7States++;
    everyRank7.push({b,a,seven});
   }
  }
  for(const [a,q] of rank7Center){
   const mirrored=rank7Center.get(6-a);
   if(!mirrored)throw Error('missing horizontal reflection mate');
   if(core.key(reflectQ(q))!==core.key(mirrored)){
    M.centerRank7ReflectionMismatches++;
    throw Error('center-full turn7 mirror transporter mismatch '+(a+1));
   }
   if(a<6-a)M.centerRank7ReflectionPairs++;
  }
  for(const {b,a,seven} of everyRank7){
   for(const d of physical.legal(seven.s)){
    const eight=makeMove(seven.s,seven.q,d,
      'move8-'+(b+1)+'-'+(a+1)+'-'+(d+1));
    if(!eight)throw Error('unexpected early terminal at move8');
    M.move8P1ActionsChecked++;
    compareVirtualU(seven.q,eight.q,d,12,48);
    rank8Keys.add(core.key(eight.q));
    const group=seven.q.h[3]===6?
     (b===3?'move6':'move7'):
     (d===3?'move8':'not_by8');
    if(group==='move6')M.columnFirstFilledAtMove6++;
    else if(group==='move7')M.columnFirstFilledAtMove7++;
    else if(group==='move8')M.columnFirstFilledAtMove8++;
    else M.columnNotFilledThroughMove8++;
    if(eight.q.h[3]===6&&b===3){
     const w=phaseWeight(eight.q);
     if(a===d&&w===0)M.move8ZeroPhaseOnCenterFull++;
     else if(a!==d&&w===2)M.move8WeightTwoPhaseOnCenterFull++;
     else throw Error('GF2 macro phase class mismatch on filled center '+eight.s.sequence);
    }
    const horizon=directTwo.compute(eight.q);
    M.rank8TwoOwnMoveStates++;
    const bits=horizon.forcedWinningFirstActionsMask;
    let ct=0;for(let x=bits;x;x&=x-1n)ct++;
    M.rank8TwoOwnMovePositiveActions+=ct;
    if(ct>0&&samples.rank8PositiveExamples.length<12)
     samples.rank8PositiveExamples.push({
      sequence:eight.s.sequence,
      P1turn6:b+1,P0turn7:a+1,P1turn8:d+1,
      P0twoOwnTurnWinningMask:mask(bits)});
    if(b===3&&samples.rank8CenterFull.length<12)
     samples.rank8CenterFull.push({
      sequence:eight.s.sequence,phase:phase(eight.q).join(''),
      support:eight.q.h});
   }
  }
  M.rank8DistinctQ=rank8Keys.size;
  if(M.move6P1RepliesChecked!==7||M.move7P0ActionsChecked!==48||
     M.move8P1ActionsChecked!==324||
     M.columnFirstFilledAtMove6!==36||
     M.columnFirstFilledAtMove7!==36||
     M.columnFirstFilledAtMove8!==36||
     M.columnNotFilledThroughMove8!==216||
     M.centerRank7ReflectionPairs!==3)
   throw Error('expected exact full-column boundary census disagrees '+JSON.stringify(M));
  return {schema:'connect4.move7-move8.column-full-virtual-cofactor.v0_1',
   status:'PASS',scope:'all rank5 44444 / rank6 P1 / rank7 P0 / rank8 P1 legal first-win paths; bounded horizon only',
   tests:{prefix:'44444',mode:'rank-local cofactor, GF2 phase and move6/7/8 center-capacity guards; no value-oracle use'},
   metrics:M,samples,wallMs:Date.now()-t,
   noSearchInCandidate:true,noFullGameWDLProof:true};
 }catch(e){
  return {schema:'connect4.move7-move8.column-full-virtual-cofactor.v0_1',
   status:'FAIL_OR_BUDGET',error:String(e),metrics:M,samples,wallMs:Date.now()-t};
 }
}
if(process.argv[1]?.endsWith('move7-move8-column-transition-control.mjs')){
 const z=runMove7Move8Control();console.log(JSON.stringify(z,null,2));
 if(z.status!=='PASS')process.exitCode=1;
}

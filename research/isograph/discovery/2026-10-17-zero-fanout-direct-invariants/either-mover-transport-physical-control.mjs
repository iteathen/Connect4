// Independent full q WDL and future action transporter validation for a
// source-only static column equivalence generalized to P0 or P1 mover.
// The source candidate NEVER reads solved values; a separate qualified
// exact-q full-game reference is consulted AFTER deriving every certificate.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createEitherMoverExactTransport} from './either-mover-future-transport.mjs';
export function runEitherMoverTransportPhysicalControl({geometry={
  width:4,height:3,connect:3},maxQStates=60000}={}){
 const core=createExactQCore(geometry),memo=new Map(),
  baseline=core.solve(core.createEmpty(),{sharedMemo:memo,maxStates:60000,maxTransitions:300000}),
  producer=createEitherMoverExactTransport(geometry);
 const result={schema:'connect4.either-mover-full-future-transport-control.v0_1',
  geometry,status:'PASS',
  qualifiedFullSourceQStates:memo.size,sourceQChecks:0,
  sourceP0Checks:0,sourceP1Checks:0,
  pairComparisons:0,sourceIsomorphismCertifications:0,
  P0SourceIsomorphismCertifications:0,P1SourceIsomorphismCertifications:0,
  sourceOneWayDominanceCertifications:0,
  validatedExactFullGameActionTransportPairs:0,
  sourceOnlyOperations:0,sourceQBudgetPartials:0,
  falseFullGameRootActionEqualities:0,
  falseP0RelativeWeakOrders:0,
  falseFullFutureActionLabelTransports:0,
  exactQReferenceStates:memo.size,
  qStatesWithTwoPlusSourceLabels:0,
  firstNonmirrorP0SourceEquivalence:null};
 for(const key of memo.keys()){
  if(result.sourceQChecks>=maxQStates){result.status='CORPUS_BUDGET_PARTIAL';break;}
  const [heights,r0,r1]=key.split('|');
  const q={h:heights.split('.').map(Number),
   R0:r0?r0.split(',').map(BigInt):[],R1:r1?r1.split(',').map(BigInt):[]};
  const turn=q.h.reduce((sum,x)=>sum+x,0)%2;
  const local=producer.compute(q);
  result.sourceQChecks++;result.sourceOnlyOperations+=local.statistics.operations;
  if(turn===0)result.sourceP0Checks++;else result.sourceP1Checks++;
  if(core.legal(q).length>=2)result.qStatesWithTwoPlusSourceLabels++;
  if(local.status!=='COMPLETE')result.sourceQBudgetPartials++;
  const sourceValues=new Map(memo.get(key).actionValues);
  for(const edge of local.pairs){
   result.pairComparisons++;
   if(!edge.actions)continue;
   const [a,b]=edge.actions;
   const left=sourceValues.get(a),right=sourceValues.get(b);
   if(edge.firstNoHigher&&left>right||edge.secondNoHigher&&right>left){
    result.falseP0RelativeWeakOrders++;
    throw Error('invalid future static source weak WDL order for '+key+' pair '+a+':'+b);
   }
   if(!edge.firstNoHigher&&!edge.secondNoHigher)continue;
   if(edge.firstNoHigher!==edge.secondNoHigher)result.sourceOneWayDominanceCertifications++;
   if(edge.exactFutureActionMap){
    result.sourceIsomorphismCertifications++;
    if(turn===0)result.P0SourceIsomorphismCertifications++;
    else result.P1SourceIsomorphismCertifications++;
    if(left!==right){
      result.falseFullGameRootActionEqualities++;
      throw Error('false full future isomorphism WDL equality '+key);
    }
    const childA=core.next(q,a),childB=core.next(q,b);
    if(childA.terminal!==undefined||childB.terminal!==undefined)
      throw Error('claimed nonterminal program transport on terminal first action');
    const u=memo.get(core.key(childA.q)),v=memo.get(core.key(childB.q));
    if(!u||!v)throw Error('missing independently solved q child values in reference');
    const childBVals=new Map(v.actionValues),pi=edge.exactFutureActionMap;
    if(u.value!==v.value)throw Error('false full future child value tie');
    for(const [action,val] of u.actionValues){
      if(val!==childBVals.get(pi[action])){
        result.falseFullFutureActionLabelTransports++;
        throw Error('false future optimal literal action transport');
      }
      result.validatedExactFullGameActionTransportPairs++;
    }
    const mirror=pi.every((x,i)=>x===geometry.width-1-i);
    if(turn===0&&!mirror&&!result.firstNonmirrorP0SourceEquivalence)
      result.firstNonmirrorP0SourceEquivalence={
       qHeights:q.h,P0FirstActionLabels:[a+1,b+1],
       futureColumnPermutationOneBased:pi.map(x=>x+1),
       independentlyCheckedWDL:left};
   }
  }
 }
 return result;
}

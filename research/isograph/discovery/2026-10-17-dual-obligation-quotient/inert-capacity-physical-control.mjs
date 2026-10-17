// Independent full legal physical-state and qualified exact-q reference.
// The candidate reads only source residual h/R0/R1 and never calls solve.
// This CONTROL traverses physical game states and q minimax ONLY after a
// source-neutral certificate was constructed; no oracle values feed producer.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createInertCapacityBisimulation} from './inert-capacity-bisimulation.mjs';
import {createPartialGeneratorTransport} from './column-transport-partial-generators.mjs';
import {quotientP1RootActionValueObligations} from './root-action-dominance-quotient.mjs';

export function runInertCapacityPhysicalControl({geometry={width:4,height:3,connect:3},
 maxPhysicalStates=200000,maxQSourceStates=100000,deadlineAt=Infinity}={}){
 const t=Date.now(),{width:W,height:H}=geometry,
  core=createExactQCore(geometry),classify=createInertCapacityBisimulation(geometry),
  fixed=createPartialGeneratorTransport(geometry),
  bit=(c,r)=>1n<<BigInt(r*W+c),N=W*H;
 const stats={schema:'connect4.inert-capacity-physical-control.v0_1',
  geometry,status:'PASS',physicalNonterminalStates:0,physicalEdgesVisited:0,
  independentQPositions:0,P0QSources:0,P1QSources:0,
  originalLegalFirstActionValueObligations:0,
  fullyInertColumnsAcrossQ:0,rootsWithInertMoves:0,
  rootsWithTwoOrMoreInertColumns:0,
  neutralPoolTokensAcrossQ:0,
  fullFutureActionValueEquivalencePairsCertified:0,
  fullFutureActionValueProofRequestsEliminated:0,
  pairsWhoseChildCapacityMultisetsDiffer:0,
  falseCandidateInertGuard:0,falseChildQuotientIdentity:0,
  incorrectFutureWDLActionEquality:0,
  fullFutureActiveActionValueTransportsCompared:0,
  baselineP1OriginalValueRequests:0,
  baselineP1StaticTransportsValueReps:0,
  combinedP1DynamicNeutralValueReps:0,
  dynamicAdditionalP1RootValueProofsAvoidedBeyondStatic:0,
  distinctP1QPositionsWithNewNeutralSaving:0,
  falseCombinedRootScalarMin:0,
  incorrectNeutralTieClass:0,
  sourceOnlyClassifierOperations:0,
  staticTransportPlusGraphOperations:0,
  dynamicGraphOperations:0,
  validatorQTransitions:0,validatorMemoStates:0,
  oneNewDifferentCapacityWitness:null,
  oneNewBeyondStaticWitness:null,
  oneNeutralTieButNotRootOptimalWitness:null,
  oneNeutralTieRootOptimalWitness:null,
  rankHistogram:{},
  candidateGameContinuationExploration:0,
  elapsedMs:0};
 const seenPhysical=new Set(),seenQ=new Set(),memo=new Map(),
  pending=[{h:Array(W).fill(0),p0:0n,p1:0n,rank:0,history:''}];
 function isTerminal(a,b){return core.lines.some(m=>(m&a)===m||(m&b)===m);}
 const coreValue=(v)=>{
  if(v.terminal!==undefined)return v.terminal;
  const ref=core.solve(v.q,{sharedMemo:memo,maxStates:50000,maxTransitions:500000});
  stats.validatorQTransitions+=ref.stats.transitions;
  return ref.answer.value;
 };
 while(pending.length){
  if(stats.physicalNonterminalStates>=maxPhysicalStates||
     stats.independentQPositions>=maxQSourceStates||Date.now()>deadlineAt){
    stats.status='BUDGET_PARTIAL';break;
  }
  const p=pending.pop(),id=p.p0.toString(16)+':'+p.p1.toString(16);
  if(seenPhysical.has(id))continue;seenPhysical.add(id);
  if(isTerminal(p.p0,p.p1))throw Error('validator encountered terminal source');
  stats.physicalNonterminalStates++;
  const q=core.fromPhysical(p),key=core.key(q);
  if(!seenQ.has(key)){
    seenQ.add(key);stats.independentQPositions++;
    const r=classify.compute(q);
    stats.sourceOnlyClassifierOperations+=r.statistics.operations;
    const legal=core.legal(q),rank=p.rank;
    stats.originalLegalFirstActionValueObligations+=legal.length;
    stats.fullyInertColumnsAcrossQ+=r.inertLiteralColumns.length;
    stats.neutralPoolTokensAcrossQ+=r.initialNeutralPoolCapacity;
    if(r.inertLiteralColumns.length)stats.rootsWithInertMoves++;
    const hist=stats.rankHistogram[rank]??={sourceQ:0,inertGroups:0,inertScalarOmissions:0,neutralTokens:0};
    hist.sourceQ++;hist.neutralTokens+=r.initialNeutralPoolCapacity;
    if(r.inertLiteralColumns.length>=2){
      hist.inertGroups++;const group=r.inertLiteralColumns;
      stats.rootsWithTwoOrMoreInertColumns++;
      stats.fullFutureActionValueEquivalencePairsCertified+=group.length*(group.length-1)/2;
      stats.fullFutureActionValueProofRequestsEliminated+=group.length-1;
      hist.inertScalarOmissions+=group.length-1;
      const originalValues=[],neutralChildShapes=[];
      for(const a of group){
        const ch=core.next(q,a);
        if(ch.terminal!==undefined){
          stats.falseCandidateInertGuard++;
          throw Error('inert source first action was terminal '+p.history+' '+a);
        }
        const nq=classify.compute(ch.q);
        if(nq.initialNeutralPoolCapacity!==r.initialNeutralPoolCapacity-1||
            JSON.stringify(nq.activeLiteralColumns)!==JSON.stringify(r.activeLiteralColumns)||
            ch.q.R0.map(String).join(',')!==q.R0.map(String).join(',')||
            ch.q.R1.map(String).join(',')!==q.R1.map(String).join(',')){
          stats.falseChildQuotientIdentity++;
          throw Error('inert first-action quotient not invariant');
        }
        neutralChildShapes.push(ch.q.h.slice().sort((x,y)=>x-y).join(','));
        originalValues.push(coreValue(ch));
      }
      if(new Set(originalValues).size!==1){
        stats.incorrectFutureWDLActionEquality++;
        throw Error('source inert class does not have equal full-WDL '+p.history);
      }
      if(new Set(neutralChildShapes).size>1){
        stats.pairsWhoseChildCapacityMultisetsDiffer++;
        if(!stats.oneNewDifferentCapacityWitness)
          stats.oneNewDifferentCapacityWitness={
            sourceHistory:p.history,
            board:geometry,inertActionsOneBased:group.map(x=>x+1),
            initialInertCapacities:r.inertPerColumnCapacity,
            childCapacityProfiles:neutralChildShapes,
            fullFutureWDLValueIndependentValidator:originalValues[0]
          };
      }
      const allRoot=core.solve(q,{sharedMemo:memo,maxStates:50000,maxTransitions:500000});
      stats.validatorQTransitions+=allRoot.stats.transitions;
      const win=allRoot.answer.value;
      if(originalValues[0]===win&&!stats.oneNeutralTieRootOptimalWitness)
        stats.oneNeutralTieRootOptimalWitness={sourceHistory:p.history,
          neutralActionLabels:group.map(x=>x+1),rootWDL:win,
          referenceCompleteBestMoves:allRoot.answer.bestMoves.map(x=>x+1)};
      if(originalValues[0]!==win&&!stats.oneNeutralTieButNotRootOptimalWitness)
        stats.oneNeutralTieButNotRootOptimalWitness={sourceHistory:p.history,
          neutralActionLabels:group.map(x=>x+1),neutralMoveWDL:originalValues[0],
          rootWDL:win,referenceCompleteBestMoves:allRoot.answer.bestMoves.map(x=>x+1)};
    }
    if(rank%2===1){
      stats.P1QSources++;
      const s=fixed.compute(q),baseline=quotientP1RootActionValueObligations(s);
      if(baseline.status!=='EXACT_SCALAR_VALUE_OBLIGATION_QUOTIENT')
        throw Error('static source certificate budget partial '+p.history);
      const augmented={...s,pairs:s.pairs.slice()};
      for(let i=0;i<r.inertLiteralColumns.length;i++)
        for(let j=i+1;j<r.inertLiteralColumns.length;j++){
          const a=r.inertLiteralColumns[i],b=r.inertLiteralColumns[j];
          augmented.pairs.push({actions:[a,b],firstNoHigher:true,secondNoHigher:true,
            exactFutureActionMap:null,exactMapIsReflection:false,
            firstToSecondPermutation:null,secondToFirstPermutation:null,
            proofKind:'FULL_FUTURE_DYNAMIC_NEUTRAL_POOL_EQUIVALENCE'});
        }
      const combined=quotientP1RootActionValueObligations(augmented);
      if(combined.status!=='EXACT_SCALAR_VALUE_OBLIGATION_QUOTIENT')
        throw Error('augmented source certificate budget partial '+p.history);
      const baselineReps=baseline.scalarRootValueRepresentatives.length,
        mergedReps=combined.scalarRootValueRepresentatives.length;
      if(mergedReps>baselineReps)throw Error('adding equivalence made scalar root proof worse');
      stats.baselineP1OriginalValueRequests+=legal.length;
      stats.baselineP1StaticTransportsValueReps+=baselineReps;
      stats.combinedP1DynamicNeutralValueReps+=mergedReps;
      const extra=baselineReps-mergedReps;
      stats.dynamicAdditionalP1RootValueProofsAvoidedBeyondStatic+=extra;
      if(extra){
        stats.distinctP1QPositionsWithNewNeutralSaving++;
        if(!stats.oneNewBeyondStaticWitness)
          stats.oneNewBeyondStaticWitness={history:p.history,
            baselineReps:baseline.scalarRootValueRepresentatives.map(x=>x+1),
            augmentedReps:combined.scalarRootValueRepresentatives.map(x=>x+1),
            inertActionsOneBased:r.inertLiteralColumns.map(x=>x+1),
            sourceInertTokenCount:r.initialNeutralPoolCapacity,
            additionalValueProofsAvoided:extra};
      }
      stats.staticTransportPlusGraphOperations+=baseline.statistics.wholeProcessCountedOperations;
      stats.dynamicGraphOperations+=combined.statistics.graphOperations;
      // Reference used *only after* both source-only candidate reductions.
      const ref=core.solve(q,{sharedMemo:memo,maxStates:50000,maxTransitions:500000});
      stats.validatorQTransitions+=ref.stats.transitions;
      const values=new Map(ref.answer.actionValues),
        allMin=Math.min(...legal.map(c=>values.get(c))),
        newMin=Math.min(...combined.scalarRootValueRepresentatives.map(c=>values.get(c)));
      if(allMin!==newMin||newMin!==ref.answer.value){
        stats.falseCombinedRootScalarMin++;
        throw Error('dynamic neutral/source static combined false minimum');
      }
      for(const inertGroup of combined.fullWDLValueEquivalenceClasses)
        if(inertGroup.some(c=>values.get(c)!==values.get(inertGroup[0]))){
          stats.incorrectNeutralTieClass++;
          throw Error('dynamic source equality class false');
        }
    }else stats.P0QSources++;
  }
  for(let c=W-1;c>=0;c--){
    if(p.h[c]>=H)continue;
    stats.physicalEdgesVisited++;
    const mask=bit(c,p.h[c]),child={h:p.h.slice(),p0:p.p0,p1:p.p1,
      rank:p.rank+1,history:p.history+String(c+1)};
    child.h[c]++;
    if(p.rank%2===0)child.p0|=mask;else child.p1|=mask;
    if(isTerminal(child.p0,child.p1)||child.rank===N)continue;
    const nk=child.p0.toString(16)+':'+child.p1.toString(16);
    if(!seenPhysical.has(nk))pending.push(child);
  }
 }
 stats.validatorMemoStates=memo.size;
 stats.elapsedMs=Date.now()-t;
 return stats;
}

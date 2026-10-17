// INDEPENDENT qualification only: physical legal states, exact q cofactor,
// qualified recursive WDL (after structural certificate), and transported
// ALL future action values. Candidate never reads these reference results.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createPartialGeneratorTransport} from './column-transport-partial-generators.mjs';
export function runColumnTransportPhysicalControl({geometry={width:4,height:3,connect:3},
 maxPhysicalStates=200000,maxQSources=100000,deadlineAt=Infinity}={}){
 const t=Date.now(),{width:W,height:H}=geometry,
  core=createExactQCore(geometry),sim=createPartialGeneratorTransport(geometry),
  bit=(c,r)=>1n<<BigInt(r*W+c);
 const stats={
  schema:'connect4.column-transport-full-future-physical-control.v0_1',geometry,
  status:'PASS',physicalNonterminalStates:0,physicalEdgesVisited:0,
  uniqueP1SourceQ:0,uniqueSourceActionPairs:0,
  capacityMismatchPairs:0,terminalGuardPairs:0,completedTransportPairs:0,
  incompleteTransportPairs:0,firstActionOneWayWDLOrders:0,
  rootActionTwoWayEqualities:0,exactFutureProgramIsomorphisms:0,
  nonreflectionProgramIsomorphisms:0,nonreflectionWeakOrders:0,
  zeroFalseWeakWDLOrders:0,zeroFalseExactFutureProgramMaps:0,
  transportedFutureActionThresholdComparisons:0,
  uniqueExactQChildStatesUsedByValidator:0,
  referenceQSolverTransitionCount:0,
  sourceOnlyTransportOperationTotal:0,producerValueInputs:0,
  sourceOnlySuccessfulPairs:0,
  nonreflectionFirstWitness:null,firstOneWayWitness:null,
  firstExactNonreflectionWitness:null,
  firstStrictFullWDLGapWitness:null,
  rankHistogram:{},elapsedMs:0
 };
 const seenPhysical=new Set(),seenQ=new Set(),memo=new Map(),
  stack=[{h:Array(W).fill(0),p0:0n,p1:0n,rank:0,history:''}];
 const term=(a,b)=>core.lines.some(m=>(m&a)===m||(m&b)===m);
 const reflect=Array.from({length:W},(_,i)=>W-1-i);
 function solution(after){
  if(after.terminal!==undefined)return {value:after.terminal,actionValues:null};
  const solve=core.solve(after.q,{sharedMemo:memo,maxStates:50000,maxTransitions:500000});
  stats.referenceQSolverTransitionCount+=solve.stats.transitions;
  return solve.answer;
 }
 function verifyPair(q,pair,history){
  const [b,c]=pair.actions,AB=core.next(q,b),AC=core.next(q,c);
  if(AB.terminal!==undefined||AC.terminal!==undefined)
    throw Error('candidate leaked terminal first response '+history);
  const bVal=solution(AB),cVal=solution(AC);
  const fwd=pair.firstNoHigher,rev=pair.secondNoHigher;
  if((fwd&&bVal.value>cVal.value)||(rev&&cVal.value>bVal.value)){
    stats.zeroFalseWeakWDLOrders++;throw Error('false first-move WDL order '+history+' '+b+'/'+c);
  }
  if(fwd||rev){
    stats.sourceOnlySuccessfulPairs++;
    if(fwd!==rev)stats.firstActionOneWayWDLOrders++;
    else stats.rootActionTwoWayEqualities++;
    const perm=pair.exactFutureActionMap,mirror=!!perm&&perm.every((z,i)=>z===reflect[i]);
    if(!mirror){
      if(fwd!==rev)stats.nonreflectionWeakOrders++;
      if(!stats.nonreflectionFirstWitness)
        stats.nonreflectionFirstWitness={history,actionLabels:[b+1,c+1],
          direction:pair.status,valuesOnlyValidator:[bVal.value,cVal.value],
          aToBPermutation:pair.firstToSecondPermutation?.map(x=>x+1),
          bToAPermutation:pair.secondToFirstPermutation?.map(x=>x+1)};
    }
    if(fwd!==rev&&bVal.value!==cVal.value&&!stats.firstStrictFullWDLGapWitness)
      stats.firstStrictFullWDLGapWitness={history,actionLabels:[b+1,c+1],
        direction:pair.status,valuesOnlyValidator:[bVal.value,cVal.value]};
    if(!stats.firstOneWayWitness&&fwd!==rev)
      stats.firstOneWayWitness={history,actionLabels:[b+1,c+1],
        direction:pair.status,valuesOnlyValidator:[bVal.value,cVal.value]};
  }
  if(pair.exactFutureActionMap){
    stats.exactFutureProgramIsomorphisms++;
    const pi=pair.exactFutureActionMap;
    if(!pi.every((z,i)=>z===reflect[i])){
      stats.nonreflectionProgramIsomorphisms++;
      if(!stats.firstExactNonreflectionWitness)
        stats.firstExactNonreflectionWitness={history,actionLabels:[b+1,c+1],
          permutationOneBased:pi.map(x=>x+1),
          futureWDLReference:bVal.value};
    }
    if(bVal.value!==cVal.value)
      throw Error('false exact future program WDL isomorphism '+history);
    if(!bVal.actionValues||!cVal.actionValues)
      throw Error('missing post-P1 nonterminal full action values');
    for(const [a,val] of bVal.actionValues){
      const mapped=pi[a],mval=cVal.actionValues.find(x=>x[0]===mapped)?.[1];
      if(mval===undefined||val!==mval){
        stats.zeroFalseExactFutureProgramMaps++;
        throw Error('future WDL label transport failure '+history);
      }
      stats.transportedFutureActionThresholdComparisons++;
    }
    // Independently check exact residual map of child q:
    if(AB.q.h.some((x,i)=>x!==AC.q.h[pi[i]]))
      throw Error('capacity map invalid after P1 move');
    const map=m=>{
      let out=0n;
      for(let col=0;col<W;col++)for(let row=AB.q.h[col];row<H;row++)
        if(m&bit(col,row))out|=bit(pi[col],row);
      return out;
    };
    for(const who of ['R0','R1']){
      const left=AB.q[who].map(map).sort((x,y)=>x<y?-1:x>y?1:0),
        right=AC.q[who].slice().sort((x,y)=>x<y?-1:x>y?1:0);
      if(left.length!==right.length||left.some((m,i)=>m!==right[i]))
        throw Error('false exact residual q program iso '+history+' '+who);
    }
  }
 }
 while(stack.length){
  if(stats.physicalNonterminalStates>=maxPhysicalStates||stats.uniqueP1SourceQ>=maxQSources||
     Date.now()>deadlineAt){
    stats.status='BUDGET_PARTIAL';break;
  }
  const p=stack.pop(),key=p.p0.toString(16)+':'+p.p1.toString(16);
  if(seenPhysical.has(key))continue;seenPhysical.add(key);
  if(term(p.p0,p.p1))throw Error('terminal source input');
  stats.physicalNonterminalStates++;
  if(p.rank&1){
    const q=core.fromPhysical(p),key=core.key(q);
    if(!seenQ.has(key)){
      seenQ.add(key);stats.uniqueP1SourceQ++;
      const result=sim.compute(q);
      stats.sourceOnlyTransportOperationTotal+=result.statistics.operations;
      if(result.status==='BUDGET_PARTIAL')stats.incompleteTransportPairs++;
      const r=stats.rankHistogram[p.rank]??={sourceQ:0,actionPairs:0,iso:0,weak:0,incomplete:0};
      r.sourceQ++;r.actionPairs+=result.pairs.length;
      for(const pair of result.pairs){
        stats.uniqueSourceActionPairs++;
        if(pair.status==='TERMINAL_OR_DRAW_GUARD_EXCLUDED')stats.terminalGuardPairs++;
        if(pair.status==='NO_CAPACITY_PRESERVING_COLUMN_BIJECTION')stats.capacityMismatchPairs++;
        if(pair.status==='BUDGET_PARTIAL')r.incomplete++;
        if(pair.exactFutureActionMap)r.iso++;
        else if(pair.firstNoHigher||pair.secondNoHigher)r.weak++;
        if(pair.firstNoHigher||pair.secondNoHigher)verifyPair(q,pair,p.history);
      }
    }
  }
  for(let c=W-1;c>=0;c--){
    if(p.h[c]>=H)continue;
    stats.physicalEdgesVisited++;
    const mask=bit(c,p.h[c]),n={h:p.h.slice(),p0:p.p0,p1:p.p1,
      rank:p.rank+1,history:p.history+String(c+1)};
    n.h[c]++;
    if(p.rank&1)n.p1|=mask;else n.p0|=mask;
    if(term(n.p0,n.p1)||n.rank===W*H)continue;
    if(!seenPhysical.has(n.p0.toString(16)+':'+n.p1.toString(16)))stack.push(n);
  }
 }
 stats.uniqueExactQChildStatesUsedByValidator=memo.size;
 stats.elapsedMs=Date.now()-t;
 return stats;
}

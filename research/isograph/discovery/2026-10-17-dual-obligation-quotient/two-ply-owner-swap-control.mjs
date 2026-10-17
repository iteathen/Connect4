// Independent physical/q finite-game validator of source-only
// two-ply ownership-swap simulation. Values are queried only AFTER
// each structural candidate is frozen, never to generate its relation.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createTwoPlyOwnerSwapSimulation} from './two-ply-owner-swap-simulation.mjs';
export function runTwoPlyOwnerSwapControl({geometry={width:4,height:3,connect:3},
  maxPhysicalStates=200000,sourceSelectionModulo=1,
  deadlineAt=Infinity}={}){
 const t=Date.now(),{width:W,height:H}=geometry,
  core=createExactQCore(geometry),maker=createTwoPlyOwnerSwapSimulation(geometry),
  bit=(c,r)=>1n<<BigInt(r*W+c);
 if(!Number.isInteger(sourceSelectionModulo)||sourceSelectionModulo<1)throw Error('invalid sample modulus');
 const memo=new Map(),seen=new Set(),stack=[{
  h:Array(W).fill(0),p0:0n,p1:0n,rank:0,history:''}];
 const stats={schema:'connect4.two-ply-owner-swap-control.v0_1',geometry,
  sourceSelectionModulo,status:'PASS',physicalNonterminalStates:0,
  selectedP1SourceStates:0,sourcePairScans:0,
  pairTerminalGuards:0,pairDrawGuards:0,eligibleNonterminalDiamonds:0,
  certifiedFullFutureResidualEquality:0,certifiedOneWayDominance:0,
  pairsIncomparable:0,sourceComputationUnits:0,
  validationTwoStepQTransitions:0,validatorFullGameQTransitions:0,
  validatorQCacheStates:0,wrongSourceUpsetComparisons:0,
  certifiedFalseValueDominance:0,certifiedFalseValueEquality:0,
  firstCertifiedNontrivialEquality:null,firstCertifiedWeakDominance:null,
  rankHistogram:{},ms:0,nonGameSearchProducer:true,
  sourceHandlesOnlyGuardedResiduals:true};
 const terminal=(p0,p1)=>core.lines.some(m=>(p0&m)===m||(p1&m)===m);
 function upsetIncluded(A,B){
  return A.every(x=>B.some(y=>(x&y)===y));
 }
 while(stack.length){
  if(stats.physicalNonterminalStates>=maxPhysicalStates||Date.now()>deadlineAt){
    stats.status='BUDGET_PARTIAL';break;
  }
  const p=stack.pop(),key=p.p0.toString(16)+':'+p.p1.toString(16);
  if(seen.has(key))continue;seen.add(key);
  if(terminal(p.p0,p.p1))throw Error('terminal source in validator');
  stats.physicalNonterminalStates++;
  if(p.rank%2===1&&((p.p0^(p.p1<<1n))%BigInt(sourceSelectionModulo))===0n){
    const sourceQ=core.fromPhysical(p),result=maker.compute(sourceQ);
    stats.selectedP1SourceStates++;stats.sourceComputationUnits+=result.statistics.operations;
    stats.sourcePairScans+=result.statistics.unorderedColumnPairsScanned;
    stats.pairTerminalGuards+=result.statistics.terminalGuardSkips;
    stats.pairDrawGuards+=result.statistics.fullBoardDrawSkips;
    stats.eligibleNonterminalDiamonds+=result.statistics.eligibleTwoPlyDiamonds;
    stats.certifiedFullFutureResidualEquality+=result.statistics.certifiedEqualFutureResidualStates;
    stats.certifiedOneWayDominance+=result.statistics.certifiedOneWayDominances;
    stats.pairsIncomparable+=result.statistics.incomparablePairs;
    const rank=stats.rankHistogram[p.rank]??={sources:0,eligible:0,equal:0,oneWay:0,terminalSkipped:0};
    rank.sources++;rank.eligible+=result.statistics.eligibleTwoPlyDiamonds;
    rank.equal+=result.statistics.certifiedEqualFutureResidualStates;
    rank.oneWay+=result.statistics.certifiedOneWayDominances;
    rank.terminalSkipped+=result.statistics.terminalGuardSkips;
    for(const item of result.pairs) {
      if(item.status==='TERMINAL_GUARD_EXCLUDED'||item.status==='FULL_BOARD_DRAW_GUARD_EXCLUDED')continue;
      const [b,c]=item.P1ThenP0;
      const n1=core.next(sourceQ,b),n2=core.next(sourceQ,c);
      stats.validationTwoStepQTransitions+=2;
      if(n1.terminal!==undefined||n2.terminal!==undefined)
        throw Error('candidate failed initial terminal guard '+p.history);
      const bc=core.next(n1.q,c),cb=core.next(n2.q,b);
      stats.validationTwoStepQTransitions+=2;
      if(bc.terminal!==undefined||cb.terminal!==undefined)
        throw Error('candidate failed second terminal guard '+p.history);
      if(bc.q.h.join(',')!==cb.q.h.join(','))
        throw Error('two-ply diamond support discrepancy '+p.history);
      const bcLo=upsetIncluded(bc.q.R0,cb.q.R0)&&upsetIncluded(cb.q.R1,bc.q.R1);
      const cbLo=upsetIncluded(cb.q.R0,bc.q.R0)&&upsetIncluded(bc.q.R1,cb.q.R1);
      if(item.bcNoBetter!==bcLo||item.cbNoBetter!==cbLo){
        stats.wrongSourceUpsetComparisons++;throw Error('source cofactor/simulation mismatch '+p.history);
      }
      if(item.bcNoBetter||item.cbNoBetter){
        const r1=core.solve(bc.q,{sharedMemo:memo,maxStates:20000,maxTransitions:200000}),
          r2=core.solve(cb.q,{sharedMemo:memo,maxStates:20000,maxTransitions:200000});
        stats.validatorFullGameQTransitions+=r1.stats.transitions+r2.stats.transitions;
        const left=r1.answer.value,right=r2.answer.value;
        if(item.bcNoBetter&&left>right||item.cbNoBetter&&right>left){
          stats.certifiedFalseValueDominance++;
          throw Error('false source-only future WDL dominance '+p.history);
        }
        if(item.bcNoBetter&&item.cbNoBetter&&left!==right){
          stats.certifiedFalseValueEquality++;throw Error('false exact q equivalence '+p.history);
        }
        if(item.bcNoBetter&&item.cbNoBetter&&!stats.firstCertifiedNontrivialEquality)
          stats.firstCertifiedNontrivialEquality={
            sourceHistory:p.history,originalP1MoveThenP0Move:[b+1,c+1],
            swapped:[c+1,b+1],fullP0RelativeWDL:left,
            proof:'source-cofactor residual upset equality on same final support'};
        if(item.bcNoBetter!==item.cbNoBetter&&!stats.firstCertifiedWeakDominance)
          stats.firstCertifiedWeakDominance={
            sourceHistory:p.history,originalP1MoveThenP0Move:[b+1,c+1],
            swapped:[c+1,b+1],valueBC:left,valueCB:right,
            sourceDirection:item.status
          };
      }
    }
  }
  for(let c=W-1;c>=0;c--){
    if(p.h[c]>=H)continue;
    const mask=bit(c,p.h[c]),q={h:p.h.slice(),p0:p.p0,p1:p.p1,
      rank:p.rank+1,history:p.history+String(c+1)};
    q.h[c]++;if(p.rank&1)q.p1|=mask;else q.p0|=mask;
    if(terminal(q.p0,q.p1)||q.rank===W*H)continue;
    if(!seen.has(q.p0.toString(16)+':'+q.p1.toString(16)))stack.push(q);
  }
 }
 stats.validatorQCacheStates=memo.size;stats.ms=Date.now()-t;
 return stats;
}

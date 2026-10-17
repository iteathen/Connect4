// Physical-state corpus only as an INDEPENDENT validation fixture source.
// Algebraic producer reads a single original residual q, constructs the
// previously proved source-response covers, then derives exact dual reply
// obligations; no strategic recursion or solved WDL values enter candidate.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createUniversalResponseCover} from '../2026-10-16-algorithmic-core/universal-response-cover-operator.mjs';
import {reduceUniversalResponseObligations} from './dual-response-obligation.mjs';
export function runLegalDualResponseControl({geometry={width:4,height:3,connect:3},
  maxPhysicalStates=200000,maxSourceP1States=100000,deadlineAt=Infinity}={}) {
 const t=Date.now(),{width:W,height:H,connect:K}=geometry,
  core=createExactQCore(geometry),sourceCover=createUniversalResponseCover(geometry),
  bit=(c,r)=>1n<<BigInt(r*W+c),allMask=(1n<<BigInt(W))-1n;
 const stats={schema:'connect4.dual-response-legal-state-control.v0_1',
  geometry,status:'PASS',physicalNonterminalStates:0,physicalContinuationEdgesVisited:0,
  positionsPhysicallyTerminal:0,P1SourceStates:0,algebraicSourceResponseRows:0,
  aggregateSourceResidualMembershipQueries:0,additionalDualQuotientOperations:0,
  originalUniversalReplyObligations:0,distinctReplySignatureGroups:0,
  minimalReplyObligations:0,positiveUniversalP0ForcePositions:0,
  positiveOriginalReplyObligations:0,positiveMinimalReplyObligations:0,
  negativeUniversalP0ForcePositions:0,negativeWithEmptyResponseWitness:0,
  universalReplyReducedPositions:0,unreducedPositions:0,
  strictInclusionDominanceGroups:0,duplicateReplySignatureLabels:0,
  positiveReducedPositions:0,positiveUnreducedPositions:0,
  maximumMinimalReplyWidth:0,zeroMismatches:true,rankHistogram:{},
  largestPositiveFrontierWitness:null,firstAdaptiveOnly:null,
  outputExample223:null,standardCanonical44444:null,elapsedMs:0,
  physicalEnumerationPurpose:'VALIDATION ONLY; candidate uses source residual q and no game-tree evaluator'};
 const start={h:Array(W).fill(0),p0:0n,p1:0n,rank:0,history:''},stack=[start],
  seen=new Set();
 function terminal(p0,p1){
  return core.lines.some(m=> (p0&m)===m||(p1&m)===m);
 }
 while(stack.length) {
  if(Date.now()>deadlineAt||stats.physicalNonterminalStates>=maxPhysicalStates||
     stats.P1SourceStates>=maxSourceP1States){
    stats.status='BUDGET_PARTIAL';break;
  }
  const pos=stack.pop(),key=pos.p0.toString(16)+':'+pos.p1.toString(16);
  if(seen.has(key))continue;seen.add(key);
  if(terminal(pos.p0,pos.p1))throw Error('terminal physical input leaked');
  stats.physicalNonterminalStates++;
  const q=core.fromPhysical(pos);
  if(pos.rank%2===1){
    const x=sourceCover.compute(q),r=reduceUniversalResponseObligations(
      x.responseCoverByP0Column,x.initialLegalP1Mask);
    const legal=core.legal(q).map(c=>c);
    const expectedStatic=x.responseCoverByP0Column.some(mask=>
      (mask&x.initialLegalP1Mask)===x.initialLegalP1Mask);
    if(r.allP1RepliesCovered!==x.universalBoundedP0Win||
       r.oneP0ReplyWorksForAll!==expectedStatic)
      throw Error('source bounded quantifier truth mismatch '+pos.history);
    for(const b of legal){
      const row=x.responseActionsByP1.find(y=>y.initialP1===b),
        original=row?.certifiedP0RepliesMask,
        reduced=r.responseByP1Label.find(y=>y.replyColumn===b)?.successActionMask;
      if(original===undefined||original!==reduced)
        throw Error('all-label response transport mismatch '+pos.history+' / '+b);
    }
    if(r.responseByP1Label.length!==legal.length)
      throw Error('source legal P1 labels missing');
    stats.P1SourceStates++;stats.algebraicSourceResponseRows+=x.statistics.P0ReplyActionLabels;
    stats.aggregateSourceResidualMembershipQueries+=x.statistics.sourceResidualMembershipQueries;
    stats.additionalDualQuotientOperations+=r.statistics.operations;
    stats.originalUniversalReplyObligations+=r.statistics.originalLegalReplyCount;
    stats.distinctReplySignatureGroups+=r.statistics.distinctReplySignatures;
    stats.minimalReplyObligations+=r.statistics.minimalUniversalObligationCount;
    stats.duplicateReplySignatureLabels+=r.statistics.deduplicatedSignatures;
    stats.strictInclusionDominanceGroups+=r.statistics.strictDominanceGroups;
    stats.maximumMinimalReplyWidth=Math.max(stats.maximumMinimalReplyWidth,r.statistics.minimalUniversalObligationCount);
    const hist=stats.rankHistogram[pos.rank]??={positions:0,originalReplies:0,minimalReplies:0,positiveCases:0};
    hist.positions++;hist.originalReplies+=legal.length;
    hist.minimalReplies+=r.statistics.minimalUniversalObligationCount;
    if(r.statistics.minimalUniversalObligationCount<legal.length)stats.universalReplyReducedPositions++;
    else stats.unreducedPositions++;
    if(x.universalBoundedP0Win){
      stats.positiveUniversalP0ForcePositions++;hist.positiveCases++;
      stats.positiveOriginalReplyObligations+=legal.length;
      stats.positiveMinimalReplyObligations+=r.statistics.minimalUniversalObligationCount;
      if(r.statistics.minimalUniversalObligationCount<legal.length)stats.positiveReducedPositions++;
      else stats.positiveUnreducedPositions++;
      if(!stats.largestPositiveFrontierWitness||
        r.statistics.minimalUniversalObligationCount>stats.largestPositiveFrontierWitness.minimalUniversalObligations)
        stats.largestPositiveFrontierWitness={
          history:pos.history,rank:pos.rank,legalReplies:legal,
          minimalUniversalObligations:r.statistics.minimalUniversalObligationCount,
          minimalGroups:r.minimalUniversalObligations.map(g=>({
            replies:g.replyColumns,successP0ActionMask:'0x'+g.successActionMask.toString(16)}))};
    }else {
      stats.negativeUniversalP0ForcePositions++;
      if(r.P1RepliesRefutingBoundedP0Force.length)stats.negativeWithEmptyResponseWitness++;
    }
    if(!stats.firstAdaptiveOnly&&x.universalBoundedP0Win&&!expectedStatic)
      stats.firstAdaptiveOnly={history:pos.history,legalReplyCount:legal.length,
        minimalReplyGroups:r.minimalUniversalObligations.map(g=>({
          replies:g.replyColumns,successfulP0Responses:'0x'+g.successActionMask.toString(16)}))};
    if(pos.history==='223')
      stats.outputExample223={history:pos.history,originalActionCoverMasksHex:
        x.responseCoverByP0Column.map(m=>'0x'+m.toString(16)),
        allCovered:x.universalBoundedP0Win,
        oneP0ActionWorksForAll:expectedStatic,
        legalReplyCount:legal.length,minimalReplyCount:r.statistics.minimalUniversalObligationCount,
        minimalGroups:r.minimalUniversalObligations.map(g=>({
          replies:g.replyColumns,successfulP0Responses:'0x'+g.successActionMask.toString(16)}))};
    if(pos.history==='44444')
      stats.standardCanonical44444={
        legalReplyCount:legal.length,minimalReplyCount:r.statistics.minimalUniversalObligationCount,
        universalBoundedP0Force:r.allP1RepliesCovered,
        replyLabelsRefutingBoundedForce:r.P1RepliesRefutingBoundedP0Force
      };
  }
  if(pos.rank===W*H)continue;
  for(let c=W-1;c>=0;c--){
    if(pos.h[c]>=H)continue;
    stats.physicalContinuationEdgesVisited++;
    const mask=bit(c,pos.h[c]),next={h:pos.h.slice(),p0:pos.p0,p1:pos.p1,
      rank:pos.rank+1,history:pos.history+String(c+1)};
    next.h[c]++;
    if(pos.rank%2===0)next.p0|=mask;else next.p1|=mask;
    if(terminal(next.p0,next.p1)||next.rank===W*H){
      stats.positionsPhysicallyTerminal++;continue;
    }
    const nx=next.p0.toString(16)+':'+next.p1.toString(16);
    if(!seen.has(nx))stack.push(next);
  }
 }
 stats.elapsedMs=Date.now()-t;
 stats.overallReplyReductionPercent=stats.originalUniversalReplyObligations?
  +(100*(1-stats.minimalReplyObligations/stats.originalUniversalReplyObligations)).toFixed(5):null;
 stats.positiveReplyReductionPercent=stats.positiveOriginalReplyObligations?
  +(100*(1-stats.positiveMinimalReplyObligations/stats.positiveOriginalReplyObligations)).toFixed(5):null;
 return stats;
}

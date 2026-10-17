// Exact dual (universal response) antichain for a fixed, guarded
// P1-reply/P0-answer Boolean relation. PRODUCER uses only source-derived
// action cover masks; it never evaluates future game states or solved values.
export function reduceUniversalResponseObligations(actionCoverMasks, legalReplyMask, {
  maxOperations=300000, maxRepresentatives=10000, maxMs=15000
}={}) {
  const start=Date.now(),W=actionCoverMasks?.length;
  if(!Array.isArray(actionCoverMasks)||W<1||W>42||
      actionCoverMasks.some(m=>typeof m!=='bigint'||m<0n))
    throw Error('expected W source-derived BigInt action-cover masks, 1<=W<=42');
  if(typeof legalReplyMask!=='bigint'||legalReplyMask<0n)throw Error('invalid legal reply mask');
  const whole=(1n<<BigInt(W))-1n;
  if((legalReplyMask&~whole)!==0n||actionCoverMasks.some(m=>(m&~whole)!==0n))
    throw Error('response mask outside literal column alphabet');
  const stats={
    sourceActionCoverInputs:W,sourceReplyLabelsScanned:0,
    transposeIncidenceTests:0,deduplicatedSignatures:0,
    distinctSignaturePairTests:0,subsetContainmentTests:0,
    quantifierOutcomeChecks:0,outputLabelTransportEntries:0,
    opponentGameContinuationsSearched:0,oracleQueries:0,
    gameTreeBranchesExpanded:0,operations:0,elapsedMs:0
  };
  function charge(kind) {
    stats[kind]++;stats.operations++;
    if(stats.operations>maxOperations||Date.now()-start>maxMs)
      throw Error('DUAL_OBLIGATION_BUDGET_EXHAUSTED');
  }
  const byReply=[],groupsByKey=new Map();
  for(let b=0;b<W;b++) {
    if((legalReplyMask&(1n<<BigInt(b)))===0n)continue;
    charge('sourceReplyLabelsScanned');
    let responses=0n;
    for(let a=0;a<W;a++){
      charge('transposeIncidenceTests');
      if((actionCoverMasks[a]&(1n<<BigInt(b)))!==0n)
        responses|=1n<<BigInt(a);
    }
    const raw=String(responses),row={replyColumn:b,successActionMask:responses,
      existsSuccessfulP0Response:responses!==0n};
    byReply.push(row);charge('outputLabelTransportEntries');
    const group=groupsByKey.get(raw);
    if(group)group.replyColumns.push(b);
    else groupsByKey.set(raw,{successActionMask:responses,replyColumns:[b]});
  }
  const groups=[...groupsByKey.values()].sort((a,b)=>a.replyColumns[0]-b.replyColumns[0]);
  stats.deduplicatedSignatures=byReply.length-groups.length;
  if(groups.length>maxRepresentatives)throw Error('DUAL_OBLIGATION_REPRESENTATIVE_LIMIT');
  const minimal=[],dominated=[];
  for(let i=0;i<groups.length;i++){
    let witness=null;
    for(let j=0;j<groups.length;j++){
      if(i===j)continue;
      charge('distinctSignaturePairTests');
      const si=groups[i].successActionMask,sj=groups[j].successActionMask;
      charge('subsetContainmentTests');
      if((sj&si)===sj){
        // Two different groups never have the SAME mask;
        // sj is a strictly harder universal response obligation.
        witness=groups[j].replyColumns[0];break;
      }
    }
    if(witness===null)minimal.push(groups[i]);
    else dominated.push({...groups[i],dominatedByReplyColumn:witness});
  }
  let intersection=whole,hasEmpty=false;
  for(const g of minimal) {
    intersection&=g.successActionMask;
    charge('quantifierOutcomeChecks');
    if(g.successActionMask===0n)hasEmpty=true;
  }
  const allRepliesHaveAnswer=!hasEmpty;
  const oneAnswerWorksForAll=(intersection!==0n);
  const defensiveLabels=byReply.filter(r=>r.successActionMask===0n).map(r=>r.replyColumn);
  const boundedBestReplyLabels=defensiveLabels.length?defensiveLabels:byReply.map(r=>r.replyColumn);
  const statsOut={...stats,elapsedMs:Date.now()-start,
    originalLegalReplyCount:byReply.length,
    distinctReplySignatures:groups.length,
    minimalUniversalObligationCount:minimal.length,
    eliminatedUniversalLabels:byReply.length-minimal.length,
    strictDominanceGroups:dominated.length,
    minimalFrontierWidth:minimal.length
  };
  return {
    schema:'connect4.dual-response-obligation.v0_1',
    legalReplyMask,
    responseByP1Label:byReply,
    minimalUniversalObligations:minimal,
    redundantUniversalObligations:dominated,
    allP1RepliesCovered:allRepliesHaveAnswer,
    oneP0ReplyWorksForAll:oneAnswerWorksForAll,
    universalActionsIntersectionMask:intersection,
    P1RepliesRefutingBoundedP0Force: defensiveLabels,
    P1BestRepliesForBinaryBoundedThreatOnly:boundedBestReplyLabels,
    statistics:statsOut,
    scope:'ONE guarded bounded P1/P0 response-cover relation only; not unrestricted WDL or full-game optimal moves'
  };
}

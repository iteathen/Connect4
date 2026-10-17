// Exact finite action/reply formal-concept factorization.
// This is a fixed relation carrier. It does NOT compute arbitrary-depth game WDL,
// construct the source response relation, or remove multi-block alternation.
export function buildAdaptiveGaloisFactors(rowMaskValues, {
  legalReplyMask=null,maxOperations=300000,maxRectangles=10000,
  maxObjects=60000,deadlineAt=Infinity
}={}){
  if(!Array.isArray(rowMaskValues))throw Error('expected action-row array');
  const W=rowMaskValues.length;
  if(!Number.isInteger(W)||W<1||W>7)throw Error('action alphabet must be 1..7');
  const all=(1<<W)-1;
  if(rowMaskValues.some(x=>!Number.isInteger(x)||x<0||(x&~all)!==0))
    throw Error('invalid action-row bitset');
  const legal=legalReplyMask===null?all:legalReplyMask;
  if(!Number.isInteger(legal)||legal<0||(legal&~all)!==0)
    throw Error('invalid legal reply bitset');
  const stats={actionCount:W,subsetInspections:0,intersections:0,
    incidenceTests:0,closureChecks:0,rebuildBitWrites:0,
    universalTests:0,operations:0};
  function charge(kind){
    stats[kind]++;stats.operations++;
    if(stats.operations>maxOperations||Date.now()>deadlineAt)
      throw Error('GALOIS_WORK_BUDGET_EXHAUSTED');
  }
  const seen=new Set(),rectangles=[];
  // Every maximal nonempty all-ones rectangle is the closure of a seed
  // action subset; deduplicate closed (action,reply) pairs.
  for(let seed=1;seed<=all;seed++){
    charge('subsetInspections');
    let replies=all;
    for(let a=0;a<W;a++)if(seed&(1<<a)){
      charge('intersections');replies&=rowMaskValues[a];
    }
    if(replies===0)continue;
    let actions=0;
    for(let a=0;a<W;a++){
      charge('incidenceTests');
      if((rowMaskValues[a]&replies)===replies)actions|=1<<a;
    }
    let closedReplies=all;
    for(let a=0;a<W;a++)if(actions&(1<<a)){
      charge('closureChecks');closedReplies&=rowMaskValues[a];
    }
    if(closedReplies!==replies||actions===0)
      throw Error('GALOIS_CLOSURE_INVARIANT_FAILED');
    const key=actions+':'+replies;
    if(!seen.has(key)){
      seen.add(key);rectangles.push({actionMask:actions,replyMask:replies});
      if(rectangles.length>maxRectangles||rectangles.length+seen.size>maxObjects)
        throw Error('GALOIS_REPRESENTATION_BUDGET_EXHAUSTED');
    }
  }
  rectangles.sort((a,b)=>a.actionMask-b.actionMask||a.replyMask-b.replyMask);
  const reconstructed=Array(W).fill(0);
  for(const rectangle of rectangles)for(let a=0;a<W;a++)
    if(rectangle.actionMask&(1<<a)){
      charge('rebuildBitWrites');reconstructed[a]|=rectangle.replyMask;
    }
  if(reconstructed.some((x,a)=>x!==rowMaskValues[a]))
    throw Error('GALOIS_COVER_MISMATCH');
  let replyUnion=0;
  for(const rectangle of rectangles)replyUnion|=rectangle.replyMask;
  let oneActionCoversAll=false;
  for(let a=0;a<W;a++){
    charge('universalTests');
    if((reconstructed[a]&legal)===legal)oneActionCoversAll=true;
  }
  return {width:W,legalReplyMask:legal,rectangles,reconstructed,
    forallReplyExistsAction:(legal&~replyUnion)===0,
    existsActionForallReply:oneActionCoversAll,
    rowTypeCount:new Set(rowMaskValues).size,stats,
    semantics:'exact finite response relation only; no multi-block or game WDL closure'};
}

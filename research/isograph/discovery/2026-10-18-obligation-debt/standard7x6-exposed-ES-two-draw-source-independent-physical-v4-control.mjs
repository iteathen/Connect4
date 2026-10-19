// FROZEN BEFORE any physical WDL/reference V4 for the two previously
// SOURCE-certified exact DRAW-best original W7H6K4 histories.
// Independently reconstruct true original 69 geometric four-cell winlines,
// gravity/owner-colored history and FIRST-win-stopped q; recurse entire
// remaining game ONLY INSIDE independent PHYSICAL falsifier, then compare
// SAME ORIGINAL q against unchanged V4 and old nonbijective reply SOURCE.
// Pure ES+nonloss SOURCE and two selected literal actions frozen beforehand;
// NEVER use physical oracle values to choose/source-fit certificate.
export function checkFrozenTwoExposedESDrawOriginalPhysical(
 frozenSource,{
  createOriginalV4,
  createNonbijectiveSource,
  createOldFullPairSource,
  createFirstTouchSource,
  maxPhysicalUniqueStates=150000
 }={}){
 const fixed=[
  '56623673475164457312177656217553334114',
  '33121345774651444367461121562672577235'];
 if(!frozenSource||frozenSource.cases?.length!==2||
    String(frozenSource.cases.map(x=>x.originalOneBasedHistory))!==String(fixed)||
    frozenSource.cases.some(x=>x.sourceNewCompositionStatus!==
      'SOURCE_CERTIFIED_ONE_ORIGINAL_DRAW_BEST_ACTION'||
      x.sourceExactRootWDL!==0||
      x.originalPriorFirstTouchNoWinStatus!=='INCOMPLETE')||
    typeof createOriginalV4!=='function'||
    typeof createNonbijectiveSource!=='function'||
    typeof createOldFullPairSource!=='function'||
    typeof createFirstTouchSource!=='function')
  throw Error('must receive immutable pre-oracle two-root genuine original source DRAW selections and pinned prior source factories');
 const W=7,H=6,N=42,cell=(c,r)=>W*r+c,bit=z=>1n<<BigInt(z),lines=[],inc=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,j)=>[c+j*dc,r+j*dr]);
  if(xy.some(([x,y])=>x<0||x>=W||y<0||y>=H))continue;
  const ids=xy.map(([x,y])=>cell(x,y));
  lines.push(ids);for(const z of ids)inc[z].push(ids);
 }
 if(lines.length!==69)throw Error('not original 69 K4 lines');
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function norm(raw){
  const uniq=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const G of uniq)if(!out.some(U=>(U&G)===U))out.push(G);
  return out;
 }
 function load(history){
  const h=Array(W).fill(0),board=Array(N).fill(-1),owner=[0n,0n];
  for(let t=0;t<history.length;t++){
   const c=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
    throw Error('original source selected illegal gravity history');
   const z=cell(c,h[c]++);board[z]=p;owner[p]|=bit(z);
   if(inc[z].some(L=>L.every(v=>board[v]===p)))
    throw Error('frozen source draw-best root not first-win-free true 7x6');
  }
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(z=>board[z]===1-p))continue;
    let G=0n;
    for(const z of L)if(board[z]===-1)G|=bit(z);
    if(G===0n)throw Error('root terminal winning generator');
    raw.push(G);
   }
   return norm(raw);
  });
  return {board,h,owner,n:history.length,q:{h:h.slice(),R0:R[0],R1:R[1]}};
 }
 class ReferenceBudget extends Error{}
 function physicalAllActionValues(root){
  const h=root.h.slice(),board=root.board.slice(),owners=root.owner.slice(),memo=new Map();
  let calls=0,wins=0,entries=0;
  function solve(n){
   calls++;
   const key=owners[0].toString(16)+'|'+owners[1].toString(16);
   if(memo.has(key))return memo.get(key);
   if(memo.size>=maxPhysicalUniqueStates)throw new ReferenceBudget('original physical WDL state limit');
   if(n===N)return 0;
   const p=n&1;let best=p===0?-1:1,legal=false;
   for(let c=0;c<W;c++){
    if(h[c]===H)continue;legal=true;
    const z=cell(c,h[c]++);board[z]=p;owners[p]|=bit(z);
    let value;
    try{
     if(inc[z].some(L=>L.every(e=>board[e]===p))){wins++;value=p===0?1:-1;}
     else value=n+1===N?0:solve(n+1);
    }finally{h[c]--;board[z]=-1;owners[p]&=~bit(z);}
    if(p===0){best=Math.max(best,value);if(best===1)break;}
    else {best=Math.min(best,value);if(best===-1)break;}
   }
   if(!legal)best=0;
   memo.set(key,best);entries++;
   return best;
  }
  const action={},p=root.n&1;
  for(let c=0;c<W;c++){
   if(h[c]>=H)continue;
   const z=cell(c,h[c]++);board[z]=p;owners[p]|=bit(z);
   let value;
   try{
    if(inc[z].some(L=>L.every(e=>board[e]===p))){wins++;value=p===0?1:-1;}
    else value=root.n+1===N?0:solve(root.n+1);
   }finally{h[c]--;board[z]=-1;owners[p]&=~bit(z);}
   action[c+1]=value;
  }
  const val=p===0?Math.max(...Object.values(action)):Math.min(...Object.values(action));
  return {actionWDL:action,rootWDLP0Relative:val,
   bestActualOriginalColumns:Object.keys(action).map(Number).filter(c=>action[c]===val),
   independentOriginalPhysicalWDLStats:{recursiveCalls:calls,memoEntries:entries,physicalFirstWinEdges:wins}};
 }
 const V4=createOriginalV4({width:W,height:H,connect:4}),
  nonbijective=createNonbijectiveSource({width:W,height:H,connect:4}),
  oldPair=createOldFullPairSource({width:W,height:H,connect:4}),
  touch=createFirstTouchSource({width:W,height:H,connect:4});
 const out={schema:'connect4.original7x6.exposed_es_one_nonloss_draw_two_genuine_original_physical_v4_marginal_v0_1',
  date:'2026-10-18',status:'PHYSICAL_REFERENCES_EXECUTED_POST_IMMUTABLE_SOURCE_FREEZE',
  originalGeometryWinlines:69,exactFrozenHistoryCount:2,
  sourceFirstTouchPreviouslyIncompleteBoth:true,
  independentPhysicalScalarGameValuesOnlyInReference:true,
  sourceConstructorFutureGameValueCalls:0,
  stats:{independentTrueOriginalPhysicalRootsReconstructed:0,
   independentlyPhysicallyVerifiedSourceDrawBestMoves:0,
   independentlyPhysicallyIncorrectSourceBestMoves:0,
   frozenSourceQResidualMismatches:0,
   V4AlreadyCertifiedOneBestMoves:0,V4IncompleteWhereNewESDrawSourceBest:0,
   oldNonbijectiveSourceAlreadyBest:0,oldNonbijectiveSourceIncomplete:0,
   oldFullPairPlusDualAlreadyBest:0,oldFullPairPlusDualIncomplete:0,
   physicalMinimaxReferenceBudgetErrors:0,
   sourceNovelOverAllThreePriorProofFamilies:0},
  rows:[]};
 for(const item of frozenSource.cases){
  const history=item.originalOneBasedHistory,root=load(history);
  if(root.n!==item.originalPly||String(root.h)!==String(item.originalHeights)||
   root.q.R0.length!==item.originalResidualCounts[0]||
   root.q.R1.length!==item.originalResidualCounts[1])
   throw Error('frozen source root not same independent original physical q');
  out.stats.independentTrueOriginalPhysicalRootsReconstructed++;
  let phys;
  try{phys=physicalAllActionValues(root);}
  catch(e){
   if(!(e instanceof ReferenceBudget))throw e;
   out.stats.physicalMinimaxReferenceBudgetErrors++;
   out.rows.push({history,originalPhysicalWDL:'INCOMPLETE_PHYSICAL_BUDGET'});
   continue;
  }
  if(phys.rootWDLP0Relative!==0||
    phys.actionWDL[item.sourceSelectedBestOriginalColumn]!==0){
   out.stats.independentlyPhysicallyIncorrectSourceBestMoves++;
   throw Error('genuine original physical exact WDL FALSIFIED source ES root no-win + one first action draw '+JSON.stringify({history,phys,item}));
  }
  out.stats.independentlyPhysicallyVerifiedSourceDrawBestMoves++;
  const previous=touch.compute(root.q);
  if(previous.status!=='INCOMPLETE')
   throw Error('first-touch SOURCE suddenly covers frozen marginal negative q');
  const refNonbijective=nonbijective.analyze(root.q),
   refPair=oldPair.compute(root.q,{maxOperations:180000,maxMs:5000,maxStaticWitnessStates:20000});
  let priorV4;
  try{
   priorV4=V4.compute(root.q,{orderOptions:{maxOperations:180000,maxMs:750,maxRepresentatives:10000}});
  }catch(e){priorV4={status:'V4_REFERENCE_ERROR',reason:String(e)};}
  if(priorV4.status==='VALID_CONTINUATION')out.stats.V4AlreadyCertifiedOneBestMoves++;
  if(priorV4.status==='INCOMPLETE')out.stats.V4IncompleteWhereNewESDrawSourceBest++;
  if(refNonbijective.selectedBestOriginalColumn!==null)
   out.stats.oldNonbijectiveSourceAlreadyBest++;
  else out.stats.oldNonbijectiveSourceIncomplete++;
  if(refPair.status==='VALID_CONTINUATION')out.stats.oldFullPairPlusDualAlreadyBest++;
  else out.stats.oldFullPairPlusDualIncomplete++;
  const novel=priorV4.status==='INCOMPLETE' &&
   refNonbijective.selectedBestOriginalColumn===null &&
   refPair.status!=='VALID_CONTINUATION'&&
   previous.status==='INCOMPLETE';
  if(novel)out.stats.sourceNovelOverAllThreePriorProofFamilies++;
  out.rows.push({history,originalRank:root.n,originalMover:root.n&1,
   originalHeights:root.h,
   originalResidualCounts:[root.q.R0.length,root.q.R1.length],
   originalLegalLiteralColumns:root.h.flatMap((v,c)=>v<H?[c+1]:[]),
   sourceSelectedDrawBestOriginalColumn:item.sourceSelectedBestOriginalColumn,
   sourceDrawP0RelativeRootWDL:0,
   verifiedFirstActionSourceNonlossInterval:item.sourceIndependentFirstActionNonlossInterval,
   independentExactOriginalPhysicalRootValue:phys.rootWDLP0Relative,
   independentExactOriginalPhysicalFirstActionValues:phys.actionWDL,
   independentlyVerifiedAllBestOriginalColumns:phys.bestActualOriginalColumns,
   physicalReferenceStats:phys.independentOriginalPhysicalWDLStats,
   olderFirstTouchSourceStatus:previous.status,
   previousNonbijectiveSourceStatus:refNonbijective.status,
   previousNonbijectiveSelectedBest:refNonbijective.selectedBestOriginalColumn,
   oldFullPairPlusOverloadSourceStatus:refPair.status,
   oldFullPairPlusOverloadSourceReason:refPair.reason??null,
   unchangedV4SourceStatus:priorV4.status,
   unchangedV4BestOriginalColumn:priorV4.selectedOriginalLiteralColumn??null,
   unchangedV4SourceReason:priorV4.sourceQualitativeOrderReason??priorV4.reason??null,
   sourceBestNewOverAllTheseProofFamilies:novel});
 }
 return out;
}

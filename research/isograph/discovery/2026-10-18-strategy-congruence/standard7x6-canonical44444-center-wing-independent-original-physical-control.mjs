// FROZEN before any physical execution: independent original W7 H6 K4
// PHYSICAL colored-grid 69-win-window observer for SOURCE 44444 2-ply
// postheight histogram and P0 residual min-width obstruction.
// No game tree, no opponent strategy minimax, no scalar root/action WDL.
import {certifyOriginalCanonical44444TwoPlyTransportObstruction} from './standard7x6-source-canonical44444-center-wing-two-ply-obstruction.mjs';
export function verifyPhysicalOriginalCanonical44444TwoPlyObstruction(){
 const W=7,H=6,N=42,id=(c,r)=>W*r+c,bit=z=>1n<<BigInt(z),windows=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const coords=Array.from({length:4},(_,k)=>[c+k*dx,r+k*dy]);
  if(coords.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   windows.push(coords.map(([x,y])=>id(x,y)));
 }
 if(windows.length!==69)throw Error('physical board has wrong 69 original winning lines');
 const pop=m=>{let z=0;for(;m;m&=m-1n)z++;return z;};
 const antichain=arr=>{
  const uniq=[...new Set(arr)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const m of uniq)if(!out.some(z=>(z&m)===z))out.push(m);
  return out;
 };
 function qFromPhysical(board,h){
  const R=[0,1].map(p=>{
   const v=[];
   for(const L of windows){
    if(L.some(e=>board[e]===1-p))continue;
    let mask=0n;
    for(const e of L)if(board[e]===-1)mask|=bit(e);
    if(mask===0n)throw Error('nonterminal original physical colored board already has 4-winning line');
    v.push(mask);
   }
   return antichain(v);
  });
  return {h:h.slice(),R0:R[0],R1:R[1]};
 }
 function blank(){return {board:Array(N).fill(-1),h:Array(W).fill(0),ply:0};}
 function physicalDrop(q,col){
  const c=col-1,p=q.ply&1;
  if(!Number.isInteger(c)||c<0||c>=W||q.h[c]>=H)throw Error('physically illegal gravity column');
  const row=q.h[c]++,z=id(c,row);
  if(q.board[z]!==-1)throw Error('physical board collision');
  q.board[z]=p;q.ply++;
  const won=windows.some(L=>L.every(e=>q.board[e]===p));
  return {owner:p,col,row:row+1,won};
 }
 function clone(q){return {board:q.board.slice(),h:q.h.slice(),ply:q.ply};}
 function hist(h){return Array.from({length:H+1},(_,v)=>h.filter(x=>x===v).length);}
 const qroot=blank();
 for(const k of [4,4,4,4,4]){
  const m=physicalDrop(qroot,k);
  if(m.won)throw Error('44444 physically ends before specified rank5');
 }
 const rootSourceQ=qFromPhysical(qroot.board,qroot.h);
 if(rootSourceQ.R0.length!==48||rootSourceQ.R1.length!==42||
    String(rootSourceQ.h)!=='0,0,0,5,0,0,0')
  throw Error('independent original physical 44444 root q disagrees with known semantics');
 const certified=certifyOriginalCanonical44444TwoPlyTransportObstruction(rootSourceQ);
 if(certified.status!==
  'SOURCE_CERTIFIED_CANONICAL_44444_TWO_PLY_WHOLE_COLUMN_TRANSPORT_PROOF_FAMILY_OBSTRUCTED')
  throw Error('source did not certify structural proof-family limitation');
 const wings=[1,2,3,5,6,7],directPairRows=[];
 const counters={originalKWinlines:windows.length,originalRootFirstWinFree:true,
  physicallyReplayedFixedTwoMoveSequences:0,
  physicallyVerifiedNoP0FirstWinsInsideSegment:0,
  sourceWidthTwoWitnessCellsVerified:0,
  centerFirstWingRepliesWithMinP0Width2:0,
  wingFirstCenterReplyWithMinP0Width3:0,
  physicallyMatchedSupportHistogramPairs:0,
  wingFirstWingReplySupportMismatchCases:0,
  sourceAndPhysicalSourceQResidualContradictions:0,
  sourceAndPhysicalSupportHistogramContradictions:0,
  sourceFutureStrategicallyInequivalentGameWDLQueries:0};
 function replay(a,r){
  const q=clone(qroot),one=physicalDrop(q,a),two=physicalDrop(q,r);
  if(one.won||two.won)throw Error('false SOURCE claim no immediate terminal among canonical two-ply fixed cases');
  counters.physicallyReplayedFixedTwoMoveSequences++;
  counters.physicallyVerifiedNoP0FirstWinsInsideSegment++;
  const source=qFromPhysical(q.board,q.h);
  if(!source.R0.length||!source.R1.length)throw Error('unexpected original residual family extinct');
  return {source,hist:hist(q.h),min0:Math.min(...source.R0.map(pop)),min1:Math.min(...source.R1.map(pop)),
   physicalOwners:two};
 }
 for(const wing of wings){
  const right=replay(wing,4);
  if(right.min0!==3)throw Error('original physical wing then center has P0 min residual width !=3');
  counters.wingFirstCenterReplyWithMinP0Width3++;
  const row=certified.cases.find(x=>x.wing===wing);
  if(!row)throw Error('SOURCE failed to include canonical wing '+wing);
  if(String(row.matchedRightSupportHeightHistogram)!==String(right.hist)){
   counters.sourceAndPhysicalSupportHistogramContradictions++;
   throw Error('SOURCE right canonical support histogram mismatched independent physical');
  }
  const physicalRightOther=new Map();
  for(const reply of wings)physicalRightOther.set(reply,replay(wing,reply));
  const centerLeft=[];
  for(const reply of wings){
   const left=replay(4,reply);
   if(left.min0!==2)throw Error('original physical center then wing P0 min residual width !=2');
   counters.centerFirstWingRepliesWithMinP0Width2++;
   const sourceLeft=row.centerFirstToWingFirst.replyEvidence.find(x=>x.leftReply===reply);
   if(!sourceLeft||sourceLeft.leftP0MinResidualWidth!==left.min0||
      sourceLeft.rightP0MinResidualWidth!==right.min0||
      !sourceLeft.sourceWidthTwoWitness)
    throw Error('original SOURCE width-two canonical witness not consistent');
   const witness=sourceLeft.sourceWidthTwoWitness;
   const mask=BigInt(witness.postTwoRawOriginalResidualMaskHex);
   if(pop(mask)!==2||!left.source.R0.some(G=>G===mask))
    throw Error('SOURCE R0 min cardinality witness not an actual original PHYSICAL residual');
   counters.sourceWidthTwoWitnessCellsVerified++;
   if(String(left.hist)!==String(right.hist))
    throw Error('SOURCE paired center+wing and wing+center support mismatch');
   counters.physicallyMatchedSupportHistogramPairs++;
   for(const [other,unmatched] of physicalRightOther){
    if(String(left.hist)===String(unmatched.hist))
     throw Error('SOURCE shape gate failed: noncenter P0 reply matches center-completing support');
    counters.wingFirstWingReplySupportMismatchCases++;
   }
   centerLeft.push({wingP0Reply:reply,minLeftP0R0:2,sourceOriginalWidthTwoWitness:witness,
    postTwoHeightHistogram:left.hist});
  }
  directPairRows.push({wing,rightOriginalP0ResponseCenterOnlyHeightHistogram:right.hist,
   rightP0MinResidualWidth:right.min0,
   centerFirstWingReplies:centerLeft,
   originalWholeColumnShapeMatchBlockedInWingToCenterDirection:true,
   originalGeneratorWidthMonotoneUpsetBlockedInCenterToWingDirection:true});
 }
 if(counters.physicallyMatchedSupportHistogramPairs!==36||
    counters.wingFirstWingReplySupportMismatchCases!==216||
    counters.sourceWidthTwoWitnessCellsVerified!==36)
  throw Error('original canonical 6 wings x6 P0 replies expected counts not met');
 return {status:'INDEPENDENT_ORIGINAL_W7H6K4_CENTER_WING_POST_TWO_TRANSPORT_NO_GO_CONFIRMED',
  originalRootHistory:'44444',originalRootPly:5,originalRootMover:'P1',
  originalSourceCounts:[48,42],originalColumnHeights:qroot.h,
  originalSourceNoGoStatus:certified.status,
  sourceAllSixWingsAndBothCrossDirectionsExcludedFromPriorTransportProofFamily:true,
  counters,originalSixWingPhysicalEvidence:directPairRows,
  originalOrdinaryRootWDL:null,oneLevel2BestOriginalColumn:null,
  sourceTheoryDoesNOTClaimTrueWDLOrderInequality:true,
  statusOfAnyGenericNonIsomorphicSupportStrategyTheorem:'OPEN',
  externalProofOrMaintainedNode26CI:'NOT_RUN'};
}

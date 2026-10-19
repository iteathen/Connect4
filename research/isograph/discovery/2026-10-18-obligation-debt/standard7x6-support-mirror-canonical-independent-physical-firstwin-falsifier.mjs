// FROZEN independent original true W7H6K4 physical 69-line colored-grid
// control for the previously frozen SOURCE vertical support-mirror veto.
// Build the original board q and normalized R0/R1 independently, then
// check SOURCE class B physical generator masks, pair upper/lower cell
// geometry and chronological original first-WIN claim for ALL 12 canonical
// SOURCE mirror classes. Run 6 left and 6 right row2 3-support permutations
// with *real* gravity/first-win stopped to check the concrete race witness.
// Not a full game WDL/minimax, no alternative strategy future values.
import {createOriginalSupportMirrorVerticalPairNoFirstWinV2} from './standard7x6-source-support-mirror-vertical-pair-firstwin-veto-v2.mjs';
export function validateOriginalSupportMirrorCanonicalPhysical(){
 const W=7,H=6,N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),lines=[],
  byCell=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
  if(cc.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H)){
   const cells=cc.map(([a,b])=>id(a,b));lines.push(cells);
   for(const z of cells)byCell[z].push(cells);
  }
 }
 if(lines.length!==69)throw Error('physical original standard 7x6 not 69 lines');
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function norm(arr){
  const unique=[...new Set(arr)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const G of unique)if(!out.some(U=>(G&U)===U))out.push(G);
  return out;
 }
 const empty=()=>({h:Array(W).fill(0),b:Array(N).fill(-1),n:0,winner:null});
 const clone=q=>({h:q.h.slice(),b:q.b.slice(),n:q.n,winner:q.winner});
 function drop(q,cOne){
  const c=cOne-1,p=q.n&1;
  if(q.winner!==null||!Number.isInteger(c)||c<0||c>=W||q.h[c]>=H)
   throw Error('original physical placement illegal or AFTER first WIN');
  const z=id(c,q.h[c]);q.b[z]=p;q.h[c]++;q.n++;
  if(byCell[z].some(L=>L.every(e=>q.b[e]===p)))q.winner=p;
  return {p,firstWin:q.winner,z};
 }
 function replay(history){
  const q=empty();for(const c of history){const m=drop(q,Number(c));
   if(m.firstWin!==null&&q.n!==history.length)
    throw Error('source root history first-won early');}
  if(q.winner!==null)throw Error('source root history already firstwon');
  return q;
 }
 function physicalOriginalR(q){
  const R=[0,1].map(p=>{
   const all=[];
   for(const L of lines){
    if(L.some(z=>q.b[z]===1-p))continue;
    let m=0n;for(const z of L)if(q.b[z]===-1)m|=bit(z);
    if(!m)throw Error('root already contains original completed winning line');
    all.push(m);
   }
   return norm(all);
  });
  return {h:q.h.slice(),R0:R[0],R1:R[1]};
 }
 const root=replay('44444'),q=physicalOriginalR(root);
 const model=createOriginalSupportMirrorVerticalPairNoFirstWinV2({width:W,height:H,connect:4}),
   source=model.compute(q);
 if(source.classBOriginalOppositeSupportLineFirstWinPreemptedCount!==12||
    source.sourceOriginalUnprotectedEmptyExposedRequirements.length!==10||
    source.classAOriginalFullPairBlockedCount!==18||
    source.classCOriginalESProjectedRequirementCount!==2)
  throw Error('original SOURCE canonical classes changed before physical validation');
 const rootR=q.R1,opponentR=q.R0;
 const stat={truePhysicalOriginalK4WinningLines:lines.length,
  originalCanonicalRootPly:root.n,originalRootResidualCounts:[q.R0.length,q.R1.length],
  sourceClassBOriginalGeneratorLineWitnessesChecked:0,
  sourceClassBFalseOpponentSupportSubsetClaims:0,
  sourceClassBFalseVerticalPairMateClaims:0,
  sourceClassBOriginalPhysicalOwnerOrWinlineGeometryMismatches:0,
  threeWingSupportOrderingsPhysicallyReplayed:0,
  P0FirstWinOnThirdSupportingLowerCell:0,
  P1UnexpectedFirstWinInSupportSequence:0,
  newSourceNoWinClaimForCanonical:false,
  originalStrategicallyDistinctFutureGameWDLValuesQueried:0};
 const verifiedSupporterGeometry=[];
 for(const item of source.sourceOriginalSupportMirrorClassBProofWitnesses){
  const G=rootR[item.attackerOriginalGeneratorIndex],
    H=opponentR[item.originalDefenderSupportWinningRequirementIndex];
  if(G===undefined||H===undefined||
     item.attackerOriginalResidualMaskHex!=='0x'+G.toString(16)||
     item.originalDefenderSupportResidualMaskHex!=='0x'+H.toString(16))
   throw Error('SOURCE support row claim does not match INDEPENDENT original normalized R');
  let lower=0n;const pa=[];
  for(let c=0;c<W;c++){
   const rem=H-q.h[c],offset=rem%2;
   for(let r=q.h[c]+offset;r<H;r+=2){
    const low=id(c,r),high=id(c,r+1);
    if((G&bit(high))!==0n){
     lower|=bit(low);pa.push({upper:{col:c+1,row:r+2},lower:{col:c+1,row:r+1}});
    }
   }
  }
  if((H&lower)!==H){
   stat.sourceClassBFalseOpponentSupportSubsetClaims++;
   throw Error('SOURCE opponent H is not subset of physical lower pair mates from G');
  }
  if(lower!==BigInt(item.originalLowerSupportMateMaskHex)){
   stat.sourceClassBFalseVerticalPairMateClaims++;
   throw Error('SOURCE paired lower mates disagree with original physical grid geometry');
  }
  if(pa.length!==item.originalUpperSupportPhysicalEventCount)throw Error('wrong source upper cell count');
  const Gfull=lines.some(L=>{
   let alreadyP=0n,emptyP=0n;
   for(const z of L){
    if(root.b[z]===0)return false;
    if(root.b[z]===1)alreadyP|=bit(z);
    else emptyP|=bit(z);
   }
   return G===emptyP;
  });
  const Hfull=lines.some(L=>{
   let emptyP=0n;
   for(const z of L){
    if(root.b[z]===1)return false;
    if(root.b[z]===-1)emptyP|=bit(z);
   }
   return H===emptyP;
  });
  if(!Gfull||!Hfull){
   stat.sourceClassBOriginalPhysicalOwnerOrWinlineGeometryMismatches++;
   throw Error('SOURCE support-mirror member not a real original viable geometric straight winning line');
  }
  stat.sourceClassBOriginalGeneratorLineWitnessesChecked++;
  if(verifiedSupporterGeometry.length<12)
   verifiedSupporterGeometry.push({
    attackerOriginalSourceResidualGHex:'0x'+G.toString(16),
    defenderOriginalSourceResidualHHex:'0x'+H.toString(16),
    supporterLowerMateMaskHex:'0x'+lower.toString(16),
    physicalPairUpperToLower:pa});
 }
 function permutations(list){
  if(list.length===1)return [list];
  const arr=[];for(let i=0;i<list.length;i++)
   for(const rest of permutations(list.filter((_,j)=>j!==i)))
    arr.push([list[i],...rest]);
  return arr;
 }
 const timelines=[];
 for(const wingTriplet of [[1,2,3],[5,6,7]]){
  for(const order of permutations(wingTriplet)){
   const physical=clone(root);
   let m=drop(physical,4); // P1 center r6, freeing P0 LOWER support opening
   if(m.firstWin!==null)throw Error('P1 center unexpectedly immediately firstwins');
   for(let i=0;i<order.length;i++){
    m=drop(physical,order[i]); // P0 claims row1 (lower)
    if(i===2){
     if(m.firstWin!==0){
      stat.P1UnexpectedFirstWinInSupportSequence++;
      throw Error('P0 did NOT firstwin row1 after 3 lower supports before P1 could complete row2');
     }
     stat.P0FirstWinOnThirdSupportingLowerCell++;
     break;
    }
    if(m.firstWin!==null)throw Error('early unexpected firstwin');
    m=drop(physical,order[i]); // P1 claims row2 (upper)
    if(m.firstWin!==null)throw Error('P1 somehow firstwon before all row2 supports');
   }
   stat.threeWingSupportOrderingsPhysicallyReplayed++;
   if(timelines.length<12)timelines.push({wingOrder:order,
    firstWinner:physical.winner,absoluteFirstWinRank:physical.n});
  }
 }
 if(stat.sourceClassBOriginalGeneratorLineWitnessesChecked!==12||
    stat.threeWingSupportOrderingsPhysicallyReplayed!==12||
    stat.P0FirstWinOnThirdSupportingLowerCell!==12)
  throw Error('expected 12 independent source supporter masks and 12 actual full three-wing race controls');
 return {schema:'connect4.original7x6.support_mirror_opponent_first_win_physical_check_v0_1',
  date:'2026-10-18',
  status:'INDEPENDENT_TRUE7X6_SUPPORT_MIRROR_GEOMETRY_AND_ROW1_FIRST_WIN_ALL12_PASS',
  theorem:'docs/research/2026-10-18-support-mirror-vertical-pair-causal-first-win-veto.md',
  sourceCanonicalStatus:source.status,
  sourceClassCounts:{A:18,B:12,C:2,zeroExposedNotPreempted:10},
  sourceCanonicalNoFirstWinStillIncomplete:true,
  counters:stat,independentlyCheckedOriginalRowPairWitnesses:verifiedSupporterGeometry,
  chronologicalPhysicalRow2VersusRow1FirstWinPermutations:timelines,
  ordinary44444RootWDL:'UNKNOWN',originalLevel2BestOriginalColumn:'INCOMPLETE',
  noMinimaxOrStrategyGameValuesComputed:true};
}

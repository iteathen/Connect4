// FROZEN before SOURCE q corpus screening or independent PHYSICAL WDL
// reference. Test whether original degree-closed 2-cell attacker playable
// generator GRAPH has empty required defender reply mask, which DIRECTLY
// proves attacker FORCED FIRST-WIN on the current move domain, for ALL
// defender next actions, with NO future q/game value/policy evaluations.
// Source original R0/R1 built from 69 TRUE geometry lines on first-win
// stopped genuine random gravity histories (seeded 20261018).
import {createOriginalDegreeClosedForkFunnel} from './standard7x6-source-degree-closed-fork-funnel.mjs';
export function runOriginalDegreeForkEmptyDefensePreoraclePilot({
 seed=20261018,maxHistories=2300,minRank=5,maxRank=36,minLegal=3,maxWitnesses=14}={}){
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z),lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(cc.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   lines.push(cc.map(([x,y])=>id(x,y)));
 }
 if(lines.length!==69)throw Error('wrong independent original straight K4 winlines');
 let state=seed>>>0;
 function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function minimal(xs){
  const uniq=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const x of uniq)if(!out.some(m=>(x&m)===m))out.push(x);
  return out;
 }
 function buildQ(board,h){
  const R=[0,1].map(p=>{
   const xs=[];
   for(const L of lines){
    if(L.some(z=>board[z]===1-p))continue;
    let m=0n;
    for(const z of L)if(board[z]===-1)m|=bit(z);
    if(m===0n)throw Error('input not first-win-stopped');
    xs.push(m);
   }
   return minimal(xs);
  });
  return {h:h.slice(),R0:R[0],R1:R[1]};
 }
 function moveWins(board,c,row,p){
  const z=id(c,row);board[z]=p;
  const win=lines.some(L=>L.includes(z)&&L.every(k=>board[k]===p));
  board[z]=-1;return win;
 }
 const source=createOriginalDegreeClosedForkFunnel({width:W,height:H,connect:4});
 const stats={seed,maxHistories,minRank,maxRank,minLegal,maxWitnesses,
  genuineOriginalGameHistoriesGenerated:0,
  observedFirstWinStoppedNonterminalPhysicalQ:0,
  positionsWithDefenderMinSourceRequirementAtLeast3:0,
  positionsWithAtLeastOnePlayableAttackerTwoCellLine:0,
  positionsWithForkGraphCenterDegree2OrMore:0,
  sourceActualEmptyDefensivePreemptionRootPositions:0,
  sourceSelectedDefenderAllActionsForcedLossQ:0,
  sourceIndependentFutureGameWDLQueries:0,
  physicallyBranchedCurrentGameStrategiesInSource:0,
  originalPhysicalK4Windows:69,
  status:'SOURCE_ONLY_PREORACLE_CURRENT_Q_GRAPH_SCREEN'},
  witness=[],seen=new Set();
 for(let g=0;g<maxHistories;g++){
  const board=Array(42).fill(-1),h=Array(7).fill(0);let history='';
  for(let n=0;n<42;n++){
   if(n>=minRank&&n<=maxRank&&h.filter(z=>z<H).length>=minLegal){
    const q=buildQ(board,h),out=source.compute(q);
    stats.observedFirstWinStoppedNonterminalPhysicalQ++;
    if(out.status!=='INCOMPLETE_DEFENDER_TERMINAL_SUPERSESSION_GUARD')
     stats.positionsWithDefenderMinSourceRequirementAtLeast3++;
    if(out.sourceOriginalPlayablePairThreatGraphEdges?.length)
     stats.positionsWithAtLeastOnePlayableAttackerTwoCellLine++;
    if(out.sourceDegreeClosedForkCenterObligations?.length)
     stats.positionsWithForkGraphCenterDegree2OrMore++;
    if(out.status==='SOURCE_CERTIFIED_ALL_DEFENDER_MOVES_LOSE_TO_BOUNDED_FORK'){
     stats.sourceActualEmptyDefensivePreemptionRootPositions++;
     const key=h.join(',')+'|'+q.R0.join(',')+'|'+q.R1.join(',');
     if(!seen.has(key)&&witness.length<maxWitnesses){
      seen.add(key);stats.sourceSelectedDefenderAllActionsForcedLossQ++;
      witness.push({history,originalRank:n,currentDefenderOwner:n&1,
       currentAttackerOwner:1-(n&1),
       originalHeights:h.slice(),originalRCounts:[q.R0.length,q.R1.length],
       allCurrentlyLegalDefenderColumns:out.originalLegalCurrentColumns,
       sourceAllCurrentMovesForcedLoss:out.sourceCurrentDefenderForcedLossByAllActions,
       sourceSelectedGuaranteedLevel2OriginalColumn:out.sourceLevel2BestOriginalColumn,
       sourcePlayableAttackerTwoCellEdges:out.sourceOriginalPlayablePairThreatGraphEdges,
       sourceDegreeClosedForkObligations:out.sourceDegreeClosedForkCenterObligations,
       sourceEveryDefenderMoveHasExplicitAttackerForcingProgram:out.sourcePerExcludedDefenderCurrentActionAttackerForcingWitness});
     }
    }
   }
   const safe=[];
   for(let c=0;c<W;c++)if(h[c]<H&&!moveWins(board,c,h[c],n&1))safe.push(c);
   if(!safe.length)break;
   const c=safe[rand()%safe.length],z=id(c,h[c]++);
   board[z]=n&1;history+=String(c+1);
  }
  stats.genuineOriginalGameHistoriesGenerated++;
  if(witness.length>=maxWitnesses)break;
 }
 return {stats,sourcePreoracleWitnesses:witness,
  noReferencePhysicalWDLCallYet:true,sourceOnlyOriginalQStaticProof:true};
}

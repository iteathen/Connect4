// FROZEN before any independent physical first-win replay, numerical
// WDL oracle or new source sample scan. Single original q canonical 44444
// and two predeclared ES-not-first-touch q from earlier immutable corpus.
// Build ORIGINAL qualified q=(h,R0,R1) using W7H6K4 69 winline masks
// and gravity-legal first-win-free one-based histories. NO game values.
// Evaluate committed V2 support-mirror THREE-class source theorem,
// compare older EXPOSED-ES V2 status for SAME original q. Report original
// row2 left/right support-mirror source witness vs physical cell identities.
import {createOriginalSupportMirrorVerticalPairNoFirstWinV2} from './standard7x6-source-support-mirror-vertical-pair-firstwin-veto-v2.mjs';
import {createVerticalPairExposedPotentialDualLossV2} from './standard7x6-source-vertical-pair-exposed-potential-dual-loss-v2.mjs';
export function probeFrozenOriginalSupportMirrorCanonical(){
 const histories=[
  '44444',
  '56623673475164457312177656217553334114',
  '33121345774651444367461121562672577235'
 ],W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z),winlines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,k)=>[c+k*dc,r+k*dr]);
  if(xy.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   winlines.push(xy.map(([x,y])=>id(x,y)));
 }
 if(winlines.length!==69)throw Error('actual standard7x6 original69 winlines not generated');
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const min=raw=>{
  const unique=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const m of unique)if(!out.some(G=>(m&G)===G))out.push(m);
  return out;
 };
 function originalRoot(history){
  const h=Array(W).fill(0),board=Array(N).fill(-1);
  for(let i=0;i<history.length;i++){
   const c=Number(history[i])-1,p=i&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('original history illegal gravity');
   const z=id(c,h[c]++);board[z]=p;
   if(winlines.some(L=>L.every(x=>board[x]===p)))throw Error('source original root crosses first winner');
  }
  const R=[0,1].map(p=>{
   const all=[];
   for(const L of winlines){
    if(L.some(z=>board[z]===1-p))continue;
    let G=0n;
    for(const z of L)if(board[z]===-1)G|=bit(z);
    if(G===0n)throw Error('root already contains player first winning line');
    all.push(G);
   }
   return min(all);
  });
  return {h,R0:R[0],R1:R[1]};
 }
 const source=createOriginalSupportMirrorVerticalPairNoFirstWinV2({width:W,height:H,connect:4});
 const older=createVerticalPairExposedPotentialDualLossV2({width:W,height:H,connect:4});
 const row2Left=bit(id(0,1))|bit(id(1,1))|bit(id(2,1)),
  row2Right=bit(id(4,1))|bit(id(5,1))|bit(id(6,1)),
  row1Left=bit(id(0,0))|bit(id(1,0))|bit(id(2,0)),
  row1Right=bit(id(4,0))|bit(id(5,0))|bit(id(6,0));
 const rows=[];
 for(const history of histories){
  const q=originalRoot(history),result=source.compute(q),legacy=older.compute(q);
  const basis={history,originalPly:history.length,originalMover:history.length&1,
   originalHeights:q.h,originalSourceResidualCounts:[q.R0.length,q.R1.length],
   priorExposedESStatus:legacy.status,priorExposedESReason:legacy.reason??null,
   priorEmptyProjectedGeneratorCount:legacy.projectedOriginalSourceEmptyRequirements??null,
   sourceSupportMirrorStatus:result.status,sourceSupportMirrorReason:result.reason??null,
   sourceCurrentMoverNoWinCertified:result.sourceProvedCurrentMoverCannotFirstWin,
   sourceClassCountA:result.classAOriginalFullPairBlockedCount,
   sourceClassCountB:result.classBOriginalOppositeSupportLineFirstWinPreemptedCount,
   sourceClassCountC:result.classCOriginalESProjectedRequirementCount,
   sourceUnprotectedZeroExposureCount:result.sourceOriginalUnprotectedEmptyExposedRequirements.length,
   sourceExposedESDyadicNumerator:result.originalExposedESPotentialDyadicNumerator,
   sourceExposedESDyadicDenominator:result.originalExposedESPotentialDyadicDenominator,
   firstClassBWitnesses:result.sourceOriginalSupportMirrorClassBProofWitnesses.slice(0,12),
   firstStillUnprotectedEmptyExposure:result.sourceOriginalUnprotectedEmptyExposedRequirements.slice(0,12),
   sourceStaticOperationCounts:result.statistics,
   noFutureGameValuesQueried:0};
  if(history==='44444'){
   if(String(q.h)!=='0,0,0,5,0,0,0'||q.R0.length!==48||q.R1.length!==42)
    throw Error('original canonical qualified q mismatch');
   const winnerLines=[];
   for(const [name,G,H] of [
    ['LEFT_ROW2',row2Left,row1Left],
    ['RIGHT_ROW2',row2Right,row1Right]
   ]){
    const actualR1Index=q.R1.findIndex(m=>m===G);
    const actualR0Index=q.R0.findIndex(m=>m===H);
    const certified=result.sourceOriginalSupportMirrorClassBProofWitnesses.find(v=>
     v.attackerOriginalGeneratorIndex===actualR1Index &&
     v.originalDefenderSupportWinningRequirementIndex===actualR0Index);
    if(actualR1Index<0||actualR0Index<0||!certified)
     throw Error('FROZEN source mathematical ORIGINAL row2 vs row1 mirror first-win proof missing '+name);
    winnerLines.push({line:name,attackerGOriginalR1Index:actualR1Index,
     defenderHOriginalR0Index:actualR0Index,
     attackerOriginalRow2MaskHex:'0x'+G.toString(16),
     defendantAlreadyFirstWinsRow1IfP1FulfillsG:true,
     opponentOriginalRow1MaskHex:'0x'+H.toString(16),
     originalLowerSupportMateMaskHex:certified.originalLowerSupportMateMaskHex});
   }
   basis.canonicalRow2SupportMirrorExamples=winnerLines;
  }
  rows.push(basis);
 }
 return {schema:'connect4.original7x6.support_mirror_es_source_three_immutable_histories_v0_1',
  date:'2026-10-18',
  status:'SOURCE_PROBE_OF_FROZEN_SUPPORT_MIRROR_FIRST_WIN_THEOREM_NO_PHYSICAL_WDL',
  rootCases:rows,
  canonicalOriginalWDL:'UNKNOWN',
  canonicalOriginalBestMove:'INCOMPLETE',
  neverCalculatedStrategicFutureGameValue:true};
}

// FROZEN before execution and before any physical WDL, V4 or independent
// post-source MINIMAX. EXACT two original q with exposed ES no-first-WIN
// where prior first-touch SOURCE was INCOMPLETE on the SAME 56541 q corpus.
// Reconstruct original R0/R1 independently from W7H6K4 69 physical lines.
// Call only current ORIGINAL SOURCE static proof composition and prior
// original first-touch SOURCE, NEVER alternate future game values.
// Source math frozen at:
// docs/research/2026-10-18-exposed-frontier-potential-plus-one-nonloss-first-action-draw-closure.md
import {createOriginalExposedESOneNonlossDrawBest} from './standard7x6-source-exposed-ES-one-nonloss-draw-best.mjs';
import {createSourceFirstTouchGateBlockerNoWin} from '../2026-10-17-zero-fanout-direct-invariants/standard7x6-source-first-touch-gate-blocker-no-win.mjs';
export function checkFrozenTwoESOnlyOriginalRoots(){
 const histories=[
  '56623673475164457312177656217553334114',
  '33121345774651444367461121562672577235'
 ];
 const W=7,H=6,N=W*H,id=(c,r)=>r*W+c,bit=i=>1n<<BigInt(i),lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(xy.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   lines.push(xy.map(([x,y])=>id(x,y)));
 }
 if(lines.length!==69)throw Error('not original 69 true7x6 K4 winlines');
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const norm=raw=>{
  const sorted=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const g of sorted)if(!out.some(u=>(g&u)===u))out.push(g);
  return out;
 };
 function qOf(history){
  const board=Array(N).fill(-1),h=Array(W).fill(0);
  for(let t=0;t<history.length;t++){
   const col=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(col)||col<0||col>=W||h[col]===H)
    throw Error('source preoracle history physically illegal');
   const z=id(col,h[col]++);board[z]=p;
   if(lines.some(L=>L.every(v=>board[v]===p)))
    throw Error('source preoracle history crossed first win');
  }
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(z=>board[z]===1-p))continue;
    let mask=0n;
    for(const z of L)if(board[z]===-1)mask|=bit(z);
    if(!mask)throw Error('root already original winning');
    raw.push(mask);
   }
   return norm(raw);
  });
  return {h,R0:R[0],R1:R[1]};
 }
 const proof=createOriginalExposedESOneNonlossDrawBest({width:W,height:H,connect:4});
 const priorTouch=createSourceFirstTouchGateBlockerNoWin({width:W,height:H,connect:4});
 const cases=[];
 for(const history of histories){
  const q=qOf(history),legal=q.h.flatMap((z,c)=>z<H?[c+1]:[]);
  const old=priorTouch.compute(q);
  if(old.status!=='INCOMPLETE')throw Error('new source root no longer marginal against old first-touch');
  const out=proof.compute(q);
  cases.push({originalOneBasedHistory:history,
   originalPly:history.length,
   originalMover:history.length&1,
   originalHeights:q.h,
   originalResidualCounts:[q.R0.length,q.R1.length],
   originalLegalFirstColumns:legal,
   originalPriorFirstTouchNoWinStatus:old.status,
   sourceNewCompositionStatus:out.status,
   sourceProvenNoMoverFirstWin:out.sourceProvenMoverCannotForceWin,
   sourceSelectedBestOriginalColumn:out.selectedOriginalBestLiteralColumn,
   sourceExactRootWDL:out.sourceRootWDLP0Relative,
   sourceIndependentFirstActionNonlossInterval:
    out.sourceOneActionCurrentP0RelativeInterval??null,
   sourceOriginalExposedNoWinStatus:out.sourceOriginalExposedNoWinStatus??null,
   sourcePrecomputedStaticOriginalCertificate:out.status==='SOURCE_CERTIFIED_ONE_ORIGINAL_DRAW_BEST_ACTION'?
      out:null,
   sourceStatistics:out.statistics,
   sourceNoFutureGameWdlQueries:0});
 }
 return {schema:'connect4.original7x6.two_ES_no_win_beyond_firsttouch_plus_one_nonloss_source_only_preoracle_v0_1',
  date:'2026-10-18',
  theorem:'docs/research/2026-10-18-exposed-frontier-potential-plus-one-nonloss-first-action-draw-closure.md',
  status:'SOURCE_ONLY_TWO_FIXED_REAL7X6_ROOTS_BEFORE_ANY_PHYSICAL_WDL_OR_V4',
  originalReferenceGeometry:'true W7H6K4 69 K4 lines, original normalized residual antichains',
  cases,
  neitherRootPhysicalWDLQueried:true,
  root44444Still:'INCOMPLETE',
  independentFormalProofOrMaintainedNode26CI:'NOT_RUN'};
}

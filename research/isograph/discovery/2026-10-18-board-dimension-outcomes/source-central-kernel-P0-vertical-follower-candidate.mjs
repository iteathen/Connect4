// FROZEN HYPOTHESIS only: W4/5 K4, even H>=4 deterministic P0
// responder. NOT an exact WIN/LOSS/DRAW theorem; only if independent
// geometry/policy proof eventually qualifies this proposed response.
// See docs/research/2026-10-19-central-kernel-overlap-parity-and-p0-follower-test.md
export function createCentralKernelP0FollowerCandidate({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||!(W===4||W===5)||K!==4||H<4||H%2)
  throw Error('fixed candidate controls only K4 W4 or W5, even H>=4');
 const first=W-K;
 function respond({originalHeightBeforeP1:h,p1Column:c}){
  if(!Array.isArray(h)||h.length!==W||h.some(x=>!Number.isInteger(x)||x<0||x>H)||
      !Number.isInteger(c)||c<0||c>=W||h[c]>=H)
   throw Error('source candidate requires legal original P1 landing');
  const r=h[c];
  if(r+1<H)return {p0Column:c,kind:'UPPER_MATE_FOLLOW_P1',rowAfterP1:r+1};
  for(let j=0;j<W;j++)if(j!==c&&h[j]<H)
   return {p0Column:j,kind:'PREEMPT_LEFTMOST_REMAINING_COLUMN',rowAfterP1:h[j]};
  return {p0Column:null,kind:'BOARD_FULL_AFTER_P1',rowAfterP1:null};
 }
 return Object.freeze({firstOriginalColumn:first,respond,
  status:'UNPROVEN_POLICY_HYPOTHESIS',wdlClaim:null,
  sourceAlternativeFutureGamesValued:0});
}

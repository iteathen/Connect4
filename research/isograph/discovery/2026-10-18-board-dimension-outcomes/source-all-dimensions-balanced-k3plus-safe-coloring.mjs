// Exact STATIC terminal-free balanced coloring for any positive W,H,K>=3.
// Does NOT construct a legal gravity play sequence or perfect-play strategy.
// See docs/research/2026-10-18-universal-balanced-k3plus-static-coloring-no-go.md
export function createBalancedTerminalFreeK3PlusColoring({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<3||W*H>100000)
  throw Error('requires finite positive W,H and K>=3 under source memory bound');
 const t=((W&1)===1&&(H%4)===2)?1:0;
 const owner=new Uint8Array(W*H); // owner bit0=P0, bit1=P1
 let n0=0,n1=0;
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){
  const a=(((r+t)%4)>>1);
  const p=(c&1)^a;
  owner[r*W+c]=p;
  if(p===0)n0++;else n1++;
 }
 return {W,H,K,rowPhaseOffset:t,owner,counters:{n0,n1},
  staticTerminalKSafe:'PROPOSITION_PENDING_INDEPENDENT_PHYSICAL_CHECK',
  originalLegalGravityWord:null,
  ordinaryPerfectPlayWDL:null,sourceFutureStrategicGameStatesEvaluated:0};
}

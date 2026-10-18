// OWNER-corrected Level 2 output interpretation. Reads EXISTING exact
// action values or binary WIN-threshold bits. Does NOT compute action value,
// optimize game, enumerate future positions, or prove zero-branch evaluation.
// All original literal labels retained, no draw/loss fallback mislabeled as
// "best". Source math: docs/research/2026-10-17-owner-level2-any-p0-winning-continuation-and-level3-perfect-fastest-win.md
export function createOwnerP0WinsetReadout({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)throw Error('unsupported board');
 function supportState(q){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
   q.h.some(z=>!Number.isInteger(z)||z<0||z>H))throw Error('invalid support');
  const n=q.h.reduce((s,x)=>s+x,0),p=n&1,
   legal=q.h.flatMap((z,c)=>z<H?[c+1]:[]);
  return {n,p,legal};
 }
 function assertLabels(actual,legal){
  if(!Array.isArray(actual)||actual.length!==legal.length||
    new Set(actual).size!==actual.length||actual.some((z,i)=>z!==legal[i]))
   throw Error('must cover exactly ALL literal legal columns in ascending order');
 }
 function fromExactActionValues(q,rootValue,actionValues){
  const {p,legal}=supportState(q);
  if(![-1,0,1].includes(rootValue)||!Array.isArray(actionValues))
   throw Error('expect exact ordinary P0-relative WDL values');
  const labels=actionValues.map(([a])=>a);
  assertLabels(labels,legal);
  if(actionValues.some(([,v])=>![-1,0,1].includes(v)))
   throw Error('bad P0-relative action WDL');
  const V=p===0?Math.max(...actionValues.map(([,v])=>v)):
     Math.min(...actionValues.map(([,v])=>v));
  if(V!==rootValue)throw Error('root WDL inconsistent with action vector');
  const B0=actionValues.filter(([,v])=>v===1).map(([a])=>a);
  const Mwdl=actionValues.filter(([,v])=>v===rootValue).map(([a])=>a);
  const noWinningMoveForP0=B0.length===0;
  if(p===0&&rootValue<1&&B0.length)throw Error('P0 nonwinning root cannot have winning action');
  if(p===0&&rootValue===1&&B0.join(',')!==Mwdl.join(','))
   throw Error('P0 winning root best masks differ');
  if(p===1&&rootValue===1&&B0.join(',')!==legal.join(','))
   throw Error('P1 root guaranteed P0 win must cover all replies');
  return {rootValue,mover:p,ownerLevel2P0WinningContinuationLabels:B0,
   conventionalWdlOptimalLiteralLabels:Mwdl,
   P0WinningContinuationCount:B0.length,
   noWinningMoveForP0,
   ordinaryBestForCurrentMoverIsDifferentDefinition:true};
 }
 function fromChildPhaseWinBits(q,childValues){
  const {p,legal}=supportState(q);
  if(!Array.isArray(childValues))throw Error('expected exact per-child g+ truth bits');
  assertLabels(childValues.map(([a])=>a),legal);
  if(childValues.some(([,g])=>g!==0&&g!==1))
   throw Error('expected exact binary win threshold');
  const B0=childValues.filter(([,g])=>g===p).map(([a])=>a);
  return {mover:p,ownerLevel2P0WinningContinuationLabels:B0,
   independentlyEvaluatedChildOutcomesInsideThisReadout:0,
   qualification:'readout from existing exact child g+ bits; computing these bits remains the open source-only zero-fanout research task'};
 }
 return Object.freeze({supportState,fromExactActionValues,fromChildPhaseWinBits});
}

// ORIGINAL q=(h,R0,R1) source-only stacked-gravity fork proof.
// ZERO future game state construction, ZERO recursive strategic evaluation.
// Proof: docs/research/2026-10-17-virtual-gravity-stacked-threat-direct-mate.md
// Source checks all CURRENT literal legal actions as structural masks,
// not alternate future game values. One positive output certifies ONE
// best Level2 continuation for current mover in PERFECT-opponent model.
export function createStackedGravityThreatCertificate({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
     K>Math.min(W,H)||W*H>42)throw Error('unsupported exact game geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxStaticTests=20000}={}){
  const h=q?.h,valid=h&&h.length===W&&h.every(z=>Number.isInteger(z)&&z>=0&&z<=H)&&
    Array.isArray(q.R0)&&Array.isArray(q.R1);
  if(!valid)throw Error('expected legal source q=(h,R0,R1)');
  const rank=h.reduce((s,x)=>s+x,0),p=rank&1,o=1-p;
  if(rank>=N)throw Error('cannot evaluate full board as nonterminal');
  const own=p===0?q.R0:q.R1,enemy=p===0?q.R1:q.R0;
  if(own.concat(enemy).some(m=>typeof m!=='bigint'||m===0n))
   throw Error('first-win stopped normalized nonterminal original source only');
  const owned=new Set(own.map(String)),opposed=new Set(enemy.map(String));
  const legal=h.flatMap((height,c)=>height<H?[c]:[]);
  const stats={originalSourceResidualMasks:own.length+enemy.length,
    currentLiteralColumnsScanned:0,
    currentActionStaticGeometricThreatTests:0,
    originalResidualLookupTests:0,
    originalPlayerThreatSingletonPredicates:0,
    originalOpponentCounterWinPredicates:0,
    sourceFutureGameStatesMaterialized:0,
    independentlyValuedStrategicFutures:0,
    opponentResponseGameValuesQueried:0,
    BDD_QBF_StrategyGraphEnumerations:0};
  function contains(set,m){
   stats.originalResidualLookupTests++;
   if(stats.originalResidualLookupTests>maxStaticTests)
    throw Error('static original residual proof budget exhausted');
   return set.has(String(m));
  }
  function ownerThreatAfterX(x,y){
   stats.originalPlayerThreatSingletonPredicates++;
   return contains(owned,y)||contains(owned,x|y);
  }
  const positives=[];
  for(const a of legal){
   stats.currentLiteralColumnsScanned++;
   const x=bit(a,h[a]);
   if(contains(owned,x))continue; // immediate winner handled elsewhere
   if(rank+1===N)continue;
   const postPlayable=legal.flatMap(c=>{
    const r=h[c]+(c===a?1:0);
    return r<H?[{column:c,row:r,mask:bit(c,r)}]:[];
   });
   if(postPlayable.some(t=>{
    stats.originalOpponentCounterWinPredicates++;
    return contains(opposed,t.mask);
   }))continue;
   for(const first of postPlayable){
    stats.currentActionStaticGeometricThreatTests++;
    if(first.row+1>=H)continue;
    const y=first.mask,z=bit(first.column,first.row+1);
    if(!ownerThreatAfterX(x,y)||!ownerThreatAfterX(x,z))continue;
    const prior=postPlayable.filter(t=>ownerThreatAfterX(x,t.mask)).map(t=>t.column+1);
    const proof={
      schema:'connect4.source_stacked_gravity_fork_witness.v0_1',
      mover:p,certifiedWinningOwner:p,
      firstActionColumn:a+1,
      firstActionLandsAt:{column:a+1,rowZeroBased:h[a],cellMaskHex:'0x'+x.toString(16)},
      uniqueStackedColumn:first.column+1,
      bottomImmediateWinCell:{column:first.column+1,rowZeroBased:first.row,cellMaskHex:'0x'+y.toString(16)},
      upperReleasedWinCell:{column:first.column+1,rowZeroBased:first.row+1,cellMaskHex:'0x'+z.toString(16)},
      sourceBottomRequirementMasks:[y,x|y].filter(mask=>owned.has(String(mask))).map(mask=>'0x'+mask.toString(16)),
      sourceUpperRequirementMasks:[z,x|z].filter(mask=>owned.has(String(mask))).map(mask=>'0x'+mask.toString(16)),
      allDistinctCurrentlyPlayablePImmediateWinningTargetColumns:prior,
      opponentImmediateWinDeniedAtEveryNextPlayableColumn:true,
      proofMoveIfOpponentDeviation:first.column+1,
      proofMoveIfOpponentBlocksBottom:first.column+1,
      firstWinBeforeFullBoardDraw:true,
      geometricGuard:'upper winning singleton exactly one gravity cell above lower, same column',
      proof:'opponent must play lower to block imminent own win, thereby releasing upper; no immediate opponent win',
      strategicGameValueQueries:0
    };
    positives.push(proof);
   }
  }
  // Deterministically return ONE certified top-tier continuation, not
  // the full Level-2 action set; all positives were static q assertions.
  const first=positives[0]??null;
  return {status:first?'VALID_CONTINUATION':'INCOMPLETE',
    type:first?'GUARANTEED_MOVER_FIRST_WIN_BY_SAME_COLUMN_STACKED_THREATS':
       'NO_STACKED_GRAVITY_FORK_CERTIFICATE',
    selectedOriginalLiteralColumn:first?.firstActionColumn??null,
    proof:first,numberOfStaticWinningWitnessesFound:positives.length,
    statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}

// Original current q only. Ownership-preserving swap of TWO full 2-ply rounds.
// Guarded exact theorem in docs/research/2026-10-18-unfolded-two-round-static-interactive-trace-diamond.md
// No future q objects, hypothetical paths, value recursion, game-tree or word search.
export function createOriginalTwoRoundTraceDiamond({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid geometry');
 const N=W*H,bit=z=>1n<<BigInt(z);
 function check(q,originalOneBasedColumns){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(z=>!Number.isInteger(z)||z<0||z>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('nonterminal original q required');
  if(!Array.isArray(originalOneBasedColumns)||originalOneBasedColumns.length!==4)
   throw Error('two complete rounds require four literal columns');
  const [a,b,c,d]=originalOneBasedColumns;
  const n=h.reduce((s,z)=>s+z,0),p=n&1,o=1-p;
  const counts={sourceCurrentGeneratorMaskSubsetChecks:0,sourceFutureGameValueQueries:0,
    sourceFutureGameQSuccessors:0,sourceActualGamePlayouts:0};
  if(n>=N||originalOneBasedColumns.some(v=>!Number.isInteger(v)||v<1||v>W||h[v-1]===H)||
     new Set(originalOneBasedColumns).size!==4)
   return {status:'INCOMPLETE',reason:'FOUR_DISTINCT_ROOT_GRAVITY_LEGAL_COLUMNS_REQUIRED',
      originalOneBasedColumns,statistics:counts};
  const cells=originalOneBasedColumns.map(v=>h[v-1]*W+v-1);
  const moverCells=bit(cells[0])|bit(cells[2]);
  const otherCells=bit(cells[1])|bit(cells[3]);
  if((moverCells&otherCells)!==0n)throw Error('distinct-column owner cell masks must be disjoint');
  const own=p?q.R1:q.R0,opp=o?q.R1:q.R0;
  const ownerUnsafe=[],opponentUnsafe=[];
  for(let i=0;i<own.length;i++){
   counts.sourceCurrentGeneratorMaskSubsetChecks++;
   if((own[i]&~moverCells)===0n)ownerUnsafe.push(i);
  }
  for(let i=0;i<opp.length;i++){
   counts.sourceCurrentGeneratorMaskSubsetChecks++;
   if((opp[i]&~otherCells)===0n)opponentUnsafe.push(i);
  }
  if(ownerUnsafe.length||opponentUnsafe.length)
   return {status:'INCOMPLETE',
     reason:'AN_ORIGINAL_SOURCE_WIN_REQUIREMENT_COMPLETES_WITHIN_TWO_ROUNDS',
     originalOneBasedColumns,
     currentMoverUnsafeOriginalGeneratorIndices:ownerUnsafe,
     opponentUnsafeOriginalGeneratorIndices:opponentUnsafe,
     statistics:counts};
  return {status:'CERTIFIED_TWO_ROUND_OWNER_PRESERVING_QO_DIAMOND',
   kind:'DIRECT_ORIGINAL_SOURCE_OWNER_FIXED_INTERACTIVE_ROUND_TRACE',
   originalCurrentMover:p,originalOpponent:o,
   firstOriginalLiteralFourMoveWord:[a,b,c,d],
   secondOriginalLiteralFourMoveWord:[c,d,a,b],
   originalPhysicalFirstWordLandingCells:cells,
   moverTwoEventMaskHex:'0x'+moverCells.toString(16),
   opponentTwoEventMaskHex:'0x'+otherCells.toString(16),
   guaranteedNoFirstWinWithinEitherFourMoveBlock:true,
   guaranteedSameOriginalOrientationSensitiveQAfterBothBlocks:true,
   commonFutureSuffixCorrespondence:true,
   firstActionsProvenEquivalentOrLevel2Best:false,
   sourceRootWDL:null,sourceLevel2OriginalBestColumn:null,
   statistics:counts};
 }
 return Object.freeze({check});
}

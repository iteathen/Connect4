// Independent REAL original 7x6 K4 69-line first-win-stopped
// replay of two prespecified P1 diagonal WINS AGAINST TWO distinct
// SOURCE P0 Fourier pending-pair policies. Uses independent physical
// grid and checks exact frozen source P0 choices on each defender turn.
// No nonstandard board, minimax, WDL lookahead or simulated hardware.
import {sourceTrue7x6FourierWeightedP0PendingPair}
 from './source-true7x6-444444-Fourier-weighted-pending-pair-P0.mjs';
import {sourceOriginal7x6SignedWalshP0PendingPair}
 from './source-true7x6-444444-signed-Walsh-P0-pair-priority.mjs';
function realLines(){
 const lines=[],byCell=Array.from({length:42},()=>[]);
 for(let x=0;x<7;x++)for(let y=0;y<6;y++)
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
   const X=x+3*dx,Y=y+3*dy;
   if(X<0||X>=7||Y<0||Y>=6)continue;
   const coords=Array.from({length:4},(_,j)=>(y+j*dy)*7+x+j*dx);
   const L={physicalSites:coords,start:[x,y],direction:[dx,dy]};
   lines.push(L);
   coords.forEach(z=>byCell[z].push(L));
  }
 if(lines.length!==69)throw Error('real original winlines not69');
 return {lines,byCell};
}
function replayHist(policyKind,oneBasedHistory,source){
 const G=realLines(),h=Array(7).fill(0),cells=Array(42).fill(-1),
  errors=[],events=[],hist=oneBasedHistory;
 if(!hist.startsWith('444444'))throw Error('frozen original center prefix not present');
 const first=policyKind==='unsigned'?
  source.firstOriginalP0MoveAfterCenterFull.literalColumn:
  source.P0OpeningAfterCenterCompletes.literalColumn;
 if(Number(hist[6])!==first)errors.push('source P0 first move not in physical witness');
 let prematureWins=0,firstWinner=null,winningLine=null,sourceReplies=0,
  defenderPendingChecks=0;
 for(let i=0;i<hist.length;i++){
  const c=Number(hist[i])-1,p=i%2,row=h[c];
  if(c<0||c>=7||row>=6){errors.push('physical original gravity illegal at ply'+(i+1));break}
  if(i>=8 && p===0){
   const attackColumn=Number(hist[i-1])-1;
   let expected;
   const originalHeightsBeforeP1=events[i-1].heightsBeforePly;
   try{expected=policyKind==='unsigned'?
    source.replyAfterP1({hBeforeP1:originalHeightsBeforeP1,attackColumn}):
    source.response({heightBeforeP1:originalHeightsBeforeP1,P1OriginalColumn:attackColumn});
   }catch(e){errors.push('source P0 reply guard threw at ply'+(i+1)+String(e));break}
   const target=policyKind==='unsigned'?
    expected.P0ReplyOriginalLiteralColumn:expected.P0LiteralColumn;
   if(c+1!==target)errors.push('physical original P0 move violates frozen Fourier policy at ply'+(i+1));
   sourceReplies++;
  }
  if(i>=7 && p===1){
   const all=[];
   for(let col=0;col<7;col++)if(col!==3)
    for(let r=0;r<6;r+=2){
     const a=cells[r*7+col],b=cells[(r+1)*7+col];
     const v=a===-1&&b===-1?'V':a===0&&b===-1?'P':
      a>=0&&b>=0&&a!==b?'S':'BAD';
     all.push(v);
    }
   if(all.filter(x=>x==='P').length!==1||all.includes('BAD'))
    errors.push('one original pending P0 lower pair violated before P1 ply'+(i+1));
   defenderPendingChecks++;
  }
  const site=row*7+c;
  if(cells[site]!==-1)errors.push('original physical site already owned');
  const prevH=h.slice();h[c]++;cells[site]=p;
  const line=G.byCell[site].find(L=>L.physicalSites.every(z=>cells[z]===p));
  events.push({ply:i+1,originalLiteralColumn:c+1,rowOneBased:row+1,p,
    site,heightsBeforePly:prevH,winningLine:line??null});
  if(line){
   if(i!==hist.length-1)prematureWins++;
   if(firstWinner===null){firstWinner=p;winningLine=line;}
  }
 }
 if(prematureWins||firstWinner!==1||events.at(-1).p!==1||
   !events.at(-1).winningLine)errors.push('P1 first-win-stopped diagonal not terminal exactly on last move');
 return {policy:policyKind,realOriginalBoard:[7,6,4],
  prespecifiedLiteralHistory:hist,totalPhysicalMoves:hist.length,
  frozenSourceP0InitialOriginalLiteral:first,
  sourceP0ResponseMovesReplayed:sourceReplies,
  independentOriginalPairInvariantP1TurnChecks:defenderPendingChecks,
  physicalFirstWinner:firstWinner===1?'P1':firstWinner===0?'P0':null,
  physicalFirstWinningAbsolutePly:events.find(x=>x.winningLine)?.ply??null,
  actualWinningK4LinePhysicalSites:winningLine?.physicalSites??null,
  actualWinningDirection:winningLine?.direction??null,
  originalPhysicalK4Lines:G.lines.length,
  originalP0ResponseAndGravityErrors:errors,
  finiteGameValueOrForcedWinnerNotComputed:true};
}
export function independentlyReplayFourierP0TwoGenuineFirstWins(){
 const unsigned=sourceTrue7x6FourierWeightedP0PendingPair(),
  signed=sourceOriginal7x6SignedWalshP0PendingPair();
 const tests=[
  replayHist('unsigned','44444421122333',unsigned),
  replayHist('signed','44444411117113333557553553777722',signed)
 ];
 return {status:tests.every(x=>!x.originalP0ResponseAndGravityErrors.length)?
   'INDEPENDENT_REAL7X6_BOTH_FOURIER_P0_SOURCE_FIRSTWIN_COUNTEREXAMPLES_REPLAYED':
   'ORIGINAL_FIRSTWIN_REPLAY_FAILED',
  tests,sourceGameFutureWDLCalls:0,otherBoardSizesTested:0};
}

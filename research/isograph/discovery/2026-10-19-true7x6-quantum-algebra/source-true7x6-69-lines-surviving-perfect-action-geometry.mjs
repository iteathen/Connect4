// Pure ORIGINAL W=7,H=6,K=4 measurement source.
// Build 37 OPEN finite four-ribbon strands and 42 linked sites FIRST;
// enumerate each of the ORIGINAL 69 four-cell contiguous windows.
// Given an actual first-win-stopped move word, report exact per-player
// geometrical availability and "double-dead" cancellation on all
// 69 source physical windows. Optionally score a one-step legal move.
// NO perfect-play score is derived by this module; verified oracle
// action scores are external VALIDATION/OBSERVATION inputs.
// 27/28 counts are postulated owner candidates not fit by this code.
export function createTrue7x6SurvivingLineObserver(){
 const strands=[],W=7,H=6,K=4;
 const add=(direction,c,r,dc,dr)=>{
  const ids=[];
  while(c>=0&&c<W&&r>=0&&r<H){
   ids.push(r*W+c);c+=dc;r+=dr;
  }
  strands.push({direction,ids});
 };
 for(let r=0;r<H;r++)add('H',0,r,1,0);
 for(let c=0;c<W;c++)add('V',c,0,0,1);
 for(let c=0;c<W;c++)add('R',c,0,1,1);
 for(let r=1;r<H;r++)add('R',0,r,1,1);
 for(let r=0;r<H;r++)add('F',0,r,1,-1);
 for(let c=1;c<W;c++)add('F',c,H-1,1,-1);
 const aliases=Array.from({length:42},()=>[]);
 for(const [strandID,s] of strands.entries())
  for(const [position,site] of s.ids.entries())
   aliases[site].push({strandID,position,direction:s.direction});
 if(strands.length!==37||aliases.some(x=>x.length!==4)||
    aliases.some(x=>new Set(x.map(v=>v.direction)).size!==4))
  throw Error('real true7x6 four-ribbon geometry not valid');
 const windows=[];
 for(const [strandID,s] of strands.entries())
  for(let t=0;t+3<s.ids.length;t++)
   windows.push({strandID,direction:s.direction,sites:s.ids.slice(t,t+4)});
 if(windows.length!==69)throw Error('not original 69 unwrapped K4 windows');
 const through=Array.from({length:42},()=>[]);
 windows.forEach((L,i)=>L.sites.forEach(x=>through[x].push(i)));
 function board(word){
  if(typeof word!=='string'||/[^1-7]/.test(word))
   throw Error('one-based original column move word required');
  const color=Array(42).fill(-1),h=Array(7).fill(0);
  let terminal=null,lastCompleted=[];
  for(let t=0;t<word.length;t++){
   if(terminal!==null)throw Error('illegal original history continues after first win');
   const c=Number(word[t])-1,row=h[c];
   if(row>=6)throw Error('illegal original full column play');
   const e=row*7+c,p=t%2;h[c]++;color[e]=p;
   const win=through[e].filter(i=>windows[i].sites.every(site=>color[site]===p));
   if(win.length){terminal=p===0?'P0_WIN':'P1_WIN';lastCompleted=win;}
   else if(t===41){terminal='DRAW';}
  }
  return {word,h,color,terminal,completedFirstWinlines:lastCompleted,ply:word.length};
 }
 function observe(state){
  if(!state||!Array.isArray(state.color)||state.color.length!==42)
   throw Error('original physical colored state needed');
  const byOrientation={H:{empty:0,P0only:0,P1only:0,dead:0},
    V:{empty:0,P0only:0,P1only:0,dead:0},
    R:{empty:0,P0only:0,P1only:0,dead:0},
    F:{empty:0,P0only:0,P1only:0,dead:0}};
  const counts={empty:0,P0only:0,P1only:0,dead:0},lineState=[];
  for(const L of windows){
   let p0=0,p1=0;
   for(const site of L.sites){
    if(state.color[site]===0)p0++;
    else if(state.color[site]===1)p1++;
   }
   const status=p0&&p1?'dead':p0?'P0only':p1?'P1only':'empty';
   counts[status]++;byOrientation[L.direction][status]++;
   lineState.push(status);
  }
  const result={
   ...counts,distinctGeometricallySurviving:69-counts.dead,
   liveForP0:counts.empty+counts.P0only,
   liveForP1:counts.empty+counts.P1only,
   bothOwnerLayerMultiplicity:2*counts.empty+counts.P0only+counts.P1only,
   blockedForP0:counts.dead+counts.P1only,
   blockedForP1:counts.dead+counts.P0only,
   linesCurrentlyFullyWonForP0:windows.filter(L=>L.sites.every(e=>state.color[e]===0)).length,
   linesCurrentlyFullyWonForP1:windows.filter(L=>L.sites.every(e=>state.color[e]===1)).length,
   orientation:byOrientation,
   lineState,
   absolutePly:state.ply,
   moverAfterPosition:state.ply%2?'P1':'P0',
   firstWinTerminal:state.terminal
  };
  if(counts.empty+counts.P0only+counts.P1only+counts.dead!==69||
    result.liveForP0+result.liveForP1!==result.distinctGeometricallySurviving+counts.empty)
   throw Error('source survivor inclusion-exclusion broken');
  return result;
 }
 function move(state,columnOneBased){
  if(!Number.isInteger(columnOneBased)||columnOneBased<1||
     columnOneBased>7)throw Error('original 1-based column required');
  const next=board(state.word+columnOneBased);
  const before=observe(state),after=observe(next);
  const c=columnOneBased-1,e=state.h[c]*7+c;
  const owner=state.ply%2; // 0 P0
  const physicalBeforeOpponentLive=through[e].filter(i=>
   before.lineState[i]==='empty'||
   before.lineState[i]===(owner===0?'P1only':'P0only'));
  const opponentBlockReduction=owner===0?
   before.liveForP1-after.liveForP1:before.liveForP0-after.liveForP0;
  return {
   column:columnOneBased,landingCell:e,
   physicalCellLineIncidence:through[e].length,
   immediateNewOpponentBlockedLines:opponentBlockReduction,
   newlyDoubleDead:after.dead-before.dead,
   newlySingleOwnerOnlyFromEmpty:before.empty-after.empty,
   survivingDistinctBefore:before.distinctGeometricallySurviving,
   survivingDistinctAfter:after.distinctGeometricallySurviving,
   after,terminal:next.terminal,
   physicalIncidenceTrueOpponentLiveBefore:physicalBeforeOpponentLive.length
  };
 }
 return {board,observe,move,
  sourceGeometry:{W,H,K,originalStrands:37,physicalSites:42,
   physicalAppearances:168,originalK4Lines:69,
   bottomCornerIncidence:through[0].length,
   bottomCenterIncidence:through[3].length,
   thirdRowCenterIncidence:through[2*7+3].length,
   windowCountsByOrientation:Object.fromEntries(['H','V','R','F'].map(k=>
    [k,windows.filter(x=>x.direction===k).length]))},
  windows,aliases,
  sourceFutureStrategicValueQueries:0};
}

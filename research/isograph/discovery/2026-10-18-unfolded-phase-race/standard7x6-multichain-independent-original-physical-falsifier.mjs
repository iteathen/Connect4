// FROZEN BEFORE test: independent ORIGINAL W7 H6 K4 (69 actual 4-windows)
// physical source q construction and exhaustive chosen 3-chain gravity words.
// Every word enumeration occurs ONLY in this source INDEPENDENT FALSIFIER,
// never in mixed-radix source phase operator. No game WDL or minimax.
import {createOriginalMultichainPhaseConvolution} from './standard7x6-source-multichain-mixedradix-phase.mjs';
export function createOriginalMultichainIndependentPhysicalControl(){
 const W=7,H=6,N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),windows=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,k)=>[c+dc*k,r+dr*k]);
  if(xy.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))
   windows.push(xy.map(([a,b])=>id(a,b)));
 }
 if(windows.length!==69)throw Error('original physical 69-line generator wrong');
 const source=createOriginalMultichainPhaseConvolution({width:7,height:6,connect:4});
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function antichain(raw){
  const uniq=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of uniq)if(!out.some(x=>(G&x)===x))out.push(G);
  return out;
 }
 function qOf(board,h){
  const out=[0,1].map(p=>{
   const raw=[];
   for(const line of windows){
    if(line.some(z=>board[z]===1-p))continue;
    let m=0n;for(const z of line)if(board[z]===-1)m|=bit(z);
    if(m===0n)throw Error('expected nonterminal original q has prior completed K line');
    raw.push(m);
   }
   return antichain(raw);
  });
  return {h:h.slice(),R0:out[0],R1:out[1]};
 }
 function root(history){
  const board=Array(42).fill(-1),h=Array(7).fill(0);
  for(let t=0;t<history.length;t++){
   const c=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=7||h[c]>=6)throw Error('original gravity illegal history');
   const z=id(c,h[c]++);board[z]=p;
   if(windows.some(L=>L.every(e=>board[e]===p)))
    throw Error('not genuine first-win-stopped nonterminal original history');
  }
  if(history.length>=42)throw Error('root full');
  return {board,h,ply:history.length,history,q:qOf(board,h)};
 }
 function words(chains){
  const cap=chains.map(ch=>ch.length),used=Array(chains.length).fill(0),path=[],out=[];
  const T=cap.reduce((a,b)=>a+b,0);
  function rec(){
   if(path.length===T){out.push(path.slice());return;}
   for(let i=0;i<chains.length;i++)if(used[i]<cap[i]){
    used[i]++;path.push(chains[i].column);rec();path.pop();used[i]--;
   }
  }
  rec();return out;
 }
 function physicalWord(rt,word,chains){
  const h=rt.h.slice(),board=rt.board.slice(),ownerWords=chains.map(()=>[]);
  const indices=new Map(chains.map((ch,i)=>[ch.column,i]));
  let firstWin=null;
  for(let k=0;k<word.length;k++){
   const originalCol=word[k],c=originalCol-1,p=(rt.ply+k)&1;
   const which=indices.get(originalCol);
   if(which===undefined||h[c]>=6)throw Error('illegal chosen physical event/column in test word');
   const z=id(c,h[c]++);board[z]=p;ownerWords[which].push(p);
   if(firstWin===null&&windows.some(L=>L.every(e=>board[e]===p)))
    firstWin={winner:p,relativeRank:k+1};
  }
  if(ownerWords.some((w,i)=>w.length!==chains[i].length))
   throw Error('physical fixed-event multiset insufficient');
  return {board,h,ownerWords,
   key:ownerWords.map(xs=>xs.join('')).join('|'),firstWin};
 }
 function qEq(a,b){
  return JSON.stringify(a.h)===JSON.stringify(b.h)&&
   a.R0.length===b.R0.length&&a.R1.length===b.R1.length&&
   a.R0.every((m,i)=>m===b.R0[i])&&a.R1.every((m,i)=>m===b.R1[i]);
 }
 function verifyCase(history,chains){
  const rt=root(history),configured=chains.map(ch=>({column:ch.column,length:ch.length}));
  if(!chains.length||chains.some(ch=>ch.length<1||rt.h[ch.column-1]+ch.length>6)||
   new Set(chains.map(ch=>ch.column)).size!==chains.length)
   throw Error('invalid original physical fixed chain multiset');
  const all=words(chains),fiber=new Map();
  for(const w of all){
   const physical=physicalWord(rt,w,chains);
   let entry=fiber.get(physical.key);
   if(!entry){entry={ownerWords:physical.ownerWords,heads:new Set(),firstWinSet:new Set(),
    exampleWord:w,completeWords:0};fiber.set(physical.key,entry);}
   entry.heads.add(w[0]);entry.completeWords++;
   entry.firstWinSet.add(physical.firstWin===null?'D':String(physical.firstWin.winner));
  }
  const dims=chains.map(x=>x.length),T=dims.reduce((a,b)=>a+b,0),count=2**T;
  const stats={history,rootPly:rt.ply,rootOriginalRCounts:[rt.q.R0.length,rt.q.R1.length],
   originalChosenColumnLengths:configured,
   physicalWordCount:all.length,physicalOwnerFiberCount:fiber.size,
   allRequestedOwnerProfiles:count,sourceFeasible:0,sourceNotRealizable:0,
   sourceExactFirstHeads:0,sourceFixedProfileUniqueHead:0,sourceFixedProfileMultipleHeads:0,
   sourceDirectNonterminalBatchedQ:0,sourceOneOwnerFirstWin:0,
   sourceDualFirstWinRaceIncomplete:0,sourceFullBoardDraw:0,
   sourcePhysicalFeasibilityMismatches:0,sourcePhysicalHeadMismatches:0,
   sourcePhysicalFirstWinnerMismatches:0,sourcePhysicalBatchQMismatches:0,
   firstDualSourceIncompleteExample:null};
  for(let mask=0;mask<count;mask++){
   let pos=0;
   const colors=dims.map(length=>{
    const v=[];for(let i=0;i<length;i++)v.push((mask>>(pos++))&1);
    return v;
   });
   const profile=chains.map((ch,i)=>({column:ch.column,owners:colors[i]}));
   const signature=colors.map(a=>a.join('')).join('|');
   const observed=fiber.get(signature),heads=observed?[...observed.heads].sort((a,b)=>a-b):[];
   const output=source.compute(rt.q,{chains:profile});
   const feasible=output.sourceFixedOwnerProfileFeasible===true;
   if(feasible!==Boolean(observed)){
    stats.sourcePhysicalFeasibilityMismatches++;
    throw Error('MIXED-RADIX ORIGINAL PHYSICAL FIXED-OWNER FEASIBILITY CONTRADICTION '+JSON.stringify({history,profile,expected:Boolean(observed),actual:output.status}));
   }
   if(JSON.stringify(output.exactFixedProfileFirstHeadColumns)!==JSON.stringify(heads)){
    stats.sourcePhysicalHeadMismatches++;
    throw Error('MIXED-RADIX ALL CAUSAL FIRST HEADS PHYSICAL CONTRADICTION '+JSON.stringify({history,profile,heads,actual:output.exactFixedProfileFirstHeadColumns}));
   }
   if(!feasible){stats.sourceNotRealizable++;continue;}
   stats.sourceFeasible++;stats.sourceExactFirstHeads++;
   if(heads.length===1)stats.sourceFixedProfileUniqueHead++;
   else stats.sourceFixedProfileMultipleHeads++;
   const canonical=output.oneDeterministicallyConstructedLegalGravityWord;
   const physical=physicalWord(rt,canonical,chains);
   if(signature!==physical.key||!observed.heads.has(canonical[0]))
    throw Error('source guaranteed canonical original physical word not valid for same owner profile');
   if(output.status==='SOURCE_FEASIBLE_EXACT_ORIGINAL_NONTERMINAL_BATCH_Q'){
    stats.sourceDirectNonterminalBatchedQ++;
    if(observed.firstWinSet.size!==1||!observed.firstWinSet.has('D'))
     throw Error('source falsely claims fixed profile has no FIRST win');
    if(!qEq(output.exactOneOrientedResultQ,qOf(physical.board,physical.h))){
     stats.sourcePhysicalBatchQMismatches++;
     throw Error('source original R batch versus independent original physical R mismatch');
    }
   }else if(output.status==='SOURCE_FEASIBLE_FIXED_SEGMENT_SINGLE_FIRST_WINNER'){
    stats.sourceOneOwnerFirstWin++;
    if(observed.firstWinSet.size!==1||
       !observed.firstWinSet.has(String(output.sourceFixedSegmentFirstWinner))){
     stats.sourcePhysicalFirstWinnerMismatches++;
     throw Error('source fixed color owner FIRST WINNER wrong physical');
    }
   }else if(output.status==='SOURCE_FEASIBLE_DUAL_ORIGINAL_FIRST_WIN_RACE_INCOMPLETE'){
    stats.sourceDualFirstWinRaceIncomplete++;
    if(stats.firstDualSourceIncompleteExample===null)
     stats.firstDualSourceIncompleteExample={profile,physicalFirstWinnerPossibilities:[...observed.firstWinSet]};
   }else if(output.status==='SOURCE_FEASIBLE_FULL_BOARD_DRAW'){
    stats.sourceFullBoardDraw++;
    if(observed.firstWinSet.size!==1||!observed.firstWinSet.has('D'))
     throw Error('source conditional full DRAW false');
   }else throw Error('unrecognized valid fixed-profile source output '+output.status);
  }
  if(stats.sourceFeasible!==stats.physicalOwnerFiberCount||
    stats.sourceFeasible+stats.sourceNotRealizable!==stats.allRequestedOwnerProfiles)
   throw Error('original 7x6 full owner-profile accounting incomplete');
  return stats;
 }
 return Object.freeze({root,physicalWord,words,verifyCase});
}

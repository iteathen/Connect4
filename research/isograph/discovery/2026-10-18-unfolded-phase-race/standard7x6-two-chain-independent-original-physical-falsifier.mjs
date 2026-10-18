// FROZEN BEFORE control execution: independently implemented ORIGINAL
// physical W7 H6 K4 69-winline gravity/first-win checker. All word and
// target coloring enumeration is ONLY physical FALSIFICATION of a fixed
// two-column per-event owner projection. No perfect-play minimax or game WDL.
import {createOriginalTwoChainPhaseBitset} from './standard7x6-source-two-chain-phase-bitset.mjs';
export function createTwoChainIndependentOriginalPhysicalFalsifier(){
 const W=7,H=6,N=42,cell=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),wins=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,t)=>[c+t*dc,r+t*dr]);
  if(xy.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))
   wins.push(xy.map(([a,b])=>cell(a,b)));
 }
 if(wins.length!==69)throw Error('not original 69 geometry windows');
 const source=createOriginalTwoChainPhaseBitset({width:W,height:H,connect:4});
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function normalize(xs){
  const uniq=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const g of uniq)if(!out.some(k=>(g&k)===k))out.push(g);
  return out;
 }
 function qOf(board,h){
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of wins){
    if(L.some(z=>board[z]===1-p))continue;
    let m=0n;for(const z of L)if(board[z]===-1)m|=bit(z);
    if(m===0n)throw Error('unexpected original player winner in nonterminal board q');
    raw.push(m);
   }
   return normalize(raw);
  });
  return {h:h.slice(),R0:R[0],R1:R[1]};
 }
 function root(history){
  const board=Array(N).fill(-1),h=Array(W).fill(0);
  for(let t=0;t<history.length;t++){
   const c=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('illegal original history');
   const z=cell(c,h[c]++);board[z]=p;
   if(wins.some(L=>L.every(x=>board[x]===p)))
    throw Error('root prefix crosses a FIRST original four-win');
  }
  if(history.length===N)throw Error('no nonterminal original root');
  return {history,board,h,ply:history.length,q:qOf(board,h)};
 }
 function physicalWord(rt,word,Acol,Bcol,A,B){
  const board=rt.board.slice(),h=rt.h.slice(),colorsA=[],colorsB=[];
  let firstWinner=null,firstRelativeTurn=null,usedA=0,usedB=0;
  for(let k=0;k<word.length;k++){
   const c=word[k],p=(rt.ply+k)&1;
   if(c!==Acol&&c!==Bcol)throw Error('word contains other event column');
   if(c===Acol&&usedA>=A||c===Bcol&&usedB>=B)throw Error('wrong fixed event multiset');
   const zero=c-1;
   if(h[zero]===H)throw Error('word violated original gravity');
   const z=cell(zero,h[zero]++);board[z]=p;
   if(c===Acol){usedA++;colorsA.push(p);}else{usedB++;colorsB.push(p);}
   if(firstWinner===null&&wins.some(L=>L.every(e=>board[e]===p))){
    firstWinner=p;firstRelativeTurn=k+1;
   }
  }
  if(usedA!==A||usedB!==B)throw Error('incomplete fixed two-column multiset');
  return {board,h,colorsA,colorsB,firstWinner,firstRelativeTurn,
   key:colorsA.join('')+'|'+colorsB.join('')};
 }
 function exactQsame(a,b){
  return JSON.stringify(a.h)===JSON.stringify(b.h)&&
   a.R0.length===b.R0.length&&a.R1.length===b.R1.length&&
   a.R0.every((z,i)=>z===b.R0[i])&&a.R1.every((z,i)=>z===b.R1[i]);
 }
 function allFixedWords(Acol,Bcol,A,B){
  const out=[],w=[];
  function go(a,b){
   if(a===A&&b===B){out.push(w.slice());return;}
   if(a<A){w.push(Acol);go(a+1,b);w.pop();}
   if(b<B){w.push(Bcol);go(a,b+1);w.pop();}
  }
  go(0,0);return out;
 }
 function verifyCase(history,{columnA,columnB,A,B}){
  const rt=root(history);
  if(columnA===columnB||columnA<1||columnA>W||columnB<1||columnB>W||
    A<1||B<1||rt.h[columnA-1]+A>H||rt.h[columnB-1]+B>H)
   throw Error('illegal static source two-chain test configuration');
  const wordList=allFixedWords(columnA,columnB,A,B),fiber=new Map();
  for(const w of wordList){
   const replay=physicalWord(rt,w,columnA,columnB,A,B),k=replay.key;
   let entry=fiber.get(k);
   if(!entry){entry={count:0,first:new Set(),allTerminal:new Set(),example:w.slice()};fiber.set(k,entry);}
   entry.count++;entry.first.add(w[0]);entry.allTerminal.add(replay.firstWinner===null?'D':String(replay.firstWinner));
  }
  const stats={
   history,ply:rt.ply,originalQResiduals:[rt.q.R0.length,rt.q.R1.length],
   columnA,columnB,A,B,wordCount:wordList.length,physicalOwnerPatternCount:fiber.size,
   binaryOwnerColorProfilesChecked:0,sourceFeasible:0,sourceNotRealizable:0,
   exactSourceFirstHeadMatches:0,sourceUniqueFirstHead:0,
   sourceMultipleFirstHeads:0,sourceInfeasibleEmptyHeadSet:0,
   sourceFeasibleNonterminalQ:0,sourceFeasibleOneFirstWinner:0,
   sourceFeasibleDualFirstWinRaceIncomplete:0,sourceFullBoardDraw:0,
   phaseSourceFalsePositive:0,phaseSourceFalseNegative:0,
   physicalFirstWinnerContradictions:0,sourceBatchedQContradictions:0,
   unexpectedErrors:0,
   firstDualCompletionWitness:null,firstGreedyNegative:null};
  const T=A+B;
  for(let pattern=0;pattern<2**T;pattern++){
   const colors=Array.from({length:T},(_,i)=>(pattern>>i)&1);
   const ownersA=colors.slice(0,A),ownersB=colors.slice(A),key=ownersA.join('')+'|'+ownersB.join('');
   const actual=fiber.get(key),heads=actual?[...actual.first].sort((a,b)=>a-b):[];
   const sourceResult=source.compute(rt.q,{columnA,columnB,ownersA,ownersB});
   stats.binaryOwnerColorProfilesChecked++;
   const expectedFeasible=Boolean(actual);
   const gotFeasible=sourceResult.sourceFixedColorProjectionFeasible===true||
    sourceResult.status.startsWith('SOURCE_FEASIBLE_');
   if(expectedFeasible!==gotFeasible){
    if(gotFeasible)stats.phaseSourceFalsePositive++;
    else stats.phaseSourceFalseNegative++;
    throw Error('source two-column bitset projection feasibility contradiction '+JSON.stringify({history,columnA,columnB,A,B,ownersA,ownersB,heads,status:sourceResult.status}));
   }
   const gotHeads=sourceResult.exactFixedProfileFirstHeadColumns;
   if(JSON.stringify(gotHeads)!==JSON.stringify(heads))
    throw Error('exact two-column causal first-head set mismatch '+JSON.stringify({history,columnA,columnB,ownersA,ownersB,heads,gotHeads}));
   if(!gotFeasible){
    stats.sourceNotRealizable++;stats.sourceInfeasibleEmptyHeadSet++;
    continue;
   }
   stats.sourceFeasible++;stats.exactSourceFirstHeadMatches++;
   if(heads.length===1)stats.sourceUniqueFirstHead++;
   else stats.sourceMultipleFirstHeads++;
   if(!Array.isArray(sourceResult.sourceConstructedOneCanonicalGravityWord))
    throw Error('source did not give a canonical schedule after proving feasible');
   const physicalCanonical=physicalWord(rt,sourceResult.sourceConstructedOneCanonicalGravityWord,
    columnA,columnB,A,B);
   if(physicalCanonical.key!==key)
    throw Error('source canonical word misses prescribed physical owners');
   if(!actual.first.has(sourceResult.sourceConstructedOneCanonicalGravityWord[0]))
    throw Error('source canonical first head was not possible');
   if(sourceResult.status==='SOURCE_FEASIBLE_EXACT_BATCH_NONTERMINAL_Q'){
    stats.sourceFeasibleNonterminalQ++;
    if(actual.allTerminal.size!==1||!actual.allTerminal.has('D'))
     throw Error('source falsely asserted both winners impossible in segment');
    const reconstructed=qOf(physicalCanonical.board,physicalCanonical.h);
    if(!exactQsame(reconstructed,sourceResult.exactOneResultingOrientedQ)){
     stats.sourceBatchedQContradictions++;throw Error('source nonterminal batch q differs from independent original physical antichain');
    }
   }else if(sourceResult.status==='SOURCE_FEASIBLE_FIXED_SEGMENT_SINGLE_FIRST_WINNER'){
    stats.sourceFeasibleOneFirstWinner++;
    if(actual.allTerminal.size!==1||!actual.allTerminal.has(String(sourceResult.fixedSegmentFirstWinner))){
     stats.physicalFirstWinnerContradictions++;
     throw Error('source fixed winner false against original physical earliest first terminal');
    }
   }else if(sourceResult.status==='SOURCE_FEASIBLE_BUT_DUAL_FIRST_WIN_RACE_INCOMPLETE'){
    stats.sourceFeasibleDualFirstWinRaceIncomplete++;
    if(stats.firstDualCompletionWitness===null)
     stats.firstDualCompletionWitness={ownersA,ownersB,observedOriginalFirstWinners:[...actual.allTerminal]};
   }else if(sourceResult.status==='SOURCE_FEASIBLE_FIXED_SEGMENT_FULL_BOARD_DRAW'){
    stats.sourceFullBoardDraw++;
    if(actual.allTerminal.size!==1||!actual.allTerminal.has('D'))
     throw Error('source claimed false first-win-free FULL draw');
   }else throw Error('unrecognized source feasible status '+sourceResult.status);
  }
  if(stats.sourceFeasible!==fiber.size||stats.sourceFeasible+stats.sourceNotRealizable!==2**T)
   throw Error('exhaustive profile accounting incomplete');
  return stats;
 }
 return Object.freeze({root,physicalWord,allFixedWords,verifyCase});
}

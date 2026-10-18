// Independent TRUE W7 H6 K4 physical colored-grid / 69-window observer.
// Tests FROZEN source odd-column barrier theorem, no game-value recursion.
// Enumerates only the 42 given-multiset words as independent theorem FALSIFIER.
// Original first win always stops real histories; intermediate hypothetical
// continuation after terminal is not used to certify a real game.
import {createSourceOddColumnColorBarrier} from './standard7x6-source-odd-column-color-barrier.mjs';
export function createPhysicalOddColumnBarrierValidator(){
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z);
 const windows=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const w=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(w.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))windows.push(w.map(([a,b])=>id(a,b)));
 }
 if(windows.length!==69)throw Error('original geometric winlines expected 69');
 const source=createSourceOddColumnColorBarrier({width:W,height:H,connect:4});
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function minimal(xs){
  const uniq=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const G of uniq)if(!out.some(u=>(G&u)===u))out.push(G);return out;
 }
 function fromHistory(history){
  const board=Array(N).fill(-1),h=Array(W).fill(0),owner=[0n,0n];
  let firstWin=null;
  for(let t=0;t<history.length;t++){
   const c=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]===H)throw Error('bad gravity history');
   const z=id(c,h[c]++);board[z]=p;owner[p]|=bit(z);
   if(windows.some(L=>L.every(x=>board[x]===p))){
    firstWin={ply:t+1,player:p};break;
   }
  }
  if(firstWin)throw Error('prefix is NOT genuinely first-win-stopped nonterminal');
  const R=[0,1].map(p=>{
   const xs=[];
   for(const L of windows){
    if(L.some(x=>board[x]===1-p))continue;
    let mask=0n;
    for(const x of L)if(board[x]===-1)mask|=bit(x);
    if(mask===0n)throw Error('prior WIN missed');
    xs.push(mask);
   }
   return minimal(xs);
  });
  return {board,h,rootPly:history.length,q:{h:h.slice(),R0:R[0],R1:R[1]}};
 }
 function replay(root,segment){
  const b=root.board.slice(),h=root.h.slice(),owners=[0n,0n];
  let firstWin=null;
  for(let i=0;i<segment.length;i++){
   const c=segment[i]-1,p=(root.rootPly+i)&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('bad proposed segment gravity');
   const z=id(c,h[c]++);b[z]=p;owners[p]|=bit(z);
   if(firstWin===null&&windows.some(L=>L.every(x=>b[x]===p)))
    firstWin={segmentPly:i+1,player:p};
  }
  return {board:b,h,owners,firstWin};
 }
 function verify(history,{a,b,c,L}){
  const qroot=fromHistory(history);
  const src=source.prove(qroot.q,{a,b,c,L});
  if(src.status!=='CERTIFIED_TWO_ONLY_SAME_OWNER_SHUFFLES_AND_IDENTICAL_NONTERMINAL_Q')
   return {status:'SOURCE_INCOMPLETE',reason:src.reason||null};
  const u=Array.from(src.firstWordOneBased,Number),v=Array.from(src.secondWordOneBased,Number);
  const U=replay(qroot,u),V=replay(qroot,v);
  if(U.firstWin!==null||V.firstWin!==null||
   U.owners[0]!==V.owners[0]||U.owners[1]!==V.owners[1]||
   JSON.stringify(U.board)!==JSON.stringify(V.board)||
   JSON.stringify(U.h)!==JSON.stringify(V.h))
   throw Error('SOURCE POSITIVE BUT PHYSICAL FIRST WIN OR OWNER/BOARD CONFLICT');
  function masksOf(q){
   const R=[0,1].map(p=>{
    const xs=[];
    for(const L of windows){
     if(L.some(x=>q.board[x]===1-p))continue;
     let mask=0n;for(const x of L)if(q.board[x]===-1)mask|=bit(x);
     if(mask===0n)throw Error('unexpected final first win');
     xs.push(mask);
    }
    return minimal(xs);
   });
   return R.map(x=>x.map(y=>y.toString(16)).join(','));
  }
  const rr0=masksOf(U),rr1=masksOf(V);
  if(JSON.stringify(rr0)!==JSON.stringify(rr1))throw Error('nonidentical source q after source phase-fiber certificate');
  return {status:'ORIGINAL_PHYSICAL_GUARDED_TRACE_PASS',
   history,columns:{a,b,c},L,words:[u.join(''),v.join('')],
   originalSourceRootRCounts:[qroot.q.R0.length,qroot.q.R1.length],
   orientedAfterResidualCounts:rr0.map(s=>s?s.split(',').length:0),
   samePhysicalBoard:true,noFirstWinInEitherSegment:true};
 }
 function enumerateEmptySevenWordFiber(){
  const root=fromHistory('');
  const src=source.prove(root.q,{a:1,b:2,c:4,L:5});
  if(src.status!=='CERTIFIED_TWO_ONLY_SAME_OWNER_SHUFFLES_AND_IDENTICAL_NONTERMINAL_Q')
   throw Error('source canonical empty-board segment failed');
  const base=replay(root,Array.from(src.firstWordOneBased,Number));
  const matches=[],all=[];
  for(let i=0;i<7;i++)for(let j=0;j<7;j++){
   if(i===j)continue;
   const seq=Array(7).fill(4);seq[i]=1;seq[j]=2;
   const out=replay(root,seq);
   all.push(seq.join(''));
   if(out.owners[0]===base.owners[0]&&out.owners[1]===base.owners[1])
    matches.push(seq.join(''));
  }
  matches.sort();
  const expected=['1444442','2444441'];
  if(all.length!==42||JSON.stringify(matches)!==JSON.stringify(expected))
   throw Error('FIBER CARDINALITY OR MEMBERSHIP PHYSICAL FALSE');
  const originalGreedyRealization=replay(root,[2,2,1]);
  const misleadingGreedy=replay(root,[1,2,2]);
  if(originalGreedyRealization.firstWin!==null||misleadingGreedy.firstWin!==null)
   throw Error('early terminal unexpectedly obscured greedy counterexample');
  if(originalGreedyRealization.owners[0]===misleadingGreedy.owners[0]&&
    originalGreedyRealization.owners[1]===misleadingGreedy.owners[1])
   throw Error('wrong identical owner coloring in greedy negative');
  const traceVerified=verify('',{a:1,b:2,c:4,L:5});
  if(traceVerified.status!=='ORIGINAL_PHYSICAL_GUARDED_TRACE_PASS')
   throw Error('the actual two words have no guaranteed nonterminal q equality');
  return {status:'PHYSICAL_7X6_FIBER_TWO_AND_GREEDY_NEGATIVE_VERIFIED',
   board:'original7x6x4',originalWinlines:69,
   originalRootSourceR:[root.q.R0.length,root.q.R1.length],
   sevenEventDifferentGravityLegalWordsEnumeratedByValidator:all.length,
   exactlySameEventOwnerMaskWords:matches,
   sourcePredictedExactlyTwo:true,
   minimumContiguousWindowNeededToConnectSelectedColoredTraceWords:7,
   bothOriginalWordSevenPlyNonterminal:true,
   afterOriginalResidualCounts:traceVerified.orientedAfterResidualCounts,
   greedyValidRealization:'221',
   greedyUnrealizableHeadChoiceFollowedByIllegalToTargetColoring:'122',
   greedyWordsBothOrdinaryPhysicallyLegal:true,
   greedyColorAllocationDifferent:true,
   sourceGameValuesQueried:0,actualRootWDL:'UNKNOWN',bestLevel2OriginalColumn:'INCOMPLETE'};
 }
 return Object.freeze({fromHistory,verify,enumerateEmptySevenWordFiber});
}

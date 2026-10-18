// FROZEN before execution: independently authored ORIGINAL 7x6 K4
// 69 geometric winning-line colored physical grid, strict gravity and
// FIRST WIN stopping, for one-event source projected causal playable-pair
// graph cofactor. Full physical q after move is produced ONLY here, as
// falsification. SOURCE has no game q successors or WDL queries.
import {createOriginalRoleCofactorPlayablePairGraph} from './standard7x6-source-role-cofactor-playable-pair-graph.mjs';
export function runOriginalRoleCofactorPairGraphPhysicalControl({
 seed=20261018,maxNonwinningHistories=420,maxObservedNonterminalRoots=950
}={}){
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z),lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,k)=>[c+k*dc,r+k*dr]);
  if(xy.every(([x,y])=>x>=0&&x<7&&y>=0&&y<6))
   lines.push(xy.map(([x,y])=>id(x,y)));
 }
 if(lines.length!==69)throw Error('not original 69 geometric Connect4 lines');
 const source=createOriginalRoleCofactorPlayablePairGraph({width:7,height:6,connect:4});
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const normalize=xs=>{
  const uniq=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of uniq)if(!out.some(U=>(G&U)===U))out.push(G);
  return out;
 };
 const init=()=>({board:Array(N).fill(-1),h:Array(W).fill(0),n:0,terminal:null});
 const clone=q=>({board:q.board.slice(),h:q.h.slice(),n:q.n,terminal:q.terminal});
 function move(q,cOne){
  const c=cOne-1,p=q.n&1,row=q.h[c];
  if(q.terminal||!Number.isInteger(c)||c<0||c>=W||row>=H)
   throw Error('illegal original physical first-win-stopped move');
  const z=id(c,row);q.board[z]=p;q.h[c]++;q.n++;
  if(lines.some(L=>L.every(e=>q.board[e]===p)))q.terminal={kind:'WIN',p};
  else if(q.n===N)q.terminal={kind:'DRAW'};
  return {p,c:cOne,row:row+1,terminal:q.terminal};
 }
 function sourceFromPhysical(q){
  if(q.terminal)throw Error('source q must be nonterminal');
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(z=>q.board[z]===1-p))continue;
    let m=0n;for(const z of L)if(q.board[z]===-1)m|=bit(z);
    if(m===0n)throw Error('original first winner improperly missed');
    raw.push(m);
   }
   return normalize(raw);
  });
  return {h:q.h.slice(),R0:R[0],R1:R[1]};
 }
 function replay(history){
  const q=init();
  for(const ch of history){move(q,Number(ch));
   if(q.terminal)throw Error('fixed input physical history crossed first terminal before root');}
  return q;
 }
 function physicalGraph(q,p){
  const R=sourceFromPhysical(q)[p===0?'R0':'R1'],frontier=new Map();
  for(let c=0;c<W;c++)if(q.h[c]<H)frontier.set(id(c,q.h[c]),c+1);
  const edges=[],sings=[];
  for(const G of R){
   const cells=[];
   for(let z=0;z<N;z++)if(G&bit(z))cells.push(z);
   if(cells.length===1&&frontier.has(cells[0]))sings.push(frontier.get(cells[0]));
   if(cells.length!==2||!cells.every(z=>frontier.has(z)))continue;
   const label=cells.map(z=>frontier.get(z)).sort((a,b)=>a-b);
   if(label[0]===label[1])throw Error('two available frontier cells same original column');
   edges.push(label);
  }
  edges.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  return {edges,singles:[...new Set(sings)].sort((a,b)=>a-b)};
 }
 const stat={seed,maxNonwinningHistories,maxObservedNonterminalRoots,
  originalK4WinningLines:69,
  physicallyObservedNonterminalOriginalRootPositions:0,
  physicallyTestedCurrentLegalOneMoveActions:0,
  sourceTerminalFirstWinCorrect:0,sourceTerminalDrawCorrect:0,
  originalBothOwnersProjectedPlayablePairGraphsVerified:0,
  originalBothOwnersProjectedFrontierSingletonsVerified:0,
  sourceRoleMoveRemoteAttackerGraphBirthsObserved:0,
  sourceOpponentMoveRemoteGraphBirthsCounterexamples:0,
  physicallyDetectedSourceGraphMismatch:0,
  physicallyDetectedSourceTerminalMismatch:0,
  seededNonwinningOriginalHistoriesGenerated:0,
  sourceFutureGameWDLQueries:0,physicalPerfectPlayMinimaxQueries:0};
 const remoteExamples=[],fixedCaseEvidence=[];
 function verify(q,originalHistory){
  if(q.terminal)throw Error('tester tried to check terminal source');
  stat.physicallyObservedNonterminalOriginalRootPositions++;
  const sourceQ=sourceFromPhysical(q),legal=q.h.flatMap((r,c)=>r<H?[c+1]:[]);
  for(const action of legal){
   const src=source.compute(sourceQ,action),after=clone(q);
   const played=move(after,action);
   stat.physicallyTestedCurrentLegalOneMoveActions++;
   if(played.terminal){
    const wanted=played.terminal.kind==='DRAW'?
      'ORIGINAL_MOVE_TERMINAL_FULL_BOARD_DRAW_NO_POST_MOVE_GRAPH':
      'ORIGINAL_MOVE_TERMINAL_FIRST_WIN_NO_POST_MOVE_GRAPH';
    if(src.status!==wanted){
     stat.physicallyDetectedSourceTerminalMismatch++;
     throw Error('source terminal mismatch '+JSON.stringify({history:originalHistory,action,sourceStatus:src.status,physical:played.terminal}));
    }
    if(played.terminal.kind==='DRAW')stat.sourceTerminalDrawCorrect++;
    else stat.sourceTerminalFirstWinCorrect++;
    continue;
   }
   if(src.status!=='SOURCE_EXACT_ONE_SUPPLIED_MOVE_NONTERMINAL_ROLE_COFATOR_PLAYABLE_PAIR_GRAPH')
    throw Error('nonterminal physical grid but source did not produce projected graph');
   for(const p of [0,1]){
    const real=physicalGraph(after,p),graph=src.sourceOriginalFuturePairGraphsByOwner[p];
    const edges=graph.originalPlayablePairGraphEdgesAfter.map(e=>e.originalFrontierColumns),
      singles=graph.originalCurrentlyPlayableOneCellWinRequirementsAfter;
    stat.originalBothOwnersProjectedPlayablePairGraphsVerified++;
    stat.originalBothOwnersProjectedFrontierSingletonsVerified++;
    if(JSON.stringify(real.edges)!==JSON.stringify(edges)||
       JSON.stringify(real.singles)!==JSON.stringify(singles)){
     stat.physicallyDetectedSourceGraphMismatch++;
     throw Error('original colored physical projected winning pair/singleton graph mismatch '+JSON.stringify({history:originalHistory,action,p,real,sourceEdges:edges,sourceSingles:singles}));
    }
    const before=physicalGraph(q,p).edges.map(x=>x.join(',')),
      remote=real.edges.filter(x=>!x.includes(action)&&!before.includes(x.join(',')));
    const srcRemote=graph.originalPlayableTwoCellGraphRemoteEdgeBirths
      .map(e=>e.originalFrontierColumns);
    if(JSON.stringify(remote)!==JSON.stringify(srcRemote))
     throw Error('source remote graph birth count different independent physical');
    if(p!==(q.n&1)&&remote.length){
     stat.sourceOpponentMoveRemoteGraphBirthsCounterexamples++;
     throw Error('opponent move remotely created NEW two-cell attacker requirement');
    }
    if(p===(q.n&1)&&remote.length){
     stat.sourceRoleMoveRemoteAttackerGraphBirthsObserved+=remote.length;
     if(remoteExamples.length<10)remoteExamples.push({history:originalHistory,
       originalRootPly:q.n,mover:p,action,
       remotelyBornOriginalPlayablePairs:remote,
       originalOldGraphEdges:before,
       originalPhysicalNewGraphEdges:real.edges});
    }
   }
  }
 }
 const fixed=['','44444','4444441','4444442','4444443','4444445','4444446','4444447',
   '2532541156412471331416356736376672','227265274113625631757767341443443'];
 for(const history of fixed){
  const q=replay(history),start=stat.physicallyTestedCurrentLegalOneMoveActions;
  verify(q,history);
  fixedCaseEvidence.push({history,ply:q.n,originalLegalActions:q.h.filter(z=>z<H).length,
   afterPhysicalMoveChecks:stat.physicallyTestedCurrentLegalOneMoveActions-start});
 }
 let state=seed>>>0;
 function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
 for(let g=0;g<maxNonwinningHistories&&stat.physicallyObservedNonterminalOriginalRootPositions<maxObservedNonterminalRoots;g++){
  const q=init();let history='';
  for(let t=0;t<N&&stat.physicallyObservedNonterminalOriginalRootPositions<maxObservedNonterminalRoots;t++){
   if(t>=8&&(t%4===0||t>=34))verify(q,history);
   const safe=[];
   for(let c=1;c<=W;c++)if(q.h[c-1]<H){
    const test=clone(q),mv=move(test,c);
    if(!mv.terminal)safe.push(c);
   }
   if(!safe.length)break;
   const c=safe[rand()%safe.length];move(q,c);history+=String(c);
  }
  stat.seededNonwinningOriginalHistoriesGenerated++;
 }
 if(stat.physicallyDetectedSourceGraphMismatch||
   stat.physicallyDetectedSourceTerminalMismatch||
   stat.sourceOpponentMoveRemoteGraphBirthsCounterexamples)
  throw Error('incorrect original source graph update');
 return {schema:'connect4.original7x6.role_one_move_pair_graph_cofactor_v0_1',
  date:'2026-10-18',
  status:'SOURCE_EXACT_ROLE_DEPENDENT_ONE_EVENT_GRAPH_COFATOR_VERIFIED_AGAINST_ORIGINAL_69_LINE_PHYSICAL',
  theorem:'docs/research/2026-10-18-original-winning-pair-fork-graph-role-dependent-one-event-cofactor.md',
  results:stat,fixedOriginalRootCases:fixedCaseEvidence,
  firstConfirmedAttackerMoveRemoteGraphBirths:remoteExamples,
  noSourceOrPhysicalUnrestrictedPerfectPlayGameWDLCalculated:true,
  current44444RootBestMoveStill:'INCOMPLETE'};
}

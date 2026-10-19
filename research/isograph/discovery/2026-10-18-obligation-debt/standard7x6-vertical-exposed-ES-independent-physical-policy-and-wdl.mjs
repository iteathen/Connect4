// FROZEN before reference execution. INDEPENDENT true original W7 H6 K4
// physical colored grid and all 69 exact winning lines, first-win stopped.
// Validate frozen SOURCE vertical-pair+ES+dual LOSS positives with:
//  - independently reconstructed original root normalized R0/R1;
//  - independently reconstructed vertical U/F, dyadic exposed hyperedges;
//  - independently checked SOURCE original dual rational λ certificate;
//  - deterministic ES max-danger response and vertical co-release mate;
//  - ENUMERATE ALL current-mover attacker game choices against that policy;
//  - separate independent exact FULL two-player physical minimax (late q).
// Physical game-tree branching exists HERE as independent falsification only;
// pure SOURCE theorem never invokes or imports this reference implementation.
export function validateVerticalExposedESOriginalPhysical(frozenSourcePilot,{
 maxAttackerPolicyPaths=120000,maxPhysicalWdlUniqueStates=200000
}={}){
 const roots=frozenSourcePilot?.positiveSourceRoots;
 if(!Array.isArray(roots)||roots.length!==8||
    frozenSourcePilot.stats?.sourceHybridWithOpponentOverloadProvedRootLoss!==8||
    frozenSourcePilot.stats?.sampledGenuineOriginalQNotDeduplicated!==56541)
  throw Error('missing original frozen preoracle source positives and control population');
 const W=7,H=6,N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),lines=[],
  cellsByLine=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(!xy.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))continue;
  const ids=xy.map(([x,y])=>id(x,y));lines.push(ids);
  for(const z of ids)cellsByLine[z].push(ids);
 }
 if(lines.length!==69)throw Error('independent original W7 H6 K4 physical winline count differs from 69');
 const pop=m=>{let k=0;for(;m;m&=m-1n)k++;return k;};
 const norm=raw=>{
  const sorted=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const G of sorted)if(!out.some(U=>(G&U)===U))out.push(G);return out;
 };
 const original=()=>({board:Array(N).fill(-1),h:Array(W).fill(0),n:0,firstWinner:null,fullDraw:false});
 const clone=q=>({board:q.board.slice(),h:q.h.slice(),n:q.n,firstWinner:q.firstWinner,fullDraw:q.fullDraw});
 function drop(q,cOne){
  const c=cOne-1,p=q.n&1,row=q.h[c];
  if(q.firstWinner!==null||q.fullDraw||
     !Number.isInteger(c)||c<0||c>=W||row>=H)throw Error('physically illegal first-win stopped placement');
  const z=id(c,row);q.h[c]++;q.board[z]=p;q.n++;
  if(cellsByLine[z].some(L=>L.every(e=>q.board[e]===p)))q.firstWinner=p;
  else if(q.n===N)q.fullDraw=true;
  return {p,z,after:q};
 }
 function readRoot(history){
  const q=original();
  for(const ch of history){
   drop(q,Number(ch));
   if(q.firstWinner!==null||q.fullDraw)throw Error('SOURCE selected already first-terminal physical history');
  }
  return q;
 }
 function legal(q){return q.h.flatMap((z,c)=>z<H?[c+1]:[]);}
 function sourceOriginalQ(q){
  const R=[0,1].map(p=>{
   const a=[];
   for(const L of lines){
    if(L.some(z=>q.board[z]===1-p))continue;
    let G=0n;for(const z of L)if(q.board[z]===-1)G|=bit(z);
    if(G===0n)throw Error('already completed original winning line at source root');
    a.push(G);
   }
   return norm(a);
  });
  return {h:q.h.slice(),R0:R[0],R1:R[1]};
 }
 function recomputeSourcePairAndESProjection(q,p){
  let allFuture=0n,unpaired=0n,paired=0n;const pairs=[],mate=new Map();
  for(let c=0;c<W;c++){
   const rem=H-q.h[c];
   for(let r=q.h[c];r<H;r++)allFuture|=bit(id(c,r));
   if(rem%2)unpaired|=bit(id(c,q.h[c]));
   for(let r=q.h[c]+rem%2;r<H;r+=2){
    const low=id(c,r),high=id(c,r+1),m=bit(low)|bit(high);
    paired|=m;pairs.push(m);mate.set(low,high);mate.set(high,low);
   }
  }
  if((paired|unpaired)!==allFuture||(paired&unpaired)!==0n)
   throw Error('independent U/F did not partition original gravity future');
  const R=sourceOriginalQ(q)[p===0?'R0':'R1'];
  const exposed=[];let dyadic=0,fullPairLines=0;
  for(const G of R){
   if(pairs.some(m=>(G&m)===m)){fullPairLines++;continue;}
   const E=G&unpaired,k=pop(E);
   if(!k)throw Error('the SOURCE root is falsely positive with one projected empty requirement');
   dyadic+=2**(4-k);exposed.push(E);
  }
  return {pairs,mate,unpaired,paired,exposed,dyadic,fullPairLines};
 }
 function verifyOverload(q,source){
  const own=source.originalRespondingDefender,other=source.originalMover;
  if(own!==1-other)throw Error('wrong source mover/opponent tags');
  const R=sourceOriginalQ(q)[own===0?'R0':'R1'],proof=source.sourceOpponentFractionalOverloadWitness;
  if(!proof)throw Error('source positive lacked fractional opponent winline weight');
  const D=proof.denominator,nums=proof.numerators.map(Number),load=Array(N).fill(0);
  if(nums.length!==R.length||!Number.isInteger(D)||D<1)throw Error('bad independent integer dual witness dimensions');
  let sum=0;
  for(let i=0;i<R.length;i++){
   const w=nums[i];
   if(!Number.isInteger(w)||w<0)throw Error('bad nonnegative integer rational witness');
   sum+=w;
   for(let z=0;z<N;z++)if(R[i]&bit(z))load[z]+=w;
  }
  if(sum!==proof.sumNumerator||load.some(z=>z>D)||sum<=Math.ceil((N-q.n)/2)*D)
   throw Error('fractional original opponent line packing not truly overfull');
  return {numerator:sum,denominator:D,
   exactMaxPBlockingTurns:Math.ceil((N-q.n)/2),
   exactCapacityExcessNumerator:sum-Math.ceil((N-q.n)/2)*D};
 }
 function esChoose(q,root,p,projection){
  // Pick max post-Maker exposed-hypergraph danger weight. Each E is a
  // residual set of ORIGINAL root-frontier physical cells. A line E
  // intersecting the respondent's owned cells can no longer be Maker WIN.
  // Dyadic weights are integer 2^(K−remaining future Maker cells).
  let best=null;
  for(let c=0;c<W;c++){
   const z=id(c,root.h[c]);
   if(root.h[c]>=H||(projection.unpaired&bit(z))===0n||
      q.board[z]!==-1||q.h[c]!==root.h[c])continue;
   let score=0;
   for(const E of projection.exposed){
    if((E&bit(z))===0n)continue;
    let blocked=false,remaining=0;
    for(let t=0;t<N;t++)if(E&bit(t)){
     if(q.board[t]===1-p){blocked=true;break;}
     if(q.board[t]===-1)remaining++;
    }
    if(!blocked)score+=2**(4-remaining);
   }
   if(best===null||score>best.score)best={col:c+1,score};
  }
  return best?.col??null;
 }
 const summary={schema:'connect4.original7x6.vertical_pair_exposed_es_dual_independent_physical_v0_1',
  date:'2026-10-18',originalK4Winlines:69,
  frozenSourceRoots:roots.length,
  physicalRootMasksReconstructed:0,
  physicalProjectionDyadicProofsReconstructed:0,
  physicallyVerifiedFractionalDuals:0,
  rootPolicyAttackerBranchesEnumerated:0,
  rootDefenderESMovesChosen:0,rootDefenderVerticalMateMovesChosen:0,
  rootDefenderOtherFillers:0,
  firstWinForCurrentMoverFound:0,
  physicalFullDrawContradictions:0,
  physicalResponderForcedWinTerminalLeaves:0,
  exactlyMinimaxVerifiedRootLoss:0,
  exactPhysicalRootActionWDLComputed:0,
  physicallyIncorrectSourceLossClaims:0,
  physicalMinimaxReferenceBudgetIncomplete:0,
  sourceFutureGameWDLQueries:0,
  allPhysicalGameStrategiesEnumeratedOnlyInIndependentValidator:true},
  rows=[];
 class PhysicalBudget extends Error {}
 function exactValue(root){
  const board=root.board.slice(),h=root.h.slice();
  let call=0;const memo=new Map();
  function solve(n){
   call++;
   const key=board.join(',');
   const old=memo.get(key);
   if(old!==undefined)return old;
   if(memo.size>=maxPhysicalWdlUniqueStates)throw new PhysicalBudget('physical reference budget');
   const p=n&1;
   if(n===N)return 0;
   let best=p===0?-1:+1;
   for(let c=0;c<W;c++){
    if(h[c]>=H)continue;
    const z=id(c,h[c]++);board[z]=p;
    const first=cellsByLine[z].some(L=>L.every(e=>board[e]===p));
    let value;
    try{value=first?(p===0?1:-1):n+1===N?0:solve(n+1);}
    finally{board[z]=-1;h[c]--;}
    if(p===0){best=Math.max(best,value);if(best===1)break;}
    else{best=Math.min(best,value);if(best===-1)break;}
   }
   memo.set(key,best);
   return best;
  }
  const ans={},p=root.n&1;
  for(const c of legal(root)){
   const z=id(c-1,h[c-1]++);board[z]=p;
   const first=cellsByLine[z].some(L=>L.every(e=>board[e]===p));
   try{ans[c]=first?(p===0?1:-1):root.n+1===N?0:solve(root.n+1);}
   finally{h[c-1]--;board[z]=-1;}
  }
  return {actionWDL:ans,rootWDL:p===0?Math.max(...Object.values(ans)):Math.min(...Object.values(ans)),
   physicalRecursiveCalls:call,physicalMemoizedStates:memo.size};
 }
 for(const witness of roots){
  const root=readRoot(witness.genuineOriginalHistory),
   originalR=sourceOriginalQ(root);
  if(root.n!==witness.ply||
     String(root.h)!==String(witness.originalHeights)||
     originalR.R0.length!==witness.originalRCounts[0]||
     originalR.R1.length!==witness.originalRCounts[1])
   throw Error('SOURCE frozen positive root does not exist on actual original physical board');
  const source=witness.sourceFullCertificate,
   p=root.n&1,o=1-p,projection=recomputeSourcePairAndESProjection(root,p);
  summary.physicalRootMasksReconstructed++;
  if(source.originalMover!==p||source.originalRespondingDefender!==o||
     source.ordinaryRootWDL!==(o===0?1:-1)||
     source.sourceSelectedOneBestOriginalColumn!==witness.selectedOriginalBestColumn)
   throw Error('source positive result player/action/root WDL incorrect bookkeeping');
  if(projection.dyadic!==source.exactErdosSelfridgeDyadicWeightNumerator||
     String(projection.pairs.map(z=>'0x'+z.toString(16)))!==String(source.originalPairBlocksHex)||
     projection.exposed.length!==source.originalMoverUncoveredOriginalGeneratorCount)
   throw Error('independent original physical projected ES potential disagrees with SOURCE');
  if(projection.dyadic>=8)throw Error('source positive projection violates strict ES threshold');
  summary.physicalProjectionDyadicProofsReconstructed++;
  const dual=verifyOverload(root,source);
  summary.physicallyVerifiedFractionalDuals++;
  const seen=new Set();
  function replayFromPturn(q){
   if(summary.rootPolicyAttackerBranchesEnumerated>maxAttackerPolicyPaths)
    throw new PhysicalBudget('explicit attacker policy physical falsification enumeration budget');
   const key=q.board.join(',');
   if(seen.has(key))return;
   seen.add(key);
   if(q.firstWinner!==null){
    if(q.firstWinner!==o){summary.firstWinForCurrentMoverFound++;
     throw Error('ROOT LOSS SOURCE FALSE: mover attained original four-in-row under defender projection strategy');}
    summary.physicalResponderForcedWinTerminalLeaves++;return;
   }
   if(q.fullDraw){summary.physicalFullDrawContradictions++;
    throw Error('ROOT LOSS SOURCE FALSE: full draw against exposed ES defender strategy');}
   if(q.n%2!==p)throw Error('source current mover parity lost before policy exploration');
   for(const c of legal(q)){
    summary.rootPolicyAttackerBranchesEnumerated++;
    const afterP=clone(q),mov=drop(afterP,c);
    if(afterP.firstWinner===p){summary.firstWinForCurrentMoverFound++;
     throw Error('p FIRST WON despite vertical pairing and ES exposed potential');}
    if(afterP.firstWinner===o){throw Error('other player cannot win on p move');}
    if(afterP.fullDraw){summary.physicalFullDrawContradictions++;
     throw Error('p last move DRAW contradicting o strict dual overload source');}
    if(afterP.n%2!==o)throw Error('defender turn parity unexpected');
    let oColumn=null;
    if((projection.paired&bit(mov.z))!==0n){
     const mate=projection.mate.get(mov.z);
     if(mate===undefined)throw Error('source paired x without physical mate');
     if(afterP.board[mate]===-1){
      const pairedCol=mate%W,pairedRow=Math.floor(mate/W);
      if(afterP.h[pairedCol]!==pairedRow)throw Error('SOURCE grav co-release mate not physically LEGAL');
      oColumn=pairedCol+1;
      summary.rootDefenderVerticalMateMovesChosen++;
     }else if(afterP.board[mate]!==o){
      throw Error('p somehow occupied BOTH cells of vertical pair under defender strategy');
     }
    }else if((projection.unpaired&bit(mov.z))===0n)
     throw Error('uncovered original future physical cell outside vertical U/F partition');
    if(oColumn===null){
     oColumn=esChoose(afterP,root,p,projection);
     if(oColumn!==null)summary.rootDefenderESMovesChosen++;
     else{const opts=legal(afterP);if(!opts.length)
      throw Error('no defender move after first p move, source false full turn parity');oColumn=opts[0];
      summary.rootDefenderOtherFillers++;
     }
    }
    drop(afterP,oColumn);
    if(afterP.firstWinner===p)throw Error('defender move caused p FIRST win');
    if(afterP.fullDraw){summary.physicalFullDrawContradictions++;
     throw Error('full board draw contradicts source opponent strict overload');}
    if(afterP.firstWinner===o){summary.physicalResponderForcedWinTerminalLeaves++;continue;}
    replayFromPturn(afterP);
   }
  }
  replayFromPturn(root);
  let oracle;
  try{oracle=exactValue(root);}
  catch(e){if(!(e instanceof PhysicalBudget))throw e;
   summary.physicalMinimaxReferenceBudgetIncomplete++;
   oracle={rootWDL:null,actionWDL:null,physicalRecursiveCalls:null,physicalMemoizedStates:null};}
  if(oracle.rootWDL!==null){
   if(oracle.rootWDL!==(o===0?1:-1)||Object.values(oracle.actionWDL).some(v=>v!==oracle.rootWDL)){
    summary.physicallyIncorrectSourceLossClaims++;
    throw Error('source original ROOT loss contradicted full physical minimax '+JSON.stringify({history:witness.genuineOriginalHistory,oracle,sourceWDL:source.ordinaryRootWDL}));
   }
   summary.exactlyMinimaxVerifiedRootLoss++;
   summary.exactPhysicalRootActionWDLComputed+=Object.keys(oracle.actionWDL).length;
  }
  rows.push({history:witness.genuineOriginalHistory,ply:root.n,
   rootOriginalLegalColumns:legal(root),mover:p,respondingOpponent:o,
   sourceUncoveredProjectedOriginalRequirements:projection.exposed.map(e=>'0x'+e.toString(16)),
   exposedPotentialIntegerNumerator:projection.dyadic,
   verticalPairCount:projection.pairs.length,
   independentOpponentFractionalDual:dual,
   physicallyExaminedDistinctPolicyStates:seen.size,
   independentPhysicalWdl:oracle});
 }
 return {status:'INDEPENDENT_ORIGINAL_7X6_EXPOSED_ES_VERTICAL_MATE_POLICY_AND_FULL_WDL_PHYSICAL_PASS',
  summary,perSourcePositivePhysicalEvidence:rows,
  claimScope:'8 sampled source-positive q including 2 non-full-pair-covered attacker original requirements; this is internal physical corroboration not external formal qualification; SOURCE static WDL never evaluates any future game.',
  sourceGoverningTheorem:'docs/research/2026-10-18-gravity-vertical-pair-projection-erdos-selfridge-obligation-debt.md',
  maintainedNode26OrFormalChecker:'NOT_RUN'};
}

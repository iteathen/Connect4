// FROZEN BEFORE independent actual physical WDL execution.
// TRUE original W7 H6 K4 colored grid with ALL 69 physical 4-lines,
// gravity and FIRST-WIN STOP, independent of the source certificate engine.
// Input is four already PREORACLE FROZEN original q masks/histories,
// class A/B/C support-mirror+ES witnesses and original fractional packing λ.
// 1) independently check every certificate field with actual original cells,
// 2) enumerate EVERY attacker move against one fixed dynamic responder
//    (mate U paired upper when attacked lower, else max-danger exposed F),
// 3) independently compute unrestricted physical WDL of EVERY root legal
//    first move, only as post-freeze falsification. No game WDL in SOURCE.
export function verifyFourSupportMirrorLossPhysical(frozen,{
 maxPolicyVisitedStatesPerRoot=250000,
 maxPhysicalMinimaxUniqueStatesPerRoot=250000}={}){
 if(frozen?.inputsAndProofs?.length!==4||
    String(frozen.inputsAndProofs.map(x=>x.originalSelectedOrdinal))!=='1,7,12,13'||
    frozen.inputsAndProofs.some(x=>x.sourcePredictedAllCurrentMoverActionsLose!==true))
  throw Error('requires exactly four PRE-FROZEN original source positive q fingerprints');
 const W=7,H=6,N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),
  lines=[],incident=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
   const xy=Array.from({length:4},(_,j)=>[c+j*dx,r+j*dy]);
   if(xy.some(([x,y])=>x<0||x>=W||y<0||y>=H))continue;
   const z=xy.map(([x,y])=>id(x,y));lines.push(z);
   for(const t of z)incident[t].push(z);
  }
 if(lines.length!==69)throw Error('not ORIGINAL standard7x6 69 physical winlines');
 const pop=m=>{let k=0;for(;m;m&=m-1n)k++;return k;};
 const norm=xs=>{
  const uniq=[...new Set(xs)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of uniq)if(!out.some(T=>(G&T)===T))out.push(G);
  return out;
 };
 function blank(){return {h:Array(W).fill(0),board:Array(N).fill(-1),masks:[0n,0n],n:0,winner:null,draw:false};}
 function copy(q){return {h:q.h.slice(),board:q.board.slice(),masks:q.masks.slice(),
   n:q.n,winner:q.winner,draw:q.draw};}
 function legal(q){return q.h.flatMap((r,c)=>r<H?[c+1]:[]);}
 function place(q,cOne){
  const c=cOne-1,p=q.n&1,r=q.h[c];
  if(q.winner!==null||q.draw||!Number.isInteger(c)||c<0||c>=W||r>=H)
   throw Error('illegal original first-win-stopped physical placement');
  const z=id(c,r),mark=bit(z);
  if(q.board[z]!==-1)throw Error('gravity physical collision');
  q.board[z]=p;q.h[c]++;q.masks[p]|=mark;q.n++;
  if(incident[z].some(L=>L.every(x=>q.board[x]===p)))q.winner=p;
  else if(q.n===N)q.draw=true;
  return {p,physicalID:z,firstWinner:q.winner,draw:q.draw};
 }
 function root(history){
  const q=blank();for(const s of history){
   place(q,Number(s));if(q.winner!==null||q.draw)
    throw Error('frozen original selected source root crossed FIRST WIN before root');
  }
  return q;
 }
 function originalR(q){
  if(q.winner!==null||q.draw)throw Error('terminal board has no nonterminal q');
  return [0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(z=>q.board[z]===1-p))continue;
    let G=0n;for(const z of L)if(q.board[z]===-1)G|=bit(z);
    if(G===0n)throw Error('original root already has winning physical line');
    raw.push(G);
   }
   return norm(raw);
  });
 }
 function independentPartition(q,p,R){
  const mate=new Map(),pairMasks=[],rawPairMembers=[],F=new Set();
  let U=0n,Fmask=0n;
  for(let c=0;c<W;c++){
   const remaining=H-q.h[c],offset=remaining&1;
   if(offset){const z=id(c,q.h[c]);F.add(z);Fmask|=bit(z);}
   for(let r=q.h[c]+offset;r<H;r+=2){
    const low=id(c,r),up=id(c,r+1),mask=bit(low)|bit(up);
    if(r+1>=H)throw Error('independent pair exceeds physical column');
    mate.set(low,up);mate.set(up,low);
    U|=mask;pairMasks.push(mask);rawPairMembers.push([low,up]);
   }
  }
  const part={A:[],B:[],C:[],U,F,Fmask,mate,pairMasks,rawPairMembers};
  const opponent=1-p,Rp=R[p],Ro=R[opponent];
  for(let i=0;i<Rp.length;i++){
   const G=Rp[i];
   const idx=pairMasks.findIndex(P=>(G&P)===P);
   if(idx>=0){part.A.push({i,idx});continue;}
   let lower=0n;
   for(const [low,up] of rawPairMembers)if(G&bit(up))lower|=bit(low);
   const j=Ro.findIndex(Hreq=>(Hreq&lower)===Hreq);
   if(j>=0){part.B.push({i,j,lower,G,H:Ro[j]});continue;}
   const exposed=G&Fmask;
   if(exposed===0n)throw Error('source positive had unprotected empty exposed G');
   part.C.push({i,mask:exposed,k:pop(exposed)});
  }
  part.PhiInteger=part.C.reduce((a,e)=>a+2**(4-e.k),0);
  if(part.PhiInteger>=8)throw Error('independent support-mirror residual projected potential >=1/2');
  return part;
 }
 function verifySourceProof(q,R,part,packet){
  const p=q.n&1,o=1-p,s=packet.sourceNoFirstWinClasses;
  if(q.n!==packet.rootOriginalPly||q.n!==packet.originalLegalOneBasedHistory.length||
    String(q.h)!==String(packet.originalSourceQ.h)||
    String(legal(q))!==String(packet.originalLegalFirstColumns)||
    String(R[0].map(x=>'0x'+x.toString(16)))!==String(packet.originalSourceQ.R0)||
    String(R[1].map(x=>'0x'+x.toString(16)))!==String(packet.originalSourceQ.R1))
   throw Error('physical root original R0/R1/q differs from FROZEN SOURCE fingerprint');
  if(part.A.length!==s.fullPair.length||part.B.length!==s.opponentEarlierFirstWinSupportMirror.length||
    part.C.length!==s.exposedES.length||
    part.PhiInteger!==packet.sourcePotential.dyadicNumerator||
    part.rawPairMembers.length!==packet.sourcePartition.pairPhysicalIDs.length)
   throw Error('independent physical support pair/mirror class/ES potential count differs');
  for(let i=0;i<part.A.length;i++){
   const x=part.A[i],y=s.fullPair[i];
   if(x.i!==y.attackerOriginalGeneratorIndex||x.idx!==y.verticalFullPairIndex)
    throw Error('pair-blocked original generator/physical pair mismatch');
  }
  for(let i=0;i<part.B.length;i++){
   const x=part.B[i],y=s.opponentEarlierFirstWinSupportMirror[i];
   if(x.i!==y.attackerOriginalGeneratorIndex||
     x.j!==y.originalDefenderSupportWinningRequirementIndex||
     y.originalLowerSupportMateMaskHex!=='0x'+x.lower.toString(16)||
     y.originalDefenderSupportResidualMaskHex!=='0x'+x.H.toString(16)||
     (x.H&x.lower)!==x.H)
    throw Error('support-mirror opponent original winning generator is NOT subset of lower paired supports');
  }
  for(let i=0;i<part.C.length;i++){
   const x=part.C[i],y=s.exposedES[i];
   if(x.i!==y.attackerOriginalGeneratorIndex||
     y.exposedRootFrontierMaskHex!=='0x'+x.mask.toString(16)||
     x.k!==y.numberOfExposedPhysicalCells)
    throw Error('independent physical exposed original cell mask disagrees with frozen source');
  }
  const d=packet.sourceOpponentStrictFractionalPackingDual,D=d.denominator,
   nums=d.numerators.map(Number),load=Array(N).fill(0),Ro=R[o],
   turnCapacity=Math.ceil((N-q.n)/2);
  if(nums.length!==Ro.length||!Number.isInteger(D)||D<=0||
    turnCapacity!==packet.sourceOpponentBlockingCapacity)
   throw Error('original opponent dual dimensions or player first-block capacity mismatch');
  let sum=0;
  for(let i=0;i<Ro.length;i++){
   const k=nums[i];if(!Number.isInteger(k)||k<0)throw Error('bad λ numerator');
   sum+=k;
   for(let z=0;z<N;z++)if(Ro[i]&bit(z))load[z]+=k;
  }
  if(sum!==d.sumNumerator||load.some(x=>x>D)||sum<=turnCapacity*D||
    packet.sourceExactRootP0RelativeWDL!==(o===0?1:-1))
   throw Error('independent opponent line capacity overload certificate mathematically invalid');
  return {defender: o,attacker:p,
   originalOpponentDualNumerators:nums,denominator:D,weight:sum,
   pTotalPossibleFutureCellClaims:turnCapacity,strictDualExcess:sum-turnCapacity*D,
   originalFFrontierCount:part.F.size,sourceClassCounts:[part.A.length,part.B.length,part.C.length]};
 }
 class ReferenceBudget extends Error{}
 function replayAgainstFixedDefender(q,p,part,stats){
  const o=1-p,seen=new Set();
  function chooseDefender(current,pFirstZ){
   const mate=part.mate.get(pFirstZ);
   if(mate!==undefined){
    const mcol=mate%W;
    if(current.board[mate]===-1){
     if(current.h[mcol]!==Math.floor(mate/W))
      throw Error('SOURCE gravity pair mate is not released after Maker lower placement');
     stats.defenderPairedMateResponses++;
     return mcol+1;
    }
    if(current.board[mate]!==o)
     throw Error('attacker owns both members of one protected vertical gravity pair');
   }else if(!part.F.has(pFirstZ))
    throw Error('p newly occupied original unpaired/paired partition has a gap');
   let best=null;
   for(const cellid of part.F){
    const c=cellid%W,needRow=Math.floor(cellid/W);
    if(current.board[cellid]!==-1||current.h[c]!==needRow)continue;
    let danger=0;
    for(const line of part.C){
     if((line.mask&bit(cellid))===0n)continue;
     let blocked=false,remaining=0;
     for(let z=0;z<N;z++)if(line.mask&bit(z)){
      if(current.board[z]===o){blocked=true;break;}
      if(current.board[z]===-1)remaining++;
     }
     if(!blocked)danger+=2**(4-remaining);
    }
    if(best===null||danger>best.danger||danger===best.danger&&c+1<best.col)
     best={col:c+1,danger};
   }
   if(best!==null){stats.defenderExposedESResponses++;return best.col;}
   const first=legal(current)[0];
   if(first===undefined)throw Error('no defender reply while current q alive');
   stats.defenderOtherLegalResponses++;return first;
  }
  function loop(current){
   if(current.winner!==null){
    if(current.winner!==o)throw Error('defender policy loses: root mover made a real ORIGINAL FIRST WIN');
    stats.terminalDefenderFirstWinLeaves++;return;
   }
   if(current.draw)throw Error('source o strict winning-line dual false: physical full DRAW exists');
   if(current.n%2!==p)throw Error('expected mover at start of fixed-response policy branch');
   const key=current.masks[0].toString(16)+'|'+current.masks[1].toString(16);
   if(seen.has(key))return;
   if(seen.size>=maxPolicyVisitedStatesPerRoot)throw new ReferenceBudget('independent p-policy state enumeration cap');
   seen.add(key);
   for(const c of legal(current)){
    stats.originalAttackerChoicesEnumeratedInIndependentPhysicalReference++;
    const state=copy(current),pMove=place(state,c);
    if(state.winner!==null)throw Error('SOURCE p cannot first WIN falsified by physical attacker move');
    if(state.draw)throw Error('SOURCE opponent o must win first but physical full draw after p move');
    const reply=chooseDefender(state,pMove.physicalID);
    place(state,reply);
    if(state.winner===p)throw Error('o physical move caused p firstWIN');
    if(state.draw)throw Error('SOURCE opponent o must firstwin but physical full draw on o response');
    if(state.winner===o){stats.terminalDefenderFirstWinLeaves++;continue;}
    loop(state);
   }
  }
  loop(q);
  return seen.size;
 }
 function physicalAllActionWDL(root,stats){
  const board=root.board.slice(),h=root.h.slice(),masks=root.masks.slice(),cache=new Map();
  let calls=0;
  function solve(n){
   calls++;
   const key=masks[0].toString(16)+'|'+masks[1].toString(16);
   const hit=cache.get(key);if(hit!==undefined)return hit;
   if(cache.size>=maxPhysicalMinimaxUniqueStatesPerRoot)
    throw new ReferenceBudget('independent full-game WDL reference unique states cap');
   if(n===N)return 0;
   const p=n&1;let value=p===0?-1:1,available=false;
   for(let c=0;c<W;c++){
    if(h[c]===H)continue;
    available=true;
    const z=id(c,h[c]++),m=bit(z);
    board[z]=p;masks[p]|=m;
    let v;
    try{
     if(incident[z].some(L=>L.every(x=>board[x]===p)))
      v=p===0?1:-1;
     else if(n+1===N)v=0;
     else v=solve(n+1);
    }finally{h[c]--;board[z]=-1;masks[p]&=~m;}
    if(p===0){value=Math.max(value,v);if(value===1)break;}
    else {value=Math.min(value,v);if(value===-1)break;}
   }
   if(!available)value=0;
   cache.set(key,value);return value;
  }
  const vals={},p=root.n&1;
  for(const cOne of legal(root)){
   const c=cOne-1,z=id(c,h[c]++),m=bit(z);
   board[z]=p;masks[p]|=m;
   let v;
   try{
    if(incident[z].some(L=>L.every(x=>board[x]===p)))v=p===0?1:-1;
    else if(root.n+1===N)v=0;
    else v=solve(root.n+1);
   }finally{h[c]--;board[z]=-1;masks[p]&=~m;}
   vals[cOne]=v;
  }
  const minmax=p===0?Math.max(...Object.values(vals)):Math.min(...Object.values(vals));
  stats.physicalMinimaxNodesVisited=calls;
  stats.physicalMinimaxMemoizedStates=cache.size;
  return {rootP0RelativeWDL:minmax,currentLegalOriginalFirstActionP0RelativeWDL:vals,
   physicalOptimalOriginalLiteralColumns:Object.keys(vals).map(Number).filter(c=>vals[c]===minmax)};
 }
 const summary={schema:'connect4.original7x6.four_support_mirror_SOURCE_forced_LOSS_69line_physical_policy_full_minimax_v0_1',
  date:'2026-10-18',
  frozenSourceCount:frozen.inputsAndProofs.length,
  truePhysicalOriginalWinningLineCount:69,
  rootsIndependentlyReconstructed:0,
  rootsWithExactOriginalSourceMaskFingerprints:0,
  rootsWithAllSourceClassA_B_CProofsIndependentlyChecked:0,
  rootsWithOpponentDualFractionalCapacityIndependentlyChecked:0,
  originalAttackerChoicesEnumeratedInIndependentPhysicalReference:0,
  defenderPairedMateResponses:0,
  defenderExposedESResponses:0,
  defenderOtherLegalResponses:0,
  terminalDefenderFirstWinLeaves:0,
  physicalMinimaxOriginalFirstActionsEvaluated:0,
  physicallyConfirmedSourceAllMovesLOSE:0,
  wrongSourceRootWDLClaims:0,
  independentPolicyOrMinimaxResourceIncompletes:0,
  futureGameValuesEverEvaluatedBySource:0,
  sourceNoFutureGameOrOpponentPolicyTreeConstructed:true,
  result:'PHYSICAL_VALIDATION_IN_PROGRESS',
  rows:[]};
 for(const packet of frozen.inputsAndProofs){
  const q=root(packet.originalLegalOneBasedHistory),R=originalR(q),
    p=q.n&1,part=independentPartition(q,p,R);
  summary.rootsIndependentlyReconstructed++;
  const proof=verifySourceProof(q,R,part,packet);
  summary.rootsWithExactOriginalSourceMaskFingerprints++;
  summary.rootsWithAllSourceClassA_B_CProofsIndependentlyChecked++;
  summary.rootsWithOpponentDualFractionalCapacityIndependentlyChecked++;
  const stats={defenderPairedMateResponses:0,defenderExposedESResponses:0,
   defenderOtherLegalResponses:0,terminalDefenderFirstWinLeaves:0,
   originalAttackerChoicesEnumeratedInIndependentPhysicalReference:0,
   physicalMinimaxNodesVisited:0,physicalMinimaxMemoizedStates:0};
  let policyCount=null,physical=null,policyStatus='PASS';
  try{policyCount=replayAgainstFixedDefender(q,p,part,stats);}
  catch(e){if(!(e instanceof ReferenceBudget))throw e;
   policyStatus='PHYSICAL_REFERENCE_RESOURCE_INCOMPLETE';summary.independentPolicyOrMinimaxResourceIncompletes++;}
  if(policyStatus==='PASS'){
   try{physical=physicalAllActionWDL(q,stats);}
   catch(e){if(!(e instanceof ReferenceBudget))throw e;
    summary.independentPolicyOrMinimaxResourceIncompletes++;physical=null;
    policyStatus='FULL_PHYSICAL_MINIMAX_RESOURCE_INCOMPLETE';}
  }
  if(physical){
   summary.physicalMinimaxOriginalFirstActionsEvaluated+=Object.keys(physical.currentLegalOriginalFirstActionP0RelativeWDL).length;
   if(physical.rootP0RelativeWDL!==packet.sourceExactRootP0RelativeWDL||
      Object.values(physical.currentLegalOriginalFirstActionP0RelativeWDL).some(
        v=>v!==packet.sourceExactRootP0RelativeWDL)){
    summary.wrongSourceRootWDLClaims++;
    throw Error('SOURCE support-mirror+dual p forced LOSS false according to independent original full MINIMAX '+JSON.stringify({history:packet.originalLegalOneBasedHistory,physical,sourceRootWDl:packet.sourceExactRootP0RelativeWDL}));
   }
   summary.physicallyConfirmedSourceAllMovesLOSE++;
  }
  for(const k of ['defenderPairedMateResponses','defenderExposedESResponses',
   'defenderOtherLegalResponses','terminalDefenderFirstWinLeaves',
   'originalAttackerChoicesEnumeratedInIndependentPhysicalReference'])
   summary[k]+=stats[k];
  summary.rows.push({originalOneBasedHistory:packet.originalLegalOneBasedHistory,
   originalRootPly:q.n,originalCurrentMover:p,
   rootOriginalHeights:q.h,
   physicalOriginalRCounts:R.map(x=>x.length),
   originalLegalFirstActions:legal(q),
   sourceSelectedOneValidBestLiteralColumn:packet.sourceSelectedBestOriginalColumn,
   sourceP0RelativeWinner:packet.sourceExactRootP0RelativeWDL,
   sourceProofFamilyCounts:proof.originalFFrontierCount,
   independentlyVerifiedSourceClassesAndDual:proof,
   independentFixedDefenderPolicyStatus:policyStatus,
   independentEnumeratedPhysicalPlayerTurnStates:policyCount,
   independentOriginalFullGameActionValues:physical?.currentLegalOriginalFirstActionP0RelativeWDL??null,
   independentPhysicalRootWDL:physical?.rootP0RelativeWDL??null,
   physicalOracleStats:stats});
 }
 summary.result=summary.independentPolicyOrMinimaxResourceIncompletes?
  'PHYSICAL_REFERENCE_BUDGET_PARTIAL':
  'INDEPENDENT_ORIGINAL_7X6_SUPPORT_MIRROR_FIXED_DEFENDER_POLICY_AND_FULL_WDL_VERIFIED';
 return summary;
}

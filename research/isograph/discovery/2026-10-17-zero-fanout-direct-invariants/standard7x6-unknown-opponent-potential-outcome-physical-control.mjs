// FROZEN INDEPENDENT TRUE STANDARD 7x6 PHYSICAL CONTROL of
// OWNER-LATEST opponent-model and outcome-accessibility definitions.
// This is an EXPLICITLY BRANCHING reference for post-derivation falsification,
// not the zero-strategic-fanout source algorithm. Two separate references:
// (1) perfect-adversary P0-relative minimax V and
// (2) ALL LEGAL first-win terminal outcome ACCESSIBILITY Omega via OR/union.
// Delayed/nonperfect response is possible not guaranteed. Shortest possible
// win/draw and longest possible loss are fixed-PATH bounds, not adversarial
// survival/first-win promises.
// Frozen BEFORE execution in 2026-10-17 output-contract research.
const W=7,H=6,K=4,N=W*H;
const bit=(c,r)=>1n<<BigInt(r*W+c),byCell=Array.from({length:N},()=>[]);
let originalKLines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const ce=c+(K-1)*dx,re=r+(K-1)*dy;
  if(ce<0||ce>=W||re<0||re>=H)continue;
  let m=0n,ids=[];
  for(let z=0;z<K;z++){const id=(r+dy*z)*W+c+dx*z;ids.push(id);m|=1n<<BigInt(id);}
  for(const id of ids)byCell[id].push(m);
  originalKLines++;
 }
}
if(originalKLines!==69)throw Error('wrong standard7x6 69 original K-lines');
const fresh=()=>({h:Array(W).fill(0),stones:[0n,0n],n:0,history:'',terminal:null});
const legal=s=>s.h.flatMap((x,c)=>x<H?[c]:[]);
function next(s,c){
 if(s.terminal!==null||s.h[c]>=H)throw Error('illegal first-win-stopped action');
 const p=s.n&1,r=s.h[c],id=r*W+c,h=s.h.slice(),stones=s.stones.slice();
 h[c]++;stones[p]|=bit(c,r);
 const win=byCell[id].some(m=>(stones[p]&m)===m);
 return {h,stones,n:s.n+1,history:s.history+String(c+1),
  terminal:win?(p===0?1:-1):s.n+1===N?0:null};
}
function key(s){return s.stones[0].toString(16)+'|'+s.stones[1].toString(16);}
const idx=v=>v+1;
const memoPerfect=new Map(),memoReach=new Map();
const stats={
 schema:'connect4.standard7x6.opponent_quality_robust_vs_possible_v0_1',
 date:'2026-10-17',W,H,K,originalKLines,seedStart:0xA110E27A,
 nonWinningTrajectories:0,realSourceStatesSeen:0,distinctRealRoots:0,
 sourcePositionsChecked:0,originalLegalActionsChecked:0,
 perfectReferenceRecursions:0,perfectReferenceStates:0,
 pathAccessibilityReferenceRecursions:0,pathAccessibilityStates:0,
 firstWinTerminalGuardDisagreements:0,perfectValueNotAmongReachableOutcomes:0,
 perfectP0WinP1TurnRoots:0,suchRootsWithP1PossibleWin:0,
 suchRootsWithDrawPossible:0,
 suchRootsP1UnknownTierWinsVsPerfectAllDisagree:0,
 p0TurnNonforcedWinRoots:0,suchRootsWithP0PossibleWin:0,
 possibleWinTiers:0,possibleDrawFallbackTiers:0,onlyLossTiers:0,
 witnessedP1PerfectForcedLossButP1CanWinAgainstError:null,
 witnessedP1PerfectForcedLossDrawOpportunity:null,
 witnessedP0NotGuaranteedButP0CanWinAgainstError:null,
 witnessedP1DifferentPerfectVsUnknownLevel2Mask:null,
 witnessedP1FastestPossibleWinDifferentFromAllPossibleWinMoves:null,
 witnessedP1FastestPossibleDrawDifferentFromAllPossibleDrawMoves:null,
 historicalSourceWDLAndP1WinOpportunityNotEquated:true,
 referenceFutureGameBranching:YES(),
 canonical44444UnrestrictedWDL:'NOT_EVALUATED',
 finishSeed:null
};
function YES(){return true;}
let seed=stats.seedStart>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function perfect(s){
 stats.perfectReferenceRecursions++;
 if(s.terminal!==null)return s.terminal;
 const k=key(s);if(memoPerfect.has(k))return memoPerfect.get(k);
 stats.perfectReferenceStates++;
 let v=s.n%2===0?-1:+1;
 for(const c of legal(s)){const y=perfect(next(s,c));v=s.n%2===0?Math.max(v,y):Math.min(v,y);}
 memoPerfect.set(k,v);return v;
}
function reachable(s){
 stats.pathAccessibilityReferenceRecursions++;
 if(s.terminal!==null){
  const mask=1<<idx(s.terminal),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  min[idx(s.terminal)]=0;max[idx(s.terminal)]=0;
  return {mask,min,max};
 }
 const k=key(s);const old=memoReach.get(k);if(old)return old;
 stats.pathAccessibilityStates++;
 let mask=0,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const c of legal(s)){
  const child=reachable(next(s,c));
  mask|=child.mask;
  for(let i=0;i<3;i++)if((child.mask&(1<<i))!==0){
   min[i]=Math.min(min[i],1+child.min[i]);
   max[i]=Math.max(max[i],1+child.max[i]);
  }
 }
 const result={mask,min,max};memoReach.set(k,result);return result;
}
const resultSet=r=>[-1,0,1].filter(v=>r.mask&(1<<idx(v)));
function afterActions(q){
 const out=[];
 for(const a of legal(q)){
  const child=next(q,a),val=perfect(child),s=reachable(child);
  out.push({a:a+1,perfectValue:val,
   possibleTerminalOutcomes:resultSet(s),
   possibleShortestAbsoluteAdditionalPlies:
      Object.fromEntries(resultSet(s).map(v=>[String(v),s.min[idx(v)]+1])),
   possibleLongestAbsoluteAdditionalPlies:
      Object.fromEntries(resultSet(s).map(v=>[String(v),s.max[idx(v)]+1]))});
  if(!resultSet(s).includes(val)){
   stats.perfectValueNotAmongReachableOutcomes++;
   throw Error('perfect-play value cannot be an unreachable terminal outcome');
  }
 }
 return out;
}
const seen=new Map();
for(let run=0;run<2600;run++){
 stats.nonWinningTrajectories++;
 let q=fresh();
 for(let t=0;t<N;t++){
  if(q.n>=34&&q.n<=39&&legal(q).length>=2){
   stats.realSourceStatesSeen++;
   const k=key(q);
   if(!seen.has(k))seen.set(k,q);
  }
  const options=legal(q).map(c=>next(q,c)).filter(z=>z.terminal===null);
  if(!options.length)break;
  q=options[rand()%options.length];
 }
}
stats.distinctRealRoots=seen.size;
const roots=[...seen.values()].filter(q=>q.n>=34&&q.n<=38);
let processed=0;
for(const q of roots){
 if(processed>=1600)break;
 const V=perfect(q),moves=afterActions(q),p=q.n&1,me=p===0?+1:-1,other=-me;
 const possibleWinMoves=moves.filter(m=>m.possibleTerminalOutcomes.includes(me));
 const possibleDrawMoves=moves.filter(m=>m.possibleTerminalOutcomes.includes(0));
 const tier=possibleWinMoves.length?'WIN':possibleDrawMoves.length?'DRAW':'LOSS';
 const best= tier==='WIN'?possibleWinMoves:tier==='DRAW'?possibleDrawMoves:moves;
 const measure=tier==='WIN'?String(me):tier==='DRAW'?'0':String(other);
 const bestTime=(tier==='LOSS'?
   Math.max(...best.map(m=>m.possibleLongestAbsoluteAdditionalPlies[measure])):
   Math.min(...best.map(m=>m.possibleShortestAbsoluteAdditionalPlies[measure])));
 const perfectTime=best.filter(m=>(tier==='LOSS'?
   m.possibleLongestAbsoluteAdditionalPlies[measure]===bestTime:
   m.possibleShortestAbsoluteAdditionalPlies[measure]===bestTime));
 if(tier==='WIN')stats.possibleWinTiers++;
 else if(tier==='DRAW')stats.possibleDrawFallbackTiers++;
 else stats.onlyLossTiers++;
 stats.sourcePositionsChecked++;
 stats.originalLegalActionsChecked+=moves.length;processed++;
 const witness=()=>({history:q.history,absolutePly:q.n,mover:p,
  perfectPlayP0RelativeV:V,allLegalActions:moves.map(m=>m.a),
  perfectPlayActionValues:moves.map(m=>[m.a,m.perfectValue]),
  reachabilityPerLiteralAction:moves,
  opponentUnknownBestTier:tier,
  opponentUnknownLevel2BestMoves:best.map(m=>m.a),
  opponentUnknownLevel3OptimisticTime:bestTime,
  opponentUnknownLevel3PerfectMoveLabels:perfectTime.map(m=>m.a),
  qualification:'opponent quality unknown: reachable outcomes and times are existential POSSIBLE, not guaranteed or probability-ranked'});
 if(p===1&&V===1){
  stats.perfectP0WinP1TurnRoots++;
  if(moves.some(m=>m.perfectValue!==1))throw Error('P1 forced loss must hold for all P1 moves against perfect P0');
  if(possibleWinMoves.length){
   stats.suchRootsWithP1PossibleWin++;
   if(!stats.witnessedP1PerfectForcedLossButP1CanWinAgainstError)
    stats.witnessedP1PerfectForcedLossButP1CanWinAgainstError=witness();
   if(!stats.witnessedP1DifferentPerfectVsUnknownLevel2Mask&&
      best.length!==moves.length)
    stats.witnessedP1DifferentPerfectVsUnknownLevel2Mask=witness();
  }
  if(possibleDrawMoves.length){
   stats.suchRootsWithDrawPossible++;
   if(!stats.witnessedP1PerfectForcedLossDrawOpportunity)
    stats.witnessedP1PerfectForcedLossDrawOpportunity=witness();
  }
  if(best.length!==moves.length&&tier==='WIN')
   stats.suchRootsP1UnknownTierWinsVsPerfectAllDisagree++;
 }
 if(p===0&&V!==1){
  stats.p0TurnNonforcedWinRoots++;
  if(possibleWinMoves.length){
   stats.suchRootsWithP0PossibleWin++;
   if(!stats.witnessedP0NotGuaranteedButP0CanWinAgainstError)
    stats.witnessedP0NotGuaranteedButP0CanWinAgainstError=witness();
  }
 }
 if(p===1&&tier==='WIN'&&best.length>perfectTime.length&&!stats.witnessedP1FastestPossibleWinDifferentFromAllPossibleWinMoves)
  stats.witnessedP1FastestPossibleWinDifferentFromAllPossibleWinMoves=witness();
 if(p===1&&tier==='DRAW'&&best.length>perfectTime.length&&!stats.witnessedP1FastestPossibleDrawDifferentFromAllPossibleDrawMoves)
  stats.witnessedP1FastestPossibleDrawDifferentFromAllPossibleDrawMoves=witness();
}
stats.finishSeed=seed;
console.log(JSON.stringify(stats,null,2));

// INDEPENDENT ORIGINAL 7x6 K4 first-win-stopped adversarial
// PHYSICAL grid validator of already frozen Fourier-weighted P0
// pending-pair source. Computes all real 69 K4 lines separately.
// Enumerates P1 alternative moves ONLY in this checker to FALSIFY
// any attempted P0 no-P1-first-win theorem; NOT source minimax/WDL.
// Simultaneously checks the exact legal one-pending vertical-pair
// invariant on EVERY reached nonterminal P1-turn physical board.
// Strictly starting TRUE original 444444, P0 first literal response.
import {sourceTrue7x6FourierWeightedP0PendingPair}
 from './source-true7x6-444444-Fourier-weighted-pending-pair-P0.mjs';
function original69(){
 const W=7,H=6,byCell=Array.from({length:42},()=>[]),all=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   const x=c+3*dc,y=r+3*dr;
   if(x<0||x>=W||y<0||y>=H)continue;
   const cells=Array.from({length:4},(_,j)=>(r+j*dr)*W+c+j*dc);
   const mask=cells.reduce((v,z)=>v|(1n<<BigInt(z)),0n);
   const line={start:[c,r],direction:[dc,dr],mask,physicalSiteIDs:cells};
   all.push(line);
   for(const z of cells)byCell[z].push(line);
  }
 }
 if(all.length!==69)throw Error('not original K4 69 line geometry');
 return {all,byCell};
}
function originalPlace(state,c,owner,physical){
 const W=7,H=6,h=state.h,site=h[c]*W+c;
 if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
  throw Error('physical original gravity nonplayable');
 const bit=1n<<BigInt(site);
 if((state.p0|state.p1)&bit)throw Error('original physical same site double-claimed');
 const nextH=h.slice();nextH[c]++;
 const p0=owner===0?state.p0|bit:state.p0;
 const p1=owner===1?state.p1|bit:state.p1;
 const owned=owner===0?p0:p1;
 const winner=physical.byCell[site].find(L=>(owned&L.mask)===L.mask);
 const full=nextH.every(x=>x===H);
 return {state:{h:nextH,p0,p1},winner,full,
  landing:{literalOriginalColumn:c+1,zeroBasedRow:h[c],physicalSiteID:site,owner}};
}
function actualCanonical444444(physical){
 let state={h:Array(7).fill(0),p0:0n,p1:0n};
 for(let ply=0;ply<6;ply++){
  const p=ply%2;
  const move=originalPlace(state,3,p,physical);
  if(move.winner)throw Error('first-win stopped original 444444 prefix invalid');
  state=move.state;
 }
 if(state.h[3]!==6||state.h.some((x,c)=>c===3?x!==6:x!==0))
  throw Error('canonical full center support invalid');
 return state;
}
function physicalPairInvariant(state){
 const bad=[],pairs=[];
 for(let c=0;c<7;c++){
  if(c===3)continue;
  for(let r=0;r<6;r+=2){
   const z=r*7+c,t=(r+1)*7+c,
    lb=1n<<BigInt(z),ub=1n<<BigInt(t);
   const lower=(state.p0&lb)?0:(state.p1&lb)?1:-1;
   const upper=(state.p0&ub)?0:(state.p1&ub)?1:-1;
   const condition=lower===-1&&upper===-1?'VIRGIN':
     lower!==-1&&upper!==-1&&lower!==upper?'SPLIT':
     lower===0&&upper===-1?'PENDING_P0_LOWER':'INVALID';
   pairs.push({c,r,lower,upper,condition});
   if(condition==='INVALID')bad.push({c,r,lower,upper});
  }
 }
 const pend=pairs.filter(x=>x.condition==='PENDING_P0_LOWER');
 const physicalOdd=Array.from({length:7},(_,c)=>c)
   .filter(c=>c!==3&&state.h[c]%2===1);
 if(pend.length!==1||bad.length||physicalOdd.length!==1||
   physicalOdd[0]!==pend[0]?.c ||
   state.h[3]!==6)
  return {safe:false,bad,pending:pend,physicalOdd};
 return {safe:true,pending:pend[0],
  virginPairs:pairs.filter(x=>x.condition==='VIRGIN').length,
  splitPairs:pairs.filter(x=>x.condition==='SPLIT').length};
}
export function independentOriginal7x6FourierPendingPairCampaign(){
 const source=sourceTrue7x6FourierWeightedP0PendingPair(),
  geometry=original69(),root=actualCanonical444444(geometry),
  maxStates=200000,initial=source.firstOriginalP0MoveAfterCenterFull;
 const initialPlace=originalPlace(root,initial.zeroBasedColumn,0,geometry);
 const errors=[],visited=new Set(),queue=[];
 if(initialPlace.winner||initialPlace.full)
  throw Error('ply7 physical initial P0 source did not start normal');
 const canonical='444444'+initial.literalColumn;
 queue.push({...initialPlace.state,history:canonical});
 visited.add(initialPlace.state.p0.toString(16)+':'+initialPlace.state.p1.toString(16));
 const counts={
  sourcePolicyStatus:source.status,sourceP0InitialLiteral:initial.literalColumn,
  sourceP0InitialPairIndex:initial.pairIndex,
  sourcePauliFourierPriorityInfluence:initial.integerFourierInfluenceNumerator,
  originalWinningLines:geometry.all.length,statesBeforeAdversarialP1Actions:0,
  realP1AlternativesChecked:0,P0RepliesChecked:0,
  P1FirstWinsFound:0,P0FirstWinsFound:0,fullDrawOutcomes:0,
  gravityMateViolations:0,pairInvariantViolations:0,
  identicalPhysicalStatesMemoized:0,shortestActualP1WinningHistory:null,
  firstP1WinningLine:null,negativeScopeNoOtherBoards:true,
  checkerBudgetExceeded:false
 };
 // Full original FIRST-WIN-STOPPED game: stop immediately at
 // whichever move physically completes an original K4 line.
 let processed=0;
 for(let head=0;head<queue.length;head++){
  const state=queue[head];processed++;
  const guard=physicalPairInvariant(state);
  if(!guard.safe){counts.pairInvariantViolations++;
   errors.push({kind:'PHYSICAL_PAIR_INVARIANT_FALSE',history:state.history,guard});break;}
  counts.statesBeforeAdversarialP1Actions++;
  if(processed>maxStates){counts.checkerBudgetExceeded=true;break}
  for(let c=0;c<7;c++){
   if(state.h[c]>=6)continue;
   counts.realP1AlternativesChecked++;
   const p1=originalPlace(state,c,1,geometry);
   const hist=state.history+(c+1);
   if(p1.winner){
    counts.P1FirstWinsFound++;
    counts.shortestActualP1WinningHistory=hist;
    counts.firstP1WinningLine={
      firstWinningMovePly:hist.length,
      actualLastPlacement:p1.landing,
      startOriginalZeroBased:p1.winner.start,
      direction:p1.winner.direction,
      physicalSiteIDs:p1.winner.physicalSiteIDs
    };
    break;
   }
   if(p1.full){counts.fullDrawOutcomes++;continue;}
   let ans;
   try{ans=source.replyAfterP1({hBeforeP1:state.h,attackColumn:c})}
   catch(e){errors.push({kind:'SOURCE_P0_POLICY_ILLEGAL_RESPONSE',history:hist,details:String(e)});
    counts.gravityMateViolations++;break;}
   if(ans.status==='NO_P0_MOVE_FULL_BOARD_AFTER_P1'){
    errors.push({kind:'SOURCE_P0_NO_RESPONSE_BEFORE_REAL_BOARD_FULL',history:hist});
    counts.gravityMateViolations++;break;
   }
   if(ans.status!=='SOURCE_P0_REPLY_AVAILABLE'){
    errors.push({kind:'BAD_SOURCE_REPLY_STATUS',history:hist,ans});break;}
   const r=ans.P0ReplyOriginalLiteralColumn-1;
   const p0=originalPlace(p1.state,r,0,geometry);
   if(ans.P0ReplyOriginalRow!==p0.landing.zeroBasedRow){
    errors.push({kind:'SOURCE_RESPONSE_PHYSICAL_ROW_INCORRECT',history:hist,r,ans});break;
   }
   counts.P0RepliesChecked++;
   if(p0.winner){counts.P0FirstWinsFound++;continue;}
   if(p0.full){counts.fullDrawOutcomes++;continue;}
   const nextHistory=hist+(r+1),next=p0.state;
   const key=next.p0.toString(16)+':'+next.p1.toString(16);
   if(visited.has(key)){counts.identicalPhysicalStatesMemoized++;continue}
   visited.add(key);queue.push({...next,history:nextHistory});
  }
  if(counts.P1FirstWinsFound||errors.length)break;
 }
 return {
  status:errors.length?'INDEPENDENT_TRUE7X6_FOURIER_SOURCE_RESPONSE_ILLEGAL':
    counts.P1FirstWinsFound?'PHYSICAL_P1_FIRST_WIN_REJECTS_FOURIER_WEIGHTED_P0_NONWIN_HYPOTHESIS':
    counts.checkerBudgetExceeded?'INCOMPLETE_ORIGINAL_PHYSICAL_ADVERSARY_BUDGET':
    'INDEPENDENT_FIXED_P0_POLICY_NO_P1_FIRST_WINS_FOUND_FULL_CHECK',
  originalGame:{W:7,H:6,K:4,originalPrefix:'444444',
   strictFirstWinStopped:true,P0NextMover:true},
  result:counts,
  firstCounterexampleIsOnePossibleP1ContinuationNotForcedWinProof:counts.P1FirstWinsFound>0,
  onePendingVerticalSplitPairInvariantsPhysicallyChecked:counts.statesBeforeAdversarialP1Actions,
  sourceFutureWDLValuesQueried:0,physicalAdversarialP1BranchesEnumeratedInCheckerOnly:true,
  errors:errors.slice(0,3)
 };
}

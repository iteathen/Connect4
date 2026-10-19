// INDEPENDENT true ORIGINAL 7x6 length4 colored-grid physical checker.
// Tests FROZEN P0 signed-Walsh initial/pending pair strategy on ACTUAL
// first-win-stopped 444444 P1-center-completed branch. Opponent P1
// branches are enumerated only by the checker to look for legal first
// P1 wins, not as SOURCE future WDL computation.
// Original true 69 K4 lines rebuilt, no other W,H,K.
import {sourceOriginal7x6SignedWalshP0PendingPair}
 from './source-true7x6-444444-signed-Walsh-P0-pair-priority.mjs';
function linesOriginal(){
 const all=[],touch=Array.from({length:42},()=>[]);
 for(let c=0;c<7;c++)for(let r=0;r<6;r++)
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   const toC=c+3*dc,toR=r+3*dr;
   if(toC<0||toC>=7||toR<0||toR>=6)continue;
   const cells=[0,1,2,3].map(j=>(r+j*dr)*7+c+j*dc);
   const mask=cells.reduce((p,z)=>p|(1n<<BigInt(z)),0n);
   const row={start:[c,r],dir:[dc,dr],cells,mask};
   all.push(row);cells.forEach(z=>touch[z].push(row));
  }
 if(all.length!==69)throw Error('independent original 69 K4 lines absent');
 return {all,touch};
}
function put(q,c,p,G){
 if(c<0||c>=7||q.h[c]>=6)throw Error('illegal physical gravity');
 const h=q.h.slice(),row=h[c]++,id=row*7+c,b=1n<<BigInt(id);
 if((q.p0|q.p1)&b)throw Error('original cell already owned');
 const p0=p===0?q.p0|b:q.p0,p1=p===1?q.p1|b:q.p1,own=p===0?p0:p1;
 const winner=G.touch[id].find(L=>(own&L.mask)===L.mask);
 return {q:{h,p0,p1},winner,site:id,row,full:h.every(v=>v===6)};
}
function originalCanonicalCenterFull(G){
 let q={h:Array(7).fill(0),p0:0n,p1:0n};
 for(let i=0;i<6;i++){
  const z=put(q,3,i%2,G);
  if(z.winner)throw Error('actual 444444 has premature first win');
  q=z.q;
 }
 if(q.h[3]!==6||q.h.some((x,c)=>c!==3&&x!==0))
  throw Error('source physical 444444 wrong');
 return q;
}
function invariant(q){
 const pairs=[];
 for(let c=0;c<7;c++)if(c!==3)
  for(let r=0;r<6;r+=2){
   const lower=r*7+c,upper=(r+1)*7+c;
   const own=z=>q.p0&(1n<<BigInt(z))?0:q.p1&(1n<<BigInt(z))?1:-1;
   const x=own(lower),y=own(upper);
   const t=x===-1&&y===-1?'V':x!==-1&&y!==-1&&x!==y?'S':
    x===0&&y===-1?'P':'BAD';
   pairs.push({c,r,lower:x,upper:y,kind:t});
  }
 const pend=pairs.filter(x=>x.kind==='P'),bad=pairs.filter(x=>x.kind==='BAD');
 const odd=q.h.map((v,c)=>c!==3&&(v&1)?c:null).filter(x=>x!==null);
 return {safe:pend.length===1&&bad.length===0&&q.h[3]===6&&
   odd.length===1&&pend[0].c===odd[0],
  pending:pend[0]??null,virgin:pairs.filter(x=>x.kind==='V').length,
  split:pairs.filter(x=>x.kind==='S').length,bad};
}
export function independentlyFalsifySignedWalshP0(){
 const policy=sourceOriginal7x6SignedWalshP0PendingPair(),
  G=linesOriginal(),root=originalCanonicalCenterFull(G),
  first=policy.P0OpeningAfterCenterCompletes,
  seen=new Set(),maxStates=200000,queue=[],errors=[];
 if(first.literalColumn!==1||first.pairIndex!==0||
   policy.singletonStaticFourierWalshNumerators[0]!==-6424)
  errors.push({type:'FROZEN_SIGNED_WALSH_SOURCE_INITIAL_NOT_EXPECTED',first});
 const move=put(root,first.originalColumn,0,G);
 if(move.winner||move.full)errors.push({type:'P0_OPEN_FOURIER_PREMATURE_TERMINAL'});
 queue.push({...move.q,history:'444444'+first.literalColumn});
 const key=x=>x.p0.toString(16)+','+x.p1.toString(16);
 seen.add(key(move.q));
 let checked=0,p1Actions=0,p0Replies=0,p0Wins=0,p1Wins=0,
  draws=0,duplicates=0,legalPending=0,counter=null,budget=false;
 if(!errors.length)for(let at=0;at<queue.length;at++){
  const s=queue[at],status=invariant(s);
  checked++;
  if(!status.safe){errors.push({type:'PAIR_INVARIANT_VIOLATION',history:s.history,status});break}
  legalPending++;
  if(checked>maxStates){budget=true;break}
  for(let c=0;c<7;c++){
   if(s.h[c]>=6)continue;
   p1Actions++;
   const a=put(s,c,1,G),h=s.history+(c+1);
   if(a.winner){
    p1Wins++;
    counter={history:h,
     firstWinPly:h.length,
     winningOriginalStart:[a.winner.start[0]+1,a.winner.start[1]+1],
     originalWinDirection:a.winner.dir,
     exactOriginalWinnerP1PhysicalSites:a.winner.cells,
     lastP1OriginalLiteralColumn:c+1,lastP1RowOneBased:a.row+1};
    break;
   }
   if(a.full){draws++;continue}
   let r;
   try{r=policy.response({heightBeforeP1:s.h,P1OriginalColumn:c})}
   catch(e){errors.push({type:'SOURCE_RESPONSE_FAILURE',history:h,error:String(e)});break}
   if(r.status!=='ORIGINAL_P0_LEGAL_REPLY'){
    errors.push({type:'SOURCE_MISSING_REPLY_BEFORE_TERMINAL',history:h,r});break;
   }
   const d=put(a.q,r.P0LiteralColumn-1,0,G);
   if(d.row!==r.P0RowZeroBased){
    errors.push({type:'SOURCE_REPLY_PHYSICAL_ROW_MISMATCH',history:h,r,real:d.row});break;
   }
   p0Replies++;
   if(d.winner){p0Wins++;continue}
   if(d.full){draws++;continue}
   const k=key(d.q);
   if(seen.has(k)){duplicates++;continue}
   seen.add(k);queue.push({...d.q,history:h+r.P0LiteralColumn});
  }
  if(counter||errors.length)break;
 }
 return {
  status:errors.length?'PHYSICAL_SIGNED_FOURIER_RESPONSE_INVALID':
   counter?'GENUINE_P1_FIRST_WIN_DISPROVES_SIGNED_FOURIER_P0_NONWIN_POLICY':
   budget?'INDEPENDENT_P1_ADVERSARY_BUDGET_INCOMPLETE':
   'COMPLETE_ORIGINAL_P1_ADVERSARY_P0_PENDING_POLICY_NO_P1_FIRST_WIN',
  strictOriginalGame:[7,6,4],rootOriginalFirstWinFreeHistory:'444444',
  signedP0InitialChoice:first,
  physicallyVerifiedNonterminalP1TurnStates:checked,
  independentRealP1Alternatives:p1Actions,
  sourceDeterministicPhysicalP0Replies:p0Replies,
  P0FirstWinsBeforeStop:p0Wins,P1FirstWinsFound:p1Wins,
  fullDrawsReached:draws,physicalStatesMemoized:duplicates,
  verifiedSinglePendingPairGuards:legalPending,
  firstP1WinningCounterexample:counter,
  allGameMovesOriginalFirstWinStopped:true,
  rootWDLNotComputed:true,alternativeP1BranchesOnlyPhysicalValidation:true,
  sourceStrategicFutureWDLEvaluations:0,
  incompleteResourceBudget:budget,errors:errors.slice(0,6)
 };
}

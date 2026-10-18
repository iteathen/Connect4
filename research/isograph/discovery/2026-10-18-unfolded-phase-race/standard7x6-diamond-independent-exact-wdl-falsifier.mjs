// Independent ORIGINAL W7 H6 K4 physical minimax REFEREE AFTER source
// diamond candidate selection has been frozen and saved in a JSON packet.
// This deliberately branches in validation ONLY; zero future values in SOURCE.
// P0-relative exact WDL, FIRST four-in-row stops, original 69 windows, gravity.
// Abort per original root on finite budget (no invented WDL on timeouts).
export function falsifyRootDiamondValueEquality(frozenSourcePacket,{
 maxRoots=300,maxStatesPerRoot=250000,maxPairsPerRoot=20}={}){
 const W=7,H=6,N=42,bit=z=>1n<<BigInt(z),id=(c,r)=>r*W+c;
 const masks=[],incident=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cells=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(!cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))continue;
  let mask=0n;
  for(const [x,y] of cells)mask|=bit(id(x,y));
  masks.push(mask);
  for(const [x,y] of cells)incident[id(x,y)].push(mask);
 }
 if(masks.length!==69)throw Error('independent physical original K-window count !=69');
 function parse(history){
  const h=Array(W).fill(0),owners=[0n,0n],board=Array(N).fill(-1);
  let p=0,rank=0;
  for(const ch of history){
   const c=Number(ch)-1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error('illegal root history');
   const cell=id(c,h[c]++);
   if(board[cell]!==-1)throw Error('original physical cell already occupied');
   board[cell]=p;owners[p]|=bit(cell);rank++;
   if(incident[cell].some(mask=>(owners[p]&mask)===mask))
    throw Error('input history crosses physical first K WIN');
   p=1-p;
  }
  return {h,owners,rank,board};
 }
 const packet={schema:'connect4.original7x6.independent_exact_wdl_diamond_action_equality_falsifier_v0_1',
  referenceOnly:true,sourceProducerNeverQueriesWDL:true,
  physicalGeometry:{W,H,K:4,originalWinlines:masks.length},
  oracle:{method:'recursive memoized original-physical P0-relative minimax with first-win stop',
   maxStatesPerRoot,maxRoots,maxPairsPerRoot,
   domain:'frozen source-certified diamond root action pairs only'},
  counters:{candidateRootsInPacket:frozenSourcePacket.qCandidates?.length??null,
   rootsChecked:0,rootBudgetsIncomplete:0,actionPairsChecked:0,
   exactValuedFirstActions:0,physicalRecursiveCalls:0,
   physicallyCachedUniqueGameStates:0,sourceGuardRecomputed:false,
   allActionValuesComputedForWitness:false},
  disposition:'BOUNDED_NO_WITNESS',firstDisprovingWitness:null,
  sourceRevisions:frozenSourcePacket.sourceRevisions??null};
 if(!Array.isArray(frozenSourcePacket.qCandidates))
  throw Error('requires frozen source-only candidate packet');
 class BudgetExceeded extends Error{}
 for(const item of frozenSourcePacket.qCandidates.slice(0,maxRoots)){
  const root=parse(item.originalHistory);
  if(root.rank!==item.originalPly||JSON.stringify(root.h)!==JSON.stringify(item.originalHeights))
   throw Error('frozen original source state does not match independently reconstructed physical gravity');
  const playable=root.h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(JSON.stringify(playable)!==JSON.stringify(item.originalLegalFirstColumns))
   throw Error('frozen original literal action mask differs from physical root');
  let calls=0,unique=0;
  const memo=new Map(),scored=new Map();
  const height=root.h.slice(),occ=root.owners.slice();
  function solve(n){
   calls++;packet.counters.physicalRecursiveCalls++;
   const key=occ[0].toString(16)+'/'+occ[1].toString(16);
   const cached=memo.get(key);
   if(cached!==undefined)return cached;
   if(++unique>maxStatesPerRoot)throw new BudgetExceeded('physical reference budget exhausted');
   if(n===N)return 0;
   const p=n&1;let best=p===0?-1:1,any=false;
   for(let c=0;c<W;c++){
    const r=height[c];if(r>=H)continue;
    any=true;
    const z=id(c,r),bz=bit(z);
    height[c]=r+1;occ[p]|=bz;
    let value;
    if(incident[z].some(mask=>(occ[p]&mask)===mask))value=p===0?1:-1;
    else if(n+1===N)value=0;
    else value=solve(n+1);
    height[c]=r;occ[p]&=~bz;
    if(p===0){if(value>best)best=value;if(best===1)break;}
    else {if(value<best)best=value;if(best===-1)break;}
   }
   if(!any)best=0;
   memo.set(key,best);return best;
  }
  function actionValue(col){
   if(scored.has(col))return scored.get(col);
   const c=col-1,n=root.rank,p=n&1,r=height[c],z=id(c,r),bz=bit(z);
   if(r>=H)throw Error('source-labelled first action physically illegal');
   height[c]=r+1;occ[p]|=bz;
   let value;
   try{
    if(incident[z].some(mask=>(occ[p]&mask)===mask))value=p===0?1:-1;
    else if(n+1===N)value=0;
    else value=solve(n+1);
   }finally{height[c]=r;occ[p]&=~bz;}
   scored.set(col,value);
   packet.counters.exactValuedFirstActions++;
   return value;
  }
  let timedOut=false;
  try{
   for(const pair of item.sourceRootFirstActionPairs.slice(0,maxPairsPerRoot)){
    const a=pair.originalFirstActionA,c=pair.originalFirstActionC;
    if(!pair.sourceFixedTwoRoundDiamond||
       pair.sourceFixedTwoRoundDiamond[0]!==a||
       pair.sourceFixedTwoRoundDiamond[2]!==c||
       new Set(pair.sourceFixedTwoRoundDiamond).size!==4)
      throw Error('unfrozen or malformed source diamond witness');
    const A=actionValue(a),C=actionValue(c);
    packet.counters.actionPairsChecked++;
    if(A===C)continue;
    const result={originalHistory:item.originalHistory,ply:item.originalPly,
      originalHeights:item.originalHeights,
      originalSourceRCounts:item.originalSourceRCounts,
      originalP0RelativeFirstActionValues:{[a]:A,[c]:C},
      firstActionA:a,firstActionC:c,
      sourceCertifiedDiamond:pair.sourceFixedTwoRoundDiamond,
      sourceSwappedTwoRoundWord:[
       pair.sourceFixedTwoRoundDiamond[2],pair.sourceFixedTwoRoundDiamond[3],
       pair.sourceFixedTwoRoundDiamond[0],pair.sourceFixedTwoRoundDiamond[1]],
      physicalRootMover:item.originalPly&1,
      exactReferenceStatesMemoized:memo.size,
      exactPhysicalReferenceRecursionCalls:calls,
      conclusion:'COUNTEREXAMPLE_TO_STATIC_DIAMOND_IMPLIES_EQUAL_ROOT_ACTION_VALUES'};
    // Root scalar and all other first actions are optional; report separately
    // and compute only AFTER the decisive exact a/c values already differ.
    try{
     const v={};for(const move of playable)v[move]=actionValue(move);
     result.allRootFirstActionValuesP0Relative=v;
     result.ordinaryRootValueP0Relative=(item.originalPly&1)?
       Math.min(...Object.values(v)):Math.max(...Object.values(v));
     result.exactAllMoveValuesComputed=true;
     packet.counters.allActionValuesComputedForWitness=true;
    }catch(e){if(!(e instanceof BudgetExceeded))throw e;
     result.exactAllMoveValuesComputed=false;result.rootOrdinaryWDL=null;}
    packet.firstDisprovingWitness=result;
    packet.disposition='PHYSICAL_DISPROVING_WITNESS';
    packet.counters.physicallyCachedUniqueGameStates+=memo.size;
    packet.counters.rootsChecked++;
    return packet;
   }
  }catch(e){
   if(e instanceof BudgetExceeded){timedOut=true;}
   else throw e;
  }
  packet.counters.physicallyCachedUniqueGameStates+=memo.size;
  packet.counters.rootsChecked++;
  if(timedOut)packet.counters.rootBudgetsIncomplete++;
 }
 return packet;
}

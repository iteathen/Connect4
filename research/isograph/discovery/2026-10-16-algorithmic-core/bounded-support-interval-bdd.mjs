// Bounded support-cone, exact WDL INTERVAL lattice over source-q residuals.
// No concrete game successor enumeration, policies, oracle labels or
// backward searched certificates enter formula construction.
// At a nonterminal cutoff support, unknown future WDL is [-1,+1].
// A complete root interval or action proves an EXACT bounded Bellman fact
// by monotonicity of P0 max / P1 min, with quantified action scope retained.
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
export class OwnerBDDBudgetError extends Error{
 constructor(message,detail){super(message);this.name='OwnerBDDBudgetError';this.detail=detail;}
}
export function createBoundedSupportIntervalBDDSolver({width:W,height:H,connect:K},sourceQ,{
 maxNodes=60000,maxApplyVisits=300000,maxSupports=10000,
 deadlineAt=Infinity,retainAllSupportFunctions=false,
 gcEverySupports=64,gcNodeHighWater=40000,maxDepth=8
}={}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('invalid finite gravity geometry');
 if(!Number.isInteger(maxDepth)||maxDepth<0||
    maxDepth>W*H)throw Error('invalid bounded support cone depth');
 if(!Number.isInteger(gcEverySupports)||gcEverySupports<1||
    !Number.isInteger(gcNodeHighWater)||gcNodeHighWater<2||
    gcNodeHighWater>maxNodes)
   throw Error('invalid garbage collection batch or high-water setting');
 const N=W*H,cell=(c,r)=>r*W+c,cellMask=(c,r)=>1n<<BigInt(cell(c,r));
 if(!sourceQ||!Array.isArray(sourceQ.h)||sourceQ.h.length!==W||
    sourceQ.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
    !Array.isArray(sourceQ.R0)||!Array.isArray(sourceQ.R1)||
    [...sourceQ.R0,...sourceQ.R1].some(m=>typeof m!=='bigint'||m===0n))
   throw Error('source requires a valid nonterminal q');
 const sourceH=sourceQ.h.slice(),Rsource=[sourceQ.R0.slice(),sourceQ.R1.slice()];
 let initiallyOccupied=0n;
 for(let c=0;c<W;c++)for(let row=0;row<sourceH[c];row++)
   initiallyOccupied|=cellMask(c,row);
 if([...Rsource[0],...Rsource[1]].some(m=>(m&initiallyOccupied)!==0n))
  throw Error('source residual contains an already occupied cell');
 const sourceRank=sourceH.reduce((a,b)=>a+b,0);
 if(sourceRank===N)throw Error('source is full-board terminal');

 const lineMap=new Map(),byCell=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of DIRS){
  if(c+(K-1)*dx<0||c+(K-1)*dx>=W||
     r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  const line=[];
  for(let k=0;k<K;k++)line.push(cell(c+k*dx,r+k*dy));
  const idx=line.map(String).join(',');
  lineMap.set(idx,line);
 }
 for(const line of lineMap.values())
  for(const i of line)byCell[i].push(line);
 const stats={
  supportsPlanned:0,supportsBuilt:0,supportEdgeCalls:0,
  activeSupportMax:0,childSupportReleases:0,
  BDDNodeCreates:0,peakNodesBeforeGC:2,peakLiveAfterGC:2,
  gcCount:0,gcNodesFreed:0,finalNodes:0,
  applyCalls:0,applyMisses:0,applyMemoHits:0,
  restrictCalls:0,restrictMisses:0,restrictMemoHits:0,
  notCalls:0,notMisses:0,notMemoHits:0,
  generatedImmediateLineTerms:0,sourceOwnershipLiteralUses:0,
  sourceResidualClauseChecks:0,sourceSizeTwoTerminals:0,
  sourceFutureCellsAtRoot:N-sourceRank,sourceRank,
  conditionalOwnerRestrictionCalls:0,
  BDDThresholdRootActionCount:0,
  WDLInputStatesVisitedDuringCompile:0,
  gameTreeRecursiveBranchesSolved:0,
  maxLiveActionRoots:0,compilerMs:0,
  maxDepth,intervalCutoffSupports:0,intervalCutoffActionBounds:0,
  gcEverySupports,gcNodeHighWater,gcDeferredSupports:0,
  gcByInterval:0,gcByHighWater:0,gcAtFinalRoot:0,
  retainAllSupportFunctions,finalRetainedSupportCount:0
 };
 const node0={var:Infinity,low:null,high:null},
  node1={var:Infinity,low:null,high:null};
 let nodes=[node0,node1],unique=new Map(),compiled=new Map(),
  applyMemo=new Map(),restrictMemo=new Map(),negMemo=new Map();
 const start=Date.now(),key=h=>h.join(',');
 function budget(){
  if(nodes.length>maxNodes||
    stats.applyMisses+stats.restrictMisses+stats.notMisses>maxApplyVisits||
    Date.now()>=deadlineAt)
   throw new OwnerBDDBudgetError('bounded ownership-incidence BDD construction limit',
    {...stats,nodes:nodes.length,maxNodes,maxApplyVisits,
     elapsedMs:Date.now()-start});
 }
 function mk(v,lo,hi){
  if(lo===hi)return lo;
  const k=v+':'+lo+':'+hi,old=unique.get(k);
  if(old!==undefined)return old;
  budget();
  if(nodes.length>=maxNodes)
   throw new OwnerBDDBudgetError('ROBDD live-node count exceeds fixed cap',
    {...stats,nodes:nodes.length,maxNodes,elapsedMs:Date.now()-start});
  const id=nodes.length;
  nodes.push({var:v,low:lo,high:hi});unique.set(k,id);
  stats.BDDNodeCreates++;
  stats.peakNodesBeforeGC=Math.max(stats.peakNodesBeforeGC,nodes.length);
  return id;
 }
 function ownerVar(v,who){
  stats.sourceOwnershipLiteralUses++;
  return who===0?mk(v,0,1):mk(v,1,0);
 }
 function negate(x){
  stats.notCalls++;
  if(x===0)return 1;if(x===1)return 0;
  const cached=negMemo.get(x);
  if(cached!==undefined){stats.notMemoHits++;return cached;}
  budget();stats.notMisses++;
  const n=nodes[x],res=mk(n.var,negate(n.low),negate(n.high));
  negMemo.set(x,res);return res;
 }
 function apply(op,a,b){
  stats.applyCalls++;
  if(a>b)[a,b]=[b,a];
  if(a===b)return a;
  if(op==='and'){
   if(a===0)return 0;if(a===1)return b;
  }else if(op==='or'){
   if(a===0)return b;if(b===1)return 1;
  }else throw Error('invalid BDD op');
  const k=op+':'+a+':'+b,cached=applyMemo.get(k);
  if(cached!==undefined){stats.applyMemoHits++;return cached;}
  budget();stats.applyMisses++;
  const A=nodes[a],B=nodes[b],v=Math.min(A.var,B.var);
  const lo=apply(op,A.var===v?A.low:a,B.var===v?B.low:b),
    hi=apply(op,A.var===v?A.high:a,B.var===v?B.high:b);
  const result=mk(v,lo,hi);
  applyMemo.set(k,result);
  return result;
 }
 const AND=terms=>terms.reduce((a,b)=>apply('and',a,b),1);
 const OR=terms=>terms.reduce((a,b)=>apply('or',a,b),0);
 function fix(x,variable,value,memo){
  stats.restrictCalls++;
  if(x<=1)return x;
  const n=nodes[x];
  if(n.var>variable)return x;
  if(n.var===variable)return value?n.high:n.low;
  const k=x+':'+variable+':'+Number(value),cached=memo.get(k);
  if(cached!==undefined){stats.restrictMemoHits++;return cached;}
  budget();stats.restrictMisses++;
  const out=mk(n.var,fix(n.low,variable,value,memo),
   fix(n.high,variable,value,memo));
  memo.set(k,out);return out;
 }
 function supportList(root){
   if(!Array.isArray(root)||root.length!==W||
      root.some(x=>!Number.isInteger(x)||x<0||x>H))
    throw Error('invalid root support');
   const h=root.slice(),out=[];
   function rec(col,depth){
    if(depth>maxDepth)return;
    if(col===W){out.push(h.slice());return;}
    for(let v=root[col];v<=Math.min(H,root[col]+maxDepth-depth);v++){
     h[col]=v;rec(col+1,depth+v-root[col]);
     if(out.length>maxSupports)
      throw new OwnerBDDBudgetError('bounded support cone exceeds fixed cap',
       {...stats,scheduledSupports:out.length,maxSupports,maxDepth});
    }
   }
   rec(0,0);
   out.sort((a,b)=>b.reduce((s,v)=>s+v,0)-a.reduce((s,v)=>s+v,0)||
     key(a).localeCompare(key(b)));
   stats.supportsPlanned=out.length;
   return out;
  }
 function termGuard(h,landing,player){
  // Exact terminal first-win predicate expressed entirely in ORIGINAL
  // q residual requirements. A hypothetical support h only contributes
  // new occupied owner variables for cells filled AFTER sourceH.
  let futureOccupied=0n;
  for(let c=0;c<W;c++)for(let row=sourceH[c];row<h[c];row++)
   futureOccupied|=cellMask(c,row);
  const targetBit=1n<<BigInt(landing),terms=[];
  for(const req of Rsource[player]){
   stats.sourceResidualClauseChecks++;
   if((req&targetBit)===0n)continue;
   const antecedent=req&~targetBit;
   // If an unsupplied future cell still belongs to this residual,
   // the newly placed landing cannot finish the target line.
   if((antecedent&~futureOccupied)!==0n)continue;
   stats.generatedImmediateLineTerms++;
   if(antecedent!==0n)stats.sourceSizeTwoTerminals++;
   const owners=[];
   for(let i=0;i<N;i++)
    if((antecedent&(1n<<BigInt(i)))!==0n)
     owners.push(ownerVar(i,player));
   terms.push(AND(owners));
  }
  return OR(terms);
 }
 function sweep(){
  const roots=[0,1];
  for(const c of compiled.values()){
   roots.push(c.Wlo,c.Whi,c.Nlo,c.Nhi);
   for(const a of c.action)roots.push(a.Wlo,a.Whi,a.Nlo,a.Nhi);
  }
  const live=new Set(),stack=roots.slice();
  while(stack.length){
   const id=stack.pop();
   if(live.has(id))continue;
   live.add(id);if(id>1){
    const n=nodes[id];if(!n)throw Error('dangling BDD id');
    stack.push(n.low,n.high);
   }
  }
  const oldLength=nodes.length,retained=[...live].sort((a,b)=>a-b),
    map=new Map(retained.map((id,i)=>[id,i]));
  const compact=retained.map(id=>id<=1?nodes[id]:{
    var:nodes[id].var,low:map.get(nodes[id].low),high:map.get(nodes[id].high)
  });
  const remap=id=>{const v=map.get(id);
   if(v===undefined)throw Error('live BDD root lost');
   return v;};
  for(const c of compiled.values()){
   c.Wlo=remap(c.Wlo);c.Whi=remap(c.Whi);
    c.Nlo=remap(c.Nlo);c.Nhi=remap(c.Nhi);
   for(const a of c.action){a.Wlo=remap(a.Wlo);a.Whi=remap(a.Whi);
      a.Nlo=remap(a.Nlo);a.Nhi=remap(a.Nhi);}
  }
  nodes=compact;unique=new Map();
  for(let i=2;i<nodes.length;i++){
   const n=nodes[i];
   const k=n.var+':'+n.low+':'+n.high;
   if(unique.has(k))throw Error('duplicate canonical BDD after sweep');
   unique.set(k,i);
  }
  applyMemo=new Map();restrictMemo=new Map();negMemo=new Map();
  stats.gcCount++;stats.gcNodesFreed+=oldLength-nodes.length;
  stats.peakLiveAfterGC=Math.max(stats.peakLiveAfterGC,nodes.length);
 }
 function compile(root=sourceH){
  if(compiled.size)throw Error('single-use compiler');
  if(!Array.isArray(root)||key(root)!==key(sourceH))
   throw Error('bounded algebra must start at its actual source q support');
  const begin=Date.now(),supports=supportList(root),parents=new Map();
  const cutoffRank=sourceRank+maxDepth;
  for(const h of supports)parents.set(key(h),0);
  for(const h of supports){
   const rank=h.reduce((s,x)=>s+x,0);
   if(rank>=cutoffRank||rank+1>=N)continue;
   for(let c=0;c<W;c++)if(h[c]<H){
    const child=h.slice();child[c]++;
    const id=key(child);
    if(!parents.has(id))throw Error('bounded child support missing '+id);
    parents.set(id,parents.get(id)+1);
   }
  }
  for(const h of supports){
   budget();
   const sk=key(h),rank=h.reduce((s,x)=>s+x,0),
    player=rank&1,action=[];
   let state;
   if(rank===N){
    state={h:h.slice(),sk,rank,action,
      Wlo:0,Whi:0,Nlo:1,Nhi:1};
   }else if(rank>=cutoffRank){
    stats.intervalCutoffSupports++;
    state={h:h.slice(),sk,rank,action,
      Wlo:0,Whi:1,Nlo:0,Nhi:1};
   }else{
    for(let c=0;c<W;c++){
     if(h[c]>=H)continue;
     stats.supportEdgeCalls++;
     const occupied=cell(c,h[c]),
       nextH=h.slice();nextH[c]++;
     const now=termGuard(h,occupied,player),
       full=rank+1===N;
     let wlo,whi,nlo,nhi;
     if(full){
      if(player===0){
       wlo=now;whi=now;nlo=1;nhi=1;
      }else{
       wlo=0;whi=0;nlo=negate(now);nhi=nlo;
      }
     }else{
      const child=compiled.get(key(nextH));
      if(!child)throw Error('missing previously built bounded child '+key(nextH));
      const memo=new Map();
      stats.conditionalOwnerRestrictionCalls+=4;
      const cwlo=fix(child.Wlo,occupied,player===0,memo),
       cwhi=fix(child.Whi,occupied,player===0,memo),
       cnlo=fix(child.Nlo,occupied,player===0,memo),
       cnhi=fix(child.Nhi,occupied,player===0,memo);
      if(player===0){
       wlo=OR([now,cwlo]);whi=OR([now,cwhi]);
       nlo=OR([now,cnlo]);nhi=OR([now,cnhi]);
      }else{
       const noWin=negate(now);
       wlo=AND([noWin,cwlo]);whi=AND([noWin,cwhi]);
       nlo=AND([noWin,cnlo]);nhi=AND([noWin,cnhi]);
      }
     }
     action.push({column:c,Wlo:wlo,Whi:whi,Nlo:nlo,Nhi:nhi});
     stats.BDDThresholdRootActionCount++;
    }
    const combine=player===0?OR:AND;
    state={h:h.slice(),sk,rank,action,
     Wlo:action.length?combine(action.map(a=>a.Wlo)):0,
     Whi:action.length?combine(action.map(a=>a.Whi)):0,
     Nlo:action.length?combine(action.map(a=>a.Nlo)):1,
     Nhi:action.length?combine(action.map(a=>a.Nhi)):1};
   }
   compiled.set(sk,state);stats.supportsBuilt++;
   if(!retainAllSupportFunctions&&
      (rank===N||rank===cutoffRank)&&sk!==key(root)&&
      parents.get(sk)===0){
    compiled.delete(sk);stats.childSupportReleases++;
   }
   for(const a of action){
    if(rank+1===N)continue;
    const hChild=h.slice();hChild[a.column]++;
    const id=key(hChild),left=parents.get(id)-1;
    if(left<0)throw Error('negative predecessor count');
    parents.set(id,left);
    if(left===0&&!retainAllSupportFunctions){
     compiled.delete(id);stats.childSupportReleases++;
    }
   }
   stats.activeSupportMax=Math.max(stats.activeSupportMax,compiled.size);
   stats.maxLiveActionRoots=Math.max(stats.maxLiveActionRoots,
    [...compiled.values()].reduce((k,c)=>k+4+4*c.action.length,0));
   const last=stats.supportsBuilt===supports.length,
     high=nodes.length>=gcNodeHighWater,
     periodic=stats.supportsBuilt%gcEverySupports===0;
   if(last||high||periodic){
    if(last)stats.gcAtFinalRoot++;
    else if(high)stats.gcByHighWater++;
    else stats.gcByInterval++;
    sweep();
   }else stats.gcDeferredSupports++;
  }
  if(!compiled.has(key(root))||
    (!retainAllSupportFunctions&&compiled.size!==1))
   throw Error('bounded support cone liveness mismatch');
  stats.compilerMs=Date.now()-begin;
  stats.finalNodes=nodes.length;stats.finalRetainedSupportCount=compiled.size;
  return compiled.get(key(root));
 }
 function evalBDD(id,p0Bits){
  let n=id;
  while(n>1){
   const node=nodes[n],owned=(p0Bits>>BigInt(node.var))&1n;
   n=owned?node.high:node.low;
  }
  return n===1;
 }
 function decodeSourceRoot(comp){
  if(comp.sk!==key(sourceH))throw Error('root support does not match source');
  const roots=[comp.Wlo,comp.Whi,comp.Nlo,comp.Nhi,
    ...comp.action.flatMap(a=>[a.Wlo,a.Whi,a.Nlo,a.Nhi])];
  if(roots.some(id=>id>1))
   throw Error('unbound future owner variable escaped source-root interval');
  const value=(w,n)=>w?1:n?0:-1,
    L=value(comp.Wlo===1,comp.Nlo===1),
    U=value(comp.Whi===1,comp.Nhi===1);
  if(comp.Wlo===1&&comp.Nlo!==1||
     comp.Whi===1&&comp.Nhi!==1||L>U)
   throw Error('invalid root WDL threshold interval');
  const actionIntervals=comp.action.map(a=>{
   const lo=value(a.Wlo===1,a.Nlo===1),
    hi=value(a.Whi===1,a.Nhi===1);
   if(a.Wlo===1&&a.Nlo!==1||a.Whi===1&&a.Nhi!==1||lo>hi)
    throw Error('invalid action WDL interval');
   return {column:a.column,lower:lo,upper:hi,exact:lo===hi};
  });
  const mover=sourceRank&1,exact=L===U,
   certifiedOptimal=exact?actionIntervals.filter(a=>
    mover===0?a.lower===L:a.upper===U).map(a=>a.column):[],
   certifiedSuboptimal=exact?actionIntervals.filter(a=>
    mover===0?a.upper<L:a.lower>U).map(a=>a.column):[],
   unresolved=exact?actionIntervals.filter(a=>
    !certifiedOptimal.includes(a.column)&&!certifiedSuboptimal.includes(a.column))
      .map(a=>a.column):actionIntervals.map(a=>a.column),
   completeBestMoves=exact&&unresolved.length===0?certifiedOptimal.slice():null,
   allActionIntervalsExact=actionIntervals.every(a=>a.exact);
  return {status:exact?'EXACT_ROOT_VALUE':'BOUNDED_WDL_INTERVAL',
    lower:L,upper:U,exactValue:exact?L:null,
    actionIntervals,certifiedOptimalMoves:certifiedOptimal,
    certifiedSuboptimalMoves:certifiedSuboptimal,
    unresolvedActionMoves:unresolved,
    completeBestMoves,allActionIntervalsExact,
    cutoffDepth:maxDepth,
    scope:'perfect-play P0-relative WDL lies in [lower,upper] under first-win rules; actions are literal fixed-mover moves'};
 }
 function liveOutput(comp){
  const roots=[comp.Wlo,comp.Whi,comp.Nlo,comp.Nhi,
   ...comp.action.flatMap(a=>[a.Wlo,a.Whi,a.Nlo,a.Nhi])],
   live=new Set(),todo=roots.slice();
  while(todo.length){
   const id=todo.pop();
   if(live.has(id))continue;
   live.add(id);
   if(id>1){const n=nodes[id];todo.push(n.low,n.high);}
  }
  return {reachableRootOutputNodes:live.size,
   allAliveBDDNodes:nodes.length,actionCount:comp.action.length};
 }
 return Object.freeze({compile,decodeSourceRoot,liveOutput,
  getSupport:(h)=>compiled.get(key(h)),
  stats:()=>({...stats,sourceResidual0:Rsource[0].length,
   sourceResidual1:Rsource[1].length,currentBDDNodes:nodes.length,
   currentlyRetainedSupportFunctions:compiled.size}),
  lineCount:lineMap.size,
  scope:'source-q anchored bounded-depth certified WDL interval Bellman support-DAG, no concrete state search during symbolic build; support fanout retained'});
}

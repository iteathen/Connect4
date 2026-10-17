// Exact W/D/L and literal-action W/D/L thresholds compiled bottom-up
// over SUPPORT states, with a reduced ordered Boolean decision diagram
// on ACTUAL occupied-cell owner-incidence variables.
//
// A structural coordinate change from q=(support,R0,R1): on legal supports,
// every residual requirement is determined by which previously filled cells
// were owned by P0 vs P1. Substituting the newly occupied cell's owner bit
// into the child value is the qualified owner-true/false q cofactor.
//
// No concrete colored boards/q states are generated in compilation,
// no game-tree winning policy is searched, no solved oracle used.
// All support edges are compiled, and all AND/OR fanout is honestly counted.

const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
export class OwnerBDDBudgetError extends Error{
 constructor(message,detail){super(message);this.name='OwnerBDDBudgetError';this.detail=detail;}
}
export function createOwnerIncidenceBDDSolver({width:W,height:H,connect:K},{
 maxNodes=60000,maxApplyVisits=300000,maxSupports=10000,
 deadlineAt=Infinity
}={}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('invalid finite gravity geometry');
 const N=W*H,cell=(c,r)=>r*W+c,cellMask=(c,r)=>1n<<BigInt(cell(c,r));
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
  conditionalOwnerRestrictionCalls:0,
  BDDThresholdRootActionCount:0,
  WDLInputStatesVisitedDuringCompile:0,
  gameTreeRecursiveBranchesSolved:0,
  maxLiveActionRoots:0,compilerMs:0
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
  function rec(col){
   if(col===W){out.push(h.slice());return;}
   for(let v=root[col];v<=H;v++){
    h[col]=v;rec(col+1);
    if(out.length>maxSupports)
     throw new OwnerBDDBudgetError('support rectangle exceeds declared cap',
      {...stats,maxSupports});
   }
  }
  rec(0);
  out.sort((a,b)=>b.reduce((s,v)=>s+v,0)-a.reduce((s,v)=>s+v,0)||
   key(a).localeCompare(key(b)));
  stats.supportsPlanned=out.length;return out;
 }
 function termGuard(h,landing,player){
  const already=new Set();
  for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)already.add(cell(c,r));
  const terms=[];
  for(const line of byCell[landing]){
   const others=line.filter(i=>i!==landing);
   if(others.some(i=>!already.has(i)))continue;
   stats.generatedImmediateLineTerms++;
   terms.push(AND(others.map(i=>ownerVar(i,player))));
  }
  return OR(terms);
 }
 function sweep(){
  const roots=[0,1];
  for(const c of compiled.values()){
   roots.push(c.W,c.N);
   for(const a of c.action)roots.push(a.W,a.N);
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
   c.W=remap(c.W);c.N=remap(c.N);
   for(const a of c.action){a.W=remap(a.W);a.N=remap(a.N);}
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
 function compile(root){
  if(compiled.size)throw Error('single-use compiler');
  const started=Date.now(),supports=supportList(root),parents=new Map();
  for(const h of supports)parents.set(key(h),0);
  for(const h of supports){
   const rank=h.reduce((s,x)=>s+x,0);
   if(rank+1===N)continue;
   for(let c=0;c<W;c++)if(h[c]<H){
    const child=h.slice();child[c]++;
    const id=key(child);
    if(!parents.has(id))throw Error('child support missing');
    parents.set(id,parents.get(id)+1);
   }
  }
  for(const h of supports){
   budget();const sk=key(h),rank=h.reduce((s,x)=>s+x,0),
     player=rank&1,action=[];
   for(let c=0;c<W;c++){
    if(h[c]>=H)continue;
    stats.supportEdgeCalls++;
    const occupied=cell(c,h[c]),
      nextH=h.slice();nextH[c]++;
    const now=termGuard(h,occupied,player),
      full=rank+1===N;
    let w,n;
    if(full){
     w=player===0?now:0;
     n=player===0?1:negate(now);
    }else{
     const child=compiled.get(key(nextH));
     if(!child)throw Error('topological child missing '+key(nextH));
     const memo=new Map();
     stats.conditionalOwnerRestrictionCalls+=2;
     const cw=fix(child.W,occupied,player===0,memo),
       cn=fix(child.N,occupied,player===0,memo);
     if(player===0){
      w=OR([now,cw]);n=OR([now,cn]);
     }else{
      const guard=negate(now);
      w=AND([guard,cw]);n=AND([guard,cn]);
     }
    }
    action.push({column:c,W:w,N:n});
    stats.BDDThresholdRootActionCount++;
   }
   const state={h:h.slice(),sk,rank,action,
    W:action.length===0?0:player===0?OR(action.map(a=>a.W)):AND(action.map(a=>a.W)),
    N:action.length===0?1:player===0?OR(action.map(a=>a.N)):AND(action.map(a=>a.N))};
   compiled.set(sk,state);stats.supportsBuilt++;
   if(rank===N&&sk!==key(root)&&parents.get(sk)===0){
    compiled.delete(sk);stats.childSupportReleases++;
   }
   for(const a of action){
    if(rank+1===N)continue;
    const hChild=h.slice();hChild[a.column]++;
    const id=key(hChild),left=parents.get(id)-1;
    if(left<0)throw Error('negative predecessor count');
    parents.set(id,left);
    if(left===0){compiled.delete(id);stats.childSupportReleases++;}
   }
   stats.activeSupportMax=Math.max(stats.activeSupportMax,compiled.size);
   stats.maxLiveActionRoots=Math.max(stats.maxLiveActionRoots,
    [...compiled.values()].reduce((k,c)=>k+2+2*c.action.length,0));
   sweep();
  }
  if(compiled.size!==1||!compiled.has(key(root)))
   throw Error('support live-root accounting incorrect');
  stats.compilerMs=Date.now()-started;stats.finalNodes=nodes.length;
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
 function decode(comp,{h,p0,p1}){
  if(!Array.isArray(h)||h.length!==W||key(h)!==comp.sk||
     typeof p0!=='bigint'||typeof p1!=='bigint'||(p0&p1)!==0n)
   throw Error('invalid colored input support');
  let occupied=0n;
  for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)occupied|=cellMask(c,r);
  if((p0|p1)!==occupied)throw Error('physical owner incidence not equal support');
  const makeValue=(w,n)=>w?1:n?0:-1;
  const Wv=evalBDD(comp.W,p0),Nv=evalBDD(comp.N,p0);
  if(Wv&&!Nv)throw Error('winning threshold implies nonloss failed');
  const value=makeValue(Wv,Nv),
    actionValues=comp.action.map(a=>[a.column,
      makeValue(evalBDD(a.W,p0),evalBDD(a.N,p0))]);
  return {value,bestMoves:actionValues.filter(([,v])=>v===value).map(([a])=>a),
    actionValues};
 }
 function liveOutput(comp){
  const roots=[comp.W,comp.N,...comp.action.flatMap(a=>[a.W,a.N])],
    marked=new Set(),todo=roots.slice();
  while(todo.length){
   const id=todo.pop();if(marked.has(id))continue;
   marked.add(id);if(id>1){const n=nodes[id];todo.push(n.low,n.high);}
  }
  const owners=[...marked].filter(id=>id>1).map(id=>nodes[id].var);
  return {reachableOutputBDDNodes:marked.size,
   distinctOutputOwnerVariables:new Set(owners).size,
   allAliveBDDNodes:nodes.length,actions:comp.action.length};
 }
 return Object.freeze({compile,decode,liveOutput,
  stats:()=>({...stats,currentBDDNodes:nodes.length,
   currentlyRetainedSupportFunctions:compiled.size}),
  lineCount:lineMap.size,
  scope:'exact first-win WDL threshold symbolic support-DAG over occupied owner incidence; no concrete state search during build, support AND/OR branching still encoded'});
}

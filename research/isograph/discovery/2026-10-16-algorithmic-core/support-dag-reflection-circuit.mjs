// Rule-only, complete W/D/L monotone threshold circuit over a SUPPORT DAG.
// Constructs no concrete q game states; no winning policy search, oracle
// queries, solved WDL frontiers or input-specific winner certificates.
// Preserves all literal action-specific WIN and NONLOSS front roots.
//
// This version is bottom-up, not recursive game-state expansion. It releases
// compiled child-support formulas after their LAST predecessor consumes them
// and hash-cons compacts all remaining DAG roots after every support.
//
// Passing a small root only proves a symbolic representation can finish
// with bounded resources, not that strategic alternation/AND-OR fanout
// vanishes or that construction is polynomial at arbitrary dimensions.

const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const subset=(a,b)=>(a&b)===a;
const pc=x=>{let n=0;for(;x;x&=x-1n)n++;return n;};
const bigintCompare=(a,b)=>a<b?-1:a>b?1:0;
export class SupportDAGBudgetError extends Error{
 constructor(message,metrics){super(message);this.name='SupportDAGBudgetError';this.metrics=metrics;}
}
export function createSupportDAGLiveCircuit({width:W,height:H,connect:K},{
 maxNodes=60000,maxSubstitutionVisits=300000,
 maxSupports=10000,deadlineAt=Infinity,simplifyByPoset=true,
 reflectionQuotient=false
}={}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('invalid finite ConnectK geometry');
 const cells=W*H,cell=(c,r)=>1n<<BigInt(r*W+c);
 const linemap=new Map();
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of DIRS){
  if(c+(K-1)*dx<0||c+(K-1)*dx>=W||
     r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let m=0n;
  for(let j=0;j<K;j++)m|=cell(c+j*dx,r+j*dy);
  linemap.set(String(m),m);
 }
 const lines=[...linemap.values()].sort(bigintCompare);
 let nodes=[{op:'const',value:false},{op:'const',value:true}],
    intern=new Map(),info=new Map(),compiled=new Map();
 const stats={
  supportsPlanned:0,supportsBuilt:0,supportEdges:0,
  supportTemporaryReleases:0,supportsRetainedAtRoot:0,
  maxSimultaneouslyRetainedSupportFormulas:0,
  allocatedNodesTotal:2,peakNodesBeforeSweep:2,
  peakLiveNodesAfterSweep:2,finalNodes:0,
  gcPasses:0,gcNodesFreed:0,
  gateBuilds:0,gateInternHits:0,
  substitutionVisits:0,substitutionMemoHits:0,
  sourceShapePairs:0,sourceShapeLinks:0,
  implicationTests:0,implicationAbsorptions:0,
  intermediateActionsBuilt:0,
  rootInputVariables:0,
  qStatesEvaluatedDuringCompilation:0,
  recursiveValueSolves:0,
  setupSupportMs:0,compilationMs:0,
  unquotientedSupports:0,reflectionOrbitSavings:0,
  mirroredChildActionSubstitutions:0,mirrorShapePreimages:0
 };
 const started=Date.now(),key=h=>h.join(',');
 const flipSupport=h=>h.slice().reverse();
 const canonicalSupport=h=>{
  if(!reflectionQuotient)return h;
  const mirrored=flipSupport(h);
  for(let i=0;i<W;i++){
   if(h[i]<mirrored[i])return h;
   if(h[i]>mirrored[i])return mirrored;
  }
  return h;
 };
 const reflectMask=m=>{
  let result=0n;
  for(let c=0;c<W;c++)for(let row=0;row<H;row++){
   const from=cell(c,row);
   if((m&from)!==0n)result|=cell(W-1-c,row);
  }
  return result;
 };
 function budget(){
  if(nodes.length>maxNodes||stats.substitutionVisits>maxSubstitutionVisits||
     Date.now()>=deadlineAt)
   throw new SupportDAGBudgetError('support-DAG circuit budget exceeded',
    {...stats,nodes:nodes.length,maxNodes,maxSubstitutionVisits,
     elapsedMs:Date.now()-started});
 }
 function internNode(k,create){
  const old=intern.get(k);
  if(old!==undefined){stats.gateInternHits++;return old;}
  budget();
  if(nodes.length>=maxNodes)
   throw new SupportDAGBudgetError('live Boolean node ceiling',
    {...stats,nodes:nodes.length,maxNodes,elapsedMs:Date.now()-started});
  const id=nodes.length;
  nodes.push(create());
  intern.set(k,id);stats.allocatedNodesTotal++;
  stats.peakNodesBeforeSweep=Math.max(stats.peakNodesBeforeSweep,nodes.length);
  return id;
 }
 function variable(sk,role,index){
  return internNode('v:'+sk+':'+role+':'+index,
   ()=>({op:'var',sk,role,index}));
 }
 function supportInfo(h){
  const sk=key(h);
  if(info.has(sk))return info.get(sk);
  let occupied=0n;
  for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)occupied|=cell(c,r);
  const unique=new Map();
  for(const m of lines){const remaining=m&~occupied;
   if(remaining!==0n)unique.set(String(remaining),remaining);
  }
  const shapes=[...unique.values()].sort((a,b)=>pc(a)-pc(b)||bigintCompare(a,b));
  const geometry={h:h.slice(),sk,rank:h.reduce((a,b)=>a+b,0),
   shapes,lookup:new Map(shapes.map((s,i)=>[String(s),i])),
   legal:h.flatMap((height,c)=>height<H?[c]:[])};
  info.set(sk,geometry);
  geometry.vars0=shapes.map((_,i)=>variable(sk,0,i));
  geometry.vars1=shapes.map((_,i)=>variable(sk,1,i));
  return geometry;
 }
 function implies(idA,idB){
  if(idA===idB)return true;
  const A=nodes[idA],B=nodes[idB];
  if(A.op!=='var'||B.op!=='var'||A.sk!==B.sk||A.role!==B.role)return false;
  stats.implicationTests++;
  const shapes=info.get(A.sk).shapes;
  return A.role===0?subset(shapes[A.index],shapes[B.index]):
    subset(shapes[B.index],shapes[A.index]);
 }
 function gate(op,raw){
  stats.gateBuilds++;
  const absorb=op==='and'?0:1,identity=op==='and'?1:0;
  let arr=[...new Set(raw)].sort((a,b)=>a-b);
  if(arr.includes(absorb))return absorb;
  arr=arr.filter(x=>x!==identity);
  if(simplifyByPoset&&arr.length>1){
   const keep=arr.map(()=>true);
   for(let i=0;i<arr.length;i++){
    if(!keep[i]||nodes[arr[i]].op!=='var')continue;
    for(let j=0;j<arr.length;j++){
     if(i===j||!keep[j]||nodes[arr[j]].op!=='var')continue;
     const redundant=op==='and'?implies(arr[i],arr[j]):implies(arr[j],arr[i]);
     if(redundant){keep[j]=false;stats.implicationAbsorptions++;}
    }
   }
   arr=arr.filter((_,i)=>keep[i]);
   const direct=arr.filter(id=>nodes[id].op==='var');
   if(direct.length){
    const old=arr.length;
    arr=arr.filter(id=>{
     const n=nodes[id];
     if((op==='and'&&n.op!=='or')||(op==='or'&&n.op!=='and'))
      return true;
     return !n.inputs.some(ch=>direct.some(d=>op==='and'?
      implies(d,ch):implies(ch,d)));
    });
    stats.implicationAbsorptions+=old-arr.length;
   }
  }
  if(arr.length===0)return identity;
  if(arr.length===1)return arr[0];
  return internNode(op+':'+arr.join(','),()=>({op,inputs:arr}));
 }
 const AND=a=>gate('and',a),OR=a=>gate('or',a);
 function childVariables(parent,child,landing,mover,mirrorChild){
  const replace=new Map();
  for(let j=0;j<child.shapes.length;j++){
   const dst=mirrorChild?reflectMask(child.shapes[j]):child.shapes[j],
     truePre=[],falsePre=[];
   if(mirrorChild)stats.mirrorShapePreimages++;
   for(let i=0;i<parent.shapes.length;i++){
    stats.sourceShapePairs++;
    const src=parent.shapes[i];
    if(subset(src&~landing,dst))truePre.push(i);
    if((src&landing)===0n&&subset(src,dst))falsePre.push(i);
   }
   stats.sourceShapeLinks+=truePre.length+falsePre.length;
   const p0=mover===0?truePre:falsePre;
   const p1=mover===1?truePre:falsePre;
   replace.set(child.vars0[j],OR(p0.map(i=>parent.vars0[i])));
   replace.set(child.vars1[j],AND(p1.map(i=>parent.vars1[i])));
  }
  return replace;
 }
 function substitute(root,replacements,memo){
  if(memo.has(root)){stats.substitutionMemoHits++;return memo.get(root);}
  budget();stats.substitutionVisits++;
  const n=nodes[root];
  let result;
  if(n.op==='const')result=root;
  else if(n.op==='var'){
   result=replacements.get(root);
   if(result===undefined)throw Error('unmapped child var '+n.sk);
  }else result=gate(n.op,n.inputs.map(id=>substitute(id,replacements,memo)));
  memo.set(root,result);
  return result;
 }
 function compact(){
  // Called only after a COMPLETE support is built: no live JavaScript
  // stack frame holds a transient node ID, so remapping is safe.
  const roots=[0,1];
  for(const i of info.values())roots.push(...i.vars0,...i.vars1);
  for(const c of compiled.values()){
   roots.push(c.W,c.N);
   for(const a of c.action)roots.push(a.W,a.N);
  }
  const live=new Set(),todo=roots.slice();
  while(todo.length){
   const id=todo.pop();
   if(live.has(id))continue;
   live.add(id);
   const n=nodes[id];
   if(!n)throw Error('compaction dangling id '+id);
   if(n.op==='and'||n.op==='or')todo.push(...n.inputs);
  }
  const oldSize=nodes.length,
    retained=[...live].sort((a,b)=>a-b);
  if(retained[0]!==0||retained[1]!==1)throw Error('constants not preserved');
  const remap=new Map(retained.map((id,i)=>[id,i]));
  const compacted=retained.map(id=>{
   const n=nodes[id];
   if(n.op==='and'||n.op==='or')
    return {...n,inputs:n.inputs.map(ch=>remap.get(ch))};
   return {...n};
  });
  const replace=id=>{const n=remap.get(id);
   if(n===undefined)throw Error('dangling root after GC '+id);
   return n;};
  for(const i of info.values()){
   i.vars0=i.vars0.map(replace);i.vars1=i.vars1.map(replace);
  }
  for(const c of compiled.values()){
   c.W=replace(c.W);c.N=replace(c.N);
   for(const a of c.action){a.W=replace(a.W);a.N=replace(a.N);}
  }
  nodes=compacted;intern=new Map();
  for(let id=2;id<nodes.length;id++){
   const n=nodes[id],
      idkey=n.op==='var'?'v:'+n.sk+':'+n.role+':'+n.index:
       n.op+':'+n.inputs.join(',');
   if(intern.has(idkey))throw Error('GC introduced duplicate canonical DAG node');
   intern.set(idkey,id);
  }
  stats.gcPasses++;stats.gcNodesFreed+=oldSize-nodes.length;
  stats.peakLiveNodesAfterSweep=Math.max(stats.peakLiveNodesAfterSweep,nodes.length);
 }
 function supportsFrom(root){
  const values=[],h=root.slice();
  function recurse(c){
   if(c===W){values.push(h.slice());return;}
   for(let n=root[c];n<=H;n++){
    h[c]=n;recurse(c+1);
    if(values.length>maxSupports)
     throw new SupportDAGBudgetError('too many supports in target support rectangle',
      {...stats,scheduledSupports:values.length,maxSupports});
   }
  }
  recurse(0);
  stats.unquotientedSupports=values.length;
  if(reflectionQuotient){
   if(root.some((x,i)=>x!==root[W-1-i]))
    throw Error('reflection quotient requires a symmetric starting support');
  }
  const representatives=reflectionQuotient?
    [...new Map(values.map(v=>[key(canonicalSupport(v)),canonicalSupport(v)])).values()]:
    values;
  representatives.sort((a,b)=>b.reduce((s,x)=>s+x,0)-a.reduce((s,x)=>s+x,0)||
   key(a).localeCompare(key(b)));
  stats.supportsPlanned=representatives.length;
  stats.reflectionOrbitSavings=values.length-representatives.length;
  return representatives;
 }
 function compile(root){
  if(compiled.size||info.size)throw Error('compile may be called only once per builder');
  const first=Date.now(),rootKey=key(root),supports=supportsFrom(root);
  const predecessors=new Map(supports.map(h=>[key(h),0]));
  // Reference counting is by *literal canonical-parent action edge*,
  // including distinct mirrored actions targeting the same child orbit.
  for(const h of supports){
   if(h.reduce((sum,n)=>sum+n,0)+1===cells)continue;
   for(let col=0;col<W;col++){
    if(h[col]===H)continue;
    const raw=h.slice();raw[col]++;
    const id=key(canonicalSupport(raw));
    if(!predecessors.has(id))throw Error('missing orbit child '+id);
    predecessors.set(id,predecessors.get(id)+1);
   }
  }
  stats.setupSupportMs=Date.now()-first;
  for(const h of supports){
   budget();const parent=supportInfo(h),mover=parent.rank&1;
   const action=[];
   for(const col of parent.legal){
    budget();stats.supportEdges++;
    const x=cell(col,h[col]),nextH=h.slice();nextH[col]++;
    const full=parent.rank+1===cells,
      childActual=canonicalSupport(nextH),
      childKey=key(childActual),
      mirrorChild=childKey!==key(nextH);
    if(mirrorChild)stats.mirroredChildActionSubstitutions++;
    const single=parent.lookup.get(String(x));
    const winNow=mover===0&&single!==undefined?parent.vars0[single]:0;
    const p1NotWin=mover===1&&single!==undefined?parent.vars1[single]:1;
    let Wact,Nact;
    if(full){
     Wact=mover===0?winNow:0;
     Nact=mover===0?1:p1NotWin;
    }else{
     const child=compiled.get(childKey);
     if(!child)throw Error('support topological order missing '+childKey);
     const input=childVariables(parent,supportInfo(childActual),x,mover,mirrorChild);
     const substMemo=new Map(),
       nextW=substitute(child.W,input,substMemo),
       nextN=substitute(child.N,input,substMemo);
     if(mover===0){
      Wact=OR([winNow,nextW]);Nact=OR([winNow,nextN]);
     }else{
      Wact=AND([p1NotWin,nextW]);Nact=AND([p1NotWin,nextN]);
     }
    }
    action.push({column:col,W:Wact,N:Nact});stats.intermediateActionsBuilt++;
   }
   compiled.set(parent.sk,{supportKey:parent.sk,h:h.slice(),
    W:action.length===0?0:
      mover===0?OR(action.map(x=>x.W)):AND(action.map(x=>x.W)),
    N:action.length===0?1:
      mover===0?OR(action.map(x=>x.N)):AND(action.map(x=>x.N)),
    action});
   stats.supportsBuilt++;
   // Consume all already-built children and release those never needed again.
   for(const col of parent.legal){
    if(parent.rank+1===cells)continue;
    const childKey=key(canonicalSupport(h.map((v,j)=>v+Number(j===col))));
    const remain=predecessors.get(childKey)-1;
    if(remain<0)throw Error('negative child predecessor use count');
    predecessors.set(childKey,remain);
    if(remain===0){compiled.delete(childKey);stats.supportTemporaryReleases++;}
   }
   stats.maxSimultaneouslyRetainedSupportFormulas=Math.max(
    stats.maxSimultaneouslyRetainedSupportFormulas,compiled.size);
   compact();
  }
  if(compiled.size!==1||!compiled.has(rootKey))
   throw Error('root support liveness incorrect');
  stats.supportsRetainedAtRoot=compiled.size;
  const out=compiled.get(rootKey),rootInfo=info.get(rootKey);
  stats.rootInputVariables=rootInfo.vars0.length+rootInfo.vars1.length;
  stats.finalNodes=nodes.length;
  stats.compilationMs=Date.now()-first;
  return out;
 }
 function assign(q){
  const x=info.get(key(q.h));
  if(!x||!Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('wrong or uncompiled q support');
  const inputs=new Map();
  for(let i=0;i<x.shapes.length;i++){
   const shape=x.shapes[i];
   inputs.set(x.vars0[i],q.R0.some(r=>subset(r,shape)));
   inputs.set(x.vars1[i],!q.R1.some(r=>subset(r,shape)));
  }
  return inputs;
 }
 function evaluate(id,inputs,cache){
  if(cache.has(id))return cache.get(id);
  const n=nodes[id];
  let v;
  if(n.op==='const')v=n.value;
  else if(n.op==='var'){
   if(!inputs.has(id))throw Error('unassigned symbolic variable '+n.sk);
   v=inputs.get(id);
  }else if(n.op==='and'){
   v=n.inputs.every(child=>evaluate(child,inputs,cache));
  }else if(n.op==='or'){
   v=n.inputs.some(child=>evaluate(child,inputs,cache));
  }else throw Error('unknown circuit op');
  cache.set(id,v);return v;
 }
 function decode(comp,q){
  const inputs=assign(q),cache=new Map();
  const threshold=(w,n)=>w?1:n?0:-1;
  const Wv=evaluate(comp.W,inputs,cache),Nv=evaluate(comp.N,inputs,cache);
  if(Wv&&!Nv)throw Error('threshold nesting W implies N violated');
  const value=threshold(Wv,Nv),
    actions=comp.action.map(a=>[a.column,
      threshold(evaluate(a.W,inputs,cache),evaluate(a.N,inputs,cache))]);
  const best=actions.filter(([,v])=>v===value).map(([a])=>a);
  return {value,bestMoves:best,actionValues:actions,
   circuitNodesEvaluated:cache.size};
 }
 function liveStats(comp){
  const roots=[comp.W,comp.N,...comp.action.flatMap(a=>[a.W,a.N])],
    marked=new Set(),stack=roots.slice();
  let leaves=0,and=0,or=0,edges=0;
  while(stack.length){
   const id=stack.pop();
   if(marked.has(id))continue;marked.add(id);
   const n=nodes[id];
   if(n.op==='var')leaves++;
   if(n.op==='and'||n.op==='or'){
    if(n.op==='and')and++;else or++;
    edges+=n.inputs.length;stack.push(...n.inputs);
   }
  }
  return {liveRootsAndActions:marked.size,variableLeaves:leaves,
   andGates:and,orGates:or,fanInEdges:edges,
   globalInfoVariableRoots:info.size,
   allocatedNodeSlots:nodes.length};
 }
 return Object.freeze({compile,decode,liveStats,
  stats:()=>({...stats,reflectionQuotient,currentNodes:nodes.length,
   supportInfos:info.size,compiledSupportFunctions:compiled.size}),
  getSourceGeom:()=>({width:W,height:H,connect:K,lineCount:lines.length}),
  note:'A complete rank-lattice symbolic WDL solver over support-dependent residual coordinates; preserved action fronts; Boolean DAG fanout is still strategic branching encoded symbolically.'
 });
}

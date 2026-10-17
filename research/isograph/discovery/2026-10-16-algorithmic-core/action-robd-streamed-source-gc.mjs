// Exact action-bit ROBDD over source-rule guarded QBF, with fused quantification.
// Distinct functions share canonical nodes under fixed variable order.
// This is NOT a guarantee of polynomial size or strategic branch elimination.
export function createActionROBDDProjection({maxNodes=60000,maxOperations=300000,maxMs=15000,variableOrder='chronological'}={}) {
 const started=Date.now();let nodes=[null],unique=new Map(),applyCache=new Map();
 const stats={sourceGates:0,originalInputs:0,BDDNodeCreates:0,applyCalls:0,
  applyMisses:0,applyHits:0,abstractionCalls:0,abstractionMisses:0,
  abstractionHits:0,compilationApplyMisses:0,compilationNodes:0,
  afterCompilerLive:0,abstractedBits:0,peakAllocatedNodes:0,
  rootLookups:0,operations:0,sourceSupportsMaterialized:0,
  gcCycles:0,gcCopiedNodes:0,gcEdges:0,gcVisits:0,gcUniqueReinsertions:0,
  gcPeakSimultaneousNodes:0,gcCollectedOldNodes:0,
  compilerGCCycles:0,compilerGCActiveRootsMax:0,
  gameStateSearchCalls:0,oracleCalls:0};
 let rank=[];
 class Limit extends Error {constructor(kind){super('ROBDD_'+kind+'_LIMIT');this.kind=kind;}}
 function budget(){if(nodes.length-1>maxNodes)throw new Limit('NODE');
  if(stats.operations>maxOperations)throw new Limit('OP');
  if(Date.now()-started>maxMs)throw new Limit('TIME');}
 function charge(){stats.operations++;budget();}
 const neg=f=>f^1,top=f=>f<=1?Infinity:nodes[f>>>1].v;
 const low=f=>f<=1?f:nodes[f>>>1].lo^(f&1);
 const high=f=>f<=1?f:nodes[f>>>1].hi^(f&1);
 function mk(v,lo,hi){
  if(lo===hi)return lo;
  if(hi&1)return neg(mk(v,neg(lo),neg(hi)));
  const key=v+':'+lo+':'+hi,old=unique.get(key);
  if(old!==undefined)return old;
  if(nodes.length-1>=maxNodes)throw new Limit('NODE');
  const id=nodes.length,h=id*2;
  nodes.push({v,lo,hi});unique.set(key,h);
  stats.BDDNodeCreates++;stats.peakAllocatedNodes=Math.max(stats.peakAllocatedNodes,nodes.length-1);
  return h;
 }
 function apply(op,a,b){
  stats.applyCalls++;
  if(op==='and'){
   if(a===0||b===0)return 0;if(a===1)return b;if(b===1)return a;
   if(a===b)return a;if(a===neg(b))return 0;
  }else if(op==='or'){
   if(a===1||b===1)return 1;if(a===0)return b;if(b===0)return a;
   if(a===b)return a;if(a===neg(b))return 1;
  }else throw Error('bad Boolean operator');
  if(a>b)[a,b]=[b,a];
  const key=op+':'+a+':'+b,cached=applyCache.get(key);
  if(cached!==undefined){stats.applyHits++;return cached;}
  stats.applyMisses++;charge();
  const v=Math.min(top(a),top(b));
  const lo=apply(op,top(a)===v?low(a):a,top(b)===v?low(b):b);
  const hi=apply(op,top(a)===v?high(a):a,top(b)===v?high(b):b);
  const out=mk(v,lo,hi);applyCache.set(key,out);return out;
 }
 function reachable(root){
  const seen=new Set(),stack=[root];let visits=0;
  while(stack.length){const f=stack.pop();visits++;
   if(f<=1||seen.has(f>>>1))continue;
   seen.add(f>>>1);const n=nodes[f>>>1];stack.push(n.lo,n.hi);
  }
  return {count:seen.size,visits};
 }
 // Exact canonical ROBDD reachability copy (after a fully completed
 // source compilation or quantified block, never inside an APPLY).
 // On every input assignment, signed Shannon lo/hi meanings are unchanged.
 function compactRoots(roots) {
  const old=nodes,oldN=old.length-1;
  const fresh=[null],newUnique=new Map(),mapped=new Map();
  function copy(f){
   stats.gcVisits++;
   if(f<=1)return f;
   const id=f>>>1,flip=f&1,stored=mapped.get(id);
   if(stored!==undefined)return stored^flip;
   const n=old[id];if(!n)throw Error('GC missing ROBDD source node');
   stats.gcEdges+=2;
   const l=copy(n.lo),h=copy(n.hi);
   if(h&1)throw Error('GC lost normalized high edge');
   if(l===h)throw Error('GC input diagram not reduced');
   const key=n.v+':'+l+':'+h;
   if(newUnique.has(key))throw Error('GC found duplicate canonical cofactor');
   const newId=fresh.length,nh=newId*2;
   if(oldN+newId>maxNodes)throw new Limit('COMPACTION_SPACE');
   fresh.push({v:n.v,lo:l,hi:h});
   newUnique.set(key,nh);mapped.set(id,nh);
   stats.gcCopiedNodes++;stats.gcUniqueReinsertions++;
   stats.gcPeakSimultaneousNodes=Math.max(stats.gcPeakSimultaneousNodes,oldN+newId);
   return nh^flip;
  }
  const newRoots=roots.map(copy);
  nodes=fresh;unique=newUnique;applyCache=new Map();
  stats.gcCycles++;stats.gcCollectedOldNodes+=oldN-(fresh.length-1);
  budget();return newRoots;
 }
 const compact=root=>compactRoots([root])[0];
 function compile(cnf){
  const A=cnf.inputVariables,G=cnf.auxiliaryVariables,actions=cnf.prefix.filter(b=>b.kind==='action');
  stats.sourceGates=G;stats.originalInputs=A;
  const order=Array.from({length:A},(_,i)=>i+1);
  if(variableOrder==='reverse')order.reverse();
  else if(variableOrder!=='chronological')throw Error('bad order');
  rank=Array(A+1);order.forEach((id,i)=>rank[id]=i);
  const f=Array(cnf.variables+1),remaining=new Uint32Array(cnf.variables+1);
  for(let i=0;i<G;i++){
    const ca=cnf.clauses[3*i],cb=cnf.clauses[3*i+1];
    remaining[Math.abs(ca[1])]++;remaining[Math.abs(cb[1])]++;
  }
  if(cnf.outputLiteral!==0&&cnf.outputLiteral!==Infinity)
    remaining[Math.abs(cnf.outputLiteral)]++;
  for(let i=1;i<=A;i++)f[i]=mk(rank[i],0,1);
  const lit=x=>x<0?neg(f[-x]):f[x];
  try {
   for(let j=0;j<G;j++){
    const ca=cnf.clauses[j*3],cb=cnf.clauses[j*3+1],cc=cnf.clauses[j*3+2],
     id=-ca[0],a=ca[1],b=cb[1];
    if(id!==A+1+j||-cb[0]!==id||cc[0]!==id||
      cc[1]!==-a||cc[2]!==-b)throw Error('bad Tseitin gate');
    if(f[Math.abs(a)]===undefined||f[Math.abs(b)]===undefined)
      throw Error('source last-use schedule omitted live gate');
    f[id]=apply('and',lit(a),lit(b));
    if(--remaining[Math.abs(a)]===0)f[Math.abs(a)]=undefined;
    if(--remaining[Math.abs(b)]===0)f[Math.abs(b)]=undefined;
    if(nodes.length-1>15000&&(j+1)%40===0){
      const ids=[];
      for(let x=1;x<=id;x++)if(remaining[x]>0&&f[x]!==undefined)ids.push(x);
      const copied=compactRoots(ids.map(x=>f[x]));
      ids.forEach((x,t)=>f[x]=copied[t]);
      stats.compilerGCCycles++;stats.compilerGCActiveRootsMax=Math.max(stats.compilerGCActiveRootsMax,ids.length);
    }
   }
   stats.compilationApplyMisses=stats.applyMisses;
   stats.compilationNodes=nodes.length-1;
   const root=cnf.outputLiteral===Infinity?1:cnf.outputLiteral===0?0:lit(cnf.outputLiteral);
   stats.afterCompilerLive=reachable(root).count;
   return {status:'COMPILED',root,actions,A};
  }catch(e){if(e instanceof Limit)return {status:'BUDGET_EXHAUSTED',stage:'compile',kind:e.kind};throw e;}
 }
 function quantify(root,block){
  let result=root;
  for(const variable of block.vars.slice().reverse()){
   const target=rank[variable],op=block.quantifier==='e'?'or':'and',memo=new Map();
   function visit(f){
    stats.abstractionCalls++;
    if(f<=1||top(f)>target)return f;
    const known=memo.get(f);if(known!==undefined){stats.abstractionHits++;return known;}
    stats.abstractionMisses++;charge();
    const out=top(f)===target?apply(op,low(f),high(f)):mk(top(f),visit(low(f)),visit(high(f)));
    memo.set(f,out);return out;
   }
   result=visit(result);stats.abstractedBits++;
  }
  return result;
 }
 function finish(cnf,{legalColumns=null}={}){
  const compiled=compile(cnf);
  if(compiled.status!=='COMPILED')return {...compiled,statistics:{...stats,elapsedMs:Date.now()-started}};
  const stages=[];
  try{
   let root=compact(compiled.root);
   for(let t=compiled.actions.length-1;t>=1;t--){
    root=quantify(root,compiled.actions[t]);
    root=compact(root);
    stages.push({action:t,quantifier:compiled.actions[t].quantifier,operations:stats.operations,
      allocatedNodes:nodes.length-1,reachableNodes:reachable(root).count,doneBits:stats.abstractedBits});
   }
   const first=compiled.actions[0],width=1<<first.vars.length;
   const columns=legalColumns??Array.from({length:width},(_,c)=>c);
   if(columns.some(c=>!Number.isInteger(c)||c<0||c>=width))throw Error('bad legal label');
   const result=[];
   for(const c of columns){
    let h=root;
    for(let j=0;j<first.vars.length;j++){
     const v=rank[first.vars[j]],value=!!(c&(1<<j)),memo=new Map();
     function restrict(f){
      if(f<=1||top(f)>v)return f;
      const cache=memo.get(f);if(cache!==undefined)return cache;
      const r=top(f)===v?(value?high(f):low(f)):mk(top(f),restrict(low(f)),restrict(high(f)));
      memo.set(f,r);return r;
     }
     h=restrict(h);
    }
    if(h>1)throw Error('unquantified future variable');
    result.push({column:c,threshold:h===1});stats.rootLookups++;
   }
   return {status:'EXACT_ACTION_VECTOR',actionValues:result,
     stats:{...stats,elapsedMs:Date.now()-started},stages};
  }catch(e){
   if(e instanceof Limit)return {status:'BUDGET_EXHAUSTED',stage:'project',kind:e.kind,
    stats:{...stats,elapsedMs:Date.now()-started},stages};
   throw e;
  }
 }
 return {compile,finish,apply,quantify,reachable,statistics:stats};
}

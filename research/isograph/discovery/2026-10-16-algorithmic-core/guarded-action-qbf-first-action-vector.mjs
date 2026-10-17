// One shared first-action Boolean-threshold vector. The original outer
// action code stays FREE while *all inner* alternating blocks are eliminated.
// This does not remove inner adaptive work; it avoids separately projecting
// the same future for each possible first-action label. No game-tree search.
// Exact alternation-preserving quantified Shannon projection on the
// deterministic source-QBF AND/NOT matrix. No concrete game-state search.
export class QuantifiedProjectionBudget extends Error {
  constructor(detail){super('QBF_QUANTIFIED_PROJECTION_BUDGET');this.detail=detail;}
}
export function projectFirstActionVector(cnf,{
  legalColumns=null,
  maxNodes=60000,maxOperations=300000,maxMs=15000
}={}){
  const started=Date.now(),A=cnf.inputVariables,G=cnf.auxiliaryVariables,
    F=0,T=Infinity,neg=x=>x===0?T:x===T?F:-x,
    rawNodes=cnf.variables,originalClauses=cnf.clauses.length;
  const stats={sourceActionInputBits:A,sourceGateVariables:G,
    sourceCNFClauses:originalClauses,sourcePrimalEdges:cnf.primalEdges,
    projectionNodesCreated:0,peakRetainedNodes:cnf.variables,
    quantifiedActionBits:0,shannonCofactorsComputed:0,
    cofactorCalls:0,cofactorMisses:0,cofactorSupportSkips:0,
    cofactorMemoHits:0,andCalls:0,andCacheHits:0,andCreates:0,
    nontrivialOperations:0,gameStateContinuationsVisited:0,
    supportRepresentativesGenerated:0,oracleCalls:0,
    gcCycles:0,gcCopiedGates:0,gcChildEdgesTraversed:0,
    gcInputEquivalenceChecks:0,gcEvaluateNodeVisits:0,
    peakBeforeCompaction:cnf.variables,peakAfterCompaction:cnf.variables,
    compactionWorkUnits:0};
  let nodes=Array(cnf.variables+1),support=Array(cnf.variables+1).fill(0n),
    unique=new Map();
  for(let i=1;i<=A;i++)support[i]=1n<<BigInt(i-1);
  let maxId=cnf.variables;
  function budget(){
    if(maxId>maxNodes||stats.nontrivialOperations>maxOperations||Date.now()-started>maxMs)
      throw new QuantifiedProjectionBudget({...stats,maxNodes,maxOperations,maxMs,
        elapsedMs:Date.now()-started});
  }
  function key(a,b){return a<b?a+','+b:b+','+a;}
  function mask(lit){return lit===F||lit===T?0n:support[Math.abs(lit)];}
  for(let j=0;j<G;j++){
    const a=cnf.clauses[3*j],b=cnf.clauses[3*j+1],third=cnf.clauses[3*j+2];
    const id=-a[0],lhs=a[1],rhs=b[1];
    if(a.length!==2||b.length!==2||third.length!==3||
       -b[0]!==id||third[0]!==id||third[1]!==-lhs||third[2]!==-rhs||
       id!==A+j+1)throw Error('not a complete deterministic AND-definition CNF');
    nodes[id]={a:lhs,b:rhs};support[id]=mask(lhs)|mask(rhs);
    unique.set(key(lhs,rhs),id);
  }
  function and(a,b){
    stats.andCalls++;
    if(a===F||b===F)return F;
    if(a===T)return b;
    if(b===T)return a;
    if(a===b)return a;
    if(a===neg(b))return F;
    const hash=key(a,b),found=unique.get(hash);
    if(found!==undefined){stats.andCacheHits++;return found;}
    budget();
    if(maxId>=maxNodes)throw new QuantifiedProjectionBudget({...stats,
      maxNodes,maxOperations,maxMs,elapsedMs:Date.now()-started});
    const id=++maxId;nodes[id]={a,b};support[id]=mask(a)|mask(b);
    unique.set(hash,id);stats.andCreates++;stats.projectionNodesCreated++;
    stats.nontrivialOperations++;stats.peakRetainedNodes=Math.max(stats.peakRetainedNodes,maxId);
    budget();return id;
  }
  const or=(a,b)=>neg(and(neg(a),neg(b)));
  function restrict(lit,target,value,memo){
    stats.cofactorCalls++;
    if(lit===F||lit===T)return lit;
    const id=Math.abs(lit),isNeg=lit<0;
    if(id===target)return isNeg?(value?F:T):(value?T:F);
    if((support[id]&(1n<<BigInt(target-1)))===0n){stats.cofactorSupportSkips++;return lit;}
    const cached=memo.get(id);
    if(cached!==undefined){stats.cofactorMemoHits++;return isNeg?neg(cached):cached;}
    if(id<=A)throw Error('unexpected second input variable in support');
    budget();
    stats.cofactorMisses++;stats.nontrivialOperations++;
    const {a,b}=nodes[id];
    const v=and(restrict(a,target,value,memo),restrict(b,target,value,memo));
    memo.set(id,v);budget();return isNeg?neg(v):v;
  }
  // Compaction runs ONLY after both cofactors and their quantifier operator
  // return, so no in-flight cofactor reference or memo survives a reindex.
  function truthAt(root,assignment){
    const memo=new Map();
    function evalLit(lit){
      stats.gcEvaluateNodeVisits++;stats.compactionWorkUnits++;
      if(lit===F)return false;if(lit===T)return true;
      const id=Math.abs(lit);
      let v;
      if(id<=A){v=!!assignment[id];}
      else if(memo.has(id))v=memo.get(id);
      else {const n=nodes[id];if(!n)throw Error('GC equivalence missing gate');
        v=evalLit(n.a)&&evalLit(n.b);memo.set(id,v);}
      return lit<0?!v:v;
    }
    return evalLit(root);
  }
  function compact(root){
    budget();
    const oldSize=maxId;
    const assignments=[0,1,2,3].map(kind=>{
      const bits=Array(A+1).fill(false);
      for(let i=1;i<=A;i++)bits[i]=kind===0?false:kind===1?true:
        kind===2?((i&1)===0):((Math.imul(i,0x45d9f3b)^0x5a5a5a5a)&4)!==0;
      return bits;
    });
    const before=assignments.map(a=>truthAt(root,a));
    const mapped=new Map(),newNodes=Array(A+1),newSupport=Array(A+1).fill(0n),newUnique=new Map();
    for(let i=1;i<=A;i++)newSupport[i]=1n<<BigInt(i-1);
    let newMax=A;
    const newMask=l=>l===F||l===T?0n:newSupport[Math.abs(l)];
    function move(lit){
      stats.compactionWorkUnits++;
      if(lit===F||lit===T||Math.abs(lit)<=A)return lit;
      const id=Math.abs(lit),known=mapped.get(id);
      if(known!==undefined)return lit<0?-known:known;
      const n=nodes[id];if(!n)throw Error('GC source missing');
      stats.gcChildEdgesTraversed+=2;stats.compactionWorkUnits+=2;
      const a=move(n.a),b=move(n.b),newId=++newMax;
      newNodes[newId]={a,b};newSupport[newId]=newMask(a)|newMask(b);
      const hash=key(a,b);if(newUnique.has(hash))throw Error('GC duplicated unique AND');
      newUnique.set(hash,newId);mapped.set(id,newId);
      stats.gcCopiedGates++;stats.compactionWorkUnits++;
      return lit<0?-newId:newId;
    }
    const newRoot=move(root);
    nodes=newNodes;support=newSupport;unique=newUnique;maxId=newMax;
    const after=assignments.map(a=>truthAt(newRoot,a));
    for(let i=0;i<before.length;i++){
      stats.gcInputEquivalenceChecks++;stats.compactionWorkUnits++;
      if(before[i]!==after[i])throw Error('GC changed circuit semantics sample '+i);
    }
    stats.gcCycles++;stats.peakBeforeCompaction=Math.max(stats.peakBeforeCompaction,oldSize);
    stats.peakAfterCompaction=Math.max(stats.peakAfterCompaction,newMax);
    budget();
    return newRoot;
  }
  const actions=cnf.prefix.filter(b=>b.kind==='action');
  if(actions.flatMap(b=>b.vars).length!==A)throw Error('action quantifier prefix mismatch');
  let output=cnf.outputLiteral;
  const stages=[];
  try{
    for(let t=actions.length-1;t>=1;t--){
      const block=actions[t];
      for(const bit of block.vars.slice().reverse()){
        const low=restrict(output,bit,false,new Map());
        const high=restrict(output,bit,true,new Map());
        stats.shannonCofactorsComputed+=2;
        output=block.quantifier==='e'?or(low,high):and(low,high);
        stats.quantifiedActionBits++;
        const retainedBeforeGC=maxId,opsBeforeGC=stats.nontrivialOperations;
        output=compact(output);
        stages.push({actionIndex:t,quantifier:block.quantifier,bit,
          remainingSupportBits:mask(output).toString(16),
          retainedBeforeGC,liveGateNodesAfterGC:maxId-A,
          retainedNodeIdsAfterGC:maxId,nontrivialOperations:opsBeforeGC,
          compactionWorkUnits:stats.compactionWorkUnits,
          cofactorMisses:stats.cofactorMisses});
        budget();
      }
    }
    const first=actions[0],width=1<<first.vars.length;
    if(legalColumns===null)legalColumns=Array.from({length:width},(_,i)=>i);
    if(!Array.isArray(legalColumns)||legalColumns.some(c=>
        !Number.isInteger(c)||c<0||c>=width)||
        new Set(legalColumns).size!==legalColumns.length)
      throw Error('invalid legal first-action columns');
    const remainingMask=mask(output);
    for(let i=1;i<=A;i++){
      if((remainingMask&(1n<<BigInt(i-1)))!==0n&&!first.vars.includes(i))
        throw Error('future action variable survives quantified projection');
    }
    const actionValues=[];
    for(const c of legalColumns){
      const values=Array(A+1).fill(false);
      for(let j=0;j<first.vars.length;j++)values[first.vars[j]]=(c&(1<<j))!==0;
      const before=stats.gcEvaluateNodeVisits;
      const truth=truthAt(output,values);
      actionValues.push({column:c,threshold:truth});
      stats.actionLookupVisits=(stats.actionLookupVisits||0)+stats.gcEvaluateNodeVisits-before;
    }
    return {status:'EXACT_ACTION_VECTOR',actionValues,stats,stages,
      quantifiedFutureBits:stats.quantifiedActionBits,
      projectedFirstActionBits:first.vars.slice(),
      remainingFirstActionSupportMask:remainingMask.toString(16),
      elapsedMs:Date.now()-started};
  }catch(e){
    if(e instanceof QuantifiedProjectionBudget)
      return {status:'BUDGET_EXHAUSTED',actionValues:null,stats,stages,
        incompleteAtActionBit:stats.quantifiedActionBits,
        error:e.message,elapsedMs:Date.now()-started};
    throw e;
  }
}

// Read four shared Boolean action-threshold vectors into an exact/interval
// WDL and, only when all legal action intervals close, its complete optimal set.
export function composeOptimalActionVector({width,height},sourceQ,results){
  const names=['Wlo','Nlo','Whi','Nhi'];
  const legal=sourceQ.h.flatMap((v,c)=>v<height?[c]:[]);
  const byName=Object.fromEntries(names.map((name,i)=>[name,results[i]]));
  if(names.some(n=>byName[n]?.status!=='EXACT_ACTION_VECTOR'))
    return {status:'PARTIAL',value:null,bestMoves:null,actionIntervals:null};
  const values=names.map(n=>new Map(byName[n].actionValues.map(x=>[x.column,x.threshold])));
  if(values.some(v=>v.size!==legal.length||legal.some(c=>!v.has(c))))
    throw Error('action vector omitted or included an illegal literal label');
  const intervals=[];
  for(const c of legal){
    const [wl,nl,wu,nu]=values.map(m=>m.get(c));
    if(wl&&!nl||wu&&!nu||wl&&!wu||nl&&!nu)
      throw Error('Boolean interval threshold monotonicity invalid');
    const lower=wl?1:nl?0:-1,upper=wu?1:nu?0:-1;
    if(lower>upper)throw Error('interval lower exceeds upper');
    intervals.push({column:c,lower,upper,exact:lower===upper});
  }
  const player=sourceQ.h.reduce((a,b)=>a+b,0)&1;
  const merge=player===0?Math.max:Math.min;
  const rootLower=merge(...intervals.map(x=>x.lower));
  const rootUpper=merge(...intervals.map(x=>x.upper));
  const allExact=intervals.every(x=>x.exact);
  const value=rootLower===rootUpper?rootLower:null;
  const bestMoves=allExact?intervals.filter(x=>x.lower===value).map(x=>x.column):null;
  return {status:allExact?'EXACT_OPTIMAL_SET':value!==null?'EXACT_ROOT_PARTIAL_ACTIONS':'UNKNOWN',
    value,bestMoves,actionIntervals:intervals,rootInterval:[rootLower,rootUpper],
    legalColumns:legal,playerToMove:player};
}

// Exact alternation-preserving quantified Shannon projection on the
// deterministic source-QBF AND/NOT matrix. No concrete game-state search.
export class QuantifiedProjectionBudget extends Error {
  constructor(detail){super('QBF_QUANTIFIED_PROJECTION_BUDGET');this.detail=detail;}
}
export function projectActionQBF(cnf,{
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
    supportRepresentativesGenerated:0,oracleCalls:0};
  const nodes=Array(cnf.variables+1),support=Array(cnf.variables+1).fill(0n),
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
  function liveReachable(root){
    const seen=new Set(),stack=[root];let edges=0,visits=0;
    while(stack.length){
      const lit=stack.pop();visits++;
      if(lit===F||lit===T)continue;
      const id=Math.abs(lit);
      if(id<=A||seen.has(id))continue;
      seen.add(id);
      const n=nodes[id];if(!n)throw Error('missing AND in live walk');
      edges+=2;stack.push(n.a,n.b);
    }
    return {reachableANDGates:seen.size,edgeVisits:edges,totalStackPops:visits};
  }
  const actions=cnf.prefix.filter(b=>b.kind==='action');
  if(actions.flatMap(b=>b.vars).length!==A)throw Error('action quantifier prefix mismatch');
  let output=cnf.outputLiteral;
  const stages=[];
  try{
    for(let t=actions.length-1;t>=0;t--){
      const block=actions[t];
      for(const bit of block.vars.slice().reverse()){
        const low=restrict(output,bit,false,new Map());
        const high=restrict(output,bit,true,new Map());
        stats.shannonCofactorsComputed+=2;
        output=block.quantifier==='e'?or(low,high):and(low,high);
        stats.quantifiedActionBits++;
        const reachable=liveReachable(output);
        stages.push({actionIndex:t,quantifier:block.quantifier,bit,
          reachableANDGates:reachable.reachableANDGates,
          diagnosticEdgeVisits:reachable.edgeVisits,
          diagnosticStackPops:reachable.totalStackPops,
          retainedMinusLiveAND:maxId-A-reachable.reachableANDGates,
          remainingSupportBits:mask(output).toString(16),
          totalRetainedNodes:maxId,nontrivialOperations:stats.nontrivialOperations,
          cofactorMisses:stats.cofactorMisses});
        budget();
      }
    }
    if(output!==F&&output!==T)throw Error('projection did not fully quantify decisions');
    return {status:'EXACT',value:output===T,stats,stages,
      outputConstant:true,elapsedMs:Date.now()-started};
  }catch(e){
    if(e instanceof QuantifiedProjectionBudget)
      return {status:'BUDGET_EXHAUSTED',value:null,stats,stages,
        incompleteAtActionBit:stats.quantifiedActionBits,
        error:e.message,elapsedMs:Date.now()-started};
    throw e;
  }
}

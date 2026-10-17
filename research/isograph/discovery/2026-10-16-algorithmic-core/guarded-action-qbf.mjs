// Source-residual, guard-complete bounded alternating action QBF, v0.1.
// Circuit constructor never enumerates an action word or searches a game state.
// Gate auxiliaries are deterministic; no oracle / policy enters construction.
export function compileGuardedActionQBF({width:W,height:H,connect:K}, q, {
  horizon:k=4, fixedFirstAction=null, maxNodes=60000,
  maxOperations=300000, maxSupports=10000, maxMs=15000
}={}){
  const started=Date.now(), N=W*H;
  if(![W,H,K,k].every(Number.isInteger)||W<2||H<1||K<2||N>42||k<1)
    throw Error('invalid finite game or horizon');
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1))throw Error('invalid source-q');
  const rank=q.h.reduce((a,b)=>a+b,0);
  if(rank>=N||k>N-rank)throw Error('source must be nonterminal, horizon <= empty cells');
  if(fixedFirstAction!==null&&(!Number.isInteger(fixedFirstAction)||
     fixedFirstAction<0||fixedFirstAction>=W||q.h[fixedFirstAction]===H))
    throw Error('fixed initial action must be legal');
  if(maxSupports<0)throw Error('invalid support limit');
  const stats={andCalls:0,andCacheHits:0,andCreates:0,
    gateClauses:0,clauseLiteralVisits:0,graphPairVisits:0,
    decisionInputBits:0,quantifiedAuxiliaries:0,operations:0,
    supportRepresentatives:0,gameContinuationsEnumerated:0,
    oracleQueries:0,sourceResidualTermChecks:0,sourceCellMemberships:0};
  function charge(name,n=1){stats[name]+=n;stats.operations+=n;
    if(stats.operations>maxOperations||Date.now()-started>maxMs)
      throw Error('GUARDED_QBF_RESOURCE_LIMIT');}
  let next=0;
  const stage=[-1],inputs=[],gates=[],unique=new Map(),
    blocks=[],clauses=[];
  const F=0,T=Infinity;
  const neg=x=>x===0?T:x===T?0:-x;
  function operandStage(x){return Number.isFinite(x)?stage[Math.abs(x)]:-1;}
  function and(a,b){
    charge('andCalls');
    if(a===F||b===F)return F;
    if(a===T)return b;
    if(b===T)return a;
    if(a===b)return a;
    if(a===neg(b))return F;
    if(b<a)[a,b]=[b,a];
    const key=a+','+b,prior=unique.get(key);
    if(prior!==undefined){stats.andCacheHits++;return prior;}
    if(next>=maxNodes)throw Error('GUARDED_QBF_NODE_LIMIT');
    const id=++next;stage[id]=Math.max(operandStage(a),operandStage(b));
    gates.push({id,a,b,stage:stage[id]});unique.set(key,id);
    stats.andCreates++;return id;
  }
  const or=(a,b)=>neg(and(neg(a),neg(b)));
  function all(vals){let v=T;for(const x of vals)v=and(v,x);return v;}
  function any(vals){let v=F;for(const x of vals)v=or(v,x);return v;}
  const bitsPerAction=Math.ceil(Math.log2(W));
  for(let t=0;t<k;t++){
    const bits=[];
    for(let j=0;j<bitsPerAction;j++){
      if(next>=maxNodes)throw Error('GUARDED_QBF_NODE_LIMIT');
      const id=++next;stage[id]=t;bits.push(id);
      inputs.push({id,actionIndex:t,bitIndex:j});stats.decisionInputBits++;
    }
    blocks.push({actionIndex:t,player:(rank+t)&1,bits});
  }
  // Binary equality literals; invalid extra binary codes decode no column.
  const choose=Array.from({length:k},()=>Array(W));
  for(let t=0;t<k;t++)for(let c=0;c<W;c++){
    choose[t][c]=all(blocks[t].bits.map((id,j)=>(c&(1<<j))?id:neg(id)));
  }
  // E[t][c][j] denotes exactly j previous placements in column c.
  const caps=q.h.map(x=>H-x);
  const E=Array.from({length:k+1},()=>Array(W));
  for(let c=0;c<W;c++){
    E[0][c]=Array(caps[c]+1).fill(F);E[0][c][0]=T;
  }
  const valid=[],landing=[];
  for(let t=0;t<k;t++){
    landing[t]=Array(W);
    for(let c=0;c<W;c++){
      landing[t][c]=Array(caps[c]);
      for(let j=0;j<caps[c];j++)landing[t][c][j]=and(choose[t][c],E[t][c][j]);
      E[t+1][c]=Array(caps[c]+1);
      for(let j=0;j<=caps[c];j++){
        const no=and(E[t][c][j],neg(choose[t][c]));
        const yes=j===0?F:and(E[t][c][j-1],choose[t][c]);
        E[t+1][c][j]=or(no,yes);
      }
    }
    valid[t]=any(landing[t].flat());
  }
  // Convert source-q residual masks to future-cell lists, no game search.
  const res=[q.R0,q.R1].map((set,p)=>set.map(mask=>{
    if(typeof mask!=='bigint'||mask<=0n||mask>>BigInt(N))throw Error('invalid residual requirement');
    const positions=[];
    for(let i=0;i<N;i++)if(mask&(1n<<BigInt(i))){
      const c=i%W,r=Math.floor(i/W),j=r-q.h[c];
      if(j<0||j>=caps[c])throw Error('source residual includes occupied cell');
      positions.push([c,j]);stats.sourceCellMemberships++;
    }
    if(!positions.length)throw Error('empty residual at nonterminal source');
    return positions;
  }));
  const owner=[Array(W),Array(W)];
  for(let p=0;p<2;p++)for(let c=0;c<W;c++)owner[p][c]=Array(caps[c]).fill(F);
  const win=[];
  for(let t=0;t<k;t++){
    const p=blocks[t].player;
    for(let c=0;c<W;c++)for(let j=0;j<caps[c];j++)
      owner[p][c][j]=or(owner[p][c][j],landing[t][c][j]);
    win[t]=any(res[p].map(R=>{
      stats.sourceResidualTermChecks++;
      return all(R.map(([c,j])=>owner[p][c][j]));
    }));
  }
  // Four separate P0-relative WIN/NONLOSS cutoffs.
  const names=['Wlo','Nlo','Whi','Nhi'],cutoff=[F,F,T,T];
  const outputs={};
  for(let z=0;z<4;z++){
    let suffix=cutoff[z];
    for(let t=k-1;t>=0;t--){
      const p=blocks[t].player;
      const draw=(z===1||z===3)?T:F;
      const tail=rank+t+1===N?draw:suffix;
      suffix=p===0?
        and(valid[t],or(win[t],tail)):
        or(neg(valid[t]),and(neg(win[t]),tail));
    }
    if(fixedFirstAction!==null){
      const match=choose[0][fixedFirstAction];
      suffix=blocks[0].player===0?
        and(match,suffix):or(neg(match),suffix);
    }
    outputs[names[z]]=suffix;
  }
  function makeCNF(threshold,{auxMode='staged'}={}){
    if(!Object.hasOwn(outputs,threshold))throw Error('unknown threshold');
    if(auxMode!=='staged'&&auxMode!=='postfix')throw Error('unknown auxiliary scope');
    const output=outputs[threshold];
    const cls=[];
    // The gates are deterministic AND equivalences, NOT one-way implications.
    for(const {id,a,b} of gates){
      cls.push([-id,a],[-id,b],[id,-a,-b]);
    }
    cls.push(output===T?[]:output===F?[]:[output]);
    if(output===T)cls.pop();
    const prefix=[];
    for(let t=0;t<k;t++){
      prefix.push({quantifier:blocks[t].player===0?'e':'a',
        vars:blocks[t].bits.slice(),kind:'action',stage:t});
      if(auxMode==='staged'){
        const vars=gates.filter(g=>g.stage===t).map(g=>g.id);
        if(vars.length)prefix.push({quantifier:'e',vars,kind:'derived',stage:t});
      }
    }
    if(auxMode==='postfix'&&gates.length)
      prefix.push({quantifier:'e',vars:gates.map(g=>g.id),kind:'derived',stage:k});
    const variables=next,ordered=prefix.flatMap(x=>x.vars);
    if(ordered.length!==variables||new Set(ordered).size!==variables)
      throw Error('quantifier partition not a bijection');
    // Algebraically frozen circuit gate equivalences yield total aux values.
    const graph=Array.from({length:variables+1},()=>new Set());
    let pairVisits=0,literalVisits=0;
    for(const clause of cls){
      const vars=[...new Set(clause.filter(Number.isFinite).map(Math.abs))];
      literalVisits+=clause.length;
      for(let i=0;i<vars.length;i++)for(let j=i+1;j<vars.length;j++){
        graph[vars[i]].add(vars[j]);graph[vars[j]].add(vars[i]);pairVisits++;
      }
    }
    const edgeCount=graph.reduce((n,s)=>n+s.size,0)/2;
    function pathWidth(forget){
      const pos=Array(variables+1);
      forget.forEach((v,i)=>pos[v]=i);
      const diff=Array(variables+1).fill(0),introduce=Array(variables+1);
      for(let v=1;v<=variables;v++){
        let from=pos[v];for(const n of graph[v])from=Math.min(from,pos[n]);
        introduce[v]=from;diff[from]++;diff[pos[v]+1]--;
      }
      let live=0,max=0,memberships=0;
      for(let i=0;i<variables;i++){
        live+=diff[i];max=Math.max(max,live);memberships+=live;
      }
      // A valid path decomposition: each variable occurs on the contiguous
      // interval [min(neighbor positions, own position), own position].
      // At earlier endpoint of any edge both endpoints coexist.
      for(let u=1;u<=variables;u++)for(const v of graph[u])if(u<v){
        const first=Math.min(pos[u],pos[v]);
        if(introduce[u]>first||introduce[v]>first||
            pos[u]<first||pos[v]<first)throw Error('path T1/T2 verification failed');
      }
      return {width:max-1,maxBag:max,bagMemberships:memberships,
        edgeCoverageChecked:true,intervalConnectednessByConstruction:true};
    }
    // Total prefix order is a trivial SOUND permutation dependency poset.
    // On a one-trunk path: forward forget order satisfies P2,
    // reverse forget order satisfies P1. Not claimed optimal btw.
    const forward=pathWidth(ordered);
    const reverse=pathWidth(ordered.slice().reverse());
    return {threshold,auxMode,outputLiteral:output,variables,
      inputVariables:inputs.length,auxiliaryVariables:gates.length,
      clauses:cls,prefix,
      primalEdges:edgeCount,primalPairVisits:pairVisits,clauseLiteralVisits:literalVisits,
      trivialTotalDependencyPosetSound:true,
      forwardTrunkAlignedP2:{...forward,verifiedBy:'all dependencies precede forgotten variable in total prefix order'},
      reverseTrunkAlignedP1:{...reverse,verifiedBy:'all dependents forgotten earlier than the variable in reverse prefix order'},
      verifiedBilateralWidthUpperBound:Math.min(forward.width,reverse.width),
      decompositionIsPathNotOptimal:true};
  }
  function evaluateActionWord(word){
    if(!Array.isArray(word)||word.length!==k||word.some(x=>!Number.isInteger(x)||x<0||x>=(1<<bitsPerAction)))
      throw Error('invalid coded action word');
    const values=Array(next+1).fill(false);
    for(const input of inputs)values[input.id]=!!(word[input.actionIndex]&(1<<input.bitIndex));
    const lit=x=>x===T?true:x===F?false:x>0?values[x]:!values[-x];
    // Topological gate order is creation order; stage groups are only prefix scheduling.
    for(const {id,a,b} of gates)values[id]=lit(a)&&lit(b);
    return {thresholds:Object.fromEntries(names.map(n=>[n,lit(outputs[n])])),values};
  }
  // Charge CNF work once (all four outputs share the exact same gate DAG).
  // Diagnostic primal path analysis work is reported per requested threshold.
  charge('gateClauses',3*gates.length+4);
  const records={width:W,height:H,connect:K,horizon:k,sourceRank:rank,
    playerToMove:rank%2,fixedFirstAction,bitsPerAction,
    gateVariables:gates.length,inputVariables:inputs.length,
    generatedCNFClauseCount:3*gates.length+1,stats,
    elapsedMs:Date.now()-started,formulaStatus:'BOUNDED_THRESHOLD_ONLY'};
  return {records,outputs,makeCNF,evaluateActionWord};
}

// A rank-/support-composed, non-distributed monotone Boolean circuit for
// the two exact P0-oriented WDL threshold predicates (P0 WIN, P0 NONLOSS).
//
// No solved values or concrete q state enumeration enter compilation.
// Pre-existing qualified q residual/cofactor algebra supplies semantics.
// Symbolic alternation is a shared AND/OR DAG; its complexity is measured,
// not claimed to be branch-free merely because it returns one expression.

const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
function subset(a,b){return (a&b)===a;}
function cmp(a,b){return a<b?-1:a>b?1:0;}
function popcount(x){let n=0;while(x){x&=x-1n;n++;}return n;}
export class SymbolicCircuitBudgetError extends Error {
  constructor(message,details){super(message);this.name='SymbolicCircuitBudgetError';this.details=details;}
}
export function createSymbolicResidualCircuit({width:W,height:H,connect:K},{
  maxNodes=60000,maxSubstitutionVisits=300000,deadlineAt=Infinity,
  simplifyByPoset=false
}={}){
  if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
    throw Error('unsupported geometry');
  const C=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
  const lineMap=new Map();
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of DIRS){
    if(c+(K-1)*dx<0||c+(K-1)*dx>=W||
       r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
    let mask=0n;
    for(let j=0;j<K;j++)mask|=bit(c+j*dx,r+j*dy);
    lineMap.set(String(mask),mask);
  }
  const lines=[...lineMap.values()];
  const nodes=[{op:'const',value:false},{op:'const',value:true}],intern=new Map();
  const infoMemo=new Map(),compiled=new Map();
  const stats={
    supportsCompiled:0,supportCacheHits:0,supportEdgeExpressions:0,
    qStateValueSolves:0,strategicQChildRecursions:0,
    substitutionVisits:0,substitutionCacheHits:0,
    sourceShapePairsTested:0,sourceShapeLinks:0,
    generatedGateCalls:0,sharedGateReuses:0,
    posetAbsorptionRemoved:0,posetImplicationPairsTested:0,
    peakNodes:2,maxDepthSupports:0,
    totalRootInputVariables:0
  };
  function budget(){
    if(nodes.length>maxNodes||stats.substitutionVisits>maxSubstitutionVisits||
       Date.now()>=deadlineAt)
      throw new SymbolicCircuitBudgetError('symbolic compilation budget exhausted',{
        ...stats,nodes:nodes.length,maxNodes,maxSubstitutionVisits
      });
  }
  function internNode(key,build){
    if(intern.has(key)){stats.sharedGateReuses++;return intern.get(key);}
    budget();
    if(nodes.length>=maxNodes)throw new SymbolicCircuitBudgetError('node budget exhausted',
      {...stats,nodes:nodes.length,maxNodes});
    const id=nodes.length;
    nodes.push(build());
    intern.set(key,id);stats.peakNodes=Math.max(stats.peakNodes,nodes.length);
    return id;
  }
  function varNode(supportKey,role,index){
    return internNode('v:'+supportKey+':'+role+':'+index,
      ()=>({op:'var',supportKey,role,index}));
  }
  function variableImplies(a,b){
    if(a===b)return true;
    const na=nodes[a],nb=nodes[b];
    if(na.op!=='var'||nb.op!=='var'||na.supportKey!==nb.supportKey||
       na.role!==nb.role)return false;
    const info=infoMemo.get(na.supportKey);
    if(!info)throw Error('variable implication before support schema exists');
    stats.posetImplicationPairsTested++;
    const A=info.shapes[na.index],B=info.shapes[nb.index];
    return na.role===0?subset(A,B):subset(B,A);
  }
  function gate(op,raw){
    stats.generatedGateCalls++;
    if(op!=='and'&&op!=='or')throw Error('invalid gate');
    const ids=[...new Set(raw)].sort((a,b)=>a-b);
    const absorb=op==='and'?0:1,neutral=op==='and'?1:0;
    if(ids.includes(absorb))return absorb;
    let remaining=ids.filter(x=>x!==neutral);
    if(simplifyByPoset&&remaining.length>1){
      // In an AND, keep the STRONGEST directly implied literal.
      // In an OR, keep the WEAKEST one. Only exact upsets on one
      // fixed support/player channel allow this implication.
      let keep=remaining.map(()=>true);
      for(let i=0;i<remaining.length;i++){
        if(!keep[i]||nodes[remaining[i]].op!=='var')continue;
        for(let j=0;j<remaining.length;j++){
          if(i===j||!keep[j]||nodes[remaining[j]].op!=='var')continue;
          const redundant=op==='and'?
            variableImplies(remaining[i],remaining[j]):
            variableImplies(remaining[j],remaining[i]);
          if(redundant){keep[j]=false;stats.posetAbsorptionRemoved++;}
        }
      }
      remaining=remaining.filter((_,i)=>keep[i]);
      // Sound one-level absorption:
      //   A AND (B OR C) = A when A -> B
      //   A OR  (B AND C) = A when B -> A.
      const direct=remaining.filter(id=>nodes[id].op==='var');
      if(direct.length){
        const before=remaining.length;
        remaining=remaining.filter(id=>{
          const n=nodes[id];
          if((op==='and'&&n.op!=='or')||(op==='or'&&n.op!=='and'))
            return true;
          const absorbed=n.inputs.some(child=>direct.some(d=>
            op==='and'?variableImplies(d,child):variableImplies(child,d)
          ));
          return !absorbed;
        });
        stats.posetAbsorptionRemoved+=before-remaining.length;
      }
    }
    if(remaining.length===0)return neutral;
    if(remaining.length===1)return remaining[0];
    return internNode(op+':'+remaining.join(','),()=>({op,inputs:remaining}));
  }
  const AND=values=>gate('and',values),OR=values=>gate('or',values);
  const Skey=h=>h.join(',');
  function supportInfo(h){
    const key=Skey(h),found=infoMemo.get(key);
    if(found)return found;
    if(h.length!==W||h.some(x=>!Number.isInteger(x)||x<0||x>H))
      throw Error('invalid support');
    let mask=0n,rank=0;
    for(let c=0;c<W;c++){
      rank+=h[c];
      for(let r=0;r<h[c];r++)mask|=bit(c,r);
    }
    const shapes=new Map();
    for(const line of lines){
      const res=line&~mask;
      if(res!==0n)shapes.set(String(res),res);
    }
    const normalizedShapes=[...shapes.values()].sort((a,b)=>popcount(a)-popcount(b)||cmp(a,b));
    const shapeToIndex=new Map(normalizedShapes.map((x,i)=>[String(x),i]));
    const legal=h.flatMap((value,c)=>value<H?[c]:[]);
    const out={key,h:h.slice(),rank,shapes:normalizedShapes,shapeToIndex,legal,
      vars0:normalizedShapes.map((_,j)=>varNode(key,0,j)),
      vars1:normalizedShapes.map((_,j)=>varNode(key,1,j))};
    infoMemo.set(key,out);
    return out;
  }
  function mapChildInput(parent,child,landing,mover){
    const replace=new Map(),src=parent.shapes,dst=child.shapes;
    for(let j=0;j<dst.length;j++){
      const target=dst[j],ownerIndices=[],blockedIndices=[];
      for(let i=0;i<src.length;i++){
        const shape=src[i];
        stats.sourceShapePairsTested++;
        if(subset(shape&~landing,target))ownerIndices.push(i);
        if((shape&landing)===0n&&subset(shape,target))blockedIndices.push(i);
      }
      stats.sourceShapeLinks+=ownerIndices.length+blockedIndices.length;
      // P0 favorable X uses OR, complement of P1 upset Y uses AND.
      // Each channel chooses either owner-true or blocked-false morphism.
      const p0Indices=mover===0?ownerIndices:blockedIndices;
      const p1Indices=mover===1?ownerIndices:blockedIndices;
      replace.set(child.vars0[j],OR(p0Indices.map(i=>parent.vars0[i])));
      replace.set(child.vars1[j],AND(p1Indices.map(i=>parent.vars1[i])));
    }
    return replace;
  }
  function substitute(root,replace,cache){
    if(cache.has(root)){stats.substitutionCacheHits++;return cache.get(root);}
    budget();
    stats.substitutionVisits++;
    const node=nodes[root];
    let value;
    if(node.op==='const')value=root;
    else if(node.op==='var'){
      value=replace.get(root);
      if(value===undefined)throw Error('unmapped child variable: '+node.supportKey+':'+node.role+':'+node.index);
    }else value=gate(node.op,node.inputs.map(id=>substitute(id,replace,cache)));
    cache.set(root,value);
    return value;
  }
  function compileSupport(h,depth=0){
    budget();
    stats.maxDepthSupports=Math.max(stats.maxDepthSupports,depth);
    const parent=supportInfo(h);
    if(compiled.has(parent.key)){stats.supportCacheHits++;return compiled.get(parent.key);}
    stats.supportsCompiled++;
    const mover=parent.rank&1;
    if(parent.legal.length===0){
      const out={supportKey:parent.key,h:h.slice(),W:0,N:1,action:[]};
      compiled.set(parent.key,out);return out;
    }
    const action=[];
    for(const col of parent.legal){
      budget();
      const x=bit(col,h[col]),nextH=h.slice();nextH[col]++;
      const full=parent.rank+1===C;
      const singleton=parent.shapeToIndex.get(String(x));
      const p0WinsNow=mover===0&&singleton!==undefined?parent.vars0[singleton]:0;
      // Y_j = NOT P1 upset(j), so the P1-nonwin terminal guard is
      // Y({landing}) (or TRUE if no singleton requirement exists).
      const p1NoWinNow=mover===1&&singleton!==undefined?parent.vars1[singleton]:1;
      let Wact,Nact;
      if(full){
        Wact=mover===0?p0WinsNow:0;
        Nact=mover===0?1:p1NoWinNow;
      }else{
        const child=compileSupport(nextH,depth+1);
        const cinfo=supportInfo(nextH),replacements=mapChildInput(parent,cinfo,x,mover);
        const cache=new Map();
        const childWin=substitute(child.W,replacements,cache);
        const childNonLoss=substitute(child.N,replacements,cache);
        if(mover===0){
          Wact=OR([p0WinsNow,childWin]);
          Nact=OR([p0WinsNow,childNonLoss]);
        }else{
          Wact=AND([p1NoWinNow,childWin]);
          Nact=AND([p1NoWinNow,childNonLoss]);
        }
      }
      stats.supportEdgeExpressions++;
      action.push({column:col,W:Wact,N:Nact});
    }
    const combiner=mover===0?OR:AND;
    const out={supportKey:parent.key,h:h.slice(),
      W:combiner(action.map(a=>a.W)),N:combiner(action.map(a=>a.N)),action};
    compiled.set(parent.key,out);return out;
  }
  function assignment(q){
    const info=supportInfo(q.h);
    const up=(R,s)=>R.some(r=>subset(r,s));
    const inputs=new Map();
    for(let i=0;i<info.shapes.length;i++){
      inputs.set(info.vars0[i],up(q.R0,info.shapes[i]));
      inputs.set(info.vars1[i],!up(q.R1,info.shapes[i]));
    }
    return inputs;
  }
  function evaluate(formula,inputs,visitMetrics=null){
    const seen=new Map();
    function rec(id){
      if(seen.has(id))return seen.get(id);
      const n=nodes[id];
      let v;
      if(n.op==='const')v=n.value;
      else if(n.op==='var'){
        if(!inputs.has(id))throw Error('missing root q variable '+n.supportKey);
        v=inputs.get(id);
      }else if(n.op==='or'){
        v=false;
        for(const child of n.inputs)if(rec(child)){v=true;break;}
      }else{
        v=true;
        for(const child of n.inputs)if(!rec(child)){v=false;break;}
      }
      seen.set(id,v);
      return v;
    }
    const value=rec(formula);
    if(visitMetrics)visitMetrics.gateVisits=(visitMetrics.gateVisits??0)+seen.size;
    return value;
  }
  function decode(out,q,{metric=null}={}){
    const inputs=assignment(q);
    const value=(w,n)=>w?1:n?0:-1;
    const W=evaluate(out.W,inputs,metric),N=evaluate(out.N,inputs,metric);
    if(W&&!N)throw Error('invalid P0 threshold nesting');
    const av=out.action.map(a=>[a.column,
      value(evaluate(a.W,inputs,metric),evaluate(a.N,inputs,metric))]);
    const mover=q.h.reduce((a,c)=>a+c,0)&1;
    const best=value(W,N);
    const selected=av.filter(([,v])=>v===best).map(([a])=>a);
    return {value:best,bestMoves:selected,actionValues:av};
  }
  function liveGraphMetrics(out){
    const rootList=[out.W,out.N],
      allRoots=[...rootList,...out.action.flatMap(a=>[a.W,a.N])];
    const countLive=roots=>{
      const live=new Set(),stack=roots.slice();
      while(stack.length){
        const id=stack.pop();
        if(live.has(id))continue;
        live.add(id);
        const node=nodes[id];
        if(node.op==='and'||node.op==='or')stack.push(...node.inputs);
      }
      let and=0,or=0,vars=0,edges=0,maxFanIn=0;
      for(const id of live){
        const n=nodes[id];
        if(n.op==='and'||n.op==='or'){
          if(n.op==='and')and++;else or++;
          edges+=n.inputs.length;
          maxFanIn=Math.max(maxFanIn,n.inputs.length);
        }else if(n.op==='var')vars++;
      }
      const depthMemo=new Map();
      function depth(id){
        if(depthMemo.has(id))return depthMemo.get(id);
        const n=nodes[id];
        const out=n.op==='and'||n.op==='or'?
          1+Math.max(0,...n.inputs.map(depth)):0;
        depthMemo.set(id,out);return out;
      }
      const maxGateDepth=Math.max(0,...roots.map(depth));
      return {reachableNodes:live.size,andGates:and,orGates:or,
        uniqueVariableLeaves:vars,fanInEdges:edges,maxFanIn,maxGateDepth};
    };
    return {
      rootThresholds:countLive(rootList),
      rootAndActionThresholds:countLive(allRoots),
      allocatedNodes:nodes.length,
      deadOrIntermediateAllocatedNodes:nodes.length-countLive(allRoots).reachableNodes
    };
  }
  return {
    liveGraphMetrics,
    compile(h){const out=compileSupport(h);const info=supportInfo(h);
      stats.totalRootInputVariables=info.vars0.length+info.vars1.length;
      return out;
    },
    decode,assignment,evaluate,
    stats(){return {...stats,simplifyByPoset,nodes:nodes.length,interned:intern.size,
      supportsInCache:compiled.size};},
    sourceInfo(h){const x=supportInfo(h);return{
      rank:x.rank,shapeCount:x.shapes.length,legalActions:x.legal.slice(),
      support:x.h.slice()};
    },
    debug:{gateCount:()=>nodes.length}
  };
}

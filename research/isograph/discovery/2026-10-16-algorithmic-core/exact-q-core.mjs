// Oracle-independent constructive Connect-K W/D/L algorithmic core.
// No physical ownership/history, strong-distance scores, opening books,
// external solved labels, CPC/NDC shortcuts, or precomputed W/D/L frontiers
// enter solve(). Branching/recursion are allowed and explicitly counted.
const DIRECTIONS=[[1,0],[0,1],[1,1],[1,-1]];
export class CoreBudgetError extends Error {
  constructor(message,metrics){super(message);this.name='CoreBudgetError';this.metrics=metrics;}
}
function popcount(x){let n=0;for(;x;x&=x-1n)n++;return n;}
function cmpBig(a,b){return a<b?-1:a>b?1:0;}
function normalized(masks){
  const items=[...new Set(masks.map(String))].map(BigInt)
    .sort((a,b)=>popcount(a)-popcount(b)||cmpBig(a,b));
  const result=[];
  for(const x of items)if(!result.some(y=>(x&y)===y))result.push(x);
  return result;
}
export function createExactQCore({width:W,height:H,connect:K}){
  if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
    throw Error('unsupported finite gravity geometry (1 <= W*H <= 42, K >= 2)');
  const bit=(c,r)=>1n<<BigInt(r*W+c),count=W*H;
  const lineSet=new Map();
  for(let c=0;c<W;c++)for(let row=0;row<H;row++)for(const [dx,dy] of DIRECTIONS){
    const endC=c+(K-1)*dx,endR=row+(K-1)*dy;
    if(endC<0||endC>=W||endR<0||endR>=H)continue;
    let line=0n;for(let d=0;d<K;d++)line|=bit(c+d*dx,row+d*dy);
    lineSet.set(String(line),line);
  }
  const lines=[...lineSet.values()].sort(cmpBig);
  const occupiedCount=h=>h.reduce((s,n)=>s+n,0);
  const createEmpty=()=>({h:Array(W).fill(0),R0:lines.slice(),R1:lines.slice()});
  function fromPhysical({h,p0,p1}){
    if(!Array.isArray(h)||h.length!==W||h.some(v=>!Number.isInteger(v)||v<0||v>H))
      throw Error('invalid physical support');
    if(typeof p0!=='bigint'||typeof p1!=='bigint'||(p0&p1)!==0n)
      throw Error('invalid physical ownership');
    let support=0n;
    for(let c=0;c<W;c++)for(let row=0;row<h[c];row++)support|=bit(c,row);
    if((p0|p1)!==support)throw Error('ownership and support differ');
    if(popcount(p0)!==Math.ceil(occupiedCount(h)/2)||
       popcount(p1)!==Math.floor(occupiedCount(h)/2))
      throw Error('physical player stone counts disagree with move parity');
    if(lines.some(m=>(p0&m)===m||(p1&m)===m))
      throw Error('physical input already terminal; require legal nonterminal input');
    const residual=who=>{
      const opposite=who===0?p1:p0;
      const xs=[];
      for(const m of lines)if((m&opposite)===0n)xs.push(m&~support);
      return normalized(xs);
    };
    return {h:h.slice(),R0:residual(0),R1:residual(1)};
  }
  function legal(q){
    const actions=[];
    for(let c=0;c<W;c++)if(q.h[c]<H)actions.push(c);
    return actions;
  }
  function next(q,c){
    if(!Number.isInteger(c)||c<0||c>=W||q.h[c]>=H)
      throw Error('illegal action');
    const mover=occupiedCount(q.h)&1;
    const landing=bit(c,q.h[c]);
    const own=mover===0?q.R0:q.R1;
    const opposite=mover===0?q.R1:q.R0;
    const reduced=normalized(own.map(m=>m&~landing));
    // First-win boundary must be tested BEFORE discarding empty residuals.
    if(reduced.some(m=>m===0n))
      return {terminal:mover===0?1:-1,kind:'win'};
    const h=q.h.slice();h[c]++;
    if(occupiedCount(h)===count)return {terminal:0,kind:'draw'};
    const blocked=normalized(opposite.filter(m=>(m&landing)===0n));
    return {q:mover===0?{h,R0:reduced,R1:blocked}:{h,R0:blocked,R1:reduced}};
  }
  const key=q=>q.h.join('.')+'|'+q.R0.map(String).join(',')+'|'+q.R1.map(String).join(',');
  function solve(q,{
    maxStates=Number.MAX_SAFE_INTEGER,
    maxTransitions=Number.MAX_SAFE_INTEGER,
    deadlineAt=Infinity,
    sharedMemo=null
  }={}){
    const stats={uniqueStates:0,recursiveCalls:0,memoHits:0,
      transitions:0,terminalWinEdges:0,terminalDrawEdges:0,
      branchingStates:0,maxDepth:0,cacheEntries:0};
    const memo=sharedMemo??new Map();
    if(!(memo instanceof Map))throw Error('sharedMemo must be a Map');
    const resultFor=(node,depth)=>{
      stats.recursiveCalls++;
      stats.maxDepth=Math.max(stats.maxDepth,depth);
      const k=key(node);
      if(memo.has(k)){stats.memoHits++;return memo.get(k);}
      if(stats.uniqueStates>=maxStates||stats.transitions>=maxTransitions||
         Date.now()>=deadlineAt)
        throw new CoreBudgetError('constructive q solve budget exhausted',{...stats});
      stats.uniqueStates++;
      const actions=legal(node),mover=occupiedCount(node.h)&1;
      if(actions.length>1)stats.branchingStates++;
      if(actions.length===0){
        const terminal={value:0,bestMoves:[],actionValues:[]};
        memo.set(k,terminal);return terminal;
      }
      const scored=[];
      let best=mover===0?-Infinity:Infinity;
      for(const c of actions){
        if(stats.transitions>=maxTransitions||Date.now()>=deadlineAt)
          throw new CoreBudgetError('constructive q solve budget exhausted',{...stats});
        const successor=next(node,c);
        stats.transitions++;
        let value;
        if(successor.terminal!==undefined){
          value=successor.terminal;
          if(value===0)stats.terminalDrawEdges++;
          else stats.terminalWinEdges++;
        }else value=resultFor(successor.q,depth+1).value;
        scored.push([c,value]);
        best=mover===0?Math.max(best,value):Math.min(best,value);
      }
      const result={value:best,
        bestMoves:scored.filter(([,v])=>v===best).map(([c])=>c),
        actionValues:scored};
      memo.set(k,result);
      return result;
    };
    const answer=resultFor(q,0);
    stats.cacheEntries=memo.size;
    return {answer,stats};
  }
  return Object.freeze({width:W,height:H,connect:K,lineCount:lines.length,
    lines,bit,createEmpty,fromPhysical,legal,next,key,solve});
}

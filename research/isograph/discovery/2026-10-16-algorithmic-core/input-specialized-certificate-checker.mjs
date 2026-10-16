// Independent backwards checker of supplied 4x3 Connect-3 P0-WIN
// support-indexed residual-generator certificate. Does not import the
// candidate producer, recursively choose actions, or use solved values.
// Checks each generator against direct PHYSICAL legal replay and performs
// one finite local cofactor/dominance obligation pass in descending rank.

const W=4,H=3,K=3,CELLS=W*H;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const bit=(c,r)=>1n<<BigInt(r*W+c);
const subset=(a,b)=>(a&b)===a;
function popcount(x){let n=0;for(;x;x&=x-1n)n++;return n;}
function cmpBig(a,b){return a<b?-1:a>b?1:0;}
function normalize(rs){
 const sorted=[...new Set(rs.map(String))].map(BigInt)
   .sort((a,b)=>popcount(a)-popcount(b)||cmpBig(a,b));
 const out=[];
 for(const x of sorted)if(!out.some(y=>subset(y,x)))out.push(x);
 return out;
}
const lines=(()=>{
 const a=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of DIRS){
  const lastC=c+(K-1)*dx,lastR=r+(K-1)*dy;
  if(lastC<0||lastC>=W||lastR<0||lastR>=H)continue;
  let m=0n;
  for(let i=0;i<K;i++)m|=bit(c+i*dx,r+i*dy);
  a.push(m);
 }
 return [...new Set(a.map(String))].map(BigInt);
})();
function repr(q){
 return q.h.join('.')+'|'+q.R0.map(String).join(',')+'|'+q.R1.map(String).join(',');
}
function reconstruct(source){
 if(!source||!Array.isArray(source.h)||source.h.length!==W||
    source.h.some(v=>!Number.isInteger(v)||v<0||v>H))
   throw Error('invalid certificate support');
 function parse(arr){
  if(!Array.isArray(arr)||arr.some(x=>typeof x!=='string'||!/^[0-9a-f]+$/i.test(x)))
   throw Error('invalid residual hex antichain');
  const a=arr.map(x=>BigInt('0x'+x));
  if(a.some(x=>x===0n||x>>BigInt(CELLS)!==0n))throw Error('invalid residual cell domain or terminal empty requirement');
  if(a.length!==normalize(a).length||
      normalize(a).some((x,i)=>x!==a[i]))throw Error('noncanonical residual antichain');
  return a;
 }
 const q={h:source.h.slice(),R0:parse(source.R0),R1:parse(source.R1)};
 let occupied=0n;for(let c=0;c<W;c++)for(let r=0;r<q.h[c];r++)occupied|=bit(c,r);
 for(const mask of [...q.R0,...q.R1]){
  if((mask&occupied)!==0n)throw Error('residual contains occupied cell');
  if(!lines.some(line=>(line&~occupied)===mask))
   throw Error('residual shape not geometric support-derived');
 }
 return q;
}
function physicalReplay(path,metrics){
 if(!Array.isArray(path)||path.length>CELLS)throw Error('invalid source path');
 const s={h:Array(W).fill(0),p0:0n,p1:0n};
 let stopped=false;
 for(let ply=0;ply<path.length;ply++){
  const c=path[ply],r=s.h[c];
  if(!Number.isInteger(c)||c<0||c>=W||r>=H||stopped)
   throw Error('illegal/cross-terminal source path');
  const x=bit(c,r);s.h[c]++;
  if((ply&1)===0)s.p0|=x;else s.p1|=x;
  const owned=(ply&1)===0?s.p0:s.p1;
  for(const ln of lines)if((ln&owned)===ln)stopped=true;
  if(ply+1===CELLS)stopped=true;
  if(stopped)throw Error('certificate node is terminal/has extra path after terminal');
  metrics.physicalReplaySteps++;
 }
 const occupied=s.p0|s.p1;
 const residual=(own,opp)=>normalize(lines.filter(line=>(line&opp)===0n)
   .map(line=>line&~occupied));
 return {h:s.h,R0:residual(s.p0,s.p1),R1:residual(s.p1,s.p0)};
}
function independentCofactor(q,c){
 if(!Number.isInteger(c)||c<0||c>=W||q.h[c]>=H)
  throw Error('illegal certificate action');
 const mover=q.h.reduce((x,y)=>x+y,0)&1,landing=bit(c,q.h[c]);
 const own=mover===0?q.R0:q.R1,other=mover===0?q.R1:q.R0;
 const a=normalize(own.map(m=>m&~landing));
 if(a.includes(0n))return {terminal:mover===0?'P0_WIN':'P1_WIN'};
 const h=q.h.slice();h[c]++;
 if(h.reduce((x,y)=>x+y,0)===CELLS)return {terminal:'DRAW'};
 const b=normalize(other.filter(m=>(m&landing)===0n));
 return {q:mover===0?{h,R0:a,R1:b}:{h,R0:b,R1:a}};
}
function favorable(candidate,reference){
 if(candidate.h.some((v,i)=>v!==reference.h[i]))return false;
 for(const target of reference.R0)
  if(!candidate.R0.some(source=>subset(source,target)))return false;
 for(const target of candidate.R1)
  if(!reference.R1.some(source=>subset(source,target)))return false;
 return true;
}
export function verifyInputSpecializedP0Win(certificate,{
 maxNodes=60000,maxEdges=300000,deadlineAt=Infinity
}={}){
 const start=Date.now();
 if(!certificate||certificate.schema!=='connect4.input-specialized-claimant-proof.v0_1'||
    certificate.conclusion!=='P0_WIN'||certificate.status!=='CANDIDATE_P0_WIN')
   throw Error('invalid certificate schema or conclusion');
 if(certificate.board?.width!==W||certificate.board?.height!==H||certificate.board?.connect!==K)
   throw Error('wrong certificate game domain');
 if(!Array.isArray(certificate.nodes)||certificate.nodes.length>maxNodes)
   throw Error('certificate generator budget/count invalid');
 const metrics={
  nodesChecked:0,policyActionsChecked:0,universalReplyActionsChecked:0,
  terminalP0Edges:0,nonterminalEdges:0,dominatedReferenceEdges:0,
  exactReferenceEdges:0,backwardCofactorChecks:0,
  physicalReplaySteps:0,maxRank:0,maxSupportGenerators:0,
  totalProofEdges:0,distinctSupports:0,predecessorChoiceComparisons:0,
  reachedNodes:0,verificationMs:0
 };
 const map=new Map(),poolBySupport=new Map();
 for(const rec of certificate.nodes){
  if(Date.now()>=deadlineAt)throw Error('certificate checker deadline exceeded');
  if(!rec||typeof rec.id!=='string'||map.has(rec.id))throw Error('duplicate/missing certificate ID');
  const q=reconstruct(rec.q);
  const fromPath=physicalReplay(rec.sourcePath,metrics);
  if(repr(q)!==repr(fromPath)||rec.sourcePath.length!==q.h.reduce((x,y)=>x+y,0))
   throw Error('certificate source-path q mismatch '+rec.id);
  if(rec.id!==repr(q))throw Error('certificate q ID does not match contents');
  map.set(rec.id,{...rec,q});
 }
 const ordered=[...map.values()].sort((a,b)=>
  b.q.h.reduce((x,y)=>x+y,0)-a.q.h.reduce((x,y)=>x+y,0));
 const certified=new Set();
 let edgeCount=0;
 for(const node of ordered){
  if(Date.now()>=deadlineAt)throw Error('certificate checker deadline exceeded');
  const q=node.q,rank=q.h.reduce((x,y)=>x+y,0);
  const possible=q.h.flatMap((height,c)=>height<H?[c]:[]);
  if(rank>=CELLS||possible.length===0)throw Error('terminal proof node');
  metrics.maxRank=Math.max(metrics.maxRank,rank);
  const P0=(rank&1)===0;
  if(!Array.isArray(node.edges))throw Error('missing proof obligations');
  const claimed=node.edges.map(x=>x?.action);
  if(claimed.some(x=>!Number.isInteger(x)||!possible.includes(x))||
      new Set(claimed).size!==claimed.length)throw Error('illegal/duplicate proof action');
  if(P0){
   if(claimed.length!==1||node.p0SelectedAction!==claimed[0])
    throw Error('P0 proof must supply exactly one legal chosen action');
   metrics.policyActionsChecked++;
  }else{
   if(node.p0SelectedAction!==null||claimed.length!==possible.length||
      !possible.every(c=>claimed.includes(c)))
    throw Error('P1 proof omitted a universal opponent reply');
   metrics.universalReplyActionsChecked+=possible.length;
  }
  for(const edge of node.edges){
   metrics.backwardCofactorChecks++;metrics.totalProofEdges++;edgeCount++;
   if(edgeCount>maxEdges)throw Error('proof edge budget exceeded');
   const step=independentCofactor(q,edge.action);
   if(step.terminal!==undefined){
    if(step.terminal!=='P0_WIN'||edge.terminal!=='P0_WIN'||edge.ref!==null)
      throw Error('claimed terminal is not an immediate P0 win');
    metrics.terminalP0Edges++;
   }else{
    if(edge.terminal!==null||typeof edge.ref!=='string')throw Error('missing/wrong child proof reference');
    const target=map.get(edge.ref);
    if(!target||!certified.has(target.id))throw Error('missing/later-rank cert dependency');
    if(target.q.h.reduce((x,y)=>x+y,0)!==rank+1)
      throw Error('certificate dependency not rank decreasing');
    metrics.predecessorChoiceComparisons++;
    if(!favorable(step.q,target.q))
      throw Error('false favorable-order dominance reference');
    if(repr(step.q)===repr(target.q))metrics.exactReferenceEdges++;
    else metrics.dominatedReferenceEdges++;
    metrics.nonterminalEdges++;
   }
  }
  certified.add(node.id);
  const key=q.h.join(',');
  poolBySupport.set(key,(poolBySupport.get(key)??0)+1);
  metrics.maxSupportGenerators=Math.max(metrics.maxSupportGenerators,poolBySupport.get(key));
  metrics.nodesChecked++;
 }
 if(!certified.has(certificate.rootId))throw Error('root not certified');
 const origin=map.get(certificate.rootId);
 if(origin.sourcePath.length!==0||origin.q.h.some(x=>x!==0))
  throw Error('incorrect empty-board root');
 if(origin.p0SelectedAction!==certificate.openingAction)
  throw Error('opening move not exactly checked root P0 choice');
 const reachable=new Set(),stack=[certificate.rootId];
 while(stack.length){
  const id=stack.pop();
  if(reachable.has(id))continue;
  reachable.add(id);
  const node=map.get(id);
  if(!node)throw Error('missing reachable referenced generator');
  for(const e of node.edges)if(e.ref!==null)stack.push(e.ref);
 }
 if(reachable.size!==map.size)throw Error('certificate contains unreachable/orphan proof generators');
 metrics.reachedNodes=reachable.size;
 metrics.distinctSupports=poolBySupport.size;
 metrics.verificationMs=Date.now()-start;
 return {
  status:'CERTIFIED_P0_WIN',
  scope:'empty 4x3 Connect3 board, P0 can force win via supplied single opening and universal P1 reply coverage',
  rootOpeningColumn1Based:certificate.openingAction+1,
  claimsAllFourOpeningsOptimal:false,
  independentOutcomeOracleCalls:0,
  globalRecursiveSearchCalls:0,
  evidence:'complete finite local proof-DAG verification using independently replayed physical paths, cofactors, favorable monotone order and strictly descending remaining rank',
  metrics
 };
}

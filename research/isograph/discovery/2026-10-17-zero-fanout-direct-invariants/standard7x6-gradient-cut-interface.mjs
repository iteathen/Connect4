// Exact SOURCE cut interface for a K-banded original winning-line hypergraph.
// Future game values/strategies are NEVER evaluated; single literal transition
// is original owner contraction + opponent blocker, with first-win stopping.
// Candidate frozen at docs/research/2026-10-17-source-interface-transfer-gradient-cut-candidate.md
// W/H/K symbolic, only actual W=7,H=6,K=4 used in current controls.
export function createGradientCutInterface({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('unsupported source geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 const allWindows=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  for(const [dc,dr,kind] of [[1,0,'horizontal'],[0,1,'vertical'],[1,1,'rising'],[1,-1,'falling']]){
   if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
   let m=0n;
   for(let j=0;j<K;j++)m|=bit(c+j*dc,r+j*dr);
   allWindows.push({kind,mask:m,firstColumn:c,lastColumn:c+(K-1)*dc});
  }
 const pop=g=>{let n=0;for(;g;g&=g-1n)n++;return n;};
 const norm=masks=>{
  const distinct=[...new Set(masks.map(String))].map(BigInt)
   .sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  return distinct.filter((m,i)=>!distinct.some((z,j)=>j<i&&(m&z)===z));
 };
 const leftMask=b=>{
  if(!Number.isInteger(b)||b<0||b>=W-1)throw Error('invalid cut');
  let m=0n;
  for(let c=0;c<=b;c++)for(let r=0;r<H;r++)m|=bit(c,r);
  return m;
 };
 const fullMask=(1n<<BigInt(N))-1n;
 const countOther=(q,p)=>Array.from({length:N},(_,id)=>id).filter(id=>{
  const c=id%W,r=Math.floor(id/W);
  return r>=q.h[c]&&p(id);
 }).length;
 function split(mask,L){
  return {left:mask&L,right:mask&(fullMask^L)};
 }
 function encode(q,cut){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
   q.h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('expected source nonterminal q');
  if(q.R0.includes(0n)||q.R1.includes(0n))throw Error('first-win stopped source required');
  const L=leftMask(cut),R=fullMask^L,n=q.h.reduce((a,b)=>a+b,0);
  const future=Array(W).fill(0n);
  for(let c=0;c<W;c++)for(let r=q.h[c];r<H;r++)future[c]|=bit(c,r);
  const family=[q.R0,q.R1].map((R,p)=>norm(R).map(mask=>{
   if((mask&~future.reduce((s,x)=>s|x,0n))!==0n)
    throw Error('source generator contains already occupied cell');
   const parts=split(mask,L);
   if(parts.left===0n&&parts.right===0n)throw Error('empty generator');
   const witness=allWindows.find(x=>(x.mask&mask)===mask);
   if(!witness)throw Error('normalized source requirement lacks geometric original container');
   return {owner:p,left:parts.left,right:parts.right,container:witness.kind};
  }));
  return {h:q.h.slice(),n,cut,L,R,family};
 }
 const encodeMasks=(family,L)=>family.map(z=>({
  owner:z.owner,...split(z.left|z.right,L),container:z.container}));
 function decode(view){
  return {h:view.h.slice(),R0:norm(view.family[0].map(g=>g.left|g.right)),
   R1:norm(view.family[1].map(g=>g.left|g.right))};
 }
 function normalizePairs(family,L){
  // Global residual normalization is mandatory. One-sided normalization
  // would destroy the paired left/right source-line relation.
  const masks=norm(family.map(g=>g.left|g.right));
  return masks.map(mask=>{
   const parts=split(mask,L);
   return {...parts};
  });
 }
 function next(view,action){
  const n=view.n,p=n&1,x=bit(action,view.h[action]);
  if(!Number.isInteger(action)||action<0||action>=W||view.h[action]>=H)
   throw Error('invalid current legal action');
  const own=view.family[p].map(g=>g.left|g.right),
   opp=view.family[1-p].map(g=>g.left|g.right);
  if(own.some(g=>g===x))return {terminal:p===0?1:-1,kind:'win',literalAction:action+1};
  const h=view.h.slice();h[action]++;
  if(n+1===N)return {terminal:0,kind:'draw',literalAction:action+1};
  const family=[[],[]];
  for(let side=0;side<2;side++){
   const nextMasks=side===p?own.map(g=>g&~x):opp.filter(g=>(g&x)===0n);
   family[side]=normalizePairs(nextMasks,view.L).map(({left,right})=>({owner:side,left,right}));
  }
  return {view:{h,n:n+1,cut:view.cut,L:view.L,R:view.R,family},
    kind:'nonterminal',literalAction:action+1};
 }
 function cutStatistics(q,cut){
  const v=encode(q,cut),part={L:q.h.slice(0,cut+1),R:q.h.slice(cut+1)};
  const stats={cutOneBasedAfter:cut+1,sourceP0:{left:0,right:0,bridge:0},sourceP1:{left:0,right:0,bridge:0},
   originalKWindowsCrossingCut:0,originalCrossingByDirection:{horizontal:0,vertical:0,rising:0,falling:0},
   bridges:[],heightGradient:q.h[cut+1]-q.h[cut]};
  for(const w of allWindows)if(w.firstColumn<=cut&&w.lastColumn>cut){
   stats.originalKWindowsCrossingCut++;stats.originalCrossingByDirection[w.kind]++;
  }
  for(let p=0;p<2;p++)for(const g of v.family[p]){
   const category=g.left&&g.right?'bridge':g.left?'left':'right';
   stats[p===0?'sourceP0':'sourceP1'][category]++;
   if(category!=='bridge')continue;
   const mask=g.left|g.right;
   const leftIDs=[],rightIDs=[];
   for(let id=0;id<N;id++){
    if((mask&(1n<<BigInt(id)))===0n)continue;
    if(id%W<=cut)leftIDs.push(id);
    else rightIDs.push(id);
   }
   const possible=allWindows.filter(w=>(w.mask&mask)===mask && w.firstColumn<=cut&&w.lastColumn>cut);
   if(!possible.length)throw Error('cross-cut source generator has NO original K-consecutive-column witness');
   stats.bridges.push({owner:p,leftIDs,rightIDs,minColumn:Math.min(...leftIDs.concat(rightIDs).map(id=>id%W)),
    maxColumn:Math.max(...leftIDs.concat(rightIDs).map(id=>id%W)),containerKinds:[...new Set(possible.map(w=>w.kind))]});
  }
  return stats;
 }
 function windowCutStatistics(cut){
  leftMask(cut);
  const list=allWindows.filter(w=>w.firstColumn<=cut&&w.lastColumn>cut);
  return {cut:cut+1,total:list.length,byKind:Object.fromEntries(
    ['horizontal','vertical','rising','falling'].map(k=>[k,list.filter(w=>w.kind===k).length])),
   earliestOriginalLineColumn:Math.min(...list.map(x=>x.firstColumn)),
   latestOriginalLineColumn:Math.max(...list.map(x=>x.lastColumn))};
 }
 return Object.freeze({width:W,height:H,connect:K,
  originalLineCount:allWindows.length,encode,decode,next,cutStatistics,windowCutStatistics,
  allWindows,bit,leftMask});
}

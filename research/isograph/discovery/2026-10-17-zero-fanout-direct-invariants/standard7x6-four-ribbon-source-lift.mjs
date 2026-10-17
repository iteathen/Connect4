// Exact geometry unfolding into four linked 1D fiber/ribbon families.
// W,H,K SYMBOLIC. Current research/control board W=7 H=6 K=4.
// This code is a SOURCE-ONLY representation / q-cofactor producer:
// no solved games, game tree, policy enumeration, or strategic value queries.
// Owner theorem frozen: docs/research/2026-10-17-exact-four-ribbon-geometry-unfolding-and-phase-code-candidate.md
export function createFourRibbonSourceLift({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||K>Math.min(W,H)||W*H>42)
   throw Error('unsupported gravity geometry');
 const N=W*H,bitId=id=>1n<<BigInt(id),cellId=(c,r)=>r*W+c;
 const strands=[],windows=[],occurrences=Array.from({length:N},()=>[]),
  lineByMask=new Map();
 const groups={horizontal:0,vertical:0,rising:0,falling:0};
 function makeStrand(direction,coordinate,ids){
  const sid=strands.length;
  strands.push({id:sid,direction,coordinate,physicalCellIDs:ids.slice()});
  for(let j=0;j<ids.length;j++)occurrences[ids[j]].push({strand:sid,index:j});
  for(let j=0;j+K<=ids.length;j++){
   const cellIDs=ids.slice(j,j+K),mask=cellIDs.reduce((s,id)=>s|bitId(id),0n);
   const win={id:windows.length,direction,strand:sid,offset:j,physicalCellIDs:cellIDs,mask};
   if(lineByMask.has(String(mask)))throw Error('same geometric K-line from multiple strands');
   lineByMask.set(String(mask),win.id);
   windows.push(win);groups[direction]++;
  }
 }
 for(let r=0;r<H;r++)makeStrand('horizontal',r,Array.from({length:W},(_,c)=>cellId(c,r)));
 for(let c=0;c<W;c++)makeStrand('vertical',c,Array.from({length:H},(_,r)=>cellId(c,r)));
 for(let d=-(H-1);d<=W-1;d++){
  const ids=[];
  for(let c=0;c<W;c++){const r=c-d;if(r>=0&&r<H)ids.push(cellId(c,r));}
  makeStrand('rising',d,ids);
 }
 for(let d=0;d<=W+H-2;d++){
  const ids=[];
  for(let c=0;c<W;c++){const r=d-c;if(r>=0&&r<H)ids.push(cellId(c,r));}
  makeStrand('falling',d,ids);
 }
 if(occurrences.some(oc=>oc.length!==4))throw Error('each physical cell must occur exactly once per orientation');
 const expected={
  horizontal:H*(W-K+1),vertical:W*(H-K+1),
  rising:(W-K+1)*(H-K+1),falling:(W-K+1)*(H-K+1)
 };
 for(const dir of Object.keys(groups))if(groups[dir]!==expected[dir])throw Error('window incidence count mismatch');
 const edges=[],seenEdges=new Set(),edgesByCell=Array.from({length:N},()=>[]);
 for(const strand of strands)for(let j=0;j+1<strand.physicalCellIDs.length;j++){
  const x=strand.physicalCellIDs[j],y=strand.physicalCellIDs[j+1];
  const key=Math.min(x,y)+':'+Math.max(x,y);
  if(seenEdges.has(key))throw Error('duplicated geometric adjacent edge');
  seenEdges.add(key);
  const id=edges.length,edge={id,x,y,direction:strand.direction,strand:strand.id};
  edges.push(edge);edgesByCell[x].push(id);edgesByCell[y].push(id);
 }
 const graph={strands:strands.length,occurrences:4*N,windows:windows.length,edges:edges.length};
 const pop=m=>{let i=0;while(m){m&=m-1n;i++;}return i;};
 const normalize=gs=>{
  const xs=[...new Set(gs.map(String))].map(BigInt)
    .sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const min=[];
  for(const x of xs)if(!min.some(y=>(x&y)===y))min.push(x);
  return min;
 };
 // A normalized future residual requirement can have several original line
 // containers. The FIRST compatible interval is a proof/display link only.
 // The exact residual physical-cell set is the semantic identity.
 function displayContainer(mask){
  const w=windows.find(w=>(w.mask&mask)===mask);
  if(!w)throw Error('residual mask lacks original K-line container');
  return w.id;
 }
 function encodeFamily(gs,owner){
  return normalize(gs).map(mask=>({owner,mask,window:displayContainer(mask)}));
 }
 const decodeFamily=arr=>normalize(arr.map(x=>x.mask));
 function encode(q){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1))throw Error('invalid q');
  let n=q.h.reduce((s,x)=>s+x,0);
  if(q.R0.some(g=>g===0n)||q.R1.some(g=>g===0n))throw Error('nonterminal q required');
  const fam=[encodeFamily(q.R0,0),encodeFamily(q.R1,1)];
  for(const z of fam)for(const g of z)for(let c=0;c<W;c++)for(let r=0;r<q.h[c];r++)
   if((g.mask&bitId(cellId(c,r)))!==0n)throw Error('residual requires occupied cell');
  return {h:q.h.slice(),n,generators:fam,legal:q.h.flatMap((v,c)=>v<H?[c]:[])};
 }
 function decode(lift){
  return {h:lift.h.slice(),R0:decodeFamily(lift.generators[0]),
    R1:decodeFamily(lift.generators[1])};
 }
 function next(lift,a){
  if(!lift||!Array.isArray(lift.h)||a<0||a>=W||!Number.isInteger(a)||
     lift.h[a]>=H)throw Error('illegal ribbon action');
  const p=lift.n&1,x=bitId(cellId(a,lift.h[a]));
  if(lift.generators[p].some(g=>g.mask===x))
   return {terminal:p===0?1:-1,kind:'win',originalAction:a};
  const h=lift.h.slice();h[a]++;
  if(lift.n+1===N)return {terminal:0,kind:'draw',originalAction:a};
  const fam=[[],[]];
  for(let side=0;side<2;side++){
   if(side===p)fam[side]=encodeFamily(lift.generators[side].map(g=>g.mask&~x),side);
   else fam[side]=encodeFamily(lift.generators[side]
      .filter(g=>(g.mask&x)===0n).map(g=>g.mask),side);
  }
  return {lifted:{h,n:lift.n+1,generators:fam,
    legal:h.flatMap((v,c)=>v<H?[c]:[])},originalAction:a};
 }
 // No player/position strategy: edge code is the GF(2) local phase
 // difference of a supplied 42-bit owner assignment; it need not be a
 // legal first-win-stopped history, but phase consistency is exact.
 function edgeCode(ownerBit){
  if(!Array.isArray(ownerBit)||ownerBit.length!==N||ownerBit.some(z=>z!==0&&z!==1))
   throw Error('expected physical-cell-indexed 0/1 owner bits');
  return edges.map(({x,y})=>ownerBit[x]^ownerBit[y]);
 }
 function decodeEdgeCode(delta,anchor=0){
  if(!Array.isArray(delta)||delta.length!==edges.length||
    delta.some(x=>x!==0&&x!==1)||![0,1].includes(anchor))
   throw Error('invalid edge phase code or 1-bit owner anchor');
  const owner=Array(N).fill(-1),queue=[0];owner[0]=anchor;
  let head=0,spanningTreeEdges=0,independentCycleChecks=0;
  while(head<queue.length){
   const x=queue[head++];
   for(const ei of edgesByCell[x]){
    const e=edges[ei],y=e.x===x?e.y:e.x,wanted=owner[x]^delta[ei];
    if(owner[y]===-1){owner[y]=wanted;queue.push(y);spanningTreeEdges++;}
    else if(owner[y]!==wanted)throw Error('inconsistent cycle XOR parity');
    else if(e.x===x)independentCycleChecks++; // merely tracking traversals; dimension checked by graph formula
   }
  }
  if(queue.length!==N||spanningTreeEdges!==N-1)throw Error('geometry graph not connected');
  if(edgeCode(owner).some((z,i)=>z!==delta[i]))throw Error('edge GF2 consistency rejected');
  return {owner,spanningTreeEdges,cycleRank:edges.length-(N-1)};
 }
 function windowMonoByEdgeBits(ownerBits){
  const d=edgeCode(ownerBits);
  const pair=new Map(edges.map((e,i)=>[Math.min(e.x,e.y)+':'+Math.max(e.x,e.y),d[i]]));
  return windows.map(w=>{
   let mono=1;
   for(let i=1;i<w.physicalCellIDs.length;i++){
    const a=w.physicalCellIDs[i-1],b=w.physicalCellIDs[i];
    mono&=1^pair.get(Math.min(a,b)+':'+Math.max(a,b));
   }
   return mono;
  });
 }
 return Object.freeze({W,H,K,bitId,cellId,strands,windows,occurrences,edges,edgesByCell,
  groups,graph,encode,decode,next,edgeCode,decodeEdgeCode,windowMonoByEdgeBits});
}

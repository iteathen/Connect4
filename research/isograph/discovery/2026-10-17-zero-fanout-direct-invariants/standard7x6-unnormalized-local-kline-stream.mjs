// Exact SOURCE K-line streaming without any intermediate global antichain Min.
// One physically literal move touches only its original incident generators.
// Source F0,F1 initialized from current normalized legal q; no historical
// physical owner colors, future gameplay values, search or strategy tree.
// Proof docs/research/2026-10-17-source-local-frozen-generator-normalization-commutation.md
export function createLocalKlineStream({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid finite gravity K-line geometry');
 const N=W*H,bit=id=>1n<<BigInt(id);
 const originalLines=[];
 const sourceWindowsByCell=Array.from({length:N},()=>[]);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
   const m=Array.from({length:K},(_,j)=>bit((r+j*dr)*W+c+j*dc))
    .reduce((s,x)=>s|x,0n);
   const id=originalLines.length;originalLines.push(m);
   for(let physical=0;physical<N;physical++)if((m&bit(physical))!==0n)
    sourceWindowsByCell[physical].push(id);
  }
 const pop=g=>{let n=0;while(g){n++;g&=g-1n;}return n;};
 function minimal(fam){
  const sorted=[...new Set(fam.map(String))].map(BigInt)
   .sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const g of sorted)if(!out.some(z=>(z&g)===z))out.push(g);
  return out;
 }
 function initialize(q){
  const h=q.h;
  if(!Array.isArray(h)||h.length!==W||h.some(v=>!Number.isInteger(v)||v<0||v>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('requires exact first-win stopped source q');
  const n=h.reduce((s,v)=>s+v,0),source=[q.R0,q.R1];
  let future=0n;for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(r*W+c);
  const arrays=source.map((arr,p)=>{
   const masks=minimal(arr);
   if(masks.some(x=>x===0n||(x&future)!==x))
    throw Error('invalid source residual generator / terminal q');
   for(const m of masks)if(!originalLines.some(L=>(L&m)===m))
    throw Error('source original K-line container not found');
   const index=Array.from({length:N},()=>[]);
   for(let id=0;id<masks.length;id++)for(let x=0;x<N;x++)
    if((masks[id]&bit(x))!==0n)index[x].push(id);
   for(let x=0;x<N;x++)if(index[x].length>sourceWindowsByCell[x].length)
    throw Error('source generator incidence exceeds original K-line coverage');
   return {masks:masks.slice(),active:Array(masks.length).fill(true),index};
  });
  return {h:h.slice(),n,families:arrays,terminated:false,edits:0,
   initialSourceGeneratorCounts:arrays.map(x=>x.masks.length)};
 }
 function decode(st){
  if(st.terminated)throw Error('ordinary nonterminal source q only');
  return {h:st.h.slice(),R0:minimal(st.families[0].masks.filter((x,i)=>st.families[0].active[i])),
   R1:minimal(st.families[1].masks.filter((x,i)=>st.families[1].active[i]))};
 }
 function next(st,c){
  if(st.terminated||!Number.isInteger(c)||c<0||c>=W||st.h[c]>=H)
   throw Error('illegal source move or terminal state');
  const n=st.n,p=n&1,id=st.h[c]*W+c,x=bit(id);
  // COW source stream: the two named generator families persist and no
  // full-scan is made to implement a move, only x-index incident lists.
  const fam=st.families.map(F=>({masks:F.masks.slice(),active:F.active.slice(),index:F.index}));
  let ownerEdits=0,opponentBlocks=0,terminalWin=false;
  for(const k of fam[p].index[id]){
   if(!fam[p].active[k])continue;
   if((fam[p].masks[k]&x)===0n)throw Error('initial incidence index grew invalid');
   const reduced=fam[p].masks[k]&~x;
   ownerEdits++;fam[p].masks[k]=reduced;
   if(reduced===0n)terminalWin=true;
  }
  if(ownerEdits>sourceWindowsByCell[id].length)throw Error('owner source local 4K edit bound violated');
  const trace={physicalCellId:id,originalLiteralColumn:c+1,p,
   ownerGeneratorEdits:ownerEdits,opponentGeneratorDeletions:0,
   localOriginalWindowsContainingCell:sourceWindowsByCell[id].length,
   ownerAffectedInitialGeneratorIds:fam[p].index[id].slice(),
   opponentAffectedInitialGeneratorIds:fam[1-p].index[id].slice(),
   gameValueSuccessorQueries:0};
  if(terminalWin)
   return {terminal:p===0?1:-1,kind:'win',trace};
  for(const k of fam[1-p].index[id]){
   if(!fam[1-p].active[k])continue;
   if((fam[1-p].masks[k]&x)===0n)throw Error('initial blocker incidence invalid');
   fam[1-p].active[k]=false;opponentBlocks++;
  }
  if(opponentBlocks>sourceWindowsByCell[id].length)throw Error('opponent source local 4K edit bound violated');
  trace.opponentGeneratorDeletions=opponentBlocks;
  const h=st.h.slice();h[c]++;
  if(n+1===N)return {terminal:0,kind:'draw',trace};
  return {state:{h,n:n+1,families:fam,terminated:false,
   edits:st.edits+ownerEdits+opponentBlocks,
   initialSourceGeneratorCounts:st.initialSourceGeneratorCounts},trace};
 }
 function detail(st){
  const count=st.families.map(fam=>{
   const active=fam.masks.filter((_,i)=>fam.active[i]);
   return {activeRaw:active.length,minimal: minimal(active).length,
    rawGeneratorMasks:active.map(String)};
  });
  return {counts:count,suppressedRawGenerators:count.map(x=>x.activeRaw-x.minimal)};
 }
 return Object.freeze({W,H,K,originalLines,sourceWindowsByCell,initialize,next,decode,detail,
  maxOriginalIncidence:Math.max(...sourceWindowsByCell.map(v=>v.length))});
}

// SOURCE-ONLY column/row/event phase geometry. Not a WDL solver.
// Frozen theorem: docs/research/2026-10-17-standard7x6-row-column-phase-boundary-cocycle.md
// W,H,K symbolic. Research primary controls use exactly (7,6,4).
export function createColumnRowPhase({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('unsupported geometry');
 const bit=(c,r)=>1n<<BigInt(r*W+c);
 const pop=x=>{let n=0;for(;x;x&=x-1n)n++;return n;};
 const normalize=xs=>{
  const all=[...new Set(xs.map(String))].map(BigInt)
   .sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const x of all)if(!out.some(y=>(x&y)===y))out.push(x);
  return out;
 };
 const phase=h=>{
  if(h.length!==W||h.some(x=>!Number.isInteger(x)||x<0||x>H))
   throw Error('invalid source gravity heights');
  const n=h.reduce((s,x)=>s+x,0);
  return h.map(z=>(n-z)&1);
 };
 const columnsAfterMove=(h,a)=>{
  if(!Number.isInteger(a)||a<0||a>=W||h[a]>=H)throw Error('illegal column');
  const before=phase(h),laterH=h.slice();laterH[a]++;
  const afterward=phase(laterH);
  for(let c=0;c<W;c++)if(afterward[c]!==((before[c]^(c===a?0:1))&1))
    throw Error('column phase source transformation violated');
  return {h:laterH,κ:afterward,playable:laterH.flatMap((z,c)=>z<H?[c]:[])};
 };
 const baseline=(h,c,r)=>{
  if(c<0||c>=W||r<h[c]||r>=H)throw Error('future gravity cell required');
  return (r&1)^phase(h)[c];
 };
 const difference=(h,c,r,d,s)=>baseline(h,c,r)^baseline(h,d,s);
 const ownersFromSchedule=(h,schedule)=>{
  const n=h.reduce((s,x)=>s+x,0),remaining=W*H-n;
  if(schedule.length!==remaining)throw Error('complete hypothetical source future schedule required');
  const kappa=phase(h),running=h.slice(),firstIndex=Array.from({length:H},()=>Array(W).fill(-1));
  const future=[];
  for(let z=0;z<schedule.length;z++){
   const c=schedule[z],r=running[c]++;
   if(c<0||c>=W||r>=H)throw Error('gravity-illegal future schedule');
   const local=r-h[c],other=z-local;
   const chi=(r&1)^kappa[c]^(other&1);
   const absoluteOwner=(n+z)&1;
   if(chi!==absoluteOwner)throw Error('row+column+interleave XOR mismatch');
   firstIndex[r][c]=z;
   future.push({c,r,local,earlierOther:other,β:other&1,λ:(r&1)^kappa[c],owner:chi,relativeMove:z+1});
  }
  return {future,phase:kappa,firstIndex};
 };
 // Source-only two-ply original-q cofactor relation. q.R0/R1 already
 // normalized original K-line residual generators and source first-win free.
 function exchange(q,a,b){
  if(a===b||a<0||a>=W||b<0||b>=W||q.h[a]>=H||q.h[b]>=H)
   throw Error('distinct legal landing columns required');
  const n=q.h.reduce((s,z)=>s+z,0),p=n&1,o=1-p;
  const R=[q.R0,q.R1],x=bit(a,q.h[a]),y=bit(b,q.h[b]),endH=q.h.slice();
  endH[a]++;endH[b]++;
  const firstAWin=R[p].some(g=>g===x),firstBWin=R[p].some(g=>g===y);
  const make=(u,v)=> {
   const own=normalize(R[p].filter(g=>(g&v)===0n).map(g=>g&~u));
   const opp=normalize(R[o].filter(g=>(g&u)===0n).map(g=>g&~v));
   return {h:endH.slice(),R0:p===0?own:opp,R1:p===1?own:opp,
    terminalSecond:opp.includes(0n),terminalFirst:own.includes(0n)};
  };
  const AB=make(x,y),BA=make(y,x);
  const oddGenerators=[...R[0],...R[1]].filter(g=>Boolean(g&x)!==Boolean(g&y));
  const equalResidual=AB.R0.map(String).join(',')===BA.R0.map(String).join(',')&&
                      AB.R1.map(String).join(',')===BA.R1.map(String).join(',');
  return {
   n,p,literalPair:[a+1,b+1],landingCells:[String(x),String(y)],
   firstAWin,firstBWin,boardFullAfterTwo:n+2>=W*H,
   AB,BA,oddGeneratorCount:oddGenerators.length,equalResidual,
   phaseAfterAB:phase(endH),phaseAfterBA:phase(endH),
   bothTwoPlyNonterminal:!firstAWin&&!firstBWin&&!AB.terminalFirst&&!BA.terminalFirst&&
     !AB.terminalSecond&&!BA.terminalSecond&&n+2<W*H
  };
 }
 return Object.freeze({W,H,K,bit,phase,columnsAfterMove,baseline,difference,ownersFromSchedule,exchange});
}

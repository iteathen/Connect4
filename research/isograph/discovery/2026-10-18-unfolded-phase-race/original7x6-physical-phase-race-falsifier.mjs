// PHYSICAL first-win checker, 69 source windows, gravity; independently reconstructs q.
// Evaluates ONE caller-supplied hypothetical full suffix as a falsifier, not a solver.
// Freeze before any control; may continue the supplied word counterfactually past first WIN.
export function physicalPhaseRaceCheck({prefix="44444",suffix}){
 const W=7,H=6,K=4,N=42,id=(c,r)=>7*r+c,bit=x=>1n<<BigInt(x);
 const lines=[];
 for(let c=0;c<7;c++)for(let r=0;r<6;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const v=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(v.every(([a,b])=>a>=0&&a<7&&b>=0&&b<6))lines.push(v.map(([a,b])=>id(a,b)));
 }
 if(lines.length!==69)throw Error("original windows");
 const h=Array(7).fill(0),grid=Array(42).fill(-1);let n=0,first=null;
 function drop(col){
  const c=col-1;if(c<0||c>=7||h[c]>=6)throw Error("gravity");
  const p=n&1,z=id(c,h[c]++);grid[z]=p;n++;
  if(first===null&&lines.some(L=>L.every(i=>grid[i]===p)))first={p,n};
  return z;
 }
 for(const ch of prefix){drop(Number(ch));if(first!==null)throw Error("prefix already won");}
 const n0=n,H0=h.slice();
 const pop=m=>{let s=0;for(;m;m&=m-1n)s++;return s;};
 const norm=a=>{const u=[...new Set(a)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));return u.filter((m,i)=>!u.slice(0,i).some(z=>(m&z)===z));};
 const R=[0,1].map(p=>norm(lines.filter(L=>L.every(z=>grid[z]!==1-p)).map(L=>L.reduce((a,z)=>grid[z]===-1?a|bit(z):a,0n))));
 let D=0;for(const a of R[0])for(const b of R[1])if((a&b)===0n)D++;
 const T=42-n;
 if(!Array.isArray(suffix)||suffix.length!==T)throw Error("full suffix required");
 const chi=Array(42).fill(-1),t=Array(42).fill(0);
 for(let k=0;k<T;k++){const z=drop(suffix[k]);chi[z]=(n0+k)&1;t[z]=k+1;}
 const F=[0,0],tau=[Infinity,Infinity];
 for(let p=0;p<2;p++)for(const G of R[p]){
  let good=true,latest=0;
  for(let z=0;z<42;z++)if((G&bit(z))!==0n){
   if(chi[z]!==p){good=false;break;}
   latest=Math.max(latest,t[z]);
  }
  if(good){F[p]=1;tau[p]=Math.min(tau[p],latest);}
 }
 const rho=F[0]&&F[1]?(tau[0]<tau[1]?1:-1):0;
 const formula=F[0]-F[1]+F[0]*F[1]*rho;
 const physical=first===null?0:first.p===0?1:-1;
 return {prefix,RCounts:R.map(v=>v.length),D,phaseFinalCompletions:F,earliestRanks:tau.map(v=>v===Infinity?null:v),raceBit:rho,formula,physical,
  success:formula===physical&&!(D===0&&F[0]&&F[1]),firstWinningAbsoluteTurn:first?.n??null};
}

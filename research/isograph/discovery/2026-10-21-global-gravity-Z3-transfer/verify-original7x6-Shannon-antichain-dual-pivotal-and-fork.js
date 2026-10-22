/**
 * Nonenumerative exact WSL antichain Shannon-cofactor / static blocker dual,
 * Boolean pivotality, robust 7-column fork quantifier-elimination identity,
 * and static original7x6 625-mask dependency cones.
 * No actual 7x6 board positions or complete game histories generated.
 * node verify-original7x6-Shannon-antichain-dual-pivotal-and-fork.js
 */
"use strict";
const assert=(yes,why)=>{if(!yes)throw Error("C4_SHANNON_FORK "+why);};
const isSub=(x,y)=>(x&y)===x;
const pop=(x)=>{let n=0;while(x){x&=x-1;n++;}return n;};
const arrEq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
function minAntichain(a){
 const uniq=[...new Set(a)].sort((x,y)=>x-y);
 return uniq.filter(m=>!uniq.some(n=>n!==m&&isSub(n,m)));
}
function evalF(a,z){return Number(a.some(m=>isSub(m,z)));}
function evalDual(a,w,N){return 1-evalF(a,(1<<N)-1^w);}
function isAntichain(a){return a.every((m,i)=>a.every((n,j)=>i===j||(!isSub(m,n)&&!isSub(n,m))));}
function all4Antichains(){
 const a=[];
 for(let catalogue=0;catalogue<(1<<16);catalogue++){
  const items=[];for(let mask=0;mask<16;mask++)if(catalogue&(1<<mask))items.push(mask);
  if(isAntichain(items))a.push(items);
 }
 return a;
}
const all=all4Antichains();
assert(all.length===168,"four-coordinate Dedekind number168");
let ShannonCofactorChecks=0,staticBlockerDualChecks=0,pivotalChecks=0,commutationChecks=0;
for(const a of all){
 for(let e=0;e<4;e++){
  const bit=1<<e;
  const Aplus=minAntichain(a.map(m=>m&~bit));
  const Aminus=a.filter(m=>(m&bit)===0);
  assert(isAntichain(Aplus)&&isAntichain(Aminus),"canonical after own/opponent cofactor");
  for(let z=0;z<16;z++){
   const zNo=z&~bit;
   assert(evalF(Aplus,z)===evalF(a,zNo|bit),"own fulfillment cofactor canonical");
   assert(evalF(Aminus,z)===evalF(a,zNo),"opponent blocking cofactor canonical");
   ShannonCofactorChecks+=2;
   // B_A(w)=1-F_A(1-w), own assignment z_e=1 -> w_e=0.
   // Opponent assignment z_e=0 -> w_e=1.
   const w=zNo,keep=15^w,one=15^(w|bit);
   assert(evalDual(Aplus,w,4)===evalDual(a,w,4),"dual own cofactor w_e=0");
   assert(evalDual(Aminus,w|bit,4)===evalDual(a,w|bit,4),"dual opponent cofactor w_e=1");
   // These equalities are over any w on the OTHER 3 coordinates, where
   // the cofactored Aplus/Aminus expression has no e coordinate at all.
   staticBlockerDualChecks+=2;
   const value1=evalF(a,zNo|bit),value0=evalF(a,zNo);
   const P=Number(a.some(m=>(m&bit)!==0&&isSub(m&~bit,zNo)));
   const Q=Number(a.some(m=>(m&bit)===0&&isSub(m,zNo)));
   assert(value1-value0===Number(P===1&&Q===0),"pivotal attack times no-bypass factor");
   pivotalChecks++;
  }
 }
 for(let e=0;e<4;e++)for(let f=0;f<4;f++)if(f!==e){
  for(const eClaim of [false,true])for(const fClaim of [false,true]){
   const step=(A,site,claim)=>claim?minAntichain(A.map(m=>m&~(1<<site))):A.filter(m=>(m&(1<<site))===0);
   const left=step(step(a,e,eClaim),f,fClaim).sort((x,y)=>x-y);
   const right=step(step(a,f,fClaim),e,eClaim).sort((x,y)=>x-y);
   assert(arrEq(left,right),"site e/f cofactor commutation for distinct sites");
   commutationChecks++;
  }
 }
}
assert(ShannonCofactorChecks===168*4*16*2,"full Shannon tally");
assert(staticBlockerDualChecks===168*4*16*2,"dual tally");
assert(pivotalChecks===168*4*16,"pivotal tally");
assert(commutationChecks===168*4*3*4,"commutation tally");
// Pure 7-bit Boolean quantifier elimination, no legal game boards.
let forkFlagChecks=0,forkValidLegalMasks=0;
for(let legal=1;legal<128;legal++)for(let threats=0;threats<128;threats++){
 if((threats&~legal)!==0)continue;
 const plays=[...Array(7).keys()].filter(d=>legal&(1<<d));
 const left=Number(plays.every(d=>plays.some(c=>c!==d&&(threats&(1<<c)))));
 const right=Number(pop(threats)>=2);
 assert(left===right,"ALL legal defender choice contracted into >=2 disjoint column threats");
 forkFlagChecks++;
 forkValidLegalMasks++;
}
assert(forkFlagChecks===2186,"sum (3^7-1) legal-threat masks");
// The union-of-windows catalog has 69 K4, 625 distinct subsets,
// and a potentially broad antichain re-minimization influence cone.
const dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]],W=7,H=6,K=4,windows=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy,dir]of dirs){
 const line=[];
 for(let j=0;j<K;j++){const x=c+j*dx,y=r+j*dy;if(x<0||x>=W||y<0||y>=H){line.length=0;break;}line.push(y*W+x);}
 if(line.length===K)windows.push({line,dir});
}
assert(windows.length===69,"true original69");
const b=i=>1n<<BigInt(i),unique=new Map();
for(const {line}of windows)for(let t=1;t<16;t++){
 let m=0n;for(let j=0;j<4;j++)if(t&(1<<j))m|=b(line[j]);
 unique.set(String(m),m);
}
assert(unique.size===625,"625 original residual masks");
const masks=[...unique.values()],profile=[];
for(let e=0;e<W*H;e++){
 const containing=windows.filter(L=>L.line.includes(e)),changed=new Map();
 for(const {line}of containing)for(let t=1;t<16;t++){
  let m=0n;for(let j=0;j<4;j++)if(t&(1<<j))m|=b(line[j]);
  changed.set(String(m),m);
 }
 const impact=[...changed.values()];
 const reMinCandidate=masks.filter(M=>impact.some(N=>(M&N)===N));
 profile.push({site:[e%W+1,Math.floor(e/W)+1],originalIncidentWindows:containing.length,directExistenceMaskCone:impact.length,possibleAntichainRenormalizationUpperCone:reMinCandidate.length});
}
const max=(key)=>Math.max(...profile.map(x=>x[key]));
const core=profile.filter(x=>x.directExistenceMaskCone===max("directExistenceMaskCone")).map(x=>x.site);
assert(max("originalIncidentWindows")===13,"max original direct lines13");
assert(max("directExistenceMaskCone")===129,"max directly affected masks129");
assert(max("possibleAntichainRenormalizationUpperCone")===556,"max possible re-minimal masks556");
assert(core.length===2&&core.every(x=>x[0]===4&&[3,4].includes(x[1])),"two central 129-cone sites");
const result={
 schema:"c4.original7x6_non_enumerative_Shannon_duality_fork_0_1",
 status:"EXACT_ALGEBRAIC_FIELD_COFACORS_AND_FORK_ALL_QUANTIFIER_CONTRACTION",
 mathematicalScope:"uniform Boolean antichain theorem; static original7x6 geometry; fork certificate when live P1 turn with >=2 playable P0 immediate threats and no P1 immediate win",
 algebraVerification:{fourVariableAllAntichains:all.length,ShannonCofactorChecks,staticBlockerDualChecks,pivotalChecks,distinctSiteCommutationChecks:commutationChecks},
 frontierSevenThreatBooleanVerification:{allLegalThreatPairs:forkFlagChecks},
 geometry:{originalDimensions:"7x6-k4",originalWindows:windows.length,originalDirectionWindows:Object.fromEntries(dirs.map(d=>[d[2],windows.filter(z=>z.dir===d[2]).length])),originalUniqueResidualMasks:unique.size,maxOriginalIncidentK4:max("originalIncidentWindows"),maxDirectExistenceMaskCone:max("directExistenceMaskCone"),maxAntichainUpperCone:max("possibleAntichainRenormalizationUpperCone"),sitesAtMaxDirectCone:core,allPhysicalSiteDependencyProfile:profile},
 noFullGamePositionsEnumerated:true,noMoveHistoriesEnumerated:true,noSolvedGameOutcomesUsed:true,noRootWinRegionConstructed:true,CI:"NOT_RUN",independentFormalProver:"NOT_RUN"
};
console.log(JSON.stringify(result,null,2));
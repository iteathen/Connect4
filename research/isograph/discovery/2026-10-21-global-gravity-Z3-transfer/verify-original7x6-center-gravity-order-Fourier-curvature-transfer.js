/**
 * Exact original7x6 owner-order static K4 Boolean curvature.
 * Independent 69 literal K4 window right-edge transfer, four joint
 * center c4 physical r1/r2 boundary assignments, no full-site or game
 * board-state enumeration. Also validates all16 two-variable curl cases.
 * node verify-original7x6-center-gravity-order-Fourier-curvature-transfer.js
 */
"use strict";
const ok=(v,m)=>{if(!v)throw Error("C4_FOURIER_CURL "+m);};
const W=7,H=6,L=4,dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const windows=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const[dx,dy,type]of dirs){
 const cells=[];for(let i=0;i<L;i++){
  const x=c+dx*i,y=r+dy*i;if(x<0||x>=W||y<0||y>=H){cells.length=0;break;}
  cells.push({col:x,row:y});
 }
 if(cells.length===L)windows.push({type,cells,right:Math.max(...cells.map(x=>x.col))});
}
ok(windows.length===69,"original69 true shared-site K4");
const inventory=Object.fromEntries(["H","V","R","F"].map(d=>[d,windows.filter(x=>x.type===d).length]));
ok(JSON.stringify(inventory)===JSON.stringify({H:24,V:21,R:12,F:12}),"original H/V/R/F inventory");
const rightBuckets=Array.from({length:W},()=>[]);
for(const win of windows)rightBuckets[win.right].push(win);
const allowed=Array.from({length:64},(_,i)=>i).filter(d=>!(d&(d>>1)&(d>>2)&(d>>3)));
ok(allowed.length===56,"56 K4-free individual vertical columns");
const next=s=>s&4095;
const shift=(s,d)=>((s&4095)<<6)|d;
function admissible(c,s,d){
 const mask=[d,s&63,(s>>6)&63,s>>12];
 for(const win of rightBuckets[c]){
  let all=true;
  for(const x of win.cells)if(!(mask[c-x.col]&(1<<x.row))){all=false;break;}
  if(all)return false;
 }
 return true;
}
let first=new Map([[0,1]]),edgesBefore=0,edgesAfter=0;
const boundaryStates=[1];
for(let col=0;col<3;col++){
 const nextMap=new Map();
 for(const [s,n]of first)for(const d of allowed){
  if(!admissible(col,s,d))continue;
  const t=shift(s,d);nextMap.set(t,(nextMap.get(t)||0)+n);edgesBefore++;
 }
 first=nextMap;boundaryStates.push(first.size);
}
let joint=new Map();
const pinColumn=3,bitSiteE=0,bitSiteF=1;
for(const [s,n]of first)for(const d of allowed){
 if(!admissible(pinColumn,s,d))continue;
 const t=shift(s,d),idx=((d&(1<<bitSiteE))?2:0)+((d&(1<<bitSiteF))?1:0);
 let a=joint.get(t);
 if(!a){a=[0,0,0,0];joint.set(t,a);}
 a[idx]+=n;edgesBefore++;
}
boundaryStates.push(joint.size);
for(let col=4;col<7;col++){
 const nextMap=new Map();
 for(const [s,counts]of joint)for(const d of allowed){
  if(!admissible(col,s,d))continue;
  const t=shift(s,d);
  let acc=nextMap.get(t);
  if(!acc){acc=[0,0,0,0];nextMap.set(t,acc);}
  for(let i=0;i<4;i++)acc[i]+=counts[i];
  edgesAfter++;
 }
 joint=nextMap;boundaryStates.push(joint.size);
}
const parts=[0,0,0,0];
for(const a of joint.values())for(let i=0;i<4;i++)parts[i]+=a[i];
const [N00,N01,N10,N11]=parts,Z=parts.reduce((a,b)=>a+b,0);
ok(Z===439428365759,"independent explicit69 full K4free partition");
const n1e=N10+N11,n1f=N01+N11;
const Ie=Z-2*n1e,If=Z-2*n1f;
ok(Ie===111434791827&&If===126118181759,"both old c4 pinned global influences");
const curl=N01-N10;
ok(curl===-7341694966&&curl===(Ie-If)/2,"new predicted exact signed gravitational owner order source curl");
let abstractCurlTruthChecks=0;
for(let tt=0;tt<16;tt++){
 const f=(e,g)=>(tt>>((e<<1)|g))&1;
 const integrated=f(1,0)-f(0,1);
 const I0=(f(1,0)-f(0,0))+(f(1,1)-f(0,1));
 const I1=(f(0,1)-f(0,0))+(f(1,1)-f(1,0));
 ok(integrated===(I0-I1)/2,"two-variable Shannon curl identity for arbitrary truth table");
 abstractCurlTruthChecks++;
}
const report={
 schema:"c4.original7x6_source_global_fourier_gravity_order_curl.v1",
 status:"EXACT_ORIGINAL69_CENTER_GRAVITY_TWO_SITE_SHANNON_CURL_FROM_GLOBAL_FOURIER_GRADIENT",
 physicalOriginalK4:inventory,
 fullK4freeHypotheticalIndependentBinarySubsets:Z,
 width3ColumnTransfer:{numberPhysicalColumns:W,numberRows:H,allowedVerticalK4freeColumnMasks:allowed.length,boundaryStateCounts:boundaryStates,acceptedEdgesBeforeCenter:edgesBefore,acceptedEdgesAfterCenter:edgesAfter},
 twoPhysicalSites:{e:[4,1],f:[4,2],rawVariableOrder:"index=(e ownerBit)*2+(f ownerBit)",jointK4freeSourceCounts:{N00,N01,N10,N11},ownedNoK4Counts:{e:n1e,f:n1f},
 unnormalizedSingleSitePivotalities:{e:Ie,f:If},
 signedSumP0OwnerOrderBooleanCurvature:curl,
 exactIdentity:"SUM_over_other40_bits[Phi(z_e=1,z_f=0)-Phi(z_e=0,z_f=1)] = (I_e-I_f)/2 = N01-N10",
 normalizedMeanCurlOverOther40:curl/2**40,
 rootedMeaning:"difference between hypothetical owner0 lower/upper and owner0 upper/lower completions; NOT two legal first moves from the same game turn"},
 abstractArbitraryTwoSiteBooleanTruthChecks:abstractCurlTruthChecks,
 scope:"STATIC hypothetical 42-site initial-original-K4 OR potential integrated globally; gravity owner-depth cofactor ordering as formal comparison only",
 wholeIndependent42SiteAssignmentsEnumerated:false,actualGamePositionEnumeration:false,solvedValuesUsed:false,emptyRootP0WinDerived:false
};
console.log(JSON.stringify(report,null,2));
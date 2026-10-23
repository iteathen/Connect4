"use strict";
/**
 * Independent original7x6 mathematical H/R/F downward-shift firstwin
 * certificate: for any 4-column actual D K4 L, if the actual online
 * responder policy guarantees A owns ALL sites of L shifted one row
 * DOWN before D can complete L, then A firstwins earlier.
 * Source B 122454434 has one independent r5 P1 K4 shadowed by P0 r4.
 *
 * This checker uses coordinate-labelled K4s, not the previous BigInt
 * matrix source, and separately validates policy column-tail timing.
 */
const ok=(x,m)=>{if(!x)throw Error("C4_GENERAL_HRF_SHADOW "+m)};
const W=7,H=6;
const d4=[["R",1,1],["F",1,-1],["H",1,0],["V",0,1]];
const L=[];
for(const [t,dx,dy]of d4)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 const s=Array.from({length:4},(_,k)=>[c+k*dx,r+k*dy]);
 if(s.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))L.push({t,s});
}
ok(L.length===69,"all original69 windows");
const types=Object.fromEntries(["H","V","R","F"].map(t=>[t,L.filter(x=>x.t===t).length]));
ok(JSON.stringify(types)===JSON.stringify({H:24,V:21,R:12,F:12}),"original H/V/R/F");
const sig=xs=>xs.map(([c,r])=>c+","+r).join(";");
const keys=new Set(L.map(x=>sig(x.s))),shifts=[];
for(const line of L) {
 if(line.t==="V")continue;
 if(line.s.some(([,r])=>r===0))continue;
 const below=line.s.map(([c,r])=>[c,r-1]);
 ok(keys.has(sig(below)),"downshift by one is genuine original H/R/F K4");
 shifts.push({type:line.t,L:line.s,under:below});
}
const eligible=Object.fromEntries(["H","R","F"].map(t=>[t,shifts.filter(x=>x.type===t).length]));
ok(JSON.stringify(eligible)===JSON.stringify({H:20,R:8,F:8}),"exact36 shifted source H/R/F windows");
const VshiftSourceCount=L.filter(x=>x.t==="V"&&x.s.every(([,r])=>r>0)).length;
ok(VshiftSourceCount===14,"physical vertical shift exists but simple A-under/D-owner cannot both hold due overlapping cells");

function parse(word){
 const h=Array(7).fill(0),q=Array.from({length:7},()=>Array(6).fill(-1));
 for(let p=0;p<word.length;p++){
  const c=Number(word[p])-1,r=h[c]++;
  ok(r<6,"gravity legal");
  q[c][r]=p&1;
  ok(!L.some(x=>x.s.every(([col,row])=>q[col][row]===(p&1))),"firstwinner-free original source prefix");
 }
 ok(h.join(",")==="1,2,1,4,1,0,0","original rank9 support");
 return{q,h};
}
const words=["122454434","143224454"],results=[];
for(const word of words){
 const {q,h}=parse(word),A=0,D=1,trap=[2],B=[0,4];
 const desc=[];
 function sourceMatroidRank(mask) {
  let free=0;
  for(const[c,r]of mask)if(!trap.includes(c)){
   const start=h[c]+((H-h[c])&1);
   if(r>=start&&((r-start)&1)===0)free++;
  }
  if(mask.some(([c,r])=>B.includes(c)&&r===h[c]))free++;
  if(mask.some(([c,r])=>trap.includes(c)&&r===h[c]))free++;
  return free;
 }
 function certifiedUnder(site) {
  const[c,r]=site,below=r-1;
  if(r<1)return{yes:false,reason:"bottom has no row-below K4"};
  if(q[c][r]===A)return{yes:false,reason:"D future line blocked by A at source"};
  if(q[c][below]===A)return{yes:true,reason:"A already owns directly below target",sourceOwner:true};
  if(q[c][below]!==-1)return{yes:false,reason:"below belongs to D, not A"};
  if(q[c][r]!==-1)return{yes:false,reason:"target already D with below not A impossible by gravity"};
  if(trap.includes(c))return{yes:false,reason:"not source paired nontrap"};
  const start=h[c]+((H-h[c])&1);
  const lower=r-2;
  if(lower<start||((lower-start)&1)!==0)return{yes:false,reason:"no guaranteed A upper-mate below before D target"};
  return{yes:true,reason:"D must enter lower row, A immediately upper-mates below D target before D can reach it",
   sourceOwner:false,pairedLower:[c+1,lower+1],mandatoryAMate:[c+1,below+1],futureDTarget:[c+1,r+1]};
 }
 for(const line of L) {
  if(line.s.some(([c,r])=>q[c][r]===A))continue;
  const G=line.s.filter(([c,r])=>q[c][r]===-1);
  if(!G.length)continue;
  const below=shifts.find(t=>sig(t.L)===sig(line.s));
  const evidence=below?line.s.map(certifiedUnder):[];
  const certain=Boolean(below&&evidence.every(x=>x.yes));
  const deficit=G.length-sourceMatroidRank(G);
  desc.push({type:line.t,fullLine:line.s.map(([c,r])=>[c+1,r+1]),
   missing:G.map(([c,r])=>[c+1,r+1]),deficit,strictShadow:certain,
   AprecedingK4:certain?below.under.map(([c,r])=>[c+1,r+1]):null,perColumn:certain?evidence:undefined});
 }
 const zero=desc.filter(x=>x.deficit===0);
 const unshadowedZero=zero.filter(x=>!x.strictShadow);
 const shadowed=desc.filter(x=>x.strictShadow);
 const target=zero.find(x=>x.type==="H"&&x.fullLine.map(p=>p.join(",")).join("|")==="4,5|5,5|6,5|7,5");
 ok(target?.strictShadow&&target.AprecedingK4.map(p=>p.join(",")).join("|")==="4,4|5,4|6,4|7,4",
 "upper P1 H4 is strictly shadowed by aligned P0 H4");
 results.push({sourceWord:word,liveP1OriginalK4Sources:desc.length,
  rankIndependentOriginalLines:zero.length,rankIndependentShadowedLines:zero.filter(x=>x.strictShadow).length,
  rankIndependentUnshadowedLines:unshadowedZero,allStrictShadowedOriginalK4Count:shadowed.length,
  strictShadowedOriginalK4s:shadowed,exampleRow5Shadow:target});
}
ok(results[0].rankIndependentOriginalLines===1&&results[0].rankIndependentUnshadowedLines.length===0,
 "B only independent D K4 is shadowed");
ok(results[1].rankIndependentOriginalLines===2&&results[1].rankIndependentUnshadowedLines.length===1,
 "A retains independent unshadowed P1 bottom H4");
const report={
 schema:"c4.original7x6_strict_downshift_HRF_source_shadow.v1",
 status:"EXACT_SOURCE_HRF_36_ROW_SHIFT_PRECEDENCE_CLASS_AND_RANK9_MATROID_GUARD_SEPARATION",
 originalGeometry:types,
 originalHorizontalAndDiagonalDownshiftEligible:eligible,
 strictSourceShadowPotentialWindows:shifts.length,
 excludedVerticalShiftSources:VshiftSourceCount,
 twoGenuineRank9SourceControls:results,
 algebraicTheorem:"For an unblocked original H/R/F D winning line L with each target site at physical row>=2, if respondent A already owns each site of L shifted one row down OR source-proven legal mate responses necessarily give A that shifted site strictly BEFORE D can take the corresponding target, then under firstwin stopping D cannot firstwin on L: A FIRSTWINS its shifted genuine original K4 strictly earlier.",
 collisionTyping:"The K4 source can have several actual original lines with same minimal residual: an existential, genuinely source-certified shadow provenance line suffices when its missing mask G is contained in any putative D winning line's missing mask, because D completing the latter would also complete the shadowed source line.",
 zeroFutureStrategicWDLComputations:true,
 noAllGamePositionEnumeration:true,
 rootPerfectPlayWLD:"NOT_PROVED",
 maintainedCI:"NOT_RUN",
 externalProver:"NOT_RUN"
};
console.log(JSON.stringify(report,null,2));
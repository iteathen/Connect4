// SOURCE-only exact finite-width K4 STATIC complementary-column phase
// pairing certificate obstruction. Does NOT solve full Connect4 WDL.
// Computes all disjoint subsets of distance2 column edges W4..20,
// minimum uncovered true K4 four-column window starts. No solved labels.
import assert from "node:assert/strict";
const result=[];
for(let W=4;W<=20;W++){
 const edges=Array.from({length:W-2},(_,i)=>[i,i+2]);
 const allStarts=Array.from({length:W-3},(_,i)=>i);
 let best=Infinity,example=null,matchingsBest=0,searchLeaves=0;
 function scan(i,vertexUse,match,cover){
  if(i===edges.length){
   searchLeaves++;
   const unmatched=allStarts.filter(s=>(cover&(1<<s))===0);
   if(unmatched.length<best){
    best=unmatched.length;example={matchedEdges:match.map(x=>x.slice()),uncoveredStarts:unmatched};
    matchingsBest=0;
   }
   if(unmatched.length===best)matchingsBest++;
   return;
  }
  scan(i+1,vertexUse,match,cover);
  const [a,b]=edges[i];
  if((vertexUse&(1<<a))||(vertexUse&(1<<b)))return;
  let next=cover;
  for(const s of allStarts)if(s<=a&&b<=s+3)next|=(1<<s);
  match.push([a,b]);scan(i+1,vertexUse|(1<<a)|(1<<b),match,next);match.pop();
 }
 scan(0,0,[],0);
 const predicted=Math.max(0,Math.ceil((W-6)/4));
 assert.equal(best,predicted,"dimension-wide K4 matching cut formula falsified W="+W);
 const constructed=edges.filter(([a,b])=>
  (a%4===1&&b===a+2)||(a%4===2&&b===a+2));
 const used=new Set();
 constructed.forEach(([a,b])=>{
  assert.ok(!used.has(a)&&!used.has(b),"constructed matched edges overlap");
  used.add(a);used.add(b);
 });
 const rem=allStarts.filter(s=>!constructed.some(([a,b])=>s<=a&&b<=s+3));
 assert.equal(rem.length,predicted,"universal explicit constructive cover not sharp");
 result.push({
   W,originalFourColumnSpans:W-3,minimumUncoveredSpans:best,
   exactFormula:"max(0,ceil((W-6)/4))",
   minimizingMatching0based:example.matchedEdges,
   uncoveredStartColumns0based:example.uncoveredStarts,
   constructiveMatchedStep2Edges0based:constructed,
   constructiveUncoveredStarts0based:rem,
   distinctMatchingsWithMinimum:matchingsBest,
   exhaustiveDisjointMatchingSubsets:searchLeaves
 });
}
// Verify the pairing's EXACT static promise: within any 4-span, some
// matched distance2 columns are OPPOSITE iff all assignments of 0/1
// phases honoring complementary pairs exclude uniform and alternation.
function compatibleColoring(bits,matching){
 return matching.every(([a,b])=>bits[a]!==bits[b]);
}
function colorSafe(bits){
 return bits.every((_,i)=>i+4>bits.length ||
  !new Set(["0000","1111","0101","1010"]).has(bits.slice(i,i+4).join("")));
}
const examples={
 W5:[[0,2],[1,3]],
 W6:[[0,5],[1,3],[2,4]],
 W7:[[0,6],[1,3],[2,4]]
};
for(const [k,matched] of Object.entries(examples)){
 const W=+k.slice(1);
 let all=0,safe=0,badWitness=null;
 for(let z=0;z<(1<<W);z++){
  const bits=Array.from({length:W},(_,i)=>(z>>i)&1);
  if(!compatibleColoring(bits,matched))continue;
  all++;
  if(colorSafe(bits))safe++;else badWitness??=bits.join("");
 }
 assert.equal(all,1<<(W-matched.length));
 if(W<=6)assert.equal(all,safe,"fixed pair complement must guarantee safe phase W<=6");
 if(W===7){
  assert.ok(safe<all,"W7 must contain a matching-consistent unsafe phase");
  assert.ok(badWitness!==null);
 }
 examples[k]={matching:matched,complementaryColorings:all,safeColorings:safe,
   invalidColorings:all-safe,badWitness};
}
console.log(JSON.stringify({schema:1,
 status:"PASS_EXACT_DISTANCE_TWO_K4_MATCHING_OBSTRUCTION_W4_TO_W20",
 independentW7MatchingMinimumUncovered:result.find(x=>x.W===7).minimumUncoveredSpans,
 examples,result},null,2));

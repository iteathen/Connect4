// Original q static cross-owner winline race possibility: no strategic branching.
// Theorem: docs/research/2026-10-18-owner-refocus-unfolded-geometry-turn-sequence-elimination-and-race-factor.md
export function raceSupport(q){
 const {h,R0,R1}=q||{};
 if(!Array.isArray(h)||h.length!==7||h.some(v=>!Number.isInteger(v)||v<0||v>6)||
    !Array.isArray(R0)||!Array.isArray(R1)||[...R0,...R1].some(v=>typeof v!=="bigint"||v<=0n))
   throw Error("requires original nonterminal 7x6 q");
 const n=h.reduce((a,b)=>a+b,0);
 if(n>=42)throw Error("full board");
 let future=0n;
 for(let c=0;c<7;c++)for(let r=h[c];r<6;r++)future|=1n<<BigInt(7*r+c);
 for(const G of [...R0,...R1])if((G&~future)!==0n)throw Error("nonfuture source generator");
 let disjoint=0;
 const witnesses=[];
 for(let i=0;i<R0.length;i++)for(let j=0;j<R1.length;j++){
   if((R0[i]&R1[j])!==0n)continue;
   disjoint++;
   if(witnesses.length<12)witnesses.push({p0:i,p1:j});
 }
 return {
   status:disjoint===0?"CERTIFIED_FIXED_WORD_RACE_FREE":"INCOMPLETE",
   originalSourcePly:n,
   ownerSourceResidualCounts:[R0.length,R1.length],
   crossOwnerPairsChecked:R0.length*R1.length,
   disjointCrossOwnerPairs:disjoint,
   firstPotentialRacePairs:witnesses,
   raceTermProvablyVanishesOnAllFullHypotheticalWords:disjoint===0,
   level2BestOriginalColumn:null,
   ordinaryRootValueP0Relative:null,
   alternativeFutureGameValuesComputed:0,
   futureGameSuccessorsConstructed:0,
   fullWordsEnumerated:0
 };
}

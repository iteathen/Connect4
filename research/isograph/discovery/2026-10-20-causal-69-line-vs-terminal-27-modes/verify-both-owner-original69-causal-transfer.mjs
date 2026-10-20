// Original 7x6K4 source-line causal transfer. BOTH owner-specific threat
// fields, not any historical 28-terminal target-selection mask.
// Run with Node >=20 from this folder; only historical 27 complete physical
// game WORDS and one negative DRAW supply genuinely legal q for checking.
// The 28 archived line IDs, strong scores and future game-value evaluation
// are NEVER read by the producer. No strategic future-game recursion.
import fs from "node:fs";
import assert from "node:assert/strict";
const source=JSON.parse(fs.readFileSync(new URL(
 "../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json",
 import.meta.url),"utf8"));
const games=[...new Set(source.witnesses.map(x=>x.movesZeroBased))];
const draw="123456123456654321654321123456123456777777";
const W=7,H=6,K=4,LINES=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   const cells=Array.from({length:K},(_,i)=>[c+i*dc,r+i*dr]);
   if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
     LINES.push(cells);
 }
assert.equal(LINES.length,69);
const id=(c,r)=>c*H+r;
const empty=()=>({n:0,h:Array(W).fill(0),
 b:Array.from({length:W},()=>Array(H).fill(-1))});
const clone=q=>({n:q.n,h:q.h.slice(),b:q.b.map(row=>row.slice())});
function residual(q,p){
 const remaining=[],f=[];
 for(const cells of LINES){
   let blocked=false,missing=[];
   for(const [c,r] of cells){
     const owner=q.b[c][r];
     if(owner===1-p)blocked=true;
     else if(owner===-1)missing.push(id(c,r));
   }
   const R=blocked?null:missing;
   remaining.push(R);
   f.push(Number(R!==null&&R.length===1&&
    q.h[Math.floor(R[0]/H)]===R[0]%H));
 }
 return {remaining,f};
}
function place(q,c,p){
 assert.equal(p,q.n%2);
 assert.ok(c>=0&&c<W&&q.h[c]<H);
 q.b[c][q.h[c]++]=p;q.n++;
 return LINES.some(line=>line.every(([x,y])=>q.b[x][y]===p));
}
const stats={
 historicalUniqueWitnessGames:games.length,historicalLiteralMoves:0,
 fullDrawLiteralMoves:0,currentSourcePositions:0,
 currentLegalPhysicalMoveAlternatives:0,
 firstwinningPhysicalAlternativesExcluded:0,
 nonterminalPhysicalOneStepAlternatives:0,
 individualOwnerLineTagComparisons:0,
 mismatches:0,
 owner0ActionPromotionEvents:0,owner1ActionPromotionEvents:0,
 owner0ActionUpperReleaseEvents:0,owner1ActionUpperReleaseEvents:0,
 P0ThreatBlockedByP1Events:0,P1ThreatBlockedByP0Events:0,
 P0ThreatUpperReleasedByP1Events:0,P1ThreatUpperReleasedByP0Events:0
};
function checkOneGame(word,oneBased=false){
 const q=empty();
 for(let n=0;n<word.length;n++){
   const p=n%2,from=[residual(q,0),residual(q,1)];
   stats.currentSourcePositions++;
   for(let c=0;c<W;c++)if(q.h[c]<H){
     const x=id(c,q.h[c]),y=q.h[c]+1<H?id(c,q.h[c]+1):null;
     const child=clone(q);
     stats.currentLegalPhysicalMoveAlternatives++;
     if(place(child,c,p)){
       stats.firstwinningPhysicalAlternativesExcluded++;
       continue;
     }
     stats.nonterminalPhysicalOneStepAlternatives++;
     for(const owner of [0,1]){
       const newer=residual(child,owner),initial=from[owner];
       for(let i=0;i<LINES.length;i++){
         const R=initial.remaining[i];
         let delta=0;
         if(R!==null){
           if(owner===p){
             const release=Number(y!==null&&R.length===1&&R[0]===y);
             let promotion=0;
             if(R.length===2&&R.includes(x)){
               const v=R.find(e=>e!==x);
               promotion=Number(child.h[Math.floor(v/H)]===v%H);
             }
             delta=release+promotion;
             if(owner===0){
               stats.owner0ActionPromotionEvents+=promotion;
               stats.owner0ActionUpperReleaseEvents+=release;
             }else{
               stats.owner1ActionPromotionEvents+=promotion;
               stats.owner1ActionUpperReleaseEvents+=release;
             }
           }else{
             const sink=Number(R.length===1&&R[0]===x);
             const release=Number(y!==null&&R.length===1&&R[0]===y);
             delta=-sink+release;
             if(owner===0){
               stats.P0ThreatBlockedByP1Events+=sink;
               stats.P0ThreatUpperReleasedByP1Events+=release;
             }else{
               stats.P1ThreatBlockedByP0Events+=sink;
               stats.P1ThreatUpperReleasedByP0Events+=release;
             }
           }
         }
         stats.individualOwnerLineTagComparisons++;
         if(newer.f[i]-initial.f[i]!==delta){
           stats.mismatches++;
           throw Error(JSON.stringify({
             qPrefix:word.slice(0,n),n,p,columnOneBased:c+1,
             owner,originalLine:LINES[i],remainingSource:R,
             before:initial.f[i],after:newer.f[i],prediction:delta
           }));
         }
       }
     }
   }
   const last=Number(word[n])-(oneBased?1:0),won=place(q,last,p);
   if(oneBased){
     assert.equal(won,false,"literal full-DRAW must not firstwin");
     stats.fullDrawLiteralMoves++;
   }else{
     assert.equal(won,n===40,"selected history firstwin must be at move41");
     stats.historicalLiteralMoves++;
   }
 }
}
games.forEach(word=>checkOneGame(word));
checkOneGame(draw,true);
assert.deepEqual([
 stats.historicalLiteralMoves,
 stats.fullDrawLiteralMoves,
 stats.currentSourcePositions,
 stats.nonterminalPhysicalOneStepAlternatives,
 stats.individualOwnerLineTagComparisons,
 stats.mismatches
],[1107,42,1149,6059,836142,0]);
console.log(JSON.stringify({status:"PASS_ORIGINAL_BOTH_OWNER_69_K4_LINE_SOURCE_TRANSFER",
 ...stats,historicalOptimal28LineLabelsReadInProducer:false,
 historicalStrongScoresRerun:false,rootWDLInferred:false},null,2));

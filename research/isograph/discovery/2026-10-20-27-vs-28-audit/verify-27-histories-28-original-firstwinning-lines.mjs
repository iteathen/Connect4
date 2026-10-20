// Research-only original 7x6 K4 historical 27-vs-28 disambiguation.
// The issue41 archived strong score is a HISTORICAL EXTERNAL PREMISE;
// the physical replay here independently rederives legal firstwinning lines,
// no early wins, every physical cell ownership and source-conditional envelope.
// NO optimal-play teacher query, game-tree search, or simulator package import.
import fs from "node:fs";
import assert from "node:assert/strict";
const path="../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json";
const fixture=JSON.parse(fs.readFileSync(new URL(path,import.meta.url),"utf8"));
const W=7,H=6,K=4;
const key=cells=>cells.map(t=>t.join(",")).sort().join("|");
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 for(const [dc,dr,orientation] of [[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]]){
  const cells=Array.from({length:K},(_,i)=>[c+dc*i,r+dr*i]);
  if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   lines.push({cells,key:key(cells),orientation});
 }
}
assert.equal(lines.length,69);
const byHistory=new Map(),tagByKey=new Map();
for(const witness of fixture.witnesses){
 assert.equal(witness.movesZeroBased.length,41);
 const k=key(witness.cells);
 assert.ok(lines.some(L=>L.key===k),"labeled line is not ORIGINAL");
 assert.equal(tagByKey.has(k),false,"duplicated geometric line");
 tagByKey.set(k,witness.lineId);
 const group=byHistory.get(witness.movesZeroBased)||[];
 group.push(witness.lineId);
 byHistory.set(witness.movesZeroBased,group);
}
assert.equal(tagByKey.size,28);
assert.equal(fixture.witnesses.length,28);
assert.equal(byHistory.size,27);
const terminalGroups=[],union=new Set(),hist={};
for(const [word,recordLabels] of byHistory){
 const b=Array.from({length:W},()=>Array(H).fill(-1));
 const height=Array(W).fill(0);
 let won=[];
 for(let i=0;i<word.length;i++){
  const c=Number(word[i]),p=i%2;
  assert.ok(Number.isInteger(c)&&c>=0&&c<W&&height[c]<H,"illegal gravity drop");
  const r=height[c]++;
  b[c][r]=p;
  const completed=lines.filter(L=>L.cells.every(([x,y])=>b[x][y]===p));
  if(i<40)assert.equal(completed.length,0,"earlier FIRSTWIN");
  else{
   assert.equal(p,0);
   assert.ok(completed.length>0);
   won=completed;
  }
 }
 const labels=won.map(L=>tagByKey.get(L.key));
 assert.ok(labels.every(x=>Number.isInteger(x)),"terminal K4 not in 28 line set");
 assert.ok(recordLabels.every(id=>labels.includes(id)),"source witness line not completed");
 won.forEach(L=>union.add(L.key));
 hist[won.length]=(hist[won.length]||0)+1;
 const last=Number(word.at(-1)),landing=[last,height[last]-1];
 terminalGroups.push({recordLabels,completedLineIds:labels.sort((a,b)=>a-b),
  lineCount:won.length,finalLandingZeroBased:landing});
}
assert.deepEqual(hist,{"1":19,"2":5,"3":2,"4":1});
assert.equal(union.size,28);
assert.deepEqual([...union].sort(),[...tagByKey.keys()].sort());
const duplicates=[...byHistory].filter(([word,labels])=>labels.length>1);
assert.equal(duplicates.length,1);
const [word,labels]=duplicates[0];
assert.deepEqual(labels,[41,56]);
const target=terminalGroups.find(g=>g.recordLabels.includes(41));
assert.deepEqual(target.completedLineIds,[35,41,53,56]);
assert.deepEqual(target.finalLandingZeroBased,[5,4]);
const all=[...tagByKey.values()].sort((a,b)=>a-b);
const keepFirst=[...byHistory.values()].map(x=>x[0]);
const keepLast=[...byHistory.values()].map(x=>x.at(-1));
assert.deepEqual(all.filter(x=>!keepFirst.includes(x)),[56]);
assert.deepEqual(all.filter(x=>!keepLast.includes(x)),[41]);
// CONDITIONAL, NOT source-proved optimal opening/remoteness:
const topTwo=lines.filter(L=>L.cells.some(([c,r])=>r>=4));
const avoidP1=topTwo.filter(L=>!L.cells.some(([c,r])=>c===3&&(r===1||r===3)));
const envelope=avoidP1.filter(L=>L.cells.some(([c,r])=>r>=4&&!(c===3&&r===4)));
assert.deepEqual([topTwo.length,avoidP1.length,envelope.length],[38,30,28]);
assert.deepEqual(envelope.map(L=>L.key).sort(),[...tagByKey.keys()].sort());
const result={
 status:"PASS_ORIGINAL_69_WINDOW_PHYSICAL_REPLAY_27_HISTORIES_28_LINES",
 game:"original W7H6K4, gravity, alternate and FIRSTWIN stop",
 archiveHistoricalStrongScoresRerun:false,
 originalWindowCount:69,
 perWinningLineWitnessRecords:fixture.witnesses.length,
 distinctArchivedHistoryWords:byHistory.size,
 distinctFirstWinningLineIdentitiesInUnion:union.size,
 firstWinLinesPerHistoryHistogram:hist,
 perHistoryLineOccurrences:terminalGroups.reduce((n,g)=>n+g.lineCount,0),
 sharedHistoryRecordLabels:labels,
 sharedHistoryWordZeroBased:word,
 sharedHistoryActualTerminalIds:target.completedLineIds,
 sharedLastLandingZeroBased:target.finalLandingZeroBased,
 arbitraryOneLabelDedupMissingWhenKeepingFirst:[56],
 arbitraryOneLabelDedupMissingWhenKeepingLast:[41],
 conditionalStrongCenterFiveAndPly41WindowEnvelope:{
  topTwoRowWindows:topTwo.length,
  excludeKnownCenterP1Sites:avoidP1.length,
  excludeAlreadyP0CenterTopAsPossibleFinalLanding:envelope.length,
  exactMatchingLineSet:true
 },
 fullHistoryLabels:terminalGroups,
 noSourceWDLTheoremClaim:true
};
console.log(JSON.stringify(result,null,2));

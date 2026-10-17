// Independent actual standard W=7,H=6,K=4 LINKED LINEAR WORD falsifier.
// Source word append and tape encode no game-future WDL; validation invokes
// original exact q SINGLE STEP and independent physical first-win checker.
// FROZEN BEFORE RUN, research/semantic-quotient, 2026-10-17.
import {createLinkedLinearWordGame} from './standard7x6-linked-linear-word-game.mjs';
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
const W=7,H=6,K=4,N=W*H,geometry={width:W,height:H,connect:K};
const wordGame=createLinkedLinearWordGame(geometry),core=createExactQCore(geometry);
const {tape,segments,intervals,wires}=wordGame.immutable;
let seed=0xC7A62B12>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function assert(test,msg){if(!test)throw Error(msg);}
const stats={schema:'connect4.7x6.linear_word_canonical_q_bisimulation_v0_1',
 W,H,K,date:'2026-10-17',seedStart:seed,
 tapeLength:tape.length,wordRibbonSegments:segments.length,delimiterSlots:0,
 tapePhysicalOccurrenceSlots:0,tapeGeometricKWindows:intervals.length,
 allPhysicalCellsFourAliased:true,all69WinlinesUnfoldedCorrectly:false,
 canonical:[],nonterminalPhysicalSources:0,
 wordLegalActionMaskComparisons:0,
 wordAppendsVerified:0,wordFirstWinTerminals:0,wordFullDrawTerminals:0,
 nonterminalWordQMatches:0,
 actualPhysicalFirstWinComparisons:0,
 allTapeAliasUpdatesCorrect:0,
 fixedCompleteHypotheticalWordsChecked:0,
 fixedWordSourceVsPhysicalWinnerErrors:0,
 fixedWordSourceVsPhysicalFirstWinRankErrors:0,
 rootValueOrOptimalMoveOracleQueries:0,
 wrongWordTransition:0,sourceStrategicValueFanout:0,
 sampledTrajectories:0,seedFinal:null};
const expectedWinMasks=core.lines.map(String).sort();
const tapeWinMasks=[];
for(const seg of segments){
 assert(seg.length>0,'empty segment');
 for(let i=0;i<seg.length;i++)assert(tape[seg.start+i]>=0,'delimiter inside segment');
 for(let j=0;j+K<=seg.length;j++){
  let m=0n;
  for(let d=0;d<K;d++)m|=1n<<BigInt(tape[seg.start+j+d]);
  tapeWinMasks.push(String(m));
 }
}
assert(tapeWinMasks.sort().join('|')===expectedWinMasks.join('|'),'single tape K substrings differ from physical winlines');
stats.all69WinlinesUnfoldedCorrectly=true;
stats.delimiterSlots=tape.filter(x=>x===-1).length;
stats.tapePhysicalOccurrenceSlots=tape.filter(x=>x>=0).length;
assert(stats.tapeLength===204&&stats.delimiterSlots===36&&stats.tapePhysicalOccurrenceSlots===168
 &&segments.length===37,'single tape format not canonical 7x6 geometry');
for(let id=0;id<N;id++){
 assert(wires[id].length===4,'missing equality alias');
 assert(wires[id].every(k=>tape[k]===id),'wrong copy physical event ID');
 const dirs=new Set(wires[id].map(k=>segments.find(s=>k>=s.start&&k<s.end).direction));
 assert(dirs.size===4,'four orientations not linked to same cell');
}
function blank(){return {h:Array(W).fill(0),P:[0n,0n],n:0,history:''};}
function directWin(grid,c,r,p){
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  let z=1;
  for(const dir of [-1,1]){
   let x=c+dir*dx,y=r+dir*dy;
   while(x>=0&&x<W&&y>=0&&y<H&&grid[x][y]===p){
    z++;x+=dir*dx;y+=dir*dy;
   }
  }
  if(z>=K)return true;
 }
 return false;
}
function physicalMove(st,c){
 const row=st.h[c],id=row*W+c,p=st.n&1;
 assert(c>=0&&c<W&&row<H,'illegal direct gravity placement');
 const h=st.h.slice(),P=st.P.slice();h[c]++;
 P[p]|=1n<<BigInt(id);
 const grid=Array.from({length:W},()=>Array(H).fill(-1));
 for(let j=0;j<W;j++)for(let r=0;r<H;r++){
  const cell=1n<<BigInt(r*W+j);
  if((P[0]&cell)!==0n)grid[j][r]=0;
  if((P[1]&cell)!==0n)grid[j][r]=1;
 }
 return {h,P,n:st.n+1,history:st.history+(c+1),
  win:directWin(grid,c,row,p),winner:p,cellId:id};
}
function fromHistory(seq){
 let st=blank();
 for(const letter of seq){st=physicalMove(st,Number(letter)-1);assert(!st.win,'canonical history already first-won');}
 return st;
}
function qSource(st){
 return core.fromPhysical({h:st.h,p0:st.P[0],p1:st.P[1]});
}
function inspectOne(st,checkHypothetical=true){
 if(st.n===N||st.win)throw Error('nonterminal source needed');
 stats.nonterminalPhysicalSources++;
 const q=qSource(st),state=wordGame.fromSource(q);
 assert(core.key(q)===core.key(wordGame.sourceQ(state)),'word state initial q encoding mismatched');
 const all=core.legal(q),actual=wordGame.legal(state);
 stats.wordLegalActionMaskComparisons++;
 assert(all.join(',')===actual.join(','),'word game future legal action mask mismatched');
 for(const a of all){
  const physical=physicalMove(st,a),wanted=core.next(q,a),have=wordGame.append(state,a);
  stats.wordAppendsVerified++;
  assert(have.trigger.literalColumn===a+1&&have.trigger.absoluteTurn===st.n+1 &&
    have.trigger.physicalCellId===physical.cellId&&have.trigger.owner===st.n%2,
   'single-word append event/turn/next-gravity meaning mismatch');
  assert(have.trigger.fourAliasTapeOffsets.length===4 &&
    have.trigger.fourAliasTapeOffsets.every(off=>tape[off]===physical.cellId),
   'one appended symbol did not write to all four linked tape occurrences');
  stats.allTapeAliasUpdatesCorrect++;
  if('terminal' in wanted){
   assert(have.terminal===wanted.terminal&&have.kind===wanted.kind,
    'source word terminal token mismatched reference q');
   assert((wanted.kind==='win')===physical.win,'source first-win differs true physical grid');
   if(wanted.kind==='win')stats.wordFirstWinTerminals++;
   else stats.wordFullDrawTerminals++;
  }else{
   assert(have.state&&wordGame.legal(have.state).join(',')===core.legal(wanted.q).join(','),
      'nonterminal word successor has different legal move mask');
   assert(core.key(wordGame.sourceQ(have.state))===core.key(wanted.q),
      'nonterminal word q and exact qualified q cofactor disagree');
   assert(!physical.win,'physical grid won but source word proceeded');
   stats.nonterminalWordQMatches++;
  }
  stats.actualPhysicalFirstWinComparisons++;
 }
 if(!checkHypothetical)return {q,state};
 const futureH=st.h.slice(),letters=[];
 while(letters.length<N-st.n){
  const options=[];for(let c=0;c<W;c++)if(futureH[c]<H)options.push(c);
  const chosen=options[rand()%options.length];letters.push(chosen);futureH[chosen]++;
 }
 const score=wordGame.payoffOfFullHypotheticalWord(q,letters);
 let replay=st,first=null;
 for(const c of letters){
  if(first!==null)break;
  replay=physicalMove(replay,c);
  if(replay.win)first={winner:replay.winner,turn:replay.n};
 }
 const winner=first?.winner??null,absolute=first?.turn??null;
 stats.fixedCompleteHypotheticalWordsChecked++;
 if(score.winner!==winner){stats.fixedWordSourceVsPhysicalWinnerErrors++;throw Error('fixed word source payoff winner differed physical FIRST win');}
 if(score.absoluteTurn!==absolute){stats.fixedWordSourceVsPhysicalFirstWinRankErrors++;throw Error('fixed word source payoff first terminal rank differed physical');}
 return {q,state};
}
for(const hist of ['','4','44444','444444','444441','4444442']){
 const st=fromHistory(hist),{q,state}=inspectOne(st,true);
 stats.canonical.push({
  history:hist,ply:st.n,
  currentSourceResidualCounts:[q.R0.length,q.R1.length],
  legalNextWordSymbols:wordGame.legal(state).map(c=>c+1),
  remainingSymbolCapacities:st.h.map(x=>H-x)
 });
}
for(let t=0;t<1250;t++){
 stats.sampledTrajectories++;
 let st=blank();
 while(st.n<N){
  if([3,5,8,12,18,24,29,34,38,40,41].includes(st.n))
   inspectOne(st,st.n===5||st.n===12||st.n===29||st.n===38);
  const options=[];
  for(let c=0;c<W;c++)if(st.h[c]<H){
   const step=physicalMove(st,c);if(!step.win)options.push(c);
  }
  if(!options.length)break;
  st=physicalMove(st,options[rand()%options.length]);
 }
}
stats.seedFinal=seed;
console.log(JSON.stringify(stats,null,2));

// Independent physical validator for previously frozen multi-reservoir
// source-only P0/P1 responder win theorem. Not game-value minimax: only
// exhausts defender physical one-step alternatives against ONE SOURCE
// PRECOMMITTED online A policy; source positivity frozen before enumeration.
// To execute: node research/isograph/discovery/2026-10-20-regular-dimension-response/independent-original-multireservoir-firstwin-ray-check.mjs
import {sourceMultiReservoirResponderWin} from "./source-general-multireservoir-latent-win.mjs";
const FIXTURES=[
 [5,5,"355554444333352421122211"],
 [5,6,"3555555444433332211223224411"],
 [5,8,"355555555444433333322112232222444411"],
 [6,6,"3666666555555443344332211223224411"],
 [7,6,"4777777666666554455443322334335522"]
];
const DRAW_CONTROL=[7,6,"123456123456654321654321123456123456777777"];
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const assert=(b,s)=>{if(!b)throw Error(s);};
const make=(W,H)=>({W,H,h:Array(W).fill(0),b:Array.from({length:W},()=>Array(H).fill(-1)),n:0});
const clone=q=>({W:q.W,H:q.H,h:q.h.slice(),b:q.b.map(v=>v.slice()),n:q.n});
const actions=q=>q.h.map((h,c)=>h<q.H?c:-1).filter(c=>c>=0);
function ray(b,c,r,p,W,H){
 for(const [dc,dr] of DIRS){
  let k=1;
  for(const s of [-1,1]){
   let x=c+dc*s,y=r+dr*s;
   while(x>=0&&x<W&&y>=0&&y<H&&b[x][y]===p){k++;x+=dc*s;y+=dr*s;}
  }
  if(k>=4)return true;
 }
 return false;
}
function drop(q,c){
 const {W,H}=q;assert(c>=0&&c<W&&q.h[c]<H,"original illegal column");
 const p=q.n%2,r=q.h[c]++;
 q.b[c][r]=p;q.n++;
 return {winner:ray(q.b,c,r,p,W,H),player:p,col:c,row:r};
}
function physicalSourceHistoryPrefix(W,H,word,n){
 const q=make(W,H);
 for(let i=0;i<n;i++){
  const c=Number(word[i])-1,step=drop(q,c);
  assert(!step.winner,"original prefix already firstwin at "+(i+1));
 }
 return q;
}
function physicallyVerifySourceRoot(q,cert){
 const {W,H}=q;
 const D=cert.sourceDPlayer,A=cert.sourceAPlayer,danger=cert.dangerColumnOneBased-1;
 const visited=new Set();
 let currentOpponentActions=0,endingAttackerWins=0,minPly=Infinity,maxPly=-Infinity,states=0;
 function visit(state){
  const key=state.b.map(v=>v.join("")).join("|");
  if(visited.has(key))return;
  visited.add(key);states++;
  assert(state.n%2===D,"wrong signed original defender-to-move");
  for(const d of actions(state)){
   currentOpponentActions++;
   const child=clone(state),first=drop(child,d);
   assert(!first.winner,"defender FIRSTWINS, source maximal-mask proof invalid");
   assert(first.player===D,"wrong owner at defender turn");
   assert(child.h[d]<H,"attacker physical mate must be immediately available");
   assert(d===danger||((H-state.h[d])%2===0),"non-danger parity guard violated");
   const mate=drop(child,d);
   assert(mate.player===A,"wrong owner at attacker turn");
   if(mate.winner){
    endingAttackerWins++;
    minPly=Math.min(minPly,child.n);
    maxPly=Math.max(maxPly,child.n);
    continue;
   }
   assert(d!==danger,"original A singleton above dangerous x must win immediately");
   visit(child);
  }
 }
 visit(clone(q));
 assert(endingAttackerWins>0,"source proof has no physically terminal response");
 assert(maxPly<=q.n+cert.maximumAdditionalPliesUntilAttackerFirstwin,
  "source finite reservoir deadline bound incorrect");
 return {rank:q.n,D,A,dangerColumnOneBased:danger+1,pairs:cert.totalReservoirPairs,
  statesChecked:states,defenderAlternativesChecked:currentOpponentActions,
  distinctPhysicalTerminalAlternatives:endingAttackerWins,
  earliestAbsoluteAttackerWinPly:minPly,latestAbsoluteAttackerWinPly:maxPly};
}
const found=[];
for(const [W,H,word] of FIXTURES){
 let root=make(W,H),firstWin=null;
 for(let n=0;n<word.length;n++){
  const cert=sourceMultiReservoirResponderWin(root,4);
  if(cert.status==="SOURCE_PROVED_RESPONDER_FIRST_WIN")
   found.push({W,H,word,
     ...physicallyVerifySourceRoot(root,cert),certificate:cert});
  const c=Number(word[n])-1,step=drop(root,c);
  if(step.winner){
   assert(n===word.length-1,"history contains illegal post-terminal moves");
   firstWin={player:step.player,rank:root.n};
  }
 }
 assert(firstWin!==null,"frozen counterexample has no firstwinner");
 assert(firstWin.player===1,"frozen P0 policy falsifier did not P1 firstwin");
}
let draw=make(DRAW_CONTROL[0],DRAW_CONTROL[1]),drawFalsePositives=0;
for(let i=0;i<DRAW_CONTROL[2].length;i++){
 const cert=sourceMultiReservoirResponderWin(draw,4);
 if(cert.status==="SOURCE_PROVED_RESPONDER_FIRST_WIN")drawFalsePositives++;
 const step=drop(draw,Number(DRAW_CONTROL[2][i])-1);
 assert(!step.winner,"draw control original firstwin");
}
assert(draw.n===42&&drawFalsePositives===0,"draw control source false positive");
const totals={rootPositiveCount:found.length,originalDefenderActionsTested:found.reduce((s,x)=>s+x.defenderAlternativesChecked,0),
 independentPhysicalStateRoots:found.reduce((s,x)=>s+x.statesChecked,0),
 rootPositivesByDimension:Object.fromEntries(
  FIXTURES.map(([W,H])=>[W+"x"+H,found.filter(x=>x.W===W&&x.H===H).length]))};
console.log(JSON.stringify({
 schema:1,status:"PASS_SOURCE_FROZEN_PLUS_INDEPENDENT_ORIGINAL_PHYSICAL_RAY",
 originalFirstwinSources:found,totals,
 negativeFullOriginalDrawControl:{W:7,H:6,fullMoves:42,sourceFalsePositives:drawFalsePositives},
 noExternalWDLWasUsedAsSourceInput:true
},null,2));

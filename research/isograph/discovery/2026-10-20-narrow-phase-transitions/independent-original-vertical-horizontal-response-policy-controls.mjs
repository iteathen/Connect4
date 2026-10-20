// Original Connect4 K4: independent physical 4-orientation firstwin checker
// and bounded exhaustive adversarial validation of the W3 vertical pair policy.
// Source author: research/semantic-quotient, WDL source result from earlier narrow-width theorem.
// The three explicit losing trajectories REFUTE ONLY named naive paired-response policies,
// not their defender's overall exact WDL. No minimax game-valuing by the source.
const assert=(z,m)=>{if(!z)throw Error(m)};
const wins=(W,H,K)=>{
 const A=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
   let L=Array.from({length:K},(_,i)=>[c+i*dx,r+i*dy]);
   if(L.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))A.push(L);
  }
 return A;
};
const blank=(W,H)=>({h:Array(W).fill(0),b:Array.from({length:W},()=>Array(H).fill(-1)),n:0});
const clone=q=>({h:q.h.slice(),b:q.b.map(x=>x.slice()),n:q.n});
const legal=(q,H)=>q.h.map((v,c)=>v<H?c:-1).filter(z=>z>=0);
const drop=(q,c,W,H,L)=>{
 assert(q.h[c]<H&&c>=0&&c<W,"original illegal gravity drop");
 const p=q.n%2,r=q.h[c]++;q.n++;q.b[c][r]=p;
 const line=L.filter(a=>a.every(([x,y])=>q.b[x][y]===p));
 return {owner:p,columnOneBased:c+1,rowOneBased:r+1,
   firstWin:line.length>0,lines:line.map(a=>a.map(([x,y])=>[x+1,y+1]))};
};
function originalHistory(W,H,K,columnSequence){
 const q=blank(W,H),L=wins(W,H,K),events=[];
 for(const x of columnSequence){
  const z=drop(q,x-1,W,H,L);
  events.push(z);
  if(z.firstWin){assert(events.length===columnSequence.length,"already terminal");break;}
 }
 return {W,H,K,originalSequenceOneBased:columnSequence.join(""),events,
  terminalWinner:events.at(-1)?.firstWin?events.at(-1).owner:null,
  terminalRank:events.at(-1)?.firstWin?events.length:null};
}
function defenderVerticalPairsW3(H,D){
 const W=3,K=4,attacker=1-D,L=wins(W,H,K);
 const start=blank(W,H);
 if(D===0){const first=drop(start,0,W,H,L);assert(!first.firstWin,"first defender win");}
 const seen=new Set();
 let attackerActions=0,distinctStateRoots=0,draws=0,defenderWins=0,maxRank=0;
 function visit(q){
  if(q.n===W*H){draws++;return;}
  assert(q.n%2===attacker,"bad player to move in original policy exploration");
  const key=q.b.map(a=>a.join("")).join("|");
  if(seen.has(key))return;seen.add(key);
  distinctStateRoots++;maxRank=Math.max(maxRank,q.n);
  for(const a of legal(q,H)){
   attackerActions++;
   const child=clone(q),attack=drop(child,a,W,H,L);
   assert(!attack.firstWin,"original attacker K4 firstwin falsifies W<K source vertical policy");
   if(child.n===W*H){draws++;continue;}
   let response;
   if((attack.rowOneBased-1)%2===0 && attack.rowOneBased<H)
     response=a;  // gravity releases the immediately-above member of the pair
   else{
    if((attack.rowOneBased-1)%2===1)
     assert(child.b[a][attack.rowOneBased-2]===D,
       "attacker unexpectedly owns both members of even/odd adjacent pair");
    response=legal(child,H)[0];
   }
   assert(response!==undefined,"defender has no original legal reply before filled-board draw");
   const answer=drop(child,response,W,H,L);
   if(answer.firstWin){defenderWins++;continue;}
   if(child.n===W*H){draws++;continue;}
   visit(child);
  }
 }
 visit(start);
 return {W,H,K,defenderD:D,attackerA:attacker,statesValidated:distinctStateRoots,
  legalAdversarialAttackerActionsChecked:attackerActions,
  completedDrawEnds:draws,defenderEarlyWinEnds:defenderWins,maxRank};
}
const negativePolicies=[
 {label:"W4 vertical-only P1 upper mate loses to P0 new horizontal K4",W:4,H:4,K:4,word:[1,1,2,2,3,3,4],expectedWinner:0,expectedPly:7},
 {label:"W5 wrong P0 fixed mate opening outside common K-span loses to P1 new right-hand horizontal K4",W:5,H:4,K:4,word:[1,2,2,3,3,4,4,5],expectedWinner:1,expectedPly:8},
 {label:"H4 horizontal-only P1 same-height neighbor mate loses to P0 vertical K4",W:4,H:4,K:4,word:[1,2,1,2,1,2,1],expectedWinner:0,expectedPly:7},
 {label:"H3 control: no vertical K4 exists, same prefix cannot have four P0 vertical cells",W:4,H:3,K:4,word:[1,2,1,2,1,2],expectedWinner:null,expectedPly:null}
].map(spec=>{
 const r=originalHistory(spec.W,spec.H,spec.K,spec.word);
 assert(r.terminalWinner===spec.expectedWinner&&r.terminalRank===spec.expectedPly,
  "named source-response boundary negative control failed "+spec.label);
 return {label:spec.label,...r};
});
const fullyAdversarial=[];
for(const H of [5,6,7,8])for(const D of [0,1])
 fullyAdversarial.push(defenderVerticalPairsW3(H,D));
const outcome={schema:1,status:"PASS_8_BOTH_SIDED_W3_VERTICAL_POLICY_ADVERSARIAL_CHECKS_AND_4_REAL_PHYSICAL_NEGATIVES",
 source:"docs/research/2026-10-18-arbitrary-k-narrow-width-exact-draw-response-theorem.md",
 qualification:"This is a bound-preserving online policy under EVERY adversarial current action in finite tested positions, not a full mixed-direction K4 minimax result",
 originalNonWrappedK4:true,firstwinStops:true,alternation:true,
 narrowW3ExhaustivePolicies:fullyAdversarial,
 physicalPolicyBoundaryCounterexamples:negativePolicies};
console.log(JSON.stringify(outcome,null,2));

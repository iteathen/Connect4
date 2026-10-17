// Independent verifier for the prior frozen source-control witness.
// 7x6 Connect4 (W,H,K explicit). Array-grid geometric checker (NO BigInt
// source line masks, XOR predicate, or source-control helper functions).
// Schedules are hypothetically filled past first win solely to compare
// final color assignments. First-win-stopped prefixes are legal games.
// Frozen before execution on 2026-10-17.
const W=7,H=6,K=4;
const histories=[
 '277734114757637654125614163236521322364545',
 '277734114757637654125614163216523322364545'
];
function check(history){
 if(history.length!==W*H)throw Error('wrong number of placements');
 const board=Array.from({length:W},()=>Array(H).fill(-1)),heights=Array(W).fill(0);
 const dirs=[[1,0],[0,1],[1,1],[1,-1]];
 let first=null,terminalWitness=null;
 let startBeforeFirstWin=null;
 function complete(c,r,p,dc,dr){
  const cells=[];
  for(let m=-(K-1);m<K;m++){
   const cc=c+m*dc,rr=r+m*dr;
   if(cc<0||cc>=W||rr<0||rr>=H)continue;
   if(board[cc][rr]!==p)continue;
   let good=true,coords=[];
   for(let j=0;j<K;j++){
    const x=cc+j*dc,y=rr+j*dr;
    if(x<0||x>=W||y<0||y>=H||board[x][y]!==p){good=false;break;}
    coords.push([x+1,y+1]);
   }
   if(good)return coords;
  }
  return null;
 }
 for(let i=0;i<history.length;i++){
  const c=Number(history[i])-1,p=i%2;
  if(!Number.isInteger(c)||c<0||c>=W||heights[c]>=H)throw Error('illegal gravity placement');
  const r=heights[c]++;board[c][r]=p;
  if(first===null){
   for(const [dc,dr] of dirs){
    const win=complete(c,r,p,dc,dr);
    if(win){first={player:p,turn:i+1,lastPlacedCell:[c+1,r+1],winningLine:win};
     startBeforeFirstWin=history.slice(0,i);terminalWitness=history.slice(0,i+1);break;}
   }
  }
 }
 const occupied=board.flat().filter(x=>x!==-1).length;
 if(occupied!==W*H)throw Error('not a complete hypothetical schedule');
 return {first,terminalWitness,startBeforeFirstWin,finalPerColumnColors:board.map(x=>x.join(''))};
}
const a=check(histories[0]),b=check(histories[1]);
if(JSON.stringify(a.finalPerColumnColors)!==JSON.stringify(b.finalPerColumnColors))
 throw Error('final per-cell color map mismatch');
if(!(a.first?.player===1&&a.first?.turn===30&&b.first?.player===0&&b.first?.turn===29))
 throw Error('terminal witness mismatched source result');
console.log(JSON.stringify({schema:'connect4.7x6.binary_same_final_color_time_counterexample_v0_1',
 geometry:{W,H,K},hypotheticalFullGravitySchedules:histories,
 bothFullSchedulesGravityLegal:true,
 identicalFinalPerCellColorAssignment:true,
 scheduleA:{firstWin:a.first,legalFirstWinStoppedHistory:a.terminalWitness},
 scheduleB:{firstWin:b.first,legalFirstWinStoppedHistory:b.terminalWitness},
 statement:'An ownership-only end-board XOR signature cannot recover first-win WDL; exact timing of first monochromatic original line remains required.',
 codeIndependence:'Array-grid directional K-checker; no source parity formula, no shared BigInt hyperedge implementation, no exact game-value reference.'}));

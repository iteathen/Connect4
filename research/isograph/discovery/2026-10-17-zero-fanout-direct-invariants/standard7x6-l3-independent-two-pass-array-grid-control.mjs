// Independent true W=7 H=6 K=4 physical array-grid L1/L2/L3 witness checker.
// Frozen BEFORE test. This is a deliberately BRANCHING reference, NEVER the
// owner-demanded zero-branch source algorithm.
// The prior control used bitboards and integrated WDL+distance recursion;
// here ordinary MIN/MAX WDL is solved FIRST with its own memo, and a
// SEPARATE second pass computes shortest win / longest loss only along
// FIRST-PASS WDL-optimal actions, using directional array-grid first wins.
// W,H,K remain explicit structural parameters (generalization not claimed).
const W=7,H=6,K=4,N=W*H;
const DIRECTIONS=[[1,0],[0,1],[1,1],[1,-1]];
const snapshots=[
 {tag:"winning mover, different forced-win times",
  history:"74164275144616557561416465277721225",
  V:-1,M:[2,3],D:1,Mtime:[3],
  action:[[2,-1,3],[3,-1,1]]},
 {tag:"losing mover, different forced-loss times",
  history:"14514517422472347117221257453753336",
  V:1,M:[3,5,6],D:4,Mtime:[3,5],
  action:[[3,1,4],[5,1,4],[6,1,2]]},
 {tag:"L1 same L2 same, L3 time 2",
  history:"17465376721522163351235571177433654",
  V:1,M:[2,4,6],D:2,Mtime:[2,4,6],
  action:[[2,1,2],[4,1,2],[6,1,2]]},
 {tag:"L1 same L2 same, L3 time 1",
  history:"17465376721522163351235571177433654442",
  V:1,M:[2,4,6],D:1,Mtime:[4,6],
  action:[[2,1,3],[4,1,1],[6,1,1]]},
 {tag:"same L1, L2 optimal 4 and 5",
  history:"73214345113623713521726226436516677",
  V:-1,M:[4,5],D:1,Mtime:[4,5],
  action:[[4,-1,1],[5,-1,1],[7,1,2]]},
 {tag:"same L1, L2 optimal 4",
  history:"7321434511362371352172622643651667775",
  V:-1,M:[4],D:1,Mtime:[4],
  action:[[4,-1,1],[5,1,2]]}
];
const counts={schema:"connect4.standard7x6.L3_independent_two_pass_array_grid_v0_1",
 date:"2026-10-17",board:{W,H,K},
 physicalHistories:0,rootLiteralActions:0,
 independentSourceWDLReferenceCalls:0,independentSourceWDLReferenceStates:0,
 independentTimeReferenceCalls:0,independentTimeReferenceStates:0,
 independentlyVerifiedExactRemotenessRoots:0,independentlyVerifiedExactActionDistances:0,
 wrongWDL:0,wrongMstar:0,wrongRemoteness:0,wrongMtime:0,wrongLiteralActionVector:0,
 firstWinViolation:0,drawTimeAssigned:0,results:[],
 explicitlyBranchingReference:true,
 noSourceZeroStrategicFanoutProved:true};
const vMemo=new Map(),dMemo=new Map();
const at=(c,r)=>r*W+c;
function blank(){return{h:Array(W).fill(0),cells:Array(N).fill(-1),ply:0,terminal:null};}
function hasWin(s,c,r,p){
 for(const [dc,dr] of DIRECTIONS){
  let count=1;
  for(const sign of [-1,1]){
   let x=c+sign*dc,y=r+sign*dr;
   while(x>=0&&x<W&&y>=0&&y<H&&s.cells[at(x,y)]===p){
    count++;x+=sign*dc;y+=sign*dr;
   }
  }
  if(count>=K)return true;
 }
 return false;
}
function play(s,c){
 if(s.terminal!==null||c<0||c>=W||s.h[c]>=H)
  throw Error("not a legal first-win-stopped move");
 const r=s.h[c],who=s.ply&1;
 const h=s.h.slice(),cells=s.cells.slice();
 h[c]++;cells[at(c,r)]=who;
 const child={h,cells,ply:s.ply+1,terminal:null};
 if(hasWin(child,c,r,who))child.terminal=who===0?+1:-1;
 else if(child.ply===N)child.terminal=0;
 return child;
}
function legal(s){return s.h.flatMap((a,c)=>a<H?[c]:[]);}
function restore(hist){
 let s=blank();
 for(const oneBased of hist){
  s=play(s,Number(oneBased)-1);
  if(s.terminal!==null){
   counts.firstWinViolation++;
   throw Error("input history continued past original first win");
  }
 }
 return s;
}
function key(s){return s.cells.join("")+"@"+s.ply;}
function plainWDL(s){
 counts.independentSourceWDLReferenceCalls++;
 if(s.terminal!==null)return s.terminal;
 const k=key(s);
 if(vMemo.has(k))return vMemo.get(k);
 counts.independentSourceWDLReferenceStates++;
 let current=s.ply%2===0?-1:+1;
 for(const a of legal(s)){
  const val=plainWDL(play(s,a));
  current=s.ply%2===0?Math.max(current,val):Math.min(current,val);
 }
 vMemo.set(k,current);
 return current;
}
function remotenessAfterWDL(s){
 counts.independentTimeReferenceCalls++;
 if(s.terminal!==null)return s.terminal===0?null:0;
 const k=key(s);
 if(dMemo.has(k))return dMemo.get(k);
 counts.independentTimeReferenceStates++;
 const value=plainWDL(s),actions=legal(s);
 const allowed=actions.filter(a=>plainWDL(play(s,a))===value);
 if(allowed.length<1)throw Error("no WDL preserving move in independent reference");
 if(value===0){dMemo.set(k,null);return null;}
 const distances=allowed.map(a=>{
  const childD=remotenessAfterWDL(play(s,a));
  if(childD===null)throw Error("nondraw parent with draw-preserving child");
  return childD+1;
 });
 const moverSign=s.ply%2===0?+1:-1;
 const D=moverSign*value===+1?Math.min(...distances):Math.max(...distances);
 if(D<1||D>N-s.ply)throw Error("remoteness outside physically available horizon");
 dMemo.set(k,D);return D;
}
function sameArray(a,b){return JSON.stringify(a)===JSON.stringify(b);}
for(const fixture of snapshots){
 const s=restore(fixture.history),actions=legal(s),V=plainWDL(s);
 const full=[];
 for(const c of actions){
  const child=play(s,c),v=plainWDL(child);
  const d=v===0?null:1+remotenessAfterWDL(child);
  full.push([c+1,v,d]);
 }
 const M=full.filter(z=>z[1]===V).map(z=>z[0]);
 const D=V===0?null:remotenessAfterWDL(s);
 const Mtime=V===0?null:full.filter(z=>z[1]===V&&z[2]===D).map(z=>z[0]);
 counts.physicalHistories++;
 counts.rootLiteralActions+=actions.length;
 if(V!==fixture.V){counts.wrongWDL++;throw Error("root outcome mismatch: "+fixture.tag);}
 if(!sameArray(M,fixture.M)){counts.wrongMstar++;throw Error("full optimal labels mismatch: "+fixture.tag);}
 if(D!==fixture.D){counts.wrongRemoteness++;throw Error("forced time mismatch: "+fixture.tag);}
 if(!sameArray(Mtime,fixture.Mtime)){counts.wrongMtime++;throw Error("time preferred labels mismatch: "+fixture.tag);}
 if(!sameArray(full,fixture.action)){counts.wrongLiteralActionVector++;throw Error("literal action WDL/time mismatch: "+fixture.tag);}
 counts.independentlyVerifiedExactRemotenessRoots++;
 counts.independentlyVerifiedExactActionDistances+=full.length;
 counts.results.push({tag:fixture.tag,history:fixture.history,ply:s.ply,
  ordinaryOutcome:V,completeWDLBestMoves:M,remoteness:D,remotenessBestMoves:Mtime,
  literalActionValuesAndDurations:full});
}
console.log(JSON.stringify(counts,null,2));

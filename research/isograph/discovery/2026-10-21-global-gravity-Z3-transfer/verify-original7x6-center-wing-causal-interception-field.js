"use strict";
// Original 7x6 fixed-source blocker algebra, temporal interception and
// phase-only source-future noncongruence. No solved data or game-tree search.
const assert=(b,m)=>{if(!b)throw Error("C4_FORWARD_FIELD: "+m);};
const windows=[];
for(let y=0;y<6;y++)for(let x=0;x<7;x++)for(const [dx,dy,type]of [[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]]){
 const sites=[];for(let t=0;t<4;t++){
  const c=x+dx*t,r=y+dy*t;
  if(c<0||c>=7||r<0||r>=6){sites.length=0;break;}sites.push([c,r]);
 }
 if(sites.length===4)windows.push({type,sites});
}
assert(windows.length===69,"original 69 K4");
const hist=Object.fromEntries(["H","V","R","F"].map(d=>[d,windows.filter(w=>w.type===d).length]));
assert(JSON.stringify(hist)===JSON.stringify({H:24,V:21,R:12,F:12}),"source direction counts");
// Static original bottom H4 P1 blocker dual after P0 c4 bottom.
const H4=windows.filter(w=>w.type==="H"&&w.sites.every(([c,r])=>r===0));
assert(H4.length===4&&H4.every(w=>w.sites.some(([c])=>c===3)),"four c4-crossing H4");
const wings=[1,2,3,5,6,7];
const hits=owned=>H4.every(w=>w.sites.some(([c])=>owned.includes(c+1)));
const admissible=[],minimal=[];
for(let v=0;v<64;v++){
 const owned=wings.filter((c,i)=>Boolean(v&(1<<i)));
 if(!hits(owned))continue;
 admissible.push(owned);
 if(owned.every(c=>!hits(owned.filter(x=>x!==c))))minimal.push(owned);
}
const expected=[[1,5],[2,5],[2,6],[3,5],[3,6],[3,7]];
assert(admissible.length===44&&minimal.length===6,"44 static hitting sets / six minimal pairs");
assert(minimal.map(x=>x.join(",")).sort().join("|")===expected.map(x=>x.join(",")).sort().join("|"),"six precise minimal cross-wing pairs");
const parent=new Map(wings.map(x=>[x,x]));
const root=x=>{while(parent.get(x)!==x)x=parent.get(x);return x;};
for(const [a,b]of minimal)parent.set(root(a),root(b));
assert(new Set(wings.map(root)).size===1,"six wing blocker vertices connected");
assert(minimal.length-wings.length+1===1,"single undirected wing incidence cycle");
// For the oriented incidence vectors v_(a,b)=-e_a+e_b,
// v25+v36-v26-v35=0: unique primitive square loop.
const vec=([a,b])=>wings.map(x=>Number(x===b)-Number(x===a));
const v25=vec([2,5]),v36=vec([3,6]),v26=vec([2,6]),v35=vec([3,5]);
assert(wings.every((x,i)=>v25[i]+v36[i]-v26[i]-v35[i]===0),"signed wing incidence square");
function perms(xs){
 const out=[],v=xs.slice();
 function rec(k){if(k===4){out.push(v.slice());return;}
  for(let j=k;j<4;j++){[v[k],v[j]]=[v[j],v[k]];rec(k+1);[v[k],v[j]]=[v[j],v[k]];}
 }rec(0);return out;
}
const attackScripts=[];
let checkedPotentialLines=0;
for(let start=1;start<=4;start++){
 const columns=[start,start+1,start+2,start+3];
 const targets=new Set(columns);
 const candidate=windows.filter(w=>w.sites.every(([c])=>targets.has(c+1)));
 const affordable=candidate.filter(w=>w.sites.reduce((sum,[c,r])=>sum+r,0)<=3);
 assert(affordable.length===1&&affordable[0].type==="H"&&affordable[0].sites.every(([c,r])=>r===0),"only row1 H4 fits three prior P1 support stones");
 checkedPotentialLines+=candidate.length;
 attackScripts.push(...perms(columns));
}
assert(attackScripts.length===96&&attackScripts.filter(s=>s[0]===4).length===24,"96 4-cell scripts and 24 center-first");
const a=[4,3,5,2];
const edges=[];
for(let j=0;j<3;j++)for(let k=j+1;k<4;k++)edges.push({replySlot:j+1,targetSlot:k+1,from:a[j],to:a[k],phase:(1<<j)^(1<<k)});
assert(edges.length===6,"six forward interception labels");
let rank=0;const pivots={};
for(const edge of edges){
 let v=edge.phase;
 while(v){const b=31-Math.clz32(v);
  if(pivots[b])v^=pivots[b];
  else{pivots[b]=v;rank++;break;}
 }
}
assert(rank===3,"directed K4 GF2 edge boundary rank3");
const safe=[4,5,6],safeWays=safe.reduce((x,y)=>x*y,1);
const earliestProductive=[3*7*7,4*2*7,4*5];
assert(safeWays===120&&earliestProductive.reduce((x,y)=>x+y,0)===223&&120+223===7**3,"exact three-reply combinatorial partition");
function predict(reply){
 const intercepts=[];
 for(let j=0;j<3;j++)for(let k=j+1;k<4;k++)if(reply[j]===a[k])intercepts.push([j+1,k+1]);
 return intercepts;
}
function empty(){return {h:Array(7).fill(0),o:Array.from({length:7},()=>Array(6).fill(-1))};}
function win(q,p){return windows.some(w=>w.sites.every(([c,r])=>q.o[c][r]===p));}
function ray(q,c,r,p){
 for(const [dx,dy]of [[1,0],[0,1],[1,1],[1,-1]]){
  let n=1;
  for(const dir of [-1,1])for(let k=1;k<4;k++){
   const x=c+dir*k*dx,y=r+dir*k*dy;
   if(x<0||x>=7||y<0||y>=6||q.o[x][y]!==p)break;n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function move(q,c,p){
 const col=c-1,r=q.h[col];assert(r<6,"legal gravity placement");
 q.h[col]++;q.o[col][r]=p;
 const w=win(q,p);assert(w===ray(q,col,r,p),"original69 K4 vs directional ray");
 return {column:c,row:r+1,player:p,firstwin:w};
}
const replies=[
 {id:"matched",b:[4,3,5]},
 {id:"nonproductive_cross",b:[7,3,5]},
 {id:"productive_first",b:[3,3,5]},
 {id:"productive_second",b:[4,5,5]},
 {id:"productive_third",b:[4,3,2]},
 {id:"useless_then_productive",b:[7,5,5]}
];
const controls=[];
for(const item of replies){
 const q=empty(),events=[];
 for(let i=0;i<4;i++){
  const s=move(q,a[i],0);events.push(s);
  assert(s.firstwin===(i===3&&predict(item.b).length===0),"script ply7 firstwinner iff no productive intercept");
  if(i<3){const t=move(q,item.b[i],1);events.push(t);assert(!t.firstwin,"P1 cannot K4 with <=3 stones");}
 }
 controls.push({id:item.id,P1ReplyWords:item.b.join(""),firstwin:events[6].firstwin,interceptions:predict(item.b),P0LandingRows:events.filter(x=>x.player===0).map(x=>x.row)});
}
assert(controls.filter(x=>x.firstwin).length===2,"two sample P0 firstwin scenarios");
function four(word){
 const q=empty();for(let i=0;i<4;i++)assert(!move(q,Number(word[i]),i&1).firstwin,"valid four-ply source");
 return q;
}
const qa=four("4335"),qb=four("4533");
assert(qa.h.join(",")===qb.h.join(","),"same physical support");
assert(qa.h.map(x=>x&1).join("")===qb.h.map(x=>x&1).join(""),"same GF2 height parity");
assert(qa.o[2][0]===1&&qb.o[2][0]===0&&qa.o[2][1]===0&&qb.o[2][1]===1,"opposite owner-depth placement at c3");
move(qa,2,0);move(qb,2,0);
const immediate=q=>Array.from({length:7},(_,i)=>i).filter(c=>q.h[c]<6&&windows.some(w=>w.sites.some(([x,r])=>x===c&&r===q.h[c])&&w.sites.every(([x,r])=>(x===c&&r===q.h[c])||q.o[x][r]===0))).map(c=>c+1);
const fa=immediate(qa),fb=immediate(qb);
assert(!fa.includes(1)&&fb.includes(1),"after same P0 c2, only B has true P0 c1 firstwinner");
function residual(q,p){
 const masks=[];
 for(const w of windows){
  if(w.sites.some(([c,r])=>q.o[c][r]===1-p))continue;
  let m=0n;for(const [c,r]of w.sites)if(q.o[c][r]===-1)m|=1n<<BigInt(r*7+c);
  if(m)masks.push(m);
 }
 const u=[...new Map(masks.map(x=>[x.toString(),x])).values()];
 return u.filter(x=>!u.some(y=>x!==y&&(x&y)===y)).map(String).sort();
}
assert(residual(qa,0).join("|")!==residual(qb,0).join("|"),"same phase loses owner-labeled source WSL");
const report={
 schema:"c4.original7x6_center_wing_time_interception.v1",
 status:"EXACT_SIX_WING_BLOCKERS_AND_96_ORDERED_FIRSTWIN_INTERCEPTION_FIELDS_WITH_PHASE_NONCONGRUENCE",
 geometry:{board:"original7x6-k4",K4:hist},
 centerBlocker:{sourceP0BottomCenterColumn:4,originalBottomH4Windows:4,staticSixWingMasks:64,staticHittingMasks:admissible.length,minimalCrossWingPairs:minimal,bipartiteVertices:6,bipartiteEdges:6,singleCycleRank:1,primitiveOrientedSquare:"v25+v36-v26-v35=0"},
 temporalInterception:{originalBottomH4Windows:4,attackScriptsWithDistinct4Columns:attackScripts.length,centerFirstAttackScripts:attackScripts.filter(s=>s[0]===4).length,sourceK4CompletionCandidatesChecked:checkedPotentialLines,
 edgeLabels:edges,GF2PhaseEdgeRank:rank,GF2Nullity:edges.length-rank,
 exactP0Ply7FirstWin:"PRODUCT_{j<k}(1-[P1 reply slot j == future P0 column k])",
 noForwardInterceptReplyWordCountByProduct:safeWays,
 firstProductiveInterceptReplyWordCounts:earliestProductive,interceptedReplyWordCountBySum:223,
 totalThreeReplyWordsByCardinality:343,completeThreeReplyGameHistoriesEnumerated:0,
 sourcePhysicalWitnesses:controls},
 phaseNoncongruence:{fourPlySourceA:"4335",fourPlySourceB:"4533",samePhysicalHeightBeforeP0Move:true,sameGF2ParityBeforeP0Move:true,differentOwnerDepthAtC3:true,
 sameP0FollowupColumn:2,P0ImmediateWinningColumnsAfter5A:fa,P0ImmediateWinningColumnsAfter5B:fb,differentOriginalNormalizedWSL:true},
 epistemic:{fullyEnumeratedOriginalGameplayPositions:false,sourceHistoryControls:8,exactWDLFromEmpty:false,noSolvedGameKnowledgeInputs:true,noBelowFiveBoardTests:true,qualifiedIsoGraphAuthorityChanged:false}
};
console.log(JSON.stringify(report,null,2));
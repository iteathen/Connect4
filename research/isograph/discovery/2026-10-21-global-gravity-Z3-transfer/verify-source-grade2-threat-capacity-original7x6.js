"use strict";
/* Independent low-grade SOURCE WSL theorem:
 * after D claims e and A claims f, each surviving A singleton comes
 * from a pre-existing A source singleton or a source 2-cell requirement
 * containing f. Hence #singletons <= n1+n2(f), and at most that many
 * physically playable immediate A firstwinning actions.
 *
 * Checks abstract 168 four-site antichains + one genuine center-first
 * ORIGINAL7x6 rank7 board, 49 two-label SOURCE controls, no child WLD.
 */
const assert=(v,s)=>{if(!v)throw Error("GRADE2_FORK_BOUND: "+s);};
const sub=(a,b)=>(a&b)===a;
const minSmall=A=>[...new Set(A)].filter(x=>!A.some(y=>y!==x&&sub(y,x)));
const antichains=[];
for(let bin=0;bin<65536;bin++){
 const A=[];for(let i=0;i<16;i++)if(bin&(1<<i))A.push(i);
 if(A.every((x,j)=>A.every((y,k)=>j===k||(!sub(x,y)&&!sub(y,x)))))antichains.push(A);
}
assert(antichains.length===168,"Dedekind 4-variable abstract family");
let tested=0,excluded=0,maxSlack=0;
for(const A of antichains)for(let d=0;d<4;d++)for(let a=0;a<4;a++){
 if(d===a)continue;
 const eb=1<<d,fb=1<<a;
 if(A.includes(0)||A.includes(fb)){excluded++;continue;}
 const B=minSmall(A.filter(m=>(m&eb)===0).map(m=>m&~fb));
 const futureSingleton=B.filter(m=>m!==0&&(m&(m-1))===0).length;
 const sourceSingletons=A.filter(m=>m!==0&&(m&(m-1))===0).length;
 const containingPair=A.filter(m=>((m&fb)!==0)&&m!==0&&((m&(m-1))!==0)&&(((m&~(m-1))&(m-1))===0)).length;
 // robust independent popcount instead of relying on pair bit tricks
 const pop=m=>{let n=0;while(m){m&=m-1;n++;}return n;};
 const pairs=A.filter(m=>pop(m)===2&&(m&fb)).length;
 assert(futureSingleton<=sourceSingletons+pairs,
   "future singleton count cannot exceed source degree1+degree2 containing A site");
 assert(!B.includes(0),"nonterminal source after A placement");
 maxSlack=Math.max(maxSlack,sourceSingletons+pairs-futureSingleton);
 tested++;
}
assert(tested+excluded===168*12,"all abstract D,A ordered role pairs");

const W=7,H=6,steps=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const windows=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy,t]of steps){
 const l=[];for(let k=0;k<4;k++){const x=c+k*dx,y=r+k*dy;
  if(x<0||x>=W||y<0||y>=H){l.length=0;break;}l.push(y*W+x);}
 if(l.length===4)windows.push({type:t,ids:l});
}
assert(windows.length===69,"real original 69 windows");
const dirs=Object.fromEntries(["H","V","R","F"].map(t=>[t,windows.filter(x=>x.type===t).length]));
assert(JSON.stringify(dirs)===JSON.stringify({H:24,V:21,R:12,F:12}),"original directions");
const cell=(c,r)=>r*W+c;
const blank=()=>({h:Array(W).fill(0),sites:Array(W*H).fill(-1)});
const copy=q=>({h:q.h.slice(),sites:q.sites.slice()});
function drop(q,c1,p){
 const c=c1-1,r=q.h[c];
 assert(r<H,"physical legal gravity");
 const id=cell(c,r);q.sites[id]=p;q.h[c]++;
 const win=windows.some(L=>L.ids.every(v=>q.sites[v]===p));
 return {id,row:r+1,col:c1,win};
}
function minFamily(q,p){
 const U=[];
 for(const L of windows){
  if(L.ids.some(v=>q.sites[v]===1-p))continue;
  const ids=L.ids.filter(v=>q.sites[v]===-1);
  if(ids.length)U.push(ids);
 }
 const key=l=>l.join(",");
 const u=[...new Map(U.map(l=>[key(l),l])).values()];
 return u.filter(l=>!u.some(m=>m.length<l.length&&m.every(t=>l.includes(t))));
}
const countHist=masks=>{
 const h={};for(const m of masks)h[m.length]=(h[m.length]||0)+1;return h;
};
const initial=blank(),word="4214254";
for(let i=0;i<word.length;i++)assert(!drop(initial,+word[i],i&1).win,"legitimate source prefix no firstwinner");
assert(initial.h.join(",")==="1,2,0,3,1,0,0","q7 support");
const source=minFamily(initial,0),hist=countHist(source);
assert(source.length===48&&JSON.stringify(hist)===JSON.stringify({"2":1,"3":14,"4":33}),"one source grade2 and no source singles");
const uniquePair=source.filter(m=>m.length===2);
assert(uniquePair.length===1&&uniquePair[0].join(",")===cell(2,2)+","+cell(3,3),
 "unique original grade2 source is physical c3r3 and c4r4");

let currentPairSourceControls=0,maxSourceSingletonsAfter=0,maxActualPlayables=0,anyFork=0;
const byReply=[];
for(let b=1;b<=7;b++){
 const q8=copy(initial);
 assert(!drop(q8,b,1).win,"actual rank8 P1 no firstwin");
 const row=[];
 for(let a=1;a<=7;a++){
  const q9=copy(q8),A=drop(q9,a,0);
  assert(!A.win,"no rank9 P0 immediate win from source");
  const S=minFamily(q9,0),one=S.filter(m=>m.length===1);
  const pairs=source.filter(m=>m.length===2&&m.includes(A.id));
  const n1=source.filter(m=>m.length===1).length;
  assert(one.length<=n1+pairs.length,"true original source grade bound");
  const playable=one.filter(m=>{
   const id=m[0],col=id%W,row=Math.floor(id/W);
   return q9.h[col]===row;
  });
  maxSourceSingletonsAfter=Math.max(maxSourceSingletonsAfter,one.length);
  maxActualPlayables=Math.max(maxActualPlayables,playable.length);
  if(playable.length>=2)anyFork++;
  row.push({P0Move:a,newSingletons:one.length,immediateP0WinColumns:playable.map(m=>m[0]%7+1)});
  currentPairSourceControls++;
 }
 byReply.push({P1Move:b,sevenNamedP0SourceActions:row});
}
assert(currentPairSourceControls===49&&maxSourceSingletonsAfter===1&&maxActualPlayables===0&&anyFork===0,
 "one source pair caps new P0 singleton count, no immediately playable fork");
const report={
 schema:"c4.original7x6_grade2_source_two_action_threat_capacity.v1",
 status:"EXACT_GRADE2_SINGLE_ACTION_CAUSAL_FORK_UPPER_BOUND_AND_RANK7_NO_FORK",
 originalGeometry:dirs,
 universalRule:"For any LIVE source normalized WSL antichain A_A, one legal opponent D action followed by nonterminal A action at actual physical f yields at most source n1 (#min singleton masks) plus n2(f) (#source two-cell min masks containing f) new A singleton residual requirements. Thus the number of new ACTUALLY PLAYABLE A winning landing cells is bounded by the same source expression.",
 abstractChecks:{fourSiteAntichains:antichains.length,liveOrderedDThenARoles:tested,excludedTerminalRoles:excluded,maximumExcessSourceCapacity:maxSlack},
 genuineOriginalSource:{word,rank:7,sourceP0MinWSL:48,minimalBySize:hist,
  singleSourcePair:[[3,3],[4,4]],sourceSingletons:0,
  checkedLiteralSingleDThenAActionPairs:currentPairSourceControls,
  maximumPostPairAResidualSingletons:maxSourceSingletonsAfter,
  maximumPostPairAPlayableImmediateWinCells:maxActualPlayables,
  actualCertifiedCPCDoubleThreatForks:anyFork,
  sourceOnlyReplyActionControls:byReply,
  rootWLDStillUNKNOWN:true},
 gameTreePositionEnumeration:false,gameFutureValueQueries:0,
 solvedOutcomeValuesPremises:false,maintainedCI:"NOT_RUN"
};
console.log(JSON.stringify(report,null,2));
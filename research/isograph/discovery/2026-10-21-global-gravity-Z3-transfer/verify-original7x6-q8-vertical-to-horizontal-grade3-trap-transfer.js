"use strict";
/** Original7x6 source 42142544: respondent P1 same-column upper-mates
 * BLOCK the two reachable source-grade3 V firstwinning ribbons, yet
 * one physically legal P0 line transfer creates a grade3 H row3
 * terminal trap c1r3. Test selected five-event witness, original69
 * firstwinner rays, qualified normalized WSL and Oct20 source Q matroid.
 *
 * Does NOT claim forcing against arbitrary P1 or classify source WLD.
 */
const fail=(s)=>{throw Error("C4Q8_INTERFERENCE "+s)};
const ok=(b,s)=>{if(!b)fail(s)};
const W=7,H=6,dirs=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]],K=[];
for(const [type,dx,dy]of dirs)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 const cells=Array.from({length:4},(_,i)=>[c+dx*i,r+dy*i]);
 if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))K.push({type,cells});
}
ok(K.length===69,"69 real original winning lines");
const hist=Object.fromEntries(dirs.map(x=>[x[0],K.filter(k=>k.type===x[0]).length]));
ok(JSON.stringify(hist)===JSON.stringify({H:24,V:21,R:12,F:12}),"69 line direction counts");
const empty=()=>({h:Array(W).fill(0),q:Array.from({length:W},()=>Array(H).fill(-1))});
const bit=(c,r)=>1n<<BigInt(r*W+c);
const pop=m=>{let n=0;while(m){m&=m-1n;n++;}return n;};
const physical=m=>{let a=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(m&bit(c,r))a.push([c+1,r+1]);return a;};
function ray(q,c,r,p){
 for(const [_,dx,dy]of dirs){
  let n=1;
  for(const sign of [-1,1])for(let j=1;j<4;j++){
   let x=c+j*dx*sign,y=r+j*dy*sign;
   if(x<0||x>=W||y<0||y>=H||q.q[x][y]!==p)break;
   n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function step(q,c1,p){
 const c=c1-1,r=q.h[c];ok(r<H,"legal gravity site");
 q.q[c][r]=p;q.h[c]++;
 const win=K.some(L=>L.cells.every(([x,y])=>q.q[x][y]===p));
 ok(win===ray(q,c,r,p),"independent physical ray vs literal K4");
 return {column:c1,row:r+1,player:p,firstwin:win};
}
function WSL(q,p) {
 const raw=[];
 for(const L of K) {
  if(L.cells.some(([x,y])=>q.q[x][y]===1-p))continue;
  let mask=0n;
  for(const [c,r]of L.cells)if(q.q[c][r]===-1)mask|=bit(c,r);
  if(mask)raw.push({mask,L});
 }
 const distinct=new Map();
 for(const a of raw) {
  const key=String(a.mask);
  if(!distinct.has(key))distinct.set(key,{mask:a.mask,provenances:[]});
  distinct.get(key).provenances.push(a.L);
 }
 const U=[...distinct.values()],min=U.filter(g=>!U.some(x=>x.mask!==g.mask&&(g.mask&x.mask)===x.mask));
 return{raw,unique:U,min};
}
const q=empty(),prefix="42142544",trace=[];
for(let i=0;i<prefix.length;i++){
 const evt=step(q,Number(prefix[i]),i&1);
 ok(!evt.firstwin,"all source q8 history prefixes LIVE");
 trace.push(evt);
}
ok(q.h.join(",")==="1,2,0,4,1,0,0","source h authentic original");
const sourceWSL=WSL(q,0),grade=sourceWSL.min.reduce((o,g)=>(o[pop(g.mask)]=(o[pop(g.mask)]||0)+1,o),{});
ok(JSON.stringify(grade)===JSON.stringify({"3":13,"4":26}),"source A13 grades3/4");
const target=[ [0,2],[1,2],[2,2],[3,2] ];
const origin=K.find(L=>L.type==="H"&&L.cells.every((p,i)=>p[0]===target[i][0]&&p[1]===target[i][1]));
ok(Boolean(origin),"true physical H row3 c1..4 exists");
const missing=bit(0,2)|bit(1,2)|bit(2,2),F=bit(1,2)|bit(2,2),y=bit(0,2);
ok(sourceWSL.min.some(G=>G.mask===missing),"initial G3 row3 H source is minimal");
const sourcePhi=(mask)=>Number(sourceWSL.min.some(g=>(g.mask&mask)===g.mask));
ok(sourcePhi(F)===0&&sourcePhi(F|y)===1,"source triple Shannon cofactor leaves singleton");
const after=[2,2,3,3,3],future=[];
for(let k=0;k<after.length;k++){
 const e=step(q,after[k],k&1);
 ok(!e.firstwin,"source five-event witness remains live");
 future.push(e);
}
ok(q.h.join(",")==="1,4,3,4,1,0,0","expected source after h");
ok(q.q[1][2]===0&&q.q[2][2]===0&&q.q[3][2]===0,"real P0 owns H r3 c2,c3,c4");
ok(q.q[1][3]===1&&q.q[2][1]===1,"P1 blocked c2 vertical and supplied c3 support");
const A=WSL(q,0),D=WSL(q,1);
const traps=[];
for(let c=0;c<W;c++)if(q.h[c]+1<H&&A.min.some(z=>z.mask===bit(c,q.h[c]+1)))traps.push(c+1);
ok(traps.includes(1),"P0 H source becomes ready c1r3 trap above c1r2");
ok(A.min.some(z=>z.mask===y),"true postsource min singleton c1r3");
const C=traps.map(c=>c-1),odd=Array.from({length:W},(_,i)=>i).filter(c=>!C.includes(c)&&(H-q.h[c])%2===1);
const pairing=(xs)=>{
 if(xs.length===0)return[[]];
 const [a,...rest]=xs,out=[];
 for(let j=0;j<rest.length;j++)for(const z of pairing(rest.filter((_,k)=>k!==j)))out.push([[a,rest[j]],...z]);
 return out;
};
function isShadow(L){
 if(L.type==="V"||L.cells.some(([c,r])=>r<1))return false;
 const down=L.cells.map(([c,r])=>[c,r-1]);
 if(!K.some(R=>R.type===L.type&&R.cells.every((p,i)=>p[0]===down[i][0]&&p[1]===down[i][1])))return false;
 for(const [c,r]of L.cells){
  if(q.q[c][r]===0)return false;
  if(q.q[c][r-1]===0)continue;
  if(q.q[c][r-1]!==-1||q.q[c][r]!==-1||C.includes(c))return false;
  const start=q.h[c]+((H-q.h[c])&1);
  const prev=r-2;
  if(prev<start||((prev-start)&1)!==0)return false;
 }
 return true;
}
let best=null;
if(C.length&&odd.length%2===0)for(const P of pairing(odd)){
 const E=[],Q=P.map(pair=>pair.map(c=>bit(c,q.h[c]))),X=C.map(c=>bit(c,q.h[c]));
 for(let c=0;c<W;c++)if(!C.includes(c))for(let r=q.h[c]+((H-q.h[c])&1);r<H;r+=2)E.push(bit(c,r));
 const rank=G=>{
  let n=E.filter(x=>(G&x)!==0n).length;
  for(const pair of Q)if(pair.some(x=>(G&x)!==0n))n++;
  if(X.some(x=>(G&x)!==0n))n++;
  return n;
 };
 const items=D.min.map(g=>({g,gap:pop(g.mask)-rank(g.mask),shadow:g.provenances.some(isShadow)}));
 const uncovered=items.filter(z=>z.gap===0&&!z.shadow);
 const trial={Q:P.map(v=>v.map(c=>c+1)),P1minimal:D.min.length,dependent:items.filter(x=>x.gap>0).length,
   shadowedIndependent:items.filter(x=>x.gap===0&&x.shadow).length,
   remainingIndependentUnshadowed:uncovered.length,
   residuals:uncovered.map(z=>({missing:physical(z.g.mask),
    sourceLines:z.g.provenances.map(l=>({type:l.type,physical:l.cells.map(([c,r])=>[c+1,r+1])}))})).slice(0,12),
   rawGamma:Math.min(...items.map(x=>x.gap)),
   augmentedGamma:Math.min(...items.map(x=>x.gap+Number(x.shadow)))};
 if(!best||trial.remainingIndependentUnshadowed<best.remainingIndependentUnshadowed)best=trial;
}
const result={
 schema:"c4.original7x6_q8_grade3_vertical_to_horizontal_trap.v1",
 status:"EXACT_SOURCE_Q8_SAME_COLUMN_VERTICAL_DEFENSE_CREATES_H3_READY_TRAP_BUT_NO_COMPLETE_POLICY_CERTIFICATE",
 sourceHistory:prefix,initialSupport:[1,2,0,4,1,0,0],originalK4:hist,
 sourceP0MinimumMasks:sourceWSL.min.length,sourceP0GradeHistogram:grade,
 chosenSourceG3:{
  originalH4:origin.cells.map(([c,r])=>[c+1,r+1]),
  initialMissing:physical(missing),
  P0FulfilledTwo:physical(F),futureReadyTarget:physical(y),
  sourceBooleanUnderF:sourcePhi(F),
  sourceBooleanUnderFplusTarget:sourcePhi(F|y)
 },
 physicalLocalFiveEventTranscript:future.map(({column,row,player})=>({column,row,player})),
 finalHistory:prefix+after.join(""),finalRank:prefix.length+after.length,
 finalSupport:q.h,finalP0CurrentReadyTrapColumns:traps,
 finalP0SourceWSL:A.min.length,finalP1SourceWSL:D.min.length,
 finalOddNontrapBases:odd.map(c=>c+1),
 oldOnlineP0ResponderSourceFrame:best||"INELIGIBLE_NO_MATCHING",
 interpretation:"A legal samecolumn P1 reply c2r4 prevents P0 V c2r2..r5 but another samecolumn P1 reply c3r2 supplies gravity needed for P0 c3r3. This activates source H row3 c1..4 as actual P0 ready trap c1r3. Thus naive claim SAMECOLUMN response to each vertical prevents all P0 traps by rank13 is false on genuine board. Single source trap alone does not establish P0 WLD; investigate unshadowed P1 original K4s and alternative policies.",
 noKnownSolvedValues:true,fullGameStateEnumeration:false,childStrategicWLDCalls:0,
 maintainedCI:"NOT_RUN",externalFormalProver:"NOT_RUN"
};
console.log(JSON.stringify(result,null,2));
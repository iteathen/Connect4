"use strict";
/**
 * Two genuinely CENTER-FIRST original7x6 legal 9-ply sources differing only
 * by P0/P1 depth ownership. Existing Oct20 online odd-Q/trap/even-tail
 * respondent policy plus NEW strict row4-firstwins-before-row5 shadow:
 *
 * 421425434: source P0-WIN (old static Gamma0 but shadow Γ^tri=1).
 * 421424534: NOT certified; under old response policy P1 can WIN row3.
 *
 * All source K4s/rays and future immediate mate legality are physical,
 * without minimax, a WLD oracle or enumerating opponent game futures.
 */
const assert=(yes,why)=>{if(!yes)throw Error("C4_C4OPEN_R9_SHADOW "+why);};
const W=7,H=6,DIR=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]],K4=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr,t]of DIR){
 const a=[];for(let j=0;j<4;j++){
  const x=c+dc*j,y=r+dr*j;
  if(x<0||x>=W||y<0||y>=H){a.length=0;break;}
  a.push([x,y]);
 }
 if(a.length===4)K4.push({t,a});
}
assert(K4.length===69,"true original69");
const inventory=Object.fromEntries(["H","V","R","F"].map(t=>[t,K4.filter(L=>L.t===t).length]));
assert(JSON.stringify(inventory)===JSON.stringify({H:24,V:21,R:12,F:12}),"original H/V/R/F");
const b=(c,r)=>1n<<BigInt(r*W+c),bits=x=>{let n=0;while(x){x&=x-1n;n++;}return n;};
const cells=x=>{const o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(x&b(c,r))o.push([c+1,r+1]);return o;};
const fresh=()=>({h:Array(W).fill(0),q:Array.from({length:W},()=>Array(H).fill(-1))});
const cp=s=>({h:s.h.slice(),q:s.q.map(v=>v.slice())});
const lineWins=(s,p)=>K4.filter(L=>L.a.every(([c,r])=>s.q[c][r]===p));
function ray(s,c,r,p){
 for(const[dc,dr]of DIR){let n=1;for(const side of [-1,1])for(let i=1;i<4;i++){
  let x=c+side*dc*i,y=r+side*dr*i;
  if(x<0||x>=W||y<0||y>=H||s.q[x][y]!==p)break;n++;
 }if(n>=4)return true;}
 return false;
}
function place(s,col,p){
 const c=col-1,r=s.h[c];assert(r<H,"gravity available");
 s.h[c]++;s.q[c][r]=p;
 const lines=lineWins(s,p);assert(Boolean(lines.length)===ray(s,c,r,p),"original69/directional-ray agree");
 return{column:col,row:r+1,p,firstwin:Boolean(lines.length),lines:lines.map(L=>({type:L.t,cells:L.a.map(([x,y])=>[x+1,y+1])}))};
}
function original(word){
 const s=fresh();
 for(let i=0;i<word.length;i++)
  assert(!place(s,Number(word[i]),i%2).firstwin,"genuine source firstwinnerfree prefix at ply"+(i+1));
 assert(s.h.join(",")==="1,2,1,4,1,0,0","identical source support");
 return s;
}
function minFamily(xs){
 const u=[...new Map(xs.map(x=>[String(x.m),x])).values()];
 return u.filter(x=>!u.some(y=>y.m!==x.m&&(x.m&y.m)===y.m)).sort((x,y)=>x.m<y.m?-1:x.m>y.m?1:0);
}
function req(s,p){
 const raw=[];
 for(const L of K4){
  if(L.a.some(([c,r])=>s.q[c][r]===1-p))continue;
  let mask=0n;for(const [c,r]of L.a)if(s.q[c][r]===-1)mask|=b(c,r);
  if(mask)raw.push({m:mask,L});
 }
 return {raw,min:minFamily(raw)};
}
function proofFrame(s){
 const A=req(s,0),D=req(s,1),C=[];
 for(let c=0;c<W;c++)if(6-s.h[c]>=2&&A.min.some(x=>x.m===b(c,s.h[c]+1)))C.push(c);
 assert(C.join(",")==="2","P0 trap c3r3");
 const B=Array.from({length:W},(_,i)=>i).filter(c=>!C.includes(c)&&((6-s.h[c])&1));
 assert(B.join(",")==="0,4","Q odd bases c1/c5");
 const E=[];
 for(let c=0;c<W;c++)if(!C.includes(c))
  for(let r=s.h[c]+((6-s.h[c])&1);r<6;r+=2)E.push(b(c,r));
 const X=C.map(c=>b(c,s.h[c]));
 const rank=m=>E.filter(e=>Boolean(e&m)).length+
  Number(B.some(c=>Boolean(m&b(c,s.h[c]))))+
  Number(X.some(e=>Boolean(m&e)));
 return{A,D,C,B,E,rank,sourceHeight:s.h.slice()};
}
function strictShadow(s,fr,orig){
 const L=orig.L;
 if(L.t!=="H"||L.a.map(([c,r])=>[c+1,r+1].join(",")).join("|")!=="4,5|5,5|6,5|7,5")
  return false;
 for(const [c,r]of L.a){
  const under=r-1;
  if(s.q[c][under]===0)continue;
  if(s.q[c][under]!==-1||s.q[c][r]!==-1||fr.C.includes(c))return false;
  // Upper-mate tail is (D row3, A row4); if D reaches row5,
  // A necessarily got row4 already (and game stops on P0 K4).
  const start=fr.sourceHeight[c]+((6-fr.sourceHeight[c])&1);
  if(under-1<start||((under-1-start)&1))return false;
 }
 return true;
}
function inspect(word){
 const s=original(word),fr=proofFrame(s);
 const rows=fr.D.min.map(v=>{
  const gap=bits(v.m)-fr.rank(v.m);
  return{item:v,gap,shadow:strictShadow(s,fr,v)};
 });
 const hist={};for(const v of rows)hist[v.gap]=(hist[v.gap]||0)+1;
 const gamma=Math.min(...rows.map(x=>x.gap));
 const aug=Math.min(...rows.map(x=>x.gap+Number(x.shadow)));
 return {word,s,fr,gamma,aug,rows,
  source:{word,firstColumnP0:4,sourceRank:9,support:s.h,
   P0ownsRow3Center:s.q[3][2]===0,P1ownsRow3Center:s.q[3][2]===1,
   P0trapColumn:fr.C.map(x=>x+1),oddQ:fr.B.map(x=>x+1),
   originalP1ResidualWindows:fr.D.raw.length,minimalP1Residuals:fr.D.min.length,
   rankNullityHistogram:hist,rawMatroidGamma:gamma,strictFirstwinShadowGamma:aug,
   matroidIndependentRequirements:rows.filter(x=>x.gap===0).map(x=>({
    missing:cells(x.item.m),
    originalK4:x.item.L.a.map(([c,r])=>[c+1,r+1]),
    shadowByP0Row4:x.shadow
   }))}};
}
const negative=inspect("421424534"),positive=inspect("421425434");
assert(negative.gamma===0&&negative.aug===0&&negative.rows.filter(x=>x.gap===0).length===2,
 "center-first negative source row3 and row5 leaks");
assert(positive.gamma===0&&positive.aug===1&&positive.rows.filter(x=>x.gap===0).length===1,
 "center-first positive source P1 row5 shadow exactly closes gap");
assert(negative.s.q[3][2]===1&&positive.s.q[3][2]===0,"true center row3 owner difference");
function policy(s,fr,col,state){
 const c=col-1,D=place(s,col,1);
 if(D.firstwin)return{D,A:null,outcome:"P1_FIRSTWIN"};
 let target=c;
 if(!fr.C.includes(c)&&fr.B.includes(c)&&!state.paired){
  target=fr.B.find(x=>x!==c);state.paired=true;
 }
 const A=place(s,target+1,0);
 return{D,A,outcome:A.firstwin?"P0_FIRSTWIN":null};
}
function namedTrajectory(k,ds) {
 const s=cp(k.s),st={paired:false},events=[];let ply=9;
 for(const col of ds){
  const pair=policy(s,k.fr,col,st);ply++;if(pair.A)ply++;
  events.push(pair);
  if(pair.outcome)return {firstWin:pair.outcome,terminalPly:ply,
    winningLines:(pair.D.firstwin?pair.D:pair.A).lines,events};
 }
 return {firstWin:null,terminalPly:ply,events};
}
const negativeAttacker=namedTrajectory(negative,[5,5,6,6,7,7]);
assert(negativeAttacker.firstWin==="P1_FIRSTWIN"&&negativeAttacker.terminalPly===20,
 "unshadowed center-first P1 row3 c4..7 actually FIRSTWINS against OLD policy");
assert(negativeAttacker.winningLines.some(x=>x.type==="H"&&x.cells.map(y=>y.join(",")).join("|")==="4,3|5,3|6,3|7,3"),
 "source negative D c4..7 row3 H4 firstwin");
const positiveAttacker=namedTrajectory(positive,[4,5,5,5,6,6,6,7,7,7]);
assert(positiveAttacker.firstWin==="P0_FIRSTWIN"&&positiveAttacker.terminalPly===27,
 "source positive P0 row4 shadow FIRSTWINS before D row5 H4");
assert(positiveAttacker.winningLines.some(x=>x.type==="H"&&x.cells.map(y=>y.join(",")).join("|")==="4,4|5,4|6,4|7,4"),
 "source positive respondent aligned row4 H4");
const firstLabels=[];
for(let c=0;c<W;c++) {
 assert(positive.s.h[c]<6,"all seven P1 literal columns legal at source");
 const q=cp(positive.s),st={paired:false},r=policy(q,positive.fr,c+1,st);
 assert(r.outcome!=="P1_FIRSTWIN","all first P1 choices cannot directly win from positive source");
 if(!r.outcome){
  const e=b(c,positive.fr.sourceHeight[c]),f=b(r.A.column-1,r.A.row-1);
  const expected=minFamily(positive.fr.D.min.filter(x=>(x.m&f)===0n).map(x=>({m:x.m&~e,L:x.L})));
  const actual=req(q,1).min;
  assert(actual.length===expected.length&&actual.every((v,i)=>v.m===expected[i].m),
   "source physical WSL equals action Shannon P1 e=1 P0 f=0");
  const remaining=actual.map(x=>{
   const minorRank=positive.fr.rank(x.m|e)-positive.fr.rank(e);
   const deficit=bits(x.m)-minorRank;
   // Source-proven original row5 K4 shadow persists under the policy.
   const shadow=x.L.t==="H"&&x.L.a.map(([cc,rr])=>cc+","+rr).join("|")==="3,4|4,4|5,4|6,4";
   return {deficit,shadow};
  });
  assert(Math.min(...remaining.map(x=>x.deficit+Number(x.shadow)))>=1,
   "all first source P1 actions preserve augmented strict firstwinner certificate");
 }
 firstLabels.push({P1col:c+1,
  sourceResponseP0col:r.A.column, P0firstwinsImmediately:r.A.firstwin,
  guardedSourceOutcome:"P0_WIN WLD-only",WLDOnlyP1MoveOptimal:true});
}
assert(firstLabels.length===7&&positive.s.q[3][0]===0,
 "genuinely center-first all seven literal P1 moves share WLD LOSS");
const report={
 schema:"c4.original7x6_center_first_rank9_shadow_WLD.v1",
 status:"EXACT_CENTER_FIRST_RANK9_P0_WIN_GUARDED_SOURCE_PLUS_ROLE_DEPTH_NEGATIVE_CONTROL",
 geometry:inventory,
 originalSources:[negative.source,positive.source],
 policyFirstwinControls:{
  P1UnshadowedRow3AttackerFromNegative:{
   P1script:[5,5,6,6,7,7],actualFirstWin:negativeAttacker.firstWin,
   ply:negativeAttacker.terminalPly,winningOriginalK4:negativeAttacker.winningLines},
  P1Row5AttemptFromPositive:{
   P1script:[4,5,5,5,6,6,6,7,7,7],actualFirstWin:positiveAttacker.firstWin,
   ply:positiveAttacker.terminalPly,winningOriginalK4:positiveAttacker.winningLines},
  positiveSourceEveryP1FirstAction: firstLabels
 },
 theorem:"From live P1-turn rank9 center-first 421425434, old legally guaranteed online P0 upper-mate/odd-Q/trap response policy forbids every P1 firstwinning K4: 30 minimal P1 requirements are matroid-dependent and the only independent residual H4 row5 c4..7 is strictly shadowed by P0 H4 row4 c4..7, which FIRSTWINS earlier. Nontrap exhaustion forces P1 to enter current P0 firstwin trap c3 if P0 did not already win. Thus P0 WIN and each of seven legal P1 first actions is WLD-only losing for P1 without child-value evaluations.",
 scope:"individual genuine 7x6 center-first legal-source WLD certificate; NOT an empty-root strategy or strong mate-depth optimality",
 fullGameStateEnumeration:false,childStrongValueCalls:0,
 noSolvedGameOutcomePremises:true,externalFormalProver:"NOT_RUN",maintainedCI:"NOT_RUN"
};
console.log(JSON.stringify(report,null,2));
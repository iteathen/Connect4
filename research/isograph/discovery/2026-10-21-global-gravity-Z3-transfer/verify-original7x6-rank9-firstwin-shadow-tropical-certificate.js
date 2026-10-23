"use strict";
/**
 * Independent exact original7x6 69-K4 FIRSTWIN-SHADOW repair to an old
 * online respondent matroid that by itself has Gamma=0.
 * Two genuine rank9 P1-to-move positions; one is P0-WIN certified
 * by row4 P0 H4 before matroid-allowed row5 P1 H4; the other remains
 * excluded and has a concrete bottom-row P1 winning countertrajectory.
 * Local legal named action checks, abstract column-policy time proof;
 * ZERO recursive WLD or full game-state enumeration; oracle-blind.
 */
const check=(x,m)=>{if(!x)throw Error("C4_SHADOW "+m);};
const W=7,H=6,Ds=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy,d]of Ds){
 const cells=[];for(let i=0;i<4;i++){
  const x=c+i*dx,y=r+i*dy;
  if(x<0||x>=W||y<0||y>=H){cells.length=0;break;}
  cells.push([x,y]);
 }if(cells.length===4)lines.push({d,cells});
}
check(lines.length===69,"physical K4 count");
const types=Object.fromEntries(["H","V","R","F"].map(d=>[d,lines.filter(x=>x.d===d).length]));
check(JSON.stringify(types)===JSON.stringify({H:24,V:21,R:12,F:12}),"direction count");
const bit=(c,r)=>1n<<BigInt(r*W+c),size=m=>{let n=0;while(m){m&=m-1n;n++;}return n;};
const cells=m=>{const o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(m&bit(c,r))o.push([c+1,r+1]);return o;};
const board=()=>({h:Array(W).fill(0),o:Array.from({length:W},()=>Array(H).fill(-1))});
const copy=q=>({h:q.h.slice(),o:q.o.map(x=>x.slice())});
function win(q,p){return lines.filter(L=>L.cells.every(([c,r])=>q.o[c][r]===p));}
function ray(q,c,r,p){
 for(const [dx,dy]of Ds){
  let n=1;for(const s of [-1,1])for(let i=1;i<4;i++){
   const x=c+i*s*dx,y=r+i*s*dy;
   if(x<0||x>=W||y<0||y>=H||q.o[x][y]!==p)break;n++;
  }if(n>=4)return true;
 }return false;
}
function drop(q,col,p){
 const c=col-1,r=q.h[c];check(r<H,"legal gravity");
 q.o[c][r]=p;q.h[c]++;
 const l=win(q,p);check((l.length>0)===ray(q,c,r,p),"independent win ray");
 return {column:col,row:r+1,p,firstwin:l.length>0,winning:l.map(v=>({dir:v.d,cells:v.cells.map(([x,y])=>[x+1,y+1])}))};
}
function normalize(arr){
 const dedup=[...new Map(arr.map(x=>[String(x.m),x])).values()];
 return dedup.filter(x=>!dedup.some(y=>x.m!==y.m&&(x.m&y.m)===y.m)).sort((a,b)=>a.m<b.m?-1:a.m>b.m?1:0);
}
function residual(q,p){
 const raw=[];
 for(const L of lines){
  if(L.cells.some(([c,r])=>q.o[c][r]===1-p))continue;
  let m=0n;
  for(const [c,r]of L.cells)if(q.o[c][r]===-1)m|=bit(c,r);
  if(m)raw.push({m,L});
 }
 return {raw,min:normalize(raw)};
}
function source(word){
 const q=board();
 for(let i=0;i<word.length;i++)
  check(!drop(q,Number(word[i]),i&1).firstwin,"rank9 genuine firstwinnerfree prefix "+(i+1));
 check(word.length===9&&q.h.join(",")==="1,2,1,4,1,0,0","exact source support");
 return q;
}
function frame(q){
 const P0=residual(q,0),P1=residual(q,1),C=[];
 for(let c=0;c<W;c++)
  if(H-q.h[c]>=2&&P0.min.some(x=>x.m===bit(c,q.h[c]+1)))C.push(c);
 check(C.join(",")==="2","source P0 upper trap c3r3");
 const B=Array.from({length:W},(_,i)=>i).filter(c=>!C.includes(c)&&((H-q.h[c])&1));
 check(B.join(",")==="0,4","odd c1/c5 source response pair");
 const E=[],X=C.map(c=>bit(c,q.h[c]));
 for(let c=0;c<W;c++)if(!C.includes(c))
  for(let r=q.h[c]+((H-q.h[c])&1);r<H;r+=2)E.push(bit(c,r));
 function rank(m){
  let n=E.filter(x=>Boolean(x&m)).length;
  if(B.some(c=>Boolean(m&bit(c,q.h[c]))))n++;
  if(X.some(x=>Boolean(m&x)))n++;
  return n;
 }
 return {P0,P1,C,B,E,X,rank,sourceH:q.h.slice()};
}
// Source policy guarantee: D may claim row5 at col c only after all
// owner-chronologically forced earlier row4 P0 are already in place.
function shadow(q,fr,record){
 const L=record.L,m=record.m;
 if(L.d!=="H"||!L.cells.every(([c,r])=>r===4)||L.cells.map(([c])=>c).join(",")!=="3,4,5,6")
  return {cert:false,why:"not the certified row5 c4..7 source H4"};
 if(L.cells.some(([c,r])=>q.o[c][r]!==-1))return {cert:false,why:"not full missing row5"};
 const proof=[];
 for(const [c,r]of L.cells){
  const below=r-1;
  if(q.o[c][below]===0){
   proof.push({col:c+1,row4AlreadyP0:true});continue;
  }
  if(q.o[c][below]!==-1||fr.C.includes(c))return {cert:false,why:"row4 wrong owner/trap"};
  const start=fr.sourceH[c]+((H-fr.sourceH[c])&1);
  // With existing old policy, paired tail D lower row3 then A
  // immediately upper-mates row4, before D can enter row5.
  const tailLower=below-1;
  if(tailLower<start||((tailLower-start)&1)!==0||r!==below+1)
   return {cert:false,why:"no guaranteed Drow3/Arow4 tail pair"};
  proof.push({col:c+1,row4AlreadyP0:false,mandatoryPrior:[
   {Drow:tailLower+1},{Arow:below+1},{laterPossibleDrow:r+1}
  ]});
 }
 const aligned=lines.some(z=>z.d==="H"&&z.cells.map(x=>x.join(",")).join("|")==="3,3|4,3|5,3|6,3");
 check(aligned,"P0 aligned actual H4 row4 exists");
 return {cert:true,sourceWSLTarget:cells(m),alignedRespondentH4:[[4,4],[5,4],[6,4],[7,4]],
  witness:proof,why:"strict P0 row4 H4 FIRSTWIN before P1 row5 H4 under legal response tails"};
}
function reportSource(word){
 const q=source(word),fr=frame(q),dist={};
 const annotated=fr.P1.min.map(rec=>{
  const gap=size(rec.m)-fr.rank(rec.m),sh=shadow(q,fr,rec);
  dist[gap]=(dist[gap]||0)+1;
  return{rec,gap,shadow:sh};
 });
 const zero=annotated.filter(x=>x.gap===0);
 const rawGamma=Math.min(...annotated.map(x=>x.gap));
 const boosted=Math.min(...annotated.map(x=>x.gap+Number(x.shadow.cert)));
 return{word,q,fr,rawGamma,boosted,zero,dist,
  result:{word,sourceHeights:q.h,originalP1ResidualWindows:fr.P1.raw.length,
    minimalP1WSL:fr.P1.min.length,sourceMatroidGamma:rawGamma,
    firstwinShadowAugmentedGamma:boosted,deficitHistogram:dist,
    unconstrainedSourceRequirements:zero.map(x=>({
      required:cells(x.rec.m),lineType:x.rec.L.d,
      fullLine:x.rec.L.cells.map(([c,r])=>[c+1,r+1]),
      shadowCertified:x.shadow.cert,reason:x.shadow.why,
      shadowProof:x.shadow.cert?x.shadow.witness:undefined
    }))
  }};
}
const a=reportSource("143224454"),b=reportSource("122454434");
check(a.rawGamma===0&&a.boosted===0&&a.zero.length===2,"source A has unshadowed lower H4");
check(b.rawGamma===0&&b.boosted===1&&b.zero.length===1&&b.zero[0].shadow.cert,
 "source B gains source P0 winning certificate despite raw Gamma0");
const policy=(q,frame,c1,st)=>{
 const c=c1-1,D=drop(q,c1,1);
 if(D.firstwin)return {D,A:null,terminal:"P1WIN"};
 let mate=c;
 if(!frame.C.includes(c)&&frame.B.includes(c)&&!st.matched){
  mate=frame.B.find(x=>x!==c);st.matched=true;
 }
 const A=drop(q,mate+1,0);
 return {D,A,terminal:A.firstwin?"P0WIN":null};
};
function trace(sourceObj,Ds){
 const q=copy(sourceObj.q),st={matched:false},events=[];
 let ply=9;
 for(const c of Ds){
  const action=policy(q,sourceObj.fr,c,st);ply++; // P1 D placement
  if(action.A)ply++; // P0 A response
  events.push(action);
  if(action.terminal)return{ply,outcome:action.terminal,events,
   terminalOriginalK4:(action.D.firstwin?action.D:action.A).winning};
 }
 return{ply,outcome:"script-only-not-certified",events};
}
const namedUpper=trace(b,[4,5,5,5,6,6,6,7,7,7]);
check(namedUpper.outcome==="P0WIN"&&namedUpper.ply===27,
 "P0 firstwins at actual ply27 before last P1 r5 entry");
check(namedUpper.terminalOriginalK4.some(w=>w.dir==="H"&&w.cells.map(x=>x.join(",")).join("|")==="4,4|5,4|6,4|7,4"),
 "terminal original row4 H4 is the source shadow");
const namedLower=trace(a,[6,7]);
check(namedLower.outcome==="P1WIN"&&namedLower.ply===12,
 "source A P1 FIRSTWINS bottom c4..7 against OLD policy");
check(namedLower.terminalOriginalK4.some(w=>w.dir==="H"&&w.cells.map(x=>x.join(",")).join("|")==="4,1|5,1|6,1|7,1"),
 "unshadowed P1 bottom H4 actually achievable earlier");
const local=[];
for(let c=0;c<W;c++)if(!b.fr.C.includes(c)&&b.q.h[c]<H){
 const q=copy(b.q),st={matched:false},step=policy(q,b.fr,c+1,st);
 check(step.terminal!=="P1WIN","no immediate P1 win from certified source");
 if(!step.terminal){
  const e=bit(c,b.fr.sourceH[c]),f=bit(step.A.column-1,step.A.row-1);
  const expected=normalize(b.fr.P1.min.filter(x=>(x.m&f)===0n).map(x=>({m:x.m&~e,L:x.L})));
  const actual=residual(q,1).min;
  check(actual.length===expected.length&&actual.every((x,i)=>x.m===expected[i].m),
   "physical 69 K4 successor and source WSL two-Shannon action match");
 }
 local.push({Dcol:c+1,Drow:step.D.row,Acol:step.A.column,Arow:step.A.row,
   AwinImmediately:step.A.firstwin,exactSourceShannonMatch:!step.terminal});
}
check(local.length===6,"all six legal nontrap D/A first labelled controls");
const result={
 schema:"c4.original7x6_WSL_strict_firstwin_shadow_policy.v1",
 status:"EXACT_GUARDED_RANK9_P0_WIN_VIA_UPPER_ROW_SHADOW_DESPITE_STATIC_MATROID_GAMMA_ZERO",
 geometry:{W,H,K4:types},
 sources:[a.result,b.result],
 sourceBWinsForP0ByNonbranchingCertificate:true,
 oldPolicySourceAProvedUnsoundByConcreteP1Firstwin:true,
 uniformLogicalLaw:"Under the existing October20 legally executable A=P0 upper-mate/odd-base policy, D=P1 cannot finish aligned H4 row5 c4..7 without first allowing A to occupy aligned H4 row4 c4..7 and terminate EARLIER. All other P1 source WSL generators are matroid-dependent. Existing policy trap C and finite nontrap-pair progress make P0 FIRSTWIN inevitable from source B.",
 sourceLocalFirstResponseShannonControls:local,
 oneUpperRowGoalScript:{opponentColumns:[4,5,5,5,6,6,6,7,7,7],
  stoppedAtPly:namedUpper.ply,firstWinner:namedUpper.outcome,
  winningK4:namedUpper.terminalOriginalK4,
  actualDandAEvents:namedUpper.events},
 namedCounterPolicySourceA:{opponentColumns:[6,7],
  stoppedAtPly:namedLower.ply,firstWinner:namedLower.outcome,
  winningK4:namedLower.terminalOriginalK4},
 futureValueBranchEvaluations:0,rootWLDUnproved:true,originalGameSpaceNotEnumerated:true,
 knownSolvedLabelsNotUsed:true,maintainedCI:"NOT_RUN",independentFormalChecker:"NOT_RUN"
};
console.log(JSON.stringify(result,null,2));
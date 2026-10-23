"use strict";
/**
 * Rank7 q=4214254: source-only augmented P0 online responder certificate
 * audit on 41 genuine rank11 P0 ready-trap sources produced by explicit
 * two-round causal formation policy for every P1 b1!=4 and any b2.
 *
 * No child WLD recursion. Enumerates finite SOURCE matroid proof-frame
 * perfect matchings on odd-capacity nontrap base columns, tests all
 * normalized P1 WSL residual gaps and strict H/R/F firstwin shadows.
 * If no matching proves source WIN, prints a concrete unshadowed original
 * opponent winning obligation; INCOMPLETE != P1 WIN/DRAW.
 */
const assert=(v,m)=>{if(!v)throw Error("C4_Q11_SHADOW_FRAME "+m);};
const W=7,H=6,dirs=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]],lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [type,dx,dy]of dirs){
 const sites=[];
 for(let k=0;k<4;k++){
  const x=c+k*dx,y=r+k*dy;
  if(x<0||x>=W||y<0||y>=H){sites.length=0;break;}
  sites.push([x,y]);
 }
 if(sites.length===4)lines.push({type,sites});
}
assert(lines.length===69,"original69 physical K4 lines");
const originalDirs=Object.fromEntries(["H","V","R","F"].map(d=>[d,lines.filter(L=>L.type===d).length]));
assert(JSON.stringify(originalDirs)===JSON.stringify({H:24,V:21,R:12,F:12}),"H/V/R/F original");
const bit=(c,r)=>1n<<BigInt(r*W+c),nbits=m=>{let n=0;while(m){m&=m-1n;n++;}return n;};
const cells=m=>{const p=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(m&bit(c,r))p.push([c+1,r+1]);return p;};
const fresh=()=>({h:Array(W).fill(0),o:Array.from({length:W},()=>Array(H).fill(-1))});
const cp=q=>({h:q.h.slice(),o:q.o.map(a=>a.slice())});
function hasWin(q,p){return lines.some(L=>L.sites.every(([c,r])=>q.o[c][r]===p));}
function ray(q,c,r,p){
 for(const [type,dx,dy]of dirs){
  let n=1;for(const s of [-1,1])for(let t=1;t<4;t++){
   const x=c+s*dx*t,y=r+s*dy*t;
   if(x<0||x>=W||y<0||y>=H||q.o[x][y]!==p)break;n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function drop(q,col,p) {
 const c=col-1,r=q.h[c];assert(r<H,"real legal gravity landing");
 q.h[c]++;q.o[c][r]=p;
 const win=hasWin(q,p);assert(win===ray(q,c,r,p),"independent directional original69 firstwinner control");
 return {col,row:r+1,p,win};
}
function normalized(q,p){
 const sources=[];
 for(const L of lines) {
  if(L.sites.some(([c,r])=>q.o[c][r]===1-p))continue;
  let G=0n;for(const [c,r]of L.sites)if(q.o[c][r]===-1)G|=bit(c,r);
  if(G)sources.push({G,L});
 }
 const byMask=new Map();
 for(const z of sources){
  const str=String(z.G);
  if(!byMask.has(str))byMask.set(str,{G:z.G,proofLines:[]});
  byMask.get(str).proofLines.push(z.L);
 }
 const uniq=[...byMask.values()];
 const min=uniq.filter(x=>!uniq.some(y=>x.G!==y.G&&(x.G&y.G)===y.G));
 return {raw:sources,distinct:uniq,min};
}
const downshiftEligible=(L)=>L.type!=="V"&&L.sites.every(([c,r])=>r>=1);
function isShadow(q,C,sourceH,L){
 if(!downshiftEligible(L))return false;
 const down=L.sites.map(([c,r])=>[c,r-1]);
 if(!lines.some(X=>X.type===L.type&&X.sites.map(x=>x.join(",")).join("|")===down.map(x=>x.join(",")).join("|")))
  return false;
 for(const [c,r]of L.sites){
  if(q.o[c][r]===0)return false; // D original line already blocked
  if(q.o[c][r-1]===0)continue; // P0 already has below target
  if(q.o[c][r-1]!==-1||q.o[c][r]!==-1||C.includes(c))return false;
  const start=sourceH[c]+((H-sourceH[c])&1);
  const Dlower=r-2;
  if(Dlower<start||((Dlower-start)&1)!==0)return false;
  // original online source policy: D at Dlower,
  // responder P0 mates at Dlower+1=r-1,
  // all BEFORE D can claim next target r.
 }
 return true;
}
function matches(list){
 if(!list.length)return [[]];
 const [first,...rest]=list,out=[];
 for(let i=0;i<rest.length;i++)for(const m of matches(rest.filter((v,j)=>j!==i)))
  out.push([[first,rest[i]],...m]);
 return out;
}
function frame(q){
 const p0=normalized(q,0),p1=normalized(q,1),C=[];
 for(let c=0;c<W;c++)if(H-q.h[c]>=2&&p0.min.some(x=>x.G===bit(c,q.h[c]+1)))C.push(c);
 const nontrap=Array.from({length:W},(_,c)=>c).filter(c=>!C.includes(c));
 const oddB=nontrap.filter(c=>((H-q.h[c])&1)===1);
 const E=[];
 for(const c of nontrap)for(let r=q.h[c]+((H-q.h[c])&1);r<H;r+=2)E.push(bit(c,r));
 const trap=X=>C.some(c=>Boolean(X&bit(c,q.h[c])));
 if(!C.length||oddB.length%2)return {status:"INELIGIBLE_SOURCE_TRAP_OR_ODD_PAIR",C,oddB,p0Count:p0.min.length,p1Count:p1.min.length};
 const Qs=matches(oddB);
 assert(Qs.length>0,"even B always perfect matching");
 let best=null,any=0;
 for(const Q of Qs){
  const rank=G=>{
   let k=E.filter(x=>Boolean(G&x)).length;
   for(const pair of Q)if(pair.some(c=>Boolean(G&bit(c,q.h[c]))))k++;
   if(trap(G))k++;
   return k;
  };
  const residual=p1.min.map(x=>{
   const nullity=nbits(x.G)-rank(x.G);
   const shadow= x.proofLines.some(L=>isShadow(q,C,q.h,L));
   return {G:x.G,gap:nullity,shadow,proofLine:x.proofLines.find(L=>isShadow(q,C,q.h,L))||x.proofLines[0]};
  });
  const unshadowed=residual.filter(z=>z.gap===0&&!z.shadow);
  const score=unshadowed.length;
  const gamma=Math.min(...residual.map(x=>x.gap));
  const augmented=Math.min(...residual.map(x=>x.gap+Number(x.shadow)));
  if(score===0)any++;
  const trial={Q:Q.map(pair=>pair.map(c=>c+1)),score,
   matroidGamma:gamma,augmentedGamma:augmented,
   dependentCount:residual.filter(x=>x.gap>0).length,
   independentShadowed:residual.filter(x=>x.gap===0&&x.shadow).length,
   unshadowedCount:unshadowed.length,
   examples:unshadowed.slice(0,6).map(x=>({missing:cells(x.G),
    originalLine:x.proofLine.sites.map(([c,r])=>[c+1,r+1]),type:x.proofLine.type}))};
  if(!best||score<best.score||(score===best.score&&augmented>best.augmentedGamma))best=trial;
 }
 return{status:best.score===0?"GUARDED_P0_WIN_SOURCE":"INCOMPLETE_MATROID_SHADOW_FRAME",
  C:C.map(c=>c+1),oddB:oddB.map(c=>c+1),
  matchingsExamined:Qs.length,passingQProofFrames:any,
  p0Count:p0.min.length,p1Count:p1.min.length,
  sourceHeight:q.h.slice(),best};
}
const q7=fresh(),prefix="4214254";
for(let ply=0;ply<prefix.length;ply++)assert(!drop(q7,+prefix[ply],ply&1).win,"original q7 legal firstwinfree");
assert(q7.h.join(",")==="1,2,0,3,1,0,0","original q7 support");
let tested=0,terminalP0=0,certified=0,unsolved=0;
const cases=[],group={};
for(let b1=1;b1<=W;b1++){
 if(b1===4)continue;
 const q8=cp(q7);assert(!drop(q8,b1,1).win,"source P1 initial no win");
 assert(!drop(q8,4,0).win,"P0 c4r4 source grade2 fulfill");
 const rows=[];
 for(let b2=1;b2<=W;b2++){
  const q10=cp(q8);assert(!drop(q10,b2,1).win,"P1 no early firstwin");
  const hc=q10.h[2],a2=hc===1?6:3,P0=drop(q10,a2,0);
  if(P0.win){
   assert(hc===2&&a2===3,"only P0 immediate diagonal rank11 case");
   terminalP0++;
   rows.push({b1,b2,a2,status:"P0_FIRSTWIN_AT_RANK11"});
   cases.push(rows[rows.length-1]);tested++;continue;
  }
  assert(q10.h[2]===1&&normalized(q10,0).min.some(x=>x.G===bit(2,2)),
   "every live q11 has a ready P0 c3r3 trap");
  const proof=frame(q10);
  if(proof.status==="GUARDED_P0_WIN_SOURCE")certified++;else unsolved++;
  const rec={b1,b2,a2,status:proof.status,
   heights:q10.h.slice(),P0TrapColumns:proof.C,oddNontrapBases:proof.oddB,
   P1MinWSL:proof.p1Count,
   availableQSourceMatchings:proof.matchingsExamined,
   passingQSourceFrames:proof.passingQProofFrames,best:proof.best};
  rows.push(rec);cases.push(rec);tested++;
 }
 group[b1]={win:rows.filter(x=>x.status==="P0_FIRSTWIN_AT_RANK11").length,
  proven:rows.filter(x=>x.status==="GUARDED_P0_WIN_SOURCE").length,
  incomplete:rows.filter(x=>x.status!=="GUARDED_P0_WIN_SOURCE"&&x.status!=="P0_FIRSTWIN_AT_RANK11").length,
  worstSourceUnshadowed:Math.max(...rows.filter(x=>x.best).map(x=>x.best.unshadowedCount))};
}
assert(tested===42&&terminalP0===1&&certified+unsolved===41,"42 literal local source q11 frames only");
const result={
 schema:"c4.original7x6_rank7_41_formed_source_augmented_WDL_frames.v1",
 status:"EXACT_41_RANK11_READY_P0_TRAP_SOURCE_CERTIFICATE_APPLICATION_WITH_NO_STRATEGIC_CHILD_WLD",
 priorSource:"original7x6 firstwinnerfree rank7 4214254 P1 to move",
 construction:"For P1 b1!=4, P0 c4; next P1 b2; P0 c3 if c3h=0/2, else c6; at rank11 either P0 FIRSTWIN (one case), or ready P0 c3r3 trap (41 cases).",
 sourceQFrameMethod:"For each resultant live source q, C=maximal current P0 trap set, B=odd nontrap bases, consider finite non-game-strategic perfect-matchings Q as ONLINE respondent proof objects. Free D even-tail lower E + one rank1 per Q base pair + rank1 source trap block. Each P1 minimal source WSL G must be dependent OR have a physically assured original P0 H/R/F one-row-down firstwinner-shadow. If none of Q pass, return INCOMPLETE, never P1 WIN.",
 originalK4:originalDirs,
 tally:{namedLocalRank7TwoRoundSourceControls:tested,
   directP0TerminalFirstwins:terminalP0,liveP0ReadyTrapPositions:41,
   P0WINGuardedSourceCertifications:certified,sourceProofFramesINCOMPLETE:unsolved},
 byP1FirstResponse:group,allRank11SourceCases:cases,
 "terminalDisclaimer":"A ready P0 trap alone is NOT a WLD WIN theorem; the P0 responding policy must satisfy all original Oct20 legality/finite-progress guards.",
 noFutureGameWLDRecursion:true,noAllOriginalGameStateEnumeration:true,noSolvedOutcomePremises:true,
 qualifiedAuthorityModified:false,CI:"NOT_RUN",formalChecker:"NOT_RUN"
};
console.log(JSON.stringify(result,null,2));
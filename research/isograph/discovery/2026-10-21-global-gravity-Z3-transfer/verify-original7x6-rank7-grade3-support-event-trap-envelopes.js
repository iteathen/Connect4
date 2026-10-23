"use strict";
/**
 * Original 7x6 source q7=4214254. Exactly 14 source minimal P0 grade3
 * missing-cell requirements; choose each of 3 cells as future ready trap
 * y and P0's two actual new stones as F=G\{y}. Static source gravity
 * support envelope must consume <=2 D support stones; a legal 4-event
 * event order must be D1,A1,D2,A2 with genuine landing cells. Finite
 * source obligations and support posets only (42 candidate source terms,
 * <=4 event-role permutations each), NOT branching game WLD.
 *
 * Uses original69 true physical windows, separate directional rays and
 * firstwinner stopping; no oracle/solved knowledge or subfive board.
 */
const ok=(v,m)=>{if(!v)throw Error("C4_GRADE3_SUPPORT "+m)};
const W=7,H=6;
const DIR=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]];
const lines=[];
for(let row=0;row<H;row++)for(let col=0;col<W;col++)for(const [type,dx,dy] of DIR){
 const cells=[];
 for(let k=0;k<4;k++){const c=col+k*dx,r=row+k*dy;
  if(c<0||c>=W||r<0||r>=H){cells.length=0;break;}
  cells.push([c,r]);}
 if(cells.length===4)lines.push({type,cells});
}
ok(lines.length===69,"original69 true K4");
const lineInventory=Object.fromEntries(["H","V","R","F"].map(t=>[t,lines.filter(L=>L.type===t).length]));
ok(JSON.stringify(lineInventory)===JSON.stringify({H:24,V:21,R:12,F:12}),"H/V/R/F true counts");
const newBoard=()=>({h:Array(W).fill(0),owner:Array.from({length:W},()=>Array(H).fill(-1))});
const cp=q=>({h:q.h.slice(),owner:q.owner.map(x=>x.slice())});
const sourceCell=(c,r)=>[c,r],key=([c,r])=>r*W+c;
const siteKey=([c,r])=>key([c,r]);
const exactRay=(q,c,r,p)=>{
 for(const [type,dx,dy]of DIR){
  let n=1;for(const dir of [-1,1])for(let k=1;k<4;k++){
   const x=c+dir*dx*k,y=r+dir*dy*k;
   if(x<0||x>=W||y<0||y>=H||q.owner[x][y]!==p)break;n++;
  }
  if(n>=4)return true;
 }
 return false;
};
const siteFirstWin=(q,p)=>lines.some(L=>L.cells.every(([c,r])=>q.owner[c][r]===p));
function move(q,column,p) {
 const c=column-1,row=q.h[c];if(row>=H)return null;
 q.h[c]++;q.owner[c][row]=p;
 const terminal=siteFirstWin(q,p);
 ok(terminal===exactRay(q,c,row,p),"source original69 K4 and independent directional-ray terminal agree");
 return {col:c,row,p,firstwin:terminal};
}
const base=newBoard(),sourceWord="4214254",initialTrace=[];
for(let i=0;i<sourceWord.length;i++){
 const ev=move(base,Number(sourceWord[i]),i&1);
 ok(ev&&!ev.firstwin,"rank7 from original EMPTY genuine firstwinner-free");
 initialTrace.push(ev);
}
ok(base.h.join(",")==="1,2,0,3,1,0,0","exact original q7 h");
function minP0(q) {
 const raw=[];
 for(const L of lines){
  if(L.cells.some(([c,r])=>q.owner[c][r]===1))continue;
  const missing=L.cells.filter(([c,r])=>q.owner[c][r]===-1);
  if(missing.length)raw.push({missing,source:L});
 }
 const sets=new Map();
 for(const x of raw)sets.set(x.missing.map(key).sort((a,b)=>a-b).join(","),x);
 const U=[...sets.values()],result=U.filter(x=>!U.some(y=>y.missing.length<x.missing.length&&y.missing.every(site=>x.missing.some(z=>key(z)===key(site)))));
 return {raw,minimum:result};
}
const original=minP0(base);
const grades={};for(const v of original.minimum)grades[v.missing.length]=(grades[v.missing.length]||0)+1;
ok(JSON.stringify(grades)===JSON.stringify({"2":1,"3":14,"4":33}),"original P0 q7 source grades");
const triples=original.minimum.filter(x=>x.missing.length===3);
const outward=([c,r])=>[c+1,r+1];
const tuple=(entry,target)=>{
 const y=entry.missing[target],F=entry.missing.filter((v,i)=>i!==target);
 // y is zero-based physical cell index; to be one row above next
 // playable frontier, final occupancy is H'=y.row-1.
 const [c,r]=y,finalHeight=r-1;
 let geometryGuard=finalHeight>=0&&base.h[c]<=finalHeight;
 if(F.some(([cc,rr])=>cc===c&&rr>=finalHeight))geometryGuard=false;
 const required=new Map();
 if(geometryGuard){
  for(const [fc,fr]of F)for(let rr=base.h[fc];rr<=fr;rr++)required.set(rr*W+fc,[fc,rr]);
  for(let rr=base.h[c];rr<finalHeight;rr++)required.set(rr*W+c,[c,rr]);
 }
 const ff=new Set(F.map(key));
 const requiredD=[...required].filter(([id,s])=>!ff.has(id)).map(([id,s])=>s);
 const affixSubset=F.every(s=>required.has(key(s)));
 const eligible=geometryGuard&&affixSubset&&requiredD.length<=2&&required.size<=4;
 return {y,F,requiredD,requiredCount:required.size,geometryGuard,affixSubset,eligible};
};
const permutation2=x=>[[x[0],x[1]],[x[1],x[0]]];
const candidates=[],legalWords=[],eligibilityPairs=new Set(),causeCounts={};
let originalStaticCandidates=0,eligibleStaticCandidates=0,permutationOrdersTested=0,legalEventSchedules=0,sourceReadyTrapTrue=0,firstWinDuringSourceSchedule=0;
for(const [idx,entry]of triples.entries()){
 for(let target=0;target<3;target++){
  const cand=tuple(entry,target);
  originalStaticCandidates++;
  if(cand.eligible)eligibleStaticCandidates++;
  const traceCases=[];
  if(cand.eligible){
   ok(cand.requiredD.length===2,"every physically eligible grade3 requires exactly both P1 source events for support");
   for(const Dorder of permutation2(cand.requiredD))for(const Aorder of permutation2(cand.F)){
    permutationOrdersTested++;
    const q=cp(base),events=[];
    let clean=true;
    for(const [n,site]of [Dorder[0],Aorder[0],Dorder[1],Aorder[1]].entries()){
     const p=n%2===0?1:0;
     const ev=move(q,site[0]+1,p);
     if(!ev){clean=false;break;}
     events.push(ev);
     if(ev.col!==site[0]||ev.row!==site[1]){clean=false;break;}
     if(ev.firstwin){firstWinDuringSourceSchedule++;clean=false;break;}
    }
    if(!clean)continue;
    legalEventSchedules++;
    ok(q.h[cand.y[0]]===cand.y[1]-1,"after pair true READY gravity support");
    const post=minP0(q);
    const singleton=post.minimum.some(v=>v.missing.length===1&&key(v.missing[0])===key(cand.y));
    ok(singleton,"physical full ORIGINAL69 WSL post-A singleton y agrees with source grade3");
    sourceReadyTrapTrue++;
    const word=sourceWord+events.map(e=>(e.col+1)).join("");
    const id=idx+":"+target;
    eligibilityPairs.add(id);
    traceCases.push({word,Dsite: Dorder.map(outward),Asite:Aorder.map(outward),
     target:outward(cand.y),afterHeights:q.h.slice()});
    legalWords.push({sourceTriple:idx,candidateTarget:target,word,sourceK4:entry.source.type,target:outward(cand.y),
     Dsites:Dorder.map(outward),Asites:Aorder.map(outward)});
   }
  }
  const rec={
   sourceTripleIndex:idx,sourceOriginalK4:entry.source.type,
   originalLine:entry.source.cells.map(outward),
   sourceGrade3Missing:entry.missing.map(outward),
   selectedTrapCell:outward(cand.y),ARequiredClaims:cand.F.map(outward),
   gravitySupportGuard:cand.geometryGuard,staticRequiredSlots:cand.requiredCount,
   sourceAdditionalPSupport: cand.requiredD.map(outward),
   minimalRequiredOpponentSupportMoves:cand.requiredD.length,
   staticSourceEnvelopeEligible:cand.eligible,
   atLeastOneChronologicallyLegalTrapFormation:traceCases.length>0,
   legalNamedFourEventSourceWitnesses:traceCases
  };
  candidates.push(rec);
 }
}
ok(originalStaticCandidates===42,"14 source grade3 x3 y");
ok(eligibleStaticCandidates===7,"static gravity-support envelope7/42");
const rescued=candidates.filter(x=>x.atLeastOneChronologicallyLegalTrapFormation);
const distinctSupport=new Map();
for(const rec of rescued){
 const key=rec.sourceAdditionalPSupport.map(x=>x.join(",")).sort().join("|");
 if(!distinctSupport.has(key))distinctSupport.set(key,[]);
 distinctSupport.get(key).push(rec.selectedTrapCell);
}
const byGrade3Source={};
for(const rec of rescued)byGrade3Source[rec.sourceTripleIndex]=(byGrade3Source[rec.sourceTripleIndex]||0)+1;
const result={
 schema:"c4.original7x6_rank7_grade3_source_support_poset.v1",
 status:"EXACT_14_GRADE3_TRIPLES_COLLAPSE_TO_SOURCE_TWO_D_SUPPORT_TRAP_FORMATION_ENVELOPES",
 physicalOriginalW7H6K4:lineInventory,
 source:{word:sourceWord,rank:7,sourceHeights:base.h,sourceP0WSLMinimum:original.minimum.length,gradeHistogram:grades,
  sourceGrade3Requirements:triples.length},
 construction:"For each G source minimal grade3 and y in G, require P0 to claim exactly the two other source missing cells F=G\\{y}; demand physical source column-prefix closure to all F cells and enough occupancy h'_cy=row_y-2 for ready y, with no y/just-below-y claim. Opponent two moves must claim every other required prefix cell. Then check D1,A1,D2,A2 physical gravity/firstwinner and true original69 WSL singleton.",
 sourceEnumeration:{originalGrade3CandidatePairs:originalStaticCandidates,staticEnvelopeEligiblePairs:eligibleStaticCandidates,
  localFourEventSchedulesChecked:permutationOrdersTested,physicalLiveFourEventSequences:legalEventSchedules,
  postPhysicalWSLReadySingletonConfirmed:sourceReadyTrapTrue,
  sourceSequencesTerminatedEarly: firstWinDuringSourceSchedule,
  allActualGameStateSpaceEnumerated:false,futureStrategicWLDValuesComputed:0},
 qualifiedResults:{legalGrade3ReadyTrapCandidates:rescued.length,
  allGradedCandidateCells:candidates,
  actualLiveChronologicalSourceWitnesses:legalWords,
  distinctOpponentSupportResourcePackages:[...distinctSupport].map(([k,v])=>({DrequiredSourceCells:k,possibleTargetTraps:v})),
  actualSourceTriplesParticipating:Object.keys(byGrade3Source).length},
 guard:"These are existential localized legal SOURCE support posets, not guaranteed P0 strategies: P1 must choose both dictated support cells. Old single grade2 source mask can additionally produce ready traps by another path and is not classified here.",
 originalWinnerPremises:"NONE",noSubfiveBoardCounterexamples:true,
 maintainedNodeCI:"NOT_RUN",externalFormalProof:"NOT_RUN"
};
console.log(JSON.stringify(result,null,2));
#!/usr/bin/env node
// Original 7x6 Connect4 all-history FIELD transfer, not line-by-line strategy.
// Psi_t(q) counts every physically legal firstwinner-free alternating ordered
// history arriving at TRUE actual board q. Firstwinners go to absorbing sinks.
// Z3 true physical Fourier characters and all-original H/V/R/F partial line
// moments are computed across ALL reachable live states of early ranks.
// No game oracle, no historic 28 terminal lines, no minimax labels.
import assert from 'node:assert/strict';

const W=7,H=6,SHIFT=Array.from({length:W},(_,c)=>2**(7*c)),
  MASK=127,D=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
const K4=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [orientation,dx,dy] of D){
 const ps=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
 if(ps.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
  K4.push({orientation,cells:ps.map(([x,y])=>x+W*y)});
}
assert.equal(K4.length,69);
const BYSITE=Array.from({length:W*H},()=>[]);
for(const L of K4)for(const e of L.cells)
 BYSITE[e].push(L.cells.filter(x=>x!==e));
const sentinel=SHIFT.reduce((a,b)=>a+b,0);
const weights={};
for(const d of D)weights[d[0]]=0;

function digits(key){
 return SHIFT.map(v=>Math.floor(key/v)%128);
}
function heights(ds){
 return ds.map(s=>31-Math.clz32(s));
}
function owners(ds,hs){
 const q=new Int8Array(W*H);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++){
  q[c+W*r]=r>=hs[c]?0:((ds[c]>>r)&1)+1;
 }
 return q;
}
function directWin(q,e,p){
 return BYSITE[e].some(L=>L.every(x=>q[x]===p+1));
}
function phase(pair,phase,weight){
 if(phase===0)pair[0]+=2*weight;
 else if(phase===1){pair[0]-=weight;pair[1]+=weight;}
 else if(phase===2){pair[0]-=weight;pair[1]-=weight;}
 else throw new Error('not Z3');
}
function chirality(s){
 return s===0?0:s===1?1:2;
}
function moment(live,t,detailed){
 const totals={rank:t,liveDistinctBoards:live.size,liveLegalOrderedHistories:0,
  centralBottomZ3CharacterExact:{twiceRealNumerator:0,sqrt3ImagNumerator:0},
  leftBottomZ3CharacterExact:{twiceRealNumerator:0,sqrt3ImagNumerator:0},
  rightBottomZ3CharacterExact:{twiceRealNumerator:0,sqrt3ImagNumerator:0},
  orientationCrossSiteZ3PairCharacters:{},maxHistoriesAtOneBoard:0};
 const pairSpecs=[
  ['H',2,0,3,0],['V',3,0,3,1],
  ['R',2,0,3,1],['F',2,1,3,0]
 ];
 const pairs=pairSpecs.map(z=>[z[0],z[1]+7*z[2],z[3]+7*z[4],[0,0]]);
 const grade={H:{P0_2:0,P0_3:0,P1_2:0,P1_3:0},
              V:{P0_2:0,P0_3:0,P1_2:0,P1_3:0},
              R:{P0_2:0,P0_3:0,P1_2:0,P1_3:0},
              F:{P0_2:0,P0_3:0,P1_2:0,P1_3:0}};
 for(const [key,w] of live){
  const ds=digits(key),hs=heights(ds);
  const center=hs[3]>0?((ds[3]&1)+1):0;
  const left=hs[0]>0?((ds[0]&1)+1):0;
  const right=hs[6]>0?((ds[6]&1)+1):0;
  totals.liveLegalOrderedHistories+=w;
  totals.maxHistoriesAtOneBoard=Math.max(totals.maxHistoriesAtOneBoard,w);
  const cs=totals.centralBottomZ3CharacterExact,
   ls=totals.leftBottomZ3CharacterExact,
   rs=totals.rightBottomZ3CharacterExact;
  // [2 Re Sum(w omega^s), (2/sqrt3) Im Sum(w omega^s)]
  // These have EXACT integer coefficients.
  if(center===0)cs.twiceRealNumerator+=2*w;
  else{cs.twiceRealNumerator-=w;cs.sqrt3ImagNumerator+=center===1?w:-w;}
  if(left===0)ls.twiceRealNumerator+=2*w;
  else{ls.twiceRealNumerator-=w;ls.sqrt3ImagNumerator+=left===1?w:-w;}
  if(right===0)rs.twiceRealNumerator+=2*w;
  else{rs.twiceRealNumerator-=w;rs.sqrt3ImagNumerator+=right===1?w:-w;}
  if(detailed){
   const q=owners(ds,hs);
   for(const [o,a,b,v] of pairs)
    phase(v,(q[a]-q[b]+3)%3,w);
   for(const L of K4){
    let P0=0,P1=0;
    for(const e of L.cells){
     if(q[e]===1)P0++;
     else if(q[e]===2)P1++;
    }
    if(!P1&&P0>=2&&P0<=3)grade[L.orientation]['P0_'+P0]+=w;
    if(!P0&&P1>=2&&P1<=3)grade[L.orientation]['P1_'+P1]+=w;
   }
  }
 }
 if(detailed){
  for(const [o,a,b,v] of pairs)totals.orientationCrossSiteZ3PairCharacters[o]={
   physicalSiteA:[a%7+1,Math.floor(a/7)+1],
   physicalSiteB:[b%7+1,Math.floor(b/7)+1],
   twiceRealNumerator:v[0],sqrt3ImagNumerator:v[1]
  };
  totals.originalDirectionalK4LiveGrade2And3RawMoments=grade;
 }
 assert.deepEqual(totals.leftBottomZ3CharacterExact,totals.rightBottomZ3CharacterExact);
 return totals;
}
function reflectionInvariance(live){
 let checked=0;
 for(const [key,w] of live){
  let mirrored=0;
  for(let c=0;c<W;c++){
   const v=Math.floor(key/SHIFT[c])%128;
   mirrored+=v*SHIFT[W-1-c];
  }
  assert.equal(live.get(mirrored),w,
   'Original gravity/all-K4 physical reflection must preserve field');
  checked++;
 }
 return checked;
}
const MAX_RANK=8;
let live=new Map([[sentinel,1]]),P0absorbed=0,P1absorbed=0;
const evidence={schema:1,date:'2026-10-21',
 status:'ORIGINAL7X6_GLOBAL_FIRSTWIN_ABSORBING_FIELD_EARLY_EXACT_Z3_MOMENTS',
 geometry:{W,H,K:4,physicalSites:42,originalHVRFK4Windows:K4.length,
  gravityLocalColumnOwnerWords:127,gravityProductStates:'127^7',
  losslessStateEncoding:'Seven 7-bit base128 sentinel owner words, total 49 exact bits',
  extraCaveat:'Not all gravity-product states are alternating-history reachable and firstwinnerfree.'},
 policy:'UNCONTROLLED: Every legal physical column action has formal history count weight1; this is NOT an optimal-play Bayesian posterior or game-theoretic value',
 ranks:[], absorptionHistoryFlux:{}, independentGeometryControls:{}
};
for(let t=0;t<=MAX_RANK;t++){
 const current=moment(live,t,t<=7);
 current.cumulativeAbsorbedP0OrderedHistories=P0absorbed;
 current.cumulativeAbsorbedP1OrderedHistories=P1absorbed;
 if(t<=7)current.mirrorExactlyMatchedStates=reflectionInvariance(live);
 if(t<=6)assert.equal(current.liveLegalOrderedHistories,7**t,
  'There can be no full column or 4-in-row firstwinner before t7');
 evidence.ranks.push(current);
 if(t===MAX_RANK)break;
 const next=new Map;
 let win0=0,win1=0,drops=0;
 const p=t%2;
 for(const [key,count] of live){
  const ds=digits(key),hs=heights(ds);
  const q=t>=6?owners(ds,hs):null;
  for(let c=0;c<W;c++){
   const r=hs[c];if(r>=H)continue;
   const e=c+W*r;drops+=count;
   if(t>=6&&directWin(q,e,p)){
    if(p===0)win0+=count;else win1+=count;
   }else{
    const dst=key+SHIFT[c]*(1+p)*(2**r);
    assert(Number.isSafeInteger(dst));
    next.set(dst,(next.get(dst)||0)+count);
   }
  }
 }
 P0absorbed+=win0;P1absorbed+=win1;
 evidence.absorptionHistoryFlux[String(t+1)]={
  move:t+1,p0FirstwinHistories:win0,p1FirstwinHistories:win1,
  allPhysicallyLegalSourceDropsBeforeWinCut:drops,
  continuationHistoryMass:[...next.values()].reduce((a,b)=>a+b,0)
 };
 live=next;
 if(t<=5)assert.equal(win0+win1,0);
}
evidence.crossChecks={
 fullBoardGamma:'This run does NOT sample or count all 127^7 gravity product states, only the first 0..8 reachable nonterminal field ranks.',
 originalMirrorExactAllRanksThrough7:true,
 terminalFirstwinnerPriorityPreserved:true,
 knownTerminalEarliestP0Rank7:true,
 rootPerfectP0WINProved:false,
 FourierZ3ComplexNormalization:'Normalized moment = ((twiceRealNumerator/2) + i*(sqrt3ImagNumerator*sqrt(3)/2)) / liveHistoryMass',
 originalSolvedGameUsed:false,historicStrong28Used:false
};
process.stdout.write(JSON.stringify(evidence,null,2)+'\n');

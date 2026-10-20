// Independent ORIGINAL physical 4-direction RAY adjudication of a frozen
// one-round source P0 winner policy. This is a FALSIFIER of already-certified
// current-label source results, not a way to search future WDL/game values.
import fs from "node:fs";
import {sourceOneRoundP0Win} from "./source7x6-one-round-response-quantifier.mjs";
const fixture=JSON.parse(fs.readFileSync(new URL(
 "../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json",
 import.meta.url),"utf8")).witnesses;
const W=7,H=6,dirs=[[1,0],[0,1],[1,1],[1,-1]];
const assert=(z,m)=>{if(!z)throw Error(m);};
const fresh=()=>({W,H,n:0,h:Array(W).fill(0),
 b:Array.from({length:W},()=>Array(H).fill(-1))});
const copy=q=>({W,H,n:q.n,h:q.h.slice(),b:q.b.map(x=>x.slice())});
const legal=q=>q.h.map((v,c)=>v<H?c:-1).filter(x=>x>=0);
function physicallyWinRay(board,c,r,p){
 for(const [dx,dy] of dirs){
  let count=1;
  for(const sign of [-1,1]){
   let x=c+sign*dx,y=r+sign*dy;
   while(x>=0&&x<W&&y>=0&&y<H&&board[x][y]===p){count++;x+=sign*dx;y+=sign*dy;}
  }
  if(count>=4)return true;
 }
 return false;
}
function actualDrop(q,c){
 assert(c>=0&&c<W&&q.h[c]<H,"original gravity action illegal");
 const p=q.n%2,r=q.h[c]++;q.b[c][r]=p;q.n++;
 return {p,c,r,firstwin:physicallyWinRay(q.b,c,r,p)};
}
let direct=0,zChecks=0,multiChecks=0,defenderMoves=0,
 firstwinningPhysicalTerminals=0,positiveByRank={},certified=0;
function validateGeneralMulti(q,cert){
 assert(q.n%2===1&&cert.sourceDPlayer===1&&cert.sourceAPlayer===0,
  "wrong role in multi cert");
 let visited=new Set(),nchoices=0;
 const danger=cert.dangerColumnOneBased-1;
 function go(state){
  const k=state.b.map(z=>z.join("")).join("|");
  if(visited.has(k))return;visited.add(k);
  for(const a of legal(state)){
   nchoices++;defenderMoves++;
   const branch=copy(state),d=actualDrop(branch,a);
   assert(d.p===1&&!d.firstwin,"P1 firstwin preempts P0 multi certificate");
   assert(branch.h[a]<H,"P0 upper mate must be physically legal");
   const mate=actualDrop(branch,a);
   assert(mate.p===0,"multi role mismatch");
   if(mate.firstwin){
    firstwinningPhysicalTerminals++;
    assert(branch.n<=q.n+cert.maximumAdditionalPliesUntilAttackerFirstwin,
     "multi rank deadline exceeded");
    continue;
   }
   assert(a!==danger,"unblocked latent P0 singleton failed on danger");
   go(branch);
  }
 }
 go(copy(q));
 multiChecks+=visited.size;
 assert(nchoices>0,"multi certificate not physically exercised");
}
function validateOriginalP0Certificate(q,cert){
 const expected=new Set(legal(q).map(c=>c+1));
 const claimed=new Set(cert.sourceWinningResponseTable.map(t=>t.P1columnOneBased));
 assert(expected.size===claimed.size && [...expected].every(x=>claimed.has(x)),
  "source missed real CURRENT P1 action");
 for(const row of cert.sourceWinningResponseTable){
  const state=copy(q);
  const P1=actualDrop(state,row.P1columnOneBased-1);
  assert(P1.p===1&&!P1.firstwin,"source P1 terminal guard false");
  const P0=actualDrop(state,row.P0replyColumnOneBased-1);
  assert(P0.p===0,"source P0 observed responder move owner wrong");
  if(row.sourceCertificate==="ORIGINAL_DIRECT_P0_K4_FIRSTWIN"){
   direct++;assert(P0.firstwin,"source direct P0 K4 winning label falsified");
   firstwinningPhysicalTerminals++;continue;
  }
  assert(!P0.firstwin,"source did not classify actual direct P0 winner");
  if(row.sourceCertificate==="ORIGINAL_Z_UNIVERSAL_NEXT_P1_IMMEDIATE_EXPOSURE"){
   for(const a of legal(state)){
    zChecks++;defenderMoves++;
    const branch=copy(state),other=actualDrop(branch,a);
    assert(other.p===1&&!other.firstwin,"Z source misses P1 immediate terminal");
    let p0Now=false;
    for(const b of legal(branch)){
     const test=copy(branch),reply=actualDrop(test,b);
     if(reply.firstwin){p0Now=true;firstwinningPhysicalTerminals++;break;}
    }
    assert(p0Now,"source Z universal physical P0 next K4 win false");
   }
  }else if(row.sourceCertificate==="ORIGINAL_GUARDED_MULTI_EVEN_PAIR_RESERVOIR"){
   validateGeneralMulti(state,row.multi);
  }else throw Error("unknown source guard");
 }
}
const unique=new Map();
for(const w of fixture.witnesses??fixture){
 const ids=unique.get(w.movesZeroBased)||[];
 ids.push(w.lineId);unique.set(w.movesZeroBased,ids);
}
for(const [word,ids] of unique){
 const q=fresh();
 for(let n=0;n<41;n++){
  if(n%2===1&&n<=37){
   const res=sourceOneRoundP0Win(q);
   if(res.status==="SOURCE_PROVED_P0_WIN"){
    validateOriginalP0Certificate(q,res);
    positiveByRank[n]=(positiveByRank[n]||0)+1;certified++;
   }
  }
  const step=actualDrop(q,Number(word[n]));
  assert(step.firstwin===(n===40),"historical literal original firstwin discrepancy");
 }
}
const draw="123456123456654321654321123456123456777777",dq=fresh();
let negativeSourceP0Wins=0;
for(let n=0;n<draw.length;n++){
 if(n%2===1&&n<=37 && sourceOneRoundP0Win(dq).status==="SOURCE_PROVED_P0_WIN")
  negativeSourceP0Wins++;
 assert(!actualDrop(dq,Number(draw[n])-1).firstwin,"draw control wins");
}
assert(negativeSourceP0Wins===0,"known actual draw root misclassified P0 win");
console.log(JSON.stringify({status:"PASS_INTERNAL_ORIGINAL_RAY_INDEPENDENT_OF_SOURCE_WINDOW_ENUMERATION",
 sourceCertifiedP0WinPositions:certified,positiveByRank,
 directP0WinningBranchChecks:direct,ZnextP1ActionsChecked:zChecks,
 multiSourceDefenderTurnStatesPhysical:multiChecks,
 alternateP1MovesPhysical:defenderMoves,terminalP0FirstwinConclusions:firstwinningPhysicalTerminals,
 realDrawSourceFalsePositives:negativeSourceP0Wins,
 historical28TerminalIDsSourceInputs:false},null,2));

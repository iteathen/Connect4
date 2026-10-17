// Source-only canonical 7x6 Connect4 control frozen before execution.
// No independent game-value evaluation, no continuations past a single
// algebraically scanned root action. W/H/K explicitly preserved.
// Research branch research/semantic-quotient, 2026-10-17.
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
import {createSourceTemporalTransversal} from './standard7x6-source-temporal-transversal.mjs';
const W=7,H=6,K=4,bit=(c,r)=>1n<<BigInt(W*r+c);
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]) {
 const ce=c+(K-1)*dc,re=r+(K-1)*dr;
 if(ce<0||ce>=W||re<0||re>=H)continue;
 lines.push(Array.from({length:K},(_,j)=>bit(c+dc*j,r+dr*j)).reduce((s,x)=>s|x,0n));
}
if(lines.length!==69)throw Error('geometry not standard 69 line');
const popcount=b=>{let k=0;for(let x=b;x;x&=x-1n)k++;return k;};
function normalize(gs){
 const sorted=[...new Set(gs.map(String))].map(BigInt).sort((a,b)=>popcount(a)-popcount(b));
 const a=[];for(const g of sorted)if(!a.some(s=>(g&s)===s))a.push(g);
 return a;
}
function physical(history){
 const h=Array(W).fill(0),P=[0n,0n];
 for(let i=0;i<history.length;i++){
  const c=Number(history[i])-1;if(c<0||c>=W||h[c]>=H)throw Error('illegal history');
  const x=bit(c,h[c]++),p=i%2;P[p]|=x;
  if(lines.some(g=>(P[p]&g)===g))throw Error('first win occurred before history ends');
 }
 return {h,P,n:history.length};
}
function source(history){
 const p=physical(history),R=[[],[]];
 for(let side=0;side<2;side++)for(const g of lines){
  if((p.P[1-side]&g)!==0n)continue;
  const rem=g&~p.P[side];if(rem===0n)throw Error('terminal source');
  R[side].push(rem);
 }
 return {h:p.h.slice(),R:R.map(normalize)};
}
function sourceCannotWin(q,p){
 const n=q.h.reduce((a,b)=>a+b,0);
 if(q.R[p].length===0)return true;
 const s=n%2,A=(k)=>Math.floor(k/2)+(k%2&&p===s?1:0);
 return q.R[p].every(g=>{
  let z=0,max=-1;
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)if((g&bit(c,r))!==0n){z++;max=Math.max(max,r);}
  return z>A((W-1)*H-n+max+1);
 });
}
const geometry={width:W,height:H,connect:K};
const temporal=createSourceTemporalTransversal(geometry),full=createSourceFractionalTransversal(geometry);
const cases=['44444','444441','444442','444443','444444','444445','444446','444447','4444442'];
const records=[];
for(const history of cases){
 const q=source(history),n=history.length;
 const sides=[];
 for(let p=0;p<2;p++){
  const tm=temporal.compute(q,p),pk=full.prove(q,p),noWin=sourceCannotWin(q,1-p);
  sides.push({player:p,opponentSourceCannotWin:noWin,
   temporal:{status:tm.status,earliestOpponentWinLowerRank:tm.sourceOpponentWinEarliestLowerRank,
     thresholds:tm.statistics.staticThresholdsChecked,packingAttempts:tm.statistics.staticLinePackingAttempts,
     certificate:tm.certificate??null},
   fullBoardPacking:{status:pk.status,opponentNoWinGuard:noWin,
     certifiedWinner:pk.status==='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN'&&noWin,
     sumNumerator:pk.witness?.sumNumerator??null,denominator:pk.witness?.denominator??null,
     opponentCapacity:pk.opponentTotalTurns??pk.capacity??null}});
 }
 records.push({history,ply:n,sideToMove:n%2,heights:q.h,reqCounts:q.R.map(r=>r.length),
  legalColumns:q.h.flatMap((h,c)=>h<H?[c+1]:[]),sides});
}
console.log(JSON.stringify({schema:'connect4.standard7x6.canonical_transversal_source_only_v0_1',date:'2026-10-17',
 W,H,K,geometricWinlineCount:lines.length,strategicFutureGamesEvaluated:0,
 sourceOnly:true,records},null,2));

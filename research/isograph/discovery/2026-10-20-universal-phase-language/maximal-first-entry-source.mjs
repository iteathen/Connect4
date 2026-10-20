// Exact guarded online first-entry multitraP source WIN certificate; no game-valued successors.
// Original physical directional K windows only; no Oracle or strong terminal-line labels.
import assert from 'node:assert/strict';

const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const point=(c,r,H)=>c*H+r;

export function originalLines(W,H,K=4){
 const lines=[];
 for(let c=0;c<W;c++) for(let r=0;r<H;r++) for(const [dx,dy] of DIRS){
  const coords=Array.from({length:K},(_,i)=>[c+dx*i,r+dy*i]);
  if(coords.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   lines.push(coords.map(([x,y])=>point(x,y,H)));
 }
 return lines;
}

export function fromOriginalHistory(W,H,K,oneBasedHistory){
 assert(W<=9 && K>=2 && W>=1 && H>=1);
 const board=new Int8Array(W*H).fill(-1),heights=new Array(W).fill(0),lines=originalLines(W,H,K);
 for(let i=0;i<oneBasedHistory.length;i++){
  const c=Number(oneBasedHistory[i])-1,p=i%2;
  assert(Number.isInteger(c)&&c>=0&&c<W&&heights[c]<H,'illegal drop '+(i+1));
  const e=point(c,heights[c]++,H);board[e]=p;
  assert(!lines.some(L=>L.includes(e)&&L.every(v=>board[v]===p)),'early original K firstwin '+(i+1));
 }
 return {W,H,K,board,heights,lines};
}

export function sourceFirstEntryMultitrap(q){
 const {W,H,K,board,heights,lines}=q;
 const D=heights.reduce((a,b)=>a+b,0)%2,A=1-D;
 const traps=[],ySource=[];
 for(let c=0;c<W;c++) if(H-heights[c]>=2){
  const y=point(c,heights[c]+1,H);
  const sourceLine=lines.find(L=>L.includes(y)&&L.every(e=>e===y||board[e]===A));
  if(sourceLine){traps.push(c);ySource.push({column:c,upperCell:y,sourceLine});}
 }
 if(traps.length===0)return {verdict:'INCOMPLETE',reason:'no_latent_traps',A,D};
 const trapSet=new Set(traps);
 const nontraps=Array.from({length:W},(_,i)=>i).filter(c=>!trapSet.has(c));
 if(nontraps.some(c=>(H-heights[c])%2))return {verdict:'INCOMPLETE',reason:'nontrap_odd_remaining_capacity',traps,A,D};
 const E=new Set(),X=new Set(traps.map(c=>point(c,heights[c],H)));
 for(const c of nontraps)for(let r=heights[c];r<H;r+=2)E.add(point(c,r,H));
 const originalDResiduals=[];
 let blocked=0;
 for(let i=0;i<lines.length;i++){
  const L=lines[i];
  if(L.some(e=>board[e]===A)){blocked++;continue;}
  const G=L.filter(e=>board[e]===-1);
  assert(G.length>0,'terminal D K-line not a nonterminal source');
  originalDResiduals.push(G);
  const residue=G.filter(e=>!E.has(e));
  if(residue.length===0 || (residue.length===1&&X.has(residue[0])))
   return {verdict:'INCOMPLETE',reason:'D_possible_counterfirstwin_envelope',traps,A,D,sourceLineIndex:i,remainingRequirement:G,firstEntryResidue:residue};
 }
 const m=E.size;
 const oldSingleTrapWinners=[];
 for(const c of traps){
  if(Array.from({length:W},(_,i)=>i).some(d=>d!==c && (H-heights[d])%2))continue;
  const M=new Set([point(c,heights[c],H)]);
  for(let d=0;d<W;d++)if(d!==c)for(let r=heights[d];r<H;r+=2)M.add(point(d,r,H));
  if(originalDResiduals.every(G=>!G.every(e=>M.has(e))))oldSingleTrapWinners.push(c);
 }
 return {
  verdict:'EXACT_A_FIRSTWIN',A,D,traps,ySource,nontraps,
  frontierX:[...X],safeEvenLowerEnvelope:[...E],safeReservoirPairs:m,
  originalDResidualCount:originalDResiduals.length,originalDBlockedLineCount:blocked,
  maxAdditionalPlies:2*m+2,oldSingleTrapWinners,
  explanation:'D-before-first-trap cells lie in E; final D move can add exactly one trap frontier x. No source D line fits either first-entry envelope.'
 };
}

if(process.argv[1]?.endsWith('maximal-first-entry-source.mjs')){
 const cases=[
  [5,6,'51345313332312145115'],
  [6,6,'33334334114464156266564561'],
  [7,5,'624627765714441453277266325'],
  [7,6,'74254126764411163322446'],
  [7,6,'414']
 ];
 for(const [W,H,s] of cases){
  const q=fromOriginalHistory(W,H,4,s),v=sourceFirstEntryMultitrap(q);
  process.stdout.write(JSON.stringify({W,H,rank:s.length,oneBasedPrefix:s,result:v})+'\n');
 }
}
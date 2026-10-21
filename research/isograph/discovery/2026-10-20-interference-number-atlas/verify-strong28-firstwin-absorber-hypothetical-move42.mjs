// Original 7x6 first-winner absorber vs hypothetical move42, research-only.
// All 69 original physical K4 windows are rebuilt without historical line labels.
// The previously archived strong28 per-line 41-ply histories are held-back INPUT
// for validation of this specific source question, not a root WDL oracle.
// Strict original gravity, P0 first, original firstwin as absorbing state.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const W=7,H=6,K=4,directions=[[1,0],[0,1],[1,1],[1,-1]],cell=(c,r)=>r*W+c;
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of directions){
 const loc=Array.from({length:K},(_,j)=>[c+j*dc,r+j*dr]);
 if(loc.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))lines.push(loc);
}
assert.equal(lines.length,69);
const sig=L=>L.map(([c,r])=>cell(c,r)).sort((a,b)=>a-b).join(',');
const lineIndex=new Map(lines.map((L,i)=>[sig(L),i]));
const archived=JSON.parse(readFileSync(
 new URL('../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',import.meta.url),'utf8'));
assert.equal(archived.witnesses.length,28);
const T=new Map(archived.witnesses.map(w=>[sig(w.cells),w.lineId]));
assert.equal(T.size,28);
assert([...T.keys()].every(k=>lineIndex.has(k)));
const existing=new Map;
for(const w of archived.witnesses){
 assert.equal(w.movesZeroBased.length,41);
 if(!existing.has(w.movesZeroBased))existing.set(w.movesZeroBased,[]);
 existing.get(w.movesZeroBased).push(w.lineId);
}
assert.equal(existing.size,27);
const allKeys=new Set(lines.map(sig));
const ownerCompleted=(board,p)=>lines.filter(L=>L.every(([c,r])=>board[cell(c,r)]===p));
const qIndex=L=>lineIndex.get(sig(L));
function rayWon(board,c,r,p){
 for(const [dc,dr] of directions){
  let tally=1;
  for(const side of [-1,1]){
   let x=c+side*dc,y=r+side*dr;
   while(x>=0&&x<W&&y>=0&&y<H&&board[cell(x,y)]===p){
    tally++;x+=side*dc;y+=side*dr;
   }
  }
  if(tally>=4)return true;
 }
 return false;
}
function replay(word){
 const board=Array(W*H).fill(-1),h=Array(W).fill(0);
 let early=0,wonOn41=false;
 for(let t=0;t<word.length;t++){
  const c=Number(word[t]),p=t%2;
  assert(Number.isInteger(c)&&c>=0&&c<W&&h[c]<H);
  const r=h[c]++,e=cell(c,r);
  board[e]=p;
  const ray=rayWon(board,c,r,p);
  const window=ownerCompleted(board,p).length>0;
  assert.equal(ray,window);
  if(ray){if(t!==40)early++;else wonOn41=p===0;}
 }
 assert.equal(early,0);assert.equal(wonOn41,true);
 return {board,h};
}
const subsets={p0:new Set,p1post:new Set,p0latent:new Set};
const records=[],hist=new Map;
let totalP0=0,totalP1=0,totalLatent=0;
const zMaps=[
 new Map([[34,-1],[35,1],[37,1],[43,-1],[53,-1],[58,1]]),
 new Map([[13,1],[14,-1],[27,1],[28,-1],[61,-1],[62,1]])
];
const charge=keys=>zMaps.map(z=>keys.reduce((a,k)=>a+(z.get(T.get(k))||0),0));
const sourceEventMatrix=[];
for(const [word,archivedLabels] of existing){
 const {board}=replay(word),e=board.findIndex(s=>s<0);
 assert.equal(board.filter(s=>s===-1).length,1);
 assert.equal(Math.floor(e/W),H-1); // one empty is physically top row
 const x=e%W,r=H-1;
 const completed=ownerCompleted(board,0).map(sig);
 assert(ownerCompleted(board,1).length===0);
 assert(archivedLabels.every(id=>completed.some(k=>T.get(k)===id)));
 const containing=lines.filter(L=>L.some(([c,r])=>cell(c,r)===e));
 const p1Next=containing.filter(L=>L.every(([c,r])=>cell(c,r)===e||board[cell(c,r)]===1)).map(sig);
 const p0IfWrongOwner=containing.filter(L=>L.every(([c,r])=>cell(c,r)===e||board[cell(c,r)]===0)).map(sig);
 const beforeP0Charge=charge(completed),p1LateCharge=charge(p1Next);
 board[e]=1;
 assert.deepEqual(ownerCompleted(board,0).map(sig).sort(),completed.slice().sort());
 assert.deepEqual(ownerCompleted(board,1).map(sig).sort(),p1Next.slice().sort());
 const counterfactualSignedCharge=beforeP0Charge.map((v,i)=>v-p1LateCharge[i]);
 assert.deepEqual(counterfactualSignedCharge,charge(completed).map((v,i)=>v-charge(p1Next)[i]));
 for(const k of completed)subsets.p0.add(k);
 for(const k of p1Next)subsets.p1post.add(k);
 for(const k of p0IfWrongOwner)subsets.p0latent.add(k);
 totalP0+=completed.length;totalP1+=p1Next.length;totalLatent+=p0IfWrongOwner.length;
 const rec={
 archiveLineIDs:archivedLabels,
 remainingMove42OneBasedColumn:x+1,remainingMove42OneBasedRow:6,
 p0FirstwinningLines:completed.map(k=>T.get(k)),
 p1ForbiddenMove42Lines:p1Next.map(k=>({
  historicalStrongP0LineID:T.get(k)||null,sites:lines[lineIndex.get(k)].map(([c,r])=>[c+1,r+1])
 })),
 p0OneMissingLinesBlockedByP1On42:p0IfWrongOwner.map(k=>({
  historicalStrongP0LineID:T.get(k)||null,sites:lines[lineIndex.get(k)].map(([c,r])=>[c+1,r+1])
 })),
 p0ChargeAtActualStop:beforeP0Charge,
 chargeDeltaIfForbiddenP1Move42:p1LateCharge.map(v=>-v),
 signedChargeOfHypotheticalCompleted42:counterfactualSignedCharge
 };
 records.push(rec);
 sourceEventMatrix.push(lines.map(L=>+(p1Next.includes(sig(L)))));
}
function modRank(src,p=1009){
 if(!src.length)return 0;
 const A=src.map(a=>a.map(x=>((x%p)+p)%p));
 const pow=(a,k)=>{let v=1;while(k){if(k%2)v=v*a%p;a=a*a%p;k=Math.floor(k/2)}return v};
 let n=0;
 for(let col=0;col<A[0].length&&n<A.length;col++){
  let idx=n;while(idx<A.length&&!A[idx][col])idx++;
  if(idx===A.length)continue;
  [A[idx],A[n]]=[A[n],A[idx]];
  const inv=pow(A[n][col],p-2);
  for(let j=col;j<A[n].length;j++)A[n][j]=A[n][j]*inv%p;
  for(let i=n+1;i<A.length;i++){const v=A[i][col];if(v)
   for(let j=col;j<A[i].length;j++)A[i][j]=((A[i][j]-v*A[n][j])%p+p)%p;}
  n++;
 }
 return n;
}
const spanRank=keys=>modRank([...keys].map(k=>lines[lineIndex.get(k)].reduce((v,[c,r])=>(v[cell(c,r)]=1,v),Array(W*H).fill(0))));
const ranks=[1009,101].map(prime=>{
 const rankK=(arr)=>{const m=[...arr].map(k=>lines[lineIndex.get(k)].reduce((v,[c,r])=>(v[cell(c,r)]=1,v),Array(W*H).fill(0)));return modRank(m,prime)};
 return {prime,T28rank:rankK(T.keys()),
  TPlusActualForbiddenPostP1Rank:rankK(new Set([...T.keys(),...subsets.p1post]))};
});
assert(ranks.every(x=>x.T28rank===26&&x.TPlusActualForbiddenPostP1Rank===27));
const selected=new Set(T.keys());
const actualTPlusP1=new Set([...selected,...subsets.p1post]);
const first5P0=new Set([[3,0],[3,2],[3,4]].map(([c,r])=>cell(c,r)));
const upper42P1=lines.filter(L=>L.some(([c,r])=>r===5)&&!L.some(([c,r])=>first5P0.has(cell(c,r))));
const geomTPlusP1=new Set([...selected,...upper42P1.map(sig)]);
assert.equal(upper42P1.length,14);
assert.equal(geomTPlusP1.size,30);
assert.equal(actualTPlusP1.size,29);
assert.equal(spanRank(geomTPlusP1),28);
assert.equal(spanRank(actualTPlusP1),27);
const complete={
 schema:1,date:'2026-10-20',scope:'true original7x6 K4, archived 28 strong-optimal 41-ply witness entries / 27 distinct words, no exhaustive census of ALL strong-optimal histories',
 countHistories:records.length,
 oneAvailablePhysicalMoveAfterPly41:true,
 uniqueActualP0FirstwinnerOriginalLines:subsets.p0.size,
 actualP0FirstwinnerLineEvents:totalP0,
 hypothetical42P1WinHistoryCount:records.filter(x=>x.p1ForbiddenMove42Lines.length>0).length,
 hypothetical42P1WinEvents:totalP1,
 uniqueForbiddenP1Lines:subsets.p1post.size,
 forbiddenP1LinesInsideHistoricalT:([...subsets.p1post].filter(k=>selected.has(k))).length,
 forbiddenP1LinesOutsideHistoricalT:([...subsets.p1post].filter(k=>!selected.has(k))).length,
 possibleP0LastEmptyTargetsButWrongTurnEvents:totalLatent,
 uniqueP0LastEmptyTargets:subsets.p0latent.size,
 uniqueP0LastEmptyTargetsOutsideT:[...subsets.p0latent].filter(k=>!selected.has(k)).length,
 p1PostWinMatrixRankQ:modRank(sourceEventMatrix),
 actualTPlusPostP1Union:{labels:actualTPlusP1.size,incidenceRank:spanRank(actualTPlusP1),
 signedLineSyzygyDimension:actualTPlusP1.size-spanRank(actualTPlusP1)},
 geometricP1Move42UpperEnvelope:{
 originalWindowCount:upper42P1.length,
 historicallySelectedOverlap:upper42P1.filter(L=>selected.has(sig(L))).length,
 outsideSelected:upper42P1.filter(L=>!selected.has(sig(L))).map(L=>L.map(([c,r])=>[c+1,r+1])),
 TPlusEnvelopeLabelUnion:geomTPlusP1.size,
 TPlusEnvelopeSiteIncidenceRank:spanRank(geomTPlusP1),
 TPlusEnvelopeLineSyzygyDimension:geomTPlusP1.size-spanRank(geomTPlusP1)
 },
 rankControls:ranks,
 perDistinctHistory:records,
 limits:[
  'hypothetical move42 is ILLEGAL after P0 firstwins at41, though it is the only remaining gravity landing',
  'P1 can own the last site and potentially complete lines; P0 cannot gain new stones on move42',
  '28 historical line labels and31 source rational incidence kernel DIMENSIONS are not same-type counts',
  'the archive contains one selected witness per 28 historical line labels, not every possible strong-optimal history',
  'additional unseen P1 postwinner lines could occur on other strong-optimal histories; static upper14 is conditioned on center prefix',
  'No root perfect-play nonbranching WDL derived or qualified gameplay/solver change'
 ]};
process.stdout.write(JSON.stringify(complete,null,2)+'\n');

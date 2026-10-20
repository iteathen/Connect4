// Reproducible source-to-held-back validation, ORIGINAL 7x6 K4.
// Input 69 physical lines is constructed without optimal labels. The historical T28
// fixture is used ONLY for a separate diagnostic after source identities freeze.
// No minimax, oracle outcomes, strategic future q values, or production changes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const W=7,H=6, dirs=[[1,0],[0,1],[1,1],[1,-1]];
const at=(c,r)=>r*W+c, pkey=L=>L.slice().sort((a,b)=>a-b).join(',');
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
 const loc=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
 if(loc.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
  lines.push(loc.map(([x,y])=>at(x,y)));
}
assert.equal(lines.length,69);
const originalSet=new Set(lines.map(pkey));
const triples=[[0,1,2],[0,1,3],[0,2,3],[1,2,3]];
const endpointTriples=new Map();
for(const L of lines)for(const mid of [1,2]){
 const k=pkey([L[0],L[mid],L[3]]);
 endpointTriples.set(k,(endpointTriples.get(k)||0)+1);
}
assert(lines.every(L=>[1,2].every(mid=>endpointTriples.get(pkey([L[0],L[mid],L[3]]))===1)));
const fixture=JSON.parse(readFileSync(new URL('../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',import.meta.url),'utf8'));
const ws=fixture.witnesses, T=ws.map(w=>w.cells.map(([c,r])=>at(c,r)));
assert.equal(ws.length,28);
assert(T.every(L=>originalSet.has(pkey(L))));
function powmod(a,n,p){let v=1;while(n){if(n%2)v=v*a%p;a=a*a%p;n=Math.floor(n/2)}return v}
function rankmod(mat,p=1009){
 const A=mat.map(r=>r.map(v=>(v%p+p)%p)), rows=A.length,cols=A[0].length;
 let rank=0;
 for(let c=0;c<cols&&rank<rows;c++){
  let k=rank;while(k<rows&&!A[k][c])k++;
  if(k===rows)continue;
  [A[rank],A[k]]=[A[k],A[rank]];
  const inv=powmod(A[rank][c],p-2,p);
  for(let j=c;j<cols;j++)A[rank][j]=A[rank][j]*inv%p;
  for(let i=rank+1;i<rows;i++)if(A[i][c]){
   const t=A[i][c];
   for(let j=c;j<cols;j++)A[i][j]=(A[i][j]-t*A[rank][j]%p+p)%p;
  }
  rank++;
 }
 return rank;
}
const incidence=L=>Array.from({length:W*H},(_,e)=>L.map(line=>+(line.includes(e))));
const rank69=rankmod(incidence(lines)),rank28=rankmod(incidence(T));
assert.equal(rank69,38);assert.equal(rank28,26);
const coeffMaps=[
 new Map([[34,-1],[35,1],[37,1],[43,-1],[53,-1],[58,1]]),
 new Map([[13,1],[14,-1],[27,1],[28,-1],[61,-1],[62,1]])
];
const Z=coeffMaps.map(m=>ws.map(w=>m.get(w.lineId)||0));
for(const z of Z)for(const row of incidence(T))
 assert.equal(row.reduce((a,b,i)=>a+b*z[i],0),0);
const cubicCoeff=z=>{
 const m=new Map();
 for(let i=0;i<T.length;i++)if(z[i]){
  for(const tr of triples){
   const k=pkey(tr.map(j=>T[i][j]));
   m.set(k,(m.get(k)||0)+z[i]);
  }
 }
 return new Map([...m].filter(([k,v])=>v!==0));
};
const cubic=Z.map(cubicCoeff);
assert(cubic.every(m=>m.size===18));
// Local ternary Fourier copy tensor: a=EMPTY/P0/P1 => 27 charge tuples.
let localChargeTuples=0,localFixedByReflection=0;
for(let kh=0;kh<3;kh++)for(let kv=0;kv<3;kv++)
for(let kr=0;kr<3;kr++)for(let kf=0;kf<3;kf++){
 if((kh+kv+kr+kf)%3===0){localChargeTuples++;if(kr===kf)localFixedByReflection++;}
}
assert.equal(localChargeTuples,27);assert.equal(localFixedByReflection,9);
const localEven=(localChargeTuples+localFixedByReflection)/2,localOdd=(localChargeTuples-localFixedByReflection)/2;
assert.deepEqual([localEven,localOdd],[18,9]);
// χ_1,χ_2 are ternary characters. Check original occupancy and signed contrast.
const w=Math.cos(2*Math.PI/3),i=Math.sin(2*Math.PI/3);
for(let a=0;a<3;a++){
 const ca=Math.cos(2*Math.PI*a/3),sa=Math.sin(2*Math.PI*a/3);
 const cb=Math.cos(4*Math.PI*a/3),sb=Math.sin(4*Math.PI*a/3);
 const occ=(2-ca-cb)/3,sigma=(sa-sb)/Math.sqrt(3);
 assert(Math.abs(occ-(a===0?0:1))<1e-12);
 assert(Math.abs(sigma-(a===0?0:a===1?1:-1))<1e-12);
}
const siteF=[];
for(let c=0;c<W;c++)for(const r of [4,5])if(!(c===3&&r===4))siteF.push(at(c,r));
const F=new Set(siteF);
const Edges=[];
for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++)
 if(T[i].some(e=>F.has(e)&&T[j].includes(e)))Edges.push([i,j]);
assert.equal(Edges.length,102);
const adjacency=Array.from({length:T.length},()=>[]);
for(const [i,j] of Edges){adjacency[i].push(j);adjacency[j].push(i)}
const seen=new Set([0]),queue=[0];
for(let q=0;q<queue.length;q++)for(const j of adjacency[queue[q]])if(!seen.has(j)){seen.add(j);queue.push(j)}
assert.equal(seen.size,28);
const dP=Edges.map(([i,j])=>Array.from({length:W*H},(_,e)=>+(T[j].includes(e))-+(T[i].includes(e))));
assert.equal(rankmod(dP),25);
const reflect=L=>pkey(L.map(e=>at(W-1-(e%W),Math.floor(e/W))));
const index=new Map(T.map((L,i)=>[pkey(L),i]));
const J=T.map(L=>index.get(reflect(L)));
assert(J.every(x=>Number.isInteger(x)));
assert(J.every((x,i)=>x!==i&&J[x]===i));
let reflectionPairs=0;for(let i=0;i<J.length;i++)if(i<J[i])reflectionPairs++;
assert.equal(reflectionPairs,14);
assert.equal(localEven,18);assert.equal(localOdd,9);
const reflectZ=z=>{let v=Array(z.length).fill(0);for(let i=0;i<z.length;i++)v[J[i]]=z[i];return v};
assert(reflectZ(Z[0]).every((x,i)=>x===Z[1][i] || x===-Z[1][i]));
const chargeOf=(board,z)=>{
 let direct=0,cubicOccupied8=0,vacancy8=0;
 const s=e=>board[e]===0?1:board[e]===1?-1:0;
 const occ=e=>+(board[e]>=0);
 for(let j=0;j<T.length;j++)if(z[j]){
  const L=T[j],co=z[j];
  direct+=co*(+(L.every(e=>board[e]===0))-+(L.every(e=>board[e]===1)));
  for(let miss=0;miss<4;miss++){
   const rem=L.filter((_,k)=>k!==miss);
   cubicOccupied8+=co*rem.reduce((v,e)=>v*s(e),1)*occ(L[miss]);
   vacancy8+=co*s(L[miss])*(rem.reduce((v,e)=>v*occ(e),1)-1);
  }
 }
 assert.equal(8*direct,cubicOccupied8+vacancy8);
 return {direct,cubic8:cubicOccupied8,vacancy8};
};
const terminal=[];
for(const entry of ws){
 const board=Array(W*H).fill(-1),heights=Array(W).fill(0);
 const hist=entry.movesZeroBased;assert.equal(hist.length,41);
 let preterminal=0;
 for(let ply=0;ply<hist.length;ply++){
  const c=+hist[ply];assert(c>=0&&c<W&&heights[c]<H);
  const e=at(c,heights[c]++);
  board[e]=ply%2;
  if(lines.some(L=>L.every(x=>board[x]===ply%2))){
   if(ply!==40)preterminal++;
  }
 }
 assert.equal(preterminal,0);
 assert.equal(board.filter(x=>x===-1).length,1);
 const c=Z.map(z=>chargeOf(board,z));
 terminal.push({lineId:entry.lineId,charges:c.map(x=>x.direct),
  cubic8:c.map(x=>x.cubic8),vacancy8:c.map(x=>x.vacancy8)});
}
assert.equal(terminal.filter(x=>x.charges.some(v=>v)).length,11);
assert.equal(terminal.filter(x=>x.vacancy8.some(v=>v)).length,21);
let seed=0x73124d56,randomBinaryChecked=0;
for(let it=0;it<512;it++){
 const board=Array.from({length:W*H},()=>{
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>31?0:1;
 });
 for(const z of Z){
  const x=chargeOf(board,z);
  assert.equal(x.vacancy8,0);
  assert.equal(8*x.direct,x.cubic8);
 }
 randomBinaryChecked++;
}
const summary={
schema:1,date:'2026-10-20',scope:'ORIGINAL 7x6 K4; 69 source lines before held-back T28',
verified:{originalWinlines:lines.length,sourceIncidenceRankMod1009:rank69,
 sourceSyzygyNullityFromPriorExactQProof:69-rank69,
endpointPlusInteriorUniqueTriplesForAllLines:69*2,
localTernaryNonzeroChargeTuples:localChargeTuples,localReflectionFixedTuples:localFixedByReflection,
localEvenOdd:[localEven,localOdd],
heldBackTerminalLineCount:ws.length,heldBackIncidenceRankMod1009:rank28,
heldBackSignedIncidenceSyzygies:2,
heldBackCubicFourierNonzeroWalshTerms:cubic.map(x=>x.size),
heldBackJunctionEdges:Edges.length,heldBackGraphCoboundaryRank:seen.size-1,
heldBackAdditivePhysicalGradientRankMod1009:rankmod(dP),
heldBackExtraRelativeModes:2,
heldBackReflectionLinePairs:reflectionPairs,heldBackRelativeEvenOdd:[13,14],
genuineFirstwinWitnesses:terminal.length,
terminalWitnessesNonzeroSyzygyCharges:terminal.filter(x=>x.charges.some(v=>v)).length,
terminalWitnessesNonzeroVacancyCorrection:terminal.filter(x=>x.vacancy8.some(v=>v)).length,
independentFullyOccupiedRandomBinaryChecks:randomBinaryChecked},
terminalExamples:terminal.filter(x=>x.charges.some(v=>v)).slice(0,12),
limits:['held-back T28 conditional on historical strong-optimal source','27 local Fourier tuples NOT intrinsically 27 terminal graph gradient modes','pure cubic identity applies to fully occupied binary board; real firstwinner needs vacancy correction','no WDL oracle or minimax in experiment']};
process.stdout.write(JSON.stringify(summary,null,2)+'\n');

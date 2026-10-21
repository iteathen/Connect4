// Research-only Connect4 ORIGINAL 7x6 K4 PERFECT-PLAY historic-boundary audit.
// Source geometry FIRST; known first-five-center/ply41 assumption is explicitly
// conditional and NOT derived as root-perfect-play strategy.
// Historical 28 per-line strong witnesses are loaded LAST as held-out control.
// No future-game WDL recursion, Oracle calls, solver mutations, or nonperfect
// P1 terminal trajectories as first-player-perfect-play counterexamples.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const W=7,H=6,DIR=[[1,0],[0,1],[1,1],[1,-1]];
const at=(c,r)=>r*W+c, key=a=>a.slice().sort((x,y)=>x-y).join(',');
const L=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of DIR){
 const cells=Array.from({length:4},(_,i)=>at(c+dc*i,r+dr*i));
 if(Array.from({length:4},(_,i)=>[c+dc*i,r+dr*i]).every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))L.push(cells);
}
assert.equal(L.length,69);
const index=new Map(L.map((v,i)=>[key(v),i]));
function rank(matrix,p=1013){
 if(!matrix.length)return 0;
 const A=matrix.map(v=>v.map(x=>(x%p+p)%p)),m=A.length,n=A[0].length;
 const pow=(x,t)=>{let z=1;while(t){if(t%2)z=z*x%p;x=x*x%p;t=Math.floor(t/2)}return z};
 let k=0;
 for(let c=0;c<n&&k<m;c++){
  let i=k;while(i<m&&!A[i][c])i++;
  if(i===m)continue;
  [A[k],A[i]]=[A[i],A[k]];
  const inv=pow(A[k][c],p-2);
  for(let j=c;j<n;j++)A[k][j]=A[k][j]*inv%p;
  for(let i=k+1;i<m;i++)if(A[i][c]){
   const fac=A[i][c];
   for(let j=c;j<n;j++)A[i][j]=(A[i][j]-fac*A[k][j]%p+p)%p;
  }
  k++;
 }
 return k;
}
const makeMatrix=inds=>inds.map(i=>Array.from({length:W*H},(_,s)=>+L[i].includes(s)));
const fullRank=rank(makeMatrix(Array.from(L,(_,i)=>i)));
assert.equal(fullRank,38);
// Four-step difference cycles from ALL original source ribbons.
const edges=[];
for(const [dc,dr] of DIR)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 if(c-dc>=0&&c-dc<W&&r-dr>=0&&r-dr<H)continue;
 let x=c,y=r,walk=[];
 while(x>=0&&x<W&&y>=0&&y<H){walk.push(at(x,y));x+=dc;y+=dr}
 const ids=Array.from({length:Math.max(0,walk.length-3)},(_,i)=>index.get(key(walk.slice(i,i+4))));
 for(let i=0;i+1<ids.length;i++)edges.push({u:walk[i],v:walk[i+4],a:ids[i],b:ids[i+1]});
}
assert.equal(edges.length,44);
const adj=Array.from({length:42},()=>[]);
function path(src,dest){
 let seen=new Set([src]),par=new Map,queue=[src];
 for(let i=0;i<queue.length;i++){
  const x=queue[i];if(x===dest)break;
  for(const e of adj[x])if(!seen.has(e.to)){seen.add(e.to);par.set(e.to,{from:x,i:e.i});queue.push(e.to)}
 }
 if(!seen.has(dest))return null;
 let out=[];for(let x=dest;x!==src;){let v=par.get(x);out.push({from:v.from,to:x,index:v.i});x=v.from}
 return out.reverse();
}
const C=[];
for(let j=0;j<edges.length;j++){
 const e=edges[j],walk=path(e.v,e.u);
 if(walk===null){adj[e.u].push({to:e.v,i:j});adj[e.v].push({to:e.u,i:j})}
 else{
  const z=Array(L.length).fill(0);
  z[e.b]++;z[e.a]--;
  for(const step of walk){
   const a=edges[step.index],s=a.u===step.from?1:-1;
   z[a.b]+=s;z[a.a]-=s;
  }
  for(let site=0;site<42;site++)assert.equal(z.reduce((sum,coef,k)=>sum+coef*+L[k].includes(site),0),0);
  C.push(z);
 }
}
assert.equal(C.length,18);assert.equal(rank(C),18);
// Historical strong opening+terminal timing are CONDITIONAL assumptions.
const F=Array.from({length:7},(_,c)=>[4,5].map(r=>at(c,r))).flat().filter(e=>e!==at(3,4));
const FE=new Set(F),centerP1=new Set([at(3,1),at(3,3)]);
const T=L.map((l,i)=>({l,i})).filter(({l})=>l.some(x=>FE.has(x))&&!l.some(x=>centerP1.has(x))).map(({i})=>i);
assert.equal(F.length,13);assert.equal(T.length,28);
const tIdx=new Map(T.map((k,i)=>[key(L[k]),i]));
const other=Array.from({length:69},(_,i)=>i).filter(i=>!T.includes(i));
const CT=C.map(v=>T.map(i=>v[i]));
const J=F.map(e=>T.map(i=>+L[i].includes(e)));
const terminalBipartiteEdges=T.flatMap((ii,i)=>F.filter(e=>L[ii].includes(e)).map(e=>[i,F.indexOf(e)+28]));
assert.equal(terminalBipartiteEdges.length,58);
function graph(n,edges){
 let p=Array.from({length:n},(_,i)=>i);
 function find(i){while(p[i]!==i){p[i]=p[p[i]];i=p[i]}return i}
 for(const [i,j] of edges)p[find(i)]=find(j);
 const components=new Set(p.map((v,i)=>find(i))).size;
 return {vertices:n,edges:edges.length,components,cycleRank:edges.length-n+components};
}
assert.deepEqual(graph(41,terminalBipartiteEdges),{vertices:41,edges:58,components:1,cycleRank:18});
const vals=[2,1009,1013].map(p=>{
 const c=rank(CT,p),j=rank(J,p),both=rank([...CT,...J],p);
 const ot=rank(makeMatrix(other),p),tr=rank(makeMatrix(T),p),all=rank(makeMatrix(Array.from(L,(_,i)=>i)),p);
 const ker=69-all,kernelOther=other.length-ot;
 assert.equal(c,18);assert.equal(j,13);assert.equal(both,28);assert.equal(c+j-both,3);
 assert.equal(28-tr,2);assert.equal(ker-kernelOther,22);
 return {field:p===2?'GF2':'GF'+p,sourceFullKernel:ker,sourceKernelOmittedOnly:kernelOther,
 sourceKernelProjectionT:ker-kernelOther,sourceCycleProjectionT:c,
 landingStarRank:j,combinedTerminalLineSpan:both,
 cycleLandingIntersection:c+j-both,
 T28PhysicalIncidenceRank:tr,omitted41PhysicalIncidenceRank:ot};
});
const rF=e=>at(6-e%W,Math.floor(e/W)),lineIdx=new Map(L.map((l,i)=>[key(l),i]));
const mir=L.map(l=>lineIdx.get(key(l.map(rF))));
const even=rank(C.map(v=>v.map((x,i)=>x+v[mir[i]])),1013);
const odd=rank(C.map(v=>v.map((x,i)=>x-v[mir[i]])),1013);
assert.deepEqual([even,odd],[8,10]);
const fixedLanding=F.filter(e=>rF(e)===e).length;
assert.equal(fixedLanding,1);
// Source-only finite terminal geometry is frozen. Validate historic results afterward:
const archive=JSON.parse(readFileSync(new URL('../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',import.meta.url),'utf8'));
assert.equal(archive.witnesses.length,28);
const historic=new Set(archive.witnesses.map(w=>key(w.cells.map(([c,r])=>at(c,r)))));
assert.deepEqual(new Set(T.map(i=>key(L[i]))),historic);
const unique=new Set(archive.witnesses.map(w=>w.movesZeroBased));assert.equal(unique.size,27);
const frontier=h=>h.map((r,c)=>r<H?at(c,r):-1).filter(x=>x!==-1);
const oneMissing=(board,p)=>{
 const out=new Map;
 for(let i=0;i<L.length;i++){
  let em=-1,cnt=0,blocked=false;
  for(const e of L[i]){
   if(board[e]===1-p){blocked=true;break}
   if(board[e]===-1){em=e;cnt++}
  }
  if(!blocked&&cnt===1){
   if(!out.has(em))out.set(em,[]);
   out.get(em).push(i);
  }
 }
 return out;
};
const anyWin=(board,p)=>L.some(l=>l.every(e=>board[e]===p));
const qRows=[],actionRows=[],targetRows=[],qEdges=[],responseEdges=[],pattern={},types={},cross={};
const summary={historicalWitnesses:archive.witnesses.length,
 uniqueHistoricalWords:unique.size,distinctQ39States:new Set,
 P1LegalResponseChecks:0,P1DirectFirstwinnerCount:0,P1DefenseSafeMoveCount:0,
 P0WinLineUnion:new Set,terminalWinLineEventPossibilities:0};
for(const hist of unique){
 const board=Array(42).fill(-1),h=Array(7).fill(0);
 for(let i=0;i<41;i++){
  const c=Number(hist[i]),s=at(c,h[c]++);
  assert(h[c]<=H);
  board[s]=i%2;
  if(anyWin(board,i%2))assert.equal(i,40);
 }
 const qBoard=Array(42).fill(-1),height=Array(7).fill(0);
 for(let i=0;i<39;i++){
  const c=+hist[i],s=at(c,height[c]++);qBoard[s]=i%2;
  assert.equal(anyWin(qBoard,i%2),false);
 }
 summary.distinctQ39States.add(qBoard.join(','));
 const f=frontier(height),a0=oneMissing(qBoard,0),a1=oneMissing(qBoard,1);
 const t0=f.filter(e=>a0.has(e));assert.equal(f.filter(e=>a1.has(e)).length,0);
 const cap=height.map(h=>H-h).filter(x=>x).sort((a,b)=>b-a).join('+');
 const kind=t0.length>=2?'fork-two-sites':t0.length===1?'single-with-upper-release':'forced-release-only';
 pattern[cap]=(pattern[cap]||0)+1;types[kind]=(types[kind]||0)+1;
 cross[cap+'/'+kind]=(cross[cap+'/'+kind]||0)+1;
 const parentLineIds=new Set;
 for(const e of f){
  const after=qBoard.slice();after[e]=1;
  const hh=height.slice();hh[e%7]++;
  if(anyWin(after,1))summary.P1DirectFirstwinnerCount++;
  const ff=frontier(hh),source=oneMissing(after,0),targets=ff.filter(x=>source.has(x));
  const predicted=new Set([...t0.filter(x=>x!==e),
   ...(e+W<42&&a0.has(e+W)?[e+W]:[])]);
  assert.equal(targets.length,predicted.size);
  assert(targets.every(x=>predicted.has(x)));
  if(targets.length===0)summary.P1DefenseSafeMoveCount++;
  const lineids=[...new Set(targets.flatMap(x=>source.get(x)))].sort((a,b)=>a-b);
  const positions=lineids.map(i=>tIdx.get(key(L[i])));
  assert(positions.every(i=>Number.isInteger(i)));
  positions.forEach(x=>{parentLineIds.add(x);summary.P0WinLineUnion.add(x)});
  const row=Array(28).fill(0);positions.forEach(i=>row[i]=1);actionRows.push(row);
  const tr=Array(42).fill(0);targets.forEach(i=>tr[i]=1);targetRows.push(tr);
  summary.terminalWinLineEventPossibilities+=positions.length;
  for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++)responseEdges.push([positions[i],positions[j]]);
  summary.P1LegalResponseChecks++;
 }
 const row=Array(28).fill(0), ids=[...parentLineIds].sort((a,b)=>a-b);
 ids.forEach(i=>row[i]=1);qRows.push(row);
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)qEdges.push([ids[i],ids[j]]);
}
function distinctEdges(pairs){
 const set=new Set(pairs.map(([a,b])=>Math.min(a,b)+':'+Math.max(a,b)));
 return [...set].map(s=>s.split(':').map(Number));
}
const qGraph=graph(28,distinctEdges(qEdges)),responseGraph=graph(28,distinctEdges(responseEdges));
assert.deepEqual(qGraph,{vertices:28,edges:42,components:1,cycleRank:15});
assert.equal(summary.P1LegalResponseChecks,49);
assert.equal(summary.P1DefenseSafeMoveCount,0);
assert.equal(summary.P1DirectFirstwinnerCount,0);
assert.equal(summary.P0WinLineUnion.size,28);
for(const p of [1009,1013,2]){
 assert.equal(rank(qRows,p),27);
 assert.equal(rank(actionRows,p),28);
 assert.equal(rank(targetRows,p),13);
}
const result={
 schema:1,date:'2026-10-20',
 status:'REPRODUCIBLE_ORIGINAL7x6_SOURCE_FIRST_AND_HISTORICALLY_CONDITIONED_PERFECT_PLAY',
 strictScope:'original 69 K4, physical shared cells, gravity and firstwin; historic five-center and 41st terminal ASSUMED not proven from empty',
 sourceLinear:{
   lines:69,sourceSiteLineRank:fullRank,sourceRationalSyzygies:31,
   fourStepDipoleCycles:18,physicallyEligibleFinalLandingSites:F.length,
   sourceGeneratedTerminalWinningLineIDs:T.length,geometricTerminalLineSiteIncidences:terminalBipartiteEdges.length,
   terminalBipartiteGraph:graph(41,terminalBipartiteEdges),
   rankControls:vals,
   exactTerminalModeIdentity:'28=18 source cycles+13 physical landing-star modes-3 intersection; terminal relative 27 by quotient of one uniform signal',
   horizontalReflection:{sourceCycleEven:even,sourceCycleOdd:odd,
    landingStarEven:(13+fixedLanding)/2,landingStarOdd:(13-fixedLanding)/2,
    cycleStarOverlapEven:even+(13+fixedLanding)/2-14,
    cycleStarOverlapOdd:odd+(13-fixedLanding)/2-14,
    terminalBipartiteCycleEvenOdd:[9,9],
    sourceCycleAndTerminalBipartiteCycleIsomorphismEquivariantlyRuledOut:true}
 },
 historicValidation:{
   archiveWitnessEntries:summary.historicalWitnesses,uniqueHistoryWords:summary.uniqueHistoricalWords,
   distinctRank39Sources:summary.distinctQ39States.size,
   rank39Player1LegalResponseCount:summary.P1LegalResponseChecks,
   rank39Player1ImmediateWins:summary.P1DirectFirstwinnerCount,
   rank39Player1ResponsesThatAvoidImmediateP0Firstwin:summary.P1DefenseSafeMoveCount,
   rank39P0WinningLineUnion:summary.P0WinLineUnion.size,
   rank39P0WinningLineEventPossibilities:summary.terminalWinLineEventPossibilities,
   rank39CapacityPartitions:pattern,rank39DefenseFailureTypes:types,
   crossCapacityVsFailure:cross,
   q39ParentByWinningLineRank:rank(qRows,1013),responseByWinningLineRank:rank(actionRows,1013),
   responseByP0WinningLandingSiteRank:rank(targetRows,1013),
   qCoAlternativeWinningLineGraph:qGraph,responseCoCompletedWinningLineGraph:responseGraph,
   note:'An action row is the union of all original P0 immediate possible FIRSTWINNING line labels over all P0 winning replies to one P1 move40; it need not be a simultaneous one-move terminal event.'
 },
 notEstablished:[
  'Source-only empty-root proof forcing the known five-center opening and ply41 timing',
  '31 source line kernel is not a count of 31 obligations',
  'The source base-gluing13 space is not canonically identified with final landing-site13',
  'Two 18-cycle spaces of differing reflection representations are not equivalent',
  '27 selected archive words do not enumerate the full root-strong game tree',
  'Maintained Node26 CI or external proof assistant result'
 ]
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');

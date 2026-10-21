// Original K4 EMPTY W6H6 vs W7H6 four-ribbon Fourier/phase source controls.
// Research-only: NOT minimax/strategic WDL; no strong28 or solved-root inputs.
// Run with: node verify-empty-six-seven-fourway-phase.mjs
import assert from 'node:assert/strict';
const H=6,D=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
function rank(A,p=1013){
 let M=A.map(a=>a.map(x=>(x%p+p)%p)),r=0;
 const inv=x=>{let a=1,n=p-2;while(n){if(n%2)a=a*x%p;x=x*x%p;n=Math.floor(n/2)}return a};
 for(let c=0;c<M[0].length&&r<M.length;c++){
  let k=r;while(k<M.length&&!M[k][c])k++;if(k===M.length)continue;
  [M[r],M[k]]=[M[k],M[r]];
  let z=inv(M[r][c]);for(let j=c;j<M[r].length;j++)M[r][j]=M[r][j]*z%p;
  for(let i=r+1;i<M.length;i++)if(M[i][c]){let a=M[i][c];for(let j=c;j<M[i].length;j++)M[i][j]=(M[i][j]-a*M[r][j]%p+p)%p}
  r++;
 }return r;
}
const signature=l=>l.d+'|'+l.points.map(([c,r])=>c+':'+r).join(',');
function generate(W){
 const cells=Array.from({length:W*H},(_,i)=>[i%W,Math.floor(i/W)]),lines=[],strands=[],edges=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [d,dc,dr] of D){
  const points=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(points.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))lines.push({d,points});
 }
 for(const [d,dc,dr] of D)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
  if(c-dc>=0&&c-dc<W&&r-dr>=0&&r-dr<H)continue;
  let path=[];for(let x=c,y=r;x>=0&&x<W&&y>=0&&y<H;x+=dc,y+=dr)path.push([x,y]);
  strands.push({d,path});
  for(let i=0;i+4<path.length;i++)edges.push([path[i][1]*W+path[i][0],path[i+4][1]*W+path[i+4][0]]);
 }
 const mat=lines.map(l=>cells.map(([c,r])=>+l.points.some(([x,y])=>x===c&&y===r)));
 const rq=rank(mat,1013),rb=rank(mat,2),parent=Array.from({length:W*H},(_,i)=>i);
 const root=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x]}return x};
 for(const [a,b] of edges)parent[root(a)]=root(b);
 const comps=new Set(parent.map((_,i)=>root(i))).size;
 assert.equal(comps,16);
 return {W,H,cells:W*H,lines,strands,edges,mat,rq,rb,components:comps,
  cycles:edges.length-W*H+comps,syzygies:lines.length-rq,active:strands.filter(s=>s.path.length>=4).length};
}
function bad(e,j){return(1+e[j]*e[j+2])*(1+e[j+1]*e[j+3])/4}
function phase(g){
 let safe=0,checks=0,mismatch=0,spectrum={};
 for(let bits=0;bits<2**g.W;bits++){
  const epsilon=Array.from({length:g.W},(_,c)=>((bits>>c)&1)?1:-1);
  const owner=(c,r)=>(epsilon[c]===1?0:1)^(r%2);
  let bads=0;
  for(let j=0;j<g.W-3;j++){
   const L=g.lines.filter(l=>l.d!=='V'&&l.points[0][0]===j);
   assert.equal(L.length,12);
   const mono=L.filter(l=>l.points.every(([c,r])=>owner(c,r)===owner(...l.points[0]))).length;
   if(mono!==6*bad(epsilon,j))mismatch++;
   bads+=bad(epsilon,j);checks++;
  }
  for(const l of g.lines.filter(l=>l.d==='V'))assert(!l.points.every(([c,r])=>owner(c,r)===owner(...l.points[0])));
  if(bads===0)safe++;
  spectrum[bads]=(spectrum[bads]||0)+1;
 }
 assert.equal(mismatch,0);assert.equal(safe,g.W===6?32:52);
 return {assignments:2**g.W,safeProfiles:safe,
  checkedPhysicalFourColumnSpanProjectors:checks,mismatches:mismatch,badSpanHistogram:spectrum};
}
function matching(W){
 const m=W-2,sets=[],cs=[];
 for(let i=0;i<W-3;i++)cs.push(['cover',i]);
 for(let i=0;i<W-4;i++)cs.push(['no-reuse',i]);
 const satisfies=(x,c)=>c[0]==='cover'?x[c[1]]||x[c[1]+1]:!(x[c[1]]&&x[c[1]+2]);
 for(let mask=0;mask<2**m;mask++){
  let a=Array.from({length:m},(_,i)=>(mask>>i)&1);
  const disjoint=cs.filter(c=>c[0]==='no-reuse').every(c=>satisfies(a,c));
  if(!disjoint)continue;
  let omitted=cs.filter(c=>c[0]==='cover'&&!satisfies(a,c)).map(c=>c[1]);
  sets.push({a,omitted});
 }
 const best=Math.min(...sets.map(x=>x.omitted.length));
 const complete=sets.filter(x=>!x.omitted.length);
 const opt=sets.filter(x=>x.omitted.length===best);
 const sample=W===6?sets.find(x=>x.a.join('')==='0110'):sets.find(x=>x.a.join('')==='11001');
 assert(sample);assert.equal(best,W===6?0:1);assert.equal(complete.length,W===6?1:0);
 let valid=0,unsafe=0;
 for(let bits=0;bits<2**W;bits++){
  const e=Array.from({length:W},(_,i)=>(bits>>i)&1?1:-1);
  if(!sample.a.every((v,i)=>!v||e[i]!==e[i+2]))continue;
  valid++;
  unsafe+=+Array.from({length:W-3},(_,j)=>bad(e,j)).some(Boolean);
 }
 assert.equal(valid,16);assert.equal(unsafe,W===6?0:4);
 let minimalUnsat=null;
 if(W===7){
  const hasSolution=constraints=>Array.from({length:2**m},(_,v)=>Array.from({length:m},(_,i)=>(v>>i)&1)).some(a=>constraints.every(c=>satisfies(a,c)));
  assert(!hasSolution(cs));
  minimalUnsat=cs.map((constraint,i)=>({constraint,satisfiableWhenDropped:hasSolution(cs.filter((_,j)=>j!==i))}));
  assert(minimalUnsat.every(x=>x.satisfiableWhenDropped));
 }
 return {candidatePairs:m,disjointConfigurations:sets.length,
  completedProtectiveMatchings:complete.length,
  minimumUnprotectedWindowCount:best,optimalMatchings:opt.length,
  examplePairSelectionIndicesZeroBased:sample.a.flatMap((v,i)=>v?[i]:[]),
  exampleUnprotectedWindowStartsZeroBased:sample.omitted,
  sourcePhaseOrientationsMatchingExample:valid,orientationsProducingUnsafeWindow:unsafe,
  minimalSevenClauseUNSATVerification:minimalUnsat};
}
function fourWay(){
 const w=Array.from({length:3},(_,n)=>[Math.cos(n*2*Math.PI/3),Math.sin(n*2*Math.PI/3)]);
 let actual=[0,0,0],sumAllowed=0,sumCanceled=0,error=0;
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)for(let d=0;d<3;d++){
  const q=(a+b+c+d)%3;
  let re=0,im=0;
  for(let s=0;s<3;s++){
   const [x,y]=w[(s*q)%3];actual[s]+=+(Math.hypot(x,y)/9>1e-12);
   re+=x/9;im+=y/9;
  }
  const amp=Math.hypot(re,im);error=Math.max(error,Math.abs(amp-(q===0?1/3:0)));
  if(amp>1e-12)sumAllowed++;else sumCanceled++;
 }
 assert.deepEqual(actual,[81,81,81]);assert.equal(sumAllowed,27);assert.equal(sumCanceled,54);assert(error<1e-12);
 return {knownEMPTYNonzero:actual[0],knownP0Nonzero:actual[1],knownP1Nonzero:actual[2],
  knownStateFourLegAmplitude:1/9,
  unweightedThreeStateCopyNonzero:sumAllowed,unweightedThreeStateCopyCanceled:sumCanceled,
  difference:'known EMPTY has full81 Fourier support; owner-summed COPY has27 support and54 exact zeros'};
}
function walsh(){
 const coeff=[];
 for(let S=0;S<16;S++){
  let sum=0;
  for(let x=0;x<16;x++){
   const e=Array.from({length:4},(_,i)=>(x>>i)&1?1:-1);
   const character=e.reduce((v,bit,i)=>v*((S>>i)&1?bit:1),1);
   sum+=bad(e,0)*character;
  }
  if(sum)coeff.push({frequencySubset:Array.from({length:4},(_,i)=>((S>>i)&1)?i:null).filter(i=>i!==null),coefficient:sum/16});
 }
 assert.equal(coeff.length,4);assert(coeff.every(x=>x.coefficient===0.25));
 return coeff;
}
const six=generate(6),seven=generate(7);
const old=new Set(six.lines.map(signature)),oldCols=seven.lines.map((l,i)=>old.has(signature(l))?i:null).filter(i=>i!==null);
const novel=seven.lines.map((l,i)=>!old.has(signature(l))?i:null).filter(i=>i!==null);
const newH=novel.filter(i=>seven.lines[i].d==='H');
assert.equal(oldCols.length,54);assert.equal(novel.length,15);assert.equal(newH.length,6);
assert.equal(rank(oldCols.map(i=>seven.mat[i])),32);
assert.equal(rank([...oldCols,...newH].map(i=>seven.mat[i])),38);
const metadata=[six,seven].map(g=>({
 W:g.W,H:g.H,physicalJunctions:g.cells,unfoldedStrands:g.strands.length,
 K4ActiveStrands:g.active,fourfoldAliases:4*g.cells,
 originalK4LineCount:g.lines.length,orientations:Object.fromEntries(D.map(([v])=>[v,g.lines.filter(l=>l.d===v).length])),
 physicalIncidenceRankOverQ:g.rq,sourceRationalLineSyzygies:g.syzygies,
 physicalIncidenceRankGF2:g.rb,sourceBinaryLineSyzygies:g.lines.length-g.rb,
 fourStepDipoleEdges:g.edges.length,sourceFourStepCycleDimension:g.cycles,
 sourceBaseGluingRelationDimension:g.syzygies-g.cycles,
 commonColumnsInEveryFourSpanOneBased:Array.from({length:g.W-3},(_,j)=>Array.from({length:4},(_,i)=>j+i+1)).reduce((a,b)=>a.filter(c=>b.includes(c))),
 phaseStudy:phase(g),matchings:matching(g.W)
}));
assert.deepEqual(metadata.map(x=>x.sourceRationalLineSyzygies),[22,31]);
assert.deepEqual(metadata.map(x=>x.sourceFourStepCycleDimension),[12,18]);
const results={
 schema:1,date:'2026-10-20',status:'SOURCE_ONLY_TRUE_K4_FOURWAY_FOURIER_WALSH_WIDTH6_WIDTH7_BOUNDARY',
 knownJunctionStateVsUnweightedOwnerCopy:fourWay(),
 fourColumnWalshProjector:walsh(),
 boards:metadata,
 widthExtension:{
 embeddedOriginal6x6WindowLabels:54,new7thColumnTruePhysicalSites:6,
 additionalOriginalK4Windows:15,
 additionalByOrientation:Object.fromEntries(D.map(([v])=>[v,novel.filter(i=>seven.lines[i].d===v).length])),
 rationalPhysicalRankGrowth:38-32,
 exactNineNewSourceRelations:seven.syzygies-six.syzygies,
 additionalFourStepCycles:seven.cycles-six.cycles,
 additionalBaseGluing:seven.syzygies-seven.cycles-(six.syzygies-six.cycles),
 canonicalQuotient:'ker(B7)/embedded ker(B6) has dimension9; coordinates are coefficients on the 3 new V+3 new rising+3 new falling K4 windows since the 6 new horizontal windows already lift site-rank to38.'
 },
 proofBoundary:[
  'The width7 minimum UNSAT core covers only fixed disjoint distance-two opposite-phase defender commitments in a vertically alternating complete owner-coloring potentiality sector.',
  'No universal online P1 adversarial defense impossibility proved for W7.',
  'Width6 source prior Allis center-two legal responder proves P1 can prevent P0 WIN, but does not prove P1 forces WIN.',
  'No Oracle or historic28 line labels used as input; external W6 P1 WIN and W7 P0 WIN table remains held-back consistency check.'
 ]
};
process.stdout.write(JSON.stringify(results,null,2)+'\n');

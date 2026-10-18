// Actual W=7,H=6,K=4 source-GEOMETRY-only control of the owner's
// relative-frontier height gradient and diagonal virtual shear proposal.
// Frozen before running: no gameplay continuations, minimax, QBF, solved
// values, or strategic future evaluations. All 7^7 gravity height vectors
// include colored-history-unrealizable configurations as STATIC overapprox.
const W=7,H=6,K=4,dir=[[1,0,'horizontal'],[0,1,'rising'],[0,-1,'falling']];
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 for(const [dx,dy,name] of [[1,0,'horizontal'],[0,1,'vertical'],[1,1,'rising'],[1,-1,'falling']]){
  const ce=c+(K-1)*dx,re=r+(K-1)*dy;
  if(ce>=W||re<0||re>=H)continue;
  const cells=Array.from({length:K},(_,i)=>[c+i*dx,r+i*dy]);
  lines.push({name,cells});
 }
}
const counts={horizontal:0,vertical:0,rising:0,falling:0};
for(const line of lines)counts[line.name]++;
if(lines.length!==69||counts.horizontal!==24||counts.vertical!==21||counts.rising!==12||counts.falling!==12)
 throw Error('wrong original 7x6 Connect4 line incidence');
const chart={rising:{real:0,ghost:0,windows:0},falling:{real:0,ghost:0,windows:0}};
for(const [side,mode] of [['rising','plus'],['falling','minus']]){
 for(let u=0;u<W+H-1;u++){
  let cells=[];
  for(let v=0;v<H;v++){
   const c=mode==='plus'?u+v-(H-1):u-v;
   if(c>=0&&c<W){
    chart[side].real++;
    cells.push([c,v]);
   }else{
    chart[side].ghost++;
    cells.push(null);
   }
  }
  for(let k=0;k+K<=H;k++){
   const win=cells.slice(k,k+K);
   if(win.every(Boolean))chart[side].windows++;
  }
 }
}
if(chart.rising.real!==W*H||chart.falling.real!==W*H||
 chart.rising.ghost!==30||chart.falling.ghost!==30||
 chart.rising.windows!==12||chart.falling.windows!==12)
 throw Error('diagonal virtual shear real/ghost window classification false');
let supports=0,gradientIdentity=0,sourceActionGradientUpdates=0,
 futurePhaseBaselineIdentity=0,originalLineNeighborTranslations=0,
 virtualDiagonalWindowChecks=0,wrong=0;
const qh=Array(W).fill(0);
const controls=[];
function check(){
 const h=qh,n=h.reduce((s,x)=>s+x,0);
 const delta=Array.from({length:W-1},(_,c)=>h[c+1]-h[c]);
 const kappa=h.map(z=>(n-z)&1);
 supports++;
 for(let c=0;c<W-1;c++){
  gradientIdentity++;
  if((kappa[c]^kappa[c+1])!==(delta[c]&1))throw Error('gradient phase does not match height parity');
 }
 for(let c=0;c<W;c++){
  for(let r=h[c];r<H;r++){
   const j=r-h[c],lam=(r&1)^kappa[c];
   futurePhaseBaselineIdentity++;
   if(lam!==((n+j)&1))throw Error('row and column phase did not cancel in relative frontier coordinates');
  }
 }
 for(const line of lines){
  for(let i=1;i<line.cells.length;i++){
   const [c,r]=line.cells[i-1],[d,s]=line.cells[i];
   if(d===c){
    if(s-r!==1)throw Error('unexpected vertical K-line neighbor');
    const priorJ=r-h[c],nextJ=s-h[c];
    originalLineNeighborTranslations++;
    if(nextJ!==priorJ+1)throw Error('vertical future ordinal not consecutive');
   }else{
    if(d!==c+1)throw Error('unexpected non-neighbor geometric line');
    const priorJ=r-h[c],nextJ=s-h[d],geometricSlope=s-r;
    originalLineNeighborTranslations++;
    if(nextJ!==priorJ+geometricSlope-delta[c])throw Error('local shear transfer failed');
   }
  }
  if(line.name==='rising'||line.name==='falling'){
   const side=line.name;
   const u0=side==='rising'?
     line.cells[0][0]-line.cells[0][1]+H-1:
     line.cells[0][0]+line.cells[0][1];
   const coords=line.cells.map(([c,r])=>[
     side==='rising'?c-r+H-1:c+r,r
   ]);
   virtualDiagonalWindowChecks++;
   if(coords.some(([u])=>u!==u0))throw Error('original K-diagonal not fixed shear coordinate');
   const v=coords.map(([u,r])=>r).sort((a,b)=>a-b);
   if(v.some((x,i)=>i>0&&x!==v[i-1]+1))throw Error('original K-diagonal not contiguous in virtual shear row coordinate');
  }
 }
 for(let a=0;a<W;a++)if(h[a]<H){
  const later=h.slice();later[a]++;
  const laterDelta=Array.from({length:W-1},(_,c)=>later[c+1]-later[c]);
  for(let c=0;c<W-1;c++){
   sourceActionGradientUpdates++;
   const expected=delta[c]+(a===c+1?1:0)-(a===c?1:0);
   if(laterDelta[c]!==expected)throw Error('local update changed non-neighbor height-gradient interface');
  }
 }
}
function rec(c){
 if(c===W){check();return;}
 for(let height=0;height<=H;height++){qh[c]=height;rec(c+1);}
}
rec(0);
const output={
 schema:'connect4.standard7x6.relative_frontier_gradient_virtual_shear_v0_1',
 date:'2026-10-17',geometry:{W,H,K},sourceStatus:'STATIC_GEOMETRY_CONTROL_ALL_GRAVITY_HEIGHT_VECTORS_NO_GAME_VALUES',
 originalGeometricKLines:lines.length,lineCounts:counts,
 virtualShearChart:chart,allHeightVectorsChecked:supports,
 gradientParityIdentityChecks:gradientIdentity,
 sourceLegalActionLocalGradientBoundaryComparisons:sourceActionGradientUpdates,
 futureCellsRelativeOrdinalBaselinePhaseChecks:futurePhaseBaselineIdentity,
 allOriginalKLineNeighborOrdinalShiftChecks:originalLineNeighborTranslations,
 diagonalOriginalKWindowVirtualChartChecks:virtualDiagonalWindowChecks,
 mismatchCount:wrong,
 canonical:[{history:'44444',heights:[0,0,0,5,0,0,0],delta:[0,0,5,-5,0,0],gradientGF2:[0,0,1,1,0,0]},
 {history:'444444',heights:[0,0,0,6,0,0,0],delta:[0,0,6,-6,0,0],gradientGF2:[0,0,0,0,0,0]}],
 caveat:'Height profiles may be unreachable with colored first-win history. This is a conservative exhaustive static geometry identity check, NOT a legal source q/WDL test and NOT proof of strategic zero branching.'
};
console.log(JSON.stringify(output));

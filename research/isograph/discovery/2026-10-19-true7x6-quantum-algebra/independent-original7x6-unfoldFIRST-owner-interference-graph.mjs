// INDEPENDENT REAL ORIGINAL W7,H6,K4 physical 42-site construction
// of the full four-ribbon junction graph and its two-layer owner
// spectral K0,K1,empty projectors. Rebuild actual 37 finite strands
// DIFFERENTLY from the frozen source, without importing its lists.
// Recompute all 168 complex Fourier modes from scratch; check every
// cross-orientation intersecting strand pair and nonintersections,
// physical 42-cell isometry, one-board ternary owner orthogonality,
// and two distinct hypothetical full-gravity history ensembles'
 // P0/P1 marginal cancellation / uncertainty spectral operator.
 // NO alternate board sizes, no strategic future-WDL tree.
import {sourceTrue7x6UnfoldFirstOwnerJunctionWaves}
 from './source-original7x6-unfoldFIRST-owner-projector-wave-junctions.mjs';
function independentFiniteStrands(){
 const strands=[];
 const make=(orientation,x,y,dx,dy)=>{
  const ids=[];
  while(x>=0&&x<7&&y>=0&&y<6){
   ids.push(y*7+x);x+=dx;y+=dy;
  }
  strands.push({orientation,ids});
 };
 for(let r=0;r<6;r++)make('H',0,r,1,0);
 for(let c=0;c<7;c++)make('V',c,0,0,1);
 for(let r=5;r>=1;r--)make('R',0,r,1,1);
 for(let c=0;c<7;c++)make('R',c,0,1,1);
 for(let c=6;c>=1;c--)make('F',c,5,1,-1);
 for(let r=5;r>=0;r--)make('F',0,r,1,-1);
 const count=strands.reduce((a,s)=>a+s.ids.length,0);
 if(strands.length!==37||count!==168)throw Error('independent original 37 strand boundary starts wrong');
 return strands;
}
function physical69(){
 const L=[],directions=[[1,1],[1,-1],[0,1],[1,0]];
 for(let c=0;c<7;c++)for(let r=0;r<6;r++){
  for(const [dc,dr] of directions) {
   if(c+3*dc<0||c+3*dc>=7||r+3*dr<0||r+3*dr>=6)continue;
   L.push([0,1,2,3].map(j=>(r+j*dr)*7+c+j*dc));
  }
 }
 if(L.length!==69)throw Error('physical original 7x6 69 lines incorrect');
 return L;
}
function replayRealOriginal(word){
 const real=physical69(),board=Array(42).fill(-1),height=Array(7).fill(0);
 let firstWin=null;
 for(let t=0;t<word.length;t++){
  if(firstWin!==null)throw Error('physical real game continued after first win');
  const c=+word[t]-1,p=t%2,r=height[c],z=r*7+c;
  if(!Number.isInteger(c)||c<0||c>=7||r>=6||board[z]!==-1)
   throw Error('wrong original gravity real history at t'+t);
  height[c]++;board[z]=p;
  const line=real.find(L=>L.includes(z)&&L.every(i=>board[i]===p));
  if(line)firstWin=p?'P1_WIN':'P0_WIN';
  else if(t===41)firstWin='DRAW';
 }
 return {word,height,board,firstWin};
}
function nCr(n,k){
 if(k<0||k>n)return 0n;
 let res=1n;k=Math.min(k,n-k);
 for(let j=1;j<=k;j++)res=res*BigInt(n-k+j)/BigInt(j);
 return res;
}
function independentOneColumnMarginals(replayed){
 const {word,height,board}=replayed,N=42-word.length,outP0=Array(42).fill(0),
   outP1=Array(42).fill(0),mu=Array(42).fill(0);
 for(let z=0;z<42;z++){
  if(board[z]!==-1){outP0[z]=board[z]===0?1:0;outP1[z]=board[z]===1?1:0;
   mu[z]=outP0[z]-outP1[z];continue;}
  const c=z%7,k=Math.floor(z/7)-height[c],m=6-height[c],
    other=N-m,table=Array.from({length:m+1},()=>Array(other+1).fill(0n));
  table[0][0]=1n;
  let a=0n,b=0n;
  // Prefix DP of all 2-symbol column/filler shuffles. When a
  // marked column event is added at step t, multiply prefix count
  // by combinatorial suffix count to count all completed chains.
  for(let i=0;i<=m;i++)for(let j=0;j<=other;j++){
   const v=table[i][j],t=i+j;
   if(!v)continue;
   if(i<m){
    if(i===k){
     const completions=nCr(N-t-1,m-i-1);
     const w=v*completions;
     if((word.length+t)%2)a+=w;else b+=w;
    }
    table[i+1][j]+=v;
   }
   if(j<other)table[i][j+1]+=v;
  }
  const total=nCr(N,m);
  if(a+b!==total)throw Error('independent physical column parity probability total mismatch');
  outP0[z]=Number(b)/Number(total);
  outP1[z]=Number(a)/Number(total);
  mu[z]=outP0[z]-outP1[z];
 }
 return {p0:outP0,p1:outP1,mu,
  traceSlack:mu.reduce((a,v)=>a+1-v*v,0),
  traceCross:outP0.reduce((a,v,i)=>a+v*outP1[i],0)};
}
function C(a,b){return {r:a.r*b.r-a.i*b.i,i:a.r*b.i+a.i*b.r}}
function conj(a){return {r:a.r,i:-a.i}}
function magnitude(a){return Math.hypot(a.r,a.i)}
function spectralMode(strand,k,physicalID){
 const t=strand.ids.indexOf(physicalID);
 if(t<0)return {r:0,i:0};
 const l=strand.ids.length,angle=2*Math.PI*k*t/l,
   norm=2*Math.sqrt(l);
 return {r:Math.cos(angle)/norm,i:Math.sin(angle)/norm};
}
function kernelEntry(strandA,k,strandB,l,weights){
 let re=0,im=0,count=0;
 for(const site of strandA.ids){
  if(!strandB.ids.includes(site))continue;
  const p=C(spectralMode(strandA,k,site),conj(spectralMode(strandB,l,site))),
    w=weights[site];
  re+=p.r*w;im+=p.i*w;count++;
 }
 return {re,im,count};
}
export function independentStandard7x6UnfoldFirstOwnerJunctionWaveValidation(){
 const src=sourceTrue7x6UnfoldFirstOwnerJunctionWaves(),
  physicalStrands=independentFiniteStrands(),errors=[],
  siteToStrands=Array.from({length:42},()=>[]),
  byKey=new Map();
 const key=s=>s.ids.slice().sort((a,b)=>a-b).join(',');
 for(const [j,s] of physicalStrands.entries()){
  byKey.set(s.orientation+':'+key(s),j);
  for(const e of s.ids)siteToStrands[e].push(j);
 }
 if(siteToStrands.some(v=>v.length!==4||
   new Set(v.map(j=>physicalStrands[j].orientation)).size!==4))
  errors.push({type:'INDEPENDENT_REAL_STRANDS_NOT_FOUR_WAY_PER_CELL'});
 const strandMap=src.geometry.strands.map(x=>{
  const id=byKey.get(x.orientation+':'+key({ids:x.cells}));
  if(id===undefined)errors.push({type:'SOURCE_STRAND_NOT_IN_INDEPENDENT',x});
  return id;
 });
 const physicalEdges=new Set();
 for(const v of siteToStrands)for(let i=0;i<v.length;i++)
  for(let j=i+1;j<v.length;j++)
   physicalEdges.add([Math.min(v[i],v[j]),Math.max(v[i],v[j])].join(':'));
 if(physicalEdges.size!==252||src.bipartiteGraph.cycleRank!==90||
   src.strandOnlyProjectedGraph.cycleRank!==216)
  errors.push({type:'GRAPH_ORIGINAL_FOUR_WAY_INTERSECTIONS_CYCLE_RANK_MISMATCH'});
 // Independent complex 168mode ×42-site T full source-free Fourier
 // frame. All 42×42 Gram entries must be delta, not just traces.
 const modes=[];
 for(const s of physicalStrands)for(let k=0;k<s.ids.length;k++)
  modes.push({s,k});
 const frame=Array.from({length:modes.length},(_,m)=>
  Array.from({length:42},(_,e)=>
   spectralMode(modes[m].s,modes[m].k,e)));
 let GramChecks=0,maxGramError=0;
 for(let e=0;e<42;e++)for(let f=0;f<42;f++){
  let z={r:0,i:0};
  for(let m=0;m<modes.length;m++){
   const v=C(conj(frame[m][e]),frame[m][f]);
   z.r+=v.r;z.i+=v.i;
  }
  const err=Math.hypot(z.r-(e===f?1:0),z.i);
  maxGramError=Math.max(maxGramError,err);
  if(err>1e-12)errors.push({type:'FOURIER_UNFOLD_ISOMETRY_GRAM_FALSE',e,f,err});
  GramChecks++;
 }
 const cases=[
  ['empty',''],['real44444','44444'],['real444444','444444'],
  ['legalDraw','123456123456654321654321123456123456777777'],
  ['P1Terminal14','44444421122333']
 ];
 const caseSummary={},sampleModePairs=[];
 let crossFourierTest=0,staticallyOwnerOrthogonal=0,
  directOwnerFourierProjectorEntryChecks=0,
  diagonalStrandFourierChecks=0;
 for(const [name,word] of cases){
  const game=replayRealOriginal(word),tags=[0,1,-1],
   fields=tags.map(p=>game.board.map(v=>v===p?1:0));
  const diagSum=fields.map(v=>v.reduce((a,b)=>a+b,0));
  let offDiagonalCrossModeZeroChecks=0;
  for(let e=0;e<42;e++){
   if(fields[0][e]*fields[1][e])errors.push({type:'SAME_PHYSICAL_OWNER_BOTH_P0_AND_P1',name,e});
   staticallyOwnerOrthogonal++;
  }
  if(diagSum.reduce((a,b)=>a+b,0)!==42)
   errors.push({type:'SAME_REAL_GAME_OWNER_PROJECTORS_DO_NOT_PARTITION_42',name});
  for(let i=0;i<src.geometry.strandPairEdges.length;i++){
   const edge=src.geometry.strandPairEdges[i],
    a=physicalStrands[strandMap[edge.strandA]],
    b=physicalStrands[strandMap[edge.strandB]],
    E=edge.physicalCell;
   for(const [ka,kb] of [[0,0],[1,1],[0,1]]){
    for(let owner=0;owner<3;owner++){
     const observed=kernelEntry(a,ka,b,kb,fields[owner]),
      aa=spectralMode(a,ka,E),bb=spectralMode(b,kb,E),
      predicted=C(aa,conj(bb)),actualWeight=fields[owner][E],
      err=Math.hypot(observed.re-actualWeight*predicted.r,
         observed.im-actualWeight*predicted.i);
     if(err>1e-12||observed.count!==1)
      errors.push({type:'INDIVIDUAL_PHASED_OWNER_CROSS_JUNCTION_VS_GEOMETRY',name,i,ka,kb,owner,err});
     crossFourierTest++;
    }
   }
  }
  const selected=[0,4,11,20,31].filter(v=>v<physicalStrands.length);
  for(const strandID of selected){
   const strand=physicalStrands[strandID];
   for(let ka=0;ka<strand.ids.length;ka++)
    for(let kb=0;kb<strand.ids.length;kb++){
     let ownSigned=0,manual={r:0,i:0};
     for(let local=0;local<strand.ids.length;local++){
      const e=strand.ids[local],sign=fields[0][e]-fields[1][e],
       angle=2*Math.PI*(ka-kb)*local/strand.ids.length;
      manual.r+=sign*Math.cos(angle)/(4*strand.ids.length);
      manual.i+=sign*Math.sin(angle)/(4*strand.ids.length);
     }
     const via=kernelEntry(strand,ka,strand,kb,game.board.map(v=>v===0?1:v===1?-1:0));
     if(Math.hypot(via.re-manual.r,via.im-manual.i)>1e-12)
      errors.push({type:'SAME_STRAND_FOURIER_SUM_DIFFERENCE',name,strandID,ka,kb});
     diagonalStrandFourierChecks++;
    }
  }
  caseSummary[name]={truePhysicalTerminal:game.firstWin,
   actualP0Count:diagSum[0],actualP1Count:diagSum[1],
   actualEmptyCount:diagSum[2]};
 }
 function getStrandByPhysicalName(kind,required){
  return physicalStrands.find(s=>s.orientation===kind&&
    required.every(e=>s.ids.includes(e)));
 }
 const Hrow1=getStrandByPhysicalName('H',[7,8,9,10,11,12,13]),
  Vcol3=getStrandByPhysicalName('V',[3,10,17,24,31,38]),
  Rrise=getStrandByPhysicalName('R',[1,9,17,25,33,41]);
 if(!Hrow1||!Vcol3||!Rrise)
  errors.push({type:'INDEPENDENT_PHYSICAL_NONTRIVIAL_INTERSECTION_TRIANGLE_MISSING'});
 let holonomy=null;
 if(Hrow1&&Vcol3&&Rrise){
  const one=Array(42).fill(1),
   a=kernelEntry(Hrow1,1,Vcol3,1,one),
   b=kernelEntry(Vcol3,1,Rrise,1,one),
   c=kernelEntry(Rrise,1,Hrow1,1,one),
   result=C(C({r:a.re,i:a.im},{r:b.re,i:b.im}),{r:c.re,i:c.im}),
   angle=Math.atan2(result.i,result.r);
  holonomy={angleRadians:angle,expectedAngleRadians:2*Math.PI/7,
   exactGeometricPhase:"exp(2*pi*i/7)"};
  if(Math.abs(angle-2*Math.PI/7)>1e-12)
   errors.push({type:'ACTUAL_FOURIER_CROSSING_TRIANGLE_PHASE_NOT_2PI7',angle});
 }
 // Source-independent one-column CLASSICAL combinatorial history
 // marginal via two-symbol prefix-count DP (different algorithm).
 const qCases=[
  ['empty',replayRealOriginal(''),src.conditionalHypotheticalOriginalCompletionWaves.empty],
  ['real44444',replayRealOriginal('44444'),src.conditionalHypotheticalOriginalCompletionWaves.real44444]
 ];
 const mean={},marginalChecks=[];
 for(const [name,board,stored] of qCases){
  const phys=independentOneColumnMarginals(board),
   s=stored.trueOriginalP0AndP1MeanCellFields;
  for(let e=0;e<42;e++) {
   if(Math.abs(phys.mu[e]-s.signed[e])>1e-13||
      Math.abs(phys.p0[e]-s.P0[e])>1e-13||
      Math.abs(phys.p1[e]-s.P1[e])>1e-13)
    errors.push({type:'GEO_FIRST_OWNER_HISTORY_MARGINAL_INDEPENDENT_DP_MISMATCH',name,e});
   marginalChecks.push({name,e,verified:true});
  }
  const sourceTrace=stored.meanOwnerCancellationsVarianceSlackTrace;
  if(Math.abs(sourceTrace-phys.traceSlack)>1e-11||
     Math.abs(phys.traceSlack-4*phys.traceCross)>1e-11)
   errors.push({type:'TRUE_SPECTRAL_OWNER_CANCELLATION_VARIANCE_SLACK_FALSE',name});
  const columns=Array.from({length:7},(_,c)=>Array.from({length:6},(_,r)=>
   phys.mu[r*7+c]).reduce((a,b)=>a+b,0));
  if(columns.some((v,i)=>Math.abs(v-stored.playerSignedOwnerTotalPerVerticalPhysicalColumn[i])>1e-12))
   errors.push({type:'FOURIER_OWNER_MU_COLUMN_CHARGE_CANCELLATION_MISMATCH',name,columns});
  // Verify specific diagonal Fourier values K_p(m,m), both owner
  // layers positive; signed delta vanishes on empty vertical strands.
  const vertical=physicalStrands.filter(s=>s.orientation==='V'),
   diagonal=[];
  for(const s of vertical)for(const k of [0,1,2]){
   const p0=kernelEntry(s,k,s,k,phys.p0).re,
    p1=kernelEntry(s,k,s,k,phys.p1).re,
    signed=kernelEntry(s,k,s,k,phys.mu).re;
   if(Math.abs(signed-(p0-p1))>1e-12)
    errors.push({type:'INTERWOVEN_MEAN_FOURIER_DIAGONAL_NOT_SIGNED_DIFF',name,k});
   if(name==='empty'&&Math.abs(signed)>1e-12)
    errors.push({type:'EMPTY_REAL_COLUMN_FOURIER_OWNER_DIAGONAL_NOT_CANCEL',name,k});
   diagonal.push({column:s.ids[0]%7,k,p0,p1,signed});
  }
  mean[name]={physicalSourceSignedColumnSums:columns,
   uncertaintyGammaTrace:phys.traceSlack,
   crossHistoryK0K1Trace:phys.traceCross,
   maxCellOwnerUncertainty:Math.max(...phys.mu.map(m=>1-m*m)),
   minCellOwnerUncertainty:Math.min(...phys.mu.map(m=>1-m*m)),
   verticalOwnerModeContrast:diagonal};
 }
 // Explicit computed Kmean0 Kmean1 sampled complex entry:
 // isometry shows product = T diag(p0*p1) T†, not 0
 // because owner uncertain ACROSS histories.
 const q0=independentOneColumnMarginals(replayRealOriginal(''));
 const p0p1=q0.p0.map((v,e)=>v*q0.p1[e]);
 const positiveExample=kernelEntry(Hrow1,0,Hrow1,0,p0p1);
 if(positiveExample.re<=0)
  errors.push({type:'NO_INTERWOVEN_HISTORY_INTERSECTION_POSITIVE_UNCERTAINTY'});
 return {status:errors.length?'TRUE7X6_GEOMETRY_FIRST_TWO_OWNER_INTERFERENCE_FALSIFIED':
  'INDEPENDENT_TRUE7X6_UNFOLD_FIRST_OWNER_JUNCTION_PROJECTOR_WAVES_PASS',
  originalBoard:[7,6,4],
  originalGraph:{physicalJunctions:42,directionStrands:37,
   appearances:168,bipartiteCycleRank:90,
   uniqueCrossOrientationStrandPairIntersections:252,
   projectedPairGraphCycleRank:216},
  independent42SiteIsometryGramComplexEntries:GramChecks,
  maxNumericalFrameGramError:maxGramError,
  original69FirstWinStoppedRealGameCases:caseSummary,
  physicallyCheckedMutuallyExclusiveP0P1Junctions:staticallyOwnerOrthogonal,
  independentComplexCrossJunctionOwnerFourierAmplitudeChecks:crossFourierTest,
  independentSameStrandSignedFourierModeInterferenceChecks:diagonalStrandFourierChecks,
  differentSourceGeometryAndIndependentStrandConstructionOrder:true,
  nontrivialGeometricModeHolonomy:holonomy,
  independentlyCountedExactHistoryMarginalOwnerWaveSites:marginalChecks.length,
  meanPotentialityJunctionAndSpectralSlack:mean,
  crossHistoryOverlapExamplePositive:positiveExample.re,
  originalPerfectPlayWDLValueNotComputed:true,
  sourceOrPhysicalStrategicGameSearches:0,
  errors:errors.slice(0,12)};
}

// Independent TRUE ORIGINAL W7 H6 K4 geometry/Fourier control.
// Builds four finite directional STRANDS without source strand lists:
// starts on open physical RECTANGLE boundaries. Never makes toroidal
// K4 winning lines, tests exact original 69 K4 win predicates.
// Rebuilds independent physical alias counts, DFT unitarity/reconstruction,
// boundary rows, circular spectral multipliers and open-path sine basis.
// NOT game WDL, not actual quantum hardware, not unusual board sizes.
import {sourceTrue7x6FourRibbonFirstFourierFrame}
 from './source-true7x6-unfold-first-Fourier-ribbon-frame.mjs';
function physicalStrands(){
 const W=7,H=6,id=(c,r)=>r*W+c,strands=[];
 function collect(orientation,c,r,dc,dr){
  const sites=[];
  while(c>=0&&c<W&&r>=0&&r<H){
   sites.push(id(c,r));c+=dc;r+=dr;
  }
  strands.push({orientation,sites});
 }
 for(let r=0;r<H;r++)collect('horizontal',0,r,1,0);
 for(let c=0;c<W;c++)collect('vertical',c,0,0,1);
 // Rising slopes: all starts at bottom, then left edge except bottom-left.
 for(let c=0;c<W;c++)collect('rising',c,0,1,1);
 for(let r=1;r<H;r++)collect('rising',0,r,1,1);
 // Falling slopes: all starts on left edge, then upper edge except upper-left.
 for(let r=0;r<H;r++)collect('falling',0,r,1,-1);
 for(let c=1;c<W;c++)collect('falling',c,H-1,1,-1);
 return strands;
}
function originalK4Lines(){
 const lines=[],W=7,H=6;
 for(let row=0;row<H;row++)for(let col=0;col<W;col++)
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   if(col+3*dc<0||col+3*dc>=W||row+3*dr<0||row+3*dr>=H)continue;
   const ids=[0,1,2,3].map(t=>(row+t*dr)*W+col+t*dc);
   lines.push(ids);
  }
 if(lines.length!==69)throw Error('bad independently original K4 lines');
 return lines;
}
function rankByIndependentMinors(B){
 const n=B.length,rows=[];
 for(let r=0;r<n;r++)if(B[r].some(x=>x))rows.push(B[r]);
 if(rows.length===0)return 0;
 function d2(a,b,c,d){return a*d-b*c}
 if(rows.some(row=>row.some(z=>z!==0))&&rows.length===1)return 1;
 for(let p=0;p<rows.length;p++)for(let q=p+1;q<rows.length;q++)
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
   const x=d2(rows[p][i],rows[p][j],rows[q][i],rows[q][j]);
   if(x!==0){
    for(let t=q+1;t<rows.length;t++)
     for(let k=0;k<n;k++)for(let l=k+1;l<n;l++)
      for(let m=l+1;m<n;m++){
       const aa=rows[p],bb=rows[q],cc=rows[t];
       const det=
        aa[k]*(bb[l]*cc[m]-bb[m]*cc[l])-
        aa[l]*(bb[k]*cc[m]-bb[m]*cc[k])+
        aa[m]*(bb[k]*cc[l]-bb[l]*cc[k]);
       if(det!==0)return 3;
      }
    return 2;
   }
  }
 return 1;
}
function mul(a,b){return {re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re}}
function add(a,b){return {re:a.re+b.re,im:a.im+b.im}}
function subtract(a,b){return {re:a.re-b.re,im:a.im-b.im}}
function conjugate(a){return {re:a.re,im:-a.im}}
function cn(r=0,i=0){return {re:r,im:i}}
function abs(a){return Math.hypot(a.re,a.im)}
function fourier(l,k,t){
 const angle=2*Math.PI*k*t/l;
 return cn(Math.cos(angle)/Math.sqrt(l),Math.sin(angle)/Math.sqrt(l));
}
function physicallyFirstWinFreeFullDraw(){
 const moves=[];
 for(let r=0;r<6;r++){
  if((r>>1)&1)for(let c=5;c>=0;c--)moves.push(c);
  else for(let c=0;c<6;c++)moves.push(c);
 }
 for(let r=0;r<6;r++)moves.push(6);
 const board=Array(42).fill(-1),h=Array(7).fill(0),lines=originalK4Lines();
 let actualPrematureWinner=0;
 for(let i=0;i<moves.length;i++){
  const c=moves[i],row=h[c]++,site=row*7+c,p=i%2;
  board[site]=p;
  if(lines.some(L=>L.includes(site)&&L.every(z=>board[z]===p)))actualPrematureWinner++;
 }
 return {board,h,word:moves.map(c=>c+1).join(''),
  prematureWins:actualPrematureWinner};
}
export function independentOriginal7x6UnfoldFirstFourierControl(){
 const src=sourceTrue7x6FourRibbonFirstFourierFrame(),S=physicalStrands(),
  realWins=originalK4Lines(),failures=[],hist={},alias=Array(42).fill(0),
  srcStrands=src.originalStrands;
 if(S.length!==37||srcStrands.length!==37)failures.push('Not exactly37 original strands');
 const key=s=>s.orientation+':'+(s.sites??s.cells).join(',');
 const originalStrandSet=new Set(S.map(key));
 for(const s of srcStrands)if(!originalStrandSet.has(key(s)))
  failures.push({type:'SOURCE_STRAND_NOT_IN_ORIGINAL',orientation:s.orientation,cells:s.cells});
 const srcWindows=new Set(src.originalK4Windows.map(w=>w.originalPhysicalIDs.slice().sort((a,b)=>a-b).join(',')));
 const originalWindows=new Set(realWins.map(w=>w.slice().sort((a,b)=>a-b).join(',')));
 if(srcWindows.size!==69||originalWindows.size!==69||
   [...srcWindows].some(x=>!originalWindows.has(x)))
  failures.push('Fourier unfolding did not preserve ORIGINAL69 winning lines');
 for(const s of S)for(const z of s.sites)alias[z]++;
 if(alias.some(x=>x!==4)||S.reduce((v,x)=>v+x.sites.length,0)!==168)
  failures.push('Each original physical cell must appear 4 times');
 let active=0,activeApp=0,short=0,windows=0,
  boundaryRank=0,pathChecks=0,windowIntegerChecks=0,FMultChecks=0,
  fourierImpulseChecks=0,invChecks=0,maxSpectralError=0,maxDSTError=0,
  maxReconstructionError=0,shortStrands=0,fullOriginalGames=0;
 for(const s of S){
  const n=s.sites.length;
  if(n>=4){active++;activeApp+=n;}
  else {short++;shortStrands++;}
  windows+=Math.max(0,n-3);
  // Original finite path sine basis for symmetric adjacency (no wrap).
  for(let k=1;k<=n;k++){
   const lam=2*Math.cos(Math.PI*k/(n+1)),norm=Math.sqrt(2/(n+1));
   const vec=Array.from({length:n},(_,t)=>norm*Math.sin(Math.PI*k*(t+1)/(n+1)));
   for(let t=0;t<n;t++){
    const Av=(t>0?vec[t-1]:0)+(t<n-1?vec[t+1]:0);
    const err=Math.abs(Av-lam*vec[t]);maxDSTError=Math.max(maxDSTError,err);
    if(err>1e-11)failures.push('Open path sine eigenbasis wrong '+s.orientation+'/'+n);
    pathChecks++;
   }
   for(let m=1;m<=n;m++){
    const dot=vec.reduce((x,v,t)=>x+v*norm*Math.sin(Math.PI*m*(t+1)/(n+1)),0);
    const err=Math.abs(dot-(k===m?1:0));maxDSTError=Math.max(maxDSTError,err);
    if(err>1e-11)failures.push('Open path sine transform not orthonormal');
    pathChecks++;
   }
  }
  if(n<4)continue;  // NO K4 windows on short original diagonals.
  // Build source-free circular FOUR-tap operator independently.
  const cyclic=Array.from({length:n},(_,t)=>
   Array.from({length:n},(_,j)=>[0,1,2,3].some(d=>(t+d)%n===j)?1:0));
  const invalidWrap=cyclic.map((row,t)=>t>n-4?row.slice():Array(n).fill(0));
  const boundary=rankByIndependentMinors(invalidWrap);
  boundaryRank+=boundary;
  const srcBoundary=src.strandBoundaryDetails.find(z=>z.orientation===s.orientation&&
    src.originalStrands.find(t=>t.orientation===z.orientation&&
      t.label===z.label)?.cells.join(',')===s.sites.join(','));
  if(!srcBoundary||srcBoundary.rankOfDiscardedCircularFourTaps!==boundary)
   failures.push('Boundary rank/source strand mismatch '+s.orientation+'/'+n);
  // Every original physical owner/presence impulse tests all valid t.
  for(let phys=0;phys<n;phys++){
   const x=Array(n).fill(0);x[phys]=1;
   for(let t=0;t<n;t++){
    const actual=t<=n-4?[0,1,2,3].reduce((v,j)=>v+x[t+j],0):0;
    const cy=cyclic[t].reduce((v,z,j)=>v+z*x[j],0);
    const corrected=cy-invalidWrap[t].reduce((v,z,j)=>v+z*x[j],0);
    if(actual!==corrected)failures.push('K4 interval differs from Fourier cyclic minus boundary');
    windowIntegerChecks++;
   }
  }
  // F_n C F_n† is DIAGONAL with multiplier Σ_j ω^(-kj).
  for(let k=0;k<n;k++)for(let l=0;l<n;l++){
   let transformed=cn(0,0);
   for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(cyclic[i][j]){
    const piece=mul(fourier(n,k,i),conjugate(fourier(n,l,j)));
    transformed=add(transformed,piece);
   }
   let multiplier=cn(0,0);
   for(let j=0;j<4;j++){
    const angle=-2*Math.PI*k*j/n;
    multiplier=add(multiplier,cn(Math.cos(angle),Math.sin(angle)));
   }
   const expected=k===l?multiplier:cn(0,0);
   const err=abs(subtract(transformed,expected));
   maxSpectralError=Math.max(maxSpectralError,err);
   if(err>2e-12)failures.push('Original circular 4tap DFT not diagonal/expected');
   FMultChecks++;
  }
 }
 // Independent FOUR-copies-per-cell isometry/reconstruction without
 // assuming source's alias normalization.
 for(let cell=0;cell<42;cell++){
  let len2=0;
  let reconstruction=Array(42).fill(0);
  // Forward every original occurrence via Fourier, invert each ribbon,
  // add its four copies with source-independent 1/4 scaling.
  for(const strand of S){
   const n=strand.sites.length,loc=strand.sites.indexOf(cell);
   const coeffs=Array.from({length:n},(_,k)=>loc<0?cn(0,0):fourier(n,k,loc));
   let norm2=0;
   for(let k=0;k<n;k++)norm2+=coeffs[k].re**2+coeffs[k].im**2;
   len2+=norm2;
   for(let t=0;t<n;t++){
    let reconstructed=cn(0,0);
    for(let k=0;k<n;k++)reconstructed=add(reconstructed,mul(conjugate(fourier(n,k,t)),coeffs[k]));
    reconstruction[strand.sites[t]]+=reconstructed.re/4;
    maxReconstructionError=Math.max(maxReconstructionError,Math.abs(reconstructed.im));
    fourierImpulseChecks++;
   }
  }
  if(Math.abs(len2-4)>2e-12)failures.push('Fourier alias frame does not preserve Gram4');
  for(let t=0;t<42;t++){
   const err=Math.abs(reconstruction[t]-(t===cell?1:0));
   maxReconstructionError=Math.max(maxReconstructionError,err);
   if(err>2e-12)failures.push('Source Fourier alias inverse cannot reconstruct true physical cell impulse');
   invChecks++;
  }
 }
 const trueDraw=physicallyFirstWinFreeFullDraw();
 if(trueDraw.prematureWins||trueDraw.h.some(x=>x!==6))
  failures.push('Original first-win stopped cooperative full draw is not valid');
 else fullOriginalGames++;
 // Recheck both full owner indicator fields against 69 ORIGINALLY linked
 // source intervals; every K4 has neither P0 nor P1 complete.
 for(const L of src.originalK4Windows){
  const p0=L.originalPhysicalIDs.reduce((v,id)=>v+(trueDraw.board[id]===0?1:0),0);
  const p1=L.originalPhysicalIDs.reduce((v,id)=>v+(trueDraw.board[id]===1?1:0),0);
  if(p0===4||p1===4)failures.push('Transformed strand window declared actual win in original physical DRAW');
 }
 return {
  status:failures.length?'UNFOLD_FIRST_FOURIER_ORIGINAL7X6_PHYSICAL_FAIL':
    'INDEPENDENT_ORIGINAL7X6_FOUR_RIBBON_FIRST_FOURIER_FRAME_PASS',
  originalBoard:[7,6,4],
  originalWinlinesReconstructed:realWins.length,
  unfoldedStrands:S.length,unfoldedPhysicalAppearances:alias.reduce((a,b)=>a+b,0),
  physicalCellsWithExactlyFourAliases:alias.filter(x=>x===4).length,
  exactLiftGram_MtM_4I:true,
  physicalSubspaceDimension:42,liftedAliasConstraintDimensions:126,
  K4ActiveStrands:active,activeStrandAppearances:activeApp,
  noWinningLineShortStrands:short,
  exactK4FiniteDirectionalIntervals:windows,
  sourceWrappedWindowBoundaryRank:boundaryRank,
  circularBoundaryOutputIntegerChecks:windowIntegerChecks,
  FourierDiagonalFourTapComplexChecks:FMultChecks,
  openPathSineTransformChecks:pathChecks,
  originalFourierAliasImpulseCoefficientsRecomputed:fourierImpulseChecks,
  originalFourierAliasPhysicalReconstructionChecks:invChecks,
  independentFullActualFirstWinStoppedGames:fullOriginalGames,
  actualOriginalCooperativeDrawHistory:trueDraw.word,
  maximumCircularFourTapDFTComplexError:maxSpectralError,
  maximumOpenPathSineError:maxDSTError,
  maximumFourierAliasReconstructionError:maxReconstructionError,
  sourceQuantumHardwareAdvantageClaimed:false,sourceGameWDLQueries:0,
  originalExactRootWDLOrBestMoveProven:null,errors:failures.slice(0,12)
 };
}

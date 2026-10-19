// INDEPENDENT TRUE original W7,H6,K4 four-orientation finite
// strand physical validation of FROZEN P0/P1 interwoven line-wave DFT.
 // Generate 37 ORIGINAL finite directional strands from boundary
// starts, verify exact 69 K4 windows, compute independent complex
// Fourier forward/inverse & Parseval on REAL window-start coordinates
// for genuine original empty, legal 44444 and true DRAW-prefix32.
 // Independently enumerate ALL 5040 original physical gravity-shuffle
// completions after rank32 only as a mathematical potentiality
// falsifier, NOT minimax/strategic WDL; firstwin stopped only before
// prefix, possible later wins are counterfactually continued.
import {sourceOriginal7x6TwoWaveSpatialRibbonFourier}
 from './source-original7x6-interwoven-owner-line-DFT-strand-waves.mjs';
function originalFiniteStrands(){
 const out=[],id=(c,r)=>r*7+c;
 function add(orientation,c,r,dc,dr){
  const cells=[];
  while(c>=0&&c<7&&r>=0&&r<6){
   cells.push(id(c,r));c+=dc;r+=dr;
  }
  out.push({orientation,cells,K4Windows:Array.from({length:Math.max(0,cells.length-3)},(_,t)=>cells.slice(t,t+4))});
 }
 for(let r=0;r<6;r++)add('horizontal',0,r,1,0);
 for(let c=0;c<7;c++)add('vertical',c,0,0,1);
 for(let c=0;c<7;c++)add('rising',c,0,1,1);
 for(let r=1;r<6;r++)add('rising',0,r,1,1);
 for(let r=0;r<6;r++)add('falling',0,r,1,-1);
 for(let c=1;c<7;c++)add('falling',c,5,1,-1);
 if(out.length!==37||out.reduce((a,s)=>a+s.cells.length,0)!==168||
    out.reduce((a,s)=>a+s.K4Windows.length,0)!==69)
  throw Error('independent physical original 7x6 directional ribbons invalid');
 return out;
}
function complexDFT(v){
 const n=v.length,scale=1/Math.sqrt(n);
 return Array.from({length:n},(_,k)=>{
  let re=0,im=0;
  for(let t=0;t<n;t++){
   const theta=2*Math.PI*k*t/n;
   re+=v[t]*scale*Math.cos(theta);
   im-=v[t]*scale*Math.sin(theta);
  }
  return {re,im,power:re*re+im*im};
 });
}
function inverseDFT(v){
 const n=v.length,scale=1/Math.sqrt(n);
 return Array.from({length:n},(_,t)=>{
  let re=0,im=0;
  for(let k=0;k<n;k++){
   const theta=2*Math.PI*k*t/n;
   re+=scale*(v[k].re*Math.cos(theta)-v[k].im*Math.sin(theta));
   im+=scale*(v[k].re*Math.sin(theta)+v[k].im*Math.cos(theta));
  }
  return {re,im};
 });
}
function physicallyEnumerateRank32LineWaves(lines){
 const given='12345612345665432165432112345612',
  height=Array(7).fill(0),owner=Array(42).fill(-1);
 for(let t=0;t<given.length;t++){
  const col=+given[t]-1,row=height[col]++,site=row*7+col,p=t&1;
  if(row>=6||owner[site]>=0)throw Error('independent physical real draw-prefix incorrect');
  owner[site]=p;
  if(lines.some(L=>L.includes(site)&&L.every(z=>owner[z]===p)))
   throw Error('independent real original q32 firstwon before prefix');
 }
 const counts0=Array(lines.length).fill(0),counts1=Array(lines.length).fill(0);
 let complete=0;
 function finish(depth){
  if(depth===10){
   complete++;
   for(let j=0;j<lines.length;j++){
    const L=lines[j],c=owner[L[0]];
    if(L.every(z=>owner[z]===c)){if(c===0)counts0[j]++;else counts1[j]++;}
   }
   return;
  }
  for(let c=0;c<7;c++)if(height[c]<6){
   const site=height[c]*7+c,player=(32+depth)&1;
   height[c]++;owner[site]=player;
   finish(depth+1);
   owner[site]=-1;height[c]--;
  }
 }
 finish(0);
 if(complete!==5040)throw Error('incorrect independently enumerated original 5040 rank32 suffixes');
 return {total:complete,counts0,counts1};
}
export function independentTrue7x6TwoOwnerRibbonFourier(){
 const s=sourceOriginal7x6TwoWaveSpatialRibbonFourier(),all=originalFiniteStrands(),
  errors=[],active=all.filter(x=>x.K4Windows.length),
  canon=x=>x.slice().sort((a,b)=>a-b).join(',');
 const sourceGeometry=new Map(s.sourceEmptyRoot.sourceFourierWindowStartWaves.map(x=>
   [x.orientation+':'+x.physicalK4WindowCells.map(canon).join('|'),x]));
 let group=0,fftEntries=0,inverseEntries=0,parses=0,
  realPhysicalLateLineProbabilities=0,originalWindowCellsChecked=0;
 const independentWindows=active.flatMap(x=>x.K4Windows);
 const physicalLate=physicallyEnumerateRank32LineWaves(independentWindows);
 const physicalDictionary=new Map(independentWindows.map((L,j)=>[canon(L),{
  p0:physicalLate.counts0[j]/physicalLate.total,
  p1:physicalLate.counts1[j]/physicalLate.total}]));
 const models=[
  ['EMPTY',s.sourceEmptyRoot],
  ['44444',s.sourceActualCanonical44444],
  ['RANK32',s.sourceRealFirstWinFreeDrawPrefix32]
 ];
 const summaries={};
 let verticalNodes=0,horizontalOnlyDC=0;
 for(const [name,source] of models){
  let withNonzeroK=0,
    perOrientation={};
  const seen=new Set();
  for(const strand of active){
   const candidates=source.sourceFourierWindowStartWaves.filter(w=>
      w.orientation===strand.orientation&&
      w.physicalK4WindowCells.map(canon).join('|')===
      strand.K4Windows.map(canon).join('|'));
   if(candidates.length!==1){errors.push({issue:'FOURIER_SOURCE_ORIGINAL_DIRECTION_STRAND_MISMATCH',name});continue;}
   const row=candidates[0],m=strand.K4Windows.length;
   const fields=[row.lineP0JointPotential,row.lineP1JointPotential,
     row.signedInterwovenOwnerContrast];
   for(const [index,field] of fields.entries()){
    const independent=complexDFT(field);
    const declared=index===0?row.P0FourierModes:index===1?
      row.P1FourierModes:row.signedOwnerDifferenceFourierModes;
    const recovered=inverseDFT(independent);
    let E=0,F=0;
    for(let j=0;j<m;j++){
     if(Math.abs(recovered[j].re-field[j])>5e-13||
       Math.abs(recovered[j].im)>5e-13)
      errors.push({issue:'FOURIER_INVERSE_DOES_NOT_RECOVER_ORIGINAL_OWNER_LINE_WAVE',name,orientation:strand.orientation,j});
     if(index===2&&Math.abs(field[j]-
       (row.lineP0JointPotential[j]-row.lineP1JointPotential[j]))>5e-13)
      errors.push({issue:'SIGNED_OWNER_CONTRAST_NOT_OVERLAY_DIFFERENCE',name,j});
     E+=field[j]*field[j];F+=independent[j].power;
     for(const [a,b] of [[declared[j].re,independent[j].re],
         [declared[j].im,independent[j].im],
         [declared[j].intensity,independent[j].power]]){
       if(Math.abs(a-b)>5e-13)
        errors.push({issue:'SOURCE_FOURIER_VS_INDEPENDENT_DFT_DIFFERENT',name,orientation:strand.orientation,index,j});
       fftEntries++;
     }
     inverseEntries++;
    }
    if(Math.abs(E-F)>5e-13)errors.push({issue:'FOURIER_INDEPENDENT_PARSEVAL_ERROR',name,index});
    parses++;
   }
   if(name==='RANK32'){
    for(let j=0;j<m;j++){
     const k=canon(strand.K4Windows[j]),b=physicalDictionary.get(k);
     if(!b||Math.abs(b.p0-row.lineP0JointPotential[j])>5e-13||
       Math.abs(b.p1-row.lineP1JointPotential[j])>5e-13)
      errors.push({issue:'SOURCE_LATE_WAVES_DISAGREE_WITH_5040_ACTUAL_GRAVITY_SHUFFLES',k,b,sourceP0:row.lineP0JointPotential[j],sourceP1:row.lineP1JointPotential[j]});
     realPhysicalLateLineProbabilities+=2;
    }
   }
   if(name==='EMPTY'&&strand.orientation==='vertical'){
    const numerator=40698/5245786;
    const d=row.signedInterwovenOwnerContrast;
    if(d.length!==3||Math.abs(d[0]-numerator)>5e-13||
      Math.abs(d[1])>5e-13||Math.abs(d[2]+numerator)>5e-13||
      Math.abs(row.signedDifferenceDC)>5e-13)
      errors.push({issue:'EMTPY_ORIGINAL_VERTICAL_OWNER_INTERFERENCE_NONANTISYMMETRIC'});
    verticalNodes++;
   }
   if(name==='EMPTY'&&strand.orientation==='horizontal'){
    const fft=complexDFT(row.signedInterwovenOwnerContrast);
    if(fft.slice(1).some(t=>t.power>1e-22))errors.push({issue:'EMPTY_HORIZONTAL_FOURIER_NONDC'});
    horizontalOnlyDC++;
   }
   const direction=strand.orientation;
   if(!perOrientation[direction])perOrientation[direction]={strands:0,starts:0};
   perOrientation[direction].strands++;
   perOrientation[direction].starts+=m;
   for(const k of row.signedOwnerDifferenceFourierModes.slice(1))
    if(k.intensity>1e-17)withNonzeroK++;
   group++;originalWindowCellsChecked+=m*4;
  }
  summaries[name]={spectralStrands:active.length,
   nonconstantSignedOwnerFourierModes:withNonzeroK,perOrientation};
 }
 if(verticalNodes!==7||horizontalOnlyDC!==6||group!==75||realPhysicalLateLineProbabilities!==138)
  errors.push({issue:'SCOPE_COUNTERS_OF_ACTUAL_ORIGINAL_FOUR_RIBBON_SPECTRUM',verticalNodes,horizontalOnlyDC,group,realPhysicalLateLineProbabilities});
 return {
  status:errors.length?'INDEPENDENT_TRUE7X6_TWO_OWNER_SPATIAL_WAVE_DFT_FAILED':
    'INDEPENDENT_ORIGINAL7X6_INTERWOVEN_OWNER_FINITE_RIBBON_FOURIER_PASS',
  originalGame:[7,6,4],originalFourDirectionStrands:all.length,
  winCapableFourLineStrands:active.length,
  actualK4LineWindows:independentWindows.length,
  originalActualOneBasedRank32DrawPrefix:'12345612345665432165432112345612',
  independentlyEnumeratedOriginalHypotheticalGravitySuffixes:physicalLate.total,
  originalJointP0P1K4LineProbabilityChecksAgainstExhaustivePhysical:realPhysicalLateLineProbabilities,
  independentComplexFourierCoefficientComparisons:fftEntries,
  independentInverseDFTOriginalOwnerWaveValuesChecked:inverseEntries,
  independentParsevalOwnerWaveEnergyChecks:parses,
  exactOriginal4CellWinLineSitesEnumerated:originalWindowCellsChecked,
  originalVerticalEmptyAntisymmetricWaveNodeStrands:verticalNodes,
  allEmptyHorizontalOnlyDCStrands:horizontalOnlyDC,
  trueOriginalSpectralSymmetryBreaking:summaries,
  sourceNoGameWDLOrBestMoveProven:true,
  distinctHistoryWavePhaseInterferenceIsMathematicalNotPhysical:true,
  errors:errors.slice(0,12)};
}

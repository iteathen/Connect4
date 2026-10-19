// SOURCE mathematical spatial Fourier transform of TWO complete-
 // shuffle owner K4 LINE POTENTIALITY wavefields on ORIGINAL W7,H6,K4
// original finite four-ribbon strands. The 69 original length4
// windows are each one ordered start of a physical true strand.
// Source line probabilities already use joint four-body gravity-
 // shuffle counts (not products of one-body probabilities).
// DFT is applied to ACTUAL valid window-start coordinates only,
// no wrapped/artificial Connect4 winning lines.
// Returns empty, real canonical44444 and real rank32 controls.
// This is NOT a quantum physical amplitude or a game WDL.
import {sourceOriginal7x6TwoOwnerHistoryWaveOverlay}
 from './source-original7x6-two-owner-complete-gravity-wave-overlay.mjs';
import {sourceTrue7x6FourRibbonFirstFourierFrame}
 from './source-true7x6-unfold-first-Fourier-ribbon-frame.mjs';
export function sourceOriginal7x6TwoWaveSpatialRibbonFourier(){
 const waves=sourceOriginal7x6TwoOwnerHistoryWaveOverlay(),
  unfolding=sourceTrue7x6FourRibbonFirstFourierFrame(),H=6,W=7,K=4;
 const key=cells=>cells.slice().sort((a,b)=>a-b).join(',');
 function DFT(reals){
  const m=reals.length;
  return Array.from({length:m},(_,k)=>{
   let re=0,im=0;
   for(let t=0;t<m;t++){
    const angle=-2*Math.PI*k*t/m,
      r=reals[t]/Math.sqrt(m);
    re+=r*Math.cos(angle);im+=r*Math.sin(angle);
   }
   return {harmonicIndex:k,re,im,intensity:re*re+im*im};
  });
 }
 function analyze(q){
  const dictionary=new Map(q.exactTwoOwnerK4JointLineWave.map(l=>
   [key(l.originalPhysicalSites),l]));
  const ribbons=[];
  for(const s of unfolding.originalStrands){
   if(s.K4Windows.length===0)continue;
   const lineWaves=s.K4Windows.map(c=>{
    const line=dictionary.get(key(c));
    if(!line)throw Error('source physical winline has no P0/P1 amplitude');
    return line;
   });
   const P0=lineWaves.map(x=>x.absoluteLinePotentialP0),
    P1=lineWaves.map(x=>x.absoluteLinePotentialP1),
    difference=lineWaves.map(x=>x.signedLineContrast);
   const ownerModes=[DFT(P0),DFT(P1)],differenceModes=DFT(difference);
   let trueEnergy=difference.reduce((a,b)=>a+b*b,0),
    spectralEnergy=differenceModes.reduce((a,b)=>a+b.intensity,0);
   if(Math.abs(trueEnergy-spectralEnergy)>1e-12)
    throw Error('source finite winning-window Fourier Parseval wrong');
   ribbons.push({
    orientation:s.orientation,originalStrandLabel:s.label,
    physicalFullStrandLength:s.length,numberOfActualK4WindowStarts:lineWaves.length,
    physicalK4WindowCells:s.K4Windows,
    lineP0JointPotential:P0,lineP1JointPotential:P1,
    signedInterwovenOwnerContrast:difference,
    P0FourierModes:ownerModes[0],P1FourierModes:ownerModes[1],
    signedOwnerDifferenceFourierModes:differenceModes,
    signedDifferenceDC:differenceModes[0].re,
    contrastTimeDomainEnergy:trueEnergy,contrastFourierEnergy:spectralEnergy});
  }
  const orientationSummary={};
  for(const orientation of ['horizontal','vertical','rising','falling']){
   const r=ribbons.filter(v=>v.orientation===orientation);
   const energy=r.reduce((s,x)=>s+x.contrastFourierEnergy,0);
   const zeroDC=r.filter(x=>Math.abs(x.signedDifferenceDC)<1e-12).length;
   const DCEnergy=r.reduce((s,x)=>s+x.signedOwnerDifferenceFourierModes[0].intensity,0);
   orientationSummary[orientation]={
    activeReal7x6Strands:r.length,
    totalOriginalK4LineStarts:r.reduce((a,b)=>a+b.numberOfActualK4WindowStarts,0),
    exactlyZeroDCStrands:zeroDC,
    signedContrastFourierEnergy:energy,
    signedContrastDCEnergy:DCEnergy,
    DCEnergyFraction:energy?DCEnergy/energy:null
   };
  }
  return {genuineOriginalStartingPrefix:q.genuineOriginalPrefix,
   sourceFourierWindowStartWaves:ribbons,
   orientationSpectralSummary:orientationSummary,
   numberOfActualOriginalK4LineStarts:
    ribbons.reduce((a,b)=>a+b.numberOfActualK4WindowStarts,0)};
 }
 const empty=analyze(waves.emptyOriginalRoot),
  canonical=analyze(waves.trueFirstWinFree44444Prefix),
  late=analyze(waves.trueFirstWinFreePhysicalDrawPrefix32);
 if(empty.numberOfActualOriginalK4LineStarts!==69||
    canonical.numberOfActualOriginalK4LineStarts!==69||
    late.numberOfActualOriginalK4LineStarts!==69)
  throw Error('missing real original 69 line-wave spectral inputs');
 // Claim from original 7 identical six-event column chains:
 // all original empty horizontal row starts are exchangeable.
 const horizontalEmpty=empty.sourceFourierWindowStartWaves.filter(x=>x.orientation==='horizontal');
 for(const s of horizontalEmpty){
  const first=s.signedInterwovenOwnerContrast[0];
  if(s.signedInterwovenOwnerContrast.some(x=>Math.abs(x-first)>1e-12)||
     s.signedOwnerDifferenceFourierModes.slice(1).some(x=>x.intensity>1e-23))
   throw Error('empty original horizontal spatial P0/P1 wave not pure DC');
 }
 const expected=40698/5245786;
 const verticalEmpty=empty.sourceFourierWindowStartWaves.filter(x=>x.orientation==='vertical');
 for(const s of verticalEmpty){
  if(s.numberOfActualK4WindowStarts!==3 ||
    Math.abs(s.signedInterwovenOwnerContrast[0]-expected)>1e-14 ||
    Math.abs(s.signedInterwovenOwnerContrast[1])>1e-14 ||
    Math.abs(s.signedInterwovenOwnerContrast[2]+expected)>1e-14 ||
    Math.abs(s.signedDifferenceDC)>1e-13)
   throw Error('TRUE original empty vertical standing antisymmetric owner wave failed');
 }
 return {
  status:'SOURCE_TRUE7X6_K4_TWO_OWNER_FINITE_RIBBON_FOURIER_INTERFERENCE_WAVE',
  strictOriginalGame:[W,H,K],
  physicalAliasCount:42,
  originalUnfoldedRealStrands:37,
  originalK4ActiveWaveStrands:25,
  originalPhysicalFourCellWinningLineWindows:69,
  FourierAcross:'valid K4 window starts along each true open physical finite strand, never circular K4 cell windows',
  emptyRootVerticalSevenAntisymmetricWavesExact:7,
  emptyRootVerticalPerStrandSignedWaveExactNumerator:[40698,0,-40698],
  emptyRootVerticalPerStrandSignedWaveDenominator:5245786,
  emptyRootAllSixHorizontalWavesOnlyDC:true,
  sourceEmptyRoot:empty,
  sourceActualCanonical44444:canonical,
  sourceRealFirstWinFreeDrawPrefix32:late,
  originalFutureGameWDLQueries:0,actualGameWinnerFromSpatialSpectrum:null,
  hypotheticalHistoryWaveAmplitudesAreModelDefinedNotPhysicalQuantum:true
 };
}

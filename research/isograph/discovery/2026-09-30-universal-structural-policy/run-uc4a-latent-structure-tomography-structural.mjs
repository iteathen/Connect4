#!/usr/bin/env node
import {createHash} from 'node:crypto';

const K=4;
const COHORT=[
  [4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],
  [5,4],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11],[5,12],[5,13],
  [6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],
  [7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10],
  [8,4],[8,5],[8,6],[8,7],[8,8],[8,9],
  [9,4],[9,5],[9,6],[9,7],
  [10,4],[10,5],[10,6],
  [11,4],[11,5],
  [12,4]
];
if(COHORT.length!==52)throw new Error('frozen geometry cohort must contain 52 boards');

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256(value){return createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');}
function choose2(n){return n*(n-1)/2;}
function signClass(x){return x<0?'NEG':x>0?'POS':'ZERO';}
function parity(x){return Math.abs(x)%2;}
function centers(W){return W%2?[Math.floor(W/2)+1]:[W/2,W/2+1];}

function gf2Rank(masks){
  const basis=new Map();
  let rank=0;
  for(let x of masks){
    while(x!==0n){
      const p=x.toString(2).length-1;
      const b=basis.get(p);
      if(b===undefined){basis.set(p,x);rank++;break;}
      x^=b;
    }
  }
  return rank;
}

function cellId(W,c,r){return r*W+c;}
function lineKey(line){return [...line].sort((a,b)=>a-b).join(',');}
function generateLines(W,H){
  const dirs=[
    {name:'horizontal',dx:1,dy:0},
    {name:'vertical',dx:0,dy:1},
    {name:'risingDiagonal',dx:1,dy:1},
    {name:'fallingDiagonal',dx:1,dy:-1},
  ];
  const lines=[];
  for(const d of dirs){
    for(let r=0;r<H;r++)for(let c=0;c<W;c++){
      const ec=c+(K-1)*d.dx, er=r+(K-1)*d.dy;
      if(ec<0||ec>=W||er<0||er>=H)continue;
      const cells=[];
      for(let t=0;t<K;t++)cells.push(cellId(W,c+t*d.dx,r+t*d.dy));
      lines.push({orientation:d.name,cells,start:[c,r]});
    }
  }
  return lines;
}
function mirrorKey(W,H,line,kind){
  const cells=line.cells.map(id=>{
    const c=id%W,r=Math.floor(id/W);
    let cc=c,rr=r;
    if(kind==='lr')cc=W-1-c;
    else if(kind==='tb')rr=H-1-r;
    else if(kind==='rot180'){cc=W-1-c;rr=H-1-r;}
    return cellId(W,cc,rr);
  });
  return lineKey(cells);
}
function reflectionSummary(W,H,lines){
  const byKey=new Set(lines.map(x=>lineKey(x.cells)));
  const out={};
  for(const kind of ['lr','tb','rot180']){
    let fixed=0;
    const fixedByOrientation={horizontal:0,vertical:0,risingDiagonal:0,fallingDiagonal:0};
    for(const line of lines){
      const mk=mirrorKey(W,H,line,kind);
      if(!byKey.has(mk))throw new Error(`reflection lost winning line ${W}x${H} ${kind}`);
      if(mk===lineKey(line.cells)){fixed++;fixedByOrientation[line.orientation]++;}
    }
    out[kind]={fixedLines:fixed,fixedByOrientation};
  }
  out.lr.fixedCells=(W%2)*H;
  out.tb.fixedCells=(H%2)*W;
  out.rot180.fixedCells=(W%2)*(H%2);
  return out;
}

function residualHierarchy(lines){
  const C4=new Map(lines.map(x=>[lineKey(x.cells),[...x.cells].sort((a,b)=>a-b)]));
  function faces(source){
    const out=new Map();
    for(const cells of source.values())for(let i=0;i<cells.length;i++){
      const f=cells.filter((_,j)=>j!==i);
      out.set(lineKey(f),f);
    }
    return out;
  }
  const C3=faces(C4),C2=faces(C3),C1=faces(C2);
  return {C1,C2,C3,C4};
}
function boundaryMatrixRank(high,low){
  const lowKeys=[...low.keys()];
  const index=new Map(lowKeys.map((k,i)=>[k,i]));
  const columns=[];
  for(const cells of high.values()){
    let mask=0n;
    for(let i=0;i<cells.length;i++){
      const f=cells.filter((_,j)=>j!==i);
      const j=index.get(lineKey(f));
      if(j===undefined)throw new Error('missing residual face');
      mask^=1n<<BigInt(j);
    }
    columns.push(mask);
  }
  return {rank:gf2Rank(columns),columns,index};
}
function assertBoundarySquareZero(high,mid,low){
  const lowIndex=new Map([...low.keys()].map((k,i)=>[k,i]));
  for(const cells of high.values()){
    let total=0n;
    for(let i=0;i<cells.length;i++){
      const midCells=cells.filter((_,j)=>j!==i);
      for(let j=0;j<midCells.length;j++){
        const lowCells=midCells.filter((_,q)=>q!==j);
        const idx=lowIndex.get(lineKey(lowCells));
        if(idx===undefined)throw new Error('missing second residual face');
        total^=1n<<BigInt(idx);
      }
    }
    if(total!==0n)throw new Error('aggregate residual boundary does not square to zero');
  }
}

function safeDerivative(word){
  const s=word.join('');
  return !s.includes('000')&&!s.includes('111');
}
function singleEntryDerivative(W,c){
  const phi=Array(W).fill(0);phi[c]=1;
  return Array.from({length:W-1},(_,i)=>phi[i]^phi[i+1]);
}
function safeEntries(W){
  const cols=[];
  for(let c=0;c<W;c++)if(safeDerivative(singleEntryDerivative(W,c)))cols.push(c+1);
  return cols;
}
function safeDerivativeStats(W){
  const m=W-1;
  let count=0;
  const terminal={"00":0,"01":0,"10":0,"11":0};
  for(let x=0;x<(1<<m);x++){
    const word=Array.from({length:m},(_,i)=>(x>>i)&1);
    if(!safeDerivative(word))continue;
    count++;
    if(m>=2){const k=`${word[m-2]}${word[m-1]}`;terminal[k]++;}
  }
  return {count,terminal};
}
function impactProfile(W,H,lines){
  const profile=[];
  for(let c=0;c<W;c++){
    const id=cellId(W,c,0);
    profile.push(lines.filter(x=>x.cells.includes(id)).length);
  }
  const max=Math.max(...profile);
  const cols=profile.map((v,i)=>({v,i})).filter(x=>x.v===max).map(x=>x.i+1);
  return {profile,max,maxColumns:cols,maxCount:cols.length};
}
function depthHistogram(W,H,lines){
  const hist=Array(H).fill(0);
  for(const line of lines)for(const id of line.cells)hist[Math.floor(id/W)]++;
  return hist;
}
function topDefectLifts(W,H,entries){
  return entries.map(col1=>{
    const c=col1-1;
    const bits=Array(W).fill(H%2);
    bits[c]^=1;
    const weight=bits.reduce((a,b)=>a+b,0);
    return {entryColumn:col1,vector:bits.join(''),weight,charge:weight%2};
  });
}
function category(n){return n===0?'ZERO':n===1?'ONE':'MULTI';}
function topClass(n){return n===1?'ONE':n%2===0?'EVEN_NONZERO':'ODD_MULTI';}

function structuralRow(W,H){
  if(W<4||H<4)throw new Error('tomography 0.1 K=4 cohort requires W,H>=4');
  const lines=generateLines(W,H);
  const orientationLineCounts={horizontal:0,vertical:0,risingDiagonal:0,fallingDiagonal:0};
  for(const x of lines)orientationLineCounts[x.orientation]++;
  const a=W-3,b=H-3;
  const expected={horizontal:H*a,vertical:W*b,risingDiagonal:a*b,fallingDiagonal:a*b};
  if(stable(orientationLineCounts)!==stable(expected))throw new Error(`line count formula mismatch ${W}x${H}`);
  const lineCount=lines.length;

  const lineMasks=lines.map(x=>x.cells.reduce((m,id)=>m|(1n<<BigInt(id)),0n));
  const incidenceRank=gf2Rank(lineMasks);
  const diagonalResidueRank=Math.min(2,a*b);
  const formulaRank=W*H-9+diagonalResidueRank;
  if(incidenceRank!==formulaRank)throw new Error(`incidence theorem mismatch ${W}x${H}: ${incidenceRank} != ${formulaRank}`);
  const kernelDimension=lineCount-incidenceRank;
  const formulaKernel=3*a*b-diagonalResidueRank;
  if(kernelDimension!==formulaKernel)throw new Error(`kernel theorem mismatch ${W}x${H}`);
  const axisQuotientRank=a+b;
  const yCell=incidenceRank-axisQuotientRank;
  const phaseDimension=W-1;
  const yLine=kernelDimension-phaseDimension;
  const coreDelta=yLine-yCell;

  const R=residualHierarchy(lines);
  const b43=boundaryMatrixRank(R.C4,R.C3);
  const b32=boundaryMatrixRank(R.C3,R.C2);
  const b21=boundaryMatrixRank(R.C2,R.C1);
  assertBoundarySquareZero(R.C4,R.C3,R.C2);
  assertBoundarySquareZero(R.C3,R.C2,R.C1);

  const entries=safeEntries(W);
  if(entries.length!==Math.max(0,8-W))throw new Error(`safe-entry theorem mismatch ${W}`);
  const safeStats=safeDerivativeStats(W);
  const pairCount=choose2(W);
  const pairRank=W-1;
  const impact=impactProfile(W,H,lines);
  const depth=depthHistogram(W,H,lines);
  const frontierIncidenceTotal=impact.profile.reduce((a,x)=>a+x,0);
  const positiveDepthLineIncidenceTotal=4*lineCount-frontierIncidenceTotal;
  const neutralPairCapacity=Math.floor((H-1)/2)+(W-1)*Math.floor(H/2);
  const oneSetupTopDefectWeight=((H-1)%2)+(W-1)*(H%2);
  const lifts=topDefectLifts(W,H,entries);
  for(const x of lifts)if(x.weight!==oneSetupTopDefectWeight)throw new Error(`top-defect lift mismatch ${W}x${H}`);

  const reflect=reflectionSummary(W,H,lines);
  const blocks={
    G:{
      width:W,height:H,k:K,cells:W*H,
      startDomainDimensions:{
        horizontal:[W-3,H],vertical:[W,H-3],risingDiagonal:[W-3,H-3],fallingDiagonal:[W-3,H-3]
      },
      orientationLineCounts,
      horizontalLines:orientationLineCounts.horizontal,
      verticalLines:orientationLineCounts.vertical,
      risingDiagonalLines:orientationLineCounts.risingDiagonal,
      fallingDiagonalLines:orientationLineCounts.fallingDiagonal,
      diagonalLines:orientationLineCounts.risingDiagonal+orientationLineCounts.fallingDiagonal,
      lineCount,
      leftRightReflection:reflect.lr,
      geometryOnlyTopBottomReflection:reflect.tb,
      rotation180:reflect.rot180,
      widthParity:W%2,heightParity:H%2,cellParity:(W*H)%2,
    },
    I:{
      incidenceRank,kernelDimension,diagonalResidueRank,axisQuotientRank,
      axisHorizontalRank:a,axisVerticalRank:b,
      yCell,yLine,coreDelta,coreDeltaSign:signClass(coreDelta),
      incidenceRankParity:parity(incidenceRank),kernelParity:parity(kernelDimension),
      yCellParity:parity(yCell),yLineParity:parity(yLine),coreDeltaParity:parity(coreDelta),
      lineCountParity:parity(lineCount),
    },
    R:{
      fragmentCounts:{C4:R.C4.size,C3:R.C3.size,C2:R.C2.size,C1:R.C1.size},
      boundaryRanks:{d4_to_d3:b43.rank,d3_to_d2:b32.rank,d2_to_d1:b21.rank},
      boundaryNullities:{d4_to_d3:R.C4.size-b43.rank,d3_to_d2:R.C3.size-b32.rank,d2_to_d1:R.C2.size-b21.rank},
      aggregateBoundarySquaresZero:true,
      sequentialMarkedResidualCategory:null,
      standardQualifiedMiddle:W===7&&H===6?{middleCoreDimension:28,residualDegree3FrontierRank:7,residualDegree3CoreDimension:21}:null,
    },
    P:{
      phaseDimension,pathRadius:Math.floor(W/2),centerColumns:centers(W),centerCount:centers(W).length,
      safeEntryColumns:entries,safeEntryCount:entries.length,safeEntryClass:category(entries.length),
      safeDerivativeWordCount:safeStats.count,safePhaseWordCount:2*safeStats.count,
      safeDerivativeTerminalStateCounts:safeStats.terminal,
      pathBoundaryRank:W-1,pathBoundaryNullity:0,
      pairDisplacementGeneratorCount:pairCount,pairDisplacementRank:pairRank,pairDisplacementNullity:pairCount-pairRank,
      topDefectModuleDimension:W-1,topDefectChargeQuotientDimension:1,
      safeEntryBoundaryLifts:lifts,
      phaseRadiusParity:Math.floor(W/2)%2,
    },
    C:{
      elementaryResponseFrontierCount:(W-3)*Math.floor((H-1)/2),
      neutralPairCapacity,
      pairResponseGeneratorCount:pairCount,pairResponseRelationRank:pairRank,pairResponseRelationNullity:pairCount-pairRank,
      oneSetupTopDefectWeight,oneSetupTopDefectParity:oneSetupTopDefectWeight%2,oneSetupTopDefectClass:topClass(oneSetupTopDefectWeight),
      unconstrainedDefectOrbitCount:2,
      responseMatroidExactGeometrySummary:null,
    },
    D:{
      frontierLineIncidenceByColumn:impact.profile,
      frontierLineIncidenceTotal:frontierIncidenceTotal,
      positiveDepthLineIncidenceTotal,
      maxInitialImpact:impact.max,maxInitialImpactCount:impact.maxCount,maxInitialImpactColumns:impact.maxColumns,
      lineCellIncidenceDepthHistogram:depth,
      evenRowLineCellIncidences:depth.reduce((s,x,i)=>s+(i%2===0?x:0),0),
      oddRowLineCellIncidences:depth.reduce((s,x,i)=>s+(i%2===1?x:0),0),
      maxSupportDepth:H-1,verticalSupportParityPeriod:2,
      finiteEventHorizon:W*H,postOneSetupEventHorizon:W*H-1,
      sameColumnPairLayers:Math.floor(H/2),postSetupColumnPairLayers:Math.floor((H-1)/2),
      unmatchedOneSetupTopWeight:oneSetupTopDefectWeight,
    },
    Q:{
      available:false,
      reason:'No outcome-blind scalable recursive root quotient is frozen for this broad geometry cohort; missing by design, never imputed from W/D/L.'
    }
  };
  return {board:`${W}x${H}`,width:W,height:H,k:K,blocks};
}

const rows=COHORT.map(([W,H])=>structuralRow(W,H)).sort((a,b)=>a.width-b.width||a.height-b.height);
const rowHashes=rows.map(row=>({board:row.board,sha256:sha256(row)}));
const structuralAtlasSha256=sha256(rowHashes.map(x=>`${x.board}:${x.sha256}`).join('\n'));

const fieldRegistry={
  blockOrder:['G','I','R','P','C','D','Q'],
  integerDeltaFields:{
    G:['width','height','cells','horizontalLines','verticalLines','risingDiagonalLines','fallingDiagonalLines','diagonalLines','lineCount','leftRightReflection.fixedLines','leftRightReflection.fixedCells'],
    I:['incidenceRank','kernelDimension','diagonalResidueRank','axisQuotientRank','axisHorizontalRank','axisVerticalRank','yCell','yLine','coreDelta'],
    R:['fragmentCounts.C4','fragmentCounts.C3','fragmentCounts.C2','fragmentCounts.C1','boundaryRanks.d4_to_d3','boundaryRanks.d3_to_d2','boundaryRanks.d2_to_d1','boundaryNullities.d4_to_d3','boundaryNullities.d3_to_d2','boundaryNullities.d2_to_d1'],
    P:['phaseDimension','pathRadius','centerCount','safeEntryCount','safeDerivativeWordCount','safePhaseWordCount','pairDisplacementGeneratorCount','pairDisplacementRank','pairDisplacementNullity','topDefectModuleDimension'],
    C:['elementaryResponseFrontierCount','neutralPairCapacity','pairResponseGeneratorCount','pairResponseRelationRank','pairResponseRelationNullity','oneSetupTopDefectWeight'],
    D:['frontierLineIncidenceTotal','positiveDepthLineIncidenceTotal','maxInitialImpact','maxInitialImpactCount','evenRowLineCellIncidences','oddRowLineCellIncidences','maxSupportDepth','finiteEventHorizon','postOneSetupEventHorizon','sameColumnPairLayers','postSetupColumnPairLayers','unmatchedOneSetupTopWeight'],
    Q:[]
  },
  gf2DeltaFields:{
    G:['widthParity','heightParity','cellParity'],
    I:['incidenceRankParity','kernelParity','yCellParity','yLineParity','coreDeltaParity'],
    R:[],
    P:['phaseRadiusParity'],
    C:['oneSetupTopDefectParity'],
    D:[],
    Q:[]
  },
  categoricalFields:{
    G:[],I:['coreDeltaSign'],R:[],P:['safeEntryClass'],C:['oneSetupTopDefectClass'],D:[],Q:['available']
  },
  vectorFields:{
    G:['startDomainDimensions','orientationLineCounts'],I:[],R:['fragmentCounts','boundaryRanks','boundaryNullities'],
    P:['centerColumns','safeEntryColumns','safeDerivativeTerminalStateCounts','safeEntryBoundaryLifts'],
    C:[],D:['frontierLineIncidenceByColumn','maxInitialImpactColumns','lineCellIncidenceDepthHistogram'],Q:[]
  },
  analysisBoundary:[
    'Standard-7x6-only qualified middle fields are preserved in R.standardQualifiedMiddle but excluded from cross-board rank matrices because they are missing elsewhere.',
    'Q is explicitly missing for tomography 0.1 and is never imputed.',
    'Aggregate residual boundary ranks are homological summaries; they do not stand in for marked/sequential cofactor semantics.'
  ]
};

console.log(JSON.stringify({
  schema:'connect4.uc4a_latent_structure_tomography_structural.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md',
  phase:'STRUCTURAL_FREEZE_BEFORE_OUTCOME_JOIN',
  k:K,
  boardCount:rows.length,
  oracleUsed:false,
  solvedInputsUsed:false,
  outcomeLabelsAccessibleToProducer:false,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  bsfpModified:false,
  geometryCohortSource:'Frozen union of the prior 37-board census geometry keys and 15 fresh-validation geometry keys; only W,H identifiers are embedded here, with no W/D/L values.',
  exactStructuralSources:[
    'generated K=4 winning-line geometry and GF(2) incidence rank',
    'aggregate residual cofactor boundary complex',
    'width-path phase/boundary module',
    'safe pure-followup finite automaton',
    'finite top-defect transport module',
    'elementary response frontier and one-setup finite-boundary formulas'
  ],
  fieldRegistry,
  rowHashes,
  structuralAtlasSha256,
  rows,
  boundary:[
    'Every structural row is generated without loading any outcome-bearing file.',
    'No W/D/L token or solved-value field is present in this artifact.',
    'No sealed holdout geometry is present.',
    'Missing Q and generalized response-matroid fields remain null rather than being inferred from outcomes.',
    'This artifact is a frozen structural atlas, not a W/D/L theorem or move-finder premise.'
  ]
},null,2));

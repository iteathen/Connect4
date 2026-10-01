#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'../../../../..');
const sourcePath=resolve(root,'research/isograph/discovery/2026-09-29-center-proof-cycle/BOARD_SIZE_ANALYSIS.json');
const source=JSON.parse(readFileSync(sourcePath,'utf8'));

if(source.status!=='DESCRIPTIVE_EXTERNAL_OUTCOMES_NOT_PROOF_PREMISES')throw new Error('unexpected source status');

const SEALED=new Set(['3x6-k4','5x3-k4']);

function fib(n){
  if(n<=0)return 0;
  let a=0,b=1;
  for(let i=0;i<n;i++){const t=a+b;a=b;b=t;}
  return a;
}
function h4Count(W,c){
  const lo=Math.max(0,c-3);
  const hi=Math.min(c,W-4);
  return Math.max(0,hi-lo+1);
}
function impactProfile(W){
  const values=[];
  for(let c=0;c<W;c++){
    values.push(1+h4Count(W,c)+(c<=W-4?1:0)+(c>=3?1:0));
  }
  const max=Math.max(...values);
  const cols=values.map((v,c)=>({v,c})).filter(x=>x.v===max).map(x=>x.c+1);
  return {values,max,count:cols.length,columns:cols};
}
function signClass(x){return x<0?'NEG':x>0?'POS':'ZERO';}
function safeEntryClass(n){return n===0?'ZERO':n===1?'ONE':'MULTI';}
function topDefectClass(n){
  if(n===1)return 'ONE';
  if((n&1)===0)return 'EVEN_NONZERO';
  return 'ODD_MULTI';
}
function structuralRow(W,H){
  if(W<4||H<4)throw new Error('census formulas frozen for W,H>=4 rows only');
  const a=W-3,b=H-3,d=Math.min(2,a*b);
  const hLines=H*a;
  const vLines=W*b;
  const diagLines=2*a*b;
  const lineCount=hLines+vLines+diagLines;
  const incidenceRank=W*H-9+d;
  const kernelDim=3*a*b-d;
  const axisRank=a+b;
  const yCell=incidenceRank-axisRank;
  const phaseDim=W-1;
  const yLine=kernelDim-phaseDim;
  const coreDelta=yLine-yCell;
  const safeEntries=Math.max(0,8-W);
  const impact=impactProfile(W);
  const elementaryUnresolved=(W-3)*Math.floor((H-1)/2);
  const neutralPairCapacity=Math.floor((H-1)/2)+(W-1)*Math.floor(H/2);
  const topDefectWeight=((H-1)&1)+(W-1)*(H&1);
  const safePhaseWordCount=4*fib(W);
  return {
    width:W,height:H,k:4,
    cells:W*H,
    horizontalLines:hLines,verticalLines:vLines,diagonalLines:diagLines,lineCount,
    incidenceRank,kernelDim,axisRank,yCell,yLine,coreDelta,
    phaseDim,phaseRadius:Math.floor(W/2),centerCount:(W&1)?1:2,
    safeEntryCount:safeEntries,safePhaseWordCount,
    initialImpactProfile:impact.values,
    maxImpact:impact.max,maxImpactCount:impact.count,maxImpactColumns:impact.columns,
    elementaryUnresolved,neutralPairCapacity,topDefectWeight,
    coarse:{
      widthParity:W&1,
      heightParity:H&1,
      cellParity:(W*H)&1,
      safeEntryCount:safeEntries,
      safeEntryClass:safeEntryClass(safeEntries),
      phaseRadiusParity:Math.floor(W/2)&1,
      centerCount:(W&1)?1:2,
      maxImpact:impact.max,
      maxImpactCount:impact.count,
      uniqueMaxImpact:impact.count===1?1:0,
      coreDeltaSign:signClass(coreDelta),
      coreDeltaParity:Math.abs(coreDelta)&1,
      yCellParity:yCell&1,
      yLineParity:yLine&1,
      incidenceRankParity:incidenceRank&1,
      kernelParity:kernelDim&1,
      lineCountParity:lineCount&1,
      elementaryUnresolvedParity:elementaryUnresolved&1,
      topDefectParity:topDefectWeight&1,
      topDefectClass:topDefectClass(topDefectWeight),
      neutralPairParity:neutralPairCapacity&1,
    }
  };
}

// Stage A: build the outcome-blind structural table from geometry only.
const geometries=source.rows.map(r=>({width:r.width,height:r.height,k:4}));
for(const g of geometries){
  const key=`${g.width}x${g.height}-k4`;
  if(SEALED.has(key))throw new Error('sealed holdout unexpectedly present: '+key);
}
const structuralRows=geometries.map(g=>structuralRow(g.width,g.height));

// Stage B: join the frozen labels only after the structural table is complete.
const labelMap=new Map(source.rows.map(r=>[`${r.width}x${r.height}`,r.firstPlayerWdl]));
function outcomeName(v){return v===1?'P1_WIN':v===0?'DRAW':v===-1?'P2_WIN':'UNKNOWN';}
const rows=structuralRows.map(s=>({
  ...s,
  outcome:labelMap.get(`${s.width}x${s.height}`),
  outcomeName:outcomeName(labelMap.get(`${s.width}x${s.height}`))
}));

const features=[
  'widthParity','heightParity','cellParity','safeEntryCount','safeEntryClass',
  'phaseRadiusParity','centerCount','maxImpact','maxImpactCount','uniqueMaxImpact',
  'coreDeltaSign','coreDeltaParity','yCellParity','yLineParity','incidenceRankParity',
  'kernelParity','lineCountParity','elementaryUnresolvedParity','topDefectParity',
  'topDefectClass','neutralPairParity'
];

function signature(row,subset){
  return subset.map(f=>String(row.coarse[f])).join('|');
}
function auditSubset(subset,subsetRows=rows){
  const groups=new Map();
  for(const row of subsetRows){
    const k=signature(row,subset);
    if(!groups.has(k))groups.set(k,{signature:k,labels:new Set(),rows:[]});
    const g=groups.get(k);
    g.labels.add(row.outcomeName);
    g.rows.push(`${row.width}x${row.height}`);
  }
  let pureRows=0,mixedCells=0,pureCells=0,singletonPureCells=0,singletonPureRows=0,minPureSupport=null;
  const cells=[];
  for(const g of groups.values()){
    const pure=g.labels.size===1;
    if(pure){
      pureCells++;
      pureRows+=g.rows.length;
      if(g.rows.length===1){singletonPureCells++;singletonPureRows++;}
      minPureSupport=minPureSupport===null?g.rows.length:Math.min(minPureSupport,g.rows.length);
    } else mixedCells++;
    cells.push({
      signature:g.signature,
      labels:[...g.labels].sort(),
      rows:g.rows,
      pure
    });
  }
  cells.sort((a,b)=>a.signature.localeCompare(b.signature));
  return {
    features:subset,
    signatureCells:groups.size,
    pureCells,mixedCells,pureRows,
    pureRowFraction:pureRows/subsetRows.length,
    singletonPureCells,singletonPureRows,
    minPureSupport,
    cells
  };
}
function crossValidate(subset,axis){
  const values=[...new Set(rows.map(r=>r[axis]))].sort((a,b)=>a-b);
  let predicted=0,correct=0,total=0;
  const folds=[];
  for(const held of values){
    const train=rows.filter(r=>r[axis]!==held);
    const test=rows.filter(r=>r[axis]===held);
    total+=test.length;
    const map=new Map();
    for(const r of train){
      const k=signature(r,subset);
      if(!map.has(k))map.set(k,new Set());
      map.get(k).add(r.outcomeName);
    }
    let foldPred=0,foldCorrect=0;
    const detail=[];
    for(const r of test){
      const k=signature(r,subset);
      const labels=map.get(k);
      const prediction=labels&&labels.size===1?[...labels][0]:null;
      if(prediction!==null){
        predicted++;foldPred++;
        if(prediction===r.outcomeName){correct++;foldCorrect++;}
      }
      detail.push({board:`${r.width}x${r.height}`,signature:k,actual:r.outcomeName,prediction});
    }
    folds.push({held,testRows:test.length,predicted:foldPred,correct:foldCorrect,detail});
  }
  return {
    axis,
    total,
    predicted,
    coverage:total?predicted/total:0,
    correct,
    accuracy:predicted?correct/predicted:null,
    folds
  };
}

const triples=[];
for(let i=0;i<features.length;i++)for(let j=i+1;j<features.length;j++)for(let k=j+1;k<features.length;k++){
  const subset=[features[i],features[j],features[k]];
  const a=auditSubset(subset);
  triples.push({
    ...a,
    cells:undefined
  });
}
triples.sort((a,b)=>
  b.pureRows-a.pureRows ||
  a.mixedCells-b.mixedCells ||
  a.signatureCells-b.signatureCells ||
  a.features.join('|').localeCompare(b.features.join('|'))
);

const topTriples=triples.slice(0,30).map(t=>({
  ...t,
  leaveOneWidthOut:crossValidate(t.features,'width'),
  leaveOneHeightOut:crossValidate(t.features,'height')
}));

const architecturalFeatures=['safeEntryClass','coreDeltaSign','topDefectClass'];
const architectural=auditSubset(architecturalFeatures);
architectural.leaveOneWidthOut=crossValidate(architecturalFeatures,'width');
architectural.leaveOneHeightOut=crossValidate(architecturalFeatures,'height');

const featureOutcomeTables={};
for(const f of features){
  const m=new Map();
  for(const r of rows){
    const v=String(r.coarse[f]);
    if(!m.has(v))m.set(v,{P1_WIN:0,DRAW:0,P2_WIN:0,boards:[]});
    const z=m.get(v);z[r.outcomeName]++;z.boards.push(`${r.width}x${r.height}`);
  }
  featureOutcomeTables[f]=Object.fromEntries([...m.entries()].sort((a,b)=>a[0].localeCompare(b[0])));
}

const outcomeCounts={P1_WIN:0,DRAW:0,P2_WIN:0};
for(const r of rows)outcomeCounts[r.outcomeName]++;

console.log(JSON.stringify({
  schema:'connect4.uc4a_board_outcome_structural_triangle_census.v1',
  date:'2026-10-01',
  hypothesis:'UC4A_BOARD_OUTCOME_STRUCTURAL_TRIANGLE_CENSUS_0_1.md',
  source:{
    path:'research/isograph/discovery/2026-09-29-center-proof-cycle/BOARD_SIZE_ANALYSIS.json',
    sourceSha256:source.sourceSha256,
    status:source.status,
  },
  sealedHoldoutsAccessed:false,
  solvedInputsUsedForStructuralProducer:false,
  outcomeLabelsUsedOnlyPostHoc:true,
  boardCount:rows.length,
  outcomeCounts,
  frozenFeatureVocabulary:features,
  structuralRows,
  labeledRows:rows,
  architecturalTriangle:{
    interpretation:{
      safeEntryClass:'bulk/phase accessibility',
      coreDeltaSign:'line/cell structural core orientation',
      topDefectClass:'finite-boundary lift'
    },
    audit:architectural
  },
  topThreeFeatureSubsets:topTriples,
  featureOutcomeTables,
  conclusion:[
    'The structural producer is geometry-only; W/D/L labels are joined only after every structural row is constructed.',
    'Triple rankings are descriptive discovery evidence and may overfit the incomplete neighboring-board table.',
    'Leave-one-width-out and leave-one-height-out coverage/accuracy are reported to expose whether a signature repeats beyond the board dimensions that selected it.',
    'Any mixed signature is a concrete target for the missing structural coordinate; any pure signature still requires a label-free UC4A/RLC theorem before gameplay use.'
  ],
  boundary:[
    'No sealed formula holdout is accessed.',
    'No board outcome is used to construct any structural feature.',
    'No discovered triple is a W/D/L theorem or an authorized move-finder premise.',
    'The board-size table is incomplete, nonrandom and contains dependent neighboring geometries; no inferential population claim follows.'
  ]
},null,2));

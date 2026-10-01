#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const dir=resolve(import.meta.dirname);
const training=JSON.parse(readFileSync(resolve(dir,'UC4A_BOARD_OUTCOME_STRUCTURAL_TRIANGLE_CENSUS_RESULT_0_1.json'),'utf8'));

if(training.boardCount!==37)throw new Error('unexpected training census size');
if(training.sealedHoldoutsAccessed!==false)throw new Error('training holdout boundary invalid');

const fresh=[
  {width:12,height:4,outcomeName:'P2_WIN'},
  {width:11,height:5,outcomeName:'P1_WIN'},
  {width:10,height:6,outcomeName:'P1_WIN'},
  {width:9,height:7,outcomeName:'P1_WIN'},
  {width:7,height:9,outcomeName:'DRAW'},
  {width:8,height:9,outcomeName:'P1_WIN'},
  {width:6,height:10,outcomeName:'P2_WIN'},
  {width:7,height:10,outcomeName:'P1_WIN'},
  {width:5,height:11,outcomeName:'DRAW'},
  {width:6,height:11,outcomeName:'P1_WIN'},
  {width:4,height:12,outcomeName:'DRAW'},
  {width:5,height:12,outcomeName:'DRAW'},
  {width:6,height:12,outcomeName:'P2_WIN'},
  {width:4,height:13,outcomeName:'DRAW'},
  {width:5,height:13,outcomeName:'DRAW'},
];

const sealed=new Set(['3x6-k4','5x3-k4']);
for(const r of fresh){
  if(sealed.has(`${r.width}x${r.height}-k4`))throw new Error('sealed holdout in fresh set');
  if(training.labeledRows.some(t=>t.width===r.width&&t.height===r.height))throw new Error('fresh board already in training '+r.width+'x'+r.height);
}

function h4Count(W,c){
  const lo=Math.max(0,c-3),hi=Math.min(c,W-4);
  return Math.max(0,hi-lo+1);
}
function impactProfile(W){
  const values=[];
  for(let c=0;c<W;c++)values.push(1+h4Count(W,c)+(c<=W-4?1:0)+(c>=3?1:0));
  const max=Math.max(...values),cols=values.map((v,c)=>({v,c})).filter(x=>x.v===max).map(x=>x.c+1);
  return {max,count:cols.length};
}
function signClass(x){return x<0?'NEG':x>0?'POS':'ZERO';}
function safeEntryClass(n){return n===0?'ZERO':n===1?'ONE':'MULTI';}
function topDefectClass(n){return n===1?'ONE':(n&1)===0?'EVEN_NONZERO':'ODD_MULTI';}
function coarse(W,H){
  const a=W-3,b=H-3,d=Math.min(2,a*b);
  const incidenceRank=W*H-9+d;
  const kernelDim=3*a*b-d;
  const yCell=incidenceRank-(a+b);
  const yLine=kernelDim-(W-1);
  const delta=yLine-yCell;
  const safeEntries=Math.max(0,8-W);
  const impact=impactProfile(W);
  const elementary=(W-3)*Math.floor((H-1)/2);
  const pairs=Math.floor((H-1)/2)+(W-1)*Math.floor(H/2);
  const top=((H-1)&1)+(W-1)*(H&1);
  const lineCount=H*a+W*b+2*a*b;
  return {
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
    coreDeltaSign:signClass(delta),
    coreDeltaParity:Math.abs(delta)&1,
    yCellParity:yCell&1,
    yLineParity:yLine&1,
    incidenceRankParity:incidenceRank&1,
    kernelParity:kernelDim&1,
    lineCountParity:lineCount&1,
    elementaryUnresolvedParity:elementary&1,
    topDefectParity:top&1,
    topDefectClass:topDefectClass(top),
    neutralPairParity:pairs&1,
  };
}

const freshRows=fresh.map(r=>({...r,coarse:coarse(r.width,r.height)}));
const features=training.frozenFeatureVocabulary;
if(JSON.stringify(features)!==JSON.stringify([
  'widthParity','heightParity','cellParity','safeEntryCount','safeEntryClass',
  'phaseRadiusParity','centerCount','maxImpact','maxImpactCount','uniqueMaxImpact',
  'coreDeltaSign','coreDeltaParity','yCellParity','yLineParity','incidenceRankParity',
  'kernelParity','lineCountParity','elementaryUnresolvedParity','topDefectParity',
  'topDefectClass','neutralPairParity'
]))throw new Error('frozen feature vocabulary drift');

function sig(row,fs){return fs.map(f=>String(row.coarse[f])).join('|');}
function makeMap(rows,fs){
  const m=new Map();
  for(const r of rows){
    const k=sig(r,fs);
    if(!m.has(k))m.set(k,{labels:new Set(),boards:[]});
    const g=m.get(k);g.labels.add(r.outcomeName);g.boards.push(`${r.width}x${r.height}`);
  }
  return m;
}
function validateBaseline(fs){
  const trainMap=makeMap(training.labeledRows,fs);
  let predicted=0,correct=0,wrong=0,uncovered=0;
  const rows=[];
  for(const r of freshRows){
    const k=sig(r,fs),g=trainMap.get(k);
    const prediction=g&&g.labels.size===1?[...g.labels][0]:null;
    if(prediction===null)uncovered++;
    else {
      predicted++;
      if(prediction===r.outcomeName)correct++; else wrong++;
    }
    rows.push({
      board:`${r.width}x${r.height}`,
      signature:k,
      actual:r.outcomeName,
      prediction,
      trainingBoards:g?.boards??[],
      trainingLabels:g?[...g.labels].sort():[]
    });
  }
  return {
    features:fs,
    predicted,correct,wrong,uncovered,
    coverage:predicted/freshRows.length,
    accuracy:predicted?correct/predicted:null,
    rows
  };
}
function combinedAudit(fs){
  const all=[...training.labeledRows,...freshRows];
  const m=makeMap(all,fs);
  let pureRows=0,mixedCells=0,pureCells=0;
  const mixed=[];
  for(const [signature,g] of m){
    if(g.labels.size===1){pureCells++;pureRows+=g.boards.length;}
    else{
      mixedCells++;
      mixed.push({signature,labels:[...g.labels].sort(),boards:g.boards});
    }
  }
  mixed.sort((a,b)=>a.signature.localeCompare(b.signature));
  return {features:fs,totalRows:all.length,signatureCells:m.size,pureCells,mixedCells,pureRows,pureRowFraction:pureRows/all.length,mixed};
}

const T1=['heightParity','safeEntryCount','coreDeltaSign'];
const T2=['safeEntryCount','coreDeltaSign','topDefectClass'];
const baselineValidation=[validateBaseline(T1),validateBaseline(T2)];
const baselineCombined=[combinedAudit(T1),combinedAudit(T2)];

function repairs(base){
  const out=[];
  for(const f of features){
    if(base.includes(f))continue;
    const fs=[...base,f];
    const a=combinedAudit(fs);
    out.push({...a,addedFeature:f});
  }
  out.sort((a,b)=>
    a.mixedCells-b.mixedCells ||
    b.pureRows-a.pureRows ||
    a.signatureCells-b.signatureCells ||
    a.addedFeature.localeCompare(b.addedFeature)
  );
  return out;
}

const repairsT1=repairs(T1);
const repairsT2=repairs(T2);

const collisionBoards=['8x6','9x6','10x6','8x8'];
const collisionRows=[...training.labeledRows,...freshRows]
  .filter(r=>collisionBoards.includes(`${r.width}x${r.height}`))
  .map(r=>({
    board:`${r.width}x${r.height}`,
    outcome:r.outcomeName,
    coarse:Object.fromEntries(features.map(f=>[f,r.coarse[f]]))
  }))
  .sort((a,b)=>a.board.localeCompare(b.board));

console.log(JSON.stringify({
  schema:'connect4.uc4a_fresh_board_validation_one_coordinate_repair.v1',
  date:'2026-10-01',
  hypothesis:'UC4A_FRESH_BOARD_VALIDATION_ONE_COORDINATE_REPAIR_0_1.md',
  source:{
    repository:'ChristopheSteininger/c4',
    branch:'master',
    tableDescription:'published README outcome table; extends Tromp board sizes with W+H=16 and additional larger cases',
    externalValidationOnly:true
  },
  sealedHoldoutsAccessed:false,
  trainingBoardCount:training.boardCount,
  freshBoardCount:freshRows.length,
  combinedBoardCount:training.boardCount+freshRows.length,
  freshRows,
  baselineValidation,
  baselineCombined,
  oneCoordinateRepairs:{
    T1:repairsT1,
    T2:repairsT2
  },
  collisionFamily:collisionRows,
  conclusion:[
    'The two triples discovered on the frozen 37-board census are evaluated without modification on 15 newly available solved board geometries.',
    'Any fresh wrong prediction is an explicit falsifier of the original pure-signature claim as a universal outcome carrier.',
    'Repairs are restricted to one feature from the previously frozen 21-feature structural vocabulary; no validation-selected new coordinate is introduced.',
    'A zero-mixed repair is descriptive evidence only and requires a new independent structural derivation before any theorem claim.'
  ],
  boundary:[
    'Fresh W/D/L labels are external validation evidence only.',
    'No fresh outcome changes any feature formula.',
    'No sealed holdout is accessed.',
    'No repaired signature is a gameplay premise or generalized Connect-Four theorem.'
  ]
},null,2));

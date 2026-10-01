#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const dir=resolve(import.meta.dirname);
const CURVATURE_SHA='58ac628a545a434f176e84c834b03f145a7efaf86f2389abb106465b13ea99b3';
const curvature=JSON.parse(readFileSync(resolve(dir,'UC4A_SECOND_ORDER_CURVATURE_STRUCTURAL_0_1.json'),'utf8'));
const original=JSON.parse(readFileSync(resolve(dir,'UC4A_BOARD_OUTCOME_STRUCTURAL_TRIANGLE_CENSUS_RESULT_0_1.json'),'utf8'));
const fresh=JSON.parse(readFileSync(resolve(dir,'UC4A_FRESH_BOARD_VALIDATION_ONE_COORDINATE_REPAIR_RESULT_0_1.json'),'utf8'));

if(curvature.schema!=='connect4.uc4a_second_order_curvature_structural.v1')throw new Error('unexpected curvature atlas schema');
if(curvature.curvatureAtlasSha256!==CURVATURE_SHA)throw new Error('curvature atlas hash drift');
if(curvature.phase!=='CURVATURE_STRUCTURAL_FREEZE_BEFORE_OUTCOME_JOIN')throw new Error('curvature source not frozen before outcome join');
if(curvature.curvatureRowCount!==101||curvature.boardCount!==52)throw new Error('unexpected curvature source size');
if(curvature.oracleUsed!==false||curvature.solvedInputsUsed!==false||curvature.outcomeLabelsAccessibleToProducer!==false)throw new Error('curvature structural boundary invalid');
if(curvature.sealedHoldoutsAccessed!==false)throw new Error('curvature source holdout boundary invalid');
if(original.boardCount!==37||fresh.freshBoardCount!==15||fresh.combinedBoardCount!==52)throw new Error('unexpected label source sizes');
if(original.sealedHoldoutsAccessed!==false||fresh.sealedHoldoutsAccessed!==false)throw new Error('label source holdout boundary invalid');

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function absBig(x){return x<0n?-x:x;}
function gcdBig(a,b){
  a=absBig(a);b=absBig(b);
  while(b!==0n){const t=a%b;a=b;b=t;}
  return a;
}
function frac(n,d=1n){
  if(d===0n)throw new Error('zero denominator');
  if(n===0n)return {n:0n,d:1n};
  if(d<0n){n=-n;d=-d;}
  const g=gcdBig(n,d);
  return {n:n/g,d:d/g};
}
function fsub(a,b){return frac(a.n*b.d-b.n*a.d,a.d*b.d);}
function fdiv(a,b){return frac(a.n*b.d,a.d*b.n);}
function fzero(a){return a.n===0n;}

const labelMap=new Map();
const sourceMap=new Map();
for(const r of original.labeledRows){
  const key=`${r.width}x${r.height}`;
  if(labelMap.has(key))throw new Error('duplicate original label '+key);
  labelMap.set(key,r.outcomeName);sourceMap.set(key,'ORIGINAL_37');
}
for(const r of fresh.freshRows){
  const key=`${r.width}x${r.height}`;
  if(labelMap.has(key))throw new Error('fresh label duplicates original '+key);
  labelMap.set(key,r.outcomeName);sourceMap.set(key,'FRESH_15');
}
if(labelMap.size!==52)throw new Error('expected 52 board labels');
for(const row of curvature.rows)for(const board of row.boards){
  if(!labelMap.has(board))throw new Error('missing label '+board);
  if(board==='3x6'||board==='5x3')throw new Error('sealed holdout geometry accessed');
}

const integerFields=curvature.fieldRegistry.integerFields;
const gf2Fields=curvature.fieldRegistry.gf2Fields;
const blockOrder=curvature.fieldRegistry.blockOrder;
function blockOf(field){return field.split('.')[0];}

function annotate(row){
  const outcomes=row.boards.map(board=>labelMap.get(board));
  let perimeter=[];
  if(row.family==='WIDTH2'||row.family==='HEIGHT2'){
    perimeter=[
      {edge:`${row.boards[0]}->${row.boards[1]}`,a:0,b:1,changed:outcomes[0]!==outcomes[1]},
      {edge:`${row.boards[1]}->${row.boards[2]}`,a:1,b:2,changed:outcomes[1]!==outcomes[2]}
    ];
  }else if(row.family==='MIXED'){
    perimeter=[
      {edge:`${row.boards[0]}->${row.boards[1]}`,a:0,b:1,orientation:'horizontal',changed:outcomes[0]!==outcomes[1]},
      {edge:`${row.boards[0]}->${row.boards[2]}`,a:0,b:2,orientation:'vertical',changed:outcomes[0]!==outcomes[2]},
      {edge:`${row.boards[1]}->${row.boards[3]}`,a:1,b:3,orientation:'vertical',changed:outcomes[1]!==outcomes[3]},
      {edge:`${row.boards[2]}->${row.boards[3]}`,a:2,b:3,orientation:'horizontal',changed:outcomes[2]!==outcomes[3]}
    ];
  }else throw new Error('unknown curvature family '+row.family);
  const boundaryEdgeCount=perimeter.filter(x=>x.changed).length;
  const annotation={
    outcomeWord:outcomes,
    outcomeWordKey:outcomes.join('>'),
    perimeter,
    boundaryEdgeCount,
    boundaryAdjacent:boundaryEdgeCount>0,
    homogeneous:boundaryEdgeCount===0,
    sources:[...new Set(row.boards.map(board=>sourceMap.get(board)))].sort()
  };
  if(row.family==='MIXED'){
    annotation.horizontalBoundaryPattern=[perimeter[0].changed,perimeter[3].changed];
    annotation.verticalBoundaryPattern=[perimeter[1].changed,perimeter[2].changed];
  }
  return {...row,annotation};
}
const rows=curvature.rows.map(annotate);

function rationalAnalysis(matrix,fields){
  const m=matrix.length,n=fields.length;
  if(n===0)return {rank:0,nullity:0,nullspaceBasis:[]};
  if(m===0)return {rank:0,nullity:n,nullspaceBasis:fields.map((field,i)=>({freeField:field,support:[field],coefficients:fields.map((_,j)=>j===i?'1':'0')}))};
  const A=Array.from({length:m},(_,i)=>Array.from({length:n},(_,j)=>frac(BigInt(matrix[i][j]))));
  let r=0;
  const pivots=[];
  for(let col=0;col<n&&r<m;col++){
    let p=r;
    while(p<m&&fzero(A[p][col]))p++;
    if(p===m)continue;
    [A[r],A[p]]=[A[p],A[r]];
    const pivot=A[r][col];
    for(let j=col;j<n;j++)A[r][j]=fdiv(A[r][j],pivot);
    for(let i=0;i<m;i++){
      if(i===r||fzero(A[i][col]))continue;
      const q=A[i][col];
      for(let j=col;j<n;j++){
        const product=frac(q.n*A[r][j].n,q.d*A[r][j].d);
        A[i][j]=fsub(A[i][j],product);
      }
    }
    pivots.push(col);r++;
  }
  const pivotSet=new Set(pivots);
  const free=[];
  for(let col=0;col<n;col++)if(!pivotSet.has(col))free.push(col);
  const nullspaceBasis=[];
  for(const f of free){
    const v=Array.from({length:n},()=>frac(0n));
    v[f]=frac(1n);
    for(let i=0;i<pivots.length;i++)v[pivots[i]]=frac(-A[i][f].n,A[i][f].d);
    nullspaceBasis.push({
      freeField:fields[f],
      support:v.map((x,i)=>x.n!==0n?fields[i]:null).filter(Boolean),
      coefficients:v.map(x=>x.d===1n?x.n.toString():`${x.n}/${x.d}`)
    });
  }
  return {rank:r,nullity:n-r,nullspaceBasis};
}
function gf2Analysis(matrix,fields){
  const n=fields.length;
  if(n===0)return {rank:0,nullity:0,nullspaceBasis:[]};
  if(matrix.length===0)return {rank:0,nullity:n,nullspaceBasis:fields.map(field=>[field])};
  const rowMasks=matrix.map(row=>row.reduce((m,x,i)=>x?(m|(1n<<BigInt(i))):m,0n));
  let r=0;
  const pivots=[];
  for(let col=0;col<n&&r<rowMasks.length;col++){
    const bit=1n<<BigInt(col);
    let p=r;
    while(p<rowMasks.length&&(rowMasks[p]&bit)===0n)p++;
    if(p===rowMasks.length)continue;
    [rowMasks[r],rowMasks[p]]=[rowMasks[p],rowMasks[r]];
    for(let i=0;i<rowMasks.length;i++)if(i!==r&&(rowMasks[i]&bit))rowMasks[i]^=rowMasks[r];
    pivots.push(col);r++;
  }
  const pivotSet=new Set(pivots);
  const free=[];
  for(let col=0;col<n;col++)if(!pivotSet.has(col))free.push(col);
  const basis=[];
  for(const f of free){
    let v=1n<<BigInt(f);
    for(let i=0;i<pivots.length;i++)if(rowMasks[i]&(1n<<BigInt(f)))v|=1n<<BigInt(pivots[i]);
    basis.push(fields.filter((_,i)=>v&(1n<<BigInt(i))));
  }
  return {rank:r,nullity:n-r,nullspaceBasis:basis};
}
function matrixFor(source,fields,type){
  return source.map(row=>fields.map(field=>type==='integer'?row.integer[field]:row.gf2[field]));
}
function perBlockRanks(source,type){
  const allFields=type==='integer'?integerFields:gf2Fields;
  const out={};
  for(const block of blockOrder){
    const fields=allFields.filter(field=>blockOf(field)===block);
    if(!fields.length){out[block]={fieldCount:0,rank:0};continue;}
    const analysis=type==='integer'
      ? rationalAnalysis(matrixFor(source,fields,type),fields)
      : gf2Analysis(matrixFor(source,fields,type),fields);
    out[block]={fieldCount:fields.length,rank:analysis.rank};
  }
  return out;
}
function rankReport(source,type){
  const fields=type==='integer'?integerFields:gf2Fields;
  const analysis=type==='integer'
    ? rationalAnalysis(matrixFor(source,fields,type),fields)
    : gf2Analysis(matrixFor(source,fields,type),fields);
  return {
    rowCount:source.length,
    fieldCount:fields.length,
    ...analysis,
    perBlock:perBlockRanks(source,type)
  };
}
function familyRows(family){
  return family==='COMBINED'?rows:rows.filter(x=>x.family===family);
}
function rankAnalysisFor(type){
  const out={};
  for(const family of ['WIDTH2','HEIGHT2','MIXED','COMBINED']){
    const all=familyRows(family);
    const boundary=all.filter(x=>x.annotation.boundaryAdjacent);
    const homogeneous=all.filter(x=>x.annotation.homogeneous);
    const allReport=rankReport(all,type);
    const boundaryReport=rankReport(boundary,type);
    const homogeneousReport=rankReport(homogeneous,type);
    out[family]={
      all:allReport,
      boundary:boundaryReport,
      homogeneous:homogeneousReport,
      boundaryNovelDimension:allReport.rank-homogeneousReport.rank,
      homogeneousNovelDimension:allReport.rank-boundaryReport.rank
    };
  }
  return out;
}
const rankAnalysis={
  integer:rankAnalysisFor('integer'),
  gf2:rankAnalysisFor('gf2')
};

for(const [family,expected] of Object.entries({WIDTH2:9,HEIGHT2:5,MIXED:6,COMBINED:12})){
  if(rankAnalysis.integer[family].all.rank!==expected)throw new Error('integer all-rank drift '+family);
}
for(const [family,expected] of Object.entries({WIDTH2:3,HEIGHT2:2,MIXED:3,COMBINED:4})){
  if(rankAnalysis.gf2[family].all.rank!==expected)throw new Error('GF2 all-rank drift '+family);
}

function repeatedModeCensus(){
  const groups=new Map();
  for(const row of rows){
    if(!groups.has(row.signatureHash))groups.set(row.signatureHash,[]);
    groups.get(row.signatureHash).push(row);
  }
  const out=[];
  for(const [signatureHash,g] of groups){
    if(g.length<2)continue;
    const widths=new Set(),heights=new Set();
    for(const row of g)for(const board of row.boards){
      const [w,h]=board.split('x').map(Number);widths.add(w);heights.add(h);
    }
    const boundaryCount=g.filter(x=>x.annotation.boundaryAdjacent).length;
    const homogeneousCount=g.length-boundaryCount;
    out.push({
      signatureHash,
      count:g.length,
      families:[...new Set(g.map(x=>x.family))].sort(),
      rowIds:g.map(x=>x.id).sort(),
      widths:[...widths].sort((a,b)=>a-b),
      heights:[...heights].sort((a,b)=>a-b),
      distinctWidthCount:widths.size,
      distinctHeightCount:heights.size,
      boundaryAdjacentCount:boundaryCount,
      homogeneousCount,
      occursBoundaryAndHomogeneous:boundaryCount>0&&homogeneousCount>0,
      boundaryEdgeCounts:[...new Set(g.map(x=>x.annotation.boundaryEdgeCount))].sort((a,b)=>a-b),
      outcomeWords:[...new Set(g.map(x=>x.annotation.outcomeWordKey))].sort()
    });
  }
  return out.sort((a,b)=>b.count-a.count||a.signatureHash.localeCompare(b.signatureHash));
}
const repeatedModes=repeatedModeCensus();

function blockSupportReport(source){
  const patterns=new Map();
  for(const row of source){
    const key=row.nonzeroBlocks.join('+')||'ZERO';
    if(!patterns.has(key))patterns.set(key,{pattern:key,count:0,rows:[]});
    const p=patterns.get(key);p.count++;p.rows.push(row.id);
  }
  const blocksEverNonzero=blockOrder.filter(block=>source.some(row=>row.nonzeroBlocks.includes(block)));
  const blocksNonzeroOnEveryRow=source.length
    ? blockOrder.filter(block=>source.every(row=>row.nonzeroBlocks.includes(block)))
    : [];
  return {
    rowCount:source.length,
    blocksEverNonzero,
    blocksNonzeroOnEveryRow,
    patterns:[...patterns.values()].sort((a,b)=>b.count-a.count||a.pattern.localeCompare(b.pattern))
  };
}
const blockSupport={};
for(const family of ['WIDTH2','HEIGHT2','MIXED','COMBINED']){
  const all=familyRows(family);
  blockSupport[family]={
    all:blockSupportReport(all),
    boundary:blockSupportReport(all.filter(x=>x.annotation.boundaryAdjacent)),
    homogeneous:blockSupportReport(all.filter(x=>x.annotation.homogeneous))
  };
}

function touchedDimension(row,axis,value){
  return row.boards.some(board=>{
    const [w,h]=board.split('x').map(Number);
    return (axis==='width'?w:h)===value;
  });
}
function heldOutReports(type,family,axis){
  const source=familyRows(family).filter(x=>x.annotation.boundaryAdjacent);
  const values=[...new Set(curvature.rows.flatMap(row=>row.boards).map(board=>{
    const [w,h]=board.split('x').map(Number);
    return axis==='width'?w:h;
  }))].sort((a,b)=>a-b);
  const reports=values.map(held=>{
    const kept=source.filter(row=>!touchedDimension(row,axis,held));
    return {held,rowCount:kept.length,rank:rankReport(kept,type).rank};
  });
  return {
    axis,
    reports,
    minRank:reports.length?Math.min(...reports.map(x=>x.rank)):0,
    maxRank:reports.length?Math.max(...reports.map(x=>x.rank)):0
  };
}
function heldOutFor(type){
  const out={};
  for(const family of ['WIDTH2','HEIGHT2','MIXED','COMBINED']){
    out[family]={
      width:heldOutReports(type,family,'width'),
      height:heldOutReports(type,family,'height')
    };
  }
  return out;
}
const heldOut={integer:heldOutFor('integer'),gf2:heldOutFor('gf2')};

const neighborhoodClassCounts={};
for(const family of ['WIDTH2','HEIGHT2','MIXED','COMBINED']){
  const source=familyRows(family);
  const histogram={};
  for(const row of source)histogram[row.annotation.boundaryEdgeCount]=(histogram[row.annotation.boundaryEdgeCount]??0)+1;
  neighborhoodClassCounts[family]={
    rows:source.length,
    boundaryAdjacent:source.filter(x=>x.annotation.boundaryAdjacent).length,
    homogeneous:source.filter(x=>x.annotation.homogeneous).length,
    boundaryEdgeCountHistogram:histogram
  };
}

const focusRow=rows.find(x=>x.id==='WIDTH2:8x6|9x6|10x6');
if(!focusRow)throw new Error('required focus row missing');
const exactSignatureMatches=curvature.rows.filter(x=>x.signatureHash===focusRow.signatureHash).map(x=>x.id).sort();

function compactAnnotatedRow(row){
  return {
    id:row.id,
    family:row.family,
    boards:row.boards,
    signatureHash:row.signatureHash,
    outcomeWord:row.annotation.outcomeWord,
    boundaryEdgeCount:row.annotation.boundaryEdgeCount,
    boundaryAdjacent:row.annotation.boundaryAdjacent,
    homogeneous:row.annotation.homogeneous,
    nonzeroBlocks:row.nonzeroBlocks,
    nonzeroIntegerFields:row.nonzeroIntegerFields,
    nonzeroGf2Fields:row.nonzeroGf2Fields
  };
}

const allBoundaryNovel={
  integer:Object.fromEntries(Object.entries(rankAnalysis.integer).map(([k,v])=>[k,v.boundaryNovelDimension])),
  gf2:Object.fromEntries(Object.entries(rankAnalysis.gf2).map(([k,v])=>[k,v.boundaryNovelDimension]))
};
const mixedModeCount=repeatedModes.filter(x=>x.occursBoundaryAndHomogeneous).length;

console.log(JSON.stringify({
  schema:'connect4.uc4a_second_order_curvature_analysis.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_SECOND_ORDER_CURVATURE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md',
  analysisProtocol:'UC4A_SECOND_ORDER_CURVATURE_ANALYSIS_PROTOCOL_0_1.md',
  curvatureAtlas:'UC4A_SECOND_ORDER_CURVATURE_STRUCTURAL_0_1.json',
  curvatureAtlasSha256:CURVATURE_SHA,
  structuralAtlasSha256:curvature.structuralAtlasSha256,
  boardCount:curvature.boardCount,
  labelCount:labelMap.size,
  curvatureRowCount:rows.length,
  outcomeLabelsUsedOnlyAfterCurvatureFreeze:true,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  bsfpModified:false,
  neighborhoodClassCounts,
  rankAnalysis,
  repeatedModes,
  repeatedModeSummary:{
    repeatedModeCount:repeatedModes.length,
    boundaryPureCount:repeatedModes.filter(x=>x.boundaryAdjacentCount>0&&x.homogeneousCount===0).length,
    homogeneousPureCount:repeatedModes.filter(x=>x.homogeneousCount>0&&x.boundaryAdjacentCount===0).length,
    mixedBoundaryBehaviorCount:mixedModeCount
  },
  blockSupport,
  heldOut,
  focus:{
    '8x6_9x6_10x6':{
      ...compactAnnotatedRow(focusRow),
      exactSignatureMatches,
      integer:{
        pathRadius:focusRow.integer['P.pathRadius'],
        safeDerivativeWordCount:focusRow.integer['P.safeDerivativeWordCount'],
        pairDisplacementNullity:focusRow.integer['P.pairDisplacementNullity'],
        coreDelta:focusRow.integer['I.coreDelta']
      },
      gf2:{
        phaseRadiusParity:focusRow.gf2['P.phaseRadiusParity']
      }
    }
  },
  annotatedRows:rows.map(compactAnnotatedRow),
  conclusion:[
    `The frozen curvature atlas contains ${rows.length} neighborhoods; ${neighborhoodClassCounts.COMBINED.boundaryAdjacent} are adjacent to at least one outcome boundary and ${neighborhoodClassCounts.COMBINED.homogeneous} are homogeneous.`,
    `Combined integer curvature ranks are all=${rankAnalysis.integer.COMBINED.all.rank}, boundary=${rankAnalysis.integer.COMBINED.boundary.rank}, homogeneous=${rankAnalysis.integer.COMBINED.homogeneous.rank}; boundary-novel dimension=${rankAnalysis.integer.COMBINED.boundaryNovelDimension}.`,
    `Combined GF(2) curvature ranks are all=${rankAnalysis.gf2.COMBINED.all.rank}, boundary=${rankAnalysis.gf2.COMBINED.boundary.rank}, homogeneous=${rankAnalysis.gf2.COMBINED.homogeneous.rank}; boundary-novel dimension=${rankAnalysis.gf2.COMBINED.boundaryNovelDimension}.`,
    `Among ${repeatedModes.length} repeated frozen curvature signatures, ${mixedModeCount} occur in both boundary-adjacent and homogeneous neighborhoods.`,
    `The 8x6/9x6/10x6 pure-width curvature signature has ${exactSignatureMatches.length} exact match(es) in the frozen atlas.`,
    'No rank target was imposed and no label altered a structural curvature row.'
  ],
  boundary:[
    'This is descriptive curvature tomography evidence and not a theorem of Connect Four value.',
    'Outcome labels annotate only already-frozen curvature rows and never enter the structural operators.',
    'No sealed formula holdout is inspected, reconstructed, solved, inferred, or indirectly recovered.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.',
    'A low curvature rank, repeated mode, or boundary-pure signature is not a runtime move-finder premise.'
  ]
},null,2));

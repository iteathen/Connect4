#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const dir=resolve(import.meta.dirname);
const STRUCTURAL_SHA='49844e4772a337d92ab10735d8bc13d1c5570edb6a1b382d4fb0660205d21760';
const structural=JSON.parse(readFileSync(resolve(dir,'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_STRUCTURAL_0_1.json'),'utf8'));

if(structural.schema!=='connect4.uc4a_latent_structure_tomography_structural.v1')throw new Error('unexpected structural atlas schema');
if(structural.structuralAtlasSha256!==STRUCTURAL_SHA)throw new Error('structural atlas hash drift');
if(structural.phase!=='STRUCTURAL_FREEZE_BEFORE_OUTCOME_JOIN')throw new Error('structural atlas was not frozen before outcome join');
if(structural.boardCount!==52)throw new Error('expected 52-board structural atlas');
if(structural.oracleUsed!==false||structural.solvedInputsUsed!==false||structural.outcomeLabelsAccessibleToProducer!==false)throw new Error('structural source boundary invalid');
if(structural.sealedHoldoutsAccessed!==false)throw new Error('structural source holdout boundary invalid');

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256(value){
  return createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');
}
function getPath(obj,path){
  let cur=obj;
  for(const part of path.split('.'))cur=cur?.[part];
  return cur;
}
function absBig(x){return x<0n?-x:x;}
function gcdBig(a,b){
  a=absBig(a);b=absBig(b);
  while(b!==0n){const t=a%b;a=b;b=t;}
  return a;
}
function popcountBig(x){
  let n=0;
  while(x!==0n){x&=x-1n;n++;}
  return n;
}

function scalarRegistry(kind){
  const src=structural.fieldRegistry[kind];
  const out=[];
  for(const block of structural.fieldRegistry.blockOrder){
    for(const path of src[block]??[])out.push({name:`${block}.${path}`,block,path});
  }
  return out;
}
const integerMeta=scalarRegistry('integerDeltaFields');
const gf2Meta=scalarRegistry('gf2DeltaFields');
const integerFields=integerMeta.map(x=>x.name);
const gf2Fields=gf2Meta.map(x=>x.name);
const blockOrder=structural.fieldRegistry.blockOrder;

function scalar(row,meta){return getPath(row.blocks[meta.block],meta.path);}
const rows=[...structural.rows].sort((a,b)=>a.width-b.width||a.height-b.height);
const byBoard=new Map(rows.map(x=>[x.board,x]));
if(byBoard.size!==52)throw new Error('structural board keys not unique');
if(byBoard.has('3x6')||byBoard.has('5x3'))throw new Error('sealed holdout geometry present');

function integerCurvature3(a,b,c){
  const out={};
  for(const m of integerMeta)out[m.name]=Number(scalar(c,m))-2*Number(scalar(b,m))+Number(scalar(a,m));
  return out;
}
function gf2Curvature3(a,b,c){
  const out={};
  for(const m of gf2Meta){
    const x=Number(scalar(a,m)),y=Number(scalar(b,m)),z=Number(scalar(c,m));
    out[m.name]=(x^y)^(y^z);
  }
  return out;
}
function integerMixed(a,b,c,d){
  const out={};
  for(const m of integerMeta)out[m.name]=Number(scalar(d,m))-Number(scalar(b,m))-Number(scalar(c,m))+Number(scalar(a,m));
  return out;
}
function gf2Mixed(a,b,c,d){
  const out={};
  for(const m of gf2Meta)out[m.name]=Number(scalar(a,m))^Number(scalar(b,m))^Number(scalar(c,m))^Number(scalar(d,m));
  return out;
}
function makeCurvatureRow(family,boards,integer,gf2,anchor){
  const nonzeroIntegerFields=integerFields.filter(name=>integer[name]!==0);
  const nonzeroGf2Fields=gf2Fields.filter(name=>gf2[name]!==0);
  const nonzeroBlocks=[...new Set([
    ...integerMeta.filter(m=>integer[m.name]!==0).map(m=>m.block),
    ...gf2Meta.filter(m=>gf2[m.name]!==0).map(m=>m.block)
  ])].sort((a,b)=>blockOrder.indexOf(a)-blockOrder.indexOf(b));
  const signatureHash=sha256({integer,gf2});
  return {
    family,
    id:`${family}:${boards.join('|')}`,
    boards,
    anchor,
    integer,
    gf2,
    nonzeroIntegerFields,
    nonzeroGf2Fields,
    nonzeroBlocks,
    zeroCurvature:nonzeroIntegerFields.length===0&&nonzeroGf2Fields.length===0,
    signatureHash
  };
}

const curvatureRows=[];
for(const a of rows){
  const b=byBoard.get(`${a.width+1}x${a.height}`);
  const c=byBoard.get(`${a.width+2}x${a.height}`);
  if(b&&c){
    curvatureRows.push(makeCurvatureRow(
      'WIDTH2',
      [a.board,b.board,c.board],
      integerCurvature3(a,b,c),
      gf2Curvature3(a,b,c),
      {width:a.width,height:a.height,dW:2,dH:0}
    ));
  }
}
for(const a of rows){
  const b=byBoard.get(`${a.width}x${a.height+1}`);
  const c=byBoard.get(`${a.width}x${a.height+2}`);
  if(b&&c){
    curvatureRows.push(makeCurvatureRow(
      'HEIGHT2',
      [a.board,b.board,c.board],
      integerCurvature3(a,b,c),
      gf2Curvature3(a,b,c),
      {width:a.width,height:a.height,dW:0,dH:2}
    ));
  }
}
for(const a of rows){
  const b=byBoard.get(`${a.width+1}x${a.height}`);
  const c=byBoard.get(`${a.width}x${a.height+1}`);
  const d=byBoard.get(`${a.width+1}x${a.height+1}`);
  if(b&&c&&d){
    curvatureRows.push(makeCurvatureRow(
      'MIXED',
      [a.board,b.board,c.board,d.board],
      integerMixed(a,b,c,d),
      gf2Mixed(a,b,c,d),
      {width:a.width,height:a.height,dW:1,dH:1}
    ));
  }
}
const familyOrder=new Map([['WIDTH2',0],['HEIGHT2',1],['MIXED',2]]);
curvatureRows.sort((a,b)=>familyOrder.get(a.family)-familyOrder.get(b.family)||a.boards.join('|').localeCompare(b.boards.join('|')));

const familyCounts={
  WIDTH2:curvatureRows.filter(x=>x.family==='WIDTH2').length,
  HEIGHT2:curvatureRows.filter(x=>x.family==='HEIGHT2').length,
  MIXED:curvatureRows.filter(x=>x.family==='MIXED').length
};
if(stable(familyCounts)!==stable({WIDTH2:32,HEIGHT2:35,MIXED:34}))throw new Error('curvature neighborhood census drift');
if(curvatureRows.length!==101)throw new Error('expected 101 curvature rows');

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

function rationalAnalysis(matrix,fields){
  const m=matrix.length,n=fields.length;
  if(n===0)return {rank:0,nullity:0,nullspaceBasis:[]};
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
  const basisMasks=[];
  for(const f of free){
    let v=1n<<BigInt(f);
    for(let i=0;i<pivots.length;i++)if(rowMasks[i]&(1n<<BigInt(f)))v|=1n<<BigInt(pivots[i]);
    basisMasks.push(v);
  }
  const support=mask=>fields.filter((_,i)=>mask&(1n<<BigInt(i)));
  let minimalCircuits={exhaustive:false,supports:basisMasks.map(support)};
  if(basisMasks.length<=18){
    const antichain=[];
    const total=1<<basisMasks.length;
    for(let combo=1;combo<total;combo++){
      let v=0n;
      for(let i=0;i<basisMasks.length;i++)if(combo&(1<<i))v^=basisMasks[i];
      if(v===0n)continue;
      if(antichain.some(x=>(x&v)===x))continue;
      for(let i=antichain.length-1;i>=0;i--)if((antichain[i]&v)===v)antichain.splice(i,1);
      antichain.push(v);
    }
    antichain.sort((a,b)=>popcountBig(a)-popcountBig(b)||(a<b?-1:a>b?1:0));
    minimalCircuits={exhaustive:true,supports:antichain.map(support)};
  }
  return {
    rank:r,
    nullity:n-r,
    nullspaceBasis:basisMasks.map(support),
    minimalCircuits
  };
}

function matrixFor(source,meta,type){
  return source.map(row=>meta.map(m=>type==='integer'?row.integer[m.name]:row.gf2[m.name]));
}
function perBlockRanks(source,type){
  const meta=type==='integer'?integerMeta:gf2Meta;
  const out={};
  for(const block of blockOrder){
    const fields=meta.filter(x=>x.block===block);
    if(!fields.length){out[block]={fieldCount:0,rank:0};continue;}
    const matrix=matrixFor(source,fields,type);
    const analysis=type==='integer'
      ? rationalAnalysis(matrix,fields.map(x=>x.name))
      : gf2Analysis(matrix,fields.map(x=>x.name));
    out[block]={fieldCount:fields.length,rank:analysis.rank};
  }
  return out;
}
function rankReport(source,type){
  const meta=type==='integer'?integerMeta:gf2Meta;
  const fields=type==='integer'?integerFields:gf2Fields;
  const matrix=matrixFor(source,meta,type);
  const analysis=type==='integer'?rationalAnalysis(matrix,fields):gf2Analysis(matrix,fields);
  return {
    rowCount:source.length,
    fieldCount:fields.length,
    ...analysis,
    perBlock:perBlockRanks(source,type)
  };
}
function rankFamily(type){
  const out={};
  for(const family of ['WIDTH2','HEIGHT2','MIXED']){
    out[family]=rankReport(curvatureRows.filter(x=>x.family===family),type);
  }
  out.COMBINED=rankReport(curvatureRows,type);
  return out;
}
const rankSummary={
  integer:rankFamily('integer'),
  gf2:rankFamily('gf2')
};

function signatureSummary(source){
  const groups=new Map();
  for(const row of source){
    if(!groups.has(row.signatureHash))groups.set(row.signatureHash,{
      signatureHash:row.signatureHash,
      count:0,
      families:new Set(),
      widths:new Set(),
      heights:new Set(),
      rows:[]
    });
    const g=groups.get(row.signatureHash);
    g.count++;
    g.families.add(row.family);
    for(const board of row.boards){
      const [w,h]=board.split('x').map(Number);
      g.widths.add(w);g.heights.add(h);
    }
    g.rows.push(row.id);
  }
  const all=[...groups.values()].map(g=>({
    signatureHash:g.signatureHash,
    count:g.count,
    families:[...g.families].sort((a,b)=>familyOrder.get(a)-familyOrder.get(b)),
    widths:[...g.widths].sort((a,b)=>a-b),
    heights:[...g.heights].sort((a,b)=>a-b),
    distinctWidthCount:g.widths.size,
    distinctHeightCount:g.heights.size,
    recursAcrossWidths:g.widths.size>1,
    recursAcrossHeights:g.heights.size>1,
    rows:g.rows.sort()
  })).sort((a,b)=>b.count-a.count||a.signatureHash.localeCompare(b.signatureHash));
  return {
    rowCount:source.length,
    distinctSignatureCount:groups.size,
    repeatedSignatureCount:all.filter(x=>x.count>1).length,
    zeroCurvatureRowCount:source.filter(x=>x.zeroCurvature).length,
    recurringAcrossWidths:all.filter(x=>x.count>1&&x.recursAcrossWidths),
    recurringAcrossHeights:all.filter(x=>x.count>1&&x.recursAcrossHeights),
    repeatedSignatures:all.filter(x=>x.count>1)
  };
}
const signatureSummaryByFamily={};
for(const family of ['WIDTH2','HEIGHT2','MIXED'])signatureSummaryByFamily[family]=signatureSummary(curvatureRows.filter(x=>x.family===family));
signatureSummaryByFamily.COMBINED=signatureSummary(curvatureRows);

const rowHashes=curvatureRows.map(row=>({id:row.id,sha256:sha256(row)}));
const curvatureAtlasSha256=sha256(rowHashes.map(x=>`${x.id}:${x.sha256}`).join('\n'));

const focus=curvatureRows.find(x=>x.family==='WIDTH2'&&x.boards.join('|')==='8x6|9x6|10x6');
if(!focus)throw new Error('missing required 8x6/9x6/10x6 curvature row');

console.log(JSON.stringify({
  schema:'connect4.uc4a_second_order_curvature_structural.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_SECOND_ORDER_CURVATURE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md',
  phase:'CURVATURE_STRUCTURAL_FREEZE_BEFORE_OUTCOME_JOIN',
  structuralAtlas:'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_STRUCTURAL_0_1.json',
  structuralAtlasSha256:STRUCTURAL_SHA,
  boardCount:rows.length,
  curvatureRowCount:curvatureRows.length,
  familyCounts,
  oracleUsed:false,
  solvedInputsUsed:false,
  outcomeLabelsAccessibleToProducer:false,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  bsfpModified:false,
  fieldRegistry:{
    integerFields,
    gf2Fields,
    blockOrder,
    categoricalFieldsExcludedFromCurvatureAlgebra:true,
    note:'Second-order operators consume only the integer and GF(2) fields frozen in the corrected first-order structural atlas.'
  },
  rankSummary,
  signatureSummary:signatureSummaryByFamily,
  focus:{
    requiredNeighborhood:'8x6|9x6|10x6',
    signatureHash:focus.signatureHash,
    nonzeroIntegerFields:focus.nonzeroIntegerFields,
    nonzeroGf2Fields:focus.nonzeroGf2Fields,
    nonzeroBlocks:focus.nonzeroBlocks
  },
  rowHashes,
  curvatureAtlasSha256,
  rows:curvatureRows,
  boundary:[
    'All curvature rows are generated from the already-frozen structural atlas before any outcome-bearing source is opened.',
    'No solved input, oracle, fitted threshold, candidate triangle coordinate, or value label is used by this producer.',
    'The sealed formula holdouts remain outside the source atlas and are not accessed.',
    'Production CPC, JSMinSys, and BSFP are unchanged.',
    'Curvature rank or repeated structural signatures are discovery evidence only, not game-value theorems.'
  ]
},null,2));

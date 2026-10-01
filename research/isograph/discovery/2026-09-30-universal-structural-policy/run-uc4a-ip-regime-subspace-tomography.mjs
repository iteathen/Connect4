#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const dir=resolve(import.meta.dirname);
const STRUCTURAL_SHA='374d744378bf71b77db0711d1eb2ef4a21ec1cb4c80736aa206abd4520dd1aa9';
const structural=JSON.parse(readFileSync(resolve(dir,'UC4A_IP_SYMMETRY_PHASE_STRUCTURAL_0_1.json'),'utf8'));

if(structural.schema!=='connect4.uc4a_ip_symmetry_phase_structural.v1')throw new Error('unexpected structural source schema');
if(structural.phase!=='LABEL_FREE_IP_STRUCTURAL_MODE_FREEZE')throw new Error('structural source is not label-free freeze');
if(structural.structuralAtlasSha256!==STRUCTURAL_SHA)throw new Error('structural atlas hash drift');
if(structural.curvatureRowCount!==430)throw new Error('unexpected structural curvature count');
if(structural.outcomeLabelsAccessibleToProducer!==false||structural.localizationArtifactAccessibleToProducer!==false)throw new Error('source isolation boundary invalid');
if(structural.sealedHoldoutsAccessed!==false)throw new Error('source holdout boundary invalid');

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256(value){return createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');}
function absBig(x){return x<0n?-x:x;}
function gcdBig(a,b){a=absBig(a);b=absBig(b);while(b!==0n){const t=a%b;a=b;b=t;}return a;}
function lcmBig(a,b){if(a===0n||b===0n)return 0n;return absBig(a/gcdBig(a,b)*b);}

function frac(n,d=1n){
  if(d===0n)throw new Error('zero denominator');
  if(n===0n)return {n:0n,d:1n};
  if(d<0n){n=-n;d=-d;}
  const g=gcdBig(n,d);return {n:n/g,d:d/g};
}
function fsub(a,b){return frac(a.n*b.d-b.n*a.d,a.d*b.d);}
function fmul(a,b){return frac(a.n*b.n,a.d*b.d);}
function fdiv(a,b){return frac(a.n*b.d,a.d*b.n);}
function fzero(a){return a.n===0n;}
function fstr(a){return a.d===1n?a.n.toString():a.n.toString()+'/'+a.d.toString();}
function cloneFrac(a){return {n:a.n,d:a.d};}

const fields=structural.fieldRegistry.ipIntegerFields;
if(!Array.isArray(fields)||fields.length===0)throw new Error('missing frozen I/P field registry');

function rowVector(row){return fields.map(f=>row.integer[f]);}
function rref(matrix){
  const m=matrix.length,n=fields.length;
  const A=matrix.map(row=>row.map(x=>typeof x==='object'&&x&&'n' in x?cloneFrac(x):frac(BigInt(x))));
  let r=0;
  const pivots=[];
  for(let c=0;c<n&&r<m;c++){
    let p=r;while(p<m&&fzero(A[p][c]))p++;
    if(p===m)continue;
    [A[r],A[p]]=[A[p],A[r]];
    const pv=A[r][c];
    for(let j=c;j<n;j++)A[r][j]=fdiv(A[r][j],pv);
    for(let i=0;i<m;i++){
      if(i===r||fzero(A[i][c]))continue;
      const q=A[i][c];
      for(let j=c;j<n;j++)A[i][j]=fsub(A[i][j],fmul(q,A[r][j]));
    }
    pivots.push(c);r++;
  }
  return {rank:r,pivots,rows:A.slice(0,r)};
}
function reduceByBasis(vector,basis){
  const v=vector.map(x=>typeof x==='object'&&x&&'n' in x?cloneFrac(x):frac(BigInt(x)));
  for(let i=0;i<basis.pivots.length;i++){
    const p=basis.pivots[i];
    if(fzero(v[p]))continue;
    const q=v[p],row=basis.rows[i];
    for(let j=p;j<v.length;j++)v[j]=fsub(v[j],fmul(q,row[j]));
  }
  return v;
}
function primitiveFraction(v){
  let l=1n;
  for(const x of v)l=lcmBig(l,x.d);
  const ints=v.map(x=>x.n*(l/x.d));
  let g=0n;for(const x of ints)g=gcdBig(g,x);
  if(g===0n)return null;
  let out=ints.map(x=>x/g);
  const first=out.find(x=>x!==0n);
  if(first<0n)out=out.map(x=>-x);
  return out;
}
function primitiveInteger(v){
  let g=0n;for(const x of v)g=gcdBig(g,BigInt(x));
  if(g===0n)return null;
  let out=v.map(x=>BigInt(x)/g);
  const first=out.find(x=>x!==0n);
  if(first<0n)out=out.map(x=>-x);
  return out;
}
function serializeBig(v){return v.map(x=>x.toString()).join('|');}
function directionId(v){return 'D-'+sha256(serializeBig(v)).slice(0,16);}
function sparseBig(v){return v.map((x,i)=>x!==0n?{field:fields[i],value:x.toString()}:null).filter(Boolean);}
function sparseFracRow(v){return v.map((x,i)=>!fzero(x)?{field:fields[i],value:fstr(x)}:null).filter(Boolean);}

function regimeId(tags){
  return [
    tags.family,
    'wp'+tags.anchorWidthParity,
    'hp'+tags.anchorHeightParity,
    'w4'+Number(tags.touchesWidth4),
    'h4'+Number(tags.touchesHeight4),
    tags.safeEntryThresholdRelation
  ].join('|');
}
const regimeMap=new Map();
for(const row of structural.curvatureRows){
  const id=regimeId(row.tags);
  if(!regimeMap.has(id))regimeMap.set(id,{id,tags:row.tags,rows:[]});
  regimeMap.get(id).rows.push(row);
}
const regimes=[...regimeMap.values()].sort((a,b)=>a.id.localeCompare(b.id));
for(const g of regimes){
  g.rows.sort((a,b)=>a.id.localeCompare(b.id));
  g.matrix=g.rows.map(rowVector);
  g.basis=rref(g.matrix);
  const modes=new Set();
  for(const v of g.matrix){const p=primitiveInteger(v);if(p)modes.add(serializeBig(p));}
  g.summary={
    regimeId:g.id,
    tags:g.tags,
    rowCount:g.rows.length,
    rank:g.basis.rank,
    nullity:fields.length-g.basis.rank,
    projectiveRowModeCount:modes.size,
    rowIds:g.rows.map(x=>x.id),
    rrefBasis:g.basis.rows.map(sparseFracRow)
  };
}
const regimeById=new Map(regimes.map(x=>[x.id,x]));

const familyParentRanks={};
for(const family of ['WIDTH2','HEIGHT2','MIXED']){
  familyParentRanks[family]=rref(structural.curvatureRows.filter(x=>x.family===family).map(rowVector)).rank;
}
familyParentRanks.COMBINED=rref(structural.curvatureRows.map(rowVector)).rank;

const thresholdOrder={BELOW:0,CROSS:1,ABOVE:2};
function comparisonAxis(a,b){
  if(a.family!==b.family)return null;
  const keys=['anchorWidthParity','anchorHeightParity','touchesWidth4','touchesHeight4','safeEntryThresholdRelation'];
  const diff=keys.filter(k=>a[k]!==b[k]);
  if(diff.length!==1)return null;
  switch(diff[0]){
    case 'anchorWidthParity': return 'WIDTH_PARITY';
    case 'anchorHeightParity': return 'HEIGHT_PARITY';
    case 'touchesWidth4': return 'WIDTH_BOUNDARY';
    case 'touchesHeight4': return 'HEIGHT_BOUNDARY';
    case 'safeEntryThresholdRelation':
      return Math.abs(thresholdOrder[a.safeEntryThresholdRelation]-thresholdOrder[b.safeEntryThresholdRelation])===1?'SAFE_THRESHOLD':null;
    default:return null;
  }
}
function subspaceGeometry(A,B){
  const rankA=A.basis.rank,rankB=B.basis.rank;
  const rankUnion=rref([...A.matrix,...B.matrix]).rank;
  const intersectionDimension=rankA+rankB-rankUnion;
  return {
    rankA,rankB,rankUnion,intersectionDimension,
    aOnlyQuotientDimension:rankUnion-rankB,
    bOnlyQuotientDimension:rankUnion-rankA,
    grassmannDistance:rankA+rankB-2*intersectionDimension
  };
}
const comparisons=[];
for(let i=0;i<regimes.length;i++)for(let j=i+1;j<regimes.length;j++){
  const A=regimes[i],B=regimes[j];
  const axis=comparisonAxis(A.tags,B.tags);
  if(!axis)continue;
  comparisons.push({
    comparisonId:axis+':'+A.id+'<->'+B.id,
    axis,
    family:A.tags.family,
    regimeA:A.id,
    regimeB:B.id,
    tagsA:A.tags,
    tagsB:B.tags,
    ...subspaceGeometry(A,B)
  });
}
comparisons.sort((a,b)=>a.axis.localeCompare(b.axis)||a.comparisonId.localeCompare(b.comparisonId));

function directedDefect(comparison,source,target){
  const residualRows=[];
  const groups=new Map();
  for(const row of target.rows){
    const residual=reduceByBasis(rowVector(row),source.basis);
    residualRows.push(residual);
    const p=primitiveFraction(residual);
    if(!p)continue;
    const key=serializeBig(p);
    if(!groups.has(key))groups.set(key,{directionId:directionId(p),vector:p,rows:[]});
    groups.get(key).rows.push(row);
  }
  const residualQuotientRank=rref(residualRows).rank;
  const expectedQuotientRank=comparison.rankUnion-source.basis.rank;
  if(residualQuotientRank!==expectedQuotientRank)throw new Error('directed quotient rank mismatch '+source.id+' -> '+target.id);
  const directions=[...groups.values()].map(g=>({
    directionId:g.directionId,
    rowCount:g.rows.length,
    rowIds:g.rows.map(x=>x.id).sort(),
    nonzeroCoordinates:sparseBig(g.vector),
    extendedGridRecurring:g.rows.some(row=>row.boards.some(board=>{
      const [w,h]=board.split('x').map(Number);
      return w>12||h>13;
    }))
  })).sort((a,b)=>b.rowCount-a.rowCount||a.directionId.localeCompare(b.directionId));
  return {
    directedId:comparison.axis+':'+source.id+'->'+target.id,
    comparisonId:comparison.comparisonId,
    axis:comparison.axis,
    family:comparison.family,
    sourceRegime:source.id,
    targetRegime:target.id,
    sourceTags:source.tags,
    targetTags:target.tags,
    expectedQuotientRank,
    residualQuotientRank,
    zeroResidualRows:target.rows.length-directions.reduce((s,x)=>s+x.rowCount,0),
    directions
  };
}
const directedDefects=[];
for(const c of comparisons){
  const A=regimeById.get(c.regimeA),B=regimeById.get(c.regimeB);
  directedDefects.push(directedDefect(c,A,B));
  directedDefects.push(directedDefect(c,B,A));
}
directedDefects.sort((a,b)=>a.directedId.localeCompare(b.directedId));

const recurringMap=new Map();
for(const d of directedDefects)for(const direction of d.directions){
  if(!recurringMap.has(direction.directionId))recurringMap.set(direction.directionId,{
    directionId:direction.directionId,
    nonzeroCoordinates:direction.nonzeroCoordinates,
    occurrences:[]
  });
  recurringMap.get(direction.directionId).occurrences.push({
    directedId:d.directedId,
    comparisonId:d.comparisonId,
    axis:d.axis,
    family:d.family,
    sourceRegime:d.sourceRegime,
    targetRegime:d.targetRegime,
    sourceTags:d.sourceTags,
    targetTags:d.targetTags,
    rowCount:direction.rowCount,
    rowIds:direction.rowIds,
    extendedGridRecurring:direction.extendedGridRecurring
  });
}
const recurringDefects=[...recurringMap.values()].map(g=>({
  directionId:g.directionId,
  nonzeroCoordinates:g.nonzeroCoordinates,
  occurrenceCount:g.occurrences.length,
  producingRowCount:g.occurrences.reduce((s,x)=>s+x.rowCount,0),
  axes:[...new Set(g.occurrences.map(x=>x.axis))].sort(),
  families:[...new Set(g.occurrences.map(x=>x.family))].sort(),
  extendedGridRecurring:g.occurrences.some(x=>x.extendedGridRecurring),
  occurrences:g.occurrences.sort((a,b)=>a.directedId.localeCompare(b.directedId))
})).sort((a,b)=>b.occurrenceCount-a.occurrenceCount||b.producingRowCount-a.producingRowCount||a.directionId.localeCompare(b.directionId));

function genericInteriorFamily(family){
  const source=structural.curvatureRows.filter(row=>
    row.family===family&&
    row.tags.touchesWidth4===false&&
    row.tags.touchesHeight4===false&&
    row.tags.safeEntryThresholdRelation==='ABOVE'
  );
  const rank=rref(source.map(rowVector)).rank;
  const cells=[];
  for(const wp of [0,1])for(const hp of [0,1]){
    const rows=source.filter(x=>x.tags.anchorWidthParity===wp&&x.tags.anchorHeightParity===hp);
    if(!rows.length)continue;
    const pseudo={id:family+'|GENERIC|wp'+wp+'|hp'+hp,tags:{family,anchorWidthParity:wp,anchorHeightParity:hp,touchesWidth4:false,touchesHeight4:false,safeEntryThresholdRelation:'ABOVE'},rows,matrix:rows.map(rowVector)};
    pseudo.basis=rref(pseudo.matrix);
    cells.push({...pseudo,summary:{widthParity:wp,heightParity:hp,rowCount:rows.length,rank:pseudo.basis.rank}});
  }
  const parityComparisons=[];
  const parityDefects=[];
  for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){
    const A=cells[i],B=cells[j];
    const dw=A.tags.anchorWidthParity!==B.tags.anchorWidthParity;
    const dh=A.tags.anchorHeightParity!==B.tags.anchorHeightParity;
    if(Number(dw)+Number(dh)!==1)continue;
    const axis=dw?'WIDTH_PARITY':'HEIGHT_PARITY';
    const geometry=subspaceGeometry(A,B);
    const c={comparisonId:'GENERIC_'+axis+':'+A.id+'<->'+B.id,axis,family,regimeA:A.id,regimeB:B.id,tagsA:A.tags,tagsB:B.tags,...geometry};
    parityComparisons.push(c);
    parityDefects.push(directedDefect(c,A,B),directedDefect(c,B,A));
  }
  return {
    rowCount:source.length,
    rank,
    parityCells:cells.map(x=>x.summary),
    parityComparisons,
    parityDefects
  };
}
const genericInterior={
  WIDTH2:genericInteriorFamily('WIDTH2'),
  HEIGHT2:genericInteriorFamily('HEIGHT2'),
  MIXED:genericInteriorFamily('MIXED')
};

const atlasPayload={
  regimes:regimes.map(x=>x.summary),
  familyParentRanks,
  comparisons,
  directedDefects,
  recurringDefects,
  genericInterior
};
const regimeAtlasSha256=sha256(atlasPayload);

console.log(JSON.stringify({
  schema:'connect4.uc4a_ip_regime_subspace_tomography.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md',
  structuralSource:'UC4A_IP_SYMMETRY_PHASE_STRUCTURAL_0_1.json',
  structuralAtlasSha256:STRUCTURAL_SHA,
  sourceCurvatureRows:structural.curvatureRowCount,
  localizationArtifactAccessibleToProducer:false,
  outcomeLabelsAccessibleToProducer:false,
  rawOutcomeSourcesAccessed:false,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  fieldRegistry:{fields},
  part1:{
    familyParentRanks,
    regimes:regimes.map(x=>x.summary)
  },
  part2:{controlledComparisons:comparisons},
  part3:{
    note:'Exact subspace geometry is embedded in every controlled comparison: ranks, intersection, directed quotient dimensions, and Grassmann distance.'
  },
  part4:{directedDefects},
  part5:{recurringDefects},
  part6:{genericInterior},
  regimeAtlasSha256,
  conclusion:[
    'This tomography is generated solely from the previously frozen label-free 169-board I/P atlas.',
    'Every exact parity, threshold, and finite-boundary regime is kept separate and compared only across predeclared one-axis adjacencies.',
    'Every directed residual quotient is mechanically checked against rank(A+B)-rank(A); mismatches abort the run.',
    'Recurring defect directions are geometry-defined analysis coordinates and are grouped before any localization artifact can be opened.',
    'Extended-grid recurrence is reported using only W>12 or H>13 geometry, not solved-value membership.'
  ],
  boundary:[
    'This regime-subspace atlas is structural mechanism evidence and not a theorem of Connect Four value.',
    'No localization artifact, raw W/D/L table, solver, oracle, best-move table, or BSFP solved frontier is opened.',
    'No sealed formula holdout is inspected, reconstructed, solved, inferred, or indirectly recovered.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.',
    'A recurring regime defect does not authorize a runtime move-finder premise without a current-state UC4A/RLC proof.'
  ]
},null,2));

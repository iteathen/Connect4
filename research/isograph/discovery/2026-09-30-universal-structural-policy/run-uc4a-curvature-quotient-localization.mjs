#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const dir=resolve(import.meta.dirname);
const CURVATURE_SHA='58ac628a545a434f176e84c834b03f145a7efaf86f2389abb106465b13ea99b3';
const curvature=JSON.parse(readFileSync(resolve(dir,'UC4A_SECOND_ORDER_CURVATURE_STRUCTURAL_0_1.json'),'utf8'));
const analysis=JSON.parse(readFileSync(resolve(dir,'UC4A_SECOND_ORDER_CURVATURE_ANALYSIS_0_1.json'),'utf8'));

if(curvature.schema!=='connect4.uc4a_second_order_curvature_structural.v1')throw new Error('unexpected curvature structural schema');
if(analysis.schema!=='connect4.uc4a_second_order_curvature_analysis.v1')throw new Error('unexpected curvature analysis schema');
if(curvature.curvatureAtlasSha256!==CURVATURE_SHA||analysis.curvatureAtlasSha256!==CURVATURE_SHA)throw new Error('curvature atlas identity drift');
if(curvature.curvatureRowCount!==101||analysis.curvatureRowCount!==101)throw new Error('unexpected curvature row count');
if(curvature.outcomeLabelsAccessibleToProducer!==false||curvature.solvedInputsUsed!==false||curvature.oracleUsed!==false)throw new Error('curvature structural freeze boundary invalid');
if(analysis.outcomeLabelsUsedOnlyAfterCurvatureFreeze!==true)throw new Error('outcome overlay ordering invalid');
if(curvature.sealedHoldoutsAccessed!==false||analysis.sealedHoldoutsAccessed!==false)throw new Error('sealed holdout boundary invalid');

const FAMILIES=['WIDTH2','HEIGHT2','MIXED','COMBINED'];
const BLOCKS=['G','I','R','P','C','D'];
const integerFields=curvature.fieldRegistry.integerFields;
const gf2Fields=curvature.fieldRegistry.gf2Fields;
if(integerFields.length!==65||gf2Fields.length!==10)throw new Error('frozen field registry drift');

const expectedIntegerNovelty={WIDTH2:3,HEIGHT2:1,MIXED:2,COMBINED:2};
const expectedGf2Novelty={WIDTH2:1,HEIGHT2:0,MIXED:0,COMBINED:0};
for(const family of FAMILIES){
  const ri=analysis.rankAnalysis.integer[family];
  const rg=analysis.rankAnalysis.gf2[family];
  if(ri.boundaryNovelDimension!==expectedIntegerNovelty[family])throw new Error('integer novelty source drift '+family);
  if(rg.boundaryNovelDimension!==expectedGf2Novelty[family])throw new Error('GF2 novelty source drift '+family);
}
if(!analysis.heldOutComparison?.integer?.WIDTH2?.width?.reports)throw new Error('held-out quotient correction missing from source analysis');

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256(value){return createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');}
function blockOf(field){return field.split('.')[0];}
function absBig(x){return x<0n?-x:x;}
function gcdBig(a,b){a=absBig(a);b=absBig(b);while(b!==0n){const t=a%b;a=b;b=t;}return a;}
function frac(n,d=1n){
  if(d===0n)throw new Error('zero denominator');
  if(n===0n)return {n:0n,d:1n};
  if(d<0n){n=-n;d=-d;}
  const g=gcdBig(n,d);
  return {n:n/g,d:d/g};
}
function fadd(a,b){return frac(a.n*b.d+b.n*a.d,a.d*b.d);}
function fsub(a,b){return frac(a.n*b.d-b.n*a.d,a.d*b.d);}
function fmul(a,b){return frac(a.n*b.n,a.d*b.d);}
function fdiv(a,b){return frac(a.n*b.d,a.d*b.n);}
function fzero(a){return a.n===0n;}
function fstr(a){return a.d===1n?a.n.toString():a.n.toString()+'/'+a.d.toString();}
function cloneFrac(a){return {n:a.n,d:a.d};}

const annotationMap=new Map(analysis.annotatedRows.map(x=>[x.id,x]));
const rows=curvature.rows.map(row=>{
  const a=annotationMap.get(row.id);
  if(!a)throw new Error('missing frozen outcome annotation '+row.id);
  if(stable(a.boards)!==stable(row.boards)||a.signatureHash!==row.signatureHash)throw new Error('annotation/structural row mismatch '+row.id);
  return {
    ...row,
    outcomeWord:a.outcomeWord,
    outcomeWordKey:a.outcomeWord.join('>'),
    boundaryEdgeCount:a.boundaryEdgeCount,
    boundaryAdjacent:a.boundaryAdjacent,
    homogeneous:a.homogeneous
  };
});
const rowMap=new Map(rows.map(x=>[x.id,x]));
if(rowMap.size!==101)throw new Error('curvature row IDs not unique');

function familyRows(family){return family==='COMBINED'?rows:rows.filter(x=>x.family===family);}
function fieldsForBlocks(type,blocks){
  const fields=type==='integer'?integerFields:gf2Fields;
  const set=new Set(blocks);
  return fields.filter(f=>set.has(blockOf(f)));
}
function integerMatrix(source,fields){return source.map(row=>fields.map(f=>row.integer[f]));}
function gf2Matrix(source,fields){return source.map(row=>fields.map(f=>row.gf2[f]));}

function integerRank(matrix){
  if(!matrix.length||!matrix[0]?.length)return 0;
  const A=matrix.map(row=>row.map(x=>BigInt(x)));
  let r=0;
  for(let c=0;c<A[0].length&&r<A.length;c++){
    let p=r;
    while(p<A.length&&A[p][c]===0n)p++;
    if(p===A.length)continue;
    [A[r],A[p]]=[A[p],A[r]];
    for(let i=r+1;i<A.length;i++){
      if(A[i][c]===0n)continue;
      const a=A[r][c],b=A[i][c],g=gcdBig(a,b);
      const alpha=a/g,beta=b/g;
      for(let j=c;j<A[0].length;j++)A[i][j]=A[i][j]*alpha-A[r][j]*beta;
      let rowG=0n;
      for(let j=c+1;j<A[0].length;j++)rowG=gcdBig(rowG,A[i][j]);
      if(rowG>1n)for(let j=c+1;j<A[0].length;j++)A[i][j]/=rowG;
    }
    r++;
  }
  return r;
}
function gf2Rank(matrix){
  if(!matrix.length||!matrix[0]?.length)return 0;
  const n=matrix[0].length;
  const masks=matrix.map(row=>row.reduce((m,x,i)=>x?(m|(1n<<BigInt(i))):m,0n));
  let r=0;
  for(let c=0;c<n&&r<masks.length;c++){
    const bit=1n<<BigInt(c);
    let p=r;
    while(p<masks.length&&(masks[p]&bit)===0n)p++;
    if(p===masks.length)continue;
    [masks[r],masks[p]]=[masks[p],masks[r]];
    for(let i=r+1;i<masks.length;i++)if(masks[i]&bit)masks[i]^=masks[r];
    r++;
  }
  return r;
}
function rankFor(source,fields,type){
  return type==='integer'?integerRank(integerMatrix(source,fields)):gf2Rank(gf2Matrix(source,fields));
}
function rankTriplet(source,fields,type){
  const boundary=source.filter(x=>x.boundaryAdjacent);
  const homogeneous=source.filter(x=>x.homogeneous);
  const allRank=rankFor(source,fields,type);
  const boundaryRank=rankFor(boundary,fields,type);
  const homogeneousRank=rankFor(homogeneous,fields,type);
  return {allRank,boundaryRank,homogeneousRank,boundaryNovelDimension:allRank-homogeneousRank};
}

function bitCount(n){let x=n,c=0;while(x){c+=x&1;x>>=1;}return c;}
function blockSubsets(){
  const out=[];
  for(let mask=1;mask<(1<<BLOCKS.length);mask++){
    out.push(BLOCKS.filter((_,i)=>mask&(1<<i)));
  }
  return out.sort((a,b)=>a.length-b.length||a.join('|').localeCompare(b.join('|')));
}
const allBlockSubsets=blockSubsets();
if(allBlockSubsets.length!==63)throw new Error('block subset count drift');

function isArraySubset(a,b){const s=new Set(b);return a.every(x=>s.has(x));}
function minimalAchievers(rowsList,key){
  const achievers=rowsList.filter(x=>x[key]);
  return achievers.filter((x,i)=>!achievers.some((y,j)=>i!==j&&y.blocks.length<x.blocks.length&&isArraySubset(y.blocks,x.blocks)));
}

function localizeBlocks(type){
  const result={};
  const expected=type==='integer'?expectedIntegerNovelty:expectedGf2Novelty;
  for(const family of FAMILIES){
    const source=familyRows(family);
    const subsets=allBlockSubsets.map(blocks=>{
      const fields=fieldsForBlocks(type,blocks);
      const q=rankTriplet(source,fields,type);
      return {blocks,fieldCount:fields.length,...q,attainsFullNovelty:q.boundaryNovelDimension===expected[family]};
    });
    let minimal=[];
    if(expected[family]>0){
      minimal=minimalAchievers(subsets,'attainsFullNovelty').map(x=>({
        blocks:x.blocks,fieldCount:x.fieldCount,
        allRank:x.allRank,boundaryRank:x.boundaryRank,homogeneousRank:x.homogeneousRank,
        boundaryNovelDimension:x.boundaryNovelDimension
      }));
    }
    result[family]={
      fullSpaceBoundaryNovelDimension:expected[family],
      subsets,
      singletonBlockRanks:subsets.filter(x=>x.blocks.length===1),
      minimalFullNoveltyBlockSubsets:minimal
    };
  }
  return result;
}

function rref(matrix){
  const m=matrix.length;
  const n=m?matrix[0].length:integerFields.length;
  const A=matrix.map(row=>row.map(x=>typeof x==='object'&&'n' in x?cloneFrac(x):frac(BigInt(x))));
  let r=0;
  const pivots=[];
  for(let c=0;c<n&&r<m;c++){
    let p=r;
    while(p<m&&fzero(A[p][c]))p++;
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
  const v=vector.map(x=>typeof x==='object'&&'n' in x?cloneFrac(x):frac(BigInt(x)));
  for(let i=0;i<basis.pivots.length;i++){
    const p=basis.pivots[i];
    if(fzero(v[p]))continue;
    const q=v[p];
    const row=basis.rows[i];
    for(let j=p;j<v.length;j++)v[j]=fsub(v[j],fmul(q,row[j]));
  }
  return v;
}
function fractionRank(matrix){
  if(!matrix.length)return 0;
  return rref(matrix).rank;
}
function vectorZero(v){return v.every(fzero);}
function projectiveNormalize(v){
  const first=v.find(x=>!fzero(x));
  if(!first)return null;
  return v.map(x=>fdiv(x,first));
}
function serializeVector(v){return v.map(fstr);}
function vectorSupport(v,fields){return v.map((x,i)=>!fzero(x)?fields[i]:null).filter(Boolean);}
function vectorBlocks(v,fields){return [...new Set(vectorSupport(v,fields).map(blockOf))].sort();}
function directionId(v){return 'Q-'+sha256(serializeVector(v).join('|')).slice(0,16);}

const quotientInternals={};
function canonicalQuotients(){
  const out={};
  for(const family of FAMILIES){
    const source=familyRows(family);
    const homogeneous=source.filter(x=>x.homogeneous);
    const boundary=source.filter(x=>x.boundaryAdjacent);
    const H=rref(integerMatrix(homogeneous,integerFields));
    const residualById=new Map();
    const groups=new Map();
    const zeroResidualRowIds=[];
    for(const row of boundary){
      const residual=reduceByBasis(integerFields.map(f=>row.integer[f]),H);
      residualById.set(row.id,residual);
      if(vectorZero(residual)){zeroResidualRowIds.push(row.id);continue;}
      const normalized=projectiveNormalize(residual);
      const id=directionId(normalized);
      if(!groups.has(id))groups.set(id,{id,normalized,rows:[]});
      groups.get(id).rows.push(row);
    }
    const residualRank=fractionRank([...residualById.values()]);
    if(residualRank!==expectedIntegerNovelty[family])throw new Error('quotient residual rank mismatch '+family+' '+residualRank);
    const directions=[...groups.values()].map(g=>({
      directionId:g.id,
      rowCount:g.rows.length,
      rowIds:g.rows.map(x=>x.id).sort(),
      families:[...new Set(g.rows.map(x=>x.family))].sort(),
      outcomeNeighborhoodWords:[...new Set(g.rows.map(x=>x.outcomeWordKey))].sort(),
      nonzeroFieldSupport:vectorSupport(g.normalized,integerFields),
      nonzeroBlockSupport:vectorBlocks(g.normalized,integerFields),
      normalizedNonzeroCoordinates:g.normalized.map((x,i)=>!fzero(x)?{field:integerFields[i],value:fstr(x)}:null).filter(Boolean)
    })).sort((a,b)=>b.rowCount-a.rowCount||a.directionId.localeCompare(b.directionId));
    quotientInternals[family]={H,residualById,groups,directions};
    out[family]={
      fullSpaceBoundaryNovelDimension:expectedIntegerNovelty[family],
      homogeneousRank:H.rank,
      boundaryRowCount:boundary.length,
      residualRank,
      zeroResidualRowIds:zeroResidualRowIds.sort(),
      directions
    };
  }
  return out;
}

function rankSmall(source,indices){
  const n=indices.length;
  if(n<1||n>3)throw new Error('rankSmall supports 1..3 fields');
  let u=null,v=null;
  for(const row of source){
    const w=indices.map(i=>BigInt(row.integer[integerFields[i]]));
    if(w.every(x=>x===0n))continue;
    if(!u){u=w;continue;}
    if(n===1)continue;
    const cross2=u[0]*w[1]-u[1]*w[0];
    if(n===2){
      if(cross2!==0n)return 2;
      continue;
    }
    if(!v){
      const cross=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
      if(cross.some(x=>x!==0n))v=w;
      continue;
    }
    const det=
      u[0]*(v[1]*w[2]-v[2]*w[1])-
      u[1]*(v[0]*w[2]-v[2]*w[0])+
      u[2]*(v[0]*w[1]-v[1]*w[0]);
    if(det!==0n)return 3;
  }
  if(!u)return 0;
  if(n===1)return 1;
  if(n===2)return 1;
  return v?2:1;
}
function smallTriplet(source,indices){
  const hom=source.filter(x=>x.homogeneous);
  const boundary=source.filter(x=>x.boundaryAdjacent);
  const allRank=rankSmall(source,indices);
  const homogeneousRank=rankSmall(hom,indices);
  const boundaryRank=rankSmall(boundary,indices);
  return {allRank,boundaryRank,homogeneousRank,boundaryNovelDimension:allRank-homogeneousRank};
}
function strictIndexSubset(a,b){return a.length<b.length&&a.every(x=>b.includes(x));}

function primitiveFieldCensus(){
  const out={};
  for(const family of FAMILIES){
    const source=familyRows(family);
    const full=expectedIntegerNovelty[family];
    const minimal=[];
    const maxBySize={'1':0,'2':0,'3':0};
    const tested={'1':0,'2':0,'3':0};
    function consider(indices){
      const size=indices.length;
      tested[String(size)]++;
      const q=smallTriplet(source,indices);
      if(q.boundaryNovelDimension>maxBySize[String(size)])maxBySize[String(size)]=q.boundaryNovelDimension;
      if(q.boundaryNovelDimension!==full)return;
      if(minimal.some(x=>strictIndexSubset(x.indices,indices)))return;
      for(let i=minimal.length-1;i>=0;i--)if(strictIndexSubset(indices,minimal[i].indices))minimal.splice(i,1);
      minimal.push({indices:[...indices],fields:indices.map(i=>integerFields[i]),...q});
    }
    for(let i=0;i<integerFields.length;i++)consider([i]);
    for(let i=0;i<integerFields.length;i++)for(let j=i+1;j<integerFields.length;j++)consider([i,j]);
    for(let i=0;i<integerFields.length;i++)for(let j=i+1;j<integerFields.length;j++)for(let k=j+1;k<integerFields.length;k++)consider([i,j,k]);
    if(tested['1']!==65||tested['2']!==2080||tested['3']!==43680)throw new Error('field census count drift');
    out[family]={
      fullSpaceBoundaryNovelDimension:full,
      testedBySize:tested,
      maxBoundaryNovelBySize:maxBySize,
      minimalFullNoveltyFieldSubsets:minimal.map(({indices,...x})=>x).sort((a,b)=>a.fields.length-b.fields.length||a.fields.join('|').localeCompare(b.fields.join('|')))
    };
  }
  return out;
}

const allWidths=[...new Set(rows.flatMap(row=>row.boards.map(b=>Number(b.split('x')[0]))))].sort((a,b)=>a-b);
const allHeights=[...new Set(rows.flatMap(row=>row.boards.map(b=>Number(b.split('x')[1]))))].sort((a,b)=>a-b);
function touches(row,axis,value){
  return row.boards.some(board=>{
    const [w,h]=board.split('x').map(Number);
    return (axis==='width'?w:h)===value;
  });
}
function heldOutProjection(family,type,fields){
  const source=familyRows(family);
  function axisReport(axis,values){
    const folds=values.map(held=>{
      const kept=source.filter(x=>!touches(x,axis,held));
      const q=rankTriplet(kept,fields,type);
      return {
        held,
        allRows:kept.length,
        boundaryRows:kept.filter(x=>x.boundaryAdjacent).length,
        homogeneousRows:kept.filter(x=>x.homogeneous).length,
        ...q
      };
    });
    return {
      axis,folds,
      minBoundaryNovelDimension:folds.length?Math.min(...folds.map(x=>x.boundaryNovelDimension)):0,
      maxBoundaryNovelDimension:folds.length?Math.max(...folds.map(x=>x.boundaryNovelDimension)):0
    };
  }
  return {width:axisReport('width',allWidths),height:axisReport('height',allHeights)};
}

function heldOutReuse(part1,part3){
  const blockCandidates=[];
  for(const type of ['integer','gf2']){
    for(const family of FAMILIES){
      for(const candidate of part1[type][family].minimalFullNoveltyBlockSubsets){
        const fields=fieldsForBlocks(type,candidate.blocks);
        blockCandidates.push({
          algebra:type,family,blocks:candidate.blocks,fieldCount:fields.length,
          fullSpaceBoundaryNovelDimension:candidate.boundaryNovelDimension,
          heldOut:heldOutProjection(family,type,fields)
        });
      }
    }
  }
  const fieldCandidates=[];
  for(const family of FAMILIES){
    for(const candidate of part3[family].minimalFullNoveltyFieldSubsets){
      fieldCandidates.push({
        family,fields:candidate.fields,
        fullSpaceBoundaryNovelDimension:candidate.boundaryNovelDimension,
        heldOut:heldOutProjection(family,'integer',candidate.fields)
      });
    }
  }
  return {blockCandidates,fieldCandidates};
}

function inSpanFractionVector(v,basis){return vectorZero(reduceByBasis(v,basis));}
function focusAnalysis(){
  const id='WIDTH2:8x6|9x6|10x6';
  const row=rowMap.get(id);
  if(!row)throw new Error('focus row missing');
  const internal=quotientInternals.WIDTH2;
  const residual=internal.residualById.get(id);
  if(!residual)throw new Error('focus residual missing');
  const zero=vectorZero(residual);
  const normalized=zero?null:projectiveNormalize(residual);
  const idDirection=zero?null:directionId(normalized);
  const group=idDirection?internal.groups.get(idDirection):null;
  const representative=zero?Array.from({length:integerFields.length},()=>frac(0n)):normalized;
  function fold(axis,value){
    const source=familyRows('WIDTH2').filter(x=>!touches(x,axis,value));
    const homogeneous=source.filter(x=>x.homogeneous);
    const allBasis=rref(integerMatrix(source,integerFields));
    const homBasis=rref(integerMatrix(homogeneous,integerFields));
    const representativeInAllSpan=inSpanFractionVector(representative,allBasis);
    const representativeInHomogeneousSpan=inSpanFractionVector(representative,homBasis);
    const q=rankTriplet(source,integerFields,'integer');
    return {
      axis,held:value,
      sourceRowRemoved:touches(row,axis,value),
      allRows:source.length,
      homogeneousRows:homogeneous.length,
      ...q,
      representativeInAllSpan,
      representativeInHomogeneousSpan,
      survives:!zero&&representativeInAllSpan&&!representativeInHomogeneousSpan
    };
  }
  return {
    rowId:id,
    outcomeWord:row.outcomeWord,
    boundaryEdgeCount:row.boundaryEdgeCount,
    residualZero:zero,
    directionId:idDirection,
    quotientNonzeroFieldSupport:zero?[]:vectorSupport(normalized,integerFields),
    quotientNonzeroBlockSupport:zero?[]:vectorBlocks(normalized,integerFields),
    sharedDirectionRows:group?group.rows.map(x=>x.id).sort():[],
    sharedDirectionOutcomeWords:group?[...new Set(group.rows.map(x=>x.outcomeWordKey))].sort():[],
    holdoutSurvival:{
      height6:fold('height',6),
      width8:fold('width',8),
      width9:fold('width',9),
      width10:fold('width',10)
    }
  };
}

function mathSelfTest(){
  if(integerRank([[1,2],[2,4]])!==1||integerRank([[1,2],[2,5]])!==2)throw new Error('integer rank self-test failed');
  if(gf2Rank([[1,1,0],[0,1,1]])!==2)throw new Error('GF2 rank self-test failed');
  const basis=rref([[1,1,0],[0,1,1]]);
  const residual=reduceByBasis([1,2,1],basis);
  if(!vectorZero(residual))throw new Error('RREF reduction self-test failed');
}
mathSelfTest();

const part1={
  integer:localizeBlocks('integer'),
  gf2:localizeBlocks('gf2')
};
const part2=canonicalQuotients();
const part3=primitiveFieldCensus();
const part4=heldOutReuse(part1,part3);
const focus=focusAnalysis();

const result={
  schema:'connect4.uc4a_curvature_quotient_localization.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_CURVATURE_QUOTIENT_LOCALIZATION_EXPERIMENT_DESIGN_0_1.md',
  curvatureAtlas:'UC4A_SECOND_ORDER_CURVATURE_STRUCTURAL_0_1.json',
  curvatureAtlasSha256:CURVATURE_SHA,
  sourceAnalysis:'UC4A_SECOND_ORDER_CURVATURE_ANALYSIS_0_1.json',
  structuralAtlasSha256:curvature.structuralAtlasSha256,
  curvatureRowCount:rows.length,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  noNewStructuralCoordinateAdded:true,
  part1:{blockSubsetLocalization:part1},
  part2:{canonicalIntegerQuotients:part2},
  part3:{primitiveFieldSubsetCensus:part3},
  part4:{heldOutReuse:part4},
  focus,
  conclusion:[
    'The localization consumes only the already-frozen second-order curvature rows and their already-frozen boundary/homogeneous annotations.',
    'Integer boundary-quotient dimensions are localized exhaustively over all nonempty G/I/R/P/C/D block subsets and all frozen integer field subsets of sizes one through three.',
    'Canonical quotient residuals are deterministic RREF-complement coordinates for analysis only; projective direction IDs do not claim a canonical gameplay invariant.',
    'GF(2) carriers are reported only where the frozen full-space curvature has nonzero boundary novelty; zero-novelty families do not manufacture a carrier.',
    'Held-out width/height reuse is preserved for every inclusion-minimal block and <=3-field carrier, including failures and rank drops.',
    'The 8x6/9x6/10x6 witness is tested against the WIDTH2 homogeneous quotient and against held-out dimension families without adding a feature.'
  ],
  boundary:[
    'This localization is descriptive outcome-boundary tomography and not a theorem of Connect Four value.',
    'No W/D/L label constructs or changes a curvature coordinate; labels only preserve the already-frozen boundary/homogeneous partition.',
    'No sealed formula holdout is inspected, reconstructed, solved, inferred, or indirectly recovered.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.',
    'A localized block, field subset, or quotient direction is not a runtime move-finder premise until rederived from label-free UC4A/RLC structure.'
  ]
};

console.log(JSON.stringify(result,null,2));

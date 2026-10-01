#!/usr/bin/env node
import {createHash} from 'node:crypto';

const K=4;
const MIN=4;
const MAX=16;

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256(value){return createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');}
function choose2(n){return n*(n-1)/2;}
function parity(n){return Math.abs(n)%2;}
function centers(W){return W%2?[Math.floor(W/2)+1]:[W/2,W/2+1];}
function absBig(x){return x<0n?-x:x;}
function gcdBig(a,b){a=absBig(a);b=absBig(b);while(b!==0n){const t=a%b;a=b;b=t;}return a;}

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
function gf2IndependentBasis(masks){
  const basis=new Map(),out=[];
  for(const original of masks){
    let x=original;
    while(x!==0n){
      const p=x.toString(2).length-1;
      const b=basis.get(p);
      if(b===undefined){basis.set(p,x);out.push(original);break;}
      x^=b;
    }
  }
  return out;
}
function gf2DependencyBasis(masks){
  const basis=new Map(),deps=[];
  for(let i=0;i<masks.length;i++){
    let x=masks[i],combo=1n<<BigInt(i);
    while(x!==0n){
      const p=x.toString(2).length-1;
      const b=basis.get(p);
      if(b===undefined){basis.set(p,{vec:x,combo});break;}
      x^=b.vec;combo^=b.combo;
    }
    if(x===0n)deps.push(combo);
  }
  return gf2IndependentBasis(deps);
}
function gf2SubspaceKernelBasis(domainBasis,images){
  if(domainBasis.length!==images.length)throw new Error('domain/image basis length mismatch');
  const combos=gf2DependencyBasis(images),out=[];
  for(const combo of combos){
    let v=0n;
    for(let i=0;i<domainBasis.length;i++)if((combo>>BigInt(i))&1n)v^=domainBasis[i];
    out.push(v);
  }
  return gf2IndependentBasis(out);
}

function cellId(W,c,r){return r*W+c;}
function lineKey(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function generateLines(W,H){
  const dirs=[
    {name:'horizontal',dx:1,dy:0},
    {name:'vertical',dx:0,dy:1},
    {name:'risingDiagonal',dx:1,dy:1},
    {name:'fallingDiagonal',dx:1,dy:-1}
  ];
  const lines=[];
  for(const d of dirs)for(let r=0;r<H;r++)for(let c=0;c<W;c++){
    const ec=c+3*d.dx,er=r+3*d.dy;
    if(ec<0||ec>=W||er<0||er>=H)continue;
    const cells=[];
    for(let t=0;t<4;t++)cells.push(cellId(W,c+t*d.dx,r+t*d.dy));
    lines.push({orientation:d.name,cells,start:[c,r]});
  }
  return lines;
}
function reflectedCells(W,H,cells,kind){
  return cells.map(id=>{
    let c=id%W,r=Math.floor(id/W);
    if(kind==='lr')c=W-1-c;
    else if(kind==='tb')r=H-1-r;
    else if(kind==='rot180'){c=W-1-c;r=H-1-r;}
    return cellId(W,c,r);
  });
}
function reflectionSummary(W,H,lines){
  const byKey=new Set(lines.map(x=>lineKey(x.cells)));
  const out={};
  for(const kind of ['lr','tb','rot180']){
    let fixedLines=0;
    for(const line of lines){
      const k=lineKey(reflectedCells(W,H,line.cells,kind));
      if(!byKey.has(k))throw new Error('reflection lost line');
      if(k===lineKey(line.cells))fixedLines++;
    }
    out[kind]={fixedLines};
  }
  out.lr.fixedCells=(W%2)*H;
  out.tb.fixedCells=(H%2)*W;
  out.rot180.fixedCells=(W%2)*(H%2);
  return out;
}
function cellParityImage(W,H,mask,mode){
  let out=0n;
  for(let id=0;id<W*H;id++)if((mask>>BigInt(id))&1n){
    const c=id%W,r=Math.floor(id/W);
    if(mode==='rows'||mode==='both')out^=1n<<BigInt(r);
    if(mode==='columns')out^=1n<<BigInt(c);
    else if(mode==='both')out^=1n<<BigInt(H+c);
  }
  return out;
}
function reflectCellMask(W,H,mask,kind){
  let out=0n;
  for(let id=0;id<W*H;id++)if((mask>>BigInt(id))&1n){
    const mapped=reflectedCells(W,H,[id],kind)[0];
    out|=1n<<BigInt(mapped);
  }
  return out;
}
function lineReflectionMap(W,H,lines,kind){
  const byKey=new Map(lines.map((line,i)=>[lineKey(line.cells),i]));
  return lines.map(line=>{
    const j=byKey.get(lineKey(reflectedCells(W,H,line.cells,kind)));
    if(j===undefined)throw new Error('line reflection map missing');
    return j;
  });
}
function reflectLineCombo(combo,map){
  let out=0n;
  for(let i=0;i<map.length;i++)if((combo>>BigInt(i))&1n)out^=1n<<BigInt(map[i]);
  return out;
}
function fixedSubspaceDimension(basis,transform){
  return basis.length-gf2Rank(basis.map(v=>v^transform(v)));
}
function verticalLineParityImage(lines,combo){
  let out=0n;
  for(let i=0;i<lines.length;i++)if(((combo>>BigInt(i))&1n)&&lines[i].orientation==='vertical'){
    out^=1n<<BigInt(lines[i].start[0]);
  }
  return out;
}

function safeDerivative(word){
  const s=word.join('');
  return !s.includes('000')&&!s.includes('111');
}
function safeEntries(W){
  const cols=[];
  for(let c=0;c<W;c++){
    const phi=Array(W).fill(0);phi[c]=1;
    const d=Array.from({length:W-1},(_,i)=>phi[i]^phi[i+1]);
    if(safeDerivative(d))cols.push(c+1);
  }
  return cols;
}
function fib(n){
  if(n<=0)return 0;
  let a=0,b=1;
  for(let i=0;i<n;i++){const t=a+b;a=b;b=t;}
  return a;
}
const pCache=new Map();
function pFields(W){
  if(pCache.has(W))return pCache.get(W);
  const entries=safeEntries(W);
  if(entries.length!==Math.max(0,8-W))throw new Error('safe-entry theorem mismatch W='+W);
  const safeDerivativeWordCount=2*fib(W);
  const value={
    phaseDimension:W-1,
    pathRadius:Math.floor(W/2),
    centerCount:centers(W).length,
    safeEntryCount:entries.length,
    safeEntryColumns:entries,
    safeDerivativeWordCount,
    safePhaseWordCount:2*safeDerivativeWordCount,
    pairDisplacementGeneratorCount:choose2(W),
    pairDisplacementRank:W-1,
    pairDisplacementNullity:choose2(W)-(W-1),
    topDefectModuleDimension:W-1,
    phaseRadiusParity:Math.floor(W/2)%2
  };
  pCache.set(W,value);
  return value;
}

function boardRow(W,H){
  const lines=generateLines(W,H);
  const lineMasks=lines.map(x=>x.cells.reduce((m,id)=>m|(1n<<BigInt(id)),0n));
  const incidenceBasis=gf2IndependentBasis(lineMasks);
  const incidenceRank=incidenceBasis.length;
  const a=W-3,b=H-3,d=Math.min(2,a*b);
  if(incidenceRank!==W*H-9+d)throw new Error('incidence rank mismatch '+W+'x'+H);
  const lineKernelBasis=gf2DependencyBasis(lineMasks);
  const kernelDimension=lineKernelBasis.length;
  if(kernelDimension!==3*a*b-d)throw new Error('kernel dimension mismatch '+W+'x'+H);

  const axisParityImages=incidenceBasis.map(v=>cellParityImage(W,H,v,'both'));
  const axisQuotientRank=gf2Rank(axisParityImages);
  if(axisQuotientRank!==a+b)throw new Error('axis quotient mismatch '+W+'x'+H);
  const yCellBasis=gf2SubspaceKernelBasis(incidenceBasis,axisParityImages);
  const yCell=yCellBasis.length;

  const verticalImages=lineKernelBasis.map(v=>verticalLineParityImage(lines,v));
  const linePhaseQuotientRank=gf2Rank(verticalImages);
  const yLineBasis=gf2SubspaceKernelBasis(lineKernelBasis,verticalImages);
  const yLine=yLineBasis.length;

  const coreReflection={};
  for(const [kind,label] of [['lr','leftRightFixed'],['tb','geometryOnlyTopBottomFixed'],['rot180','rotation180Fixed']]){
    const map=lineReflectionMap(W,H,lines,kind);
    coreReflection[label]={
      yCell:fixedSubspaceDimension(yCellBasis,v=>reflectCellMask(W,H,v,kind)),
      yLine:fixedSubspaceDimension(yLineBasis,v=>reflectLineCombo(v,map))
    };
  }

  const reflect=reflectionSummary(W,H,lines);
  const I={
    incidenceRank,
    kernelDimension,
    axisQuotientRank,
    linePhaseQuotientRank,
    yCell,
    yLine,
    coreDelta:yLine-yCell,
    coreReflection,
    incidenceRankParity:incidenceRank%2,
    kernelParity:kernelDimension%2,
    yCellParity:yCell%2,
    yLineParity:yLine%2,
    coreDeltaParity:parity(yLine-yCell)
  };
  const G={
    width:W,height:H,
    widthParity:W%2,heightParity:H%2,cellParity:(W*H)%2,
    leftRightFixedCells:reflect.lr.fixedCells,
    topBottomFixedCells:reflect.tb.fixedCells,
    rotation180FixedCells:reflect.rot180.fixedCells,
    leftRightFixedLines:reflect.lr.fixedLines,
    topBottomFixedLines:reflect.tb.fixedLines,
    rotation180FixedLines:reflect.rot180.fixedLines
  };
  return {board:W+'x'+H,width:W,height:H,G,I,P:pFields(W)};
}

const integerFields=[
  'G.leftRightFixedCells','G.topBottomFixedCells','G.rotation180FixedCells',
  'G.leftRightFixedLines','G.topBottomFixedLines','G.rotation180FixedLines',
  'I.incidenceRank','I.kernelDimension','I.axisQuotientRank','I.linePhaseQuotientRank',
  'I.yCell','I.yLine','I.coreDelta',
  'I.coreReflection.leftRightFixed.yCell','I.coreReflection.leftRightFixed.yLine',
  'I.coreReflection.geometryOnlyTopBottomFixed.yCell','I.coreReflection.geometryOnlyTopBottomFixed.yLine',
  'I.coreReflection.rotation180Fixed.yCell','I.coreReflection.rotation180Fixed.yLine',
  'P.phaseDimension','P.pathRadius','P.centerCount','P.safeEntryCount',
  'P.safeDerivativeWordCount','P.safePhaseWordCount',
  'P.pairDisplacementGeneratorCount','P.pairDisplacementRank','P.pairDisplacementNullity',
  'P.topDefectModuleDimension'
];
const ipIntegerFields=integerFields.filter(x=>x.startsWith('I.')||x.startsWith('P.'));
const reflectionFields=[
  'I.coreReflection.leftRightFixed.yCell','I.coreReflection.leftRightFixed.yLine',
  'I.coreReflection.geometryOnlyTopBottomFixed.yCell','I.coreReflection.geometryOnlyTopBottomFixed.yLine',
  'I.coreReflection.rotation180Fixed.yCell','I.coreReflection.rotation180Fixed.yLine'
];
const gf2Fields=[
  'G.widthParity','G.heightParity','G.cellParity',
  'I.incidenceRankParity','I.kernelParity','I.yCellParity','I.yLineParity','I.coreDeltaParity',
  'P.phaseRadiusParity'
];

function getPath(row,name){
  const [block,...rest]=name.split('.');
  let cur=row[block];
  for(const p of rest)cur=cur[p];
  return cur;
}

const boards=[];
for(let W=MIN;W<=MAX;W++)for(let H=MIN;H<=MAX;H++)boards.push(boardRow(W,H));
boards.sort((a,b)=>a.width-b.width||a.height-b.height);
if(boards.length!==169)throw new Error('extended board count mismatch');
const byBoard=new Map(boards.map(x=>[x.board,x]));

function int3(a,b,c,field){return Number(getPath(c,field))-2*Number(getPath(b,field))+Number(getPath(a,field));}
function bit3(a,b,c,field){return Number(getPath(a,field))^Number(getPath(c,field));}
function intMixed(a,b,c,d,field){return Number(getPath(d,field))-Number(getPath(b,field))-Number(getPath(c,field))+Number(getPath(a,field));}
function bitMixed(a,b,c,d,field){return Number(getPath(a,field))^Number(getPath(b,field))^Number(getPath(c,field))^Number(getPath(d,field));}
function regimeTags(family,rows,anchor){
  const widths=rows.map(x=>x.width),heights=rows.map(x=>x.height);
  const minW=Math.min(...widths),maxW=Math.max(...widths);
  return {
    family,
    anchorWidthParity:anchor.width%2,
    anchorHeightParity:anchor.height%2,
    touchesWidth4:widths.includes(4),
    touchesHeight4:heights.includes(4),
    safeEntryThresholdRelation:maxW<8?'BELOW':minW>=8?'ABOVE':'CROSS'
  };
}
function curvatureRow(family,boardRows,anchor){
  const integer={},gf2={};
  if(family==='MIXED'){
    for(const f of integerFields)integer[f]=intMixed(boardRows[0],boardRows[1],boardRows[2],boardRows[3],f);
    for(const f of gf2Fields)gf2[f]=bitMixed(boardRows[0],boardRows[1],boardRows[2],boardRows[3],f);
  }else{
    for(const f of integerFields)integer[f]=int3(boardRows[0],boardRows[1],boardRows[2],f);
    for(const f of gf2Fields)gf2[f]=bit3(boardRows[0],boardRows[1],boardRows[2],f);
  }
  const tags=regimeTags(family,boardRows,anchor);
  const id=family+':'+boardRows.map(x=>x.board).join('|');
  const ipInteger=Object.fromEntries(ipIntegerFields.map(f=>[f,integer[f]]));
  return {
    family,id,boards:boardRows.map(x=>x.board),anchor,tags,integer,gf2,
    ipSignatureHash:sha256(ipInteger),
    fullSignatureHash:sha256({integer,gf2})
  };
}

const curvatureRows=[];
for(let W=MIN;W<=MAX-2;W++)for(let H=MIN;H<=MAX;H++){
  curvatureRows.push(curvatureRow('WIDTH2',[byBoard.get(W+'x'+H),byBoard.get((W+1)+'x'+H),byBoard.get((W+2)+'x'+H)],{width:W,height:H}));
}
for(let W=MIN;W<=MAX;W++)for(let H=MIN;H<=MAX-2;H++){
  curvatureRows.push(curvatureRow('HEIGHT2',[byBoard.get(W+'x'+H),byBoard.get(W+'x'+(H+1)),byBoard.get(W+'x'+(H+2))],{width:W,height:H}));
}
for(let W=MIN;W<=MAX-1;W++)for(let H=MIN;H<=MAX-1;H++){
  curvatureRows.push(curvatureRow('MIXED',[byBoard.get(W+'x'+H),byBoard.get((W+1)+'x'+H),byBoard.get(W+'x'+(H+1)),byBoard.get((W+1)+'x'+(H+1))],{width:W,height:H}));
}
const familyOrder={WIDTH2:0,HEIGHT2:1,MIXED:2};
curvatureRows.sort((a,b)=>familyOrder[a.family]-familyOrder[b.family]||a.id.localeCompare(b.id));
const familyCounts={
  WIDTH2:curvatureRows.filter(x=>x.family==='WIDTH2').length,
  HEIGHT2:curvatureRows.filter(x=>x.family==='HEIGHT2').length,
  MIXED:curvatureRows.filter(x=>x.family==='MIXED').length
};
if(stable(familyCounts)!==stable({WIDTH2:143,HEIGHT2:143,MIXED:144}))throw new Error('curvature family census mismatch');
if(curvatureRows.length!==430)throw new Error('curvature row total mismatch');

function integerRank(matrix){
  if(!matrix.length||!matrix[0]?.length)return 0;
  const A=matrix.map(row=>row.map(x=>BigInt(x)));
  let r=0;
  for(let c=0;c<A[0].length&&r<A.length;c++){
    let p=r;while(p<A.length&&A[p][c]===0n)p++;
    if(p===A.length)continue;
    [A[r],A[p]]=[A[p],A[r]];
    for(let i=r+1;i<A.length;i++){
      if(A[i][c]===0n)continue;
      const a=A[r][c],b=A[i][c],g=gcdBig(a,b);
      const alpha=a/g,beta=b/g;
      for(let j=c;j<A[0].length;j++)A[i][j]=A[i][j]*alpha-A[r][j]*beta;
      let rg=0n;
      for(let j=c+1;j<A[0].length;j++)rg=gcdBig(rg,A[i][j]);
      if(rg>1n)for(let j=c+1;j<A[0].length;j++)A[i][j]/=rg;
    }
    r++;
  }
  return r;
}
function gf2MatrixRank(matrix){
  if(!matrix.length||!matrix[0]?.length)return 0;
  const n=matrix[0].length;
  const masks=matrix.map(row=>row.reduce((m,x,i)=>x?(m|(1n<<BigInt(i))):m,0n));
  let r=0;
  for(let c=0;c<n&&r<masks.length;c++){
    const bit=1n<<BigInt(c);
    let p=r;while(p<masks.length&&(masks[p]&bit)===0n)p++;
    if(p===masks.length)continue;
    [masks[r],masks[p]]=[masks[p],masks[r]];
    for(let i=r+1;i<masks.length;i++)if(masks[i]&bit)masks[i]^=masks[r];
    r++;
  }
  return r;
}
function normalizeIntegerVector(values){
  let g=0;
  for(const v of values)g=Number(gcdBig(BigInt(g),BigInt(v)));
  if(g===0)return null;
  let out=values.map(v=>v/g);
  const first=out.find(v=>v!==0);
  if(first<0)out=out.map(v=>-v);
  return out;
}
function projectiveId(values){return 'M-'+sha256(values.join('|')).slice(0,16);}
function ipVector(row){return ipIntegerFields.map(f=>row.integer[f]);}

const familyRanks={};
const gf2FamilyRanks={};
for(const family of ['WIDTH2','HEIGHT2','MIXED']){
  const source=curvatureRows.filter(x=>x.family===family);
  familyRanks[family]=integerRank(source.map(ipVector));
  gf2FamilyRanks[family]=gf2MatrixRank(source.map(r=>gf2Fields.map(f=>r.gf2[f])));
}
familyRanks.COMBINED=integerRank(curvatureRows.map(ipVector));
gf2FamilyRanks.COMBINED=gf2MatrixRank(curvatureRows.map(r=>gf2Fields.map(f=>r.gf2[f])));

const regimeGroups=new Map();
for(const row of curvatureRows){
  const k=stable(row.tags);
  if(!regimeGroups.has(k))regimeGroups.set(k,{tags:row.tags,rows:[]});
  regimeGroups.get(k).rows.push(row);
}
const regimeRanks=[...regimeGroups.values()].map(g=>({
  tags:g.tags,rowCount:g.rows.length,
  integerRank:integerRank(g.rows.map(ipVector)),
  gf2Rank:gf2MatrixRank(g.rows.map(r=>gf2Fields.map(f=>r.gf2[f])))
})).sort((a,b)=>a.tags.family.localeCompare(b.tags.family)||stable(a.tags).localeCompare(stable(b.tags)));

const projectiveGroups=new Map();
for(const row of curvatureRows){
  const n=normalizeIntegerVector(ipVector(row));
  const id=n?projectiveId(n):'ZERO';
  if(!projectiveGroups.has(id))projectiveGroups.set(id,{modeId:id,normalized:n,rows:[]});
  projectiveGroups.get(id).rows.push(row);
}
const projectiveModes=[...projectiveGroups.values()].map(g=>({
  modeId:g.modeId,
  rowCount:g.rows.length,
  families:[...new Set(g.rows.map(x=>x.family))].sort(),
  regimes:[...new Map(g.rows.map(x=>[stable(x.tags),x.tags])).values()],
  rowIds:g.rows.map(x=>x.id).sort(),
  nonzeroCoordinates:g.normalized?g.normalized.map((v,i)=>v!==0?{field:ipIntegerFields[i],value:v}:null).filter(Boolean):[]
})).sort((a,b)=>b.rowCount-a.rowCount||a.modeId.localeCompare(b.modeId));

const signatureGroups=new Map();
for(const row of curvatureRows){
  if(!signatureGroups.has(row.ipSignatureHash))signatureGroups.set(row.ipSignatureHash,{signatureHash:row.ipSignatureHash,rows:[]});
  signatureGroups.get(row.ipSignatureHash).rows.push(row);
}
const exactSignatureGroups=[...signatureGroups.values()].map(g=>({
  signatureHash:g.signatureHash,count:g.rows.length,
  families:[...new Set(g.rows.map(x=>x.family))].sort(),
  regimes:[...new Map(g.rows.map(x=>[stable(x.tags),x.tags])).values()],
  rowIds:g.rows.map(x=>x.id).sort()
})).sort((a,b)=>b.count-a.count||a.signatureHash.localeCompare(b.signatureHash));

function frac(n,d=1n){
  if(n===0n)return {n:0n,d:1n};
  if(d<0n){n=-n;d=-d;}
  const g=gcdBig(n,d);return {n:n/g,d:d/g};
}
function fsub(a,b){return frac(a.n*b.d-b.n*a.d,a.d*b.d);}
function fdiv(a,b){return frac(a.n*b.d,a.d*b.n);}
function fmul(a,b){return frac(a.n*b.n,a.d*b.d);}
function fzero(a){return a.n===0n;}
function fstr(a){return a.d===1n?a.n.toString():a.n+'/'+a.d;}
function rationalNullspace(matrix,fields){
  const m=matrix.length,n=fields.length;
  const A=matrix.map(row=>row.map(x=>frac(BigInt(x))));
  let r=0;const pivots=[];
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
  const ps=new Set(pivots),free=[];
  for(let c=0;c<n;c++)if(!ps.has(c))free.push(c);
  const basis=[];
  for(const f of free){
    const v=Array.from({length:n},()=>frac(0n));v[f]=frac(1n);
    for(let i=0;i<pivots.length;i++)v[pivots[i]]=frac(-A[i][f].n,A[i][f].d);
    basis.push({
      freeField:fields[f],
      support:v.map((x,i)=>!fzero(x)?fields[i]:null).filter(Boolean),
      coefficients:v.map(fstr)
    });
  }
  return {rank:r,nullity:n-r,basis};
}
const reflectionMatrix=curvatureRows.map(row=>reflectionFields.map(f=>row.integer[f]));
const reflectionDeps=rationalNullspace(reflectionMatrix,reflectionFields);

const safeEntryRows=curvatureRows.filter(row=>row.integer['P.safeEntryCount']!==0).map(row=>({
  id:row.id,family:row.family,value:row.integer['P.safeEntryCount'],tags:row.tags
}));

const boardHashes=boards.map(row=>({board:row.board,sha256:sha256(row)}));
const curvatureHashes=curvatureRows.map(row=>({id:row.id,sha256:sha256(row)}));
const structuralAtlasSha256=sha256([
  ...boardHashes.map(x=>x.board+':'+x.sha256),
  ...curvatureHashes.map(x=>x.id+':'+x.sha256)
].join('\n'));

console.log(JSON.stringify({
  schema:'connect4.uc4a_ip_symmetry_phase_structural.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_IP_SYMMETRY_PHASE_MECHANISM_REDERIVATION_EXPERIMENT_DESIGN_0_1.md',
  phase:'LABEL_FREE_IP_STRUCTURAL_MODE_FREEZE',
  grid:{minWidth:MIN,maxWidth:MAX,minHeight:MIN,maxHeight:MAX,k:K},
  boardCount:boards.length,
  curvatureRowCount:curvatureRows.length,
  familyCounts,
  outcomeLabelsAccessibleToProducer:false,
  localizationArtifactAccessibleToProducer:false,
  oracleUsed:false,
  solvedInputsUsed:false,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  fieldRegistry:{
    integerFields,ipIntegerFields,reflectionFields,gf2Fields,
    bridgeIntegerFields:integerFields,
    note:'All fields are fixed before any localization artifact can be opened.'
  },
  modeCensus:{
    integer:{familyRanks,regimeRanks,projectiveModes,exactSignatureGroups},
    gf2:{familyRanks:gf2FamilyRanks},
    reflectionSector:{
      fields:reflectionFields,
      rank:reflectionDeps.rank,
      nullity:reflectionDeps.nullity,
      linearDependencies:reflectionDeps.basis
    },
    safeEntryCurvature:{rows:safeEntryRows}
  },
  boardHashes,
  curvatureHashes,
  structuralAtlasSha256,
  boards,
  curvatureRows,
  boundary:[
    'This producer opens no W/D/L source and no curvature-localization artifact.',
    'All 169 boards are generated from rectangle geometry only; no board is solved or assigned an outcome.',
    'The middle/core spaces are mechanically reconstructed from generated GF(2) winning-line incidence and support quotients.',
    'The 430 curvature rows and geometry-only regime tags are frozen before Phase B.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));

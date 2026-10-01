#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const dir=resolve(import.meta.dirname);
const STRUCTURAL_SHA='bfcc2e0c8fc2675070e281554ea5385b50f118e894cd6ce308de2975e09febed';
const structural=JSON.parse(readFileSync(resolve(dir,'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_STRUCTURAL_0_1.json'),'utf8'));
const original=JSON.parse(readFileSync(resolve(dir,'UC4A_BOARD_OUTCOME_STRUCTURAL_TRIANGLE_CENSUS_RESULT_0_1.json'),'utf8'));
const fresh=JSON.parse(readFileSync(resolve(dir,'UC4A_FRESH_BOARD_VALIDATION_ONE_COORDINATE_REPAIR_RESULT_0_1.json'),'utf8'));

if(structural.structuralAtlasSha256!==STRUCTURAL_SHA)throw new Error('structural atlas hash drift');
if(structural.phase!=='STRUCTURAL_FREEZE_BEFORE_OUTCOME_JOIN')throw new Error('unexpected structural phase');
if(structural.boardCount!==52||structural.outcomeLabelsAccessibleToProducer!==false||structural.solvedInputsUsed!==false)throw new Error('invalid structural freeze boundary');
if(original.boardCount!==37||fresh.freshBoardCount!==15||fresh.combinedBoardCount!==52)throw new Error('unexpected label source sizes');
if(original.sealedHoldoutsAccessed!==false||fresh.sealedHoldoutsAccessed!==false)throw new Error('label source holdout boundary invalid');

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256(value){return createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');}
function getPath(obj,path){
  let cur=obj;
  for(const part of path.split('.'))cur=cur?.[part];
  return cur;
}
function outcomeKey(width,height){return `${width}x${height}`;}
function popcountBig(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function absBig(x){return x<0n?-x:x;}
function gcdBig(a,b){a=absBig(a);b=absBig(b);while(b){const t=a%b;a=b;b=t;}return a;}
function intersectionArrays(arrays){
  if(!arrays.length)return [];
  const rest=arrays.slice(1).map(x=>new Set(x));
  return arrays[0].filter(x=>rest.every(s=>s.has(x)));
}

const labelMap=new Map();
const sourceMap=new Map();
for(const r of original.labeledRows){
  const key=outcomeKey(r.width,r.height);
  if(labelMap.has(key))throw new Error('duplicate original label '+key);
  labelMap.set(key,r.outcomeName);sourceMap.set(key,'ORIGINAL_37');
}
for(const r of fresh.freshRows){
  const key=outcomeKey(r.width,r.height);
  if(labelMap.has(key))throw new Error('fresh label duplicates original '+key);
  labelMap.set(key,r.outcomeName);sourceMap.set(key,'FRESH_15');
}
if(labelMap.size!==52)throw new Error('label join must have 52 rows');
const structuralKeys=new Set(structural.rows.map(x=>x.board));
if(structuralKeys.size!==52)throw new Error('structural keys not unique');
for(const key of structuralKeys)if(!labelMap.has(key))throw new Error('missing label '+key);
for(const key of labelMap.keys())if(!structuralKeys.has(key))throw new Error('label without structural row '+key);
if(structuralKeys.has('3x6')||structuralKeys.has('5x3'))throw new Error('sealed holdout geometry accessed');

const rows=structural.rows.map(x=>({...x,outcome:labelMap.get(x.board),source:sourceMap.get(x.board)}));
const byBoard=new Map(rows.map(x=>[x.board,x]));
const blockOrder=structural.fieldRegistry.blockOrder.filter(x=>x!=='Q');

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
const categoricalMeta=scalarRegistry('categoricalFields');
const integerFields=integerMeta.map(x=>x.name);
const gf2Fields=gf2Meta.map(x=>x.name);
const categoricalFields=categoricalMeta.map(x=>x.name);
const allScalarMeta=[...integerMeta.map(x=>({...x,type:'integer'})),...gf2Meta.map(x=>({...x,type:'gf2'})),...categoricalMeta.map(x=>({...x,type:'categorical'}))];
const allScalarFields=allScalarMeta.map(x=>x.name);
const identityFieldSet=new Set(['G.width','G.height','G.cells']);
const identitySuppressedScalarMeta=allScalarMeta.filter(x=>!identityFieldSet.has(x.name));
const identitySuppressedScalarFields=identitySuppressedScalarMeta.map(x=>x.name);

function scalar(row,meta){return getPath(row.blocks[meta.block],meta.path);}
function scalarByName(row,name){
  const meta=allScalarMeta.find(x=>x.name===name);
  if(!meta)throw new Error('unknown scalar field '+name);
  return scalar(row,meta);
}
function deltaBetween(a,b){
  const integer={};
  for(const m of integerMeta)integer[m.name]=Number(scalar(b,m))-Number(scalar(a,m));
  const gf2={};
  for(const m of gf2Meta)gf2[m.name]=Number(scalar(a,m))^Number(scalar(b,m));
  const categorical={};
  for(const m of categoricalMeta){
    const av=scalar(a,m),bv=scalar(b,m);
    categorical[m.name]={from:av,to:bv,changed:stable(av)!==stable(bv)};
  }
  const changedScalarFields=[];
  const unchangedScalarFields=[];
  for(const name of integerFields)(integer[name]===0?unchangedScalarFields:changedScalarFields).push(name);
  for(const name of gf2Fields)(gf2[name]===0?unchangedScalarFields:changedScalarFields).push(name);
  for(const name of categoricalFields)(categorical[name].changed?changedScalarFields:unchangedScalarFields).push(name);
  const changedBlocks=structural.fieldRegistry.blockOrder.filter(block=>stable(a.blocks[block])!==stable(b.blocks[block]));
  const unchangedBlocks=structural.fieldRegistry.blockOrder.filter(block=>!changedBlocks.includes(block));
  const changedVectorFields=[];
  for(const block of structural.fieldRegistry.blockOrder){
    for(const path of structural.fieldRegistry.vectorFields[block]??[]){
      if(stable(getPath(a.blocks[block],path))!==stable(getPath(b.blocks[block],path)))changedVectorFields.push(`${block}.${path}`);
    }
  }
  return {integer,gf2,categorical,changedScalarFields,unchangedScalarFields,changedBlocks,unchangedBlocks,changedVectorFields};
}
function edgeRecord(a,b,orientation,step){
  const d=deltaBetween(a,b);
  return {
    id:`${a.board}->${b.board}`,
    a:a.board,b:b.board,
    aOutcome:a.outcome,bOutcome:b.outcome,
    transition:`${a.outcome}->${b.outcome}`,
    outcomeChanged:a.outcome!==b.outcome,
    orientation,step,
    dW:b.width-a.width,dH:b.height-a.height,
    ...d
  };
}

function buildTrajectories(axis){
  const fixed=axis==='width'?'width':'height';
  const varying=axis==='width'?'height':'width';
  const groups=new Map();
  for(const row of rows){
    const k=row[fixed];
    if(!groups.has(k))groups.set(k,[]);
    groups.get(k).push(row);
  }
  const trajectories=[];
  for(const [fixedValue,g] of [...groups.entries()].sort((a,b)=>a[0]-b[0])){
    g.sort((a,b)=>a[varying]-b[varying]);
    if(g.length<2)continue;
    const edges=[];
    for(let i=0;i<g.length-1;i++){
      const step=g[i+1][varying]-g[i][varying];
      edges.push(edgeRecord(g[i],g[i+1],varying,step));
    }
    trajectories.push({
      fixedAxis:fixed,fixedValue,varyingAxis:varying,
      boards:g.map(x=>x.board),outcomes:g.map(x=>x.outcome),
      edges
    });
  }
  return trajectories;
}
const fixedWidthTrajectories=buildTrajectories('width');
const fixedHeightTrajectories=buildTrajectories('height');
const trajectoryEdges=[...fixedWidthTrajectories.flatMap(x=>x.edges),...fixedHeightTrajectories.flatMap(x=>x.edges)];
const sameParityByTwoTrajectoryEdges=trajectoryEdges.filter(x=>x.step===2);
const unitTrajectoryEdges=trajectoryEdges.filter(x=>x.step===1);

const unitEdges=[];
for(const row of rows){
  const rw=byBoard.get(outcomeKey(row.width+1,row.height));
  if(rw)unitEdges.push(edgeRecord(row,rw,'width',1));
  const rh=byBoard.get(outcomeKey(row.width,row.height+1));
  if(rh)unitEdges.push(edgeRecord(row,rh,'height',1));
}
unitEdges.sort((a,b)=>a.a.localeCompare(b.a)||a.b.localeCompare(b.b));
const outcomeChangingEdges=unitEdges.filter(x=>x.outcomeChanged);
const outcomePreservingEdges=unitEdges.filter(x=>!x.outcomeChanged);

const OUTCOMES=['P1_WIN','DRAW','P2_WIN'];
function deltaValue(edge,name){
  if(name in edge.integer)return edge.integer[name];
  if(name in edge.gf2)return edge.gf2[name];
  if(name in edge.categorical){
    const c=edge.categorical[name];
    return c.changed?`${c.from}->${c.to}`:`=${c.from}`;
  }
  throw new Error('delta field missing '+name);
}
function summarizeTransitionEdges(edges){
  if(!edges.length)return {
    edgeCount:0,distinctDeltaSignatures:0,repeatedDeltaMotifs:[],
    invariantScalarFields:[],necessarilyChangedScalarFields:[],constantDeltaFields:[],
    smallestCommonTypedSupport:[],orientationCounts:{width:0,height:0}
  };
  const motifs=new Map();
  for(const e of edges){
    const sig=sha256({integer:e.integer,gf2:e.gf2,categorical:e.categorical});
    if(!motifs.has(sig))motifs.set(sig,{signature:sig,count:0,edges:[]});
    const m=motifs.get(sig);m.count++;m.edges.push(e.id);
  }
  const invariant=allScalarFields.filter(name=>edges.every(e=>!e.changedScalarFields.includes(name)));
  const necessary=allScalarFields.filter(name=>edges.every(e=>e.changedScalarFields.includes(name)));
  const constant=allScalarFields.filter(name=>{
    const v=stable(deltaValue(edges[0],name));
    return edges.every(e=>stable(deltaValue(e,name))===v);
  }).map(name=>({field:name,delta:deltaValue(edges[0],name)}));
  return {
    edgeCount:edges.length,
    distinctDeltaSignatures:motifs.size,
    repeatedDeltaMotifs:[...motifs.values()].filter(x=>x.count>1).sort((a,b)=>b.count-a.count||a.signature.localeCompare(b.signature)),
    invariantScalarFields:invariant,
    necessarilyChangedScalarFields:necessary,
    constantDeltaFields:constant,
    smallestCommonTypedSupport:intersectionArrays(edges.map(e=>e.changedBlocks)),
    orientationCounts:{
      width:edges.filter(e=>e.orientation==='width').length,
      height:edges.filter(e=>e.orientation==='height').length
    }
  };
}
const transitionClasses={};
for(const a of OUTCOMES)for(const b of OUTCOMES){
  const key=`${a}->${b}`;
  transitionClasses[key]=summarizeTransitionEdges(unitEdges.filter(e=>e.transition===key));
}

function omitKeys(obj,keys){
  const out={};
  for(const [k,v] of Object.entries(obj))if(!keys.has(k))out[k]=v;
  return out;
}
function quotientBlock(row,block,identitySuppressed){
  const value=row.blocks[block];
  if(!identitySuppressed)return value;
  if(block==='G')return omitKeys(value,new Set(['width','height','cells','startDomainDimensions']));
  if(block==='R')return omitKeys(value,new Set(['standardQualifiedMiddle','sequentialMarkedResidualCategory']));
  if(block==='C')return omitKeys(value,new Set(['responseMatroidExactGeometrySummary']));
  if(block==='Q')return {available:value.available};
  return value;
}
function frozenGroups(selectedBlocks,identitySuppressed){
  const groups=new Map();
  for(const row of rows){
    const sig=stable(selectedBlocks.map(block=>quotientBlock(row,block,identitySuppressed)));
    if(!groups.has(sig))groups.set(sig,[]);
    groups.get(sig).push(row);
  }
  return groups;
}
function witnessPair(group){
  let best=null;
  for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
    if(group[i].outcome===group[j].outcome)continue;
    const d=Math.abs(group[i].width-group[j].width)+Math.abs(group[i].height-group[j].height);
    const area=Math.max(group[i].width*group[i].height,group[j].width*group[j].height);
    const key=`${Math.min(group[i].width*group[i].height,group[j].width*group[j].height)}|${area}|${group[i].board}|${group[j].board}`;
    if(!best||d<best.distance||(d===best.distance&&key<best.key))best={boards:[group[i].board,group[j].board],outcomes:[group[i].outcome,group[j].outcome],distance:d,key};
  }
  if(!best)return null;
  delete best.key;
  return best;
}
function auditFrozenPartition(groups){
  let pureClasses=0,mixedClasses=0,singletonClasses=0,pureRows=0;
  const mixed=[];
  for(const [sig,g] of groups){
    const labels=[...new Set(g.map(x=>x.outcome))].sort();
    if(g.length===1)singletonClasses++;
    if(labels.length===1){pureClasses++;pureRows+=g.length;}
    else {
      mixedClasses++;
      mixed.push({
        signatureHash:sha256(sig),
        boards:g.map(x=>x.board).sort(),
        outcomes:labels,
        witness:witnessPair(g)
      });
    }
  }
  mixed.sort((a,b)=>a.boards.length-b.boards.length||a.boards[0].localeCompare(b.boards[0]));
  return {
    classCount:groups.size,pureClasses,mixedClasses,singletonClasses,pureRows,mixedRows:rows.length-pureRows,
    smallestMixedWitness:mixed[0]??null,
    mixedClassesDetail:mixed
  };
}
function refinement(identitySuppressed){
  const stages=[];
  const selected=[];
  const order=['G','I','R','P','C','D','Q'];
  for(let i=0;i<order.length;i++){
    selected.push(order[i]);
    const groups=frozenGroups(selected,identitySuppressed);
    const audit=auditFrozenPartition(groups);
    const next=order[i+1]??null;
    let nextBlockWitnessSplit=null;
    if(next&&audit.smallestMixedWitness?.witness){
      const [a,b]=audit.smallestMixedWitness.witness.boards.map(x=>byBoard.get(x));
      nextBlockWitnessSplit={
        nextBlock:next,
        boards:[a.board,b.board],
        split:stable(quotientBlock(a,next,identitySuppressed))!==stable(quotientBlock(b,next,identitySuppressed))
      };
    }
    stages.push({blocks:[...selected],...audit,nextBlockWitnessSplit});
  }
  return stages;
}
function ablations(){
  const usable=['G','I','R','P','C','D'];
  return usable.map(omit=>{
    const selected=usable.filter(x=>x!==omit);
    return {omittedBlock:omit,blocks:selected,...auditFrozenPartition(frozenGroups(selected,true))};
  });
}
const literalStages=refinement(false);
const identitySuppressedStages=refinement(true);

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
      let rowG=0n;
      for(let j=c+1;j<A[0].length;j++)rowG=gcdBig(rowG,A[i][j]);
      if(rowG>1n)for(let j=c+1;j<A[0].length;j++)A[i][j]/=rowG;
    }
    r++;
  }
  return r;
}
function gf2Analysis(matrix,fields){
  const n=fields.length;
  const masks=matrix.map(row=>row.reduce((m,x,i)=>x?(m|(1n<<BigInt(i))):m,0n));
  let r=0;
  const rowsMask=[...masks];
  const pivots=[];
  for(let c=0;c<n&&r<rowsMask.length;c++){
    const bit=1n<<BigInt(c);
    let p=r;while(p<rowsMask.length&&(rowsMask[p]&bit)===0n)p++;
    if(p===rowsMask.length)continue;
    [rowsMask[r],rowsMask[p]]=[rowsMask[p],rowsMask[r]];
    for(let i=0;i<rowsMask.length;i++)if(i!==r&&(rowsMask[i]&bit))rowsMask[i]^=rowsMask[r];
    pivots.push(c);r++;
  }
  const pivotSet=new Set(pivots);
  const free=[];for(let c=0;c<n;c++)if(!pivotSet.has(c))free.push(c);
  const basisMasks=[];
  for(const f of free){
    let v=1n<<BigInt(f);
    for(let pi=0;pi<pivots.length;pi++){
      const p=pivots[pi];
      if(rowsMask[pi]&(1n<<BigInt(f)))v|=1n<<BigInt(p);
    }
    basisMasks.push(v);
  }
  function support(mask){const out=[];for(let i=0;i<n;i++)if(mask&(1n<<BigInt(i)))out.push(fields[i]);return out;}
  let circuits=[];
  let exhaustive=true;
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
    circuits=antichain.sort((a,b)=>popcountBig(a)-popcountBig(b)).map(support);
  } else {
    exhaustive=false;
    const antichain=[];
    for(const v of basisMasks){
      if(antichain.some(x=>(x&v)===x))continue;
      for(let i=antichain.length-1;i>=0;i--)if((antichain[i]&v)===v)antichain.splice(i,1);
      antichain.push(v);
    }
    circuits=antichain.map(support);
  }
  return {
    rank:r,nullity:n-r,
    nullspaceBasis:basisMasks.map(support),
    minimalCircuits:{exhaustive,supports:circuits}
  };
}

function frac(n,d=1n){
  if(d===0n)throw new Error('zero denominator');
  if(n===0n)return {n:0n,d:1n};
  if(d<0n){n=-n;d=-d;}
  const g=gcdBig(n,d);return {n:n/g,d:d/g};
}
function fsub(a,b){return frac(a.n*b.d-b.n*a.d,a.d*b.d);}
function fdiv(a,b){return frac(a.n*b.d,a.d*b.n);}
function fzero(a){return a.n===0n;}
function rationalNullspace(matrix,fields){
  const m=matrix.length,n=fields.length;
  if(n===0)return {rank:0,nullity:0,nullspaceBasis:[],basisMinimalSupports:[]};
  const A=Array.from({length:m},(_,i)=>Array.from({length:n},(_,j)=>frac(BigInt(matrix[i][j]))));
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
      for(let j=c;j<n;j++)A[i][j]=fsub(A[i][j],frac(q.n*A[r][j].n,q.d*A[r][j].d));
    }
    pivots.push(c);r++;
  }
  const pivotSet=new Set(pivots),free=[];
  for(let c=0;c<n;c++)if(!pivotSet.has(c))free.push(c);
  const basis=[];
  for(const f of free){
    const v=Array.from({length:n},()=>frac(0n));
    v[f]=frac(1n);
    for(let i=0;i<pivots.length;i++)v[pivots[i]]=frac(-A[i][f].n,A[i][f].d);
    const support=v.map((x,i)=>x.n!==0n?fields[i]:null).filter(Boolean);
    basis.push({freeField:fields[f],support,coefficients:v.map(x=>x.d===1n?x.n.toString():`${x.n}/${x.d}`)});
  }
  const min=basis.filter((x,i)=>!basis.some((y,j)=>i!==j&&y.support.length<x.support.length&&y.support.every(z=>x.support.includes(z))));
  return {rank:r,nullity:n-r,nullspaceBasis:basis,basisMinimalSupports:min.map(x=>x.support),exhaustiveCircuitEnumeration:false};
}

function smithDiagonal(matrix){
  if(!matrix.length||!matrix[0]?.length)return [];
  const A=matrix.map(row=>row.map(x=>BigInt(x)));
  const m=A.length,n=A[0].length;
  function swapRows(i,j){[A[i],A[j]]=[A[j],A[i]];}
  function swapCols(i,j){for(let r=0;r<m;r++)[A[r][i],A[r][j]]=[A[r][j],A[r][i]];}
  function negRow(i){for(let j=0;j<n;j++)A[i][j]=-A[i][j];}
  let k=0,guard=0;
  while(k<m&&k<n){
    let best=null;
    for(let i=k;i<m;i++)for(let j=k;j<n;j++)if(A[i][j]!==0n){
      if(!best||absBig(A[i][j])<best.abs)best={i,j,abs:absBig(A[i][j])};
    }
    if(!best)break;
    swapRows(k,best.i);swapCols(k,best.j);
    while(true){
      if(++guard>200000)throw new Error('SNF guard exceeded');
      if(A[k][k]<0n)negRow(k);
      let acted=false;
      for(let i=k+1;i<m;i++){
        if(A[i][k]===0n)continue;
        const q=A[i][k]/A[k][k];
        for(let j=k;j<n;j++)A[i][j]-=q*A[k][j];
        if(A[i][k]!==0n&&absBig(A[i][k])<absBig(A[k][k]))swapRows(i,k);
        acted=true;break;
      }
      if(acted)continue;
      for(let j=k+1;j<n;j++){
        if(A[k][j]===0n)continue;
        const q=A[k][j]/A[k][k];
        for(let i=k;i<m;i++)A[i][j]-=q*A[i][k];
        if(A[k][j]!==0n&&absBig(A[k][j])<absBig(A[k][k]))swapCols(j,k);
        acted=true;break;
      }
      if(acted)continue;
      let bad=null;
      outer:for(let i=k+1;i<m;i++)for(let j=k+1;j<n;j++){
        if(A[i][j]%A[k][k]!==0n){bad={i,j};break outer;}
      }
      if(bad){
        for(let j=k;j<n;j++)A[k][j]+=A[bad.i][j];
        continue;
      }
      break;
    }
    if(A[k][k]<0n)negRow(k);
    k++;
  }
  for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(i!==j&&A[i][j]!==0n)throw new Error('SNF did not diagonalize');
  const diag=[];
  for(let i=0;i<Math.min(m,n);i++)if(A[i][i]!==0n)diag.push(absBig(A[i][i]));
  for(let i=1;i<diag.length;i++)if(diag[i]%diag[i-1]!==0n)throw new Error('SNF divisibility invariant failed');
  return diag.map(x=>x.toString());
}
function algebraSelfTest(){
  const cases=[
    {m:[[2,0],[0,3]],d:['1','6']},
    {m:[[2,4],[6,8]],d:['2','4']},
    {m:[[1,2,3],[4,5,6]],d:['1','3']}
  ];
  for(const x of cases){
    const got=smithDiagonal(x.m);
    if(stable(got)!==stable(x.d))throw new Error('SNF self-test failed '+stable({got,want:x.d}));
  }
  if(integerRank([[1,2],[2,4]])!==1||integerRank([[1,2],[2,5]])!==2)throw new Error('integer rank self-test failed');
  const g=gf2Analysis([[1,1,0],[0,1,1]],['a','b','c']);
  if(g.rank!==2||g.nullity!==1||stable(g.minimalCircuits.supports)!==stable([['a','b','c']]))throw new Error('GF2 self-test failed');
}
algebraSelfTest();

function matrixFor(edges,meta,type){
  return edges.map(e=>meta.map(m=>type==='integer'?e.integer[m.name]:e.gf2[m.name]));
}
function perBlockRank(edges,meta,type){
  const out={};
  for(const block of structural.fieldRegistry.blockOrder){
    const fields=meta.filter(x=>x.block===block);
    if(!fields.length){out[block]={fields:[],rank:0};continue;}
    const matrix=matrixFor(edges,fields,type);
    const rank=type==='integer'?integerRank(matrix):gf2Analysis(matrix,fields.map(x=>x.name)).rank;
    let smith={computed:false,diagonal:[]};
    if(type==='integer'&&fields.length<=12&&edges.length<=100){
      smith={computed:true,diagonal:smithDiagonal(matrix)};
    }
    out[block]={fields:fields.map(x=>x.name),rank,smith:type==='integer'?smith:undefined};
  }
  return out;
}
function integerReport(edges){
  const matrix=matrixFor(edges,integerMeta,'integer');
  const nullspace=rationalNullspace(matrix,integerFields);
  const perBlock=perBlockRank(edges,integerMeta,'integer');
  return {
    edgeCount:edges.length,fieldCount:integerFields.length,rank:nullspace.rank,nullity:nullspace.nullity,
    smithNormalForm:{computed:false,reason:'Full mixed integer matrix intentionally not diagonalized; exact SNF is computed per typed block where column count <= 12.'},
    columnDependencies:{basisMinimalSupports:nullspace.basisMinimalSupports,nullspaceBasis:nullspace.nullspaceBasis},
    perBlock
  };
}
function gf2Report(edges){
  const matrix=matrixFor(edges,gf2Meta,'gf2');
  return {edgeCount:edges.length,fieldCount:gf2Fields.length,...gf2Analysis(matrix,gf2Fields),perBlock:perBlockRank(edges,gf2Meta,'gf2')};
}
function heldOutRank(axis,type){
  const vals=[...new Set(rows.map(x=>x[axis]))].sort((a,b)=>a-b);
  const reports=[];
  for(const held of vals){
    const keep=outcomeChangingEdges.filter(e=>{
      const a=byBoard.get(e.a),b=byBoard.get(e.b);
      return a[axis]!==held&&b[axis]!==held;
    });
    const rank=type==='integer'?integerRank(matrixFor(keep,integerMeta,'integer')):gf2Analysis(matrixFor(keep,gf2Meta,'gf2'),gf2Fields).rank;
    reports.push({held,edgeCount:keep.length,rank});
  }
  return {
    axis,reports,
    minRank:reports.length?Math.min(...reports.map(x=>x.rank)):0,
    maxRank:reports.length?Math.max(...reports.map(x=>x.rank)):0
  };
}
const integerAll=integerReport(unitEdges),integerBoundary=integerReport(outcomeChangingEdges),integerPreserving=integerReport(outcomePreservingEdges);
const gf2All=gf2Report(unitEdges),gf2Boundary=gf2Report(outcomeChangingEdges),gf2Preserving=gf2Report(outcomePreservingEdges);

function differingFields(a,b,meta=allScalarMeta){
  const out=[];
  for(const m of meta)if(stable(scalar(a,m))!==stable(scalar(b,m)))out.push(m.name);
  return out;
}
const contrastPairs=[];
for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  const diff=differingFields(rows[i],rows[j]);
  const diffSet=new Set(diff);
  contrastPairs.push({
    a:rows[i].board,b:rows[j].board,
    aOutcome:rows[i].outcome,bOutcome:rows[j].outcome,
    sameOutcome:rows[i].outcome===rows[j].outcome,
    differentFieldIndices:diff.map(x=>allScalarFields.indexOf(x)),
    agreeFieldIndices:allScalarFields.map((_,q)=>q).filter(q=>!diffSet.has(allScalarFields[q]))
  });
}
const sameOutcomePairs=contrastPairs.filter(x=>x.sameOutcome);
const differentOutcomePairs=contrastPairs.filter(x=>!x.sameOutcome);

function minimizeMasks(masks){
  const uniq=[...new Map(masks.map(x=>[x.toString(),x])).values()];
  uniq.sort((a,b)=>popcountBig(a)-popcountBig(b)||(a<b?-1:a>b?1:0));
  const out=[];
  for(const m of uniq){
    if(out.some(x=>(x&m)===x))continue;
    out.push(m);
  }
  return out;
}
function minimalHittingSets(meta,pairs,maxAntichain=5000){
  const index=new Map(meta.map((x,i)=>[x.name,i]));
  const constraints=[];
  const impossible=[];
  for(const p of pairs){
    const a=byBoard.get(p.a),b=byBoard.get(p.b);
    let mask=0n;
    for(const name of differingFields(a,b,meta))mask|=1n<<BigInt(index.get(name));
    if(mask===0n)impossible.push({a:p.a,b:p.b,aOutcome:p.aOutcome,bOutcome:p.bOutcome});
    else constraints.push(mask);
  }
  if(impossible.length)return {complete:true,truncated:false,impossibleWitnesses:impossible,sets:[]};
  let hs=[0n],truncated=false;
  for(const c of constraints){
    const next=[];
    for(const h of hs){
      if(h&c){next.push(h);continue;}
      for(let i=0;i<meta.length;i++)if(c&(1n<<BigInt(i)))next.push(h|(1n<<BigInt(i)));
    }
    hs=minimizeMasks(next);
    if(hs.length>maxAntichain){
      truncated=true;
      hs=hs.slice(0,maxAntichain);
    }
  }
  hs=minimizeMasks(hs);
  return {
    complete:!truncated,truncated,limit:maxAntichain,impossibleWitnesses:[],
    sets:hs.map(mask=>meta.filter((_,i)=>mask&(1n<<BigInt(i))).map(x=>x.name))
  };
}
function separationFrequencies(meta){
  const out=[];
  for(const m of meta){
    let sameDiff=0,diffDiff=0;
    for(const p of sameOutcomePairs){
      if(stable(scalar(byBoard.get(p.a),m))!==stable(scalar(byBoard.get(p.b),m)))sameDiff++;
    }
    for(const p of differentOutcomePairs){
      if(stable(scalar(byBoard.get(p.a),m))!==stable(scalar(byBoard.get(p.b),m)))diffDiff++;
    }
    out.push({
      field:m.name,block:m.block,type:m.type,
      sameOutcomePairSeparationCount:sameDiff,
      sameOutcomePairSeparationFraction:sameOutcomePairs.length?sameDiff/sameOutcomePairs.length:0,
      differentOutcomePairSeparationCount:diffDiff,
      differentOutcomePairSeparationFraction:differentOutcomePairs.length?diffDiff/differentOutcomePairs.length:0
    });
  }
  return out;
}
const primarySeparators=minimalHittingSets(identitySuppressedScalarMeta,differentOutcomePairs);
const allSeparators=minimalHittingSets(allScalarMeta,differentOutcomePairs);
const originalBoards=new Set(original.labeledRows.map(x=>outcomeKey(x.width,x.height)));
const originalDifferentPairs=differentOutcomePairs.filter(x=>originalBoards.has(x.a)&&originalBoards.has(x.b));
const freshAffectedDifferentPairs=differentOutcomePairs.filter(x=>!originalBoards.has(x.a)||!originalBoards.has(x.b));
const originalSeparators=minimalHittingSets(identitySuppressedScalarMeta,originalDifferentPairs,2000);
function separatorCoverage(fields,pairs){
  let hit=0;
  for(const p of pairs){
    const a=byBoard.get(p.a),b=byBoard.get(p.b);
    if(fields.some(name=>stable(scalarByName(a,name))!==stable(scalarByName(b,name))))hit++;
  }
  return {pairs:pairs.length,hit,coverage:pairs.length?hit/pairs.length:null};
}
const chronologyReuse=originalSeparators.sets.map(fields=>({
  fields,
  freshAffectedDifferentOutcomeCoverage:separatorCoverage(fields,freshAffectedDifferentPairs),
  combinedDifferentOutcomeCoverage:separatorCoverage(fields,differentOutcomePairs)
}));

function blockChange(a,b){return structural.fieldRegistry.blockOrder.filter(block=>stable(a.blocks[block])!==stable(b.blocks[block]));}
function vectorDelta(a,b,meta,type){
  return meta.map(m=>type==='integer'?Number(scalar(b,m))-Number(scalar(a,m)):Number(scalar(a,m))^Number(scalar(b,m)));
}
function addVectors(vs){return vs[0].map((_,i)=>vs.reduce((s,v)=>s+v[i],0));}
function xorVectors(vs){return vs[0].map((_,i)=>vs.reduce((s,v)=>s^v[i],0));}
const triangles=[];
for(const row of rows){
  const a=row,b=byBoard.get(outcomeKey(row.width+1,row.height)),d=byBoard.get(outcomeKey(row.width,row.height+1)),c=byBoard.get(outcomeKey(row.width+1,row.height+1));
  if(!b||!c||!d)continue;
  for(const spec of [
    {orientation:'W_THEN_H',verts:[a,b,c],exchange:['+W','+H','-W-H']},
    {orientation:'H_THEN_W',verts:[a,d,c],exchange:['+H','+W','-W-H']}
  ]){
    const [x,y,z]=spec.verts;
    const pairs=[[x,y],[y,z],[z,x]];
    const intVecs=pairs.map(([u,v])=>vectorDelta(u,v,integerMeta,'integer'));
    const gfVecs=pairs.map(([u,v])=>vectorDelta(u,v,gf2Meta,'gf2'));
    const intResidual=addVectors(intVecs),gfResidual=xorVectors(gfVecs);
    const supports=pairs.map(([u,v])=>blockChange(u,v));
    const boundaryEdges=pairs.filter(([u,v])=>u.outcome!==v.outcome).length;
    triangles.push({
      id:`${x.board}|${y.board}|${z.board}`,
      orientation:spec.orientation,vertices:spec.verts.map(v=>v.board),outcomes:spec.verts.map(v=>v.outcome),
      exchangeOrientation:spec.exchange,
      integerDeltaVectors:intVecs,gf2DeltaVectors:gfVecs,
      integerCircuitResidual:intResidual,gf2CircuitResidual:gfResidual,
      integerCircuitClosed:intResidual.every(v=>v===0),gf2CircuitClosed:gfResidual.every(v=>v===0),
      edgeBlockSupports:supports,
      unionBlockSupport:[...new Set(supports.flat())].sort(),
      commonBlockSupport:intersectionArrays(supports),
      outcomeBoundaryEdgeCount:boundaryEdges
    });
  }
}
const triangleTopologyMap=new Map();
for(const t of triangles){
  const supportKey=t.edgeBlockSupports.map(x=>[...x].sort().join('+')).join('|');
  const key=`${t.outcomeBoundaryEdgeCount}#${supportKey}`;
  if(!triangleTopologyMap.has(key))triangleTopologyMap.set(key,{outcomeBoundaryEdgeCount:t.outcomeBoundaryEdgeCount,edgeBlockSupportTopology:supportKey,count:0,triangles:[]});
  const q=triangleTopologyMap.get(key);q.count++;q.triangles.push(t.id);
}
const triangleTopologies=[...triangleTopologyMap.values()].sort((a,b)=>a.outcomeBoundaryEdgeCount-b.outcomeBoundaryEdgeCount||b.count-a.count);

function identitySuppressedPartitionAblations(){return ablations();}
function compactFocus(board){
  const r=byBoard.get(board);
  return {
    board,outcome:r.outcome,
    width:r.width,height:r.height,
    pathRadius:r.blocks.P.pathRadius,phaseRadiusParity:r.blocks.P.phaseRadiusParity,
    phaseDimension:r.blocks.P.phaseDimension,safeEntryCount:r.blocks.P.safeEntryCount,
    pairDisplacementRank:r.blocks.P.pairDisplacementRank,
    pairDisplacementNullity:r.blocks.P.pairDisplacementNullity,
    maxImpactCount:r.blocks.D.maxInitialImpactCount,
    coreDelta:r.blocks.I.coreDelta,coreDeltaSign:r.blocks.I.coreDeltaSign,
    neutralPairCapacity:r.blocks.C.neutralPairCapacity
  };
}
const focusCollision=['8x6','9x6','10x6'].map(compactFocus);

const view4={
  integer:{
    all:integerAll,boundary:integerBoundary,preserving:integerPreserving,
    boundaryNovelDimension:integerAll.rank-integerPreserving.rank,
    preservingNovelDimension:integerAll.rank-integerBoundary.rank,
    leaveOneWidthOutBoundary:heldOutRank('width','integer'),
    leaveOneHeightOutBoundary:heldOutRank('height','integer')
  },
  gf2:{
    all:gf2All,boundary:gf2Boundary,preserving:gf2Preserving,
    boundaryNovelDimension:gf2All.rank-gf2Preserving.rank,
    preservingNovelDimension:gf2All.rank-gf2Boundary.rank,
    leaveOneWidthOutBoundary:heldOutRank('width','gf2'),
    leaveOneHeightOutBoundary:heldOutRank('height','gf2')
  }
};

const finalIdentityStage=identitySuppressedStages[identitySuppressedStages.length-1];
const boundarySupportBlocks=[...new Set(outcomeChangingEdges.flatMap(e=>e.changedBlocks))].sort();

const result={
  schema:'connect4.uc4a_latent_structure_tomography_analysis.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_EXPERIMENT_DESIGN_0_1.md',
  analysisProtocol:'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_ANALYSIS_PROTOCOL_0_1.md',
  structuralAtlas:'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_STRUCTURAL_0_1.json',
  structuralAtlasSha256:STRUCTURAL_SHA,
  boardCount:rows.length,labelCount:labelMap.size,
  oracleUsedForStructuralConstruction:false,
  solvedInputsUsedForStructuralConstruction:false,
  outcomeLabelsUsedOnlyAfterStructuralFreeze:true,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  bsfpModified:false,
  scalarFieldRegistry:{
    integerFields,gf2Fields,categoricalFields,
    identitySuppressedFields:identitySuppressedScalarFields
  },
  views:{
    view1:{
      fixedWidthTrajectories,fixedHeightTrajectories,
      unitTrajectoryEdges,sameParityByTwoTrajectoryEdges,
      counts:{fixedWidth:fixedWidthTrajectories.length,fixedHeight:fixedHeightTrajectories.length,unit:unitTrajectoryEdges.length,sameParityByTwo:sameParityByTwoTrajectoryEdges.length}
    },
    view2:{
      unitEdges,outcomeChangingEdges,outcomePreservingEdges,transitionClasses,
      boundarySupportBlocks
    },
    view3:{
      literalExact:{
        stages:literalStages,
        warning:'Complete G contains raw W/H identity; literal exact G refinement singletonizes the cohort and is reported as a singleton-memorization warning, not evidence of an outcome law.'
      },
      identitySuppressed:{
        stages:identitySuppressedStages,
        leaveOneBlockOut:identitySuppressedPartitionAblations()
      }
    },
    view4,
    view5:{
      fieldOrder:allScalarFields,
      contrastPairs,
      sameOutcomePairCount:sameOutcomePairs.length,differentOutcomePairCount:differentOutcomePairs.length,
      minimalDifferentOutcomeSeparators:primarySeparators.sets,
      separatorSearch:{complete:primarySeparators.complete,truncated:primarySeparators.truncated,limit:primarySeparators.limit??null,impossibleWitnesses:primarySeparators.impossibleWitnesses},
      allScalarIncludingIdentitySeparators:allSeparators,
      separationFrequencies:separationFrequencies(identitySuppressedScalarMeta),
      sourceChronology:{
        originalDifferentOutcomePairCount:originalDifferentPairs.length,
        freshAffectedDifferentOutcomePairCount:freshAffectedDifferentPairs.length,
        originalMinimalSeparators:originalSeparators,
        reuseOnFreshAffectedPairs:chronologyReuse
      }
    },
    view6:{
      integerFieldOrder:integerFields,gf2FieldOrder:gf2Fields,
      triangles,topologies:triangleTopologies,
      allIntegerCircuitsClosed:triangles.every(x=>x.integerCircuitClosed),
      allGf2CircuitsClosed:triangles.every(x=>x.gf2CircuitClosed)
    }
  },
  focus:{
    '8x6_9x6_10x6':focusCollision
  },
  conclusion:[
    `The frozen 52-board atlas yields ${unitEdges.length} unit geometry edges, of which ${outcomeChangingEdges.length} cross a W/D/L boundary and ${outcomePreservingEdges.length} preserve outcome.`,
    `The exact integer delta ranks are all=${integerAll.rank}, boundary=${integerBoundary.rank}, preserving=${integerPreserving.rank}; the exact GF(2) ranks are all=${gf2All.rank}, boundary=${gf2Boundary.rank}, preserving=${gf2Preserving.rank}.`,
    `The outcome-boundary integer space contributes ${view4.integer.boundaryNovelDimension} dimension(s) beyond the preserving-edge span under the frozen scalar encoding; the GF(2) boundary contributes ${view4.gf2.boundaryNovelDimension} dimension(s) beyond its preserving-edge span.`,
    `Identity-suppressed blind refinement ends with ${finalIdentityStage.classCount} structural classes, ${finalIdentityStage.mixedClasses} mixed class(es), and ${finalIdentityStage.singletonClasses} singleton class(es); purity is descriptive only.`,
    `The triangle census contains ${triangles.length} oriented L-circuits. Pair-delta closure is exact by construction; recurring changed-block support and boundary-crossing topology, not closure alone, are the discovery signal.`,
    'No rank target was imposed. Any apparent low-dimensional boundary or separator remains a tomography observation until rederived from label-free UC4A/RLC current-state structure.'
  ],
  boundary:[
    'This result is descriptive tomography evidence and not a theorem of Connect Four W/D/L.',
    'No outcome label constructs, selects, tunes, discretizes, or repairs a structural coordinate in this phase.',
    'No sealed formula holdout is inspected, reconstructed, solved, inferred, or indirectly recovered.',
    'Production CPC and BSFP remain unchanged.',
    'A pure quotient cell, low-rank delta space, or minimal separator is not a runtime move-finder premise.'
  ]
};

console.log(JSON.stringify(result,null,2));

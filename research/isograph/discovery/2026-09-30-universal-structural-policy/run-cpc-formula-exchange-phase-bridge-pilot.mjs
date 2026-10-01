#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1_WIN=3;
const CHANNELS=[2,4,6]; // c3,c5,c7

function fromSequence(sequence){
  const q=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis,n:q.basis.length,terminal:q.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,p,index){
  const base=p?g.p1Offset:g.p0Offset;
  return !!(q.words[base+(index>>>5)]&(1<<(index&31)));
}
function activeIds(q,p){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);
  return out;
}
function minimalIds(q,p){
  const a=activeIds(q,p);
  return a.filter(id=>!a.some(o=>o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)));
}
function stateVector(q){
  const stats=CHANNELS.map(c=>({
    column:c+1,
    capacity:g.rows-q.words[c],
    depth0:0,
    positiveDepth:0,
    p1Depth0:0,
    p1PositiveDepth:0,
    p2Depth0:0,
    p2PositiveDepth:0,
  }));
  const byColumn=new Map(CHANNELS.map((c,i)=>[c,i]));
  for(let p=0;p<2;p++){
    for(const id of minimalIds(q,p)){
      const n=g.shapeSize[id],base=id*4;
      for(let k=0;k<n;k++){
        const cell=g.shapeCells[base+k],c=g.cellColumn[cell],r=g.cellRow[cell];
        const idx=byColumn.get(c);
        if(idx===undefined)continue;
        const d=r-q.words[c];
        if(d<0)continue;
        const s=stats[idx];
        if(d===0){
          s.depth0++;
          if(p===0)s.p1Depth0++; else s.p2Depth0++;
        }else{
          s.positiveDepth++;
          if(p===0)s.p1PositiveDepth++; else s.p2PositiveDepth++;
        }
      }
    }
  }
  const edges=[];
  let x=0,y=0;
  for(let a=0;a<stats.length;a++)for(let b=a+1;b<stats.length;b++){
    const left=stats[a],right=stats[b];
    const dC=right.capacity-left.capacity;
    const dD=right.positiveDepth-left.positiveDepth;
    const product=dC*dD;
    const relation=product<0?'NEG':product>0?'POS':'ZERO';
    if(relation==='NEG')x^=1;
    if(relation==='POS')y^=1;
    edges.push({columns:[left.column,right.column],deltaCapacity:dC,deltaPositiveDepth:dD,relation});
  }
  const B=stats.some(s=>s.depth0>0)?1:0;
  return {
    support:support(q),
    channels:stats,
    edges,
    x,y,B,
    F:[B&x,B&y,B&(x&y)],
  };
}
function xor3(a,b){return a.map((v,i)=>v^b[i]);}
function stateEqual(a,b){
  if(a.n!==b.n||a.words.length!==b.words.length)return false;
  for(let i=0;i<a.words.length;i++)if(a.words[i]!==b.words[i])return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  return true;
}

const Q='4444415666662322224233177716111';
const states={
  Q,
  A:Q+'57',
  B:Q+'77',
  ZA:Q+'5777',
  ZB:Q+'7757',
  ZC:Q+'7775',
};
const transitionSpec=[
  {state:'Q',p2:3,label:'EXPOSE',p1:3},
  {state:'Q',p2:5,label:'TRANSFER',p1:7,next:'A'},
  {state:'Q',p2:7,label:'TRANSFER',p1:7,next:'B'},
  {state:'A',p2:3,label:'EXPOSE',p1:3},
  {state:'A',p2:5,label:'EXPOSE',p1:5},
  {state:'A',p2:7,label:'TRANSFER',p1:7,next:'ZA'},
  {state:'B',p2:3,label:'EXPOSE',p1:3},
  {state:'B',p2:5,label:'TRANSFER',p1:7,next:'ZB'},
  {state:'B',p2:7,label:'TRANSFER',p1:5,next:'ZC'},
  {state:'ZA',p2:3,label:'EXPOSE',p1:3},
  {state:'ZA',p2:5,label:'EXPOSE',p1:5},
  {state:'ZB',p2:3,label:'EXPOSE',p1:3},
  {state:'ZB',p2:5,label:'EXPOSE',p1:5},
  {state:'ZC',p2:3,label:'EXPOSE',p1:3},
  {state:'ZC',p2:5,label:'EXPOSE',p1:5},
];

const qStates={};
for(const [name,seq] of Object.entries(states)){
  const q=fromSequence(seq);
  assert.equal(q.terminal,0, name+' terminal');
  qStates[name]=q;
}
assert(stateEqual(qStates.ZA,qStates.ZB));
assert(stateEqual(qStates.ZA,qStates.ZC));

const rows=[];
for(const spec of transitionSpec){
  const q=qStates[spec.state];
  const pre=stateVector(q);
  const afterP2=step(q,spec.p2-1);
  assert.equal(afterP2.terminal,0, spec.state+' p2 '+spec.p2+' unexpectedly terminal');
  const post=stateVector(afterP2);
  const response=step(afterP2,spec.p1-1);
  if(spec.label==='EXPOSE'){
    assert.equal(response.terminal,P1_WIN, spec.state+' expose response not exact P1 terminal');
  }else{
    assert.equal(response.terminal,0, spec.state+' transfer response terminal');
    assert(spec.next);
    assert(stateEqual(response,qStates[spec.next]), spec.state+' transfer child mismatch '+spec.next);
  }
  rows.push({
    state:spec.state,
    p2Column:spec.p2,
    p1ResponseColumn:spec.p1,
    label:spec.label,
    target:spec.label==='EXPOSE'?1:0,
    pre,
    post,
    deltaF:xor3(pre.F,post.F),
    responseTerminal:response.terminal,
    next:spec.next??null,
  });
}

function signature(row){
  return [...row.pre.F,...row.post.F,...row.deltaF].join('');
}
const signatureGroups=new Map();
for(const row of rows){
  const key=signature(row);
  let g0=signatureGroups.get(key);
  if(!g0){g0={signature:key,labels:new Set(),rows:[]};signatureGroups.set(key,g0);}
  g0.labels.add(row.label);
  g0.rows.push(row.state+':'+row.p2Column);
}
const signatureSummary=[...signatureGroups.values()].map(x=>({
  signature:x.signature,
  labels:[...x.labels].sort(),
  rows:x.rows,
  pure:x.labels.size===1,
}));
const tupleSeparates=signatureSummary.every(x=>x.pure);

function solveLinear(featureName,makeFeatures){
  const A=rows.map(r=>[1,...makeFeatures(r),r.target]);
  const featureCount=A[0].length-1;
  let rank=0;
  const pivots=[];
  for(let col=0;col<featureCount&&rank<A.length;col++){
    let pivot=rank;
    while(pivot<A.length&&!A[pivot][col])pivot++;
    if(pivot===A.length)continue;
    [A[rank],A[pivot]]=[A[pivot],A[rank]];
    for(let r=0;r<A.length;r++)if(r!==rank&&A[r][col]){
      for(let c=col;c<=featureCount;c++)A[r][c]^=A[rank][c];
    }
    pivots.push(col);rank++;
  }
  let consistent=true;
  for(const row of A){
    let nonzero=false;
    for(let c=0;c<featureCount;c++)nonzero||=!!row[c];
    if(!nonzero&&row[featureCount]){consistent=false;break;}
  }
  const solution=new Array(featureCount).fill(0);
  if(consistent){
    for(let i=0;i<pivots.length;i++)solution[pivots[i]]=A[i][featureCount];
  }
  let mismatches=null;
  if(consistent){
    mismatches=0;
    for(const r of rows){
      const f=[1,...makeFeatures(r)];
      let y=0;
      for(let i=0;i<featureCount;i++)y^=solution[i]&f[i];
      if(y!==r.target)mismatches++;
    }
  }
  return {featureName,featureCount,rank,consistent,solution:consistent?solution:null,mismatches};
}
const linear=[
  solveLinear('PRE',r=>r.pre.F),
  solveLinear('POST',r=>r.post.F),
  solveLinear('DELTA',r=>r.deltaF),
  solveLinear('PRE_POST',r=>[...r.pre.F,...r.post.F]),
  solveLinear('PRE_DELTA',r=>[...r.pre.F,...r.deltaF]),
  solveLinear('POST_DELTA',r=>[...r.post.F,...r.deltaF]),
  solveLinear('ALL',r=>[...r.pre.F,...r.post.F,...r.deltaF]),
];

console.log(JSON.stringify({
  schema:'connect4.cpc_formula_exchange_phase_bridge_pilot.v1',
  jsMinSysSha:EXPECTED,
  formulaSource:{
    branch:'experiment/isomax-late-xor-components-20260929',
    head:'f6bfce75ebf6aeafef08b9102ce20e0bfade2bdb',
    importedValues:false,
    reusedFramework:[
      'signed capacity-depth pair exchange',
      'frontier-vs-positive-depth distinction',
      'boundary attachment',
      'two-primitive Bx/By/Bxy equation shape'
    ],
  },
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremTopologyUsed:'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md',
  equations:{
    channels:[3,5,7],
    capacity:'6-support[column]',
    positiveDepth:'owner-merged active-minimal residual-cell occurrence count at relative depth > 0',
    frontierDepth:'owner-merged active-minimal residual-cell occurrence count at relative depth = 0',
    pairRelation:'sign(deltaCapacity * deltaPositiveDepth)',
    x:'XOR of NEG pair relations',
    y:'XOR of POS pair relations',
    B:'any depth-zero occurrence on the three channels',
    F:'[B*x, B*y, B*(x AND y)]',
  },
  exactStates:Object.fromEntries(Object.entries(qStates).map(([name,q])=>[name,stateVector(q)])),
  exactSinkEquality:{ZA_ZB:stateEqual(qStates.ZA,qStates.ZB),ZA_ZC:stateEqual(qStates.ZA,qStates.ZC),ZB_ZC:stateEqual(qStates.ZB,qStates.ZC)},
  rows,
  tupleClassification:{tupleSeparates,groups:signatureSummary},
  linearClassification:linear,
  accept:tupleSeparates,
  conclusion:tupleSeparates?[
    'The formula-inspired exchange/frontier tuple separates every EXPOSE transition from every TRANSFER transition in the qualified three-column CPC machine.',
    'This is a structural bridge result only; it does not establish a universal formula or a production CPC rule.',
    'The linear-family report states separately whether any frozen GF(2) equation family is sufficient.'
  ]:[
    'At least one EXPOSE/TRANSFER collision remains under the frozen formula-inspired tuple.',
    'The bridge must be narrowed or enriched structurally before it can compress the CPC phase machine.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, local game-tree value, old OOO scalar code, best-move table, or sealed formula holdout is used.',
    'Formula artifacts contribute only pre-existing structural definitions; no formula scalar coefficient or outcome label is imported.',
    'Transition labels are the already-qualified exact CPC theorem topology, not fitted game outcomes.',
    'Production CPC and JSMinSys are unchanged.',
    'This pilot uses owner-merged depth counts first; owner-separated refinement is permitted only if this frozen pilot fails.'
  ]
},null,2));

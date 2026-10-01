// Aggregate CPC degree-3 residual deadline/parity diagnostic.
// Theorem-discovery only: no oracle, no move selection, no search.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});

function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function cells(id){
  const out=[],n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function minimalActive(q,player){
  const base=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id && g.shapeSize[other]<g.shapeSize[id] && connect4RbaShapeSubset(g,other,id)
  ));
}
function earliest(q,id){
  const needs=cells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=1;
  const rank=q.words[g.metaOffset]>>>2,remaining=g.cellCount-rank;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
}
function supportClosureSize(q,id){
  const maxByColumn=new Map();
  for(const cell of cells(id)){
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    maxByColumn.set(c,Math.max(maxByColumn.get(c)??-1,r));
  }
  let total=0;
  for(const [c,r] of maxByColumn)total+=r-q.words[c]+1;
  return total;
}
function qParity(q,id){
  const cs=cells(id),maxRow=Math.max(...cs.map(cell=>g.cellRow[cell]));
  return (supportClosureSize(q,id)+maxRow)&1;
}
function originalLineDeletionTopology(id){
  const set=new Set(cells(id)),topologies=[];
  for(let l=0;l<g.lineCount;l++){
    const base=l*4,line=[];
    for(let i=0;i<4;i++)line.push(g.lineRow[base+i]*g.columns+g.lineColumn[base+i]);
    if(![...set].every(x=>line.includes(x)))continue;
    const missing=line.findIndex(x=>!set.has(x));
    if(missing<0)continue;
    topologies.push({
      line:l,
      missingIndex:missing,
      connected:missing===0||missing===3,
      lineCells:line.map(cell=>({column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1}))
    });
  }
  return topologies;
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];
const rows=[];
for(const root of roots){
  const q=connect4RbaFromMoves(Array.from(root.sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  const attacker=(q.words[g.metaOffset]>>>2)&1;
  const minimal=minimalActive(q,attacker);
  const triples=minimal.filter(id=>g.shapeSize[id]===3).map(id=>({
    shape:id,
    deadline:earliest(q,id),
    supportClosureSize:supportClosureSize(q,id),
    maxRowZeroBased:Math.max(...cells(id).map(cell=>g.cellRow[cell])),
    cpcResidualParity:qParity(q,id),
    cells:cells(id).map(cell=>({column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1})),
    deletionTopologies:originalLineDeletionTopology(id)
  })).filter(x=>x.deadline!==null).sort((a,b)=>a.deadline-b.deadline||a.shape-b.shape);
  const first=triples.length?triples[0].deadline:null;
  rows.push({
    ...root,
    attacker:attacker+1,
    minimalResidualCount:minimal.length,
    tripleCount:triples.length,
    earliestTripleDeadline:first,
    earliestTriples:triples.filter(x=>x.deadline===first),
    triples
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_degree3_deadline_spectrum.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  boundary:'CPC residual parity and deletion topology are theorem-discovery coordinates only. No upper bound or move ordering is inferred unless an independent forcing theorem is proved.'
},null,2));

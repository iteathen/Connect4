#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-pooled-frontier-defect-profile.mjs <JSMinSys checkout>');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const moves=s=>Array.from(s,c=>Number(c)-1);
function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const mover=q=>rank(q)&1;
function coordHas(words,base,index){
  return (words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function shapeCells(id){
  const out=[],base=id*4,n=g.shapeSize[id];
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function cellName(cell){
  return {cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1};
}
function activeMinimal(q,player){
  const base=player?g.p1Offset:g.p0Offset,ids=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))ids.push(q.basis[i]);
  return ids.filter(id=>!ids.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function earliest(q,id,player){
  const r=rank(q),first=player===mover(q)?1:2,remaining=g.cellCount-r;
  const needs=shapeCells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){
    while(slot<need)slot+=2;
    if(slot>remaining)return null;
    slot+=2;
  }
  return slot-2;
}
function pooledTemplate(q){
  const pool=[],responseCells=[],triggerToResponse=[];
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],remaining=g.rows-h;
    if(!remaining)continue;
    let start=h;
    if(remaining&1){
      pool.push(h*g.columns+c);
      start+=1;
    }
    for(let r=start;r+1<g.rows;r+=2){
      const trigger=r*g.columns+c,response=(r+1)*g.columns+c;
      triggerToResponse.push([trigger,response]);
      responseCells.push(response);
    }
  }
  assert.equal(pool.length&1,0,'attacker-to-move rank should expose even odd-frontier pool');
  return {
    pool,
    responseCells,
    triggerToResponse,
  };
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];

const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q);
  assert.equal(rank(q),10);
  const t=pooledTemplate(q),poolSet=new Set(t.pool),responseSet=new Set(t.responseCells);
  const residuals=activeMinimal(q,attacker).map(id=>{
    const cs=shapeCells(id),protectedCells=cs.filter(x=>responseSet.has(x)),
      poolCells=cs.filter(x=>poolSet.has(x));
    return {
      id,
      size:g.shapeSize[id],
      cells:cs.map(cellName),
      earliest:earliest(q,id,attacker),
      protectedByVerticalResponse:protectedCells.map(cellName),
      poolCells:poolCells.map(cellName),
      poolMultiplicity:poolCells.length,
    };
  });
  const defects=residuals.filter(r=>r.protectedByVerticalResponse.length===0);
  const byPoolMultiplicity={};
  const byDeadline={};
  for(const d of defects){
    byPoolMultiplicity[d.poolMultiplicity]=(byPoolMultiplicity[d.poolMultiplicity]??0)+1;
    const k=d.earliest===null?'null':String(d.earliest);
    byDeadline[k]=(byDeadline[k]??0)+1;
  }

  // Current-frontier pairing obligations: a defect containing >=2 current pool
  // cells can be killed immediately if the attacker triggers one and the
  // defender chooses another contained pool cell. Record those pair edges.
  const poolPairEdges=new Map();
  for(const d of defects){
    const ps=d.poolCells.map(x=>x.cell);
    for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
      const a=Math.min(ps[i],ps[j]),b=Math.max(ps[i],ps[j]),k=a+':'+b;
      let x=poolPairEdges.get(k);
      if(!x){x={a,b,defects:[]};poolPairEdges.set(k,x);}
      x.defects.push(d.id);
    }
  }

  rows.push({
    ...root,
    attacker:attacker+1,
    support:Array.from(q.words.slice(0,g.columns)),
    remaining:Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),
    pool:t.pool.map(cellName),
    protectedResponseCells:t.responseCells.map(cellName),
    activeMinimalResidualCount:residuals.length,
    coveredResidualCount:residuals.length-defects.length,
    defectCount:defects.length,
    defectByPoolMultiplicity:byPoolMultiplicity,
    defectByDeadline:byDeadline,
    poolPairEdges:[...poolPairEdges.values()].map(e=>({
      cells:[cellName(e.a),cellName(e.b)],
      defectIds:e.defects,
      defectCount:e.defects.length
    })),
    defects,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_pooled_frontier_defect_profile.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremBase:'qualified pooled-frontier paired-response policy',
  rows,
  interpretation:[
    'responseCells are the vertically protected cells of the qualified pooled-frontier policy',
    'defects are exact active minimal attacker residuals not intersecting any such protected cell',
    'poolMultiplicity records how much of each defect lies in the currently playable odd-frontier pool',
    'poolPairEdges are candidate dynamic pairing resources only; this probe does not promote them as a complete safety theorem'
  ],
  boundary:[
    'This is consumed-boundary theorem-discovery evidence only.',
    'A defect does not imply an attacker win.',
    'A pool pair edge does not by itself prove simultaneous compatibility with every other defect.',
    'No W/D/L or oracle value is used.'
  ]
},null,2));

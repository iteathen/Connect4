#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-rsf-attachment-failure-profile.mjs <JSMinSys checkout>');
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
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function shapeCells(id){const out=[],base=id*4,n=g.shapeSize[id];for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
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
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
}
function cellDesc(q,cell){
  const c=g.cellColumn[cell],row=g.cellRow[cell],depth=row-q.words[c];
  return {
    cell,column:c+1,row:row+1,depth,
    frontier:depth===0,
    positiveDepth:depth>0,
    releaseRank:depth+1,
    remainingColumn:g.rows-q.words[c]
  };
}
function pooledResources(q){
  const pool=[],verticalResponses=[],verticalTriggers=[];
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],remaining=g.rows-h;
    if(!remaining)continue;
    let start=h;
    if(remaining&1){pool.push(h*g.columns+c);start+=1;}
    for(let r=start;r+1<g.rows;r+=2){
      verticalTriggers.push(r*g.columns+c);
      verticalResponses.push((r+1)*g.columns+c);
    }
  }
  return {pool,verticalResponses,verticalTriggers};
}
function canonicalResidualSignature(q,id){
  return shapeCells(id)
    .map(cell=>{
      const d=cellDesc(q,cell);
      return [d.column,d.depth,d.remainingColumn];
    })
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2])
    .map(x=>x.join(':')).join(',');
}
function profile(sequence,label){
  const q=ingress(sequence),attacker=mover(q),res=pooledResources(q),
    poolSet=new Set(res.pool),vrSet=new Set(res.verticalResponses),
    minimal=activeMinimal(q,attacker);
  const residuals=minimal.map(id=>{
    const cells=shapeCells(id),descs=cells.map(cell=>cellDesc(q,cell)),
      poolCells=cells.filter(c=>poolSet.has(c)),verticalCells=cells.filter(c=>vrSet.has(c));
    return {
      id,size:g.shapeSize[id],earliest:earliest(q,id,attacker),
      signature:canonicalResidualSignature(q,id),
      frontierCount:descs.filter(x=>x.frontier).length,
      positiveDepthCount:descs.filter(x=>x.positiveDepth).length,
      minDepth:Math.min(...descs.map(x=>x.depth)),
      maxDepth:Math.max(...descs.map(x=>x.depth)),
      depthWord:descs.map(x=>x.depth).sort((a,b)=>a-b),
      columns:descs.map(x=>x.column).sort((a,b)=>a-b),
      cells:descs,
      pooledVerticalCovered:verticalCells.length>0,
      pooledVerticalCells:verticalCells.map(c=>cellDesc(q,c)),
      poolMultiplicity:poolCells.length,
      poolCells:poolCells.map(c=>cellDesc(q,c))
    };
  });
  const defects=residuals.filter(x=>!x.pooledVerticalCovered);
  const hist=(xs,key)=>{
    const o={};for(const x of xs){const k=String(key(x));o[k]=(o[k]??0)+1;}return o;
  };
  const attachmentEdges=[];
  for(const d of defects)for(const c of d.cells)if(c.frontier)
    attachmentEdges.push({residual:d.id,cell:c.cell,column:c.column,row:c.row});
  const cellDegree={};
  for(const e of attachmentEdges)cellDegree[e.cell]=(cellDegree[e.cell]??0)+1;
  return {
    label,sequence,rank:rank(q),attacker:attacker+1,
    support:Array.from(q.words.slice(0,g.columns)),
    remaining:Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),
    frontier:Array.from({length:g.columns},(_,c)=>q.words[c]<g.rows?cellDesc(q,q.words[c]*g.columns+c):null).filter(Boolean),
    pooled:{
      pool:res.pool.map(c=>cellDesc(q,c)),
      verticalResponses:res.verticalResponses.map(c=>cellDesc(q,c))
    },
    activeMinimalResidualCount:residuals.length,
    pooledDefectCount:defects.length,
    defectDeadlineHistogram:hist(defects,x=>x.earliest),
    defectFrontierMultiplicityHistogram:hist(defects,x=>x.frontierCount),
    defectDepthWordHistogram:hist(defects,x=>x.depthWord.join('.')),
    frontierAttachmentCellDegrees:Object.entries(cellDegree).map(([cell,degree])=>({
      cell:Number(cell),...cellDesc(q,Number(cell)),degree
    })).sort((a,b)=>a.cell-b.cell),
    defects,
  };
}

const cases=[
  ['c2_fail_r4','444441566254'],
  ['c2_fail_r2','444441566252'],
  ['c2_fail_r1','444441566251'],
  ['c3_fail_r1','444441566331'],
  ['c3_fail_r5','444441566335'],
  ['c3_fail_r4','444441566334'],
  ['c6_fail_r4','444441566614'],
  ['c6_fail_r5','444441566615'],
  ['c6_fail_r6','444441566616']
].map(([label,sequence])=>profile(sequence,label));

function familySummary(prefix){
  const rows=cases.filter(x=>x.label.startsWith(prefix));
  const commonDepthWords=[...new Set(rows[0].defects.map(x=>x.depthWord.join('.')))]
    .filter(w=>rows.every(r=>r.defects.some(x=>x.depthWord.join('.')===w)));
  const commonFrontierCells=[...new Set(rows[0].frontierAttachmentCellDegrees.map(x=>x.cell))]
    .filter(c=>rows.every(r=>r.frontierAttachmentCellDegrees.some(x=>x.cell===c)));
  return {
    family:prefix,
    rows:rows.map(r=>({
      label:r.label,defects:r.pooledDefectCount,
      deadlineHistogram:r.defectDeadlineHistogram,
      frontierMultiplicityHistogram:r.defectFrontierMultiplicityHistogram,
      depthWordHistogram:r.defectDepthWordHistogram,
      frontierAttachmentCellDegrees:r.frontierAttachmentCellDegrees
    })),
    commonDepthWords,commonFrontierCells
  };
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rsf_attachment_failure_profile.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  objective:'Profile the first pooled-renewal failure frontier using remaining-capacity/support-release/frontier coordinates while preserving exact residual attachment identity.',
  isographGuidance:[
    'DP 0.9: preserve minimum sufficient support for the declared survival-class objective; do not rank features before sufficiency.',
    'Core 0.21: do not erase a load-bearing source-semantic attachment merely because a coarser derived view looks simpler.',
    'Formula clue: depth=0 frontier exposure versus positive-depth bulk is load-bearing in the strongest pooled remainder audit.',
    'Formula clue: R/S/F composition preserved exact bounded future/action/value behavior; scalar parity or presence alone did not.'
  ],
  cases,
  families:[familySummary('c2_'),familySummary('c3_'),familySummary('c6_')],
  boundary:[
    'Consumed training evidence only.',
    'This profile does not assign W/D/L or strong distance.',
    'No scalar is promoted merely because it separates these cases.',
    'The next theorem must be derived from attachment/transition semantics and then freshly qualified.'
  ]
},null,2));

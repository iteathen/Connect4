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
const {connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const sequences=[
  '4444415666',
  '444441566666',
  '44444156666623',
  '4444415666662322',
  '444441566666232222',
  '44444156666623222242',
  '4444415666662322224233',
  '444441566666232222423311',
];

function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function cellDesc(q,cell){
  const column=g.cellColumn[cell],row=g.cellRow[cell];
  return {
    cell,
    column:column+1,
    row:row+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1
  };
}
function residuals(q,player){
  return activeMinimal(q,player).map(id=>{
    const size=g.shapeSize[id],base=id*4,cells=[];
    let ownerMask=0;
    for(let i=0;i<size;i++){
      const d=cellDesc(q,g.shapeCells[base+i]);
      cells.push(d);ownerMask|=1<<(d.projectedOwner-1);
    }
    return {
      residualId:id,
      size,
      cells,
      projectedOwnerMask:ownerMask,
      allProjectedToPlayer:ownerMask===(1<<player)
    };
  });
}

const rows=[];
for(const sequence of sequences){
  const moves=Array.from(sequence,c=>Number(c)-1);
  const q=connect4RbaFromMoves(moves,{geometry:g,canonical:false});
  const rank=q.words[g.metaOffset]>>>2,mover=rank&1;
  const remaining=[],parity=[];
  let totalRemaining=0,oddCount=0,oddMask=0;
  for(let c=0;c<g.columns;c++){
    const rem=g.rows-q.words[c];
    remaining.push(rem);parity.push(rem&1);totalRemaining+=rem;
    if(rem&1){oddCount+=1;oddMask|=1<<c;}
  }
  const p0=residuals(q,0),p1=residuals(q,1);
  rows.push({
    sequence,rank,mover:mover+1,
    support:Array.from(q.words.slice(0,g.columns)),
    remaining,
    remainderParity:parity,
    oddRemainderCount:oddCount,
    oddRemainderMask:oddMask>>>0,
    totalRemaining,
    totalRemainingParity:totalRemaining&1,
    players:[
      {
        player:1,
        minimalResidualCount:p0.length,
        fullyParityAlignedResiduals:p0.filter(x=>x.allProjectedToPlayer).map(x=>x.residualId),
        residuals:p0
      },
      {
        player:2,
        minimalResidualCount:p1.length,
        fullyParityAlignedResiduals:p1.filter(x=>x.allProjectedToPlayer).map(x=>x.residualId),
        residuals:p1
      }
    ]
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_zugzwang_parity_projection.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  boundary:[
    'Target projectedOwner is the existing exact CPC future-event parity projection verified against literal per-column event counting.',
    'A projected target owner is not by itself W/D/L. Exact value additionally requires proof that play cannot preempt or evade the decisive parity event.',
    'This probe does not enumerate defender response choices and introduces no response theorem.',
    'The listed sequences are consumed-boundary diagnostics only; any promoted zugzwang theorem requires independent fresh qualification.'
  ]
},null,2));

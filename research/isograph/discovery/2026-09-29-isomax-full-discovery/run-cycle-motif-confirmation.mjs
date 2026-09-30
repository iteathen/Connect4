import fs from 'node:fs';
import assert from 'node:assert/strict';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

const train=JSON.parse(fs.readFileSync(new URL('./CYCLE_FEATURES_0_1.json',import.meta.url),'utf8')).rows;
function pattern(cols){
  const map=new Map(); let next=0;
  return cols.map(c=>{if(!map.has(c))map.set(c,next++);return map.get(c);}).join(',');
}
const model=new Map();
for(const row of train){
  const key=row.parentRank+'|'+pattern(row.columns);
  if(model.has(key)&&model.get(key)!==row.syndrome)throw new Error('ambiguous training key');
  model.set(key,row.syndrome);
}

function cycleRows(width,height){
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k:3,nonterminalFrontierBlocker:true,moverFinalCapParity:true,
    measureLocalBranchClosure:false,emitPrimitiveWitnessData:true,
  });
  const pw=r.primitiveWitnessData;
  const ids=pw.binaryPhase.binaryGroupIds,edges=pw.binaryPhase.reducedEdges;
  const parent=new Map(ids.map(x=>[x,x])),phase=new Map(ids.map(x=>[x,0])),size=new Map(ids.map(x=>[x,1]));
  const tree=[],closures=[];
  function find(x){
    const p=parent.get(x);if(p===x)return[x,0];
    const [root,up]=find(p),q=phase.get(x)^up;parent.set(x,root);phase.set(x,q);return[root,q];
  }
  for(const e of edges){
    let [ra,pa]=find(e.from),[rb,pb]=find(e.to);
    if(ra===rb){closures.push({edge:e,syndrome:pa^pb^e.delta});continue;}
    const bridge=pa^pb^e.delta;tree.push(e);
    if(size.get(ra)<size.get(rb)){parent.set(ra,rb);phase.set(ra,bridge);size.set(rb,size.get(ra)+size.get(rb));}
    else{parent.set(rb,ra);phase.set(rb,bridge);size.set(ra,size.get(ra)+size.get(rb));}
  }
  const adj=new Map(ids.map(x=>[x,[]]));
  for(const e of tree){adj.get(e.from).push({n:e.to,e});adj.get(e.to).push({n:e.from,e});}
  function path(a,b){
    const q=[a],prev=new Map([[a,null]]);
    for(let i=0;i<q.length&&!prev.has(b);i++)for(const z of adj.get(q[i])??[])if(!prev.has(z.n)){prev.set(z.n,{p:q[i],e:z.e});q.push(z.n);}
    assert.ok(prev.has(b));const es=[];let x=b;
    while(x!==a){const z=prev.get(x);es.push(z.e);x=z.p;}
    return es.reverse();
  }
  return closures.map(({edge,syndrome})=>{
    const all=[...path(edge.from,edge.to),edge],columns=all.map(e=>e.column);
    return {width,height,k:3,parentRank:edge.parentRank,columns,pattern:pattern(columns),syndrome,closingEdgeId:edge.id};
  });
}

console.log('holdout 4x5 k3');const a=cycleRows(4,5);
console.log('holdout 5x4 k3');const b=cycleRows(5,4);
const holdout=[...a,...b].map(row=>{
  const key=row.parentRank+'|'+row.pattern,seen=model.has(key),prediction=seen?model.get(key):null;
  return {...row,key,seen,prediction,correct:seen?prediction===row.syndrome:null};
});
const seen=holdout.filter(x=>x.seen),unseen=holdout.filter(x=>!x.seen);
const out={
  schema:'connect4.isomax.discovery.cycle_motif_fresh_confirmation.v1',
  date_author_local:'2026-09-29',warrant:'EW-010',
  training:{rows:train.length,keys:model.size,nonzero:train.filter(x=>x.syndrome).length},
  holdout:{
    rows:holdout.length,nonzero:holdout.filter(x=>x.syndrome).length,
    seen:seen.length,unseen:unseen.length,
    seenCorrect:seen.filter(x=>x.correct).length,seenWrong:seen.filter(x=>!x.correct).length,
    seenNonzero:seen.filter(x=>x.syndrome).length,unseenNonzero:unseen.filter(x=>x.syndrome).length
  },
  allSeenCorrect:seen.every(x=>x.correct),
  completeCoverage:unseen.length===0,
  wrongExamples:seen.filter(x=>!x.correct).slice(0,32),
  unseenKeys:[...new Set(unseen.map(x=>x.key))].slice(0,256),
  rows:holdout,
  interpretation_guard:'Training map frozen from k=4 before k=3 holdout; unseen keys are not imputed.'
};
fs.writeFileSync(new URL('./CYCLE_MOTIF_CONFIRMATION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW010_COMPLETE',training:out.training,holdout:out.holdout,allSeenCorrect:out.allSeenCorrect,completeCoverage:out.completeCoverage},null,2));

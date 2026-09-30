import fs from 'node:fs';
import assert from 'node:assert/strict';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

function parseStateKey(key,width,height){
  assert.ok(key.startsWith('Q:'));
  const [hs,a,b]=key.slice(2).split('|');
  return {
    key,
    heights:hs.split(',').map(Number),
    p0Residuals:a? a.split('.').filter(Boolean).map(Number):[],
    p1Residuals:b? b.split('.').filter(Boolean).map(Number):[],
    width,height,
  };
}
function capMask(rec){
  let m=0;
  for(let c=0;c<rec.width;c++)if(rec.heights[c]<rec.height)
    m|=1<<((rec.height-1)*rec.width+c);
  return m>>>0;
}
function isPower2(x){return x!==0&&(x&(x-1))===0;}
function oneHoleRows(rec){
  const cap=capMask(rec),out=[];
  for(const [player,rs] of [[0,rec.p0Residuals],[1,rec.p1Residuals]])
    for(const residual0 of rs){
      const residual=residual0>>>0;
      if((residual&cap)!==residual)continue;
      const hole=(cap^residual)>>>0;
      if(!isPower2(hole))continue;
      const bit=31-Math.clz32(hole),col=bit%rec.width;
      out.push({player,residual,holeBit:bit,holeColumn:col});
    }
  return out;
}
function residualKey(player,residual){return player+':'+(residual>>>0);}
function motifPair(a,b){
  if(a.width!==b.width||a.height!==b.height)return {motif:false,reason:'geometry'};
  if(JSON.stringify(a.heights)!==JSON.stringify(b.heights))
    return {motif:false,reason:'support'};
  const setA=new Set([...a.p0Residuals.map(x=>residualKey(0,x)),...a.p1Residuals.map(x=>residualKey(1,x))]),
    setB=new Set([...b.p0Residuals.map(x=>residualKey(0,x)),...b.p1Residuals.map(x=>residualKey(1,x))]),
    onlyA=[...setA].filter(x=>!setB.has(x)),
    onlyB=[...setB].filter(x=>!setA.has(x)),
    holesAAll=oneHoleRows(a),holesBAll=oneHoleRows(b),
    holesAByKey=new Map(holesAAll.map(x=>[residualKey(x.player,x.residual),x])),
    holesBByKey=new Map(holesBAll.map(x=>[residualKey(x.player,x.residual),x])),
    diffA=onlyA.map(k=>holesAByKey.get(k)).filter(Boolean),
    diffB=onlyB.map(k=>holesBByKey.get(k)).filter(Boolean),
    allDiffOneHole=diffA.length===onlyA.length&&diffB.length===onlyB.length&&onlyA.length>0&&onlyB.length>0,
    colsA=[...new Set(diffA.map(x=>x.holeColumn))],
    colsB=[...new Set(diffB.map(x=>x.holeColumn))],
    union=[...new Set([...colsA,...colsB])].sort((x,y)=>x-y),
    disjoint=colsA.every(x=>!colsB.includes(x)),
    equalHeight=union.length===2&&a.heights[union[0]]===a.heights[union[1]],
    motif=allDiffOneHole&&union.length===2&&disjoint&&equalHeight;
  return {
    motif,heights:[...a.heights],capMask:capMask(a),
    onlyA,onlyB,diffA,diffB,holeColumnsA:colsA,holeColumnsB:colsB,
    holePair:union,equalHeight,allDiffOneHole,disjoint,
  };
}
function recFromCarrier(row,width,height){
  return {
    key:row.key,width,height,heights:row.heights,
    p0Residuals:row.p0Residuals,p1Residuals:row.p1Residuals,
  };
}
function cycleNodeSet(binary){
  const edges=binary.reducedEdges,adj=new Map();
  for(const e of edges){
    if(!adj.has(e.from))adj.set(e.from,[]);
    if(!adj.has(e.to))adj.set(e.to,[]);
    const i=e.id;
    adj.get(e.from).push({to:e.to,id:i});
    adj.get(e.to).push({to:e.from,id:i});
  }
  const disc=new Map(),low=new Map(),bridges=new Set();let time=0;
  function dfs(u,parentEdge=null){
    disc.set(u,++time);low.set(u,disc.get(u));
    for(const z of adj.get(u)??[]){
      if(z.id===parentEdge)continue;
      if(!disc.has(z.to)){
        dfs(z.to,z.id);
        low.set(u,Math.min(low.get(u),low.get(z.to)));
        if(low.get(z.to)>disc.get(u))bridges.add(z.id);
      }else low.set(u,Math.min(low.get(u),disc.get(z.to)));
    }
  }
  for(const u of adj.keys())if(!disc.has(u))dfs(u);
  const nodes=new Set(),cycleEdges=[];
  for(const e of edges)if(!bridges.has(e.id)){
    nodes.add(e.from);nodes.add(e.to);cycleEdges.push(e.id);
  }
  return {nodes,cycleEdges,bridgeCount:bridges.size};
}
function auditFlatControl(width,height,k,label){
  console.log('flat-control',label);
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k,
    nonterminalFrontierBlocker:true,moverFinalCapParity:true,
    measureLocalBranchClosure:false,
    emitPrimitiveWitnessData:true,emitFullDirectCarrier:true,
  });
  const pw=r.primitiveWitnessData,binary=pw.binaryPhase,
    cycle=cycleNodeSet(binary),groups=new Map(pw.deeperGroups.map(g=>[g.id,g])),
    byLabel=new Map();
  for(const row of pw.directCarrier){
    if(row.terminal)continue;
    const id=row.recursiveActionLabelledClass,support=row.heights.join(',');
    let sm=byLabel.get(id);if(!sm){sm=new Map();byLabel.set(id,sm);}
    let xs=sm.get(support);if(!xs){xs=[];sm.set(support,xs);}
    xs.push(row);
  }
  let groupsWithSharedSupport=0,motifGroups=0,cycleMotifGroups=0,cycleGroups=0,
    testedPairs=0;
  const examples=[],cycleExamples=[];
  for(const gid of binary.binaryGroupIds){
    const g=groups.get(gid);
    if(!g||g.labelledClasses.length!==2)continue;
    if(cycle.nodes.has(gid))cycleGroups++;
    const [la,lb]=g.labelledClasses,ma=byLabel.get(la),mb=byLabel.get(lb);
    if(!ma||!mb)continue;
    const supports=[...ma.keys()].filter(s=>mb.has(s));
    if(!supports.length)continue;
    groupsWithSharedSupport++;
    let found=null;
    outer: for(const support of supports)
      for(const ra of ma.get(support))for(const rb of mb.get(support)){
        testedPairs++;
        const m=motifPair(recFromCarrier(ra,width,height),recFromCarrier(rb,width,height));
        if(m.motif){found={groupId:gid,labelledClasses:[la,lb],support,...m};break outer;}
      }
    if(found){
      motifGroups++;
      if(examples.length<16)examples.push(found);
      if(cycle.nodes.has(gid)){
        cycleMotifGroups++;
        if(cycleExamples.length<16)cycleExamples.push(found);
      }
    }
  }
  const coc=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    label,width,height,k,
    summary:{states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,
      binaryGroups:r.deeperContinuationPhaseAudit.binaryGroups,
      cycleRank:coc.cycleRank,nonzero:coc.nonzeroCycleSyndromes,contradictions:coc.contradictoryReconvergences},
    groupsWithSharedSupport,testedPairs,motifGroups,cycleGroups,cycleMotifGroups,
    undirectedCycleEdges:cycle.cycleEdges.length,bridgeCount:cycle.bridgeCount,
    examples,cycleExamples,
  };
}

const old={
 source0:'Q:2,2,2,3,3|132096.264192.491520.884736|7168.491520.884736',
 source1:'Q:2,2,2,3,3|132096.264192.491520.753664|7168.491520.753664',
 target0:'Q:2,3,3,3,3|131072.263168|491520.753664',
 target1:'Q:2,3,3,3,3|131072.263168.884736|491520.884736',
};
const survivor={
 source0:'Q:1,1,3,3,4|96.3072.33824|67648.132160.264224.360448',
 source1:'Q:1,1,3,3,4|96.3072.33824|67648.132160.229376.264224',
 target0:'Q:2,3,3,3,4|1024|132096.360448',
 target1:'Q:2,3,3,3,4|1024|132096.229376',
};
function witnessAudit(keys,name){
  const s0=parseStateKey(keys.source0,5,4),s1=parseStateKey(keys.source1,5,4),
    t0=parseStateKey(keys.target0,5,4),t1=parseStateKey(keys.target1,5,4),
    source=motifPair(s0,s1),target=motifPair(t0,t1);
  assert.equal(source.motif,true,name+' source must exhibit motif');
  assert.equal(target.motif,true,name+' target must exhibit motif');
  assert.deepEqual(source.holePair,target.holePair,name+' source/target hole pair must agree');
  return {name,source,target,sharedHolePair:source.holePair};
}
const positive=[witnessAudit(old,'predecessor-minimum'),witnessAudit(survivor,'support-release-survivor')];
assert.deepEqual(positive[0].sharedHolePair,positive[1].sharedHolePair);

const flatControls=[
  auditFlatControl(4,5,4,'4x5-k4-flat'),
  auditFlatControl(5,3,3,'5x3-k3-flat'),
];
const flatCycleCounterexamples=flatControls.reduce((n,x)=>n+x.cycleMotifGroups,0);
const out={
 schema:'connect4.isomax.discovery.cap_hole_orientation_audit.v1',
 date_author_local:'2026-09-29',warrant:'EW-015',
 motif_definition:{
  support:'same exact height vector across the two compared sheet states',
  residual_difference:'every residual present on only one sheet is an exact one-hole subset of the current open-cap set',
  orientation:'the two sheets choose disjoint holes from one two-column hole pair',
  covariance:'hole columns are carried by column relabeling; raw residual mask numbers are not used as semantic identity',
  equal_height_guard:'the two hole columns have equal support height at the compared state'
 },
 positive,flatControls,
 result:flatCycleCounterexamples>0?'MOTIF_NOT_SUFFICIENT':'MOTIF_SURVIVES_TESTED_FLAT_CYCLE_CONTROLS',
 flatCycleCounterexamples,
 interpretation_guard:flatCycleCounterexamples>0?
  'The motif occurs on at least one actual binary-cycle-supporting group in a flat control, so it cannot by itself explain frustration.':
  'No tested flat cycle-supporting group exhibited the motif, but finite absence is only a sharpened candidate; it is not proof of sufficiency or necessity.'
};
fs.writeFileSync(new URL('./CAP_HOLE_ORIENTATION_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({
 status:'EW015_COMPLETE',result:out.result,
 positives:positive.map(x=>({name:x.name,holePair:x.sharedHolePair,source:x.source,target:x.target})),
 flat:flatControls.map(x=>({label:x.label,summary:x.summary,motifGroups:x.motifGroups,cycleGroups:x.cycleGroups,cycleMotifGroups:x.cycleMotifGroups,testedPairs:x.testedPairs}))
},null,2));

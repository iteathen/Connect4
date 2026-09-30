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
    heightPair=union.length===2?union.map(c=>a.heights[c]):[],
    motif=allDiffOneHole&&union.length===2&&disjoint;
  return {
    motif,heights:[...a.heights],capMask:capMask(a),
    onlyA,onlyB,diffA,diffB,holeColumnsA:colsA,holeColumnsB:colsB,
    holePair:union,heightPair,equalHeight,allDiffOneHole,disjoint,
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


function nonzeroFundamentalCycleNodes(binary){
  const ids=[...binary.binaryGroupIds],
    parent=new Map(ids.map(id=>[id,id])),
    parityToParent=new Map(ids.map(id=>[id,0])),
    size=new Map(ids.map(id=>[id,1])),
    forestAdj=new Map(ids.map(id=>[id,[]])),
    nonzeroNodes=new Set(),nonzeroClosingEdges=[];
  function find(id){
    const p=parent.get(id);
    if(p===id)return [id,0];
    const [root,up]=find(p),q=parityToParent.get(id)^up;
    parent.set(id,root);parityToParent.set(id,q);
    return [root,q];
  }
  function addPathNodes(a,b){
    const q=[a],prev=new Map([[a,null]]);
    for(let i=0;i<q.length&&!prev.has(b);i++){
      const u=q[i];
      for(const v of forestAdj.get(u)??[])if(!prev.has(v)){
        prev.set(v,u);q.push(v);
      }
    }
    assert.ok(prev.has(b),'forest path must exist for closing edge');
    let x=b;nonzeroNodes.add(b);
    while(x!==a){
      x=prev.get(x);nonzeroNodes.add(x);
    }
  }
  for(const edge of binary.reducedEdges){
    let [ra,pa]=find(edge.from),[rb,pb]=find(edge.to);
    if(ra===rb){
      const syndrome=pa^pb^edge.delta;
      if(syndrome){
        nonzeroClosingEdges.push(edge.id);
        nonzeroNodes.add(edge.from);nonzeroNodes.add(edge.to);
        addPathNodes(edge.from,edge.to);
      }
      continue;
    }
    const bridge=pa^pb^edge.delta;
    forestAdj.get(edge.from).push(edge.to);
    forestAdj.get(edge.to).push(edge.from);
    if(size.get(ra)<size.get(rb)){
      parent.set(ra,rb);parityToParent.set(ra,bridge);
      size.set(rb,size.get(ra)+size.get(rb));
    }else{
      parent.set(rb,ra);parityToParent.set(rb,bridge);
      size.set(ra,size.get(ra)+size.get(rb));
    }
  }
  return {nodes:nonzeroNodes,closingEdges:nonzeroClosingEdges};
}

function auditK3Case(width,height,label){
  console.log('k3-motif-holdout',label);
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k:3,
    nonterminalFrontierBlocker:true,moverFinalCapParity:true,
    measureLocalBranchClosure:false,
    emitPrimitiveWitnessData:true,emitFullDirectCarrier:true,
  });
  const pw=r.primitiveWitnessData,binary=pw.binaryPhase,
    cycle=cycleNodeSet(binary),
    nonzero=nonzeroFundamentalCycleNodes(binary),
    groups=new Map(pw.deeperGroups.map(g=>[g.id,g])),
    byLabel=new Map();
  for(const row of pw.directCarrier){
    if(row.terminal)continue;
    const id=row.recursiveActionLabelledClass,support=row.heights.join(',');
    let sm=byLabel.get(id);if(!sm){sm=new Map();byLabel.set(id,sm);}
    let xs=sm.get(support);if(!xs){xs=[];sm.set(support,xs);}
    xs.push(row);
  }
  let groupsWithSharedSupport=0,testedPairs=0,motifGroups=0,
    cycleGroups=0,cycleMotifGroups=0,nonzeroCycleMotifGroups=0;
  const motifExamples=[],nonzeroCycleMotifExamples=[];
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
        const m=motifPair(
          recFromCarrier(ra,width,height),
          recFromCarrier(rb,width,height));
        if(m.motif){
          found={groupId:gid,labelledClasses:[la,lb],support,...m};
          break outer;
        }
      }
    if(!found)continue;
    motifGroups++;
    if(motifExamples.length<24)motifExamples.push(found);
    if(cycle.nodes.has(gid))cycleMotifGroups++;
    if(nonzero.nodes.has(gid)){
      nonzeroCycleMotifGroups++;
      if(nonzeroCycleMotifExamples.length<24)
        nonzeroCycleMotifExamples.push(found);
    }
  }
  const coc=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    label,width,height,k:3,
    summary:{
      states:r.residualOrbitStates,
      classes:r.recursiveUnlabelledClasses,
      binaryGroups:r.deeperContinuationPhaseAudit.binaryGroups,
      cycleRank:coc.cycleRank,
      nonzero:coc.nonzeroCycleSyndromes,
      contradictions:coc.contradictoryReconvergences,
    },
    groupsWithSharedSupport,testedPairs,motifGroups,cycleGroups,
    cycleMotifGroups,
    nonzeroFundamentalCycleNodes:nonzero.nodes.size,
    nonzeroClosingEdges:nonzero.closingEdges.length,
    nonzeroCycleMotifGroups,
    motifExamples,nonzeroCycleMotifExamples,
  };
}

const flat=auditK3Case(4,5,'4x5-k3-flat'),
  obstructed=auditK3Case(5,4,'5x4-k3-obstructed');
assert.equal(flat.summary.nonzero,0,'4x5 k3 holdout must reproduce frozen flat baseline');
assert.equal(obstructed.summary.nonzero,23,'5x4 k3 holdout must reproduce frozen nonzero baseline');

const out={
  schema:'connect4.isomax.discovery.cap_hole_k3_confirmation.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-017',
  candidate_source:'EW-015 repaired motif',
  flat,obstructed,
  result:{
    motifOnNonzeroSupport:obstructed.nonzeroCycleMotifGroups>0,
    motifOnFlatCycleSupport:flat.cycleMotifGroups>0,
    crossKSupport:
      obstructed.nonzeroCycleMotifGroups>0&&flat.cycleMotifGroups===0,
  },
  interpretation_guard:'Fresh structural holdout over frozen motif definition. Positive overlap is supporting evidence, not necessity/sufficiency proof; absence is a scoped falsifier only.'
};
fs.writeFileSync(new URL('./CAP_HOLE_K3_CONFIRMATION_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({
  status:'EW017_COMPLETE',
  result:out.result,
  flat:{motifGroups:flat.motifGroups,cycleMotifGroups:flat.cycleMotifGroups,testedPairs:flat.testedPairs},
  obstructed:{motifGroups:obstructed.motifGroups,cycleMotifGroups:obstructed.cycleMotifGroups,nonzeroCycleMotifGroups:obstructed.nonzeroCycleMotifGroups,testedPairs:obstructed.testedPairs},
},null,2));

import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  analyzeDirectResidualOrbitGraph,
  analyzeDirectResidualOrbitGrowthCompact,
} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

const here=new URL('.',import.meta.url);
const write=(name,obj)=>fs.writeFileSync(new URL('./'+name,here),JSON.stringify(obj,null,2)+'\n');

function summary(r){
  const d=r.deeperContinuationPhaseAudit,c=d.binaryPhaseCocycleAudit,l=r.lateActionParityAudit;
  return {
    width:r.width,height:r.height,k:r.k,cells:r.cells,winningLineCount:r.winningLineCount,
    nonterminalFrontierBlocker:r.nonterminalFrontierBlocker,
    moverFinalCapParity:r.moverFinalCapParity,
    remainingMoveCapacity:r.remainingMoveCapacity,
    supportReleaseTurnCapacity:r.supportReleaseTurnCapacity,
    opponentOpenCapTerminalDominance:r.opponentOpenCapTerminalDominance,
    residualOrbitStates:r.residualOrbitStates,
    recursiveUnlabelledClasses:r.recursiveUnlabelledClasses,
    recursiveActionLabelledClasses:r.recursiveActionLabelledClasses,
    splitUnlabelledClasses:l.splitUnlabelledClasses,
    pureTransporterFibers:l.pureTransporterFibers,
    parityWellDefinedFibers:l.parityWellDefinedFibers,
    deeperGroups:d.groups,binaryGroups:d.binaryGroups,
    binaryContinuationEdges:d.binaryContinuationEdges,
    nonbinaryContinuationEdges:d.nonbinaryContinuationEdges,
    childTransporterEdges:d.childTransporterEdges,
    childBranchErasureEdges:d.childBranchErasureEdges,
    childTerminalOrUnknownEdges:d.childTerminalOrUnknownEdges,
    cycleRank:c.cycleRank,zeroCycleSyndromes:c.zeroCycleSyndromes,
    nonzeroCycleSyndromes:c.nonzeroCycleSyndromes,
    contradictoryReconvergences:c.contradictoryReconvergences,
    topologicalReconvergences:c.topologicalReconvergences,
    reconvergentPairs:c.reconvergentPairs,
    branchingPoints:c.branchingPoints,joiningPoints:c.joiningPoints,
    activeWeakComponents:c.activeWeakComponents,
    shortestInheritedChainEdges:c.shortestInheritedChainEdges,
    longestInheritedChainEdges:c.longestInheritedChainEdges,
    globalPhasePotentialExists:c.globalPhasePotentialExists,
    gaugeFlipInvariant:c.gaugeFlipInvariant,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
  };
}

function runCase(width,height,k,opts={},deep=false){
  return analyzeDirectResidualOrbitGraph({
    width,height,k,measureLocalBranchClosure:false,
    emitPrimitiveWitnessData:deep,
    ...opts,
  });
}

console.log('deep 4x4');
const d44=runCase(4,4,4,{},true);
console.log('deep 4x5');
const d45=runCase(4,5,4,{nonterminalFrontierBlocker:true,moverFinalCapParity:true},true);
console.log('deep 5x4');
const d54=runCase(5,4,4,{nonterminalFrontierBlocker:true,moverFinalCapParity:true},true);

const deep={c44:d44,c45:d45,c54:d54};
const guardMatrix=[];
for(const [w,h,label,baseline] of [[4,5,'4x5',d45],[5,4,'5x4',d54]]){
  for(const fb of [false,true])for(const cap of [false,true]){
    let r;
    if(fb&&cap)r=baseline;
    else{
      console.log('guard',label,'frontier',fb,'cap',cap);
      r=runCase(w,h,4,{nonterminalFrontierBlocker:fb,moverFinalCapParity:cap},false);
    }
    guardMatrix.push({label,frontier:fb,cap,...summary(r)});
  }
}

function compactVariants(width,height,label){
  const common={width,height,k:4,nonterminalFrontierBlocker:true,moverFinalCapParity:true};
  const baseline=analyzeDirectResidualOrbitGrowthCompact(common);
  const refined=analyzeDirectResidualOrbitGrowthCompact({...common,refinedColumnCanonicalization:true});
  const binary=analyzeDirectResidualOrbitGrowthCompact({...common,binaryTieLinearCanonicalization:true});
  const pick=x=>({
    residualOrbitStates:x.residualOrbitStates,
    recursiveUnlabelledClasses:x.recursiveUnlabelledClasses,
    rootValue:x.rootValue,
    earliestDynamicMergeRank:x.earliestDynamicMergeRank,
    literalActionEdges:x.literalActionEdges,
    duplicateEquivalentActionEdges:x.duplicateEquivalentActionEdges,
    canonicalPermutationCandidates:x.canonicalPermutationCandidates,
    maxCanonicalPermutationCandidates:x.maxCanonicalPermutationCandidates,
    binaryLinearCanonicalizations:x.binaryLinearCanonicalizations,
    binaryLinearFallbackCanonicalizations:x.binaryLinearFallbackCanonicalizations,
  });
  return {label,baseline:pick(baseline),refined:pick(refined),binaryLinear:pick(binary)};
}
console.log('representation controls');
const representationControls=[compactVariants(4,5,'4x5'),compactVariants(5,4,'5x4')];

function mapsFor(r){
  const pw=r.primitiveWitnessData,groups=new Map(pw.deeperGroups.map(g=>[g.id,g])),
    edges=pw.binaryPhase.reducedEdges;
  const out=new Map(),inc=new Map();
  for(const g of pw.binaryPhase.binaryGroupIds){out.set(g,[]);inc.set(g,[]);}
  for(const e of edges){out.get(e.from).push(e);inc.get(e.to).push(e);}
  return {pw,groups,edges,out,inc};
}

function shortestContradictions(r,label){
  const {pw,groups,edges,out}=mapsFor(r);
  const ids=[...pw.binaryPhase.binaryGroupIds].sort((a,b)=>
    groups.get(a).rank-groups.get(b).rank||a-b);
  const edgeById=new Map(edges.map(e=>[e.id,e])),rows=[];
  for(const source of ids){
    const best=new Map([[source,[{dist:0,path:[]},null]]]);
    for(const node of ids){
      const cur=best.get(node);if(!cur)continue;
      for(const e of out.get(node)??[]){
        let row=best.get(e.to);if(!row){row=[null,null];best.set(e.to,row);}
        for(let p=0;p<2;p++)if(cur[p]){
          const np=p^e.delta,nd=cur[p].dist+1;
          if(!row[np]||nd<row[np].dist)row[np]={dist:nd,path:[...cur[p].path,e.id]};
        }
      }
    }
    for(const [target,b] of best){
      if(target===source||!b[0]||!b[1])continue;
      const a0=b[0].path,a1=b[1].path,
        distinct=new Set([...a0,...a1]);
      rows.push({
        label,source,target,sourceRank:groups.get(source).rank,targetRank:groups.get(target).rank,
        parity0Edges:a0.length,parity1Edges:a1.length,
        totalTraversals:a0.length+a1.length,maxRouteEdges:Math.max(a0.length,a1.length),
        distinctEdges:distinct.size,
        parity0Path:a0.map(id=>edgeById.get(id)),
        parity1Path:a1.map(id=>edgeById.get(id)),
      });
    }
  }
  rows.sort((a,b)=>a.totalTraversals-b.totalTraversals||a.maxRouteEdges-b.maxRouteEdges||
    a.distinctEdges-b.distinctEdges||a.sourceRank-b.sourceRank||a.source-b.source||a.target-b.target);
  return {count:rows.length,minimum:rows[0]??null,all:rows};
}

const contradictionMss=shortestContradictions(d54,'5x4');
assert.equal(contradictionMss.count,d54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.contradictoryReconvergences);

function fundamentalCycles(r,label){
  const {pw,groups,edges,out,inc}=mapsFor(r);
  const ids=pw.binaryPhase.binaryGroupIds,parent=new Map(ids.map(x=>[x,x])),
    phase=new Map(ids.map(x=>[x,0])),size=new Map(ids.map(x=>[x,1])),
    tree=[],closures=[];
  function find(x){
    const p=parent.get(x);if(p===x)return [x,0];
    const [root,up]=find(p),q=phase.get(x)^up;parent.set(x,root);phase.set(x,q);return [root,q];
  }
  for(const e of edges){
    let [ra,pa]=find(e.from),[rb,pb]=find(e.to);
    if(ra===rb){closures.push({edge:e,syndrome:pa^pb^e.delta});continue;}
    tree.push(e);const bridge=pa^pb^e.delta;
    if(size.get(ra)<size.get(rb)){parent.set(ra,rb);phase.set(ra,bridge);size.set(rb,size.get(ra)+size.get(rb));}
    else{parent.set(rb,ra);phase.set(rb,bridge);size.set(ra,size.get(ra)+size.get(rb));}
  }
  const adj=new Map(ids.map(x=>[x,[]]));
  for(const e of tree){adj.get(e.from).push({n:e.to,e});adj.get(e.to).push({n:e.from,e});}
  function path(a,b){
    const q=[a],prev=new Map([[a,null]]);
    for(let i=0;i<q.length&&!prev.has(b);i++)for(const z of adj.get(q[i])??[])if(!prev.has(z.n)){prev.set(z.n,{p:q[i],e:z.e});q.push(z.n);}
    assert.ok(prev.has(b));const es=[];let x=b;while(x!==a){const z=prev.get(x);es.push(z.e);x=z.p;}es.reverse();return es;
  }
  return closures.map(({edge,syndrome})=>{
    const p=path(edge.from,edge.to),all=[...p,edge],
      columns=all.map(e=>e.column),delta1=all.filter(e=>e.delta===1).length,
      ranks=all.map(e=>e.parentRank),fromOut=(out.get(edge.from)??[]).length,toIn=(inc.get(edge.to)??[]).length;
    return {
      label,closingEdgeId:edge.id,syndrome,
      parentRank:edge.parentRank,closingColumn:edge.column,closingDelta:edge.delta,
      pathLength:p.length,cycleLength:all.length,cycleLengthParity:all.length&1,
      distinctColumns:new Set(columns).size,repeatedColumn:new Set(columns).size<columns.length,
      minRank:Math.min(...ranks),maxRank:Math.max(...all.map(e=>e.targetRank)),
      fromOutDegree:fromOut,toInDegree:toIn,
      delta1Count:delta1,delta1Parity:delta1&1,
      columns,edgeIds:all.map(e=>e.id),
    };
  });
}

const cycles=[...fundamentalCycles(d44,'4x4'),...fundamentalCycles(d45,'4x5'),...fundamentalCycles(d54,'5x4')];
assert.equal(cycles.filter(x=>x.syndrome).length,
  d44.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes+
  d45.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes+
  d54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes);

const structuralFeatures=['parentRank','closingColumn','pathLength','cycleLengthParity','distinctColumns','repeatedColumn','fromOutDegree','toInDegree'];
function signature(row,fs){return fs.map(f=>String(row[f])).join('|');}
function perfectlyClassifies(fs){
  const m=new Map();
  for(const row of cycles){
    const k=signature(row,fs),v=row.syndrome;
    if(m.has(k)&&m.get(k)!==v)return false;m.set(k,v);
  }
  return true;
}
const minimalStructuralDiscriminators=[];
for(let n=1;n<=3;n++){
  function choose(start,pick){
    if(pick.length===n){
      if(perfectlyClassifies(pick)&&!minimalStructuralDiscriminators.some(x=>x.every(f=>pick.includes(f))))
        minimalStructuralDiscriminators.push([...pick]);
      return;
    }
    for(let i=start;i<structuralFeatures.length;i++)choose(i+1,[...pick,structuralFeatures[i]]);
  }
  choose(0,[]);
  if(minimalStructuralDiscriminators.length)break;
}

function histogram(rows,key){const m={};for(const r of rows){const k=String(r[key]);m[k]=(m[k]??0)+1;}return m;}
const dts={
  schema:'connect4.isomax.discovery.dts_analysis.v1',
  comparison_view:'transition boundary = binary deeper group; transition = one reduced binary-continuation edge',
  exact_roles:['source/target binary group','parent/target rank','action column','sheet delta','incoming/outgoing graph incidence','ordered path membership'],
  projected_roles:['full residual cofactor delta unless explicitly present in obstruction representatives'],
  qu_roles:['none invented; unresolved mechanism identity remains outside TI claim'],
  cycle_family:{
    total:cycles.length,nonzero:cycles.filter(x=>x.syndrome).length,
    zero:cycles.filter(x=>!x.syndrome).length,
    structural_feature_histograms:{
      zero:{
        parentRank:histogram(cycles.filter(x=>!x.syndrome),'parentRank'),
        pathLength:histogram(cycles.filter(x=>!x.syndrome),'pathLength'),
        distinctColumns:histogram(cycles.filter(x=>!x.syndrome),'distinctColumns'),
        fromOutDegree:histogram(cycles.filter(x=>!x.syndrome),'fromOutDegree'),
        toInDegree:histogram(cycles.filter(x=>!x.syndrome),'toInDegree'),
      },
      nonzero:{
        parentRank:histogram(cycles.filter(x=>x.syndrome),'parentRank'),
        pathLength:histogram(cycles.filter(x=>x.syndrome),'pathLength'),
        distinctColumns:histogram(cycles.filter(x=>x.syndrome),'distinctColumns'),
        fromOutDegree:histogram(cycles.filter(x=>x.syndrome),'fromOutDegree'),
        toInDegree:histogram(cycles.filter(x=>x.syndrome),'toInDegree'),
      }
    },
    finite_structural_discriminator_search:{
      candidate_features:structuralFeatures,
      excluded_as_tautological:['syndrome','delta1Count','delta1Parity'],
      maximum_subset_size_tested:3,
      minimal_perfect_discriminators:minimalStructuralDiscriminators
    }
  },
  shortest_5x4_contradiction:contradictionMss.minimum,
  ti_disposition:{
    flat4x4_vs_shortest5x4:'CANDIDATE_ONLY__same coarse reconvergence role does not establish TI; delta/path anatomy differs and identity is separate',
    zero_vs_nonzero_cycle:'CANDIDATE_FAMILY__structural signatures are discovery filters only; no base-DTS invariant signature is assumed'
  }
};

const mss={
  schema:'connect4.isomax.discovery.mss_analysis.v1',
  objectives:[
    {
      id:'MSS-001',
      target:'bounded 5x4 scalar nonintegrability witness',
      cost_axes:['total traversed binary-continuation transitions','maximum route length','distinct transition edges'],
      exact_search_scope:'all contradictory source-target pairs in complete reduced 5x4 binary inheritance DAG',
      result:contradictionMss.minimum,
      all_minima:contradictionMss.all.filter(x=>
        contradictionMss.minimum&&
        x.totalTraversals===contradictionMss.minimum.totalTraversals&&
        x.maxRouteEdges===contradictionMss.minimum.maxRouteEdges&&
        x.distinctEdges===contradictionMss.minimum.distinctEdges),
      interpretation:'minimum is objective-scoped; no universal proof-cost metric is claimed'
    },
    {
      id:'MSS-002',
      target:'nonzero fundamental-cycle syndrome classification from non-tautological local transition features',
      cost_axis:'number of selected structural features',
      candidate_features:structuralFeatures,
      result:minimalStructuralDiscriminators.length?{status:'FINITE_SCOPE_PERFECT_CLASSIFIER_FOUND',feature_sets:minimalStructuralDiscriminators}:{status:'NO_PERFECT_CLASSIFIER_UP_TO_3_FEATURES'},
      caveat:'finite observed cycle family only; classifier is discovery evidence, not theorem'
    }
  ]
};

const observations={
  schema:'connect4.isomax.discovery.phase1_observations.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-001',
  baselines:[summary(d44),summary(d45),summary(d54)],
  guard_matrix:guardMatrix,
  representation_controls:representationControls,
  open_observations:{
    baseline_cycle_examples:{
      c44:d44.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,
      c45:d45.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,
      c54:d54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,
    },
    c54_shortest_transporter_audit:d54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.shortestContradictionTransporterAudit??null,
    c54_obstruction_groups:d54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.obstructionGroupExamples,
  },
  prohibited_information_sources_used:{solved_database:false,wdl_as_structural_producer_input:false}
};

write('PHASE1_OBSERVATIONS_0_1.json',observations);
write('DTS_ANALYSIS_0_1.json',dts);
write('MSS_ANALYSIS_0_1.json',mss);
write('CYCLE_FEATURES_0_1.json',{schema:'connect4.isomax.discovery.cycle_features.v1',rows:cycles});
write('CONTRADICTION_MSS_ALL_0_1.json',{schema:'connect4.isomax.discovery.contradiction_mss_all.v1',...contradictionMss});
console.log(JSON.stringify({
  status:'DISCOVERY_PHASE1_COMPLETE',
  guardMatrix:guardMatrix.map(x=>({label:x.label,frontier:x.frontier,cap:x.cap,cycles:x.cycleRank,nonzero:x.nonzeroCycleSyndromes,contradictions:x.contradictoryReconvergences,states:x.residualOrbitStates})),
  mss:mss.objectives,
  structuralDiscriminators:minimalStructuralDiscriminators,
},null,2));

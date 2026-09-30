import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';

const cases=[
 {label:'4x5-k4',width:4,height:5,k:4},
 {label:'5x4-k4',width:5,height:4,k:4},
 {label:'4x5-k3',width:4,height:5,k:3},
 {label:'5x4-k3',width:5,height:4,k:3},
];
const configs=[
 {id:'remaining',remainingMoveCapacity:true,supportReleaseTurnCapacity:false},
 {id:'release',remainingMoveCapacity:false,supportReleaseTurnCapacity:true},
];
function one(c,config){
 const r=analyzeDirectResidualOrbitGraph({
  width:c.width,height:c.height,k:c.k,
  nonterminalFrontierBlocker:true,moverFinalCapParity:true,
  remainingMoveCapacity:config.remainingMoveCapacity,
  supportReleaseTurnCapacity:config.supportReleaseTurnCapacity,
  measureLocalBranchClosure:false,
 });
 const d=r.deeperContinuationPhaseAudit,coc=d.binaryPhaseCocycleAudit;
 return {
  label:c.label,config:config.id,width:c.width,height:c.height,k:c.k,
  states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,
  actionClasses:r.recursiveActionLabelledClasses,
  binaryGroups:d.binaryGroups,binaryEdges:d.binaryContinuationEdges,
  nonbinary:d.nonbinaryContinuationEdges,transporter:d.childTransporterEdges,
  erasure:d.childBranchErasureEdges,
  cycleRank:coc.cycleRank,zero:coc.zeroCycleSyndromes,nonzero:coc.nonzeroCycleSyndromes,
  contradictions:coc.contradictoryReconvergences,globalPhasePotentialExists:coc.globalPhasePotentialExists,
  gaugeFlipInvariant:coc.gaugeFlipInvariant,outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer,
 };
}
const rows=[];
for(const c of cases)for(const config of configs){
 console.log('gravity-realizability',c.label,config.id);
 rows.push(one(c,config));
}
const baselines={
 '4x5-k4':{cycleRank:40,nonzero:0,contradictions:0,states:102815,classes:86791},
 '5x4-k4':{cycleRank:644,nonzero:25,contradictions:12,states:289852,classes:251222},
 '4x5-k3':{cycleRank:27,nonzero:0,contradictions:0,states:34222,classes:14201},
 '5x4-k3':{cycleRank:451,nonzero:23,contradictions:18,states:108293,classes:50682},
};
const contrasts=rows.map(x=>{
 const b=baselines[x.label];
 return {...x,
  deltaCycleRank:x.cycleRank-b.cycleRank,
  deltaNonzero:x.nonzero-b.nonzero,
  deltaContradictions:x.contradictions-b.contradictions,
  integrabilityChanged:(b.nonzero===0)!==(x.nonzero===0),
 };
});
const out={
 schema:'connect4.isomax.discovery.gravity_realizability_closures.v1',
 date_author_local:'2026-09-29',warrant:'EW-012',
 baselines,rows,contrasts,
 interpretation_guard:'These are exact bounded producer interventions. Closure invariance/failure is scoped to these cases and does not itself identify a universal mechanism.'
};
fs.writeFileSync(new URL('./GRAVITY_REALIZABILITY_CLOSURES_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW012_COMPLETE',contrasts:contrasts.map(x=>({label:x.label,config:x.config,cycleRank:x.cycleRank,nonzero:x.nonzero,contradictions:x.contradictions,deltaNonzero:x.deltaNonzero,integrabilityChanged:x.integrabilityChanged,states:x.states}))},null,2));

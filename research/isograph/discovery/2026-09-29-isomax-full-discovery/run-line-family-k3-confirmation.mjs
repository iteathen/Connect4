import fs from 'node:fs';
import {analyzeDirectResidualOrbitGraph} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';
const subsets=[["H"],["V"],["D"],["H","V"],["H","D"],["V","D"],["H","V","D"]];
const predictions={"4x5":{"H":"flat","V":"flat","D":"flat","H+V":"flat","H+D":"flat","V+D":"flat","H+V+D":"flat"},"5x4":{"H":"flat","V":"flat","D":"flat","H+V":"flat","H+D":"obstructed","V+D":"flat","H+V+D":"obstructed"}};
function run(width,height,directions){
  const r=analyzeDirectResidualOrbitGraph({
    width,height,k:3,winningLineDirections:directions,
    nonterminalFrontierBlocker:true,moverFinalCapParity:true,measureLocalBranchClosure:false,
  });
  const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit,d=r.deeperContinuationPhaseAudit;
  return {
    width,height,k:3,directions:[...directions],winningLineCount:r.winningLineCount,
    states:r.residualOrbitStates,classes:r.recursiveUnlabelledClasses,
    binaryGroups:d.binaryGroups,binaryEdges:d.binaryContinuationEdges,
    cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,
    contradictions:c.contradictoryReconvergences,
    globalPhasePotentialExists:c.globalPhasePotentialExists,
    outcomeLabelsUsedByProducer:r.outcomeLabelsUsedByProducer
  };
}
const rows=[];
for(const dirs of subsets)for(const [w,h,label] of [[4,5,'4x5'],[5,4,'5x4']]){
  console.log('holdout',label,dirs.join('+'));
  const row=run(w,h,dirs),key=dirs.join('+'),expected=predictions[label][key],
    observed=row.nonzero>0?'obstructed':'flat';
  rows.push({...row,label,expected,observed,correct:expected===observed});
}
const out={
  schema:'connect4.isomax.discovery.line_family_k3_confirmation.v1',
  date_author_local:'2026-09-29',warrant:'EW-011',
  training_source:'EW-006 k4 line-family intervention',
  rows,
  summary:{
    total:rows.length,correct:rows.filter(x=>x.correct).length,wrong:rows.filter(x=>!x.correct).length,
    nonzeroRows:rows.filter(x=>x.nonzero>0).map(x=>({label:x.label,directions:x.directions,nonzero:x.nonzero,contradictions:x.contradictions,cycleRank:x.cycleRank}))
  },
  allPredictionsCorrect:rows.every(x=>x.correct),
  interpretation_guard:'Fresh k3 confirmation of a counterfactual residual-family interaction only.'
};
fs.writeFileSync(new URL('./LINE_FAMILY_K3_CONFIRMATION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW011_COMPLETE',summary:out.summary,allPredictionsCorrect:out.allPredictionsCorrect},null,2));

import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {certifyCpcxOneDefectTargetReservoirRcic} from './cpcx-one-defect-rcic.mjs';

const g=createCpcxGeometry(),
  p=buildCpcxPosition('444444112331211',{geometry:g}),
  targetCell=3*g.columns+4;

function summarize(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    seam:x.seam??null,
    rootMeasure:x.rootMeasure??null,
    nodeCount:x.nodeCount??null,
    evaluatedNodeCount:x.evaluatedNodeCount??null,
    rootFailure:x.rootFailure?{
      key:x.rootFailure.key??null,
      rank:x.rootFailure.rank??null,
      measure:x.rootFailure.measure??null,
      defenderCell:x.rootFailure.defenderCell??null,
      defenderLabel:x.rootFailure.defenderLabel??null,
      templateCount:x.rootFailure.templateCount??null,
      failures:(x.rootFailure.failures??[]).slice(0,16),
    }:null,
  };
}

const baseline=certifyCpcxOneDefectTargetReservoirRcic(p,{
    attacker:0,targetCell,maxNodes:4096,useCpc2Restriction:false,
  }),
  restricted=certifyCpcxOneDefectTargetReservoirRcic(p,{
    attacker:0,targetCell,maxNodes:4096,useCpc2Restriction:true,
  });

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-rank15-failure.v0_1',
  sequence:'444444112331211',
  rank:p.rank,
  mover:p.mover,
  support:Array.from(p.heights),
  target:'E4',
  baseline:summarize(baseline),
  cpc2Restricted:summarize(restricted),
  premises:{
    diagnosticOnly:true,
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

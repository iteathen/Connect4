import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  certifyCpcxOneDefectTargetReservoirRcic,
} from './cpcx-one-defect-rcic.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('4444441123',{geometry:g}),
  setupColumn=2,
  setupCell=root.heights[setupColumn]*g.columns+setupColumn,
  child=applyCpcxForcedEvent(root,setupCell),
  targetCell=3*g.columns+4,
  baseline=certifyCpcxOneDefectTargetReservoirRcic(child,{
    attacker:0,targetCell,maxNodes:4096,useCpc2Restriction:false,
  }),
  restricted=certifyCpcxOneDefectTargetReservoirRcic(child,{
    attacker:0,targetCell,maxNodes:4096,useCpc2Restriction:true,
  });

function summary(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    seam:x.seam??null,
    rootMeasure:x.rootMeasure??null,
    nodeCount:x.nodeCount??null,
    evaluatedNodeCount:x.evaluatedNodeCount??null,
    edgeCount:x.edgeCount??null,
    cpc2RestrictionTransport:x.cpc2RestrictionTransport??null,
    rootFailure:x.rootFailure?{
      key:x.rootFailure.key??null,
      rank:x.rootFailure.rank??null,
      measure:x.rootFailure.measure??null,
      defenderLabel:x.rootFailure.defenderLabel??null,
      templateCount:x.rootFailure.templateCount??null,
    }:null,
  };
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-cpc2-restriction-probe.v0_1',
  control:'F9',
  sequence:'4444441123',
  setupColumn:3,
  target:'E4',
  baseline:summary(baseline),
  cpc2Restricted:summary(restricted),
  premises:{
    diagnosticOnly:true,
    standardBoard:'7x6',
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
    restrictionRule:'outside an exact DISJUNCTIVE_BLOCK_OBLIGATION blocker set, CPC2 already certifies attacker first win; only blocker moves continue through the candidate invariant',
  },
},null,2));

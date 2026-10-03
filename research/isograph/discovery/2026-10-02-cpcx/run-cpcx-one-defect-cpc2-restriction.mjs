import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {deriveCpcxDisjunctiveBlockObligation} from './cpcx-cpc2.mjs';
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

const lower=buildCpcxPosition('4444441123312',{geometry:g}),
  lowerTarget=3*g.columns+4,
  lowerCpc2=deriveCpcxDisjunctiveBlockObligation(lower,{attacker:0}),
  lowerBaseline=certifyCpcxOneDefectTargetReservoirRcic(lower,{
    attacker:0,targetCell:lowerTarget,maxNodes:4096,useCpc2Restriction:false,
  }),
  lowerRestricted=certifyCpcxOneDefectTargetReservoirRcic(lower,{
    attacker:0,targetCell:lowerTarget,maxNodes:4096,useCpc2Restriction:true,
  });

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-cpc2-restriction-probe.v0_2',
  control:'F9',
  sequence:'4444441123',
  setupColumn:3,
  target:'E4',
  baseline:summary(baseline),
  cpc2Restricted:summary(restricted),
  lowerChild:{
    sequence:'4444441123312',
    support:Array.from(lower.heights),
    cpc2:{
      kind:lowerCpc2.kind,
      exact:lowerCpc2.exact??false,
      blockingCells:lowerCpc2.blockingCells??null,
      blockingLabels:lowerCpc2.blockingLabels??null,
      outsideMoveCount:lowerCpc2.outsideMoveCertificates?.length??null,
      seam:lowerCpc2.seam??null,
    },
    baseline:summary(lowerBaseline),
    restricted:summary(lowerRestricted),
  },
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

import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {analyzeCpcxOneDefectTargetReservoir} from './cpcx-reservoir.mjs';
import {
  certifyCpcxOneDefectTargetReservoirRcic,
} from './cpcx-one-defect-rcic.mjs';
import {
  certifyCpcxOneDefectAttachmentRcic,
} from './cpcx-one-defect-attachment-rcic.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('4444441123',{geometry:g}),
  setupColumn=2,
  setupCell=root.heights[setupColumn]*g.columns+setupColumn,
  child=applyCpcxForcedEvent(root,setupCell),
  targetCell=3*g.columns+4,
  analysis=analyzeCpcxOneDefectTargetReservoir(
    child,{attacker:0,targetCell}
  ),
  baseline=certifyCpcxOneDefectTargetReservoirRcic(child,{
    attacker:0,targetCell,maxNodes:4096,useCpc2Restriction:true,
  }),
  candidate=certifyCpcxOneDefectAttachmentRcic(child,{
    attacker:0,targetCell,maxNodes:8192,useCpc2Restriction:true,
  });

function failure(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    seam:x.seam??null,
    rootMeasure:x.rootMeasure??null,
    rootGap:x.rootGap??null,
    rootReservoirRank:x.rootReservoirRank??null,
    nodeCount:x.nodeCount??null,
    certifiedNodeCount:x.certifiedNodeCount??null,
    unresolvedNodeCount:x.unresolvedNodeCount??null,
    reservoirRanks:x.reservoirRanks??null,
    firstUnresolved:(x.unresolvedNodes??[])[0]??x.rootFailure??null,
  };
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.f9-one-defect-attachment-control.v0_1',
  sequence:'4444441123',
  setupColumn:3,
  setupCell,
  target:'E4',
  child:{
    rank:child.rank,
    mover:child.mover,
    support:Array.from(child.heights),
  },
  analysis:{
    kind:analysis.kind,
    totalRelevantEvents:analysis.totalRelevantEvents??null,
    minimumUncoveredResiduals:analysis.minimumUncoveredResiduals??null,
    fullCoverageTemplateCount:analysis.fullCoverageTemplateCount??null,
    selectedDefect:analysis.selectedFullCoverageTemplate?.defect?.cellLabel??null,
  },
  oldCandidate:failure(baseline),
  attachmentCandidate:failure(candidate),
  premises:{
    retainedFalsifier:true,
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

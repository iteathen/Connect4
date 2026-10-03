import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  certifyCpcxOneDefectAttachmentRcic,
} from './cpcx-one-defect-attachment-rcic.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('4444441123',{geometry:g}),
  setupColumn=2,
  setupCell=root.heights[setupColumn]*g.columns+setupColumn,
  child=applyCpcxForcedEvent(root,setupCell),
  targetCell=3*g.columns+4,
  c=certifyCpcxOneDefectAttachmentRcic(child,{
    attacker:0,targetCell,maxNodes:2048,useCpc2Restriction:true,
  });

console.log(JSON.stringify({
  schema:'connect4.cpcx.f9-one-defect-attachment-fast.v0_1',
  kind:c.kind,
  exact:c.exact,
  player:c.player??null,
  seam:c.seam??null,
  rootGap:c.rootGap??null,
  rootReservoirRank:c.rootReservoirRank??null,
  nodeCount:c.nodeCount??null,
  certifiedNodeCount:c.certifiedNodeCount??null,
  unresolvedNodeCount:c.unresolvedNodeCount??null,
  reservoirRanks:c.reservoirRanks??null,
  firstUnresolved:(c.unresolvedNodes??[])[0]??null,
  premises:{
    nodeBound:2048,
    diagnosticOnly:true,
    retainedFalsifier:true,
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
  },
},null,2));

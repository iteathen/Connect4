import {
  analyzeDirectResidualOrbitGraph,
  analyzeUnlabelledQuotientDimension,
  analyzeUnlabelledQuotientDimensionMatrix,
} from './control-algebra-dimensions.mjs';

const matrix=analyzeUnlabelledQuotientDimensionMatrix();
const result={
  matrix,
  residualOrbit4x4:analyzeUnlabelledQuotientDimension({
    width:4,height:4,k:4,auditResidualOrbit:true,
  }).residualOrbitAudit,
  directResidualOrbit4x4:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
  }),
  directResidualOrbit4x4UniversalBlocker:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,universalFrontierBlocker:true,
  }),
  directResidualOrbit4x4NonterminalBlocker:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,nonterminalFrontierBlocker:true,
  }),
  directResidualOrbit4x4CapParity:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
  }),
  directResidualOrbit4x4RemainingMoveCapacity:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    remainingMoveCapacity:true,
  }),
  directResidualOrbit4x4SupportReleaseCapacity:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    remainingMoveCapacity:true,
    supportReleaseTurnCapacity:true,
  }),
  directResidualOrbit4x4ColumnRefinement:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
    nonterminalFrontierBlocker:true,
    moverFinalCapParity:true,
    auditColumnRefinement:true,
    auditPairColumnRefinement:true,
    auditOpponentResidualDeletion:true,
  }),
  directMatrix:matrix.cases.map(row=>analyzeDirectResidualOrbitGraph({
    width:row.width,height:row.height,k:row.k,
  })),
};
console.log(JSON.stringify(result,null,2));

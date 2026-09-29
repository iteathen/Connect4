import {
  analyzeDirectResidualOrbitGraph,
  analyzeUnlabelledQuotientDimension,
  analyzeUnlabelledQuotientDimensionMatrix,
} from './control-algebra-dimensions.mjs';

const result={
  matrix:analyzeUnlabelledQuotientDimensionMatrix(),
  residualOrbit4x4:analyzeUnlabelledQuotientDimension({
    width:4,height:4,k:4,auditResidualOrbit:true,
  }).residualOrbitAudit,
  directResidualOrbit4x4:analyzeDirectResidualOrbitGraph({
    width:4,height:4,k:4,
  }),
};
console.log(JSON.stringify(result,null,2));

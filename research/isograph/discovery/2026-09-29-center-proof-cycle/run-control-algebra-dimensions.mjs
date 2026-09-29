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
  directMatrix:matrix.cases.map(row=>analyzeDirectResidualOrbitGraph({
    width:row.width,height:row.height,k:row.k,
  })),
};
console.log(JSON.stringify(result,null,2));

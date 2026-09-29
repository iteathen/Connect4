import {
  analyzeStandardCenterControlAlgebra,
  analyzeBoundaryPolynomialAlgebra,
  analyzeDimensionControlAlgebra,
  analyzeGuardedResponseProjections,
  analyzeFullColumnCancellation,
  analyzeDepthPolynomialAnnihilator,
  analyzeControlWindowFactorization,
  analyzeControlWindowFactorizationRectangles,
} from './control-algebra.mjs';

const result={
  schema:'connect4.nim-like-control-algebra.rule-only.v1',
  createdAt:new Date().toISOString(),
  runtime:process.version,
  outcomeLabelsUsed:false,
  standard7x6:analyzeStandardCenterControlAlgebra(),
  boundary7x6:analyzeBoundaryPolynomialAlgebra(),
  dimensions:analyzeDimensionControlAlgebra(),
  guardedResponseProjections:analyzeGuardedResponseProjections(),
  fullColumnCancellation:analyzeFullColumnCancellation(),
  depthPolynomialAnnihilator:analyzeDepthPolynomialAnnihilator(),
  controlWindowFactorization:analyzeControlWindowFactorization(),
  controlWindowFactorizationRectangles:analyzeControlWindowFactorizationRectangles(),
};
console.log(JSON.stringify(result,null,2));

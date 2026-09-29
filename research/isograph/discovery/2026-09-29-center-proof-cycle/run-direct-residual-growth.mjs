import {performance} from 'node:perf_hooks';
import {analyzeDirectResidualOrbitGrowthCompact} from './control-algebra-dimensions.mjs';

const width=Number(process.env.C4_WIDTH??4),
  height=Number(process.env.C4_HEIGHT??5),
  k=Number(process.env.C4_K??4),
  refinedColumnCanonicalization=process.env.C4_REFINED_COLUMN_CANON==='1',
  binaryTieLinearCanonicalization=process.env.C4_BINARY_TIE_LINEAR_CANON==='1';
const started=performance.now();
const result=analyzeDirectResidualOrbitGrowthCompact({
  width,
  height,
  k,
  nonterminalFrontierBlocker:true,
  moverFinalCapParity:true,
  refinedColumnCanonicalization,
  binaryTieLinearCanonicalization,
});
const elapsedMs=performance.now()-started;
console.log(JSON.stringify({
  schema:'connect4.direct-residual-growth.v1',
  producerUsesOutcomeLabels:false,
  physicalBoardStatesEnumerated:false,
  board:`${width}x${height} connect-${k}`,
  elapsedMs,
  memory:process.memoryUsage(),
  result,
},null,2));

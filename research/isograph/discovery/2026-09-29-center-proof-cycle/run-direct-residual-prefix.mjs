import {performance} from 'node:perf_hooks';
import {analyzeDirectResidualOrbitPrefix} from './control-algebra-dimensions.mjs';

const width=Number(process.env.C4_WIDTH??6),
  height=Number(process.env.C4_HEIGHT??4),
  k=Number(process.env.C4_K??4),
  maxRank=Number(process.env.C4_MAX_RANK??10);
const started=performance.now();
const result=analyzeDirectResidualOrbitPrefix({
  width,height,k,maxRank,
  nonterminalFrontierBlocker:true,
  moverFinalCapParity:true,
  remainingMoveCapacity:true,
});
const elapsedMs=performance.now()-started;
console.log(JSON.stringify({
  schema:'connect4.direct-residual-prefix-run.v1',
  producerUsesOutcomeLabels:false,
  physicalBoardStatesEnumerated:false,
  board:`${width}x${height} connect-${k}`,
  maxRank,
  elapsedMs,
  memory:process.memoryUsage(),
  result,
},null,2));

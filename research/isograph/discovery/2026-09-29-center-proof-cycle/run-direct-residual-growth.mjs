import {performance} from 'node:perf_hooks';
import {analyzeDirectResidualOrbitGraph} from './control-algebra-dimensions.mjs';

const started=performance.now();
const result=analyzeDirectResidualOrbitGraph({
  width:4,
  height:5,
  k:4,
  nonterminalFrontierBlocker:true,
  moverFinalCapParity:true,
});
const elapsedMs=performance.now()-started;
console.log(JSON.stringify({
  schema:'connect4.direct-residual-growth.v1',
  producerUsesOutcomeLabels:false,
  physicalBoardStatesEnumerated:false,
  board:'4x5 connect-4',
  elapsedMs,
  memory:process.memoryUsage(),
  result,
},null,2));

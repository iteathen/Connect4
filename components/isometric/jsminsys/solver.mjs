import {
  prepareConnect4RbaGeometry,
  connect4RbaFromMoves,
  prepareConnect4RbaAlphaBeta,
  solveConnect4RbaAlphaBeta,
  RBA_AB_CPC_ONLY,
} from '../../../vendor/jsminsys/addons/index.mjs';

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});

export function solveIsoMax7x6Exact(moves,{
  cacheCapacity=65536,
  cpcFrontierResponse=false,
  cpcProjectedAdvisory=false,
}={}){
  const root=connect4RbaFromMoves(moves,{geometry});
  const state=prepareConnect4RbaAlphaBeta({
    geometry,
    mode:RBA_AB_CPC_ONLY,
    cacheCapacity,
    cpcFrontierResponse,
    cpcProjectedAdvisory,
  });
  const result=solveConnect4RbaAlphaBeta(root,{state,reflected:root.reflected});
  return {
    status:'EXACT',
    rootWdl:result.value-2,
    move:result.move,
    metrics:result.metrics,
    reflected:root.reflected,
  };
}

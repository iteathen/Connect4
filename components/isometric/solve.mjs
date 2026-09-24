import {
  prepareConnect4RbaGeometry,
  runManagedConnect4CpcRba32,
} from '../../vendor/jsminsys/addons/index.mjs';

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const MAX_TIMEOUT_MS=120000;

export async function solve7x6(moves,options={}){
  const timeoutMs=options.timeoutMs===undefined?MAX_TIMEOUT_MS:options.timeoutMs;
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0||timeoutMs>MAX_TIMEOUT_MS)
    throw new RangeError('invalid IsoMax timeout');

  return runManagedConnect4CpcRba32(moves,{
    ...options,
    geometry,
    timeoutMs,
  });
}

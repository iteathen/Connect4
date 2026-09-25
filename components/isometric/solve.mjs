import {
  prepareConnect4RbaGeometry,
  runManagedConnect4CpcRba32,
} from '../../vendor/jsminsys/addons/index.mjs';

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const MAX_TIMEOUT_MS=120000;

export async function solve7x6(moves,options={}){
  const timeoutMs=options.timeoutMs===undefined?MAX_TIMEOUT_MS:options.timeoutMs,
    workers=options.workers===undefined?2:options.workers;
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0||timeoutMs>MAX_TIMEOUT_MS)
    throw new RangeError('invalid IsoMax timeout');
  if(!Number.isInteger(workers)||workers<2)
    throw new RangeError('IsoMax requires at least two search workers');

  return runManagedConnect4CpcRba32(moves,{
    ...options,
    workers,
    geometry,
    timeoutMs,
  });
}

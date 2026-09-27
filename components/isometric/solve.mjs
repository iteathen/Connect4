import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
} from '../../vendor/jsminsys/addons/index.mjs';
import profile from '../../vendor/jsminsys/profiles/isomax-i5-12600k.json' with {type:'json'};

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const MAX_TIMEOUT_MS=120000;

export async function solve7x6(moves,options={}){
  // Cold application defaults come from the qualified library profile. Keep
  // worker roles, sharing and memory together; no per-node adapter dispatch.
  const config={...profile.options,...options};
  const timeoutMs=options.timeoutMs===undefined?MAX_TIMEOUT_MS:options.timeoutMs,
    workers=config.workers;
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0||timeoutMs>MAX_TIMEOUT_MS)
    throw new RangeError('invalid IsoMax timeout');
  if(!Number.isInteger(workers)||workers<2)
    throw new RangeError('IsoMax requires at least two search workers');

  return runLazySmpConnect4Rba32(moves,{
    ...config,
    workers,
    geometry,
    timeoutMs,
    rootFrontier:true,
  });
}

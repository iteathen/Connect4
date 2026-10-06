import {
  prepareConnect4RbaGeometry,
  runLazySmpConnect4Rba32,
  profile,
} from '../../isomax/index.mjs';

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const MAX_TIMEOUT_MS=profile.options.timeoutMs;

export async function solve7x6(moves,options={}){
  // Cold application defaults come from the qualified library profile. Keep
  // worker roles, sharing and memory together; no per-node adapter dispatch.
  const config={...profile.options,...options};
  const timeoutMs=options.timeoutMs===undefined?MAX_TIMEOUT_MS:options.timeoutMs,
    workers=config.workers;
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0||timeoutMs>MAX_TIMEOUT_MS)
    throw new RangeError('invalid IsoMax timeout');
  if(workers!=='auto'&&(!Number.isInteger(workers)||workers<2||workers>64))
    throw new RangeError('IsoMax requires at least two search workers (2..64 or auto)');

  return runLazySmpConnect4Rba32(moves,{
    ...config,
    workers,
    geometry,
    timeoutMs,
  });
}

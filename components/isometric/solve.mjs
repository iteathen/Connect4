import {
  prepareConnect4RbaGeometry,
  runManagedConnect4CpcRba32,
} from '../../vendor/jsminsys/addons/index.mjs';

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const MAX_TIMEOUT_MS=120000;

export async function solve7x6(moves,{
  workers=1,
  capacity=65536,
  buckets=65536,
  timeoutMs=MAX_TIMEOUT_MS,
  signal,
  managerBudget=64,
  readyTarget=workers*2,
  cpcFrontierResponse=false,
  cpcProjectedAdvisory=false,
}={}){
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0||timeoutMs>MAX_TIMEOUT_MS)
    throw new RangeError('invalid IsoMax timeout');

  const managed=await runManagedConnect4CpcRba32(moves,{
    geometry,
    workers,
    capacity,
    buckets,
    timeoutMs,
    signal,
    managerBudget,
    readyTarget,
    cpcFrontierResponse,
    cpcProjectedAdvisory,
  });

  const {absoluteValue,witness,...result}=managed;
  return {
    ...result,
    rootWdl:managed.status==='EXACT'?absoluteValue-2:null,
    move:managed.status==='EXACT'?witness:-1,
  };
}

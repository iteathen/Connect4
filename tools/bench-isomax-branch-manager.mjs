import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {solve7x6} from '../components/isometric/solve.mjs';

const input='45461667';
const expected=1;
const moves=Array.from(input,c=>c.charCodeAt(0)-49);
const profiles=[1,2,4];
const basisCapacity=process.env.ISOMAX_BASIS_CAPACITY===undefined?69:Number(process.env.ISOMAX_BASIS_CAPACITY);
if(!Number.isInteger(basisCapacity)||basisCapacity<0)throw new RangeError('invalid ISOMAX_BASIS_CAPACITY');
const meter=await processCycleCounter();
try{
  console.log(JSON.stringify({
    event:'start',
    kind:'isomax-branch-manager-scaling-v1',
    input,
    expected,
    cpu:cpus()[0].model,
    platform:process.platform,
    arch:process.arch,
    node:process.version,
    v8:process.versions.v8,
    profiles,
    config:{capacity:65536,buckets:65536,basisCapacity,timeoutMs:30000,managerBudget:64},
  }));
  for(const workers of profiles){
    const before=meter.read(),cpuBefore=process.cpuUsage(),start=performance.now();
    const result=await solve7x6(moves,{
      workers,
      capacity:65536,
      buckets:65536,
      basisCapacity,
      timeoutMs:30000,
      managerBudget:64,
      readyTarget:workers*2,
    });
    const cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuBefore);
    console.log(JSON.stringify({
      event:'sample',
      workers,
      ...result,
      wallMs,
      cpuMs:(cpu.user+cpu.system)/1000,
      cpuCycles:cycles.toString(),
      rssBytes:process.memoryUsage().rss,
      oracleMatched:result.status==='EXACT'?result.rootWdl===expected:null,
    }));
  }
  console.log(JSON.stringify({event:'finish'}));
}finally{
  meter.close();
}

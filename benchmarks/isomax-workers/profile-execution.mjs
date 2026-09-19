// Actual four-worker manager/task profiling. Instrumented timing is attribution
// evidence only; promotion uses separate uninstrumented paired processes.
import fs from 'node:fs';
import path from 'node:path';
import workerThreads from 'node:worker_threads';
import { syncBuiltinESMExports } from 'node:module';
import { PerformanceObserver } from 'node:perf_hooks';
import inspector from 'node:inspector';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const output = path.resolve(process.argv[2]); fs.mkdirSync(output,{recursive:true});
const NativeWorker = workerThreads.Worker;
let taskRecords = [];
workerThreads.Worker = class extends NativeWorker {
  constructor(url, options) {
    if (!String(url).endsWith('/components/isometric/execution/worker.mjs')) throw new Error('unexpected profiled worker');
    super(new URL('./profile-task-bootstrap.mjs',import.meta.url),{
      ...options,workerData:{...options.workerData,originalWorkerUrl:String(url)} });
    this.on('message', m => {
      if (m.type === 'result') taskRecords.push({ workerId:m.workerId,kind:m.kind,nodes:m.nodes,...m.qualification });
    });
  }
};
syncBuiltinESMExports();
const { IsoMaxBranchManager } = await import('../../components/isometric/execution/branch-manager.mjs');
const session = new inspector.Session(); session.connect();
const post = (method,params={}) => new Promise((resolve,reject) => session.post(method,params,(e,r)=>e?reject(e):resolve(r)));
const gc = [];
const observer = new PerformanceObserver(list => { for (const e of list.getEntries()) gc.push({durationMs:e.duration,kind:e.detail.kind}); });
observer.observe({entryTypes:['gc']});
await post('Profiler.enable'); await post('Profiler.start');
await post('HeapProfiler.enable'); await post('HeapProfiler.startSampling',{
  samplingInterval:32768,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true });
const report = { source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),node:process.version,
  diffSha256:createHash('sha256').update(execFileSync('git',['diff','HEAD'])).digest('hex'),
  policy:'actual manager/native tasks; cold wrappers perturb time and are restored before recursion; bulk copy bytes exclude scalar rehash stores, fills and allocator zeroing; reference/chunk times are subsets of pool time; replacedBackingBytes is NOT bytes copied; per-thread CPU covers manager isolate',records:[] };
const save = () => fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(report,null,2)+'\n',{flush:true});
save();
for (const sequence of ['717657616532237625','466537327657277224','616767454664457417','']) {
  taskRecords = [];
  const manager = new IsoMaxBranchManager({workers:4}), start=performance.now(), cpuStart=process.threadCpuUsage(), gcStart=gc.length;
  let result,error;
  try { result = await manager.solveMoves(Array.from(sequence,c=>Number(c)-1),{timeoutMs:sequence?30000:10000}); }
  catch (e) { error=e; }
  finally { await manager.close(); }
  await new Promise(resolve=>setImmediate(resolve));
  const wallMs=performance.now()-start, managerCpu=process.threadCpuUsage(cpuStart);
  const totals = {};
  for (const task of taskRecords) for (const key of ['replayMs','poolPreparationMs','cachePreparationMs','packagingMs','taskMs',
    'recursiveAndOtherMs','replayMoves','replacedBackingBytes','replacedArrays','widenedSlots','classRehashEntries','cacheRehashEntries',
    'chunkPreparationMs','referenceWidthMs','chunkRehashEntries',
    'poolCopyOperations','poolCopySourceBytes','poolCopyDestinationBytes',
    'cacheCopyOperations','cacheCopySourceBytes','cacheCopyDestinationBytes'])
    totals[key]=(totals[key]??0)+(task[key]??0);
  report.records.push({sequence,wallMs,managerCpu,gc:gc.slice(gcStart),totals,
    result:result?{value:result.value,move:result.move}:null,error:error?.message??null,
    metrics:(result??manager.lastStats)?.metrics,taskRecords});save();
  if(error && (sequence || !error.message.startsWith('ISOMAX_TIMEOUT')))throw error;
}
const {profile:cpu}=await post('Profiler.stop'),{profile:heap}=await post('HeapProfiler.stopSampling');session.disconnect();observer.disconnect();
fs.writeFileSync(path.join(output,'manager.cpuprofile'),JSON.stringify(cpu));
fs.writeFileSync(path.join(output,'manager.heapprofile'),JSON.stringify(heap));
const nodes=new Map(cpu.nodes.map(n=>[n.id,n])), totals=new Map();
for(let i=0;i<cpu.samples.length;i++){
  const f=nodes.get(cpu.samples[i]).callFrame;
  const source=f.url.includes('/components/')?f.url.slice(f.url.indexOf('/components/')+1):f.url.startsWith('node:')?f.url:'(runtime/harness)';
  const key=source+'::'+f.functionName;totals.set(key,(totals.get(key)??0)+cpu.timeDeltas[i]);
}
report.cpuSelfUs=Object.fromEntries([...totals].sort((a,b)=>b[1]-a[1]).slice(0,35));save();
console.log(JSON.stringify(report.records.map(r=>({sequence:r.sequence,wallMs:r.wallMs,cpu:r.managerCpu,totals:r.totals,tasks:r.taskRecords.length,error:r.error}))));

import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {cpus} from 'node:os';
import {performance} from 'node:perf_hooks';
import {processCycleCounter} from './cycle-counter.mjs';
import {fromMoves7x6,prepareRba7x6} from '../components/isometric/rba/ingress.mjs';
import {prepareCoordinateScratch7x6} from '../components/isometric/rba/prepare.mjs';
import {basis7x6,cofactor7x6,canonicalize7x6} from '../components/isometric/rba/coordinate.mjs';
import {prepareFrontArena7x6,buildFour7x6,queryFour7x6} from '../components/isometric/rba/front.mjs';
import {solve7x6} from '../components/isometric/solve.mjs';
import {exact} from '../test/helpers/physical-oracle.mjs';
import * as tt from '../components/isometric/execution/shared-tt.mjs';
import {prepareWorker7x6,workerStep7x6} from '../components/isometric/execution/worker.mjs';
import {managerStep7x6} from '../components/isometric/execution/manager.mjs';
import {prepare,evaluate} from '../components/isometric/rba/kernel.mjs';

// Cold driver. Snapshots bracket batches, never individual native nodes.
// Raw totals include the batch loop/call and accounting overhead, not just body.
const moves=[1,3,2,0,4,6,1,0,2,4,5,2,2,3,1,1,1,5,1,3,2,4,6,0,4,4,6,2,0,4,3,3];
const g=prepareRba7x6(),root=fromMoves7x6(moves,{geometry:g}),scratch=prepareCoordinateScratch7x6();
const basis=new Uint32Array(69),childBasis=new Uint32Array(69),out=new Uint32Array(8);
const n=basis7x6(g,root.words[0],basis,0,scratch.seen),arena=prepareFrontArena7x6();
let column=0;while(((root.words[0]>>>(column*3))&7)===6)column++;
const meter=await processCycleCounter();
const table=tt.createTT7x6(),worker=prepareWorker7x6(2,1);
prepare(worker,{boundaryDepth:2});
const q=tt.intern7x6(table,root.words,0);table.control[tt.ROOT]=q;table.control[tt.ROOT_REFLECTED]=root.reflected;
const data={sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  sourceDirty:!!execFileSync('git',['status','--porcelain','--','components','tools','vendor','test','package.json','package-lock.json'],{encoding:'utf8'}).trim(),
  date:new Date().toISOString(),node:process.version,v8:process.versions.v8,cpu:cpus()[0].model,
  jsminsys:execFileSync('git',['-C','vendor/jsminsys','rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  nees:'7650bef0aecc0d2b226ecf253a1f8937ccf89d69',
  metric:'Windows QueryProcessCycleTime: sum of all process-thread user+kernel CPU cycles',
  limits:'Measured scenario totals, not per-instruction latency or an analytical total for every possible path. No GHz conversion. Whole solves include ingress, preparation, startup and cleanup. Hot batches exclude preparation, include loop/call overhead. Concurrent V8/background work remains included.',
  moves,oracle:exact(moves),sink:0,hot:[],solves:[]};
function batch(name,count,operation){
  let sink=0;
  for(let i=0;i<2000;i++)sink=(sink+(operation()|0))|0;
  const samples=[];
  for(let r=0;r<7;r++){
    const before=meter.read(),start=performance.now();
    for(let i=0;i<count;i++)sink=(sink+(operation()|0))|0;
    const after=meter.read();
    samples.push({cycles:Number(after-before),elapsedMs:performance.now()-start});
  }
  const sorted=samples.map(s=>s.cycles).sort((a,b)=>a-b);
  data.hot.push({name,iterations:count,medianTotalCycles:sorted[3],medianCyclesPerOperation:sorted[3]/count,samples});
  data.sink^=sink;
}
try{
  batch('empty batch control',20000,()=>1);
  batch('support-local basis',20000,()=>basis7x6(g,root.words[0],basis,0,scratch.seen));
  batch('native cofactor including child basis',20000,()=>cofactor7x6(g,root.words,0,basis,0,n,column,out,0,childBasis,0,scratch.seen));
  batch('canonicalization early/secondary path on fixed root',20000,()=>canonicalize7x6(g,root.words,0,scratch));
  batch('two-ply four-front construction',100,()=>buildFour7x6(g,arena,root.words[0],0,2));
  batch('four-front query',20000,()=>queryFour7x6(arena,0,root.words,0));
  const preparedSolve=()=>{
    table.exact[q]=0;table.lower[q]=1;table.upper[q]=3;table.phase[q]=0;table.control[tt.DONE]=0;
    tt.enqueue(table,q);
    while(!table.control[tt.DONE]&&!table.control[tt.STOP]){workerStep7x6(table,worker,evaluate);managerStep7x6(table);}
    if(table.control[tt.ERROR])throw Error(`prepared RBA closure failed: ${table.control[tt.ERROR]}`);
    return table.exact[q];
  };
  batch('prepared complete worker-TT-manager closure including rearm',1000,preparedSolve);
  for(const boundaryDepth of [2])for(const workers of [1,2,4])for(let repetition=0;repetition<5;repetition++){
    const start=performance.now(),before=meter.read();
    const result=await solve7x6(moves,{workers,timeoutMs:5000,boundaryDepth});
    const after=meter.read();
    if(result.status!=='EXACT'||result.rootWdl!==data.oracle.value-2||result.move!==data.oracle.move)throw Error(`oracle mismatch: ${JSON.stringify(result)}`);
    data.solves.push({boundaryDepth,workers,repetition,totalCpuCycles:Number(after-before),totalElapsedMs:performance.now()-start,...result});
  }
}finally{meter.close();}
const destination=process.argv[2]??'docs/qualification/native-rba-only-cycles.json';
writeFileSync(destination,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({destination,hot:data.hot.map(({samples,...rest})=>rest),solves:[2].flatMap(boundaryDepth=>[1,2,4].map(workers=>{
  const cases=data.solves.filter(s=>s.workers===workers&&s.boundaryDepth===boundaryDepth),cycles=cases.map(s=>s.totalCpuCycles).sort((a,b)=>a-b),times=cases.map(s=>s.totalElapsedMs).sort((a,b)=>a-b);
  return {boundaryDepth,workers,medianTotalCpuCycles:cycles[2],medianElapsedMs:times[2],metrics:cases[2].metrics};
}))},null,2));

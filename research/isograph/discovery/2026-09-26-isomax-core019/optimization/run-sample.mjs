// Cold qualification driver. Never imported by production.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {cpus} from 'node:os';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const [library,counterModule,out,input='45461667']=process.argv.slice(2);
const expectedMove={'45461667':3,'13333111271421':2,'13333111444444':2}[input];
assert.notEqual(expectedMove,undefined,'use an oracle-pinned quick control');
if(!library||!counterModule||!out)throw Error('library counterModule output [input] required');
if(fs.existsSync(out))throw Error('refuse evidence overwrite');
const load=f=>import(pathToFileURL(path.join(library,'addons',f)));
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry.mjs');
const {runLazySmpConnect4Rba32}=await load('rba-connect4-lazy-smp-host.mjs');
const {processCycleCounter}=await import(pathToFileURL(path.resolve(counterModule)));
const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
const moves=Array.from(input,c=>c.charCodeAt(0)-49),meter=await processCycleCounter();
const sha=execFileSync('git',['-C',library,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=execFileSync('git',['-C',library,'status','--porcelain'],{encoding:'utf8'}).trim();
const coordinateSha256=createHash('sha256').update(fs.readFileSync(path.join(library,'addons/rba-connect4-coordinate.mjs'))).digest('hex');
const config={geometry,workers:4,timeoutMs:5000,localCacheCapacity:65536,sharedCacheCapacity:65536,
  sharedSampleMask:7,cpcFrontierResponse:false,cpcProjectedAdvisory:false};
const start=performance.now(),before=meter.read(),cpuStart=process.cpuUsage();
let result;
try{result=await runLazySmpConnect4Rba32(moves,config);}
finally{
  const cycles=meter.read()-before,wallMs=performance.now()-start,cpu=process.cpuUsage(cpuStart);meter.close();
  fs.writeFileSync(out,JSON.stringify({sha,dirty,coordinateSha256,input,workers:4,timeoutMs:5000,node:process.version,v8:process.versions.v8,
    cpu:cpus()[0].model,wallMs,cpuMs:(cpu.user+cpu.system)/1000,cycles:String(cycles),result,
    accounting:'Uninstrumented full runLazySmp invocation including ingress/start/join; immutable geometry/imports/counter preparation excluded. Process cycles sum all threads; winner nodes are not total work.'},null,2)+'\n');
  console.log(JSON.stringify({sha,input,wallMs,cycles:String(cycles),status:result?.status,wdl:result?.rootWdl,move:result?.bestMove??result?.move,cleanup:result?.cleanup}));
}
assert.equal(result.status,'EXACT');assert.equal(result.rootWdl,1);assert.equal(result.cleanup,true);
assert.equal(result.move,expectedMove);assert.equal(result.workersExited,4);

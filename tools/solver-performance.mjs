import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { summarizeBsfpRanks } from './bsfp-rank-progress.mjs';

const repositoryRoot = fileURLToPath(new URL('../',import.meta.url));
const git = (...args) => execFileSync('git',args,{cwd:repositoryRoot,encoding:'utf8',windowsHide:true}).trim();
const writeJson = (file,value) => fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flush:true});

// Parent remains responsive while the solver blocks, crashes or exhausts V8.
export async function captureProcess({command,args,cwd,directory,timeoutMs}) {
  fs.mkdirSync(directory,{recursive:true});
  const out = fs.openSync(path.join(directory,'stdout.log'),'wx');
  const err = fs.openSync(path.join(directory,'stderr.log'),'wx');
  const start = performance.now();
  let timedOut = false, launchError = null, lastRecord = null, pending = '';
  const env = {...process.env};
  for (const key of ['GH_TOKEN','GITHUB_TOKEN','CUDA_BSFP_GITHUB_TOKEN']) delete env[key];
  const child = spawn(command,args,{cwd,env,windowsHide:true,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});
  const terminate = () => {
    if (process.platform==='win32') {
      try { execFileSync('taskkill',['/pid',String(child.pid),'/t','/f'],{windowsHide:true,stdio:'ignore',timeout:5000}); } catch {}
    } else {
      try { process.kill(-child.pid,'SIGKILL'); } catch {}
    }
  };
  const timer = setTimeout(()=>{timedOut=true;terminate();},timeoutMs);
  child.stdout.on('data',chunk=>{
    fs.writeSync(out,chunk); fs.fsyncSync(out);
    pending += chunk.toString();
    let end;
    while ((end=pending.indexOf('\n'))>=0) {
      const line=pending.slice(0,end); pending=pending.slice(end+1);
      try { const value=JSON.parse(line); if (value.kind==='isomax-performance') lastRecord=value; } catch {}
    }
  });
  child.stderr.on('data',chunk=>{fs.writeSync(err,chunk);fs.fsyncSync(err);});
  child.on('error',error=>{launchError=error.message;});
  const exit = await new Promise(resolve=>child.once('close',(exitCode,signal)=>resolve({exitCode,signal})));
  clearTimeout(timer); fs.closeSync(out); fs.closeSync(err);
  return { ...exit,timedOut,launchError,elapsedMs:performance.now()-start,lastRecord,
    cleanup:'child-process-exited' };
}

export async function runPerformance(solver,timeoutMs=120000) {
  if (!['isomax','bsfp'].includes(solver)) throw new RangeError('choose isomax or bsfp');
  if (!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>120000) throw new RangeError('timeout must be in [1,120000] ms');
  const expectedBranch=solver==='isomax'?'solver/isometric':'solver/cuda-bsfp';
  if (git('branch','--show-current')!==expectedBranch) throw new Error(`run ${solver} from ${expectedBranch}`);
  if (git('status','--porcelain')) throw new Error('performance run requires a clean tracked/untracked source checkout');
  const runId = new Date().toISOString().replace(/[-:.]/g,'')+'-'+solver;
  const directory = path.resolve(repositoryRoot,git('rev-parse','--git-path','solver-performance'),runId);
  fs.mkdirSync(directory,{recursive:true});
  const metadata = {runId,solver,sourceRevision:git('rev-parse','HEAD'),branch:git('branch','--show-current'),
    workload:'standard-7x6-empty-exact-P0-WDL',expectedRootWdl:1,timeoutMs,
    node:process.version,v8:process.versions.v8,platform:process.platform,release:os.release(),arch:process.arch,
    cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length,totalRamBytes:os.totalmem(),freeRamBytes:os.freemem(),
    policy:solver==='isomax'?{rba:false,freshPoolAndCache:true,v8OldSpaceMiB:4096,
      execution:'native IsoMax Branch Manager; min(4, available logical CPUs minus one), minimum one worker',
      progress:'flushed manager/worker snapshot every second; nodes include settled tasks only',
      cleanupReserveMs:Math.min(1000,timeoutMs-1)}:
      {profile:'c4-0009-p2-compact-hybrid',native:true,publish:false,
        budget:'existing per-case budget includes Tensor A/B and native root step',memory:'unchanged Q1/P2 admission and runtime limits'}};
  writeJson(path.join(directory,'metadata.json'),metadata);
  const args = solver==='isomax'
    ? ['--max-old-space-size=4096',path.join(repositoryRoot,'tools/isomax-performance-child.mjs'),'',
      String(Math.max(1,timeoutMs-1000))]
    : ['tools/cuda-bsfp-qualifier.mjs','--qualify-benchmark','--profile','c4-0009-p2-compact-hybrid',
      '--cases','7x6:c4','--no-publish','--case-timeout-ms',String(timeoutMs),'--spool-root',path.join(directory,'qualification')];
  // BSFP owns its 120s case deadline. Extra outer time only bounds probes/report
  // finalization and cannot extend either native step's remaining case budget.
  const captured = await captureProcess({command:process.execPath,args,cwd:repositoryRoot,directory,
    timeoutMs:solver==='isomax'?timeoutMs:timeoutMs+60000});
  let result;
  if (solver==='isomax') {
    const last=captured.lastRecord;
    const rootWdl=last?.phase==='complete'?last.rootWdl:null;
    result={...captured,status:captured.timedOut||last?.phase==='timeout'?'timeout':captured.exitCode!==0?'runtime-failure':
      rootWdl===1?'passed':'correctness-failure',rootWdl,oracleMatched:rootWdl===null?null:rootWdl===1,
      metrics:last?.metrics??null,solveMs:last?.solveMs??null,memory:last?.memory??null,
      execution:last?.execution??null,workerCleanup:last?.cleanup??null,
      nodesPerSecond:last?.metrics?.nodes && last.solveMs>0?last.metrics.nodes/(last.solveMs/1000):null,
      progressIsLowerBound:captured.timedOut||last?.phase!=='complete'};
  } else {
    let qualification = null, final = null;
    let rankProgress = null;
    try {
      final=JSON.parse(fs.readFileSync(path.join(directory,'stdout.log'),'utf8'));
      qualification=JSON.parse(fs.readFileSync(path.join(final.localReport,'results.json'),'utf8'));
      const native = qualification.cases?.[0]?.steps?.find(step=>step.stepId==='compact-hybrid-root-wdl');
      if (native) {
        const log = fs.readFileSync(path.join(final.localReport,'cases','01-7x6-c4','compact-hybrid-root-wdl','stderr.log'),'utf8');
        rankProgress = summarizeBsfpRanks(log,{completed:native.status==='passed'});
      }
    } catch {}
    result={...captured,status:qualification?.cases?.[0]?.status??'qualifier-failure',
      qualifierRunId:final?.runId??null,rootWdl:qualification?.cases?.[0]?.solverResult?.rootWdl??null,rankProgress,qualification};
  }
  const report={...metadata,result};
  writeJson(path.join(directory,'result.json'),report);
  console.log(JSON.stringify({runId,solver,status:result.status,evidence:path.relative(repositoryRoot,directory),
    sourceRevision:metadata.sourceRevision,elapsedMs:captured.elapsedMs,rootWdl:result.rootWdl??null,
    ...(solver==='bsfp'?{rankProgress:result.rankProgress}:{})}));
  return {report,directory};
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if (process.argv.length>4) throw new Error('usage: node tools/solver-performance.mjs isomax|bsfp [timeout-ms<=120000]');
  const {report}=await runPerformance(process.argv[2],process.argv[3]===undefined?120000:Number(process.argv[3]));
  if (!['passed','timeout'].includes(report.result.status)) process.exitCode=1;
}

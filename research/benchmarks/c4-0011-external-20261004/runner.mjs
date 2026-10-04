import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {verifyClosure,parseOutput,hashFile,filesUnder,validateReady,validateResult} from './harness-lib.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const argv=process.argv.slice(2),mode=argv.shift(),id=argv.shift(),options={};
while(argv.length){const k=argv.shift();if(!['--build','--out','--timeout-ms'].includes(k)||!argv.length)throw Error('usage: runner.mjs prepare|smoke|run <solver> --build <root> --out <new-directory> [--timeout-ms N]');options[k]=argv.shift();}
if(!['prepare','smoke','run'].includes(mode)||!id||!options['--build']||!options['--out'])throw Error('explicit mode, solver, build root and fresh output directory required');
const build=resolve(options['--build']),out=resolve(options['--out']),lockPath=join(build,'build-lock.json');
const lock=JSON.parse(readFileSync(lockPath)),solver=lock.solvers[id];if(!solver)throw Error('solver not in build lock');
const packet=JSON.parse(readFileSync(join(here,'external-solver-c4-0011-manifest.json')));
if(!/^[a-f0-9]{64}$/.test(packet.build_lock_sha256??'')||hashFile(lockPath)!==packet.build_lock_sha256)throw Error('build lock differs from or is not bound to frozen audit manifest');
if(mode!=='prepare'&&packet.audit_packet_complete!==true)throw Error('audit packet must be complete before entering solve');
if(solver.upstream_commit!==packet.solvers.find(x=>x.solver===id)?.upstream_commit)throw Error('upstream identity differs from audit');
if(existsSync(out))throw Error('output directory must not exist (fresh run required)');
const runtime=solver.runtime_directory;verifyClosure(runtime,solver.runtime_files);
// The build lock is auditable identity, not an assertion that arbitrary executable bytes are trustworthy.
for(const name of ['runner.mjs','measure.ps1','harness-lib.mjs'])if(!lock.harness_files[name]||hashFile(join(here,name))!==lock.harness_files[name])throw Error(`harness changed since build: ${name}`);
mkdirSync(out,{recursive:true});mkdirSync(join(out,'temp'));
const timeout=Number(options['--timeout-ms']??(mode==='prepare'?30000:mode==='smoke'?5000:3600000));
if(!Number.isSafeInteger(timeout)||timeout<1||timeout>2147483647)throw Error('invalid timeout');
if(mode==='smoke'&&timeout>10000)throw Error('smoke cannot exceed 10 seconds; use explicit run for later campaign');
const env={SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,PATH:join(process.env.SystemRoot,'System32'),TEMP:join(out,'temp'),TMP:join(out,'temp'),LANG:'C',LC_ALL:'C'};
env.SystemDrive=process.env.SystemDrive;env.PATHEXT='.COM;.EXE;.BAT;.CMD';
let args=[],executable=join(runtime,'solver.exe');
if(id==='isomax'){
 executable=join(runtime,'node.exe');args=['--experimental-ffi','--import',pathToFileURL(join(runtime,'isomax/runtime/tools/worker-affinity-preload.mjs')).href,join(runtime,'wrapper.mjs')];
 env.JMS_WORKER_AFFINITY_FILE=join(runtime,'isomax/targets.json');env.JMS_WORKER_AFFINITY_REPORT=join(out,'affinity');
}
if(mode==='prepare')args.push('--prepare-only');
const config={executable,arguments:args,cwd:runtime,environment:env,affinityMask:lock.machine.affinityMask,timeoutMs:timeout,stdout:join(out,'stdout.txt'),stderr:join(out,'stderr.txt'),measurement:join(out,'measurement.json')};
writeFileSync(join(out,'invocation.json'),JSON.stringify({mode,solver:id,upstream_commit:solver.upstream_commit,executable_hash:solver.executable_hash,build_lock_sha256:hashFile(lockPath),...config},null,2)+'\n');
const ps=spawnSync('pwsh',['-NoProfile','-NonInteractive','-File',join(here,'measure.ps1'),'-Config',join(out,'invocation.json')],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024,timeout:timeout+20000});
writeFileSync(join(out,'collector.stdout.txt'),ps.stdout??'');writeFileSync(join(out,'collector.stderr.txt'),ps.stderr??'');
if(ps.error||ps.status!==0){writeFileSync(join(out,'collector-failure.json'),JSON.stringify({error:String(ps.error??ps.stderr),performance_conclusion_allowed:false}));throw Error(`collector failed: ${ps.error??ps.stderr}`);}
verifyClosure(runtime,solver.runtime_files);
const measurement=JSON.parse(readFileSync(config.measurement)),parsed=parseOutput(readFileSync(config.stdout,'utf8'),readFileSync(config.stderr,'utf8'));
const affinity=Object.fromEntries(filesUnder(out).filter(p=>/^affinity-\d+\.json$/.test(p)).map(p=>[p,JSON.parse(readFileSync(join(out,p)))]));
const coldVerified=validateReady(id,parsed.ready);
const preparePassed=mode==='prepare'&&measurement.exit_status===0&&!measurement.timed_out&&coldVerified&&parsed.ready.prepare_only===true&&parsed.result===null;
const pathObserved=coldVerified&&parsed.ready.prepare_only===false&&parsed.records.some(r=>r.event==='search_start')&&(id!=='isomax'||parsed.handoff!==null);
const workerAffinityOk=id!=='isomax'||mode==='prepare'||(Object.keys(affinity).length===4&&JSON.parse(readFileSync(join(runtime,'isomax/targets.json'))).every((t,i)=>{const r=affinity[`affinity-${i}.json`];return r?.index===i&&r.beforeSolverInitialization===true&&r.target.group===t.group&&r.target.processor===t.processor&&r.actual.group===t.group&&r.actual.processor===t.processor&&r.actual.mask===(1n<<BigInt(t.processor)).toString();}));
const affinityOk=!measurement.affinity_error&&measurement.actual_process_affinity_mask===lock.machine.affinityMask&&workerAffinityOk;
const measurementValid=!measurement.metric_error&&Number.isFinite(measurement.wall_ms)&&measurement.wall_ms>0&&Number.isFinite(measurement.cpu_ms)&&measurement.cpu_ms>=0&&Number.isFinite(measurement.peak_rss_bytes)&&measurement.peak_rss_bytes>0;
const exact=mode!=='prepare'&&coldVerified&&pathObserved&&affinityOk&&!measurement.timed_out&&measurement.exit_status===0&&validateResult(id,parsed.result);
const finalWdl=parsed.result?.wdl??null;
const summary={solver:id,mode,upstream_commit:solver.upstream_commit,measurement,measurement_valid:measurementValid,prepare_passed:preparePassed,cold_verified:coldVerified,affinity_verified:affinityOk,solving_path_observed:mode!=='prepare'&&pathObserved,solving_path_evidence:'wrapper reached audited direct solve invocation; no added hot-loop instrumentation',completed_exact:exact,returned_wdl:finalWdl,native_result:parsed.result,ready:parsed.ready,handoff:parsed.handoff,affinity,validation:'not performed; no expected result supplied to timed process',performance_conclusion_allowed:false,eligible_for_post_run_validation:mode==='run'&&exact&&measurementValid};
writeFileSync(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({solver:id,mode,preparePassed,solvingPathObserved:summary.solving_path_observed,timedOut:measurement.timed_out,wallMs:measurement.wall_ms,exit:measurement.exit_status}));
if(!affinityOk||(mode==='prepare'&&!preparePassed)||(mode==='smoke'&&!pathObserved)||(mode==='run'&&!summary.completed_exact))process.exitCode=1;

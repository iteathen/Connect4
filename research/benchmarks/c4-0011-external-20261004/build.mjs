import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {cpus,totalmem,release} from 'node:os';
import {closure,hashFile,filesUnder} from './harness-lib.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const cfg=JSON.parse(readFileSync(resolve(process.argv[2]??join(here,'machine.example.json'))));
const root=resolve(cfg.buildRoot);if(existsSync(root))throw Error('build root must not exist; choose a fresh root (no stale includes or resumable records)');
mkdirSync(root,{recursive:true});
const gcc=join(cfg.toolchains,'w64devkit/bin/gcc.exe'),gxx=join(cfg.toolchains,'w64devkit/bin/g++.exe'),rust=join(cfg.toolchains,'rust/bin/rustc.exe');
const env={SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,ComSpec:process.env.ComSpec,TEMP:process.env.TEMP,TMP:process.env.TMP,PATH:`${dirname(gcc)};${process.env.SystemRoot}/System32`,LANG:'C',LC_ALL:'C'};
function command(exe,args,cwd){const r=spawnSync(exe,args,{cwd,env,encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true});if(r.error||r.status!==0)throw Error(`${exe} ${args.join(' ')}\n${r.error??''}\n${r.stdout}\n${r.stderr}`);return r;}
// git needs its absolute executable because the compiler environment deliberately excludes user PATH.
const gitExe=spawnSync('where.exe',['git'],{encoding:'utf8'}).stdout.trim().split(/\r?\n/)[0];
const pwshExe=spawnSync('where.exe',['pwsh'],{encoding:'utf8'}).stdout.trim().split(/\r?\n/)[0];
function gitRun(repo,args){return command(gitExe,['-C',repo,...args],undefined).stdout.trim();}
const pins={
 'fhourstones-c':['qu1j0t3/fhourstones','bf0e70ed9fe8128eeea8539f17dd41826f2cc6b6'],
 pons:['PascalPons/connect4','d6ba50d8aaf2308c769d9bf2abd42d90f34baf41'],
 christophe:['ChristopheSteininger/c4','fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c'],
 'fhourstones-rust':['jesper-olsen/connect-four','aff5861ad4f714059096c6d7c9664477f463766b'],
 isomax:['iteathen/JSMinSys','1b843981ba7d68c118656dad1a6c7591453e7686']};
const lock={schema:1,specification:{repository:'iteathen/Connect4',branch:'research/semantic-quotient',commit:'f3bc9c6b06b9b7cc02e99d1621f25d456dd9b0ef'},created:new Date().toISOString(),machine:{cpu:cpus()[0].model,logicalCpuCount:cpus().length,totalMemory:totalmem(),os:release(),...cfg},toolchains:{gcc:command(gcc,['--version']).stdout,gxx:command(gxx,['--version']).stdout,rust:command(rust,['--version','--verbose']).stdout,node:command(cfg.node,['-p','JSON.stringify({node:process.version,v8:process.versions.v8})']).stdout},toolchainExecutables:Object.fromEntries([gcc,gxx,rust,cfg.node].map(p=>[p,hashFile(p)])),solvers:{}};
if(process.argv.length>3)throw Error('final build always builds all five solvers in a fresh root');
for(const [id,[repo,pin]]of Object.entries(pins)){
 const b=join(root,'build',id),runtime=join(root,'runtime',id);mkdirSync(b,{recursive:true});mkdirSync(runtime,{recursive:true});
 const sourceRepo=id==='isomax'?cfg.isomaxGit:join(cfg.sources,id);
 if(gitRun(sourceRepo,['cat-file','-t',pin])!=='commit')throw Error(`missing pin ${id}`);
 const tree=gitRun(sourceRepo,['rev-parse',`${pin}^{tree}`]);
 let selectedFiles;
 if(id==='isomax')selectedFiles=gitRun(sourceRepo,['ls-tree','-r','--name-only',pin,'isomax']).split('\n').filter(p=>p.startsWith('isomax/runtime/')||['isomax/index.mjs','isomax/profile.json','isomax/targets.json'].includes(p));
 else if(id==='fhourstones-c')selectedFiles=['SearchGame.c','Game.c','TransGame.c'];
 else if(id==='pons')selectedFiles=['Solver.cpp',...gitRun(sourceRepo,['ls-tree','-r','--name-only',pin]).split('\n').filter(p=>p.endsWith('.hpp'))];
 else if(id==='christophe')selectedFiles=JSON.parse(readFileSync(join(here,'solvers/christophe/source-closure.json'))).files.map(x=>x.path);
 else selectedFiles=['src/board.rs','src/search.rs','src/tt.rs'];
 const upstream=join(b,'upstream');mkdirSync(upstream,{recursive:true});
 for(const p of selectedFiles){const target=join(upstream,p);mkdirSync(dirname(target),{recursive:true});const r=spawnSync(gitExe,['-C',sourceRepo,'show',`${pin}:${p}`],{env,windowsHide:true,maxBuffer:16*1024*1024});if(r.status!==0)throw Error(r.stderr.toString());writeFileSync(target,r.stdout);}
 const original=closure(upstream),patches=[];
 if(id==='christophe')for(const p of ['settings.patch','cold-audit.patch']){const path=join(here,'solvers',id,p);command(gitExe,['apply','--unsafe-paths','--directory=upstream',path],b);patches.push({path:p,sha256:hashFile(path)});}
 let exe,args,wrapper;
 const output=join(runtime,id==='isomax'?'node.exe':'solver.exe');
 const release=['-O3','-DNDEBUG','-march=native','-static']; // This portable GCC distribution has LTO disabled.
 if(id==='isomax'){
  for(const p of filesUnder(upstream)){const dest=join(runtime,p);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(upstream,p),dest);}
  wrapper=join(here,'solvers/isomax/wrapper.mjs');copyFileSync(wrapper,join(runtime,'wrapper.mjs'));copyFileSync(cfg.node,output);
  exe=null;args=[];
 }else{
  wrapper=join(here,'solvers',id,id==='christophe'?'benchmark.cpp':id==='fhourstones-rust'?'wrapper.rs':id==='pons'?'wrapper.cpp':'wrapper.c');
  const copied=join(b,wrapper.split(/[\\/]/).pop());copyFileSync(wrapper,copied);
  if(id==='fhourstones-c'){exe=gcc;args=[...release,'-std=gnu17','-DWIN32','-I',upstream,copied,'-o',output];}
  if(id==='pons'){exe=gxx;args=[...release,'-std=c++17','-I',upstream,copied,'-o',output];}
  if(id==='christophe'){exe=pwshExe;args=['-NoProfile','-NonInteractive','-File',join(here,'solvers/christophe/build-msvc.ps1'),'-BuildRoot',root,'-Upstream',upstream,'-Wrapper',copied];}
  if(id==='fhourstones-rust'){exe=rust;args=['--edition=2024','-C','opt-level=3','-C','target-cpu=native','-C','lto=thin','-C','codegen-units=1','-C','link-self-contained=yes','-C',`linker=${gcc}`,copied,'-o',output];}
  const result=command(exe,args,b);writeFileSync(join(b,'build.stdout.txt'),result.stdout);writeFileSync(join(b,'build.stderr.txt'),result.stderr);
 }
 const imports=command(join(dirname(gcc),'objdump.exe'),['-p',output]).stdout.split(/\r?\n/).filter(s=>s.includes('DLL Name:')).map(s=>s.split('DLL Name:')[1].trim());
 const systemImports={};for(const dll of imports){const p=join(process.env.SystemRoot,'System32',dll);if(existsSync(p))systemImports[dll]={path:p,sha256:hashFile(p)};else if(/^api-ms-/i.test(dll))systemImports[dll]={resolution:'Windows API-set virtual system DLL'};else throw Error(`unresolved runtime dependency ${dll}`);}
 lock.solvers[id]={solver:id,upstream_repository:`https://github.com/${repo}`,upstream_commit:pin,source_tree_hash:tree,source_files:original,patched_source_files:closure(upstream),patches,benchmark_wrapper_hash:hashFile(wrapper),build_command:exe?[exe,...args]:['copy exact package runtime and pinned node executable'],compiler_flags:args,build_success:true,executable_hash:hashFile(output),runtime_directory:runtime,runtime_files:closure(runtime),system_imports:systemImports,starting_position:'empty',target:id==='isomax'?'runtime-computed composite handoff exact W/D/L':'weak W/D/L',thread_or_worker_count:['christophe','isomax'].includes(id)?4:1,book_loaded:false,persistent_table_loaded:false,prior_solved_cache_loaded:false,known_lineage_classification:'unknown/not-certified-lineage-clean',cold_start_method:'new process; empty constructed root; zeroed fresh tables; no runtime data files other than frozen configuration',runtime_input_independence_status:'source audited; smoke pending'};
 if(id==='christophe'){lock.solvers[id].native_build=JSON.parse(readFileSync(join(b,'diagnostics/msvc-build.json'),'utf8').replace(/^\uFEFF/,''));lock.solvers[id].compiler_flags=lock.solvers[id].native_build.arguments;lock.solvers[id].build_helper_sha256=hashFile(join(here,'solvers/christophe/build-msvc.ps1'));}
 writeFileSync(join(root,'build-lock.partial.json'),JSON.stringify(lock,null,2)+'\n');console.log(`BUILT ${id}`);
}
lock.harness_files=Object.fromEntries(['build.mjs','runner.mjs','measure.ps1','harness-lib.mjs'].filter(p=>existsSync(join(here,p))).map(p=>[p,hashFile(join(here,p))]));
if(Object.keys(lock.solvers).length===5)writeFileSync(join(root,'build-lock.json'),JSON.stringify(lock,null,2)+'\n');
else writeFileSync(join(root,'build-lock.partial.json'),JSON.stringify(lock,null,2)+'\n');

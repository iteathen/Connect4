import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const here=dirname(fileURLToPath(import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function uniqueReplace(text,before,after){
 if(text.split(before).length!==2)throw Error('Expected exactly one configuration token');
 return text.replace(before,after);
}
function prime(n){if(n%2===0)return n===2;for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;return n>=2;}
export function prepareExternal(sourcesRoot,auditedBuildRoot,outputRoot){
 const out=resolve(outputRoot),locks=JSON.parse(readFileSync(join(here,'source-lock.json'),'utf8').replace(/^\uFEFF/,''));
 if(existsSync(out))throw Error('Output root must be new; existing sources are never overwritten');
 const validated={};
 for(const [solver,lock] of Object.entries(locks.solvers)){
  if(execFileSync('git',['-C',join(sourcesRoot,solver),'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==lock.commit)throw Error('Original checkout revision mismatch');
  validated[solver]={};
  for(const [file,hash] of Object.entries(lock.original)){
   const blob=execFileSync('git',['-C',join(sourcesRoot,solver),'show',`${lock.commit}:${file}`]);
   const checkout=readFileSync(join(sourcesRoot,solver,file));
   if(sha(blob)!==hash||sha(Buffer.from(checkout.toString().replace(/\r\n/g,'\n')))!==hash)throw Error(`Original source hash mismatch: ${solver}/${file}`);
  }
  for(const [file,hash] of Object.entries(lock.audited)){
   const bytes=readFileSync(join(auditedBuildRoot,'build',solver,'upstream',file));
   if(sha(bytes)!==hash)throw Error(`Audited source hash mismatch: ${solver}/${file}`);
   validated[solver][file]=bytes;
  }
 }
 const budgetBytes=12*2**30;
 let capacity=budgetBytes/8-1;
 while(!prime(capacity))capacity-=2;
 const manifest={schema:1,target:'empty-7x6-weak-WDL',budgetBytes,originalCheckoutEolPolicy:'Git blobs exact SHA256; checkout text permits CRLF-to-LF only; compiled staged files exact SHA256',solvers:{}};
 for(const [solver,files] of Object.entries(validated)){
  const changed={};
  for(const [file,bytes] of Object.entries(files)){
   let actual=bytes;
   if(solver==='christophe'&&file==='src/solver/settings.h'){
    let text=uniqueReplace(bytes.toString(),'inline constexpr int NUM_THREADS = 4;','inline constexpr int NUM_THREADS = 6;');
    text=uniqueReplace(text,'inline constexpr uint64_t NUM_TABLE_ENTRIES = 134217757;',`inline constexpr uint64_t NUM_TABLE_ENTRIES = ${capacity};`);
    actual=Buffer.from(text);
   }
   const dest=join(out,solver,'upstream',file);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,actual);
   changed[file]=sha(actual);
  }
  const wrapper=`${solver}-benchmark.cpp`;
  copyFileSync(join(here,wrapper),join(out,solver,wrapper));
  if(solver==='christophe')writeFileSync(join(out,solver,'benchmark-settings.h'),`#pragma once\nconstexpr unsigned long long BENCH_TABLE_ENTRIES=${capacity}ULL;\nconstexpr unsigned long long BENCH_TT_BUDGET=${budgetBytes}ULL;\n`);
  manifest.solvers[solver]={repository:locks.solvers[solver].repository,commit:locks.solvers[solver].commit,
   sourceFiles:changed,wrapperSha256:sha(readFileSync(join(here,wrapper))),workers:solver==='christophe'?6:1,
   configurationHeaderSha256:solver==='christophe'?sha(readFileSync(join(out,solver,'benchmark-settings.h'))):null,
   tableCapacity:solver==='christophe'?capacity:16777259,
   tableBytes:solver==='christophe'?(capacity+1)*8:16777259*5,
   patches:solver==='christophe'?['previous cold audit accessors retained','NUM_THREADS=6','NUM_TABLE_ENTRIES=largest fitting odd prime']:[],
   searchAlgorithmChanged:false,book:false,persistedTable:false,strong:false};
 }
 writeFileSync(join(out,'preparation.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==5)throw Error('Usage: node prepare-external.mjs SOURCES_ROOT AUDITED_BUILD_ROOT NEW_OUTPUT_ROOT');
 console.log(JSON.stringify(prepareExternal(...process.argv.slice(2)),null,2));
}

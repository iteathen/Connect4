import {readFileSync,writeFileSync,existsSync,cpSync,readdirSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=dirname(fileURLToPath(import.meta.url));
const sha=data=>createHash('sha256').update(data).digest('hex');
export function replaceOne(text,before,after){
 if(text.split(before).length!==2)throw Error('Instrumentation token absent or ambiguous');
 return text.replace(before,after);
}
function files(root,prefix=''){
 return readdirSync(join(root,prefix),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(root,`${prefix}${e.name}/`):[`${prefix}${e.name}`]).sort();
}
export function prepareDiagnostic(packageRoot,outputRoot){
 const original=resolve(packageRoot),out=resolve(outputRoot);
 if(existsSync(out))throw Error('Private diagnostic destination must be new');
 if(out===original||out.startsWith(original+'/')||out.startsWith(original+'\\'))throw Error('Diagnostic copy must be outside production package');
 const lock=JSON.parse(readFileSync(join(here,'source-lock.json'),'utf8').replace(/^\uFEFF/,''));
 const profile=JSON.parse(readFileSync(join(original,'profile.json'),'utf8'));
 if(profile.sourceCommit!==lock.sourceCommit)throw Error('Unexpected package source commit');
 for(const [file,hash] of Object.entries(lock.files))if(sha(readFileSync(join(original,file)))!==hash)throw Error(`Diagnostic source hash mismatch: ${file}`);
 const before=Object.fromEntries(files(original).map(f=>[f,sha(readFileSync(join(original,f)))]));
 cpSync(original,out,{recursive:true,errorOnExist:true,force:false});
 const changes={};
 function patch(file,mutate){
  const dest=join(out,file),text=readFileSync(dest,'utf8'),changed=mutate(text);
  writeFileSync(dest,changed);changes[file]={before:sha(text),after:sha(changed)};
 }
 for(const file of Object.keys(lock.files).filter(f=>f.includes('lazy-smp-worker'))){
  patch(file,text=>{
   text=replaceOne(text,"import {workerData} from 'node:worker_threads';","import {workerData,parentPort} from 'node:worker_threads';\nlet diagnosticRecursiveEntries=0;");
   const declaration=text.match(/function negamax\([^\n]+\)\{/g);
   if(declaration?.length!==1)throw Error('Exactly one negamax entry is required');
   text=replaceOne(text,declaration[0],declaration[0]+'\n  diagnosticRecursiveEntries+=1;');
   return text+'\n// One final cold report after search/cancellation; never from recursion.\nworkerData.diagnosticCounts[index]=diagnosticRecursiveEntries;\nAtomics.store(workerData.diagnosticPublished,index,1);\nparentPort.postMessage({event:"diagnostic-count",worker:index,recursiveEntries:diagnosticRecursiveEntries});\n';
  });
 }
 patch('runtime/addons/rba-connect4-prepared-session-host.mjs',text=>{
  text=replaceOne(text,'const control=new Int32Array(new SharedArrayBuffer(20)),','const diagnosticCounts=new Float64Array(new SharedArrayBuffer(workers*8)),\n    diagnosticPublished=new Int32Array(new SharedArrayBuffer(workers*4));\n  const control=new Int32Array(new SharedArrayBuffer(20)),');
  text=replaceOne(text,'nodeCounts:null,workerTiming:null,frontierMetrics:null,','nodeCounts:null,workerTiming:null,frontierMetrics:null,\n      diagnosticRecursiveEntries:Array.from({length:workers},(_,i)=>Atomics.load(diagnosticPublished,i)===1&&Number.isSafeInteger(diagnosticCounts[i])?diagnosticCounts[i]:null),\n      diagnosticPublished:Array.from({length:workers},(_,i)=>Atomics.load(diagnosticPublished,i)),');
  return replaceOne(text,'control,resultWords,workerIndex:i,workerCount:workers,geometry:workerGeometry,','diagnosticCounts,diagnosticPublished,\n      control,resultWords,workerIndex:i,workerCount:workers,geometry:workerGeometry,');
 });
 patch('runtime/addons/branch-manager-host.mjs',text=>{
  text=replaceOne(text,'session.threads.push(worker);','session.threads.push(worker);\n  worker.on("message",()=>{}); // Consume the one cold diagnostic record.');
  return replaceOne(text,'  await Promise.allSettled(session.threads.map((worker) => worker.terminate()));','  // Diagnostic copy only: let cancellation unwind and final local counts publish.\n  let diagnosticGraceTimer;\n  await Promise.race([Promise.all(session.exits),new Promise(resolve=>{diagnosticGraceTimer=setTimeout(resolve,1000);})]);\n  clearTimeout(diagnosticGraceTimer);\n  await Promise.allSettled(session.threads.map((worker) => worker.terminate()));');
 });
 for(const [file,hash] of Object.entries(before))if(sha(readFileSync(join(original,file)))!==hash)throw Error('Production package changed during copy');
 const after=Object.fromEntries(files(out).map(f=>[f,sha(readFileSync(join(out,f)))]));
 const manifest={schema:1,diagnosticOnly:true,sourceCommit:profile.sourceCommit,
  sourceFiles:before,diagnosticFiles:after,changes,
  definition:'Entries to each selected worker negamax function, including cancellation-return entries; root direct wins may produce zero.',
  perturbation:'One local number increment per recursive entry; one final shared count/flag and message per worker; up to 1000ms cooperative cleanup before normal termination.',
  timingEligible:false,productionUnchanged:true};
 writeFileSync(join(out,'diagnostic-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==4)throw Error('Usage: node prepare-diagnostic.mjs PACKAGE_ROOT NEW_PRIVATE_COPY');
 const manifest=prepareDiagnostic(...process.argv.slice(2));
 console.log(JSON.stringify({schema:1,sourceCommit:manifest.sourceCommit,changedFiles:Object.keys(manifest.changes),productionUnchanged:manifest.productionUnchanged,solverExecuted:false}));
}

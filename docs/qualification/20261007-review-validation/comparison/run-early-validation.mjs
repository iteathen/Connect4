import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve,dirname,relative} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {inspect,toDigits} from './physical-legality.mjs';
const here=dirname(fileURLToPath(import.meta.url)),[packageArg,nativeArg,outArg,mode]=process.argv.slice(2);
if(!packageArg||!nativeArg||!outArg)throw Error('Usage: node run-early-validation.mjs PACKAGE_ROOT PREPARED_NATIVE_ROOT NEW_OUTPUT_ROOT');
if(mode!==undefined&&mode!=='--preflight')throw Error('Only optional --preflight is supported');
const packageRoot=resolve(packageArg),nativeRoot=resolve(nativeArg),out=resolve(outArg);
if(existsSync(out))throw Error('Output directory must be new');
const sha=data=>createHash('sha256').update(data).digest('hex');
const repositoryRoot=execFileSync('git',['-C',packageRoot,'rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const frozenCommit=execFileSync('git',['-C',repositoryRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
for(const name of ['early-corpus.json','physical-legality.mjs','early-isomax.mjs','run-early-validation.mjs','run-native.ps1','production-runtime-lock.json']){
 const file=join(here,name),gitPath=relative(repositoryRoot,file).replaceAll('\\','/');
 const blob=execFileSync('git',['-C',repositoryRoot,'show',`${frozenCommit}:${gitPath}`]);
 if(sha(blob)!==sha(readFileSync(file,'utf8').replace(/\r\n/g,'\n')))throw Error('Early validation files must be committed before any oracle query');
}
if(sha(readFileSync(process.execPath))!=='2f2843c1802f6a17ba7fabe5550c90bb055c9bef8738a08338d94f71dbe91f29')throw Error('Pinned Node executable required');
// Guard executable code independently of mutable evidence/package metadata.
const runtimeLockBytes=readFileSync(join(here,'production-runtime-lock.json')),runtimeLock=JSON.parse(runtimeLockBytes.toString().replace(/^\uFEFF/,''));
for(const [file,hash] of Object.entries(runtimeLock.files))if(sha(readFileSync(join(packageRoot,file)))!==hash)throw Error(`Frozen package execution file changed: ${file}`);
const corpusBytes=readFileSync(join(here,'early-corpus.json')),corpus=JSON.parse(corpusBytes);
const nativeBuild=JSON.parse(readFileSync(join(nativeRoot,'build.json'),'utf8').replace(/^\uFEFF/,''));
if(sha(readFileSync(join(nativeRoot,'pons','solver.exe')))!==nativeBuild.solvers.pons.executableSha256)throw Error('Pons executable changed');
const profile=JSON.parse(readFileSync(join(packageRoot,'profile.json'),'utf8'));
if(corpus.cases.length!==9||corpus.cases.some((c,i)=>c.rank!==i+8))throw Error('Nine frozen ranks8..16 required');
for(const item of corpus.cases){if(item.rank!==item.moves.length||inspect(item.moves).winner||item.oneBased!==toDigits(item.moves))throw Error('Frozen corpus legality mismatch');}
const freeze={schema:1,repositoryCommit:frozenCommit,packageSourceCommit:profile.sourceCommit,
 executableCodeLockSha256:sha(runtimeLockBytes),runtimeFreeze:runtimeLock.runtimeFreeze,
 corpusSha256:sha(corpusBytes),nodeSha256:sha(readFileSync(process.execPath)),node:process.version,v8:process.versions.v8,
 packageProfileSha256:sha(readFileSync(join(packageRoot,'profile.json'))),packageProvenanceSha256:sha(readFileSync(join(packageRoot,'provenance.json'))),
 ponsCommit:nativeBuild.solvers.pons.sourceCommit,ponsExecutableSha256:nativeBuild.solvers.pons.executableSha256,
 isoConfiguration:{workers:6,memoryProfile:'12',cacheIdentity:'partial24',searchTimeoutMs:120000,initializationTimeoutMs:120000},
 semantics:'IsoMax rootWdl is player0-relative. Pons weak score is mover-relative; invert sign at odd ply before root/witness comparison.',
 resourceIsolation:'Fresh IsoMax process for every root; process exits and joins workers before native oracle launch. No retained TT or GC dependence.',
 selection:corpus.selection};
if(mode==='--preflight'){console.log(JSON.stringify({schema:1,preflight:true,solverExecuted:false,caseCount:corpus.cases.length,runtimeFilesGuarded:Object.keys(runtimeLock.files).length,freeze}));process.exit(0);}
mkdirSync(out,{recursive:true});
writeFileSync(join(out,'freeze.json'),JSON.stringify(freeze,null,2)+'\n');
function sanitize(text){return text.replace(/\(node:\d+\)/g,'(node:<redacted>)').replace(/([A-Z]:[\\/](?:Users|Documents and Settings)[\\/])[^\\/\s"]+/gi,'$1<redacted>');}
async function run(executable,args,stem,deadlineMs){
 const child=spawn(executable,args,{windowsHide:true,stdio:['ignore','pipe','pipe']}),chunks=[],errors=[];
 child.stdout.on('data',d=>chunks.push(d));child.stderr.on('data',d=>errors.push(d));
 let killed=false;
 const timer=setTimeout(()=>{killed=true;
  if(process.platform==='win32'){
   // Terminate only the launched child and its owned worker/native descendants.
   try{execFileSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});}catch{child.kill('SIGKILL');}
  }else child.kill('SIGKILL');
 },deadlineMs);
 const exitCode=await new Promise((done,failed)=>{child.once('error',failed);child.once('close',done);}).finally(()=>clearTimeout(timer));
 const stdout=sanitize(Buffer.concat(chunks).toString()),stderr=sanitize(Buffer.concat(errors).toString());
 writeFileSync(join(out,stem+'.stdout.txt'),stdout);writeFileSync(join(out,stem+'.stderr.txt'),stderr);
 if(killed||exitCode!==0)throw Error(`${stem} incomplete (exit=${exitCode}, deadline=${killed})`);
 return stdout;
}
async function pons(history,stem){
 const resultPath=join(out,stem+'.json');
 await run('pwsh',['-NoLogo','-NoProfile','-File',join(here,'run-native.ps1'),'-PreparedRoot',nativeRoot,'-Solver','pons','-History',history,'-ResultFile',resultPath,'-DeadlineMs','120000'],stem,150000);
 const record=JSON.parse(readFileSync(resultPath,'utf8').replace(/^\uFEFF/,''));
 if(record.result?.status!=='EXACT')throw Error('Pons result incomplete');
 const mover=Math.sign(record.result.native_score),first=history.length&1?-mover:mover;
 if(record.result.wdl!==mover||record.result.wdl_first_player!==first)throw Error('Pons mover/frame inconsistency');
 return record;
}
const rows=[];
try{
 for(const item of corpus.cases){
  // Both solvers receive history only. Outcomes are compared after both exit.
  const flags=['--experimental-ffi','--max-inlined-bytecode-size=2400','--max-inlined-bytecode-size-cumulative=9600','--import',pathToFileURL(join(packageRoot,'runtime/tools/benchmark-v8-startup-preload.mjs')).href];
  const isoText=await run(process.execPath,[...flags,join(here,'early-isomax.mjs'),packageRoot,item.oneBased],item.id+'-iso',250000);
  const iso=JSON.parse(isoText.trim());
  writeFileSync(join(out,item.id+'-iso.json'),JSON.stringify(iso,null,2)+'\n');
  const reference=await pons(item.oneBased,item.id+'-pons-root');
  const move=iso.result.move,childMoves=[...item.moves,move],childState=inspect(childMoves);
  let childWdl,childReference=null;
  if(childState.winner||childState.full)childWdl=childState.winner===1?1:childState.winner===2?-1:0;
  else {childReference=await pons(toDigits(childMoves),item.id+'-pons-child');childWdl=childReference.result.wdl_first_player;}
  const row={id:item.id,rank:item.rank,moves:item.moves,isoWdl:iso.result.rootWdl,ponsWdl:reference.result.wdl_first_player,
   isoMove:move,childTerminal:childState.winner!==0||childState.full,childWdl,
   outcomeAgreement:iso.result.rootWdl===reference.result.wdl_first_player,witnessPreservesValue:childWdl===iso.result.rootWdl,
   cleanup:iso.result.cleanup,workersExited:iso.result.workersExited,
   isomaxPrimaryMs:iso.result.preparedTiming.solveMs,ponsPrimaryMs:reference.result.primary_ms};
  rows.push(row);writeFileSync(join(out,'progress.json'),JSON.stringify({schema:1,freeze,rows},null,2)+'\n');
  if(!row.outcomeAgreement||!row.witnessPreservesValue||!row.cleanup||row.workersExited!==6)throw Error('Early outcome or witness validation failed');
 }
 const summary={schema:1,status:'PASS',freeze,caseCount:rows.length,rows,timingEligible:false};
 writeFileSync(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
}catch(error){writeFileSync(join(out,'summary.json'),JSON.stringify({schema:1,status:'INCOMPLETE_OR_FAILED',freeze,rows,error:error.message,timingEligible:false},null,2)+'\n');throw error;}

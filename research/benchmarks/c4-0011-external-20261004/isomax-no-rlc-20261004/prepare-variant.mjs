import {readFileSync,writeFileSync,mkdirSync,copyFileSync,cpSync,existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {hashFile,closure,verifyClosure} from '../harness-lib.mjs';
const here=dirname(fileURLToPath(import.meta.url)),parent=dirname(here);
const base=resolve(process.argv[2]??'C:/r/c4-external-build-final-20261004'),dest=resolve(process.argv[3]??'C:/r/c4-isomax-no-rlc-20261004');
if(existsSync(dest))throw Error('new variant build directory required');
const manifest=JSON.parse(readFileSync(join(parent,'external-solver-c4-0011-manifest.json')));
const originalLock=join(base,'build-lock.json');if(hashFile(originalLock)!==manifest.build_lock_sha256)throw Error('base freeze mismatch');
const lock=JSON.parse(readFileSync(originalLock)),original=lock.solvers.isomax;
verifyClosure(original.runtime_directory,original.runtime_files);
mkdirSync(dest,{recursive:true});const runtime=join(dest,'runtime/isomax');cpSync(original.runtime_directory,runtime,{recursive:true});
copyFileSync(join(here,'wrapper.mjs'),join(runtime,'wrapper.mjs'));
const hashes=closure(runtime),changes=Object.keys(hashes).filter(p=>hashes[p]!==original.runtime_files[p]);
if(changes.length!==1||changes[0]!=='wrapper.mjs'||Object.keys(hashes).length!==Object.keys(original.runtime_files).length)throw Error('unexpected runtime change');
for(const name of ['runner.mjs','measure.ps1','harness-lib.mjs']){
 if(hashFile(join(parent,name))!==lock.harness_files[name])throw Error('base harness mismatch');
 copyFileSync(join(parent,name),join(here,name));
}
const variant={...original,runtime_directory:runtime,runtime_files:hashes,benchmark_wrapper_hash:hashes['wrapper.mjs'],target:'weak W/D/L of fixed empty 7x6 root',variant:'RLC disabled; direct empty-root exact search',changed_runtime_files:changes};
lock.solvers={isomax:variant};lock.variant={parent_build_lock_sha256:manifest.build_lock_sha256,only_runtime_change:'wrapper.mjs',rlc_enabled:false,expected_answers_available_to_runtime:false};
lock.harness_files=Object.fromEntries(['runner.mjs','measure.ps1','harness-lib.mjs'].map(n=>[n,hashFile(join(here,n))]));
const newLock=join(dest,'build-lock.json');writeFileSync(newLock,JSON.stringify(lock,null,2)+'\n');
mkdirSync(join(here,'evidence'),{recursive:true});copyFileSync(newLock,join(here,'evidence/build-lock.json'));
const prior=manifest.solvers.find(x=>x.solver==='isomax');
const audited={...prior,...variant,bounded_smoke:null,cold_prepare_passed:false,benchmark_command:`node runner.mjs run isomax --build ${dest} --out <new-run-directory> --timeout-ms 3600000`};
writeFileSync(join(here,'external-solver-c4-0011-manifest.json'),JSON.stringify({schema:manifest.schema,audit_packet_complete:true,independence_lane:'runtime-input-only',specification:manifest.specification,parent_preparation_commit:'948e8356d33695a1a6e8ca93c97d48013efc5d3f',build_lock_sha256:hashFile(newLock),build_lock_file:'evidence/build-lock.json',solvers:[audited],audit:'AUDIT.md',expected_answers_available_to_runtime:false},null,2)+'\n');
console.log('Frozen no-RLC variant: only wrapper.mjs differs; all solver/runtime/profile/affinity bytes unchanged.');

// Records a reviewed build. --audit-complete is a deliberate auditor attestation,
// not inferred from successful compilation or a returned answer.
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {hashFile} from './harness-lib.mjs';
const here=dirname(fileURLToPath(import.meta.url)),build=resolve(process.argv[2]),complete=process.argv.includes('--audit-complete');
const path=join(build,'build-lock.json'),lock=JSON.parse(readFileSync(path));
if(Object.keys(lock.solvers).length!==5)throw Error('all five builds required');
const resources={
 'fhourstones-c':{records:8306069,score_slots_per_record:2,record_bytes:'sizeof(hashentry), measured by prepare',bytes:'measured by prepare',memory_policy:'native upstream TT default; no OS hard cap'},
 pons:{entries:16777259,key_bytes:4,value_bytes:1,bytes:83886295,memory_policy:'native upstream TT default; no OS hard cap'},
 christophe:{entries:134217757,allocated_entries:134217758,entry_bytes:8,bytes:1073742064,memory_policy:'native upstream TT default shared across four threads; no OS hard cap'},
 'fhourstones-rust':{entries:8306069,entry_bytes:8,bytes:66448552,memory_policy:'native upstream solve CLI default; no OS hard cap'},
 isomax:{shared_capacity:134217728,shared_entry_bytes:32,shared_bytes:4294967296,private_capacity:16777216,private_entry_bytes:36,private_bytes_per_worker:603979776,total_tt_bytes:6710886400,memory_policy:'frozen production four-deep profile; no OS hard cap'}};
const solvers=Object.values(lock.solvers).map(s=>{
 const prepare=join(here,'evidence','prepare-final',s.solver,'summary.json');
 const evidence=existsSync(prepare)?JSON.parse(readFileSync(prepare)):null;
 if(complete&&!evidence?.prepare_passed)throw Error(`cold preparation missing: ${s.solver}`);
 const resource=resources[s.solver];if(s.solver==='fhourstones-c'&&evidence){resource.record_bytes=evidence.ready.tt_record_bytes;resource.bytes=evidence.ready.tt_bytes;}
 const smokePath=join(here,'evidence','smoke',s.solver,'summary.json');
 const smoke=existsSync(smokePath)?JSON.parse(readFileSync(smokePath)):null;
 s.bounded_smoke=smoke?{evidence:`evidence/smoke/${s.solver}/summary.json`,sha256:hashFile(smokePath),cold_verified:smoke.cold_verified,solving_path_observed:smoke.solving_path_observed,affinity_verified:smoke.affinity_verified,measurement_valid:smoke.measurement_valid,deliberately_incomplete:smoke.measurement.timed_out,completed_exact:smoke.completed_exact,performance_conclusion_allowed:false}:null;
 if(s.solver==='isomax')s.package_provenance={package_archive:'isomax/dist/iteathen-isomax-0.1.0-rc.3.tgz',archive_sha256:'9083bfa24befc7d9da02d34e7aa927fa788f0a76786ee4f12c0a6bd74fd51540',metadata:JSON.parse(readFileSync(join(here,'solvers/isomax/source-closure.json'))).metadata,source_commit:'ab628f21fa8c989aa7fc1bc416b23ed126f82b93',measured_runtime_commit:'8713baa11148a7723043d8c434ffb77343a96253',rlc_source_hash:s.source_files['isomax/runtime/addons/connect4-rank-local-presearch.mjs'],exact_source_hashes:Object.fromEntries(Object.entries(s.source_files).filter(([p])=>p.startsWith('isomax/runtime/experiments/isomax-lean/')))};
 return {...s,compiler_or_runtime:s.solver==='isomax'?lock.toolchains.node:s.solver==='christophe'?s.native_build.compilerFileVersion:s.solver==='fhourstones-rust'?lock.toolchains.rust:s.solver==='pons'?lock.toolchains.gxx:lock.toolchains.gcc,TT_cache_capacity:resource,runtime_input_independence_status:s.solver==='pons'?'CONDITIONAL PASS — no-book wrapper conditions satisfied by frozen build':'PASS — runtime-input-only source audit; cold evidence separately recorded',cold_prepare_passed:evidence?.prepare_passed??false,audit:`solvers/${s.solver}/audit.md`,benchmark_command:`node runner.mjs run ${s.solver} --build "${build}" --out "<new-run-directory>"`,smoke_command:`node runner.mjs smoke ${s.solver} --build "${build}" --out "<new-smoke-directory>"`};
});
const manifest={schema:'external-solver-c4-0011-v1',audit_packet_complete:complete,performance_campaign_started:false,independence_lane:'runtime-input-only',specification:lock.specification,build_lock_sha256:hashFile(path),build_lock_file:'evidence/build-lock.json',machine:lock.machine,solvers,excluded:[{solver:'benjaminrall/connect-four-ai default distribution',reason:'default Solver::new consumes embedded crates/core/src/engine/books/default-book.bin; separate book-free variant outside scope'}],fairness:{threads:'IsoMax and Christophe four search workers; native serial C/Pons/Rust baselines explicitly authorized',target:'IsoMax begins empty and computes RLC live advancement, then exact handoff WDL; externals prove fixed empty-root WDL. No optimality bridge asserted.',memory:'native capacities differ; private/shared TT allocation excludes runtime, geometry and stacks; peak RSS measured independently',compilers:'GCC release -O3 native CPU (portable GCC lacks LTO); Rust -O3 native CPU thin LTO; Christophe MSVC /O2 /GL /LTCG; Node pinned historical nightly',affinity:lock.machine.affinityDescription},timing:{primary:'fresh process spawn through process exit including cold TT checks, all initialization, runtime RLC, search, output and cleanup',excluded:'source fetch, compilation, manifest/closure hash verification and external collector startup only; no position-dependent work excluded'},validation:'expected answers never passed to child; actual campaign validation occurs after return; none queried in preparation'};
mkdirSync(join(here,'evidence'),{recursive:true});copyFileSync(path,join(here,'evidence/build-lock.json'));
writeFileSync(join(here,'external-solver-c4-0011-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Frozen ${solvers.length} builds; audit_packet_complete=${complete}`);

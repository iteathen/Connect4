import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// Integration/provenance check only. Scientific partition qualification lives
// in the pinned experiment's independent graph-traversal verifier.
const base=new URL('.',import.meta.url);
const read=f=>JSON.parse(fs.readFileSync(new URL(f,base),'utf8'));
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:4*1024*1024});
const integration=read('RANK_SUFFICIENCY_JOINT_DA_COMMON_QUOTIENT_INTEGRATION_0_1.json');
const e=integration.evidence;
const dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const blob=(commit,file)=>git(['show',commit+':'+dir+file]);
const raw=JSON.parse(blob(e.evidenceCommit,e.resultFile));
const verified=JSON.parse(blob(e.evidenceCommit,e.verificationFile));
assert.equal(raw.warrant,'EW-RS-078');
assert.equal(verified.status,'PASS');
assert.equal(raw.scalarAccess,false);
assert.equal(verified.scalarQualification,false);
assert.equal(e.scalarAccess,false);
assert.equal(raw.sourceCommit,git(['rev-parse',e.sourceCommit]).trim());
assert.equal(raw.inputHashEncoding,'UTF8_LF');
git(['merge-base','--is-ancestor',e.warrantFreezeCommit,e.sourceCommit]);
git(['merge-base','--is-ancestor',e.sourceCommit,e.evidenceCommit]);
for(const [f,hash] of Object.entries(raw.inputSha256)){
  assert.equal(createHash('sha256').update(blob(e.sourceCommit,f).replace(/\r\n/g,'\n')).digest('hex'),hash);
  assert.equal(blob(e.sourceCommit,f),blob(e.evidenceCommit,f));
}
assert.deepEqual(integration.domains,raw.domains.map(d=>({name:d.domain,states:d.stateCount,
  carrierClassCounts:d.carrierClassCounts,commonClasses:d.quotientClassCount,
  simultaneousReversalDistinguished:d.symmetry.simultaneous.distinguished})));
assert.deepEqual(verified.domains,raw.domains.map(d=>({domain:d.domain,states:d.stateCount,
  classes:d.quotientClassCount,symmetry:d.symmetry})));
const seq=JSON.parse(blob(e.evidenceCommit,integration.rs077Requalification.auditFile));
assert.equal(seq.status,'RESOLVED__FULL_GRID_REPLAY_REQUALIFIED');
assert.equal(seq.resolution.candidateAuditsReproduced,integration.rs077Requalification.candidateAudits);
assert.equal(seq.resolution.resultSha256,integration.rs077Requalification.resultSha256);
assert.equal(createHash('sha256').update(blob(e.evidenceCommit,'OOO_SIGN_CHANNEL_COUPLING_0_1.json')).digest('hex'),seq.resolution.resultSha256);
const ia=read('IA_RANK_SUFFICIENCY_ROUND_86_0_1.json');
const fixed=read('IA_RANK_SUFFICIENCY_ROUND_87_FIXED_POINT_0_1.json');
const previous=read('QU_LEDGER_RANK_SUFFICIENCY_0_31.json');
const qu=read('QU_LEDGER_RANK_SUFFICIENCY_0_32.json');
assert.equal(ia.round,86);
assert.deepEqual(ia.new_assertions.slice(0,5).map(a=>a.body),integration.findings.map(f=>f.statement));
assert.equal(fixed.round,87);
assert.equal(fixed.fixed_point,true);
assert.deepEqual(fixed.recursive_generation.new_assertions,[]);
assert.deepEqual(fixed.next_evidence_boundaries,integration.nextExperiment);
assert.equal(qu.revision_of,'QU_LEDGER_RANK_SUFFICIENCY_0_31.json');
assert.equal(qu.fixed_point_round,87);
assert.equal(qu.status,integration.status);
for(const old of previous.regions){
  const now=qu.regions.find(r=>r.id===old.id);
  assert.ok(now);
  for(const fact of old.fixed)assert.ok(now.fixed.includes(fact));
  assert.equal(now.status,old.status);
  if(!['QU-RS-004','QU-RS-008','QU-RS-010'].includes(old.id))assert.deepEqual(now,old);
}
assert.equal(integration.nextExperiment.status,'REQUIRES_SEPARATE_PRE_SCALAR_WARRANT');
assert.equal(raw.holdouts.sealed,true);
console.log(JSON.stringify({status:'PASS',scope:'RS078 pinned provenance and integration consistency; not new scalar qualification',
  evidenceCommit:e.evidenceCommit,classes:integration.domains.map(d=>d.commonClasses),fixedPointRound:87},null,2));

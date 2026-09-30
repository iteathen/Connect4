import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateRs076SourceRequalification,verifyRs076SourceRequalificationFromRepository} from './source-requalification.mjs';

const repositoryRoot=fileURLToPath(new URL('../../../../',import.meta.url));
const dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const sourcePath=dir+'run-ooo-sign-channel-coupling.mjs';
const evidencePath=dir+'OOO_SIGN_CHANNEL_COUPLING_0_1.json';
const originalCommit='3173aca8669c85ad7d522fa0f44bb6736e2dcc40';
const repairedCommit='c04de18a91ccdd3fbf4c25087999d7c05b6c90f6';
const evidenceCommit='a4c4c3731f580a27ba7420cc63f0188b340923a3';
const originalHash='1b2ecef9547ec159d2a8510e00a5d6cdb29f84b2c87463156a9d9656f026d5e8';
const repairedHash='96f62e24464550018728a06a847c398084fa83efd489a7bb5140baa00b9d030b';
const evidenceHash='9e26e7a113e30456c871ff5c59a9759a721504f1794faa5c686160ecf4b7e413';
const blob=(commit,path)=>execFileSync('git',['show',commit+':'+path],{cwd:repositoryRoot,encoding:'utf8',maxBuffer:8*1024*1024});
const originalSource=blob(originalCommit,sourcePath),currentSource=blob(repairedCommit,sourcePath);
const pinnedEvidence=blob(evidenceCommit,evidencePath);

// A fixture attestation exercises local validation; it does not certify an
// actual workflow result. Only the root's completed-run review may issue that.
function fixture(){
  return {
    certificate:{
      schema:'connect4.isomax.rs076_source_requalification.v1',status:'PASS',
      transformation:'RS076_ALL_GRID_PREPARE_THEN_REPLAY_V1',
      originalSource:{commit:originalCommit,sha256:originalHash},
      repairedSource:{commit:repairedCommit,sha256:repairedHash},
      evidence:{commit:evidenceCommit,sha256:evidenceHash},
      fullReplay:{status:'PASS',sourceCommit:repairedCommit,evidenceSha256:evidenceHash,
        runUrl:'https://github.com/iteathen/Connect4/actions/runs/36781520908'}
    },
    expectedOriginalSha256:originalHash,originalSource,repairedCommitSource:currentSource,
    currentSource,pinnedEvidence,currentEvidence:pinnedEvidence
  };
}

test('accepts only the documented repair with unchanged full scientific evidence',()=>{
  assert.equal(validateRs076SourceRequalification(fixture()).status,'PASS');
});

test('canonicalizes CRLF without permitting any other source or evidence edit',()=>{
  const input=fixture();
  for(const key of ['originalSource','repairedCommitSource','currentSource','pinnedEvidence','currentEvidence'])
    input[key]=input[key].replace(/\n/g,'\r\n');
  assert.equal(validateRs076SourceRequalification(input).status,'PASS');
});

for(const field of ['originalSource','repairedCommitSource','currentSource','pinnedEvidence','currentEvidence']){
  test('rejects tampering with '+field,()=>{
    const input=fixture();input[field]+='\n';
    assert.throws(()=>validateRs076SourceRequalification(input));
  });
}

test('rejects a partial repair and any additional edit outside the repaired audit',()=>{
  for(const currentSource of [originalSource,
    fixture().currentSource.replace('audits:freezeGridThenReplay(FAMILY_SATURATION_GRID,prepareCandidate,replayCandidate)',
      'audits:FAMILY_SATURATION_GRID.map(prepareCandidate).map(replayCandidate)'),
    fixture().currentSource.replace('EW-RS-077:','EW-RS-078:')]){
    assert.throws(()=>validateRs076SourceRequalification({...fixture(),currentSource}));
  }
});

test('rejects a different frozen input pin even when a certificate says PASS',()=>{
  const input=fixture();input.expectedOriginalSha256=repairedHash;
  assert.throws(()=>validateRs076SourceRequalification(input));
});

const certificateMutations=[
  c=>{c.schema='other';},c=>{c.status='PENDING';},c=>{c.transformation='ANY_REPAIR';},
  c=>{c.originalSource.commit=repairedCommit;},c=>{c.originalSource.sha256=repairedHash;},
  c=>{c.repairedSource.commit=originalCommit;},c=>{c.repairedSource.sha256=originalHash;},
  c=>{c.evidence.commit=repairedCommit;},c=>{c.evidence.sha256=originalHash;},
  c=>{c.fullReplay.status='RUNNING';},c=>{c.fullReplay.sourceCommit=originalCommit;},
  c=>{c.fullReplay.evidenceSha256=originalHash;},c=>{delete c.fullReplay;},
  c=>{c.fullReplay.runUrl='https://example.com/PASS';}
];
test('rejects unbound or incomplete certificate attestations',()=>{
  for(const mutate of certificateMutations){const input=fixture();mutate(input.certificate);
    assert.throws(()=>validateRs076SourceRequalification(input));}
});

test('repository wrapper reads the exact anchored blobs and current runner/evidence',()=>{
  const {certificate,expectedOriginalSha256}=fixture();
  assert.equal(verifyRs076SourceRequalificationFromRepository({repositoryRoot,certificate,expectedOriginalSha256}).status,'PASS');
});

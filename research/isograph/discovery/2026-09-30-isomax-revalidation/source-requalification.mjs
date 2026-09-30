import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';

const dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
export const RS076_REQUALIFICATION=Object.freeze({
  transformation:'RS076_ALL_GRID_PREPARE_THEN_REPLAY_V1',
  sourcePath:dir+'run-ooo-sign-channel-coupling.mjs',
  evidencePath:dir+'OOO_SIGN_CHANNEL_COUPLING_0_1.json',
  originalCommit:'3173aca8669c85ad7d522fa0f44bb6736e2dcc40',
  originalSha256:'1b2ecef9547ec159d2a8510e00a5d6cdb29f84b2c87463156a9d9656f026d5e8',
  repairedCommit:'c04de18a91ccdd3fbf4c25087999d7c05b6c90f6',
  repairedSha256:'96f62e24464550018728a06a847c398084fa83efd489a7bb5140baa00b9d030b',
  evidenceCommit:'a4c4c3731f580a27ba7420cc63f0188b340923a3',
  evidenceSha256:'9e26e7a113e30456c871ff5c59a9759a721504f1794faa5c686160ecf4b7e413'
});
const anchor=RS076_REQUALIFICATION;
function lf(text){assert.equal(typeof text,'string');return text.replace(/\r\n/g,'\n');}
const hash=text=>createHash('sha256').update(lf(text)).digest('hex');

function replaceOnce(text,before,after){
  const start=text.indexOf(before);
  assert.ok(start>=0&&text.indexOf(before,start+before.length)<0,
    'RS076 documented source rewrite must match exactly once');
  return text.slice(0,start)+after+text.slice(start+before.length);
}

// This is an exact source transformation, not a semantic equivalence heuristic.
// Everything outside this one nested audit must remain byte-identical in LF.
function repairedSourceFromOriginal(original){
  const begin='    function oooSixBucketFamilySaturationAudit(){';
  const end='    const sixBucketFamilySaturation=oooSixBucketFamilySaturationAudit();';
  const start=original.indexOf(begin),stop=original.indexOf(end,start);
  assert.ok(start>=0&&stop>start,'RS076 nested audit boundaries missing');
  assert.equal(original.indexOf(begin,start+begin.length),-1);
  assert.equal(original.indexOf(end,stop+end.length),-1);
  let block=original.slice(start,stop);
  block=replaceOnce(block,
    '      function auditCandidate(candidate){',
    '      function prepareCandidate(candidate){');
  block=replaceOnce(block,
    "        assert.ok(clip3&&clip3.exactScalarFactorization,'EW-RS-076 uniform CLIP3 control missing');",
    "        assert.ok(clip3,'EW-RS-076 uniform CLIP3 structural control missing');");
  block=replaceOnce(block,
    '        const equationPivots=new Map();',
    `        return {candidate:{...candidate},featureKeys,structuralRows,basisDependencyIndices,
          imageRank,rankDifferenceVsUniformClip3,factorsThroughUniformClip3,kernelDimensionRelativeToClip3};
      }

      function replayCandidate(prepared){
        const {candidate,featureKeys,structuralRows,basisDependencyIndices,
          imageRank,rankDifferenceVsUniformClip3,factorsThroughUniformClip3,kernelDimensionRelativeToClip3}=prepared;
        assert.ok(sixBucketCountQuotient.audits.find(x=>x.mode==='BUCKET_CLIP3')?.exactScalarFactorization,
          'EW-RS-076 uniform CLIP3 scalar control failure');
        const equationPivots=new Map();`);
  block=replaceOnce(block,
    '        audits:FAMILY_SATURATION_GRID.map(auditCandidate)',
    '        audits:freezeGridThenReplay(FAMILY_SATURATION_GRID,prepareCandidate,replayCandidate)');
  return original.slice(0,start)+block+original.slice(stop);
}

/**
 * Verify the sole documented exception to the RS079 current-runner input pin.
 * This preserves the historical pin; it does not relabel the original replay
 * as independent or historically frozen. No other file/hash exception exists.
 *
 * fullReplay is an execution attestation issued only after the recorded run
 * succeeds. Local byte checks cannot prove that a workflow was executed. The
 * caller must validate the actual run before issuing the certificate; this
 * helper neither queries GitHub nor treats a URL as independent execution proof.
 */
export function validateRs076SourceRequalification({certificate,expectedOriginalSha256,
  originalSource,repairedCommitSource,currentSource,pinnedEvidence,currentEvidence}){
  assert.equal(expectedOriginalSha256,anchor.originalSha256,'unrecognized historical input pin');
  assert.ok(certificate&&typeof certificate==='object','RS076 requalification certificate required');
  assert.equal(certificate.schema,'connect4.isomax.rs076_source_requalification.v1');
  assert.equal(certificate.status,'PASS','RS076 requalification is not complete');
  assert.equal(certificate.transformation,anchor.transformation);
  assert.deepEqual(certificate.originalSource,{commit:anchor.originalCommit,sha256:anchor.originalSha256});
  assert.deepEqual(certificate.repairedSource,{commit:anchor.repairedCommit,sha256:anchor.repairedSha256});
  assert.deepEqual(certificate.evidence,{commit:anchor.evidenceCommit,sha256:anchor.evidenceSha256});
  assert.ok(certificate.fullReplay,'full repaired replay attestation required');
  assert.equal(certificate.fullReplay.status,'PASS','full repaired replay has not passed');
  assert.equal(certificate.fullReplay.sourceCommit,anchor.repairedCommit);
  assert.equal(certificate.fullReplay.evidenceSha256,anchor.evidenceSha256);
  assert.equal(typeof certificate.fullReplay.runUrl,'string');
  assert.match(certificate.fullReplay.runUrl,/^https:\/\/github\.com\/iteathen\/Connect4\/actions\/runs\/[1-9][0-9]*$/);

  assert.equal(hash(originalSource),anchor.originalSha256,'original runner hash drift');
  const expected=repairedSourceFromOriginal(lf(originalSource));
  assert.equal(hash(expected),anchor.repairedSha256,'documented transformation hash drift');
  assert.ok(lf(repairedCommitSource)===expected,'committed repair contains undocumented source changes');
  assert.ok(lf(currentSource)===expected,'current runner is not exactly the documented RS076 repair');
  assert.equal(hash(pinnedEvidence),anchor.evidenceSha256,'pinned full scientific evidence drift');
  assert.equal(hash(currentEvidence),anchor.evidenceSha256,'current full scientific evidence drift');
  assert.ok(lf(currentEvidence)===lf(pinnedEvidence),'full scientific evidence is not LF byte-identical');
  return Object.freeze({status:'PASS',transformation:anchor.transformation,
    originalSha256:anchor.originalSha256,repairedSha256:anchor.repairedSha256,
    evidenceSha256:anchor.evidenceSha256,executionAttestation:certificate.fullReplay.runUrl,
    scope:'exact RS076 source rewrite and LF byte-identical full evidence; execution attested separately'});
}

// All paths and Git objects are fixed anchors, never taken from the certificate.
// This wrapper is read-only and leaves every historical snapshot untouched.
export function verifyRs076SourceRequalificationFromRepository({repositoryRoot,certificate,expectedOriginalSha256}){
  const git=args=>execFileSync('git',args,{cwd:repositoryRoot,encoding:'utf8',maxBuffer:8*1024*1024});
  const blob=(commit,path)=>git(['show',commit+':'+path]);
  git(['merge-base','--is-ancestor',anchor.originalCommit,anchor.repairedCommit]);
  git(['merge-base','--is-ancestor',anchor.evidenceCommit,anchor.repairedCommit]);
  return validateRs076SourceRequalification({certificate,expectedOriginalSha256,
    originalSource:blob(anchor.originalCommit,anchor.sourcePath),
    repairedCommitSource:blob(anchor.repairedCommit,anchor.sourcePath),
    currentSource:readFileSync(join(repositoryRoot,anchor.sourcePath),'utf8'),
    pinnedEvidence:blob(anchor.evidenceCommit,anchor.evidencePath),
    currentEvidence:readFileSync(join(repositoryRoot,anchor.evidencePath),'utf8')});
}

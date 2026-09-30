// Reproducible adaptation from the immutable phase-1 source checkpoint.
// Writes only this phase-2 source directory; never enumerates or solves a board.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../../..');
const sourceCommit='b24da724b7c628f36dc33fdd8fe73e99a1bcd620',prefix='research/isograph/discovery/2026-09-30-isomax-revalidation/';
const read=file=>execFileSync('git',['show',sourceCommit+':'+prefix+file],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n');
const hash=s=>createHash('sha256').update(s).digest('hex');
const write=(file,text)=>fs.writeFileSync(path.join(here,file),text);
const manifest=[];
const replace=(s,before,after)=>{assert.equal(s.split(before).length,2,'exact phase-2 adaptation anchor missing/duplicated');return s.replace(before,after);};
for(const file of ['fresh-polynomial.mjs','fresh-io.mjs','fresh-polynomial.test.mjs','fresh-worker.mjs','fresh-run.mjs','fresh-oracle-adapter.mjs']){
  const original=read(file);let s=original;const changes=[];
  if(file==='fresh-polynomial.test.mjs'){s=replace(s,"['3x7-k4','7x3-k4']","['4x6-k3','3x8-k3']");s=replace(s,'[[3,6,4],[5,3,4],[6,3,3],[6,3,4],[4,5,4],[7,6,4]]','[[3,6,4],[5,3,4],[6,3,3],[6,3,4],[4,5,4],[7,6,4],[3,7,4],[7,3,4]]');changes.push('phase-2 allowlist expectations; phase-1 boards additionally rejected');}
  if(file==='fresh-worker.mjs'){s=replace(s,"path.resolve(here,'../../../..')","path.resolve(here,'../../../../..')");changes.push('one deeper directory: repository root');}
  if(file==='fresh-oracle-adapter.mjs'){
    assert.equal(s.split("['3x7-k4','7x3-k4']").length,3);s=s.replaceAll("['3x7-k4','7x3-k4']","['4x6-k3','3x8-k3']");
    s=replace(s,"new URL('../../../../',import.meta.url)","new URL('../../../../../',import.meta.url)");
    s=replace(s,"export const ADAPTED_SHA256=createHash('sha256').update(source).digest('hex');","source+='\\n//# sourceURL=connect4-fresh-phase2-oracle.mjs\\n';\nexport const ADAPTED_SHA256=createHash('sha256').update(source).digest('hex');");
    changes.push('fresh-only phase-2 allowlist','one deeper directory: repository root','readable adapted sourceURL before adapted-source hash');
  }
  if(file==='fresh-run.mjs'){
    s=replace(s,"import assert from 'node:assert/strict';","import assert from 'node:assert/strict';\nimport {createHash} from 'node:crypto';");
    s=replace(s,"const campaignUsed=w.candidateOrder.reduce(","const inheritedElapsed=w.inheritedCampaign.elapsedMs;\nassert.equal(inheritedElapsed,w.inheritedCampaign.ledgers.reduce((n,x)=>n+x.elapsedMs,0),'Inherited campaign sum mismatch');\nfor(const item of w.inheritedCampaign.ledgers){const bytes=fs.readFileSync(path.resolve(here,item.relativePath),'utf8').replace(/\\r\\n/g,'\\n');assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256Utf8Lf,'Phase-1 ledger changed: freeze a new budget record instead of resetting elapsed');}\nconst campaignUsed=inheritedElapsed+w.candidateOrder.reduce(");
    changes.push('phase-1 elapsed included in campaign exhaustion check and hard supervisor timeout','hash-check original phase-1 ledger metadata');
  }
  write(file,s);manifest.push({file,sourceCommit,sourcePath:prefix+file,sourceSha256Utf8Lf:hash(original),phase2Sha256Utf8Lf:hash(s),changes,semanticsUnchanged:!['fresh-oracle-adapter.mjs','fresh-run.mjs'].includes(file)});
}
const warrant=JSON.parse(read('FRESH_OOO_WARRANT.json'));
const ledgers=['3x7-k4','7x3-k4'].map(label=>{const file='fresh-'+label+'/fresh-resource-ledger.json',text=read(file),data=JSON.parse(text);return {label,relativePath:'../'+file,sourceCommit,sha256Utf8Lf:hash(text),elapsedMs:data.elapsedMs,status:data.status};});
const elapsedMs=ledgers.reduce((n,x)=>n+x.elapsedMs,0);
warrant.schema='connect4.isomax.fresh_ooo_warrant.v2';warrant.id='FRESH-OOO-REVALIDATION-2026-09-30-PHASE2';
warrant.status='FROZEN_PHASE2_CONTINUATION_BEFORE_PREPARATION';warrant.candidateOrder=['4x6-k3','3x8-k3'];
warrant.excludedPriorExposure.push('3x7-k4');warrant.excludedResourceCensored=['7x3-k4'];
warrant.inheritedCampaign={sourceCommit,originalCampaignWallMs:warrant.caps.campaignWallMs,elapsedMs,remainingAtFreezeMs:warrant.caps.campaignWallMs-elapsedMs,ledgers,policy:'Every phase-2 invocation adds this frozen phase-1 total and all phase-2 carrier ledgers; the original 45-minute budget is never reset.'};
warrant.phase1Disposition={primary:{label:'3x7-k4',status:'SCALAR_OOO_VACUOUS',interpretation:'Affine scalar exactness is a vacuous full-OOO control, not non-affine qualification.'},backup:{label:'7x3-k4',status:'RESOURCE_CENSORED',interpretation:'2m reachable-state cap during structural enumeration; no scalar replay.'},evidenceSource:'Root-verified phase-1 dispositions at '+sourceCommit,phase1Immutable:true};
warrant.freshnessEvidence='../FRESH_EXTENSION_METADATA.json';warrant.extensionScope='Same absolute-owner repaired P/O and full OOO family; continuation of existing plan, no new feature hypothesis.';
write('FRESH_OOO_WARRANT.json',JSON.stringify(warrant,null,2)+'\n');
write('FRESH_PHASE2_ADAPTATION.json',JSON.stringify({schema:'fresh.phase2.source_adaptation.v1',sourceCommit,sourceHashConvention:'UTF8_LF',phase1Mutated:false,newBoardEnumeration:false,newScalarReplay:false,files:manifest,warrant:{sourceSha256Utf8Lf:hash(read('FRESH_OOO_WARRANT.json')),phase2Sha256Utf8Lf:hash(JSON.stringify(warrant,null,2)+'\n')},inheritedElapsedMs:elapsedMs,remainingCampaignMs:warrant.caps.campaignWallMs-elapsedMs},null,2)+'\n');
console.log(JSON.stringify({files:manifest.length,inheritedElapsedMs:elapsedMs,remainingCampaignMs:warrant.caps.campaignWallMs-elapsedMs,newBoardEnumeration:false,newScalarReplay:false}));

import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {replayRows} from './ooo-joint-da-scalar-lib.mjs';
const base=new URL('.',import.meta.url),dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024});
const structureFile='OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json';
const canonical=s=>s.replace(/\r\n/g,'\n'),hash=s=>createHash('sha256').update(canonical(s)).digest('hex');
const structureText=canonical(fs.readFileSync(new URL(structureFile,base),'utf8'));
assert.equal(structureText,git(['show','HEAD:'+dir+structureFile]),'structure must be committed before replay');
const structure=JSON.parse(structureText);
for(const [f,h] of Object.entries(structure.inputSha256))assert.equal(hash(fs.readFileSync(new URL(f,base),'utf8')),h,'input drift '+f);
const sourceEvidenceCommit='a4c4c3731f580a27ba7420cc63f0188b340923a3';
const scalarText=git(['show',sourceEvidenceCommit+':'+dir+'OOO_SIGN_CHANNEL_COUPLING_0_1.json']);
const scalarSource=JSON.parse(scalarText);
const cases=structure.cases.map(({source,candidates})=>{
 const prior=scalarSource.cases.find(c=>c.label===source.label).decoder.matchedDegree2DependencyQuotient;
 assert.deepEqual(source.dependencies,prior.dependencies.map(d=>({dependencyIndex:d.dependencyIndex,sourceSignature:d.sourceSignature,oooResidue:d.oooResidue})));
 const scalarCodes=prior.dependencies.map(d=>d.scalarCode);
 const audits=candidates.map(p=>({id:p.candidate.id,featureKeyCount:p.featureKeys.length,imageRank:p.imageRank,
  kernelDimensionRelativeToSeparated:candidates.at(-1).imageRank-p.imageRank,...replayRows(p,scalarCodes)}));
 return {label:source.label,scalarCodes,audits};
});
const out={schema:'connect4.isomax.joint_da_scalar_result.v1',warrant:'EW-RS-079',structureCommit:git(['rev-parse','HEAD']).trim(),structureSha256:hash(structureText),sourceEvidenceCommit,scalarSourceSha256:hash(scalarText),cases,holdouts:structure.holdouts};
fs.writeFileSync(new URL('OOO_JOINT_DA_SCALAR_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(cases.map(c=>({label:c.label,audits:c.audits})),null,2));

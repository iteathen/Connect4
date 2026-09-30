import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {replayRows} from './ooo-joint-da-scalar-lib.mjs';
const base=new URL('.',import.meta.url),dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const read=f=>fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n'),hash=s=>createHash('sha256').update(s).digest('hex'),git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024});
const text=read('OOO_CONTEXTUAL_TRIANGLE_STRUCTURE_0_1.json'),s=JSON.parse(text);assert.equal(text,git(['show','HEAD:'+dir+'OOO_CONTEXTUAL_TRIANGLE_STRUCTURE_0_1.json']));
for(const [f,h] of Object.entries(s.inputSha256))assert.equal(hash(read(f)),h);
const source=JSON.parse(read('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json')),sourceEvidenceCommit='a4c4c3731f580a27ba7420cc63f0188b340923a3',pinned=JSON.parse(git(['show',sourceEvidenceCommit+':'+dir+'OOO_SIGN_CHANNEL_COUPLING_0_1.json']));
const cases=s.cases.map((c,ci)=>{
 const deps=pinned.cases.find(x=>x.label===c.label).decoder.matchedDegree2DependencyQuotient.dependencies;
 assert.deepEqual(source.cases[ci].source.dependencies,deps.map(d=>({dependencyIndex:d.dependencyIndex,sourceSignature:d.sourceSignature,oooResidue:d.oooResidue})));
 const scalarCodes=deps.map(d=>d.scalarCode),defect=d=>{const codes=d.dependencyCombinations.map(row=>row.reduce((v,i)=>v^scalarCodes[i],0));return {dimension:d.dimension,codes,scalarImageDimension:Math.min(2,new Set(codes.filter(x=>x)).size)};};
 return {label:c.label,scalarCodes,local:{imageRank:c.local.imageRank,...replayRows(c.local,scalarCodes)},pooledDefect:defect(c.pooledDefect),localDefect:defect(c.localDefect)};
});
const out={schema:'connect4.isomax.contextual_triangle_result.v1',warrant:'EW-RS-081',structureCommit:git(['rev-parse','HEAD']).trim(),structureSha256:hash(text),sourceEvidenceCommit,cases,holdouts:s.holdouts};fs.writeFileSync(new URL('OOO_CONTEXTUAL_TRIANGLE_0_1.json',base),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(cases.map(({scalarCodes,...rest})=>rest),null,2));

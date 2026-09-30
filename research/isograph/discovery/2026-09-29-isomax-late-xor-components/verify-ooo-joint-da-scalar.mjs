import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {JOINT_DA_CANDIDATES,jointTriangleKey} from './ooo-joint-da-scalar-lib.mjs';
const base=new URL('.',import.meta.url),dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const read=f=>fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n');
const hash=s=>createHash('sha256').update(s).digest('hex');
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024});
const raw=JSON.parse(read('OOO_JOINT_DA_SCALAR_0_1.json'));
const structuralText=read('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json'),structure=JSON.parse(structuralText);
assert.equal(raw.warrant,'EW-RS-079');assert.equal(structure.warrant,'EW-RS-079');
assert.equal(structure.newScalarReplay,false);
assert.equal(raw.structureSha256,hash(structuralText));
assert.equal(structuralText,git(['show',raw.structureCommit+':'+dir+'OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json']));
git(['merge-base','--is-ancestor',structure.sourceCommit,raw.structureCommit]);
for(const [f,h] of Object.entries(structure.inputSha256)){
 assert.equal(hash(read(f)),h,'current input drift '+f);
 assert.equal(hash(git(['show',structure.sourceCommit+':'+dir+f])),h,'pinned input drift '+f);
}
const priorText=git(['show',raw.sourceEvidenceCommit+':'+dir+'OOO_SIGN_CHANNEL_COUPLING_0_1.json']);
assert.equal(hash(priorText),raw.scalarSourceSha256);
const prior=JSON.parse(priorText),span=codes=>{const n=new Set(codes.filter(x=>x)).size;return n?Math.min(n,2):0;};
const bits=row=>row.reduce((n,i)=>n^(1n<<BigInt(i)),0n),high=n=>n.toString(2).length-1;
assert.deepEqual(raw.cases.map(c=>c.label),['6x3-k3','4x5-k4','6x3-k4']);
assert.deepEqual(structure.cases.map(c=>c.source.label),raw.cases.map(c=>c.label));
const summaries=[];
for(let ci=0;ci<3;ci++){
 const {source,candidates}=structure.cases[ci],r=raw.cases[ci];
 const old=prior.cases.find(c=>c.label===r.label).decoder;
 assert.deepEqual(source.dependencies,old.matchedDegree2DependencyQuotient.dependencies.map(d=>({dependencyIndex:d.dependencyIndex,sourceSignature:d.sourceSignature,oooResidue:d.oooResidue})));
 assert.deepEqual(r.scalarCodes,old.matchedDegree2DependencyQuotient.dependencies.map(d=>d.scalarCode));
 assert.deepEqual(candidates.map(p=>p.candidate),JOINT_DA_CANDIDATES);
 assert.deepEqual(r.audits.map(a=>a.id),JOINT_DA_CANDIDATES.map(c=>c.id));
 for(let k=0;k<candidates.length;k++){
  const p=candidates[k],a=r.audits[k],keys=new Map(source.triples.map(([i,v])=>[i,jointTriangleKey(v,p.candidate)]));
  assert.equal(keys.size,source.triples.length);
  assert.deepEqual(p.featureKeys,[...new Set(keys.values())].sort());
  const features=new Map(p.featureKeys.map((key,i)=>[key,i]));
  const rows=source.dependencies.map(dep=>dep.oooResidue.reduce((mask,i)=>{
   assert.ok(keys.has(i));return mask^(1n<<BigInt(features.get(keys.get(i))));
  },0n));
  assert.deepEqual(rows,p.structuralRows.map(bits));
  const pivots=new Map(),basis=[];let contradictions=0,zeros=0;
  rows.forEach((input,i)=>{
   let row=input,code=r.scalarCodes[i];if(row===0n&&code!==0)zeros++;
   while(row!==0n){const bit=high(row),old=pivots.get(bit);if(!old){pivots.set(bit,{row,code});basis.push(i);return;}row^=old.row;code^=old.code;}
   if(code!==0)contradictions++;
  });
  assert.deepEqual(p.basisDependencyIndices,basis);
  assert.equal(p.imageRank,pivots.size);assert.equal(a.imageRank,pivots.size);
  assert.equal(a.featureKeyCount,p.featureKeys.length);
  assert.equal(a.kernelDimensionRelativeToSeparated,candidates.at(-1).imageRank-pivots.size);
  assert.equal(a.contradictions,contradictions);assert.equal(a.zeroStructuralNonzeroScalar,zeros);
  assert.equal(a.scalarDependencyImageDimension,span(r.scalarCodes));
  assert.equal(a.scalarImageDimensionOnBasis,span(basis.map(i=>r.scalarCodes[i])));
  assert.equal(a.scalarDependencyImageDimension,[1,2,2][ci]);
  assert.equal(a.exactScalarFactorization,contradictions===0&&zeros===0&&a.scalarImageDimensionOnBasis===a.scalarDependencyImageDimension);
  if(contradictions){
   assert.ok(a.firstContradiction);
   let row=0n,code=0;for(const i of a.firstContradiction.dependencyIndices){assert.ok(i>=0&&i<rows.length);row^=rows[i];code^=r.scalarCodes[i];}
   assert.equal(row,0n);assert.notEqual(code,0);assert.equal(code,a.firstContradiction.reducedCode);
  }else assert.equal(a.firstContradiction,null);
  if(k>=2){
   const c=p.candidate,control=old.oooSignChannelCoupling.audits.find(x=>x.C===c.C&&x.D===c.D&&x.A===c.A);
   assert.ok(control);assert.equal(a.imageRank,control.imageRank);assert.equal(a.exactScalarFactorization,true);
  }
 }
 summaries.push({label:r.label,audits:r.audits.map(a=>({id:a.id,imageRank:a.imageRank,contradictions:a.contradictions,exactScalarFactorization:a.exactScalarFactorization}))});
}
assert.equal(raw.holdouts.sealed,true);
const out={schema:'connect4.isomax.joint_da_scalar_verify.v1',warrant:'EW-RS-079',status:'PASS',method:'independent BigInt row reconstruction and elimination; canonical pair/triangle maps shared',cases:summaries,holdouts:raw.holdouts};
fs.writeFileSync(new URL('OOO_JOINT_DA_SCALAR_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));

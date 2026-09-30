import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {JOINT_DA_CANDIDATES,jointTriangleKey} from './ooo-joint-da-scalar-lib.mjs';
const base=new URL('.',import.meta.url),dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const read=f=>fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024});
const text=read('OOO_COMMON_CARRIER_LEVEL_STRUCTURE_0_1.json'),s=JSON.parse(text),r=JSON.parse(read('OOO_COMMON_CARRIER_LEVEL_0_1.json'));
const sourceText=read('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json'),source=JSON.parse(sourceText);
assert.equal(s.warrant,'EW-RS-080');assert.equal(r.warrant,'EW-RS-080');assert.equal(s.newScalarReplay,false);
assert.equal(hash(sourceText),s.sourceStructureSha256);assert.equal(hash(text),r.structureSha256);
assert.equal(text,git(['show',r.structureCommit+':'+dir+'OOO_COMMON_CARRIER_LEVEL_STRUCTURE_0_1.json']));
git(['merge-base','--is-ancestor',s.sourceCommit,r.structureCommit]);
for(const [f,h] of Object.entries(s.inputSha256)){assert.equal(hash(read(f)),h);assert.equal(hash(git(['show',s.sourceCommit+':'+dir+f])),h);}
const prior=JSON.parse(git(['show',r.sourceEvidenceCommit+':'+dir+'OOO_SIGN_CHANNEL_COUPLING_0_1.json']));
const catalog=[...new Set(source.cases.flatMap(c=>c.source.triples.map(([,v])=>JSON.stringify([...v].sort()))))].sort();assert.deepEqual(s.catalog,catalog);
const columns=JOINT_DA_CANDIDATES.slice(2,6).map(c=>catalog.map(key=>jointTriangleKey(JSON.parse(key),c)));assert.deepEqual(s.columns,columns);
// Independent breadth/depth traversal of the equality graph.
const fibers=columns.map(col=>{const m=new Map();col.forEach((key,i)=>{if(!m.has(key))m.set(key,[]);m.get(key).push(i);});return m;});
const labels=Array(catalog.length).fill(-1);
for(let i=0;i<labels.length;i++)if(labels[i]<0){const todo=[i];labels[i]=i;while(todo.length){const u=todo.pop();for(let k=0;k<4;k++)for(const v of fibers[k].get(columns[k][u]))if(labels[v]<0){labels[v]=i;todo.push(v);}}}
assert.deepEqual(s.labels,labels);assert.equal(s.commonTriangleClasses,new Set(labels).size);
const mask=row=>row.reduce((v,i)=>v^(1n<<BigInt(i)),0n),high=v=>v.toString(2).length-1;
function rank(rows){const p=new Map();for(let x of rows){while(x){const b=high(x);if(!p.has(b)){p.set(b,x);break;}x^=p.get(b);}}return p.size;}
const span=codes=>Math.min(2,new Set(codes.filter(x=>x)).size);
assert.deepEqual(s.cases.map(c=>c.label),['6x3-k3','4x5-k4','6x3-k4']);assert.deepEqual(r.cases.map(c=>c.label),s.cases.map(c=>c.label));
const report=[];
for(let ci=0;ci<3;ci++){
 const c=s.cases[ci],raw=r.cases[ci],src=source.cases[ci],deps=prior.cases.find(c=>c.label===raw.label).decoder.matchedDegree2DependencyQuotient.dependencies;
 assert.deepEqual(src.source.dependencies,deps.map(d=>({dependencyIndex:d.dependencyIndex,sourceSignature:d.sourceSignature,oooResidue:d.oooResidue})));
 assert.deepEqual(raw.scalarCodes,deps.map(d=>d.scalarCode));
 assert.deepEqual(c.candidates.map(p=>p.id),['TRIANGLE_COMMON_OBSERVED_UNION','DEPENDENCY_COMMON_LINEAR']);assert.deepEqual(raw.audits.map(a=>a.id),c.candidates.map(p=>p.id));
 const [tri,lin]=c.candidates;
 const idx=new Map(catalog.map((key,i)=>[key,i]));
 const tripleLabels=src.source.triples.map(([i,v])=>[i,labels[idx.get(JSON.stringify([...v].sort()))]]);assert.deepEqual(tri.tripleLabels,tripleLabels);
 const feat=[...new Set(tripleLabels.map(([,l])=>l))].sort((a,b)=>a-b);assert.deepEqual(tri.featureKeys,feat);
 const triMap=new Map(tripleLabels);
 const triRows=src.source.dependencies.map(d=>d.oooResidue.reduce((v,i)=>v^(1n<<BigInt(feat.indexOf(triMap.get(i)))),0n));
 assert.deepEqual(tri.structuralRows.map(mask),triRows);
 const m=src.source.dependencies.length,controls=src.candidates.slice(2,6);
 assert.equal(lin.kernels.length,4);
 for(let k=0;k<4;k++){
  const rows=controls[k].structuralRows.map(mask),kernel=lin.kernels[k];
  assert.equal(rank(kernel.map(mask)),m-rank(rows));assert.equal(kernel.length,m-rank(rows));
  for(const generator of kernel)assert.equal(generator.reduce((v,i)=>v^rows[i],0n),0n);
 }
 const all=lin.kernels.flat().map(mask),common=lin.commonKernel.map(mask),kr=rank(all);
 assert.equal(common.length,kr);assert.equal(rank(common),kr);assert.equal(rank([...common,...all]),kr);
 const qrows=lin.structuralRows.map(mask);assert.equal(qrows.length,m);assert.equal(rank(qrows),m-kr);
 for(const generator of lin.commonKernel)assert.equal(generator.reduce((v,i)=>v^qrows[i],0n),0n);
 const pivots=lin.commonKernel.map(row=>row.at(-1));
 assert.equal(new Set(pivots).size,pivots.length);
 for(const row of lin.commonKernel)assert.deepEqual(row.filter(i=>pivots.includes(i)),[row.at(-1)]);
 const free=Array.from({length:m},(_,i)=>i).filter(i=>!pivots.includes(i));assert.deepEqual(lin.freeCoordinates,free);
 assert.deepEqual(lin.featureKeys,free.map(i=>'DEPENDENCY_FREE_'+i));
 for(let i=0;i<m;i++){
  let v=1n<<BigInt(i);for(let j=common.length-1;j>=0;j--)if(v&(1n<<BigInt(pivots[j])))v^=common[j];
  const expected=free.reduce((n,index,j)=>n|((v&(1n<<BigInt(index)))?(1n<<BigInt(j)):0n),0n);assert.equal(qrows[i],expected);
 }
 for(let k=0;k<2;k++){
  const p=c.candidates[k],a=raw.audits[k],rows=p.structuralRows.map(mask),piv=new Map(),basis=[];let contradictions=0,zeros=0;
  rows.forEach((input,i)=>{let v=input,code=raw.scalarCodes[i];if(v===0n&&code)zeros++;while(v){const b=high(v),old=piv.get(b);if(!old){piv.set(b,{v,code});basis.push(i);return;}v^=old.v;code^=old.code;}if(code)contradictions++;});
  assert.deepEqual(p.basisDependencyIndices,basis);assert.equal(p.imageRank,piv.size);assert.equal(a.imageRank,piv.size);
  assert.equal(a.contradictions,contradictions);assert.equal(a.zeroStructuralNonzeroScalar,zeros);
  assert.equal(a.scalarDependencyImageDimension,[1,2,2][ci]);assert.equal(a.scalarImageDimensionOnBasis,span(basis.map(i=>raw.scalarCodes[i])));
  assert.equal(a.exactScalarFactorization,!contradictions&&!zeros&&a.scalarDependencyImageDimension===a.scalarImageDimensionOnBasis);
  if(contradictions){const cert=a.firstContradiction;assert.equal(cert.dependencyIndices.reduce((v,i)=>v^rows[i],0n),0n);assert.equal(cert.dependencyIndices.reduce((v,i)=>v^raw.scalarCodes[i],0),cert.reducedCode);assert.notEqual(cert.reducedCode,0);}else assert.equal(a.firstContradiction,null);
  if(k===1)assert.equal(a.exactScalarFactorization,true,'conditional kernel-sum theorem control');
 }
 report.push({label:c.label,audits:raw.audits});
}
assert.equal(r.holdouts.sealed,true);
const out={schema:'connect4.isomax.common_carrier_level_verify.v1',warrant:'EW-RS-080',status:'PASS',method:'independent equality-graph traversal and BigInt kernel span, quotient, row and scalar verification',cases:report,holdouts:r.holdouts};
fs.writeFileSync(new URL('OOO_COMMON_CARRIER_LEVEL_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));

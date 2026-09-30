import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {JOINT_DA_CANDIDATES,jointTriangleKey} from './ooo-joint-da-scalar-lib.mjs';
const base=new URL('.',import.meta.url),dir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const read=f=>fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n'),hash=s=>createHash('sha256').update(s).digest('hex'),git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024});
const text=read('OOO_CONTEXTUAL_TRIANGLE_STRUCTURE_0_1.json'),s=JSON.parse(text),r=JSON.parse(read('OOO_CONTEXTUAL_TRIANGLE_0_1.json')),src=JSON.parse(read('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json')),prev=JSON.parse(read('OOO_COMMON_CARRIER_LEVEL_STRUCTURE_0_1.json'));
assert.equal(s.warrant,'EW-RS-081');assert.equal(r.warrant,'EW-RS-081');assert.equal(s.newScalarReplay,false);assert.equal(hash(text),r.structureSha256);assert.equal(text,git(['show',r.structureCommit+':'+dir+'OOO_CONTEXTUAL_TRIANGLE_STRUCTURE_0_1.json']));
git(['merge-base','--is-ancestor',s.sourceCommit,r.structureCommit]);for(const [f,h]of Object.entries(s.inputSha256)){assert.equal(hash(read(f)),h);assert.equal(hash(git(['show',s.sourceCommit+':'+dir+f])),h);}
const pinned=JSON.parse(git(['show',r.sourceEvidenceCommit+':'+dir+'OOO_SIGN_CHANNEL_COUPLING_0_1.json']));
const mask=row=>row.reduce((v,i)=>v^(1n<<BigInt(i)),0n),hi=v=>v.toString(2).length-1;
function rank(rows){const p=new Map();for(let v of rows)while(v){const b=hi(v);if(!p.has(b)){p.set(b,v);break;}v^=p.get(b);}return p.size;}
assert.deepEqual(s.cases.map(c=>c.label),['6x3-k3','4x5-k4','6x3-k4']);assert.deepEqual(r.cases.map(c=>c.label),s.cases.map(c=>c.label));
for(let ci=0;ci<3;ci++){
 const c=s.cases[ci],raw=r.cases[ci],source=src.cases[ci].source,local=c.local,m=source.dependencies.length;
 const deps=pinned.cases.find(x=>x.label===c.label).decoder.matchedDegree2DependencyQuotient.dependencies;
 assert.deepEqual(source.dependencies,deps.map(d=>({dependencyIndex:d.dependencyIndex,sourceSignature:d.sourceSignature,oooResidue:d.oooResidue})));assert.deepEqual(raw.scalarCodes,deps.map(d=>d.scalarCode));
 const catalog=[...new Set(source.triples.map(([,v])=>JSON.stringify([...v].sort())))].sort();assert.deepEqual(local.catalog,catalog);
 const cols=JOINT_DA_CANDIDATES.slice(2,6).map(c=>catalog.map(key=>jointTriangleKey(JSON.parse(key),c)));assert.deepEqual(local.columns,cols);
 const labels=Array(catalog.length).fill(-1);for(let i=0;i<labels.length;i++)if(labels[i]<0){const stack=[i];labels[i]=i;while(stack.length){const u=stack.pop();for(let j=0;j<labels.length;j++)if(labels[j]<0&&cols.some(col=>col[u]===col[j])){labels[j]=i;stack.push(j);}}}assert.deepEqual(local.labels,labels);
 const tlabels=source.triples.map(([i,v])=>[i,labels[catalog.indexOf(JSON.stringify([...v].sort()))]]);assert.deepEqual(local.tripleLabels,tlabels);
 const features=[...new Set(labels)].sort((a,b)=>a-b);assert.deepEqual(local.featureKeys,features);const tmap=new Map(tlabels);
 const rows=source.dependencies.map(d=>d.oooResidue.reduce((v,i)=>v^(1n<<BigInt(features.indexOf(tmap.get(i)))),0n));assert.deepEqual(local.structuralRows.map(mask),rows);
 const piv=new Map(),basis=[];let contradictions=0,zeros=0;rows.forEach((input,i)=>{let v=input,code=raw.scalarCodes[i];if(!v&&code)zeros++;while(v){const b=hi(v),old=piv.get(b);if(!old){piv.set(b,{v,code});basis.push(i);return;}v^=old.v;code^=old.code;}if(code)contradictions++;});
 assert.deepEqual(local.basisDependencyIndices,basis);assert.equal(local.imageRank,piv.size);assert.equal(raw.local.imageRank,piv.size);assert.equal(raw.local.contradictions,contradictions);assert.equal(raw.local.zeroStructuralNonzeroScalar,zeros);
 assert.equal(raw.local.scalarDependencyImageDimension,[1,2,2][ci]);assert.equal(raw.local.scalarImageDimensionOnBasis,Math.min(2,new Set(basis.map(i=>raw.scalarCodes[i]).filter(x=>x)).size));assert.equal(raw.local.exactScalarFactorization,!contradictions&&!zeros&&raw.local.scalarDependencyImageDimension===raw.local.scalarImageDimensionOnBasis);
 if(!contradictions)assert.equal(raw.local.firstContradiction,null);
 const common=prev.cases[ci].candidates[1].commonKernel,K=common.map(mask),kr=rank(K);
 for(const [name,matrix]of [['pooledDefect',prev.cases[ci].candidates[0].structuralRows.map(mask)],['localDefect',rows]]){
  const d=c[name],a=raw[name],basisMasks=d.dependencyCombinations.map(mask),expected=m-rank(matrix)-kr;
  for(const g of common)assert.equal(g.reduce((v,i)=>v^matrix[i],0n),0n);
  for(const g of d.dependencyCombinations)assert.equal(g.reduce((v,i)=>v^matrix[i],0n),0n);
  assert.equal(d.kernelDimension,m-rank(matrix));assert.equal(d.dimension,expected);assert.equal(basisMasks.length,expected);assert.equal(rank([...K,...basisMasks]),kr+expected);assert.equal(a.dimension,expected);
  const rem=d.quotientRemainders.map(mask);assert.equal(rem.length,expected);assert.equal(rank([...K,...rem]),kr+expected);
  for(let i=0;i<expected;i++)assert.equal(rank([...K,basisMasks[i]^rem[i]]),kr);
  const codes=d.dependencyCombinations.map(row=>row.reduce((v,i)=>v^raw.scalarCodes[i],0));assert.deepEqual(a.codes,codes);assert.equal(a.scalarImageDimension,Math.min(2,new Set(codes.filter(x=>x)).size));
 }
}
assert.equal(r.holdouts.sealed,true);const out={schema:'connect4.isomax.contextual_triangle_verify.v1',warrant:'EW-RS-081',status:'PASS',method:'independent graph closure, BigInt row elimination and relative-kernel span checks',cases:r.cases.map(({scalarCodes,...rest})=>rest),holdouts:r.holdouts};fs.writeFileSync(new URL('OOO_CONTEXTUAL_TRIANGLE_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));

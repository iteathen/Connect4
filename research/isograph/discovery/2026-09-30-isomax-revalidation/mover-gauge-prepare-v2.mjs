import fs from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {preparePolynomial} from './mover-polynomial-v2.mjs';
import {gaugeSignature,selectedVertex} from './mover-gauge-lib.mjs';
import {endpointGaugeTriangleKey} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-endpoint-gauge-lib.mjs';
import {capacityStarTriangleKey} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-capacity-star-lib.mjs';
import {rowBasis,kernelBasis} from '../2026-09-29-isomax-late-xor-components/ooo-common-carrier-level-lib.mjs';
const here=new URL('.',import.meta.url),read=f=>fs.readFileSync(new URL(f,here));
const hash=b=>createHash('sha256').update(b).digest('hex');
const warrant=JSON.parse(read('MOVER_GAUGE_WARRANT_0_1.json'));
const inputs={};
function pin(f){
  if(Object.hasOwn(inputs,f))return;
  const text=read(f).toString('utf8').replace(/\r\n/g,'\n');inputs[f]=hash(text);
  if(f.endsWith('.mjs'))for(const [,relative] of text.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g))pin(path.posix.normalize(path.posix.join(path.posix.dirname(f),relative)));
}
for(const f of ['MOVER_GAUGE_EXECUTION_ADAPTATION_0_2.json','MOVER_GAUGE_WARRANT_0_1.json','mover-gauge-prepare-v2.mjs','mover-gauge-replay-v2.mjs'])pin(f);
for(const label of warrant.cases){
  const [W,H]=label.split('-')[0].split('x').map(Number),file=`independent-${label}/independent-signatures.json.gz`,bytes=read(file);
  const sigs=JSON.parse(gunzipSync(bytes));
  for(const gauge of warrant.gauges){
    const output=`mover-v2-${label}-${gauge}.json.gz`;
    if(fs.existsSync(new URL(output,here))){const old=JSON.parse(gunzipSync(read(output)));assert.deepEqual(old.inputs,inputs);assert.equal(old.signatureSha256,hash(bytes));console.log('resume '+output);continue;}
    const transformed=sigs.map(s=>gaugeSignature(s,W*H,gauge));
    console.log('polynomial '+label+' '+gauge);
    const p=preparePolynomial(transformed);
    assert.equal(p.classKeys.length,sigs.length,'declared gauge must be bijective on whole-state classes');
    const triples=p.triples.map(t=>t.map(selectedVertex));
    const candidates=warrant.features.map(mode=>{
      const keys=triples.map(v=>mode==='FULL_EDGE_REVERSAL_ORBIT'?endpointGaugeTriangleKey(v,mode):capacityStarTriangleKey(v,mode));
      const used=new Set(p.dependencies.flatMap(d=>d.oooResidue));
      const featureKeys=[...new Set([...used].map(i=>keys[i]))].sort(),index=new Map(featureKeys.map((k,i)=>[k,i]));
      const rows=p.dependencies.map(d=>{const r=new Set();for(const i of d.oooResidue){const fi=index.get(keys[i]);if(!r.delete(fi))r.add(fi);}return [...r].sort((a,b)=>a-b);});
      const b=rowBasis(rows);
      return {mode,featureKeys,rows,rank:b.pivots.size,basis:b.indices,kernel:kernelBasis(rows)};
    });
    const out={status:'FROZEN_STRUCTURE_NO_NEW_SCALAR_REPLAY',label,gauge,inputs,inputHashConvention:'UTF8_LF_TRANSITIVE_LOCAL_IMPORTS; signature is binary gzip',signatureSha256:hash(bytes),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
      classKeys:p.classKeys,lowerRank:p.lowerRank,affineRank:p.affineRank,oooRank:p.oooRank,triples:p.triples,dependencies:p.dependencies,
      lowerBasisClassIndices:p.lowerBasisClassIndices,oooBasisDependencyIndices:p.oooBasisDependencyIndices,oooKernelDependencyIndices:p.oooKernelDependencyIndices,candidates};
    const legacyName=`mover-${label}-${gauge}.json.gz`;
    if(fs.existsSync(new URL(legacyName,here))){const legacy=JSON.parse(gunzipSync(read(legacyName)));const science=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!['inputs','sourceCommit'].includes(k)));assert.deepEqual(science(out),science(legacy),'scientific outputs must reproduce legacy snapshot');console.log('legacy exact '+legacyName);}
    fs.writeFileSync(new URL(output,here),gzipSync(JSON.stringify(out)));
    console.log(JSON.stringify({label,gauge,classes:p.classKeys.length,lowerRank:p.lowerRank,dependencies:p.dependencies.length,oooRank:p.oooRank,output}));
  }
}
const pooled=warrant.gauges.map(gauge=>({gauge,candidates:warrant.features.map(mode=>{
  const each=warrant.cases.map(label=>JSON.parse(gunzipSync(read(`mover-v2-${label}-${gauge}.json.gz`))).candidates.find(c=>c.mode===mode));
  const featureKeys=[...new Set(each.flatMap(c=>c.featureKeys))].sort(),index=new Map(featureKeys.map((k,i)=>[k,i]));
  const rows=each.flatMap(c=>c.rows.map(r=>r.map(i=>index.get(c.featureKeys[i])).sort((a,b)=>a-b)));
  const b=rowBasis(rows);return {mode,featureKeys,rows,rank:b.pivots.size,basis:b.indices,kernel:kernelBasis(rows)};
})}));
fs.writeFileSync(new URL('MOVER_GAUGE_POOLED_STRUCTURE_0_2.json.gz',here),gzipSync(JSON.stringify({inputs,status:'FROZEN_POOLED_CATALOG_ROWS_BASES_KERNELS_NO_NEW_SCALAR_REPLAY',pooled})));

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {selectedVertex} from './mover-gauge-lib.mjs';
import {factorization,freezeKernel} from './mover-polynomial-v2.mjs';
import {familyTriangleKey} from '../2026-09-29-isomax-late-xor-components/ooo-pair-delta-family-lib.mjs';
import {exactPairDelta} from '../2026-09-29-isomax-late-xor-components/ooo-exchange-circuit-lib.mjs';
import {POOLED_ROLE_DEPTH_MODES,pooledRoleDepthKey} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-role-depth-lib.mjs';
import {POOLED_DEPTH_INDEX_MODES,depthIndexTriangleKey} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-depth-index-lib.mjs';
import {endpointGaugeTriangleKey} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-endpoint-gauge-lib.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),prefix='research/isograph/discovery/2026-09-30-isomax-revalidation/';
const read=f=>fs.readFileSync(path.join(here,f)),hash=b=>createHash('sha256').update(b).digest('hex');
const [phase,commit]=process.argv.slice(2);assert.ok(['prepare','replay'].includes(phase));
const w=JSON.parse(read('MOVER_GAUGE_WARRANT_0_1.json'));
const modes=['EXACT_DESCRIPTOR_TRIANGLE','SELECTED_VERTEX_TRIANGLE',...['EXACT','SIGN','SIGNED_PARITY'].flatMap(x=>[x+'_ALL_DELTAS',x+'_CD_DELTAS']),...POOLED_ROLE_DEPTH_MODES.map(x=>'ROLE:'+x),...POOLED_DEPTH_INDEX_MODES.map(x=>'DEPTH:'+x),'FULL_EDGE_REVERSAL_ORBIT'];
const name='MOVER_LOSS_LOCALIZATION_STRUCTURE_0_1.json.gz';
if(phase==='prepare'){
  const pins={};function pin(f){if(pins[f])return;const s=read(f).toString('utf8').replace(/\r\n/g,'\n');pins[f]=hash(s);if(f.endsWith('.mjs'))for(const [,r] of s.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g))pin(path.posix.normalize(path.posix.join(path.posix.dirname(f),r)));}
  for(const f of ['mover-loss-localization.mjs','MOVER_LOSS_LOCALIZATION_WARRANT_0_1.json','MOVER_GAUGE_WARRANT_0_1.json'])pin(f);
  const records=[];
  for(const gauge of w.gauges)for(const label of w.cases){
    const source=`mover-v2-${label}-${gauge}.json.gz`,bytes=read(source),s=JSON.parse(gunzipSync(bytes));
    const used=[...new Set(s.dependencies.flatMap(d=>d.oooResidue))].sort((a,b)=>a-b);
    const vertices=new Map(used.map(i=>[i,s.triples[i].map(selectedVertex)]));
    for(const mode of modes){
      const key=i=>{const v=vertices.get(i);if(mode==='EXACT_DESCRIPTOR_TRIANGLE')return JSON.stringify([...s.triples[i]].sort());if(mode==='SELECTED_VERTEX_TRIANGLE')return JSON.stringify([...v].sort());if(mode.startsWith('ROLE:'))return pooledRoleDepthKey(v,mode.slice(5));if(mode.startsWith('DEPTH:'))return depthIndexTriangleKey(v,mode.slice(6));if(mode==='FULL_EDGE_REVERSAL_ORBIT')return endpointGaugeTriangleKey(v,mode);const all=mode.endsWith('_ALL_DELTAS'),encoding=mode.slice(0,-(all?'_ALL_DELTAS':'_CD_DELTAS').length);if(encoding==='EXACT')return [[0,1],[0,2],[1,2]].map(([a,b])=>{const raw=exactPairDelta(v[a],v[b]);return all?raw:raw.split(',').filter(x=>!x.startsWith('W=')).join(',')||'0';}).sort().join('|||');return familyTriangleKey(v,encoding,all?['W','C','D0','D1']:['C','D0','D1']);};
      const keys=new Map(used.map(i=>[i,key(i)])),featureKeys=[...new Set(keys.values())].sort(),index=new Map(featureKeys.map((k,i)=>[k,i]));
      const rows=s.dependencies.map(d=>{const r=new Set();for(const i of d.oooResidue){const j=index.get(keys.get(i));if(!r.delete(j))r.add(j);}return [...r].sort((a,b)=>a-b);});
      const frozen=freezeKernel(rows);
      if(mode==='EXACT_DESCRIPTOR_TRIANGLE')assert.equal(frozen.rank,s.oooRank,'exact OOO control');
      if(mode==='FULL_EDGE_REVERSAL_ORBIT'){const old=s.candidates.find(c=>c.mode===mode);assert.deepEqual(featureKeys,old.featureKeys);assert.deepEqual(rows,old.rows);assert.equal(frozen.rank,old.rank);}
      records.push({gauge,label,mode,source,sourceSha256:hash(bytes),featureKeys,rows,...frozen});
    }
    console.log('prepared '+gauge+' '+label);
  }
  const pooled=[];for(const gauge of w.gauges)for(const mode of modes){const each=w.cases.map(label=>records.find(r=>r.gauge===gauge&&r.mode===mode&&r.label===label)),featureKeys=[...new Set(each.flatMap(r=>r.featureKeys))].sort(),index=new Map(featureKeys.map((k,i)=>[k,i]));const rows=each.flatMap(r=>r.rows.map(row=>row.map(i=>index.get(r.featureKeys[i])).sort((a,b)=>a-b)));pooled.push({gauge,mode,featureKeys,rows,...freezeKernel(rows)});}
  fs.writeFileSync(path.join(here,name),gzipSync(JSON.stringify({status:'FROZEN_NO_SCALAR_REPLAY',pins,modes,records,pooled})));
}else{
  assert.ok(/^[0-9a-f]{40}$/.test(commit??''),'Explicit committed structure SHA required');
  const bytes=read(name);assert.equal(hash(bytes),hash(execFileSync('git',['show',commit+':'+prefix+name],{maxBuffer:128*1024*1024})));
  const s=JSON.parse(gunzipSync(bytes));for(const [f,h] of Object.entries(s.pins)){assert.equal(hash(read(f).toString('utf8').replace(/\r\n/g,'\n')),h);const gitPath=path.posix.normalize(prefix+f);assert.equal(hash(execFileSync('git',['show',commit+':'+gitPath],{encoding:'utf8'}).replace(/\r\n/g,'\n')),h);}
  const scalarBytes=read('MOVER_GAUGE_RESULT_0_2.json'),target=JSON.parse(scalarBytes),codes=new Map();
  for(const g of target.results)for(const c of g.cases)codes.set(g.gauge+'/'+c.label,c);
  const cases=s.records.map(r=>{const c=codes.get(r.gauge+'/'+r.label);assert.equal(c.structureSha256,r.sourceSha256);assert.equal(hash(read(r.source)),r.sourceSha256);const a=factorization(r.rows,c.scalarCodes);assert.equal(a.structuralRank,r.rank);const obstructions=r.kernel.map((k,i)=>({kernelIndex:i,scalarXor:k.reduce((v,j)=>v^c.scalarCodes[j],0)})).filter(x=>x.scalarXor);assert.equal(obstructions.length===0,a.exact);return {gauge:r.gauge,label:r.label,mode:r.mode,...a,obstructions};});
  const pooled=s.pooled.map(r=>{const c=w.cases.flatMap(label=>codes.get(r.gauge+'/'+label).scalarCodes),a=factorization(r.rows,c);assert.equal(a.structuralRank,r.rank);return {gauge:r.gauge,mode:r.mode,...a};});
  const out={status:'TRAINED_GAUGE_LOSS_LOCALIZATION_COMPLETE',structureCommit:commit,scalarSourceSha256:hash(scalarBytes),cases,pooled,rs096:'HOLD'};fs.writeFileSync(path.join(here,'MOVER_LOSS_LOCALIZATION_RESULT_0_1.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(pooled.map(({gauge,mode,structuralRank,exact,contradictions})=>({gauge,mode,structuralRank,exact,contradictions})),null,2));
}

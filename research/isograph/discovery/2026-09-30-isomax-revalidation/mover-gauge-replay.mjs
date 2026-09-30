import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gaugeSignature,moverFromSignature} from './mover-gauge-lib.mjs';
import {factorization} from './fresh-polynomial.mjs';
const here=new URL('.',import.meta.url),read=f=>fs.readFileSync(new URL(f,here));
const hash=b=>createHash('sha256').update(b).digest('hex');
const warrant=JSON.parse(read('MOVER_GAUGE_WARRANT_0_1.json'));
const structures=new Map();
const pooledName='MOVER_GAUGE_POOLED_STRUCTURE_0_1.json.gz',pooledBytes=read(pooledName);
assert.equal(hash(pooledBytes),hash(execFileSync('git',['show','HEAD:research/isograph/discovery/2026-09-30-isomax-revalidation/'+pooledName],{maxBuffer:64*1024*1024})),
  'pooled bases and kernels must be committed before replay');
const pooled=JSON.parse(gunzipSync(pooledBytes));
for(const label of warrant.cases)for(const gauge of warrant.gauges){
  const name=`mover-${label}-${gauge}.json.gz`,bytes=read(name);
  const committed=execFileSync('git',['show','HEAD:research/isograph/discovery/2026-09-30-isomax-revalidation/'+name],{maxBuffer:64*1024*1024});
  assert.equal(hash(bytes),hash(committed),'all gauge structures must be committed before replay');
  const s=JSON.parse(gunzipSync(bytes));for(const [f,h] of Object.entries(s.inputs))assert.equal(hash(read(f).toString('utf8').replace(/\r\n/g,'\n')),h,'input drift '+f);
  structures.set(label+'/'+gauge,{s,sha256:hash(bytes)});
}
const labels=new Map(),parityChecks={states:0,mismatches:0};
for(const label of warrant.cases){
  const [W,H]=label.split('-')[0].split('x').map(Number);
  const manifest=JSON.parse(read(`independent-${label}/independent-state-manifest.json`));
  const maps=new Map(warrant.gauges.map(g=>[g,new Map()]));
  for(const shard of manifest.shards){
    const bytes=read(`independent-${label}/${shard.file}`);assert.equal(hash(bytes),shard.sha256);
    for(const line of gunzipSync(bytes).toString('utf8').trimEnd().split('\n')){
      const r=JSON.parse(line);if(r.t2!=='O')continue;
      parityChecks.states++;if(moverFromSignature(r.roleCapparZoe,W*H)!==(r.rank&1))parityChecks.mismatches++;
      const u=r.wdlAbsolute*(r.rank&1?-1:1),code=u<0?0:u===0?1:2;
      for(const gauge of warrant.gauges){
        const key=JSON.stringify(gaugeSignature(r.roleCapparZoe,W*H,gauge)),m=maps.get(gauge);
        if(m.has(key))assert.equal(m.get(key),code,'normalized class loses scalar purity');else m.set(key,code);
      }
    }
  }
  assert.equal(parityChecks.mismatches,0,'mover parity does not descend as declared');
  for(const [gauge,m] of maps){
    const {s}=structures.get(label+'/'+gauge);assert.equal(m.size,s.classKeys.length);
    const codes=s.classKeys.map(k=>{assert.ok(m.has(k));return m.get(k);});
    labels.set(label+'/'+gauge,s.dependencies.map(d=>d.sourceIndices.reduce((v,i)=>v^codes[i],0)));
  }
  console.log('annotated '+label);
}
const results=warrant.gauges.map(gauge=>{
  const cases=warrant.cases.map(label=>{
    const {s,sha256}=structures.get(label+'/'+gauge),codes=labels.get(label+'/'+gauge);
    return {label,structureSha256:sha256,classes:s.classKeys.length,lowerRank:s.lowerRank,oooRank:s.oooRank,dependencies:s.dependencies.length,
      fullOoo:factorization(s.dependencies.map(d=>d.oooResidue),codes),scalarCodes:codes};
  });
  const audits=warrant.features.map(mode=>{
    const each=warrant.cases.map(label=>structures.get(label+'/'+gauge).s.candidates.find(c=>c.mode===mode));
    const featureKeys=[...new Set(each.flatMap(c=>c.featureKeys))].sort(),index=new Map(featureKeys.map((k,i)=>[k,i]));
    const rows=each.flatMap(c=>c.rows.map(r=>r.map(i=>index.get(c.featureKeys[i])).sort((a,b)=>a-b)));
    const codes=warrant.cases.flatMap(label=>labels.get(label+'/'+gauge));
    const frozen=pooled.pooled.find(g=>g.gauge===gauge).candidates.find(c=>c.mode===mode);
    assert.deepEqual(featureKeys,frozen.featureKeys);assert.deepEqual(rows,frozen.rows);
    const audit=factorization(rows,codes);assert.equal(audit.structuralRank,frozen.rank);
    return {mode,featureCount:featureKeys.length,dependencyCount:rows.length,...audit,
      perCase:each.map((c,i)=>({label:warrant.cases[i],...factorization(c.rows,labels.get(warrant.cases[i]+'/'+gauge))}))};
  });
  return {gauge,cases,audits};
});
const out={status:'BOUNDED_GAUGE_REPLAY_COMPLETE',structureCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),parityChecks,results,
  interpretation:'Recomputed D2/OOO spaces in each gauge; owner labels recanonicalized at complete descriptor level. Not fresh qualification.',rs096:'HOLD'};
fs.writeFileSync(new URL('MOVER_GAUGE_RESULT_0_1.json',here),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(results.map(g=>({gauge:g.gauge,fullOoo:g.cases.map(c=>({label:c.label,exact:c.fullOoo.exact})),audits:g.audits.map(a=>({mode:a.mode,rank:a.structuralRank,exact:a.exact,contradictions:a.contradictions}))})),null,2));

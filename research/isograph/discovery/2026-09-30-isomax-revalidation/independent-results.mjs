import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {TRAINED} from './independent-oracle.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const cases=TRAINED.map(label=>{
  const read=name=>{const file=new URL(`./independent-${label}/${name}`,import.meta.url),bytes=fs.readFileSync(file);return {file:`independent-${label}/${name}`,sha256:sha(bytes),value:JSON.parse(bytes)};};
  const comparison=read('independent-comparison.json'),summary=read('independent-summary.json'),config=read('independent-config.json'),manifest=read('independent-state-manifest.json');
  const c=comparison.value;
  assert.equal(c.qualification,'BOUNDED_STATEWISE_AND_OOO_AGREEMENT');
  assert.equal(c.phase,'COMPLETE');assert.equal(c.statewiseMatch,true);assert.equal(c.oooComparison.exactImageMatch,true);
  assert.equal(c.compared,summary.value.counts.states);assert.ok(Object.values(c.fieldMismatches).every(n=>n===0));
  assert.deepEqual(c.oooComparison.independent,c.oooComparison.reference);
  assert.equal(c.sourceIdentity.independentConfigHash,summary.value.configHash);assert.equal(summary.value.configHash,config.value.configHash);assert.equal(manifest.value.configHash,config.value.configHash);
  return {label,counts:summary.value.counts,compared:c.compared,fieldMismatches:c.fieldMismatches,ooo:c.oooComparison.independent,sourceIdentity:c.sourceIdentity,referenceDependencySha256:c.oooComparison.referenceDependencySha256,referenceSemanticTripleSha256:c.oooComparison.referenceSemanticTripleSha256,artifacts:[comparison,summary,config,manifest].map(({file,sha256})=>({file,sha256})),sourceHead:config.value.head,completed:c.completed};
});
const result={schema:1,qualification:'BOUNDED_STATEWISE_AND_OOO_AGREEMENT',discovery:'NO_NEW_DISCOVERY_REQUESTED',authorityEffect:'NONE',RS096:'HOLD',oooStatus:'PROVISIONAL',totalCompared:cases.reduce((n,c)=>n+c.compared,0),totalFieldMismatches:cases.reduce((n,c)=>n+Object.values(c.fieldMismatches).reduce((a,b)=>a+b,0),0),cases,scope:'Exactly the three trained carriers; no sealed holdout execution, inspection, or outcome inference',independence:'Separate implementation, no research-harness imports in oracle/runner; reference definitions and serializations were read. Shared RFG conventions are a contract, not independently proved truth. Comparison driver explicitly imports reference adapter.',retention:'Compact JSON summaries, configs, comparison evidence and shard manifests are durable commit candidates. Binary checkpoints and compressed state shards remain local resumable evidence with per-artifact hashes.'};
fs.writeFileSync(new URL('./INDEPENDENT_RESULTS.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({qualification:result.qualification,totalCompared:result.totalCompared,totalFieldMismatches:result.totalFieldMismatches,cases:cases.map(c=>({label:c.label,states:c.compared,oooRank:c.ooo.oooRank}))}));

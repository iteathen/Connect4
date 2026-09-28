#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root=process.cwd();
const dir=path.join(root,'research','isograph','optimization');
const predecessorNative=path.join(dir,'ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.isg');
const predecessorJson=path.join(dir,'ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.json');
const successorNative=path.join(dir,'ISOMAX_HOT_LOOP_GRAPH_0_4_CANDIDATE.isg');
const ledgerPath=path.join(dir,'ISOMAX_HOT_LOOP_CORE020_CLOSURE_0_1.json');
const assertionInventoryPath=path.join(dir,'ISOMAX_HOT_LOOP_CORE020_ASSERTION_INVENTORY_0_1.json');
const gameTheoryNative=path.join(root,'research','isograph','successor','CONNECT4_GAME_THEORY_1_2_CANDIDATE.isg');

const blob=file=>execFileSync('git',['hash-object',path.relative(root,file)],{cwd:root,encoding:'utf8'}).trim();
const sha256=text=>createHash('sha256').update(text).digest('hex');
const read=file=>fs.readFileSync(file,'utf8');
const ledger=JSON.parse(read(ledgerPath));
const assertionInventory=JSON.parse(read(assertionInventoryPath));
const oldText=read(predecessorNative);
const nextText=read(successorNative);

assert.equal(blob(predecessorNative),ledger.predecessor.native_git_blob,'predecessor native changed');
assert.equal(blob(predecessorJson),ledger.predecessor.json_git_blob,'predecessor JSON changed');
assert.equal(assertionInventory.predecessor_json.git_blob,ledger.predecessor.json_git_blob,'assertion inventory pins another predecessor JSON');
assert.equal(blob(gameTheoryNative),ledger.upstream_game_theory.git_blob,'upstream game-theory native changed');
assert.equal(blob(successorNative),ledger.native_successor.git_blob,'successor native does not match closure ledger');
assert.equal(ledger.core_0_20.sha256,'9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7');
assert.equal(ledger.status,'STRICT_AUDIT_ACTIVE__SEMANTIC_PRIMITIVE_CLOSURE_INCOMPLETE');

function balanced(text,open,close){
  let depth=0;
  for(const c of text){
    if(c===open) depth++;
    else if(c===close && --depth<0) return false;
  }
  return depth===0;
}
assert.ok(balanced(nextText,'(',')'),'successor native parenthesis imbalance');
assert.ok(balanced(nextText,'[',']'),'successor native bracket imbalance');

const norm=s=>s.trim().replace(/\s+/g,' ');
const oldTuples=[...oldText.matchAll(/\(\^(99608[0-5])([^()]*)\)/g)]
  .map(m=>norm(m[1]+' '+m[2]));
const rawTuples=[...nextText.matchAll(/\(\^150024\s+(99608[0-5])([^()]*)\)/g)]
  .map(m=>norm(m[1]+' '+m[2]));
assert.equal(oldTuples.length,39,'unexpected predecessor tuple count');
assert.deepEqual(rawTuples,oldTuples,'raw extension topology is not an exact predecessor image');

const illegal996Operators=[...nextText.matchAll(/\(\^(996\d{3})\b/g)].map(m=>m[1]);
assert.deepEqual(illegal996Operators,[],'predecessor domain tokens are still being used as semantic operators');

const allowedOperators=new Set(['0','150013','150020','150021','150022','150024']);
const nativeOperators=[...nextText.matchAll(/\(\^(\d+)\b/g)].map(m=>m[1]);
const illegalOperators=[...new Set(nativeOperators.filter(x=>!allowedOperators.has(x)))];
assert.deepEqual(illegalOperators,[],'successor uses non-kernel semantic operators');

const classifications=ledger.classifications;
assert.equal(classifications.length,24,'closure ledger classification count changed');
const expectedRaw=classifications.map(c=>c.source_token);
const expectedViews=classifications.map(c=>c.view_node);
const expectedRoots=classifications.map(c=>c.closure_root);
assert.equal(new Set(expectedRaw).size,24,'duplicate predecessor tokens in closure ledger');
assert.equal(new Set(expectedViews).size,24,'duplicate derived view nodes');
assert.equal(new Set(expectedRoots).size,24,'duplicate closure roots');

const carriers=new Set([...nextText.matchAll(/\(\^150013\s+(\d+)\)/g)].map(m=>Number(m[1])));
for(const id of [993000,...expectedRaw,...expectedViews,...expectedRoots])
  assert.ok(carriers.has(id),'missing RAW_CARRIER declaration '+id);

const provenance=new Map([...nextText.matchAll(/\(\^150022\s+(994\d{3})\s+(996\d{3})\)/g)]
  .map(m=>[Number(m[1]),Number(m[2])]));
const derived=new Map([...nextText.matchAll(/\(\^150020\s+(994\d{3})\s+(995\d{3})\)/g)]
  .map(m=>[Number(m[1]),Number(m[2])]));
const qu=new Set([...nextText.matchAll(/\(\^150021\s+(995\d{3})\)/g)].map(m=>Number(m[1])));
assert.equal(provenance.size,24,'source-provenance mapping is incomplete');
assert.equal(derived.size,24,'derived-view mapping is incomplete');
assert.equal(qu.size,24,'QU closure-root mapping is incomplete');

for(const c of classifications){
  assert.equal(c.source_token_status,'RAW_DATA_ATOM');
  assert.equal(c.status,'DERIVED_VIEW');
  assert.equal(c.closure,'QU_UNEXPANDED');
  assert.equal(c.view_node,c.source_token-2000,'view/source token mapping changed');
  assert.equal(c.closure_root,c.source_token-1000,'closure/source token mapping changed');
  assert.equal(provenance.get(c.view_node),c.source_token,'view provenance mismatch '+c.source_token);
  assert.equal(derived.get(c.view_node),c.closure_root,'derived/root mismatch '+c.source_token);
  assert.ok(qu.has(c.closure_root),'missing QU_UNEXPANDED root '+c.closure_root);
}

// Core-0.20 deletion firewall for the exact claim this successor currently makes:
// derived semantic views are not needed to recover predecessor graph topology.
const topologyDigest=sha256(rawTuples.join('\n'));
const firewallText=nextText
  .split('\n')
  .filter(line=>!line.includes('^150020')&&!line.includes('^150021')&&!line.includes('^150022'))
  .join('\n');
const firewallTuples=[...firewallText.matchAll(/\(\^150024\s+(99608[0-5])([^()]*)\)/g)]
  .map(m=>norm(m[1]+' '+m[2]));
assert.equal(sha256(firewallTuples.join('\n')),topologyDigest,'derived-view deletion changed exact raw topology');

// Adversarially relabel every derived view/root. Raw predecessor topology must not change.
let relabeled=nextText;
for(const id of [...expectedViews,...expectedRoots]) relabeled=relabeled.replaceAll(String(id),String(id+1000000));
const relabeledTuples=[...relabeled.matchAll(/\(\^150024\s+(99608[0-5])([^()]*)\)/g)]
  .map(m=>norm(m[1]+' '+m[2]));
assert.equal(sha256(relabeledTuples.join('\n')),topologyDigest,'derived relabeling changed primitive topology');

// Exhaustive Core-0.20 implicit-assertion coverage of the qualified 0.3 JSON surface.
const predecessorObject=JSON.parse(read(predecessorJson));
const jsonLeaves=[];
function flattenJson(x,p=''){
  if(Array.isArray(x)){x.forEach((v,i)=>flattenJson(v,p+'/'+i));return;}
  if(x&&typeof x==='object'){for(const [k,v] of Object.entries(x))flattenJson(v,p+'/'+k);return;}
  jsonLeaves.push({path:p,value:x});
}
function expectedLeafClass(p){
  if(/^\/(schema|id|status|owner_branch|solver_revision|authority_effect)$/.test(p) ||
     p.startsWith('/nei_dependency/') || p.startsWith('/supersedes_for_active_interpretation/'))
    return {category:'PROVENANCE_OR_ROUTING',load_bearing:false,closure:'RAW_DATA_ATOM_OR_PROVENANCE'};
  if(p.startsWith('/current_candidates/'))
    return {category:'RESEARCH_NAVIGATION',load_bearing:false,closure:'RAW_DATA_ATOM'};
  if(p.startsWith('/semantic_parents/'))
    return {category:'SEMANTIC_PARENT_VIEW',load_bearing:true,closure:'QU_UNEXPANDED'};
  if(p.startsWith('/exact_scoped_equivalences/'))
    return {category:'EXACT_EQUIVALENCE_VIEW',load_bearing:true,closure:'QU_UNEXPANDED'};
  if(p.startsWith('/identity_boundaries/'))
    return {category:'IDENTITY_BOUNDARY_VIEW',load_bearing:true,closure:'QU_UNEXPANDED'};
  if(p.startsWith('/identity_evidence/'))
    return {category:'IDENTITY_EVIDENCE_VIEW',load_bearing:true,closure:'QU_UNEXPANDED'};
  if(p.startsWith('/qu_regions/')){
    if(/\/candidates\/\d+$/.test(p))
      return {category:'RESEARCH_NAVIGATION',load_bearing:false,closure:'RAW_DATA_ATOM'};
    return {category:'QU_REGION_VIEW',load_bearing:true,closure:'QU_UNEXPANDED'};
  }
  if(p.startsWith('/retained_performance/'))
    return {category:'PERFORMANCE_EVIDENCE_VIEW',load_bearing:true,closure:'QU_UNEXPANDED'};
  if(p.startsWith('/relations/'))
    return {category:'SEMANTIC_RELATION_VIEW',load_bearing:true,closure:'QU_UNEXPANDED'};
  throw new Error('unclassified predecessor JSON leaf '+p);
}
flattenJson(predecessorObject);
assert.equal(jsonLeaves.length,195,'qualified 0.3 JSON leaf count changed');
assert.equal(assertionInventory.leaf_count,jsonLeaves.length,'assertion inventory leaf count mismatch');
assert.equal(assertionInventory.entries.length,jsonLeaves.length,'assertion inventory entry count mismatch');
for(let i=0;i<jsonLeaves.length;i++){
  const source=jsonLeaves[i], recorded=assertionInventory.entries[i], expected=expectedLeafClass(source.path);
  assert.equal(recorded.path,source.path,'assertion inventory path drift at '+i);
  assert.deepEqual(recorded.value,source.value,'assertion inventory value drift '+source.path);
  assert.equal(recorded.category,expected.category,'assertion category drift '+source.path);
  assert.equal(recorded.load_bearing,expected.load_bearing,'assertion load-bearing drift '+source.path);
  assert.equal(recorded.closure,expected.closure,'assertion closure drift '+source.path);
}
const loadBearingAssertions=assertionInventory.entries.filter(e=>e.load_bearing);
assert.equal(loadBearingAssertions.length,156,'load-bearing assertion count changed');
assert.ok(loadBearingAssertions.every(e=>e.closure==='QU_UNEXPANDED'),
  'a load-bearing JSON assertion was silently treated as primitive-closed');

const unresolved=classifications.filter(c=>c.closure==='QU_UNEXPANDED');
assert.equal(unresolved.length,24);
assert.equal(ledger.gates.core020_qualification,'NOT_CLAIMED');

console.log(JSON.stringify({
  status:'PASS',
  predecessorNativeBlob:blob(predecessorNative),
  successorNativeBlob:blob(successorNative),
  predecessorRawTuples:oldTuples.length,
  rawTopologySha256:topologyDigest,
  closureEntries:classifications.length,
  derivedViews:derived.size,
  quUnexpandedRoots:qu.size,
  illegal996Operators:illegal996Operators.length,
  illegalNonKernelOperators:illegalOperators.length,
  deletionFirewall:'PASS',
  adversarialDerivedRelabel:'PASS',
  predecessorJsonLeaves:jsonLeaves.length,
  loadBearingJsonAssertions:loadBearingAssertions.length,
  implicitAssertionCoverage:'PASS',
  semanticPrimitiveClosure:'INCOMPLETE',
  core020Qualification:'NOT_CLAIMED'
},null,2));

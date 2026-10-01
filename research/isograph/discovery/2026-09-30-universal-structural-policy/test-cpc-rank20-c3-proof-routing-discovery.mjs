import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank20-c3-proof-routing-discovery.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c3_proof_routing_discovery.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.rank20.sequence,'44444156666623222242');
assert.equal(r.rank20.rank,20);
assert.equal(r.rank20.mover,1);
assert.deepEqual(r.rank20.support,[1,6,1,6,1,5,0]);
assert.equal(r.p1Column,3);
assert.deepEqual(r.legalDefenderReplies,[1,3,5,6,7]);
assert.equal(r.rows.length,5);

const byCol=new Map(r.rows.map(x=>[x.defenderColumn,x]));
const c3=byCol.get(3);
assert.equal(c3.directRank22Handoff,true);
assert.equal(c3.closedByKnownRoot,true);
assert.equal(c3.knownRoot,'RANK22_ROUTED');

for(const row of r.rows){
  assert.equal(typeof row.defenderColumn,'number');
  assert.ok(Array.isArray(row.replySupport));
  if(row.closedByKnownRoot)continue;
  assert.ok(Array.isArray(row.p1Candidates));
  for(const c of row.p1Candidates){
    assert.equal(typeof c.p1Column,'number');
    assert.equal(typeof c.terminal,'number');
    if(c.forcedMacro){
      assert.equal(c.forcedMacro.baselineFrontierAgree,true);
      assert.equal(typeof c.forcedMacro.defenderColumn,'number');
      assert.ok(Array.isArray(c.forcedMacro.afterForcedSupport));
      assert.ok(['RANK24_ZUGZWANG','RANK24_SINGLETON','RANK24_ROUTED',null].includes(c.forcedMacro.knownRoot));
    }
  }
}
assert.ok(r.boundary.some(x=>x.includes('discovery')));
console.log(JSON.stringify({
  pass:true,
  replies:r.rows.map(x=>({defenderColumn:x.defenderColumn,closedByKnownRoot:x.closedByKnownRoot,knownRoot:x.knownRoot??null,candidates:x.p1Candidates?.length??0}))
}));

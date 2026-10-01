import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank20-generic-rcic-route-matcher-discovery.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_generic_rcic_route_matcher_discovery.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.rank20.sequence,'44444156666623222242');
assert.equal(r.p1Column,3);
assert.deepEqual(r.sourceUnclosedDefenderReplies,[1,5,6,7]);
assert.equal(r.rows.length,4);

for(const row of r.rows){
  assert.ok([1,5,6,7].includes(row.defenderColumn));
  assert.ok(Array.isArray(row.replySupport));
  assert.deepEqual(row.alignedPairCells.sort(),[
    '1,3|3,5',
    '5,5|7,3'
  ]);
  assert.ok(Array.isArray(row.candidates));
  for(const c of row.candidates){
    assert.equal(typeof c.p1Column,'number');
    assert.equal(typeof c.terminal,'number');
    assert.ok(Array.isArray(c.routes));
    for(const route of c.routes){
      assert.ok([
        'EXACT_KNOWN_ROOT_HANDOFF',
        'DIRECT_TARGET_RESERVOIR_RCIC',
        'FORCED_KNOWN_ROOT_HANDOFF',
        'FORCED_PAIR_CONTRACTION_TO_RESERVOIR_RCIC'
      ].includes(route.kind));
      assert.equal(typeof route.accept,'boolean');
    }
  }
  assert.equal(typeof row.closedByExistingGrammar,'boolean');
  if(row.closedByExistingGrammar){
    assert.ok(row.acceptedRoutes.length>0);
    assert.ok(row.acceptedRoutes.every(x=>x.accept===true));
  }
}

const c5=r.rows.find(x=>x.defenderColumn===5);
assert(c5);
const p1c5=c5.candidates.find(x=>x.p1Column===5);
assert(p1c5);
assert.equal(p1c5.forcedMacro?.baselineFrontierAgree,true);
assert.equal(p1c5.forcedMacro?.defenderColumn,5);

assert.ok(r.boundary.some(x=>x.includes('discovery')));
console.log(JSON.stringify({
  pass:true,
  closed:r.rows.filter(x=>x.closedByExistingGrammar).map(x=>x.defenderColumn),
  unresolved:r.rows.filter(x=>!x.closedByExistingGrammar).map(x=>x.defenderColumn)
}));

import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank20-dual-obligation-setup-transport-probe.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_dual_obligation_setup_transport_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.rank20.sequence,'44444156666623222242');
assert.equal(r.p1Column,3);
assert.deepEqual(r.sourceUnresolvedDefenderReplies,[6,7]);
assert.equal(r.rows.length,2);

const byDef=new Map(r.rows.map(x=>[x.defenderColumn,x]));
assert.deepEqual(byDef.get(6).setupTests.map(x=>x.setupColumn),[1]);
assert.deepEqual(byDef.get(7).setupTests.map(x=>x.setupColumn).sort((a,b)=>a-b),[1,7]);

for(const row of r.rows){
  assert.deepEqual(row.alignedPairCells.sort(),['1,3|3,5','5,5|7,3']);
  for(const s of row.setupTests){
    assert.equal(s.endpoint.supportDistance,1);
    assert.equal(s.setupColumn,s.endpoint.column);
    assert.ok(Array.isArray(s.legalDefenderReplies));
    assert.ok(Array.isArray(s.offColumnRoutes));
    assert.equal(s.takenEndpointRoute.kind,'TAKEN_ENDPOINT_OBLIGATION_TRANSPORT');
    assert.equal(s.takenEndpointRoute.defenderColumn,s.setupColumn);
    for(const route of s.offColumnRoutes){
      assert.equal(route.kind,'OFF_COLUMN_PAIR_CONTRACTION_TO_RESERVOIR_RCIC');
      assert.notEqual(route.defenderColumn,s.setupColumn);
      assert.equal(typeof route.accept,'boolean');
      if(route.accept){
        assert.equal(route.contractionToSingleton,true);
        assert.equal(route.targetProjectedToP1,true);
        assert.equal(route.validation.pass,true);
      }
    }
  }
}

assert.ok(r.boundary.some(x=>x.includes('discovery')));
console.log(JSON.stringify({
  pass:true,
  rows:r.rows.map(x=>({
    defenderColumn:x.defenderColumn,
    setups:x.setupTests.map(s=>({
      setupColumn:s.setupColumn,
      offColumnAccepted:s.offColumnRoutes.filter(y=>y.accept).length,
      offColumnTotal:s.offColumnRoutes.length,
      takenKnownRoot:s.takenEndpointRoute.knownRoot??null,
      survivingPairs:s.takenEndpointRoute.survivingAlignedPairCells
    }))
  }))
}));

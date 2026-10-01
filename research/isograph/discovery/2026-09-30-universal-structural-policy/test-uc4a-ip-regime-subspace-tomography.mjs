import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-ip-regime-subspace-tomography.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_ip_regime_subspace_tomography.v1');
assert.equal(r.structuralAtlasSha256,'374d744378bf71b77db0711d1eb2ef4a21ec1cb4c80736aa206abd4520dd1aa9');
assert.equal(r.sourceCurvatureRows,430);
assert.equal(r.localizationArtifactAccessibleToProducer,false);
assert.equal(r.outcomeLabelsAccessibleToProducer,false);
assert.equal(r.rawOutcomeSourcesAccessed,false);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.ok(r.part1.regimes.length>0);
assert.ok(r.part2.controlledComparisons.length>0);
assert.equal(r.part2.controlledComparisons.length*2,r.part4.directedDefects.length);

for(const c of r.part2.controlledComparisons){
  assert.equal(c.intersectionDimension,c.rankA+c.rankB-c.rankUnion);
  assert.equal(c.aOnlyQuotientDimension,c.rankUnion-c.rankB);
  assert.equal(c.bOnlyQuotientDimension,c.rankUnion-c.rankA);
  assert.equal(c.grassmannDistance,c.rankA+c.rankB-2*c.intersectionDimension);
}
for(const d of r.part4.directedDefects){
  assert.equal(d.residualQuotientRank,d.expectedQuotientRank);
  assert.ok(d.residualQuotientRank>=0);
}
assert.ok(r.part5.recurringDefects.length>0);
for(const family of ['WIDTH2','HEIGHT2','MIXED']){
  assert.ok(r.part6.genericInterior[family]);
  assert.ok(Number.isInteger(r.part6.genericInterior[family].rank));
  assert.ok(Array.isArray(r.part6.genericInterior[family].parityCells));
}

const s=JSON.stringify(r);
for(const token of ['P1_WIN','P2_WIN','DRAW','Q-b28863204048bdde','UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json'])assert.equal(s.includes(token),false);

assert.match(r.regimeAtlasSha256,/^[0-9a-f]{64}$/);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('not a theorem')));

console.log(JSON.stringify({
  pass:true,
  regimes:r.part1.regimes.length,
  comparisons:r.part2.controlledComparisons.length,
  defects:r.part5.recurringDefects.length,
  extended:r.part5.recurringDefects.filter(x=>x.extendedGridRecurring).length,
  genericRanks:Object.fromEntries(Object.entries(r.part6.genericInterior).map(([k,v])=>[k,v.rank]))
}));

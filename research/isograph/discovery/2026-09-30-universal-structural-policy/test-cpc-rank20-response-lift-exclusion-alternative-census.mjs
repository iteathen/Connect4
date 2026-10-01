import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-response-lift-exclusion-alternative-census.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:32*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_response_lift_exclusion_alternative_census.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.targetReservoirModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.candidateCount,13);
assert.equal(r.candidates.length,13);

for(const c of r.candidates){
  assert.equal(c.firstFailureKind,'defender-terminal');
  assert.ok(c.predecessorRank>=20);
  assert.ok(Array.isArray(c.predecessorSupport)&&c.predecessorSupport.length===7);
  assert.ok(Array.isArray(c.legalResponses)&&c.legalResponses.length>0);
  assert.equal(typeof c.mappedResponseColumn,'number');
  assert.equal(typeof c.mappedResponseHazard,'boolean');
  assert.ok(['SAFE_ALTERNATIVE_EXISTS','NO_SINGLETON_SAFE_ALTERNATIVE','MAPPED_RESPONSE_ALREADY_SAFE'].includes(c.disposition));
  const mapped=c.legalResponses.find(x=>x.column===c.mappedResponseColumn);
  assert.ok(mapped);
  assert.equal(mapped.responseLiftHazard,c.mappedResponseHazard);
  for(const a of c.legalResponses){
    assert.equal(typeof a.singletonSafe,'boolean');
    assert.equal(typeof a.responseLiftHazard,'boolean');
    assert.ok(Array.isArray(a.postResponsePlayableP2Singletons));
    if(a.singletonSafe)assert.equal(a.responseLiftHazard,false);
  }
}

assert.equal(
  r.summary.responseLiftHazardCount+r.summary.mappedResponseAlreadySafeCount,
  13
);
assert.equal(
  r.summary.safeAlternativeExistsCount+r.summary.noSingletonSafeAlternativeCount+r.summary.mappedResponseAlreadySafeCount,
  13
);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({
  pass:true,
  candidateCount:r.candidateCount,
  responseLiftHazardCount:r.summary.responseLiftHazardCount,
  safeAlternativeExistsCount:r.summary.safeAlternativeExistsCount,
  noSingletonSafeAlternativeCount:r.summary.noSingletonSafeAlternativeCount,
  mappedResponseAlreadySafeCount:r.summary.mappedResponseAlreadySafeCount
}));

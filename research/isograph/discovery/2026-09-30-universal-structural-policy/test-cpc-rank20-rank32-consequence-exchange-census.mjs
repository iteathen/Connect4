import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-rank32-consequence-exchange-census.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_rank32_consequence_exchange_census.v1');
assert.equal(r.sourceTransitionCount,36);
assert.equal(r.distinctSourceQClasses,24);
assert.equal(r.repeatedSourceQClassCount,12);
assert.equal(r.repeatedClasses.length,12);
assert.ok(r.repeatedClasses.every(x=>x.sourceOccurrences.length===2));
assert.ok(r.repeatedClasses.every(x=>x.commonPrefixRank===28));
assert.ok(r.repeatedClasses.every(x=>x.sourceSuffixLength===4));
assert.ok(r.repeatedClasses.every(x=>x.sameEventMultiset===true));
assert.ok(r.repeatedClasses.every(x=>x.permutationCount>=1));
assert.ok(r.repeatedClasses.every(x=>x.legalNonterminalPermutationCount>=2));
assert.ok(r.repeatedClasses.every(x=>x.sourceWordsSameExactQ===true));
assert.ok(r.repeatedClasses.every(x=>Number.isInteger(x.sourceAdjacentSwapDistance)||x.sourceAdjacentSwapDistance===null));
assert.ok(r.repeatedClasses.every(x=>Number.isInteger(x.sourceQPreservingSwapDistance)||x.sourceQPreservingSwapDistance===null));
assert.ok(Array.isArray(r.motifGroups));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
assert.ok(r.boundary.some(x=>x.includes('not yet a winning certificate')));

console.log(JSON.stringify({
  pass:true,
  sourceTransitions:r.sourceTransitionCount,
  qClasses:r.distinctSourceQClasses,
  repeated:r.repeatedSourceQClassCount,
  motifGroups:r.motifGroups.length,
  preservingConnected:r.repeatedClasses.filter(x=>x.sourceQPreservingSwapDistance!==null).length
}));

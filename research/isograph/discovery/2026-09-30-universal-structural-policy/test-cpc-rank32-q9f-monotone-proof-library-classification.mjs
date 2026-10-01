import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank32-q9f-monotone-proof-library-classification.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank32_q9f_monotone_proof_library_classification.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.target.exactQClass,'9f6b7a33ab7e9552');
assert.equal(r.target.rank,32);
assert.deepEqual(r.target.support,[6,6,4,6,5,5,0]);
assert.equal(r.target.exactBridge.pass,true);
assert.deepEqual(r.target.enabledP1Singletons,['C5']);
assert.equal(r.target.forcedBlockColumn,3);
assert.equal(r.forcedBlock.terminal,false);
assert.ok(r.replies.length>0);

for(const x of r.replies){
  assert.equal(x.rank,34);
  assert.equal(x.exactBridge.pass,true);
  assert.ok(Array.isArray(x.routeAttempts));
  assert.ok(Array.isArray(x.acceptedRoutes));
  assert.equal(x.closed,x.acceptedRoutes.length>0);
}
assert.equal(r.summary.replyCount,r.replies.length);
assert.equal(r.summary.closedReplyCount,r.replies.filter(x=>x.closed).length);
assert.equal(r.summary.unclosedReplyCount,r.replies.filter(x=>!x.closed).length);
assert.equal(r.summary.resourceFailureCount,0);
assert.ok(['FORCED_BLOCK_ALL_REPLIES_POSITIVE','INCOMPLETE_POSITIVE_LIBRARY'].includes(r.classification));
if(r.classification==='FORCED_BLOCK_ALL_REPLIES_POSITIVE')assert.equal(r.summary.unclosedReplyCount,0);
else assert.ok(r.summary.unclosedReplyCount>0);

assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.repairCapacityModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.bsfpModified,false);
assert.ok(r.boundary.some(x=>x.includes('No solved')));
console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  replies:r.summary.replyCount,
  closed:r.summary.closedReplyCount,
  unclosed:r.summary.unclosedReplyCount,
  routeKinds:r.summary.acceptedRouteKinds,
  smallestUnclosed:r.smallestUnclosedChild
}));

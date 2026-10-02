import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-ef-nonwin-convergence.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_ef_nonwin_convergence.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceQ,'5d34e24395b9d801');
assert.equal(r.convergenceQ,'e5d63da12420fdb3');
assert.equal(r.q649,'6496c888c4e2a157');
assert.equal(r.classification,'EF_NONWIN_G_SURVIVES');
assert.deepEqual(r.actions.map(x=>x.p0Action),[5,6,7]);

const e=r.actions.find(x=>x.p0Action===5);assert(e);
const f=r.actions.find(x=>x.p0Action===6);assert(f);
const g=r.actions.find(x=>x.p0Action===7);assert(g);
assert.equal(e.disposition,'P0_NONWIN');
assert.equal(f.disposition,'P0_NONWIN');
assert.equal(g.disposition,'SURVIVING_CANDIDATE');
assert.equal(e.adversarialReply,6);
assert.equal(f.adversarialReply,5);
assert.equal(e.replyQ,r.convergenceQ);
assert.equal(f.replyQ,r.convergenceQ);

assert.equal(r.bridges.efToConvergence.pass,true);
assert.equal(r.bridges.feToConvergence.pass,true);
assert.equal(r.bridges.convergenceToQ649.pass,true);
assert.equal(r.q649DrawWitness.classification,'DRAW_FULL_BOARD');
assert.equal(r.q649DrawWitness.p1Action,7);

assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,classification:r.classification,actions:r.actions,bridges:r.bridges,q649Draw:r.q649DrawWitness}));

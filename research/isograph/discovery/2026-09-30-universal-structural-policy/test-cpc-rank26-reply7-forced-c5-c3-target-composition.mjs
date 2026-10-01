import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank26-reply7-forced-c5-c3-target-composition.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank26_reply7_forced_c5_c3_target_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.state.rank,26);
assert.equal(r.state.mover,1);
assert.deepEqual(r.state.support,[2,6,3,6,2,5,2]);

assert.equal(r.p1c5.terminal,0);
assert.deepEqual(r.p1c5.support,[2,6,3,6,3,5,2]);
assert.equal(r.p1c5.nativeCpcForcesC5,true);
assert.equal(r.p1c5.literalOnlyC5,true);

assert.equal(r.forcedP2c5.terminal,0);
assert.deepEqual(r.forcedP2c5.support,[2,6,3,6,4,5,2]);

assert.equal(r.p1c1.terminal,0);
assert.deepEqual(r.p1c1.support,[3,6,3,6,4,5,2]);
assert.equal(r.p1c1.c3r5Singleton,true);
assert.equal(r.p1c1.c3r5ProjectedOwner,1);
assert.deepEqual(r.p1c1.defenderPlayableSingletons,[]);
assert.ok(r.p1c1.targetTemplate);
assert.equal(r.p1c1.targetTemplate.targetIsResponse,true);
assert.equal(r.p1c1.validation.pass,true);

assert.equal(r.accept,true);
assert.ok(r.conclusion.some(x=>x.includes('rank-26')));
console.log(JSON.stringify({pass:true,accept:r.accept,state:r.state,p1c5:r.p1c5,forcedP2c5:r.forcedP2c5,p1c1:{terminal:r.p1c1.terminal,support:r.p1c1.support,c3r5Singleton:r.p1c1.c3r5Singleton,validation:r.p1c1.validation},conclusion:r.conclusion}));

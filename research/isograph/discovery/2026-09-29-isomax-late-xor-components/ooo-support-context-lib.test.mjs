import test from 'node:test';import assert from 'node:assert/strict';import {supportProfileCommon} from './ooo-support-context-lib.mjs';
test('support profiles prevent paths through triangles absent from a carrier',()=>{const r=supportProfileCommon([[0,2],[0,1,2]],[['x','x','y'],['a','b','b']]);assert.deepEqual(r.profiles,[3,2,3]);assert.equal(new Set(r.labels).size,3);});

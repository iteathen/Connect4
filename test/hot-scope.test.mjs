import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { auditHotScope } from '../tools/check-hot-scope.mjs';

test('component hot scope has no forbidden materialization and identifies the open kernel boundary', () => {
  const result = auditHotScope();
  assert.deepEqual(result.violations, []);
  assert.deepEqual(result.openBoundaries, ['prepared native kernel evaluate']);
});

test('hot-scope detector catches a deliberate allocation in a transitive JSMinSys helper', () => {
  const path = fileURLToPath(new URL('../vendor/jsminsys/src/mix32.mjs', import.meta.url));
  const source = readFileSync(path, 'utf8');
  const mutant = source.replace('return Math.imul(value', 'const unnecessary = []; return Math.imul(value');
  const result = auditHotScope(new Map([[path, mutant]]));
  assert.ok(result.violations.some(v => v.includes('ArrayExpression')));
});

test('native RBA binding closes the call graph and rejects transitive text',()=>{
  const good=auditHotScope(new Map(),true);
  assert.deepEqual(good.violations,[]);assert.deepEqual(good.openBoundaries,[]);
  const path=fileURLToPath(new URL('../components/isometric/rba/coordinate.mjs',import.meta.url));
  const source=readFileSync(path,'utf8').replace('let count=0;',"const text='bad'; let count=0;");
  assert.ok(auditHotScope(new Map([[path,source]]),true).violations.some(v=>v.includes('hot text')));
});

test('execution modules cannot depend on ingress, replay, legacy state or physical oracle',()=>{
  const path=fileURLToPath(new URL('../components/isometric/rba/kernel.mjs',import.meta.url));
  const source=readFileSync(path,'utf8');
  for(const dependency of ['./ingress.mjs','../state.mjs','../../../test/helpers/physical-oracle.mjs','./replay.mjs']){
    const mutant=`import * as forbidden from '${dependency}';\n${source}`;
    assert.ok(auditHotScope(new Map([[path,mutant]]),true).violations.some(v=>v.includes('forbidden execution dependency')),dependency);
  }
});

test('hot traversal cannot call cold geometric basis reconstruction',()=>{
  const path=fileURLToPath(new URL('../components/isometric/rba/kernel.mjs',import.meta.url));
  const source=readFileSync(path,'utf8');
  const mutant="import {basis7x6} from './coordinate.mjs';\n"+source.replace('const base=q*8;','basis7x6(); const base=q*8;');
  assert.ok(auditHotScope(new Map([[path,mutant]]),true).violations.some(v=>v.includes('forbidden cold ingress/geometry')));
});

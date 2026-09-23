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
  const source=readFileSync(path,'utf8').replace('let n=0;',"const text='bad'; let n=0;");
  assert.ok(auditHotScope(new Map([[path,source]]),true).violations.some(v=>v.includes('hot text')));
});

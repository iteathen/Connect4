import assert from 'node:assert/strict';
import test from 'node:test';
import { standard7x6RootConfiguration as configure } from './quotient-standard7x6-root-config.mjs';

test('root configuration validates timer, cache, window-depth and worker resource domains without launching a solve', () => {
  const defaults = configure({}, 8);
  assert.equal(defaults.SPLIT_DEPTH, 3);
  assert.equal(defaults.PRIORITY_PROBE_DEPTH, 0);
  assert.equal(defaults.searchWorkers, 3);
  assert.equal(configure({}, 1).searchWorkers, 1);
  for (const [name, value] of Object.entries({
    PROGRESS_MS: '2147483648', PREFIX_CLASSES: '2147483647', SPLIT_DEPTH: '43',
    PRIORITY_PROBE_DEPTH: '', SEARCH_WORKERS: '257', TT_ENTRY_CAPACITY: '24', TT_TERM_CAPACITY: '0',
  })) assert.throws(() => configure({ [name]: value }, 8), new RegExp(name));
  for (const value of ['NaN', 'Infinity', '0x10', ' 3', '3.0', '3e0', 3]) assert.throws(() => configure({ SEARCH_WORKERS: value }, 8));
  assert.throws(() => configure({}, 0));
});

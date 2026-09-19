import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { solveRbaWdl, RBA_RESEARCH_REVISION } from '../../components/bsfp/rba-wdl-reference.mjs';
import { solveCompactHybrid, readCompactHybridOptions } from '../cuda-bsfp-compact-hybrid/run.mjs';
import { createReferenceReducer } from '../cuda-bsfp-compact-hybrid/qualification.mjs';
import { physicalControl } from './physical-control.mjs';

const geometries = [{ columns: 3, rows: 2, connect: 3 }, { columns: 4, rows: 3, connect: 3 }];
if (process.argv[2] === 'worker') {
  const profile = process.argv[3], geometry = geometries[Number(process.argv[4])];
  if (!geometry || !['p2', 'explicit-q', 'rba'].includes(profile)) throw new RangeError('invalid benchmark case');
  let observedHeapBytes = process.memoryUsage().heapUsed;
  const sample = () => { observedHeapBytes = Math.max(observedHeapBytes, process.memoryUsage().heapUsed); };
  const frontiers = new Map();
  const start = performance.now(), cpu = process.cpuUsage();
  let result;
  if (profile === 'rba') result = solveRbaWdl(geometry, { onSupport: sample });
  else if (profile === 'explicit-q') result = physicalControl(geometry);
  else result = await solveCompactHybrid(geometry, readCompactHybridOptions({}), createReferenceReducer(),
    { onFrontier: (index, f) => { frontiers.set(index, f); sample(); }, progress: false });
  const elapsedMs = performance.now() - start;
  const cpuMicroseconds = process.cpuUsage(cpu);
  sample();
  const peakRssBytes = process.resourceUsage().maxRSS * 1024 || null;
  const oracle = profile === 'explicit-q' ? result : physicalControl(geometry);
  assert.equal(result.rootWdl, oracle.rootWdl);
  for (const state of oracle.states.values()) {
    if (profile === 'rba') assert.equal(result.evaluate(state), state.value);
    if (profile === 'p2') {
      const index = state.heights.reduce((a, h, c) => a + h * (geometry.rows + 1) ** c, 0);
      const frontier = frontiers.get(index);
      const win = frontier.wins.some(m => (BigInt(m) & state.p0) === BigInt(m));
      const loss = frontier.losses.some(m => (BigInt(m) & state.p0) === state.p0);
      assert(!(win && loss));
      assert.equal(win ? 1 : loss ? -1 : 0, state.value);
    }
  }
  console.log(JSON.stringify({ profile, geometry, elapsedMs, cpuMicroseconds, observedHeapBytes, peakRssBytes,
    rootWdl: result.rootWdl, physicalStates: oracle.states.size, distinctQ: oracle.q.size,
    qRedundancy: 1 - oracle.q.size / oracle.states.size, checkedLegalEdges: oracle.edges,
    metrics: result.metrics, exact: true, deviceWorkMs: null, hostDeviceTransfers: 0 }));
} else {
  const cases = [];
  for (let g = 0; g < geometries.length; g++) {
    const profiles = {};
    for (const profile of ['p2', 'explicit-q', 'rba']) {
      const samples = [];
      for (let repeat = 0; repeat < 3; repeat++) {
        const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), 'worker', profile, String(g)],
          { encoding: 'utf8', timeout: 30_000, maxBuffer: 4 * 1024 * 1024 });
        if (child.error || child.status !== 0) throw new Error('Qualification worker failed: ' + profile + '/' + g + ' status=' + child.status + ' code=' + (child.error?.code ?? 'none'));
        samples.push(JSON.parse(child.stdout));
      }
      const times = samples.map(s => s.elapsedMs).sort((a, b) => a - b);
      profiles[profile] = { medianMs: times[1], samples };
    }
    cases.push({ geometry: geometries[g], profiles });
  }
  console.log(JSON.stringify({
    schema: 1, testedSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    workingTreeDirty: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0,
    researchRevision: RBA_RESEARCH_REVISION, node: process.version,
    execution: 'CPU-only implementation qualification, three fresh processes per profile/case; 30s worker bound',
    caveats: [
      'P2 is the actual unchanged recurrence with an injected CPU exact reducer and retained observation frontiers; this is not a native GPU speed comparison.',
      'Explicit-q total includes physical enumeration and independent oracle; its q-table-only time is separately reported and is not a deployable symbolic solver.',
      'All profiles use the same geometry and complete legal-state oracle. RBA also computes unrealizable abstract fibers; record counts have different meanings.',
      'RSS includes imports/runtime; observed heap samples occur at support publication and may miss transient peaks. Null peak RSS means unavailable.',
      'No GPU specialization or widened shared q cache is promoted by this report.',
    ], cases,
  }, null, 2));
}


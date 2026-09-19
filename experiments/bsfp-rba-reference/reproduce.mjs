// Replay the immutable research coordinate-enumerating implementation, extending
// only its reporting to exact semantic generator hashes. No algorithm is edited.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { RBA_RESEARCH_REVISION } from '../../components/bsfp/rba-wdl-reference.mjs';
const path = 'research/isograph/discovery/2026-09-18-policy-frontier/rank33-lattice-boundary-control.mjs';
const source = execFileSync('git', ['show', RBA_RESEARCH_REVISION + ':' + path], { encoding: 'utf8' });
const sourceSha256 = createHash('sha256').update(source).digest('hex');
assert.equal(sourceSha256, '65246879a4f2bcc125c147589d5e93ab0f009dc8afd1375af13cdf594f8b5396');
const reporting = source.lastIndexOf('console.log(JSON.stringify(');
assert(reporting > 0);
const appended = "\nimport { createHash } from 'node:crypto';\nconst hash = (values, info) => {\n  const coordinate = u => minIndices(u, info).map(i => info.shapes[i].toString(16)).sort().join('.');\n  const records = values.map(g => coordinate(g.m) + '/' + coordinate(g.o)).sort();\n  return { count: records.length, sha256: createHash('sha256').update(JSON.stringify(records)).digest('hex') };\n};\nconst output = [];\nfor (const [key, node] of nodes) {\n  const findLevel = sign => node.levels.find(s => s[0] === sign);\n  const draw = findLevel(0), win = findLevel(1);\n  const loss = node.levels.filter(s => s[0] === -1).at(-1);\n  output.push({ heights: key.split(',').map(Number),\n    upper0: hash(node.upper.get(scoreKey(draw)), node.info),\n    upper1: hash(win ? node.upper.get(scoreKey(win)) : [], node.info),\n    lowerMinus1: hash(loss ? node.lower.get(scoreKey(loss)) : [], node.info),\n    lower0: hash(node.lower.get(scoreKey(draw)), node.info) });\n}\nconsole.log(JSON.stringify(output));\n";
if (process.argv[2] && process.argv[2] !== 'larger') throw new RangeError('expected no argument or larger');
const minimumHeights = process.argv[2] === 'larger' ? [5, 5, 2, 3, 6, 6, 6] : [5, 5, 1, 4, 6, 6, 6];
const child = spawnSync(process.execPath, ['--input-type=module', '-', minimumHeights.join(',')],
  { input: source.slice(0, reporting) + appended, encoding: 'utf8', timeout: 30_000, maxBuffer: 4 * 1024 * 1024 });
if (child.error || child.status !== 0) throw new Error('Pinned research replay failed: ' + (child.error?.code ?? child.status));
const supports = JSON.parse(child.stdout);
console.log(JSON.stringify({ researchRevision: RBA_RESEARCH_REVISION, sourcePath: path,
  sourceSha256, geometry: { columns: 7, rows: 6, connect: 4 }, minimumHeights,
  note: 'WDL projection of unchanged strong-value research recurrence; hashes are evidence, never runtime identity.',
  supports }, null, 2));

// Explicit historical-checkout control. The normal performance entry continues
// to require solver/isometric; this harness labels detached historical evidence.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { captureProcess } from '../../tools/solver-performance.mjs';
if (process.argv.length !== 4) throw new Error('usage: bounded-control.mjs checkout output-directory');
const source = path.resolve(process.argv[2]), output = path.resolve(process.argv[3]);
const git = (...args) => execFileSync('git', ['-C',source,...args], { encoding:'utf8',windowsHide:true }).trim();
if (git('status','--porcelain')) throw new Error('historical control requires a clean checkout');
const report = { sourceRevision:git('rev-parse','HEAD'), branch:git('branch','--show-current') || '(detached)',
  runId:new Date().toISOString().replace(/[-:.]/g,'')+'-isomax-control',
  workload:'standard-7x6-empty-exact-P0-WDL', node:process.version,cpu:os.cpus()[0].model,
  timeoutMs:30000, internalTimeoutMs:29000, kind:'explicit historical checkout control' };
fs.mkdirSync(output,{recursive:true});
const save = () => fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(report,null,2)+'\n',{flush:true});
save();
report.result = await captureProcess({ command:process.execPath,
  args:['--max-old-space-size=4096',path.join(source,'tools/isomax-performance-child.mjs'),'','29000'],
  cwd:source,directory:output,timeoutMs:30000 });
report.sourceUnchanged = git('rev-parse','HEAD') === report.sourceRevision && git('status','--porcelain') === '';
save();
console.log(JSON.stringify({runId:report.runId,sourceRevision:report.sourceRevision,
  phase:report.result.lastRecord?.phase, nodes:report.result.lastRecord?.metrics?.nodes,
  sourceUnchanged:report.sourceUnchanged,cleanup:report.result.cleanup}));
if (!report.sourceUnchanged || report.result.exitCode !== 0 || report.result.timedOut) process.exitCode=1;

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {captureProcess} from '../../tools/solver-performance.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim();
if(git('status','--porcelain')) throw new Error('commit campaign before measuring');
const runId=new Date().toISOString().replace(/[-:.]/g,'')+'-rba-candidates';
const directory=path.resolve(root,git('rev-parse','--git-path','solver-performance'),runId);
fs.mkdirSync(directory,{recursive:true});
const report={runId,sourceRevision:git('rev-parse','HEAD'),node:process.version,cpu:os.cpus()[0]?.model,
  startedAt:new Date().toISOString(),execution:'CPU reference; no native GPU measurement',
  policy:{timeoutMsPerProcess:30000,maxSupports:4096,maxCandidates:2000000,maxFrontier:50000,
    sequence:['baseline','B3-stream','B3-stream','baseline','baseline','B3-stream'],
    progress:'flush every 16 completed supports; heap sampled at every support',
    metricCaveat:'candidate normalizationMs includes projection generation; compare total elapsedMs instead'},
  runs:[]};
const save=()=>fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(report,null,2)+'\n',{flush:true});
save();
for(const [index,variant] of report.policy.sequence.entries()) {
  const subdir=path.join(directory,String(index+1)+'-'+variant);
  console.log(JSON.stringify({phase:'start',ordinal:index+1,variant,runId}));
  const capture=await captureProcess({command:process.execPath,
    args:['--expose-gc','--max-old-space-size=4096',fileURLToPath(new URL('child.mjs',import.meta.url)),variant],
    cwd:root,directory:subdir,timeoutMs:report.policy.timeoutMsPerProcess});
  const summaries=fs.readFileSync(path.join(subdir,'stdout.log'),'utf8').trim().split('\n').filter(Boolean)
    .map(JSON.parse).filter(r=>r.kind==='summary');
  report.runs.push({ordinal:index+1,variant,...capture,summaries}); save();
  if(capture.exitCode!==0||capture.timedOut||summaries.length!==3)
    throw new Error('incomplete comparison; inspect logs before retry');
  console.log(JSON.stringify({phase:'finish',variant,cases:summaries.map(s=>({name:s.case,elapsedMs:s.elapsedMs}))}));
}
const median=v=>v.toSorted((a,b)=>a-b)[1];
report.comparison=report.runs[0].summaries.map((control,i)=>{
  for(const run of report.runs) {
    const s=run.summaries[i];
    assert.equal(s.boundaryDigest,control.boundaryDigest);
    assert.equal(s.rootWdl,control.rootWdl);
    for(const name of ['supports','generatedCandidates','projectionQueries','localSkylineRecords',
      'maximumLocalSkyline','boundaryRecords','maximumBoundary'])
      assert.equal(s.metrics[name],control.metrics[name],name);
  }
  const variants=['baseline','B3-stream'].map(variant=>{
    const samples=report.runs.filter(r=>r.variant===variant).map(r=>r.summaries[i]);
    return {variant,medianMs:median(samples.map(s=>s.elapsedMs)),samplesMs:samples.map(s=>s.elapsedMs),
      maxObservedHeapBytes:Math.max(...samples.map(s=>s.observedHeapBytes)),
      maxRssBytes:Math.max(...samples.map(s=>s.maxRssBytes))};
  });
  return {case:control.case,variants,timeChangePercent:(variants[1].medianMs/variants[0].medianMs-1)*100,
    metrics:control.metrics,boundaryDigest:control.boundaryDigest,rootWdl:control.rootWdl};
});
report.correctness='equal complete boundary digests, pinned hashes and semantic work counters';
report.finishedAt=new Date().toISOString();save();
console.log(JSON.stringify({runId,evidence:path.relative(root,directory),comparison:report.comparison}));

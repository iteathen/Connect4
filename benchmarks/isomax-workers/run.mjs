import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {IsoMaxSolver} from '../../components/isometric/solver.mjs';
import {IsoMaxBranchManager} from '../../components/isometric/execution/branch-manager.mjs';
import {captureProcess} from '../../tools/solver-performance.mjs';
const roots=['717657616532237625','466537327657277224','616767454664457417'];
const emit=data=>fs.writeSync(1,JSON.stringify(data)+'\n');
if(process.argv[2]==='child'){
  const variant=process.argv[3];
  for(const sequence of roots){
    const moves=Array.from(sequence,c=>Number(c)-1), start=performance.now();
    let result,cleanupMs=0;
    if(variant==='serial')result=new IsoMaxSolver().solveMoves(moves);
    else{
      const manager=new IsoMaxBranchManager({workers:Number(variant)});
      try{result=await manager.solveMoves(moves,{timeoutMs:30000});}
      finally{const close=performance.now();await manager.close();cleanupMs=performance.now()-close;}
    }
    emit({kind:'root',variant,sequence,elapsedMs:performance.now()-start,cleanupMs,
      value:result.value,move:result.move,metrics:result.metrics,
      resultReadyMs:result.resultReadyMs??null,maxRssBytes:process.resourceUsage().maxRSS*1024});
  }
}else{
  const root=fileURLToPath(new URL('../../',import.meta.url));
  const git=(...a)=>execFileSync('git',a,{cwd:root,encoding:'utf8',windowsHide:true}).trim();
  if(git('status','--porcelain'))throw new Error('commit source before measuring');
  const variants=[...new Set(['serial','1','2','4',String(Math.max(1,os.availableParallelism()-1))])];
  const runId=new Date().toISOString().replace(/[-:.]/g,'')+'-isomax-workers';
  const directory=path.resolve(root,git('rev-parse','--git-path','solver-performance'),runId);
  fs.mkdirSync(directory,{recursive:true});
  const report={runId,sourceRevision:git('rev-parse','HEAD'),cpu:os.cpus()[0]?.model,node:process.version,
    policy:{roots,selection:'three expensive roots from prior fixed synthetic corpus; not representative of all positions',
      freshSessionPerRoot:true,totalIncludesStartupAndCleanup:true,timeoutMsPerRoot:30000,
      sequence:[...variants,...variants.toReversed(),...variants.slice(2),...variants.slice(0,2)]},runs:[]};
  const save=()=>fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(report,null,2)+'\n',{flush:true});
  save();
  for(const [index,variant]of report.policy.sequence.entries()){
    emit({phase:'start',variant,ordinal:index+1,runId});
    const subdir=path.join(directory,String(index+1)+'-'+variant);
    const captured=await captureProcess({command:process.execPath,
      args:['--max-old-space-size=4096',fileURLToPath(import.meta.url),'child',variant],
      cwd:root,directory:subdir,timeoutMs:120000});
    const records=fs.readFileSync(path.join(subdir,'stdout.log'),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    report.runs.push({variant,...captured,records});save();
    if(captured.exitCode!==0||captured.timedOut||records.length!==roots.length)throw new Error('worker comparison incomplete; inspect logs');
    const baseline=report.runs[0].records;
    records.forEach((r,i)=>assert.deepEqual([r.sequence,r.value,r.move],[baseline[i].sequence,baseline[i].value,baseline[i].move]));
    emit({phase:'finish',variant,elapsedMs:records.reduce((n,r)=>n+r.elapsedMs,0),
      nodes:records.reduce((n,r)=>n+r.metrics.nodes,0)});
  }
  report.comparison=variants.map(variant=>{
    const samples=report.runs.filter(r=>r.variant===variant);
    const samplesMs=samples.map(r=>r.records.reduce((n,s)=>n+s.elapsedMs,0));
    return {variant,samplesMs,medianMs:samplesMs.toSorted((a,b)=>a-b)[1],
      maxActive:Math.max(...samples.flatMap(r=>r.records.map(s=>s.metrics.maxActive??0))),
      nodes:samples.map(r=>r.records.reduce((n,s)=>n+s.metrics.nodes,0)),
      maxRssBytes:Math.max(...samples.flatMap(r=>r.records.map(s=>s.maxRssBytes)))};
  });
  report.sameExactDecisions=true;save();emit({runId,comparison:report.comparison});
}

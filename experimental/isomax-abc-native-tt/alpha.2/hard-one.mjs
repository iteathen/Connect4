#!/usr/bin/env node
// One isolated process per run. Journal each completed process immediately so
// an external time bound never loses earlier evidence. This is a reporting tool.
import {spawnSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {appendFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=dirname(fileURLToPath(import.meta.url));
const variant=(process.argv[2]||'B').toUpperCase();
const rounds=Number(process.argv[3]||1);
const deadline=Number(process.argv[4]||35000);
if(!['A','B','C'].includes(variant)||!Number.isInteger(rounds)||rounds<1||rounds>10)throw Error('invalid variant / rounds');
for(let r=0;r<rounds;r++){
 const before=performance.now();
 const proc=spawnSync(process.execPath,['run.mjs','--variant',variant,'--columns','7','--rows','6',
  '--history','42142544','--tt-mib','32','--node-limit','210000000','--deadline-ms',String(deadline)],
  {cwd:base,encoding:'utf8',timeout:deadline+10000});
 const fullMs=performance.now()-before;
 let datum;try{datum=JSON.parse(proc.stdout.trim().split('\n').at(-1));}catch{datum={status:'FAILED',error:proc.stderr.slice(0,1000)}}
 const item={fixture:'q8-7x6',variant,round:r,nodeVersion:process.version,
  nodeV8:process.versions.v8,ttBudgetMiB:32,fullMs,...datum,exitCode:proc.status};
 appendFileSync(resolve(base,'evidence','hard-runs.jsonl'),JSON.stringify(item)+'\n');
 console.log(JSON.stringify(item));
}

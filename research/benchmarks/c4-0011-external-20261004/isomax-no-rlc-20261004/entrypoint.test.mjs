import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('RLC-disabled entrypoint sends empty board directly to exactly one four-worker solve',()=>{
 const root=mkdtempSync(join(tmpdir(),'isomax-no-rlc-test-'));
 try{
  mkdirSync(join(root,'isomax'));
  writeFileSync(join(root,'wrapper.mjs'),readFileSync(new URL('./wrapper.mjs',import.meta.url)));
  writeFileSync(join(root,'isomax/profile.json'),JSON.stringify({geometry:{columns:7,rows:6},options:{workers:4,rootFrontier:false,sharedSampleMask:0,sharedCacheCapacity:134217728,localCacheCapacity:16777216,timeoutMs:300000}}));
  writeFileSync(join(root,'isomax/index.mjs'),`export const prepareConnect4RbaGeometry=x=>x;
   export function evaluateConnect4RankLocalLanding32(){throw Error('RLC must not execute');}
   let calls=0;
   export async function runLazySmpConnect4Rba32(moves,options){
    if(++calls!==1||moves.length!==0||options.workers!==4||options.sharedCacheCapacity!==134217728||options.localCacheCapacity!==16777216||options.timeoutMs!==300000)throw Error('wrong direct-search input');
    return {status:'EXACT',rootWdl:0,test_stub:true};
   }`);
  const p=spawnSync(process.execPath,[join(root,'wrapper.mjs')],{encoding:'utf8'});
  assert.equal(p.status,0,p.stderr);
  const output=JSON.parse(p.stdout);assert.equal(output.rlc_enabled,false);assert.deepEqual(output.computed_moves,[]);assert.deepEqual(output.trace,[]);assert.equal(output.target,'exact WDL of empty 7x6 root');
  const records=p.stderr.trim().split(/\r?\n/).map(JSON.parse);assert.equal(records.filter(x=>x.event==='search_start').length,1);
 }finally{rmSync(root,{recursive:true,force:true});}
});

// Read-only selected-runtime diagnostic: no solve, cache preload or oracle.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const [library,out]=process.argv.slice(2);
assert.ok(library&&out);
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
const sha=git('rev-parse','HEAD');
assert.equal(sha,'6bbba7c71c60afb1018a22b6d5c03f495f5d2c9e');assert.equal(git('status','--porcelain'),'');
const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4CpcScratch,evaluateConnect4Cpc32}=await load('cpc-connect4');
const g=prepareConnect4RbaGeometry({columns:7,rows:6}),rows=[];
for(const prefix of ['44','444','4444'])for(const suffix of ['',...Array.from({length:7},(_,i)=>String(i+1))]){
  const sequence=prefix+suffix,q=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  const policies=[];
  for(const frontierResponse of [false,true]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,s);
    policies.push({frontierResponse,kind,absoluteInterval:[s.interval[0]-2,s.interval[1]-2],forced:s.forcedColumn[0],preemptionMask:s.preemptionMask32[0]});
  }
  rows.push({prefix,sequence,basisSize:q.basis.length,policies});
}
writeFileSync(out,JSON.stringify({schema:'center-prefix.native-cpc-diagnostic.v1',createdAt:new Date().toISOString(),sourceSha:sha,geometry:'7x6',runtime:process.version,solvedInputsUsed:false,rows},null,2)+'\n');
console.log(JSON.stringify(rows.filter(r=>r.prefix===r.sequence),null,2));

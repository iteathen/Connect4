import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCycleSample,summarizeCycleBlocks} from '../tools/isomax-cycle-analysis.mjs';

const sample=()=>({bootstrapCycles:'11',setupCycles:'19',solveCycles:'70',totalProcessCycles:'100',
  libraryDirty:false,oracleMatched:true,cleanup:true,workersExited:4,workers:4,errors:[],
  totalNodes:100,benchmarkNodeCounts:[40,30,20,10],winner:0,winnerMetrics:{nodes:40},wallMs:10,cpuMs:35});
test('cycle accounting closes and cannot use winner-only nodes as all-worker visits',()=>{
  validateCycleSample(sample());
  assert.throws(()=>validateCycleSample({...sample(),totalProcessCycles:'101'}),/partition/);
  assert.throws(()=>validateCycleSample({...sample(),totalNodes:40}),/node total/);
  assert.throws(()=>validateCycleSample({...sample(),workersExited:3}),/cleanup/);
  validateCycleSample({...sample(),totalNodes:null});
});
test('paired screening exposes larger total-cycle cost despite a local saving',()=>{
  const rows=[];
  for(let block=0;block<4;block++)for(const arm of ['A','B','B','A'])
    rows.push({...sample(),block,arm,totalProcessCycles:arm==='B'?'102':'100',solveCycles:arm==='B'?'69':'70'});
  const s=summarizeCycleBlocks(rows,'candidate');
  assert.ok(s.stats.totalProcessCycles.meanDeltaPct>1);
  assert.ok(s.stats.solveCycles.meanDeltaPct<0);
  assert.equal(s.promotion,'NOT_QUALIFIED_BY_SCREEN');
  assert.throws(()=>summarizeCycleBlocks(rows.slice(1),'candidate'),/incomplete/);
});

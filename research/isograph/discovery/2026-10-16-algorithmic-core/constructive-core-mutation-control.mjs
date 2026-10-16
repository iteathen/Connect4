#!/usr/bin/env node
// Deliberate NEGATIVE controls: never mutate the committed exact core.
// Replays the same independent 4x3 physical checker against temporary,
// single-defect versions loaded only in an ephemeral source evaluator.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const source=readFileSync(join(dir,'exact-q-core.mjs'),'utf8');
const verifier=readFileSync(join(dir,'constructive-core-control.mjs'),'utf8');
function asFunction(src){
  return src.replace(/^#![^\n]*\n/,'').replace(/^import .*;$/gm,'')
    .replace(/^export\s*\{[^}]*\};?$/gm,'').replace(/\bexport\s+/g,'');
}
function buildVariant(coreCode){
  const core=new Function(asFunction(coreCode)+'\nreturn {createExactQCore,CoreBudgetError};')();
  const comparison=new Function('createExactQCore','CoreBudgetError','performance',
    'process','console',asFunction(verifier)+'\nreturn oneBoard;')(
    core.createExactQCore,core.CoreBudgetError,performance,{argv:[]},console);
  return comparison({width:4,height:3,connect:3});
}
const variants=[
  {
    id:'reverse-terminal-winner',
    needle:'return {terminal:mover===0?1:-1,kind:\'win\'};',
    replacement:'return {terminal:mover===0?-1:1,kind:\'win\'};'
  },{
    id:'omit-owner-true-cofactor',
    needle:'const reduced=normalized(own.map(m=>m&~landing));',
    replacement:'const reduced=normalized(own);'
  },{
    id:'omit-opponent-false-cofactor',
    needle:'const blocked=normalized(opposite.filter(m=>(m&landing)===0n));',
    replacement:'const blocked=normalized(opposite);'
  }
];
const baseline=buildVariant(source);
assert.equal(baseline.status,'PASS','correct core must pass its direct physical check');
const mutants=[];
for(const {id,needle,replacement} of variants){
  assert.equal(source.split(needle).length,2,'mutation target must occur exactly once: '+id);
  const mutated=source.replace(needle,replacement);
  const result=buildVariant(mutated);
  assert.equal(result.status,'FAIL','wrong core accepted in mutation: '+id);
  mutants.push({id,detected:true,controlStatus:result.status,
    firstDifference:result.error,
    observedMs:result.totalMs,
    mutationOriginal:needle,mutationSubstitution:replacement});
}
const output={
  schema:'connect4.constructive-core-mutation-controls.v0_1',
  date:'2026-10-16',
  result:'PASS',
  control:'complete 4x3 Connect3 domain',
  baseline:{status:baseline.status,physicalStates:baseline.coverage.physicalNonterminalStates,
    actions:baseline.coverage.physicalLegalOneStepActions},
  mutants,oracleQueries:0,productionCoreModified:false,
  evidenceClass:'internal injected-fault qualification, not an independent mathematical theorem'
};
console.log(JSON.stringify(output,null,2));

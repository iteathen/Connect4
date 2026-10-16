#!/usr/bin/env node
// Deliberate incorrect P1 first-win guard, loaded in-memory only.
// Detect whether the physical-rule and recursive-q validators reject it.
// This intentionally must FAIL its WDL check; source on disk is untouched.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';

const dir=dirname(fileURLToPath(import.meta.url));
const symbolicSource=readFileSync(join(dir,'symbolic-residual-circuit.mjs'),'utf8');
const controlSource=readFileSync(join(dir,'symbolic-circuit-control.mjs'),'utf8');
const needle='const p1NoWinNow=mover===1&&singleton!==undefined?parent.vars1[singleton]:1;';
const wrong='const p1NoWinNow=1; // injected: P1 terminal guard deliberately erased';
assert.equal(symbolicSource.split(needle).length,2,'semantic mutation anchor moved');
function clean(src){
 return src.replace(/^#![^\n]*\n/,'')
   .replace(/^import[\s\S]*?\s+from\s+['"][^'"]+['"];?$/gm,'')
   .replace(/\bexport\s+/g,'');
}
const mutant=new Function(clean(symbolicSource.replace(needle,wrong))+
  '\nreturn {createSymbolicResidualCircuit,SymbolicCircuitBudgetError};')();
const control=new Function(
  'createExactQCore','CoreBudgetError',
  'createSymbolicResidualCircuit','SymbolicCircuitBudgetError',
  'performance','process','console',
  clean(controlSource)+'\nreturn runCircuitControl;')(
    createExactQCore,CoreBudgetError,mutant.createSymbolicResidualCircuit,
    mutant.SymbolicCircuitBudgetError,performance,{argv:[]},console);
const result=control({simplifyByPoset:true});
const failing=result.cases.filter(x=>x.status==='FAIL');
assert.ok(failing.length>0,'corrupt first-win terminal guard evaded validator');
const out={
 schema:'connect4.symbolic-threshold-first-win-mutation.v0_1',
 date:'2026-10-16',
 status:'PASS_NEGATIVE_CONTROL',
 mutation:{needle,replacement:wrong},
 detectedCases:failing.map(x=>({board:x.board,support:x.support,
   error:x.error??null,counterexample:x.counterexample??null})),
 checkedCases:result.cases.map(x=>({board:x.board,support:x.support,status:x.status})),
 productionSourceModified:false,
 qualification:'internal corruption-detection control only; no formal proof'
};
console.log(JSON.stringify(out,null,2));

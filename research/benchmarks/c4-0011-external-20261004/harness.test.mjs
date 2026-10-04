import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyClosure,parseOutput,hashFile,validateReady,validateResult} from './harness-lib.mjs';
test('runtime closure rejects added data and altered executable',()=>{
 const dir=mkdtempSync(join(tmpdir(),'c4-closure-'));
 try{writeFileSync(join(dir,'solver.exe'),'test-only bytes');
 const files={'solver.exe':hashFile(join(dir,'solver.exe'))};verifyClosure(dir,files);
 writeFileSync(join(dir,'book.bin'),'forbidden');assert.throws(()=>verifyClosure(dir,files),/unexpected/);
 rmSync(join(dir,'book.bin'));writeFileSync(join(dir,'solver.exe'),'modified');assert.throws(()=>verifyClosure(dir,files),/hash/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('semantic records reject false cold and exact claims',()=>{
 const good={solver:'pons',start:'empty',ply:0,workers:1,tt_initial_occupied:0,opening_book_loaded:false,persisted_cache_loaded:false,opening_book_pointer_null:true,opening_book_depth:-1};
 assert.equal(validateReady('pons',good),true);
 for(const bad of [{},{...good,ply:1},{...good,opening_book_loaded:true},{...good,tt_initial_occupied:1}])assert.equal(validateReady('pons',bad),false);
 assert.equal(validateResult('pons',{solver:'pons',status:'EXACT',wdl:1}),true);
 for(const bad of [{},{solver:'pons',status:'TIMEOUT',wdl:1},{solver:'pons',status:'EXACT',wdl:null},{solver:'pons',status:'EXACT',wdl:2}])assert.equal(validateResult('pons',bad),false);
});
test('parser preserves raw native records; incomplete smoke is not a result',()=>{
 assert.equal(parseOutput('{"event":"ready","start":"empty"}\n','').result,null);
 const p=parseOutput('native progress\n{"event":"result","wdl":-1,"nodes":123}\n','{"event":"ready"}\n');
 assert.equal(p.result.wdl,-1);assert.equal(p.result.nodes,123);assert.equal(p.ready.event,'ready');
 assert.throws(()=>parseOutput('{"event":"result"}\n{"event":"result"}\n',''),/multiple/);
});

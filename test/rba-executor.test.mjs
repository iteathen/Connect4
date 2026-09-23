import test from 'node:test';
import assert from 'node:assert/strict';
import {KEY_WORDS} from '../components/isometric/execution/shared-tt.mjs';
import {IsoMaxBranchManager} from '../components/isometric/execution/branch-manager.mjs';
import * as tt from '../components/isometric/execution/shared-tt.mjs';
import {prepareWorker7x6,workerStep7x6} from '../components/isometric/execution/worker.mjs';
test('non-WDL RBA boundaries retain distinct numeric failures without an exact value',()=>{
  for(const code of [6,7,8,9,10,11]){
    const t=tt.createTT7x6(4,4),root=tt.intern7x6(t,new Uint32Array(8),0);
    tt.enqueue(t,root); const w=prepareWorker7x6(2,1);
    workerStep7x6(t,w,()=>code);
    assert.equal(t.control[tt.ERROR],code===9?tt.CANCELLED:code>=10?tt.CONTRACT:16+code);
    assert.equal(t.exact[root],0);
  }
});
test('selected TT ABI is the complete eight-word local RBA coordinate',()=>{
  assert.equal(KEY_WORDS,8);
});
test('external reflected root applies caller-frame tie priority before returning witness',async()=>{
  const graph=[null,{rank:0,children:[[2,2],[4,3]]},{rank:1,value:3},{rank:1,value:3}];
  const root=new Uint32Array(KEY_WORDS);root[KEY_WORDS-1]=1;
  const manager=new IsoMaxBranchManager({workers:2,kernelURL:new URL('./fixtures/dag-kernel.mjs',import.meta.url).href,kernelData:{graph}});
  const result=await manager.run(root,{reflected:true});
  assert.equal(result.status,'EXACT');assert.equal(result.move,2);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import * as tt from '../components/isometric/execution/shared-tt.mjs';
import {prepareWorker7x6,workerStep7x6} from '../components/isometric/execution/worker.mjs';
import {managerStep7x6} from '../components/isometric/execution/manager.mjs';

function key(id,rank=0){const k=new Uint32Array(8);k[0]=rank<<21;k[7]=id;return k;}
function setup(rank=0){
  const t=tt.createTT7x6(32,1),q=tt.intern7x6(t,key(1,rank),0);
  t.control[tt.ROOT]=q;tt.enqueue(t,q);return t;
}
function branch(actions,bounds,mask,low=1,high=3){return (t,q,w)=>{
  w.count=actions.length;w.childMask=mask;w.lower=low;w.upper=high;
  for(let i=0;i<actions.length;i++){
    w.actions[i]=actions[i];w.actionLower[i]=bounds[i][0];w.actionUpper[i]=bounds[i][1];
    w.keys[i*8]=(1+(t.keys[q*8]>>>21))<<21;w.keys[i*8+7]=10+i;
  }return 4;
};}

test('q bounds intersect monotonically; a contradiction fails closed',()=>{
  assert.equal(typeof tt.tighten7x6,'function');
  const t=setup(),q=t.control[tt.ROOT];
  assert.equal(tt.tighten7x6(t,q,2,3),1);assert.equal(t.exact[q],0);
  tt.tighten7x6(t,q,1,3);assert.equal(t.lower[q],2);
  tt.tighten7x6(t,q,1,2);assert.equal(t.exact[q],2);
  assert.equal(tt.tighten7x6(t,q,3,3),0);assert.equal(t.control[tt.ERROR],tt.CONFLICT);
  assert.equal(t.exact[q],2);
});

test('one-worker single dependency preserves exact action bounds and root tie',()=>{
  const t=setup(),w=prepareWorker7x6(2,1),q=t.control[tt.ROOT];
  workerStep7x6(t,w,branch([3,2],[[1,2],[2,2]],1,2,2));
  assert.equal(t.control[tt.ERROR],0);const child=t.child[q*7];
  managerStep7x6(t);assert.equal(t.exact[q],2);assert.equal(t.control[tt.DONE],0);
  assert.equal(t.child[q*7+1],-1,'exact action has no materialized child');
  tt.setExact(t,child,1);managerStep7x6(t);
  assert.equal(t.control[tt.DONE],1);assert.equal(t.witness[q],2);
});

test('partial child bounds close a max node and prune an irrelevant sibling',()=>{
  assert.equal(typeof tt.tighten7x6,'function');
  const t=setup(),w=prepareWorker7x6(2,2),q=t.control[tt.ROOT];
  workerStep7x6(t,w,branch([3,2],[[1,3],[1,3]],3));managerStep7x6(t);
  const a=t.child[q*7],b=t.child[q*7+1];
  tt.tighten7x6(t,a,2,3);tt.tighten7x6(t,b,1,1);managerStep7x6(t);
  assert.equal(t.lower[q],2);assert.equal(t.upper[q],3);assert.equal(t.exact[q],0);
  assert.equal(t.child[q*7+1],-1);assert.equal(t.live[b],0);
  tt.tighten7x6(t,a,1,2);managerStep7x6(t);
  assert.equal(t.exact[q],2);assert.equal(t.witness[q],3);assert.equal(t.control[tt.DONE],1);
});

test('minimizing Bellman intervals preserve P0 polarity',()=>{
  assert.equal(typeof tt.tighten7x6,'function');
  const t=setup(1),w=prepareWorker7x6(2,1),q=t.control[tt.ROOT];
  workerStep7x6(t,w,branch([3,2],[[1,2],[3,3]],1));managerStep7x6(t);
  const child=t.child[q*7];assert.equal(t.upper[q],2);assert.equal(t.lower[q],1);
  tt.tighten7x6(t,child,2,3);managerStep7x6(t);
  assert.equal(t.exact[q],2);assert.equal(t.witness[q],3);assert.equal(t.control[tt.DONE],1);
});

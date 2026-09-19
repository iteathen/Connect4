// Cold task-boundary census of the unchanged native worker. Sampling perturbs
// scheduling; neither timing nor duplicate-key counts imply saved subtrees.
import { workerData } from 'node:worker_threads';
import { IsoMaxTaskSolver } from '../../components/isometric/execution/task.mjs';
import { classHash,sampleHash,portableKey } from './portable-q-census.mjs';
const hashes=new WeakMap(), seen=new Set();
let ordinal=0;
const run=IsoMaxTaskSolver.prototype.runTask;
IsoMaxTaskSolver.prototype.runTask=function(task){
  const result=run.call(this,task);
  ordinal++;
  if(ordinal!==1 && ordinal%8!==0)return result;
  const started=performance.now(), pool=this.pool, cache=this.transitionCache, entries=[];
  let memo=hashes.get(pool);if(!memo){memo=new Map();hashes.set(pool,memo);}
  const hash=id=>{let h=memo.get(id);if(h===undefined){h=classHash(pool,id);memo.set(id,h);}return h;};
  let scanned=0, selected=0;
  for(let slot=0;slot<cache.capacity;slot++){
    if(!cache.used[slot])continue;
    scanned++;
    const p0=cache.p0[slot],p1=cache.p1[slot],support=cache.support[slot];
    if((sampleHash(hash(p0),hash(p1),support)&127)!==0)continue;
    selected++;
    const key=portableKey(pool,p0,p1,support);
    if(seen.has(key))continue;
    seen.add(key);
    entries.push({key,value:cache.values[slot],observedAt:performance.timeOrigin+performance.now(),task:ordinal,taskPly:task.moves.length});
  }
  return {...result,overlap:{scanned,selected,entries,censusMs:performance.now()-started,ordinal}};
};
await import(workerData.originalWorkerUrl);

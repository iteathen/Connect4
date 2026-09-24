import { enter, leave, valid, release, recycle, enqueue, signal, takeEvent,
  tighten7x6, fail, CONTRACT, CONFLICT, ROOT, ROOT_REFLECTED, DONE, STOP, WAKE, ACTIONS, KEY_WORDS, PRUNED_EDGES } from './shared-tt.mjs';

// E2, manager-only under the TT transaction. PRESERVE THROUGH ALL CALLEES.
// No game evaluation, private identity table, replay, dynamic aggregate, or
// per-node message. Canonical topology is the same storage workers publish.
// An edge owns exactly one child pin, pending or attached, never both.
function releaseEdge7x6(t,e){
  const child=t.child[e];
  if(child<0)return;
  if(t.edgeAttached[e]){
    const previous=t.edgePrev[e],next=t.edgeNext[e];
    if(previous===-1)t.parentHead[child]=next;
    else t.edgeNext[previous]=next;
    if(next!==-1)t.edgePrev[next]=previous;
    t.edgeAttached[e]=0;
  }
  t.child[e]=-1;
  release(t,child,t.childGeneration[e]);
}
function detach7x6(t,q){
  const base=q*ACTIONS,count=t.count[q];t.count[q]=0;
  for(let i=0;i<count;i++)releaseEdge7x6(t,base+i);
  t.phase[q]=4;
}

// Center-first priority is physical-action interpretation, not q identity.
function priority7x6(action){return action<3?(3-action)*2-1:(action-3)*2;}

function reconcile7x6(t,q){
  if(!t.refs[q]){
    if(t.count[q])detach7x6(t,q);
    recycle(t,q);return;
  }
  const base=q*ACTIONS,root=q===t.control[ROOT];
  if(t.phase[q]===2){
    for(let i=0;i<t.count[q];i++){
      const e=base+i,child=t.child[e];
      if(child<0)continue; // Scalar action evidence has no child reference.
      if(!valid(t,child,t.childGeneration[e])){fail(t,CONTRACT);return;}
      const head=t.parentHead[child];
      t.edgeNext[e]=head;t.edgePrev[e]=-1;
      if(head!==-1)t.edgePrev[head]=e;
      t.parentHead[child]=e;t.edgeAttached[e]=1;
    }
    t.phase[q]=3;
  }
  if(t.phase[q]===3){
    const minimize=(t.keys[q*KEY_WORDS]>>>21)&1;
    let lower=minimize?4:0,upper=lower;
    for(let i=0;i<t.count[q];i++){
      const e=base+i,child=t.child[e];
      let lo=t.edgeLower[e],hi=t.edgeUpper[e];
      if(child>=0){
        if(t.lower[child]>lo)lo=t.lower[child];
        if(t.upper[child]<hi)hi=t.upper[child];
      }
      // Only universally valid Bellman directions may constrain an action:
      // max upper bounds every child above; min lower bounds every child below.
      if(minimize){if(t.lower[q]>lo)lo=t.lower[q];}
      else if(t.upper[q]<hi)hi=t.upper[q];
      if(lo>hi){fail(t,CONFLICT);return;}
      t.edgeLower[e]=lo;t.edgeUpper[e]=hi;
      if(minimize?lo<lower:lo>lower)lower=lo;
      if(minimize?hi<upper:hi>upper)upper=hi;
      if(child>=0 && !tighten7x6(t,child,lo,hi))return;
    }
    if(!tighten7x6(t,q,lower,upper))return;
    const value=t.exact[q];
    let first=7,witness=-1;
    for(let i=0;i<t.count[q];i++){
      const e=base+i,lo=t.edgeLower[e],hi=t.edgeUpper[e];
      if(value && (minimize?lo<=value:hi>=value)){
        const order=priority7x6(root&&t.control[ROOT_REFLECTED]?6-t.edgeAction[e]:t.edgeAction[e]);
        if(order<first){first=order;witness=(minimize?hi===value:lo===value)?t.edgeAction[e]:-1;}
      }
      if(t.child[e]>=0 && (lo===hi || (minimize?lo>t.upper[q]:hi<t.lower[q]))){
        if(lo!==hi)t.stats[PRUNED_EDGES]++;
        releaseEdge7x6(t,e); // Keep bounds; discard only the now-unneeded pin.
      }
    }
    if(value && (!root||witness>=0)){
      t.witness[q]=witness;detach7x6(t,q);
    }else{
      for(let i=0;i<t.count[q];i++)if(t.child[base+i]>=0)enqueue(t,t.child[base+i]);
    }
  }
  // Partial bounds are evidence too. Rank strictly increases on dependencies,
  // so notifications propagate up a DAG. Event coalescing prevents duplicate rows.
  for(let e=t.parentHead[q];e!==-1;e=t.edgeNext[e])signal(t,(e/ACTIONS)|0);
  if(root && t.exact[q] && !t.count[q])Atomics.store(t.control,DONE,1);
  recycle(t,q);
}

export function managerStep7x6(t,budget=64){
  if(!enter(t,1))return 0;
  let processed=0;
  while(processed<budget && !Atomics.load(t.control,STOP)){
    const q=takeEvent(t);if(q===-1)break;
    reconcile7x6(t,q);processed++;
  }
  leave(t);
  if(processed){Atomics.add(t.control,WAKE,1);Atomics.notify(t.control,WAKE);}
  return processed;
}

// E2 enclosing loop, included in the transitive hot audit and cycle measurement.
export function runManagerLoop7x6(t){
  while(!Atomics.load(t.control,STOP)&&!Atomics.load(t.control,DONE)){
    const observed=Atomics.load(t.control,WAKE);
    if(!managerStep7x6(t))Atomics.wait(t.control,WAKE,observed,1);
  }
}

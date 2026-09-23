import {prepareRba7x6} from './prepare.mjs';
import {ROOT,ROOT_REFLECTED,STOP} from '../execution/shared-tt.mjs';
import {QUERY_UNCOVERED,INTERRUPTED} from './layout.mjs';
import {prepareFrontArena7x6,buildFour7x6,queryFour7x6} from './front.mjs';

// COLD. Worker-private algebra arena only; no recursive game-search stack.
export function prepare(w,data){
  w.g=prepareRba7x6();
  w.order=new Uint32Array([3,2,4,1,5,0,6]);
  w.boundary=prepareFrontArena7x6(data?.boundaryDepth??2,data?.boundaryCapacity??256,data?.boundaryBudget??100000);
  w.boundaryCalls=0;w.boundaryClosures=0;w.boundarySteps=0;w.boundaryFailures=0;w.boundaryStatus=0;
}

// E0/E1 CONTRACT — PRESERVE in all callees. JSMinSys numeric substrate only.
// No strings or string indexing: character data, if ever needed, is indexed
// preallocated character-code storage. No objects/allocation, promises, copy
// APIs, board reconstruction, dynamic stacks or forced unwinding on retirement.
// NO FALLBACK: an uncovered query or incomplete/capacity-limited construction
// must stay non-WDL. Never convert it to recursive game enumeration or silently
// restart it. General retained RBA refinement is not implemented by this kernel.
export function evaluate(t,q,w){
  if(Atomics.load(t.control,STOP))return INTERRUPTED;
  const base=q*8;
  if(t.keys[base+1]){w.witness=-1;return t.keys[base+1];}
  w.boundaryCalls++;
  const outcome=buildFour7x6(w.g,w.boundary,t.keys[base],0,w.boundary.depth);
  w.boundarySteps+=w.boundary.steps;w.boundaryStatus=outcome;
  if(outcome){w.boundaryFailures++;return outcome;}
  const interval=queryFour7x6(w.boundary,0,t.keys,base),value=interval&3;
  if(value===(interval>>>2)){
    // Value equality does not resolve a caller-frame action tie. The first
    // possibly optimal action must itself have enough evidence for witness.
    for(let i=0;i<7;i++){
      let c=w.order[i];if(q===t.control[ROOT] && t.control[ROOT_REFLECTED])c=6-c;
      if(((t.keys[base]>>>(c*3))&7)===6)continue;
      const action=queryFour7x6(w.boundary,w.boundary.actionBase+c*4,t.keys,base);
      const low=action&3,high=action>>>2,mover=(t.keys[base]>>>21)&1;
      if(mover?low>value:high<value)continue;
      if(mover?high===value:low===value){w.witness=c;w.boundaryClosures++;return value;}
      break;
    }
  }
  w.boundaryStatus=QUERY_UNCOVERED;
  return QUERY_UNCOVERED;
}

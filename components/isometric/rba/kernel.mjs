import {prepareRba7x6,prepareCoordinateScratch7x6} from './prepare.mjs';
import {cofactor7x6,canonicalize7x6} from './coordinate.mjs';
import {ROOT,ROOT_REFLECTED,STOP} from '../execution/shared-tt.mjs';
import {BRANCH,INTERRUPTED} from './layout.mjs';
import {prepareFrontArena7x6,buildFour7x6,queryFour7x6} from './front.mjs';

// COLD. Worker-private algebra arena only; no recursive game-search stack.
export function prepare(w,data){
  w.g=prepareRba7x6();
  w.scratch=prepareCoordinateScratch7x6();w.transitions=0;w.actionClosures=0;w.actionsPruned=0;
  w.order=new Uint32Array([3,2,4,1,5,0,6]);
  w.boundary=prepareFrontArena7x6(data?.boundaryDepth??2,data?.boundaryCapacity??256,data?.boundaryBudget??100000);
  w.boundaryCalls=0;w.boundaryClosures=0;w.boundarySteps=0;w.boundaryFailures=0;w.boundaryStatus=0;
}

// E0/E1 CONTRACT — PRESERVE in all callees. JSMinSys numeric substrate only.
// No strings or string indexing: character data, if ever needed, is indexed
// preallocated character-code storage. No objects/allocation, promises, copy
// APIs, board reconstruction, dynamic stacks or forced unwinding on retirement.
// NO ALTERNATE SOLVER: unresolved queries continue through exact RBA cofactors,
// canonical RBA q children and this same shared-TT interval procedure. Search
// scheduling is not a representation change. Preserve action bounds on every
// published edge; never discard them and enter a private enumeration backend.
// Incomplete/capacity-limited construction stays non-WDL, never guessed bounds.
export function evaluate(t,q,w){
  if(Atomics.load(t.control,STOP))return INTERRUPTED;
  const base=q*8;
  if(t.keys[base+1]){w.witness=-1;return t.keys[base+1];}
  w.boundaryCalls++;
  const outcome=buildFour7x6(w.g,w.boundary,t.keys[base],0,w.boundary.depth);
  w.boundarySteps+=w.boundary.steps;w.boundaryStatus=outcome;
  if(outcome){w.boundaryFailures++;return outcome;}
  const interval=queryFour7x6(w.boundary,0,t.keys,base),value=interval&3;
  w.lower=value;w.upper=interval>>>2;
  if(value===(interval>>>2)){
    if(q!==t.control[ROOT]){w.witness=-1;w.boundaryClosures++;return value;}
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
  let count=0,mask=0;
  const mover=(t.keys[base]>>>21)&1;
  for(let i=0;i<7;i++){
    let c=w.order[i];if(q===t.control[ROOT] && t.control[ROOT_REFLECTED])c=6-c;
    if(((t.keys[base]>>>(c*3))&7)===6)continue;
    // At horizon zero no action artifact exists. [1,3] is the sound interval.
    const action=w.boundary.depth?queryFour7x6(w.boundary,w.boundary.actionBase+c*4,t.keys,base):13;
    let low=action&3,high=action>>>2;
    w.actions[count]=c;
    if(low===high)w.actionClosures++;
    else if(mover?low>w.upper:high<w.lower)w.actionsPruned++;
    else{
      const terminal=cofactor7x6(w.g,t.keys,base,w.boundary.basis,0,w.boundary.size[0],c,
        w.keys,count*8,w.scratch.basis,0,w.scratch.seen);
      w.transitions++;
      if(terminal<0 || (terminal && (terminal<low||terminal>high)))return 0;
      if(terminal){low=terminal;high=terminal;w.actionClosures++;}
      else{canonicalize7x6(w.g,w.keys,count*8,w.scratch);mask|=1<<count;}
    }
    w.actionLower[count]=low;w.actionUpper[count]=high;count++;
  }
  w.count=count;w.childMask=mask;
  return BRANCH;
}

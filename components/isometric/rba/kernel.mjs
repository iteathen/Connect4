import {prepareRba7x6,prepareCoordinateScratch7x6} from './prepare.mjs';
import {basis7x6,cofactor7x6,canonicalize7x6} from './coordinate.mjs';
import {ROOT,ROOT_REFLECTED,STOP} from '../execution/shared-tt.mjs';
import {BRANCH,CONTINUE,FALLBACK_SELECTED,INTERRUPTED} from './layout.mjs';
import {prepareFrontArena7x6,buildFour7x6,queryFour7x6} from './front.mjs';

// COLD. Private continuation is numeric fixed storage, never a parallel q TT.
export function prepare(w,data){
  w.g=prepareRba7x6();w.scratch=prepareCoordinateScratch7x6();
  w.stack=new Uint32Array(43*8);w.basis=new Uint32Array(43*69);
  w.size=new Uint32Array(43);w.phase=new Uint32Array(43);
  w.next=new Uint32Array(43);w.best=new Uint32Array(43);
  w.move=new Int32Array(43);w.pending=new Int32Array(43);
  w.order=new Uint32Array([3,2,4,1,5,0,6]);
  w.depth=0;w.nodes=0;w.transitions=0;w.quantum=data?.quantum??256;
  w.boundary=prepareFrontArena7x6(data?.boundaryDepth??2,data?.boundaryCapacity??256,data?.boundaryBudget??100000);
  w.allowFallback=data?.allowFallback===false?0:1;
  w.boundaryCalls=0;w.boundaryClosures=0;w.boundarySteps=0;w.boundaryFailures=0;w.boundaryStatus=0;
  if(!Number.isInteger(w.quantum)||w.quantum<1||w.quantum>65536)throw new RangeError('kernel quantum');
}

// E0/E1 CONTRACT — PRESERVE in all callees. JSMinSys numeric substrate only.
// No strings or string indexing: character data, if ever needed, is indexed
// preallocated character-code storage. No objects/allocation, promises, copy
// APIs, board reconstruction, dynamic stacks or forced unwinding on retirement.
// Exact fallback enumerates native RBA coordinates; it is reported as fallback,
// not as symbolic four-front closure. Extreme-value cutoffs remain exact.
export function evaluate(t,q,w,expose){
  if(Atomics.load(t.control,STOP))return INTERRUPTED;
  if(w.started){
    w.depth=0;w.phase[0]=0;
    const base=q*8;
    if(t.keys[base+1]){w.witness=-1;return t.keys[base+1];}
    w.boundaryCalls++;
    const outcome=buildFour7x6(w.g,w.boundary,t.keys[base],0,w.boundary.depth);
    w.boundarySteps+=w.boundary.steps;w.boundaryStatus=outcome;
    if(outcome){w.boundaryFailures++;if(!w.allowFallback)return outcome;}
    else{
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
      if(!w.allowFallback)return 8;
    }
    w.size[0]=basis7x6(w.g,t.keys[base],w.basis,0,w.scratch.seen);
    if(expose){
      let count=0;
      for(let i=0;i<7;i++){
        let c=w.order[i];if(q===t.control[ROOT] && t.control[ROOT_REFLECTED])c=6-c;
        if(((t.keys[base]>>>(c*3))&7)===6)continue;
        cofactor7x6(w.g,t.keys,base,w.basis,0,w.size[0],c,w.keys,count*8,w.scratch.basis,0,w.scratch.seen);
        w.transitions++;
        canonicalize7x6(w.g,w.keys,count*8,w.scratch);w.actions[count++]=c;
      }
      if(count>=2){w.count=count;return BRANCH;}
    }
    return FALLBACK_SELECTED;
  }
  for(let work=0;work<w.quantum;work++){
    let d=w.depth;
    const input=d===0?t.keys:w.stack,base=d===0?q*8:(d-1)*8;
    const minimize=(input[base]>>>21)&1;
    let value=0;
    if(!w.phase[d]){
      w.nodes++;w.phase[d]=1;w.next[d]=0;w.best[d]=minimize?4:0;w.move[d]=-1;
      if(input[base+1])value=input[base+1];
      else w.size[d]=basis7x6(w.g,input[base],w.basis,d*69,w.scratch.seen);
    }
    if(!value){
      let c=-1;
      while(w.next[d]<7){
        c=w.order[w.next[d]++];
        if(d===0 && q===t.control[ROOT] && t.control[ROOT_REFLECTED])c=6-c;
        if(((input[base]>>>(c*3))&7)<6)break;
        c=-1;
      }
      if(c>=0){
        w.pending[d]=c;
        cofactor7x6(w.g,input,base,w.basis,d*69,w.size[d],c,w.stack,d*8,w.basis,(d+1)*69,w.scratch.seen);
        w.transitions++;w.depth=d+1;w.phase[d+1]=0;continue;
      }
      value=w.best[d];
    }
    if(d===0){w.witness=w.move[0];return value;}
    d--;w.depth=d;
    const parentMeta=d===0?t.keys[q*8]:w.stack[(d-1)*8];
    const parentMin=(parentMeta>>>21)&1;
    if(parentMin?value<w.best[d]:value>w.best[d]){w.best[d]=value;w.move[d]=w.pending[d];}
    if(w.best[d]===(parentMin?1:3))w.next[d]=7;
  }
  return CONTINUE;
}

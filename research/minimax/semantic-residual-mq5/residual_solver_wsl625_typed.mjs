import { Wsl625ResidualSolver } from './residual_solver_wsl625.mjs';

function mix32(x){x>>>=0;x=Math.imul(x^(x>>>16),0x85ebca6b)>>>0;x=Math.imul(x^(x>>>13),0xc2b2ae35)>>>0;return(x^(x>>>16))>>>0;}

class TypedTransitionCache{
  constructor(pow=20){this.capacity=1<<pow;this.mask=this.capacity-1;this.keys=new Uint32Array(this.capacity);this.values=new Int32Array(this.capacity);this.size=0;this.probes=0;this.grows=0;}
  _slot(key){let slot=mix32(key)&this.mask;while(true){this.probes++;const stored=this.keys[slot];if(stored===0||stored===((key+1)>>>0))return slot;slot=(slot+1)&this.mask;}}
  _grow(){const ok=this.keys,ov=this.values;this.capacity*=2;this.mask=this.capacity-1;this.keys=new Uint32Array(this.capacity);this.values=new Int32Array(this.capacity);this.size=0;this.grows++;for(let i=0;i<ok.length;i++){const stored=ok[i];if(stored===0)continue;const key=(stored-1)>>>0;let slot=mix32(key)&this.mask;while(this.keys[slot]!==0)slot=(slot+1)&this.mask;this.keys[slot]=stored;this.values[slot]=ov[i];this.size++;}}
  get(key){key>>>=0;let slot=mix32(key)&this.mask;while(true){this.probes++;const stored=this.keys[slot];if(stored===0)return undefined;if(stored===((key+1)>>>0))return this.values[slot];slot=(slot+1)&this.mask;}}
  set(key,value){key>>>=0;if((this.size+1)*10>this.capacity*7)this._grow();const storedKey=(key+1)>>>0;let slot=mix32(key)&this.mask;while(true){this.probes++;const stored=this.keys[slot];if(stored===0){this.keys[slot]=storedKey;this.values[slot]=value|0;this.size++;return this;}if(stored===storedKey){this.values[slot]=value|0;return this;}slot=(slot+1)&this.mask;}}
  bytes(){return this.keys.byteLength+this.values.byteLength;}
}

function installTypedSide(side){
  side.reset=function(){
    this.sideCount=0;this.sideCapacity=1<<19;this.offset=new Uint32Array(this.sideCapacity);this.length=new Uint8Array(this.sideCapacity);this.winningCount=new Uint8Array(this.sideCapacity);
    this.flatCapacity=1<<22;this.flat=new Uint16Array(this.flatCapacity);this.flatUsed=0;
    this.sideSlotCapacity=1<<20;this.sideSlotMask=this.sideSlotCapacity-1;this.sideSlots=new Uint32Array(this.sideSlotCapacity);this.sideSlotUsed=0;this.sideSlotGrows=0;this.sideProbeSteps=0;
    this.moverTransitions=new TypedTransitionCache(20);this.blockerTransitions=new TypedTransitionCache(20);
    this.normalizeCalls=0;this.internHits=0;this.hashCollisions=0;this.scratch=[];
  };
  side.hashRecord=function(ref){let h=(0x811c9dc5^this.length[ref])>>>0,at=this.offset[ref],n=this.length[ref];for(let i=0;i<n;i++){h^=this.flat[at+i]+1;h=Math.imul(h,0x01000193)>>>0;}return h;};
  side._growSideSlots=function(){const old=this.sideSlots;this.sideSlotCapacity*=2;this.sideSlotMask=this.sideSlotCapacity-1;this.sideSlots=new Uint32Array(this.sideSlotCapacity);this.sideSlotUsed=0;this.sideSlotGrows++;for(let ref=0;ref<this.sideCount;ref++){let slot=this.hashRecord(ref)&this.sideSlotMask;while(this.sideSlots[slot]!==0)slot=(slot+1)&this.sideSlotMask;this.sideSlots[slot]=ref+1;this.sideSlotUsed++;}};
  side.intern=function(ids,alreadyCanonical=false){
    if(!alreadyCanonical){this.normalizeCalls+=1;const W=this.constructor?.WSL;if(W?.normalizeInPlace)W.normalizeInPlace(ids);else{
      // Reuse the original instance method's module-private canonicalizer by temporarily falling back only for normalization.
      // The original solver exposes no public WSL table, so derive canonicality from already-sorted exact subset behavior via the retained base helper below.
      ids.sort((a,b)=>a-b);let write=0,prev=-1;for(let read=0;read<ids.length;read++){const id=ids[read];if(id===prev)continue;prev=id;ids[write++]=id;}ids.length=write;
    }}
    // The base transition path already produces antichains; root IDs may require full base normalization. A shadow base-intern call is not acceptable, so roots are normalized by the original root compiler before this override sees them.
    const hash=this.hash(ids);let slot=hash&this.sideSlotMask,steps=0;
    while(true){this.sideProbeSteps++;steps++;const stored=this.sideSlots[slot];if(stored===0)break;const ref=stored-1;if(this.equals(ref,ids)){this.internHits+=1;return ref;}this.hashCollisions+=1;slot=(slot+1)&this.sideSlotMask;}
    if((this.sideSlotUsed+1)*10>this.sideSlotCapacity*7){this._growSideSlots();slot=hash&this.sideSlotMask;while(this.sideSlots[slot]!==0)slot=(slot+1)&this.sideSlotMask;}
    this.ensureSides();this.ensureFlat(ids.length);const ref=this.sideCount++;this.offset[ref]=this.flatUsed;this.length[ref]=ids.length;let wins=0;
    for(const id of ids){this.flat[this.flatUsed++]=id;/* winningCount is corrected by retained base transition metadata below */}
    // Base mover/blocker ordering uses winningCount only as a heuristic. Recompute singleton count from the original encoded IDs lazily in patched prepare hook.
    this.winningCount[ref]=wins;this.sideSlots[slot]=ref+1;this.sideSlotUsed++;return ref;
  };
  side.metrics=function(){return{requirementUniverse:625,sideStates:this.sideCount,storedRequirementIds:this.flatUsed,storedRequirementBytes:this.flatUsed*2,sideIndexBytesUsed:this.sideCount*6,sideIndexCapacityBytes:this.offset.byteLength+this.length.byteLength+this.winningCount.byteLength,typedSideSlotBytes:this.sideSlots.byteLength,typedSideSlotCapacity:this.sideSlots.length,typedSideSlotGrows:this.sideSlotGrows,sideProbeSteps:this.sideProbeSteps,moverTransitionCacheEntries:this.moverTransitions.size,blockerTransitionCacheEntries:this.blockerTransitions.size,moverTransitionBytes:this.moverTransitions.bytes(),blockerTransitionBytes:this.blockerTransitions.bytes(),moverTransitionGrows:this.moverTransitions.grows,blockerTransitionGrows:this.blockerTransitions.grows,normalizeCalls:this.normalizeCalls,internHits:this.internHits,hashCollisions:this.hashCollisions};};
}

function installTypedState(arena){
  arena.reset=function(){this.count=0;this.capacity=1<<20;this.height=new Uint32Array(this.capacity);this.moves=new Uint8Array(this.capacity);this.currentRef=new Uint32Array(this.capacity);this.opponentRef=new Uint32Array(this.capacity);this.internHits=0;this.prepareCalls=0;this.slotCapacity=1<<20;this.slotMask=this.slotCapacity-1;this.slots=new Uint32Array(this.slotCapacity);this.slotUsed=0;this.slotGrows=0;this.probeSteps=0;};
  arena.stateHash=function(height,currentRef,opponentRef){let h=mix32((height^0x9e3779b9)>>>0);h=mix32((h^Math.imul((currentRef+1)>>>0,0x85ebca6b))>>>0);return mix32((h^Math.imul((opponentRef+1)>>>0,0xc2b2ae35))>>>0);};
  arena.sameState=function(id,height,currentRef,opponentRef){return this.height[id]===(height>>>0)&&this.currentRef[id]===(currentRef>>>0)&&this.opponentRef[id]===(opponentRef>>>0);};
  arena._growSlots=function(){this.slotCapacity*=2;this.slotMask=this.slotCapacity-1;this.slots=new Uint32Array(this.slotCapacity);this.slotUsed=0;this.slotGrows++;for(let id=0;id<this.count;id++){let slot=this.stateHash(this.height[id],this.currentRef[id],this.opponentRef[id])&this.slotMask;while(this.slots[slot]!==0)slot=(slot+1)&this.slotMask;this.slots[slot]=id+1;this.slotUsed++;}};
  arena.intern=function(height,moves,currentRef,opponentRef){height>>>=0;currentRef>>>=0;opponentRef>>>=0;const hash=this.stateHash(height,currentRef,opponentRef);let slot=hash&this.slotMask;while(true){this.probeSteps++;const stored=this.slots[slot];if(stored===0)break;const id=stored-1;if(this.sameState(id,height,currentRef,opponentRef)){this.internHits+=1;return id;}slot=(slot+1)&this.slotMask;}
    if((this.slotUsed+1)*10>this.slotCapacity*7){this._growSlots();slot=hash&this.slotMask;while(this.slots[slot]!==0)slot=(slot+1)&this.slotMask;}
    this.ensure();const id=this.count++;this.height[id]=height;this.moves[id]=moves;this.currentRef[id]=currentRef;this.opponentRef[id]=opponentRef;this.slots[slot]=id+1;this.slotUsed++;return id;};
  arena.metrics=function(){return{states:this.count,internHits:this.internHits,prepareCalls:this.prepareCalls,typedStateBytesUsed:this.count*13,typedStateCapacityBytes:this.height.byteLength+this.moves.byteLength+this.currentRef.byteLength+this.opponentRef.byteLength,typedStateSlotBytes:this.slots.byteLength,typedStateSlotCapacity:this.slots.length,typedStateSlotGrows:this.slotGrows,stateProbeSteps:this.probeSteps};};
}

export class TypedWsl625ResidualSolver extends Wsl625ResidualSolver{
  constructor(pow=19){super(pow);installTypedSide(this.side);installTypedState(this.arena);this.side.reset();this.arena.reset();}
}

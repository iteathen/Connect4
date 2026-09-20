import { parentPort } from 'node:worker_threads';
import { ResidualPool } from '../residual-pool.mjs';
import { IsometricState } from '../state.mjs';
import {
  CTRL_ABORT, CTRL_FAILURE, CTRL_OCC_NEXT, CTRL_PUB_WAKE, CTRL_SESSION, CTRL_WORK_NEXT,
  MAX_MOVES, OCC_EXACT, OCC_LINKED, OCC_PUBLISHED, OCC_RETIRED,
  OCC_ROLE_CONTINUATION, PRIORITY_BANDS,
  PUB_CONTINUATION_START, PUB_EXACT, PUB_FAILURE, PUB_OCCURRENCE, PUB_OCCURRENCE_EXACT,
  PUB_RETIRE_OCCURRENCE, PUB_WORK_RETIRED,
  SESSION_RUNNING, WORK_EXACT, WORK_READY, WORK_RETIRED, WORK_RUNNING, WORK_UNUSED, WORK_WRITING,
  allocateWork, dequeuePublication, enqueueWork, openSurplusPool, releaseOccurrence, releaseWork, stopSurplusPool,
} from './surplus-pool.mjs';

if (!parentPort) throw new Error('IsoMax surplus reconciler requires parentPort');

function positive(value,name,maximum=1<<28){
  if(!Number.isSafeInteger(value)||value<1||value>maximum)throw new RangeError('invalid '+name);
  return value;
}
function nextPowerOfTwo(value){let n=1;while(n<value)n*=2;return n;}
function mix32(value){
  let x=value|0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;
  x=Math.imul(x,0x846ca68b);x^=x>>>16;return x|0;
}
function hashQ(a,b,c){
  let h=0x811c9dc5|0;h=Math.imul(h^mix32(a),0x01000193);
  h=Math.imul(h^mix32(b),0x01000193);h=Math.imul(h^mix32(c|0),0x01000193);
  return mix32(h);
}

class SurplusReconciler {
  constructor(message){
    this.shared=openSurplusPool(message.pool);
    this.rootMoves=message.moves;this.rootPly=this.rootMoves.length;
    this.maxQ=positive(message.maxQ??this.shared.workCapacity,'maxQ');
    this.progressIntervalMs=Math.max(100,message.progressIntervalMs??1000);

    this.pool=new ResidualPool();
    this.state=new IsometricState({pool:this.pool,moves:this.rootMoves});
    this.pool.prepareSearchStorage(Math.min(2**26,Math.max(4096,4*this.maxQ)));
    this.key=new Int32Array(3);this.pub=new Int32Array(8);this.workScratch=new Int32Array(2);

    this.qP0=new Int32Array(this.maxQ);this.qP1=new Int32Array(this.maxQ);
    this.qSupport=new Uint32Array(this.maxQ);this.qHash=new Int32Array(this.maxQ);
    this.qExact=new Uint8Array(this.maxQ);this.qValue=new Int8Array(this.maxQ);
    this.qWork=new Int32Array(this.maxQ);this.qWork.fill(-1);
    this.qDemand=new Uint32Array(this.maxQ);
    this.qOccHead=new Int32Array(this.maxQ);this.qOccHead.fill(-1);
    this.qPriority=new Uint8Array(this.maxQ);
    this.qRunningOcc=new Int32Array(this.maxQ);this.qRunningOcc.fill(-1);
    this.qAlive=new Uint8Array(this.maxQ);
    this.qFree=new Int32Array(this.maxQ);
    this.qFreeCount=0;
    this.qCount=0; // high-water index, not live cardinality
    this.qActiveCount=0;
    this.qTombstones=0;

    const hashCapacity=nextPowerOfTwo(this.maxQ*2);
    this.qSlots=new Int32Array(hashCapacity);this.qSlots.fill(-1);this.qMask=hashCapacity-1;

    this.occQ=new Int32Array(this.shared.occurrenceCapacity);this.occQ.fill(-1);
    this.occNext=new Int32Array(this.shared.occurrenceCapacity);this.occNext.fill(-1);

    this.rootQ=-1;this.rootWork=-1;this.activeWorkCount=0;
    this.seenDead=new Uint8Array(this.shared.workerCount);
    this.started=performance.now();this.lastProgress=this.started;
    this.metrics={
      canonicalQ:0,qReuses:0,occurrences:0,canonicalWorkCreated:0,
      duplicateOccurrences:0,exactBroadcasts:0,occRetired:0,
      readyRetired:0,runningRetireSignals:0,workRequeues:0,
      workerDeathRequeues:0,stalePublications:0,visibilityOnlyOccurrences:0,
      localOccurrenceExact:0,managerReplayApplies:0,managerReplayUndos:0,
      priorityUpdates:0,publications:0,failures:0,maxWork:0,maxOccurrences:0,
      maxActiveWork:0,runningContinuations:0,duplicateRunningContinuations:0,
      continuationExact:0,qReclaims:0,exactQEvictions:0,qHashRebuilds:0,
      maxActiveCanonicalQ:0,
    };
  }

  replay(slot){
    const length=Atomics.load(this.shared.occPathLength,slot);
    if(length<this.rootPly||length>MAX_MOVES)throw new Error('invalid surplus replay length');
    const base=slot*MAX_MOVES;
    for(let i=0;i<this.rootPly;i++)if(this.shared.occPath[base+i]!==this.rootMoves[i])
      throw new Error('surplus replay escaped root');

    let common=Math.min(this.state.ply,length),prefix=0;
    while(prefix<common&&(this.state.moveCells[prefix]%7)===this.shared.occPath[base+prefix])prefix++;
    common=prefix;if(common<this.rootPly)throw new Error('surplus reconciler lost root prefix');
    while(this.state.ply>common){this.state.undo();this.metrics.managerReplayUndos++;}
    for(let i=common;i<length;i++){
      const column=this.shared.occPath[base+i];
      if(!this.state.canPlay(column))throw new Error('invalid surplus legal replay');
      this.state.applyUnchecked(column);this.metrics.managerReplayApplies++;
    }
    this.state.gameplayKey(this.key);return this.internCurrent();
  }

  rebuildQHash(){
    this.qSlots.fill(-1);
    this.qTombstones=0;
    for(let q=0;q<this.qCount;q++){
      if(!this.qAlive[q])continue;
      let bucket=this.qHash[q]&this.qMask;
      while(this.qSlots[bucket]>=0)bucket=(bucket+1)&this.qMask;
      this.qSlots[bucket]=q;
    }
    this.metrics.qHashRebuilds++;
  }

  removeQHash(q){
    const hash=this.qHash[q];
    let bucket=hash&this.qMask;
    for(let steps=0;steps<this.qSlots.length;steps++){
      const entry=this.qSlots[bucket];
      if(entry===-1)return false;
      if(entry===q){
        this.qSlots[bucket]=-2;
        this.qTombstones++;
        return true;
      }
      bucket=(bucket+1)&this.qMask;
    }
    return false;
  }

  reclaimQ(q,evictExact=false){
    if(q<0||q>=this.qCount||!this.qAlive[q]||q===this.rootQ)return false;
    if(this.qDemand[q]!==0||this.qWork[q]>=0||this.qRunningOcc[q]>=0||this.qOccHead[q]!==-1)return false;
    if(this.qExact[q]&&!evictExact)return false;
    if(!this.removeQHash(q))throw new Error('canonical q missing from hash during reclaim');

    this.qAlive[q]=0;
    this.qExact[q]=0;this.qValue[q]=0;this.qWork[q]=-1;this.qDemand[q]=0;
    this.qOccHead[q]=-1;this.qPriority[q]=0;this.qRunningOcc[q]=-1;
    this.qFree[this.qFreeCount++]=q;
    if(this.qActiveCount>0)this.qActiveCount--;
    this.metrics.qReclaims++;
    if(evictExact)this.metrics.exactQEvictions++;
    this.metrics.canonicalQ=this.qActiveCount;
    return true;
  }

  evictInactiveExactQ(){
    for(let q=0;q<this.qCount;q++){
      if(this.qAlive[q]&&this.qExact[q]&&this.qDemand[q]===0&&this.qWork[q]<0&&
         this.qRunningOcc[q]<0&&this.qOccHead[q]===-1){
        return this.reclaimQ(q,true);
      }
    }
    return false;
  }

  internCurrent(){
    const p0=this.key[0],p1=this.key[1],support=this.key[2]>>>0,hash=hashQ(p0,p1,support);
    let bucket=hash&this.qMask,firstTombstone=-1,empty=-1;
    for(let steps=0;steps<this.qSlots.length;steps++){
      const entry=this.qSlots[bucket];
      if(entry===-1){empty=bucket;break;}
      if(entry===-2){
        if(firstTombstone<0)firstTombstone=bucket;
      }else if(this.qAlive[entry]&&this.qHash[entry]===hash&&
               this.qP0[entry]===p0&&this.qP1[entry]===p1&&this.qSupport[entry]===support){
        this.metrics.qReuses++;return entry;
      }
      bucket=(bucket+1)&this.qMask;
    }

    if(this.qFreeCount===0&&this.qCount>=this.maxQ){
      if(!this.evictInactiveExactQ())throw new Error('ISOMAX_SURPLUS_Q_CAPACITY');
    }
    if(this.qTombstones>this.maxQ/2){
      this.rebuildQHash();
      return this.internCurrent();
    }

    let q;
    if(this.qFreeCount>0)q=this.qFree[--this.qFreeCount];
    else if(this.qCount<this.maxQ)q=this.qCount++;
    else throw new Error('ISOMAX_SURPLUS_Q_CAPACITY');

    let insertBucket=firstTombstone>=0?firstTombstone:empty;
    if(insertBucket<0){
      this.rebuildQHash();
      insertBucket=hash&this.qMask;
      while(this.qSlots[insertBucket]>=0)insertBucket=(insertBucket+1)&this.qMask;
    }else if(firstTombstone>=0){
      this.qTombstones--;
    }

    this.qSlots[insertBucket]=q;
    this.qAlive[q]=1;
    this.qP0[q]=p0;this.qP1[q]=p1;this.qSupport[q]=support;this.qHash[q]=hash;
    this.qExact[q]=0;this.qValue[q]=0;this.qWork[q]=-1;this.qDemand[q]=0;
    this.qOccHead[q]=-1;this.qPriority[q]=0;this.qRunningOcc[q]=-1;
    this.qActiveCount++;
    this.metrics.canonicalQ=this.qActiveCount;
    this.metrics.maxActiveCanonicalQ=Math.max(this.metrics.maxActiveCanonicalQ,this.qActiveCount);
    return q;
  }

  firstLiveOccurrence(q){
    let occ=this.qOccHead[q];
    while(occ!==-1&&Atomics.load(this.shared.occNeeded,occ)===0)occ=this.occNext[occ];
    return occ;
  }

  liveContinuation(q){
    const occ=this.qRunningOcc[q];
    if(occ<0)return -1;
    if(Atomics.load(this.shared.occNeeded,occ)===0 ||
       Atomics.load(this.shared.occState,occ)===OCC_RETIRED){
      this.qRunningOcc[q]=-1;
      return -1;
    }
    return occ;
  }

  priorityFor(q,orderRank=6){
    let band=orderRank<=1?6:orderRank<=2?5:4;
    if(this.qDemand[q]>=2)band=Math.max(band,6);
    if(this.qDemand[q]>=4)band=7;
    return band;
  }

  createWork(q,occ){
    const slot=allocateWork(this.shared,this.workScratch);
    if(slot<0)throw new Error('ISOMAX_SURPLUS_WORK_CAPACITY');
    const gen=this.workScratch[1];
    Atomics.store(this.shared.workQ,slot,q);

    const length=Atomics.load(this.shared.occPathLength,occ),source=occ*MAX_MOVES,target=slot*MAX_MOVES;
    for(let i=0;i<length;i++)this.shared.workPath[target+i]=this.shared.occPath[source+i];
    Atomics.store(this.shared.workPathLength,slot,length);

    const band=this.priorityFor(q,Atomics.load(this.shared.occOrderRank,occ));
    this.qWork[q]=slot;this.qPriority[q]=band;this.activeWorkCount++;
    this.metrics.maxActiveWork=Math.max(this.metrics.maxActiveWork,this.activeWorkCount);
    Atomics.store(this.shared.workPriority,slot,band);Atomics.store(this.shared.workState,slot,WORK_READY);

    for(let o=this.qOccHead[q];o!==-1;o=this.occNext[o]){
      if(Atomics.load(this.shared.occNeeded,o)===0)continue;
      Atomics.store(this.shared.occWork,o,slot);Atomics.store(this.shared.occWorkGeneration,o,gen);
      if(Atomics.load(this.shared.occState,o)===OCC_PUBLISHED){
        Atomics.store(this.shared.occState,o,OCC_LINKED);Atomics.notify(this.shared.occState,o,Infinity);
      }
    }

    if(!enqueueWork(this.shared,slot,gen,band))throw new Error('ISOMAX_SURPLUS_QUEUE_CAPACITY');
    this.metrics.canonicalWorkCreated++;this.metrics.maxWork=Math.max(this.metrics.maxWork,slot+1);
    return slot;
  }

  refillExecution(){
    let admitted=0;
    while(this.activeWorkCount<this.shared.workerCount){
      let bestQ=-1,bestBand=-1,bestOcc=-1;
      for(let q=0;q<this.qCount;q++){
        if(!this.qAlive[q]||this.qExact[q]||this.qDemand[q]===0||this.qWork[q]>=0||this.liveContinuation(q)>=0)continue;
        const occ=this.firstLiveOccurrence(q);if(occ<0)continue;
        const band=this.priorityFor(q,Atomics.load(this.shared.occOrderRank,occ));
        if(band>bestBand){bestQ=q;bestBand=band;bestOcc=occ;if(band===PRIORITY_BANDS-1)break;}
      }
      if(bestQ<0)break;
      this.qPriority[bestQ]=bestBand;this.createWork(bestQ,bestOcc);admitted++;
    }
    return admitted;
  }

  linkOccurrence(slot,generation){
    if(slot<0||slot>=this.shared.occurrenceCapacity ||
       Atomics.load(this.shared.occGeneration,slot)!==generation ||
       Atomics.load(this.shared.occState,slot)!==OCC_PUBLISHED){
      this.metrics.stalePublications++;return;
    }
    const q=this.replay(slot);this.occQ[slot]=q;this.occNext[slot]=this.qOccHead[q];this.qOccHead[q]=slot;
    this.metrics.occurrences++;this.metrics.maxOccurrences=Math.max(this.metrics.maxOccurrences,slot+1);

    if(this.qExact[q]){
      Atomics.store(this.shared.occResult,slot,this.qValue[q]);Atomics.store(this.shared.occState,slot,OCC_EXACT);
      Atomics.notify(this.shared.occState,slot,Infinity);this.metrics.exactBroadcasts++;return;
    }

    this.qDemand[q]++;
    const role=Atomics.load(this.shared.occRole,slot);
    const running=this.liveContinuation(q);

    if(role===OCC_ROLE_CONTINUATION){
      if(running<0){
        this.qRunningOcc[q]=slot;Atomics.store(this.shared.occLeader,slot,slot);
        this.metrics.runningContinuations++;
      }else{
        Atomics.store(this.shared.occLeader,slot,running);
        this.metrics.duplicateRunningContinuations++;
      }

      // A current native continuation is cheaper than rematerializing the same
      // q. Retire/signal any helper work and let exact completion broadcast.
      const work=this.qWork[q];
      if(work>=0){
        const state=Atomics.load(this.shared.workState,work);
        if(state===WORK_READY){
          Atomics.store(this.shared.workNeeded,work,0);Atomics.store(this.shared.workState,work,WORK_RETIRED);
          Atomics.notify(this.shared.workState,work,Infinity);this.qWork[q]=-1;
          if(this.activeWorkCount>0)this.activeWorkCount--;this.metrics.readyRetired++;
        }else if(state===WORK_RUNNING){
          Atomics.store(this.shared.workNeeded,work,0);this.metrics.runningRetireSignals++;
        }
      }
      Atomics.store(this.shared.occState,slot,OCC_LINKED);Atomics.notify(this.shared.occState,slot,Infinity);
      this.metrics.visibilityOnlyOccurrences++;this.refillExecution();return;
    }

    if(running>=0){
      // This surplus occurrence converges with an already-running native
      // continuation. Do not create duplicate executable work; wait for the
      // continuation's exact publication.
      Atomics.store(this.shared.occLeader,slot,running);
      Atomics.store(this.shared.occState,slot,OCC_LINKED);Atomics.notify(this.shared.occState,slot,Infinity);
      this.metrics.duplicateOccurrences++;this.metrics.visibilityOnlyOccurrences++;return;
    }

    let work=this.qWork[q];
    if(work>=0){
      const state=Atomics.load(this.shared.workState,work);
      if(state===WORK_EXACT){
        this.markQExact(q,Atomics.load(this.shared.workResult,work),work);return;
      }
      if(state===WORK_RETIRED||state===WORK_UNUSED){
        this.qWork[q]=-1;work=-1;if(this.activeWorkCount>0)this.activeWorkCount--;
      }else this.metrics.duplicateOccurrences++;
    }

    Atomics.store(this.shared.occState,slot,OCC_LINKED);Atomics.notify(this.shared.occState,slot,Infinity);
    this.metrics.visibilityOnlyOccurrences++;this.refillExecution();

    work=this.qWork[q];
    if(work>=0){
      const gen=Atomics.load(this.shared.workGeneration,work);
      Atomics.store(this.shared.occWork,slot,work);Atomics.store(this.shared.occWorkGeneration,slot,gen);
      const band=this.priorityFor(q,Atomics.load(this.shared.occOrderRank,slot));
      if(band>this.qPriority[q]&&Atomics.load(this.shared.workState,work)===WORK_READY){
        this.qPriority[q]=band;Atomics.store(this.shared.workPriority,work,band);
        if(!enqueueWork(this.shared,work,gen,band))throw new Error('ISOMAX_SURPLUS_QUEUE_CAPACITY');
        this.metrics.priorityUpdates++;
      }
    }
  }

  markQExact(q,value,sourceWork=-1){
    if(value!==-1&&value!==0&&value!==1)throw new Error('invalid surplus q WDL');
    if(this.qExact[q]){
      if(this.qValue[q]!==value)throw new Error('conflicting surplus q exact values');
      return;
    }
    this.qExact[q]=1;this.qValue[q]=value;
    this.qRunningOcc[q]=-1;

    const work=this.qWork[q];
    if(work>=0){
      const state=Atomics.load(this.shared.workState,work);
      if(work===sourceWork||state===WORK_EXACT){
        this.qWork[q]=-1;if(this.activeWorkCount>0)this.activeWorkCount--;
      }else if(state===WORK_READY){
        Atomics.store(this.shared.workNeeded,work,0);Atomics.store(this.shared.workState,work,WORK_RETIRED);
        Atomics.notify(this.shared.workState,work,Infinity);this.qWork[q]=-1;
        if(this.activeWorkCount>0)this.activeWorkCount--;this.metrics.readyRetired++;
      }else if(state===WORK_RUNNING){
        Atomics.store(this.shared.workNeeded,work,0);this.metrics.runningRetireSignals++;
      }
    }

    for(let occ=this.qOccHead[q];occ!==-1;occ=this.occNext[occ]){
      if(Atomics.load(this.shared.occNeeded,occ)===0)continue;
      if(Atomics.load(this.shared.occState,occ)===OCC_RETIRED)continue;
      Atomics.store(this.shared.occResult,occ,value);Atomics.store(this.shared.occState,occ,OCC_EXACT);
      Atomics.notify(this.shared.occState,occ,Infinity);this.metrics.exactBroadcasts++;
    }
  }

  startContinuation(slot,generation){
    if(slot<0||slot>=this.shared.occurrenceCapacity ||
       Atomics.load(this.shared.occGeneration,slot)!==generation ||
       Atomics.load(this.shared.occNeeded,slot)===0){
      this.metrics.stalePublications++;return;
    }
    const q=this.occQ[slot];if(q<0||q>=this.qCount)throw new Error('surplus continuation lacks canonical q');
    if(this.qExact[q]){
      Atomics.store(this.shared.occResult,slot,this.qValue[q]);
      Atomics.store(this.shared.occState,slot,OCC_EXACT);
      Atomics.notify(this.shared.occState,slot,Infinity);return;
    }
    Atomics.store(this.shared.occRole,slot,OCC_ROLE_CONTINUATION);
    const leader=this.liveContinuation(q);
    if(leader<0){
      this.qRunningOcc[q]=slot;Atomics.store(this.shared.occLeader,slot,slot);
      this.metrics.runningContinuations++;
    }else if(leader!==slot){
      Atomics.store(this.shared.occLeader,slot,leader);
      this.metrics.duplicateRunningContinuations++;
    }

    const work=this.qWork[q];
    if(work>=0){
      const state=Atomics.load(this.shared.workState,work);
      if(state===WORK_READY){
        Atomics.store(this.shared.workNeeded,work,0);Atomics.store(this.shared.workState,work,WORK_RETIRED);
        Atomics.notify(this.shared.workState,work,Infinity);this.qWork[q]=-1;
        if(this.activeWorkCount>0)this.activeWorkCount--;this.metrics.readyRetired++;
      }else if(state===WORK_RUNNING){
        Atomics.store(this.shared.workNeeded,work,0);this.metrics.runningRetireSignals++;
      }
    }
    this.refillExecution();
  }

  acceptOccurrenceExact(slot,generation,value){
    if(slot<0||slot>=this.shared.occurrenceCapacity ||
       Atomics.load(this.shared.occGeneration,slot)!==generation){
      this.metrics.stalePublications++;return;
    }
    const q=this.occQ[slot];if(q<0||q>=this.qCount)throw new Error('local surplus exact lacks canonical q');
    if(Atomics.load(this.shared.occRole,slot)===OCC_ROLE_CONTINUATION)this.metrics.continuationExact++;
    else this.metrics.localOccurrenceExact++;
    this.markQExact(q,value);this.refillExecution();
  }

  acceptExact(work,generation,attempt,value,rootMove){
    if(work<0||work>=this.shared.workCapacity ||
       Atomics.load(this.shared.workGeneration,work)!==generation ||
       Atomics.load(this.shared.workAttempt,work)!==attempt ||
       Atomics.load(this.shared.workState,work)!==WORK_EXACT){
      this.metrics.stalePublications++;return;
    }
    const q=Atomics.load(this.shared.workQ,work);if(q<0||q>=this.qCount)
      throw new Error('surplus exact work lacks canonical q');

    // A local continuation may have established the same q exactly while this
    // helper was still RUNNING. The duplicate exact value is valid, but this
    // work reservation still has to leave the bounded active population.
    if(this.qWork[q]===work){
      this.qWork[q]=-1;
      if(this.activeWorkCount>0)this.activeWorkCount--;
    }
    if(this.qExact[q]){
      if(this.qValue[q]!==value)throw new Error('conflicting surplus q exact values');
    }else{
      this.markQExact(q,value,-1);
    }
    this.refillExecution();
    if(q===this.rootQ){
      parentPort.postMessage({type:'surplus-result',value,move:rootMove,metrics:{...this.metrics}});
      stopSurplusPool(this.shared);
    }
  }

  unlinkOccurrence(q,slot){
    if(q<0||q>=this.qCount)return false;
    let previous=-1,current=this.qOccHead[q];
    while(current!==-1){
      if(current===slot){
        const next=this.occNext[current];
        if(previous<0)this.qOccHead[q]=next;
        else this.occNext[previous]=next;
        this.occNext[current]=-1;
        this.occQ[current]=-1;
        return true;
      }
      previous=current;
      current=this.occNext[current];
    }
    return false;
  }

  clearLeaderReferences(q,leader){
    for(let occ=this.qOccHead[q];occ!==-1;occ=this.occNext[occ]){
      if(occ===leader||Atomics.load(this.shared.occNeeded,occ)===0)continue;
      if(Atomics.load(this.shared.occLeader,occ)!==leader)continue;
      Atomics.store(this.shared.occLeader,occ,-1);
      // Followers may be sleeping on their own LINKED state while observing
      // the leader. Wake them so they can re-evaluate local/remote execution.
      Atomics.notify(this.shared.occState,occ,Infinity);
    }
  }

  retireOccurrence(slot,generation){
    if(slot<0||slot>=this.shared.occurrenceCapacity ||
       Atomics.load(this.shared.occGeneration,slot)!==generation)return;
    if(Atomics.exchange(this.shared.occNeeded,slot,0)===0)return;

    const q=this.occQ[slot];
    Atomics.store(this.shared.occState,slot,OCC_RETIRED);
    Atomics.notify(this.shared.occState,slot,Infinity);
    this.metrics.occRetired++;

    if(q<0||q>=this.qCount){
      releaseOccurrence(this.shared,slot,generation);
      return;
    }

    const wasContinuation=this.qRunningOcc[q]===slot;
    if(wasContinuation){
      this.qRunningOcc[q]=-1;
      this.clearLeaderReferences(q,slot);
    }
    if(this.qDemand[q]>0)this.qDemand[q]--;

    // Remove the manager-local adjacency before the shared slot can be reused
    // under a new generation. q identity never aliases a recycled occurrence.
    this.unlinkOccurrence(q,slot);

    if(!this.qExact[q]){
      if(wasContinuation){
        // Surplus demand may now need spare-worker admission because the native
        // continuation disappeared without exact completion.
        this.refillExecution();
      }

      if(this.qDemand[q]===0){
        const work=this.qWork[q];
        if(work>=0){
          const state=Atomics.load(this.shared.workState,work);
          if(state===WORK_READY){
            Atomics.store(this.shared.workNeeded,work,0);
            Atomics.store(this.shared.workState,work,WORK_RETIRED);
            Atomics.notify(this.shared.workState,work,Infinity);
            this.qWork[q]=-1;
            if(this.activeWorkCount>0)this.activeWorkCount--;
            this.metrics.readyRetired++;
            this.refillExecution();
          }else if(state===WORK_RUNNING){
            Atomics.store(this.shared.workNeeded,work,0);
            this.metrics.runningRetireSignals++;
          }
        }
      }
    }

    if(!releaseOccurrence(this.shared,slot,generation))
      throw new Error('failed to recycle retired surplus occurrence');

    if(this.qDemand[q]===0&&this.qWork[q]<0&&this.qRunningOcc[q]<0&&this.qOccHead[q]===-1)
      this.reclaimQ(q,false);
  }

  acceptWorkRetired(work,generation,attempt){
    if(work<0||work>=this.shared.workCapacity ||
       Atomics.load(this.shared.workGeneration,work)!==generation ||
       Atomics.load(this.shared.workAttempt,work)!==attempt)return;
    const q=Atomics.load(this.shared.workQ,work);
    Atomics.store(this.shared.workState,work,WORK_RETIRED);Atomics.notify(this.shared.workState,work,Infinity);
    if(q>=0&&q<this.qCount&&this.qAlive[q]&&this.qWork[q]===work){
      this.qWork[q]=-1;if(this.activeWorkCount>0)this.activeWorkCount--;
      if(!this.qExact[q]&&this.qDemand[q]>0)this.metrics.workRequeues++;
      else if(this.qDemand[q]===0&&this.qRunningOcc[q]<0&&this.qOccHead[q]===-1)
        this.reclaimQ(q,false);
    }
    this.refillExecution();
  }

  handlePublication(){
    const kind=this.pub[0],a=this.pub[1],b=this.pub[2],c=this.pub[3],d=this.pub[4],e=this.pub[5];
    this.metrics.publications++;
    if(kind===PUB_OCCURRENCE)this.linkOccurrence(a,b);
    else if(kind===PUB_CONTINUATION_START)this.startContinuation(a,b);
    else if(kind===PUB_OCCURRENCE_EXACT)this.acceptOccurrenceExact(a,b,c);
    else if(kind===PUB_EXACT)this.acceptExact(a,b,c,d,e);
    else if(kind===PUB_RETIRE_OCCURRENCE)this.retireOccurrence(a,b);
    else if(kind===PUB_WORK_RETIRED)this.acceptWorkRetired(a,b,c);
    else if(kind===PUB_FAILURE){this.metrics.failures++;throw new Error('surplus worker reported failure');}
    else throw new Error('unknown surplus publication kind '+kind);
  }

  processWorkerDeaths(){
    let alive=0;
    for(let worker=0;worker<this.shared.workerCount;worker++){
      if(Atomics.load(this.shared.workerAlive,worker)){alive++;continue;}
      if(this.seenDead[worker])continue;this.seenDead[worker]=1;

      const allocated=Math.min(this.shared.workCapacity,Atomics.load(this.shared.control,CTRL_WORK_NEXT));
      for(let work=0;work<allocated;work++){
        if(Atomics.load(this.shared.workState,work)!==WORK_RUNNING ||
           Atomics.load(this.shared.workWorker,work)!==worker)continue;
        const q=Atomics.load(this.shared.workQ,work);
        Atomics.add(this.shared.workAttempt,work,1);Atomics.store(this.shared.workWorker,work,-1);
        if(Atomics.load(this.shared.workNeeded,work)!==0 &&
           (q===this.rootQ||(q>=0&&this.qDemand[q]>0))){
          Atomics.store(this.shared.workState,work,WORK_READY);
          const gen=Atomics.load(this.shared.workGeneration,work);
          if(!enqueueWork(this.shared,work,gen,Atomics.load(this.shared.workPriority,work)))
            throw new Error('ISOMAX_SURPLUS_QUEUE_CAPACITY');
          this.metrics.workerDeathRequeues++;
        }else{
          Atomics.store(this.shared.workState,work,WORK_RETIRED);Atomics.notify(this.shared.workState,work,Infinity);
          if(q>=0&&q<this.qCount&&this.qWork[q]===work){this.qWork[q]=-1;if(this.activeWorkCount>0)this.activeWorkCount--;}
        }
      }

      const occCount=Math.min(this.shared.occurrenceCapacity,Atomics.load(this.shared.control,CTRL_OCC_NEXT));
      for(let occ=0;occ<occCount;occ++){
        if(Atomics.load(this.shared.occNeeded,occ)===0 ||
           Atomics.load(this.shared.occPublisherWorker,occ)!==worker)continue;
        const parent=Atomics.load(this.shared.occParentWork,occ);
        const parentAttempt=Atomics.load(this.shared.occParentAttempt,occ);
        if(parent>=0&&Atomics.load(this.shared.workAttempt,parent)!==parentAttempt)
          this.retireOccurrence(occ,Atomics.load(this.shared.occGeneration,occ));
      }
      this.refillExecution();
    }
    if(alive===0&&Atomics.load(this.shared.control,CTRL_SESSION)===SESSION_RUNNING)
      throw new Error('all surplus workers exited');
  }

  initRoot(){
    this.state.gameplayKey(this.key);this.rootQ=this.internCurrent();
    const work=allocateWork(this.shared,this.workScratch);
    if(work<0)throw new Error('ISOMAX_SURPLUS_WORK_CAPACITY');
    const gen=this.workScratch[1];
    Atomics.store(this.shared.workQ,work,this.rootQ);
    Atomics.store(this.shared.workPriority,work,7);
    const base=work*MAX_MOVES;for(let i=0;i<this.rootPly;i++)this.shared.workPath[base+i]=this.rootMoves[i];
    Atomics.store(this.shared.workPathLength,work,this.rootPly);
    this.qWork[this.rootQ]=work;this.rootWork=work;this.activeWorkCount=1;this.metrics.maxActiveWork=1;
    Atomics.store(this.shared.workState,work,WORK_READY);
    if(!enqueueWork(this.shared,work,gen,7))throw new Error('ISOMAX_SURPLUS_QUEUE_CAPACITY');
    this.metrics.canonicalWorkCreated++;this.metrics.maxWork=1;
  }

  snapshot(){
    return {
      elapsedMs:performance.now()-this.started,rootExact:this.qExact[this.rootQ]?this.qValue[this.rootQ]:null,
      metrics:{...this.metrics},qCount:this.qActiveCount,qHighWater:this.qCount,activeWorkCount:this.activeWorkCount,
      workAllocated:Math.min(this.shared.workCapacity,Atomics.load(this.shared.control,CTRL_WORK_NEXT)),
      occurrenceAllocated:Math.min(this.shared.occurrenceCapacity,Atomics.load(this.shared.control,CTRL_OCC_NEXT)),
    };
  }

  run(){
    Atomics.store(this.shared.control,CTRL_SESSION,SESSION_RUNNING);this.initRoot();
    parentPort.postMessage({type:'surplus-reconciler-ready'});
    try{
      while(Atomics.load(this.shared.control,CTRL_SESSION)===SESSION_RUNNING &&
            !Atomics.load(this.shared.control,CTRL_ABORT)){
        let records=0;
        while(records<4096&&dequeuePublication(this.shared,this.pub)){
          this.handlePublication();records++;
          if(Atomics.load(this.shared.control,CTRL_SESSION)!==SESSION_RUNNING)break;
        }
        this.processWorkerDeaths();
        const now=performance.now();
        if(now-this.lastProgress>=this.progressIntervalMs){
          parentPort.postMessage({type:'surplus-progress',snapshot:this.snapshot()});this.lastProgress=now;
        }
        if(Atomics.load(this.shared.control,CTRL_SESSION)!==SESSION_RUNNING)break;
        if(records===0){
          const epoch=Atomics.load(this.shared.control,CTRL_PUB_WAKE);
          if(!dequeuePublication(this.shared,this.pub))Atomics.wait(this.shared.control,CTRL_PUB_WAKE,epoch,10);
          else this.handlePublication();
        }
      }
      if(Atomics.load(this.shared.control,CTRL_ABORT))throw new Error('ISOMAX_SURPLUS_ABORTED');
    }catch(error){
      Atomics.store(this.shared.control,CTRL_FAILURE,1);Atomics.store(this.shared.control,CTRL_ABORT,1);
      stopSurplusPool(this.shared);
      parentPort.postMessage({type:'surplus-reconciler-error',message:error?.message??String(error),snapshot:this.snapshot()});
    }finally{this.pool.releaseSearchStorage();}
  }
}

parentPort.on('message',message=>{
  if(message?.type!=='isomax-surplus-reconcile'){
    parentPort.postMessage({type:'surplus-reconciler-error',message:'unsupported surplus reconciler message'});return;
  }
  try{new SurplusReconciler(message).run();}
  catch(error){parentPort.postMessage({type:'surplus-reconciler-error',message:error?.message??String(error)});}
});
parentPort.postMessage({type:'surplus-reconciler-idle'});

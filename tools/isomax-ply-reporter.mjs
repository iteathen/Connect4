// Benchmark-only observer. Search workers never message or wait for this worker.
// Slots contain ply+1 (0 = unpublished/completed), updated on eligible shared
// cache probes after a local miss. These are time samples of the latest probe,
// NOT a node histogram, proof frontier, exact current stack, or maximum depth.
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {freemem} from 'node:os';
import {writeSync} from 'node:fs';

export async function startPlyReporter({workers,sampleMs=100,reportMs=30000,progress=false}={}){
  if(!Number.isInteger(workers)||workers<1||workers>64||
     !Number.isInteger(sampleMs)||sampleMs<5||sampleMs>1000||
     !Number.isInteger(reportMs)||reportMs<sampleMs||reportMs>30000)
    throw Error('invalid ply reporter configuration');
  const buffer=new SharedArrayBuffer(workers*64),
    worker=new Worker(new URL(import.meta.url),{workerData:{buffer,workers,sampleMs,reportMs,progress}});
  let summary,failure,readyResolve,readyReject,finishResolve,finishReject,stopping=false;
  const ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;}),
    finished=new Promise((resolve,reject)=>{finishResolve=resolve;finishReject=reject;});
  // A reporter failure is surfaced at stop/join; never an unhandled rejection.
  finished.catch(()=>{});
  worker.on('message',message=>{
    if(message.type==='ready')readyResolve();
    else if(message.type==='summary')summary=message.summary;
  });
  worker.on('error',error=>{failure=error;readyReject(error);});
  worker.on('exit',code=>{
    if(failure||code!==0||!summary){
      const error=failure??Error(`ply reporter exited without clean summary (${code})`);
      readyReject(error);finishReject(error);
    }else finishResolve({...summary,cleanup:true});
  });
  await ready;
  return {buffer,stop(){if(!stopping){stopping=true;worker.postMessage('stop');}return finished;}};
}

if(!isMainThread&&workerData?.buffer){
  const {buffer,workers,sampleMs,reportMs,progress}=workerData,
    slots=new Uint32Array(buffer),started=performance.now(),
    histogram=()=>new Array(43).fill(0),
    summary={mode:'latest-shared-probe-ply-samples',sampleMs,reportMs,
      slotBytes:64,bufferBytes:buffer.byteLength,snapshots:0,workerSamples:0,invalidSamples:0,
      maxSampleGapMs:0,sampledPeakRssBytes:process.memoryUsage().rss,histogram:histogram(),
      workers:Array.from({length:workers},()=>({histogram:histogram(),minObservedPly:null,maxObservedPly:null,lastObservedPly:null})),
      windows:[]};
  let previous=started,windowStart=0,windowHistogram=histogram(),meter=null;
  if(progress){const {processCycleCounter}=await import('./cycle-counter.mjs');meter=await processCycleCounter();}
  function sample(){
    const now=performance.now();summary.maxSampleGapMs=Math.max(summary.maxSampleGapMs,now-previous);previous=now;
    summary.snapshots++;
    for(let i=0;i<workers;i++){
      // Ordinary uint32 accesses are non-tearing; no ordering between workers
      // or coherency with other metrics is promised or required by this sample.
      const encoded=slots[i*16];if(!encoded)continue;
      if(encoded>43){summary.invalidSamples++;continue;}
      const ply=encoded-1,w=summary.workers[i];
      w.histogram[ply]++;summary.histogram[ply]++;windowHistogram[ply]++;summary.workerSamples++;
      w.lastObservedPly=ply;
      if(w.minObservedPly===null||ply<w.minObservedPly)w.minObservedPly=ply;
      if(w.maxObservedPly===null||ply>w.maxObservedPly)w.maxObservedPly=ply;
    }
  }
  function report(){
    const elapsedMs=performance.now()-started,rssBytes=process.memoryUsage().rss,
      window={fromMs:windowStart,toMs:elapsedMs,histogram:windowHistogram,
        latestPublishedPly:Array.from({length:workers},(_,i)=>{const n=slots[i*16];return n>0&&n<=43?n-1:null;}),rssBytes};
    summary.sampledPeakRssBytes=Math.max(summary.sampledPeakRssBytes,rssBytes);
    summary.windows.push(window);windowStart=elapsedMs;windowHistogram=histogram();
    if(progress)writeSync(2,JSON.stringify({event:'ply-progress',...window,
      totalProcessCycles:meter.read().toString(),freeRamBytes:freemem()})+'\n');
  }
  const sampleTimer=setInterval(sample,sampleMs),reportTimer=setInterval(report,reportMs);
  parentPort.on('message',message=>{
    if(message!=='stop')return;
    clearInterval(sampleTimer);clearInterval(reportTimer);report();meter?.close();
    parentPort.postMessage({type:'summary',summary});parentPort.close();
  });
  parentPort.postMessage({type:'ready'});
}

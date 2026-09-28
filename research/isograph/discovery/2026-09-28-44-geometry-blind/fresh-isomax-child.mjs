import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const sequence=process.env.SEQUENCE;
if(!/^[1-7]{3}$/.test(sequence??''))throw new Error('SEQUENCE must be exactly three moves');
const lib=resolve('jsminsys');
const api=await import(pathToFileURL(resolve(lib,'addons/index.mjs')).href);
const geometry=api.prepareConnect4RbaGeometry({columns:7,rows:6});
const moves=Array.from(sequence,ch=>ch.charCodeAt(0)-49);
const config={
  workers:4,
  rootFrontier:true,
  sharedSampleMask:0,
  sharedCacheCapacity:134217728,
  localCacheCapacity:8388608,
  timeoutMs:600000,
};
const started=Date.now();
const result=await api.runLazySmpConnect4Rba32(moves,{geometry,...config});
console.log(JSON.stringify({
  schema:'connect4.44x.fresh-isomax-wdl.v1',
  sequence,
  sourceSha:'6bbba7c71c60afb1018a22b6d5c03f495f5d2c9e',
  solvedInputsUsed:false,
  gameInputs:['7x6','connect4','gravity','alternating turns',sequence],
  config,
  elapsedMs:Date.now()-started,
  status:result.status,
  rootWdl:result.rootWdl,
  move:result.move,
  winner:result.winner,
  nodeCounts:result.nodeCounts,
  sharedCacheHits:result.sharedCacheHits,
  sharedCacheStores:result.sharedCacheStores,
  errorCode:result.errorCode,
  cleanup:result.cleanup,
  workersExited:result.workersExited,
},null,2));
if(result.status!=='EXACT')process.exitCode=2;

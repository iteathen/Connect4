import fs from 'node:fs';
const pause=ms=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);
export function renameCheckpoint(from,to,{rename=fs.renameSync,delay=pause,attempts=8}={}){
  for(let i=0;;i++){try{rename(from,to);return;}catch(error){if(!['EPERM','EACCES','EBUSY'].includes(error.code)||i+1>=attempts)throw error;delay(Math.min(25*2**i,400));}}
}
export function atomicWrite(file,bytes){fs.writeFileSync(file+'.partial',bytes);renameCheckpoint(file+'.partial',file);}
export function isHeapLimitFailure(code,stderr){return code!==0&&/FATAL ERROR:[^\r\n]*(?:heap out of memory|Allocation failed.*heap)/i.test(stderr);}
export function canAdvanceFresh({resultStatus,structureStatus,resourceStatus}){
  if(resultStatus!==undefined)return resultStatus==='SCALAR_OOO_VACUOUS';
  return structureStatus==='STRUCTURALLY_VACUOUS'||resourceStatus==='RESOURCE_CENSORED';
}

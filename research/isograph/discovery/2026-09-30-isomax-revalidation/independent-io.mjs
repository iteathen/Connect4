import fs from 'node:fs';
const wait=ms=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);
// OneDrive/Windows readers can briefly hold the destination without delete
// sharing. Never delete the old checkpoint; retry the atomic rename for <=630ms.
export function renameCheckpoint(from,to,{rename=fs.renameSync,wait:pause=wait}={}){
  for(let attempt=0;;attempt++){
    try{return rename(from,to);}catch(error){
      if(!['EPERM','EACCES','EBUSY'].includes(error.code)||attempt===6)throw error;
      pause(10*2**attempt);
    }
  }
}

import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const WIDTH=7,HEIGHT=6,STRIDE=7,CELLS=42,SEQ='663152175',CHUNK_SIZE=1<<15,CHUNKS=8,TOTAL_SIZE=CHUNK_SIZE*CHUNKS;
const workerFile=resolve(dirname(fileURLToPath(import.meta.url)),'multicore_worker.mjs');
let bottom=0n; const bot=[],col=[],top=[];
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE);bot[c]=1n<<sh;top[c]=1n<<BigInt(HEIGHT-1+c*STRIDE);col[c]=((1n<<6n)-1n)<<sh;bottom|=bot[c];}
const board=bottom*((1n<<6n)-1n);
function wp(p,m){let r=(p<<1n)&(p<<2n)&(p<<3n);let q=(p<<7n)&(p<<14n);r|=q&(p<<21n);r|=q&(p>>7n);q=(p>>7n)&(p>>14n);r|=q&(p<<7n);r|=q&(p>>21n);q=(p<<6n)&(p<<12n);r|=q&(p<<18n);r|=q&(p>>6n);q=(p>>6n)&(p>>12n);r|=q&(p<<6n);r|=q&(p>>18n);q=(p<<8n)&(p<<16n);r|=q&(p<<24n);r|=q&(p>>8n);q=(p>>8n)&(p>>16n);r|=q&(p<<8n);r|=q&(p>>24n);return r&(board^m)}
const poss=m=>(m+bottom)&board, can=(m,c)=>(m&top[c])===0n, win=(p,m,c)=>(wp(p,m)&poss(m)&col[c])!==0n, play=(m,c)=>(m+bot[c])&col[c];
let current=0n,mask=0n,moves=0;for(const ch of SEQ){const c=ch.charCodeAt(0)-49;const mv=play(mask,c);current^=mask;mask|=mv;moves++;}
const pair=x=>[Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];
const tasks=[];let id=0;for(let c=0;c<7;c++){if(!can(mask,c)||win(current,mask,c))continue;const mv=play(mask,c),cc=current^mask,mm=mask|mv;const [cLo,cHi]=pair(cc),[mLo,mHi]=pair(mm);tasks.push({id:id++,move:c,cLo,cHi,mLo,mHi,moves:moves+1,chunkIndex:c});}
const keyLoSab=new SharedArrayBuffer(TOTAL_SIZE*4),keyHiSab=new SharedArrayBuffer(TOTAL_SIZE*4),valSab=new SharedArrayBuffer(TOTAL_SIZE);
const ws=[];
const wait=(w,p)=>new Promise((res,rej)=>{const f=m=>{if(p(m)){w.off('message',f);res(m)}};w.on('message',f);w.once('error',rej)});
for(let i=0;i<4;i++){const w=new Worker(workerFile,{workerData:{keyLoSab,keyHiSab,valSab}});await wait(w,m=>m.type==='ready');ws.push(w);}
await Promise.all(ws.map((w,i)=>{const q=wait(w,m=>m.type==='warmed');w.postMessage({type:'warm',chunkIndex:i,limit:50000,state:{cLo:pair(current)[0],cHi:pair(current)[1],mLo:pair(mask)[0],mHi:pair(mask)[1],moves}});return q;}));
new Uint32Array(keyLoSab).fill(0);new Uint32Array(keyHiSab).fill(0);new Uint8Array(valSab).fill(0);
let next=0,done=0;const out=[];const t0=process.hrtime.bigint();
await new Promise((resolve,reject)=>{const launch=w=>{if(next<tasks.length)w.postMessage({type:'task',task:tasks[next++]});};for(let wi=0;wi<ws.length;wi++){const w=ws[wi];w.on('message',m=>{if(m.type!=='result')return;out.push({...m.result,worker:wi});done++;if(done===tasks.length)resolve();else launch(w);});w.once('error',reject);launch(w);}});
const sec=Number(process.hrtime.bigint()-t0)/1e9;out.sort((a,b)=>b.seconds-a.seconds);console.log(JSON.stringify({wall:sec,totalNodes:out.reduce((a,x)=>a+x.nodes,0),tasks:out},null,2));
for(const w of ws)await w.terminate();

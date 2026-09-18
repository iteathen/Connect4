import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';import { dirname,resolve } from 'node:path';
const workerFile=resolve(dirname(fileURLToPath(import.meta.url)),'multicore_throughput_worker.mjs');
const WIDTH=7,HEIGHT=6,STRIDE=7,SEQ='663152175',ROOT_MOVE=3,LIMIT=Number(process.argv[2]??2000000),REPS=Number(process.argv[3]??5);
let bottom=0n;const bot=[],col=[];for(let c=0;c<7;c++){const sh=BigInt(c*STRIDE);bot[c]=1n<<sh;col[c]=((1n<<6n)-1n)<<sh;bottom|=bot[c];}
function play(m,c){return (m+bot[c])&col[c]}let p=0n,m=0n,n=0;for(const ch of SEQ){const c=ch.charCodeAt(0)-49,mv=play(m,c);p^=m;m|=mv;n++;}let mv=play(m,ROOT_MOVE);p^=m;m|=mv;n++;
const pair=x=>[Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];const [cLo,cHi]=pair(p),[mLo,mHi]=pair(m);
const total=8*(1<<15);const keyLoSab=new SharedArrayBuffer(total*4),keyHiSab=new SharedArrayBuffer(total*4),valSab=new SharedArrayBuffer(total);const kl=new Uint32Array(keyLoSab),kh=new Uint32Array(keyHiSab),vv=new Uint8Array(valSab);
function wait(w,p){return new Promise((res,rej)=>{const f=x=>{if(p(x)){w.off('message',f);res(x)}};w.on('message',f);w.once('error',rej)});}
async function make(k){const ws=[];for(let i=0;i<k;i++){const w=new Worker(workerFile,{workerData:{keyLoSab,keyHiSab,valSab}});await wait(w,x=>x.type==='ready');ws.push(w);}await Promise.all(ws.map((w,i)=>{const q=wait(w,x=>x.type==='warmed');w.postMessage({type:'warm',task:{id:i,chunkIndex:i,cLo,cHi,mLo,mHi,moves:n}});return q;}));return ws;}
async function run(ws){kl.fill(0);kh.fill(0);vv.fill(0);const ps=ws.map((w,i)=>{const q=wait(w,x=>x.type==='result');w.postMessage({type:'task',task:{id:i,chunkIndex:i,cLo,cHi,mLo,mHi,moves:n,limit:LIMIT}});return q;});const t0=process.hrtime.bigint();const rs=(await Promise.all(ps)).map(x=>x.result);const sec=Number(process.hrtime.bigint()-t0)/1e9;const nodes=rs.reduce((a,x)=>a+x.nodes,0);return{sec,nodes,nps:nodes/sec,per:rs.map(x=>x.nodes/x.seconds)};}
const med=a=>{a=[...a].sort((x,y)=>x-y);return a[(a.length-1)>>1]};
console.log(JSON.stringify({limitPerWorker:LIMIT,reps:REPS,statePly:n}));for(const k of [1,2,3,4]){const ws=await make(k);const runs=[];for(let r=0;r<REPS;r++)runs.push(await run(ws));for(const w of ws)await w.terminate();console.log(JSON.stringify({workers:k,medianSeconds:med(runs.map(x=>x.sec)),medianAggregateNps:med(runs.map(x=>x.nps)),medianNodes:med(runs.map(x=>x.nodes)),runs}));}

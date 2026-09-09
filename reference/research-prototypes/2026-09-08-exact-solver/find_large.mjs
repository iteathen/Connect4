import {Solver} from './twoword_solver_tasklocal.mjs';
const seqs = process.argv.slice(2);
const WIDTH=7, HEIGHT=6, STRIDE=7;
const bot=[], col=[];
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE);bot[c]=1n<<sh;col[c]=((1n<<6n)-1n)<<sh;}
function pair(x){return [Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
function st(seq){let current=0n,mask=0n,moves=0;for(const ch of seq){const c=ch.charCodeAt(0)-49;const mv=(mask+bot[c])&col[c];current^=mask;mask|=mv;moves++;}const [cLo,cHi]=pair(current),[mLo,mHi]=pair(mask);return {cLo,cHi,mLo,mHi,moves};}
for(const seq of seqs){const x=st(seq);const s=new Solver(18,true,15);s.limit=20_000_000;const t=process.hrtime.bigint();let score=null, stopped=false;try{score=s.solveBits(x.cLo,x.cHi,x.mLo,x.mHi,x.moves);}catch(e){if(e===911)stopped=true;else throw e;}const sec=Number(process.hrtime.bigint()-t)/1e9;console.log(JSON.stringify({seq,score,stopped,nodes:s.nodes,sec,nps:s.nodes/sec}));}

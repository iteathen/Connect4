import {Solver} from './twoword_solver_tasklocal.mjs';
const WIDTH=7,HEIGHT=6,STRIDE=7;
let bottom=0n; const bot=[], col=[];
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE); bot[c]=1n<<sh; col[c]=((1n<<BigInt(HEIGHT))-1n)<<sh; bottom|=bot[c];}
function pair(x){return [Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
function state(seq){let current=0n,mask=0n,moves=0; for(const ch of seq){const c=ch.charCodeAt(0)-49; const mv=(mask+bot[c])&col[c]; current^=mask; mask|=mv; moves++;} const [cLo,cHi]=pair(current),[mLo,mHi]=pair(mask); return {cLo,cHi,mLo,mHi,moves};}
const activePow=Number(process.argv[2]??15), limit=Number(process.argv[3]??10000000); const seqs=process.argv.slice(4);
for(const seq of seqs){const st=state(seq); const s=new Solver(23,true,activePow); for(let i=0;i<100000;i++){} s.limit=limit; const t0=process.hrtime.bigint(); let score=null,stopped=false; try{score=s.solveBits(st.cLo,st.cHi,st.mLo,st.mHi,st.moves);}catch(e){if(e===911)stopped=true;else throw e;} const sec=Number(process.hrtime.bigint()-t0)/1e9; console.log(JSON.stringify({seq,plies:st.moves,activeSlots:s.activeSize,nodes:s.nodes,sec,nps:s.nodes/sec,score,stopped}));}

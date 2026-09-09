import {Solver} from './twoword_solver_tasklocal.mjs';
const W=7,H=6,S=7; let bottom=0n; const bot=[],col=[],top=[];
for(let c=0;c<W;c++){const sh=BigInt(c*S);bot[c]=1n<<sh;top[c]=1n<<BigInt(H-1+c*S);col[c]=((1n<<6n)-1n)<<sh;bottom|=bot[c];}
const board=bottom*((1n<<6n)-1n);
function winningPositions(position,mask){let r=(position<<1n)&(position<<2n)&(position<<3n);let p=(position<<7n)&(position<<14n);r|=p&(position<<21n);r|=p&(position>>7n);p=(position>>7n)&(position>>14n);r|=p&(position<<7n);r|=p&(position>>21n);p=(position<<6n)&(position<<12n);r|=p&(position<<18n);r|=p&(position>>6n);p=(position>>6n)&(position>>12n);r|=p&(position<<6n);r|=p&(position>>18n);p=(position<<8n)&(position<<16n);r|=p&(position<<24n);r|=p&(position>>8n);p=(position>>8n)&(position>>16n);r|=p&(position<<8n);r|=p&(position>>24n);return r&(board^mask)}
const possible=m=>(m+bottom)&board; const can=(m,c)=>(m&top[c])===0n; const winmove=(p,m,c)=>(winningPositions(p,m)&possible(m)&col[c])!==0n;
function pair(x){return [Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
let seed=0x9e3779b9; const rnd=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
function gen(n){let p=0n,m=0n,s=''; for(let i=0;i<n;i++){const legal=[];for(let c=0;c<7;c++)if(can(m,c)&&!winmove(p,m,c))legal.push(c);if(!legal.length)return null;const c=legal[rnd()%legal.length];const mv=(m+bot[c])&col[c];p^=m;m|=mv;s+=String(c+1);}return {p,m,s,n};}
let found=0;
for(let i=0;i<80 && found<6;i++){const g=gen(6+(i%3));if(!g)continue;const [cLo,cHi]=pair(g.p),[mLo,mHi]=pair(g.m);const s=new Solver(18,true,15);s.limit=20_000_000;const t=process.hrtime.bigint();let score=null,stopped=false;try{score=s.solveBits(cLo,cHi,mLo,mHi,g.n);}catch(e){if(e===911)stopped=true;else throw e;}const sec=Number(process.hrtime.bigint()-t)/1e9;if(stopped||s.nodes>=4_000_000){console.log(JSON.stringify({seq:g.s,plies:g.n,score,stopped,nodes:s.nodes,sec,nps:s.nodes/sec}));found++;}}

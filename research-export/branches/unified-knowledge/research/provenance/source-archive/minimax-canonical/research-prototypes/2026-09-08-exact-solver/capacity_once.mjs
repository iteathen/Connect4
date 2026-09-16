import {Solver,pairFromBig} from './twoword_solver_capacity_fast.mjs';
const W=7,H=6,S=7; const bot=[],col=[]; for(let c=0;c<W;c++){const sh=BigInt(c*S);bot[c]=1n<<sh;col[c]=((1n<<6n)-1n)<<sh;}
function st(seq){let current=0n,mask=0n,moves=0;for(const ch of seq){const c=ch.charCodeAt(0)-49;const mv=(mask+bot[c])&col[c];current^=mask;mask|=mv;moves++;}const [cLo,cHi]=pairFromBig(current),[mLo,mHi]=pairFromBig(mask);return {cLo,cHi,mLo,mHi,moves};}
const seq=process.argv[2], x=st(seq); for(let p=0;p<=4;p++){const s=new Solver(p,true,15);const t=process.hrtime.bigint();const score=s.solveBits(x.cLo,x.cHi,x.mLo,x.mHi,x.moves);const sec=Number(process.hrtime.bigint()-t)/1e9;console.log(JSON.stringify({p,chunks:1<<p,nodes:s.nodes,sec,nps:s.nodes/sec,score}));}

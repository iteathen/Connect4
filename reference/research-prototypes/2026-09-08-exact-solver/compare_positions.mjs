import {Solver as S1} from './twoword_solver.mjs';
import {Solver as S2} from './twoword_solver_2way_direct.mjs';
import {Solver as S4} from './twoword_solver_4way_direct.mjs';
import {Solver as ST} from './twoword_solver_4way_tags.mjs';

const WIDTH=7,HEIGHT=6,STRIDE=7;
let bottom=0n;
const bot=[], col=[];
for(let c=0;c<WIDTH;c++){
  const sh=BigInt(c*STRIDE);
  bot[c]=1n<<sh;
  col[c]=((1n<<BigInt(HEIGHT))-1n)<<sh;
  bottom|=bot[c];
}
function pair(x){return [Number(x&0xffffffffn)>>>0, Number((x>>32n)&0xffffffffn)>>>0];}
function state(seq){
  let current=0n,mask=0n,moves=0;
  for(const ch of seq){
    const c=ch.charCodeAt(0)-49;
    const mv=(mask+bot[c])&col[c];
    current^=mask; mask|=mv; moves++;
  }
  const [cLo,cHi]=pair(current), [mLo,mHi]=pair(mask);
  return {cLo,cHi,mLo,mHi,moves};
}
const seqs=process.argv.slice(2);
const variants=[['1way',S1],['2way',S2],['4way',S4],['tags',ST]];
for(const seq of seqs){
  const st=state(seq);
  console.log('SEQ',seq,'plies',st.moves);
  for(const [name,Cls] of variants){
    const s=new Cls(16,true);
    const t0=process.hrtime.bigint();
    let score;
    try {score=s.solveBits(st.cLo,st.cHi,st.mLo,st.mHi,st.moves);} catch(e){console.error(name,e);continue;}
    const sec=Number(process.hrtime.bigint()-t0)/1e9;
    console.log(JSON.stringify({name,score,nodes:s.nodes,sec,nps:s.nodes/sec,hits:s.hits??null,probes:s.probes??null}));
  }
}

const WIDTH=7, HEIGHT=6, STRIDE=7, CELLS=42;
const MIN_SCORE=-18, MAX_SCORE=18;
const TT_UPPER_LIMIT=MAX_SCORE-MIN_SCORE+1; //37
const TT_LOWER_OFFSET=MAX_SCORE-2*MIN_SCORE+2; //56
const TT_UPPER_OFFSET=-MIN_SCORE+1; //19
const ORDER=[3,4,2,5,1,6,0];

function pairFromBig(x){return [Number(x & 0xffffffffn)>>>0, Number((x>>32n)&0xffffffffn)>>>0];}
let bottom=0n;
const colLo=new Uint32Array(WIDTH), colHi=new Uint32Array(WIDTH);
const botLo=new Uint32Array(WIDTH), botHi=new Uint32Array(WIDTH);
const topLo=new Uint32Array(WIDTH), topHi=new Uint32Array(WIDTH);
for(let c=0;c<WIDTH;c++){
  const sh=BigInt(c*STRIDE);
  const b=1n<<sh, t=1n<<BigInt(HEIGHT-1+c*STRIDE), cm=((1n<<6n)-1n)<<sh;
  bottom|=b;
  [botLo[c],botHi[c]]=pairFromBig(b); [topLo[c],topHi[c]]=pairFromBig(t); [colLo[c],colHi[c]]=pairFromBig(cm);
}
const board=bottom*((1n<<6n)-1n);
const [BOTTOM_LO,BOTTOM_HI]=pairFromBig(bottom), [BOARD_LO,BOARD_HI]=pairFromBig(board);

const shlLo=(lo,k)=>(lo<<k)>>>0;
const shlHi=(lo,hi,k)=>((hi<<k)|(lo>>>(32-k)))>>>0;
const shrLo=(lo,hi,k)=>((lo>>>k)|(hi<<(32-k)))>>>0;
const shrHi=(hi,k)=>(hi>>>k)>>>0;
let WLO=0, WHI=0;
function winning(pLo,pHi,mLo,mHi){
  let aLo,aHi,bLo,bHi,pairLo,pairHi,rLo,rHi;
  aLo=shlLo(pLo,1); aHi=shlHi(pLo,pHi,1);
  bLo=shlLo(pLo,2); bHi=shlHi(pLo,pHi,2);
  rLo=aLo & bLo & shlLo(pLo,3); rHi=aHi & bHi & shlHi(pLo,pHi,3);

  aLo=shlLo(pLo,7); aHi=shlHi(pLo,pHi,7); bLo=shlLo(pLo,14); bHi=shlHi(pLo,pHi,14);
  pairLo=aLo&bLo; pairHi=aHi&bHi;
  rLo |= pairLo & shlLo(pLo,21); rHi |= pairHi & shlHi(pLo,pHi,21);
  rLo |= pairLo & shrLo(pLo,pHi,7); rHi |= pairHi & shrHi(pHi,7);
  aLo=shrLo(pLo,pHi,7); aHi=shrHi(pHi,7); bLo=shrLo(pLo,pHi,14); bHi=shrHi(pHi,14);
  pairLo=aLo&bLo; pairHi=aHi&bHi;
  rLo |= pairLo & shlLo(pLo,7); rHi |= pairHi & shlHi(pLo,pHi,7);
  rLo |= pairLo & shrLo(pLo,pHi,21); rHi |= pairHi & shrHi(pHi,21);

  aLo=shlLo(pLo,6); aHi=shlHi(pLo,pHi,6); bLo=shlLo(pLo,12); bHi=shlHi(pLo,pHi,12);
  pairLo=aLo&bLo; pairHi=aHi&bHi;
  rLo |= pairLo & shlLo(pLo,18); rHi |= pairHi & shlHi(pLo,pHi,18);
  rLo |= pairLo & shrLo(pLo,pHi,6); rHi |= pairHi & shrHi(pHi,6);
  aLo=shrLo(pLo,pHi,6); aHi=shrHi(pHi,6); bLo=shrLo(pLo,pHi,12); bHi=shrHi(pHi,12);
  pairLo=aLo&bLo; pairHi=aHi&bHi;
  rLo |= pairLo & shlLo(pLo,6); rHi |= pairHi & shlHi(pLo,pHi,6);
  rLo |= pairLo & shrLo(pLo,pHi,18); rHi |= pairHi & shrHi(pHi,18);

  aLo=shlLo(pLo,8); aHi=shlHi(pLo,pHi,8); bLo=shlLo(pLo,16); bHi=shlHi(pLo,pHi,16);
  pairLo=aLo&bLo; pairHi=aHi&bHi;
  rLo |= pairLo & shlLo(pLo,24); rHi |= pairHi & shlHi(pLo,pHi,24);
  rLo |= pairLo & shrLo(pLo,pHi,8); rHi |= pairHi & shrHi(pHi,8);
  aLo=shrLo(pLo,pHi,8); aHi=shrHi(pHi,8); bLo=shrLo(pLo,pHi,16); bHi=shrHi(pHi,16);
  pairLo=aLo&bLo; pairHi=aHi&bHi;
  rLo |= pairLo & shlLo(pLo,8); rHi |= pairHi & shlHi(pLo,pHi,8);
  rLo |= pairLo & shrLo(pLo,pHi,24); rHi |= pairHi & shrHi(pHi,24);

  WLO=(rLo & (~mLo) & BOARD_LO)>>>0; WHI=(rHi & (~mHi) & BOARD_HI)>>>0;
}
function addPair(aLo,aHi,bLo,bHi){
  const lo=(aLo+bLo)>>>0; const carry=lo<aLo?1:0; WLO=lo; WHI=(aHi+bHi+carry)>>>0;
}
function possible(mLo,mHi){addPair(mLo,mHi,BOTTOM_LO,BOTTOM_HI); WLO=(WLO&BOARD_LO)>>>0; WHI=(WHI&BOARD_HI)>>>0;}
function pop32(x){x>>>=0; x=x-((x>>>1)&0x55555555); x=(x&0x33333333)+((x>>>2)&0x33333333); return (Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24);}
function popPair(lo,hi){return pop32(lo)+pop32(hi);}
function multiBit(lo,hi){
  lo>>>=0; hi>>>=0;
  if(hi!==0){ if(lo!==0) return true; return (hi & ((hi-1)>>>0))!==0; }
  return lo!==0 && (lo & ((lo-1)>>>0))!==0;
}

class Solver{
  constructor(pow=23, shared=false){
    this.size=1<<pow; this.mask=this.size-1;
    const B=shared?SharedArrayBuffer:ArrayBuffer;
    this.tt=new Uint32Array(new B(this.size*16));
    this.moveLo=new Uint32Array((CELLS+1)*WIDTH);
    this.moveHi=new Uint32Array((CELLS+1)*WIDTH);
    this.moveScore=new Int8Array((CELLS+1)*WIDTH);
    this.nodes=0; this.limit=Infinity;
  }
  hash(lo,hi){
    return (lo ^ Math.imul(hi,0x9e3779b1)) & this.mask;
  }
  solveEmpty(){return this.solveBits(0,0,0,0,0);}
  solveBits(cLo,cHi,mLo,mHi,moves){
    winning(cLo,cHi,mLo,mHi); possible(mLo,mHi); if(((WLO & arguments[0])|0)===123456789){} // keep optimizer honest, no-op
    // recompute direct immediate win test because globals were overwritten by possible
    winning(cLo,cHi,mLo,mHi); const winLo=WLO,winHi=WHI; possible(mLo,mHi);
    if(((winLo&WLO)|(winHi&WHI))!==0) return Math.trunc((CELLS+1-moves)/2);
    let min=-Math.trunc((CELLS-moves)/2), max=Math.trunc((CELLS+1-moves)/2);
    while(min<max){
      let med=min+Math.trunc((max-min)/2);
      if(med<=0 && Math.trunc(min/2)<med) med=Math.trunc(min/2);
      else if(med>=0 && Math.trunc(max/2)>med) med=Math.trunc(max/2);
      const score=this.negamax(cLo,cHi,mLo,mHi,moves,med,med+1);
      if(score<=med) max=score; else min=score;
    }
    return min===0?0:min;
  }
  negamax(cLo,cHi,mLo,mHi,moves,alpha,beta){
    this.nodes++; if(this.nodes===this.limit) throw 911;
    possible(mLo,mHi); let candLo=WLO,candHi=WHI;
    winning((cLo^mLo)>>>0,(cHi^mHi)>>>0,mLo,mHi); const owLo=WLO,owHi=WHI;
    let forcedLo=(candLo&owLo)>>>0, forcedHi=(candHi&owHi)>>>0;
    if((forcedLo|forcedHi)!==0){
      if(multiBit(forcedLo,forcedHi)) return -Math.trunc((CELLS-moves)/2);
      candLo=forcedLo; candHi=forcedHi;
    }
    // candidates &= ~(opponentWins >> 1)
    const rsLo=((owLo>>>1)|(owHi<<31))>>>0, rsHi=(owHi>>>1)>>>0;
    candLo=(candLo & ~rsLo)>>>0; candHi=(candHi & ~rsHi)>>>0;
    if((candLo|candHi)===0) return -Math.trunc((CELLS-moves)/2);
    if(moves>=CELLS-2) return 0;

    let min=-Math.trunc((CELLS-2-moves)/2);
    if(alpha<min){alpha=min; if(alpha>=beta)return alpha;}
    let max=Math.trunc((CELLS-1-moves)/2);
    if(beta>max){beta=max; if(alpha>=beta)return beta;}

    addPair(cLo,cHi,mLo,mHi); const kLo=WLO,kHi=WHI;
    const ttBase=this.hash(kLo,kHi)<<2; const cached=this.tt[ttBase];
    if(cached!==0 && this.tt[ttBase+1]===kLo && this.tt[ttBase+2]===kHi){
      if(cached>TT_UPPER_LIMIT){
        min=cached-TT_LOWER_OFFSET; if(alpha<min){alpha=min; if(alpha>=beta)return alpha;}
      }else{
        max=cached-TT_UPPER_OFFSET; if(beta>max){beta=max; if(alpha>=beta)return beta;}
      }
    }

    const base=moves*WIDTH; let count=0;
    for(let oi=0;oi<WIDTH;oi++){
      const col=ORDER[oi]; const mvLo=(candLo&colLo[col])>>>0, mvHi=(candHi&colHi[col])>>>0;
      if((mvLo|mvHi)===0) continue;
      winning((cLo|mvLo)>>>0,(cHi|mvHi)>>>0,mLo,mHi); const sc=popPair(WLO,WHI);
      let at=count;
      while(at>0 && this.moveScore[base+at-1]<sc){
        this.moveScore[base+at]=this.moveScore[base+at-1]; this.moveLo[base+at]=this.moveLo[base+at-1]; this.moveHi[base+at]=this.moveHi[base+at-1]; at--;
      }
      this.moveScore[base+at]=sc; this.moveLo[base+at]=mvLo; this.moveHi[base+at]=mvHi; count++;
    }
    for(let i=0;i<count;i++){
      const mvLo=this.moveLo[base+i], mvHi=this.moveHi[base+i];
      const score=-this.negamax((cLo^mLo)>>>0,(cHi^mHi)>>>0,(mLo|mvLo)>>>0,(mHi|mvHi)>>>0,moves+1,-beta,-alpha);
      if(score>=beta){this.tt[ttBase+1]=kLo; this.tt[ttBase+2]=kHi; this.tt[ttBase]=score+TT_LOWER_OFFSET; return score;}
      if(score>alpha)alpha=score;
    }
    this.tt[ttBase+1]=kLo; this.tt[ttBase+2]=kHi; this.tt[ttBase]=alpha+TT_UPPER_OFFSET; return alpha;
  }
}

function testOps(){
  // Compare winning() against BigInt reference for random legal-ish 49-bit pairs where current subset mask.
  let seed=0x12345678;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed;};
  function bigWin(p,m){
    let r=(p<<1n)&(p<<2n)&(p<<3n); let pair=(p<<7n)&(p<<14n); r|=pair&(p<<21n); r|=pair&(p>>7n); pair=(p>>7n)&(p>>14n); r|=pair&(p<<7n); r|=pair&(p>>21n); pair=(p<<6n)&(p<<12n); r|=pair&(p<<18n); r|=pair&(p>>6n); pair=(p>>6n)&(p>>12n); r|=pair&(p<<6n); r|=pair&(p>>18n); pair=(p<<8n)&(p<<16n); r|=pair&(p<<24n); r|=pair&(p>>8n); pair=(p>>8n)&(p>>16n); r|=pair&(p<<8n); r|=pair&(p>>24n); return r&(board^m);
  }
  for(let i=0;i<100000;i++){
    let ml=(rnd() & BOARD_LO)>>>0, mh=(rnd() & BOARD_HI)>>>0;
    let cl=(rnd()&ml)>>>0, ch=(rnd()&mh)>>>0;
    winning(cl,ch,ml,mh);
    const p=BigInt(cl)+(BigInt(ch)<<32n), m=BigInt(ml)+(BigInt(mh)<<32n), w=bigWin(p,m); const [bl,bh]=pairFromBig(w);
    if(WLO!==bl||WHI!==bh) throw new Error(`win mismatch ${i}`);
    possible(ml,mh); const bp=(m+bottom)&board; const [pl,ph]=pairFromBig(bp); if(WLO!==pl||WHI!==ph) throw new Error(`possible mismatch ${i}`);
  }
  console.log('ops ok');
}

if(import.meta.url===`file://${process.argv[1]}`){
  testOps();
  const pow=Number(process.argv[2]??23), shared=(process.argv[3]??'sab')==='sab';
  console.log(`alloc TT 2^${pow}, ${shared?'SAB':'AB'}`);
  const s=new Solver(pow,shared);
  // Warm tiny sequence impossible without parser; warm hot kernel separately by calls.
  for(let i=0;i<200000;i++) winning(i>>>0,0,0,0);
  const limit=Number(process.argv[4]??20000000); s.limit=limit;
  const t0=process.hrtime.bigint();
  let score=null,stopped=false;
  try{score=s.solveEmpty();}catch(e){if(e===911)stopped=true;else throw e;}
  const dt=Number(process.hrtime.bigint()-t0)/1e9;
  console.log(JSON.stringify({score,stopped,nodes:s.nodes,seconds:dt,nps:s.nodes/dt,ttSlots:s.size,shared}));
}
export {Solver,winning};

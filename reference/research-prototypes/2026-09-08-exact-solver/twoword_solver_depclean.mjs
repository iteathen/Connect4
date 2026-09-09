const WIDTH=7, HEIGHT=6, STRIDE=7, CELLS=42;
const MIN_SCORE=-18, MAX_SCORE=18;
const TT_UPPER_LIMIT=MAX_SCORE-MIN_SCORE+1;
const TT_LOWER_OFFSET=MAX_SCORE-2*MIN_SCORE+2;
const TT_UPPER_OFFSET=-MIN_SCORE+1;
const ORDER=[3,4,2,5,1,6,0];
const FREE=0xffff;

function pairFromBig(x){return [Number(x & 0xffffffffn)>>>0, Number((x>>32n)&0xffffffffn)>>>0];}
let bottom=0n, selected1=0n, selected2=0n;
const colLo=new Uint32Array(WIDTH), colHi=new Uint32Array(WIDTH);
for(let c=0;c<WIDTH;c++){
  const sh=BigInt(c*STRIDE);
  const b=1n<<sh, cm=((1n<<6n)-1n)<<sh;
  bottom|=b; selected1 |= (1n<<sh); selected2 |= (3n<<sh);
  [colLo[c],colHi[c]]=pairFromBig(cm);
}
const board=bottom*((1n<<6n)-1n);
const [BOTTOM_LO,BOTTOM_HI]=pairFromBig(bottom), [BOARD_LO,BOARD_HI]=pairFromBig(board), [SEL1_LO,SEL1_HI]=pairFromBig(selected1), [SEL2_LO,SEL2_HI]=pairFromBig(selected2);

const shlLo=(lo,k)=>(lo<<k)>>>0;
const shlHi=(lo,hi,k)=>((hi<<k)|(lo>>>(32-k)))>>>0;
const shrLo=(lo,hi,k)=>((lo>>>k)|(hi<<(32-k)))>>>0;
const shrHi=(hi,k)=>(hi>>>k)>>>0;
let WLO=0, WHI=0;
function winning(pLo,pHi,mLo,mHi){
  let aLo,aHi,bLo,bHi,pairLo,pairHi,rLo,rHi;
  aLo=shlLo(pLo,1); aHi=shlHi(pLo,pHi,1); bLo=shlLo(pLo,2); bHi=shlHi(pLo,pHi,2);
  rLo=aLo & bLo & shlLo(pLo,3); rHi=aHi & bHi & shlHi(pLo,pHi,3);
  aLo=shlLo(pLo,7); aHi=shlHi(pLo,pHi,7); bLo=shlLo(pLo,14); bHi=shlHi(pLo,pHi,14);
  pairLo=aLo&bLo; pairHi=aHi&bHi; rLo|=pairLo&shlLo(pLo,21); rHi|=pairHi&shlHi(pLo,pHi,21); rLo|=pairLo&shrLo(pLo,pHi,7); rHi|=pairHi&shrHi(pHi,7);
  aLo=shrLo(pLo,pHi,7); aHi=shrHi(pHi,7); bLo=shrLo(pLo,pHi,14); bHi=shrHi(pHi,14);
  pairLo=aLo&bLo; pairHi=aHi&bHi; rLo|=pairLo&shlLo(pLo,7); rHi|=pairHi&shlHi(pLo,pHi,7); rLo|=pairLo&shrLo(pLo,pHi,21); rHi|=pairHi&shrHi(pHi,21);
  aLo=shlLo(pLo,6); aHi=shlHi(pLo,pHi,6); bLo=shlLo(pLo,12); bHi=shlHi(pLo,pHi,12);
  pairLo=aLo&bLo; pairHi=aHi&bHi; rLo|=pairLo&shlLo(pLo,18); rHi|=pairHi&shlHi(pLo,pHi,18); rLo|=pairLo&shrLo(pLo,pHi,6); rHi|=pairHi&shrHi(pHi,6);
  aLo=shrLo(pLo,pHi,6); aHi=shrHi(pHi,6); bLo=shrLo(pLo,pHi,12); bHi=shrHi(pHi,12);
  pairLo=aLo&bLo; pairHi=aHi&bHi; rLo|=pairLo&shlLo(pLo,6); rHi|=pairHi&shlHi(pLo,pHi,6); rLo|=pairLo&shrLo(pLo,pHi,18); rHi|=pairHi&shrHi(pHi,18);
  aLo=shlLo(pLo,8); aHi=shlHi(pLo,pHi,8); bLo=shlLo(pLo,16); bHi=shlHi(pLo,pHi,16);
  pairLo=aLo&bLo; pairHi=aHi&bHi; rLo|=pairLo&shlLo(pLo,24); rHi|=pairHi&shlHi(pLo,pHi,24); rLo|=pairLo&shrLo(pLo,pHi,8); rHi|=pairHi&shrHi(pHi,8);
  aLo=shrLo(pLo,pHi,8); aHi=shrHi(pHi,8); bLo=shrLo(pLo,pHi,16); bHi=shrHi(pHi,16);
  pairLo=aLo&bLo; pairHi=aHi&bHi; rLo|=pairLo&shlLo(pLo,8); rHi|=pairHi&shlHi(pLo,pHi,8); rLo|=pairLo&shrLo(pLo,pHi,24); rHi|=pairHi&shrHi(pHi,24);
  WLO=(rLo & (~mLo) & BOARD_LO)>>>0; WHI=(rHi & (~mHi) & BOARD_HI)>>>0;
}
function addPair(aLo,aHi,bLo,bHi){const lo=(aLo+bLo)>>>0;WLO=lo;WHI=(aHi+bHi+(lo<aLo?1:0))>>>0;}
function possible(mLo,mHi){addPair(mLo,mHi,BOTTOM_LO,BOTTOM_HI);WLO=(WLO&BOARD_LO)>>>0;WHI=(WHI&BOARD_HI)>>>0;}
function pop32(x){x>>>=0;x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24);}
function popPair(lo,hi){return pop32(lo)+pop32(hi);}
function multiBit(lo,hi){lo>>>=0;hi>>>=0;if(hi!==0){if(lo!==0)return true;return (hi&((hi-1)>>>0))!==0;}return lo!==0&&(lo&((lo-1)>>>0))!==0;}
function bitAt(lo,hi,bit){return bit<32?((lo>>>bit)&1):((hi>>>(bit-32))&1);}

class Solver{
  constructor(chunkCount=16, shared=false, chunkPow=15, depRows=2){
    // one chunk is a permanent spill chunk; the rest are dependency-owned/reclaimable.
    if(chunkCount<2)chunkCount=2;
    this.chunkCount=chunkCount|0; this.chunkPow=chunkPow|0; this.depRows=(depRows===1?1:2); this.selLo=this.depRows===1?SEL1_LO:SEL2_LO; this.selHi=this.depRows===1?SEL1_HI:SEL2_HI; this.chunkSize=1<<this.chunkPow; this.chunkMask=this.chunkSize-1;
    this.spillChunk=this.chunkCount-1; this.size=this.chunkCount*this.chunkSize;
    const B=shared?SharedArrayBuffer:ArrayBuffer;
    this.keyLo=new Uint32Array(new B(this.size*4)); this.keyHi=new Uint32Array(new B(this.size*4)); this.val=new Uint8Array(new B(this.size));
    // 7 columns * 3 bits/column = 21-bit logical dependency signature.
    this.logicalToPhysical=new Uint16Array(1<<21); this.logicalToPhysical.fill(FREE);
    this.chunkSig=new Uint32Array(this.chunkCount); this.chunkSig.fill(0xffffffff);
    this.anchorP0Lo=new Uint32Array(this.chunkCount); this.anchorP0Hi=new Uint32Array(this.chunkCount);
    this.anchorP1Lo=new Uint32Array(this.chunkCount); this.anchorP1Hi=new Uint32Array(this.chunkCount);
    this.freeChunks=new Uint16Array(this.chunkCount-1); this.freeTop=0;
    for(let i=this.chunkCount-2;i>=0;i--)this.freeChunks[this.freeTop++]=i;
    this.moveLo=new Uint32Array((CELLS+1)*WIDTH);this.moveHi=new Uint32Array((CELLS+1)*WIDTH);this.moveScore=new Int8Array((CELLS+1)*WIDTH);this.moveCol=new Uint8Array((CELLS+1)*WIDTH);
    this.nodes=0;this.limit=Infinity;
    this.cleanScans=0;this.reclaims=0;this.allocations=0;this.mapHits=0;this.spillTransitions=0;this.depTransitions=0;
  }
  resetMetrics(){this.nodes=0;this.cleanScans=0;this.reclaims=0;this.allocations=0;this.mapHits=0;this.spillTransitions=0;this.depTransitions=0;}
  absoluteOwners(cLo,cHi,mLo,mHi,moves){
    if((moves&1)===0)return [cLo>>>0,cHi>>>0,(cLo^mLo)>>>0,(cHi^mHi)>>>0];
    return [(cLo^mLo)>>>0,(cHi^mHi)>>>0,cLo>>>0,cHi>>>0];
  }
  dependencySig(cLo,cHi,mLo,mHi,moves){
    const [p0Lo,p0Hi,p1Lo,p1Hi]=this.absoluteOwners(cLo,cHi,mLo,mHi,moves);
    let sig=0;
    for(let c=0;c<WIDTH;c++){
      const b=c*STRIDE, b0=bitAt(p0Lo,p0Hi,b), b1=bitAt(p1Lo,p1Hi,b);
      let code=0;
      if(b0||b1){
        const owner0=b1?1:0;
        if(this.depRows===1) code=owner0?2:1;
        else {
          const s0=bitAt(p0Lo,p0Hi,b+1), s1=bitAt(p1Lo,p1Hi,b+1);
          if(!(s0||s1)) code=owner0?2:1;
          else { const owner1=s1?1:0; code=3+(owner0<<1)+owner1; }
        }
      }
      sig|=(code<<(c*3));
    }
    return sig>>>0;
  }
  cleanForTask(cLo,cHi,mLo,mHi,moves){
    // Proof-only task-boundary cleaner: reclaim only families contradicted by an immutable opposite-owner fact in the new task root.
    const [p0Lo,p0Hi,p1Lo,p1Hi]=this.absoluteOwners(cLo,cHi,mLo,mHi,moves);
    this.cleanScans++;
    for(let ch=0;ch<this.chunkCount-1;ch++){
      const sig=this.chunkSig[ch]; if(sig===0xffffffff)continue;
      if((((this.anchorP0Lo[ch]&p1Lo)|(this.anchorP0Hi[ch]&p1Hi)|(this.anchorP1Lo[ch]&p0Lo)|(this.anchorP1Hi[ch]&p0Hi))>>>0)!==0){
        if(this.logicalToPhysical[sig]===ch)this.logicalToPhysical[sig]=FREE;
        this.chunkSig[ch]=0xffffffff; this.freeChunks[this.freeTop++]=ch; this.reclaims++;
      }
    }
  }
  allocateSig(sig,cLo,cHi,mLo,mHi,moves){
    const hit=this.logicalToPhysical[sig];
    if(hit!==FREE){this.mapHits++;return hit*this.chunkSize;}
    if(this.freeTop===0){this.spillTransitions++;return this.spillChunk*this.chunkSize;}
    const ch=this.freeChunks[--this.freeTop];
    const [p0Lo,p0Hi,p1Lo,p1Hi]=this.absoluteOwners(cLo,cHi,mLo,mHi,moves);
    this.chunkSig[ch]=sig; this.logicalToPhysical[sig]=ch;
    this.anchorP0Lo[ch]=(p0Lo&this.selLo)>>>0;this.anchorP0Hi[ch]=(p0Hi&this.selHi)>>>0;
    this.anchorP1Lo[ch]=(p1Lo&this.selLo)>>>0;this.anchorP1Hi[ch]=(p1Hi&this.selHi)>>>0;
    this.allocations++;
    return ch*this.chunkSize;
  }
  beginTask(cLo,cHi,mLo,mHi,moves){
    this.cleanForTask(cLo,cHi,mLo,mHi,moves);
    const sig=this.dependencySig(cLo,cHi,mLo,mHi,moves);
    const base=this.allocateSig(sig,cLo,cHi,mLo,mHi,moves);
    return [sig,base];
  }
  nextDependencySig(sig,col,moves){
    const shift=col*3, code=(sig>>>shift)&7;
    if(this.depRows===1){if(code!==0)return sig;const nc=(moves&1)?2:1;return ((sig&~(7<<shift))|(nc<<shift))>>>0;}
    if(code>=3)return sig;
    const p=moves&1; let nc;
    if(code===0)nc=p?2:1;
    else if(code===1)nc=p?4:3;
    else nc=p?6:5;
    return ((sig & ~(7<<shift)) | (nc<<shift))>>>0;
  }
  hash(lo,hi,base){let x=(lo^Math.imul(hi,0x9e3779b1))>>>0;x=Math.imul(x^(x>>>16),0x85ebca6b)>>>0;return base+(x&this.chunkMask);}
  solveBits(cLo,cHi,mLo,mHi,moves){
    winning(cLo,cHi,mLo,mHi);const winLo=WLO,winHi=WHI;possible(mLo,mHi);if(((winLo&WLO)|(winHi&WHI))!==0)return Math.trunc((CELLS+1-moves)/2);
    let min=-Math.trunc((CELLS-moves)/2),max=Math.trunc((CELLS+1-moves)/2);const [sig,base]=this.beginTask(cLo,cHi,mLo,mHi,moves);
    while(min<max){let med=min+Math.trunc((max-min)/2);if(med<=0&&Math.trunc(min/2)<med)med=Math.trunc(min/2);else if(med>=0&&Math.trunc(max/2)>med)med=Math.trunc(max/2);const score=this.negamax(cLo,cHi,mLo,mHi,moves,med,med+1,sig,base);if(score<=med)max=score;else min=score;}
    return min===0?0:min;
  }
  negamax(cLo,cHi,mLo,mHi,moves,alpha,beta,depSig,chunkBase){
    this.nodes++;if(this.nodes===this.limit)throw 911;
    possible(mLo,mHi);let candLo=WLO,candHi=WHI;
    winning((cLo^mLo)>>>0,(cHi^mHi)>>>0,mLo,mHi);const owLo=WLO,owHi=WHI;
    let forcedLo=(candLo&owLo)>>>0,forcedHi=(candHi&owHi)>>>0;
    if((forcedLo|forcedHi)!==0){if(multiBit(forcedLo,forcedHi))return -Math.trunc((CELLS-moves)/2);candLo=forcedLo;candHi=forcedHi;}
    const rsLo=((owLo>>>1)|(owHi<<31))>>>0,rsHi=(owHi>>>1)>>>0;candLo=(candLo&~rsLo)>>>0;candHi=(candHi&~rsHi)>>>0;
    if((candLo|candHi)===0)return -Math.trunc((CELLS-moves)/2);if(moves>=CELLS-2)return 0;
    let min=-Math.trunc((CELLS-2-moves)/2);if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}let max=Math.trunc((CELLS-1-moves)/2);if(beta>max){beta=max;if(alpha>=beta)return beta;}
    addPair(cLo,cHi,mLo,mHi);const kLo=WLO,kHi=WHI,slot=this.hash(kLo,kHi,chunkBase);
    if(this.keyLo[slot]===kLo&&this.keyHi[slot]===kHi){const cached=this.val[slot];if(cached!==0){if(cached>TT_UPPER_LIMIT){min=cached-TT_LOWER_OFFSET;if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}}else{max=cached-TT_UPPER_OFFSET;if(beta>max){beta=max;if(alpha>=beta)return beta;}}}}
    const base=moves*WIDTH;let count=0;
    for(let oi=0;oi<WIDTH;oi++){
      const col=ORDER[oi],mvLo=(candLo&colLo[col])>>>0,mvHi=(candHi&colHi[col])>>>0;if((mvLo|mvHi)===0)continue;
      winning((cLo|mvLo)>>>0,(cHi|mvHi)>>>0,mLo,mHi);const sc=popPair(WLO,WHI);let at=count;
      while(at>0&&this.moveScore[base+at-1]<sc){this.moveScore[base+at]=this.moveScore[base+at-1];this.moveLo[base+at]=this.moveLo[base+at-1];this.moveHi[base+at]=this.moveHi[base+at-1];this.moveCol[base+at]=this.moveCol[base+at-1];at--;}
      this.moveScore[base+at]=sc;this.moveLo[base+at]=mvLo;this.moveHi[base+at]=mvHi;this.moveCol[base+at]=col;count++;
    }
    for(let i=0;i<count;i++){
      const mvLo=this.moveLo[base+i],mvHi=this.moveHi[base+i],col=this.moveCol[base+i];
      const ns=this.nextDependencySig(depSig,col,moves);
      const ncLo=(cLo^mLo)>>>0,ncHi=(cHi^mHi)>>>0,nmLo=(mLo|mvLo)>>>0,nmHi=(mHi|mvHi)>>>0,nmoves=moves+1;
      let nb=chunkBase;
      if(ns!==depSig){this.depTransitions++;nb=this.allocateSig(ns,ncLo,ncHi,nmLo,nmHi,nmoves);}
      const score=-this.negamax(ncLo,ncHi,nmLo,nmHi,nmoves,-beta,-alpha,ns,nb);
      if(score>=beta){this.keyLo[slot]=kLo;this.keyHi[slot]=kHi;this.val[slot]=score+TT_LOWER_OFFSET;return score;}if(score>alpha)alpha=score;
    }
    this.keyLo[slot]=kLo;this.keyHi[slot]=kHi;this.val[slot]=alpha+TT_UPPER_OFFSET;return alpha;
  }
}
export {Solver,winning,pairFromBig};

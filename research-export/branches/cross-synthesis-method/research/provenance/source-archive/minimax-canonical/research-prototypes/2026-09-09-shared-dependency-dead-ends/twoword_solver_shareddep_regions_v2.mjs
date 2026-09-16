const WIDTH=7, HEIGHT=6, STRIDE=7, CELLS=42;
const MIN_SCORE=-18, MAX_SCORE=18;
const TT_UPPER_LIMIT=MAX_SCORE-MIN_SCORE+1;
const TT_LOWER_OFFSET=MAX_SCORE-2*MIN_SCORE+2;
const TT_UPPER_OFFSET=-MIN_SCORE+1;
const ORDER=[3,4,2,5,1,6,0];

function pairFromBig(x){return [Number(x&0xffffffffn)>>>0,Number((x>>32n)&0xffffffffn)>>>0];}
let bottom=0n,selected1=0n;
const colLo=new Uint32Array(WIDTH),colHi=new Uint32Array(WIDTH);
for(let c=0;c<WIDTH;c++){const sh=BigInt(c*STRIDE),b=1n<<sh,cm=((1n<<6n)-1n)<<sh;bottom|=b;selected1|=b;[colLo[c],colHi[c]]=pairFromBig(cm);}
const board=bottom*((1n<<6n)-1n);
const [BOTTOM_LO,BOTTOM_HI]=pairFromBig(bottom),[BOARD_LO,BOARD_HI]=pairFromBig(board),[SEL_LO,SEL_HI]=pairFromBig(selected1);
const shlLo=(lo,k)=>(lo<<k)>>>0,shlHi=(lo,hi,k)=>((hi<<k)|(lo>>>(32-k)))>>>0,shrLo=(lo,hi,k)=>((lo>>>k)|(hi<<(32-k)))>>>0,shrHi=(hi,k)=>(hi>>>k)>>>0;
let WLO=0,WHI=0;
function winning(pLo,pHi,mLo,mHi){let aLo,aHi,bLo,bHi,qLo,qHi,rLo,rHi;
 aLo=shlLo(pLo,1);aHi=shlHi(pLo,pHi,1);bLo=shlLo(pLo,2);bHi=shlHi(pLo,pHi,2);rLo=aLo&bLo&shlLo(pLo,3);rHi=aHi&bHi&shlHi(pLo,pHi,3);
 aLo=shlLo(pLo,7);aHi=shlHi(pLo,pHi,7);bLo=shlLo(pLo,14);bHi=shlHi(pLo,pHi,14);qLo=aLo&bLo;qHi=aHi&bHi;rLo|=qLo&shlLo(pLo,21);rHi|=qHi&shlHi(pLo,pHi,21);rLo|=qLo&shrLo(pLo,pHi,7);rHi|=qHi&shrHi(pHi,7);
 aLo=shrLo(pLo,pHi,7);aHi=shrHi(pHi,7);bLo=shrLo(pLo,pHi,14);bHi=shrHi(pHi,14);qLo=aLo&bLo;qHi=aHi&bHi;rLo|=qLo&shlLo(pLo,7);rHi|=qHi&shlHi(pLo,pHi,7);rLo|=qLo&shrLo(pLo,pHi,21);rHi|=qHi&shrHi(pHi,21);
 aLo=shlLo(pLo,6);aHi=shlHi(pLo,pHi,6);bLo=shlLo(pLo,12);bHi=shlHi(pLo,pHi,12);qLo=aLo&bLo;qHi=aHi&bHi;rLo|=qLo&shlLo(pLo,18);rHi|=qHi&shlHi(pLo,pHi,18);rLo|=qLo&shrLo(pLo,pHi,6);rHi|=qHi&shrHi(pHi,6);
 aLo=shrLo(pLo,pHi,6);aHi=shrHi(pHi,6);bLo=shrLo(pLo,pHi,12);bHi=shrHi(pHi,12);qLo=aLo&bLo;qHi=aHi&bHi;rLo|=qLo&shlLo(pLo,6);rHi|=qHi&shlHi(pLo,pHi,6);rLo|=qLo&shrLo(pLo,pHi,18);rHi|=qHi&shrHi(pHi,18);
 aLo=shlLo(pLo,8);aHi=shlHi(pLo,pHi,8);bLo=shlLo(pLo,16);bHi=shlHi(pLo,pHi,16);qLo=aLo&bLo;qHi=aHi&bHi;rLo|=qLo&shlLo(pLo,24);rHi|=qHi&shlHi(pLo,pHi,24);rLo|=qLo&shrLo(pLo,pHi,8);rHi|=qHi&shrHi(pHi,8);
 aLo=shrLo(pLo,pHi,8);aHi=shrHi(pHi,8);bLo=shrLo(pLo,pHi,16);bHi=shrHi(pHi,16);qLo=aLo&bLo;qHi=aHi&bHi;rLo|=qLo&shlLo(pLo,8);rHi|=qHi&shlHi(pLo,pHi,8);rLo|=qLo&shrLo(pLo,pHi,24);rHi|=qHi&shrHi(pHi,24);
 WLO=(rLo&(~mLo)&BOARD_LO)>>>0;WHI=(rHi&(~mHi)&BOARD_HI)>>>0;}
function addPair(aLo,aHi,bLo,bHi){const lo=(aLo+bLo)>>>0;WLO=lo;WHI=(aHi+bHi+(lo<aLo?1:0))>>>0;}
function possible(mLo,mHi){addPair(mLo,mHi,BOTTOM_LO,BOTTOM_HI);WLO=(WLO&BOARD_LO)>>>0;WHI=(WHI&BOARD_HI)>>>0;}
function pop32(x){x>>>=0;x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24;}
function popPair(lo,hi){return pop32(lo)+pop32(hi);}function multiBit(lo,hi){lo>>>=0;hi>>>=0;if(hi){if(lo)return true;return (hi&((hi-1)>>>0))!==0;}return lo!==0&&(lo&((lo-1)>>>0))!==0;}function bitAt(lo,hi,b){return b<32?((lo>>>b)&1):((hi>>>(b-32))&1);}

class Solver{
 constructor(cfg){this.workerId=cfg.workerId|0;this.slabCount=cfg.slabCount|0;this.slabPow=cfg.slabPow|0;this.slabSize=1<<this.slabPow;this.desiredSpanLog2=cfg.regionSpanLog2|0;this.rootEmptyBottom=cfg.rootEmptyBottom|0;this.size=this.slabCount*this.slabSize;
  this.keyLo=new Uint32Array(cfg.keyLoSab);this.keyHi=new Uint32Array(cfg.keyHiSab);this.val=new Uint8Array(cfg.valSab);this.ctrl=new Int32Array(cfg.ctrlSab);this.owner=new Uint8Array(cfg.ownerSab);
  this.logicalMap=new Int32Array(cfg.logicalMapSab);this.slabSig=new Int32Array(cfg.slabSigSab);this.regionSpan=new Uint8Array(cfg.regionSpanSab);this.anchorP0Lo=new Uint32Array(cfg.anchorP0LoSab);this.anchorP0Hi=new Uint32Array(cfg.anchorP0HiSab);this.anchorP1Lo=new Uint32Array(cfg.anchorP1LoSab);this.anchorP1Hi=new Uint32Array(cfg.anchorP1HiSab);this.allocLock=new Int32Array(cfg.allocLockSab);
  this.moveLo=new Uint32Array((CELLS+1)*WIDTH);this.moveHi=new Uint32Array((CELLS+1)*WIDTH);this.moveScore=new Int8Array((CELLS+1)*WIDTH);this.moveCol=new Uint8Array((CELLS+1)*WIDTH);this.limit=Infinity;this.resetMetrics();}
 resetMetrics(){this.nodes=0;this.ttHits=0;this.crossHits=0;this.writeAttempts=0;this.writeSuccess=0;this.writeBusy=0;this.allocations=0;this.mapHits=0;this.noRegion=0;this.depTransitions=0;this.allocSpins=0;this.allocatedSlabs=0;}
 absoluteOwners(cLo,cHi,mLo,mHi,moves){return (moves&1)===0?[cLo>>>0,cHi>>>0,(cLo^mLo)>>>0,(cHi^mHi)>>>0]:[(cLo^mLo)>>>0,(cHi^mHi)>>>0,cLo>>>0,cHi>>>0];}
 dependencySig(cLo,cHi,mLo,mHi,moves){const [p0Lo,p0Hi,p1Lo,p1Hi]=this.absoluteOwners(cLo,cHi,mLo,mHi,moves);let sig=0;for(let c=0;c<WIDTH;c++){const b=c*STRIDE,b0=bitAt(p0Lo,p0Hi,b),b1=bitAt(p1Lo,p1Hi,b);const code=(b0||b1)?(b1?2:1):0;sig|=code<<(c*3);}return sig>>>0;}
 nextDependencySig(sig,col,moves){const sh=col*3;if(((sig>>>sh)&7)!==0)return sig;const code=(moves&1)?2:1;return ((sig&~(7<<sh))|(code<<sh))>>>0;}
 lockAlloc(){let spins=0;for(;;){if(Atomics.compareExchange(this.allocLock,0,0,1)===0)break;spins++;if(spins<256)continue;Atomics.wait(this.allocLock,0,1,1);}this.allocSpins+=spins;}
 unlockAlloc(){Atomics.store(this.allocLock,0,0);Atomics.notify(this.allocLock,0,1);}
 allocateSig(sig,cLo,cHi,mLo,mHi,moves){
  let enc=Atomics.load(this.logicalMap,sig);
  if(enc>0){this.mapHits++;return enc;}
  this.lockAlloc();
  try{
    enc=Atomics.load(this.logicalMap,sig);
    if(enc>0){this.mapHits++;return enc;}
    let empty=0;for(let c=0;c<WIDTH;c++)if(((sig>>>(c*3))&7)===0)empty++;const fixedDelta=Math.max(0,this.rootEmptyBottom-empty);let log=Math.min(Math.max(0,this.desiredSpanLog2-fixedDelta),Math.floor(Math.log2(this.slabCount)));
    for(;log>=0;log--){
      const span=1<<log;
      for(let base=0;base+span<=this.slabCount;base+=span){
        let ok=true;
        for(let j=0;j<span;j++){if(this.slabSig[base+j]!==-1){ok=false;break;}}
        if(!ok)continue;
        for(let j=0;j<span;j++)this.slabSig[base+j]=-2;
        const[p0Lo,p0Hi,p1Lo,p1Hi]=this.absoluteOwners(cLo,cHi,mLo,mHi,moves);
        this.anchorP0Lo[base]=(p0Lo&SEL_LO)>>>0;this.anchorP0Hi[base]=(p0Hi&SEL_HI)>>>0;
        this.anchorP1Lo[base]=(p1Lo&SEL_LO)>>>0;this.anchorP1Hi[base]=(p1Hi&SEL_HI)>>>0;
        this.regionSpan[base]=log+1;
        this.slabSig[base]=sig|0;
        for(let j=1;j<span;j++)this.slabSig[base+j]=-3;
        enc=(((log+1)<<16)|(base+1))|0;
        Atomics.store(this.logicalMap,sig,enc);
        this.allocations++;this.allocatedSlabs+=span;
        return enc;
      }
    }
    this.noRegion++;return 0;
  }finally{this.unlockAlloc();}
 }
 hash(lo,hi,regionBase,regionMask){if(regionBase<0)return-1;let x=(lo^Math.imul(hi,0x9e3779b1))>>>0;x=Math.imul(x^(x>>>16),0x85ebca6b)>>>0;return regionBase+(x&regionMask);}
 regionBase(enc){return enc>0?(((enc&0xffff)-1)*this.slabSize):-1;}
 regionMask(enc){if(enc<=0)return 0;const log=((enc>>>16)&0xff)-1;return (1<<(this.slabPow+log))-1;}
 publish(slot,kLo,kHi,value){if(slot<0)return;this.writeAttempts++;const v=Atomics.load(this.ctrl,slot);if((v&1)!==0||Atomics.compareExchange(this.ctrl,slot,v,(v+1)|0)!==v){this.writeBusy++;return;}this.keyLo[slot]=kLo;this.keyHi[slot]=kHi;this.val[slot]=value;this.owner[slot]=(this.workerId+1)&255;Atomics.store(this.ctrl,slot,(v+2)|0);this.writeSuccess++;}
 negamax(cLo,cHi,mLo,mHi,moves,alpha,beta,depSig=-1,regionBase=-2,regionMask=0){this.nodes++;if(this.nodes===this.limit)throw 911;if(depSig<0){depSig=this.dependencySig(cLo,cHi,mLo,mHi,moves);const enc=this.allocateSig(depSig,cLo,cHi,mLo,mHi,moves);regionBase=this.regionBase(enc);regionMask=this.regionMask(enc);}possible(mLo,mHi);let candLo=WLO,candHi=WHI;winning((cLo^mLo)>>>0,(cHi^mHi)>>>0,mLo,mHi);const owLo=WLO,owHi=WHI;let forcedLo=(candLo&owLo)>>>0,forcedHi=(candHi&owHi)>>>0;if((forcedLo|forcedHi)!==0){if(multiBit(forcedLo,forcedHi))return -Math.trunc((CELLS-moves)/2);candLo=forcedLo;candHi=forcedHi;}const rsLo=((owLo>>>1)|(owHi<<31))>>>0,rsHi=(owHi>>>1)>>>0;candLo=(candLo&~rsLo)>>>0;candHi=(candHi&~rsHi)>>>0;if((candLo|candHi)===0)return -Math.trunc((CELLS-moves)/2);if(moves>=CELLS-2)return 0;let min=-Math.trunc((CELLS-2-moves)/2);if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}let max=Math.trunc((CELLS-1-moves)/2);if(beta>max){beta=max;if(alpha>=beta)return beta;}
  addPair(cLo,cHi,mLo,mHi);const kLo=WLO,kHi=WHI,slot=this.hash(kLo,kHi,regionBase,regionMask);if(slot>=0&&this.keyLo[slot]===kLo){const v1=Atomics.load(this.ctrl,slot);if((v1&1)===0&&this.keyLo[slot]===kLo&&this.keyHi[slot]===kHi){const cached=this.val[slot],own=this.owner[slot],v2=Atomics.load(this.ctrl,slot);if(v1===v2&&(v2&1)===0&&cached!==0){this.ttHits++;if(own!==0&&own!==(this.workerId+1))this.crossHits++;if(cached>TT_UPPER_LIMIT){min=cached-TT_LOWER_OFFSET;if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}}else{max=cached-TT_UPPER_OFFSET;if(beta>max){beta=max;if(alpha>=beta)return beta;}}}}}
  const base=moves*WIDTH;let count=0;for(let oi=0;oi<WIDTH;oi++){const col=ORDER[oi],mvLo=(candLo&colLo[col])>>>0,mvHi=(candHi&colHi[col])>>>0;if((mvLo|mvHi)===0)continue;winning((cLo|mvLo)>>>0,(cHi|mvHi)>>>0,mLo,mHi);const sc=popPair(WLO,WHI);let at=count;while(at>0&&this.moveScore[base+at-1]<sc){this.moveScore[base+at]=this.moveScore[base+at-1];this.moveLo[base+at]=this.moveLo[base+at-1];this.moveHi[base+at]=this.moveHi[base+at-1];this.moveCol[base+at]=this.moveCol[base+at-1];at--;}this.moveScore[base+at]=sc;this.moveLo[base+at]=mvLo;this.moveHi[base+at]=mvHi;this.moveCol[base+at]=col;count++;}
  for(let i=0;i<count;i++){const mvLo=this.moveLo[base+i],mvHi=this.moveHi[base+i],col=this.moveCol[base+i],ncLo=(cLo^mLo)>>>0,ncHi=(cHi^mHi)>>>0,nmLo=(mLo|mvLo)>>>0,nmHi=(mHi|mvHi)>>>0,nmoves=moves+1,ns=this.nextDependencySig(depSig,col,moves);let nb=regionBase,nmask=regionMask;if(ns!==depSig){this.depTransitions++;const enc=this.allocateSig(ns,ncLo,ncHi,nmLo,nmHi,nmoves);nb=this.regionBase(enc);nmask=this.regionMask(enc);}const score=-this.negamax(ncLo,ncHi,nmLo,nmHi,nmoves,-beta,-alpha,ns,nb,nmask);if(score>=beta){this.publish(slot,kLo,kHi,score+TT_LOWER_OFFSET);return score;}if(score>alpha)alpha=score;}this.publish(slot,kLo,kHi,alpha+TT_UPPER_OFFSET);return alpha;}
}
export {Solver,pairFromBig,SEL_LO,SEL_HI};

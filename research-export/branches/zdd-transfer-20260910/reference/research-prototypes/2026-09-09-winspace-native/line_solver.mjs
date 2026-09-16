// Research only. Position colors are consumed at compile(), never carried in recursion.
// Static goal IDs + two live-goal bitsets + legal frontiers define the exact state.
import { geometry, minimal } from './support.mjs';
const G=geometry(), N=42, ORDER=G.order;
const pop=x=>{x-=x>>>1&0x55555555;x=(x&0x33333333)+(x>>>2&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24;};
const multi=(lo,hi)=>hi!==0?(lo!==0||(hi&(hi-1))!==0):(lo!==0&&(lo&(lo-1))!==0);
export class LineSolver {
  constructor(mode='compiled',budget=14*131072) {
    if(!['raw','compiled'].includes(mode))throw Error('mode');
    this.mode=mode; this.budget=budget; this.arena=new SharedArrayBuffer(budget); this.limit=Infinity;
    this.lo=new Uint32Array(96);this.hi=new Uint32Array(96);
    this.inc=new Uint32Array(49*3);this.counts=new Uint32Array(43*9);
    this.colLo=Uint32Array.from(G.cols,x=>x[0]);this.colHi=Uint32Array.from(G.cols,x=>x[1]);
    this.moveLo=new Uint32Array(43*7);this.moveHi=new Uint32Array(43*7);
    this.moveCell=new Uint8Array(43*7);this.moveCol=new Uint8Array(43*7);this.moveScore=new Int8Array(43*7);
    this.rootLive=new Uint32Array(6); this.keys=[];this.size=0; this.resetMetrics();
  }
  resetMetrics(){this.nodes=0;this.ttHits=0;this.writeAttempts=0;this.writeSuccess=0;this.writeBusy=0;this.drawStops=0;}
  compile(s) {
    const own=[[s.cLo,s.cHi],[(s.cLo^s.mLo)>>>0,(s.cHi^s.mHi)>>>0]], goals=[[],[]];
    for(let p=0;p<2;p++)for(const [a,b] of G.lines)if(((a&own[p^1][0])|(b&own[p^1][1]))===0){
      const lo=(a&~s.mLo)>>>0,hi=(b&~s.mHi)>>>0;
      if(!(lo|hi))throw Error('terminal root');goals[p].push([lo,hi]);
    }
    this.rawCount=goals[0].length+goals[1].length;
    if(this.mode==='compiled'){goals[0]=minimal(goals[0]);goals[1]=minimal(goals[1]);}
    const dictionary=[];this.rootLive.fill(0);this.inc.fill(0);this.lo.fill(0);this.hi.fill(0);this.counts.fill(0);
    if(this.mode==='raw')for(const line of G.lines)dictionary.push(line);
    for(let p=0;p<2;p++)for(let j=0;j<G.lines.length;j++){
      if(this.mode==='compiled')break;
      const [a,b]=G.lines[j];if(((a&own[p^1][0])|(b&own[p^1][1]))===0)this.rootLive[p*3+(j>>>5)]|=1<<(j&31);
    }
    if(this.mode==='compiled')for(let p=0;p<2;p++)for(const [a,b]of goals[p]){
      let j=dictionary.findIndex(x=>x[0]===a&&x[1]===b);if(j<0){j=dictionary.length;dictionary.push([a,b]);}
      this.rootLive[p*3+(j>>>5)]|=1<<(j&31);
    }
    this.goalCount=dictionary.length;this.groups=Math.max(1,Math.ceil(dictionary.length/32));
    this.rootMoves=s.moves;this.eLo=(G.board[0]&~s.mLo)>>>0;this.eHi=(G.board[1]&~s.mHi)>>>0;
    this.height=0;for(let c=0;c<7;c++)this.height|=s.heights[c]<<(3*c);
    for(let i=0;i<dictionary.length;i++){
      const [a,b]=dictionary[i];this.lo[i]=a;this.hi[i]=b;const word=i>>>5,bit=1<<(i&31);
      const n=pop(a&this.eLo)+pop(b&this.eHi);for(let d=0;d<3;d++)if(n&(1<<d))this.counts[s.moves*9+word*3+d]|=bit;
      for(let c=0;c<7;c++)for(let r=s.heights[c];r<6;r++){
        const cell=c*7+r,m=1<<(cell&31);if(cell<32?(a&m)!==0:(b&m)!==0)this.inc[cell*3+word]|=bit;
      }
    }
    const keyWords=1+2*this.groups;this.entryBytes=keyWords*4+6;
    const size=Math.floor(this.budget/this.entryBytes);if(size<32)throw RangeError('TT budget');
    if(this.size!==size||this.keys.length!==keyWords){
      this.size=size;this.keys=Array.from({length:keyWords},(_,i)=>new Uint32Array(this.arena,i*size*4,size));
      this.ctrl=new Int32Array(this.arena,keyWords*size*4,size);this.val=new Uint8Array(this.arena,(keyWords+1)*size*4,size);this.owner=new Uint8Array(this.arena,(keyWords+1)*size*4+size,size);
    }
    this.clear();return {mode:this.mode,goals:this.goalCount,rawGoals:this.rawCount,groups:this.groups,entryBytes:this.entryBytes,entries:this.size,activeBytes:this.size*this.entryBytes};
  }
  clear(){for(const k of this.keys)k.fill(0);this.val.fill(0);this.ctrl.fill(0);this.owner.fill(0);this.resetMetrics();}
  // Used by generated specializations: G=1..3 is compiled out, never a per-node map.
  wins(a0,a1,a2,eLo,eHi,moves){
    const b=moves*9;let wl=0,wh=0;
    for(let g=0;g<this.groups;g++){
      let bits=((g===0?a0:g===1?a1:a2)&this.counts[b+g*3]&~this.counts[b+g*3+1]&~this.counts[b+g*3+2])>>>0;
      while(bits){const j=31-Math.clz32(bits&-bits),id=g*32+j;bits=(bits&(bits-1))>>>0;wl|=this.lo[id]&eLo;wh|=this.hi[id]&eHi;}
    }this.wLo=wl>>>0;this.wHi=wh>>>0;
  }
  solve(){
    this.wins(this.rootLive[0],this.rootLive[1],this.rootLive[2],this.eLo,this.eHi,this.rootMoves);
    const ml=(G.board[0]^this.eLo)>>>0,mh=(G.board[1]^this.eHi)>>>0,x=(ml+G.bottom[0])>>>0;
    const pl=(x&G.board[0])>>>0,ph=((mh+G.bottom[1]+(x<ml?1:0))&G.board[1])>>>0;
    if((this.wLo&pl)|(this.wHi&ph))return Math.trunc((43-this.rootMoves)/2);
    let low=-Math.trunc((42-this.rootMoves)/2),high=Math.trunc((43-this.rootMoves)/2);
    while(low<high){let med=low+Math.trunc((high-low)/2);if(med<=0&&Math.trunc(low/2)<med)med=Math.trunc(low/2);else if(med>=0&&Math.trunc(high/2)>med)med=Math.trunc(high/2);
      const score=this.search(this.rootLive[0],this.rootLive[1],this.rootLive[2],this.rootLive[3],this.rootLive[4],this.rootLive[5],this.eLo,this.eHi,this.height,this.rootMoves,med,med+1);
      if(score<=med)high=score;else low=score;
    }return low===0?0:low;
  }
  search(c0,c1,c2,o0,o1,o2,eLo,eHi,height,moves,alpha,beta){
    if(++this.nodes>=this.limit)throw Error('NODE_LIMIT');
    if((c0|c1|c2|o0|o1|o2)===0){this.drawStops++;return 0;}
    const ml=(G.board[0]^eLo)>>>0,mh=(G.board[1]^eHi)>>>0,x=(ml+G.bottom[0])>>>0;
    let caLo=(x&G.board[0])>>>0,caHi=((mh+G.bottom[1]+(x<ml?1:0))&G.board[1])>>>0;
    this.wins(o0,o1,o2,eLo,eHi,moves);const owLo=this.wLo,owHi=this.wHi;
    const fLo=(caLo&owLo)>>>0,fHi=(caHi&owHi)>>>0;
    if(fLo|fHi){if(multi(fLo,fHi))return -Math.trunc((42-moves)/2);caLo=fLo;caHi=fHi;}
    caLo=(caLo&~((owLo>>>1)|(owHi<<31)))>>>0;caHi=(caHi&~(owHi>>>1))>>>0;
    if(!(caLo|caHi))return -Math.trunc((42-moves)/2);
    if(moves>=40)return 0;
    let low=-Math.trunc((40-moves)/2);if(alpha<low){alpha=low;if(alpha>=beta)return alpha;}
    let high=Math.trunc((41-moves)/2);if(beta>high){beta=high;if(alpha>=beta)return beta;}
    let h=height;h=Math.imul(h^c0,0x9e3779b1);h=Math.imul(h^o0,0x85ebca6b);
    if(this.groups>1){h=Math.imul(h^c1,0x9e3779b1);h=Math.imul(h^o1,0x85ebca6b);}
    if(this.groups>2){h=Math.imul(h^c2,0x9e3779b1);h=Math.imul(h^o2,0x85ebca6b);}
    const slot=((h^(h>>>16))>>>0)%this.size,ks=this.keys;
    if(ks[0][slot]===height){const v1=Atomics.load(this.ctrl,slot);
      if(!(v1&1)&&ks[0][slot]===height&&ks[1][slot]===c0&&ks[2][slot]===o0&&(this.groups<2||(ks[3][slot]===c1&&ks[4][slot]===o1))&&(this.groups<3||(ks[5][slot]===c2&&ks[6][slot]===o2))){
        const value=this.val[slot],v2=Atomics.load(this.ctrl,slot);if(v1===v2&&value){this.ttHits++;
          if(value>37){low=value-56;if(alpha<low){alpha=low;if(alpha>=beta)return alpha;}}
          else{high=value-19;if(beta>high){beta=high;if(alpha>=beta)return beta;}}
        }
      }
    }
    this.wins(c0,c1,c2,eLo,eHi,moves);const baseWinLo=this.wLo,baseWinHi=this.wHi;
    const base=moves*7,cb=moves*9;let count=0;
    for(let oi=0;oi<7;oi++){
      const col=ORDER[oi],vLo=(caLo&this.colLo[col])>>>0,vHi=(caHi&this.colHi[col])>>>0;if(!(vLo|vHi))continue;
      const cell=col*7+((height>>>(col*3))&7),ib=cell*3;let wl=baseWinLo,wh=baseWinHi;
      for(let g=0;g<this.groups;g++){
        let two=((g===0?c0:g===1?c1:c2)&~this.counts[cb+g*3]&this.counts[cb+g*3+1]&~this.counts[cb+g*3+2]&this.inc[ib+g])>>>0;
        while(two){const j=31-Math.clz32(two&-two),id=g*32+j;two=(two&(two-1))>>>0;wl|=this.lo[id]&eLo&~vLo;wh|=this.hi[id]&eHi&~vHi;}
      }
      const sc=pop(wl)+pop(wh);let at=count;
      while(at>0&&this.moveScore[base+at-1]<sc){this.moveScore[base+at]=this.moveScore[base+at-1];this.moveLo[base+at]=this.moveLo[base+at-1];this.moveHi[base+at]=this.moveHi[base+at-1];this.moveCell[base+at]=this.moveCell[base+at-1];this.moveCol[base+at]=this.moveCol[base+at-1];at--;}
      this.moveScore[base+at]=sc;this.moveLo[base+at]=vLo;this.moveHi[base+at]=vHi;this.moveCell[base+at]=cell;this.moveCol[base+at]=col;count++;
    }
    for(let i=0;i<count;i++){
      const vLo=this.moveLo[base+i],vHi=this.moveHi[base+i],cell=this.moveCell[base+i],col=this.moveCol[base+i],ib=cell*3;
      for(let g=0;g<this.groups;g++){
        const k=cb+g*3,bits=this.inc[ib+g],a=this.counts[k],b=this.counts[k+1],d=this.counts[k+2],borrow=bits&~a;
        this.counts[k+9]=(a^bits)>>>0;this.counts[k+10]=(b^borrow)>>>0;this.counts[k+11]=(d^(borrow&~b))>>>0;
      }
      const score=-this.search((o0&~this.inc[ib])>>>0,(o1&~this.inc[ib+1])>>>0,(o2&~this.inc[ib+2])>>>0,c0,c1,c2,(eLo&~vLo)>>>0,(eHi&~vHi)>>>0,height+(1<<(col*3)),moves+1,-beta,-alpha);
      if(score>=beta){this.publish(slot,height,c0,c1,c2,o0,o1,o2,score+56);return score;}if(score>alpha)alpha=score;
    }
    this.publish(slot,height,c0,c1,c2,o0,o1,o2,alpha+19);return alpha;
  }
  publish(slot,height,c0,c1,c2,o0,o1,o2,value){
    this.writeAttempts++;const v=Atomics.load(this.ctrl,slot);if((v&1)||Atomics.compareExchange(this.ctrl,slot,v,(v+1)|0)!==v){this.writeBusy++;return;}
    const ks=this.keys;ks[0][slot]=height;ks[1][slot]=c0;ks[2][slot]=o0;
    if(this.groups>1){ks[3][slot]=c1;ks[4][slot]=o1;}if(this.groups>2){ks[5][slot]=c2;ks[6][slot]=o2;}
    this.val[slot]=value;this.owner[slot]=1;Atomics.store(this.ctrl,slot,(v+2)|0);this.writeSuccess++;
  }
}

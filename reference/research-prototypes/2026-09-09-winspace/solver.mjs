// True line-state search: colored cells are read once in prepare, not in recursion.
import {compile,geometry} from './position.mjs';
import {getKernel,pop32} from './kernel.mjs';
export class WinspaceSolver{
 constructor({pow=17,bytes=0,history=false,draw=true,sign=false,reduce=true,tt=true,g=geometry()}={}){
  this.g=g;this.width=g.w;this.height=g.h;this.stride=g.stride;this.cells=g.cells;
  this.pow=pow;this.byteBudget=bytes;this.history=history;this.draw=draw;this.sign=sign;this.reduce=reduce;this.tt=tt;
  this.arena=new SharedArrayBuffer(bytes||2**pow*32);this.arenaBytes=this.arena.byteLength;
  this.order=new Uint8Array(g.order);this.pop=pop32;this.limit=Infinity;
  this.moves=new Uint8Array((g.cells+1)*g.w);this.scores=new Uint8Array((g.cells+1)*g.w);
  this.cellLo=new Uint32Array(g.w*g.stride+1);this.cellHi=new Uint32Array(g.w*g.stride+1);
  for(let x=0;x<this.cellLo.length;x++){if(x<32)this.cellLo[x]=(1<<x)>>>0;else this.cellHi[x]=(1<<(x-32))>>>0;}
  this.reset();
 }
 reset(){this.nodes=0;this.hits=0;this.writes=0;this.draws=0;this.exclusions=0;}
 prepare(s){
  this.reset();const q=compile(s,this.g,this.reduce,false),ids=new Map(),goals=[];
  for(let p=0;p<2;p++)for(const goal of q.goals[p]){const key=goal.join(',');if(!ids.has(key)){ids.set(key,goals.length);goals.push(goal);}}
  const G=Math.max(1,Math.ceil(goals.length/32));this.G=G;this.goalCount=goals.length;
  this.rootLive=[new Uint32Array(G),new Uint32Array(G)];this.E=[new Uint32Array(G),new Uint32Array(G),new Uint32Array(G)];
  this.xor=new Uint8Array(goals.length);this.inc=Array.from({length:G},()=>new Uint32Array(this.cellLo.length));
  this.goals=goals;
  for(let p=0;p<2;p++)for(const goal of q.goals[p]){const i=ids.get(goal.join(','));this.rootLive[p][i>>>5]|=1<<(i&31);}
  const lists=Array.from({length:this.cellLo.length},()=>[]);
  for(let i=0;i<goals.length;i++){
    const [lo,hi]=goals[i];let count=0;
    for(let c=0;c<this.width;c++)for(let r=0;r<this.height;r++){
      const x=c*this.stride+r;
      if(((lo&this.cellLo[x])|(hi&this.cellHi[x]))!==0){this.xor[i]^=x;this.inc[i>>>5][x]|=1<<(i&31);lists[x].push(i);count++;}
    }
    for(let k=0;k<3;k++)if(count&(1<<k))this.E[k][i>>>5]|=1<<(i&31);
  }
  this.offset=new Uint16Array(lists.length+1);const flat=[];
  for(let i=0;i<lists.length;i++){this.offset[i]=flat.length;flat.push(...lists[i]);}this.offset[lists.length]=flat.length;this.incIds=new Uint8Array(flat);
  this.hkey=0;for(let c=0;c<this.width;c++)this.hkey|=s.heights[c]<<(3*c);this.rootMoves=s.moves;
  this.histLo=(s.moves&1)?(s.cLo^s.mLo)>>>0:s.cLo;this.histHi=(s.moves&1)?(s.cHi^s.mHi)>>>0:s.cHi;
  const words=this.history?2:G*2;this.entryBytes=(words+2)*4;
  const size=this.byteBudget?Math.floor(this.byteBudget/this.entryBytes):2**this.pow;
  if(size<1||size>2**24)throw RangeError('TT capacity outside research support');
  this.modulo=this.byteBudget!==0;this.size=size;this.mask=size-1;
  if(this.tt&&(!this.keys||this.keys.length!==words||this.keys[0].length!==size)){
    this.keys=Array.from({length:words},(_,i)=>new Uint32Array(this.arena,i*size*4,size));
    this.packed=new Uint32Array(this.arena,words*size*4,size);this.ctrl=new Int32Array(this.arena,(words+1)*size*4,size);
  }
  this.ttBytes=this.tt?size*this.entryBytes:0;this.neg=getKernel(G,this.history,this.draw,this.sign,this.tt);
  // The root-specific goal dictionary is part of identity. Rebinding invalidates cache.
  this.clear();return{groups:G,goals:goals.length,raw:q.raw,reduced:q.reduced,ttBytes:this.ttBytes,entryBytes:this.entryBytes};
 }
 clear(){if(this.tt){for(const x of this.keys)x.fill(0);this.packed.fill(0);this.ctrl.fill(0);}this.reset();}
 rootArgs(){const a=[];for(let j=0;j<this.G;j++)a.push(this.rootLive[0][j],this.rootLive[1][j],this.E[0][j],this.E[1][j],this.E[2][j]);return a;}
 immediate(){
  for(let c=0;c<this.width;c++){const r=(this.hkey>>>(3*c))&7;if(r===this.height)continue;const x=c*this.stride+r;
    for(let j=0;j<this.G;j++)if((this.rootLive[0][j]&this.E[0][j]&~this.E[1][j]&~this.E[2][j]&this.inc[j][x])!==0)return true;
  }return false;
 }
 solve(){
  if(this.rootMoves===this.cells||(this.draw&&this.goalCount===0))return 0;
  if(this.immediate())return Math.trunc((this.cells+1-this.rootMoves)/2);
  let lo=-Math.trunc((this.cells-this.rootMoves)/2),hi=Math.trunc((this.cells+1-this.rootMoves)/2);const a=this.rootArgs();
  while(lo<hi){let mid=lo+Math.trunc((hi-lo)/2);if(mid<=0&&Math.trunc(lo/2)<mid)mid=Math.trunc(lo/2);else if(mid>=0&&Math.trunc(hi/2)>mid)mid=Math.trunc(hi/2);
    const v=this.neg(this.hkey,this.rootMoves,mid,mid+1,...a);if(v<=mid)hi=v;else lo=v;
  }return lo===0?0:lo;
 }
 window(alpha,beta){if(!(Number.isInteger(alpha)&&Number.isInteger(beta)&&alpha<beta))throw Error('invalid window');
  if(this.rootMoves===this.cells)return 0;if(this.immediate())return Math.trunc((this.cells+1-this.rootMoves)/2);
  return this.neg(this.hkey,this.rootMoves,alpha,beta,...this.rootArgs());
 }
}

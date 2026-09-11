// Authorized research: generated scalar kernels, never generated inside search.
// Geometry is a shared goal network. Recursion carries live-goal masks, bit-sliced
// empty counts and a packed legal frontier. No colored board except history-key control.
const pop='(x)=>{x-=((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24;}';
export function kernelSource(G, history=false, draw=true, sign=false, tt=true){
  const ids=Array.from({length:G},(_,j)=>j), join=(f,sep='\n')=>ids.map(f).join(sep);
  const live=join(j=>`A${j}|B${j}`,'|'), allA=join(j=>`A${j}`,'|'),allB=join(j=>`B${j}`,'|');
  const args=join(j=>`A${j},B${j},E${j}a,E${j}b,E${j}c`,',');
  const child=join(j=>`(B${j}&~I${j})>>>0,A${j},(E${j}a^I${j})>>>0,(E${j}b^q${j})>>>0,(E${j}c^z${j})>>>0`,',');
  const hash=history?'this.histLo,this.histHi':join(j=>`A${j},B${j}`,',');
  const nkeys=history?2:2*G;
  const keyNames=history?['this.histLo','this.histHi']:ids.flatMap(j=>[`A${j}`,`B${j}`]);
  const test=keyNames.map((v,i)=>`this.keys[${i}][slot]===(${v}>>>0)`).join('&&');
  const store=keyNames.map((v,i)=>`this.keys[${i}][slot]=${v};`).join('');
  return `function neg(h,n,alpha,beta,${args}){
    if(++this.nodes>=this.limit)throw Error('NODE_LIMIT');
    ${draw?`if((${live})===0){this.draws++;return 0;}`:''}
    ${sign?`if((${allA})===0){this.exclusions++;if(beta>0){beta=0;if(alpha>=beta)return beta;}}
    if((${allB})===0){this.exclusions++;if(alpha<0){alpha=0;if(alpha>=beta)return alpha;}}`:''}
    let ownLo=0,ownHi=0,oppLo=0,oppHi=0;
    ${join(j=>`const one${j}=(E${j}a&~E${j}b&~E${j}c)>>>0,two${j}=(~E${j}a&E${j}b&~E${j}c)>>>0;
    let w${j}=(B${j}&one${j})>>>0;
    while(w${j}){const b=w${j}&-w${j},id=${j*32}+31-Math.clz32(b),x=this.xor[id];oppLo|=this.cellLo[x];oppHi|=this.cellHi[x];w${j}=(w${j}^b)>>>0;}`)}
    let possible=0,forced=0,bad=0;
    for(let c=0;c<this.width;c++){
      const r=(h>>>(3*c))&7;if(r===this.height)continue;
      const x=c*this.stride+r,bit=1<<c;possible|=bit;
      if(((oppLo&this.cellLo[x])|(oppHi&this.cellHi[x]))!==0)forced|=bit;
      if(r+1<this.height&&((oppLo&this.cellLo[x+1])|(oppHi&this.cellHi[x+1]))!==0)bad|=bit;
    }
    if(forced&&(forced&(forced-1)))return -Math.trunc((this.cells-n)/2);
    const candidates=(forced||possible)&~bad;
    if(!candidates)return -Math.trunc((this.cells-n)/2);
    if(n>=this.cells-2)return 0;
    let low=-Math.trunc((this.cells-2-n)/2),up=Math.trunc((this.cells-1-n)/2);
    if(alpha<low){alpha=low;if(alpha>=beta)return alpha;}
    if(beta>up){beta=up;if(alpha>=beta)return beta;}
    ${tt?`let hv=(h^0x9e3779b9)>>>0;
    ${keyNames.map(v=>`hv=Math.imul(hv^(${v}),0x85ebca6b)>>>0;`).join('\n')}
    hv=(hv^(hv>>>16))>>>0;const slot=this.modulo?hv%this.size:hv&this.mask;
    let packed=this.packed[slot];
    if((packed&0x1fffff)===h){const v1=Atomics.load(this.ctrl,slot);
      if((v1&1)===0){packed=this.packed[slot];
        if((packed&0x1fffff)===h&&${test}){
          const cached=(packed>>>21)&127,v2=Atomics.load(this.ctrl,slot);
          if(v1===v2&&cached!==0){this.hits++;if(cached>43){low=cached-64;if(alpha<low){alpha=low;if(alpha>=beta)return alpha;}}
            else{up=cached-22;if(beta>up){beta=up;if(alpha>=beta)return beta;}}}
        }
      }
    }`:''}
    ${join(j=>`w${j}=(A${j}&one${j})>>>0;
      while(w${j}){const b=w${j}&-w${j},id=${j*32}+31-Math.clz32(b),x=this.xor[id];ownLo|=this.cellLo[x];ownHi|=this.cellHi[x];w${j}=(w${j}^b)>>>0;}`)}
    const base=n*this.width;let count=0;
    for(let oi=0;oi<this.width;oi++){
      const c=this.order[oi];if((candidates&(1<<c))===0)continue;
      const x=c*this.stride+((h>>>(3*c))&7);let sLo=ownLo,sHi=ownHi;
      ${join(j=>`w${j}=(A${j}&two${j}&this.inc[${j}][x])>>>0;
        while(w${j}){const b=w${j}&-w${j},id=${j*32}+31-Math.clz32(b),y=this.xor[id]^x;sLo|=this.cellLo[y];sHi|=this.cellHi[y];w${j}=(w${j}^b)>>>0;}`)}
      const sc=this.pop(sLo)+this.pop(sHi);let at=count;
      while(at>0&&this.scores[base+at-1]<sc){this.scores[base+at]=this.scores[base+at-1];this.moves[base+at]=this.moves[base+at-1];at--;}
      this.scores[base+at]=sc;this.moves[base+at]=c;count++;
    }
    for(let i=0;i<count;i++){
      const c=this.moves[base+i],x=c*this.stride+((h>>>(3*c))&7);
      ${join(j=>`const I${j}=this.inc[${j}][x],q${j}=I${j}&~E${j}a,z${j}=q${j}&~E${j}b;`)}
      const begin=this.offset[x],end=this.offset[x+1];
      for(let j=begin;j<end;j++)this.xor[this.incIds[j]]^=x;
      ${history?`const oldLo=this.histLo,oldHi=this.histHi;if((n&1)===0){this.histLo=(oldLo|this.cellLo[x])>>>0;this.histHi=(oldHi|this.cellHi[x])>>>0;}`:''}
      let v;
      try{v=-this.neg(h+(1<<(c*3)),n+1,-beta,-alpha,${child});}
      finally{for(let j=begin;j<end;j++)this.xor[this.incIds[j]]^=x;${history?'this.histLo=oldLo;this.histHi=oldHi;':''}}
      if(v>=beta){${tt?`this.writes++;const version=Atomics.load(this.ctrl,slot);
        if((version&1)===0&&Atomics.compareExchange(this.ctrl,slot,version,(version+1)|0)===version){${store}this.packed[slot]=(h|((v+64)<<21)|(1<<28))>>>0;Atomics.store(this.ctrl,slot,(version+2)|0);}`:''}return v;}
      if(v>alpha)alpha=v;
    }
    ${tt?`this.writes++;const version=Atomics.load(this.ctrl,slot);
    if((version&1)===0&&Atomics.compareExchange(this.ctrl,slot,version,(version+1)|0)===version){${store}this.packed[slot]=(h|((alpha+22)<<21)|(1<<28))>>>0;Atomics.store(this.ctrl,slot,(version+2)|0);}`:''}
    return alpha;
  }`;
}
const kernels=new Map();
export function getKernel(G,history,draw,sign,tt){
 const id=[G,history,draw,sign,tt].join(':');let f=kernels.get(id);
 if(!f){f=Function('return '+kernelSource(G,history,draw,sign,tt))();kernels.set(id,f);}return f;
}
export const pop32=Function('return '+pop)();

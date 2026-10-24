// C proof-aware, source-native exact TT. Unlike B, each owner word is adjacent
// to the other player's word for the SAME original-line IDs. State equality
// remains exact. The zero-cost upper header bit remembers a NEGATIVE fork proof
// check at this source state, allowing later non-exact bound revisits to skip it.
// The extra proof bit is advisory: it is not a WDL certificate.
const MA=0x9e3779b1,MB=0x85ebca6b;
export const FORK_ATTEMPTED_NO_CERTIFICATE=0x100;
export class GuardedTT {
  constructor(g,budgetMiB=32){
    if(!Number.isFinite(budgetMiB)||budgetMiB<=0||budgetMiB>4096)throw RangeError('invalid TT budget');
    this.g=g;this.k=g.lineWords;this.heightWords=g.heightWords;
    this.wordsPerEntry=1+this.heightWords+2*this.k;
    const requested=Math.floor(budgetMiB*1048576/(this.wordsPerEntry*4));
    if(requested<1)throw RangeError('TT budget smaller than one entry');
    let cap=1;while(cap<=requested/2)cap*=2;
    this.capacity=cap;this.mask=cap-1;this.bytes=cap*this.wordsPerEntry*4;
    this.entries=new Uint32Array(cap*this.wordsPerEntry);
    this.probes=0;this.hits=0;this.stores=0;this.cachedForkMisses=0;
  }
  hash(state){
    const f=state.fields,k=this.k;
    let h=Math.imul((state.heightLo^0x517cc1b7)>>>0,MA)>>>0;
    if(this.heightWords===2)h=Math.imul(h^state.heightHi,MB)>>>0;
    for(let j=0;j<k;j++){
      h=Math.imul((h^f[j])>>>0,MA)>>>0;h^=h>>>15;
      h=Math.imul((h^f[k+j])>>>0,MA)>>>0;h^=h>>>15;
    }
    return h>>>0;
  }
  slot(hash){return (hash&this.mask)*this.wordsPerEntry;}
  probe(state,index){
    this.probes++;
    const keys=this.entries,value=keys[index];
    if(!value||keys[index+1]!==state.heightLo)return 0;
    let p=index+2;
    if(this.heightWords===2&&keys[p++]!==state.heightHi)return 0;
    const k=this.k,f=state.fields;
    for(let j=0;j<k;j++)if(keys[p+2*j]!==f[j]||keys[p+2*j+1]!==f[k+j])return 0;
    this.hits++;if(value&FORK_ATTEMPTED_NO_CERTIFICATE)this.cachedForkMisses++;
    return value;
  }
  put(state,index,tag,move=-1,proofMiss=false){
    if(tag<1||tag>5)throw RangeError('invalid TT tag');
    const keys=this.entries,k=this.k,f=state.fields;
    keys[index+1]=state.heightLo;let p=index+2;
    if(this.heightWords===2)keys[p++]=state.heightHi;
    for(let j=0;j<k;j++){keys[p+2*j]=f[j];keys[p+2*j+1]=f[k+j];}
    keys[index]=tag|((move+1)<<3)|(proofMiss?FORK_ATTEMPTED_NO_CERTIFICATE:0);
    this.stores++;
  }
}

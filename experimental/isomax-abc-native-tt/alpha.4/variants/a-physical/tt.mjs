// A physical-state-native exact TT. Key encodes each gravity column by an
// (H+1)-bit unary height sentinel plus P0 ownership. P1 follows by complement
// below that sentinel. Total key size: ceil(W*(H+1)/32) words (<=4 at 10x10).
// Local-only exact equality, direct-mapped power-of-two table, no fingerprints.
const MA=0x9e3779b1, MB=0x85ebca6b;
export class PhysicalTT {
  constructor(g,budgetMiB=32) {
    if (!Number.isFinite(budgetMiB)||budgetMiB<=0||budgetMiB>4096)throw RangeError('invalid TT budget');
    this.g=g;
    this.keyWords=Math.ceil(g.columns*(g.rows+1)/32);
    this.wordsPerEntry=1+this.keyWords;
    const want=Math.floor(budgetMiB*1048576/(this.wordsPerEntry*4));
    if(want<1)throw RangeError('TT budget smaller than one entry');
    let cap=1;while(cap<=want/2)cap*=2;
    this.capacity=cap;this.mask=cap-1;this.bytes=cap*this.wordsPerEntry*4;
    this.entries=new Uint32Array(cap*this.wordsPerEntry);
    this.probes=0;this.hits=0;this.stores=0;
  }
  hash(state){
    let h=0x517cc1b7;
    const key=state.key;
    for(let j=0;j<this.keyWords;j++) {
      h=Math.imul(h^key[j],MA)>>>0;
      h^=h>>>15;
    }
    return Math.imul(h^0x5bd1e995,MB)>>>0;
  }
  slot(hash){return (hash&this.mask)*this.wordsPerEntry;}
  probe(state,index) {
    this.probes++;
    const entries=this.entries,tag=entries[index];if(!tag)return 0;
    const key=state.key;
    for(let j=0;j<this.keyWords;j++)if(entries[index+1+j]!==key[j])return 0;
    this.hits++;return tag;
  }
  put(state,index,tag,move=-1){
    if(tag<1||tag>5)throw RangeError('invalid TT tag');
    const entries=this.entries,key=state.key,old=entries[index],was=old&7;
    if(was){
      let same=true;
      for(let j=0;j<this.keyWords;j++)if(entries[index+1+j]!==key[j]){same=false;break;}
      if(same){
        if(was<=3)return old; // preserve more informative same-state exact WDL
        if(tag>3&&was!==tag)tag=2; // >=DRAW AND <=DRAW => exact DRAW
        if(move<0)move=((old>>>3)&31)-1;
        entries[index]=tag|((move+1)<<3);this.stores++;
        return entries[index];
      }
    }
    for(let j=0;j<this.keyWords;j++)entries[index+1+j]=key[j];
    entries[index]=tag|((move+1)<<3);this.stores++;
    return entries[index];
  }
}

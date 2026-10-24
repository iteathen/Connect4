// Direct-mapped, EXACT-KEY local table. Occupancy is not a probabilistic fingerprint.
// Tag 0 empty; 1/2/3 exact -1/0/+1; 4 >=0; 5 <=0.
const HASH_MULT_A = 0x9e3779b1, HASH_MULT_B = 0x85ebca6b;
export class ExactTT {
  constructor(geometry, budgetMiB = 32) {
    if (!Number.isFinite(budgetMiB) || budgetMiB <= 0 || budgetMiB > 4096)
      throw new RangeError('invalid TT MiB budget');
    this.g = geometry;
    this.k = geometry.lineWords;
    this.heightWords = geometry.heightWords;
    this.wordsPerEntry = 1 + geometry.heightWords + 2*this.k;
    const requested = Math.floor(budgetMiB * 1048576 / (this.wordsPerEntry * 4));
    if (requested < 1) throw new RangeError('TT budget smaller than one exact entry');
    let capacity = 1;
    while (capacity <= requested / 2) capacity *= 2;
    this.capacity = capacity;
    this.mask = capacity - 1;
    this.bytes = capacity * this.wordsPerEntry * 4;
    this.entries = new Uint32Array(capacity * this.wordsPerEntry);
    this.probes = 0;
    this.hits = 0;
    this.stores = 0;
  }

  hash(state) {
    const f = state.fields, k2 = 2*this.k;
    let h = Math.imul((state.heightLo ^ 0x517cc1b7) >>> 0, HASH_MULT_A) >>> 0;
    if (this.heightWords === 2) h = Math.imul(h ^ state.heightHi, HASH_MULT_B) >>> 0;
    for (let j = 0; j < k2; j++) {
      h = Math.imul((h ^ f[j]) >>> 0, HASH_MULT_A) >>> 0;
      h ^= h >>> 15;
    }
    return h >>> 0;
  }

  slot(hash) { return (hash & this.mask) * this.wordsPerEntry; }

  probe(state, index) {
    this.probes++;
    const keys = this.entries, value = keys[index];
    if (!value || keys[index + 1] !== state.heightLo) return 0;
    let p = index + 2;
    if (this.heightWords === 2 && keys[p++] !== state.heightHi) return 0;
    const fields = state.fields;
    for (let j = 0; j < 2*this.k; j++) if (keys[p+j] !== fields[j]) return 0;
    this.hits++;
    return value;
  }

  // Move is packed into header's upper bits; key/result stay inside original width.
  put(state,index,tag,move=-1){
    if(tag<1||tag>5)throw new RangeError('invalid proof tag');
    const keys=this.entries,old=keys[index],was=old&7,fields=state.fields;
    let p=index+2,matched=was&&keys[index+1]===state.heightLo;
    if(this.heightWords===2){matched=matched&&keys[p]===state.heightHi;p++;}
    if(matched){
      for(let j=0;j<2*this.k;j++)if(keys[p+j]!==fields[j]){matched=false;break;}
      if(matched){
        if(was<=3)return old;
        if(tag>3&&was!==tag)tag=2;
        if(move<0)move=((old>>>3)&31)-1;
        keys[index]=tag|((move+1)<<3);this.stores++;
        return keys[index];
      }
    }
    keys[index+1]=state.heightLo;
    p=index+2;
    if(this.heightWords===2)keys[p++]=state.heightHi;
    for(let j=0;j<2*this.k;j++)keys[p+j]=fields[j];
    keys[index]=tag|((move+1)<<3);this.stores++;
    return keys[index];
  }
}

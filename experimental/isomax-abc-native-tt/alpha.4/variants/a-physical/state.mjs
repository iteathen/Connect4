// A native physical carrier: a bijective gravity-owner column code for TT identity,
// and direct per-owner physical bitplanes for FIRSTWIN computation.
// Geometry determines every stride/offset/word width; 7x6 is not special.
export class PhysicalState {
  constructor(geometry) {
    this.g = geometry;
    this.rank = 0;
    this.terminalWinner = -1;
    this.heights = new Uint8Array(geometry.columns);
    this.stride = geometry.rows + 1;
    this.keyWords = Math.ceil(geometry.columns * this.stride / 32);
    this.key = new Uint32Array(this.keyWords);
    this.owners = new Uint32Array(2 * this.keyWords);
    this.columns = geometry.columns;
    this.rows = geometry.rows;
    this.frontierWord = new Uint8Array(geometry.columns);
    this.frontierBit = new Uint32Array(geometry.columns);
    this.sentinelWord = new Uint8Array(geometry.columns);
    this.sentinelBit = new Uint32Array(geometry.columns);
    for (let c = 0; c < geometry.columns; c++) {
      const bit = c * this.stride;
      const j = bit >>> 5;
      const m = (1 << (bit & 31)) >>> 0;
      this.key[j] |= m; // empty column's unary sentinel
      this.frontierWord[c] = j;
      this.frontierBit[c] = m;
      this.sentinelWord[c] = j;
      this.sentinelBit[c] = m;
    }
    // A geometric site index -> physical bit coordinate.
    this.siteWord = new Uint8Array(geometry.cells);
    this.siteBit = new Uint32Array(geometry.cells);
    for (let c = 0; c < geometry.columns; c++) {
      for (let r = 0; r < geometry.rows; r++) {
        const s = c * geometry.rows + r;
        const bit = c * this.stride + r;
        this.siteWord[s] = bit >>> 5;
        this.siteBit[s] = (1 << (bit & 31)) >>> 0;
      }
    }
    // For each hypothetical landing site: exact 3-other-site occupancy masks
    // for every original K4 containing that landing. No per-node line-ID lookup.
    // This is an alternative to multiword shifted AND-intersection networks;
    // on 1..10 dimensions it avoids temporary bitboards and boundary carries.
    const slices = Array.from({length: geometry.cells}, () => []);
    const k = this.keyWords;
    for (let l = 0; l < geometry.lineCount; l++) {
      for (let z = 0; z < 4; z++) {
        const landing = geometry.siteLines[l*4+z];
        const mask = new Uint32Array(k);
        for (let t = 0; t < 4; t++) if (t !== z) {
          const site = geometry.siteLines[l*4+t];
          mask[this.siteWord[site]] |= this.siteBit[site];
        }
        slices[landing].push(mask);
      }
    }
    this.starts = new Uint32Array(geometry.cells + 1);
    let total = 0;
    for (let s = 0; s < geometry.cells; s++) {
      this.starts[s] = total;
      total += slices[s].length;
    }
    this.starts[geometry.cells] = total;
    this.masks = new Uint32Array(total * k);
    let at = 0;
    for (let s = 0; s < geometry.cells; s++) for (const mask of slices[s]) {
      this.masks.set(mask, at); at += k;
    }
  }

  // Physical test for one landing site: all other three K4 sites owned by player.
  isWinningSite(site, player) {
    const mask = this.masks, offsets = this.starts;
    const k = this.keyWords, owner = this.owners, base = player * k;
    for (let i = offsets[site]*k, stop = offsets[site+1]*k; i < stop; i += k) {
      let ok = true;
      for (let j = 0; j < k; j++) if (((owner[base+j] & mask[i+j]) >>> 0) !== mask[i+j]) {ok=false;break;}
      if (ok) return true;
    }
    return false;
  }

  apply(column, admittedNonWinning = false) {
    const h = this.heights[column], g=this.g;
    if (!Number.isInteger(column)||column<0||column>=g.columns||h>=g.rows||this.terminalWinner>=0)
      throw new RangeError('illegal or post-terminal move');
    const owner = this.rank&1, site=column*g.rows+h;
    const win = !admittedNonWinning && this.isWinningSite(site,owner);
    const index = this.siteWord[site], bit = this.siteBit[site];
    this.owners[owner*this.keyWords+index] |= bit;
    // Replace old unary sentinel by a new one above; P0 keeps the old bit
    // (it becomes a P0 ownership bit), P1 clears it (it becomes P1).
    if (owner===1) this.key[index] ^= bit;
    const nextBitIndex = column*this.stride+h+1, nextIndex=nextBitIndex>>>5,
      nextBit=(1<<(nextBitIndex&31))>>>0;
    this.key[nextIndex] |= nextBit;
    this.heights[column] = h+1;
    this.rank++;
    if (win) this.terminalWinner=owner;
    return win;
  }

  undo(column) {
    const h=this.heights[column]-1, g=this.g;
    if (!Number.isInteger(column)||column<0||column>=g.columns||this.rank<1||h<0)
      throw new RangeError('illegal undo');
    this.rank--;
    const owner=this.rank&1, site=column*g.rows+h;
    const index=this.siteWord[site], bit=this.siteBit[site];
    this.owners[owner*this.keyWords+index] ^= bit;
    const nextBitIndex=column*this.stride+h+1;
    this.key[nextBitIndex>>>5] ^= (1 << (nextBitIndex&31));
    if (owner===1) this.key[index] |= bit;
    this.heights[column]=h;
    this.terminalWinner=-1;
  }

  exposesOpponentWin(column,mover){
    const h=this.heights[column];
    return h+1<this.g.rows && this.isWinningSite(column*this.g.rows+h+1,mover^1);
  }

  opponentImmediateColumns(mover){
    const g=this.g;let opp=0,legal=0;
    for(let col=0;col<g.columns;col++){
      const h=this.heights[col];if(h>=g.rows)continue;
      const bit=1<<col;legal|=bit;
      if(this.isWinningSite(col*g.rows+h,mover^1))opp|=bit;
    }
    return {opp,legal};
  }
  immediateColumns() {
    const g=this.g,k=this.keyWords,owner=this.owners,masks=this.masks,
      starts=this.starts;let p0=0,p1=0,legal=0;
    for (let c=0;c<g.columns;c++) {
      const h=this.heights[c];if (h>=g.rows) continue;
      const bit=1<<c,s=c*g.rows+h;
      legal|=bit;
      // Both owners consume the same physical K4-other-three mask traversal.
      // This removes one complete per-site shape scan from the native A kernel.
      let hit0=false,hit1=false;
      for(let i=starts[s]*k,end=starts[s+1]*k;i<end;i+=k){
        let test0=!hit0,test1=!hit1;
        for(let j=0;j<k;j++){
          const mask=masks[i+j];
          if(test0&&((owner[j]&mask)>>>0)!==mask)test0=false;
          if(test1&&((owner[k+j]&mask)>>>0)!==mask)test1=false;
          if(!test0&&!test1)break;
        }
        if(test0)hit0=true;if(test1)hit1=true;
        if(hit0&&hit1)break;
      }
      if(hit0)p0|=bit;
      if(hit1)p1|=bit;
    }
    return {p0,p1,legal};
  }
  // Physical state does not maintain live original-line antichains. Exhaustion
  // would require a separate scan; full-board fallback remains exact.
  noWinningLines(){return false;}
}

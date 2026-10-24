// Native state S=(column heights, P0/P1 unblocked ORIGINAL winning-line masks).
// Three bit-sliced deficiency planes are cheap working registers, NOT TT identity.
export class SourceState {
  constructor(geometry) {
    this.g = geometry;
    this.k = geometry.lineWords;
    this.heights = new Uint8Array(geometry.columns);
    this.fields = new Uint32Array(5 * this.k); // L0 | L1 | D0 | D1 | D2
    this.heightLo = 0;
    this.heightHi = 0;
    this.rank = 0;
    this.terminalWinner = -1;
    for (let j = 0; j < this.k; j++) {
      const mask = geometry.fullLines[j];
      this.fields[j] = mask;
      this.fields[this.k + j] = mask;
      this.fields[4*this.k + j] = mask; // every initial K4 has four empty cells
    }
    // Save exactly the four modified planes at each rank. No per-node allocations.
    this.history = new Uint32Array((geometry.cells + 1) * 4 * this.k);
  }

  // Is placing at physical site a terminal FIRSTWIN by this owner?
  isWinningSite(site, owner) {
    const k = this.k, fields = this.fields, inc = this.g.incidence;
    const pbase = owner * k, ibase = site * k;
    for (let j = 0; j < k; j++) {
      if ((fields[pbase + j] & fields[2*k + j] &
           ~fields[3*k + j] & ~fields[4*k + j] & inc[ibase + j]) !== 0) return true;
    }
    return false;
  }

  // Evaluate FIRSTWIN status before advancing, then do a constant number of
  // machine-word operations per 32 ORIGINAL lines. No residual-shape enumeration.
  apply(column, admittedNonWinning = false) {
    const g = this.g, heights = this.heights;
    if (!Number.isInteger(column) || column < 0 || column >= g.columns ||
        heights[column] >= g.rows || this.terminalWinner >= 0) {
      throw new RangeError('illegal or post-terminal move');
    }
    const owner = this.rank & 1, other = owner ^ 1;
    const site = column * g.rows + heights[column];
    // An admitted nonwinning cofactor is legal ONLY after the caller has just
    // proved the mover has no immediately winning landing column.
    const isTerminal = admittedNonWinning ? false : this.isWinningSite(site, owner);
    const k = this.k, fields = this.fields, incidence = g.incidence;
    const stored = this.rank * 4 * k, lbase = other * k, ibase = site * k;
    for (let j = 0; j < k; j++) {
      const x = incidence[ibase + j], a = fields[2*k + j], b = fields[3*k + j], c = fields[4*k + j];
      this.history[stored + j] = fields[lbase + j];
      this.history[stored + k + j] = a;
      this.history[stored + 2*k + j] = b;
      this.history[stored + 3*k + j] = c;
      fields[lbase + j] &= ~x;          // only opponent original K4s become blocked
      const borrow = x & ~a;
      fields[2*k + j] = a ^ x;         // decrement bit-sliced missing-cell count
      fields[3*k + j] = b ^ borrow;
      fields[4*k + j] = c ^ (borrow & ~b);
    }
    heights[column]++;
    const delta = 1 << (4 * (column & 7));
    if (column < 8) this.heightLo = (this.heightLo + delta) >>> 0;
    else this.heightHi = (this.heightHi + delta) >>> 0;
    this.rank++;
    if (isTerminal) this.terminalWinner = owner;
    return isTerminal;
  }

  undo(column) {
    const g = this.g, heights = this.heights;
    if (!Number.isInteger(column) || column < 0 || column >= g.columns ||
        !this.rank || !heights[column]) throw new RangeError('illegal undo');
    this.rank--;
    heights[column]--;
    const k = this.k, fields = this.fields;
    const saved = this.rank * 4 * k, other = (this.rank & 1) ^ 1, off = other * k;
    for (let j = 0; j < k; j++) {
      fields[off + j] = this.history[saved + j];
      fields[2*k + j] = this.history[saved + k + j];
      fields[3*k + j] = this.history[saved + 2*k + j];
      fields[4*k + j] = this.history[saved + 3*k + j];
    }
    const delta = 1 << (4 * (column & 7));
    if (column < 8) this.heightLo = (this.heightLo - delta) >>> 0;
    else this.heightHi = (this.heightHi - delta) >>> 0;
    this.terminalWinner = -1; // descendants of a legal nonterminal node only
  }

  // When the mover occupies column c, the former height+1 site becomes the
  // opponent's NEXT legal landing. If it is already the unique missing site
  // of an opponent K4, c loses immediately (no earlier own FIRSTWIN exists).
  // This is a one-ply exact rule; it is not a guessed future strategy.
  exposesOpponentWin(column,mover) {
    const h=this.heights[column],g=this.g;
    if(h+1>=g.rows)return false;
    const f=this.fields,k=this.k,at=(column*g.rows+h+1)*k,
      inc=g.incidence,opp=(mover^1)*k;
    for(let j=0;j<k;j++) {
      if((f[opp+j]&f[2*k+j]&~f[3*k+j]&~f[4*k+j]&inc[at+j])!==0)
        return true;
    }
    return false;
  }

  // Exact admitted-child contract: when the parent excludes its own terminal
  // move and all existing/newly exposed opponent FIRSTWIN sites, the child
  // mover has zero immediate winners. Thus only the opponent's immediate
  // threats need enumeration in recursive nodes; root handles both roles.
  opponentImmediateColumns(mover){
    const g=this.g,k=this.k,f=this.fields,h=this.heights,inc=g.incidence,other=(mover^1)*k;
    let opp=0,legal=0;
    for(let col=0;col<g.columns;col++){
      if(h[col]>=g.rows)continue;
      const bit=1<<col,at=(col*g.rows+h[col])*k;
      legal|=bit;
      for(let j=0;j<k;j++){
        const ready=f[2*k+j]&~f[3*k+j]&~f[4*k+j]&inc[at+j];
        if(ready&f[other+j]){opp|=bit;break;}
      }
    }
    return {opp,legal};
  }

  // Return two move-column bitsets. Every bit in the same position means the
  // same legal frontier column. Root/negamax can use bit operations for gates.
  immediateColumns() {
    const g = this.g, k = this.k, d = this.fields, heights = this.heights, inc = g.incidence;
    let p0 = 0, p1 = 0, legal = 0;
    for (let col = 0; col < g.columns; col++) {
      if (heights[col] >= g.rows) continue;
      const bit = 1 << col, offset = (col*g.rows + heights[col])*k;
      legal |= bit;
      for (let j = 0; j < k; j++) {
        const grade1 = d[2*k+j] & ~d[3*k+j] & ~d[4*k+j] & inc[offset+j];
        if (grade1 & d[j]) p0 |= bit;
        if (grade1 & d[k+j]) p1 |= bit;
      }
    }
    return {p0, p1, legal};
  }

  // Bit 0/1 indicates whether the original source still has any surviving
  // line for that owner. In a legal firstwinner-free state the bit can never
  // return after removal, so absence proves a one-sided WDL zero bound.
  liveOwnerMask(){
    const f=this.fields,k=this.k;let v0=0,v1=0;
    for(let j=0;j<k;j++){
      v0|=f[j];v1|=f[k+j];
      if(v0&&v1)break;
    }
    return (v0?1:0)|(v1?2:0);
  }

  // Genuine source exhaustion: no original K4 remains possible for either owner.
  noWinningLines() {
    const f = this.fields, k = this.k;
    for (let j = 0; j < k; j++) if ((f[j] | f[k + j]) !== 0) return false;
    return true;
  }
}

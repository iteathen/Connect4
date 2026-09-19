// Qualification only: independent colored-board reconstruction and exhaustive
// late-root control. Never imported by the production solver.
import { WINNING_LINES } from '../../domain/index.mjs';
export class PhysicalControl {
  constructor(moves = []) {
    this.cells = Array(42).fill(0);
    this.heights = Array(7).fill(0);
    this.ply = 0;
    this.status = 0;
    this.history = [];
    for (const column of moves) this.play(column);
  }
  legal() { return this.status ? [] : this.heights.flatMap((h,c)=>h<6?[c]:[]); }
  play(column) {
    if (!this.legal().includes(column)) throw new Error('illegal physical control move');
    const cell = this.heights[column]++ * 7 + column;
    const owner = (this.ply++ & 1) + 1;
    this.cells[cell] = owner;
    this.history.push([cell, this.status]);
    if (WINNING_LINES.some(line => line.every(i=>this.cells[i] === owner))) this.status = owner;
    else if (this.ply === 42) this.status = 3;
    return cell;
  }
  undo() {
    const [cell, status] = this.history.pop();
    this.cells[cell] = 0; this.heights[cell%7]--; this.ply--; this.status = status;
  }
  residuals(player) {
    const candidates = WINNING_LINES.filter(line=>line.every(i=>this.cells[i] !== 2-player))
      .map(line=>line.reduce((mask,i)=>this.cells[i] === 0 ? mask | (1n<<BigInt(i)) : mask, 0n));
    if (candidates.includes(0n)) throw new Error('residual reconstruction requires a nonterminal state');
    return [...new Set(candidates)].filter(a=>!candidates.some(b=>a!==b && (a & b)===b)).sort((a,b)=>a<b?-1:a>b?1:0);
  }
  q() { return JSON.stringify([this.heights, this.residuals(0).map(String), this.residuals(1).map(String)]); }
  solve(memo = new Map()) {
    if (this.status) return { value: this.status === 1 ? 1 : this.status === 2 ? -1 : 0, moves: [] };
    const key = this.cells.join('');
    if (memo.has(key)) return memo.get(key);
    const values = this.legal().map(column=>{ this.play(column); const value=this.solve(memo).value; this.undo(); return [column,value]; });
    const value = (this.ply & 1 ? Math.min : Math.max)(...values.map(([,v])=>v));
    const result = { value, moves: values.filter(([,v])=>v===value).map(([c])=>c) };
    memo.set(key,result);
    return result;
  }
}

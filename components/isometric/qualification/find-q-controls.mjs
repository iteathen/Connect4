// Deterministic fixture discovery, not solver runtime or theorem evidence.
import { PhysicalControl } from './physical-control.mjs';
const groups = new Map(), pairs = [];
let seed = 17;
const next = () => seed = (Math.imul(seed,1664525)+1013904223)>>>0;
for (let game=0; game<50000 && pairs.length<12; game++) {
  const state = new PhysicalControl(), moves = [];
  while (state.ply<41) {
    const legal = state.legal();
    let played = false;
    while (legal.length) {
      const c = legal.splice(next()%legal.length,1)[0];
      state.play(c);
      if (state.status) { state.undo(); continue; }
      moves.push(c); played = true; break;
    }
    if (!played) break;
    if (state.ply < 35 || state.ply > 36) continue;
    const key = state.q(), board = state.cells.join('');
    const old = groups.get(key);
    if (old && old.board !== board && !old.paired) {
      pairs.push({ a:old.moves, b:[...moves], rank:state.ply, residualCounts:[state.residuals(0).length,state.residuals(1).length] });
      old.paired = true;
    } else if (!old) groups.set(key,{board,moves:[...moves]});
  }
}
if (pairs.length<12) throw new Error('insufficient deliberate q collisions');
console.log(JSON.stringify(pairs,null,2));

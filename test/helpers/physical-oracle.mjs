// TEST ONLY. Independent cell-array domain; never imported by production.
export function lines() {
  const result = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    for (const [dc, dr] of [[1,0],[0,1],[1,1],[1,-1]]) {
      if (c + 3*dc < 7 && r + 3*dr >= 0 && r + 3*dr < 6)
        result.push(Array.from({length:4}, (_, i) => (r+i*dr)*7+c+i*dc));
    }
  }
  return result;
}
const winning = lines();
export function position(moves = []) {
  const board = Array(42).fill(-1), heights = Array(7).fill(0);
  let ply = 0, terminal = 0;
  for (const c of moves) {
    if (terminal || c < 0 || c > 6 || heights[c] === 6) throw Error('illegal oracle move');
    const player = ply & 1;
    board[heights[c]++ * 7 + c] = player; ply++;
    if (winning.some(line => line.every(cell => board[cell] === player))) terminal = player ? 1 : 3;
    else if (ply === 42) terminal = 2;
  }
  return {board, heights, ply, terminal};
}
export function residuals(p, player) {
  return winning.filter(line => line.every(cell => p.board[cell] !== (player ^ 1)))
    .map(line => line.filter(cell => p.board[cell] === -1));
}
export function exact(moves) {
  const p = position(moves);
  if (p.terminal) return {value:p.terminal, move:-1};
  let best = p.ply & 1 ? 4 : 0, move = -1;
  for (const c of [3,2,4,1,5,0,6]) if (p.heights[c] < 6) {
    const v = exact([...moves,c]).value;
    if (p.ply & 1 ? v < best : v > best) {best = v; move = c;}
    if (best === (p.ply & 1 ? 1 : 3)) break;
  }
  return {value:best, move};
}

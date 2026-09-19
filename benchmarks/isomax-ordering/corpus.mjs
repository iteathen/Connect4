import { Connect4Position, STATUS_ONGOING } from '../../components/domain/index.mjs';

// Deterministic legal quiet roots. Selection uses physical-board facts only,
// never either orderer's result or timing. These are not Pascal Pons datasets.
export function makeCorpus({ seed, ply, count }) {
  let random = seed >>> 0;
  const next = () => { random = (Math.imul(random, 1664525) + 1013904223) >>> 0; return random; };
  const result = [], seen = new Set();
  for (let attempt = 0; result.length < count && attempt < 100000; attempt++) {
    const position = new Connect4Position(), moves = [];
    while (moves.length < ply) {
      const safe = position.legalMoves().filter(c => !position.isWinningMove(c, position.sideToMove));
      if (!safe.length) break;
      const column = safe[next() % safe.length];
      position.play(column); moves.push(column);
    }
    if (moves.length !== ply || position.status !== STATUS_ONGOING) continue;
    if (position.legalMoves().some(c => position.isWinningMove(c, 0) || position.isWinningMove(c, 1))) continue;
    const sequence = moves.map(c => c + 1).join('');
    if (seen.has(sequence)) continue;
    seen.add(sequence); result.push({ sequence, moves });
  }
  if (result.length !== count) throw new Error('could not generate requested quiet corpus');
  return result;
}

export const WORKLOADS = Object.freeze([
  { name: 'quiet-ply18', seed: 0x185c4, ply: 18, count: 16 },
  { name: 'quiet-ply20', seed: 0x205c4, ply: 20, count: 16 },
  { name: 'quiet-ply24', seed: 20260919, ply: 24, count: 32 },
  { name: 'quiet-ply28', seed: 0x92c4, ply: 28, count: 32 },
]);

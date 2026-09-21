import { performance } from 'node:perf_hooks';
import { IsoMaxSolver } from '../../components/isometric/index.mjs';

const sequence=process.argv[2];
if (!sequence) throw new Error('sequence required');
const moves=new Uint8Array(sequence.length);
for(let i=0;i<sequence.length;i++){
  const move=sequence.charCodeAt(i)-49;
  if(move<0||move>6) throw new Error('invalid move digit');
  moves[i]=move;
}
const solver=new IsoMaxSolver();
const started=performance.now();
const solved=solver.solveMoves(moves);
console.log(JSON.stringify({value:solved.value,nodes:solved.metrics.nodes??null,elapsedMs:performance.now()-started}));

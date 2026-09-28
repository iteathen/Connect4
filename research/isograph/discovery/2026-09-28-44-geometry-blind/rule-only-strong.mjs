import {ExactConnect4Oracle} from '../../../../components/oracle/exact7x6.mjs';

const solver=new ExactConnect4Oracle();
const start=performance.now();
const scores=Array.from(solver.analyzeSequence('44'));
const elapsedMs=performance.now()-start;
const legal=scores.map((score,i)=>({column:i+1,score})).filter(x=>x.score>-1000);
const best=Math.max(...legal.map(x=>x.score));
const bestMoves=legal.filter(x=>x.score===best).map(x=>x.column);
console.log(JSON.stringify({
  schema:'connect4.44.rule-only-strong-score.v1',
  prefix:'44',
  inputs:['7x6 geometry','connect-4 rule','gravity','alternating turns','terminal win/draw rules'],
  forbiddenSolvedInputs:'none',
  solvedInputUsed:false,
  algorithm:'independent exact negamax with alpha-beta bounds and transposition memoization; every score derives recursively from legal game transitions',
  scores,
  bestScore:best,
  bestMoves,
  nodes:solver.nodes,
  elapsedMs,
},null,2));

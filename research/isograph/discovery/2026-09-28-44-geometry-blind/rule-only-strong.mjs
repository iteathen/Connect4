import {ExactConnect4Oracle} from '../../../../components/oracle/exact7x6.mjs';

const sequence=process.env.SEQUENCE;
if(!/^(441|442|443|444)$/.test(sequence??''))throw new Error('SEQUENCE must be one of 441,442,443,444');
const solver=new ExactConnect4Oracle();
const start=performance.now();
const score=solver.solveSequence(sequence);
const elapsedMs=performance.now()-start;
console.log(JSON.stringify({
  schema:'connect4.44.rule-only-strong-score-child.v2',
  sequence,
  inputs:['7x6 geometry','connect-4 rule','gravity','alternating turns','terminal win/draw rules'],
  solvedInputUsed:false,
  algorithm:'independent exact negamax from legal game transitions with fresh transposition state for this one child',
  score,
  scoreSign:score===0?0:score>0?1:-1,
  nodes:solver.nodes,
  elapsedMs,
},null,2));

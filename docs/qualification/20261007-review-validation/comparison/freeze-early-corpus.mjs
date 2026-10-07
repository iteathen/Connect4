import {writeFileSync} from 'node:fs';
import {inspect,toDigits} from './physical-legality.mjs';
const cases=[];
for(let rank=8;rank<=16;rank++){
 let seed=(0x20261007^Math.imul(rank,0x9e3779b9))>>>0;
 const initialSeed=seed,random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 let chosen=null;
 for(let trial=0;trial<100&&!chosen;trial++){
  const moves=[];
  for(let ply=0;ply<rank;ply++){
   const state=inspect(moves),choices=[];
   for(let col=0;col<7;col++)if(state.heights[col]<6&&!inspect([...moves,col]).winner)choices.push(col);
   if(!choices.length)break;
   moves.push(choices[random()%choices.length]);
  }
  if(moves.length===rank)chosen={id:`early-${rank}`,rank,initialSeed,trial,moves,oneBased:toDigits(moves)};
 }
 if(!chosen)throw Error('Unable to construct rule-only nonterminal history');
 cases.push(chosen);
}
const corpus={schema:1,selection:'Nine independent seeded traces, one rank each from8..16; choose by seeded PRNG modulo among currently legal moves that do not immediately win; no solved outcomes inspected',columnNotation:'moves=zero-based; oneBased=digits1..7',cases};
const text=JSON.stringify(corpus,null,2)+'\n';
if(process.argv[2])writeFileSync(process.argv[2],text);else process.stdout.write(text);

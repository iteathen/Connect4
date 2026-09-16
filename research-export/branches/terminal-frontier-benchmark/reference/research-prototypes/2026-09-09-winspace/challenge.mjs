// Candidate-independent difficulty selection. No line-kernel measurement is used.
import{writeFileSync}from'node:fs';
import{geometry,rng,rollout,stateArgs}from'./position.mjs';
import{Solver}from'../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const g=geometry(),random=rng(0x917bd540),e=new Solver(17,true),positions=[];let attempts=0,caps=0,terminalCuts=0;
for(;attempts<400&&positions.length<12;attempts++){
 const s=rollout([14,16,18,20,22,24][attempts%6],random,g);if(!s)continue;
 for(const k of['keyLo','keyHi','val','ctrl','owner'])e[k].fill(0);e.resetMetrics();e.limit=300000;
 let score;try{score=e.solveBits(...stateArgs(s));}catch(err){if(err===911){caps++;continue;}throw err;}
 if(e.nodes<20000){terminalCuts++;continue;}
 positions.push({id:positions.length,cohort:'challenge',seq:s.seq,baselineScore:score,selectionNodes:e.nodes});
}
writeFileSync(new URL('./challenge.json',import.meta.url),JSON.stringify(positions,null,2)+'\n');
console.log(JSON.stringify({kind:'challengeFreeze',seed:'0x917bd540',attempts,caps,terminalCuts,selected:positions.length,rule:'first twelve legal nonterminal survivor roots with 20000..299999 baseline nodes; 128K full-key baseline only; no candidate results consulted',positions}));

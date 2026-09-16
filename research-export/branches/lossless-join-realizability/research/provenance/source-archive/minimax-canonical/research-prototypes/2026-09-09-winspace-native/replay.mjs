// Cohort-batched, paired confirmation. Each root uses a cold TT; compilation and
// clearing are INCLUDED. Fixed arena allocation and JIT warmup are outside timing.
import assert from'node:assert/strict';import{readFileSync,writeFileSync,appendFileSync}from'node:fs';import{createHash}from'node:crypto';import{cpus,availableParallelism}from'node:os';
import{DenseLineSolver}from'./dense_solver.mjs';import{Solver}from'../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';import{parse,stateArgs}from'./support.mjs';
const out=new URL('../../../docs/research/evidence/winspace-native/',import.meta.url);
const text=readFileSync(new URL('confirmation-corpus.tsv',out),'utf8'),cases=text.trimEnd().split('\n').slice(2).map(l=>{const[cohort,seq,expected]=l.split('\t');return{cohort,seq,expected:Number(expected)};});
if(process.argv.includes('--validate-input')){for(const c of cases)parse(c.seq);console.log(JSON.stringify({inputCases:cases.length,status:'PASS'}));process.exit(0);}
const file=new URL('replay.jsonl',out);writeFileSync(file,'');const emit=x=>appendFileSync(file,JSON.stringify(x)+'\n');
emit({kind:'environment',node:process.version,cpu:cpus()[0]?.model,workers:1,repeats:7,input:'confirmation-corpus.tsv'});
for(const cohort of ['ordinary','priorStructural','anchors']){
 const pow=cohort==='anchors'?19:17,budget=14*2**pow,rows=cases.filter(x=>x.cohort===cohort),states=rows.map(x=>parse(x.seq)),args=states.map(stateArgs),base=new Solver(pow,false),candidate=new DenseLineSolver(budget);
 function batch(mode){let nodes=0,hits=0,writes=0,drawStops=0,checks=0,activeMin=budget,activeMax=0;
  for(let i=0;i<states.length;i++){
   let score;if(mode==='baseline'){
    base.keyLo.fill(0);base.keyHi.fill(0);base.val.fill(0);base.ctrl.fill(0);base.owner.fill(0);base.resetMetrics();score=base.solveBits(...args[i]);nodes+=base.nodes;hits+=base.ttHits;writes+=base.writeSuccess;activeMax=budget;
   }else{const meta=candidate.compile(states[i]);score=candidate.solve();nodes+=candidate.nodes;hits+=candidate.ttHits;writes+=candidate.writeSuccess;drawStops+=candidate.drawStops;activeMin=Math.min(activeMin,meta.activeBytes);activeMax=Math.max(activeMax,meta.activeBytes);}
   assert.equal(score,rows[i].expected,rows[i].seq);checks++;
  }return{nodes,hits,writes,drawStops,checks,activeMin,activeMax};
 }
 // Warm both engines on identical complete roots; clear per root in all phases.
 for(let i=0;i<2;i++){batch('baseline');batch('dense');}
 for(let r=0;r<7;r++)for(let o=0;o<2;o++){
  const mode=(r+o)%2?'baseline':'dense';const t=performance.now(),m=batch(mode),ms=performance.now()-t;
  emit({kind:'trial',cohort,pow,budget,repeat:r,order:o,mode,totalMs:ms,...m});
 }
 console.log(JSON.stringify({cohort,status:'complete',cases:rows.length}));
}
emit({kind:'complete',rootScoreAgreementOnly:true});

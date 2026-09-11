import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN } from './quotient-native-negamax-kernel.mjs';
import { createScaledTermIdQuotientNativeNegamaxKernel } from './quotient-native-negamax-scaled-term-id-kernel.mjs';
import { createChunkedResidualQuotientKernel } from './quotient-native-negamax-chunked-residual-kernel.mjs';
import { createClassFirstChunkedResidualQuotientKernel } from './quotient-native-negamax-chunked-class-first-kernel.mjs';

const SPEC = Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 });
const OPTIONS = Object.freeze({ cacheEdges: false, supportLayout: 'packed', prefixClasses: 4096 });
const VARIANTS = Object.freeze(['term-list', 'chunk-v1', 'chunk-class-first']);

function assert(condition, message) { if (!condition) throw new Error(message); }
function median(values) { const sorted = [...values].sort((a,b)=>a-b); return sorted[Math.floor(sorted.length/2)]; }
function createVariant(name) {
  if (name === 'term-list') return createScaledTermIdQuotientNativeNegamaxKernel(SPEC, OPTIONS);
  if (name === 'chunk-v1') return createChunkedResidualQuotientKernel(SPEC, OPTIONS);
  if (name === 'chunk-class-first') return createClassFirstChunkedResidualQuotientKernel(SPEC, OPTIONS);
  throw new RangeError(name);
}
function enumerate(kernel) {
  let terminal=0, nonterminal=0, illegal=0;
  for (let id=0; id<kernel.states.count; id+=1) for (let c=0;c<SPEC.columns;c+=1) {
    const child=kernel.advance(id,c);
    if (child===QN_ILLEGAL) illegal+=1; else if (child===QN_TERMINAL_WIN) terminal+=1; else nonterminal+=1;
  }
  return {states:kernel.states.count,terminal,nonterminal,illegal};
}
function equalIds(a,b){ if(a.length!==b.length)return false; for(let i=0;i<a.length;i+=1)if(a[i]!==b[i])return false; return true; }
function qualifyGraph() {
  const wraps=Object.fromEntries(VARIANTS.map((name)=>[name,createVariant(name)]));
  const base=wraps['term-list'].kernel;
  const census=enumerate(base);
  assert(census.states===SPEC.expectedStates,'term-list state census drift');
  for(const name of VARIANTS.slice(1)){
    const k=wraps[name].kernel;
    assert(JSON.stringify(enumerate(k))===JSON.stringify(census),`${name} census mismatch`);
    assert(k.classes.size===base.classes.size,`${name} class count mismatch`);
    assert(k.states.count===base.states.count,`${name} q count mismatch`);
    for(let cid=0;cid<base.classes.size;cid+=1) assert(equalIds(k.classes.termIds(cid),base.classes.termIds(cid)),`${name} class ${cid} mismatch`);
    for(let id=0;id<base.states.count;id+=1){
      const a=base.stateView(id), b=k.stateView(id);
      assert(a.supportIndex===b.supportIndex&&a.p0Class===b.p0Class&&a.p1Class===b.p1Class,`${name} q ${id} mismatch`);
      for(let c=0;c<SPEC.columns;c+=1) assert(k.advance(id,c)===base.advance(id,c),`${name} edge ${id}/${c} mismatch`);
    }
  }
  return Object.fromEntries(VARIANTS.map((name)=>[name,{memory:wraps[name].kernel.memoryStats(),classMetrics:{...wraps[name].kernel.classes.metrics},chunkMetrics:wraps[name].residual?.chunkPool?{...wraps[name].residual.chunkPool.metrics}:null}]));
}
function rootActions(oracle){const out=[];for(let c=0;c<SPEC.columns;c+=1){const h=Array(SPEC.columns).fill(0);h[c]=1;out[c]=oracle.evaluate({heights:h,p0OwnershipMask:1n<<BigInt(c)});}return out;}
function runOnce(name,oracle,actions,qualify=false){
  const started=performance.now();const wrap=createVariant(name);const setupMs=performance.now()-started;
  const solver=wrap.kernel.createWdlSolver({wdlMode:'full',etc:false});const ss=performance.now();const value=solver.run();const solveMs=performance.now()-ss;
  assert(value===oracle.rootWdl,`${name} root mismatch`);let actual=null;if(qualify){actual=solver.rootActionValues();for(let c=0;c<SPEC.columns;c+=1)assert(actual[c]===actions[c],`${name} action ${c} mismatch`);}
  return {totalMs:performance.now()-started,setupMs,solveMs,expanded:solver.metrics.expanded,calls:solver.metrics.calls,memory:wrap.kernel.memoryStats(),classMetrics:{...wrap.kernel.classes.metrics},chunkMetrics:wrap.residual?.chunkPool?{...wrap.residual.chunkPool.metrics}:null};
}
const graph=qualifyGraph();const oracle=solveBsfpOwnershipAntichainWdl(SPEC);const actions=rootActions(oracle);const qualification={};
for(const name of VARIANTS)qualification[name]=runOnce(name,oracle,actions,true);
for(const name of VARIANTS)assert(qualification[name].expanded===qualification['term-list'].expanded&&qualification[name].calls===qualification['term-list'].calls,`${name} search work mismatch`);
const samples=Object.fromEntries(VARIANTS.map((n)=>[n,[]]));
for(let r=0;r<15;r+=1){for(let s=0;s<VARIANTS.length;s+=1){const name=VARIANTS[(r+s)%VARIANTS.length];samples[name].push(runOnce(name,oracle,actions));}}
const results={};for(const name of VARIANTS){const runs=samples[name];const rep=[...runs].sort((a,b)=>a.totalMs-b.totalMs)[Math.floor(runs.length/2)];results[name]={totalMs:median(runs.map(x=>x.totalMs)),solveMs:median(runs.map(x=>x.solveMs)),representative:rep,qualification:qualification[name]};}
console.error(`CLASS_FIRST_CHUNK_SUMMARY=${JSON.stringify(Object.fromEntries(VARIANTS.map((n)=>[n,{ms:results[n].totalMs,bytes:results[n].representative.memory.totalTypedBytes,classHits:results[n].representative.classMetrics.internHits,classMisses:results[n].representative.classMetrics.internMisses,chunkLookups:results[n].representative.chunkMetrics?results[n].representative.chunkMetrics.lookups:null,chunkHits:results[n].representative.chunkMetrics?results[n].representative.chunkMetrics.hits:null,chunkMisses:results[n].representative.chunkMetrics?results[n].representative.chunkMetrics.misses:null,avoided:results[n].representative.classMetrics.chunkInternsAvoidedOnClassHit??null}])))}`);
console.log(JSON.stringify({kind:'connect4-class-first-chunked-residual-v1',status:'complete',date:'2026-09-11',qualification:'complete 4x5 class/qID/edge identity, BSFP root/action WDL, identical search work',graph,results},null,2));

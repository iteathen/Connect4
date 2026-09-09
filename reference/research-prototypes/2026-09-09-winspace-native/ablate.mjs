// Qualification/causal ablation only; no timing claim. TT stores disabled in all modes.
import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{Solver}from'../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';import{DenseLineSolver}from'./dense_solver.mjs';import{parse,stateArgs,geometry}from'./support.mjs';
const G=geometry(),ORDER=G.order,pop=x=>{x-=x>>>1&0x55555555;x=(x&0x33333333)+(x>>>2&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24;},multi=(lo,hi)=>hi!==0?(lo!==0||(hi&(hi-1))!==0):(lo!==0&&(lo&(lo-1))!==0);
const rows=JSON.parse(readFileSync(new URL('../../../docs/research/evidence/winspace-native/confirmation-corpus.json',import.meta.url))).cases.filter(x=>x.cohort==='priorStructural');let baseNodes=0,noDrawNodes=0,drawNodes=0,stops=0;
for(const row of rows){const s=parse(row.seq),base=new Solver(10,false);base.publish=()=>{};const b=base.solveBits(...stateArgs(s));assert.equal(b,row.expected);baseNodes+=base.nodes;
 const q=new DenseLineSolver(14000);q.compile(s);q.publish=()=>{};const d=q.solve();assert.equal(d,b);drawNodes+=q.nodes;stops+=q.drawStops;const dn=q.nodes;
 q.clear();const src=q.search.toString().replace('if((c0|c1|c2|o0|o1|o2)===0){this.drawStops++;return 0;}','');q.search=new Function('G','ORDER','pop','multi','return '+src)(G,ORDER,pop,multi);q.publish=()=>{};
 const n=q.solve();assert.equal(n,b);assert.equal(q.nodes,base.nodes,'No-TT/no-draw should reproduce unchanged tactical ordering and tree');noDrawNodes+=q.nodes;
 console.log(JSON.stringify({seq:row.seq,score:b,baselineNoTTNodes:base.nodes,nativeNoTTNoDrawNodes:q.nodes,nativeNoTTDrawNodes:dn}));
}
console.log(JSON.stringify({kind:'summary',cases:rows.length,baseNodes,noDrawNodes,drawNodes,drawStops:stops,status:'PASS'}));

#!/usr/bin/env node
// Independent finite-relation algebra falsifier for the Galois producer.
// 65,536 relations x 16 legal-reply universes = 1,048,576 logical checks.
// No state-tree traversal, oracle labels, or solved policies.
import {buildAdaptiveGaloisFactors} from './adaptive-galois-factor.mjs';

const fixtureRows=[0xe,0x4,0xe,0x7]; // qualified physical source 4x3-c3 prefix 223
const fixture=buildAdaptiveGaloisFactors(fixtureRows,{deadlineAt:Date.now()+15000});
if(!fixture.forallReplyExistsAction||fixture.existsActionForallReply)
  throw Error('223 alternating-quantifier counterexample lost');
if(fixture.rectangles.length!==4||fixture.rowTypeCount!==3)
  throw Error('223 maximal-rectangle count mismatch');
const state={
  status:'PASS',matrixCount:0,quantifierScopeChecks:0,
  mismatches:0,subsetOperationTotal:0,
  maximumOperationsPerFactor:0,maximumConceptCount:0,
  maximumConceptMatrix:null,conceptCountHistogram:{},
  conceptsVsDistinctRowTypes:{fewer:0,equal:0,more:0},
  seeded7Count:0,largestSeeded7Concepts:0,largestSeeded7Rows:null,
  largestSeeded7Operations:0
};
function directlyCheck(rows,rectangles,legal){
  let covered=0;
  for(const row of rows)covered|=row;
  let factored=0;
  for(const c of rectangles)factored|=c.replyMask;
  const forallExists=(covered&legal)===legal;
  const existsForall=rows.some(row=>(row&legal)===legal);
  const fForallExists=(factored&legal)===legal;
  const fExistsForall=rows.some((_,a)=>{
    let m=0;for(const c of rectangles)if(c.actionMask&(1<<a))m|=c.replyMask;
    return (m&legal)===legal;
  });
  if(forallExists!==fForallExists||existsForall!==fExistsForall)
    throw Error('quantifier order mismatch with legal reply mask '+legal);
}
for(let encoded=0;encoded<65536;encoded++){
  const rows=[encoded&15,(encoded>>>4)&15,(encoded>>>8)&15,(encoded>>>12)&15];
  const x=buildAdaptiveGaloisFactors(rows,{deadlineAt:Date.now()+15000});
  if(x.reconstructed.some((mask,a)=>mask!==rows[a]))
    throw Error('row identity mismatch '+encoded);
  for(let legal=0;legal<16;legal++){
    directlyCheck(rows,x.rectangles,legal);state.quantifierScopeChecks++;
  }
  state.matrixCount++;
  state.subsetOperationTotal+=x.stats.operations;
  state.maximumOperationsPerFactor=Math.max(state.maximumOperationsPerFactor,x.stats.operations);
  const concepts=x.rectangles.length;
  state.conceptCountHistogram[concepts]=(state.conceptCountHistogram[concepts]||0)+1;
  if(concepts>state.maximumConceptCount){
    state.maximumConceptCount=concepts;state.maximumConceptMatrix=encoded;
  }
  if(concepts<x.rowTypeCount)state.conceptsVsDistinctRowTypes.fewer++;
  else if(concepts===x.rowTypeCount)state.conceptsVsDistinctRowTypes.equal++;
  else state.conceptsVsDistinctRowTypes.more++;
}
let seed=0x1a2b3c4d;
for(let k=0;k<100;k++){
  const rows=[];
  for(let a=0;a<7;a++){
    seed=(1664525*seed+1013904223)>>>0;
    rows.push(seed&127);
  }
  const x=buildAdaptiveGaloisFactors(rows,{deadlineAt:Date.now()+15000});
  if(x.reconstructed.some((mask,a)=>mask!==rows[a]))throw Error('7x7 rebuild mismatch');
  for(let legal of [0,1,31,63,127])directlyCheck(rows,x.rectangles,legal);
  state.seeded7Count++;
  if(x.rectangles.length>state.largestSeeded7Concepts){
    state.largestSeeded7Concepts=x.rectangles.length;
    state.largestSeeded7Rows=rows;
    state.largestSeeded7Operations=x.stats.operations;
  }
}
const output={
  schema:'connect4.adaptive-galois-factor-control.v0_1',
  generatedFrom:'research/isograph/discovery/2026-10-16-algorithmic-core/adaptive-galois-factor-control.mjs',
  date:'2026-10-16',
  runtime:'local Node/V8 when run on Node; counts include intersections/incidence/closures/rebuilds',
  fixture223:{rows:fixtureRows,rectangles:fixture.rectangles,
    concepts:fixture.rectangles.length,distinctRowTypes:fixture.rowTypeCount,
    forallReplyExistsAction:fixture.forallReplyExistsAction,
    existsActionForallReply:fixture.existsActionForallReply,
    operations:fixture.stats.operations},
  ...state,fullGameWDLProved:false,alternatingMultiBlockCompressionProved:false,
  independentGameOracleQueries:0
};
console.log(JSON.stringify(output,null,2));

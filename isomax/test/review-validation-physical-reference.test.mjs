import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectHistory,solvePhysical,buildCorpus} from './review-validation-physical-reference.mjs';

test('physical reference rejects moves after a win and full-column moves',()=>{
 assert.throws(()=>inspectHistory([0,1,0,1,0,1,0,2]),/terminal/);
 assert.throws(()=>inspectHistory([0,0,0,0,0,0,0]),/column/);
});
test('physical reference handles wins in all four directions and board boundaries',()=>{
 for(const [moves,columns,rows] of [
  [[0,1,0,1,0,1,0],7,6],[[0,0,1,1,2,2,3],7,6],
  [[0,1,1,2,4,2,2,3,4,3,5,3,3],7,6],
  [[6,5,5,4,2,4,4,3,2,3,1,3,3],7,6]]){
  assert.equal(inspectHistory(moves,{columns,rows}).winner,1);
  assert.equal(solvePhysical(moves,{columns,rows}).wdl,-1);
 }
 for(const [columns,rows] of [[1,4],[4,1],[1,10]])assert.equal(solvePhysical([],{columns,rows}).wdl,0);
 assert.throws(()=>solvePhysical([0,1,0,1,0,2]),/bounded/);
 assert.throws(()=>inspectHistory([-1]),/column/);
 assert.throws(()=>inspectHistory([7]),/column/);
});
test('deterministic late corpus is legal, varied, mirrored, and physically solved',()=>{
 const corpus=buildCorpus({count:240});
 assert.equal(corpus.length,240);
 assert.equal(new Set(corpus.map(p=>p.id)).size,240);
 assert.deepEqual(buildCorpus({count:240}),corpus);
 const wdls=new Set(),ranks=new Set();
 for(const p of corpus){
  const state=inspectHistory(p.moves);assert.equal(state.winner,0);
  assert.ok(p.moves.length>=32&&p.moves.length<=39);
  ranks.add(p.moves.length);
 }
 // Bounded reference checks cover a small sample here; the explicit outcome
 // runner validates every requested corpus entry after its solver returns.
 for(const p of corpus.slice(0,24)){
  const oracle=solvePhysical(p.moves);wdls.add(oracle.wdl);
  const mirror=solvePhysical(p.moves.map(c=>6-c));
  assert.equal(mirror.wdl,oracle.wdl);
  assert.deepEqual(mirror.bestMoves,oracle.bestMoves.map(c=>6-c).sort((a,b)=>a-b));
 }
 assert.ok(wdls.size>=2);assert.equal(ranks.size,8);
});

test('physical late draw reference has legal outcome-preserving witnesses',()=>{
 const moves=[5,6,6,2,5,3,3,3,5,3,6,5,5,5,6,3,2,2,2,1,3,6,2,6,2,1,0,0,4,4,1,4,4,0,1,1,0,1,4,0],
  result=solvePhysical(moves);
 assert.equal(result.wdl,0);assert.deepEqual(result.bestMoves,[0,4]);
 for(const column of result.bestMoves)assert.equal(solvePhysical([...moves,column]).wdl,0);
});

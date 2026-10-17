#!/usr/bin/env node
// Rule-only structural probe of source residual hypergraph interaction.
// Not a solver, not a game-tree or strategy search. Used only to TEST
// applicability of general graph-width and quantifier-separator theorems.
//
// The primal graph has one vertex for each unoccupied board cell, and an
// undirected edge iff two future cells occur in one normalized residual
// requirement (either player). Graph connectedness forbids a trivial
// zero-boundary AND-factorization of all source residual clauses.
//
// Greedy min-fill elimination width is an UPPER BOUND on graph treewidth,
// NOT a proven optimal treewidth, and not a bound on quantified Bellman
// circuit width (gravity and temporal guards can add dependencies).
import {createExactQCore} from './exact-q-core.mjs';

const G={width:7,height:6,connect:4};
function degreeBits(x){let n=0;for(;x;x&=x-1n)n++;return n;}
function raw(seq){
 const core=createExactQCore(G);
 let q=core.createEmpty();
 for(const m of seq){
  const child=core.next(q,Number(m)-1);
  if(child.terminal!==undefined)throw Error('source prefix terminated');
  q=child.q;
 }
 const nodes=[];
 for(let c=0;c<G.width;c++)for(let row=q.h[c];row<G.height;row++)
  nodes.push(row*G.width+c);
 const adj=new Map(nodes.map(x=>[x,new Set()]));
 const sourceRequirements=[q.R0,q.R1];
 for(const R of sourceRequirements)for(const mask of R){
  const xs=nodes.filter(x=>(mask&(1n<<BigInt(x)))!==0n);
  for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){
   adj.get(xs[i]).add(xs[j]);adj.get(xs[j]).add(xs[i]);
  }
 }
 const originalAdj=new Map([...adj].map(([v,S])=>[v,new Set(S)]));
 const seen=new Set(),components=[];
 for(const n of nodes){
  if(seen.has(n))continue;
  const todo=[n];seen.add(n);let ct=0;
  while(todo.length){
   const v=todo.pop();ct++;
   for(const u of adj.get(v))
    if(!seen.has(u)){seen.add(u);todo.push(u);}
  }
  components.push(ct);
 }
 components.sort((a,b)=>b-a);
 const crossingCuts=[];
 for(let boundary=1;boundary<G.width;boundary++){
  const edges=[];
  for(const [u,S] of originalAdj)for(const v of S){
   if(u>=v)continue;
   if((u%G.width<boundary)!==(v%G.width<boundary))edges.push([u,v]);
  }
  const endpoints=new Set(edges.flat());
  crossingCuts.push({leftColumns:boundary,
   crossingPrimalEdges:edges.length,distinctCrossingCellVariables:endpoints.size});
 }
 const eliminated=[],fillCounts=[];
 let width=0;
 while(adj.size){
  let candidate=null,score=null;
  for(const [v,N] of adj){
   const neighbors=[...N],deg=neighbors.length;
   let missing=0;
   for(let i=0;i<neighbors.length;i++)for(let j=i+1;j<neighbors.length;j++)
    if(!adj.get(neighbors[i]).has(neighbors[j]))missing++;
   const k=[missing,deg,v];
   if(score===null||k[0]<score[0]||k[0]===score[0]&&
      (k[1]<score[1]||k[1]===score[1]&&k[2]<score[2])){
    candidate=v;score=k;
   }
  }
  const neighbors=[...adj.get(candidate)];
  width=Math.max(width,neighbors.length);
  eliminated.push(candidate);fillCounts.push(score[0]);
  for(let i=0;i<neighbors.length;i++)for(let j=i+1;j<neighbors.length;j++){
   adj.get(neighbors[i]).add(neighbors[j]);
   adj.get(neighbors[j]).add(neighbors[i]);
  }
  for(const x of neighbors)adj.get(x).delete(candidate);
  adj.delete(candidate);
 }
 return {
  history:seq,sourceSupport:q.h,sourceOccupiedStones:seq.length,
  futureCells:nodes.length,geometryWinningLines:core.lineCount,
  sourceResidualSizes:{P0:q.R0.length,P1:q.R1.length},
  sourceResidualCardinalityHistograms:
   sourceRequirements.map(R=>Object.fromEntries(
    [...new Set(R.map(degreeBits))].sort((a,b)=>a-b)
      .map(n=>[n,R.filter(r=>degreeBits(r)===n).length]))),
  primalEdges:[...originalAdj.values()].reduce((sum,S)=>sum+S.size,0)/2,
  primalConnectedComponentSizes:components,
  columnCrossingBoundaryCounts:crossingCuts,
  greedyMinFillUpperBoundOnPrimalTreewidth:width,
  greedyMinFillOrdering:eliminated,
  greedyFillEdgesInserted:fillCounts.reduce((a,b)=>a+b,0),
  explicitlyNotClaimed:[
   'this heuristic computes the exact minimum primal treewidth',
   'the primal residual graph equals the full quantified strategy circuit interaction graph',
   'low primal treewidth would guarantee polynomial arbitrary quantifier alternation',
   'a source-q connected hypergraph precludes conditional-separator factorization'
  ],
  candidateUsedGameStateSearch:false,oracleCalls:0
 };
}
export function runResidualStructuralWidthProbe(){
 return {schema:'connect4.residual-hypergraph-width-probe.v0_1',
  date:'2026-10-16',
  status:'STRUCTURAL_PROBE_ONLY',
  cases:['44444','444444','4444414'].map(raw),
  mathematicalRole:'diagnose zero-boundary factorization and heuristic primal separator width; no solved outcomes'};
}
if(process.argv[1]?.endsWith('residual-dependency-width-probe.mjs'))
 console.log(JSON.stringify(runResidualStructuralWidthProbe(),null,2));

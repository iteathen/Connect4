#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Board-family phase theorem.  The line-side CPC phase quotient is canonically
// realized as the boundary of the width-W column path, not merely as an
// abstract W-1 dimensional even-weight vector space.

function xor(a,b){return a.map((v,i)=>v^b[i]);}
function boundary(width,edgeVector){
  assert.equal(edgeVector.length,Math.max(width-1,0));
  const out=Array(width).fill(0);
  for(let i=0;i<edgeVector.length;i++)if(edgeVector[i]){out[i]^=1;out[i+1]^=1;}
  return out;
}
function intervalLift(width,a,b){
  assert(a>=0&&a<width&&b>=0&&b<width);
  const out=Array(Math.max(width-1,0)).fill(0);
  for(let i=Math.min(a,b);i<Math.max(a,b);i++)out[i]=1;
  return out;
}
function displacement(width,a,b){
  const out=Array(width).fill(0);out[a]^=1;out[b]^=1;return out;
}
function popcount(v){return v.reduce((s,x)=>s+x,0);}
function reflection(width,v){return Array.from({length:v.length},(_,i)=>v[v.length-1-i]);}
function centers(width){
  const ecc=Array.from({length:width},(_,c)=>Math.max(c,width-1-c));
  const radius=Math.min(...ecc);
  return {radius,columns:ecc.map((e,c)=>e===radius?c:null).filter(c=>c!==null),eccentricities:ecc};
}
function enumerateEdgeVectors(n){
  assert(n<=20,'finite uniqueness audit intentionally bounded');
  const out=[];
  for(let mask=0;mask<(1<<n);mask++)out.push(Array.from({length:n},(_,i)=>(mask>>i)&1));
  return out;
}

const reports=[];
for(let W=1;W<=16;W++){
  const edgeDim=Math.max(W-1,0);
  const images=new Map();
  if(edgeDim<=15){
    for(const e of enumerateEdgeVectors(edgeDim)){
      const b=boundary(W,e),key=b.join('');
      assert.equal(popcount(b)%2,0);
      assert(!images.has(key),'path boundary must be injective');
      images.set(key,e);
    }
    assert.equal(images.size,2**edgeDim);
    const evenCount=2**Math.max(W-1,0);
    assert.equal(images.size,evenCount);
  }
  for(let a=0;a<W;a++)for(let b=0;b<W;b++){
    const lift=intervalLift(W,a,b),d=displacement(W,a,b);
    assert.deepEqual(boundary(W,lift),d);
    assert.equal(popcount(lift),Math.abs(a-b));
    assert.deepEqual(boundary(W,reflection(W-1,lift)),reflection(W,d));
  }
  const c=centers(W);
  if(W%2===1)assert.deepEqual(c.columns,[(W-1)/2]);
  else if(W>0)assert.deepEqual(c.columns,[W/2-1,W/2]);
  reports.push({W,phaseDimension:edgeDim,centers:c.columns,radius:c.radius});
}

const standard=reports.find(x=>x.W===7);
assert.deepEqual(standard,{W:7,phaseDimension:6,centers:[3],radius:3});
assert.deepEqual(boundary(7,intervalLift(7,0,6)),[1,0,0,0,0,0,1]);
assert.deepEqual(boundary(7,intervalLift(7,3,3)),Array(7).fill(0));

console.log(`PHASE_PATH_TRANSPORT=${JSON.stringify({
  proved:true,
  theorem:{
    quotient:'C_phase ~= Even(F2^W) ~= edge space of path P_W',
    boundary:'partial(edge_i)=e_i+e_(i+1)',
    lift:'e_a+e_b has unique path lift on edges min(a,b)..max(a,b)-1',
    transportLength:'HammingWeight(lift)=|a-b|',
    sameColumn:'a=b gives zero phase displacement and empty path lift',
    reflectionEquivariant:true,
    graphCenter:'columns minimizing worst-case phase transport; unique iff W is odd'
  },
  standard,
  finiteQualification:reports,
  proofBoundary:'Exact GF(2) path-boundary theorem. Transport length is a structural phase distance only; no claim yet that game-theoretic strong distance is monotone in this norm.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);

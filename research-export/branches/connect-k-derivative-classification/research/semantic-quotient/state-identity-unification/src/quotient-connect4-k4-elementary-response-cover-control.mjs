#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Searchless board-family theorem for the first response-certificate layer.
// It uses only two generic event programs equivalent to the elementary
// Claimeven/Baseinverse response forms. Named historical rules are provenance;
// the proof object here is guaranteed-response cells plus disjoint resources.

const K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];

function lines(W,H){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const[dx,dy]of DIRS){
    const cells=Array.from({length:K},(_,i)=>({x:x+i*dx,y:y+i*dy}));
    if(cells.every(p=>p.x>=0&&p.x<W&&p.y>=0&&p.y<H))out.push({cells,dx,dy});
  }
  return out;
}
const key=p=>`${p.x},${p.y}`;

// Explicit compatible construction.
// Base-pair programs use disjoint bottom pairs (1,2),(4,5),(7,8),...
// Every length-4 bottom interval contains one such pair.
// Claim-pair programs use disjoint vertical pairs (0,1),(2,3),... in each
// column except where a bottom cell is already consumed by a base pair.
function construction(W,H){
  const resources=new Set(),basePairs=[],claims=[];
  for(let a=1;a+1<W;a+=3){
    const pair=[{x:a,y:0},{x:a+1,y:0}];
    for(const p of pair){assert(!resources.has(key(p)));resources.add(key(p));}
    basePairs.push(pair);
  }
  for(let x=0;x<W;x++)for(let lo=0;lo+1<H;lo+=2){
    const pair=[{x,y:lo},{x,y:lo+1}];
    if(pair.some(p=>resources.has(key(p))))continue;
    for(const p of pair){assert(!resources.has(key(p)));resources.add(key(p));}
    // Generic claim response: if the lower cell is taken by the opponent,
    // the controller can take the upper cell.  The upper event is therefore
    // a certified blocker for any opponent requirement containing it.
    claims.push({resources:pair,guaranteedUpper:pair[1]});
  }
  return{basePairs,claims,resources};
}
function covered(line,program){
  if(program.claims.some(r=>line.cells.some(p=>key(p)===key(r.guaranteedUpper))))return true;
  // Base pair guarantees control of at least one of its two directly playable
  // bottom events, so a requirement containing both cannot be completed.
  return program.basePairs.some(pair=>pair.every(q=>line.cells.some(p=>key(p)===key(q))));
}
function expectedUnresolved(line){
  if(line.dx!==1||line.dy!==0)return false;
  const y=line.cells[0].y;
  // one-based odd rows 3,5,7,...; bottom row is separately covered by base pairs.
  return y>=2 && (y&1)===0;
}

const reports=[];
for(let W=4;W<=20;W++)for(let H=4;H<=16;H++){
  const all=lines(W,H),program=construction(W,H);
  const unresolved=all.filter(l=>!covered(l,program));
  const expected=(W-K+1)*Math.floor((H-1)/2);
  assert.equal(unresolved.length,expected);
  assert(unresolved.every(expectedUnresolved));
  assert(all.filter(expectedUnresolved).every(l=>unresolved.includes(l)));

  // Lower bound: the only individually guaranteed blocker cells in this
  // elementary certificate family are upper cells on one-based even rows;
  // base-pair guarantees apply only to two cells on the bottom row.  Hence no
  // elementary certificate can solve a horizontal requirement wholly contained
  // in one-based odd row >=3.  The explicit construction reaches that bound.
  for(const l of unresolved){
    assert(l.cells.every(p=>(p.y+1)>=3 && ((p.y+1)&1)===1));
    assert(!program.claims.some(r=>l.cells.some(p=>key(p)===key(r.guaranteedUpper))));
    assert(!program.basePairs.some(pair=>pair.every(q=>l.cells.some(p=>key(p)===key(q)))));
  }
  reports.push({W,H,geometric:all.length,covered:all.length-unresolved.length,unresolved:unresolved.length});
}

const standard=reports.find(r=>r.W===7&&r.H===6);
assert.deepEqual(standard,{W:7,H:6,geometric:69,covered:61,unresolved:8});
const standardLines=lines(7,6),standardProgram=construction(7,6);
const standardUnresolved=standardLines.filter(l=>!covered(l,standardProgram));
assert.equal(standardUnresolved.filter(l=>l.cells[0].y===2).length,4);
assert.equal(standardUnresolved.filter(l=>l.cells[0].y===4).length,4);

console.log(`ELEMENTARY_RESPONSE_FRONTIER=${JSON.stringify({
  proved:true,
  theorem:{
    connect:K,
    unresolvedFormula:'(W-3)*floor((H-1)/2)',
    unresolvedMeaning:'horizontal length-4 requirements on one-based odd rows 3,5,7,...',
    construction:'disjoint bottom base-pairs at columns (1,2),(4,5),... plus all compatible even-upper vertical claim pairs',
    lowerBound:'elementary claim blockers occur only on even one-based rows and base-pair control only on the bottom row; therefore odd horizontal rows >=3 cannot be certified by this layer'
  },
  standard,
  standardUnresolved:standardUnresolved.map(l=>l.cells.map(p=>[p.x,p.y])),
  finiteQualification:{W:[4,20],H:[4,16],boards:reports.length},
  proofBoundary:'Exact for this elementary response-certificate vocabulary. It is not a complete Connect4 solve and does not identify the earlier W/D/L-only 61 terminal-line experiment.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);

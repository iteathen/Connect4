import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Total-domain K=4 primitive response-matching theorem unit.
// The certificate predicate never asks whether a board is "small". It generates
// winning requirements plus canonical response programs from the event/support
// structure, then asks whether one compatible mate-response matching hits every
// winning requirement.

const K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const key=([x,y])=>`${x},${y}`;

function generateLines(W,H){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const[dx,dy]of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))out.push(cells);
  }
  return out;
}

// Same generic response-program schema, instantiated from two native pieces of
// the event structure:
//  1. support successors on gravity chains;
//  2. co-playable neighbours on the initial frontier.
// Each returned set is a disjoint matching, so a mate-response policy can
// maintain "opponent never owns both endpoints" independently of move history.
function supportMatching(W,H){
  const out=[];
  for(let x=0;x<W;x++)for(let y=0;y+1<H;y+=2){
    out.push({kind:'support-successor',cells:[[x,y],[x,y+1]]});
  }
  return out;
}
function frontierMatching(W,H){
  const out=[];
  for(let x=0;x+1<W;x+=2){
    out.push({kind:'co-playable-frontier',cells:[[x,0],[x+1,0]]});
  }
  return out;
}
function generatedMatchings(W,H){
  return [supportMatching(W,H),frontierMatching(W,H)];
}

function pairInLine(program,line){
  const s=new Set(line.map(key));
  return program.cells.every(q=>s.has(key(q)));
}
function covers(lines,matching){
  return lines.every(line=>matching.some(program=>pairInLine(program,line)));
}
function lineDirection(line){
  if(line.length<2)return'point';
  const[a,b]=line,dx=b[0]-a[0],dy=b[1]-a[1];
  if(dx===0)return'vertical';
  if(dy===0)return'horizontal';
  return'diagonal';
}

function certificate(W,H){
  assert(Number.isInteger(W)&&W>0&&Number.isInteger(H)&&H>0);
  const lines=generateLines(W,H);
  const matchings=generatedMatchings(W,H);
  const reports=matchings.map(m=>({programCount:m.length,covers:covers(lines,m)}));
  return{
    W,H,
    lineCount:lines.length,
    directions:[...new Set(lines.map(lineDirection))].sort(),
    matchings:reports,
    bilateralDrawCertificate:reports.some(r=>r.covers)
  };
}

const expectedLineCounts=new Map([
  ['1x1',0],['1x4',1],['2x4',2],['3x4',3],['4x1',1],['7x1',4],['7x6',69]
]);
for(const[wh,L]of expectedLineCounts){
  const[W,H]=wh.split('x').map(Number);
  assert.equal(generateLines(W,H).length,L,wh);
}

// Implementation qualification only; unbounded family claims below have
// separate interval proofs and do not infer universality from this sweep.
const reports=[];
for(let W=1;W<=16;W++)for(let H=1;H<=16;H++)reports.push(certificate(W,H));
for(const r of reports.filter(r=>r.W<4))assert.equal(r.bilateralDrawCertificate,true,JSON.stringify(r));
for(const r of reports.filter(r=>r.H===1))assert.equal(r.bilateralDrawCertificate,true,JSON.stringify(r));

// Selectivity controls: the primitive layer must not silently call ordinary
// multidimensional boards draws.
for(const[W,H]of[[4,4],[5,4],[7,6],[8,7]]){
  const r=certificate(W,H);
  assert.equal(r.bilateralDrawCertificate,false,JSON.stringify(r));
}

// Analytic interval lemmas.
// Any four consecutive ranks on a gravity chain contain one even-depth pair.
for(let s=0;s<128;s++){
  const pair=(s&1)?[s+1,s+2]:[s,s+1];
  assert(pair[0]>=s&&pair[1]<=s+3);
  assert.equal(pair[0]&1,0);
  assert.equal(pair[1],pair[0]+1);
}
// Any four consecutive cells on the initial frontier contain one canonical
// adjacent frontier pair (2j,2j+1).
for(let s=0;s<128;s++){
  const left=(s&1)?s+1:s;
  assert(left>=s&&left+1<=s+3);
  assert.equal(left&1,0);
}

console.log(JSON.stringify({
  kind:'connect4-total-domain-primitive-response-matching',
  status:'qualified',
  productionDefinition:'Generate winning requirements and native disjoint mate-response matchings from support successors and the co-playable initial frontier. If one generated matching hits every winning requirement, either player can apply its mate response policy and prevent the opponent from completing any requirement; therefore the finite empty-board value is draw.',
  examples:Object.fromEntries([...expectedLineCounts].map(([wh])=>{
    const[W,H]=wh.split('x').map(Number);
    return[wh,certificate(W,H)];
  })),
  familyTheorems:[
    'Every K=4 board whose generated requirements are confined to gravity chains is draw-certified: every four-event vertical interval contains an even-depth support-successor response pair. In particular every positive W<4 board is covered, including empty-winspace boards.',
    'Every one-row K=4 board is draw-certified by the same response-program schema instantiated on the co-playable frontier: every four-cell horizontal interval contains an adjacent frontier response pair.'
  ],
  implementationQualification:{
    grid:'1<=W,H<=16',
    verticalThinAllCertified:reports.filter(r=>r.W<4).every(r=>r.bilateralDrawCertificate),
    oneRowAllCertified:reports.filter(r=>r.H===1).every(r=>r.bilateralDrawCertificate)
  },
  nontrivialFalsifiers:[[4,4],[5,4],[7,6],[8,7]].map(([W,H])=>certificate(W,H)),
  proofBoundary:'The grid sweep validates the implementation only. The family proofs are analytic interval/mate-response arguments. No recursive game-tree solver, solved label, predefined board class, or terminal count is used by the certificate predicate.',
  attribution:{
    researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',
    formalizationImplementationQualification:'OpenAI ChatGPT'
  }
},null,2));

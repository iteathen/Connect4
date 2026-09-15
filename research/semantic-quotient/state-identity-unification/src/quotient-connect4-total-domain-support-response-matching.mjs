import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Total-domain K=4 response-matching theorem unit.
// The production certificate does not branch on board size. It generates the
// winning requirements and one canonical response matching from the gravity
// support DAG, then asks whether every requirement contains a matched pair.

const K = 4;
const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
const key = ([x,y]) => `${x},${y}`;

function generateLines(W,H){
  const out=[];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) for(const [dx,dy] of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H)) out.push(cells);
  }
  return out;
}

// Pair consecutive events along every gravity chain at even support depth.
// These are ordinary mate-response pairs: if the opponent ever obtains the
// lower cell while the pair is still unresolved, the upper cell is the legal
// immediate response; if the opponent reaches the upper cell first, the lower
// cell was necessarily occupied already, so the pair is already resolved.
function supportResponseMatching(W,H){
  const pairs=[];
  for(let x=0;x<W;x++) for(let y=0;y+1<H;y+=2){
    pairs.push([[x,y],[x,y+1]]);
  }
  return pairs;
}

function pairInLine(pair,line){
  const s=new Set(line.map(key));
  return pair.every(q=>s.has(key(q)));
}
function cover(lines,pairs){
  return lines.every(line=>pairs.some(pair=>pairInLine(pair,line)));
}
function lineDirection(line){
  if(line.length<2) return 'point';
  const [a,b]=line;
  const dx=b[0]-a[0],dy=b[1]-a[1];
  if(dx===0) return 'vertical';
  if(dy===0) return 'horizontal';
  return 'diagonal';
}

// Structural certificate predicate. No W/H cases occur here.
function certificate(W,H){
  assert(Number.isInteger(W)&&W>0&&Number.isInteger(H)&&H>0);
  const lines=generateLines(W,H);
  const pairs=supportResponseMatching(W,H);
  return {
    W,H,
    lineCount:lines.length,
    pairCount:pairs.length,
    covered:cover(lines,pairs),
    directions:[...new Set(lines.map(lineDirection))].sort()
  };
}

const expectedExamples = new Map([
  ['1x1',0],['1x4',1],['2x4',2],['3x4',3],['7x6',69]
]);
for(const [wh,L] of expectedExamples){
  const [W,H]=wh.split('x').map(Number);
  assert.equal(generateLines(W,H).length,L,wh);
}

// Finite implementation qualification only. The family theorem below is
// analytic and does not infer unbounded validity from this sweep.
const reports=[];
for(let W=1;W<=8;W++) for(let H=1;H<=16;H++) reports.push(certificate(W,H));
for(const r of reports.filter(r=>r.W<4)) assert.equal(r.covered,true,JSON.stringify(r));

// Ensure the certificate is selective rather than an accidental all-board draw test.
for(const [W,H] of [[4,4],[5,4],[7,6],[8,7]]){
  const r=certificate(W,H);
  assert.equal(r.covered,false,JSON.stringify(r));
}

// Analytic family lemma encoded as arithmetic assertions: every interval of
// four consecutive support ranks contains one canonical even-depth pair.
for(let s=0;s<128;s++){
  const pair=(s&1)?[s+1,s+2]:[s,s+1];
  assert(pair[0]>=s && pair[1]<=s+3);
  assert.equal(pair[0]&1,0);
  assert.equal(pair[1],pair[0]+1);
}

console.log(JSON.stringify({
  kind:'connect4-total-domain-support-response-matching',
  status:'qualified',
  productionDefinition:'Generate K=4 winning requirements and the even-depth support-chain response matching; if every requirement contains a response pair, the same mate-response invariant gives either player a no-loss strategy, hence the empty-board value is draw.',
  examples:Object.fromEntries([...expectedExamples].map(([wh])=>{
    const [W,H]=wh.split('x').map(Number);
    return [wh,certificate(W,H)];
  })),
  thinSweep:{
    tested:reports.filter(r=>r.W<4).length,
    allCovered:reports.filter(r=>r.W<4).every(r=>r.covered)
  },
  nontrivialFalsifiers:[[4,4],[5,4],[7,6],[8,7]].map(([W,H])=>certificate(W,H)),
  theorem:'If every generated winning requirement contains one pair from the canonical support response matching, either player can maintain the invariant that the opponent never owns both endpoints of any pair. Therefore the opponent cannot complete a requirement. The same certificate is available to both players, so the finite empty-board game is a draw.',
  familyCorollary:'For K=4, every W<4 board satisfies the theorem: horizontal and diagonal requirements cannot be generated, and every generated vertical length-4 interval contains an even-depth support pair. Empty winspace is covered vacuously.',
  proofBoundary:'The finite sweep is implementation qualification only. No board-size branch appears in the production certificate predicate, and recursive game-tree solving is not used.',
  attribution:{
    researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',
    formalizationImplementationQualification:'OpenAI ChatGPT'
  }
},null,2));

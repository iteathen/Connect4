import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  reflectCpcxColumn,
  reflectCpcxCell,
  reflectCpcxOrientation,
  reflectCpcxPosition,
  canonicalizeCpcxExactReflection,
  projectCpcxControlState,
} from './cpcx-control-quotient.mjs';

const g=createCpcxGeometry();

function reflectedSequence(sequence){
  return [...sequence].map(ch=>String(8-Number(ch))).join('');
}

function obligationKey(o,{reflect=false}={}){
  const cells=o.missingCells
    .map(cell=>reflect?reflectCpcxCell(g,cell):cell)
    .sort((a,b)=>a-b);
  const orientation=reflect
    ?reflectCpcxOrientation(o.orientation)
    :o.orientation;
  const support=o.events
    .map(e=>({
      cell:reflect?reflectCpcxCell(g,e.cell):e.cell,
      distance:e.supportDistance,
      eventRank:e.eventRank,
      owner:e.zeroReservationOwner,
    }))
    .sort((a,b)=>a.cell-b.cell);
  return JSON.stringify({
    player:o.player,
    orientation,
    missingCount:o.missingCount,
    cells,
    support,
  });
}

test('horizontal reflection maps exact CPCX positions to one canonical class',()=>{
  for(const sequence of [
    '',
    '4',
    '443',
    '44444',
    '475447511352',
    '32612636',
  ]){
    const p=buildCpcxPosition(sequence,{geometry:g}),
      q=buildCpcxPosition(reflectedSequence(sequence),{geometry:g}),
      reflected=reflectCpcxPosition(p),
      cp=canonicalizeCpcxExactReflection(p),
      cq=canonicalizeCpcxExactReflection(q);
    assert.deepEqual(Array.from(reflected.heights),Array.from(q.heights),sequence);
    assert.deepEqual(Array.from(reflected.owner),Array.from(q.owner),sequence);
    assert.equal(reflected.mover,q.mover,sequence);
    assert.equal(reflected.rank,q.rank,sequence);
    assert.equal(reflected.terminal?.player??null,q.terminal?.player??null,sequence);
    assert.equal(cp.key,cq.key,sequence);
    assert.equal(cp.exact,true,sequence);
    assert.equal(cq.exact,true,sequence);
  }
});

test('reflection preserves the complete live obligation basis with ancestry geometry',()=>{
  for(const sequence of ['443','44444','475447511352','32612636']){
    const p=buildCpcxPosition(sequence,{geometry:g}),
      q=reflectCpcxPosition(p),
      direct=scanCpcxObligations(p)
        .map(o=>obligationKey(o,{reflect:true}))
        .sort(),
      reflected=scanCpcxObligations(q)
        .map(o=>obligationKey(o))
        .sort();
    assert.deepEqual(direct,reflected,sequence);
  }
});

test('reflection is transition compatible for every current legal event',()=>{
  for(const sequence of ['443','44444','32612636']){
    const p=buildCpcxPosition(sequence,{geometry:g}),
      q=reflectCpcxPosition(p);
    for(let column=0;column<g.columns;column++){
      const row=p.heights[column];
      if(row>=g.rows)continue;
      const cell=row*g.columns+column,
        reflectedCell=reflectCpcxCell(g,cell),
        a=applyCpcxForcedEvent(p,cell),
        b=applyCpcxForcedEvent(q,reflectedCell),
        ca=canonicalizeCpcxExactReflection(a),
        cb=canonicalizeCpcxExactReflection(b);
      assert.equal(ca.key,cb.key,sequence+' c'+(column+1));
      assert.equal(a.terminal?.player??null,b.terminal?.player??null,sequence);
    }
  }
});

test('reflection preserves immediate first-win/normalization classification',()=>{
  for(const sequence of ['443','112233','44444','32612636']){
    const p=buildCpcxPosition(sequence,{geometry:g}),
      q=reflectCpcxPosition(p),
      a=classifyCpcxImmediate(p),
      b=classifyCpcxImmediate(q);
    assert.equal(a.kind,b.kind,sequence);
    if(Number.isInteger(a.cell))
      assert.equal(reflectCpcxCell(g,a.cell),b.cell,sequence);
    if(Array.isArray(a.threatCells))
      assert.deepEqual(
        a.threatCells.map(x=>reflectCpcxCell(g,x)).sort((x,y)=>x-y),
        [...b.threatCells].sort((x,y)=>x-y),
        sequence,
      );
  }
});

test('lossy control projection declares its erased information and is never authoritative',()=>{
  const p=buildCpcxPosition('444441',{geometry:g}),
    x=projectCpcxControlState(p,{attacker:0});
  assert.equal(x.proofStatus,'DISCOVERY_ONLY_NOT_A_CONGRUENCE');
  assert.ok(x.erasedInformation.includes('winning-line ancestry identifiers'));
  assert.ok(x.erasedInformation.includes('exact residual cell attachment graph'));
  assert.match(x.boundary,/no certificate transport/i);
});

test('control quotient implementation is generic and isolated from solved/search machinery',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-control-quotient.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "'44444'",
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'opening book',
    'lossDepth',
    'remoteness',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
  assert.match(source,/exact horizontal reflection/i);
  assert.match(source,/NOT an equivalence proof/);
});

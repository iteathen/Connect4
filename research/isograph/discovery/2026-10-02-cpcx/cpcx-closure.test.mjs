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
  closeCpcxForcedResponses,
  projectCpcxObligation,
  listCpcxMultiPieceProjectionCandidates,
  findCpcxSynchronizedProjectionLadders,
  findCpcxDisjointSynchronizedFamilies,
  buildCpcxBoundaryOperators,
  createCpcxParitySystem,
  certifyCpcxObligation,
  solveCpcxResponseCapacity,
  immediateCpcxCapacityCertificate,
} from './cpcx-closure.mjs';

const g=createCpcxGeometry();

test('single current opponent obligation produces one exact forced response',()=>{
  const p=buildCpcxPosition('111111223',{geometry:g});
  const r=classifyCpcxImmediate(p);
  assert.equal(r.kind,'FORCED_RESPONSE');
  assert.equal(r.exact,true);
  assert.equal(r.cell,3); // D1
  const child=applyCpcxForcedEvent(p,r.cell);
  assert.equal(child.rank,p.rank+1);
  assert.equal(child.owner[3],p.mover);
});

test('two distinct current opponent obligations are exact one-slot overload',()=>{
  const p=buildCpcxPosition('111131415',{geometry:g});
  const r=classifyCpcxImmediate(p);
  assert.equal(r.kind,'FORCED_LOSS_OVERLOAD');
  assert.deepEqual(r.threatCells,[1,5]);
  assert.equal(r.responseSlots,1);
  assert.equal(r.deficit,1);

  const cap=immediateCpcxCapacityCertificate(p);
  assert.equal(cap.kind,'IMMEDIATE_CAPACITY_DEFICIENCY');
  assert.equal(cap.matching.perfect,false);
  assert.equal(cap.matching.matchingSize,1);
  assert.equal(cap.matching.hallWitness.demandCount,2);
  assert.equal(cap.matching.hallWitness.resourceCount,1);
  assert.equal(cap.matching.hallWitness.deficiency,1);
});

test('forced-response closure follows only deterministic exact transit',()=>{
  const p=buildCpcxPosition('111111223',{geometry:g});
  const r=closeCpcxForcedResponses(p);
  assert.equal(r.choiceEnumeration,false);
  assert.ok(r.steps.length>=1);
  assert.equal(r.steps[0].cell,3);
  assert.equal(r.steps[0].reason,'FORCED_SINGLETON_RESPONSE');
});

test('44444 multi-piece projection finds synchronized owner-aligned triples but does not certify them',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const obs=scanCpcxObligations(p);
  const byLabel=new Map(obs.filter(o=>o.player===0).map(o=>[o.lineLabel,o]));
  const bottom=projectCpcxObligation(byLabel.get('D1-E1-F1-G1'));
  const row3=projectCpcxObligation(byLabel.get('D3-E3-F3-G3'));
  const diag=projectCpcxObligation(byLabel.get('D5-E4-F3-G2'));

  assert.equal(bottom.controlClass,'ALL_PROJECTED_TO_OWNER');
  assert.equal(bottom.synchronizedEventRank,32);
  assert.equal(bottom.synchronizedSupportDistance,0);
  assert.equal(bottom.exactCompletionClaim,false);

  assert.equal(row3.controlClass,'ALL_PROJECTED_TO_OWNER');
  assert.equal(row3.synchronizedEventRank,34);
  assert.equal(row3.synchronizedSupportDistance,2);
  assert.equal(row3.exactCompletionClaim,false);

  assert.equal(diag.controlClass,'MIXED_PROJECTED_OWNERSHIP');

  const candidates=listCpcxMultiPieceProjectionCandidates(obs);
  assert.ok(candidates.some(x=>x.obligationId===bottom.obligationId));
  assert.ok(candidates.every(x=>x.exactCompletionClaim===false));
});

test('44444 exposes synchronized three-piece projection ladders at rows 1, 3 and 5',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const ladders=findCpcxSynchronizedProjectionLadders(scanCpcxObligations(p))
    .filter(x=>x.player===0&&x.orientation==='H'&&x.missingCount===3);
  assert.equal(ladders.length,12);
  const bySupport=new Map();
  for(const x of ladders)bySupport.set(x.supportDistance,(bySupport.get(x.supportDistance)??0)+1);
  assert.deepEqual([...bySupport.entries()].sort((a,b)=>a[0]-b[0]),[[0,4],[2,4],[4,4]]);
  assert.ok(ladders.every(x=>x.exact===false));
  assert.ok(ladders.every(x=>x.contractionLevels.join(',')==='3,2,1,0'));
});

test('44444 has disjoint three-level wing families, so one entire wing survives any sixth move',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const pairs=findCpcxDisjointSynchronizedFamilies(scanCpcxObligations(p),{minLevels:3})
    .filter(x=>x.player===0&&x.orientation==='H'&&x.missingCount===3);
  assert.ok(pairs.length>=1);
  const wing=pairs.find(x=>
    x.familyA.columns.join(',')==='0,1,2'&&x.familyB.columns.join(',')==='4,5,6'||
    x.familyB.columns.join(',')==='0,1,2'&&x.familyA.columns.join(',')==='4,5,6'
  );
  assert.ok(wing);
  assert.equal(wing.exactSurvival,true);
  assert.equal(wing.survivesAnySingleAction,true);
  assert.equal(wing.exactForcing,false);
  assert.deepEqual(wing.familyA.levels.map(x=>x.supportDistance),[0,2,4]);
  assert.deepEqual(wing.familyB.levels.map(x=>x.supportDistance),[0,2,4]);
});

test('column-boundary operator derives odd center defect instead of naming a phase',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const ops=buildCpcxBoundaryOperators(p);
  assert.equal(ops[3].remaining,1);
  assert.equal(ops[3].neutralPairCount,0);
  assert.equal(ops[3].unmatchedTopDefect,1);
  assert.equal(ops[3].unmatchedEventOffset,1);
  assert.equal(ops[3].class,'ODD_REMAINDER_BOUNDARY');
  for(const c of [0,1,2,4,5,6]){
    assert.equal(ops[c].remaining,6);
    assert.equal(ops[c].neutralPairCount,3);
    assert.equal(ops[c].unmatchedTopDefect,0);
    assert.equal(ops[c].class,'EVEN_REMAINDER_BOUNDARY');
  }
});

test('parity system closes exact same-owner facts and can certify a guarded three-piece completion',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const o=scanCpcxObligations(p)
    .find(x=>x.player===0&&x.lineLabel==='D1-E1-F1-G1');
  const [e1,f1,g1]=o.missingCells;
  const parity=createCpcxParitySystem(g.cellCount);
  assert.equal(parity.setOwner(e1,0),true);
  assert.equal(parity.addXor(e1,f1,0),true);
  assert.equal(parity.addXor(f1,g1,0),true);
  assert.equal(parity.queryOwner(e1),0);
  assert.equal(parity.queryOwner(f1),0);
  assert.equal(parity.queryOwner(g1),0);

  const cert=certifyCpcxObligation(o,{
    parity,
    admissibleCells:new Set(o.missingCells),
    beforeDeadlineCells:new Set(o.missingCells),
  });
  assert.equal(cert.kind,'CERTIFIED_COMPLETION');
  assert.equal(cert.exact,true);
  assert.equal(cert.missingCount,3);
});

test('parity ownership alone cannot bypass admissibility or deadline guards',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const o=scanCpcxObligations(p)
    .find(x=>x.player===0&&x.lineLabel==='D1-E1-F1-G1');
  const parity=createCpcxParitySystem(g.cellCount);
  for(const cell of o.missingCells)parity.setOwner(cell,0);

  const noAdmissibility=certifyCpcxObligation(o,{
    parity,
    admissibleCells:new Set(o.missingCells.slice(0,2)),
    beforeDeadlineCells:new Set(o.missingCells),
  });
  assert.equal(noAdmissibility.kind,'UNRESOLVED_ADMISSIBILITY');
  assert.equal(noAdmissibility.exact,false);

  const noDeadline=certifyCpcxObligation(o,{
    parity,
    admissibleCells:new Set(o.missingCells),
    beforeDeadlineCells:new Set(o.missingCells.slice(0,2)),
  });
  assert.equal(noDeadline.kind,'UNRESOLVED_DEADLINE');
  assert.equal(noDeadline.exact,false);
});

test('certified opposite owner kills a multi-piece obligation',()=>{
  const p=buildCpcxPosition('44444',{geometry:g});
  const o=scanCpcxObligations(p)
    .find(x=>x.player===0&&x.lineLabel==='D1-E1-F1-G1');
  const parity=createCpcxParitySystem(g.cellCount);
  parity.setOwner(o.missingCells[0],1);
  const cert=certifyCpcxObligation(o,{parity});
  assert.equal(cert.kind,'CERTIFIED_KILLED');
  assert.equal(cert.exact,true);
});

test('contradictory parity facts fail closed',()=>{
  const parity=createCpcxParitySystem(g.cellCount);
  assert.equal(parity.setOwner(0,0),true);
  assert.equal(parity.setOwner(0,1),false);
  assert.equal(parity.consistent,false);
  assert.ok(parity.contradiction);
});

test('generic response-capacity matcher returns explicit Hall witness',()=>{
  const r=solveCpcxResponseCapacity({
    demands:['a','b','c'],
    resources:['x','y'],
    edges:[['a','x'],['b','x'],['b','y'],['c','y']],
  });
  assert.equal(r.perfect,false);
  assert.equal(r.matchingSize,2);
  assert.ok(r.hallWitness);
  assert.ok(r.hallWitness.deficiency>0);
  assert.ok(r.hallWitness.demandCount>r.hallWitness.resourceCount);
});

test('generic response-capacity matcher recognizes sufficient independent resources',()=>{
  const r=solveCpcxResponseCapacity({
    demands:['a','b','c'],
    resources:['x','y','z'],
    edges:[['a','x'],['b','y'],['c','z']],
  });
  assert.equal(r.perfect,true);
  assert.equal(r.matchingSize,3);
  assert.equal(r.hallWitness,null);
});

test('closure source stays isolated from production CPC and solved-data consumers',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-closure.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    'cpc-connect4',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});

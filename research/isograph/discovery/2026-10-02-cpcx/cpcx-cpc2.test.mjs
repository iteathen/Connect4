import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition,scanCpcxObligations} from './cpcx.mjs';
import {
  findCpcxCpc2TriggerTemplates,
  deriveCpcxDisjunctiveBlockObligation,
  collapseCpcxDisjunctiveBlockObligation,
} from './cpcx-cpc2.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry();
const A1=0,B1=1,E1=4,F1=5;

function templateAt(templates,cell){
  const row=templates.find(x=>x.triggerCell===cell);
  assert.ok(row,`missing trigger template ${cell}`);
  return row;
}

test('443 exposes the expected live P0 two-piece residuals',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    rows=scanCpcxObligations(p)
      .filter(x=>x.player===0&&x.missingCount===2)
      .map(x=>x.lineLabel);
  for(const line of [
    'A1-B1-C1-D1',
    'B1-C1-D1-E1',
    'C1-D1-E1-F1',
  ])assert.ok(rows.includes(line),line);
});

test('443 B1 is mechanically identified as a forward CPC2 trigger',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    t=templateAt(findCpcxCpc2TriggerTemplates(p,{attacker:0}),B1);
  assert.equal(t.exact,true);
  assert.equal(t.forkProducing,true);
  assert.deepEqual(t.bornSingletonCells,[A1,E1]);
  assert.deepEqual(t.playableSingletonCells,[A1,E1]);
  assert.equal(t.sourceTwoPieceResiduals.length,2);
  assert.equal(t.capacity.demandCount,2);
  assert.equal(t.capacity.responseCapacity,1);
  assert.equal(t.capacity.matching.perfect,false);
  assert.equal(t.capacity.matching.hallWitness.deficiency,1);
});

test('443 E1 is mechanically identified as a forward CPC2 trigger',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    t=templateAt(findCpcxCpc2TriggerTemplates(p,{attacker:0}),E1);
  assert.equal(t.exact,true);
  assert.equal(t.forkProducing,true);
  assert.deepEqual(t.bornSingletonCells,[B1,F1]);
  assert.deepEqual(t.playableSingletonCells,[B1,F1]);
  assert.equal(t.sourceTwoPieceResiduals.length,2);
  assert.equal(t.capacity.demandCount,2);
  assert.equal(t.capacity.responseCapacity,1);
  assert.equal(t.capacity.matching.perfect,false);
});

test('443 derives the exact disjunctive current blocking obligation B1 OR E1',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    o=deriveCpcxDisjunctiveBlockObligation(p,{attacker:0});
  assert.equal(o.kind,'DISJUNCTIVE_BLOCK_OBLIGATION');
  assert.equal(o.exact,true);
  assert.equal(o.obligatedPlayer,1);
  assert.equal(o.attacker,0);
  assert.deepEqual(o.blockingCells,[B1,E1]);
  assert.deepEqual(o.blockingLabels,['B1','E1']);
  assert.equal(o.responseCapacity,1);
  assert.equal(o.rankDeltaSemantics.delta,1);
  assert.equal(o.rankDeltaSemantics.nextMover,0);
  assert.equal(o.firstWinGuard.allOutsideFrontierMovesCertified,true);
  assert.equal(o.childBoardConstruction,false);
  assert.equal(o.recursive,false);
});

test('443 blocker cells suppress every trigger, including indirect singleton suppression',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    o=deriveCpcxDisjunctiveBlockObligation(p,{attacker:0});
  for(const blocker of [B1,E1]){
    const audit=o.frontierAudit.find(x=>x.defenderCell===blocker);
    assert.ok(audit);
    assert.equal(audit.allSuppressed,true);
    assert.equal(audit.rows.length,2);
    assert.ok(audit.rows.some(x=>x.reason==='DIRECT_TRIGGER_OCCUPATION'));
    assert.ok(audit.rows.some(x=>x.reason==='COFACTOR_CAPACITY_REDUCTION'));
  }
});

test('every current 443 move outside B1/E1 leaves a certified first-win trigger overload',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    o=deriveCpcxDisjunctiveBlockObligation(p,{attacker:0}),
    blockers=new Set(o.blockingCells);
  for(const audit of o.frontierAudit){
    if(blockers.has(audit.defenderCell))continue;
    assert.equal(audit.allSuppressed,false);
    assert.ok(audit.rows.some(x=>
      x.kind==='CERTIFIED_TRIGGER_OVERLOAD'||x.kind==='CERTIFIED_TRIGGER_FIRST_WIN'
    ));
  }
  assert.equal(o.outsideMoveCertificates.length,o.frontierAudit.length-o.blockingCells.length);
});

test('443 disjunctive alternatives collapse without concrete child-board branching',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    o=deriveCpcxDisjunctiveBlockObligation(p,{attacker:0}),
    s=collapseCpcxDisjunctiveBlockObligation(p,o);
  assert.equal(s.kind,'ABSTRACT_SUCCESSOR');
  assert.equal(s.exact,true);
  assert.equal(s.nextMover,0);
  assert.deepEqual(s.rank.deltaOptions,[1]);
  assert.deepEqual(s.rank.options,[4]);
  assert.equal(s.blockerTokens.length,1);
  assert.equal(s.blockerTokens[0].kind,'EXACTLY_ONE_OF');
  assert.equal(s.blockerTokens[0].owner,1);
  assert.equal(s.blockerTokens[0].exactCount,1);
  assert.deepEqual(s.blockerTokens[0].candidateCells,[B1,E1]);
  assert.deepEqual(s.oneOfOwnershipFact,{owner:1,exactlyOneOf:[B1,E1]});
  assert.deepEqual(s.singletonEnvelope.possibleAttackerCells,[]);
  assert.deepEqual(s.singletonEnvelope.possibleDefenderCells,[]);
  assert.equal(s.firstWinFacts.nextImmediateNormalizationClosed,true);
  assert.equal(s.choiceEnumeration,false);
  assert.equal(s.childBoardConstruction,false);
  assert.equal(s.recursive,false);
});

test('CPC2 is generic: an unrelated legal position can derive a different exact blocking set',()=>{
  const p=buildCpcxPosition('2273251243',{geometry:g}),
    o=deriveCpcxDisjunctiveBlockObligation(p,{attacker:p.mover^1});
  assert.equal(o.kind,'DISJUNCTIVE_BLOCK_OBLIGATION');
  assert.equal(o.exact,true);
  assert.deepEqual(o.blockingLabels,['D2']);
});

test('geometric two-singleton cofactor is rejected when resulting completions are not actionable',()=>{
  const p=buildCpcxPosition('44455337312',{geometry:g}),
    templates=findCpcxCpc2TriggerTemplates(p,{attacker:0}),
    row=templates.find(x=>x.bornSingletonCells.length>=2&&x.playableSingletonCells.length<2);
  assert.ok(row);
  assert.equal(row.forkProducing,false);
  assert.ok(row.bornSingletonCells.length>=2);
  assert.ok(row.playableSingletonCells.length<2);
});

test('same-column support lift is accounted for algebraically after the trigger',()=>{
  const p=buildCpcxPosition('74343',{geometry:g}),
    row=findCpcxCpc2TriggerTemplates(p,{attacker:0})
      .find(x=>x.triggerLabel==='C3');
  assert.ok(row);
  assert.ok(row.bornSingletonCells.includes(23)); // C4
  assert.ok(row.playableSingletonCells.includes(23));
  assert.equal(row.forkProducing,false);
});

test('overlapping singleton sets remain cell-set demands rather than duplicated line demands',()=>{
  const p=buildCpcxPosition('44564357767',{geometry:g}),
    forks=findCpcxCpc2TriggerTemplates(p,{attacker:0}).filter(x=>x.forkProducing);
  let pair=null;
  for(let i=0;i<forks.length;i++)for(let j=i+1;j<forks.length;j++){
    const overlap=forks[i].playableSingletonCells.filter(x=>forks[j].playableSingletonCells.includes(x));
    if(overlap.length){pair={a:forks[i],b:forks[j],overlap};break;}
  }
  assert.ok(pair);
  assert.ok(pair.overlap.length>=1);
  assert.equal(pair.a.capacity.demandCount,new Set(pair.a.playableSingletonCells).size);
  assert.equal(pair.b.capacity.demandCount,new Set(pair.b.playableSingletonCells).size);
});

test('defender counterterminal falsifier fails closed instead of promoting a false obligation',()=>{
  const p=buildCpcxPosition('77512755757',{geometry:g}),
    o=deriveCpcxDisjunctiveBlockObligation(p,{attacker:0});
  assert.equal(o.kind,'NO_CERTIFICATE');
  assert.equal(o.exact,false);
  assert.equal(o.seam,'CPC2_FIRST_WIN_GUARD_UNRESOLVED');
  assert.ok(o.unresolvedMoves.some(m=>m.unresolved.some(x=>
    x.reason==='DEFENDER_COUNTERTERMINAL_AVAILABLE'
  )));
  assert.equal(Object.prototype.hasOwnProperty.call(o,'draw'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(o,'value'),false);
});

test('443 progress emits the first-class disjunctive blocker obligation',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    progress=classifyCpcxProgress(p,{player:0});
  assert.equal(progress.kind,'DISJUNCTIVE_BLOCK_OBLIGATION');
  assert.equal(progress.exact,true);
  assert.equal(progress.player,0);
  assert.equal(progress.obligatedPlayer,1);
  assert.deepEqual(progress.obligation.blockingLabels,['B1','E1']);
});

test('443 certificate iteration collapses the blocker set and stops at the later abstract seam',()=>{
  const p=buildCpcxPosition('443',{geometry:g}),
    result=runCpcxFirstWinCertificate(p,{attacker:0});
  assert.equal(result.kind,'NO_CERTIFICATE');
  assert.equal(result.exact,false);
  assert.equal(result.seam,'NO_EXACT_ABSTRACT_MACRO');
  assert.equal(result.trace[0].progress.kind,'DISJUNCTIVE_BLOCK_OBLIGATION');
  assert.equal(result.trace[0].progress.exact,true);
  assert.equal(result.trace[1].progress.kind,'NO_CERTIFICATE');
  assert.equal(Object.prototype.hasOwnProperty.call(result,'draw'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(result,'value'),false);
});

test('CPC2 source contains no 443 special case, child-board constructor, recursion, solved data, or production CPC import',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-cpc2.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "'443'",
    'buildCpcxPosition(',
    'applyCpcxForcedEvent(',
    'verifyCpcxFixedEventScript(',
    'cpc-connect4',
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});

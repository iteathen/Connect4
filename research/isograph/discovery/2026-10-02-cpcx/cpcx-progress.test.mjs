import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {
  findCpcxPlayablePairHubs,
  certifyCpcxPlayablePairHub,
  findAndCertifyCpcxPairHubForks,
} from './cpcx-fork.mjs';
import {
  findCpcxPlayableTwoPieceDemands,
  certifyEitherCpcxPlayableTwoPiece,
} from './cpcx-two-piece.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';

const g=createCpcxGeometry();

test('pair-hub fork certifies two distinct playable singleton obligations',()=>{
  const p=buildCpcxPosition('444441515115',{geometry:g}),
    forks=findAndCertifyCpcxPairHubForks(p,{player:0});
  assert.ok(forks.length>=1);
  for(const {certificate} of forks){
    assert.equal(certificate.kind,'CERTIFIED_PAIR_HUB_FORK');
    assert.equal(certificate.exact,true);
    assert.ok(certificate.singletonCells.length>=2);
    assert.equal(certificate.responseSlots,1);
    assert.ok(certificate.deficiency>=1);
    assert.equal(certificate.choiceEnumeration,false);
  }
});

test('playable two-piece macro forces the second endpoint and returns the turn',()=>{
  const p=buildCpcxPosition('44444151511355',{geometry:g}),
    demands=findCpcxPlayableTwoPieceDemands(p,{player:0});
  assert.ok(demands.length>=1);
  const row=demands.find(d=>d.obligation.lineLabel==='D1-E1-F1-G1')??demands[0],
    cert=certifyEitherCpcxPlayableTwoPiece(p,row);
  assert.equal(cert.kind,'PLAYABLE_TWO_PIECE_MACRO_AVAILABLE');
  assert.equal(cert.exact,true);
  assert.equal(cert.selected.kind,'FORCED_TWO_PIECE_RESPONSE');
  assert.equal(cert.selected.rankDelta,2);
  assert.equal(cert.selected.nextMover,0);
  assert.equal(cert.selected.controlParityDelta,0);
  assert.equal(cert.selected.choiceEnumeration,false);
});

test('progress classifier reports exact terminal fork before nonterminal macros',()=>{
  const p=buildCpcxPosition('444441515115',{geometry:g}),
    c=classifyCpcxProgress(p);
  assert.equal(c.kind,'CERTIFIED_PAIR_HUB_FORKS');
  assert.equal(c.exact,true);
  assert.equal(c.terminalForcing,true);
});

test('progress classifier reports exact two-piece macro when no fork exists',()=>{
  const p=buildCpcxPosition('44444151511355',{geometry:g}),
    c=classifyCpcxProgress(p);
  assert.equal(c.kind,'CERTIFIED_PROGRESS_MACROS');
  assert.equal(c.exact,true);
  assert.equal(c.terminalForcing,false);
  assert.ok(c.twoPiece.length>=1);
  assert.equal(c.selectionAuthorized,false);
});

test('hard move-3 residual state fails closed rather than selecting a move',()=>{
  const p=buildCpcxPosition('44444353533655',{geometry:g}),
    c=classifyCpcxProgress(p);
  assert.equal(c.kind,'UNRESOLVED');
  assert.equal(c.exact,false);
  assert.equal(c.terminalForcing,false);
});

test('three-piece contraction child remains projection-only when exact guards are absent',()=>{
  const p=buildCpcxPosition('444443535336553',{geometry:g}),
    c=classifyCpcxProgress(p);
  assert.equal(c.kind,'PROJECTION_ONLY');
  assert.equal(c.exact,false);
  assert.ok(c.projections.length>=1);
});

test('fork and two-piece modules remain isolated from solved data and production CPC',async()=>{
  const {readFile}=await import('node:fs/promises');
  for(const file of ['./cpcx-fork.mjs','./cpcx-two-piece.mjs','./cpcx-progress.mjs']){
    const source=await readFile(new URL(file,import.meta.url),'utf8');
    for(const forbidden of ['cpc-connect4','ExactConnect4Oracle','components/oracle','solveSequence('])
      assert.equal(source.includes(forbidden),false,file+' '+forbidden);
  }
});

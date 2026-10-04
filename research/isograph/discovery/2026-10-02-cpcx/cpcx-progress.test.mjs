import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {
  findAndCertifyCpcxPairHubForks,
} from './cpcx-fork.mjs';
import {
  findCpcxPlayableTwoPieceDemands,
  certifyEitherCpcxPlayableTwoPiece,
} from './cpcx-two-piece.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';

const g=createCpcxGeometry();

test('immediate current-player terminal becomes one-sided first-win certificate',()=>{
  const p=buildCpcxPosition('172736',{geometry:g}),
    c=classifyCpcxProgress(p);
  assert.equal(p.mover,0);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.player,0);
  assert.equal(c.source,'IMMEDIATE_TERMINAL');
  assert.equal(c.exact,true);
});

test('opponent double-singleton overload certifies opponent first win',()=>{
  const p=buildCpcxPosition('111131415',{geometry:g}),
    c=classifyCpcxProgress(p);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.player,0);
  assert.equal(c.source,'OPPONENT_SINGLETON_OVERLOAD');
  assert.ok(c.certificate.threatCells.length>=2);
});

test('pair-hub fork certifies attacker first win',()=>{
  const p=buildCpcxPosition('444441515115',{geometry:g}),
    forks=findAndCertifyCpcxPairHubForks(p,{player:0}),
    c=classifyCpcxProgress(p,{player:0});
  assert.ok(forks.length>=1);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.player,0);
  assert.equal(c.source,'PAIR_HUB_FORK');
  assert.equal(c.exact,true);
});


test('latent singleton pair-hub overload is exposed as first-win progress',()=>{
  const g4=createCpcxGeometry({columns:4,rows:4,connect:3}),
    p=buildCpcxPosition('12234',{geometry:g4}),
    c=classifyCpcxProgress(p,{player:0});
  assert.equal(p.mover,1);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.source,'LATENT_SINGLETON_PAIR_HUB_OVERLOAD');
  assert.equal(c.certificate.certificate.recursive,false);
});

test('latent pair-hub forced normalization is exposed as first-win progress',()=>{
  const g5=createCpcxGeometry({columns:5,rows:3,connect:3}),
    p=buildCpcxPosition('1243345',{geometry:g5}),
    c=classifyCpcxProgress(p,{player:0});
  assert.equal(p.mover,1);
  assert.equal(c.kind,'CERTIFIED_FIRST_WIN');
  assert.equal(c.exact,true);
  assert.equal(c.player,0);
  assert.equal(c.source,'LATENT_SINGLETON_PAIR_HUB_FORCED_NORMALIZATION');
  assert.equal(c.certificate.certificate.selfRecursion,false);
});

test('playable two-piece exact macro may be selected without global value equivalence',()=>{
  const p=buildCpcxPosition('44444151511355',{geometry:g}),
    demands=findCpcxPlayableTwoPieceDemands(p,{player:0});
  assert.ok(demands.length>=1);
  const row=demands.find(d=>d.obligation.lineLabel==='D1-E1-F1-G1')??demands[0],
    cert=certifyEitherCpcxPlayableTwoPiece(p,row);
  assert.equal(cert.exact,true);

  const c=classifyCpcxProgress(p,{player:0});
  assert.equal(c.kind,'CERTIFIED_FORCING_MACRO');
  assert.equal(c.exact,true);
  assert.equal(c.selectionAuthorized,true);
  assert.ok(['PLAYABLE_TWO_PIECE','VERTICAL_TWO_STAGE','VERTICAL_THREE_STAGE'].includes(c.macro.kind));
  assert.equal(c.selectionPremise,'local theorem exactness and deterministic structural order only');
});

test('qualified vertical three-stage is exposed as a generic forcing macro',()=>{
  const p=buildCpcxPosition('12',{geometry:g}),
    c=classifyCpcxProgress(p,{player:0});
  assert.equal(c.kind,'CERTIFIED_FORCING_MACRO');
  assert.equal(c.exact,true);
  assert.equal(c.macro.kind,'VERTICAL_THREE_STAGE');
  assert.equal(c.selectionAuthorized,true);
  assert.equal(c.recursive,false);
});

test('hard residual state returns NO_CERTIFICATE, not a game value',()=>{
  const p=buildCpcxPosition('44444353533655',{geometry:g}),
    c=classifyCpcxProgress(p,{player:0});
  assert.equal(c.kind,'NO_CERTIFICATE');
  assert.equal(c.exact,false);
  assert.equal(Object.prototype.hasOwnProperty.call(c,'value'),false);
});

test('three-piece contraction child remains projection-only when exact guards are absent',()=>{
  const p=buildCpcxPosition('444443535336553',{geometry:g}),
    c=classifyCpcxProgress(p,{player:0});
  assert.equal(c.kind,'PROJECTION_ONLY');
  assert.equal(c.exact,false);
  assert.ok(c.projections.length>=1);
});

test('progress contract contains no draw or global value-preservation gate',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-progress.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    'WDL_UNKNOWN',
    "kind:'DRAW'",
    'preserves global W/D/L',
    'selectionAuthorized:false',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});

test('progress modules remain isolated from solved data and production CPC',async()=>{
  const {readFile}=await import('node:fs/promises');
  for(const file of ['./cpcx-fork.mjs','./cpcx-two-piece.mjs','./cpcx-latent-pair-hub.mjs','./cpcx-latent-pair-hub-normalization.mjs','./cpcx-progress.mjs']){
    const source=await readFile(new URL(file,import.meta.url),'utf8');
    for(const forbidden of ['cpc-connect4','ExactConnect4Oracle','components/oracle','solveSequence('])
      assert.equal(source.includes(forbidden),false,file+' '+forbidden);
  }
});

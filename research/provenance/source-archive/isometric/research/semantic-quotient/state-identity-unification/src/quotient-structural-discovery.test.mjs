import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { evaluateBDD, openSolvedBDD } from './quotient-solved-bdd-source.mjs';
import { geometry, empty, replay, play, describe, residuals, cofactor, binarySpan, capacityAllowed } from './quotient-structural-discovery-signature.mjs';

test('source failures never become draw; contradictory labels fail',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'c4-bdd-control-'));
  try {
    await assert.rejects(openSolvedBDD(dir,0));
    const one=Buffer.alloc(9);one.writeUInt32LE(1,1);
    await writeFile(join(dir,'bdd_w7_h6_0_win.10.bin'),one);
    await assert.rejects(openSolvedBDD(dir,0));
    await writeFile(join(dir,'bdd_w7_h6_0_loss.10.bin'),one);
    const source=await openSolvedBDD(dir,0),g=geometry(7,6);
    assert.throws(()=>source.query(g,empty(g)),/contradictory/);
    assert.throws(()=>source.query(geometry(6,7),empty(geometry(6,7))),/geometry/);
    assert.throws(()=>source.query(g,play(g,empty(g),0)),/unavailable/);
    assert.throws(()=>source.query(g,{...empty(g),heights:[0,0,0,0,0,0,-1]}),/support/);
    assert.throws(()=>source.query(g,{...empty(g),owners:Array(42).fill(0)}),/outside support/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('malformed BDD terminals, pointers and cycles fail closed',()=>{
  assert.throws(()=>evaluateBDD(Buffer.alloc(8),0n));
  assert.throws(()=>evaluateBDD(Buffer.alloc(9),-1n));
  const b=Buffer.alloc(9);b.writeUInt32LE(2,1);
  assert.throws(()=>evaluateBDD(b,0n));
  b[0]=1;assert.throws(()=>evaluateBDD(b,0n));
  b.writeUInt32LE(0,1);assert.throws(()=>evaluateBDD(b,0n));
});
test('variable geometry and first-win contract',()=>{
  for(const [w,h] of [[1,1],[1,42],[42,1],[6,7],[7,6],[4,4]]){
    const g=geometry(w,h);
    assert.equal(g.lines.length,h*Math.max(0,w-3)+w*Math.max(0,h-3)+2*Math.max(0,w-3)*Math.max(0,h-3));
  }
  const g=geometry(7,6),s=replay(g,[0,1,0,1,0,1,0]);
  assert.equal(s.terminal,0);assert.throws(()=>play(g,s,2));
  assert.throws(()=>play(g,empty(g),0.5));
});
test('positive residual cofactor preserves domain transition and complement',()=>{
  for(const [w,h] of [[4,4],[7,6],[6,7]]){
    const g=geometry(w,h);let s=empty(g);
    for(let step=0;step<14&&s.terminal===null;step++){
      const R=residuals(g,s);
      for(let c=0;c<w;c++)if(s.heights[c]<h)assert.deepEqual(cofactor(R,step%2,c*h+s.heights[c]),residuals(g,play(g,s,c)));
      const exchanged={...s,owners:s.owners.map(x=>x<0?x:1-x)};
      assert.deepEqual(residuals(g,exchanged),[R[1],R[0]]);
      const legal=s.heights.flatMap((n,c)=>n<h?[c]:[]);s=play(g,s,legal[(step*5+3)%legal.length]);
    }
  }
});
test('same low-order structure hides cubic targets; labels never enter canonicalization',()=>{
  const g=geometry(7,6),a=replay(g,[6,6,1,6,6]),b=replay(g,[1,6,6,6,6]);
  const da=describe(g,a),db=describe(g,b);
  assert.equal(da.signatures.degree2,db.signatures.degree2);
  assert.notEqual(da.signatures.exact,db.signatures.exact);
  assert.notEqual(da.signatures.degree3,db.signatures.degree3);
  assert.notEqual(da.signatures.degree2Jet,db.signatures.degree2Jet);
  assert.deepEqual(describe(g,{...a,solvedValue:1}).signatures,describe(g,{...a,solvedValue:-1}).signatures);
  assert.deepEqual(describe({...g,lines:[...g.lines].reverse()},a).signatures,da.signatures);
});
test('F2 span equality is not positive requirement equality',()=>{
  const g=geometry(7,6),a=describe(g,replay(g,[2,6,6,2])),b=describe(g,replay(g,[6,2,6,2]));
  assert.equal(a.signatures.span,b.signatures.span);assert.notEqual(a.signatures.exact,b.signatures.exact);
  assert.deepEqual(binarySpan([[0,1],[1,2]],3),binarySpan([[0,2],[1,2]],3));
});
test('immediate own completion supersedes defense',()=>{
  const g=geometry(7,6),s=replay(g,[0,1,0,1,0,1]);
  assert.equal(capacityAllowed(g,s).kind,'immediate');
});
test('opposite-owner cubic enabling survives a one-step current-owner jet',()=>{
  const g=geometry(7,6),a=replay(g,[6,6,6,6,2,2]),b=replay(g,[2,6,6,2,6,6]);
  assert.equal(describe(g,a).signatures.degree2Jet,describe(g,b).signatures.degree2Jet);
  assert.notEqual(describe(g,a).signatures.ownerJet,describe(g,b).signatures.ownerJet);
  let differences=0;
  for(let c=0;c<7;c++){
    const ac=play(g,a,c),bc=play(g,b,c);
    assert.equal(describe(g,ac).signatures.degree2,describe(g,bc).signatures.degree2);
    for(let d=0;d<7;d++)if(describe(g,play(g,ac,d)).signatures.degree2!==describe(g,play(g,bc,d)).signatures.degree2)differences++;
  }
  assert.equal(differences,13);
});
test('commuting qualified endpoint orders have one exact structural signature',()=>{
  const g=geometry(7,6),a=replay(g,[3,1,5,2,4,6]),b=replay(g,[3,1,5,6,4,2]);
  assert.deepEqual(a,b);
  assert.deepEqual(describe(g,a).signatures,describe(g,b).signatures);
});

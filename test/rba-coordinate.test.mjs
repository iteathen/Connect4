import test from 'node:test';
import assert from 'node:assert/strict';
import { lines, position, residuals } from './helpers/physical-oracle.mjs';

const moduleURL = new URL('../components/isometric/rba/ingress.mjs', import.meta.url);
test('native RBA coordinate/cofactor API exists', async () => {
  const api = await import(moduleURL.href).catch(() => null);
  assert.ok(api?.fromMoves7x6, 'native RBA legal replay ingress is missing');
});

test('support-local upset matches independent physical residuals through legal play', async () => {
  const {fromMoves7x6, prepareRba7x6} = await import(moduleURL.href);
  const g = prepareRba7x6();
  assert.equal(g.shapeLo.length,625);
  assert.equal(lines().length,69);
  let seed = 73419;
  for (let game = 0; game < 32; game++) {
    const moves=[];
    for (;;) {
      const p=position(moves), r=fromMoves7x6(moves,{geometry:g,canonical:false});
      assert.equal(r.words[0] >>> 21,p.ply);
      assert.equal(r.words[1],p.terminal);
      assert.ok(r.basis.length <= 69);
      if (p.terminal) {
        assert.throws(()=>fromMoves7x6([...moves,0],{geometry:g}),/terminal/);
        break;
      }
      for (let player=0;player<2;player++) {
        const requirements=residuals(p,player);
        for(let i=0;i<r.basis.length;i++) {
          const id=r.basis[i];
          const members=[];
          for(let cell=0;cell<42;cell++) if ((cell<32?g.shapeLo[id] >>> cell:g.shapeHi[id] >>> (cell-32))&1) members.push(cell);
          const expected=requirements.some(a=>a.every(cell=>members.includes(cell)));
          assert.equal(!!(r.words[2+player*3+(i>>>5)] & (1<<(i&31))),expected,`game ${game} ply ${p.ply} player ${player} bit ${i}`);
        }
      }
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const legal=p.heights.map((h,c)=>h<6?c:-1).filter(c=>c>=0);
      moves.push(legal[seed%legal.length]);
    }
  }
});

test('canonical local coordinates commute with reflection and respect first win', async () => {
  const {fromMoves7x6}=await import(moduleURL.href);
  for(const moves of [[],[0],[0,1,0,2,5,3],[0,1,0,1,0,1,0],[3,2,4,2,5]]) {
    const a=fromMoves7x6(moves),b=fromMoves7x6(moves.map(c=>6-c));
    assert.deepEqual(a.words,b.words);
  }
  assert.equal(fromMoves7x6([0,1,0,1,0,1,0]).words[1],3);
  assert.throws(()=>fromMoves7x6([7]),/column/);
  assert.throws(()=>fromMoves7x6([0,0,0,0,0,0,0]),/full/);
  const root=fromMoves7x6([]);
  assert.equal(root.basis.length,69);
  assert.equal(root.words[4],31); // 69-bit domain, not truncated to 64.
  assert.equal(root.words[7],31);
});

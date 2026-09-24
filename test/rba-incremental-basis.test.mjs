import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareRba7x6} from '../components/isometric/rba/prepare.mjs';
import {prepareCoordinateScratch7x6} from '../components/isometric/rba/prepare.mjs';
import {fromMoves7x6} from '../components/isometric/rba/ingress.mjs';
import {prepareFrontArena7x6,buildFour7x6} from '../components/isometric/rba/front.mjs';
import * as c from '../components/isometric/rba/coordinate.mjs';

test('basis cofactor equals geometric derivation for randomized supports and every legal action',()=>{
  assert.equal(typeof c.cofactorBasis7x6,'function');
  const g=prepareRba7x6(),parent=new Uint32Array(69),child=new Uint32Array(69),expected=new Uint32Array(69),seen=new Uint32Array(20);
  let seed=83117;
  for(let trial=0;trial<1000;trial++){
    let meta=0,rank=0;
    for(let col=0;col<7;col++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const h=seed%7;rank+=h;meta|=h<<(col*3);
    }
    meta|=rank<<21;
    const n=c.basis7x6(g,meta,parent,0,seen);
    for(let col=0;col<7;col++){
      const height=(meta>>>(col*3))&7;if(height===6)continue;
      const cn=c.cofactorBasis7x6(g,parent,0,n,height*7+col,child,0,seen);
      const en=c.basis7x6(g,meta+(1<<(col*3))+(1<<21),expected,0,seen);
      assert.equal(cn,en);assert.deepEqual(child.slice(0,cn),expected.slice(0,en));
    }
  }
});

test('cofactor, reflection and fronts run with all geometric line readers poisoned',()=>{
  const g=prepareRba7x6(),moves=[3,4,3,5,0,5,5,6];
  const parent=fromMoves7x6(moves,{geometry:g,canonical:false});
  const expected=Array.from({length:7},(_,col)=>fromMoves7x6([...moves,col],{geometry:g}));
  for(const name of ['lineShift','lineRow','lineShape'])Object.defineProperty(g,name,{get(){throw Error('geometry rescan forbidden');}});
  const scratch=prepareCoordinateScratch7x6(),words=new Uint32Array(8),basis=new Uint32Array(69),sizes=new Uint32Array(1);
  for(let col=0;col<7;col++){
    c.cofactor7x6(g,parent.words,0,parent.basis,0,parent.basis.length,col,words,0,basis,0,scratch.seen,sizes,0);
    c.canonicalize7x6(g,words,0,basis,0,sizes[0],scratch);
    assert.deepEqual(words,expected[col].words);
    assert.deepEqual(basis.slice(0,sizes[0]),expected[col].basis);
  }
  const a=prepareFrontArena7x6();
  assert.equal(buildFour7x6(g,a,parent.words[0],0,2,parent.basis,0,parent.basis.length),0);
});

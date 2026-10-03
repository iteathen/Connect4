import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {
  verifyCpcxQBranchLocalTi,
} from './cpcx-q-branch-ti.mjs';

const g=createCpcxGeometry();

function reflectionWitness(position){
  const p=Array.from({length:g.columns},(_,c)=>g.columns-1-c),
    childTransporters={};
  for(let c=0;c<g.columns;c++)
    if(position.heights[c]<g.rows)childTransporters[String(c)]=p;
  return {actionMap:p,childTransporters};
}

test('branch-local q TI verifier accepts exact horizontal reflection witness',()=>{
  const a=buildCpcxPosition('32612636',{geometry:g}),
    b=buildCpcxPosition('56276252',{geometry:g}),
    r=verifyCpcxQBranchLocalTi(a,b,reflectionWitness(a));
  assert.equal(r.kind,'CERTIFIED_Q_FUTURE_EQUIVALENCE');
  assert.equal(r.exact,true);
  assert.equal(r.consequences.ordinaryWdlEquivalent,true);
  assert.equal(r.consequences.cpcxProofStateIdentity,false);
  assert.equal(r.edges.length,7);
});

test('same endpoints or scalar similarity cannot replace a TI witness',()=>{
  const a=buildCpcxPosition('443',{geometry:g}),
    b=buildCpcxPosition('445',{geometry:g}),
    r=verifyCpcxQBranchLocalTi(a,b,null);
  assert.equal(r.kind,'NO_CERTIFICATE');
  assert.equal(r.seam,'TI_WITNESS_REQUIRED');
});

test('action mapping must be a bijection over the complete current legal frontier',()=>{
  const a=buildCpcxPosition('443',{geometry:g}),
    b=buildCpcxPosition('445',{geometry:g}),
    p=Array(g.columns).fill(0),
    r=verifyCpcxQBranchLocalTi(a,b,{
      actionMap:p,
      childTransporters:{},
    });
  assert.equal(r.kind,'NO_CERTIFICATE');
  assert.ok([
    'ACTION_MAP_NOT_LEGAL',
    'ACTION_MAP_NOT_BIJECTIVE',
  ].includes(r.seam));
});

test('nonterminal mapped actions require explicit exact child q transporters',()=>{
  const a=buildCpcxPosition('32612636',{geometry:g}),
    b=buildCpcxPosition('56276252',{geometry:g}),
    p=Array.from({length:g.columns},(_,c)=>g.columns-1-c),
    r=verifyCpcxQBranchLocalTi(a,b,{
      actionMap:p,
      childTransporters:{},
    });
  assert.equal(r.kind,'NO_CERTIFICATE');
  assert.equal(r.seam,'CHILD_TRANSPORTER_REQUIRED');
});

test('branch-local TI verifier is generic and isolated from search/solved machinery',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-q-branch-ti.mjs',import.meta.url),'utf8');
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
  assert.match(source,/branch-local/i);
  assert.match(source,/TI_WITNESS_REQUIRED/);
  assert.match(source,/qualified q_o/i);
});

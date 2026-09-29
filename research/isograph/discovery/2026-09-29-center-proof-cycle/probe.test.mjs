import test from 'node:test';
import assert from 'node:assert/strict';
import {geometry,replay,leaf,analyze} from './probe.mjs';

// Exact small-board recurrence is derived afresh, never loaded from an oracle.
test('leaf certificates contain independently enumerated 4x4 values',()=>{
  const g=geometry(4,4),seen=new Map();
  function exact(s){
    const key=Array.from(s.board).join(',');
    if(seen.has(key))return seen.get(key);
    let terminal=null;
    for(const l of g.lines){
      if(l.every(x=>s.board[x]===0))terminal=1;
      if(l.every(x=>s.board[x]===1))terminal=-1;
    }
    if(terminal===null&&s.rank===16)terminal=0;
    let value=terminal;
    if(value===null){
      value=s.rank&1?1:-1;
      for(let c=0;c<4;c++)if(s.heights[c]<4){
        const child=replay(g,[...s.moves,c]);
        const v=exact(child);value=s.rank&1?Math.min(value,v):Math.max(value,v);
      }
    }
    const b=leaf(g,s);assert.ok(b.lo<=value&&value<=b.hi,JSON.stringify({moves:s.moves,b,value}));
    seen.set(key,value);return value;
  }
  exact(replay(g,[]));assert.equal(seen.size,161029);
});

test('root uncertainty is not converted into a value and reflection transports actions',()=>{
  const g=geometry(7,6);
  for(const moves of [[3,3],[3,3,3],[3,3,3,3],[0,1,2,1]]){
    const a=analyze(g,moves,2),b=analyze(g,moves.map(c=>6-c),2);
    for(const x of a.actions){const y=b.actions.find(z=>z.column===6-x.column);assert.equal(x.lo,y.lo);assert.equal(x.hi,y.hi);}
    if(moves.every(c=>c===3)){assert.equal(a.lo,-1);assert.equal(a.hi,1);assert.deepEqual(a.certifiedOptimal,[]);}
  }
});

test('first-win stopping and rule-only immediate win',()=>{
  const g=geometry(7,6),moves=[0,1,0,1,0,2];
  assert.equal(leaf(g,replay(g,moves)).rule,'IMMEDIATE_WIN');
  assert.equal(leaf(g,replay(g,[...moves,0])).lo,1);
  assert.throws(()=>replay(g,[...moves,0,3]),/terminal/);
});

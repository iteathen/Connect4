import test from 'node:test';
import assert from 'node:assert/strict';
import {geometry,replay} from './probe.mjs';
import {policies,checkPolicy,cover,analyzeCover} from './response-cover.mjs';

test('7x6 policy guards reject unmatched odd tails and asymmetric channels',()=>{
  const g=geometry(7,6),s=replay(g,[3,3]),p={partner:Array(7).fill(-1),length:Array(7).fill(0)};
  assert.equal(checkPolicy(g,s,p),true);
  p.partner[0]=1;p.length[0]=2;assert.equal(checkPolicy(g,s,p),false);
  assert.equal([...policies(g,replay(g,[3,3,3]))].length,0);
});

test('every enumerated 7x6 channel policy satisfies its exact geometry guards',()=>{
  const g=geometry(7,6);
  for(const moves of [[3,3],[3,3,3,3],[3,3,3,0]]){
    const s=replay(g,moves);let count=0;
    for(const p of policies(g,s)){
      assert.equal(checkPolicy(g,s,p),true);count++;
      const c=cover(g,s,p);assert.equal(c.covered+c.uncovered.length,c.residualCount);
    }
    assert.ok(count>1);
    const a=analyzeCover(g,moves),b=analyzeCover(g,moves.map(c=>6-c));
    assert.equal(a.policies,b.policies);assert.equal(a.minimumUncovered,b.minimumUncovered);
  }
});

test('7x6 responses remain legal for every attacker choice across three paired turns',()=>{
  const g=geometry(7,6);
  const terminal=b=>g.lines.some(l=>b[l[0]]>=0&&l.every(x=>b[x]===b[l[0]]));
  for(const moves of [[3,3],[3,3,3,3],[3,3,3,0]]){
    const root=replay(g,moves),all=[...policies(g,root)];
    const selected=[all[0],all[Math.floor(all.length/2)],all.at(-1)];
    for(const p of selected){
      const complete=cover(g,root,p).uncovered.length===0;
      function walk(board,h,left){
        for(let c=0;c<7;c++)if(h[c]<6){
          const b=board.slice(),hs=h.slice(),d=hs[c]-root.heights[c];
          b[hs[c]++*7+c]=root.rank&1;
          if(terminal(b)){assert.equal(complete,false,'covered attacker must never win first');continue;}
          const response=d<p.length[c]?p.partner[c]:c;
          assert.ok(response>=0&&hs[response]<6);
          b[hs[response]++*7+response]=(root.rank&1)^1;
          if(left>1&&!terminal(b))walk(b,hs,left-1);
        }
      }
      walk(root.board,root.heights,3);
    }
  }
});

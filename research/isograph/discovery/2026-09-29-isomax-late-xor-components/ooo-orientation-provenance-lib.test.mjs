import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateWinningLines,
  reflectMask,
  reflectOrientation,
  normalizeProvenanceRecords,
  foldOrientation,
  summarizeOrientationOccurrence
} from './ooo-orientation-provenance-lib.mjs';

test('horizontal reflection preserves H/V and swaps diagonal slope',()=>{
  assert.equal(reflectOrientation('H'),'H');
  assert.equal(reflectOrientation('V'),'V');
  assert.equal(reflectOrientation('D+'),'D-');
  assert.equal(reflectOrientation('D-'),'D+');

  for(const [W,H,K] of [[6,3,3],[4,5,4],[6,3,4]]){
    const lines=generateWinningLines(W,H,K);
    const lookup=new Set(lines.map(x=>x.orientation+'|'+x.mask));
    for(const line of lines){
      const key=reflectOrientation(line.orientation)+'|'+reflectMask(line.mask,W,H);
      assert.ok(lookup.has(key),W+'x'+H+'-k'+K+' missing reflected line '+key);
    }
  }
});

test('duplicate residual masks union source provenance before antichain absorption',()=>{
  const records=[
    {mask:1,sources:[{id:'h0',orientation:'H'}]},
    {mask:1,sources:[{id:'d0',orientation:'D+'}]},
    {mask:3,sources:[{id:'v0',orientation:'V'}]}
  ];
  const z=normalizeProvenanceRecords(records);
  assert.equal(z.length,1);
  assert.equal(z[0].mask,1);
  assert.deepEqual(z[0].sources.map(x=>x.id),['d0','h0']);
  assert.deepEqual(z[0].sources.map(x=>x.orientation),['D+','H']);
});

test('diagonal folding occurs only in candidate summaries',()=>{
  assert.equal(foldOrientation('H'),'H');
  assert.equal(foldOrientation('V'),'V');
  assert.equal(foldOrientation('D+'),'D');
  assert.equal(foldOrientation('D-'),'D');
});

test('orientation occurrence summaries keep raw exact provenance but fold candidate families',()=>{
  const occurrence={
    width:2,
    capsByRole:[1,0],
    records:[
      {owner:0,cells:[{depth:0,role:0}],sources:[{id:'a',orientation:'H'}]},
      {owner:0,cells:[{depth:1,role:1}],sources:[{id:'b',orientation:'D+'},{id:'c',orientation:'D-'}]},
      {owner:1,cells:[{depth:2,role:0}],sources:[{id:'d',orientation:'V'}]}
    ]
  };

  assert.equal(summarizeOrientationOccurrence(occurrence,'ORI_PRESENCE'),'HVD');
  assert.equal(summarizeOrientationOccurrence(occurrence,'ORI_COUNTS'),'H=1,V=1,D=2');
  assert.ok(summarizeOrientationOccurrence(occurrence,'EXACT_ORIENTATION_PROVENANCE').includes('D+'));
  assert.ok(summarizeOrientationOccurrence(occurrence,'EXACT_ORIENTATION_PROVENANCE').includes('D-'));
});

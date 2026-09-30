import test from 'node:test';
import assert from 'node:assert/strict';
import {JOINT_DA_CANDIDATES,jointPairSignature,jointTriangleKey,prepareRows,replayRows} from './ooo-joint-da-scalar-lib.mjs';
import {daDomain,paretoPairKeys} from './ooo-joint-da-common-quotient-lib.mjs';
import {signChannelTriangleKey} from './ooo-sign-channel-coupling-lib.mjs';
const raw=([dp,dm,ap,am])=>`C+=1,C-=0|D+=${dp},D-=${dm},A+=${ap},A-=${am}`;
test('feasible common pair factors every Pareto carrier on all 49 states',()=>{
 const states=daDomain('OWNER_COUNT_REALIZABLE');
 const labels=states.map(s=>jointPairSignature(raw(s),JOINT_DA_CANDIDATES[1]));
 assert.equal(new Set(labels).size,31);
 for(let k=0;k<4;k++)for(let i=0;i<49;i++)for(let j=0;j<49;j++)
  if(paretoPairKeys(states[i])[k]===paretoPairKeys(states[j])[k])assert.equal(labels[i],labels[j]);
 assert.throws(()=>jointPairSignature(raw([0,0,1,0]),JOINT_DA_CANDIDATES[1]),/feasib/);
});
test('triangle assembly is permutation invariant and controls equal canonical PMEC maps',()=>{
 const v=['w1|cap=1|dh0=0:1|dh1=','w1|cap=0|dh0=1:1|dh1=0:1','w1|cap=1|dh0=|dh1=1:1'];
 for(const c of JOINT_DA_CANDIDATES){
  const key=jointTriangleKey(v,c);
  for(const order of [[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])assert.equal(jointTriangleKey(order.map(i=>v[i]),c),key);
  if(c.D)assert.equal(key,signChannelTriangleKey(v,c));
 }
});
test('preparation cancels equal triangle coordinates without reading scalar labels',()=>{
 const vertices=['w1|cap=1|dh0=0:1|dh1=','w1|cap=0|dh0=1:1|dh1=0:1','w1|cap=1|dh0=|dh1=1:1'];
 const source={triples:[[2,vertices],[7,[...vertices].reverse()]],dependencies:[{oooResidue:[2,7]},{oooResidue:[2]}],get scalarCode(){throw Error('scalar access');}};
 const p=prepareRows(source,JOINT_DA_CANDIDATES[1]);
 assert.deepEqual(p.structuralRows,[[],[0]]);assert.deepEqual(p.basisDependencyIndices,[1]);
});
test('scalar replay reports a reproducible kernel certificate',()=>{
 const p={structuralRows:[[0],[1],[0,1]],basisDependencyIndices:[0,1],imageRank:2};
 const result=replayRows(p,[1,2,0]);
 assert.equal(result.contradictions,1);assert.deepEqual(result.firstContradiction.dependencyIndices,[0,1,2]);
 assert.equal(result.firstContradiction.reducedCode,3);
 assert.equal(replayRows(p,[1,2,3]).exactScalarFactorization,true);
});

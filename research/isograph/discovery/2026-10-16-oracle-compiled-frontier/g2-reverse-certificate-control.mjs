#!/usr/bin/env node
// Budgeted, reproducible, rank-stratified implementation qualification.
// Does NOT construct a game continuation tree, WDL frontier, or oracle labels.
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { canonicalizeG2Fiber } from '../2026-09-18-policy-frontier/rba-g2-fiber-equivalence.mjs';
import { verifyG2ReverseCertificate } from './g2-reverse-certificate.mjs';

const W=7,H=6;
const SEED=0x4c2a2026;
const RANKS=[33,34,35,36];
const SAMPLE_TARGET=400, BUDGET_MS=60000;
let prng=SEED;
function randomWord(){
  prng^=prng<<13;prng^=prng>>>17;prng^=prng<<5;
  return prng>>>0;
}
function randomIndex(length){
  assert.ok(Number.isSafeInteger(length)&&length>0);
  const limit=Math.floor(0x100000000/length)*length;
  let x;
  do{x=randomWord();}while(x>=limit);
  return x%length;
}
function* supportsAtRank(rank){
  const h=Array(W).fill(0);
  function* visit(c,remaining){
    if(c===W){if(remaining===0)yield h.slice();return;}
    for(let v=0;v<=Math.min(H,remaining);v++){
      h[c]=v;yield* visit(c+1,remaining-v);
    }
  }
  yield* visit(0,rank);
}
function witness(sourceCanonical,targetCanonical,source){
  if(sourceCanonical.key!==targetCanonical.key)throw Error('not one G2 fiber');
  const targetByFrontier=new Map();
  for(let d=0;d<W;d++){
    const id=targetCanonical.frontierIdByColumn[d];
    if(id>=0)targetByFrontier.set(id,d);
  }
  return source.map((height,c)=>{
    if(height===H)return -1;
    const d=targetByFrontier.get(sourceCanonical.frontierIdByColumn[c]);
    if(d===undefined)throw Error('canonical frontier transport missing target action');
    return d;
  });
}
function isMirror(a,b){return a.every((x,i)=>x===b[W-1-i]);}
function testPair(source,target){
  const a=canonicalizeG2Fiber(source),b=canonicalizeG2Fiber(target);
  const map=witness(a,b,source);
  return {record:verifyG2ReverseCertificate(source,target,map),map};
}
const started=performance.now(),deadline=started+BUDGET_MS;
const result={
  schema:'connect4.g2-reverse-certificate-qualification.v0_1',
  seed:'0x'+SEED.toString(16),
  source:'canonical G2 pair discovery, independent geometric reverse checker',
  rankSampling:RANKS, plannedDraws:SAMPLE_TARGET, budgetMs:BUDGET_MS,
  status:'UNSTARTED', frame:{}, deterministic:{}, sample:{},
  counterexample:null
};
let verificationMs=0,checkCount=0,atomicCofactors=0,childShapes=0,basicControls=0;
function checkTimed(source,target){
  const t=performance.now();
  const got=testPair(source,target);
  verificationMs+=performance.now()-t;
  checkCount++;atomicCofactors+=got.record.localCofactorChecks;
  childShapes+=got.record.childShapeChecks;
  basicControls+=got.record.basicControlChecks;
  return got;
}
function run(){
  const known=[
    [[0,1,6,6,6,5,6],[0,1,6,6,6,6,5]],
    [[0,6,6,6,5,5,6],[0,6,6,6,5,6,5]],
    [[0,6,6,6,5,6,6],[0,6,6,6,6,5,6]]
  ];
  let negativeRejects=0;
  for(const [source,target] of known){
    if(performance.now()>=deadline){result.status='BUDGET_EXHAUSTED';return;}
    const {map}=checkTimed(source,target);
    const bad=map.slice();bad[source.findIndex(h=>h<H)]=-1;
    assert.throws(()=>verifyG2ReverseCertificate(source,target,bad),/G2_REVERSE_CERTIFICATE/);
    negativeRejects++;
  }
  result.deterministic={knownNonMirrorPairs:known.length,invalidWitnessRejects:negativeRejects};

  const pairPools=new Map(),frames={};
  for(const rank of RANKS){
    if(performance.now()>=deadline){result.status='BUDGET_EXHAUSTED';return;}
    const grouped=new Map();let supports=0;
    for(const h of supportsAtRank(rank)){
      if(performance.now()>=deadline){result.status='BUDGET_EXHAUSTED';return;}
      supports++;
      const c=canonicalizeG2Fiber(h);
      let group=grouped.get(c.key);
      if(!group){group=[];grouped.set(c.key,group);}
      group.push(h);
    }
    const pairs=[];
    for(const group of grouped.values()){
      const representative=group[0];
      for(const member of group.slice(1)){
        if(!isMirror(representative,member))
          pairs.push([representative,member]);
      }
    }
    frames[rank]={supports,fiberClasses:grouped.size,eligibleNonMirrorRepresentativePairs:pairs.length};
    if(pairs.length===0)throw Error('empty nonmirror sampling stratum '+rank);
    pairPools.set(rank,pairs);
  }
  result.frame=frames;
  const frameDone=performance.now();
  const seen=new Set(),byRank={};
  for(const rank of RANKS)byRank[rank]=0;
  for(let n=0;n<SAMPLE_TARGET;n++){
    if(performance.now()>=deadline){result.status='BUDGET_EXHAUSTED';break;}
    const rank=RANKS[randomIndex(RANKS.length)];
    const pool=pairPools.get(rank),index=randomIndex(pool.length);
    const [source,target]=pool[index];
    try{checkTimed(source,target);}
    catch(e){
      result.counterexample={sampleIndex:n,rank,index,source,target,message:String(e)};
      throw e;
    }
    seen.add(rank+':'+index);byRank[rank]++;
  }
  const sampleCount=Object.values(byRank).reduce((a,b)=>a+b,0);
  const success=sampleCount===SAMPLE_TARGET;
  if(result.status!=='BUDGET_EXHAUSTED')result.status=success?'PASS':'PARTIAL';
  result.sample={
    drawCount:sampleCount,uniquePairs:seen.size,byRank,
    mismatches:result.counterexample?1:0,
    nominalOneSided95UpperDefectFraction:success?1-Math.pow(0.05,1/sampleCount):null,
    intervalAssumption:'IID uniform-with-replacement draws from equally weighted rank strata, uniform within each eligible stratum; pseudo-random fixed seed is not genuine independent entropy'
  };
  result.cost={
    frameBuildMs:+(frameDone-started).toFixed(3),
    reverseCheckMs:+verificationMs.toFixed(3),
    totalMs:+(performance.now()-started).toFixed(3),
    pairChecks:checkCount,
    atomicCofactors,
    childResidualShapeChecks:childShapes,
    basicCPCControlChecks:basicControls,
    recursivelyExpandedStates:0,oracleQueries:0
  };
}
try{run();}
catch(e){
  result.status='FAIL';
  if(!result.counterexample)result.counterexample={message:String(e)};
}
result.cost??={
  totalMs:+(performance.now()-started).toFixed(3),
  reverseCheckMs:+verificationMs.toFixed(3),
  pairChecks:checkCount,atomicCofactors,childResidualShapeChecks:childShapes,
  basicCPCControlChecks:basicControls,recursivelyExpandedStates:0,oracleQueries:0
};
console.log(JSON.stringify(result,null,2));
if(result.status!=='PASS')process.exitCode=1;

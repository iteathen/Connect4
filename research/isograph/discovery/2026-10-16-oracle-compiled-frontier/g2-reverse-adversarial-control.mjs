#!/usr/bin/env node
// Deliberately wrong yet gravity-and-action-preserving G2 witnesses.
// No oracle, WDL compilation, or game continuation expansion.
import { performance } from 'node:perf_hooks';
import { canonicalizeG2Fiber } from '../2026-09-18-policy-frontier/rba-g2-fiber-equivalence.mjs';
import { verifyG2ReverseCertificate } from './g2-reverse-certificate.mjs';

const SOURCES=[
  [0,1,6,6,6,5,6],
  [0,6,6,6,5,5,6],
  [0,6,6,6,5,6,6]
];
const SEED=0x4c2a2027;
const TARGET=160,MAX_ATTEMPTS=10000,BUDGET_MS=10000;
let randomState=SEED;
function nextWord(){
  randomState^=randomState<<13;randomState^=randomState>>>17;
  randomState^=randomState<<5;return randomState>>>0;
}
function permutation(){
  const p=[0,1,2,3,4,5,6];
  for(let i=6;i>0;i--){
    const limit=Math.floor(0x100000000/(i+1))*(i+1);
    let word;do{word=nextWord();}while(word>=limit);
    const j=word%(i+1);
    [p[i],p[j]]=[p[j],p[i]];
  }
  return p;
}
const originals=SOURCES.map(x=>({s:x,c:canonicalizeG2Fiber(x)}));
const started=performance.now(),deadline=started+BUDGET_MS;
const unique=new Set(),byRank={30:0,34:0,35:0};
let attempted=0,alreadyEquivalent=0,identity=0,duplicate=0,incidenceRejected=0;
let counterexample=null;
while(incidenceRejected<TARGET&&attempted<MAX_ATTEMPTS&&performance.now()<deadline){
  const index=attempted%SOURCES.length;
  attempted++;
  const {s,c}=originals[index],perm=permutation(),t=Array(7);
  for(let col=0;col<7;col++)t[perm[col]]=s[col];
  if(t.every((v,i)=>v===s[i])){identity++;continue;}
  const key=index+':'+t.join(',');
  if(unique.has(key)){duplicate++;continue;}
  unique.add(key);
  const ct=canonicalizeG2Fiber(t);
  if(c.key===ct.key){alreadyEquivalent++;continue;}
  const witness=s.map((v,col)=>v===6?-1:perm[col]);
  try{
    const result=verifyG2ReverseCertificate(s,t,witness);
    counterexample={source:s,target:t,witness,kind:'FALSE_EQUIVALENCE_ACCEPTED',result};
    break;
  }catch(e){
    const message=String(e);
    if(!message.includes('residual hyperedge incidence not preserved')){
      counterexample={source:s,target:t,witness,kind:'UNEXPECTED_REJECTION_GUARD',message};
      break;
    }
    incidenceRejected++;byRank[s.reduce((a,v)=>a+v,0)]++;
  }
}
const result={
  schema:'connect4.g2-reverse-certificate-adversarial.v0_1',
  seed:'0x'+SEED.toString(16),
  sampleTarget:TARGET,maxAttempts:MAX_ATTEMPTS,budgetMs:BUDGET_MS,
  attemptedShuffles:attempted,uniqueTargetsConsidered:unique.size,
  sameSource:identity,duplicate,actualG2EquivalencesSkipped:alreadyEquivalent,
  admissibleButWrongMappingsRejectedAtIncidence:incidenceRejected,
  byRank,elapsedMs:+(performance.now()-started).toFixed(3),
  oracleQueries:0,continuationStatesExpanded:0,counterexample,
  status:counterexample?'FAIL':incidenceRejected===TARGET?'PASS':'PARTIAL'
};
console.log(JSON.stringify(result,null,2));
if(result.status!=='PASS')process.exitCode=1;

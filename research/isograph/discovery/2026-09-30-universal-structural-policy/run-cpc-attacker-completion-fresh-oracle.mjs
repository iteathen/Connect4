#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const corpusPath=process.argv[2];
const ponsPath=process.argv[3];
assert(corpusPath&&ponsPath,'usage: node run-cpc-attacker-completion-fresh-oracle.mjs <corpus.json> <pons.txt>');

const PONS_SHA='d6ba50d8aaf2308c769d9bf2abd42d90f34baf41';
const BOOK_SHA='f346cd449626fb81da93be0958e017ee854e5f74d85b6d38062357f5403aec53';
const corpus=JSON.parse(fs.readFileSync(corpusPath,'utf8'));
assert.equal(corpus.oracleUsed,false);
assert.equal(corpus.solvedInputsUsed,false);
assert(Array.isArray(corpus.certificates)&&corpus.certificates.length>0);

const lines=fs.readFileSync(ponsPath,'utf8').split(/\r?\n/).filter(x=>x.trim().length);
assert.equal(lines.length,corpus.certificates.length,'Pons output count mismatch');

function exactWinDistance(rank,score){
  if(score<=0)return null;
  const maxScore=Math.floor((43-rank)/2);
  return 2*(maxScore-score)+1;
}

const checks=corpus.certificates.map((cert,i)=>{
  const fields=lines[i].trim().split(/\s+/);
  assert.equal(fields[0],cert.sequence,'Pons sequence mismatch at row '+i);
  const scores=fields.slice(1).map(Number);
  assert.equal(scores.length,7,'expected seven Pons scores at row '+i);
  assert(scores.every(Number.isInteger),'non-integer Pons score');
  const legal=scores.filter(x=>x!==-1000);
  assert(legal.length>0,'no legal Pons actions');
  const best=Math.max(...legal);
  const distance=exactWinDistance(cert.rank,best);
  const mover=(cert.rank&1)+1;
  assert.equal(mover,cert.attacker,'structural attacker/mover mismatch');
  const compatible=best>0&&distance!==null&&distance<=cert.upper;
  return {
    sequence:cert.sequence,
    rank:cert.rank,
    attacker:cert.attacker,
    constructor:cert.constructor,
    structuralUpper:cert.upper,
    scores,
    oracleBestScore:best,
    oracleExactWinDistance:distance,
    compatible
  };
});
const failures=checks.filter(x=>!x.compatible);
assert.equal(failures.length,0,'fresh A_D oracle incompatibilities: '+JSON.stringify(failures));

const byConstructor={};
for(const c of checks){
  const b=byConstructor[c.constructor]??={count:0,maxSlack:null,minSlack:null};
  b.count++;
  const slack=c.structuralUpper-c.oracleExactWinDistance;
  b.maxSlack=b.maxSlack===null?slack:Math.max(b.maxSlack,slack);
  b.minSlack=b.minSlack===null?slack:Math.min(b.minSlack,slack);
}

console.log(JSON.stringify({
  schema:'connect4.cpc_attacker_completion_fresh_oracle_validation.v1',
  validationOnly:true,
  trainingUse:false,
  pons:{
    revision:PONS_SHA,
    mode:'c4solver -a / Solver::analyze()',
    book:'7x6.book',
    bookSha256:BOOK_SHA
  },
  structuralCorpus:{
    schema:corpus.schema,
    theoremVersion:corpus.theoremVersion,
    certificateCount:corpus.certificates.length,
    trainingPrefixExcluded:corpus.trainingPrefixExcluded
  },
  checks,
  summary:{
    passed:checks.length,
    failed:0,
    byConstructor
  },
  boundary:[
    'Oracle results were queried only after the structural corpus was frozen.',
    'Validation checks only that the designated attacker is winning and that exact oracle win distance is <= the structurally proved upper bound.',
    'No oracle result is fed back into the A_D proof grammar or used as a runtime premise.'
  ]
},null,2));

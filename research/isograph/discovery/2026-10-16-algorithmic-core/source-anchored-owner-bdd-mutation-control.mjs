#!/usr/bin/env node
// Deliberately invalid source-q anchored BDD producer variants.
// Independent direct physical rule game values are VALIDATION ONLY.
// No mutant is committed to the actual symbolic algebra file.
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createSourceAnchoredOwnerBDDSolver}
 from './source-anchored-owner-bdd.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {physicalRules} from './constructive-core-control.mjs';

const G={width:4,height:3,connect:3};
const CAP={maxNodes:60000,maxApplyVisits:300000,maxSupports:10000};
const VARIANTS=[
 {id:'omit-immediate-P1-first-win-guard',
  needle:'const guard=negate(now);',
  replacement:'const guard=1;'},
 {id:'omit-owner-cofactor-restriction',
  needle:'const cw=fix(child.W,occupied,player===0,memo),\n       cn=fix(child.N,occupied,player===0,memo);',
  replacement:'const cw=child.W,\n       cn=child.N;'}
];
function compileSource(raw){
 const s=raw.replace(/\bexport\s+/g,'');
 return new Function(s+'\nreturn createSourceAnchoredOwnerBDDSolver;')();
}
function one(factory,q){
 const solver=factory(G,q,{...CAP,deadlineAt:Date.now()+15000});
 const result=solver.compile();
 return solver.decodeSourceRoot(result);
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function runSourceAnchoredMutationControl(source){
 if(typeof source!=='string')throw Error('must supply source code for exact mutation fixture');
 const full=physicalRules(G).solveAll({maxStates:200000,maxEdges:800000,
  deadlineAt:Date.now()+30000});
 const core=createExactQCore(G);
 const sourcePositions=[...full.states.values()];
 const output={
  schema:'connect4.source-anchored-BDD-mutant-falsifiers.v0_1',
  date:'2026-10-16',status:'PASS',
  controlDomain:'4x3 Connect3 legal physical nonterminal state reference',
  independentPositions:full.states.size,
  baselinesRechecked:0,mutants:[],
  productionSourceModified:false,oracleQueries:0
 };
 for(const {id,needle,replacement} of VARIANTS){
  if(source.split(needle).length!==2)
   throw Error('mutant source anchor occurs not exactly once: '+id);
  const wrong=compileSource(source.replace(needle,replacement));
  const candidates=id.startsWith('omit-immediate')?
    sourcePositions.filter(s=>s.rank%2===1&&
      physicalRules(G).legal(s).some(c=>
       physicalRules(G).move(s,c).terminal===-1)):
    sourcePositions;
  // Mutation checking is VALIDATION; candidate strategy was derived first.
  const prior=candidates.slice(0,128);
  let detected=null,examined=0;
  for(const s of prior){
   const q=core.fromPhysical(s),expected=full.memo.get(full.key(s));
   let actual=null,err=null;
   try{actual=one(wrong,q);}
   catch(e){err=String(e);}
   examined++;
   if(err||!same(actual,expected)){
    const correct=one(createSourceAnchoredOwnerBDDSolver,q);
    if(!same(correct,expected))
     throw Error('legitimate source-q anchored control differs at '+s.sequence);
    output.baselinesRechecked++;
    detected={
     history:s.sequence,support:s.h,rank:s.rank,
     physicalOwners:{p0:s.p0.toString(16),p1:s.p1.toString(16)},
     correct,
     mutant:actual,
     error:err,
     semanticDifference:err?'UNBOUND_OR_INVALID_SYMBOLIC_CONTRACT':
       'INCORRECT_VALUE_OR_LITERAL_ACTIONS'
    };
    break;
   }
  }
  output.mutants.push({id,original:needle,replacement,
    scanned:examined,availableCandidatePositions:candidates.length,
    detected:!!detected,firstCounterexample:detected});
  if(!detected)output.status='FAIL';
 }
 return output;
}
if(process.argv[1]?.endsWith('source-anchored-owner-bdd-mutation-control.mjs')){
 const dir=dirname(fileURLToPath(import.meta.url));
 const source=readFileSync(join(dir,'source-anchored-owner-bdd.mjs'),'utf8');
 const z=runSourceAnchoredMutationControl(source);
 console.log(JSON.stringify(z,null,2));
 if(z.status!=='PASS')process.exitCode=1;
}

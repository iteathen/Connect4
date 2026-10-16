#!/usr/bin/env node
// Independent reproducible proof-certificate readback plus matched discovery.
// Certificate production cannot consult root solved values or oracle data.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createExactQCore} from './exact-q-core.mjs';
import {discoverInputSpecializedP0Win,favorable} from './input-specialized-p0-certificate.mjs';
import {verifyInputSpecializedP0Win} from './input-specialized-certificate-checker.mjs';

const directory=dirname(fileURLToPath(import.meta.url));
const stored=JSON.parse(readFileSync(join(directory,
 'INPUT_SPECIALIZED_ROOT_WIN_CERTIFICATE_0_1.json'),'utf8'));
const directOnly=JSON.parse(readFileSync(join(directory,
 'INPUT_SPECIALIZED_DIRECT_ONLY_ROOT_CERTIFICATE_0_1.json'),'utf8'));
const cfg={width:4,height:3,connect:3},clone=x=>JSON.parse(JSON.stringify(x));
const parseQ=q=>({h:q.h.slice(),R0:q.R0.map(x=>BigInt('0x'+x)),
 R1:q.R1.map(x=>BigInt('0x'+x))});
const compare=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function expectedRejection(certificate,description,rx){
 let caught=null;
 try{verifyInputSpecializedP0Win(certificate,{deadlineAt:Date.now()+15000});}
 catch(e){caught=String(e);}
 if(!caught||!rx.test(caught))
  throw Error(description+' mutation evaded exact reverse checker: '+String(caught));
 return {kind:description,rejected:true,error:caught};
}
export function runInputSpecializedProofControl(){
 const begin=performance.now();
 const verified=verifyInputSpecializedP0Win(stored,{deadlineAt:Date.now()+15000});
 assert.equal(verified.status,'CERTIFIED_P0_WIN');
 assert.equal(verified.rootOpeningColumn1Based,2);
 const directVerified=verifyInputSpecializedP0Win(directOnly,{deadlineAt:Date.now()+15000});
 assert.equal(directVerified.status,'CERTIFIED_P0_WIN');
 assert.equal(directVerified.rootOpeningColumn1Based,2);
 assert.equal(directVerified.metrics.nodesChecked,47);
 assert.equal(directVerified.metrics.totalProofEdges,73);
 assert.equal(directVerified.metrics.dominatedReferenceEdges,0);
 assert.equal(directVerified.metrics.exactReferenceEdges,directVerified.metrics.nonterminalEdges);
 const matched=[];
 for(const useDominance of [true,false]){
  const start=performance.now();
  const candidate=discoverInputSpecializedP0Win({
   useDominance,deadlineAt:Date.now()+15000,
   maxObligationVisits:60000,maxLocalChecks:300000,
   maxNodes:60000,maxProofEdges:300000
  });
  assert.equal(candidate.status,'CANDIDATE_P0_WIN');
  const check=verifyInputSpecializedP0Win(candidate,{deadlineAt:Date.now()+15000});
  assert.equal(check.status,'CERTIFIED_P0_WIN');
  assert.equal(check.rootOpeningColumn1Based,verified.rootOpeningColumn1Based);
  matched.push({useDominance,certificateNodes:check.metrics.nodesChecked,
   certificateEdges:check.metrics.totalProofEdges,
   independentCheck:check.metrics,search:candidate.metrics,
   totalMs:+(performance.now()-start).toFixed(3)});
 }
 assert.equal(matched[0].certificateNodes,verified.metrics.nodesChecked,
   'saved certificate does not match opt-in discovery control');
 assert.equal(matched[0].certificateEdges,verified.metrics.totalProofEdges);

 const negatives=[];
 {
  const bad=clone(stored),p1=bad.nodes.find(n=>
   n.q.h.reduce((a,b)=>a+b,0)%2===1&&n.edges.length>=2);
  assert.ok(p1,'expected universal reply obligation');
  p1.edges.pop();
  negatives.push(expectedRejection(bad,'missing P1 reply',/P1 proof omitted/));
 }
 {
  const bad=clone(stored),p0=bad.nodes.find(n=>
   n.q.h.reduce((a,b)=>a+b,0)%2===0);
  assert.ok(p0);
  p0.edges[0].action=4;
  p0.p0SelectedAction=4;
  negatives.push(expectedRejection(bad,'illegal P0 choice',/illegal\/duplicate proof action/));
 }
 {
  const bad=clone(stored),node=bad.nodes.find(n=>n.edges.some(e=>e.terminal==='P0_WIN'));
  assert.ok(node);
  node.edges.find(e=>e.terminal==='P0_WIN').terminal='DRAW';
  negatives.push(expectedRejection(bad,'false terminal outcome',/claimed terminal is not an immediate P0 win/));
 }
 {
  const bad=clone(stored),node=bad.nodes.find(n=>n.sourcePath.length>=2);
  assert.ok(node);
  node.sourcePath.pop();
  negatives.push(expectedRejection(bad,'forged generator source path',/source-path q mismatch|invalid source path/));
 }
 // A false-value equivalence must fail even when the forged reference has
 // the SAME support and is itself an independently certified P0 winner.
 {
  const bad=clone(stored),core=createExactQCore(cfg),byId=new Map(bad.nodes.map(n=>[n.id,n]));
  let found=null;
  for(const n of bad.nodes){
   for(const e of n.edges){
    if(e.ref===null)continue;
    const q=parseQ(n.q),child=core.next(q,e.action);
    if(!child.q)continue;
    for(const other of bad.nodes){
     if(other.id===e.ref||!compare(other.q.h,child.q.h))continue;
     if(!favorable(child.q,parseQ(other.q))){
      found={parent:n.id,action:e.action,correct:e.ref,incorrect:other.id};
      e.ref=other.id;break;
     }
    }
    if(found)break;
   }
   if(found)break;
  }
  assert.ok(found,'need a same-support false dominance mutant');
  const row=expectedRejection(bad,'false same-support dominance',/false favorable-order dominance reference/);
  row.testCase=found;
  negatives.push(row);
 }

 // Reference exact q solver is invoked strictly AFTER certificate readback
 // and independent local negative tests, never during candidate generation.
 const referenceCore=createExactQCore(cfg),tref=performance.now();
 const baseline=referenceCore.solve(referenceCore.createEmpty(),{
  maxStates:60000,maxTransitions:300000,deadlineAt:Date.now()+15000
 });
 const referenceMs=performance.now()-tref;
 assert.equal(baseline.answer.value,1);
 assert.ok(baseline.answer.bestMoves.includes(stored.openingAction));
 return {
  schema:'connect4.input-specialized-winning-region-control.v0_2',
  status:'PASS',
  coreQuestion:'empty 4x3 Connect3: is P0 first-win from the actual root?',
  certifiedOpeningOneBased:verified.rootOpeningColumn1Based,
  certifiedConclusion:'P0_WIN',
  storedCertificateVerified:verified,
  directOnlyCertificateVerified:directVerified,
  matchedDiscovery:matched,
  negativeControls:negatives,
  independentReferenceOnlyAfterProof:{
   value:baseline.answer.value,
   allWdlBestMovesOneBased:baseline.answer.bestMoves.map(x=>x+1),
   fullWdlCoreStats:baseline.stats,
   elapsedMs:+referenceMs.toFixed(3)
  },
  provenScope:'one certified winning P0 move and all P1 replies at every certificate node',
  scopeLimit:'does not certify all four openings from certificate; not generally branch-free',
  sourceType:'rule-only residual/proof candidate; independent geometry/first-win and favorable-order check',
  oracleQueries:0,
  solvedValueInputsToCandidate:0,
  overallMs:+(performance.now()-begin).toFixed(3)
 };
}
if(process.argv[1]?.endsWith('input-specialized-proof-control.mjs')){
 const x=runInputSpecializedProofControl();
 console.log(JSON.stringify(x,null,2));
 if(x.status!=='PASS')process.exitCode=1;
}

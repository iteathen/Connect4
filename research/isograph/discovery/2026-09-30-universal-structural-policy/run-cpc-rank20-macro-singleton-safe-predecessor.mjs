#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const DESIGN='CPC_RANK20_MACRO_SINGLETON_SAFE_PREDECESSOR_DESIGN_0_1.md';
const HAZARD='CPC_RANK20_C5_REPLY5_HAZARDOUS_RESPONSE_PREDECESSOR_DIAGNOSTIC_0_1.json';
const LIFT='CPC_RANK20_RESPONSE_LIFT_EXCLUSION_ALTERNATIVE_CENSUS_0_1.json';
const PARTIAL='CPC_RANK20_C5_REPLY5_PARTIAL_RESERVOIR_EXACT_VALIDATION_PROBE_0_1.json';

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;

const KNOWN_SEQUENCES={
  RANK22_ROUTED:'4444415666662322224233',
  RANK24_ZUGZWANG:'444441566666232222423311',
  RANK24_SINGLETON:'444441566666232222423313',
  RANK24_ROUTED:'444441566666232222423317',
};

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({
      diagnosticId:id,cell,column:c+1,row:r+1
    });
  }
  return out.sort((a,b)=>a.cell-b.cell);
}
function legalColumns(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function exactEqual(a,b){
  if(!a||!b||a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
const knownStates=Object.fromEntries(Object.entries(KNOWN_SEQUENCES).map(([name,seq])=>[name,fromSequence(seq)]));
function knownRoot(q){
  if(!q||q.terminal)return null;
  for(const [name,state] of Object.entries(knownStates))if(exactEqual(q,state))return name;
  return null;
}
function landingCell(q,c){return q.words[c]*g.columns+c;}

function reconstructEarlierPredecessor(sourceState,hazardCandidate){
  let q=fromSequence(sourceState.sequence);
  const path=hazardCandidate.firstFailure.path;
  assert(path.length>=2,'need at least one earlier macro-step');
  const targetPairIndex=path.length-2;
  for(let i=0;i<=targetPairIndex;i++){
    const pair=path[i];
    assert.equal(moverOf(q),P2);
    const tc=pair.trigger.column-1;
    assert.equal(landingCell(q,tc),pair.trigger.cell);
    q=step(q,tc);
    assert.equal(q.terminal,0);
    assert.equal(moverOf(q),P1);
    if(i===targetPairIndex){
      return {q,frozenMappedResponseColumn:pair.response.column,frozenMappedResponseCell:pair.response.cell,pairIndex:i};
    }
    const rc=pair.response.column-1;
    assert.equal(landingCell(q,rc),pair.response.cell);
    q=step(q,rc);
    assert.equal(q.terminal,0);
  }
  throw new Error('unreachable predecessor reconstruction');
}

function singletonSafeResponses(q){
  assert.equal(q.terminal,0);
  assert.equal(moverOf(q),P1);
  const out=[];
  for(const c of legalColumns(q)){
    const cell=landingCell(q,c);
    const child=step(q,c);
    const post=child.terminal===0?playableSingletons(child,P2):[];
    const singletonSafe=child.terminal===P1_WIN||(child.terminal===0&&post.length===0);
    if(singletonSafe)out.push({
      column:c+1,
      cell,
      terminal:child.terminal,
      support:support(child),
      knownRoot:child.terminal===0?knownRoot(child):null,
      postResponsePlayableP2Singletons:post
    });
  }
  return out;
}

function evaluateP1Move(q,c){
  assert.equal(moverOf(q),P1);
  const cell=landingCell(q,c);
  const afterP1=step(q,c);
  const base={
    column:c+1,
    cell,
    terminal:afterP1.terminal,
    resultingSupport:support(afterP1),
    knownRoot:afterP1.terminal===0?knownRoot(afterP1):null,
    defenderTriggers:[]
  };
  if(afterP1.terminal===P1_WIN)return {...base,macroSafe:true,immediateP1Terminal:true};
  if(afterP1.terminal!==0)return {...base,macroSafe:false,immediateP1Terminal:false};
  assert.equal(moverOf(afterP1),P2);

  let allSafe=true;
  for(const b of legalColumns(afterP1)){
    const triggerCell=landingCell(afterP1,b);
    const afterP2=step(afterP1,b);
    if(afterP2.terminal===P2_WIN){
      base.defenderTriggers.push({
        column:b+1,cell:triggerCell,terminal:afterP2.terminal,
        support:support(afterP2),
        singletonSafeP1Responses:[],
        safeResponseExists:false,
        failureKind:'IMMEDIATE_P2_TERMINAL'
      });
      allSafe=false;
      continue;
    }
    if(afterP2.terminal!==0){
      base.defenderTriggers.push({
        column:b+1,cell:triggerCell,terminal:afterP2.terminal,
        support:support(afterP2),
        singletonSafeP1Responses:[],
        safeResponseExists:false,
        failureKind:'OTHER_P2_TERMINAL'
      });
      allSafe=false;
      continue;
    }
    assert.equal(moverOf(afterP2),P1);
    const safe=singletonSafeResponses(afterP2);
    base.defenderTriggers.push({
      column:b+1,cell:triggerCell,terminal:0,
      support:support(afterP2),
      preResponsePlayableP2Singletons:playableSingletons(afterP2,P2),
      singletonSafeP1Responses:safe,
      safeResponseExists:safe.length>0,
      failureKind:safe.length?'NONE':'NO_SINGLETON_SAFE_P1_RESPONSE'
    });
    if(!safe.length)allSafe=false;
  }
  return {...base,macroSafe:allSafe,immediateP1Terminal:false};
}

const partial=JSON.parse(readFileSync(resolve(import.meta.dirname,PARTIAL),'utf8'));
const hazard=JSON.parse(readFileSync(resolve(import.meta.dirname,HAZARD),'utf8'));
const lift=JSON.parse(readFileSync(resolve(import.meta.dirname,LIFT),'utf8'));
assert.equal(partial.schema,'connect4.cpc_rank20_c5_reply5_partial_reservoir_exact_validation_probe.v1');
assert.equal(hazard.schema,'connect4.cpc_rank20_c5_reply5_hazardous_response_predecessor_diagnostic.v1');
assert.equal(lift.schema,'connect4.cpc_rank20_response_lift_exclusion_alternative_census.v1');
for(const src of [partial,hazard,lift]){
  assert.equal(src.jsMinSysSha,EXPECTED);
  assert.equal(src.oracleUsed,false);
  assert.equal(src.solvedInputsUsed,false);
}
assert.equal(hazard.candidates.length,13);
assert.equal(lift.summary.noSingletonSafeAlternativeCount,13);

const sourceMap=new Map(partial.states.map(x=>[x.id,x]));
const liftMap=new Map(lift.candidates.map(x=>[x.id+'|'+x.pairingSignature,x]));
const candidates=[];

for(const hc of hazard.candidates){
  const key=hc.id+'|'+hc.signature;
  const lr=liftMap.get(key);
  assert(lr);
  assert.equal(lr.disposition,'NO_SINGLETON_SAFE_ALTERNATIVE');
  const source=sourceMap.get(hc.id);
  assert(source);

  const pred=reconstructEarlierPredecessor(source,hc);
  const q=pred.q;
  const moves=legalColumns(q).map(c=>evaluateP1Move(q,c));
  const macroSafe=moves.filter(x=>x.macroSafe).map(x=>x.column);
  const mappedSafe=macroSafe.includes(pred.frozenMappedResponseColumn);
  const alternatives=macroSafe.filter(c=>c!==pred.frozenMappedResponseColumn);
  const disposition=alternatives.length
    ?'MACRO_SAFE_ALTERNATIVE_EXISTS'
    :mappedSafe
      ?'ONLY_MAPPED_MOVE_MACRO_SAFE'
      :'NO_MACRO_SAFE_MOVE';

  candidates.push({
    id:hc.id,
    pairingSignature:hc.signature,
    pairIndex:pred.pairIndex,
    predecessorRank:rankOf(q),
    predecessorSupport:support(q),
    frozenMappedResponseColumn:pred.frozenMappedResponseColumn,
    frozenMappedResponseCell:pred.frozenMappedResponseCell,
    legalP1Moves:moves,
    macroSafeColumns:macroSafe,
    macroSafeAlternativeColumns:alternatives,
    disposition
  });
}

const signatureMap=new Map();
for(const c of candidates){
  const key=c.predecessorRank+'|'+c.predecessorSupport.join(',');
  if(!signatureMap.has(key))signatureMap.set(key,{
    signature:key,count:0,candidateIds:[],mappedColumns:new Set(),macroSafeColumns:new Set(),dispositions:new Set()
  });
  const x=signatureMap.get(key);
  x.count++;
  x.candidateIds.push(c.id+':'+c.pairingSignature);
  x.mappedColumns.add(c.frozenMappedResponseColumn);
  for(const col of c.macroSafeColumns)x.macroSafeColumns.add(col);
  x.dispositions.add(c.disposition);
}
const recurrence=[...signatureMap.values()].map(x=>({
  signature:x.signature,count:x.count,candidateIds:x.candidateIds.sort(),
  mappedColumns:[...x.mappedColumns].sort((a,b)=>a-b),
  macroSafeColumns:[...x.macroSafeColumns].sort((a,b)=>a-b),
  dispositions:[...x.dispositions].sort()
})).sort((a,b)=>b.count-a.count||a.signature.localeCompare(b.signature));

const summary={
  candidateCount:candidates.length,
  macroSafeAlternativeExistsCount:candidates.filter(x=>x.disposition==='MACRO_SAFE_ALTERNATIVE_EXISTS').length,
  onlyMappedMoveMacroSafeCount:candidates.filter(x=>x.disposition==='ONLY_MAPPED_MOVE_MACRO_SAFE').length,
  noMacroSafeMoveCount:candidates.filter(x=>x.disposition==='NO_MACRO_SAFE_MOVE').length,
  macroSafeAlternativeCandidateIds:candidates.filter(x=>x.disposition==='MACRO_SAFE_ALTERNATIVE_EXISTS').map(x=>x.id+':'+x.pairingSignature).sort(),
  noMacroSafeMoveCandidateIds:candidates.filter(x=>x.disposition==='NO_MACRO_SAFE_MOVE').map(x=>x.id+':'+x.pairingSignature).sort(),
  uniquePredecessorStateCount:recurrence.length
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_macro_singleton_safe_predecessor.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  targetReservoirModified:false,
  bsfpModified:false,
  design:DESIGN,
  sourceEvidence:{hazardousPredecessor:HAZARD,responseLiftCensus:LIFT},
  candidateCount:candidates.length,
  candidates,
  recurrence,
  summary,
  conclusion:[
    'The test moves exactly one response macro-step earlier than the qualified final response-lift hazards.',
    'MacroSafe1 is evaluated by one bounded controllable-predecessor layer: one P1 candidate move, every legal P2 trigger, and existence of at least one singleton-safe P1 response.',
    summary.macroSafeAlternativeExistsCount
      ? 'At least one frozen policy has a different one-macro singleton-safe P1 move at the earlier predecessor; response-capacity policy re-synthesis is locally viable at this layer.'
      : summary.onlyMappedMoveMacroSafeCount
        ? 'No alternative macro-safe move exists, but at least one frozen mapped move is macro-safe; the failure lies in a later pairing/response assignment rather than this predecessor move.'
        : 'No frozen candidate has any one-macro singleton-safe move at this predecessor layer; the repair must move another macro-step earlier or use a stronger non-singleton safety certificate.'
  ],
  boundary:[
    'This is bounded structural predecessor evidence only and does not certify the rank-20 root or assign game value to the predecessor states.',
    'No oracle, solved W/D/L, minimax value, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'The test does not recurse beyond one defender trigger and one Player-1 response.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.'
  ]
},null,2));

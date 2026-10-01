#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const DESIGN='CPC_RANK20_RESPONSE_LIFT_EXCLUSION_ALTERNATIVE_CENSUS_DESIGN_0_1.md';
const PARTIAL='CPC_RANK20_C5_REPLY5_PARTIAL_RESERVOIR_EXACT_VALIDATION_PROBE_0_1.json';
const HAZARD='CPC_RANK20_C5_REPLY5_HAZARDOUS_RESPONSE_PREDECESSOR_DIAGNOSTIC_0_1.json';

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

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
function cellDesc(cell,q){
  return {
    cell,
    column:g.cellColumn[cell]+1,
    row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
  };
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({diagnosticId:id,...cellDesc(cell,q)});
  }
  return out.sort((a,b)=>a.cell-b.cell);
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
function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:kinds.get(kind),
      interval:[s.interval[0]-2,s.interval[1]-2],
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],
      preemptionMask32:s.preemptionMask32[0]>>>0,
      precursorCount:s.precursorCount[0],
      projectedCount:Array.from(s.projectedCount),
      projectedForks:Array.from(s.projectedForks),
    };
  }
  return out;
}
function legalColumns(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function reconstructPreResponse(sourceState,hazardCandidate){
  let q=fromSequence(sourceState.sequence);
  const path=hazardCandidate.firstFailure.path;
  assert(path.length>0);
  for(let i=0;i<path.length;i++){
    const pair=path[i];
    assert.equal(moverOf(q),P2);
    const triggerColumn=pair.trigger.column-1;
    const triggerCell=q.words[triggerColumn]*g.columns+triggerColumn;
    assert.equal(triggerCell,pair.trigger.cell);
    q=step(q,triggerColumn);
    assert.equal(q.terminal,0);
    assert.equal(moverOf(q),P1);
    if(i===path.length-1)break;
    const responseColumn=pair.response.column-1;
    const responseCell=q.words[responseColumn]*g.columns+responseColumn;
    assert.equal(responseCell,pair.response.cell);
    q=step(q,responseColumn);
    assert.equal(q.terminal,0);
  }
  return q;
}
function responseCensus(q){
  assert.equal(q.terminal,0);
  assert.equal(moverOf(q),P1);
  const beforePlayable=playableSingletons(q,P2);
  const beforeCells=new Set(beforePlayable.map(x=>x.cell));
  const cc=cpc(q);
  const rows=[];
  for(const c of legalColumns(q)){
    const landingCell=q.words[c]*g.columns+c;
    const child=step(q,c);
    let afterPlayable=[];
    if(child.terminal===0)afterPlayable=playableSingletons(child,P2);
    const immediateP1Terminal=child.terminal===P1_WIN;
    const singletonSafe=immediateP1Terminal||(child.terminal===0&&afterPlayable.length===0);
    rows.push({
      column:c+1,
      landingCell:cellDesc(landingCell,q),
      terminal:child.terminal,
      resultingSupport:support(child),
      knownRoot:child.terminal===0?knownRoot(child):null,
      preResponsePlayableP2Singletons:beforePlayable,
      postResponsePlayableP2Singletons:afterPlayable.map(x=>({
        ...x,
        alreadyPlayableBeforeResponse:beforeCells.has(x.cell),
        newlyExposedByResponse:!beforeCells.has(x.cell),
        sameColumnAsResponse:x.column===c+1,
        immediatelyAboveLanding:x.column===c+1&&x.row===g.cellRow[landingCell]+2
      })),
      responseLiftHazard:!immediateP1Terminal&&child.terminal===0&&afterPlayable.length>0,
      singletonSafe
    });
  }
  return {cpc:cc,beforePlayable,responses:rows};
}

const partial=JSON.parse(readFileSync(resolve(import.meta.dirname,PARTIAL),'utf8'));
const hazard=JSON.parse(readFileSync(resolve(import.meta.dirname,HAZARD),'utf8'));
assert.equal(partial.schema,'connect4.cpc_rank20_c5_reply5_partial_reservoir_exact_validation_probe.v1');
assert.equal(hazard.schema,'connect4.cpc_rank20_c5_reply5_hazardous_response_predecessor_diagnostic.v1');
for(const src of [partial,hazard]){
  assert.equal(src.jsMinSysSha,EXPECTED);
  assert.equal(src.oracleUsed,false);
  assert.equal(src.solvedInputsUsed,false);
}
const sourceStateMap=new Map(partial.states.map(x=>[x.id,x]));
assert.equal(hazard.candidates.length,13);

const candidates=[];
for(const hc of hazard.candidates){
  assert.equal(hc.firstFailure.kind,'defender-terminal');
  const sourceState=sourceStateMap.get(hc.id);
  assert(sourceState);
  const q=reconstructPreResponse(sourceState,hc);
  assert.equal(rankOf(q),hc.firstFailure.preResponseState.rank);
  assert.deepEqual(support(q),hc.firstFailure.preResponseState.support);
  assert.equal(moverOf(q)+1,hc.firstFailure.preResponseState.mover);

  const census=responseCensus(q);
  const mappedColumn=hc.firstFailure.precedingP1Response.column;
  const mapped=census.responses.find(x=>x.column===mappedColumn);
  assert(mapped,'mapped response must be legal');
  const safeAlternatives=census.responses.filter(x=>x.column!==mappedColumn&&x.singletonSafe);
  const mappedResponseHazard=mapped.responseLiftHazard;
  const disposition=!mappedResponseHazard
    ?'MAPPED_RESPONSE_ALREADY_SAFE'
    :safeAlternatives.length
      ?'SAFE_ALTERNATIVE_EXISTS'
      :'NO_SINGLETON_SAFE_ALTERNATIVE';

  candidates.push({
    id:hc.id,
    pairingSignature:hc.signature,
    firstFailureKind:hc.firstFailure.kind,
    terminalCell:hc.firstFailure.terminalCell,
    predecessorRank:rankOf(q),
    predecessorSupport:support(q),
    predecessorCpc:census.cpc,
    preResponsePlayableP2Singletons:census.beforePlayable,
    mappedResponseColumn:mappedColumn,
    mappedResponseCell:hc.firstFailure.precedingP1Response.cell,
    mappedResponseHazard,
    mappedResponsePostPlayableP2Singletons:mapped.postResponsePlayableP2Singletons,
    legalResponses:census.responses,
    safeAlternativeColumns:safeAlternatives.map(x=>x.column),
    disposition
  });
}

const summary={
  candidateCount:candidates.length,
  responseLiftHazardCount:candidates.filter(x=>x.mappedResponseHazard).length,
  mappedResponseAlreadySafeCount:candidates.filter(x=>!x.mappedResponseHazard).length,
  safeAlternativeExistsCount:candidates.filter(x=>x.disposition==='SAFE_ALTERNATIVE_EXISTS').length,
  noSingletonSafeAlternativeCount:candidates.filter(x=>x.disposition==='NO_SINGLETON_SAFE_ALTERNATIVE').length,
  safeAlternativeCandidateIds:candidates.filter(x=>x.disposition==='SAFE_ALTERNATIVE_EXISTS').map(x=>x.id+':'+x.pairingSignature).sort(),
  noSafeAlternativeCandidateIds:candidates.filter(x=>x.disposition==='NO_SINGLETON_SAFE_ALTERNATIVE').map(x=>x.id+':'+x.pairingSignature).sort(),
  mappedHazardAlreadyPlayableBeforeCount:candidates.filter(x=>x.mappedResponsePostPlayableP2Singletons.some(y=>y.alreadyPlayableBeforeResponse)).length,
  mappedHazardNewlyExposedCount:candidates.filter(x=>x.mappedResponsePostPlayableP2Singletons.some(y=>y.newlyExposedByResponse)).length,
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_response_lift_exclusion_alternative_census.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  targetReservoirModified:false,
  bsfpModified:false,
  design:DESIGN,
  sourceEvidence:{partialReservoir:PARTIAL,hazardousPredecessor:HAZARD},
  candidateCount:candidates.length,
  candidates,
  summary,
  conclusion:[
    'Every frozen first-failure predecessor is reconstructed exactly from the pinned RBA state and the frozen deterministic trigger/response path.',
    'A mapped nonterminal response is classified as a response-lift hazard exactly when the resulting Player-2 state contains an active physically playable Player-2 residual singleton.',
    summary.mappedResponseAlreadySafeCount
      ? 'At least one mapped response remains singleton-safe, so the proposed exclusion guard is not universal for this frozen failure family and must be narrowed.'
      : 'Every mapped response in the frozen failure family violates the response-lift exclusion condition.',
    summary.safeAlternativeExistsCount
      ? 'At least one hazardous predecessor has a different legal singleton-safe Player-1 response; local response re-synthesis is structurally possible and should be tested before moving the repair earlier.'
      : 'No hazardous predecessor has a different legal singleton-safe Player-1 response; the repair must move earlier in the response circuit rather than rerouting only at the final hazardous decision.'
  ],
  boundary:[
    'This is discovery/qualification evidence only and does not certify the rank-20 root or select an optimal response.',
    'No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Only one-ply legal Player-1 responses are inspected at the already-localized hazardous predecessor states.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.'
  ]
},null,2));

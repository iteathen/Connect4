#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const DESIGN='CPC_RANK20_C5_REPLY5_RESERVOIR_CPC_GUARD_CONFLICT_DIAGNOSTIC_DESIGN_0_1.md';
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
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function exactEqual(a,b){
  if(!a||!b||a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
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
function agreedRestriction(cc){
  return (
    cc.baseline.kind==='CPC_RESTRICT'&&cc.frontier.kind==='CPC_RESTRICT'&&
    cc.baseline.preemptionCount===1&&cc.frontier.preemptionCount===1&&
    cc.baseline.forcedColumn!==null&&cc.baseline.forcedColumn===cc.frontier.forcedColumn
  )?cc.baseline.forcedColumn:null;
}
function exactP1Loss(x){
  return x.kind==='CPC_EXACT'&&x.interval[0]===-1&&x.interval[1]===-1;
}
function classifyCpc(cc,forced,mappedColumn){
  if(forced!==null)return forced===mappedColumn?'CPC_GUARD_MATCH':'CPC_GUARD_CONFLICT';
  if(
    cc.baseline.kind==='CPC_EXACT'&&cc.frontier.kind==='CPC_EXACT'&&
    cc.baseline.interval[0]===cc.frontier.interval[0]&&
    cc.baseline.interval[1]===cc.frontier.interval[1]
  )return 'CPC_EXACT';
  if(cc.baseline.kind!== 'CPC_NONE'||cc.frontier.kind!=='CPC_NONE')return 'CPC_BOUND';
  return 'CPC_NONE';
}

const knownStates=Object.fromEntries(Object.entries(KNOWN_SEQUENCES).map(([name,seq])=>[name,fromSequence(seq)]));
function knownRoot(q){
  if(!q||q.terminal)return null;
  for(const [name,state] of Object.entries(knownStates))if(exactEqual(q,state))return name;
  return null;
}
function legalColumns(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function immediateP1WinningColumns(q){
  if(q.terminal!==0||moverOf(q)!==P1)return [];
  const out=[];
  for(const c of legalColumns(q))if(step(q,c).terminal===P1_WIN)out.push(c+1);
  return out;
}
function knownRootHandoffsAfterOneP1(q){
  if(q.terminal!==0||moverOf(q)!==P1)return [];
  const out=[];
  for(const c of legalColumns(q)){
    const child=step(q,c);
    if(child.terminal!==0)continue;
    const root=knownRoot(child);
    if(root)out.push({p1Column:c+1,knownRoot:root,support:support(child)});
  }
  return out;
}
function buildPairMap(capacity,synchronizedPairs){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  for(const pair of synchronizedPairs){
    const a=pair.columns[0]-1,b=pair.columns[1]-1,L=pair.prefixLength;
    const ha=capacity.initialHeights[a],hb=capacity.initialHeights[b];
    for(let d=0;d<L;d++){
      const ca=(ha+d)*g.columns+a,cb=(hb+d)*g.columns+b;
      mate[ca]=cb;mate[cb]=ca;role[ca]=3;role[cb]=3;
    }
  }
  const partner=new Int32Array(g.columns);partner.fill(-1);
  const prefix=new Uint32Array(g.columns);
  for(const pair of synchronizedPairs){
    const a=pair.columns[0]-1,b=pair.columns[1]-1,L=pair.prefixLength;
    partner[a]=b;partner[b]=a;prefix[a]=L;prefix[b]=L;
  }
  for(let c=0;c<g.columns;c++){
    const h=capacity.initialHeights[c],L=partner[c]>=0?prefix[c]:0,cap=capacity.values[c];
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('odd vertical tail');
      const lo=(h+d)*g.columns+c,hi=(h+d+1)*g.columns+c;
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function pairMapFromCandidate(sourceState,candidate){
  return buildPairMap(
    {values:candidate.capacity,initialHeights:sourceState.support},
    candidate.synchronizedPairs
  );
}
function forcedAlternative(q,forced){
  if(forced===null)return {column:null,legal:false,terminal:null,support:null,knownRoot:null};
  const c=forced-1;
  if(q.words[c]>=g.rows)return {column:forced,legal:false,terminal:null,support:null,knownRoot:null};
  const child=step(q,c);
  return {
    column:forced,
    legal:true,
    terminal:child.terminal,
    support:support(child),
    knownRoot:child.terminal===0?knownRoot(child):null
  };
}
function responseDecision(q,triggerCell,responseCell,index){
  assert.equal(q.terminal,0);
  assert.equal(moverOf(q),P1);
  const cc=cpc(q);
  const forced=agreedRestriction(cc);
  const response=cellDesc(responseCell,q);
  const alternative=forcedAlternative(q,forced);
  const agreedExactP1Loss=exactP1Loss(cc.baseline)&&exactP1Loss(cc.frontier);
  return {
    index,
    rank:rankOf(q),
    support:support(q),
    trigger:cellDesc(triggerCell,q),
    mappedReservoirResponse:response,
    cpc:cc,
    agreedOneColumnRestriction:forced,
    mappedResponseObeysRestriction:forced===null?null:forced===response.column,
    classification:classifyCpc(cc,forced,response.column),
    forcedAlternative:alternative,
    immediateP1WinningColumns:immediateP1WinningColumns(q),
    knownRootHandoffs:knownRootHandoffsAfterOneP1(q),
    agreedExactP1Loss,
    baselineExactP1Loss:exactP1Loss(cc.baseline),
    frontierExactP1Loss:exactP1Loss(cc.frontier)
  };
}
function traceFirstFailure(sourceState,candidate){
  const q=fromSequence(sourceState.sequence);
  const {mate,role}=pairMapFromCandidate(sourceState,candidate);
  let found=null;

  function walk(state,path,decisions){
    if(found)return;
    assert.equal(state.terminal,0);
    assert.equal(moverOf(state),P2);
    for(let c=0;c<g.columns&&!found;c++){
      if(state.words[c]>=g.rows)continue;
      const r=state.words[c],triggerCell=r*g.columns+c,m=mate[triggerCell],mappedRole=role[triggerCell];
      if(mappedRole!==1&&mappedRole!==3){
        found={kind:'unmapped-defender-trigger',path,decisions,trigger:cellDesc(triggerCell,state)};
        return;
      }
      const afterTrigger=step(state,c);
      if(afterTrigger.terminal===P2_WIN){
        found={kind:'defender-terminal',path,decisions,terminalCell:cellDesc(triggerCell,state),pathLength:path.length};
        return;
      }
      if(afterTrigger.terminal!==0){
        found={kind:'other-defender-terminal',path,decisions,terminal:afterTrigger.terminal,trigger:cellDesc(triggerCell,state)};
        return;
      }
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(afterTrigger.words[rc]!==rr){
        found={kind:'response-not-playable',path,decisions,trigger:cellDesc(triggerCell,state),response:cellDesc(m,afterTrigger)};
        return;
      }
      const decision=responseDecision(afterTrigger,triggerCell,m,decisions.length);
      const responseState=step(afterTrigger,rc);
      if(responseState.terminal===P1_WIN)continue;
      if(responseState.terminal!==0){
        found={kind:'other-response-terminal',path,decisions:[...decisions,decision],terminal:responseState.terminal};
        return;
      }
      walk(
        responseState,
        [...path,{trigger:decision.trigger,response:decision.mappedReservoirResponse}],
        [...decisions,decision]
      );
    }
  }
  walk(q,[],[]);
  return found;
}

const partial=JSON.parse(readFileSync(resolve(import.meta.dirname,PARTIAL),'utf8'));
const hazard=JSON.parse(readFileSync(resolve(import.meta.dirname,HAZARD),'utf8'));
assert.equal(partial.schema,'connect4.cpc_rank20_c5_reply5_partial_reservoir_exact_validation_probe.v1');
assert.equal(hazard.schema,'connect4.cpc_rank20_c5_reply5_hazardous_response_predecessor_diagnostic.v1');
for(const source of [partial,hazard]){
  assert.equal(source.jsMinSysSha,EXPECTED);
  assert.equal(source.oracleUsed,false);
  assert.equal(source.solvedInputsUsed,false);
}
assert.equal(partial.states.reduce((s,x)=>s+x.candidates.length,0),13);
assert.equal(hazard.candidates.length,13);

const hazardMap=new Map(hazard.candidates.map(x=>[x.id+'|'+x.signature,x]));
const candidates=[];
const conflictRows=[];
for(const state of partial.states){
  const q=fromSequence(state.sequence);
  assert.equal(q.terminal,0);
  assert.equal(rankOf(q),state.rank);
  assert.deepEqual(support(q),state.support);
  for(const candidate of state.candidates){
    assert.equal(candidate.validation.pass,false);
    const trace=traceFirstFailure(state,candidate);
    assert(trace);
    assert.equal(trace.kind,'defender-terminal');

    const prior=hazardMap.get(state.id+'|'+candidate.signature);
    assert(prior,'missing hazardous source row');
    assert.equal(prior.firstFailure.kind,'defender-terminal');
    assert.equal(trace.pathLength,prior.firstFailure.pathLength);
    assert.equal(trace.terminalCell.cell,prior.firstFailure.terminalCell.cell);
    assert.equal(
      trace.path.length?trace.path[trace.path.length-1].response.cell:null,
      prior.firstFailure.precedingP1Response.cell
    );

    const firstConflict=trace.decisions.findIndex(x=>x.classification==='CPC_GUARD_CONFLICT');
    const firstLoss=trace.decisions.findIndex(x=>x.agreedExactP1Loss);
    assert(firstLoss>=0,'failing trace lacks CPC exact P1-loss decision');

    const earliestConflict=firstConflict>=0?trace.decisions[firstConflict]:null;
    const guardReroutePromising=
      firstConflict>=0&&firstLoss>=0&&firstConflict<firstLoss&&
      earliestConflict.forcedAlternative.legal&&
      earliestConflict.forcedAlternative.terminal!==P2_WIN;

    for(const d of trace.decisions){
      if(d.classification==='CPC_GUARD_CONFLICT'){
        conflictRows.push({
          candidateId:state.id+':'+candidate.signature,
          stateId:state.id,
          pairingSignature:candidate.signature,
          decisionIndex:d.index,
          triggerCell:d.trigger,
          mappedResponseColumn:d.mappedReservoirResponse.column,
          cpcForcedColumn:d.agreedOneColumnRestriction,
          rank:d.rank,
          support:d.support,
          beforeFirstExactLoss:d.index<firstLoss,
          forcedAlternative:d.forcedAlternative
        });
      }
    }

    candidates.push({
      id:state.id,
      signature:candidate.signature,
      sourceRank:state.rank,
      sourceSupport:state.support,
      firstFailureKind:trace.kind,
      terminalCell:trace.terminalCell,
      pathLength:trace.pathLength,
      responseDecisions:trace.decisions,
      firstGuardConflictDecisionIndex:firstConflict>=0?firstConflict:null,
      firstCpcExactP1LossDecisionIndex:firstLoss,
      earliestGuardConflict:earliestConflict,
      guardReroutePromising
    });
  }
}

const recurrenceMap=new Map();
for(const x of conflictRows){
  const key=[
    x.triggerCell.column,x.triggerCell.row,
    x.mappedResponseColumn,x.cpcForcedColumn,
    x.rank,x.support.join(',')
  ].join('|');
  if(!recurrenceMap.has(key))recurrenceMap.set(key,{
    signature:key,count:0,candidateIds:[],triggerCell:x.triggerCell,
    mappedResponseColumn:x.mappedResponseColumn,cpcForcedColumn:x.cpcForcedColumn,
    rank:x.rank,support:x.support,beforeFirstExactLossCount:0,
    forcedAlternativeTerminalHistogram:{}
  });
  const r=recurrenceMap.get(key);
  r.count++;r.candidateIds.push(x.candidateId);
  if(x.beforeFirstExactLoss)r.beforeFirstExactLossCount++;
  const term=String(x.forcedAlternative.terminal);
  r.forcedAlternativeTerminalHistogram[term]=(r.forcedAlternativeTerminalHistogram[term]??0)+1;
}
const recurrence=[...recurrenceMap.values()]
  .map(x=>({...x,candidateIds:[...new Set(x.candidateIds)].sort()}))
  .sort((a,b)=>b.count-a.count||a.signature.localeCompare(b.signature));

const promising=candidates.filter(x=>x.guardReroutePromising).map(x=>x.id+':'+x.signature).sort();
const conflictCandidates=candidates.filter(x=>x.firstGuardConflictDecisionIndex!==null);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_c5_reply5_reservoir_cpc_guard_conflict_diagnostic.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  targetReservoirModified:false,
  bsfpModified:false,
  rerouteExecuted:false,
  design:DESIGN,
  sourceEvidence:{partialReservoir:PARTIAL,hazardousPredecessor:HAZARD},
  candidates,
  recurrence,
  summary:{
    candidateCount:candidates.length,
    responseDecisionCount:candidates.reduce((s,x)=>s+x.responseDecisions.length,0),
    guardConflictDecisionCount:conflictRows.length,
    guardConflictCandidateCount:conflictCandidates.length,
    guardConflictCandidateIds:conflictCandidates.map(x=>x.id+':'+x.signature).sort(),
    guardReroutePromisingCount:promising.length,
    guardReroutePromisingIds:promising,
    firstExactLossDecisionIndexHistogram:Object.fromEntries(
      [...new Set(candidates.map(x=>x.firstCpcExactP1LossDecisionIndex))].sort((a,b)=>a-b)
        .map(i=>[i,candidates.filter(x=>x.firstCpcExactP1LossDecisionIndex===i).length])
    )
  },
  conclusion:[
    'Each frozen maximum-coverage reservoir policy is reconstructed at pinned JSMinSys authority and its deterministic first failing path is replayed independently.',
    'Production CPC baseline and frontier modes are evaluated at every Player-1 mapped-response decision before the first defender terminal.',
    'A guard conflict is recorded only when both CPC modes agree on one exact forced column and the reservoir mapping chooses another column.',
    'The first exact Player-1 loss point requires both CPC modes to return CPC_EXACT with absolute P0 value 1, represented here as interval [-1,-1].',
    promising.length
      ? 'At least one reservoir path contains an earlier CPC guard conflict whose forced alternative is legal and non-P2-terminal before the first exact-loss decision; this is a qualified reroute candidate for a separate experiment.'
      : 'No reservoir path contains a qualifying CPC guard conflict before the first exact-loss decision; the CPC-guard reroute hypothesis is rejected for this frozen family.'
  ],
  boundary:[
    'This is discovery evidence only and does not execute a reroute or certify the rank-20 root.',
    'No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.',
    'CPC_EXACT/BOUND/RESTRICT meanings are consumed read-only from pinned production CPC.'
  ]
},null,2));

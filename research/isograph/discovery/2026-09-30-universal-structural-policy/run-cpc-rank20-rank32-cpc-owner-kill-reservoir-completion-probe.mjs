#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK20_RANK32_TARGET_RESERVOIR_REJECTION_LOCALIZATION_0_1.json';
const AUDIT='CPC_RANK20_RANK32_RECURRING_Q_GENERIC_RCIC_AUDIT_0_1.json';
const DESIGN='CPC_RANK20_RANK32_CPC_OWNER_KILL_RESERVOIR_COMPLETION_PROBE_DESIGN_0_1.md';

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {connect4CpcTargetOwner32}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;

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
function cellDesc(cell,q){
  return {
    cell,
    column:g.cellColumn[cell]+1,
    row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1
  };
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=q.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*g.columns+c,b=(hp+d)*g.columns+p;
        mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('odd vertical tail');
      const lo=(h+d)*g.columns+c,hi=(h+d+1)*g.columns+c;
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function reconstructTemplate(q,partial,candidate){
  assert(Array.isArray(partial.capacity));
  const capacity=Uint32Array.from(partial.capacity);
  const partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);
  for(const pair of candidate.synchronizedPairs){
    const a=pair.columns[0]-1,b=pair.columns[1]-1,L=pair.prefixLength;
    assert(a>=0&&a<g.columns&&b>=0&&b<g.columns&&a!==b);
    assert.equal(partner[a],-1);assert.equal(partner[b],-1);
    partner[a]=b;partner[b]=a;length[a]=L;length[b]=L;
  }
  const map=buildPairMap(q,capacity,partner,length);
  return {mate:Array.from(map.mate),role:Array.from(map.role)};
}
function validateTemplate(q,targetCell,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;
  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(moverOf(state)!==P2){failures.push({kind:'wrong-mover',support:support(state)});return;}
    let legal=0;
    for(let c=0;c<g.columns;c++){
      if(state.words[c]>=g.rows)continue;
      legal++;
      const row=state.words[c],cell=row*g.columns+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r,support:support(state)});
        continue;
      }
      const d=step(state,c);
      if(d.terminal===P2_WIN){
        failures.push({kind:'defender-terminal',column:c+1,row:row+1,support:support(state)});
        continue;
      }
      if(d.terminal){
        failures.push({kind:'other-defender-terminal',terminal:d.terminal,column:c+1,row:row+1});
        continue;
      }
      if(m<0){
        failures.push({kind:'missing-response-mate',trigger:[c+1,row+1]});
        continue;
      }
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){
        failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1],support:support(d)});
        continue;
      }
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){
        p1Terminals++;
        if(m===targetCell)targetTerminals++;
        continue;
      }
      if(a.terminal){
        failures.push({kind:'other-response-terminal',terminal:a.terminal,response:[rc+1,rr+1]});
        continue;
      }
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win',support:support(state)});
  }
  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,
    failures:failures.slice(0,30)
  };
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
const audit=JSON.parse(readFileSync(resolve(import.meta.dirname,AUDIT),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_rank32_target_reservoir_rejection_localization.v1');
assert.equal(audit.schema,'connect4.cpc_rank20_rank32_recurring_q_generic_rcic_audit.v1');
assert.equal(source.jsMinSysSha,EXPECTED);assert.equal(audit.jsMinSysSha,EXPECTED);
assert.equal(source.summary.noCompleteTemplateCount,39);
assert.equal(audit.summary.repeatedQClassCount,34);
assert.equal(audit.summary.totalIncomingTransitionCount,91);
assert.equal(audit.summary.closedClassCount,0);

let sourceUncoveredResidualOccurrenceCount=0,ownerIncompatibleResidualOccurrenceCount=0;
const ownerKillEligibilityCounterexamples=[];
for(const attempt of source.attempts){
  if(attempt.disposition!=='NO_COMPLETE_TEMPLATE')continue;
  const base=fromSequence(attempt.representativeSequence);
  assert.equal(base.terminal,0);assert.equal(rankOf(base),32);assert.equal(moverOf(base),P1);
  const q=step(base,attempt.setupColumn-1);
  assert.equal(q.terminal,0);
  assert.deepEqual(support(q),attempt.afterSetupSupport);
  for(const set of attempt.partial?.bestUncoveredSets??[]){
    for(const residual of set.residuals){
      sourceUncoveredResidualOccurrenceCount++;
      const recomputed=residual.cells.map(c=>({
        cell:c.cell,
        sourceProjectedOwner:c.projectedOwner,
        recomputedProjectedOwner:connect4CpcTargetOwner32(g,q.words,0,c.cell)+1
      }));
      for(const c of recomputed)assert.equal(c.recomputedProjectedOwner,c.sourceProjectedOwner);
      const ownerIncompatible=recomputed.some(c=>c.recomputedProjectedOwner===1);
      if(ownerIncompatible)ownerIncompatibleResidualOccurrenceCount++;
      else ownerKillEligibilityCounterexamples.push({
        exactQClass:attempt.exactQClass,
        setupColumn:attempt.setupColumn,
        target:attempt.target,
        cellSetKey:residual.cellSetKey,
        recomputed
      });
    }
  }
}
assert.equal(sourceUncoveredResidualOccurrenceCount,97);
assert.equal(ownerIncompatibleResidualOccurrenceCount,97);
assert.equal(ownerKillEligibilityCounterexamples.length,0);

const attempts=[];
let maximumCoverageCandidateCount=0,ownerKillEligibleCandidateCount=0,validatedCandidateCount=0;
let validationPassCandidateCount=0,validationFailureCandidateCount=0,noCandidateAttemptCount=0;

for(const attempt of source.attempts){
  if(attempt.disposition!=='NO_COMPLETE_TEMPLATE')continue;
  const base=fromSequence(attempt.representativeSequence);
  const q=step(base,attempt.setupColumn-1);
  assert.equal(q.terminal,0);
  assert.deepEqual(support(q),attempt.afterSetupSupport);
  assert.equal(connect4CpcTargetOwner32(g,q.words,0,attempt.target.cell)+1,attempt.projectedOwner);

  const sourceCandidates=attempt.partial?.maximumCoverageCandidates??[];
  if(sourceCandidates.length===0)noCandidateAttemptCount++;
  const row={
    exactQClass:attempt.exactQClass,
    representativeSequence:attempt.representativeSequence,
    setupColumn:attempt.setupColumn,
    afterSetupSupport:attempt.afterSetupSupport,
    target:attempt.target,
    sourceStructuralPrecondition:attempt.partial?.structuralPrecondition??null,
    candidates:[],
    accepted:false
  };

  for(const candidate of sourceCandidates){
    maximumCoverageCandidateCount++;
    const uncoveredResiduals=candidate.uncoveredResiduals.map(residual=>{
      const cells=residual.cells.map(c=>{
        const owner=connect4CpcTargetOwner32(g,q.words,0,c.cell)+1;
        assert.equal(owner,c.projectedOwner);
        return {...c,recomputedProjectedOwner:owner};
      });
      const killCells=cells.filter(c=>c.recomputedProjectedOwner===1);
      return {
        diagnosticId:residual.diagnosticId,
        cellSetKey:residual.cellSetKey,
        size:residual.size,
        minimal:residual.minimal,
        cells,
        ownerIncompatible:killCells.length>0,
        p1ProjectedKillCells:killCells.map(c=>({cell:c.cell,column:c.column,row:c.row}))
      };
    });
    const ownerKillEligible=uncoveredResiduals.length>0&&uncoveredResiduals.every(x=>x.ownerIncompatible);
    let validation=null;
    if(ownerKillEligible){
      ownerKillEligibleCandidateCount++;
      const template=reconstructTemplate(q,attempt.partial,candidate);
      validation=validateTemplate(q,attempt.target.cell,template);
      validatedCandidateCount++;
      if(validation.pass)validationPassCandidateCount++; else validationFailureCandidateCount++;
    }
    const accept=ownerKillEligible&&validation?.pass===true;
    row.candidates.push({
      signature:candidate.signature,
      targetPrefixLength:candidate.targetPrefixLength,
      synchronizedPairs:candidate.synchronizedPairs,
      coveredCount:candidate.coveredCount,
      uncoveredCount:candidate.uncoveredCount,
      witnessKindHistogram:candidate.witnessKindHistogram,
      uncoveredResiduals,
      ownerKillEligible,
      validation,
      accept
    });
    if(accept)row.accepted=true;
  }
  attempts.push(row);
}
assert.equal(attempts.length,39);

const acceptedAttempts=attempts.filter(x=>x.accepted);
const newlyClosedQClasses=[...new Set(acceptedAttempts.map(x=>x.exactQClass))].sort();
const auditByQ=new Map(audit.rows.map(x=>[x.exactQClass,x]));
let coveredIncomingTransitionCount=0;
for(const q of newlyClosedQClasses){
  const row=auditByQ.get(q);assert(row);
  coveredIncomingTransitionCount+=row.incomingTransitionCount;
}
const coveredIncomingTransitionFraction=coveredIncomingTransitionCount/audit.summary.totalIncomingTransitionCount;

const failureKinds={};
for(const a of attempts)for(const c of a.candidates){
  if(c.ownerKillEligible&&c.validation&&!c.validation.pass){
    for(const f of c.validation.failures)failureKinds[f.kind]=(failureKinds[f.kind]??0)+1;
  }
}

const summary={
  sourceNoCompleteTemplateAttemptCount:39,
  sourceUncoveredResidualOccurrenceCount,
  ownerIncompatibleResidualOccurrenceCount,
  ownerIncompatibleResidualFraction:ownerIncompatibleResidualOccurrenceCount/sourceUncoveredResidualOccurrenceCount,
  ownerKillEligibilityCounterexampleCount:ownerKillEligibilityCounterexamples.length,
  maximumCoverageCandidateCount,
  ownerKillEligibleCandidateCount,
  validatedCandidateCount,
  validationPassCandidateCount,
  validationFailureCandidateCount,
  noCandidateAttemptCount,
  acceptedAttemptCount:acceptedAttempts.length,
  newlyClosedQClassCount:newlyClosedQClasses.length,
  coveredIncomingTransitionCount,
  coveredIncomingTransitionFraction,
  totalIncomingTransitionCount:audit.summary.totalIncomingTransitionCount,
  validationFailureKinds:failureKinds
};

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_rank32_cpc_owner_kill_reservoir_completion_probe.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  targetReservoirModified:false,
  bsfpModified:false,
  design:DESIGN,
  sourceEvidence:SOURCE,
  recurringQAudit:AUDIT,
  ownerKillEligibilityCounterexamples,
  attempts,
  newlyClosedQClasses,
  newlyClosedQClassImpact:newlyClosedQClasses.map(q=>({
    exactQClass:q,
    incomingTransitionCount:auditByQ.get(q).incomingTransitionCount,
    sourceLeafIds:auditByQ.get(q).sourceLeafIds,
    macroLabels:auditByQ.get(q).macroLabels
  })),
  summary,
  conclusion:[
    'The probe replays every frozen NO_COMPLETE_TEMPLATE attempt and recomputes CPC owner projection on every uncovered residual cell before any research-side discharge is considered.',
    ownerKillEligibilityCounterexamples.length===0
      ? 'Every frozen uncovered P2 residual occurrence contains at least one CPC-projected P1 cell; the 97/97 source observation survives exact replay.'
      : 'At least one frozen uncovered P2 residual lacks a CPC-projected P1 cell, falsifying universal owner-kill eligibility on this source family.',
    validationPassCandidateCount>0
      ? 'At least one owner-kill-eligible maximum-coverage pairing passes the existing unchanged exhaustive deterministic pairing traversal, establishing exact finite fixed-policy certificates for those post-setup states.'
      : 'No owner-kill-eligible maximum-coverage pairing passes the unchanged exhaustive pairing traversal; CPC owner incompatibility alone does not repair this reservoir family.',
    newlyClosedQClasses.length>0
      ? 'The validated finite certificates close at least one previously unresolved recurring rank-32 semantic q hub and therefore cover its incoming consequence transitions.'
      : 'No previously unresolved recurring rank-32 semantic q hub is closed by this probe.'
  ],
  boundary:[
    'This exact finite qualification does not authorize deleting arbitrary P2 residuals from production target-reservoir synthesis based only on CPC owner projection.',
    'A reusable CPC-owner-kill theorem still requires a separate guard-survival/congruence proof over the response policy.',
    'No oracle, Pons score, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.'
  ]
},null,2));

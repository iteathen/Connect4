#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const dir=resolve(import.meta.dirname);
const read=name=>JSON.parse(readFileSync(resolve(dir,name),'utf8'));

const guardD15=read('CPC_CURRENT_STATE_GUARD_SET_D15_0_1.json');
const guardFresh=read('CPC_GUARD_SET_FRESH_STRUCTURAL_0_1.json');
const compression=read('CPC_TRIGGER5_FORCED_COMPRESSION_0_1.json');
const reservoir=read('CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_0_1.json');
const bx=read('CPC_BX_VIABILITY_FINITE_RESERVOIR_0_1.json');
const phase=read('CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json');

function assertSourceFlags(name,x){
  if(x.oracleUsed!==false)throw new Error(name+' oracle flag is not false');
  if(x.solvedInputsUsed!==false)throw new Error(name+' solved-input flag is not false');
}
for(const [name,x] of Object.entries({guardD15,guardFresh,compression,reservoir,bx,phase}))assertSourceFlags(name,x);

function allAcceptBooleansTrue(value,path='',out=[]){
  if(value===null||value===undefined)return out;
  if(Array.isArray(value)){
    for(let i=0;i<value.length;i++)allAcceptBooleansTrue(value[i],path+'['+i+']',out);
    return out;
  }
  if(typeof value==='object'){
    for(const [k,v] of Object.entries(value)){
      const p=path?path+'.'+k:k;
      if(k==='accept'&&typeof v==='boolean')out.push({path:p,value:v});
      allAcceptBooleansTrue(v,p,out);
    }
  }
  return out;
}

const guardWitnesses=guardD15.result?.witnessByTrigger??[];
const guardResponseTotal=
  guardD15.result?.accept===true&&
  guardWitnesses.length===7&&
  new Set(guardWitnesses.map(x=>x.attackerColumn)).size===7&&
  guardWitnesses.every(x=>x.closed===false&&x.mode==='GUARDSET_RESPONSE'&&x.childClass==='GUARDSET_D13'&&Array.isArray(x.guardsAfter)&&x.guardsAfter.length>0);
const guardFreshReconstructible=
  guardFresh.roots===21&&
  guardFresh.twoPlyTransitions===966&&
  guardFresh.consumedBoundaryUsed===false&&
  Array.isArray(guardFresh.ranksCovered)&&guardFresh.ranksCovered.length>0&&
  Array.isArray(guardFresh.guardsObserved)&&guardFresh.guardsObserved.length===7;

const directCompression=compression.rows.filter(x=>x.mode==='direct-c5-reply');
const offCompression=compression.rows.filter(x=>x.mode==='off-column-compression');
const compressionDirectClosed=
  directCompression.length===1&&
  directCompression[0].closesByImmediateP1Win===true&&
  directCompression[0].nextAttack?.terminal===3;
const compressionOffDecrease=
  offCompression.length===4&&
  offCompression.every(x=>
    x.replyTerminal===0&&
    x.nativeCpcForcesColumn5===true&&
    x.literalOnlyColumn5AvoidsImmediateWin===true&&
    x.forcedReply?.terminal===0&&
    x.consumeTarget?.terminal===0&&
    x.attachment?.pairStillMinimalBeforeConsume===true&&
    x.attachment?.singletonAfterConsume===true&&
    x.attachment?.pairAfterConsume===false&&
    x.contractsToProjectedP1Singleton===true
  );
const compressionAllBranches=compression.accept===true&&compressionDirectClosed&&compressionOffDecrease;

const reservoirRows=reservoir.rows??[];
const reservoirRowChecks=reservoirRows.map(row=>({
  firstResponseColumn:row.firstResponseColumn,
  activeTarget:row.target?.activeP1Singleton===true,
  targetProjectedToP1:row.target?.projectedOwner===1,
  noPlayableDefenderSingleton:Array.isArray(row.defenderPlayableSingletons)&&row.defenderPlayableSingletons.length===0,
  targetIsResponse:row.template?.targetIsResponse===true,
  finiteEvenReservoir:Number.isInteger(row.template?.totalRelevant)&&row.template.totalRelevant>0&&(row.template.totalRelevant%2===0),
  obligationCoverageComplete:
    Array.isArray(row.template?.coverage)&&
    row.template.coverage.length===row.template.defenderResidualCount,
  validationPass:row.validation?.pass===true&&Array.isArray(row.validation?.failures)&&row.validation.failures.length===0,
  accept:row.accept===true
}));
const reservoirResponseTotal=
  reservoir.accept===true&&
  reservoirRows.length===4&&
  reservoirRowChecks.every(x=>x.activeTarget&&x.targetProjectedToP1&&x.noPlayableDefenderSingleton&&x.targetIsResponse&&x.finiteEvenReservoir&&x.obligationCoverageComplete&&x.validationPass&&x.accept);
const reservoirCoverage=reservoirRowChecks.every(x=>x.obligationCoverageComplete);
const reservoirProgress=
  reservoirRowChecks.every(x=>x.finiteEvenReservoir&&x.targetIsResponse)&&
  reservoir.conclusion.some(x=>x.includes('finite truncated synchronized pairing'));

const bxStateEntries=Object.entries(bx.stateInfo??{});
const bxAllViable=bxStateEntries.length>0&&bxStateEntries.every(([,s])=>s.Bx===1);
const bxChecks=bx.checks??[];
const bxExpose=bxChecks.filter(x=>x.label==='EXPOSE');
const bxTransfer=bxChecks.filter(x=>x.label==='TRANSFER');
const bxAllExposureTerminal=
  bxExpose.length>0&&
  bxExpose.every(x=>x.ok===true&&x.deltaBx===1&&x.postBx===0&&x.responseTerminal===3);
const bxAllTransferViable=
  bxTransfer.length>0&&
  bxTransfer.every(x=>x.ok===true&&x.deltaBx===0&&x.postBx===1&&x.responseTerminal===0);
const bxAllTransferDecrease=
  bxTransfer.every(x=>Number.isInteger(x.c7CapacityBefore)&&Number.isInteger(x.c7CapacityAfter)&&x.c7CapacityAfter<x.c7CapacityBefore);
const bxInduction=
  bx.induction?.rootProved===true&&
  Array.isArray(bx.induction?.provedStates)&&
  bx.induction.provedStates.length===bxStateEntries.length&&
  (bx.induction?.proofOrder??[]).every((x,i,a)=>i===0||x.R>=a[i-1].R);

const phaseAcceptFlags=allAcceptBooleansTrue(phase.policy);
const phasePolicyAllAccepted=phaseAcceptFlags.length>0&&phaseAcceptFlags.every(x=>x.value===true);
const exactSinkEquality=
  phase.sinkEquality?.ZA_ZB===true&&
  phase.sinkEquality?.ZA_ZC===true&&
  phase.sinkEquality?.ZB_ZC===true;

const mechanisms={
  guardSet:{
    classification:'CIC',
    sourceFiles:[
      'CPC_CURRENT_STATE_GUARD_SET_D15_0_1.json',
      'CPC_GUARD_SET_FRESH_STRUCTURAL_0_1.json'
    ],
    sourceAccept:guardD15.result?.accept===true,
    resource:'reconstructed current-state guard set Gamma(q)',
    obligations:'survival obligations under the frozen response grammar',
    responseTotal:guardResponseTotal,
    currentStateResourceReconstructible:guardFreshReconstructible,
    exactReentry:guardWitnesses.every(x=>x.childClass==='GUARDSET_D13'),
    progressRank:null,
    winClaim:false,
    safetyClaim:true,
    evidence:{
      rootGuards:guardD15.result?.guards??[],
      triggerCount:guardWitnesses.length,
      freshRoots:guardFresh.roots,
      freshTwoPlyTransitions:guardFresh.twoPlyTransitions,
      guardColumnsObserved:guardFresh.guardsObserved
    }
  },
  forcedCompression:{
    classification:'PROGRESS_EDGE',
    sourceFiles:['CPC_TRIGGER5_FORCED_COMPRESSION_0_1.json'],
    sourceAccept:compression.accept===true,
    resource:'CPC forced-reply channel plus exact residual attachment',
    obligations:'attached two-cell Player-1 residual',
    responseTotal:compressionAllBranches,
    allBranchesCloseOrDecrease:compressionAllBranches,
    progressMeasure:{kind:'live-residual-cardinality',before:2,after:1},
    directTerminalBranches:directCompression.map(x=>x.responseColumn),
    decreasingBranches:offCompression.map(x=>x.responseColumn),
    standaloneWinClaim:false,
    requiresDownstreamCertificate:true
  },
  targetReservoir:{
    classification:'RCIC',
    sourceFiles:['CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_0_1.json'],
    sourceAccept:reservoir.accept===true,
    resource:'finite truncated event reservoir plus synchronized/vertical response pairing',
    obligations:'all active defender residuals plus active Player-1 singleton target viability',
    responseTotal:reservoirResponseTotal,
    obligationCoverageComplete:reservoirCoverage,
    progressRank:{kind:'remaining-truncated-relevant-events',decreasePerNonterminalMacro:2},
    wellFoundedProgress:reservoirProgress,
    winClaim:true,
    rows:reservoirRowChecks
  },
  bxPhase:{
    classification:'RCIC',
    sourceFiles:['CPC_BX_VIABILITY_FINITE_RESERVOIR_0_1.json'],
    sourceAccept:bx.accept===true,
    resource:'Bx=1 viability plus finite c7 phase reservoir',
    obligations:'preserve viable control state until exposure',
    responseTotal:bxChecks.every(x=>x.ok===true),
    allStatesViable:bxAllViable,
    allExposureEdgesTerminal:bxAllExposureTerminal,
    allTransferEdgesPreserveViability:bxAllTransferViable,
    allTransferEdgesDecreaseRank:bxAllTransferDecrease,
    progressRank:{kind:'remaining-c7-capacity'},
    rootProvedByInduction:bxInduction,
    winClaim:true,
    transferCount:bxTransfer.length,
    exposureCount:bxExpose.length,
    proofOrder:bx.induction?.proofOrder??[]
  },
  phaseStateMachine:{
    classification:'RCIC_REALIZATION',
    sourceFiles:['CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json'],
    sourceAccept:phase.accept===true,
    resource:'finite exact phase-transfer state machine over c3/c5/c7',
    obligations:'maintain attached terminal exposures while transporting phase',
    responseTotal:phasePolicyAllAccepted,
    exactSinkEquality,
    subordinateTo:'bxPhase',
    winClaim:true,
    acceptedPolicyEdges:phaseAcceptFlags.length
  }
};

if(!mechanisms.guardSet.responseTotal||!mechanisms.guardSet.currentStateResourceReconstructible)throw new Error('guard-set CIC audit failed');
if(!mechanisms.forcedCompression.allBranchesCloseOrDecrease)throw new Error('compression progress-edge audit failed');
if(!mechanisms.targetReservoir.responseTotal||!mechanisms.targetReservoir.obligationCoverageComplete||!mechanisms.targetReservoir.wellFoundedProgress)throw new Error('target-reservoir RCIC audit failed');
if(!mechanisms.bxPhase.responseTotal||!mechanisms.bxPhase.allStatesViable||!mechanisms.bxPhase.allExposureEdgesTerminal||!mechanisms.bxPhase.allTransferEdgesPreserveViability||!mechanisms.bxPhase.allTransferEdgesDecreaseRank||!mechanisms.bxPhase.rootProvedByInduction)throw new Error('Bx RCIC audit failed');
if(!mechanisms.phaseStateMachine.responseTotal||!mechanisms.phaseStateMachine.exactSinkEquality)throw new Error('phase state-machine realization audit failed');

console.log(JSON.stringify({
  schema:'connect4.rlc_ranked_controlled_invariant_instantiation_audit.v1',
  date:'2026-10-01',
  theorem:'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
  design:'RLC_RANKED_CONTROLLED_INVARIANT_INSTANTIATION_AUDIT_DESIGN_0_1.md',
  oracleUsed:false,
  solvedInputsUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  mechanisms,
  merger:{
    guardSetIsSafetySuperclass:
      mechanisms.guardSet.classification==='CIC'&&mechanisms.guardSet.winClaim===false,
    compressionIsProgressGenerator:
      mechanisms.forcedCompression.classification==='PROGRESS_EDGE'&&mechanisms.forcedCompression.requiresDownstreamCertificate===true,
    reservoirAndPhaseShareRcicSchema:
      mechanisms.targetReservoir.classification==='RCIC'&&mechanisms.bxPhase.classification==='RCIC',
    finitePhaseMachineIsRcicRealization:
      mechanisms.phaseStateMachine.classification==='RCIC_REALIZATION'&&mechanisms.phaseStateMachine.subordinateTo==='bxPhase',
    newTopLevelPrimitiveRequired:false
  },
  conclusion:[
    'The guard-set result fits the controlled-invariant safety superclass and deliberately lacks a win-progress rank.',
    'Trigger-5 forced compression is best represented as a ranked progress edge: every branch either wins immediately or reduces a two-cell live obligation to a singleton.',
    'Truncated target-reservoir pairing is a full ranked controlled-invariant certificate over a finite paired event reservoir.',
    'Bx viability / phase transfer is a full ranked controlled-invariant certificate with remaining c7 capacity as an explicit decreasing rank.',
    'The finite three-column phase-transfer machine is a concrete exact state-machine realization of the same ranked viability-plus-reservoir theorem rather than a separate top-level proof species.',
    'The four recent mechanisms therefore reduce to one safety superclass, one ranked win subclass, and reusable progress/handoff edge generators.'
  ],
  boundary:[
    'This audit changes theorem taxonomy only and proves no new Connect Four state.',
    'All source artifacts were already qualified independently; this audit does not promote diagnostic W/D/L into a premise.',
    'No production CPC, JSMinSys, or BSFP code is modified.',
    'A future obstruction must first be routed through CIC/RCIC resources, responses, progress edges, and exact theorem-root handoffs before a new proof primitive is proposed.'
  ]
},null,2));

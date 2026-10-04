import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const base='research/isograph/discovery';
const oldBase=`${base}/2026-09-30-universal-structural-policy`;
const triBase=`${base}/2026-10-03-triadic-relational-normalization`;

function readJson(path){
  return JSON.parse(fs.readFileSync(path,'utf8'));
}
function runJson(path,args=[]){
  return JSON.parse(execFileSync(process.execPath,[path,...args],{
    encoding:'utf8',
    maxBuffer:256*1024*1024,
  }));
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function changedIndices(a,b,project){
  const out=[];
  for(let i=0;i<Math.min(a.length,b.length);i++)
    if(!same(project(a[i]),project(b[i])))out.push(i);
  return out;
}
function hasReentry(activitySets){
  for(let e=0;e<3;e++){
    let seen=false,gap=false;
    for(const set of activitySets){
      const active=set.includes(e);
      if(active&&seen&&gap)return true;
      if(active)seen=true;
      else if(seen)gap=true;
    }
  }
  return false;
}
function visitsAllThree(activitySets){
  const u=new Set(activitySets.flat());
  return u.size===3;
}

const targetPath=process.argv[2]??`${triBase}/artifacts/cpcx-target-transfer.json`;
const pilot=readJson(`${oldBase}/CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json`);
const gauge=readJson(`${oldBase}/CPC_FORMULA_COUPLED_GAUGE_EQUATION_BRIDGE_0_1.json`);
const uc4a=readJson(`${oldBase}/UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_0_1.json`);
const cpcx=readJson(targetPath);

const offdiag=runJson(`${triBase}/run-off-diagonal-incidence-falsifier.mjs`,[targetPath]);
const seam=runJson(`${triBase}/run-cpcx-pair-relation-seam-normalization.mjs`);

const channelVector=x=>[
  x.capacity,x.depth0,x.positiveDepth,
  x.p1Depth0,x.p1PositiveDepth,
  x.p2Depth0,x.p2PositiveDepth,
];
const edgeVector=x=>[x.deltaCapacity,x.deltaPositiveDepth,x.relation];

const byState=new Map();
for(const row of pilot.rows??[]){
  const rec={
    state:row.state,
    next:row.next??null,
    label:row.label,
    changedRoles:changedIndices(row.pre.channels,row.post.channels,channelVector),
    changedEdges:changedIndices(row.pre.edges,row.post.edges,edgeVector),
  };
  if(!byState.has(row.state))byState.set(row.state,[]);
  byState.get(row.state).push(rec);
}

const historicalPaths=[];
function dfs(state,steps=[],depth=0){
  if(depth>16)throw new Error('historical transfer graph exceeded frozen depth bound');
  for(const row of byState.get(state)??[]){
    const next=[...steps,{
      state:row.state,
      next:row.next,
      label:row.label,
      changedRoles:row.changedRoles,
      changedEdges:row.changedEdges,
    }];
    if(row.next)dfs(row.next,next,depth+1);
    else historicalPaths.push(next);
  }
}
dfs('Q');

const historicalPathSummary=historicalPaths.map(steps=>({
  states:steps.map(x=>x.state),
  labels:steps.map(x=>x.label),
  activity:steps.map(x=>x.changedEdges),
  visitsAllThree:visitsAllThree(steps.map(x=>x.changedEdges)),
  reentry:hasReentry(steps.map(x=>x.changedEdges)),
}));

const cpcxCircuitFailures=[];
let cpcxThreeRoleStateCount=0;
for(let i=0;i<(cpcx.rows??[]).length;i++){
  const support=cpcx.rows[i].residual?.supportVector;
  if(!Array.isArray(support)||support.length!==3)continue;
  cpcxThreeRoleStateCount++;
  const d01=support[1]-support[0],
    d02=support[2]-support[0],
    d12=support[2]-support[1],
    residual=d01+d12-d02;
  if(residual!==0)cpcxCircuitFailures.push({row:i,support,residual});
}

const recoords=[];
for(const source of cpcx.rows??[]){
  for(const e of source.responses??[]){
    if(e.role!=='PROTECTED_TARGET_OCCUPATION')continue;
    recoords.push({
      sourceDestroyed:e.oldResidualKilled===true,
      replacementCandidateCount:e.transferAttachmentCount??0,
      bestOverlapCount:e.bestTransfer?.overlapCount??null,
      sourceSupportDebt:source.residual?.supportDebt??null,
      replacementSupportDebt:e.bestTransfer?.supportDebt??null,
      strictLower:e.transferTupleStrictlyLower===true,
    });
  }
}
const exactRecoordination=recoords.some(x=>
  x.sourceDestroyed&&
  x.replacementCandidateCount>0&&
  (x.bestOverlapCount??0)>0&&
  x.strictLower
);

const dominant=(uc4a.part5?.recurringDefects??[])
  .find(x=>x.directionId==='D-8c7a3367fd7b3e71')??null;

const delta1=gauge.systems?.DELTA?.find(x=>x.degree===1)??null;
const delta2=gauge.systems?.DELTA?.find(x=>x.degree===2)??null;

const historical={
  K0Circuit:
    gauge.structuralChecks?.allPairDeltaCircuitsClose===true,
  K1OffDiagonal:
    offdiag.historical?.allExactOffDiagonal===true&&
    offdiag.historical?.persistentExactOffDiagonal===true,
  K0S3:
    offdiag.historical?.s3Invariant===true,
  K2InteractionOrder:
    (delta1?.contradictions??0)>0&&
    (delta2?.contradictions??1)===0,
  regimeRecurrence:Boolean(
    dominant&&dominant.extendedGridRecurring===true&&
    (dominant.axes?.length??0)>=2&&
    (dominant.families?.length??0)>=2
  ),
  K4ThreeChannelVisit:
    historicalPathSummary.some(x=>x.visitsAllThree),
  K4Reentry:
    historicalPathSummary.some(x=>x.reentry),
  completePathCount:historicalPathSummary.length,
  reentryPathCount:historicalPathSummary.filter(x=>x.reentry).length,
  threeChannelVisitPathCount:
    historicalPathSummary.filter(x=>x.visitsAllThree).length,
  pathWitnesses:historicalPathSummary
    .filter(x=>x.reentry||x.visitsAllThree)
    .slice(0,8),
};

const current={
  K0Circuit:
    cpcxThreeRoleStateCount>0&&cpcxCircuitFailures.length===0,
  K1OffDiagonal:
    offdiag.cpcx?.allExactOffDiagonal===true,
  K0S3:
    offdiag.cpcx?.s3Invariant===true,
  K3Recoordination:exactRecoordination,
  K4AllThreeVisit:
    seam.signal?.cpcxHasAllThreeVisit===true,
  K4Reentry:
    seam.signal?.cpcxHasReturnToPriorPair===true,
  threeRoleStateCount:cpcxThreeRoleStateCount,
  circuitFailures:cpcxCircuitFailures,
  pairOccurrenceCounts:
    seam.cpcx?.exactSemanticPairOccurrenceCounts??{},
  pairAdjacency:
    seam.cpcx?.pairAdjacency??{},
  seamDistinctWords:
    (seam.cpcx?.distinctWords??[]).map(x=>({
      word:x.word,count:x.count,examples:x.examples
    })),
  recoordinationWitnesses:recoords,
};

const sharedKernel=
  historical.K0Circuit&&historical.K1OffDiagonal&&historical.K0S3&&
  current.K0Circuit&&current.K1OffDiagonal&&current.K0S3;

const sharedOrderedTransport=
  historical.K4ThreeChannelVisit&&historical.K4Reentry&&
  current.K4AllThreeVisit&&current.K4Reentry;

const result={
  schema:'connect4.triadic.anonymous_transition_system_conformance.v0_1',
  design:'ANONYMOUS_TRIADIC_RELATIONAL_TRANSITION_SYSTEM_DESIGN_0_1.md',
  historical,
  cpcx:current,
  comparison:{
    sharedKernel,
    sharedOrderedThreeChannelVisitAndReentry:sharedOrderedTransport,
    historicalOnlyQualified:{
      K2InteractionOrder:historical.K2InteractionOrder,
      regimeRecurrence:historical.regimeRecurrence,
    },
    cpcxOnlyQualified:{
      K3Recoordination:current.K3Recoordination,
    },
    K5OperationalAblation:'UNPROVED',
    conformanceStatus:
      sharedKernel
        ? 'SHARED_KERNEL_WITH_PARTIAL_ENRICHMENT'
        : 'SHARED_KERNEL_FALSIFIED',
    exactIsomorphismEstablished:false,
  },
  claimBoundary:{
    noSolvedData:true,
    noOracle:true,
    noBestMove:true,
    noRemoteness:true,
    noThreeBodyPremise:true,
    circuitClosureAloneNotEvidence:true,
    coordinateDeletionNotAcceptedAsK5:true,
  },
};

console.log(JSON.stringify(result,null,2));

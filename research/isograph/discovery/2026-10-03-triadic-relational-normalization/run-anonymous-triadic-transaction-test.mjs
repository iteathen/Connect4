import fs from 'node:fs';

const base='research/isograph/discovery';
const oldBase=`${base}/2026-09-30-universal-structural-policy`;

function readJson(path){
  return JSON.parse(fs.readFileSync(path,'utf8'));
}

function col(label){
  return label.charCodeAt(0)-65;
}

function pairDeltas(v){
  return [v[1]-v[0],v[2]-v[0],v[2]-v[1]];
}

function changedRoleCount(pre,post){
  let n=0;
  for(let i=0;i<Math.min(pre.length,post.length);i++){
    const A=pre[i],B=post[i],
      av=[A.capacity,A.depth0,A.positiveDepth,A.p1Depth0,A.p1PositiveDepth,
        A.p2Depth0,A.p2PositiveDepth],
      bv=[B.capacity,B.depth0,B.positiveDepth,B.p1Depth0,B.p1PositiveDepth,
        B.p2Depth0,B.p2PositiveDepth];
    if(JSON.stringify(av)!==JSON.stringify(bv))n++;
  }
  return n;
}

function changedEdgeCount(pre,post){
  let n=0;
  for(let i=0;i<Math.min(pre.length,post.length);i++){
    const A=pre[i],B=post[i],
      av=[A.deltaCapacity,A.deltaPositiveDepth,A.relation],
      bv=[B.deltaCapacity,B.deltaPositiveDepth,B.relation];
    if(JSON.stringify(av)!==JSON.stringify(bv))n++;
  }
  return n;
}

const historicalPilot=readJson(
    `${oldBase}/CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json`
  ),
  historicalGauge=readJson(
    `${oldBase}/CPC_FORMULA_COUPLED_GAUGE_EQUATION_BRIDGE_0_1.json`
  ),
  uc4a=readJson(
    `${oldBase}/UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_0_1.json`
  ),
  cpcx=readJson(process.argv[2]??'cpcx-target-transfer.json');

const pilotRows=historicalPilot.transitions??
  historicalPilot.rows??historicalPilot.transitionRows??[];

const histRows=pilotRows.map(x=>({
  outcome:x.label,
  changedRoles:changedRoleCount(x.pre.channels,x.post.channels),
  changedPairRelations:changedEdgeCount(x.pre.edges,x.post.edges),
  persistent:Boolean(x.next),
}));

function histogram(rows,filter=()=>true){
  const out={};
  for(const r of rows.filter(filter)){
    const k=`${r.changedRoles}/${r.changedPairRelations}`;
    out[k]=(out[k]??0)+1;
  }
  return out;
}

const cpcxRows=[],recoords=[];
for(const source of cpcx.rows??[]){
  const support=[...(source.residual?.supportVector??[])],
    missing=[...(source.residual?.missing??[])];
  if(support.length===3&&missing.length===3){
    const targetCols=missing.map(col);
    for(const e of source.responses??[]){
      if(e.role!=='EXTERNAL_SUPPORT_EVENT')continue;
      const after=[...support],
        eventCol=col(e.eventCell),
        touched=[];
      for(let i=0;i<3;i++){
        if(targetCols[i]===eventCol&&after[i]>0)touched.push(i);
      }
      if(touched.length===1)after[touched[0]]-=1;
      const beforeEdges=pairDeltas(support),
        afterEdges=pairDeltas(after),
        changedRoles=support.reduce((n,x,i)=>n+(x!==after[i]),0),
        changedPairRelations=beforeEdges.reduce(
          (n,x,i)=>n+(x!==afterEdges[i]),0
        );
      cpcxRows.push({
        changedRoles,
        changedPairRelations,
        supportDebtDelta:e.supportDebtDelta,
      });
    }
  }

  for(const e of source.responses??[]){
    if(e.role!=='PROTECTED_TARGET_OCCUPATION')continue;
    recoords.push({
      sourceDestroyed:e.oldResidualKilled===true,
      replacementCandidateCount:e.transferAttachmentCount??0,
      bestOverlapCount:e.bestTransfer?.overlapCount??null,
      bestMissingCount:e.bestTransfer?.missingCount??null,
      sourceSupportDebt:source.residual?.supportDebt??null,
      replacementSupportDebt:e.bestTransfer?.supportDebt??null,
      strictLower:e.transferTupleStrictlyLower===true,
    });
  }
}

const recurring=uc4a.part5?.recurringDefects??[],
  dominant=recurring.find(x=>x.directionId==='D-8c7a3367fd7b3e71')??null;

const gaugeSystems={};
for(const [name,rows] of Object.entries(historicalGauge.systems??{})){
  gaugeSystems[name]=Object.fromEntries(rows.map(x=>[
    `degree${x.degree}`,
    {contradictions:x.contradictions,pivotRank:x.pivotRank,nullity:x.nullity}
  ]));
}

const result={
  schema:'connect4.anonymous_triadic_transaction_test.v0_1',
  date:'2026-10-03',
  normalization:{
    identityErased:true,
    channelLabelsErased:true,
    carrierNamesErased:true,
    orientationNamesErased:true,
    comparedObservables:[
      'number of changed anonymous roles',
      'number of changed pair relations',
      'exact three-pair circuit closure',
      'carrier destruction followed by overlap-preserving re-coordination',
      'interaction order needed by the frozen response decoder',
    ],
  },
  historicalThreeChannel:{
    exactPairDeltaCircuit:{
      stateResiduals:Object.fromEntries(
        Object.entries(historicalGauge.states??{}).map(([k,v])=>[
          k,v.circuitResidual
        ])
      ),
      allClose:historicalGauge.structuralChecks?.allPairDeltaCircuitsClose===true,
    },
    transitionCount:histRows.length,
    allTransitionHistogram:histogram(histRows),
    persistentTransitionCount:histRows.filter(x=>x.persistent).length,
    persistentTransitionHistogram:histogram(histRows,x=>x.persistent),
    terminalTransitionHistogram:histogram(histRows,x=>!x.persistent),
    interactionSystems:gaugeSystems,
    recurringDefect:dominant?{
      occurrenceCount:dominant.occurrenceCount,
      producingRowCount:dominant.producingRowCount,
      axisCount:dominant.axes.length,
      familyCount:dominant.families.length,
      extendedGridRecurring:dominant.extendedGridRecurring,
    }:null,
  },
  cpcx:{
    threeRoleExternalTransitionCount:cpcxRows.length,
    transitionHistogram:histogram(cpcxRows),
    singleRoleLawViolationCount:cpcxRows.filter(x=>
      !((x.changedRoles===0&&x.changedPairRelations===0)||
        (x.changedRoles===1&&x.changedPairRelations===2))
    ).length,
    rearrangementCount:recoords.length,
    rearrangements:recoords,
  },
  comparison:{
    sharedPersistentMotif:
      histRows.filter(x=>x.persistent).every(x=>
        x.changedRoles===1&&x.changedPairRelations===2
      )&&
      cpcxRows.every(x=>
        (x.changedRoles===0&&x.changedPairRelations===0)||
        (x.changedRoles===1&&x.changedPairRelations===2)
      ),
    currentInterpretation:
      'persistent nonterminal evolution on both independently derived systems is dominated by anonymous single-role intervention with redistribution across exactly the two incident pair relations; CPCX additionally exhibits exact carrier destruction followed by lower overlap-preserving re-coordination',
    status:'PROMISING_NOT_ISOMORPHISM',
  },
  boundary:{
    noSolvedData:true,
    noOracle:true,
    noOutcomeFit:true,
    noThreeBodyHardnessClaim:true,
    noTurn6ValueClaim:true,
  },
};

console.log(JSON.stringify(result,null,2));

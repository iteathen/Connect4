import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {
  collapseCpcxDebtRepairTokenProduct,
} from './cpcx-token-collapse.mjs';

const g=createCpcxGeometry(),
  targetLineLabel='A6-B5-C4-D3',
  fixtures=[
    {id:'U4',sequence:'4444447677'},
    {id:'U5',sequence:'4444447577'},
    {id:'U12',sequence:'444444767577'},
    {id:'U13',sequence:'444444776566'},
  ];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function canonicalWing(contract){
  const columns=contract.anchoredLine.triggerCells
    .map(cell=>cpcxCell(g,cell).column)
    .sort((a,b)=>a-b);
  return columns.join(',')==='0,1,2'&&
    cpcxCell(g,contract.anchoredLine.anchorCell).column===3;
}

function parityOfEvent(e){
  if(Number.isInteger(e.eventRankParity))return e.eventRankParity;
  if(Number.isInteger(e.eventRank))return e.eventRank&1;
  return null;
}

function residualSummary(r){
  if(!r)return null;
  return {
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    orientation:r.orientation,
    player:r.player,
    missingCount:r.missingCount,
    missingCells:[...(r.missingCells??[])].map(label),
    eventParity:(r.events??[]).map(parityOfEvent),
    events:(r.events??[]).map(e=>({
      cell:label(e.cell),
      minSupportDistance:e.minSupportDistance??null,
      maxSupportDistance:e.maxSupportDistance??null,
      eventRankParity:parityOfEvent(e),
    })),
    supportProfiles:(r.supportProfiles??[]).map(x=>[...x]),
    supportProfilesExact:r.supportProfilesExact===true,
  };
}

function targetResidual(rows){
  return (rows??[]).find(r=>r.lineLabel===targetLineLabel)??null;
}

function blockerIntersection(carrier,residual){
  if(!residual)return [];
  const target=new Set(residual.missingCells??[]),out=[];
  for(const token of carrier?.blockerTokens??[])
    for(const cell of token.candidateCells??[])
      if(target.has(cell))out.push(cell);
  return [...new Set(out)].sort((a,b)=>a-b).map(label);
}

function componentSummary(component,index){
  const r=targetResidual(component.guaranteedResiduals);
  return {
    index,
    rankOptions:[...(component.rank?.options??[])],
    nextMover:component.nextMover??null,
    sourceKind:component.source?.kind??null,
    certificateKind:component.source?.certificateKind??null,
    targetResidual:residualSummary(r),
    blockerIntersection:blockerIntersection(component,r),
    opponentEarliestTerminalLowerBound:
      component.opponentSingletonEnvelope?.defenderEarliestTerminalLowerBound??
      component.firstWinFacts?.opponentSingletonEnvelope?.defenderEarliestTerminalLowerBound??
      null,
    opponentImmediateClosed:
      component.opponentSingletonEnvelope?.normalizationClosed??
      component.firstWinFacts?.nextImmediateNormalizationClosed??
      null,
  };
}

const rows=[];
for(const fixture of fixtures){
  const position=buildCpcxPosition(fixture.sequence,{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(position,{attacker:0})
      .find(canonicalWing);
  if(!wing)throw new Error(`canonical direct wing missing for ${fixture.id}`);

  const decisions=[];
  for(const decisionIndex of [0,1]){
    const repair=deriveCpcxUniversalDebtRepair(position,wing,{decisionIndex}),
      repairResidual=targetResidual(repair.guaranteedResiduals),
      successor=collapseCpcxDebtRepairTokenProduct(
        position,wing,repair,{retainComponents:true}
      ),
      successorResidual=targetResidual(successor.guaranteedResiduals),
      components=(successor.componentCarriers??[])
        .map((c,i)=>componentSummary(c,i));

    decisions.push({
      decisionIndex,
      repair:{
        exact:repair.exact,
        firstWinGuardPassed:repair.firstWinGuardPassed,
        postRepairFirstWinGuardPassed:repair.postRepairFirstWinGuardPassed,
        repairLegalAtDecision:repair.repairLegalAtDecision,
        targetResidual:residualSummary(repairResidual),
      },
      successor:{
        kind:successor.kind,
        exact:successor.exact??false,
        seam:successor.seam??null,
        nextMover:successor.nextMover??null,
        rank:successor.rank??null,
        targetResidual:residualSummary(successorResidual),
        blockerIntersection:blockerIntersection(successor,successorResidual),
        componentCount:components.length,
        components,
      },
    });
  }

  rows.push({
    id:fixture.id,
    sequence:fixture.sequence,
    sourceRank:position.rank,
    sourceMover:position.mover,
    sourceWing:{
      lineId:wing.anchoredLine.lineId,
      line:wing.anchoredLine.lineCells.map(label),
      triggers:wing.anchoredLine.triggerCells.map(label),
      responses:wing.anchoredLine.requiredResponseCells.slice(0,2).map(label),
    },
    decisions,
  });
}

const allDecisionRows=rows.flatMap(row=>
  row.decisions.map(d=>({id:row.id,...d}))
);
const successful=allDecisionRows.filter(x=>x.successor.exact);
const repairParities=new Set(allDecisionRows
  .map(x=>x.repair.targetResidual?.eventParity)
  .filter(Boolean)
  .map(x=>JSON.stringify(x)));
const successorParities=new Set(successful
  .map(x=>x.successor.targetResidual?.eventParity)
  .filter(Boolean)
  .map(x=>JSON.stringify(x)));
const componentParities=new Set(successful
  .flatMap(x=>x.successor.components)
  .map(x=>x.targetResidual?.eventParity)
  .filter(Boolean)
  .map(x=>JSON.stringify(x)));

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.diagonal-defect-transport.v0_1',
  observation:'anchored diagonal three-cell defect carried through direct-wing debt/vertical polynomial',
  target:{
    lineLabel:targetLineLabel,
    interpretation:'three missing diagonal cells attached to one exact P0 anchor line; UC4A 3:1 correspondence is diagnostic only',
  },
  rows,
  summary:{
    decisionCount:allDecisionRows.length,
    repairTargetPresentCount:allDecisionRows.filter(x=>
      x.repair.targetResidual!==null
    ).length,
    exactSuccessorCount:successful.length,
    exactSuccessorTargetPresentCount:successful.filter(x=>
      x.successor.targetResidual!==null
    ).length,
    noCertificateRows:allDecisionRows.filter(x=>
      x.successor.kind==='NO_CERTIFICATE'
    ).map(x=>({
      id:x.id,
      decisionIndex:x.decisionIndex,
      seam:x.successor.seam,
      repairTargetPresent:x.repair.targetResidual!==null,
    })),
    repairEventParityClassCount:repairParities.size,
    repairEventParityClasses:[...repairParities].map(JSON.parse),
    successorEventParityClassCount:successorParities.size,
    successorEventParityClasses:[...successorParities].map(JSON.parse),
    componentEventParityClassCount:componentParities.size,
    componentEventParityClasses:[...componentParities].map(JSON.parse),
    allExactSuccessorBlockersDisjointFromTarget:successful.every(x=>
      x.successor.blockerIntersection.length===0
    ),
    allComponentsRetainTarget:successful.every(x=>
      x.successor.components.every(c=>c.targetResidual!==null)
    ),
    allComponentBlockersDisjointFromTarget:successful.every(x=>
      x.successor.components.every(c=>c.blockerIntersection.length===0)
    ),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    uc4aDefectIdentityNotProven:true,
    supportPhaseMayDiffer:true,
    noValueInference:true,
    noProjectionDeletionAuthorized:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
  },
},null,2));

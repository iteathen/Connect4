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
  coneColumns=new Set([0,1,2]),
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
function isCanonicalWing(contract){
  const triggerColumns=contract.anchoredLine.triggerCells
    .map(cell=>cpcxCell(g,cell).column)
    .sort((a,b)=>a-b);
  return triggerColumns.join(',')==='0,1,2'&&
    cpcxCell(g,contract.anchoredLine.anchorCell).column===3;
}
function coneResiduals(successor){
  return (successor.guaranteedResiduals??[])
    .filter(r=>r.missingCells.every(cell=>
      coneColumns.has(cpcxCell(g,cell).column)
    ))
    .map(r=>({
      player:r.player??successor.attacker,
      orientation:r.orientation,
      missingCount:r.missingCount,
      missing:r.missingCells.map(label).sort(),
      events:(r.events??[]).map(e=>({
        cell:label(e.cell),
        min:e.minSupportDistance,
        max:e.maxSupportDistance,
        parity:e.eventRankParity??(e.eventRank&1),
      })).sort((a,b)=>a.cell.localeCompare(b.cell)),
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      a.orientation.localeCompare(b.orientation)||
      a.missing.join(',').localeCompare(b.missing.join(','))
    );
}
function coneSupport(successor){
  if(successor.supportEnvelope?.exact!==true)return null;
  const m=new Map();
  for(const v of successor.supportEnvelope.vectors??[]){
    const p=[v[0],v[1],v[2]];
    m.set(p.join(','),p);
  }
  return [...m.values()].sort((a,b)=>
    a[0]-b[0]||a[1]-b[1]||a[2]-b[2]
  );
}
function coneBlockers(successor){
  return (successor.blockerTokens??[]).map(t=>({
    owner:t.owner,
    maxCount:t.maxCount,
    directKillCapacity:t.directKillCapacity,
    supportOnly:t.supportOnly,
    candidates:(t.candidateCells??[])
      .filter(cell=>coneColumns.has(cpcxCell(g,cell).column))
      .map(label).sort(),
  }));
}
function coneKey(successor){
  if(successor.kind==='CERTIFIED_FIRST_WIN')
    return JSON.stringify({kind:successor.kind,player:successor.player});
  return JSON.stringify({
    kind:successor.kind,
    nextMover:successor.nextMover,
    rankParity:successor.rank?.parity??null,
    controlParityEquivalent:successor.controlParityEquivalent??false,
    support:coneSupport(successor),
    residuals:coneResiduals(successor),
    blockers:coneBlockers(successor),
    immediateClosed:
      successor.firstWinFacts?.nextImmediateNormalizationClosed??null,
  });
}
function fullKey(successor){
  return JSON.stringify({
    kind:successor.kind,
    player:successor.player??null,
    nextMover:successor.nextMover??null,
    rank:successor.rank??null,
    controlParityEquivalent:successor.controlParityEquivalent??null,
    supportEnvelope:successor.supportEnvelope??null,
    guaranteedResiduals:successor.guaranteedResiduals??null,
    blockerTokens:successor.blockerTokens??null,
    opponentSingletonEnvelope:successor.opponentSingletonEnvelope??null,
    opponentResidualEnvelope:successor.opponentResidualEnvelope??null,
  });
}

const rows=fixtures.map(f=>{
  const position=buildCpcxPosition(f.sequence,{geometry:g}),
    wings=findCpcxDirectThreeTriggerWingAttacks(position,{attacker:0}),
    wing=wings.find(isCanonicalWing);
  if(!wing)throw new Error(`canonical direct wing missing for ${f.id}`);

  const decisions=[];
  for(const decisionIndex of [0,1]){
    const repair=deriveCpcxUniversalDebtRepair(position,wing,{decisionIndex}),
      successor=collapseCpcxDebtRepairTokenProduct(
        position,wing,repair,{retainComponents:false}
      );
    decisions.push({
      decisionIndex,
      repair:{
        exact:repair.exact,
        prefix:repair.prefix.map(e=>({cell:label(e.cell),owner:e.owner})),
        requiredResponseCell:label(repair.requiredResponseCell),
        deviationFrontier:repair.deviationFrontier.map(label),
        firstWinGuardPassed:repair.firstWinGuardPassed,
        postRepairFirstWinGuardPassed:repair.postRepairFirstWinGuardPassed,
        repairLegalAtDecision:repair.repairLegalAtDecision,
        guaranteedResidualCount:repair.guaranteedResiduals.length,
      },
      successor:{
        kind:successor.kind,
        exact:successor.exact??false,
        player:successor.player??null,
        nextMover:successor.nextMover??null,
        rank:successor.rank??null,
        guaranteedResidualCount:successor.guaranteedResiduals?.length??null,
        blockerTokenCount:successor.blockerTokens?.length??0,
        opponentResidualPossibleCount:
          successor.opponentResidualEnvelope?.possibleResiduals?.length??null,
        opponentEarliestTerminalLowerBound:
          successor.firstWinFacts?.opponentEarliestTerminalLowerBound??null,
      },
      cone:{
        support:coneSupport(successor),
        residuals:coneResiduals(successor),
        blockers:coneBlockers(successor),
        key:coneKey(successor),
      },
      fullKey:fullKey(successor),
    });
  }

  return {
    id:f.id,
    sequence:f.sequence,
    rank:position.rank,
    mover:position.mover,
    directWingCount:wings.length,
    wing:{
      lineId:wing.anchoredLine.lineId,
      line:wing.anchoredLine.lineCells.map(label),
      anchor:label(wing.anchoredLine.anchorCell),
      triggers:wing.anchoredLine.triggerCells.map(label),
      responses:wing.anchoredLine.requiredResponseCells.slice(0,2).map(label),
      honoredPathExact:wing.honoredPath.exact,
    },
    decisions,
  };
});

function classCount(decisionIndex,key){
  return new Set(rows.map(r=>r.decisions[decisionIndex][key])).size;
}
function coneClassCount(decisionIndex){
  return new Set(rows.map(r=>r.decisions[decisionIndex].cone.key)).size;
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.center-direct-wing-renewal.v0_1',
  observation:'current-state direct three-trigger renewal on the common A-C first-win cone',
  rows,
  summary:{
    allFourHaveExactCanonicalDirectWing:rows.every(r=>r.wing.honoredPathExact),
    decision0FullSuccessorClassCount:classCount(0,'fullKey'),
    decision0ConeSuccessorClassCount:coneClassCount(0),
    decision1FullSuccessorClassCount:classCount(1,'fullKey'),
    decision1ConeSuccessorClassCount:coneClassCount(1),
    decision0AllCertifiedFirstWin:rows.every(r=>
      r.decisions[0].successor.kind==='CERTIFIED_FIRST_WIN'
    ),
    decision1AllCertifiedFirstWin:rows.every(r=>
      r.decisions[1].successor.kind==='CERTIFIED_FIRST_WIN'
    ),
    allDecision0GuardsPass:rows.every(r=>{
      const x=r.decisions[0].repair;
      return x.firstWinGuardPassed&&
        x.postRepairFirstWinGuardPassed&&
        x.repairLegalAtDecision;
    }),
    allDecision1GuardsPass:rows.every(r=>{
      const x=r.decisions[1].repair;
      return x.firstWinGuardPassed&&
        x.postRepairFirstWinGuardPassed&&
        x.repairLegalAtDecision;
    }),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    noOutsideConeProjectionAuthorized:true,
    noValueInferenceFromConeEquality:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
  },
},null,2));

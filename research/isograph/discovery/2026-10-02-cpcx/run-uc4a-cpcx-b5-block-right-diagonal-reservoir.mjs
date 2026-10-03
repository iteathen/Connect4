import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {applyCpcxForcedEvent,classifyCpcxImmediate} from './cpcx-closure.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  analyzeCpcxTargetReservoir,
  analyzeCpcxOneDefectTargetReservoir,
  analyzeCpcxTruncatedTargetReservoirCoverage,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';

const g=createCpcxGeometry(),
  transferLine='B1-C2-D3-E4',
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
function cellByLabel(s){
  return (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65);
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%g.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return null;
  return {
    geometry:g,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function canonicalWing(w){
  return w.anchoredLine.triggerCells
    .map(cell=>cpcxCell(g,cell).column)
    .sort((a,b)=>a-b).join(',')==='0,1,2'&&
    cpcxCell(g,w.anchoredLine.anchorCell).column===3;
}
function residual(position,lineLabel){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===lineLabel
  )??null;
}
function residualSummary(r){
  if(!r)return null;
  return {
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    missingCount:r.missingCount,
    missing:r.missingCells.map(label),
    support:r.events.map(e=>e.supportDistance),
    eventParity:r.events.map(e=>e.eventRank&1),
    playable:r.currentlyPlayableCells.map(label),
  };
}
function immediateSummary(position){
  const x=classifyCpcxImmediate(position);
  return {
    kind:x.kind,
    winningCells:(x.winningCells??[]).map(label),
    opponentThreatCells:(x.opponentThreatCells??x.threatCells??[]).map(label),
    forcedCell:Number.isInteger(x.cell)?label(x.cell):null,
  };
}
function progressSummary(p){
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    seam:p.seam??p.reason??null,
    macroKind:p.macro?.kind??null,
    primaryCell:Number.isInteger(p.macro?.primaryCell)?label(p.macro.primaryCell):null,
    secondaryCell:Number.isInteger(p.macro?.secondaryCell)?label(p.macro.secondaryCell):null,
    blockerCells:(p.obligation?.blockingCells??[]).map(label),
  };
}
function reservoirSummary(x){
  if(!x)return null;
  return {
    kind:x.kind,
    exact:x.exact??false,
    target:x.target?{
      cell:label(x.target.cell),
      supportDistance:x.target.supportDistance,
      lineLabel:x.target.lineLabel,
    }:null,
    totalRelevantEvents:x.totalRelevantEvents??null,
    totalParity:x.totalParity??null,
    oddColumns:(x.oddColumns??[]).map(c=>c+1),
    defenderResidualCount:x.defenderResidualCount??null,
    candidateCount:x.candidateCount??null,
    maxCoveredResiduals:x.maxCoveredResiduals??null,
    minimumUncoveredResiduals:x.minimumUncoveredResiduals??null,
    fullCoverageTemplateCount:x.fullCoverageTemplateCount??null,
    proofBoundary:x.proofBoundary??null,
    seam:x.seam??null,
  };
}

const rows=[];
for(const f of fixtures){
  const source=buildCpcxPosition(f.sequence,{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
      .find(canonicalWing);
  if(!wing)throw new Error(`wing missing ${f.id}`);

  const t=wing.anchoredLine.triggerCells,
    r=wing.anchoredLine.requiredResponseCells,
    short=materialize(source,[
      {cell:t[0],owner:0},
      {cell:r[0],owner:1},
      {cell:t[1],owner:0},
      {cell:t[2],owner:1},
      {cell:r[1],owner:0},
    ]);
  if(!short||short.mover!==1)throw new Error(`short state bad ${f.id}`);

  let p=applyCpcxForcedEvent(short,cellByLabel('B3'));
  if(p.terminal||p.mover!==0)throw new Error(`B3 bad ${f.id}`);
  p=applyCpcxForcedEvent(p,cellByLabel('B4'));
  if(p.terminal||p.mover!==1)throw new Error(`B4 bad ${f.id}`);
  p=applyCpcxForcedEvent(p,cellByLabel('B5'));
  if(p.terminal||p.mover!==0)throw new Error(`B5 bad ${f.id}`);

  const before=residual(p,transferLine);
  if(!before||before.missingCount!==2||
     !before.currentlyPlayableCells.includes(cellByLabel('C2')))
    throw new Error(`transfer pair missing ${f.id}`);

  const afterSetup=applyCpcxForcedEvent(p,cellByLabel('C2'));
  if(afterSetup.terminal||afterSetup.mover!==1)
    throw new Error(`C2 setup bad ${f.id}`);

  const singleton=residual(afterSetup,transferLine);
  if(!singleton||singleton.missingCount!==1||
     singleton.missingCells[0]!==cellByLabel('E4'))
    throw new Error(`E4 singleton missing ${f.id}`);

  const target=cellByLabel('E4'),
    ordinary=analyzeCpcxTargetReservoir(afterSetup,{
      attacker:0,targetCell:target,
    }),
    oneDefect=analyzeCpcxOneDefectTargetReservoir(afterSetup,{
      attacker:0,targetCell:target,
    }),
    truncated=analyzeCpcxTruncatedTargetReservoirCoverage(afterSetup,{
      attacker:0,targetCell:target,
    }),
    certificate=certifyCpcxTruncatedTargetReservoir(afterSetup,{
      attacker:0,targetCell:target,
    }),
    progress=classifyCpcxProgress(afterSetup,{player:0});

  rows.push({
    id:f.id,
    sequence:f.sequence,
    blockStateRank:p.rank,
    blockStateMover:p.mover,
    transferPair:residualSummary(before),
    afterC2:{
      rank:afterSetup.rank,
      mover:afterSetup.mover,
      support:Array.from(afterSetup.heights),
      singleton:residualSummary(singleton),
      immediate:immediateSummary(afterSetup),
      progress:progressSummary(progress),
    },
    reservoir:{
      ordinary:reservoirSummary(ordinary),
      oneDefect:reservoirSummary(oneDefect),
      truncated:reservoirSummary(truncated),
      certificate:{
        kind:certificate.kind,
        exact:certificate.exact??false,
        player:certificate.player??null,
        seam:certificate.seam??null,
      },
    },
  });
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.b5-block-right-diagonal-reservoir.v0_1',
  observation:'B5 block transfers the left diagonal carrier through D3; P0 C2 contracts the common right-diagonal pair to singleton E4',
  rows,
  summary:{
    allTransferPairsExact:rows.every(r=>
      r.transferPair?.missingCount===2&&
      r.transferPair.playable.includes('C2')
    ),
    allProduceE4Singleton:rows.every(r=>
      r.afterC2.singleton?.missingCount===1&&
      r.afterC2.singleton.missing?.[0]==='E4'
    ),
    targetSupportClasses:[...new Set(rows.map(r=>
      r.afterC2.singleton.support[0]
    ))].sort((a,b)=>a-b),
    immediateClasses:[...new Set(rows.map(r=>
      r.afterC2.immediate.kind
    ))].sort(),
    progressClasses:[...new Set(rows.map(r=>
      r.afterC2.progress.kind
    ))].sort(),
    ordinaryReservoirKinds:[...new Set(rows.map(r=>
      r.reservoir.ordinary.kind
    ))].sort(),
    oneDefectKinds:[...new Set(rows.map(r=>
      r.reservoir.oneDefect.kind
    ))].sort(),
    truncatedKinds:[...new Set(rows.map(r=>
      r.reservoir.truncated.kind
    ))].sort(),
    exactFirstWinFixtures:rows.filter(r=>
      r.reservoir.certificate.kind==='CERTIFIED_FIRST_WIN'&&
      r.reservoir.certificate.player===0
    ).map(r=>r.id),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    deterministicSetupOnly:true,
    noReplyEnumeration:true,
    noValueConclusion:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
  },
},null,2));

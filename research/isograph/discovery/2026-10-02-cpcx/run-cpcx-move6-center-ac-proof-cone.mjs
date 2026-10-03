import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {classifyCpcxImmediate} from './cpcx-closure.mjs';
import {lowerBoundCpcxEarliestTerminal} from './cpcx-deadline.mjs';
import {
  findCpcxCpc2TriggerTemplates,
  deriveCpcxDisjunctiveBlockObligation,
} from './cpcx-cpc2.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';

const g=createCpcxGeometry(),
  projectColumns=[0,1,2],
  projectSet=new Set(projectColumns);

const fixtures=[
  {
    id:'CENTER_PREEMPT_B',
    sequence:'4444447677',
    provenance:'reflection-canonical center-only preempt class discovered as U4',
  },
  {
    id:'CENTER_PREEMPT_C',
    sequence:'4444447577',
    provenance:'reflection-canonical center-only preempt class discovered as U5',
  },
  {
    id:'CENTER_DELAYED_BC',
    sequence:'444444767577',
    provenance:'reflection-canonical center-only delayed class discovered as U12',
  },
  {
    id:'CENTER_SECOND_DECISION_PREEMPT',
    sequence:'444444776566',
    provenance:'reflection-canonical center-only second-decision preempt class discovered as U13',
  },
];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function projection(position){
  const owner=[];
  for(let row=0;row<g.rows;row++)
    for(const column of projectColumns)
      owner.push(position.owner[row*g.columns+column]);
  return {
    mover:position.mover,
    heights:projectColumns.map(c=>position.heights[c]),
    owner,
  };
}

function projectionKey(p){
  return JSON.stringify(p);
}

function supportProfile(obligation){
  return obligation.events.map(e=>e.supportDistance).sort((a,b)=>a-b);
}

function wingCarrier(position,attacker=0){
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===attacker&&
      o.orientation==='H'&&
      o.missingCount===3&&
      o.events.every(e=>projectSet.has(e.column))
    )
    .map(o=>({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      missingCells:[...o.missingCells],
      missingLabels:o.missingCells.map(label),
      support:supportProfile(o),
      playable:o.currentlyPlayableCells.map(label),
    }))
    .sort((a,b)=>
      a.support.join(',').localeCompare(b.support.join(','))||
      a.lineId-b.lineId
    );
}

function honoredWingAudit(position,carrier){
  const bottom=carrier.find(x=>x.support.every(d=>d===0));
  if(!bottom)return {exact:false,seam:'NO_BOTTOM_WING_RESIDUAL'};
  const line=g.lines[bottom.lineId],
    missingSet=new Set(bottom.missingCells),
    anchors=line.cells.filter(cell=>!missingSet.has(cell));
  if(anchors.length!==1||position.owner[anchors[0]]!==0)
    return {exact:false,seam:'ANCHOR_NOT_UNIQUE'};
  const anchorColumn=cpcxCell(g,anchors[0]).column,
    triggers=[...bottom.missingCells].sort((a,b)=>{
      const ca=cpcxCell(g,a).column,cb=cpcxCell(g,b).column,
        da=Math.abs(ca-anchorColumn),db=Math.abs(cb-anchorColumn);
      return db-da||ca-cb;
    }),
    responses=triggers.slice(0,2).map(cell=>cell+g.columns),
    events=[
      {cell:triggers[0],owner:0},
      {cell:responses[0],owner:1},
      {cell:triggers[1],owner:0},
      {cell:responses[1],owner:1},
      {cell:triggers[2],owner:0},
    ],
    v=verifyCpcxFixedEventScript(position,events);
  return {
    exact:v.legal&&
      v.terminal?.index===events.length-1&&
      v.terminal?.player===0&&
      v.terminal?.lineId===bottom.lineId,
    triggerOrder:triggers.map(label),
    responseOrder:responses.map(label),
    events:events.map(e=>({cell:label(e.cell),owner:e.owner})),
    legal:v.legal,
    terminal:v.terminal?{
      index:v.terminal.index,
      player:v.terminal.player,
      lineId:v.terminal.lineId,
      cell:label(v.terminal.cell),
    }:null,
  };
}

function opponentInsideInterface(position){
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===1&&
      o.missingCells.length>0&&
      o.missingCells.every(cell=>projectSet.has(cpcxCell(g,cell).column))
    )
    .map(o=>({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      orientation:o.orientation,
      missingCount:o.missingCount,
      missing:o.missingCells.map(label),
      support:supportProfile(o),
      playable:o.currentlyPlayableCells.map(label),
      crossesProjectionBoundary:g.lines[o.lineId].cells.some(cell=>
        !projectSet.has(cpcxCell(g,cell).column)
      ),
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      a.lineId-b.lineId
    );
}

function cpc2Templates(position){
  return findCpcxCpc2TriggerTemplates(position,{attacker:1})
    .map(t=>({
      triggerCell:label(t.triggerCell),
      sourceTwoPieceResidualCount:t.sourceTwoPieceResiduals.length,
      bornSingletonCells:t.bornSingletonCells.map(label),
      playableSingletonCells:t.playableSingletonCells.map(label),
      forkProducing:t.forkProducing,
      exact:t.exact,
    }))
    .sort((a,b)=>a.triggerCell.localeCompare(b.triggerCell));
}

function cpc2ObligationSummary(position){
  const o=deriveCpcxDisjunctiveBlockObligation(position,{attacker:1});
  return {
    kind:o.kind,
    exact:o.exact??false,
    seam:o.seam??null,
    blockingCells:(o.blockingCells??[]).map(label),
    triggerCount:o.triggerCertificates?.length??0,
    unresolvedMoveCount:o.unresolvedMoves?.length??0,
  };
}

const rows=fixtures.map(f=>{
  const position=buildCpcxPosition(f.sequence,{geometry:g}),
    wing=wingCarrier(position),
    immediate=classifyCpcxImmediate(position),
    lower=lowerBoundCpcxEarliestTerminal(position,{player:1}),
    row={
      id:f.id,
      sequence:f.sequence,
      provenance:f.provenance,
      rank:position.rank,
      mover:position.mover,
      projection:projection(position),
      projectionKey:projectionKey(projection(position)),
      wingCarrier:wing,
      wingCarrierKey:JSON.stringify(wing),
      honoredWing:honoredWingAudit(position,wing),
      immediate:{
        kind:immediate.kind,
        ownWinningCells:(immediate.winningCells??[]).map(label),
        opponentThreatCells:(immediate.opponentThreatCells??immediate.threatCells??[]).map(label),
      },
      opponentEarliestTerminalLowerBound:lower.lowerBoundPly,
      opponentInsideInterface:opponentInsideInterface(position),
      opponentCpc2Templates:cpc2Templates(position),
      opponentCpc2:cpc2ObligationSummary(position),
    };
  return row;
});

function allEqual(field){
  const values=rows.map(x=>JSON.stringify(x[field]));
  return values.every(x=>x===values[0]);
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.center-ac-proof-cone-diagnostic.v0_1',
  observation:'P0 first-win certificate generated by the reflection-canonical surviving A-C wing/control carrier',
  projectColumns:['A','B','C'],
  rows,
  equality:{
    exactAcPhysicalProjection:allEqual('projectionKey'),
    p0WingCarrier:allEqual('wingCarrierKey'),
    honoredWingCertificate:rows.every(x=>x.honoredWing.exact)&&
      allEqual('honoredWing'),
    currentImmediateClass:allEqual('immediate'),
    opponentEarliestTerminalLowerBound:allEqual('opponentEarliestTerminalLowerBound'),
    opponentInsideResidualInterface:allEqual('opponentInsideInterface'),
    opponentCpc2TemplateInterface:allEqual('opponentCpc2Templates'),
    opponentCurrentCpc2Obligation:allEqual('opponentCpc2'),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    runtimeTheoremNotYetPromoted:true,
    noProjectionDeletionAuthorized:true,
    firstWinValueNotProven:true,
  },
  premises:{
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    exactCurrentPositionOnly:true,
  },
},null,2));

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
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  certifyCpcxSupportReleaseAcquisition,
} from './cpcx-support-release-acquisition.mjs';

const g=createCpcxGeometry(),
  defectLine='A6-B5-C4-D3',
  fixtures=[
    {id:'U4',sequence:'4444447677'},
    {id:'U5',sequence:'4444447577'},
    {id:'U12',sequence:'444444767577'},
    {id:'U13',sequence:'444444776566'},
  ],
  commonCandidateLabels=['A3','C2'];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function cellByLabel(s){
  const column=s.charCodeAt(0)-65,row=Number(s.slice(1))-1;
  return row*g.columns+column;
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
function defect(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===defectLine
  )??null;
}
function residualSummary(r){
  if(!r)return null;
  return {
    lineId:r.lineId,
    missingCount:r.missingCount,
    missing:r.missingCells.map(label),
    support:r.events.map(e=>e.supportDistance),
    supportSum:r.events.reduce((n,e)=>n+e.supportDistance,0),
    eventParity:r.events.map(e=>e.eventRank&1),
    playable:r.currentlyPlayableCells.map(label),
  };
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function certSummary(c){
  return {
    kind:c.kind,
    exact:c.exact??false,
    seam:c.seam??null,
    pinned:c.pinnedControllerEvent?label(c.pinnedControllerEvent.cell):null,
    target:c.residual?label(c.residual.targetCell):null,
    sourceMissingCount:c.residual?.sourceMissingCount??null,
    supportTrigger:c.acquisitionEdge?label(c.acquisitionEdge.triggerCell):null,
    acquisitionCell:c.acquisitionEdge?label(c.acquisitionEdge.acquisitionCell):null,
    contracted:c.acquisitionEdge?.contracted??false,
    completed:c.acquisitionEdge?.completed??false,
    externalFrontier:(c.externalClass?.frontierCells??[]).map(label),
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

  const b3=cellByLabel('B3'),
    blocked=applyCpcxForcedEvent(short,b3);
  if(blocked.terminal||blocked.mover!==0)
    throw new Error(`B3 state bad ${f.id}`);

  const R=defect(blocked);
  if(!R)throw new Error(`defect missing ${f.id}`);
  const b5=cellByLabel('B5'),
    b5Event=R.events.find(e=>e.cell===b5);
  if(!b5Event||b5Event.supportDistance!==1)
    throw new Error(`B5 not depth one ${f.id}`);

  const candidates=frontier(blocked)
    .filter(cell=>cpcxCell(g,cell).column!==1)
    .map(cell=>{
      const c=certifyCpcxSupportReleaseAcquisition(blocked,{
        controllerResidual:R,
        targetCell:b5,
        controllerActionCell:cell,
      });
      const child=applyCpcxForcedEvent(blocked,cell),
        after=child.terminal?null:defect(child);
      return {
        actionCell:label(cell),
        actionColumn:cpcxCell(g,cell).column,
        actionInsideOtherDefectSupportColumn:
          R.missingCells.some(target=>
            cpcxCell(g,target).column===cpcxCell(g,cell).column
          ),
        defectAfterPinnedAction:residualSummary(after),
        supportDebtDelta:after
          ?after.events.reduce((n,e)=>n+e.supportDistance,0)-
            R.events.reduce((n,e)=>n+e.supportDistance,0)
          :null,
        certificate:certSummary(c),
      };
    });

  rows.push({
    id:f.id,
    rank:blocked.rank,
    mover:blocked.mover,
    defect:residualSummary(R),
    candidates,
  });
}

const commonPassLabels=commonCandidateLabels.filter(name=>
  rows.every(row=>row.candidates.some(c=>
    c.actionCell===name&&
    c.certificate.kind==='SUPPORT_RELEASE_ACQUISITION_EDGE'
  ))
);
const allPassLabels=(()=>{
  const labels=rows[0]?.candidates
    .filter(x=>x.certificate.kind==='SUPPORT_RELEASE_ACQUISITION_EDGE')
    .map(x=>x.actionCell)??[];
  return labels.filter(name=>rows.every(row=>
    row.candidates.some(c=>
      c.actionCell===name&&
      c.certificate.kind==='SUPPORT_RELEASE_ACQUISITION_EDGE'
    )
  )).sort();
})();

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.b3-support-release-acquisition.v0_1',
  observation:'B3 preempt state: depth-one B5 target in protected diagonal residual',
  rows,
  summary:{
    allFixturesHaveDepthOneB5:rows.every(r=>
      r.defect?.support?.[1]===1
    ),
    commonCandidateLabels,
    commonCandidateLabelsCertified:commonPassLabels,
    allCommonCertifiedActionLabels:allPassLabels,
    eachFixtureHasAtLeastOneAcquisitionEdge:rows.every(r=>
      r.candidates.some(c=>
        c.certificate.kind==='SUPPORT_RELEASE_ACQUISITION_EDGE'
      )
    ),
    eachFixtureHasIntrinsicDefectProgressAcquisitionEdge:rows.every(r=>
      r.candidates.some(c=>
        c.actionInsideOtherDefectSupportColumn&&
        c.supportDebtDelta===-1&&
        c.certificate.kind==='SUPPORT_RELEASE_ACQUISITION_EDGE'
      )
    ),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    externalClassStillUnresolved:true,
    finiteReservoirClosureNotYetProven:true,
    noValueConclusion:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
  },
},null,2));

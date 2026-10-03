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
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  composeCpcxForcingMacro,
  composeCpcxForcedNormalization,
  composeCpcxDisjunctiveBlockObligation,
} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  defectLine='A6-B5-C4-D3',
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
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function defect(position){
  const r=scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===defectLine
  );
  if(!r)return null;
  return {
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    missing:r.missingCells.map(label),
    support:r.events.map(e=>e.supportDistance),
    supportSum:r.events.reduce((n,e)=>n+e.supportDistance,0),
    eventParity:r.events.map(e=>e.eventRank&1),
    playable:r.currentlyPlayableCells.map(label),
  };
}
function progressSummary(progress){
  return {
    kind:progress.kind,
    exact:progress.exact??false,
    player:progress.player??null,
    source:progress.source??null,
    seam:progress.seam??progress.reason??null,
    macroKind:progress.macro?.kind??null,
    primaryCell:Number.isInteger(progress.macro?.primaryCell)
      ?label(progress.macro.primaryCell):null,
    secondaryCell:Number.isInteger(progress.macro?.secondaryCell)
      ?label(progress.macro.secondaryCell):null,
    blockerCells:(progress.obligation?.blockingCells??[]).map(label),
  };
}
function oneStep(position,progress){
  let s=null;
  if(progress.kind==='FORCED_NORMALIZATION')
    s=composeCpcxForcedNormalization(position,progress);
  else if(progress.kind==='CERTIFIED_FORCING_MACRO')
    s=composeCpcxForcingMacro(position,progress);
  else if(progress.kind==='DISJUNCTIVE_BLOCK_OBLIGATION')
    s=composeCpcxDisjunctiveBlockObligation(position,progress);
  if(!s)return null;
  return {
    kind:s.kind,
    exact:s.exact??false,
    seam:s.seam??null,
    player:s.player??null,
    nextMover:s.nextMover??s.concretePosition?.mover??null,
    rank:s.rank??null,
    sourceKind:s.source?.kind??null,
    certificateKind:s.source?.certificateKind??null,
    concreteDefect:s.concretePosition?defect(s.concretePosition):null,
    guaranteedDefect:(s.guaranteedResiduals??[]).find(r=>
      r.lineLabel===defectLine
    )?true:false,
  };
}
function actionRole(cell){
  const {column}=cpcxCell(g,cell);
  if(column===0)return 'SUPPORT_DEFECT_A';
  if(column===1)return 'SUPPORT_DEFECT_B';
  if(column===2)return 'SUPPORT_DEFECT_C';
  return 'EXTERNAL';
}

const rows=[];
for(const f of fixtures){
  const source=buildCpcxPosition(f.sequence,{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
      .find(canonicalWing);
  if(!wing)throw new Error(`source wing missing ${f.id}`);
  const t=wing.anchoredLine.triggerCells,
    r=wing.anchoredLine.requiredResponseCells,
    short=materialize(source,[
      {cell:t[0],owner:0},
      {cell:r[0],owner:1},
      {cell:t[1],owner:0},
      {cell:t[2],owner:1},
      {cell:r[1],owner:0},
    ]);
  if(!short||short.mover!==1)throw new Error(`bad one-short state ${f.id}`);

  const b3=2*g.columns+1,
    blocked=applyCpcxForcedEvent(short,b3);
  if(blocked.terminal||blocked.mover!==0)
    throw new Error(`bad B3 transport state ${f.id}`);
  const beforeDefect=defect(short),afterBlockDefect=defect(blocked);

  for(const actionCell of frontier(blocked)){
    const child=applyCpcxForcedEvent(blocked,actionCell),
      row={
        fixture:f.id,
        sourceRank:blocked.rank,
        actionCell:label(actionCell),
        actionRole:actionRole(actionCell),
        terminal:child.terminal?{
          player:child.terminal.player,
          lineId:child.terminal.lineId,
        }:null,
        defectBeforeEscape:beforeDefect,
        defectAfterB3Escape:afterBlockDefect,
        escapeSupportDelta:
          beforeDefect&&afterBlockDefect
            ?afterBlockDefect.supportSum-beforeDefect.supportSum
            :null,
      };
    if(!child.terminal){
      const p=classifyCpcxProgress(child,{player:0});
      row.defectAfterControllerAction=defect(child);
      row.progress=progressSummary(p);
      row.oneStep=oneStep(child,p);
    }
    rows.push(row);
  }
}

const byRole={};
for(const role of [...new Set(rows.map(x=>x.actionRole))].sort()){
  const xs=rows.filter(x=>x.actionRole===role);
  byRole[role]={
    occurrenceCount:xs.length,
    terminalCount:xs.filter(x=>x.terminal).length,
    progressKinds:[...new Set(xs.map(x=>x.progress?.kind??'TERMINAL'))].sort(),
    macroKinds:[...new Set(xs.map(x=>x.progress?.macroKind).filter(Boolean))].sort(),
    exactOneStepCount:xs.filter(x=>x.oneStep?.exact===true).length,
    retainedDefectAfterActionCount:xs.filter(x=>
      x.defectAfterControllerAction!==null
    ).length,
  };
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.b3-defect-transport-role-census.v0_1',
  observation:'unique B3 escape from the one-support-short wing, followed by one controller role action',
  rows,
  summary:{
    fixtureCount:fixtures.length,
    allB3EscapesPreserveDefect:fixtures.every(f=>
      rows.find(x=>x.fixture===f.id)?.defectAfterB3Escape!==null
    ),
    b3EscapeSupportDeltaClasses:[...new Set(rows.map(x=>
      x.escapeSupportDelta
    ).filter(Number.isInteger))].sort((a,b)=>a-b),
    roles:byRole,
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    oneB3EscapePlusOneControllerActionOnly:true,
    oneExistingMacroStepMaximum:true,
    noRecursiveTraversal:true,
    noValueConclusion:true,
    uc4aDefectIdentityNotProven:true,
    solvedData:false,
    oracle:false,
  },
},null,2));

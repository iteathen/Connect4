import {
  createCpcxGeometry,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  certifyCpcxProtectedResidualSupportAdvance,
} from './cpcx-support-advance.mjs';
import {
  certifyCpcxProtectedResidualSupportTransition,
} from './cpcx-support-transition.mjs';
import {
  certifyCpcxSupportReleaseAcquisition,
} from './cpcx-support-release-acquisition.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3',
  targetCell=4*g.columns+1; // B5

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function positionFromClass(cls){
  const [moverText,heightsText,ownerText]=cls.key.split('|');
  const owner=new Int8Array(g.cellCount);
  for(let i=0;i<ownerText.length;i++)owner[i]=Number(ownerText[i])-1;
  return {
    geometry:g,
    moves:new Uint32Array(0),
    rank:cls.rank,
    mover:Number(moverText),
    heights:new Uint32Array(heightsText.split(',').map(Number)),
    owner,
    terminal:null,
  };
}
function targetResidual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine&&
    o.missingCells.includes(targetCell)
  )??null;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function supportDistance(residual,cell){
  return residual?.events.find(e=>e.cell===cell)?.supportDistance??null;
}
function immediateSummary(position){
  const x=classifyCpcxImmediate(position);
  return {
    kind:x.kind,
    mover:x.mover??null,
    cell:Number.isInteger(x.cell)?label(x.cell):null,
    winningCells:(x.winningCells??[]).map(label),
    opponentThreatCells:(x.opponentThreatCells??x.threatCells??[]).map(label),
  };
}
function directAcquire(position,residual){
  const event=residual?.events.find(e=>e.cell===targetCell);
  if(!event||event.supportDistance!==0)return {
    kind:'NOT_PLAYABLE',exact:false,
  };
  const child=applyCpcxForcedEvent(position,targetCell);
  if(child.terminal)return child.terminal.player===0?{
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:0,
    terminal:child.terminal,
  }:{
    kind:'OPPONENT_TERMINAL',
    exact:false,
    terminal:child.terminal,
  };
  const after=targetResidual(child),
    immediate=classifyCpcxImmediate(child);
  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&immediate.mover===1)
    return {
      kind:'OPPONENT_IMMEDIATE_AFTER_ACQUISITION',
      exact:false,
      boundary:immediateSummary(child),
    };
  return {
    kind:'PROTECTED_TARGET_CONTRACTION',
    exact:true,
    remainingMissingCount:after?.missingCount??0,
    remainingMissing:after?.missingCells.map(label)??[],
    childImmediate:immediateSummary(child),
  };
}
function acquisitionCandidates(position,residual){
  const out=[];
  for(const actionCell of frontier(position)){
    if(cpcxCell(g,actionCell).column===1)continue;
    const c=certifyCpcxSupportReleaseAcquisition(position,{
      controllerResidual:residual,
      targetCell,
      controllerActionCell:actionCell,
    });
    if(c.exact)out.push({
      actionCell:label(actionCell),
      kind:c.kind,
      completed:c.acquisitionEdge?.completed??false,
      contracted:c.acquisitionEdge?.contracted??false,
      supportTrigger:c.acquisitionEdge
        ?label(c.acquisitionEdge.triggerCell):null,
      acquisitionCell:c.acquisitionEdge
        ?label(c.acquisitionEdge.acquisitionCell):null,
    });
  }
  return out;
}

const rows=[];
for(const cls of artifact.classes){
  const source=positionFromClass(cls);
  if(source.mover!==0)continue;

  const R=targetResidual(source);
  if(!R)throw new Error(`target missing ${cls.classId}`);
  const sourceB=source.heights[1],
    sourceDistance=supportDistance(R,targetCell),
    advance=certifyCpcxProtectedResidualSupportAdvance(source,{
      controllerResidual:R,targetCell,
    });
  if(!advance.exact||
     advance.kind!=='PROTECTED_RESIDUAL_SUPPORT_ADVANCE')
    throw new Error(`B advance failed ${cls.classId}: ${advance.seam??advance.kind}`);

  const afterAdvance=advance.child,responseRows=[];
  if(afterAdvance.mover!==1)throw new Error('expected P1 after P0 B support');

  for(const responseCell of frontier(afterAdvance)){
    const trans=certifyCpcxProtectedResidualSupportTransition(afterAdvance,{
      protectedResidual:targetResidual(afterAdvance),
      eventCell:responseCell,
    });
    const row={
      responseCell:label(responseCell),
      responseColumn:cpcxCell(g,responseCell).column+1,
      transitionKind:trans.kind,
      transitionExact:trans.exact??false,
      terminal:trans.terminal??null,
    };
    if(trans.kind==='TERMINAL_EVENT'){
      row.classification=trans.terminal?.player===0
        ?'P0_TERMINAL_ON_P1_EVENT'
        :'P1_TERMINAL_RESPONSE';
      responseRows.push(row);
      continue;
    }
    if(!trans.exact){
      row.classification='SUPPORT_TRANSITION_FAILURE';
      row.seam=trans.seam??null;
      responseRows.push(row);
      continue;
    }

    const q=applyCpcxForcedEvent(afterAdvance,responseCell),
      qR=targetResidual(q),
      dist=supportDistance(qR,targetCell);
    row.rank=q.rank;
    row.mover=q.mover;
    row.support=Array.from(q.heights);
    row.bHeight=q.heights[1];
    row.b5SupportDistance=dist;
    row.targetRetained=qR!==null;
    row.targetMissingCount=qR?.missingCount??null;
    row.targetSupportDebt=qR
      ?qR.events.reduce((n,e)=>n+e.supportDistance,0):null;
    row.immediate=immediateSummary(q);

    if(q.mover!==0){
      row.classification='TURN_NOT_RETURNED_TO_P0';
      responseRows.push(row);
      continue;
    }

    if(dist===0){
      const acq=directAcquire(q,qR);
      row.directAcquisition=acq;
      row.classification=acq.exact
        ?'B5_PLAYABLE_ACQUISITION'
        :'B5_PLAYABLE_ACQUISITION_FAILURE';
      responseRows.push(row);
      continue;
    }

    if(dist===1){
      const candidates=acquisitionCandidates(q,qR);
      row.acquisitionCandidates=candidates;
      row.classification=candidates.length
        ?'B5_DEPTH_ONE_ACQUISITION_BOUNDARY'
        :'B5_DEPTH_ONE_NO_ACQUISITION_EDGE';
      responseRows.push(row);
      continue;
    }

    const next=certifyCpcxProtectedResidualSupportAdvance(q,{
      controllerResidual:qR,targetCell,
    });
    row.nextAdvance={
      kind:next.kind,
      exact:next.exact??false,
      seam:next.seam??null,
      sourceSupportDebt:next.sourceSupportDebt??null,
      childSupportDebt:next.childSupportDebt??null,
    };
    row.classification=next.kind==='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'&&
      next.exact
      ?'REENTER_B_SUPPORT_ADVANCE'
      :'B_SUPPORT_REENTRY_FAILURE';
    responseRows.push(row);
  }

  rows.push({
    classId:cls.classId,
    rank:source.rank,
    sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
    sourceSupport:Array.from(source.heights),
    sourceBHeight:sourceB,
    sourceB5SupportDistance:sourceDistance,
    sourceTargetDebt:R.events.reduce((n,e)=>n+e.supportDistance,0),
    advance:{
      actionCell:label(advance.actionCell),
      sourceDebt:advance.sourceSupportDebt,
      childDebt:advance.childSupportDebt,
      bHeight:advance.child.heights[1],
    },
    responses:responseRows,
  });
}

const allResponses=rows.flatMap(r=>r.responses.map(x=>({
  classId:r.classId,
  sourceBHeight:r.sourceBHeight,
  ...x,
})));
const classifications={};
for(const x of allResponses)
  classifications[x.classification]=(classifications[x.classification]??0)+1;

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.b-column-support-controller-cycle.v0_1',
  observation:'P0 deterministic protected B-support advance followed by every current P1 frontier response across all P0-mover unresolved move6 classes',
  target:{
    line:targetLine,
    targetCell:'B5',
    geometryProjectedOwner:'P0',
  },
  rows,
  summary:{
    sourceClassCount:rows.length,
    sourceBHeightClasses:[...new Set(rows.map(r=>r.sourceBHeight))].sort((a,b)=>a-b),
    everySourceAdvanceExact:rows.every(r=>
      r.advance.childDebt===r.advance.sourceDebt-1
    ),
    responseCount:allResponses.length,
    classificationCounts:classifications,
    p1TerminalResponses:allResponses.filter(x=>
      x.classification==='P1_TERMINAL_RESPONSE'
    ).map(x=>({classId:x.classId,responseCell:x.responseCell})),
    supportTransitionFailures:allResponses.filter(x=>
      x.classification==='SUPPORT_TRANSITION_FAILURE'
    ).map(x=>({classId:x.classId,responseCell:x.responseCell,seam:x.seam})),
    reentryFailures:allResponses.filter(x=>
      ['B_SUPPORT_REENTRY_FAILURE','B5_DEPTH_ONE_NO_ACQUISITION_EDGE',
       'B5_PLAYABLE_ACQUISITION_FAILURE','TURN_NOT_RETURNED_TO_P0']
        .includes(x.classification)
    ).map(x=>({
      classId:x.classId,
      responseCell:x.responseCell,
      classification:x.classification,
      seam:x.nextAdvance?.seam??null,
      immediate:x.immediate??null,
    })),
    everyResponseAdmitted:allResponses.every(x=>[
      'P0_TERMINAL_ON_P1_EVENT',
      'REENTER_B_SUPPORT_ADVANCE',
      'B5_DEPTH_ONE_ACQUISITION_BOUNDARY',
      'B5_PLAYABLE_ACQUISITION',
    ].includes(x.classification)),
    admittedMeasure:'B5 support distance strictly decreases over each P0-support/P1-response cycle until depth-one acquisition or playable contraction boundary',
  },
  boundary:{
    diagnosticOnly:true,
    p0SupportAdvanceUsesQualifiedGenericTheorem:true,
    p1EventUsesQualifiedProtectedSupportTransition:true,
    acquisitionUsesQualifiedSupportReleaseAcquisition:true,
    currentP1FrontierEnumerationDiscoveryOnly:true,
    noFutureReplyTree:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
  },
},null,2));

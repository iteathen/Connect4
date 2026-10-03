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
  certifyCpcxProtectedResidualForcedNormalization,
} from './cpcx-forced-normalization.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3',
  targetCells=['A6','B5','C4'].map(s=>
    (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65)
  ),
  b5=targetCells[1];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function positionFromClass(cls){
  const [moverText,heightsText,ownerText]=cls.key.split('|'),
    owner=new Int8Array(g.cellCount);
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
function physicalKey(position){
  return `${position.mover}|${Array.from(position.heights).join(',')}|${Array.from(position.owner).map(x=>x+1).join('')}`;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function residual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine
  )??null;
}
function supportDebt(R){
  return R?R.events.reduce((n,e)=>n+e.supportDistance,0):null;
}
function supportVector(R){
  if(!R)return null;
  const m=new Map(R.events.map(e=>[e.cell,e.supportDistance]));
  return R.missingCells.map(cell=>m.get(cell));
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
function normalizedRecord(sourceKind,cls,eventCell,q){
  const R=residual(q);
  if(!R)return null;
  const n=certifyCpcxProtectedResidualForcedNormalization(q,{
    protectedResidual:R,
  });
  if(n.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION'||!n.exact)
    return {
      sourceKind,
      classId:cls.classId,
      eventCell:label(eventCell),
      normalizationKind:n.kind,
      normalizationSeam:n.seam??null,
      position:null,
    };
  return {
    sourceKind,
    classId:cls.classId,
    eventCell:label(eventCell),
    normalizationKind:n.kind,
    normalizationSeam:null,
    position:n.finalPosition,
    normalization:{
      rankDelta:n.rankDelta,
      stepKinds:n.steps.map(x=>x.kind),
      sourceMissingCount:n.sourceMissingCount,
      finalMissingCount:n.finalMissingCount,
      sourceSupportDebt:n.sourceSupportDebt,
      finalSupportDebt:n.finalSupportDebt,
    },
  };
}
function diagonalAttachments(position,oldLineCells,blockedCell){
  const retained=new Set(oldLineCells.filter(c=>c!==blockedCell));
  return scanCpcxObligations(position)
    .filter(o=>o.player===0&&(o.orientation==='D+'||o.orientation==='D-'))
    .map(o=>{
      const cells=g.lines[o.lineId].cells,
        overlap=cells.filter(c=>retained.has(c)),
        debt=supportDebt(o);
      return {
        lineId:o.lineId,
        lineLabel:o.lineLabel,
        orientation:o.orientation,
        overlapCount:overlap.length,
        overlapCells:overlap.map(label),
        missingCount:o.missingCount,
        missing:o.missingCells.map(label),
        supportVector:supportVector(o),
        supportDebt:debt,
        playable:o.currentlyPlayableCells.map(label),
      };
    })
    .filter(x=>x.overlapCount>0)
    .sort((a,b)=>
      b.overlapCount-a.overlapCount||
      a.missingCount-b.missingCount||
      a.supportDebt-b.supportDebt||
      a.lineId-b.lineId
    );
}

const generated=[];
for(const cls of artifact.classes.filter(x=>x.mover===0)){
  const source=positionFromClass(cls),R=residual(source);
  if(!R)throw new Error(`target missing ${cls.classId}`);
  const advance=certifyCpcxProtectedResidualSupportAdvance(source,{
    controllerResidual:R,targetCell:b5,
  });
  if(advance.kind!=='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'||!advance.exact)
    continue;
  for(const responseCell of frontier(advance.child)){
    const childR=residual(advance.child),
      trans=certifyCpcxProtectedResidualSupportTransition(advance.child,{
        protectedResidual:childR,eventCell:responseCell,
      });
    if(!trans.exact||trans.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')
      continue;
    const q=applyCpcxForcedEvent(advance.child,responseCell),
      qR=residual(q);
    if(!qR)continue;
    const next=certifyCpcxProtectedResidualSupportAdvance(q,{
      controllerResidual:qR,targetCell:b5,
    });
    if(next.seam!=='SOURCE_IMMEDIATE_PRECEDENCE')continue;
    generated.push(normalizedRecord('P0_B_CYCLE',cls,responseCell,q));
  }
}
for(const cls of artifact.classes.filter(x=>x.mover===1)){
  const source=positionFromClass(cls),R=residual(source);
  if(!R)throw new Error(`target missing ${cls.classId}`);
  for(const eventCell of frontier(source)){
    const trans=certifyCpcxProtectedResidualSupportTransition(source,{
      protectedResidual:R,eventCell,
    });
    if(!trans.exact||trans.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')
      continue;
    const q=applyCpcxForcedEvent(source,eventCell),qR=residual(q);
    if(!qR)continue;
    const advances=targetCells.map(targetCell=>
      certifyCpcxProtectedResidualSupportAdvance(q,{
        controllerResidual:qR,targetCell,
      })
    );
    if(!advances.every(x=>x.seam==='SOURCE_IMMEDIATE_PRECEDENCE'))continue;
    generated.push(normalizedRecord('P1_BOUNDARY',cls,eventCell,q));
  }
}

const normalizationFailures=generated.filter(x=>!x?.position),
  normalized=[...new Map(generated
    .filter(x=>x?.position&&x.position.mover===1)
    .map(x=>[physicalKey(x.position),x])
  ).values()];

const rows=[];
for(const source of normalized){
  const position=source.position,R=residual(position);
  if(!R)throw new Error(`normalized target missing ${source.classId}`);
  const oldCells=g.lines[R.lineId].cells,
    responses=[];
  for(const eventCell of frontier(position)){
    if(R.missingCells.includes(eventCell)){
      const child=applyCpcxForcedEvent(position,eventCell),
        attachments=child.terminal?[]:
          diagonalAttachments(child,oldCells,eventCell),
        best=attachments[0]??null;
      responses.push({
        eventCell:label(eventCell),
        role:'PROTECTED_TARGET_OCCUPATION',
        terminal:child.terminal,
        oldResidualKilled:child.terminal?null:residual(child)===null,
        childImmediate:child.terminal?null:immediateSummary(child),
        transferAttachmentCount:attachments.length,
        bestTransfer:best,
        transferTupleStrictlyLower:best
          ?(best.missingCount<R.missingCount||
            (best.missingCount===R.missingCount&&
             best.supportDebt<supportDebt(R)))
          :false,
        attachments,
      });
      continue;
    }
    const trans=certifyCpcxProtectedResidualSupportTransition(position,{
      protectedResidual:R,eventCell,
    });
    responses.push({
      eventCell:label(eventCell),
      role:'EXTERNAL_SUPPORT_EVENT',
      transitionKind:trans.kind,
      exact:trans.exact??false,
      seam:trans.seam??null,
      supportDebtDelta:trans.supportDebtDelta??null,
      terminal:trans.terminal??null,
    });
  }
  rows.push({
    sourceKind:source.sourceKind,
    classId:source.classId,
    normalization:source.normalization,
    rank:position.rank,
    support:Array.from(position.heights),
    residual:{
      lineId:R.lineId,
      lineLabel:R.lineLabel,
      missing:R.missingCells.map(label),
      supportVector:supportVector(R),
      supportDebt:supportDebt(R),
      playable:R.currentlyPlayableCells.map(label),
    },
    responses,
  });
}

const allResponses=rows.flatMap(r=>r.responses.map(x=>({classId:r.classId,...x}))),
  blocks=allResponses.filter(x=>x.role==='PROTECTED_TARGET_OCCUPATION'),
  external=allResponses.filter(x=>x.role==='EXTERNAL_SUPPORT_EVENT');

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.normalized-p1-target-transfer-census.v0_1',
  observation:'all current P1 events at exact normalized universal-diagonal boundaries, partitioned into external support transport versus protected-target occupation',
  rows,
  summary:{
    generatedSeamCount:generated.length,
    normalizationFailureCount:normalizationFailures.length,
    normalizedP1PhysicalClassCount:rows.length,
    responseCount:allResponses.length,
    externalResponseCount:external.length,
    protectedTargetResponseCount:blocks.length,
    protectedTargetCells:[...new Set(blocks.map(x=>x.eventCell))].sort(),
    allExternalResponsesCoveredByExactSupportTransition:external.every(x=>
      x.exact&&[
        'PROTECTED_RESIDUAL_SUPPORT_TRANSITION','TERMINAL_EVENT'
      ].includes(x.transitionKind)
    ),
    externalOpponentTerminalCount:external.filter(x=>
      x.transitionKind==='TERMINAL_EVENT'&&x.terminal?.player===1
    ).length,
    everyProtectedTargetOccupationHasDiagonalTransfer:blocks.every(x=>
      x.terminal?.player===0||x.transferAttachmentCount>0
    ),
    everyNonterminalProtectedTargetOccupationHasStrictlyLowerBestTransferTuple:
      blocks.filter(x=>!x.terminal).every(x=>x.transferTupleStrictlyLower),
    bestTransferLineLabels:[...new Set(blocks
      .map(x=>x.bestTransfer?.lineLabel)
      .filter(Boolean))].sort(),
    bestTransferMissingCounts:[...new Set(blocks
      .map(x=>x.bestTransfer?.missingCount)
      .filter(Number.isInteger))].sort((a,b)=>a-b),
    bestTransferOverlapCounts:[...new Set(blocks
      .map(x=>x.bestTransfer?.overlapCount)
      .filter(Number.isInteger))].sort((a,b)=>a-b),
    transferFailures:blocks.filter(x=>
      !x.terminal&&(!x.bestTransfer||!x.transferTupleStrictlyLower)
    ).map(x=>({
      classId:x.classId,
      eventCell:x.eventCell,
      bestTransfer:x.bestTransfer,
    })),
  },
  boundary:{
    diagnosticOnly:true,
    sourceStatesAreQualifiedForcedNormalizationOutputs:true,
    exactlyOneCurrentP1Event:true,
    externalEventsUseQualifiedProtectedSupportTransition:true,
    protectedTargetTransferSelectionIsDiagnosticOnly:true,
    noTransferTheoremPromoted:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
  },
},null,2));

// CPCX deterministic highest-row protected-diagonal descent.
//
// This operator composes the qualified protected-residual target-acquisition and
// support-advance theorems. It chooses exactly one current controller action:
// the missing target with greatest physical row (smallest column tie-break).
//
// For support-hidden targets it records a local first-win witness at the newly
// released frontier cell: every incident winning line must already contain a
// controller token or retain at least two empty cells.
//
// No future reply layer, solved value, or game-tree search is consumed.

import {
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
  certifyCpcxProtectedResidualTargetAcquisition,
} from './cpcx-target-acquisition.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-diagonal-highest-target-descent.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function supportDebt(residual){
  return residual.events.reduce((n,e)=>n+e.supportDistance,0);
}

function measure(residual){
  return [residual.missingCount,supportDebt(residual)];
}

function less(a,b){
  return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
}

function liveResidual(position,residual){
  return scanCpcxObligations(position).find(o=>
    o.player===residual.player&&o.lineId===residual.lineId
  )??null;
}

function currentFrontier(position,cell){
  const {column,row}=cpcxCell(position.geometry,cell);
  return row<position.geometry.rows&&
    row===position.heights[column]&&
    position.owner[cell]===-1;
}

function lineLabel(g,line){
  return line.cells.map(cell=>{
    const {column,row}=cpcxCell(g,cell);
    return `${String.fromCharCode(65+column)}${row+1}`;
  }).join('-');
}

function localReleaseSafety(position,{
  controller,
  actionCell,
  targetCell,
}){
  const child=applyCpcxForcedEvent(position,actionCell);
  if(child.terminal)return {
    exact:child.terminal.player===controller,
    kind:'SUPPORT_EVENT_TERMINAL',
    terminal:child.terminal,
    releasedCell:null,
    lineWitnesses:[],
  };

  const g=position.geometry,target=cpcxCell(g,targetCell),
    nextRow=child.heights[target.column],
    releasedCell=nextRow<g.rows?nextRow*g.columns+target.column:null,
    opponent=controller^1,
    lineWitnesses=[];

  if(Number.isInteger(releasedCell)){
    for(const lineId of g.cellLines[releasedCell]){
      const line=g.lines[lineId],
        controllerCells=line.cells.filter(cell=>child.owner[cell]===controller),
        opponentCells=line.cells.filter(cell=>child.owner[cell]===opponent),
        emptyCells=line.cells.filter(cell=>child.owner[cell]===-1);
      let classification='OTHER';
      if(controllerCells.length)classification='CONTROLLER_BLOCKED';
      else if(emptyCells.length!==1)classification='NOT_SINGLETON';
      else if(
        emptyCells[0]===releasedCell&&
        opponentCells.length===line.cells.length-1
      )classification='OPPONENT_SINGLETON';
      lineWitnesses.push({
        lineId,
        lineLabel:lineLabel(g,line),
        orientation:line.orientation,
        classification,
        controllerCells,
        opponentCells,
        emptyCells,
      });
    }
  }

  const hazards=lineWitnesses.filter(x=>
    x.classification==='OPPONENT_SINGLETON'
  );
  return {
    exact:hazards.length===0,
    kind:hazards.length
      ?'HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON'
      :'HIGHEST_TARGET_LOCAL_SAFETY',
    releasedCell,
    lineWitnesses,
    hazards,
  };
}

export function certifyCpcxProtectedDiagonalHighestTargetDescent(position,{
  protectedResidual,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');

  const source=liveResidual(position,protectedResidual);
  if(!source)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(source.player!==position.mover)
    return fail('CONTROLLER_NOT_TO_MOVE',{
      controller:source.player,
      mover:position.mover,
    });
  if(source.orientation!=='D+'&&source.orientation!=='D-')
    return fail('SOURCE_NOT_DIAGONAL',{orientation:source.orientation});

  const g=position.geometry,
    columns=source.missingCells.map(cell=>cpcxCell(g,cell).column);
  if(new Set(columns).size!==columns.length)
    return fail('MISSING_TARGET_COLUMNS_NOT_DISTINCT',{columns});

  const events=[...source.events].sort((a,b)=>
      b.row-a.row||a.column-b.column||a.cell-b.cell
    ),
    selected=events[0];
  if(!selected)throw new Error('live residual has no missing target');

  const sourceImmediate=classifyCpcxImmediate(position),
    sourceTargetTerminal=
      sourceImmediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&
      sourceImmediate.mover===source.player&&
      sourceImmediate.winningCells.includes(selected.cell);
  if(sourceImmediate.kind!=='NO_IMMEDIATE_OBLIGATION'&&!sourceTargetTerminal)
    return fail('SOURCE_IMMEDIATE_PRECEDENCE',{boundary:sourceImmediate});

  const sourceMeasure=measure(source);

  if(selected.supportDistance===0){
    const certificate=certifyCpcxProtectedResidualTargetAcquisition(position,{
      controllerResidual:source,
      targetCell:selected.cell,
    });
    if(!certificate.exact)return fail('HIGHEST_TARGET_ACQUISITION_FAILED',{
      selectedTarget:selected.cell,
      certificate,
    });
    if(certificate.kind==='CERTIFIED_FIRST_WIN')return {
      schema:'connect4.cpcx.protected-diagonal-highest-target-descent.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:source.player,
      controller:source.player,
      selectedTarget:selected.cell,
      selectedMode:'TARGET_ACQUISITION',
      sourceMeasure,
      certificate,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };

    const child=certificate.child,
      after=liveResidual(child,{player:source.player,lineId:source.lineId});
    if(!after)return fail('ACQUISITION_CHILD_RESIDUAL_NOT_LIVE');
    const childMeasure=measure(after);
    if(!less(childMeasure,sourceMeasure))
      return fail('ACQUISITION_MEASURE_NOT_DECREASING',{
        sourceMeasure,childMeasure,
      });

    return {
      schema:'connect4.cpcx.protected-diagonal-highest-target-descent.v0_1',
      kind:'PROTECTED_DIAGONAL_HIGHEST_TARGET_DESCENT',
      exact:true,
      controller:source.player,
      opponent:source.player^1,
      selectedTarget:selected.cell,
      selectedMode:'TARGET_ACQUISITION',
      actionCell:certificate.actionCell,
      sourceMeasure,
      childMeasure,
      strictMeasureDecrease:true,
      child,
      childResidual:after,
      certificate,
      localSafety:null,
      proofRule:'deterministic highest-row protected target is currently playable; qualified target acquisition contracts the protected residual and strictly decreases missing cardinality',
      complexity:'O(liveLineCount + K + lineIncidence); K<=4',
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };
  }

  const target=cpcxCell(g,selected.cell),
    actionCell=position.heights[target.column]*g.columns+target.column;
  if(!currentFrontier(position,actionCell))
    return fail('HIGHEST_TARGET_SUPPORT_FRONTIER_NOT_LEGAL',{
      selectedTarget:selected.cell,
      actionCell,
    });

  const localSafety=localReleaseSafety(position,{
    controller:source.player,
    actionCell,
    targetCell:selected.cell,
  });
  if(!localSafety.exact)return fail(
    localSafety.kind,
    {
      selectedTarget:selected.cell,
      actionCell,
      releasedCell:localSafety.releasedCell,
      lineWitnesses:localSafety.lineWitnesses,
      hazards:localSafety.hazards,
    }
  );

  const certificate=certifyCpcxProtectedResidualSupportAdvance(position,{
    controllerResidual:source,
    targetCell:selected.cell,
  });
  if(!certificate.exact)return fail('HIGHEST_TARGET_SUPPORT_ADVANCE_FAILED',{
    selectedTarget:selected.cell,
    actionCell,
    localSafety,
    certificate,
  });
  if(certificate.kind==='CERTIFIED_FIRST_WIN')return {
    schema:'connect4.cpcx.protected-diagonal-highest-target-descent.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:source.player,
    controller:source.player,
    selectedTarget:selected.cell,
    selectedMode:'SUPPORT_ADVANCE',
    sourceMeasure,
    localSafety,
    certificate,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };

  const child=certificate.child,
    after=liveResidual(child,{player:source.player,lineId:source.lineId});
  if(!after)return fail('SUPPORT_CHILD_RESIDUAL_NOT_LIVE');
  const childMeasure=measure(after);
  if(!less(childMeasure,sourceMeasure))
    return fail('SUPPORT_MEASURE_NOT_DECREASING',{
      sourceMeasure,childMeasure,
    });

  return {
    schema:'connect4.cpcx.protected-diagonal-highest-target-descent.v0_1',
    kind:'PROTECTED_DIAGONAL_HIGHEST_TARGET_DESCENT',
    exact:true,
    controller:source.player,
    opponent:source.player^1,
    selectedTarget:selected.cell,
    selectedMode:'SUPPORT_ADVANCE',
    actionCell:certificate.actionCell,
    sourceMeasure,
    childMeasure,
    strictMeasureDecrease:true,
    child,
    childResidual:after,
    certificate,
    localSafety,
    proofRule:'deterministic highest-row protected target is support-hidden; every line through the newly released frontier is controller-blocked or non-singleton, and qualified support advance preserves residual ancestry while decreasing support debt by one',
    complexity:'O(liveLineCount + incidentLineCount*K + K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

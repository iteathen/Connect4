// CPCX protected-residual diagonal transfer.
//
// If the opponent currently occupies one protected target and kills a diagonal
// residual, this theorem may transfer control to an exact overlapping
// controller diagonal with a strictly smaller (missing-count, support-debt)
// tuple. Candidate selection is deterministic over current live lines only.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-residual-diagonal-transfer.v0_1',
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
function tuple(residual){
  return [residual.missingCount,supportDebt(residual)];
}
function tupleLess(a,b){
  return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
}
function sameResidual(position,residual){
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
function immediateSummary(position){
  const x=classifyCpcxImmediate(position);
  return {
    kind:x.kind,
    mover:x.mover??null,
    cell:Number.isInteger(x.cell)?x.cell:null,
    winningCells:[...(x.winningCells??[])],
    opponentThreatCells:[...(x.opponentThreatCells??x.threatCells??[])],
  };
}

export function certifyCpcxProtectedResidualDiagonalTransfer(position,{
  protectedResidual,
  blockedCell,
  minOverlap=2,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');
  if(!Number.isInteger(blockedCell))throw new TypeError('blockedCell');
  if(!Number.isInteger(minOverlap)||minOverlap<1||minOverlap>4)
    throw new RangeError('minOverlap');

  const source=sameResidual(position,protectedResidual);
  if(!source)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(source.orientation!=='D+'&&source.orientation!=='D-')
    return fail('SOURCE_NOT_DIAGONAL',{orientation:source.orientation});

  const controller=source.player,opponent=controller^1;
  if(position.mover!==opponent)
    return fail('SOURCE_MOVER_NOT_OPPONENT',{
      mover:position.mover,controller,opponent,
    });
  if(!source.missingCells.includes(blockedCell))
    return fail('BLOCK_NOT_PROTECTED_TARGET',{blockedCell});
  if(!currentFrontier(position,blockedCell))
    return fail('BLOCK_NOT_CURRENT_FRONTIER',{blockedCell});

  const child=applyCpcxForcedEvent(position,blockedCell);
  if(child.terminal)
    return fail('BLOCK_EVENT_TERMINAL',{
      blockedCell,terminal:child.terminal,
    });
  if(sameResidual(child,source))
    return fail('SOURCE_RESIDUAL_SURVIVED_BLOCK',{blockedCell});

  const g=position.geometry,
    retained=new Set(g.lines[source.lineId].cells.filter(c=>c!==blockedCell)),
    sourceTuple=tuple(source),
    candidates=scanCpcxObligations(child)
      .filter(o=>
        o.player===controller&&
        (o.orientation==='D+'||o.orientation==='D-')
      )
      .map(o=>{
        const overlap=g.lines[o.lineId].cells.filter(c=>retained.has(c));
        return {
          residual:o,
          overlap,
          tuple:tuple(o),
        };
      })
      .filter(x=>
        x.overlap.length>=minOverlap&&
        tupleLess(x.tuple,sourceTuple)
      )
      .sort((a,b)=>
        b.overlap.length-a.overlap.length||
        a.tuple[0]-b.tuple[0]||
        a.tuple[1]-b.tuple[1]||
        a.residual.lineId-b.residual.lineId
      );

  if(!candidates.length)return fail('NO_STRICTLY_LOWER_DIAGONAL_TRANSFER',{
    blockedCell,
    minOverlap,
    sourceTuple,
  });

  const chosen=candidates[0],r=chosen.residual;
  return {
    schema:'connect4.cpcx.protected-residual-diagonal-transfer.v0_1',
    kind:'PROTECTED_RESIDUAL_DIAGONAL_TRANSFER',
    exact:true,
    controller,
    opponent,
    blockedCell,
    sourceRank:position.rank,
    childRank:child.rank,
    rankDelta:1,
    source:{
      lineId:source.lineId,
      lineLabel:source.lineLabel,
      orientation:source.orientation,
      missingCells:[...source.missingCells],
      missingCount:source.missingCount,
      supportDebt:sourceTuple[1],
      tuple:sourceTuple,
    },
    transfer:{
      lineId:r.lineId,
      lineLabel:r.lineLabel,
      orientation:r.orientation,
      missingCells:[...r.missingCells],
      missingCount:r.missingCount,
      supportDebt:chosen.tuple[1],
      tuple:[...chosen.tuple],
      overlapCells:[...chosen.overlap],
      overlapCount:chosen.overlap.length,
      currentlyPlayableCells:[...r.currentlyPlayableCells],
    },
    candidateCount:candidates.length,
    strictTupleDecrease:true,
    sourceKilled:true,
    childImmediateBoundary:immediateSummary(child),
    child,
    proofRule:'opponent current target occupation kills the pinned diagonal; exact current child incidence contains a controller diagonal sharing retained source geometry with strictly smaller missing-cardinality/support-debt tuple; canonical selection uses overlap then tuple then line ID',
    complexity:'O(liveLineCount * K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

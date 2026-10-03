// CPCX protected diagonal anchor-pivot transfer.
//
// Narrow complement to same-track diagonal transfer:
// opponent blocks one playable target of an anchored controller diagonal,
// killing the source line; exact child incidence may re-anchor on an
// opposite-orientation controller diagonal through the same unique owned
// anchor when the protected tuple does not increase.
//
// Well-founded measure:
//   (missingCount, supportDebt, remainingPhysicalCapacity)
// lexicographic. The blocking event always decreases the final coordinate by 1.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  createCpcxResidualCarrier,
  compileCpcxResidualEventChain,
} from './cpcx-residual.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.protected-diagonal-anchor-pivot.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}
function supportDebt(r){
  return r.events.reduce((n,e)=>n+e.supportDistance,0);
}
function tuple(r){
  return [r.missingCount,supportDebt(r)];
}
function compareTuple(a,b){
  return a[0]-b[0]||a[1]-b[1];
}
function tupleLeq(a,b){
  return compareTuple(a,b)<=0;
}
function live(position,residual){
  return scanCpcxObligations(position).find(o=>
    o.player===residual.player&&o.lineId===residual.lineId
  )??null;
}
function frontier(position,cell){
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

export function certifyCpcxProtectedDiagonalAnchorPivot(position,{
  protectedResidual,
  blockedCell,
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');
  if(!Number.isInteger(blockedCell))throw new TypeError('blockedCell');

  const source=live(position,protectedResidual);
  if(!source)return fail('PROTECTED_RESIDUAL_NOT_LIVE');
  if(source.orientation!=='D+'&&source.orientation!=='D-')
    return fail('SOURCE_NOT_DIAGONAL',{orientation:source.orientation});

  const controller=source.player,opponent=controller^1;
  if(position.mover!==opponent)
    return fail('SOURCE_MOVER_NOT_OPPONENT',{
      mover:position.mover,controller,opponent,
    });

  const line=position.geometry.lines[source.lineId],
    missing=new Set(source.missingCells),
    anchors=line.cells.filter(cell=>
      !missing.has(cell)&&position.owner[cell]===controller
    );
  if(anchors.length!==1)
    return fail('SOURCE_UNIQUE_ANCHOR_REQUIRED',{
      anchorCells:anchors,
    });
  const anchorCell=anchors[0];

  if(!source.missingCells.includes(blockedCell))
    return fail('BLOCK_NOT_PROTECTED_TARGET',{blockedCell});
  const event=source.events.find(e=>e.cell===blockedCell);
  if(!event)throw new Error('protected target event missing');
  if(event.supportDistance!==0||!frontier(position,blockedCell))
    return fail('BLOCKED_TARGET_NOT_PLAYABLE',{
      blockedCell,
      supportDistance:event.supportDistance,
    });

  const carrier=createCpcxResidualCarrier(position,[source]),
    chain=compileCpcxResidualEventChain(carrier,[{
      cell:blockedCell,owner:opponent,
    }]),
    effect=chain.steps[0],
    killed=effect.killed.some(x=>
      x.player===controller&&
      x.lineLabel===source.lineLabel&&
      x.killingCell===blockedCell&&
      x.killingOwner===opponent
    );
  if(!killed||chain.residuals.length)
    return fail('SOURCE_COFACTOR_NOT_KILLED',{
      killed,
      remainingResidualCount:chain.residuals.length,
    });

  const child=applyCpcxForcedEvent(position,blockedCell);
  if(child.terminal)
    return fail('BLOCK_EVENT_TERMINAL',{
      blockedCell,terminal:child.terminal,
    });
  if(child.owner[anchorCell]!==controller)
    return fail('ANCHOR_NOT_PRESERVED',{anchorCell});

  const sourceTuple=tuple(source),
    candidates=scanCpcxObligations(child)
      .filter(o=>
        o.player===controller&&
        (o.orientation==='D+'||o.orientation==='D-')&&
        o.orientation!==source.orientation&&
        child.geometry.lines[o.lineId].cells.includes(anchorCell)&&
        !child.geometry.lines[o.lineId].cells.includes(blockedCell)
      )
      .map(o=>({residual:o,tuple:tuple(o)}))
      .filter(x=>tupleLeq(x.tuple,sourceTuple))
      .sort((a,b)=>
        compareTuple(a.tuple,b.tuple)||
        a.residual.lineId-b.residual.lineId
      );

  if(!candidates.length)
    return fail('NO_NONINCREASING_ANCHOR_PIVOT',{
      anchorCell,
      blockedCell,
      sourceTuple,
    });

  const chosen=candidates[0],pivot=chosen.residual,
    sourceRemaining=position.geometry.cellCount-position.rank,
    childRemaining=child.geometry.cellCount-child.rank;
  if(childRemaining!==sourceRemaining-1)
    return fail('REMAINING_CAPACITY_NOT_UNIT_DECREASE',{
      sourceRemaining,childRemaining,
    });

  return {
    schema:'connect4.cpcx.protected-diagonal-anchor-pivot.v0_1',
    kind:'PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER',
    exact:true,
    controller,
    opponent,
    blockedCell,
    anchorCell,
    sourceRank:position.rank,
    childRank:child.rank,
    source:{
      lineId:source.lineId,
      lineLabel:source.lineLabel,
      orientation:source.orientation,
      missingCells:[...source.missingCells],
      tuple:[...sourceTuple],
    },
    pivot:{
      lineId:pivot.lineId,
      lineLabel:pivot.lineLabel,
      orientation:pivot.orientation,
      missingCells:[...pivot.missingCells],
      tuple:[...chosen.tuple],
      currentlyPlayableCells:[...pivot.currentlyPlayableCells],
    },
    sourceRemainingCapacity:sourceRemaining,
    childRemainingCapacity:childRemaining,
    protectedTupleNonincreasing:true,
    strictExtendedMeasureDecrease:true,
    extendedMeasure:{
      source:[sourceTuple[0],sourceTuple[1],sourceRemaining],
      child:[chosen.tuple[0],chosen.tuple[1],childRemaining],
      order:'LEXICOGRAPHIC',
    },
    sourceKilled:true,
    sourceCofactorKilled:true,
    childImmediateBoundary:immediateSummary(child),
    child,
    selectionRule:'opposite diagonal through unique owned anchor; protected tuple nonincreasing; smallest tuple then smallest line id',
    proofRule:'opponent target occupation kills the anchored source diagonal; exact child incidence supplies an opposite-orientation controller residual through the same unique owned anchor with nonincreasing protected tuple; the physical block consumes one board cell, so the extended lexicographic measure strictly decreases',
    complexity:'O(liveLineCount * K + liveLineCount log liveLineCount); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

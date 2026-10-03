// CPCX protected diagonal-track transfer.
//
// If the opponent occupies one currently playable target of a protected
// diagonal residual, the source residual is killed. This theorem may re-anchor
// the protected observation on one exact live controller residual on the same
// physical diagonal track, but only when the replacement has retained source
// overlap and a strictly smaller lexicographic (missing-count, support-debt)
// measure.
//
// No W/D/L label, solver result, future reply search, class identifier, or
// caller-tuned transfer threshold is consumed.

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
    schema:'connect4.cpcx.protected-diagonal-track-transfer.v0_1',
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

function trackKey(geometry,line){
  const first=cpcxCell(geometry,line.cells[0]);
  if(line.orientation==='D+')
    return `D+:${first.row-first.column}`;
  if(line.orientation==='D-')
    return `D-:${first.row+first.column}`;
  return null;
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
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!protectedResidual||!Number.isInteger(protectedResidual.lineId)||
     (protectedResidual.player!==0&&protectedResidual.player!==1))
    throw new TypeError('protectedResidual');
  if(!Number.isInteger(blockedCell))throw new TypeError('blockedCell');

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

  const sourceEvent=source.events.find(e=>e.cell===blockedCell);
  if(!sourceEvent)throw new Error('protected target event missing');
  if(sourceEvent.supportDistance!==0)
    return fail('BLOCKED_TARGET_NOT_PLAYABLE',{
      blockedCell,
      supportDistance:sourceEvent.supportDistance,
    });
  if(!currentFrontier(position,blockedCell))
    return fail('BLOCK_NOT_CURRENT_FRONTIER',{blockedCell});

  const carrier=createCpcxResidualCarrier(position,[source]),
    chain=compileCpcxResidualEventChain(carrier,[{
      cell:blockedCell,
      owner:opponent,
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
      blockedCell,
      terminal:child.terminal,
    });
  if(sameResidual(child,source))
    return fail('SOURCE_RESIDUAL_SURVIVED_BLOCK',{blockedCell});

  const g=position.geometry,
    sourceLine=g.lines[source.lineId],
    sourceTrack=trackKey(g,sourceLine);
  if(sourceTrack===null)throw new Error('source diagonal track missing');

  const retained=new Set(
      sourceLine.cells.filter(cell=>cell!==blockedCell)
    ),
    sourceTuple=tuple(source),
    candidates=[];

  for(const residual of scanCpcxObligations(child)){
    if(residual.player!==controller)continue;
    if(residual.orientation!==source.orientation)continue;
    const line=g.lines[residual.lineId];
    if(trackKey(g,line)!==sourceTrack)continue;
    if(line.cells.includes(blockedCell))continue;

    const overlap=line.cells.filter(cell=>retained.has(cell));
    if(!overlap.length)continue;

    const candidateTuple=tuple(residual);
    if(!tupleLess(candidateTuple,sourceTuple))continue;

    candidates.push({
      residual,
      overlap,
      tuple:candidateTuple,
    });
  }

  candidates.sort((a,b)=>
    b.overlap.length-a.overlap.length||
    a.tuple[0]-b.tuple[0]||
    a.tuple[1]-b.tuple[1]||
    a.residual.lineId-b.residual.lineId
  );

  if(!candidates.length)
    return fail('NO_STRICTLY_LOWER_SAME_TRACK_TRANSFER',{
      blockedCell,
      sourceTrack,
      sourceTuple,
    });

  const chosen=candidates[0],replacement=chosen.residual;
  return {
    schema:'connect4.cpcx.protected-diagonal-track-transfer.v0_1',
    kind:'PROTECTED_DIAGONAL_TRACK_TRANSFER',
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
      track:sourceTrack,
      missingCells:[...source.missingCells],
      missingCount:source.missingCount,
      supportDebt:sourceTuple[1],
      tuple:[...sourceTuple],
    },
    transfer:{
      lineId:replacement.lineId,
      lineLabel:replacement.lineLabel,
      orientation:replacement.orientation,
      track:sourceTrack,
      missingCells:[...replacement.missingCells],
      missingCount:replacement.missingCount,
      supportDebt:chosen.tuple[1],
      tuple:[...chosen.tuple],
      overlapCells:[...chosen.overlap],
      overlapCount:chosen.overlap.length,
      currentlyPlayableCells:[...replacement.currentlyPlayableCells],
    },
    candidateCount:candidates.length,
    strictTupleDecrease:true,
    sourceKilled:true,
    sourceCofactorKilled:true,
    childImmediateBoundary:immediateSummary(child),
    child,
    selectionRule:'same orientation and physical diagonal track; greatest retained overlap; smallest missing cardinality; smallest support debt; smallest line id',
    proofRule:'opponent current target occupation kills the pinned diagonal residual; exact child incidence is scanned only for live controller residuals on the same physical diagonal track, and the deterministic replacement is admitted only with retained-cell overlap and strict lexicographic (missing cardinality, support debt) descent',
    complexity:'O(liveLineCount * K + liveLineCount log liveLineCount); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

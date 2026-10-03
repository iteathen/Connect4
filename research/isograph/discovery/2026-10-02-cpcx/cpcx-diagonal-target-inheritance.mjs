// CPCX protected diagonal target-inheritance handoff.
//
// Fallback structural handoff after an opponent blocks one playable protected
// diagonal target, killing the source residual. A replacement diagonal is
// admissible only when it inherits at least one other source missing target and
// has strictly smaller missing cardinality.
//
// This is a carrier-progress theorem only. It does not prove completion or W/D/L.

import {
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
    schema:'connect4.cpcx.protected-diagonal-target-inheritance-handoff.v0_1',
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

function live(position,residual){
  return scanCpcxObligations(position).find(o=>
    o.player===residual.player&&o.lineId===residual.lineId
  )??null;
}

function frontier(position,cell){
  const g=position.geometry,
    column=cell%g.columns,row=Math.floor(cell/g.columns);
  return row<g.rows&&
    row===position.heights[column]&&
    position.owner[cell]===-1;
}

function measure(position,residual){
  return [
    residual.missingCount,
    supportDebt(residual),
    position.geometry.cellCount-position.rank,
  ];
}

function lexLess(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++){
    if(a[i]<b[i])return true;
    if(a[i]>b[i])return false;
  }
  return a.length<b.length;
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

export function certifyCpcxProtectedDiagonalTargetInheritanceHandoff(position,{
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
  if(source.missingCount<2)
    return fail('SOURCE_MISSING_CARDINALITY_TOO_SMALL',{
      missingCount:source.missingCount,
    });

  const controller=source.player,opponent=controller^1;
  if(position.mover!==opponent)
    return fail('SOURCE_MOVER_NOT_OPPONENT',{
      mover:position.mover,controller,opponent,
    });
  if(!source.missingCells.includes(blockedCell))
    return fail('BLOCK_NOT_PROTECTED_TARGET',{blockedCell});

  const event=source.events.find(e=>e.cell===blockedCell);
  if(!event)throw new Error('blocked target event missing');
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
      blockedCell,
      terminal:child.terminal,
    });
  if(live(child,source))
    return fail('SOURCE_RESIDUAL_SURVIVED_BLOCK',{blockedCell});

  const inheritedSourceTargets=source.missingCells
      .filter(cell=>cell!==blockedCell),
    inheritedSet=new Set(inheritedSourceTargets),
    sourceMeasure=measure(position,source),
    candidates=[];

  for(const residual of scanCpcxObligations(child)){
    if(residual.player!==controller)continue;
    if(residual.orientation!=='D+'&&residual.orientation!=='D-')continue;
    if(residual.missingCount>=source.missingCount)continue;
    if(child.geometry.lines[residual.lineId].cells.includes(blockedCell))continue;

    const inheritedTargets=residual.missingCells
      .filter(cell=>inheritedSet.has(cell))
      .sort((a,b)=>a-b);
    if(!inheritedTargets.length)continue;

    const childMeasure=measure(child,residual);
    if(!lexLess(childMeasure,sourceMeasure))
      throw new Error('strict cardinality drop failed extended measure descent');

    candidates.push({
      residual,
      inheritedTargets,
      inheritedTargetCount:inheritedTargets.length,
      supportDebt:supportDebt(residual),
      measure:childMeasure,
    });
  }

  if(!candidates.length)
    return fail('NO_STRICT_TARGET_INHERITANCE_CANDIDATE',{
      blockedCell,
      inheritedSourceTargets,
      sourceMeasure,
    });

  candidates.sort((a,b)=>
    a.residual.missingCount-b.residual.missingCount||
    b.inheritedTargetCount-a.inheritedTargetCount||
    a.supportDebt-b.supportDebt||
    a.residual.lineId-b.residual.lineId
  );

  const selected=candidates[0],
    childMeasure=selected.measure;

  return {
    schema:'connect4.cpcx.protected-diagonal-target-inheritance-handoff.v0_1',
    kind:'PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF',
    exact:true,
    controller,
    opponent,
    sourceRank:position.rank,
    childRank:child.rank,
    rankDelta:1,
    blockedCell,
    sourceResidual:source,
    sourceMeasure,
    inheritedSourceTargets:[...inheritedSourceTargets],
    candidateCount:candidates.length,
    candidates:candidates.map(x=>({
      residual:x.residual,
      inheritedTargets:[...x.inheritedTargets],
      inheritedTargetCount:x.inheritedTargetCount,
      supportDebt:x.supportDebt,
      measure:[...x.measure],
    })),
    handoffResidual:selected.residual,
    inheritedTargets:[...selected.inheritedTargets],
    inheritedTargetCount:selected.inheritedTargetCount,
    childMeasure,
    strictMeasureDecrease:true,
    child,
    childImmediate:immediateSummary(child),
    selectionRule:'smallest missing cardinality, then largest inherited-target count, then smallest support debt, then smallest physical line id',
    proofRule:'opponent block exactly kills the protected diagonal; the selected child diagonal excludes the block, inherits at least one still-empty source target, and strictly drops missing cardinality, so the protected extended measure decreases before any downstream value claim',
    complexity:'O(liveLineCount*K + liveLineCount*log(liveLineCount)); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

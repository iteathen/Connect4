// CPCX bounded residual-defect transport.
//
// Exact paired-state theorem:
//   same geometry + same support + same mover
//   -> exact common residual carrier C plus one-sided residual defects
//   -> one common legal owner-labelled event cannot create new one-sided rows
//      from C; only pre-existing defect rows can remain different.
//
// The theorem is line-indexed. It does not merge distinct physical winning lines.
// First-terminal disagreement is exposed as a defect-observable boundary and stops.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  createCpcxSaturatedColumnCofactor,
} from './cpcx-saturated-column-cofactor.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.bounded-residual-defect-transport.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}
function geometryEqual(a,b){
  return a&&b&&
    a.columns===b.columns&&
    a.rows===b.rows&&
    a.connect===b.connect;
}
function sameArray(a,b){
  return a.length===b.length&&a.every((x,i)=>x===b[i]);
}
function rowKey(r){
  return JSON.stringify([
    r.player,
    r.lineId,
    r.orientation,
    [...r.missingCells],
  ]);
}
function sortRows(rows){
  return rows.sort((a,b)=>
    a.player-b.player||
    a.lineId-b.lineId||
    a.orientation.localeCompare(b.orientation)||
    a.missingCells.join(',').localeCompare(b.missingCells.join(','))
  );
}
function exactRows(position,saturatedColumn){
  if(Number.isInteger(saturatedColumn)){
    const q=createCpcxSaturatedColumnCofactor(position,{
      column:saturatedColumn,
    });
    if(!q.exact)return {failure:q};
    return {
      rows:q.residuals.map(r=>({
        player:r.player,
        lineId:r.lineId,
        orientation:r.orientation,
        missingCells:[...r.missingCells],
      })),
      quotient:q,
    };
  }
  return {
    rows:scanCpcxObligations(position).map(r=>({
      player:r.player,
      lineId:r.lineId,
      orientation:r.orientation,
      missingCells:[...r.missingCells],
    })),
    quotient:null,
  };
}
function partitionRows(leftRows,rightRows){
  const L=new Map(leftRows.map(r=>[rowKey(r),r])),
    R=new Map(rightRows.map(r=>[rowKey(r),r])),
    common=[],leftOnly=[],rightOnly=[];
  for(const [k,r] of L){
    if(R.has(k))common.push(r);
    else leftOnly.push(r);
  }
  for(const [k,r] of R)
    if(!L.has(k))rightOnly.push(r);
  return {
    common:sortRows(common),
    leftOnly:sortRows(leftOnly),
    rightOnly:sortRows(rightOnly),
  };
}
function currentFrontier(position,cell){
  if(!Number.isInteger(cell))return false;
  const {column,row}=cpcxCell(position.geometry,cell);
  return row<position.geometry.rows&&
    row===position.heights[column]&&
    position.owner[cell]===-1;
}
function transformRows(rows,eventCell,eventOwner){
  const surviving=[],completions=[],killed=[];
  for(const r of rows){
    if(!r.missingCells.includes(eventCell)){
      surviving.push({
        ...r,
        missingCells:[...r.missingCells],
      });
      continue;
    }
    if(r.player!==eventOwner){
      killed.push({
        player:r.player,
        lineId:r.lineId,
        orientation:r.orientation,
      });
      continue;
    }
    const missingCells=r.missingCells.filter(cell=>cell!==eventCell);
    if(!missingCells.length){
      completions.push({
        player:r.player,
        lineId:r.lineId,
        orientation:r.orientation,
      });
      continue;
    }
    surviving.push({...r,missingCells});
  }
  return {
    surviving:sortRows(surviving),
    completions:completions.sort((a,b)=>
      a.player-b.player||a.lineId-b.lineId
    ),
    killed:killed.sort((a,b)=>
      a.player-b.player||a.lineId-b.lineId
    ),
  };
}
function rowSet(rows){
  return new Set(rows.map(rowKey));
}
function subsetRows(rows,container){
  const C=rowSet(container);
  return rows.every(r=>C.has(rowKey(r)));
}
function terminalSummary(position){
  return position.terminal?{
    player:position.terminal.player,
    lineId:position.terminal.lineId,
  }:null;
}
function completionHas(rows,terminal){
  return terminal&&rows.some(x=>
    x.player===terminal.player&&x.lineId===terminal.lineId
  );
}
function sameSupport(left,right){
  return sameArray(Array.from(left.heights),Array.from(right.heights));
}

export function createCpcxResidualDefectPair(left,right,{
  saturatedColumn=null,
}={}){
  if(!left?.geometry||!right?.geometry)
    throw new TypeError('two exact CPCX positions required');
  if(!geometryEqual(left.geometry,right.geometry))
    return fail('GEOMETRY_MISMATCH');
  if(left.terminal||right.terminal)
    return fail('SOURCE_ALREADY_TERMINAL');
  if(left.mover!==right.mover)
    return fail('MOVER_MISMATCH',{
      leftMover:left.mover,
      rightMover:right.mover,
    });
  if(!sameSupport(left,right))
    return fail('SUPPORT_MISMATCH',{
      leftSupport:Array.from(left.heights),
      rightSupport:Array.from(right.heights),
    });

  const L=exactRows(left,saturatedColumn);
  if(L.failure)return fail('LEFT_RESIDUAL_PROJECTION_FAILED',{
    failure:L.failure,
  });
  const R=exactRows(right,saturatedColumn);
  if(R.failure)return fail('RIGHT_RESIDUAL_PROJECTION_FAILED',{
    failure:R.failure,
  });

  const p=partitionRows(L.rows,R.rows);
  return {
    schema:'connect4.cpcx.residual-defect-pair.v0_1',
    kind:'RESIDUAL_DEFECT_PAIR',
    exact:true,
    saturatedColumn:Number.isInteger(saturatedColumn)
      ?saturatedColumn:null,
    rankLeft:left.rank,
    rankRight:right.rank,
    mover:left.mover,
    support:Array.from(left.heights),
    common:p.common,
    leftOnly:p.leftOnly,
    rightOnly:p.rightOnly,
    commonCount:p.common.length,
    leftDefectCount:p.leftOnly.length,
    rightDefectCount:p.rightOnly.length,
    defectSize:p.leftOnly.length+p.rightOnly.length,
    proofRule:'exact line-indexed residual intersection and symmetric difference at equal support/mover; no distinct winning lines are merged',
    complexity:'O(liveLineCount * K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function certifyCpcxResidualDefectTransport(left,right,{
  eventCell,
  saturatedColumn=null,
}={}){
  if(!Number.isInteger(eventCell))throw new TypeError('eventCell');

  const source=createCpcxResidualDefectPair(left,right,{
    saturatedColumn,
  });
  if(!source.exact)return source;

  if(!currentFrontier(left,eventCell)||
     !currentFrontier(right,eventCell))
    return fail('EVENT_NOT_COMMON_CURRENT_FRONTIER',{
      eventCell,
      leftCurrent:currentFrontier(left,eventCell),
      rightCurrent:currentFrontier(right,eventCell),
    });

  const eventOwner=left.mover,
    commonT=transformRows(source.common,eventCell,eventOwner),
    leftT=transformRows(source.leftOnly,eventCell,eventOwner),
    rightT=transformRows(source.rightOnly,eventCell,eventOwner),
    childLeft=applyCpcxForcedEvent(left,eventCell),
    childRight=applyCpcxForcedEvent(right,eventCell),
    terminalLeft=terminalSummary(childLeft),
    terminalRight=terminalSummary(childRight);

  if(commonT.completions.length){
    if(!terminalLeft||!terminalRight)
      return fail('COMMON_COMPLETION_NOT_TERMINAL_ON_BOTH',{
        commonCompletions:commonT.completions,
        terminalLeft,
        terminalRight,
      });
    if(terminalLeft.player!==eventOwner||
       terminalRight.player!==eventOwner)
      return fail('COMMON_COMPLETION_TERMINAL_OWNER_MISMATCH',{
        eventOwner,
        terminalLeft,
        terminalRight,
      });
  }

  if(terminalLeft||terminalRight){
    const leftDefectTerminal=completionHas(
        leftT.completions,terminalLeft
      ),
      rightDefectTerminal=completionHas(
        rightT.completions,terminalRight
      ),
      sameTerminal=
        terminalLeft!==null&&terminalRight!==null&&
        terminalLeft.player===terminalRight.player&&
        terminalLeft.lineId===terminalRight.lineId;

    if(!sameTerminal&&
       !leftDefectTerminal&&!rightDefectTerminal)
      return fail('TERMINAL_DIVERGENCE_NOT_EXPLAINED_BY_DEFECT',{
        terminalLeft,
        terminalRight,
        commonCompletions:commonT.completions,
        leftDefectCompletions:leftT.completions,
        rightDefectCompletions:rightT.completions,
      });

    return {
      schema:'connect4.cpcx.bounded-residual-defect-terminal.v0_1',
      kind:sameTerminal
        ?'COMMON_FIRST_TERMINAL'
        :'DEFECT_OBSERVABLE_FIRST_TERMINAL',
      exact:true,
      eventCell,
      eventOwner,
      sourceDefectSize:source.defectSize,
      terminalLeft,
      terminalRight,
      sameTerminal,
      commonCompletions:commonT.completions,
      leftDefectCompletions:leftT.completions,
      rightDefectCompletions:rightT.completions,
      terminalDifferenceExplainedByDefect:
        sameTerminal||leftDefectTerminal||rightDefectTerminal,
      firstWinStopping:true,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };
  }

  if(!sameSupport(childLeft,childRight)||
     childLeft.mover!==childRight.mover)
    return fail('PAIRED_SUPPORT_TRANSPORT_MISMATCH',{
      leftSupport:Array.from(childLeft.heights),
      rightSupport:Array.from(childRight.heights),
      leftMover:childLeft.mover,
      rightMover:childRight.mover,
    });

  const target=createCpcxResidualDefectPair(childLeft,childRight,{
    saturatedColumn,
  });
  if(!target.exact)return fail('TARGET_DEFECT_PAIR_FAILED',{target});

  if(!subsetRows(commonT.surviving,target.common))
    return fail('SOURCE_COMMON_CREATED_ONE_SIDED_DEFECT',{
      predictedCommon:commonT.surviving,
      targetCommon:target.common,
    });

  if(!subsetRows(target.leftOnly,leftT.surviving))
    return fail('NEW_LEFT_DEFECT_ROW_CREATED',{
      predictedLeftDefect:leftT.surviving,
      targetLeftDefect:target.leftOnly,
    });

  if(!subsetRows(target.rightOnly,rightT.surviving))
    return fail('NEW_RIGHT_DEFECT_ROW_CREATED',{
      predictedRightDefect:rightT.surviving,
      targetRightDefect:target.rightOnly,
    });

  if(target.defectSize>source.defectSize)
    return fail('DEFECT_SIZE_INCREASED',{
      sourceDefectSize:source.defectSize,
      targetDefectSize:target.defectSize,
    });

  return {
    schema:'connect4.cpcx.bounded-residual-defect-transport.v0_1',
    kind:'BOUNDED_RESIDUAL_DEFECT_TRANSPORT',
    exact:true,
    saturatedColumn:Number.isInteger(saturatedColumn)
      ?saturatedColumn:null,
    eventCell,
    eventOwner,
    sourceDefectSize:source.defectSize,
    targetDefectSize:target.defectSize,
    defectDelta:target.defectSize-source.defectSize,
    defectNonincreasing:true,
    sourceCommonCount:source.commonCount,
    targetCommonCount:target.commonCount,
    commonSurvivorCount:commonT.surviving.length,
    leftDefectSurvivorCount:leftT.surviving.length,
    rightDefectSurvivorCount:rightT.surviving.length,
    source,
    target,
    childLeft,
    childRight,
    proofRule:'same support/mover gives the same legal owner-labelled event; every exact common line-indexed residual receives the same cofactor/kill operation on both sides, so only pre-existing one-sided rows can remain one-sided; convergence may shrink the defect but common rows cannot create new defect rows',
    complexity:'O((commonResidualCount + defectSize) * K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

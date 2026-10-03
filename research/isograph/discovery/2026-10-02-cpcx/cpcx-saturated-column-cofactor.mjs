// CPCX saturated-column cofactor homomorphism.
//
// A saturated column is immutable and has no future legal events. Its fixed
// owner word can therefore be compiled into owner-labelled residual cofactors
// over the remaining columns. Legal events outside the saturated column commute
// with this projection exactly, up to ordinary first-terminal stopping.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.saturated-column-cofactor.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function validatePosition(position){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
}

function validateColumn(position,column){
  if(!Number.isInteger(column)||
     column<0||column>=position.geometry.columns)
    throw new RangeError('column');
}

function sameArray(a,b){
  return a.length===b.length&&a.every((x,i)=>x===b[i]);
}

function residualRows(position,column){
  return scanCpcxObligations(position).map(o=>({
    player:o.player,
    lineId:o.lineId,
    orientation:o.orientation,
    missingCells:[...o.missingCells].filter(cell=>
      cpcxCell(position.geometry,cell).column!==column
    ).sort((a,b)=>a-b),
  })).sort((a,b)=>
    a.player-b.player||
    a.lineId-b.lineId||
    a.orientation.localeCompare(b.orientation)||
    a.missingCells.join(',').localeCompare(b.missingCells.join(','))
  );
}

function residualKey(rows){
  return JSON.stringify(rows.map(r=>[
    r.player,r.lineId,r.orientation,r.missingCells
  ]));
}

function currentFrontier(position,cell){
  if(!Number.isInteger(cell))return false;
  const {column,row}=cpcxCell(position.geometry,cell);
  return row<position.geometry.rows&&
    row===position.heights[column]&&
    position.owner[cell]===-1;
}

function sideSupport(position,column){
  return Array.from(position.heights)
    .filter((_,c)=>c!==column);
}

function fixedOwnerWord(position,column){
  const out=[];
  for(let row=0;row<position.geometry.rows;row++)
    out.push(position.owner[row*position.geometry.columns+column]);
  return out;
}

function algebraStep(rows,eventCell,eventOwner){
  const next=[],completions=[];
  for(const row of rows){
    if(!row.missingCells.includes(eventCell)){
      next.push({...row,missingCells:[...row.missingCells]});
      continue;
    }
    if(row.player!==eventOwner)continue;

    const missingCells=row.missingCells.filter(cell=>cell!==eventCell);
    if(!missingCells.length){
      completions.push({
        player:row.player,
        lineId:row.lineId,
        orientation:row.orientation,
      });
      continue;
    }
    next.push({...row,missingCells});
  }
  next.sort((a,b)=>
    a.player-b.player||
    a.lineId-b.lineId||
    a.orientation.localeCompare(b.orientation)||
    a.missingCells.join(',').localeCompare(b.missingCells.join(','))
  );
  completions.sort((a,b)=>
    a.player-b.player||a.lineId-b.lineId
  );
  return {rows:next,completions};
}

export function createCpcxSaturatedColumnCofactor(position,{
  column,
}={}){
  validatePosition(position);
  validateColumn(position,column);
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(position.heights[column]!==position.geometry.rows)
    return fail('COLUMN_NOT_SATURATED',{
      column,
      height:position.heights[column],
      required:position.geometry.rows,
    });

  const residuals=residualRows(position,column);
  if(residuals.some(r=>r.missingCells.some(cell=>
    cpcxCell(position.geometry,cell).column===column
  )))return fail('PROJECTED_RESIDUAL_RETAINS_SATURATED_CELL');

  return {
    schema:'connect4.cpcx.saturated-column-cofactor.v0_1',
    kind:'SATURATED_COLUMN_COFACTOR',
    exact:true,
    geometry:position.geometry,
    saturatedColumn:column,
    fixedOwnerWord:fixedOwnerWord(position,column),
    rank:position.rank,
    mover:position.mover,
    sideSupport:sideSupport(position,column),
    residuals,
    residualCount:residuals.length,
    proofRule:'a saturated column has no future events; exact current live winning-line residuals therefore contain only side cells, and the fixed owner word is an immutable cofactor boundary',
    complexity:'O(liveLineCount * K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function deriveCpcxSaturatedColumnRlcProfile(position,{
  column,
}={}){
  const q=createCpcxSaturatedColumnCofactor(position,{column});
  if(!q.exact)return q;

  const out=[];
  for(let c=0;c<position.geometry.columns;c++){
    if(c===column||position.heights[c]>=position.geometry.rows)continue;
    const landing=position.heights[c]*position.geometry.columns+c,
      A=q.residuals.filter(r=>
        r.player===position.mover&&r.missingCells.includes(landing)
      ).length,
      B=q.residuals.filter(r=>
        r.player===(position.mover^1)&&r.missingCells.includes(landing)
      ).length,
      H=position.geometry.rows-position.heights[c]-1;
    out.push({
      column:c,
      landing,
      A,
      B,
      H,
    });
  }
  return {
    schema:'connect4.cpcx.saturated-column-rlc-profile.v0_1',
    kind:'SATURATED_COLUMN_RLC_PROFILE',
    exact:true,
    saturatedColumn:column,
    rank:position.rank,
    mover:position.mover,
    candidates:out,
    proofRule:'A/B are exact mover/opponent live residual incidence counts in the saturated-column cofactor; H is unchanged side-column capacity',
    complexity:'O(legalSideColumns * projectedResidualCount)',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function certifyCpcxSaturatedColumnCofactorEvent(position,{
  column,
  eventCell,
}={}){
  validatePosition(position);
  validateColumn(position,column);
  if(!Number.isInteger(eventCell))throw new TypeError('eventCell');

  const source=createCpcxSaturatedColumnCofactor(position,{column});
  if(!source.exact)return source;

  const meta=cpcxCell(position.geometry,eventCell);
  if(meta.column===column)
    return fail('EVENT_IN_SATURATED_COLUMN',{eventCell,column});
  if(!currentFrontier(position,eventCell))
    return fail('EVENT_NOT_CURRENT_FRONTIER',{eventCell});

  const eventOwner=position.mover,
    predicted=algebraStep(source.residuals,eventCell,eventOwner),
    child=applyCpcxForcedEvent(position,eventCell);

  if(child.terminal){
    const own=predicted.completions.filter(x=>x.player===eventOwner);
    if(!own.length)return fail('PHYSICAL_TERMINAL_WITHOUT_PROJECTED_COMPLETION',{
      terminal:child.terminal,
      predictedCompletions:predicted.completions,
    });
    if(child.terminal.player!==eventOwner)
      return fail('TERMINAL_OWNER_MISMATCH',{
        terminal:child.terminal,
        eventOwner,
      });
    if(!own.some(x=>x.lineId===child.terminal.lineId))
      return fail('TERMINAL_LINE_NOT_IN_PROJECTED_COMPLETIONS',{
        terminal:child.terminal,
        predictedCompletions:predicted.completions,
      });

    return {
      schema:'connect4.cpcx.saturated-column-cofactor-event.v0_1',
      kind:'SATURATED_COLUMN_COFACTOR_TERMINAL',
      exact:true,
      saturatedColumn:column,
      eventCell,
      eventOwner,
      terminal:child.terminal,
      projectedCompletions:predicted.completions,
      firstWinPreserved:true,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };
  }

  if(predicted.completions.length)
    return fail('PROJECTED_COMPLETION_WITHOUT_PHYSICAL_TERMINAL',{
      predictedCompletions:predicted.completions,
    });

  const target=createCpcxSaturatedColumnCofactor(child,{column});
  if(!target.exact)return fail('CHILD_COFACTOR_FAILED',{target});

  if(residualKey(predicted.rows)!==residualKey(target.residuals))
    return fail('RESIDUAL_HOMOMORPHISM_MISMATCH',{
      predicted:predicted.rows,
      actual:target.residuals,
    });

  const expectedSideSupport=[...source.sideSupport],
    sideIndex=meta.column<column?meta.column:meta.column-1;
  expectedSideSupport[sideIndex]++;
  if(!sameArray(expectedSideSupport,target.sideSupport))
    return fail('SIDE_SUPPORT_TRANSITION_MISMATCH',{
      expectedSideSupport,
      actualSideSupport:target.sideSupport,
    });

  return {
    schema:'connect4.cpcx.saturated-column-cofactor-event.v0_1',
    kind:'SATURATED_COLUMN_COFACTOR_EVENT',
    exact:true,
    saturatedColumn:column,
    eventCell,
    eventOwner,
    sourceRank:position.rank,
    childRank:child.rank,
    sourceResidualCount:source.residuals.length,
    childResidualCount:target.residuals.length,
    fixedOwnerWord:[...source.fixedOwnerWord],
    fixedOwnerWordPreserved:
      sameArray(source.fixedOwnerWord,target.fixedOwnerWord),
    residualHomomorphism:true,
    sideSupportHomomorphism:true,
    firstWinPreserved:true,
    child,
    quotient:target,
    proofRule:'outside-column owner-labelled cofactor/kill commutes with deletion of an immutable saturated column; side gravity is column-local and first terminal is checked before any further quotient step',
    complexity:'O(liveLineCount * K); K<=4',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

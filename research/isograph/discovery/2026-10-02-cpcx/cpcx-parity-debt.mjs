// CPCX single odd-capacity parity-debt transport.
//
// Pure support/parity theorem. It does not select a strategically sound move.
// It certifies how one unmatched odd remaining-capacity column is preserved or
// transported by a two-event trigger/response macro.

import {cpcxCell} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.single-odd-capacity-debt.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function validate(position){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
}

function remaining(position,column){
  return position.geometry.rows-position.heights[column];
}

function normalizedExcluded(position,excludedColumns){
  const xs=[...new Set(excludedColumns??[])].sort((a,b)=>a-b);
  for(const c of xs)
    if(!Number.isInteger(c)||c<0||c>=position.geometry.columns)
      throw new RangeError('excludedColumns');
  return xs;
}

export function deriveCpcxSingleOddCapacityDebt(position,{
  excludedColumns=[],
}={}){
  validate(position);
  const excluded=normalizedExcluded(position,excludedColumns),
    excludedSet=new Set(excluded),
    capacities=[],
    oddColumns=[];

  for(let c=0;c<position.geometry.columns;c++){
    if(excludedSet.has(c))continue;
    const capacity=remaining(position,c);
    capacities.push({column:c,capacity,parity:capacity&1});
    if(capacity&1)oddColumns.push(c);
  }

  if(oddColumns.length!==1)
    return fail('NOT_SINGLE_ODD_CAPACITY_CLASS',{
      excludedColumns:excluded,
      capacities,
      oddColumns,
    });

  return {
    schema:'connect4.cpcx.single-odd-capacity-debt.v0_1',
    kind:'SINGLE_ODD_CAPACITY_DEBT',
    exact:true,
    rank:position.rank,
    mover:position.mover,
    excludedColumns:excluded,
    capacities,
    debtColumn:oddColumns[0],
    totalRemaining:capacities.reduce((n,x)=>n+x.capacity,0),
    proofRule:'remaining-capacity parity is computed directly from current support; exactly one included column is odd',
    complexity:'O(columnCount)',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function certifyCpcxSingleOddCapacityDebtMacro(position,{
  debtColumn,
  triggerColumn,
  responseColumn,
  excludedColumns=[],
}={}){
  validate(position);
  for(const [name,c] of [
    ['debtColumn',debtColumn],
    ['triggerColumn',triggerColumn],
    ['responseColumn',responseColumn],
  ]){
    if(!Number.isInteger(c)||c<0||c>=position.geometry.columns)
      throw new RangeError(name);
  }

  const before=deriveCpcxSingleOddCapacityDebt(position,{excludedColumns});
  if(!before.exact)return before;
  if(before.debtColumn!==debtColumn)
    return fail('DECLARED_DEBT_COLUMN_MISMATCH',{
      declared:debtColumn,
      actual:before.debtColumn,
    });

  if(responseColumn!==triggerColumn&&responseColumn!==debtColumn)
    return fail('RESPONSE_DOES_NOT_PRESERVE_SINGLE_DEBT_BY_PARITY',{
      debtColumn,
      triggerColumn,
      responseColumn,
    });

  if(position.heights[triggerColumn]>=position.geometry.rows)
    return fail('TRIGGER_COLUMN_FULL',{triggerColumn});

  const triggerCell=
      position.heights[triggerColumn]*position.geometry.columns+triggerColumn,
    afterTrigger=applyCpcxForcedEvent(position,triggerCell);

  if(afterTrigger.terminal)return {
    schema:'connect4.cpcx.single-odd-capacity-debt-macro.v0_1',
    kind:'TRIGGER_TERMINAL',
    exact:true,
    debtColumn,
    triggerColumn,
    responseColumn,
    triggerCell,
    terminal:afterTrigger.terminal,
    firstWinStopping:true,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };

  if(afterTrigger.heights[responseColumn]>=position.geometry.rows)
    return {
      schema:'connect4.cpcx.single-odd-capacity-debt-macro.v0_1',
      kind:'TOP_EXHAUSTION_DEBT_BOUNDARY',
      exact:true,
      debtColumn,
      triggerColumn,
      responseColumn,
      triggerCell,
      exhaustedColumn:responseColumn,
      afterTrigger,
      beforeDebt:before,
      unmatchedResponseCount:1,
      proofRule:'trigger consumed the final response cell in the selected response column; the ordinary two-event parity restoration is unavailable and exactly one response debt remains',
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
      solvedData:false,
      oracle:false,
    };

  const responseCell=
      afterTrigger.heights[responseColumn]*position.geometry.columns+
      responseColumn,
    afterResponse=applyCpcxForcedEvent(afterTrigger,responseCell);

  if(afterResponse.terminal)return {
    schema:'connect4.cpcx.single-odd-capacity-debt-macro.v0_1',
    kind:'RESPONSE_TERMINAL',
    exact:true,
    debtColumn,
    triggerColumn,
    responseColumn,
    triggerCell,
    responseCell,
    terminal:afterResponse.terminal,
    firstWinStopping:true,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };

  const after=deriveCpcxSingleOddCapacityDebt(afterResponse,{excludedColumns});
  if(!after.exact)return fail('SINGLE_DEBT_NOT_RESTORED',{
    debtColumn,
    triggerColumn,
    responseColumn,
    after,
  });

  const predictedDebt=responseColumn===triggerColumn
      ?debtColumn
      :triggerColumn;

  if(after.debtColumn!==predictedDebt)
    return fail('DEBT_TRANSPORT_MISMATCH',{
      debtColumn,
      triggerColumn,
      responseColumn,
      predictedDebt,
      actualDebt:after.debtColumn,
    });

  if(after.totalRemaining!==before.totalRemaining-2)
    return fail('CAPACITY_PROGRESS_MISMATCH',{
      beforeTotal:before.totalRemaining,
      afterTotal:after.totalRemaining,
    });

  return {
    schema:'connect4.cpcx.single-odd-capacity-debt-macro.v0_1',
    kind:'SINGLE_ODD_CAPACITY_DEBT_TRANSPORT',
    exact:true,
    sourceRank:position.rank,
    childRank:afterResponse.rank,
    triggerOwner:position.mover,
    responseOwner:position.mover^1,
    debtColumnBefore:debtColumn,
    debtColumnAfter:after.debtColumn,
    triggerColumn,
    responseColumn,
    triggerCell,
    responseCell,
    mode:responseColumn===triggerColumn?'SELF_STUTTER':'DEBT_SWITCH',
    sourceTotalRemaining:before.totalRemaining,
    childTotalRemaining:after.totalRemaining,
    capacityDelta:-2,
    singleOddClassPreserved:true,
    child:afterResponse,
    before,
    after,
    proofRule:'a trigger toggles one remaining-capacity parity bit; responding in the trigger column toggles it back, while responding in the prior debt column toggles the old debt off and leaves the trigger column as the unique new debt',
    complexity:'O(columnCount)',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function cpcxDebtDistance(column,{
  centerColumn,
}={}){
  if(!Number.isInteger(column)||!Number.isInteger(centerColumn))
    throw new TypeError('columns');
  return Math.abs(column-centerColumn);
}

export function compareCpcxDebtProgress(beforeDebt,afterDebt,{
  centerColumn,
}={}){
  if(!beforeDebt?.exact||!afterDebt?.exact)
    return fail('EXACT_DEBT_STATES_REQUIRED');
  const beforeDistance=cpcxDebtDistance(beforeDebt.debtColumn,{centerColumn}),
    afterDistance=cpcxDebtDistance(afterDebt.debtColumn,{centerColumn}),
    beforeMeasure=[
      Math.max(0,centerColumn-beforeDistance),
      beforeDebt.totalRemaining,
    ],
    afterMeasure=[
      Math.max(0,centerColumn-afterDistance),
      afterDebt.totalRemaining,
    ],
    lexLess=afterMeasure[0]<beforeMeasure[0]||
      (afterMeasure[0]===beforeMeasure[0]&&
       afterMeasure[1]<beforeMeasure[1]);

  return {
    schema:'connect4.cpcx.single-odd-capacity-debt-progress.v0_1',
    kind:'DEBT_PROGRESS',
    exact:true,
    centerColumn,
    beforeDistance,
    afterDistance,
    distanceNondecreasing:afterDistance>=beforeDistance,
    beforeMeasure,
    afterMeasure,
    strictLexicographicDecrease:lexLess,
  };
}

// CPCX global event-phase gauge.
//
// For an empty target x=(column,row):
//
//   eventRank(x)
//     = supportDistance(x) + 1 + sum(other-column remaining capacity)
//     = totalRemainingCapacity - boardRows + row + 1.
//
// Therefore every physical ply globally complements event-rank parity for all
// cells that remain empty, while pairwise/relative parity depends only on row
// parity. This is a phase-identity theorem only; it does not prove residual
// survival, forcing, value, or transition reachability.

import {cpcxCell,cpcxEventMetadata} from './cpcx.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.global-event-phase-gauge.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    gameTreeTraversal:false,
  };
}

function totalRemaining(position){
  const g=position.geometry;
  let n=0;
  for(let c=0;c<g.columns;c++)n+=g.rows-position.heights[c];
  return n;
}

function normalizeCells(position,cells){
  if(!Array.isArray(cells)||!cells.length)
    throw new RangeError('nonempty cells required');
  if(!cells.every(Number.isInteger)||new Set(cells).size!==cells.length)
    throw new RangeError('cells must be unique integers');
  return cells.map(cell=>{
    const meta=cpcxEventMetadata(position,cell);
    if(meta.occupied)return {cell,occupied:true,meta};
    const {row}=cpcxCell(position.geometry,cell);
    return {cell,row,occupied:false,meta};
  });
}

export function deriveCpcxEventPhaseGauge(position,cells){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');

  const rows=normalizeCells(position,cells),
    occupied=rows.filter(x=>x.occupied);
  if(occupied.length)return fail('SELECTED_CELL_OCCUPIED',{
    occupiedCells:occupied.map(x=>x.cell),
  });

  const E=totalRemaining(position),
    H=position.geometry.rows,
    absoluteParity=rows.map(x=>x.meta.eventRank&1),
    origin=absoluteParity[0],
    relativeParity=absoluteParity.map(x=>x^origin),
    rowRelativeParity=rows.map(x=>(x.row^rows[0].row)&1),
    closedFormRanks=rows.map(x=>E-H+x.row+1),
    formulaExact=rows.every((x,i)=>
      x.meta.eventRank===closedFormRanks[i]
    ),
    relativeFormulaExact=relativeParity.every((x,i)=>
      x===rowRelativeParity[i]
    );

  if(!formulaExact||!relativeFormulaExact)
    return fail('EVENT_PHASE_FORMULA_MISMATCH',{
      formulaExact,
      relativeFormulaExact,
    });

  return {
    schema:'connect4.cpcx.global-event-phase-gauge.v0_1',
    kind:'EVENT_PHASE_GAUGE',
    exact:true,
    rank:position.rank,
    totalRemainingCapacity:E,
    boardRows:H,
    cells:[...cells],
    rows:rows.map(x=>x.row),
    supportDistances:rows.map(x=>x.meta.supportDistance),
    eventRanks:rows.map(x=>x.meta.eventRank),
    absoluteParity,
    globalPhase:origin,
    relativeParity,
    rowRelativeParity,
    formula:'eventRank = totalRemainingCapacity - boardRows + row + 1',
    proofRule:'the target-column height cancels algebraically; relative event parity is row parity relative to one fixed gauge origin',
    complexity:'O(selectedCellCount)',
    recursive:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function compareCpcxEventPhaseGauge(before,after,cells){
  if(before?.geometry!==after?.geometry){
    const a=before?.geometry,b=after?.geometry;
    if(!a||!b||
       a.columns!==b.columns||
       a.rows!==b.rows||
       a.connect!==b.connect)
      return fail('GEOMETRY_MISMATCH');
  }

  const a=deriveCpcxEventPhaseGauge(before,cells);
  if(!a.exact)return {...a,side:'BEFORE'};
  const b=deriveCpcxEventPhaseGauge(after,cells);
  if(!b.exact)return {...b,side:'AFTER'};

  const delta=after.rank-before.rank;
  if(!Number.isInteger(delta))return fail('RANK_DELTA_INVALID');
  const flip=((delta%2)+2)%2,
    absoluteTransport=a.absoluteParity.every((p,i)=>
      b.absoluteParity[i]===(p^flip)
    ),
    relativeInvariant=a.relativeParity.every((p,i)=>
      b.relativeParity[i]===p
    );

  if(!absoluteTransport||!relativeInvariant)
    return fail('PHASE_TRANSPORT_MISMATCH',{
      rankDelta:delta,
      expectedGlobalFlip:flip,
      before:a,
      after:b,
    });

  return {
    schema:'connect4.cpcx.global-event-phase-transport.v0_1',
    kind:'EVENT_PHASE_GAUGE_TRANSPORT',
    exact:true,
    rankDelta:delta,
    globalFlip:flip,
    absoluteParityBefore:[...a.absoluteParity],
    absoluteParityAfter:[...b.absoluteParity],
    relativeParity:[...a.relativeParity],
    supportDistancesBefore:[...a.supportDistances],
    supportDistancesAfter:[...b.supportDistances],
    relativePhaseInvariant:true,
    transitionReachabilityCertified:false,
    boundary:'phase comparison is exact for the supplied exact positions; any claim that after is a successor of before requires a separate certified transition',
    complexity:'O(selectedCellCount)',
    recursive:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

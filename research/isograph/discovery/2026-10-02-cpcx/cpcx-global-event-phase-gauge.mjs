// CPCX global event-phase gauge.
//
// For any untouched empty cells on one finite-gravity geometry,
// relative event-rank parity depends only on row parity. Absolute parity
// changes only by the parity of the physical rank delta.

import {cpcxCell} from './cpcx.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.global-event-phase-gauge.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

function eventParity(position,cell){
  const g=position.geometry,{row}=cpcxCell(g,cell);
  if(position.owner[cell]!==-1)return null;
  const remaining=g.cellCount-position.rank;
  return (remaining-g.rows+row+1)&1;
}

function relativeSignature(position,cells){
  const p=cells.map(cell=>eventParity(position,cell));
  if(p.some(x=>x===null))return null;
  return p.map(x=>x^p[0]);
}

export function certifyCpcxGlobalEventPhaseGauge(source,target,{cells}={}){
  if(!source?.geometry||!target?.geometry)throw new TypeError('positions');
  if(!Array.isArray(cells)||!cells.length)throw new TypeError('cells');
  if(
    source.geometry.columns!==target.geometry.columns||
    source.geometry.rows!==target.geometry.rows||
    source.geometry.connect!==target.geometry.connect
  )return fail('GEOMETRY_MISMATCH');

  const unique=[...new Set(cells)];
  if(unique.length!==cells.length)return fail('DUPLICATE_CELL');

  for(const cell of cells){
    if(!Number.isInteger(cell)||cell<0||cell>=source.geometry.cellCount)
      return fail('INVALID_CELL',{cell});
    if(source.owner[cell]!==-1||target.owner[cell]!==-1)
      return fail('SELECTED_CELL_OCCUPIED',{cell});
  }

  const sourceParity=cells.map(cell=>eventParity(source,cell)),
    targetParity=cells.map(cell=>eventParity(target,cell)),
    sourceRelative=relativeSignature(source,cells),
    targetRelative=relativeSignature(target,cells),
    rankDelta=target.rank-source.rank,
    phaseFlip=Math.abs(rankDelta)&1,
    transported=sourceParity.map(x=>x^phaseFlip);

  if(JSON.stringify(sourceRelative)!==JSON.stringify(targetRelative))
    return fail('RELATIVE_PHASE_CHANGED',{
      sourceRelative,targetRelative,
    });
  if(JSON.stringify(transported)!==JSON.stringify(targetParity))
    return fail('GLOBAL_PHASE_TRANSPORT_MISMATCH',{
      sourceParity,targetParity,transported,rankDelta,
    });

  return {
    schema:'connect4.cpcx.global-event-phase-gauge.v0_1',
    kind:'GLOBAL_EVENT_PHASE_GAUGE',
    exact:true,
    cells:[...cells],
    sourceRank:source.rank,
    targetRank:target.rank,
    rankDelta,
    phaseFlip,
    sourceParity,
    targetParity,
    relativePhase:sourceRelative,
    proofRule:'eventRank parity equals totalRemainingCapacity - boardRows + row + 1 mod 2; relative parity cancels the global board phase and odd physical rank delta complements all selected cells',
    complexity:'O(k)',
    recursive:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

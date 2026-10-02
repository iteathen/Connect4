// CPCX macro uncertainty / support-lift analysis.
//
// For an exact collapsed macro, residuals in guaranteedResiduals were selected
// because no cell the defender may own in any realization belongs to their
// missing set. Therefore the optional external defender event has zero direct
// kill capacity against those residuals.
//
// Its only direct effect on their missing cells is support lift: if the optional
// event is the current frontier cell below a missing target in the same column,
// that target's support distance decreases by one. This cannot make the target
// less accessible. Counter-threat creation remains a separate first-win/
// normalization question and is deliberately not folded into this theorem.

import {cpcxCell} from './cpcx.mjs';

export function analyzeCpcxMacroUncertainty(position,collapse){
  if(!collapse?.exact||collapse.kind!=='VERTICAL_TWO_STAGE_COLLAPSED')
    throw new TypeError('exact collapsed two-stage macro required');

  const g=position.geometry,
    candidates=collapse.externalDefenderUncertainty?.candidateCells??[],
    candidateSet=new Set(candidates),
    rows=[];

  let directKillEdges=0,supportLiftEdges=0;
  for(const residual of collapse.guaranteedResiduals){
    const direct=[],lifts=[];
    for(const cell of residual.missingCells){
      if(candidateSet.has(cell)){
        direct.push(cell);directKillEdges+=1;
      }
      const target=cpcxCell(g,cell);
      for(const tokenCell of candidates){
        const token=cpcxCell(g,tokenCell);
        if(token.column===target.column&&token.row<target.row){
          lifts.push({
            tokenCell,
            targetCell:cell,
            column:target.column,
            tokenRow:token.row,
            targetRow:target.row,
            maxSupportDelta:-1,
          });
          supportLiftEdges+=1;
        }
      }
    }
    rows.push({
      obligationId:residual.id,
      lineLabel:residual.lineLabel,
      missingCount:residual.missingCount,
      missingCells:[...residual.missingCells],
      directKillCandidates:direct,
      supportLiftCandidates:lifts,
    });
  }

  return {
    schema:'connect4.cpcx.macro-uncertainty.v0_1',
    exact:true,
    externalPlacementOptional:collapse.externalDefenderUncertainty!==null,
    candidateCells:[...candidates],
    directKillEdges,
    supportLiftEdges,
    directBlockCapacity:directKillEdges===0?0:null,
    residuals:rows,
    theorem:directKillEdges===0
      ?'optional external defender placement cannot directly kill any guaranteed residual; it can only leave support unchanged or lift a missing target by one frontier event'
      :'guaranteed residual contract violated: external candidate intersects missing set',
    firstWinCounterThreatsExcluded:true,
    boundary:'new defender obligations created by the optional event are handled by exact forced-singleton normalization and later CPCX progress, not by this support theorem',
  };
}

export function buildCpcxSupportLiftGraph(position,collapse){
  const a=analyzeCpcxMacroUncertainty(position,collapse),
    targets=[],edges=[];
  for(const residual of a.residuals){
    for(const cell of residual.missingCells){
      const id=`target:${cell}`;
      if(!targets.includes(id))targets.push(id);
    }
    for(const e of residual.supportLiftCandidates)
      edges.push({
        token:`token:${e.tokenCell}`,
        target:`target:${e.targetCell}`,
        delta:e.maxSupportDelta,
      });
  }
  return {
    exact:true,
    tokens:a.candidateCells.map(cell=>`token:${cell}`),
    targets,
    edges,
    maxActiveTokens:a.externalPlacementOptional?1:0,
    semantics:'an active token may only decrease support distance on incident targets; no edge kills a guaranteed residual',
  };
}

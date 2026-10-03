// CPCX common RLC guard set over an exact paired equivalence class.
//
// This is a current-rank operator only. It computes the intersection of the
// original (A,B) Pareto frontiers in two same-support/same-mover states, using
// exact saturated-column cofactors. It does not assert that the intersection is
// universally nonempty.

import {
  deriveCpcxSaturatedColumnRlcProfile,
} from './cpcx-saturated-column-cofactor.mjs';
import {
  createCpcxResidualDefectPair,
} from './cpcx-residual-defect-transport.mjs';

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.common-rlc-guard.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function dominates(a,b){
  return a.A>=b.A&&a.B>=b.B&&(a.A>b.A||a.B>b.B);
}

function pareto(candidates){
  return candidates.filter(x=>
    !candidates.some(y=>y!==x&&dominates(y,x))
  );
}

export function deriveCpcxCommonRlcGuard(left,right,{
  saturatedColumn,
}={}){
  if(!Number.isInteger(saturatedColumn))
    throw new TypeError('saturatedColumn');

  const pair=createCpcxResidualDefectPair(left,right,{
    saturatedColumn,
  });
  if(!pair.exact)return fail('PAIR_NOT_ADMISSIBLE',{pair});

  const lp=deriveCpcxSaturatedColumnRlcProfile(left,{
      column:saturatedColumn,
    }),
    rp=deriveCpcxSaturatedColumnRlcProfile(right,{
      column:saturatedColumn,
    });
  if(!lp.exact)return fail('LEFT_RLC_PROFILE_FAILED',{profile:lp});
  if(!rp.exact)return fail('RIGHT_RLC_PROFILE_FAILED',{profile:rp});

  const leftPareto=pareto(lp.candidates),
    rightPareto=pareto(rp.candidates),
    rightByColumn=new Map(rightPareto.map(x=>[x.column,x])),
    guard=leftPareto.filter(x=>rightByColumn.has(x.column))
      .map(x=>{
        const y=rightByColumn.get(x.column);
        return {
          column:x.column,
          landing:x.landing,
          H:x.H,
          left:{A:x.A,B:x.B},
          right:{A:y.A,B:y.B},
        };
      })
      .sort((a,b)=>a.column-b.column);

  if(!guard.length)return fail('EMPTY_COMMON_RLC_GUARD',{
    pair:{
      defectSize:pair.defectSize,
      leftDefectCount:pair.leftDefectCount,
      rightDefectCount:pair.rightDefectCount,
    },
    leftPareto,
    rightPareto,
  });

  return {
    schema:'connect4.cpcx.common-rlc-guard.v0_1',
    kind:'COMMON_RLC_GUARD',
    exact:true,
    saturatedColumn,
    mover:left.mover,
    support:Array.from(left.heights),
    pairDefectSize:pair.defectSize,
    leftPareto,
    rightPareto,
    guard,
    guardColumns:guard.map(x=>x.column),
    guardSize:guard.length,
    proofRule:'each guard column is simultaneously Pareto-maximal under the original rank-local (A,B) incidence order in both exact saturated-column cofactor representatives',
    complexity:'O(legalColumns * projectedResidualCount + liveLineCount*K)',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

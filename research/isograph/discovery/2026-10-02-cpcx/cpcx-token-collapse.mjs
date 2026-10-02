// CPCX bounded blocker-token composition after wing debt repair.
//
// This operator quantifies a finite Cartesian product of:
//   prior wing-deviation token x one free defender frontier token.
// It does not recursively traverse a move tree.
//
// Each realization is normalized only through exact forced singleton closure,
// then one exact normalized vertical two-stage macro is selected structurally.
// The resulting realization carriers are immediately collapsed by exact
// residual intersection, common next mover, common rank parity and bounded
// blocker-token union.
//
// Complexity is polynomial in the two frontier-set sizes and live residual count.

import {scanCpcxObligations} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {composeCpcxForcingMacro} from './cpcx-successor.mjs';

function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%position.geometry.columns;
  return out;
}

function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return {exact:false,verification:v};
  return {
    exact:true,
    position:{
      geometry:position.geometry,
      moves:appendMoves(position,events),
      rank:position.rank+events.length,
      mover:(position.mover+events.length)&1,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal:null,
    },
  };
}

function frontier(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function verticalMacro(position,attacker){
  const rows=[];
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player:attacker})){
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    if(!certificate.exact)continue;
    if(certificate.kind==='ATTACKER_TERMINAL_ON_LOWER')return {
      terminal:true,demand,certificate,
    };
    if(certificate.kind!=='FORCED_UPPER_RESPONSE'&&certificate.kind!=='PREEMPT_OR_FORCED_UPPER')
      continue;
    rows.push({demand,certificate});
  }
  rows.sort((a,b)=>
    a.demand.lowerCell-b.demand.lowerCell||
    a.demand.upperCell-b.demand.upperCell||
    a.demand.obligation.lineId-b.demand.obligation.lineId
  );
  if(!rows.length)return null;
  const x=rows[0];
  return {
    terminal:false,
    ...x,
    progress:{
      kind:'CERTIFIED_FORCING_MACRO',
      exact:true,
      player:attacker,
      macro:{
        kind:'VERTICAL_TWO_STAGE',
        primaryCell:x.demand.lowerCell,
        secondaryCell:x.demand.upperCell,
        lineId:x.demand.obligation.lineId,
        demand:x.demand,
        certificate:x.certificate,
      },
    },
  };
}

function residualKey(r){
  return `${r.player}|${r.lineId}|${[...r.missingCells].sort((a,b)=>a-b).join(',')}`;
}

function intersectResiduals(carriers){
  if(!carriers.length)return [];
  const maps=carriers.map(c=>new Map(c.guaranteedResiduals.map(r=>[residualKey(r),r]))),
    out=[];
  for(const [key,first] of maps[0]){
    const rows=[first];
    let all=1;
    for(let i=1;i<maps.length;i++){
      const r=maps[i].get(key);
      if(!r){all=0;break;}
      rows.push(r);
    }
    if(!all)continue;
    const events=first.missingCells.map(cell=>{
      const samples=[];
      for(const r of rows){
        const e=r.events?.find(x=>x.cell===cell);
        if(e)samples.push(e);
      }
      return {
        cell,
        minSupportDistance:samples.length
          ?Math.min(...samples.map(e=>e.minSupportDistance))
          :null,
        maxSupportDistance:samples.length
          ?Math.max(...samples.map(e=>e.maxSupportDistance))
          :null,
        eventRankParity:samples.length
          ?samples[0].eventRankParity
          :null,
        eventRankParityConsistent:samples.every(e=>
          e.eventRankParity===samples[0].eventRankParity
        ),
      };
    });
    out.push({
      id:first.id,
      player:first.player,
      lineId:first.lineId,
      lineLabel:first.lineLabel,
      orientation:first.orientation,
      missingCount:first.missingCount,
      missingCells:[...first.missingCells],
      events,
      guarantee:'IDENTICAL_RESIDUAL_IN_EVERY_NONTERMINAL_TOKEN_REALIZATION',
    });
  }
  return out;
}

function mergeBlockerTokens(carriers){
  const cells=new Set(),owners=new Set();
  let maxCount=0,directKillCapacity=0;
  for(const c of carriers)for(const t of c.blockerTokens??[]){
    owners.add(t.owner);
    maxCount=Math.max(maxCount,t.maxCount??0);
    directKillCapacity=Math.max(directKillCapacity,t.directKillCapacity??0);
    for(const cell of t.candidateCells??[])cells.add(cell);
  }
  if(!cells.size&&!maxCount)return [];
  return [{
    owner:owners.size===1?[...owners][0]:null,
    maxCount,
    candidateCells:[...cells].sort((a,b)=>a-b),
    directKillCapacity,
    supportOnly:directKillCapacity===0,
    provenance:'collapsed normalized vertical macro uncertainty across token-product classes',
  }];
}

export function collapseCpcxDebtRepairTokenProduct(position,contract,repair){
  if(contract?.kind!=='THREE_TRIGGER_WING_ATTACK'||!repair?.exact)
    throw new TypeError('exact wing repair required');
  if(!repair.firstWinGuardPassed||!repair.postRepairFirstWinGuardPassed||!repair.repairLegalAtDecision)
    return {kind:'NO_CERTIFICATE',exact:false,seam:'WING_REPAIR_GUARD_FAILURE'};

  const attacker=repair.attacker,defender=repair.defender,
    classes=[],continuing=[],
    basePrefix=repair.prefix;

  for(const deviationCell of repair.deviationFrontier){
    const postRepair=materialize(position,[
      ...basePrefix,
      {cell:deviationCell,owner:defender},
      {cell:repair.requiredResponseCell,owner:attacker},
    ]);
    if(!postRepair.exact)return {
      kind:'NO_CERTIFICATE',exact:false,seam:'DEBT_REPAIR_REALIZATION_INVALID',
      deviationCell,verification:postRepair.verification,
    };
    if(postRepair.position.mover!==defender)return {
      kind:'NO_CERTIFICATE',exact:false,seam:'DEBT_REPAIR_MOVER_MISMATCH',
    };

    for(const freeCell of frontier(postRepair.position)){
      const afterFree=applyCpcxForcedEvent(postRepair.position,freeCell);
      if(afterFree.terminal)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'DEFENDER_FREE_TOKEN_TERMINAL',
        deviationCell,
        freeCell,
        terminal:afterFree.terminal,
      };

      const normalized=closeCpcxForcedResponses(afterFree);
      if(normalized.kind==='CERTIFIED_FIRST_WIN'){
        if(normalized.player===attacker){
          classes.push({
            deviationCell,freeCell,
            kind:'ATTACKER_FIRST_WIN_DURING_NORMALIZATION',
            forcedSteps:normalized.steps.length,
          });
          continue;
        }
        return {
          kind:'NO_CERTIFICATE',
          exact:false,
          seam:'DEFENDER_FIRST_WIN_DURING_NORMALIZATION',
          deviationCell,
          freeCell,
          player:normalized.player,
        };
      }
      if(normalized.kind!=='OPEN')return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'UNSUPPORTED_NORMALIZATION_BOUNDARY',
        deviationCell,
        freeCell,
        boundary:normalized.boundary,
      };

      const macro=verticalMacro(normalized.position,attacker);
      if(!macro)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'NORMALIZED_VERTICAL_TWO_STAGE_NOT_FOUND',
        deviationCell,
        freeCell,
        normalizedRank:normalized.position.rank,
        normalizedMover:normalized.position.mover,
      };
      if(macro.terminal){
        classes.push({
          deviationCell,freeCell,
          kind:'ATTACKER_FIRST_WIN_ON_VERTICAL_LOWER',
          forcedSteps:normalized.steps.length,
        });
        continue;
      }

      const carrier=composeCpcxForcingMacro(normalized.position,macro.progress);
      if(!carrier.exact)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'VERTICAL_MACRO_COMPOSITION_FAILED',
        deviationCell,
        freeCell,
        carrier,
      };
      if(carrier.nextMover!==attacker)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'VERTICAL_MACRO_NEXT_MOVER_MISMATCH',
        deviationCell,
        freeCell,
        nextMover:carrier.nextMover,
      };

      classes.push({
        deviationCell,
        freeCell,
        kind:'VERTICAL_MACRO_CONTINUES',
        forcedSteps:normalized.steps.length,
        verticalKind:macro.certificate.kind,
        rankOptions:[...carrier.rank.options],
      });
      continuing.push(carrier);
    }
  }

  if(!continuing.length)return {
    schema:'connect4.cpcx.token-product-collapse.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    classes,
    recursive:false,
    choiceEnumeration:false,
  };

  const rankOptions=[...new Set(continuing.flatMap(c=>c.rank.options))].sort((a,b)=>a-b),
    parity=rankOptions[0]&1;
  if(!rankOptions.every(x=>(x&1)===parity))return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'TOKEN_PRODUCT_RANK_PARITY_SPLIT',
    rankOptions,
  };
  if(!continuing.every(c=>c.nextMover===attacker))return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'TOKEN_PRODUCT_MOVER_SPLIT',
  };

  const guaranteedResiduals=intersectResiduals(continuing),
    blockerTokens=mergeBlockerTokens(continuing);

  // Verify the merged blocker token still cannot directly kill the retained
  // residual intersection.
  const blockerCells=new Set(blockerTokens.flatMap(t=>t.candidateCells));
  for(const r of guaranteedResiduals)if(r.missingCells.some(x=>blockerCells.has(x)))
    return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'MERGED_BLOCKER_INTERSECTS_GUARANTEED_RESIDUAL',
      residual:r,
    };

  return {
    schema:'connect4.cpcx.token-product-collapse.v0_1',
    kind:'ABSTRACT_SUCCESSOR',
    exact:true,
    attacker,
    nextMover:attacker,
    rank:{
      options:rankOptions,
      parity,
      allSameParity:true,
    },
    controlParityEquivalent:true,
    guaranteedResiduals,
    blockerTokens,
    firstWinFacts:{
      repairFirstWinGuardPassed:true,
      postRepairFirstWinGuardPassed:true,
      deterministicNormalizationApplied:true,
      normalizedVerticalMacroApplied:true,
      nextImmediateNormalizationClosed:false,
    },
    classes,
    responseClassProductSize:classes.length,
    polynomialBound:'O(|deviationFrontier| * |freeFrontier| * liveResidualCount * boundedMacroCost)',
    choiceEnumeration:false,
    recursive:false,
    source:{
      kind:'WING_DEBT_FREE_TOKEN_NORMALIZE_VERTICAL',
      decisionIndex:repair.decisionIndex,
    },
  };
}

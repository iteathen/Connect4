// CPCX debt-token composition through normalized vertical two-stage closure.
//
// One wing-deviation cell is an unknown defender token selected from the
// quantified deviation frontier.  For each member of that flat set CPCX:
//   1. materializes the already-certified debt repair;
//   2. applies only deterministic singleton normalization;
//   3. consumes one exact normalized vertical two-stage theorem.
//
// The vertical theorem itself universally collapses defender preemption versus
// every nonpreempt frontier response, so this operator MUST NOT insert another
// free defender move before it.
//
// Realization carriers are immediately intersected into one abstract successor.
// No recursive response tree is retained.

import {cpcxCell} from './cpcx.mjs';
import {closeCpcxForcedResponses} from './cpcx-closure.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  partitionCpcxVerticalTwoStageGuard,
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

function selectVerticalMacro(position,attacker){
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
    let all=true;
    for(let i=1;i<maps.length;i++){
      const r=maps[i].get(key);
      if(!r){all=false;break;}
      rows.push(r);
    }
    if(!all)continue;
    const events=first.missingCells.map(cell=>{
      const samples=rows.flatMap(r=>{
        const e=r.events?.find(x=>x.cell===cell);
        return e?[e]:[];
      });
      return {
        cell,
        minSupportDistance:samples.length?Math.min(...samples.map(e=>e.minSupportDistance)):null,
        maxSupportDistance:samples.length?Math.max(...samples.map(e=>e.maxSupportDistance)):null,
        eventRankParity:samples.length?samples[0].eventRankParity:null,
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
      guarantee:'IDENTICAL_RESIDUAL_IN_EVERY_NONTERMINAL_DEVIATION_CLASS',
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
    provenance:'vertical preempt-vs-nonpreempt uncertainty merged across wing-deviation token classes',
  }];
}


function collapseCarrierSet(carriers,attacker,source){
  if(!carriers.length)return {
    schema:'connect4.cpcx.token-product-collapse.v0_3',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    classes:source.classes??[],
    recursive:false,
    choiceEnumeration:false,
  };

  const rankOptions=[...new Set(carriers.flatMap(c=>c.rank.options))].sort((a,b)=>a-b),
    parity=rankOptions[0]&1;
  if(!rankOptions.every(x=>(x&1)===parity))return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'RESPONSE_CLASS_RANK_PARITY_SPLIT',
    rankOptions,
  };
  if(!carriers.every(c=>c.nextMover===attacker))return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'RESPONSE_CLASS_MOVER_SPLIT',
  };

  const guaranteedResiduals=intersectResiduals(carriers),
    blockerTokens=mergeBlockerTokens(carriers),
    blockerCells=new Set(blockerTokens.flatMap(t=>t.candidateCells));
  for(const r of guaranteedResiduals)if(r.missingCells.some(x=>blockerCells.has(x)))
    return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'MERGED_BLOCKER_INTERSECTS_GUARANTEED_RESIDUAL',
      residual:r,
    };

  return {
    schema:'connect4.cpcx.token-product-collapse.v0_3',
    kind:'ABSTRACT_SUCCESSOR',
    exact:true,
    attacker,
    nextMover:attacker,
    rank:{options:rankOptions,parity,allSameParity:true},
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
    classes:source.classes??[],
    choiceEnumeration:false,
    recursive:false,
    source:{
      kind:source.kind,
      decisionIndex:source.decisionIndex,
    },
  };
}

function composeVerticalWithGuardPartition(position,attacker){
  const demands=findCpcxVerticalTwoStageObligations(position,{player:attacker})
    .sort((a,b)=>
      a.lowerCell-b.lowerCell||
      a.upperCell-b.upperCell||
      a.obligation.lineId-b.obligation.lineId
    );

  for(const demand of demands){
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    if(certificate.exact){
      if(certificate.kind==='ATTACKER_TERMINAL_ON_LOWER')return {
        kind:'CERTIFIED_FIRST_WIN',
        exact:true,
        player:attacker,
        classes:[{kind:'ATTACKER_FIRST_WIN_ON_VERTICAL_LOWER'}],
      };
      if(certificate.kind!=='FORCED_UPPER_RESPONSE'&&certificate.kind!=='PREEMPT_OR_FORCED_UPPER')
        continue;
      const carrier=composeCpcxForcingMacro(position,{
        kind:'CERTIFIED_FORCING_MACRO',
        exact:true,
        player:attacker,
        macro:{
          kind:'VERTICAL_TWO_STAGE',
          primaryCell:demand.lowerCell,
          secondaryCell:demand.upperCell,
          lineId:demand.obligation.lineId,
          demand,
          certificate,
        },
      });
      return {
        kind:carrier.kind,
        exact:carrier.exact,
        carrier,
        classes:[{
          kind:'DIRECT_VERTICAL_CLASS',
          verticalKind:certificate.kind,
          rankOptions:carrier.rank?.options??[],
        }],
      };
    }

    if(certificate.kind!=='POST_LOWER_FIRST_WIN_GUARD_FAILURE')continue;
    const partition=partitionCpcxVerticalTwoStageGuard(position,demand,certificate),
      carriers=[],classes=[];

    const safeCertificate={
      kind:'PREEMPT_OR_FORCED_UPPER',
      exact:true,
      moverRole:'DEFENDER',
      lowerCell:demand.lowerCell,
      upperCell:demand.upperCell,
      preemptCell:demand.lowerCell,
      nonpreemptFrontier:[...partition.safeNonpreemptFrontier],
      responseCell:demand.upperCell,
      rule:'partition-restricted exact vertical class',
      choiceEnumeration:false,
    };
    const safeCarrier=composeCpcxForcingMacro(position,{
      kind:'CERTIFIED_FORCING_MACRO',
      exact:true,
      player:attacker,
      macro:{
        kind:'VERTICAL_TWO_STAGE',
        primaryCell:demand.lowerCell,
        secondaryCell:demand.upperCell,
        lineId:demand.obligation.lineId,
        demand,
        certificate:safeCertificate,
      },
    });
    if(!safeCarrier.exact)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'SAFE_VERTICAL_PARTITION_COMPOSITION_FAILED',
    };
    carriers.push(safeCarrier);
    classes.push({
      kind:'PREEMPT_OR_SAFE_DELAYED',
      safeNonpreemptFrontier:[...partition.safeNonpreemptFrontier],
      rankOptions:[...safeCarrier.rank.options],
    });

    for(const guarded of partition.guardNormalizationClasses){
      if(guarded.targetCells.length!==1)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'GUARD_NORMALIZATION_MULTI_TARGET',
        defenderMove:guarded.defenderMove,
        targetCells:guarded.targetCells,
      };
      const afterRisk=applyCpcxForcedEvent(position,guarded.defenderMove);
      if(afterRisk.terminal)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'GUARD_NORMALIZATION_DEFENDER_TERMINAL',
        defenderMove:guarded.defenderMove,
        terminal:afterRisk.terminal,
      };
      const normalized=closeCpcxForcedResponses(afterRisk);
      if(normalized.kind==='CERTIFIED_FIRST_WIN'){
        if(normalized.player===attacker){
          classes.push({
            kind:'ATTACKER_FIRST_WIN_DURING_GUARD_NORMALIZATION',
            defenderMove:guarded.defenderMove,
            forcedSteps:normalized.steps.length,
          });
          continue;
        }
        return {
          kind:'NO_CERTIFICATE',
          exact:false,
          seam:'DEFENDER_FIRST_WIN_DURING_GUARD_NORMALIZATION',
          defenderMove:guarded.defenderMove,
          player:normalized.player,
        };
      }
      if(normalized.kind!=='OPEN')return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'GUARD_NORMALIZATION_BOUNDARY_UNSUPPORTED',
        defenderMove:guarded.defenderMove,
      };

      const reentry=selectVerticalMacro(normalized.position,attacker);
      if(!reentry)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'VERTICAL_GUARD_REENTRY_NOT_FOUND',
        defenderMove:guarded.defenderMove,
      };
      if(reentry.terminal){
        classes.push({
          kind:'ATTACKER_FIRST_WIN_AFTER_GUARD_NORMALIZATION',
          defenderMove:guarded.defenderMove,
          forcedSteps:normalized.steps.length,
        });
        continue;
      }

      const reentryCarrier=composeCpcxForcingMacro(normalized.position,reentry.progress);
      if(!reentryCarrier.exact)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'VERTICAL_GUARD_REENTRY_COMPOSITION_FAILED',
        defenderMove:guarded.defenderMove,
      };
      carriers.push(reentryCarrier);
      classes.push({
        kind:'GUARD_NORMALIZE_THEN_VERTICAL',
        defenderMove:guarded.defenderMove,
        targetCell:guarded.targetCells[0],
        forcedSteps:normalized.steps.length,
        verticalKind:reentry.certificate.kind,
        rankOptions:[...reentryCarrier.rank.options],
      });
    }

    const merged=collapseCarrierSet(carriers,attacker,{
      kind:'PARTITIONED_VERTICAL_GUARD_COLLAPSE',
      classes,
    });
    return {
      kind:merged.kind,
      exact:merged.exact,
      carrier:merged.kind==='ABSTRACT_SUCCESSOR'?merged:null,
      certificate:merged.kind==='CERTIFIED_FIRST_WIN'?merged:null,
      seam:merged.seam??null,
      classes,
      partition,
    };
  }
  return null;
}

export function collapseCpcxDebtRepairTokenProduct(position,contract,repair){
  if(contract?.kind!=='THREE_TRIGGER_WING_ATTACK'||!repair?.exact)
    throw new TypeError('exact wing repair required');
  if(!repair.firstWinGuardPassed||!repair.postRepairFirstWinGuardPassed||!repair.repairLegalAtDecision)
    return {kind:'NO_CERTIFICATE',exact:false,seam:'WING_REPAIR_GUARD_FAILURE'};

  const attacker=repair.attacker,defender=repair.defender,
    classes=[],continuing=[];

  for(const deviationCell of repair.deviationFrontier){
    const postRepair=materialize(position,[
      ...repair.prefix,
      {cell:deviationCell,owner:defender},
      {cell:repair.requiredResponseCell,owner:attacker},
    ]);
    if(!postRepair.exact)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'DEBT_REPAIR_REALIZATION_INVALID',
      deviationCell,
      verification:postRepair.verification,
    };

    const normalized=closeCpcxForcedResponses(postRepair.position);
    if(normalized.kind==='CERTIFIED_FIRST_WIN'){
      if(normalized.player===attacker){
        classes.push({
          deviationCell,
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
        player:normalized.player,
      };
    }
    if(normalized.kind!=='OPEN')return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'UNSUPPORTED_NORMALIZATION_BOUNDARY',
      deviationCell,
      boundary:normalized.boundary,
    };

    const composed=composeVerticalWithGuardPartition(normalized.position,attacker);
    if(!composed)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'NORMALIZED_VERTICAL_TWO_STAGE_NOT_FOUND',
      deviationCell,
      normalizedRank:normalized.position.rank,
      normalizedMover:normalized.position.mover,
    };
    if(!composed.exact)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:composed.seam??'VERTICAL_PARTITION_COMPOSITION_FAILED',
      deviationCell,
      detail:composed,
    };
    if(composed.kind==='CERTIFIED_FIRST_WIN'){
      classes.push({
        deviationCell,
        kind:'ATTACKER_FIRST_WIN_IN_VERTICAL_PARTITION',
        forcedSteps:normalized.steps.length,
      });
      continue;
    }
    const carrier=composed.carrier??composed;
    if(carrier.nextMover!==attacker)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'VERTICAL_MACRO_NEXT_MOVER_MISMATCH',
      deviationCell,
      nextMover:carrier.nextMover,
    };

    classes.push({
      deviationCell,
      kind:'VERTICAL_MACRO_CONTINUES',
      forcedSteps:normalized.steps.length,
      verticalClasses:composed.classes,
      rankOptions:[...carrier.rank.options],
    });
    continuing.push(carrier);
  }

  const merged=collapseCarrierSet(continuing,attacker,{
    kind:'WING_DEBT_NORMALIZE_VERTICAL',
    decisionIndex:repair.decisionIndex,
    classes,
  });
  if(merged.kind==='ABSTRACT_SUCCESSOR'){
    merged.responseClassProductSize=classes.length;
    merged.polynomialBound='O(|deviationFrontier| * (liveResidualCount + boundedGuardPartitionCost))';
  }
  return merged;
}

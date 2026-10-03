// CPCX blocker-token / normalization-class composition after wing debt repair.
//
// The prior wing deviation is a flat quantified frontier set.  For each member,
// CPCX asks the exact vertical two-stage theorem for its defender-response class.
//
// If the theorem is exact, its whole preempt/nonpreempt set is collapsed at once.
// If the theorem identifies a finite first-win hazard set, CPCX splits only on
// those theorem-derived hazard moves:
//   - safe response set = every defender move not in the hazard set;
//   - normalization hazards = exact moves that create a forced singleton.
//
// Hazard moves are followed only through deterministic forced normalization.
// CPCX never forms deviation-frontier x arbitrary-reply-frontier products.
//
// Complexity is polynomial in the deviation set, live residual count and the
// number of theorem-derived normalization hazards.

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

function verticalRows(position,attacker){
  const rows=[];
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player:attacker})){
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    rows.push({demand,certificate});
  }
  rows.sort((a,b)=>
    a.demand.lowerCell-b.demand.lowerCell||
    a.demand.upperCell-b.demand.upperCell||
    a.demand.obligation.lineId-b.demand.obligation.lineId
  );
  return rows;
}

function progressFor(demand,certificate,attacker){
  return {
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
    const profilesExact=rows.every(r=>
      r.supportProfilesExact===true&&Array.isArray(r.supportProfiles)
    );
    const supportProfiles=profilesExact
      ?[...new Map(rows.flatMap(r=>r.supportProfiles).map(p=>[
        p.join(','),[...p],
      ])).values()].sort((a,b)=>{
        const n=Math.min(a.length,b.length);
        for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
        return a.length-b.length;
      })
      :[];

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
        eventRankParity:samples.length?samples[0].eventRankParity:null,
        eventRankParityConsistent:samples.length>0&&samples.every(e=>
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
      supportProfiles,
      supportProfilesExact:profilesExact,
      guarantee:'IDENTICAL_RESIDUAL_IN_EVERY_NONTERMINAL_RESPONSE_CLASS',
    });
  }
  return out;
}

function mergeSupportPhase(carriers){
  const keys=new Map();
  for(const carrier of carriers){
    const phase=carrier.supportPhase;
    if(phase?.exact!==true||!Array.isArray(phase.vectors)||!phase.vectors.length)
      return {
        exact:false,
        vectors:[],
        source:'at least one component carrier lacks exact support phase',
      };
    for(const vector of phase.vectors)
      keys.set(vector.join(''),[...vector]);
  }
  return {
    exact:true,
    vectors:[...keys.values()].sort((a,b)=>
      a.join('').localeCompare(b.join(''))
    ),
    source:'union of exact component support-phase vectors',
  };
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
    provenance:'collapsed vertical-macro uncertainty over safe/hazard response classes',
  }];
}

function composeVertical(position,demand,certificate,attacker){
  if(certificate.kind==='ATTACKER_TERMINAL_ON_LOWER'||
     certificate.kind==='PREEXISTING_CURRENT_TERMINAL')
    return {kind:'CERTIFIED_FIRST_WIN',exact:true,player:attacker};

  if(!certificate.exact)return null;
  if(certificate.kind!=='FORCED_UPPER_RESPONSE'&&
     certificate.kind!=='PREEMPT_OR_FORCED_UPPER')return null;

  return composeCpcxForcingMacro(
    position,
    progressFor(demand,certificate,attacker)
  );
}

function restrictedVerticalCertificate(failure){
  if(failure.kind!=='POST_LOWER_FIRST_WIN_GUARD_FAILURE')return null;
  const hazards=[...new Set(failure.risks.map(x=>x.defenderMove))].sort((a,b)=>a-b),
    safe=failure.nonpreemptFrontier.filter(x=>!hazards.includes(x));
  return {
    hazards,
    certificate:{
      kind:'PREEMPT_OR_FORCED_UPPER',
      exact:true,
      moverRole:'DEFENDER',
      lowerCell:failure.lowerCell,
      upperCell:failure.upperCell,
      preemptCell:failure.lowerCell,
      nonpreemptFrontier:safe,
      responseCell:failure.upperCell,
      rule:'exact vertical two-stage theorem restricted to nonpreempt moves outside its explicitly returned first-win hazard set',
      choiceEnumeration:false,
      restrictedByExactHazardAudit:true,
    },
  };
}

function normalizeHazard(position,hazardCell,attacker){
  const after=applyCpcxForcedEvent(position,hazardCell);
  if(after.terminal)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'DEFENDER_NORMALIZATION_HAZARD_TERMINAL',
    terminal:after.terminal,
    hazardCell,
  };

  const normalized=closeCpcxForcedResponses(after);
  if(normalized.kind==='CERTIFIED_FIRST_WIN'){
    return normalized.player===attacker
      ?{kind:'CERTIFIED_FIRST_WIN',exact:true,player:attacker,hazardCell}
      :{
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'DEFENDER_FIRST_WIN_DURING_HAZARD_NORMALIZATION',
        player:normalized.player,
        hazardCell,
      };
  }
  if(normalized.kind!=='OPEN')return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'UNSUPPORTED_HAZARD_NORMALIZATION_BOUNDARY',
    hazardCell,
    boundary:normalized.boundary,
  };

  const rows=verticalRows(normalized.position,attacker),
    exact=rows.find(x=>x.certificate.exact&&[
      'PREEMPT_OR_FORCED_UPPER',
      'FORCED_UPPER_RESPONSE',
      'ATTACKER_TERMINAL_ON_LOWER',
      'PREEXISTING_CURRENT_TERMINAL',
    ].includes(x.certificate.kind));
  if(!exact)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'NORMALIZED_VERTICAL_TWO_STAGE_NOT_FOUND',
    hazardCell,
    normalizedRank:normalized.position.rank,
    normalizedMover:normalized.position.mover,
  };

  const carrier=composeVertical(
    normalized.position,exact.demand,exact.certificate,attacker
  );
  return carrier?.kind==='CERTIFIED_FIRST_WIN'
    ?carrier
    :carrier?.exact
      ?carrier
      :{
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'NORMALIZED_VERTICAL_COMPOSITION_FAILED',
        hazardCell,
      };
}

export function collapseCpcxDebtRepairTokenProduct(position,contract,repair,{retainComponents=false}={}){
  if(contract?.kind!=='THREE_TRIGGER_WING_ATTACK'||!repair?.exact)
    throw new TypeError('exact wing repair required');
  if(!repair.firstWinGuardPassed||
     !repair.postRepairFirstWinGuardPassed||
     !repair.repairLegalAtDecision)
    return {kind:'NO_CERTIFICATE',exact:false,seam:'WING_REPAIR_GUARD_FAILURE'};

  const attacker=repair.attacker,defender=repair.defender,
    classes=[],continuing=[];

  // This is one flat quantified set scan.  It does not descend through a
  // second arbitrary reply frontier.
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
          deviationClass:'IMMEDIATE_NORMALIZATION',
          deviationCells:[deviationCell],
          result:'CERTIFIED_FIRST_WIN',
          forcedSteps:normalized.steps.length,
        });
        continue;
      }
      return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'DEFENDER_FIRST_WIN_DURING_POST_REPAIR_NORMALIZATION',
        deviationCell,
        player:normalized.player,
      };
    }
    if(normalized.kind!=='OPEN')return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'UNSUPPORTED_POST_REPAIR_NORMALIZATION_BOUNDARY',
      deviationCell,
      boundary:normalized.boundary,
    };

    const activePosition=normalized.position,
      rows=verticalRows(activePosition,attacker),
      exact=rows.find(x=>x.certificate.exact&&[
        'PREEMPT_OR_FORCED_UPPER',
        'FORCED_UPPER_RESPONSE',
        'ATTACKER_TERMINAL_ON_LOWER',
        'PREEXISTING_CURRENT_TERMINAL',
      ].includes(x.certificate.kind));

    if(exact){
      const carrier=composeVertical(
        activePosition,exact.demand,exact.certificate,attacker
      );
      if(carrier?.kind==='CERTIFIED_FIRST_WIN'){
        classes.push({
          deviationClass:'DIRECT_VERTICAL',
          deviationCells:[deviationCell],
          result:'CERTIFIED_FIRST_WIN',
        });
        continue;
      }
      if(!carrier?.exact)return {
        kind:'NO_CERTIFICATE',
        exact:false,
        seam:'DIRECT_VERTICAL_COMPOSITION_FAILED',
        deviationCell,
      };
      classes.push({
        deviationClass:'DIRECT_VERTICAL',
        deviationCells:[deviationCell],
        result:'VERTICAL_MACRO_CONTINUES',
        verticalKind:exact.certificate.kind,
        rankOptions:[...carrier.rank.options],
      });
      continuing.push(carrier);
      continue;
    }

    const failed=rows.find(x=>
      x.certificate.kind==='POST_LOWER_FIRST_WIN_GUARD_FAILURE'
    );
    if(!failed)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'VERTICAL_TWO_STAGE_CLASSIFICATION_MISSING',
      deviationCell,
      rows:rows.map(x=>x.certificate.kind),
    };

    const restricted=restrictedVerticalCertificate(failed.certificate);
    if(!restricted)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'VERTICAL_HAZARD_RESTRICTION_FAILED',
      deviationCell,
    };

    // Safe moves are one theorem-certified set class, not individual replies.
    const safeCarrier=composeVertical(
      activePosition,failed.demand,restricted.certificate,attacker
    );
    if(!safeCarrier?.exact)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'SAFE_VERTICAL_CLASS_COMPOSITION_FAILED',
      deviationCell,
    };
    classes.push({
      deviationClass:'VERTICAL_SAFE_RESPONSE_SET',
      deviationCells:[deviationCell],
      safeResponseCells:[failed.demand.lowerCell,...restricted.certificate.nonpreemptFrontier],
      hazardCells:[...restricted.hazards],
      result:'VERTICAL_MACRO_CONTINUES',
      rankOptions:[...safeCarrier.rank.options],
    });
    continuing.push(safeCarrier);

    // Only theorem-derived hazard moves receive deterministic normalization.
    for(const hazardCell of restricted.hazards){
      const carrier=normalizeHazard(activePosition,hazardCell,attacker);
      if(carrier.kind==='CERTIFIED_FIRST_WIN'){
        classes.push({
          deviationClass:'NORMALIZATION_HAZARD',
          deviationCells:[deviationCell],
          hazardCells:[hazardCell],
          result:'CERTIFIED_FIRST_WIN',
        });
        continue;
      }
      if(!carrier.exact)return {
        ...carrier,
        deviationCell,
      };
      classes.push({
        deviationClass:'NORMALIZATION_HAZARD',
        deviationCells:[deviationCell],
        hazardCells:[hazardCell],
        result:'VERTICAL_MACRO_CONTINUES',
        rankOptions:[...carrier.rank.options],
      });
      continuing.push(carrier);
    }
  }

  if(!continuing.length)return {
    schema:'connect4.cpcx.token-class-collapse.v0_2',
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
    seam:'TOKEN_CLASS_RANK_PARITY_SPLIT',
    rankOptions,
  };
  if(!continuing.every(c=>c.nextMover===attacker))return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'TOKEN_CLASS_MOVER_SPLIT',
  };

  const guaranteedResiduals=intersectResiduals(continuing),
    supportPhase=mergeSupportPhase(continuing),
    blockerTokens=mergeBlockerTokens(continuing),
    blockerCells=new Set(blockerTokens.flatMap(t=>t.candidateCells));

  for(const r of guaranteedResiduals)if(r.missingCells.some(x=>blockerCells.has(x)))
    return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'MERGED_BLOCKER_INTERSECTS_GUARANTEED_RESIDUAL',
      residual:r,
    };

  const envelopeKnown=continuing.every(c=>
      c.firstWinFacts?.nextImmediateNormalizationClosed===true||
      c.opponentSingletonEnvelope?.exact===true||
      c.firstWinFacts?.opponentSingletonEnvelope?.exact===true
    ),
    possibleOpponentSingletons=[...new Set(continuing.flatMap(c=>
      (c.opponentSingletonEnvelope??c.firstWinFacts?.opponentSingletonEnvelope)?.possibleCells??[]
    ))].sort((a,b)=>a-b),
    opponentTerminalLowerBounds=continuing
      .map(c=>
        (c.opponentSingletonEnvelope??c.firstWinFacts?.opponentSingletonEnvelope)
          ?.defenderEarliestTerminalLowerBound
      )
      .filter(Number.isFinite),
    opponentEarliestTerminalLowerBound=
      opponentTerminalLowerBounds.length===continuing.length
        ?Math.min(...opponentTerminalLowerBounds)
        :null,
    guaranteedOpponentSingletons=(()=>{
      const sets=continuing
        .map(c=>(c.opponentSingletonEnvelope??c.firstWinFacts?.opponentSingletonEnvelope)?.guaranteedCells)
        .filter(Array.isArray);
      if(!sets.length)return [];
      let out=[...sets[0]];
      for(let i=1;i<sets.length;i++){
        const s=new Set(sets[i]);
        out=out.filter(cell=>s.has(cell));
      }
      return out.sort((a,b)=>a-b);
    })();

  const opponentSingletonEnvelope={
    exact:envelopeKnown,
    possibleCells:possibleOpponentSingletons,
    guaranteedCells:guaranteedOpponentSingletons,
    normalizationClosed:envelopeKnown&&possibleOpponentSingletons.length===0,
    defenderEarliestTerminalLowerBound:opponentEarliestTerminalLowerBound,
    source:'intersection/union of exact component vertical singleton envelopes plus minimum conservative defender terminal horizon',
  };

  return {
    schema:'connect4.cpcx.token-class-collapse.v0_3',
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
    supportPhase,
    guaranteedResiduals,
    blockerTokens,
    opponentSingletonEnvelope,
    firstWinFacts:{
      repairFirstWinGuardPassed:true,
      postRepairFirstWinGuardPassed:true,
      exactVerticalHazardAuditApplied:true,
      deterministicHazardNormalizationApplied:true,
      opponentSingletonEnvelope,
      nextImmediateNormalizationClosed:
        opponentSingletonEnvelope.normalizationClosed,
      opponentEarliestTerminalLowerBound:
        opponentSingletonEnvelope.defenderEarliestTerminalLowerBound,
    },
    classes,
    responseClassCount:classes.length,
    polynomialBound:'O(|deviationFrontier| * liveResidualCount * boundedHazardNormalizationCost); no arbitrary second-frontier product',
    choiceEnumeration:false,
    recursive:false,
    source:{
      kind:'WING_DEBT_VERTICAL_SAFE_SET_PLUS_NORMALIZATION_HAZARDS',
      decisionIndex:repair.decisionIndex,
    },
    componentCarriers:retainComponents?continuing:undefined,
  };
}

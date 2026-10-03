// CPCX abstract successor and one-sided certificate iteration.
//
// Concrete exact macros are materialized as one deterministic successor.
// Universally collapsed macro classes are represented by guaranteed facts only:
// common next mover, rank options/parity, residual intersection, support
// intervals, blocker tokens, and first-win safety already proved by the macro.
//
// The iterator is nonrecursive.  Every composed macro consumes >=1 physical
// event.  If the next exact structural step cannot be derived from the carrier,
// CPCX returns NO_CERTIFICATE with no draw/loss inference.

import {cpcxCell,scanCpcxObligations} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';
import {
  collapseCpcxVerticalTwoStage,
  deriveCpcxVerticalOpponentSingletonEnvelope,
} from './cpcx-two-stage.mjs';
import {analyzeCpcxMacroUncertainty} from './cpcx-capacity.mjs';
import {collapseCpcxDisjunctiveBlockObligation} from './cpcx-cpc2.mjs';

function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)out[position.moves.length+i]=
    events[i].cell%position.geometry.columns;
  return out;
}

function concreteAfterEvents(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal)return {kind:'ILLEGAL_FIXED_MACRO',exact:false,verification:v};
  const rank=position.rank+events.length,
    terminal=v.terminal?{
      player:v.terminal.player,
      lineId:v.terminal.lineId,
    }:null;
  return {
    kind:'CONCRETE_SUCCESSOR',
    exact:true,
    position:{
      geometry:position.geometry,
      moves:appendMoves(position,events),
      rank,
      mover:(position.mover+events.length)&1,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal,
    },
    events,
    rankDelta:events.length,
    choiceEnumeration:false,
  };
}

function exactResiduals(position){
  return scanCpcxObligations(position).map(o=>({
    id:o.id,
    player:o.player,
    lineId:o.lineId,
    lineLabel:o.lineLabel,
    orientation:o.orientation,
    missingCount:o.missingCount,
    missingCells:[...o.missingCells],
    events:o.events.map(e=>({
      cell:e.cell,
      minSupportDistance:e.supportDistance,
      maxSupportDistance:e.supportDistance,
      eventRankParity:e.eventRank&1,
    })),
    supportProfiles:[o.missingCells.map(cell=>
      o.events.find(e=>e.cell===cell).supportDistance
    )],
    supportProfilesExact:true,
  }));
}

function supportPhaseVector(heights){
  return Array.from(heights,h=>h&1);
}

function uniquePhaseVectors(vectors){
  const m=new Map();
  for(const v of vectors)m.set(v.join(''),v);
  return [...m.values()].sort((a,b)=>a.join('').localeCompare(b.join('')));
}

function verticalSupportPhaseVectors(position,demand,certificate){
  const base=supportPhaseVector(position.heights),
    lowerColumn=cpcxCell(position.geometry,demand.lowerCell).column;

  if(certificate.kind==='FORCED_UPPER_RESPONSE')
    return [base];

  if(certificate.kind!=='PREEMPT_OR_FORCED_UPPER')
    throw new TypeError('unsupported vertical phase certificate');

  const vectors=[];
  const preempt=[...base];
  preempt[lowerColumn]^=1;
  vectors.push(preempt);

  for(const externalCell of certificate.nonpreemptFrontier){
    const externalColumn=cpcxCell(position.geometry,externalCell).column,
      delayed=[...base];
    // Delayed class adds two cells in the vertical-demand column, so that
    // column's support parity is unchanged. The one external defender event
    // toggles only its own column.
    delayed[externalColumn]^=1;
    vectors.push(delayed);
  }
  return uniquePhaseVectors(vectors);
}

function exactSupportEnvelopeFromVerticalClasses(envelope){
  const m=new Map();
  for(const cls of envelope?.classes??[]){
    if(cls.terminal!==null||!Array.isArray(cls.support))continue;
    m.set(cls.support.join(','),[...cls.support]);
  }
  return {
    exact:true,
    vectors:[...m.values()].sort((a,b)=>{
      const n=Math.min(a.length,b.length);
      for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
      return a.length-b.length;
    }),
    source:'exact continuing vertical macro support classes',
  };
}

function uniqueSupportProfiles(profiles){
  const m=new Map();
  for(const p of profiles)m.set(p.join(','),p);
  return [...m.values()].sort((a,b)=>{
    const n=Math.min(a.length,b.length);
    for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
    return a.length-b.length;
  });
}

function residualSupportProfilesFromEnvelope(position,residual,envelope){
  const g=position.geometry,profiles=[];
  for(const cls of envelope?.classes??[]){
    if(cls.terminal!==null||!Array.isArray(cls.support))continue;
    const profile=residual.missingCells.map(cell=>{
      const {column,row}=cpcxCell(g,cell);
      return row-cls.support[column];
    });
    if(profile.every(Number.isInteger)&&profile.every(x=>x>=0))
      profiles.push(profile);
  }
  return uniqueSupportProfiles(profiles);
}

function verticalSupportInterval(position,demand,certificate,cell){
  const g=position.geometry,target=cpcxCell(g,cell),
    lower=cpcxCell(g,demand.lowerCell),
    base=target.row-position.heights[target.column];

  if(certificate.kind==='FORCED_UPPER_RESPONSE'){
    const inc=target.column===lower.column?2:0;
    return {minSupportDistance:base-inc,maxSupportDistance:base-inc};
  }

  // PREEMPT: lower column grows by one.
  // DELAYED: lower column grows by two and at most one external frontier
  // column grows by one.  Both paths are represented by one interval.
  let minInc=0,maxInc=0;
  if(target.column===lower.column){
    minInc=1;maxInc=2;
  }else if(certificate.nonpreemptFrontier.some(x=>x%g.columns===target.column)){
    minInc=0;maxInc=1;
  }
  return {
    minSupportDistance:base-maxInc,
    maxSupportDistance:base-minInc,
  };
}

function abstractVerticalSuccessor(position,macro,collapse,envelope){
  const {demand,certificate}=macro,
    uncertainty=analyzeCpcxMacroUncertainty(position,collapse),
    singletonEnvelope=envelope??deriveCpcxVerticalOpponentSingletonEnvelope(
      position,demand,certificate
    ),
    rankOptions=collapse.rankDeltaOptions.map(x=>position.rank+x),
    supportPhaseVectors=verticalSupportPhaseVectors(position,demand,certificate),
    supportEnvelope=exactSupportEnvelopeFromVerticalClasses(singletonEnvelope),
    residuals=collapse.guaranteedResiduals.map(r=>({
      id:r.id,
      player:r.player,
      lineId:r.lineId,
      lineLabel:r.lineLabel,
      orientation:r.orientation,
      missingCount:r.missingCount,
      missingCells:[...r.missingCells],
      supportProfiles:residualSupportProfilesFromEnvelope(
        position,r,singletonEnvelope
      ),
      supportProfilesExact:true,
      events:r.missingCells.map(cell=>{
        const {row}=cpcxCell(position.geometry,cell),
          s=verticalSupportInterval(position,demand,certificate,cell);
        return {
          cell,
          ...s,
          eventRankParity:(
            ((position.geometry.columns-1)*position.geometry.rows-
              rankOptions[0]+(row+1))&1
          ),
        };
      }),
    }));

  return {
    schema:'connect4.cpcx.abstract-successor.v0_1',
    kind:'ABSTRACT_SUCCESSOR',
    exact:true,
    attacker:demand.attacker,
    nextMover:collapse.nextMover,
    rank:{
      options:rankOptions,
      deltaOptions:[...collapse.rankDeltaOptions],
      parity:rankOptions[0]&1,
      allSameParity:rankOptions.every(x=>(x&1)===(rankOptions[0]&1)),
    },
    controlParityEquivalent:collapse.controlParityEquivalent,
    supportPhase:{
      exact:true,
      vectors:supportPhaseVectors,
      source:'exact vertical preempt/delayed support-parity projection',
    },
    supportEnvelope,
    guaranteedResiduals:residuals,
    blockerTokens:collapse.externalDefenderUncertainty?[{
      owner:demand.defender,
      maxCount:collapse.externalDefenderUncertainty.maxPlacements,
      candidateCells:[...collapse.externalDefenderUncertainty.candidateCells],
      directKillCapacity:uncertainty.directBlockCapacity,
      supportOnly:uncertainty.directKillEdges===0,
    }]:[],
    opponentSingletonEnvelope:singletonEnvelope,
    opponentResidualEnvelope:singletonEnvelope.opponentResidualEnvelope??null,
    firstWinFacts:{
      macroFirstWinGuardPassed:true,
      noTerminalDuringMacro:singletonEnvelope.defenderTerminalClasses===0,
      opponentSingletonEnvelope:singletonEnvelope,
      opponentResidualEnvelope:singletonEnvelope.opponentResidualEnvelope??null,
      nextImmediateNormalizationClosed:
        singletonEnvelope.exact===true&&singletonEnvelope.normalizationClosed===true,
    },
    source:{
      kind:'VERTICAL_TWO_STAGE',
      certificateKind:certificate.kind,
      collapse,
    },
    choiceEnumeration:false,
    recursive:false,
  };
}

export function composeCpcxForcingMacro(position,progress){
  if(progress?.kind!=='CERTIFIED_FORCING_MACRO'||!progress.exact)
    throw new TypeError('exact forcing macro progress required');
  const macro=progress.macro;

  if(macro.kind==='PLAYABLE_TWO_PIECE'){
    const selected=macro.certificate.selected;
    if(selected?.kind!=='FORCED_TWO_PIECE_RESPONSE')
      throw new TypeError('forced two-piece certificate required');
    const events=[
      {cell:selected.firstCell,owner:selected.attacker},
      {cell:selected.responseCell,owner:selected.defender},
    ];
    const next=concreteAfterEvents(position,events);
    if(!next.exact)return next;
    return {
      schema:'connect4.cpcx.abstract-successor.v0_1',
      kind:'CONCRETE_SUCCESSOR',
      exact:true,
      attacker:selected.attacker,
      nextMover:next.position.mover,
      rank:{
        options:[next.position.rank],
        deltaOptions:[2],
        parity:next.position.rank&1,
        allSameParity:true,
      },
      controlParityEquivalent:true,
      supportPhase:{
        exact:true,
        vectors:[supportPhaseVector(next.position.heights)],
        source:'exact concrete successor support parity',
      },
      supportEnvelope:{
        exact:true,
        vectors:[Array.from(next.position.heights)],
        source:'exact concrete successor support vector',
      },
      guaranteedResiduals:exactResiduals(next.position),
      blockerTokens:[],
      firstWinFacts:{
        macroFirstWinGuardPassed:true,
        noTerminalDuringMacro:next.position.terminal===null,
        nextImmediateNormalizationClosed:true,
      },
      concretePosition:next.position,
      source:{kind:'PLAYABLE_TWO_PIECE',events},
      choiceEnumeration:false,
      recursive:false,
    };
  }

  if(macro.kind==='VERTICAL_THREE_STAGE'){
    const certificate=macro.certificate;
    if(certificate?.kind!=='VERTICAL_THREE_STAGE_SETUP'||!certificate.exact)
      throw new TypeError('exact vertical three-stage setup certificate required');

    const childProgress={
      kind:'CERTIFIED_FORCING_MACRO',
      exact:true,
      player:certificate.controller,
      macro:{
        kind:'VERTICAL_TWO_STAGE',
        primaryCell:certificate.childDemand.lowerCell,
        secondaryCell:certificate.childDemand.upperCell,
        lineId:certificate.childDemand.obligation.lineId,
        demand:certificate.childDemand,
        certificate:certificate.childCertificate,
      },
    };
    const childResult=composeCpcxForcingMacro(
      certificate.child,childProgress
    );
    if(!childResult?.exact)return {
      ...childResult,
      seam:childResult?.seam??'VERTICAL_THREE_STAGE_CHILD_COMPOSITION_FAILED',
    };
    if(!childResult.rank?.deltaOptions)
      throw new Error('vertical three-stage child result missing rank delta');

    return {
      ...childResult,
      rank:{
        ...childResult.rank,
        deltaOptions:childResult.rank.deltaOptions.map(x=>x+1),
      },
      source:{
        kind:'VERTICAL_THREE_STAGE',
        setupCell:certificate.setupCell,
        sourceLineId:certificate.sourceLineId,
        childCertificateKind:certificate.childCertificate.kind,
        childSource:childResult.source,
      },
      choiceEnumeration:false,
      recursive:false,
    };
  }

  if(macro.kind==='VERTICAL_TWO_STAGE'){
    const collapse=collapseCpcxVerticalTwoStage(
      position,macro.demand,macro.certificate
    ),
      envelope=deriveCpcxVerticalOpponentSingletonEnvelope(
        position,macro.demand,macro.certificate
      );
    if(envelope.kind==='DEFENDER_TERMINAL_CLASS')return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'VERTICAL_OPPONENT_SINGLETON_ENVELOPE_DEFENDER_TERMINAL',
      envelope,
    };
    if(macro.certificate.kind==='FORCED_UPPER_RESPONSE'){
      const events=[
        {cell:macro.demand.lowerCell,owner:macro.demand.attacker},
        {cell:macro.demand.upperCell,owner:macro.demand.defender},
      ];
      const next=concreteAfterEvents(position,events);
      if(!next.exact)return next;
      return {
        schema:'connect4.cpcx.abstract-successor.v0_1',
        kind:'CONCRETE_SUCCESSOR',
        exact:true,
        attacker:macro.demand.attacker,
        nextMover:next.position.mover,
        rank:{
          options:[next.position.rank],
          deltaOptions:[2],
          parity:next.position.rank&1,
          allSameParity:true,
        },
        controlParityEquivalent:true,
        supportPhase:{
          exact:true,
          vectors:[supportPhaseVector(next.position.heights)],
          source:'exact concrete successor support parity',
        },
        guaranteedResiduals:exactResiduals(next.position),
        blockerTokens:[],
        opponentSingletonEnvelope:envelope,
        firstWinFacts:{
          macroFirstWinGuardPassed:true,
          noTerminalDuringMacro:next.position.terminal===null,
          nextImmediateNormalizationClosed:envelope.normalizationClosed===true,
        },
        concretePosition:next.position,
        source:{kind:'VERTICAL_TWO_STAGE',certificateKind:macro.certificate.kind,collapse},
        choiceEnumeration:false,
        recursive:false,
      };
    }
    return abstractVerticalSuccessor(position,macro,collapse,envelope);
  }

  throw new TypeError('unsupported CPCX forcing macro');
}

export function composeCpcxDisjunctiveBlockObligation(position,progress){
  if(progress?.kind!=='DISJUNCTIVE_BLOCK_OBLIGATION'||!progress.exact)
    throw new TypeError('exact disjunctive block obligation required');
  const successor=collapseCpcxDisjunctiveBlockObligation(
    position,
    progress.obligation??progress
  );
  if(!successor.exact)return successor;
  if(successor.rank?.deltaOptions?.some(x=>x!==1))
    throw new Error('disjunctive current-rank obligation must consume exactly one event');
  return successor;
}

export function composeCpcxForcedNormalization(position,progress){
  if(progress?.kind!=='FORCED_NORMALIZATION'||!progress.exact)
    throw new TypeError('forced normalization required');
  const next=applyCpcxForcedEvent(position,progress.cell);
  return {
    schema:'connect4.cpcx.abstract-successor.v0_1',
    kind:'CONCRETE_SUCCESSOR',
    exact:true,
    attacker:null,
    nextMover:next.mover,
    rank:{
      options:[next.rank],
      deltaOptions:[1],
      parity:next.rank&1,
      allSameParity:true,
    },
    controlParityEquivalent:false,
    supportPhase:{
      exact:true,
      vectors:[supportPhaseVector(next.heights)],
      source:'exact concrete successor support parity',
    },
    supportEnvelope:{
      exact:true,
      vectors:[Array.from(next.heights)],
      source:'exact concrete successor support vector',
    },
    guaranteedResiduals:exactResiduals(next),
    blockerTokens:[],
    firstWinFacts:{
      macroFirstWinGuardPassed:true,
      noTerminalDuringMacro:true,
      nextImmediateNormalizationClosed:true,
    },
    concretePosition:next,
    source:{kind:'FORCED_NORMALIZATION',cell:progress.cell},
    choiceEnumeration:false,
    recursive:false,
  };
}

export function createCpcxDebtRepairSuccessor(position,contract,repair){
  if(contract?.kind!=='THREE_TRIGGER_WING_ATTACK'||!repair?.exact)
    throw new TypeError('exact wing debt repair required');
  if(!repair.firstWinGuardPassed||!repair.postRepairFirstWinGuardPassed||!repair.repairLegalAtDecision)
    return {
      schema:'connect4.cpcx.abstract-successor.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'WING_DEBT_FIRST_WIN_GUARD_FAILURE',
    };

  const rankDelta=repair.prefix.length+2,
    rank=position.rank+rankDelta,
    nextMover=(position.mover+rankDelta)&1;
  return {
    schema:'connect4.cpcx.abstract-successor.v0_1',
    kind:'ABSTRACT_SUCCESSOR',
    exact:true,
    attacker:repair.attacker,
    nextMover,
    rank:{
      options:[rank],
      deltaOptions:[rankDelta],
      parity:rank&1,
      allSameParity:true,
    },
    controlParityEquivalent:true,
    guaranteedResiduals:repair.guaranteedResiduals.map(r=>({
      ...r,
      missingCells:[...r.missingCells],
      events:r.events.map(e=>({...e,eventRankParity:e.eventRank&1})),
    })),
    blockerTokens:[{
      owner:repair.defender,
      maxCount:1,
      candidateCells:[...repair.deviationFrontier],
      directKillCapacity:0,
      supportOnly:true,
      provenance:'one non-honored wing response',
    }],
    firstWinFacts:{
      macroFirstWinGuardPassed:true,
      postRepairFirstWinGuardPassed:true,
      noTerminalDuringMacro:true,
      nextImmediateNormalizationClosed:false,
    },
    source:{
      kind:'WING_DEVIATION_REPAIR',
      decisionIndex:repair.decisionIndex,
      requiredResponseCell:repair.requiredResponseCell,
    },
    choiceEnumeration:false,
    recursive:false,
  };
}

export function classifyCpcxSuccessor(successor,{attacker=successor.attacker}={}){
  if(!successor?.exact)throw new TypeError('exact CPCX successor required');

  if(successor.concretePosition)
    return classifyCpcxProgress(successor.concretePosition,{player:attacker??successor.concretePosition.mover});

  // Abstract carriers deliberately fail closed until opponent singleton / first-win hazards are closed under their blocker-token class.
  if(!successor.firstWinFacts?.nextImmediateNormalizationClosed)return {
    schema:'connect4.cpcx.progress.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    player:attacker,
    seam:'ABSTRACT_OPPONENT_SINGLETON_ENVELOPE_MISSING',
    carrier:{
      nextMover:successor.nextMover,
      rank:successor.rank,
      guaranteedResidualCount:successor.guaranteedResiduals.length,
      blockerTokenCount:successor.blockerTokens.length,
    },
    recursive:false,
  };

  return {
    schema:'connect4.cpcx.progress.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    player:attacker,
    seam:'NO_EXACT_ABSTRACT_MACRO',
    recursive:false,
  };
}

export function runCpcxFirstWinCertificate(position,{
  attacker=position.mover,
  maxMacroSteps=position.geometry.cellCount-position.rank,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(maxMacroSteps)||maxMacroSteps<0)throw new RangeError('maxMacroSteps');

  let current={kind:'CONCRETE_SUCCESSOR',exact:true,concretePosition:position,attacker},
    consumed=0;
  const trace=[];

  while(consumed<=maxMacroSteps){
    const concrete=current.concretePosition,
      progress=concrete
        ?classifyCpcxProgress(concrete,{player:attacker})
        :classifyCpcxSuccessor(current,{attacker});
    trace.push({rank:concrete?.rank??current.rank,progress});

    if(progress.kind==='CERTIFIED_FIRST_WIN')return {
      schema:'connect4.cpcx.first-win-certificate.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:progress.player,
      requestedAttacker:attacker,
      trace,
      recursive:false,
    };

    if(progress.kind==='FORCED_NORMALIZATION'){
      if(!concrete)throw new Error('abstract normalization must be collapsed before iteration');
      current=composeCpcxForcedNormalization(concrete,progress);
      consumed+=1;
      continue;
    }

    if(progress.kind==='CERTIFIED_FORCING_MACRO'){
      if(!concrete)throw new Error('abstract macro composition not implemented');
      current=composeCpcxForcingMacro(concrete,progress);
      const delta=Math.min(...current.rank.deltaOptions);
      if(delta<1)throw new Error('non-progressing CPCX macro');
      consumed+=delta;
      continue;
    }

    if(progress.kind==='DISJUNCTIVE_BLOCK_OBLIGATION'){
      if(!concrete)throw new Error('abstract disjunctive obligation must be collapsed before iteration');
      current=composeCpcxDisjunctiveBlockObligation(concrete,progress);
      if(!current.exact)return {
        schema:'connect4.cpcx.first-win-certificate.v0_1',
        kind:'NO_CERTIFICATE',
        exact:false,
        requestedAttacker:attacker,
        seam:current.seam??'CPC2_ABSTRACT_SUCCESSOR_UNRESOLVED',
        trace,
        recursive:false,
      };
      consumed+=1;
      continue;
    }

    return {
      schema:'connect4.cpcx.first-win-certificate.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      requestedAttacker:attacker,
      seam:progress.seam??progress.kind,
      trace,
      recursive:false,
    };
  }

  return {
    schema:'connect4.cpcx.first-win-certificate.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    requestedAttacker:attacker,
    seam:'MACRO_STEP_BOUND_EXHAUSTED',
    trace,
    recursive:false,
  };
}

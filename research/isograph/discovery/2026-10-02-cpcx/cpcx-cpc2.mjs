// CPCX forward CPC2 disjunctive-block theorem.
//
// This module derives current-rank defender obligations from owner-labelled
// residual cofactors only. It does not construct or solve child positions.
// The theorem class is deliberately bounded to attacker trigger cells already
// on the current legal frontier, so a nonblocking defender move in another
// column leaves the trigger legal on the next rank.

import {cpcxCell,scanCpcxObligations} from './cpcx.mjs';
import {
  createCpcxResidualCarrier,
  applyCpcxResidualEvent,
} from './cpcx-residual.mjs';
import {
  classifyCpcxImmediate,
  solveCpcxResponseCapacity,
} from './cpcx-closure.mjs';

function uniqueSorted(values){
  return [...new Set(values)].sort((a,b)=>a-b);
}

function currentFrontier(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}

function labelCell(g,cell){
  const {column,row}=cpcxCell(g,cell);
  return `${column<26?String.fromCharCode(65+column):`C${column+1}`}${row+1}`;
}

function advanceFrontierHeights(position,cells){
  const heights=new Int16Array(position.heights),g=position.geometry;
  for(const cell of cells){
    const {column,row}=cpcxCell(g,cell);
    if(row!==heights[column])return null;
    heights[column]+=1;
  }
  return heights;
}

function playableWithHeights(g,heights,cells){
  const out=[];
  for(const cell of uniqueSorted(cells)){
    const {column,row}=cpcxCell(g,cell);
    if(row===heights[column])out.push(cell);
  }
  return out;
}

function bornSingletonCells(effect,player){
  const childIds=new Set(effect.contracted
    .filter(x=>x.player===player&&x.toMissing===1)
    .map(x=>x.childObligationId));
  const cells=[];
  for(const residual of effect.residuals){
    if(residual.player!==player||residual.missingCount!==1||!childIds.has(residual.id))continue;
    cells.push(residual.missingCells[0]);
  }
  return uniqueSorted(cells);
}

function capacityCertificate(cells,responseCapacity){
  if(!Number.isInteger(responseCapacity)||responseCapacity<1)
    throw new RangeError('responseCapacity');
  const demands=uniqueSorted(cells).map(cell=>`completion:${cell}`),
    resources=Array.from({length:responseCapacity},(_,i)=>`defender-slot:${i}`),
    edges=[];
  for(const demand of demands)for(const resource of resources)edges.push([demand,resource]);
  const matching=solveCpcxResponseCapacity({demands,resources,edges});
  return {
    responseCapacity,
    completionCells:uniqueSorted(cells),
    demandCount:demands.length,
    overload:matching.perfect===false,
    matching,
  };
}

function setIntersection(rows){
  if(!rows.length)return [];
  let out=[...rows[0]];
  for(let i=1;i<rows.length;i++){
    const s=new Set(rows[i]);
    out=out.filter(x=>s.has(x));
  }
  return uniqueSorted(out);
}

function rootTriggerTemplate(position,carrier,triggerCell,attacker,responseCapacity){
  const effect=applyCpcxResidualEvent(carrier,{cell:triggerCell,owner:attacker}),
    born=bornSingletonCells(effect,attacker),
    heights=advanceFrontierHeights(position,[triggerCell]);
  if(!heights)return {
    kind:'CPC2_TRIGGER_TEMPLATE',
    exact:false,
    triggerCell,
    reason:'TRIGGER_NOT_CURRENT_FRONTIER',
  };
  const playable=playableWithHeights(position.geometry,heights,born),
    capacity=capacityCertificate(playable,responseCapacity);
  return {
    kind:'CPC2_TRIGGER_TEMPLATE',
    exact:true,
    attacker,
    triggerCell,
    triggerLabel:labelCell(position.geometry,triggerCell),
    sourceTwoPieceResiduals:effect.contracted
      .filter(x=>x.player===attacker&&x.fromMissing===2&&x.toMissing===1)
      .map(x=>x.parentObligationId),
    bornSingletonCells:born,
    playableSingletonCells:playable,
    responseCapacity,
    capacity,
    forkProducing:capacity.overload,
    exactCofactor:true,
    eventOccurrenceCertified:false,
    temporalBoundary:'template is promoted only after the current defender frontier is quantified and first-win guards pass',
  };
}

export function findCpcxCpc2TriggerTemplates(position,{
  attacker=position.mover^1,
  responseCapacity=1,
  obligations=scanCpcxObligations(position),
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  const frontier=new Set(currentFrontier(position)),
    cells=new Set();
  for(const o of obligations){
    if(o.player!==attacker||o.missingCount!==2)continue;
    for(const cell of o.missingCells)if(frontier.has(cell))cells.add(cell);
  }
  const carrier=createCpcxResidualCarrier(position,obligations);
  return [...cells].sort((a,b)=>a-b)
    .map(cell=>rootTriggerTemplate(position,carrier,cell,attacker,responseCapacity));
}

function auditTriggerAfterDefenderMove(position,carrier,template,defenderCell,{
  attacker,
  defender,
  responseCapacity,
}={}){
  const triggerCell=template.triggerCell;
  if(defenderCell===triggerCell)return {
    kind:'TRIGGER_SUPPRESSED',
    exact:true,
    triggerCell,
    defenderCell,
    reason:'DIRECT_TRIGGER_OCCUPATION',
    survivingCompletionCells:[],
  };

  const heights=advanceFrontierHeights(position,[defenderCell,triggerCell]);
  if(!heights)return {
    kind:'CPC2_GUARD_UNRESOLVED',
    exact:false,
    triggerCell,
    defenderCell,
    reason:'TRIGGER_NOT_FRONTIER_STABLE',
  };

  const afterDefender=applyCpcxResidualEvent(carrier,{cell:defenderCell,owner:defender});
  if(afterDefender.completions.some(x=>x.player===defender))return {
    kind:'CPC2_GUARD_UNRESOLVED',
    exact:false,
    triggerCell,
    defenderCell,
    reason:'DEFENDER_CURRENT_TERMINAL',
  };

  const afterTrigger=applyCpcxResidualEvent(afterDefender,{cell:triggerCell,owner:attacker});
  if(afterTrigger.completions.some(x=>x.player===attacker))return {
    kind:'CERTIFIED_TRIGGER_FIRST_WIN',
    exact:true,
    attacker,
    defender,
    triggerCell,
    defenderCell,
    reason:'ATTACKER_TERMINAL_ON_TRIGGER',
    responseCapacity,
    firstWinGuardPassed:true,
  };

  const born=bornSingletonCells(afterTrigger,attacker),
    playable=playableWithHeights(position.geometry,heights,born),
    capacity=capacityCertificate(playable,responseCapacity);

  if(!capacity.overload)return {
    kind:'TRIGGER_SUPPRESSED',
    exact:true,
    triggerCell,
    defenderCell,
    reason:'COFACTOR_CAPACITY_REDUCTION',
    rootCompletionCells:[...template.playableSingletonCells],
    survivingCompletionCells:playable,
    removedCompletionCells:template.playableSingletonCells.filter(x=>!playable.includes(x)),
    capacity,
  };

  const defenderPlayable=playableWithHeights(
    position.geometry,
    heights,
    afterTrigger.singletons[defender],
  );
  if(defenderPlayable.length)return {
    kind:'CPC2_GUARD_UNRESOLVED',
    exact:false,
    triggerCell,
    defenderCell,
    reason:'DEFENDER_COUNTERTERMINAL_AVAILABLE',
    defenderTerminalCells:defenderPlayable,
    attackerCompletionCells:playable,
    capacity,
  };

  return {
    kind:'CERTIFIED_TRIGGER_OVERLOAD',
    exact:true,
    attacker,
    defender,
    triggerCell,
    triggerLabel:labelCell(position.geometry,triggerCell),
    defenderCell,
    completionCells:playable,
    responseCapacity,
    capacity,
    firstWinGuardPassed:true,
    proofRule:'after the current defender event and attacker trigger cofactor, distinct playable completion singletons exceed the next defender placement capacity and the defender has no immediate terminal counterwin',
  };
}

export function deriveCpcxDisjunctiveBlockObligation(position,{
  attacker=position.mover^1,
  responseCapacity=1,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  const defender=attacker^1;
  if(position.terminal)return {
    kind:'NO_CERTIFICATE',exact:false,attacker,defender,seam:'ALREADY_TERMINAL',recursive:false,
  };
  if(position.mover!==defender)return {
    kind:'NO_CERTIFICATE',exact:false,attacker,defender,seam:'CPC2_REQUIRES_DEFENDER_TO_MOVE',recursive:false,
  };

  const obligations=scanCpcxObligations(position),
    immediate=classifyCpcxImmediate(position,obligations);
  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')return {
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    defender,
    seam:'CPC2_FIRST_WIN_PRECEDENCE_REQUIRES_NORMALIZATION',
    immediate,
    recursive:false,
  };

  const allTemplates=findCpcxCpc2TriggerTemplates(position,{
      attacker,responseCapacity,obligations,
    }),
    triggers=allTemplates.filter(x=>x.exact&&x.forkProducing&&x.sourceTwoPieceResiduals.length>=2);
  if(!triggers.length)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    defender,
    seam:'NO_CPC2_FORK_TRIGGER',
    triggerTemplates:allTemplates,
    recursive:false,
  };

  const frontier=currentFrontier(position),
    carrier=createCpcxResidualCarrier(position,obligations),
    blockingCells=[],outsideMoveCertificates=[],frontierAudit=[],unresolvedMoves=[];

  for(const defenderCell of frontier){
    const rows=triggers.map(template=>auditTriggerAfterDefenderMove(
      position,carrier,template,defenderCell,{attacker,defender,responseCapacity}
    ));
    const allSuppressed=rows.every(x=>x.kind==='TRIGGER_SUPPRESSED'),
      certified=rows.filter(x=>x.kind==='CERTIFIED_TRIGGER_OVERLOAD'||x.kind==='CERTIFIED_TRIGGER_FIRST_WIN'),
      unresolved=rows.filter(x=>x.kind==='CPC2_GUARD_UNRESOLVED');

    if(allSuppressed){
      blockingCells.push(defenderCell);
    }else if(certified.length){
      const witness=[...certified].sort((a,b)=>a.triggerCell-b.triggerCell)[0];
      outsideMoveCertificates.push({defenderCell,witness});
    }else{
      unresolvedMoves.push({defenderCell,unresolved,rows});
    }
    frontierAudit.push({defenderCell,allSuppressed,rows});
  }

  if(unresolvedMoves.length)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    defender,
    seam:'CPC2_FIRST_WIN_GUARD_UNRESOLVED',
    triggerCertificates:triggers,
    unresolvedMoves,
    frontierAudit,
    recursive:false,
  };

  if(!blockingCells.length)return {
    schema:'connect4.cpcx.cpc2-first-win.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    defender,
    source:'CPC2_NO_BLOCKING_MOVE',
    triggerCertificates:triggers,
    outsideMoveCertificates,
    responseCapacity,
    firstWinGuardPassed:true,
    recursive:false,
  };

  if(blockingCells.length===frontier.length)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    defender,
    seam:'TRIVIAL_CPC2_BLOCK_SET',
    triggerCertificates:triggers,
    frontierAudit,
    recursive:false,
  };

  return {
    schema:'connect4.cpcx.disjunctive-block-obligation.v0_1',
    kind:'DISJUNCTIVE_BLOCK_OBLIGATION',
    exact:true,
    obligatedPlayer:defender,
    attacker,
    currentRank:position.rank,
    currentMover:position.mover,
    blockingCells:uniqueSorted(blockingCells),
    blockingLabels:uniqueSorted(blockingCells).map(cell=>labelCell(position.geometry,cell)),
    triggerCertificates:triggers,
    responseCapacity,
    firstWinGuard:{
      currentImmediateClass:immediate.kind,
      allOutsideFrontierMovesCertified:true,
      unresolvedMoves:0,
      provenance:'current-rank residual cofactor + post-trigger support + response-capacity matching + defender counterterminal audit',
    },
    exactness:{
      relativeToCertifiedTriggerFamily:true,
      allCurrentFrontierMovesQuantified:true,
      blockingSetIsExactSuppressorSet:true,
      gameValueClaim:false,
    },
    rankDeltaSemantics:{
      requiredNow:true,
      consumeExactlyOneCurrentFrontierEvent:true,
      delta:1,
      nextRank:position.rank+1,
      nextMover:attacker,
    },
    outsideMoveCertificates,
    frontierAudit,
    semantics:'the obligated player must occupy at least one listed current blocking cell now, or a certified attacker trigger yields the first Connect Four',
    childBoardConstruction:false,
    choiceEnumeration:false,
    recursive:false,
  };
}

export function collapseCpcxDisjunctiveBlockObligation(position,obligation){
  const o=obligation?.obligation??obligation;
  if(o?.kind!=='DISJUNCTIVE_BLOCK_OBLIGATION'||!o.exact)
    throw new TypeError('exact disjunctive CPC2 obligation required');
  if(o.obligatedPlayer!==position.mover)throw new RangeError('obligated player is not current mover');
  const attacker=o.attacker,defender=o.obligatedPlayer,
    frontier=new Set(currentFrontier(position)),
    blockers=uniqueSorted(o.blockingCells);
  if(!blockers.length||blockers.some(cell=>!frontier.has(cell)))
    throw new RangeError('blocking cells must be current legal frontier');

  const blockerSet=new Set(blockers),
    carrier=createCpcxResidualCarrier(position),
    guaranteed=carrier.residuals.filter(r=>
      r.player===attacker&&r.missingCells.every(cell=>!blockerSet.has(cell))
    ),
    classes=[];

  for(const blockerCell of blockers){
    const heights=advanceFrontierHeights(position,[blockerCell]);
    if(!heights)throw new Error('blocking alternative lost frontier legality');
    const effect=applyCpcxResidualEvent(carrier,{cell:blockerCell,owner:defender});
    if(effect.completions.some(x=>x.player===defender))return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'CPC2_BLOCKER_TERMINAL_CONTRADICTS_PRECEDENCE_GUARD',
      blockerCell,
    };
    classes.push({
      blockerCell,
      attackerSingletons:playableWithHeights(position.geometry,heights,effect.singletons[attacker]),
      defenderSingletons:playableWithHeights(position.geometry,heights,effect.singletons[defender]),
    });
  }

  const possibleAttackerSingletons=uniqueSorted(classes.flatMap(x=>x.attackerSingletons)),
    guaranteedAttackerSingletons=setIntersection(classes.map(x=>x.attackerSingletons)),
    possibleDefenderSingletons=uniqueSorted(classes.flatMap(x=>x.defenderSingletons)),
    guaranteedDefenderSingletons=setIntersection(classes.map(x=>x.defenderSingletons));

  const guaranteedResiduals=guaranteed.map(r=>({
    id:r.id,
    player:r.player,
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    orientation:r.orientation,
    missingCount:r.missingCount,
    missingCells:[...r.missingCells],
    events:r.missingCells.map(cell=>{
      const {column,row}=cpcxCell(position.geometry,cell),
        base=row-position.heights[column],
        liftCandidates=blockers.filter(blocker=>{
          const b=cpcxCell(position.geometry,blocker);
          return b.column===column&&b.row===position.heights[column]&&b.row<row;
        }),
        alwaysLift=liftCandidates.length===blockers.length;
      return {
        cell,
        minSupportDistance:Math.max(0,base-(liftCandidates.length?1:0)),
        maxSupportDistance:Math.max(0,base-(alwaysLift?1:0)),
        supportLiftCandidates:liftCandidates,
      };
    }),
    guarantee:'SURVIVES_EVERY_DISJUNCTIVE_BLOCK_ALTERNATIVE',
  }));

  const normalizationClosed=
    possibleAttackerSingletons.length===0&&possibleDefenderSingletons.length===0;

  return {
    schema:'connect4.cpcx.abstract-successor.v0_1',
    kind:'ABSTRACT_SUCCESSOR',
    exact:true,
    attacker,
    nextMover:attacker,
    rank:{
      options:[position.rank+1],
      deltaOptions:[1],
      parity:(position.rank+1)&1,
      allSameParity:true,
    },
    controlParityEquivalent:true,
    guaranteedResiduals,
    blockerTokens:[{
      kind:'EXACTLY_ONE_OF',
      owner:defender,
      exactCount:1,
      candidateCells:blockers,
      candidateLabels:blockers.map(cell=>labelCell(position.geometry,cell)),
      currentRankOnly:true,
      directKillCapacity:null,
      supportOnly:false,
      provenance:'DISJUNCTIVE_BLOCK_OBLIGATION',
    }],
    oneOfOwnershipFact:{owner:defender,exactlyOneOf:blockers},
    singletonEnvelope:{
      exact:true,
      classes,
      possibleAttackerCells:possibleAttackerSingletons,
      guaranteedAttackerCells:guaranteedAttackerSingletons,
      possibleDefenderCells:possibleDefenderSingletons,
      guaranteedDefenderCells:guaranteedDefenderSingletons,
    },
    opponentSingletonEnvelope:{
      exact:true,
      possibleCells:possibleDefenderSingletons,
      guaranteedCells:guaranteedDefenderSingletons,
      normalizationClosed:possibleDefenderSingletons.length===0,
      classes:classes.map(x=>({
        blockerCell:x.blockerCell,
        defenderSingletons:x.defenderSingletons,
      })),
    },
    firstWinFacts:{
      macroFirstWinGuardPassed:true,
      noTerminalDuringMacro:true,
      nextImmediateNormalizationClosed:normalizationClosed,
      cpc2OutsideAlternativesCertified:true,
    },
    source:{
      kind:'DISJUNCTIVE_BLOCK_OBLIGATION',
      blockingCells:blockers,
      triggerCells:o.triggerCertificates.map(x=>x.triggerCell),
    },
    choiceEnumeration:false,
    childBoardConstruction:false,
    recursive:false,
  };
}

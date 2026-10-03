// CPCX exact vertical two-stage obligation primitive.
//
// Premise:
// - attacker has a live vertical residual with exactly two missing cells;
// - lower missing cell is current frontier (support distance 0);
// - upper missing cell is exactly one support step above;
// - current position has been normalized for immediate singleton obligations.
//
// Consequence:
// - if attacker is to move, taking lower produces terminal now or a forced
//   singleton at upper, subject to first-win precedence;
// - if defender is to move, defender may preempt lower now.  Otherwise the
//   whole nonpreempt frontier is quantified as a set.  If the set-level
//   first-win audit passes, attacker takes lower and upper becomes the unique
//   vertical completion obligation.
//
// No legal-reply recursion is performed.

import {cpcxCell,scanCpcxObligations} from './cpcx.mjs';
import {createCpcxResidualCarrier,compileCpcxResidualEventChain} from './cpcx-residual.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';
import {lowerBoundCpcxEarliestTerminal} from './cpcx-deadline.mjs';

function unique(values){return [...new Set(values)].sort((a,b)=>a-b);}

function currentFrontier(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}

function immediateCells(position,player){
  return unique(scanCpcxObligations(position)
    .filter(o=>o.player===player&&o.missingCount===1&&o.events[0].supportDistance===0)
    .map(o=>o.missingCells[0]));
}

function supportAfterTwoEvents(position,firstCell,secondCell,targetCell){
  const g=position.geometry,heights=new Int16Array(position.heights),
    a=cpcxCell(g,firstCell),b=cpcxCell(g,secondCell),t=cpcxCell(g,targetCell);
  if(a.row!==heights[a.column])return null;
  heights[a.column]+=1;
  if(b.row!==heights[b.column])return null;
  heights[b.column]+=1;
  return t.row-heights[t.column];
}

function defenderRisksAfterUnknownThenLower(position,defender,lower,nonpreempt){
  const carrier=createCpcxResidualCarrier(position),
    afterLower=compileCpcxResidualEventChain(carrier,[{cell:lower,owner:defender^1}]),
    nonpreemptSet=new Set(nonpreempt),risks=[];

  for(const residual of afterLower.residuals){
    if(residual.player!==defender)continue;
    if(residual.missingCount===1){
      const target=residual.missingCells[0];
      for(const d of nonpreempt){
        if(d===target)continue; // would have been an immediate terminal now.
        const distance=supportAfterTwoEvents(position,d,lower,target);
        if(distance===0)risks.push({
          kind:'SURVIVING_SINGLETON_AFTER_LOWER',
          obligationId:residual.id,
          defenderMove:d,
          targetCell:target,
        });
      }
    }else if(residual.missingCount===2){
      for(const d of residual.missingCells){
        if(!nonpreemptSet.has(d))continue;
        const target=residual.missingCells[0]===d?residual.missingCells[1]:residual.missingCells[0],
          distance=supportAfterTwoEvents(position,d,lower,target);
        if(distance===0)risks.push({
          kind:'DEFENDER_MOVE_CREATES_COUNTER_SINGLETON',
          obligationId:residual.id,
          defenderMove:d,
          targetCell:target,
        });
      }
    }
  }
  return risks;
}

export function findCpcxVerticalTwoStageObligations(position,{player=null}={}){
  const out=[];
  for(const o of scanCpcxObligations(position)){
    if(o.missingCount!==2||o.orientation!=='V')continue;
    if(player!==null&&o.player!==player)continue;
    const e=o.events.slice().sort((a,b)=>a.row-b.row);
    if(e[0].column!==e[1].column)continue;
    if(e[0].supportDistance!==0||e[1].supportDistance!==1)continue;
    out.push({
      obligation:o,
      attacker:o.player,
      defender:o.player^1,
      lowerCell:e[0].cell,
      upperCell:e[1].cell,
      column:e[0].column,
    });
  }
  return out;
}

export function certifyCpcxVerticalTwoStage(position,demand){
  if(!demand?.obligation||demand.obligation.missingCount!==2)
    throw new TypeError('vertical two-stage demand');
  const attacker=demand.attacker,defender=demand.defender,
    lower=demand.lowerCell,upper=demand.upperCell,
    lowerMeta=cpcxCell(position.geometry,lower),
    upperMeta=cpcxCell(position.geometry,upper);
  if(lowerMeta.column!==upperMeta.column||upperMeta.row!==lowerMeta.row+1)
    return {kind:'UNRESOLVED_GEOMETRY',exact:false};

  const ownImmediate=immediateCells(position,position.mover),
    oppImmediate=immediateCells(position,position.mover^1);
  if(ownImmediate.length)return {
    kind:'PREEXISTING_CURRENT_TERMINAL',
    exact:true,
    winningCells:ownImmediate,
  };
  if(oppImmediate.length)return {
    kind:'REQUIRES_FORCED_NORMALIZATION',
    exact:false,
    opponentSingletons:oppImmediate,
  };

  if(position.mover===attacker){
    const v=verifyCpcxFixedEventScript(position,[{cell:lower,owner:attacker}]);
    if(!v.legal)return {kind:'LOWER_NOT_LEGAL',exact:false};
    if(v.terminal)return {
      kind:'ATTACKER_TERMINAL_ON_LOWER',
      exact:true,
      terminal:v.terminal,
      lowerCell:lower,
    };
    const child={
      geometry:position.geometry,
      moves:position.moves,
      rank:position.rank+1,
      mover:defender,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal:null,
    };
    const attackerSingletons=immediateCells(child,attacker),
      defenderSingletons=immediateCells(child,defender);
    if(!attackerSingletons.includes(upper))return {
      kind:'UPPER_SINGLETON_NOT_DERIVED',
      exact:false,
      attackerSingletons,
    };
    if(defenderSingletons.length)return {
      kind:'FIRST_WIN_GUARD_FAILURE',
      exact:false,
      defenderSingletons,
    };
    return {
      kind:'FORCED_UPPER_RESPONSE',
      exact:true,
      moverRole:'ATTACKER',
      lowerCell:lower,
      upperCell:upper,
      rule:'attacker takes lower; upper is a playable completion singleton and defender has no immediate terminal counterwin',
    };
  }

  if(position.mover!==defender)return {kind:'TURN_MISMATCH',exact:false};

  const frontier=currentFrontier(position),
    nonpreempt=frontier.filter(cell=>cell!==lower),
    terminalNow=immediateCells(position,defender).filter(cell=>cell!==lower);
  if(terminalNow.length)return {
    kind:'DEFENDER_TERMINAL_AVAILABLE',
    exact:false,
    terminalCells:terminalNow,
  };

  const risks=defenderRisksAfterUnknownThenLower(position,defender,lower,nonpreempt);
  if(risks.length)return {
    kind:'POST_LOWER_FIRST_WIN_GUARD_FAILURE',
    exact:false,
    lowerCell:lower,
    upperCell:upper,
    nonpreemptFrontier:nonpreempt,
    risks,
  };

  return {
    kind:'PREEMPT_OR_FORCED_UPPER',
    exact:true,
    moverRole:'DEFENDER',
    lowerCell:lower,
    upperCell:upper,
    preemptCell:lower,
    nonpreemptFrontier:nonpreempt,
    responseCell:upper,
    rule:'defender either occupies lower now, or any nonpreempt frontier move permits attacker lower and forces defender upper next',
    choiceEnumeration:false,
  };
}


export function partitionCpcxVerticalTwoStageGuard(position,demand,certificate){
  if(!demand?.obligation||certificate?.kind!=='POST_LOWER_FIRST_WIN_GUARD_FAILURE')
    throw new TypeError('post-lower guard-failure certificate required');

  const riskMoves=new Map();
  for(const risk of certificate.risks){
    if(!riskMoves.has(risk.defenderMove))riskMoves.set(risk.defenderMove,[]);
    riskMoves.get(risk.defenderMove).push(risk);
  }
  const risky=new Set(riskMoves.keys()),
    safeNonpreempt=certificate.nonpreemptFrontier.filter(cell=>!risky.has(cell));
  for(const cell of risky)if(!certificate.nonpreemptFrontier.includes(cell))
    throw new Error('risk move outside quantified nonpreempt frontier');

  return {
    kind:'PARTITIONED_VERTICAL_TWO_STAGE',
    exact:true,
    attacker:demand.attacker,
    defender:demand.defender,
    lowerCell:demand.lowerCell,
    upperCell:demand.upperCell,
    preemptCell:demand.lowerCell,
    safeNonpreemptFrontier:safeNonpreempt,
    guardNormalizationClasses:[...riskMoves.entries()]
      .sort((a,b)=>a[0]-b[0])
      .map(([defenderMove,risks])=>({
        defenderMove,
        targetCells:unique(risks.map(x=>x.targetCell)),
        risks,
      })),
    responseClasses:1+(safeNonpreempt.length?1:0)+riskMoves.size,
    choiceEnumeration:false,
    rule:'preempt is exact; risk-free nonpreempt moves retain the ordinary delayed vertical proof; flagged nonpreempt moves must pass exact forced normalization before lower is attempted',
  };
}


export function collapseCpcxVerticalTwoStage(position,demand,certificate){
  if(!certificate?.exact)throw new TypeError('exact two-stage certificate required');
  const attacker=demand.attacker,defender=demand.defender,
    lower=demand.lowerCell,upper=demand.upperCell,
    carrier=createCpcxResidualCarrier(position);

  if(certificate.kind==='FORCED_UPPER_RESPONSE'){
    const effect=compileCpcxResidualEventChain(carrier,[
      {cell:lower,owner:attacker},
      {cell:upper,owner:defender},
    ]);
    return {
      kind:'VERTICAL_TWO_STAGE_COLLAPSED',
      exact:true,
      sourceKind:certificate.kind,
      nextMover:attacker,
      rankDeltaOptions:[2],
      rankDeltaParity:0,
      controlParityEquivalent:true,
      guaranteedResiduals:effect.residuals.filter(r=>r.player===attacker),
      externalDefenderUncertainty:null,
      choiceEnumeration:false,
      rule:'fixed attacker-lower / defender-upper macro returns turn to attacker',
    };
  }

  if(certificate.kind!=='PREEMPT_OR_FORCED_UPPER')
    throw new TypeError('unsupported exact two-stage certificate');

  const possibleDefenderCells=new Set([
    lower,
    upper,
    ...certificate.nonpreemptFrontier,
  ]);
  const guaranteedResiduals=[];
  for(const r of carrier.residuals){
    if(r.player!==attacker)continue;
    if(r.missingCells.some(cell=>possibleDefenderCells.has(cell)))continue;
    guaranteedResiduals.push({
      ...r,
      missingCells:[...r.missingCells],
      guarantee:'UNCHANGED_IN_PREEMPT_AND_ALL_DELAYED_RESOLUTIONS',
    });
  }
  const hasDelayed=certificate.nonpreemptFrontier.length>0;
  return {
    kind:'VERTICAL_TWO_STAGE_COLLAPSED',
    exact:true,
    sourceKind:certificate.kind,
    nextMover:attacker,
    rankDeltaOptions:hasDelayed?[1,3]:[1],
    rankDeltaParity:1,
    controlParityEquivalent:true,
    parityProof:'preempt consumes 1 event; delayed resolution consumes 3; difference is 2 so all unaffected CPC target parities agree',
    guaranteedResiduals,
    externalDefenderUncertainty:hasDelayed?{
      maxPlacements:1,
      candidateCells:[...certificate.nonpreemptFrontier],
      owner:defender,
      note:'present only in delayed resolution; guaranteed residuals are disjoint from every candidate cell',
    }:null,
    possibleDefenderCells:[...possibleDefenderCells].sort((a,b)=>a-b),
    choiceEnumeration:false,
    rule:'intersection is computed by set exclusion against all cells the defender may own in either exact resolution',
  };
}


function cpcxTwoStageVirtualPosition(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal)return {kind:'INVALID_CLASS',verification:v};
  if(v.terminal)return {kind:'TERMINAL_CLASS',terminal:v.terminal,verification:v};
  return {
    kind:'NONTERMINAL_CLASS',
    position:{
      geometry:position.geometry,
      moves:position.moves,
      rank:position.rank+events.length,
      mover:(position.mover+events.length)&1,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal:null,
    },
  };
}

export function deriveCpcxVerticalOpponentSingletonEnvelope(position,demand,certificate){
  if(!certificate?.exact)throw new TypeError('exact vertical certificate required');
  const attacker=demand.attacker,defender=demand.defender,
    lower=demand.lowerCell,upper=demand.upperCell,
    classes=[];

  function add(label,events,externalCell=null){
    const v=cpcxTwoStageVirtualPosition(position,events);
    if(v.kind==='INVALID_CLASS')return {
      kind:'INVALID_CLASS',
      exact:false,
      label,
      verification:v.verification,
    };
    if(v.kind==='TERMINAL_CLASS'){
      classes.push({
        label,
        externalCell,
        terminal:v.terminal,
        defenderSingletons:[],
        defenderEarliestTerminalLowerBound:
          v.terminal.player===defender?0:null,
      });
      return null;
    }
    classes.push({
      label,
      externalCell,
      terminal:null,
      defenderSingletons:immediateCells(v.position,defender),
    });
    return null;
  }

  if(certificate.kind==='FORCED_UPPER_RESPONSE'){
    const bad=add('FIXED_UPPER_RESPONSE',[
      {cell:lower,owner:attacker},
      {cell:upper,owner:defender},
    ]);
    if(bad)return bad;
  }else if(certificate.kind==='PREEMPT_OR_FORCED_UPPER'){
    let bad=add('PREEMPT',[
      {cell:lower,owner:defender},
    ]);
    if(bad)return bad;
    for(const externalCell of certificate.nonpreemptFrontier){
      bad=add('DELAYED',[
        {cell:externalCell,owner:defender},
        {cell:lower,owner:attacker},
        {cell:upper,owner:defender},
      ],externalCell);
      if(bad)return bad;
    }
  }else if(certificate.kind==='ATTACKER_TERMINAL_ON_LOWER'||
           certificate.kind==='PREEXISTING_CURRENT_TERMINAL'){
    return {
      kind:'TERMINAL_MACRO',
      exact:true,
      attacker,
      defender,
      continuingClasses:0,
      attackerTerminalClasses:1,
      defenderTerminalClasses:0,
      possibleCells:[],
      guaranteedCells:[],
      normalizationClosed:true,
      classes:[],
      choiceEnumeration:false,
    };
  }else{
    throw new TypeError('unsupported vertical certificate kind');
  }

  const defenderTerminal=classes.filter(x=>x.terminal?.player===defender),
    attackerTerminal=classes.filter(x=>x.terminal?.player===attacker),
    continuing=classes.filter(x=>x.terminal===null);
  if(defenderTerminal.length)return {
    kind:'DEFENDER_TERMINAL_CLASS',
    exact:false,
    attacker,
    defender,
    defenderTerminalClasses:defenderTerminal,
    attackerTerminalClasses:attackerTerminal,
    continuingClasses:continuing.length,
    classes,
    choiceEnumeration:false,
  };

  const defenderEarliestTerminalLowerBound=continuing.length
    ?Math.min(...continuing.map(x=>
      x.defenderEarliestTerminalLowerBound??Infinity
    ))
    :null;

  const possible=unique(continuing.flatMap(x=>x.defenderSingletons));
  let guaranteed=[];
  if(continuing.length){
    guaranteed=[...continuing[0].defenderSingletons];
    for(let i=1;i<continuing.length;i++){
      const set=new Set(continuing[i].defenderSingletons);
      guaranteed=guaranteed.filter(cell=>set.has(cell));
    }
  }

  return {
    schema:'connect4.cpcx.vertical-opponent-singleton-envelope.v0_1',
    kind:'OPPONENT_SINGLETON_ENVELOPE',
    exact:true,
    attacker,
    defender,
    classCount:classes.length,
    continuingClasses:continuing.length,
    attackerTerminalClasses:attackerTerminal.length,
    defenderTerminalClasses:0,
    possibleCells:possible,
    guaranteedCells:guaranteed,
    normalizationClosed:possible.length===0,
    defenderEarliestTerminalLowerBound:
      Number.isFinite(defenderEarliestTerminalLowerBound)
        ?defenderEarliestTerminalLowerBound
        :null,
    classes,
    proofRule:'flat exact preempt/delayed class scan; union is every possible defender singleton after the macro and intersection is every guaranteed defender singleton',
    choiceEnumeration:false,
    recursive:false,
  };
}

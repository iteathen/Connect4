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

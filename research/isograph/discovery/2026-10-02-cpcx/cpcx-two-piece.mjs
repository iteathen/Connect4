// CPCX playable two-piece forcing macro.
//
// If the attacker is to move in a normalized state and owns a live residual
// {x,y} with both x and y currently playable, then playing one endpoint either
// terminals immediately or creates a playable singleton at the other endpoint.
// If the defender has no immediate counterterminal after the first endpoint,
// the second endpoint is a forced response.
//
// The macro consumes exactly two events and returns the turn to the attacker.

import {scanCpcxObligations} from './cpcx.mjs';
import {classifyCpcxImmediate} from './cpcx-closure.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';

function unique(values){return [...new Set(values)].sort((a,b)=>a-b);}

function immediateCells(position,player){
  return unique(scanCpcxObligations(position)
    .filter(o=>o.player===player&&o.missingCount===1&&o.events[0].supportDistance===0)
    .map(o=>o.missingCells[0]));
}

export function findCpcxPlayableTwoPieceDemands(position,{player=position.mover}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===player&&
      o.missingCount===2&&
      o.events.every(e=>e.supportDistance===0)
    )
    .map(o=>({
      obligation:o,
      player,
      cells:[...o.missingCells].sort((a,b)=>a-b),
    }));
}

export function certifyCpcxPlayableTwoPiece(position,demand,{firstCell=demand?.cells?.[0]}={}){
  if(!demand?.obligation||demand.player!==position.mover)
    return {kind:'TURN_MISMATCH',exact:false};

  const pre=classifyCpcxImmediate(position);
  if(pre.kind!=='NO_IMMEDIATE_OBLIGATION')return {
    kind:'REQUIRES_FORCED_NORMALIZATION',
    exact:false,
    boundary:pre,
  };

  const [a,b]=demand.cells;
  if(firstCell!==a&&firstCell!==b)throw new RangeError('firstCell');
  const secondCell=firstCell===a?b:a,
    attacker=demand.player,defender=attacker^1,
    step=verifyCpcxFixedEventScript(position,[{cell:firstCell,owner:attacker}]);

  if(!step.legal)return {kind:'FIRST_CELL_NOT_LEGAL',exact:false};
  if(step.terminal)return {
    kind:'TERMINAL_ON_FIRST_CELL',
    exact:true,
    firstCell,
    terminal:step.terminal,
  };

  const child={
    geometry:position.geometry,
    moves:position.moves,
    rank:position.rank+1,
    mover:defender,
    heights:step.finalHeights,
    owner:step.finalOwner,
    terminal:null,
  };
  const own=immediateCells(child,attacker),
    opp=immediateCells(child,defender);
  if(!own.includes(secondCell))return {
    kind:'SECOND_SINGLETON_NOT_DERIVED',
    exact:false,
    firstCell,
    secondCell,
    attackerSingletons:own,
  };
  if(opp.length)return {
    kind:'FIRST_WIN_GUARD_FAILURE',
    exact:false,
    firstCell,
    secondCell,
    defenderTerminalCells:opp,
  };

  return {
    kind:'FORCED_TWO_PIECE_RESPONSE',
    exact:true,
    attacker,
    defender,
    firstCell,
    responseCell:secondCell,
    rankDelta:2,
    nextMover:attacker,
    controlParityDelta:0,
    rule:'attacker first endpoint creates a playable completion singleton at the second endpoint; defender has no earlier terminal and must respond there',
    choiceEnumeration:false,
  };
}

export function certifyEitherCpcxPlayableTwoPiece(position,demand){
  const rows=demand.cells.map(firstCell=>certifyCpcxPlayableTwoPiece(position,demand,{firstCell}));
  const exact=rows.find(x=>x.exact);
  return {
    kind:exact?'PLAYABLE_TWO_PIECE_MACRO_AVAILABLE':'NO_CERTIFIED_TWO_PIECE_ENDPOINT',
    exact:!!exact,
    selected:exact??null,
    endpoints:rows,
    selectionRule:exact?'first exact endpoint in ascending physical cell order':null,
  };
}

// CPCX playable pair-hub fork primitive.
//
// A current-player playable cell h is a certified pair hub when at least two
// live two-piece residuals {h,x}, {h,y} contract after h to distinct playable
// singleton cells x != y.  With no defender immediate terminal after h, one
// response slot cannot cover both singleton obligations.
//
// This is local cofactor + response-capacity closure, not recursive search.

import {scanCpcxObligations} from './cpcx.mjs';
import {classifyCpcxImmediate} from './cpcx-closure.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';

function unique(values){return [...new Set(values)].sort((a,b)=>a-b);}

function immediateCells(position,player){
  return unique(scanCpcxObligations(position)
    .filter(o=>o.player===player&&o.missingCount===1&&o.events[0].supportDistance===0)
    .map(o=>o.missingCells[0]));
}

export function findCpcxPlayablePairHubs(position,{player=position.mover}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  const byHub=new Map();
  for(const o of scanCpcxObligations(position)){
    if(o.player!==player||o.missingCount!==2)continue;
    for(const h of o.currentlyPlayableCells){
      const other=o.missingCells[0]===h?o.missingCells[1]:o.missingCells[0],
        event=o.events.find(e=>e.cell===other);
      if(!byHub.has(h))byHub.set(h,[]);
      byHub.get(h).push({
        obligationId:o.id,
        lineLabel:o.lineLabel,
        otherCell:other,
        otherSupportDistance:event.supportDistance,
      });
    }
  }

  const out=[];
  for(const [hub,rows] of byHub){
    const distinct=[...new Map(rows.map(x=>[x.otherCell,x])).values()];
    if(distinct.length<2)continue;
    out.push({hub,player,residuals:distinct});
  }
  return out;
}

export function certifyCpcxPlayablePairHub(position,candidate){
  if(!candidate||candidate.player!==position.mover)
    return {kind:'TURN_MISMATCH',exact:false};

  const pre=classifyCpcxImmediate(position);
  if(pre.kind!=='NO_IMMEDIATE_OBLIGATION')return {
    kind:'REQUIRES_FORCED_NORMALIZATION',
    exact:false,
    boundary:pre,
  };

  const player=candidate.player,defender=player^1,
    step=verifyCpcxFixedEventScript(position,[{cell:candidate.hub,owner:player}]);
  if(!step.legal)return {kind:'HUB_NOT_LEGAL',exact:false};
  if(step.terminal)return {
    kind:'TERMINAL_ON_HUB',
    exact:true,
    hub:candidate.hub,
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
  const own=immediateCells(child,player),
    opp=immediateCells(child,defender),
    produced=unique(candidate.residuals.map(x=>x.otherCell).filter(cell=>own.includes(cell)));

  if(opp.length)return {
    kind:'FIRST_WIN_GUARD_FAILURE',
    exact:false,
    hub:candidate.hub,
    defenderTerminalCells:opp,
    producedSingletons:produced,
  };
  if(produced.length<2)return {
    kind:'INSUFFICIENT_PLAYABLE_SINGLETONS',
    exact:false,
    hub:candidate.hub,
    producedSingletons:produced,
  };

  return {
    kind:'CERTIFIED_PAIR_HUB_FORK',
    exact:true,
    hub:candidate.hub,
    player,
    singletonCells:produced,
    responseSlots:1,
    deficiency:produced.length-1,
    rule:'hub cofactor creates at least two distinct playable attacker singletons and defender has one placement response slot',
    choiceEnumeration:false,
  };
}

export function findAndCertifyCpcxPairHubForks(position,{player=position.mover}={}){
  const out=[];
  for(const candidate of findCpcxPlayablePairHubs(position,{player})){
    const certificate=certifyCpcxPlayablePairHub(position,candidate);
    if(certificate.exact)out.push({candidate,certificate});
  }
  return out;
}

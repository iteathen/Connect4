// CPCX residual consequence compiler.
//
// Exact algebra:
//   owner p acquires event x
//     -> p residuals containing x contract
//     -> (1-p) residuals containing x die
//     -> residuals not containing x are unchanged
//
// This is Boolean cofactor algebra over the current live residual carrier.
// It does not assert that x is legal, forced, or will occur.

import {
  cpcxCell,
  cpcxEventMetadata,
  scanCpcxObligations,
} from './cpcx.mjs';

function cloneResidual(o){
  return {
    id:o.id,
    player:o.player,
    lineId:o.lineId,
    lineLabel:o.lineLabel,
    orientation:o.orientation,
    missingCells:[...o.missingCells],
    missingCount:o.missingCount,
    source:'CURRENT_LIVE_RESIDUAL',
  };
}

export function createCpcxResidualCarrier(position,obligations=scanCpcxObligations(position)){
  return {
    schema:'connect4.cpcx.residual-carrier.v0_1',
    rank:position.rank,
    mover:position.mover,
    residuals:obligations.map(cloneResidual),
  };
}

export function applyCpcxResidualEvent(carrier,{cell,owner}={}){
  if(!carrier||!Array.isArray(carrier.residuals))throw new TypeError('residual carrier');
  if(owner!==0&&owner!==1)throw new RangeError('owner');
  if(!Number.isInteger(cell)||cell<0)throw new RangeError('cell');

  const residuals=[],killed=[],contracted=[],completions=[];
  for(const source of carrier.residuals){
    const at=source.missingCells.indexOf(cell);
    if(at<0){
      residuals.push({...source,missingCells:[...source.missingCells]});
      continue;
    }

    if(source.player!==owner){
      killed.push({
        obligationId:source.id,
        player:source.player,
        lineLabel:source.lineLabel,
        priorMissingCount:source.missingCount,
        killingCell:cell,
        killingOwner:owner,
      });
      continue;
    }

    const remaining=source.missingCells.slice(0,at).concat(source.missingCells.slice(at+1));
    if(!remaining.length){
      completions.push({
        obligationId:source.id,
        player:owner,
        lineLabel:source.lineLabel,
        completingCell:cell,
      });
      continue;
    }

    const next={
      ...source,
      id:`${source.id}@${owner}:${cell}`,
      missingCells:remaining,
      missingCount:remaining.length,
      source:'OWNER_COFACTOR',
      parentObligationId:source.id,
      acquiredCell:cell,
    };
    residuals.push(next);
    contracted.push({
      parentObligationId:source.id,
      childObligationId:next.id,
      player:owner,
      lineLabel:source.lineLabel,
      fromMissing:source.missingCount,
      toMissing:next.missingCount,
      acquiredCell:cell,
    });
  }

  const singletons=[[],[]];
  for(const r of residuals)if(r.missingCount===1)singletons[r.player].push(r.missingCells[0]);
  singletons[0]=[...new Set(singletons[0])].sort((a,b)=>a-b);
  singletons[1]=[...new Set(singletons[1])].sort((a,b)=>a-b);

  return {
    schema:'connect4.cpcx.residual-event.v0_1',
    event:{cell,owner},
    residuals,
    killed,
    contracted,
    completions,
    singletons,
    exactCofactor:true,
    eventOccurrenceCertified:false,
  };
}

function supportAfterCurrentEvent(position,eventCell,targetCell){
  const g=position.geometry,
    event=cpcxCell(g,eventCell),
    target=cpcxCell(g,targetCell);
  let height=position.heights[target.column];
  if(event.column===target.column&&event.row===height)height+=1;
  if(target.row<height)return {occupiedOrPassed:true,supportDistance:-1};
  return {occupiedOrPassed:false,supportDistance:target.row-height};
}

export function compileCpcxEventConsequence(position,{
  cell,
  owner,
  obligations=scanCpcxObligations(position),
}={}){
  const carrier=createCpcxResidualCarrier(position,obligations),
    effect=applyCpcxResidualEvent(carrier,{cell,owner}),
    meta=cpcxEventMetadata(position,cell),
    currentPlayable=!meta.occupied&&meta.supportDistance===0,
    singletonDetails=[[],[]];

  for(let player=0;player<2;player++)for(const targetCell of effect.singletons[player]){
    const support=currentPlayable
      ?supportAfterCurrentEvent(position,cell,targetCell)
      :{occupiedOrPassed:false,supportDistance:null};
    singletonDetails[player].push({
      cell:targetCell,
      supportDistanceAfterEvent:support.supportDistance,
      currentEventSupportWasExact:currentPlayable,
    });
  }

  const ownerSingletons=effect.singletons[owner],
    opponentSingletons=effect.singletons[owner^1];
  let consequence='RESIDUAL_UPDATE';
  if(effect.completions.length)consequence='OWNER_COMPLETES';
  else if(ownerSingletons.length>=2)consequence='OWNER_MULTI_SINGLETON';
  else if(ownerSingletons.length===1)consequence='OWNER_SINGLETON_BORN';

  return {
    ...effect,
    event:{
      cell,
      owner,
      currentPlayable,
      supportDistance:meta.supportDistance,
      eventRank:meta.eventRank,
      zeroReservationOwner:meta.zeroReservationOwner,
    },
    singletonDetails,
    ownerSingletons,
    opponentSingletons,
    consequence,
    temporalClaim:currentPlayable
      ?'support update after this one current legal event is exact'
      :'future event consequence is conditional; temporal support is unresolved',
  };
}

export function findCpcxConditionalPrecursors(position,{
  player=position.mover,
  maxSourceMissing=4,
  obligations=scanCpcxObligations(position),
}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  const cells=new Set();
  for(const o of obligations){
    if(o.player!==player||o.missingCount<2||o.missingCount>maxSourceMissing)continue;
    for(const cell of o.missingCells)cells.add(cell);
  }

  const out=[];
  for(const cell of [...cells].sort((a,b)=>a-b)){
    const c=compileCpcxEventConsequence(position,{cell,owner:player,obligations});
    if(c.consequence==='OWNER_MULTI_SINGLETON'||c.consequence==='OWNER_SINGLETON_BORN'||c.consequence==='OWNER_COMPLETES'){
      out.push({
        cell,
        owner:player,
        currentPlayable:c.event.currentPlayable,
        consequence:c.consequence,
        bornSingletons:c.ownerSingletons,
        completions:c.completions,
        contracted:c.contracted.filter(x=>x.player===player),
        exactCofactor:true,
        forcingCertified:false,
        proofNeed:c.event.currentPlayable
          ?['first-win precedence against opponent immediate terminal','singleton response-capacity']
          :['certify future event ownership','certify support/admissibility','first-win precedence','singleton response-capacity'],
      });
    }
  }
  return out;
}

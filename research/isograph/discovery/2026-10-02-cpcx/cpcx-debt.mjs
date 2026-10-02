// CPCX universal debt-repair certificate.
//
// For a three-trigger wing contract, a defender deviation is quantified as the
// whole legal frontier set minus the required same-column response.  No reply
// is chosen or iterated as a proof branch.
//
// After an unanswered trigger, the attacker may occupy the omitted response
// cell immediately (subject to first-win guard).  Owner-labelled cofactors for
// the fixed prefix + repair are computed once.  A residual is deviation-invariant
// when none of its still-missing cells intersects the entire deviation frontier.
//
// Support distance may vary by at most the effect of the one deviation event;
// event rank is invariant because it depends only on total rank and target row.

import {cpcxCell,scanCpcxObligations} from './cpcx.mjs';
import {createCpcxResidualCarrier,compileCpcxResidualEventChain} from './cpcx-residual.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';

function virtualPosition(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal)throw new RangeError('fixed prefix illegal');
  if(v.terminal)throw new RangeError('fixed prefix already terminal');
  return {
    geometry:position.geometry,
    moves:position.moves,
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}

function frontierCells(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}

function immediateTerminalCells(position,player){
  const cells=new Set();
  for(const o of scanCpcxObligations(position)){
    if(o.player===player&&o.missingCount===1&&o.events[0].supportDistance===0)
      cells.add(o.missingCells[0]);
  }
  return [...cells].sort((a,b)=>a-b);
}

function priorFixedEvents(contract,decisionIndex){
  const events=[{cell:contract.action.cell,owner:contract.action.owner}];
  for(let i=0;i<=decisionIndex;i++){
    events.push({cell:contract.anchoredLine.triggerCells[i],owner:contract.attacker});
    if(i<decisionIndex)events.push({
      cell:contract.anchoredLine.requiredResponseCells[i],
      owner:contract.action.owner,
    });
  }
  return events;
}

function supportIntervalAfterUnknownDeviation(basePosition,repairCell,targetCell,deviationFrontier){
  const g=basePosition.geometry,
    target=cpcxCell(g,targetCell),
    repair=cpcxCell(g,repairCell);
  let baseHeight=basePosition.heights[target.column];
  if(repair.column===target.column&&repair.row===baseHeight)baseHeight+=1;
  let maxDistance=target.row-baseHeight,minDistance=maxDistance;
  for(const cell of deviationFrontier){
    const d=cpcxCell(g,cell);
    if(d.column===target.column&&d.row===basePosition.heights[target.column]&&d.row<target.row)
      minDistance=Math.max(-1,maxDistance-1);
  }
  return {
    minSupportDistance:minDistance,
    maxSupportDistance:maxDistance,
  };
}

export function deriveCpcxUniversalDebtRepair(position,contract,{decisionIndex=0}={}){
  if(contract.kind!=='THREE_TRIGGER_WING_ATTACK')throw new TypeError('wing contract');
  if(decisionIndex!==0&&decisionIndex!==1)throw new RangeError('decisionIndex');

  const defender=contract.action.owner,attacker=contract.attacker,
    prefix=priorFixedEvents(contract,decisionIndex),
    decisionPosition=virtualPosition(position,prefix),
    requiredResponseCell=contract.anchoredLine.requiredResponseCells[decisionIndex],
    allFrontier=frontierCells(decisionPosition),
    deviations=allFrontier.filter(cell=>cell!==requiredResponseCell),
    defenderWins=immediateTerminalCells(decisionPosition,defender),
    terminalDeviationCells=deviations.filter(cell=>defenderWins.includes(cell));

  const repairMeta=cpcxCell(position.geometry,requiredResponseCell),
    repairLegalAtDecision=
      decisionPosition.heights[repairMeta.column]===repairMeta.row&&
      decisionPosition.owner[requiredResponseCell]===-1;

  const currentCarrier=createCpcxResidualCarrier(position),
    fixedKnownEvents=prefix.concat([{cell:requiredResponseCell,owner:attacker}]),
    effect=compileCpcxResidualEventChain(currentCarrier,fixedKnownEvents),
    deviationSet=new Set(deviations),
    guaranteedResiduals=[];

  for(const r of effect.residuals){
    if(r.player!==attacker||r.missingCount<1||r.missingCount>4)continue;
    if(r.missingCells.some(cell=>deviationSet.has(cell)))continue;
    const events=r.missingCells.map(cell=>{
      const {row}=cpcxCell(position.geometry,cell),
        interval=supportIntervalAfterUnknownDeviation(
          decisionPosition,requiredResponseCell,cell,deviations
        ),
        finalRank=decisionPosition.rank+2,
        eventRank=(position.geometry.columns-1)*position.geometry.rows-finalRank+(row+1),
        projectedOwner=(finalRank&1)^((eventRank-1)&1);
      return {
        cell,
        row,
        eventRank,
        projectedOwner,
        ...interval,
      };
    });
    guaranteedResiduals.push({
      id:r.id,
      parentObligationId:r.parentObligationId??null,
      lineLabel:r.lineLabel,
      orientation:r.orientation,
      missingCount:r.missingCount,
      missingCells:[...r.missingCells],
      events,
    });
  }

  return {
    schema:'connect4.cpcx.universal-debt-repair.v0_1',
    exact:true,
    decisionIndex,
    attacker,
    defender,
    prefix,
    requiredResponseCell,
    deviationFrontier:deviations,
    terminalDeviationCells,
    firstWinGuardPassed:terminalDeviationCells.length===0,
    repairLegalAtDecision,
    repair:{
      cell:requiredResponseCell,
      owner:attacker,
      sameOwnerVerticalSeamWithTrigger:true,
      triggerCell:contract.anchoredLine.triggerCells[decisionIndex],
    },
    guaranteedResiduals,
    proofRule:'missingCells intersect deviationFrontier = empty implies survival under every legal non-honored reply; no reply branch is selected',
    choiceEnumeration:false,
    forcingCertified:false,
    boundary:'guaranteed residual survival and event-rank invariance are exact; projected owners and eventual completion remain guarded',
  };
}

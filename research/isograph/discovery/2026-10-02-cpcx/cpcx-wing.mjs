// CPCX disjoint-wing attack contract.
//
// Starting from a position with a qualified pair of disjoint synchronized
// three-column families, one current action can intersect at most one family.
// The untouched family supplies a deterministic 3-trigger / 2-response script.
//
// If both defender responses honor the same-column pair policy, the third
// attacker trigger completes the anchored horizontal Connect Four.  Every
// fixed event is checked for support and first-win precedence.
//
// A deviation does not branch here; it is emitted as a typed debt object for
// the next CPCX algebra layer.

import {cpcxCell,scanCpcxObligations} from './cpcx.mjs';
import {findCpcxDisjointSynchronizedFamilies} from './cpcx-closure.mjs';

function lineCompleted(g,owner,lineId,player){
  const line=g.lines[lineId];
  return line.cells.every(cell=>owner[cell]===player);
}

function completedLineThrough(g,owner,cell,player){
  for(const lineId of g.cellLines[cell])if(lineCompleted(g,owner,lineId,player))return lineId;
  return -1;
}

export function verifyCpcxFixedEventScript(position,events){
  if(!Array.isArray(events))throw new TypeError('events');
  const g=position.geometry,owner=new Int8Array(position.owner),
    heights=new Uint32Array(position.heights),steps=[];
  let terminal=null;

  for(let i=0;i<events.length;i++){
    const e=events[i];
    if(!e||!Number.isInteger(e.cell)||(e.owner!==0&&e.owner!==1))
      throw new TypeError('event');
    if(terminal)return {
      exact:true,
      legal:false,
      reason:'EVENT_AFTER_TERMINAL',
      terminal,
      steps,
    };
    const {column,row}=cpcxCell(g,e.cell);
    if(row!==heights[column]||owner[e.cell]!==-1)return {
      exact:true,
      legal:false,
      reason:'SUPPORT_OR_OCCUPANCY_FAILURE',
      failedEvent:e,
      steps,
    };
    owner[e.cell]=e.owner;heights[column]=row+1;
    const lineId=completedLineThrough(g,owner,e.cell,e.owner);
    const step={index:i,cell:e.cell,owner:e.owner,column,row,terminalLineId:lineId};
    steps.push(step);
    if(lineId>=0)terminal={index:i,player:e.owner,lineId,cell:e.cell};
  }

  return {
    exact:true,
    legal:true,
    terminal,
    steps,
    finalOwner:owner,
    finalHeights:heights,
  };
}

function chooseSurvivingFamily(pair,actionColumn){
  const hitA=(pair.familyA.columnMask&(1<<actionColumn))!==0,
    hitB=(pair.familyB.columnMask&(1<<actionColumn))!==0;
  if(hitA&&hitB)return null;
  if(hitA&&!hitB)return pair.familyB;
  if(hitB&&!hitA)return pair.familyA;
  return pair.familyA.columnMask<pair.familyB.columnMask?pair.familyA:pair.familyB;
}

export function compileCpcxPostActionWingAttack(position,{
  actionCell,
  actionOwner=position.mover,
  attacker=actionOwner^1,
}={}){
  if(actionOwner!==0&&actionOwner!==1)throw new RangeError('actionOwner');
  if(attacker!==(actionOwner^1))throw new RangeError('attacker');
  const g=position.geometry,{column:actionColumn,row:actionRow}=cpcxCell(g,actionCell);
  if(actionRow!==position.heights[actionColumn]||position.owner[actionCell]!==-1)
    throw new RangeError('action is not current legal frontier');

  const pair=findCpcxDisjointSynchronizedFamilies(scanCpcxObligations(position),{minLevels:3})
    .find(x=>x.player===attacker&&x.orientation==='H'&&x.missingCount===3);
  if(!pair)return {
    kind:'NO_DISJOINT_WING_FAMILY',
    exact:false,
  };
  const family=chooseSurvivingFamily(pair,actionColumn);
  if(!family)return {
    kind:'ACTION_INTERSECTS_BOTH_FAMILIES',
    exact:false,
  };
  const bottom=family.levels.find(x=>x.supportDistance===0);
  if(!bottom)return {
    kind:'NO_PLAYABLE_BOTTOM_LEVEL',
    exact:false,
  };

  const line=g.lines.find(L=>L.id===Number(bottom.obligationId.split(':l')[1]));
  if(!line)throw new Error('line provenance missing');
  const anchorCells=line.cells.filter(cell=>!bottom.missingCells.includes(cell));
  if(anchorCells.length!==1||position.owner[anchorCells[0]]!==attacker)
    throw new Error('anchored line premise failed');

  const anchorColumn=cpcxCell(g,anchorCells[0]).column,
    triggers=[...bottom.missingCells].sort((a,b)=>{
      const ca=cpcxCell(g,a).column,cb=cpcxCell(g,b).column,
        da=Math.abs(ca-anchorColumn),db=Math.abs(cb-anchorColumn);
      return db-da||ca-cb;
    }),
    responses=triggers.map(cell=>cell+g.columns);
  for(let i=0;i<triggers.length;i++){
    const t=cpcxCell(g,triggers[i]),r=cpcxCell(g,responses[i]);
    if(r.column!==t.column||r.row!==t.row+1)throw new Error('response geometry');
  }

  const fixedEvents=[
    {cell:actionCell,owner:actionOwner,role:'SIXTH_ACTION'},
    {cell:triggers[0],owner:attacker,role:'TRIGGER_1'},
    {cell:responses[0],owner:actionOwner,role:'HONORED_RESPONSE_1'},
    {cell:triggers[1],owner:attacker,role:'TRIGGER_2'},
    {cell:responses[1],owner:actionOwner,role:'HONORED_RESPONSE_2'},
    {cell:triggers[2],owner:attacker,role:'TRIGGER_3'},
  ];
  const verification=verifyCpcxFixedEventScript(position,fixedEvents),
    expectedTerminalIndex=5,
    honoredPathWin=verification.legal&&
      verification.terminal?.index===expectedTerminalIndex&&
      verification.terminal.player===attacker&&
      verification.terminal.lineId===line.id;

  return {
    kind:'THREE_TRIGGER_WING_ATTACK',
    exact:true,
    boardColumns:g.columns,
    action:{cell:actionCell,column:actionColumn,owner:actionOwner},
    attacker,
    survivingFamily:{
      columns:[...family.columns],
      levels:family.levels,
    },
    anchoredLine:{
      lineId:line.id,
      triggerOrder:'OUTER_TO_ANCHOR_REFLECTION_CANONICAL',
      lineCells:[...line.cells],
      anchorCell:anchorCells[0],
      triggerCells:triggers,
      requiredResponseCells:responses,
    },
    honoredPath:{
      fixedEvents,
      verification:{
        legal:verification.legal,
        terminal:verification.terminal,
        steps:verification.steps,
      },
      terminalOnThirdTrigger:honoredPathWin,
      exact:honoredPathWin,
    },
    deviationContract:{
      defenderDecisionPoints:2,
      rule:'at either response point, any legal reply other than the required same-column response creates explicit pair debt',
      forcingCertified:false,
    },
    proofBoundary:'all-honored response path is exact; arbitrary deviation debt remains unresolved',
  };
}

export function classifyCpcxWingDeviation(contract,{decisionIndex,actualReplyCell}={}){
  if(contract.kind!=='THREE_TRIGGER_WING_ATTACK')throw new TypeError('wing contract');
  if(decisionIndex!==0&&decisionIndex!==1)throw new RangeError('decisionIndex');
  const required=contract.anchoredLine.requiredResponseCells[decisionIndex],
    trigger=contract.anchoredLine.triggerCells[decisionIndex];
  if(actualReplyCell===required)return {
    kind:'HONORED_RESPONSE',
    exact:true,
    decisionIndex,
    triggerCell:trigger,
    responseCell:required,
    debt:null,
  };

  const remainingTriggers=contract.anchoredLine.triggerCells.slice(decisionIndex+1),
    stealsFutureTrigger=remainingTriggers.includes(actualReplyCell),
    actualReplyColumn=actualReplyCell===null||actualReplyCell===undefined
      ?null
      :actualReplyCell%contract.boardColumns,
    inSurvivingWing=actualReplyColumn!==null&&contract.survivingFamily.columns.includes(actualReplyColumn);
  return {
    kind:stealsFutureTrigger?'TRIGGER_STOLEN_DEBT':'PAIR_DEVIATION_DEBT',
    exact:true,
    decisionIndex,
    triggerCell:trigger,
    requiredResponseCell:required,
    actualReplyCell:actualReplyCell??null,
    actualReplyColumn,
    inSurvivingWing,
    stealsFutureTrigger,
    debt:{
      triggerCell:trigger,
      requiredResponseCell:required,
      stolenTriggerCell:stealsFutureTrigger?actualReplyCell:null,
      parityDelta:1,
    },
    forcingCertified:false,
  };
}


export function certifyCpcxSecondWingDeviation(position,contract,{actualReplyCell}={}){
  if(contract?.kind!=='THREE_TRIGGER_WING_ATTACK')
    throw new TypeError('wing contract');
  if(!Number.isInteger(actualReplyCell))throw new RangeError('actualReplyCell');

  const attacker=contract.attacker,defender=contract.action.owner,
    decisionIndex=1,
    deviation=classifyCpcxWingDeviation(contract,{decisionIndex,actualReplyCell});

  if(deviation.kind==='HONORED_RESPONSE')return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'SECOND_WING_RESPONSE_HONORED',
    deviation,
  };
  if(deviation.stealsFutureTrigger)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'FINAL_WING_TRIGGER_STOLEN',
    deviation,
  };

  const triggers=contract.anchoredLine.triggerCells,
    responses=contract.anchoredLine.requiredResponseCells,
    events=[
      {cell:contract.action.cell,owner:defender,role:'INITIAL_DEFENDER_ACTION'},
      {cell:triggers[0],owner:attacker,role:'TRIGGER_1'},
      {cell:responses[0],owner:defender,role:'HONORED_RESPONSE_1'},
      {cell:triggers[1],owner:attacker,role:'TRIGGER_2'},
      {cell:actualReplyCell,owner:defender,role:'SECOND_DEVIATION'},
      {cell:triggers[2],owner:attacker,role:'FINAL_TRIGGER'},
    ],
    verification=verifyCpcxFixedEventScript(position,events);

  if(verification.terminal?.player===defender)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'DEFENDER_TERMINAL_ON_SECOND_DEVIATION',
    deviation,
    verification:{
      legal:verification.legal,
      terminal:verification.terminal,
      steps:verification.steps,
    },
  };
  if(!verification.legal)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'SECOND_DEVIATION_SCRIPT_NOT_LEGAL',
    deviation,
    verification:{
      legal:false,
      reason:verification.reason,
      failedEvent:verification.failedEvent??null,
      terminal:verification.terminal,
      steps:verification.steps,
    },
  };

  const terminal=verification.terminal,
    expectedIndex=events.length-1;
  if(
    terminal?.index!==expectedIndex||
    terminal.player!==attacker||
    terminal.lineId!==contract.anchoredLine.lineId
  )return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'FINAL_TRIGGER_NOT_FIRST_TERMINAL',
    deviation,
    verification:{
      legal:true,
      terminal,
      steps:verification.steps,
    },
  };

  return {
    schema:'connect4.cpcx.second-wing-deviation.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    defender,
    decisionIndex,
    deviationCell:actualReplyCell,
    finalTriggerCell:triggers[2],
    anchoredLineId:contract.anchoredLine.lineId,
    deviation,
    verification:{
      legal:true,
      terminal,
      steps:verification.steps,
    },
    proofRule:'after trigger 1 is honored and trigger 2 is played, any legal second defender deviation that does not occupy trigger 3 leaves trigger 3 legal; trigger 3 completes the anchored line before any defender terminal',
    choiceEnumeration:false,
    recursive:false,
  };
}

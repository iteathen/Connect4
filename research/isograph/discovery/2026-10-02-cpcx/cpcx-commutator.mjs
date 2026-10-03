// CPCX guarded external-event commutator.
//
// Composition theorem only:
//   x ; M ; y   <->   y ; M ; x
//
// M must already be an exact CPCX macro certificate. This module does not
// discover or prove M's strategic forcing status. It proves only that two
// explicitly guarded event orderings reach the same exact nonterminal physical
// successor and the same protected residual cofactor state.
//
// No legal-move tree, W/D/L label, solved table, or recursive continuation is
// consumed.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  createCpcxResidualCarrier,
  compileCpcxResidualEventChain,
} from './cpcx-residual.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';

function uniqueSorted(values){
  return [...new Set(values)].sort((a,b)=>a-b);
}

function validEvent(event){
  return event&&Number.isInteger(event.cell)&&
    (event.owner===0||event.owner===1);
}

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.guarded-external-event-commutator.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    choiceEnumeration:false,
    recursive:false,
    gameTreeTraversal:false,
  };
}

function currentFrontier(position,cell){
  const {column,row}=cpcxCell(position.geometry,cell);
  return row<position.geometry.rows&&
    row===position.heights[column]&&
    position.owner[cell]===-1;
}

function ownerPatternExact(position,events){
  for(let i=0;i<events.length;i++)
    if(events[i].owner!==(position.mover^(i&1)))return false;
  return true;
}

function sameArray(a,b){
  if(a.length!==b.length)return false;
  for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;
  return true;
}

function residualRows(residuals){
  return residuals.map(r=>({
    player:r.player,
    lineId:r.lineId,
    orientation:r.orientation,
    missingCells:[...r.missingCells].sort((a,b)=>a-b),
  })).sort((a,b)=>
    a.player-b.player||
    a.lineId-b.lineId||
    a.orientation.localeCompare(b.orientation)||
    a.missingCells.join(',').localeCompare(b.missingCells.join(','))
  );
}

function residualKey(residuals){
  return JSON.stringify(residualRows(residuals));
}

function terminalSummary(verification){
  const t=verification?.terminal;
  return t?{
    index:t.index,
    player:t.player,
    lineId:t.lineId,
    cell:t.cell,
  }:null;
}

function firstWinFailure(a,b){
  const ta=terminalSummary(a),tb=terminalSummary(b);
  if(!ta&&!tb)return null;
  if(JSON.stringify(ta)!==JSON.stringify(tb))
    return 'FIRST_TERMINAL_PRECEDENCE_DIFFERS';
  return 'FIRST_WIN_STOPPING_ACTIVE';
}

function physicalSuccessor(position,verification,eventCount){
  return {
    rank:position.rank+eventCount,
    mover:position.mover^(eventCount&1),
    heights:Array.from(verification.finalHeights),
    owner:Array.from(verification.finalOwner),
    terminal:null,
  };
}

function premiseMissingCells(macro){
  const out=[];
  for(const r of macro.premiseResiduals??[]){
    if(!r||!Array.isArray(r.missingCells))
      throw new TypeError('macro premise residual');
    for(const cell of r.missingCells)out.push(cell);
  }
  return uniqueSorted(out);
}

export function certifyCpcxGuardedExternalEventCommutator(position,{
  x,
  y,
  macro,
  protectedObligations=scanCpcxObligations(position),
}={}){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!validEvent(x)||!validEvent(y))throw new TypeError('external events');
  if(!macro||macro.exact!==true||!Array.isArray(macro.events))
    return fail('MACRO_NOT_EXACT');
  if(!macro.events.length)return fail('EMPTY_MACRO_BRIDGE');
  if(macro.events.some(e=>!validEvent(e)))throw new TypeError('macro event');
  if(!Array.isArray(macro.loadBearingCells))
    return fail('LOAD_BEARING_DECLARATION_REQUIRED');
  if(!Array.isArray(macro.supportPrerequisiteCells??[]))
    throw new TypeError('macro support prerequisites');
  if(!Array.isArray(macro.premiseResiduals??[]))
    throw new TypeError('macro premise residuals');
  if(!Array.isArray(protectedObligations))
    throw new TypeError('protected obligations');

  if(x.cell===y.cell)return fail('EXTERNAL_EVENTS_NOT_DISTINCT');

  const gx=cpcxCell(position.geometry,x.cell),
    gy=cpcxCell(position.geometry,y.cell);

  if(!currentFrontier(position,x.cell)||!currentFrontier(position,y.cell))
    return fail('EXTERNAL_NOT_CURRENT_FRONTIER',{
      xCurrentFrontier:currentFrontier(position,x.cell),
      yCurrentFrontier:currentFrontier(position,y.cell),
    });

  if(gx.column===gy.column)
    return fail('EXTERNAL_SUPPORT_DEPENDENCY_SAME_COLUMN');

  const bridgeCells=macro.events.map(e=>e.cell),
    bridgeColumns=uniqueSorted(bridgeCells.map(cell=>
      cpcxCell(position.geometry,cell).column
    )),
    externalColumns=new Set([gx.column,gy.column]);

  if(bridgeColumns.some(column=>externalColumns.has(column)))
    return fail('EXTERNAL_INTERSECTS_MACRO_SUPPORT_COLUMN',{
      externalColumns:[gx.column,gy.column],
      bridgeColumns,
    });

  const loadBearing=uniqueSorted(macro.loadBearingCells);
  if(bridgeCells.some(cell=>!loadBearing.includes(cell)))
    return fail('INCOMPLETE_LOAD_BEARING_DECLARATION',{
      missingBridgeCells:uniqueSorted(
        bridgeCells.filter(cell=>!loadBearing.includes(cell))
      ),
    });
  if(loadBearing.includes(x.cell)||loadBearing.includes(y.cell))
    return fail('EXTERNAL_INTERSECTS_LOAD_BEARING_CELL');

  const supportPrerequisites=uniqueSorted(macro.supportPrerequisiteCells??[]);
  if(supportPrerequisites.includes(x.cell)||supportPrerequisites.includes(y.cell))
    return fail('EXTERNAL_INTERSECTS_SUPPORT_PREREQUISITE');

  const premiseCells=premiseMissingCells(macro);
  if(premiseCells.includes(x.cell)||premiseCells.includes(y.cell))
    return fail('EXTERNAL_ALTERS_MACRO_PREMISE_RESIDUAL');

  const bridgeVerification=verifyCpcxFixedEventScript(position,macro.events);
  if(!bridgeVerification.legal)
    return fail('MACRO_BRIDGE_NOT_SUPPORT_INDEPENDENT',{
      bridgeReason:bridgeVerification.reason??null,
      bridgeTerminal:terminalSummary(bridgeVerification),
    });
  if(bridgeVerification.terminal)
    return fail('MACRO_BRIDGE_TERMINAL',{
      bridgeTerminal:terminalSummary(bridgeVerification),
    });

  const aEvents=[x,...macro.events,y],
    bEvents=[y,...macro.events,x];
  if(!ownerPatternExact(position,aEvents)||!ownerPatternExact(position,bEvents))
    return fail('TURN_PATTERN_NOT_PRESERVED',{
      aOwners:aEvents.map(e=>e.owner),
      bOwners:bEvents.map(e=>e.owner),
      sourceMover:position.mover,
    });

  const carrier=createCpcxResidualCarrier(position,protectedObligations),
    cofactorA=compileCpcxResidualEventChain(carrier,aEvents),
    cofactorB=compileCpcxResidualEventChain(carrier,bEvents),
    protectedKeyA=residualKey(cofactorA.residuals),
    protectedKeyB=residualKey(cofactorB.residuals);

  if(protectedKeyA!==protectedKeyB)
    return fail('PROTECTED_RESIDUAL_COFACTORS_DO_NOT_COMMUTE',{
      protectedResidualA:residualRows(cofactorA.residuals),
      protectedResidualB:residualRows(cofactorB.residuals),
    });

  const verificationA=verifyCpcxFixedEventScript(position,aEvents),
    verificationB=verifyCpcxFixedEventScript(position,bEvents),
    firstWinSeam=firstWinFailure(verificationA,verificationB);

  if(firstWinSeam)return fail(firstWinSeam,{
    terminalA:terminalSummary(verificationA),
    terminalB:terminalSummary(verificationB),
    legalA:verificationA.legal,
    legalB:verificationB.legal,
  });

  if(!verificationA.legal||!verificationB.legal)
    return fail('ORDERING_NOT_LEGAL',{
      legalA:verificationA.legal,
      legalB:verificationB.legal,
      reasonA:verificationA.reason??null,
      reasonB:verificationB.reason??null,
    });

  if(!sameArray(verificationA.finalHeights,verificationB.finalHeights)||
     !sameArray(verificationA.finalOwner,verificationB.finalOwner))
    return fail('PHYSICAL_SUCCESSORS_DIFFER');

  const successor=physicalSuccessor(position,verificationA,aEvents.length);

  return {
    schema:'connect4.cpcx.guarded-external-event-commutator.v0_1',
    kind:'EXACT_EXTERNAL_EVENT_COMMUTATION',
    exact:true,
    sourceRank:position.rank,
    sourceMover:position.mover,
    x:{cell:x.cell,owner:x.owner,column:gx.column},
    y:{cell:y.cell,owner:y.owner,column:gy.column},
    macro:{
      kind:macro.kind??null,
      eventCount:macro.events.length,
      events:macro.events.map(e=>({cell:e.cell,owner:e.owner})),
      loadBearingCells:loadBearing,
      supportPrerequisiteCells:supportPrerequisites,
      premiseResidualCount:(macro.premiseResiduals??[]).length,
    },
    correspondence:{
      kind:'LOCAL_EVENT_TRANSPOSITION',
      globalColumnPermutationRequired:false,
      orderingA:aEvents.map(e=>({cell:e.cell,owner:e.owner})),
      orderingB:bEvents.map(e=>({cell:e.cell,owner:e.owner})),
      fixedBridgeRange:[1,macro.events.length],
    },
    successor,
    protectedResidualState:residualRows(cofactorA.residuals),
    observationScope:[
      'geometry',
      'rank',
      'next mover',
      'owner occupancy',
      'support heights',
      'nonterminal first-win status',
      'protected residual cofactors',
    ],
    reusableSuffixBoundary:'only separately certified deterministic suffixes whose premises depend on this preserved exact successor observation may be transported',
    proofRule:'column-local support independence + explicit macro load-bearing exclusion + protected residual cofactor commutation + exact two-order first-win audit imply identical nonterminal physical successor',
    complexity:'O((macroEventCount + 2) * (lineIncidence + protectedResidualCount * maxMissing)); maxMissing<=4 on CPCX residual carriers',
    choiceEnumeration:false,
    recursive:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

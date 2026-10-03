import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {
  canonicalizeCpcxExactReflection,
  projectCpcxControlState,
} from './cpcx-control-quotient.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function stableKey(value){return JSON.stringify(value);}

function groupRows(rows,keyFn){
  const map=new Map();
  for(const row of rows){
    const key=keyFn(row);
    if(!map.has(key))map.set(key,[]);
    map.get(key).push(row.sixthMove);
  }
  return [...map.entries()]
    .map(([key,moves])=>({key,moves}))
    .sort((a,b)=>a.moves[0]-b.moves[0]);
}

function fieldClasses(rows,field){
  const groups=groupRows(rows,row=>stableKey(row.projection[field]));
  return {
    field,
    classCount:groups.length,
    classes:groups.map(x=>x.moves),
  };
}

const rows=[];
for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    child=applyCpcxForcedEvent(root,actionCell),
    exact=canonicalizeCpcxExactReflection(child),
    projection=projectCpcxControlState(child,{attacker:0}),
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    }),
    repairs=[0,1].map(decisionIndex=>
      deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex})
    );

  rows.push({
    sixthMove:column+1,
    actionCell:label(actionCell),
    actionRow:cpcxCell(g,actionCell).row+1,
    rank:child.rank,
    mover:child.mover,
    support:Array.from(child.heights),
    exactReflection:{
      reflected:exact.reflected,
      key:exact.key,
    },
    projection,
    wingFacts:{
      kind:wing.kind,
      survivingWing:wing.survivingFamily?.columns?.map(x=>x+1)??null,
      levelCount:wing.survivingFamily?.levels?.length??null,
      honoredPathExact:wing.honoredPath?.exact??false,
      terminalOnThirdTrigger:wing.honoredPath?.terminalOnThirdTrigger??false,
      triggerCount:wing.anchoredLine?.triggerCells?.length??null,
      decision0:{
        firstWinGuardPassed:repairs[0].firstWinGuardPassed,
        postRepairFirstWinGuardPassed:repairs[0].postRepairFirstWinGuardPassed,
        repairLegalAtDecision:repairs[0].repairLegalAtDecision,
        guaranteedPairCount:repairs[0].guaranteedResiduals
          .filter(x=>x.missingCount===2).length,
      },
      decision1:{
        firstWinGuardPassed:repairs[1].firstWinGuardPassed,
        postRepairFirstWinGuardPassed:repairs[1].postRepairFirstWinGuardPassed,
        repairLegalAtDecision:repairs[1].repairLegalAtDecision,
        guaranteedPairCount:repairs[1].guaranteedResiduals
          .filter(x=>x.missingCount===2).length,
      },
    },
  });
}

const exactClasses=groupRows(rows,row=>row.exactReflection.key),
  projectionClasses=groupRows(rows,row=>row.projection.key),
  fields=[
    'moverRole',
    'terminalRole',
    'immediateKind',
    'columnProfileMultiset',
    'residualProfile',
    'projectionLadders',
    'disjointFamilies',
  ].map(field=>fieldClasses(rows,field)),
  wingFactClasses=groupRows(rows,row=>stableKey({
    kind:row.wingFacts.kind,
    levelCount:row.wingFacts.levelCount,
    honoredPathExact:row.wingFacts.honoredPathExact,
    terminalOnThirdTrigger:row.wingFacts.terminalOnThirdTrigger,
    triggerCount:row.wingFacts.triggerCount,
    decision0:row.wingFacts.decision0,
    decision1:row.wingFacts.decision1,
  }));

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.control-quotient-discovery.v0_1',
  root:'44444',
  rows,
  authoritative:{
    equivalence:'EXACT_HORIZONTAL_REFLECTION_ONLY',
    classCount:exactClasses.length,
    classes:exactClasses.map(x=>x.moves),
    certificateTransportAuthorized:true,
  },
  discoveryProjection:{
    classCount:projectionClasses.length,
    classes:projectionClasses.map(x=>x.moves),
    certificateTransportAuthorized:false,
    fieldClasses:fields,
    erasedInformation:rows[0].projection.erasedInformation,
  },
  sharedWingControlFacts:{
    classCount:wingFactClasses.length,
    classes:wingFactClasses.map(x=>x.moves),
    note:'these common facts are exact observations, but they are not by themselves a sufficient control-state congruence',
  },
  conclusionBoundary:{
    allSevenExactEquivalent:exactClasses.length===1,
    allSevenLossyProjectionEqual:projectionClasses.length===1,
    allSevenShareWingControlFacts:wingFactClasses.length===1,
    proofRule:'only exact reflection classes are presently authorized for proof reuse; any coarser merge requires a transition-congruence theorem preserving first-win precedence and all admitted CPCX responses',
  },
  premises:{
    standardBoard:'7x6',
    targetSpecificDiagnostic:true,
    genericQuotientModule:'cpcx-control-quotient.mjs',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

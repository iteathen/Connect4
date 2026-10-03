import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {collapseCpcxDebtRepairTokenProduct} from './cpcx-token-collapse.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function continuingClasses(successor){
  return (successor.classes??[]).filter(x=>
    x.result==='VERTICAL_MACRO_CONTINUES'
  );
}

function componentLowerBound(component){
  return (
    component.opponentSingletonEnvelope??
    component.firstWinFacts?.opponentSingletonEnvelope
  )?.defenderEarliestTerminalLowerBound??null;
}

function componentSummary(component,sourceClass,index){
  const envelope=component.opponentSingletonEnvelope??
    component.firstWinFacts?.opponentSingletonEnvelope??null;
  return {
    componentIndex:index,
    deviationClass:sourceClass?.deviationClass??null,
    deviationCells:sourceClass?.deviationCells??[],
    hazardCells:sourceClass?.hazardCells??[],
    safeResponseCells:sourceClass?.safeResponseCells??[],
    verticalKind:sourceClass?.verticalKind??null,
    rankOptions:[...(component.rank?.options??[])],
    nextMover:component.nextMover??null,
    opponentEarliestTerminalLowerBound:componentLowerBound(component),
    opponentSingletonEnvelope:envelope?{
      exact:envelope.exact??false,
      possibleCells:[...(envelope.possibleCells??[])],
      guaranteedCells:[...(envelope.guaranteedCells??[])],
      normalizationClosed:envelope.normalizationClosed??false,
    }:null,
    opponentResidualPossibleCount:
      component.opponentResidualEnvelope?.possibleResiduals?.length??
      component.firstWinFacts?.opponentResidualEnvelope?.possibleResiduals?.length??
      null,
    guaranteedResidualCount:component.guaranteedResiduals?.length??null,
    blockerTokenCount:component.blockerTokens?.length??0,
    supportEnvelopeVectorCount:component.supportEnvelope?.vectors?.length??null,
    sourceKind:component.source?.kind??null,
    certificateKind:component.source?.certificateKind??null,
    concrete:Boolean(component.concretePosition),
  };
}

const rows=[];

for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    }),
    repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex:0}),
    successor=collapseCpcxDebtRepairTokenProduct(
      root,wing,repair,{retainComponents:true}
    );

  if(successor.kind==='CERTIFIED_FIRST_WIN'){
    rows.push({
      sixthMove:column+1,
      successorKind:successor.kind,
      componentCount:0,
      components:[],
    });
    continue;
  }
  if(!successor.exact||successor.kind!=='ABSTRACT_SUCCESSOR')
    throw new Error('expected exact abstract successor');

  const classes=continuingClasses(successor),
    components=successor.componentCarriers??[];
  if(classes.length!==components.length)
    throw new Error('component/class provenance length mismatch');

  rows.push({
    sixthMove:column+1,
    successorKind:successor.kind,
    mergedOpponentEarliestTerminalLowerBound:
      successor.firstWinFacts?.opponentEarliestTerminalLowerBound??null,
    componentCount:components.length,
    components:components.map((c,i)=>componentSummary(c,classes[i],i)),
  });
}

const lowerTwo=[];
for(const row of rows)for(const component of row.components)
  if(component.opponentEarliestTerminalLowerBound===2)
    lowerTwo.push({sixthMove:row.sixthMove,...component});

const sourceTypeCounts={};
for(const row of lowerTwo){
  const key=row.deviationClass??'UNKNOWN';
  sourceTypeCounts[key]=(sourceTypeCounts[key]??0)+1;
}

const byMove={};
for(const row of rows){
  const finite=row.components
    .map(x=>x.opponentEarliestTerminalLowerBound)
    .filter(Number.isInteger);
  const histogram={};
  for(const x of finite)histogram[String(x)]=(histogram[String(x)]??0)+1;
  byMove[String(row.sixthMove)]={
    mergedOpponentEarliestTerminalLowerBound:
      row.mergedOpponentEarliestTerminalLowerBound??null,
    componentCount:row.componentCount,
    finiteComponentHorizonCount:finite.length,
    minimumComponentHorizon:finite.length?Math.min(...finite):null,
    horizonHistogram:histogram,
    lowerTwoComponentCount:row.components.filter(x=>
      x.opponentEarliestTerminalLowerBound===2
    ).length,
  };
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.collapse-component-horizons.v0_1',
  root:'44444',
  stage:'FIRST_DEVIATION_TOKEN_CLASS_COLLAPSE_RETAINED_COMPONENTS',
  rows,
  lowerTwoComponents:lowerTwo,
  summary:{
    byMove,
    totalComponentCount:rows.reduce((n,x)=>n+x.componentCount,0),
    lowerTwoComponentCount:lowerTwo.length,
    lowerTwoMoves:[...new Set(lowerTwo.map(x=>x.sixthMove))].sort((a,b)=>a-b),
    lowerTwoSourceTypeCounts:sourceTypeCounts,
  },
  boundary:{
    diagnosticOnly:true,
    componentCarriersAreExistingTheoremOutputs:true,
    noOpponentResidualDeletionAuthorized:true,
    noDeadlineStrengtheningPromoted:true,
    bestSetNotProven:true,
  },
  premises:{
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    futureTreeGeneration:false,
    decisionIndex:0,
    source:'existing universal debt repair + token-class vertical safe-set/hazard collapse',
  },
},null,2));

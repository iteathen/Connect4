import {createCpcxGeometry,buildCpcxPosition,cpcxCell} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {collapseCpcxDebtRepairTokenProduct} from './cpcx-token-collapse.mjs';
import {classifyCpcxSuccessor} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function progressSummary(progress){
  return {
    kind:progress.kind,
    exact:progress.exact??false,
    player:progress.player??null,
    seam:progress.seam??null,
    source:progress.source??null,
    macro:progress.macro?{
      kind:progress.macro.kind,
      primaryCell:label(progress.macro.primaryCell),
      secondaryCell:label(progress.macro.secondaryCell),
      lineId:progress.macro.lineId,
      certificateKind:progress.macro.certificate?.kind??null,
    }:null,
    blockingCells:progress.obligation?.blockingCells?.map(label)??null,
  };
}

function carrierSummary(carrier){
  const progress=carrier.exact
    ?classifyCpcxSuccessor(carrier,{attacker:0})
    :{kind:'NO_CERTIFICATE',exact:false,seam:carrier.seam??carrier.kind};
  return {
    kind:carrier.kind,
    exact:carrier.exact??false,
    concrete:!!carrier.concretePosition,
    rank:carrier.rank??null,
    nextMover:carrier.nextMover??carrier.concretePosition?.mover??null,
    residualCount:carrier.guaranteedResiduals?.length??null,
    blockerTokens:(carrier.blockerTokens??[]).map(t=>({
      owner:t.owner,
      maxCount:t.maxCount??null,
      exactCount:t.exactCount??null,
      candidates:(t.candidateCells??[]).map(label),
      directKillCapacity:t.directKillCapacity??null,
      supportOnly:t.supportOnly??null,
    })),
    opponentSingletonEnvelope:carrier.opponentSingletonEnvelope??carrier.firstWinFacts?.opponentSingletonEnvelope??null,
    source:carrier.source??null,
    nextProgress:progressSummary(progress),
  };
}

const rows=[];
for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,actionOwner:1,attacker:0,
    }),
    decisions=[];
  for(let decisionIndex=0;decisionIndex<=1;decisionIndex++){
    const repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex}),
      collapse=collapseCpcxDebtRepairTokenProduct(
        root,wing,repair,{retainComponents:true}
      );
    decisions.push({
      decisionIndex,
      collapseKind:collapse.kind,
      collapseSeam:collapse.seam??null,
      componentCount:collapse.componentCarriers?.length??0,
      components:(collapse.componentCarriers??[]).map(carrierSummary),
    });
  }
  rows.push({
    sixthMove:column+1,
    actionCell:label(actionCell),
    survivingWing:wing.survivingFamily.columns.map(x=>x+1),
    triggerOrder:wing.anchoredLine.triggerCells.map(label),
    decisions,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6-component-progress.v0_1',
  root:'44444',
  rows,
  premises:{
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    componentsAreTheoremDerived:true,
  },
},null,2));

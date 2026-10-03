import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';

const g=createCpcxGeometry(),
  center=3,
  centerTop=(g.rows-1)*g.columns+center,
  root='44444';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function ownerWord(P,column){
  return Array.from({length:g.rows},(_,row)=>
    P.owner[row*g.columns+column]
  );
}
function sideProjectionEmpty(P){
  for(let c=0;c<g.columns;c++){
    if(c===center)continue;
    if(P.heights[c]!==0)return false;
    for(let r=0;r<g.rows;r++)
      if(P.owner[r*g.columns+c]!==-1)return false;
  }
  return true;
}
function lineOwnerSignature(P,line){
  return line.cells.map(cell=>P.owner[cell]+1).join('');
}
function linesIncidentToCells(cells){
  const S=new Set(cells);
  return g.lines.filter(line=>line.cells.some(cell=>S.has(cell)));
}
function residualSummary(P,player){
  const rows=scanCpcxObligations(P).filter(o=>o.player===player);
  return {
    liveLineCount:rows.length,
    missingCountHistogram:Object.fromEntries(
      [...new Set(rows.map(o=>o.missingCount))].sort((a,b)=>a-b)
        .map(k=>[k,rows.filter(o=>o.missingCount===k).length])
    ),
    playableResidualCount:rows.filter(o=>
      o.currentlyPlayableCells.length>0
    ).length,
  };
}
function centerBoundaryClasses(P){
  const rows=[];
  for(const line of g.lines){
    const centerCells=line.cells.filter(cell=>cpcxCell(g,cell).column===center);
    if(!centerCells.length)continue;
    const owners=centerCells.map(cell=>P.owner[cell]);
    let kind='CENTER_MULTI';
    if(centerCells.length===1){
      const cell=centerCells[0],owner=P.owner[cell];
      kind=owner===0?'P0_ANCHOR':owner===1?'P1_ANCHOR':'OPEN_GATE';
      rows.push({
        lineId:line.id,
        orientation:line.orientation,
        centerCell:label(cell),
        centerRow:cpcxCell(g,cell).row+1,
        kind,
      });
    }else{
      const set=new Set(owners.filter(x=>x!==-1));
      rows.push({
        lineId:line.id,
        orientation:line.orientation,
        centerCells:centerCells.map(label),
        kind:set.size>=2?'DEAD_TO_BOTH':'CENTER_MULTI',
      });
    }
  }
  return rows;
}
function exchangeAudit(x){
  const externalFirst=buildCpcxPosition(`${root}${x}4`,{geometry:g}),
    centerFirst=buildCpcxPosition(`${root}4${x}`,{geometry:g}),
    xCell=0*g.columns+(x-1),
    diffCells=[xCell,centerTop],
    diffSet=new Set(diffCells),
    ownerDiff=[];
  if(JSON.stringify(Array.from(externalFirst.heights))!==
     JSON.stringify(Array.from(centerFirst.heights)))
    throw new Error('exchange support mismatch');
  if(externalFirst.mover!==centerFirst.mover)
    throw new Error('exchange mover mismatch');
  for(let cell=0;cell<g.cellCount;cell++)
    if(externalFirst.owner[cell]!==centerFirst.owner[cell])ownerDiff.push(cell);

  const unaffectedLines=g.lines.filter(line=>
    line.cells.every(cell=>!diffSet.has(cell))
  ), affected=linesIncidentToCells(diffCells),
    unaffectedEqual=unaffectedLines.every(line=>
      lineOwnerSignature(externalFirst,line)===
      lineOwnerSignature(centerFirst,line)
    );

  const xOwners=[
    externalFirst.owner[xCell],
    centerFirst.owner[xCell],
  ], centerOwners=[
    externalFirst.owner[centerTop],
    centerFirst.owner[centerTop],
  ];

  return {
    sixthMove:x,
    reflectedMove:8-x,
    externalFirstSequence:`${root}${x}4`,
    centerFirstSequence:`${root}4${x}`,
    supportHeights:Array.from(externalFirst.heights),
    supportIdentical:true,
    moverIdentical:externalFirst.mover===centerFirst.mover,
    differingCells:ownerDiff.map(label),
    differenceExactlyExchangePair:
      ownerDiff.length===2&&
      ownerDiff.every(cell=>diffSet.has(cell)),
    ownershipSwap:{
      externalCell:label(xCell),
      centerGate:label(centerTop),
      externalCellOwners:xOwners,
      centerGateOwners:centerOwners,
      exactSwap:
        xOwners[0]===centerOwners[1]&&
        xOwners[1]===centerOwners[0],
    },
    unaffectedLineCount:unaffectedLines.length,
    affectedLineCount:affected.length,
    allUnaffectedLineOwnerSignaturesEqual:unaffectedEqual,
    externalFirstResiduals:{
      p0:residualSummary(externalFirst,0),
      p1:residualSummary(externalFirst,1),
    },
    centerFirstResiduals:{
      p0:residualSummary(centerFirst,0),
      p1:residualSummary(centerFirst,1),
    },
  };
}

const rank6=[];
for(let x=1;x<=7;x++){
  const P=buildCpcxPosition(`${root}${x}`,{geometry:g}),
    offCenterTokenCount=Array.from(P.heights)
      .filter((_,c)=>c!==center).reduce((a,b)=>a+b,0),
    centerGateOpen=P.heights[center]===g.rows-1&&
      P.owner[centerTop]===-1,
    untouchedSideColumns=Array.from(P.heights)
      .filter((_,c)=>c!==center).filter(h=>h===0).length;
  rank6.push({
    sixthMove:x,
    class:x===4?'CENTER_CLOSURE':'OFFCENTER_DISTURBANCE',
    mover:P.mover,
    heights:Array.from(P.heights),
    centerGateOpen,
    centerTopOwner:P.owner[centerTop],
    offCenterTokenCount,
    untouchedSideColumns,
    gateEqualsDisturbance:
      Number(centerGateOpen)===offCenterTokenCount,
    gatePlusUntouchedSides:
      Number(centerGateOpen)+untouchedSideColumns,
    centerOwnerWord:ownerWord(P,center),
    sideProjectionEmpty:sideProjectionEmpty(P),
    residuals:{
      p0:residualSummary(P,0),
      p1:residualSummary(P,1),
    },
  });
}

const closed=buildCpcxPosition('444444',{geometry:g}),
  empty=buildCpcxPosition('',{geometry:g}),
  centerBoundary=centerBoundaryClasses(closed),
  sideOnlyLines=g.lines.filter(line=>
    line.cells.every(cell=>cpcxCell(g,cell).column!==center)
  ),
  sideOnlyMatchesEmpty=sideOnlyLines.every(line=>
    lineOwnerSignature(closed,line)===lineOwnerSignature(empty,line)
  ),
  singleCenterRows=centerBoundary.filter(x=>x.centerCell),
  centerVertical=centerBoundary.filter(x=>x.centerCells);

const exchangeRows=[1,2,3,5,6,7].map(exchangeAudit);

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.turn6-center-gate-equivalence.v0_1',
  root,
  interpretation:'rank-6 center-gate/external-disturbance dichotomy plus exact two-event support commutation with a two-cell ownership exchange',
  rank6,
  closedCenterBoundary:{
    sequence:'444444',
    mover:closed.mover,
    centerOwnerWord:ownerWord(closed,center),
    sideProjectionEmpty:sideProjectionEmpty(closed),
    sideOnlyLineCount:sideOnlyLines.length,
    sideOnlyLineOwnerSignaturesMatchEmptyBoard:sideOnlyMatchesEmpty,
    singleCenterCrossingRows:{
      p0Anchors:singleCenterRows.filter(x=>x.kind==='P0_ANCHOR')
        .map(x=>x.centerRow),
      p1Anchors:singleCenterRows.filter(x=>x.kind==='P1_ANCHOR')
        .map(x=>x.centerRow),
      openGateRows:singleCenterRows.filter(x=>x.kind==='OPEN_GATE')
        .map(x=>x.centerRow),
    },
    centerVerticalClasses:centerVertical.map(x=>x.kind),
    centerVerticalAllDeadToBoth:centerVertical.every(x=>
      x.kind==='DEAD_TO_BOTH'
    ),
  },
  exchangeRows,
  summary:{
    rank6ClassCount:new Set(rank6.map(x=>x.class)).size,
    centerClosureCount:rank6.filter(x=>x.class==='CENTER_CLOSURE').length,
    offCenterDisturbanceCount:rank6.filter(x=>x.class==='OFFCENTER_DISTURBANCE').length,
    allRank6ReturnMoveToP0:rank6.every(x=>x.mover===0),
    centerGateIffOneExternalDisturbance:rank6.every(x=>
      x.gateEqualsDisturbance
    ),
    gatePlusUntouchedSideColumnsConstant:
      [...new Set(rank6.map(x=>x.gatePlusUntouchedSides))],
    centerClosureLeavesVirginSideSubstrate:
      rank6.find(x=>x.sixthMove===4)?.sideProjectionEmpty===true,
    closedCenterIsAlternatingParitySpine:
      JSON.stringify(ownerWord(closed,center))===
      JSON.stringify([0,1,0,1,0,1]),
    closedCenterCrossingParity:{
      p0Rows:[...new Set(singleCenterRows
        .filter(x=>x.kind==='P0_ANCHOR').map(x=>x.centerRow))].sort((a,b)=>a-b),
      p1Rows:[...new Set(singleCenterRows
        .filter(x=>x.kind==='P1_ANCHOR').map(x=>x.centerRow))].sort((a,b)=>a-b),
    },
    allOffCenterTwoEventOrdersHaveIdenticalSupport:
      exchangeRows.every(x=>x.supportIdentical),
    allOffCenterTwoEventOrdersDifferOnlyByOwnershipExchange:
      exchangeRows.every(x=>
        x.differenceExactlyExchangePair&&
        x.ownershipSwap.exactSwap
      ),
    allLinesOutsideExchangeConeIdentical:
      exchangeRows.every(x=>x.allUnaffectedLineOwnerSignaturesEqual),
  },
  theoremBoundary:{
    exactCurrentRankGeometryOnly:true,
    noSolvedData:true,
    noOracle:true,
    noMinimax:true,
    noRecursiveSearch:true,
    noValueConclusion:true,
    emptyBoardEquivalenceIsClaimRelativeNotPhysical:true,
    reusablePart:'after 444444 the entire off-center support/occupancy projection and every winning line avoiding column D are exactly the empty-board substrate; center-incidence is a fixed parity boundary correction',
    exchangePart:'for x!=4, 44444x4 and 444444x have identical support/mover and differ only by swapping ownership of X1 and D6; every winning line outside those two cells is identical',
  },
},null,2));

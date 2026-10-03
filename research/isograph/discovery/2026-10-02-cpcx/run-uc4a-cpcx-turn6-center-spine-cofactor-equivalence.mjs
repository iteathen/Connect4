import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';

const g=createCpcxGeometry(),center=3,root='44444';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function gaugeOwner(cell){
  const {row}=cpcxCell(g,cell);
  return (g.rows*(g.columns-1)+row)&1;
}
function defectCells(P){
  const out=[];
  for(let cell=0;cell<g.cellCount;cell++){
    const owner=P.owner[cell];
    if(owner!==-1&&owner!==gaugeOwner(cell))out.push(cell);
  }
  return out;
}
function residualRows(P){
  return scanCpcxObligations(P).map(o=>({
    player:o.player,
    lineId:o.lineId,
    orientation:o.orientation,
    missing:[...o.missingCells].sort((a,b)=>a-b),
  })).sort((a,b)=>
    a.player-b.player||
    a.lineId-b.lineId||
    a.missing.join(',').localeCompare(b.missing.join(','))
  );
}
function residualKey(rows){
  return JSON.stringify(rows.map(r=>[
    r.player,r.lineId,r.orientation,r.missing
  ]));
}
function projectedResidualRows(P){
  if(P.heights[center]!==g.rows)
    throw new Error('center column must be saturated');
  return residualRows(P).map(r=>({
    ...r,
    missing:r.missing.filter(cell=>cpcxCell(g,cell).column!==center),
  }));
}
function cofactorStep(rows,eventCell,eventOwner){
  const out=[];
  let completed=false;
  for(const r of rows){
    if(!r.missing.includes(eventCell)){
      out.push({...r,missing:[...r.missing]});
      continue;
    }
    if(r.player!==eventOwner)continue;
    const missing=r.missing.filter(cell=>cell!==eventCell);
    if(!missing.length){
      completed=true;
      continue;
    }
    out.push({...r,missing});
  }
  out.sort((a,b)=>
    a.player-b.player||
    a.lineId-b.lineId||
    a.missing.join(',').localeCompare(b.missing.join(','))
  );
  return {rows:out,completed};
}
function orientationCounts(rows){
  const out={};
  for(const r of rows){
    const key=`${r.player}:${r.orientation}:${r.missing.length}`;
    out[key]=(out[key]??0)+1;
  }
  return out;
}
function sideOnlyLine(line){
  return line.cells.every(cell=>cpcxCell(g,cell).column!==center);
}
function crossingSingleCenter(line){
  return line.cells.filter(cell=>cpcxCell(g,cell).column===center).length===1;
}
function centerCrossingResidualClasses(P){
  const rows=[];
  for(const o of scanCpcxObligations(P)){
    const line=g.lines[o.lineId];
    if(!crossingSingleCenter(line))continue;
    const centerCell=line.cells.find(cell=>
      cpcxCell(g,cell).column===center
    );
    rows.push({
      player:o.player,
      lineId:o.lineId,
      orientation:o.orientation,
      centerCell:label(centerCell),
      centerRow:cpcxCell(g,centerCell).row+1,
      centerOwner:P.owner[centerCell],
      residualSize:o.missingCount,
      sideResidual:o.missingCells.map(label),
    });
  }
  return rows.sort((a,b)=>
    a.player-b.player||
    a.centerRow-b.centerRow||
    a.lineId-b.lineId
  );
}
function ownerDiff(a,b){
  const out=[];
  for(let cell=0;cell<g.cellCount;cell++)
    if(a.owner[cell]!==b.owner[cell])out.push(cell);
  return out;
}
function reflectedCell(cell){
  const {column,row}=cpcxCell(g,cell);
  return row*g.columns+(g.columns-1-column);
}
function lineGeometryKey(cells){
  return [...cells].sort((a,b)=>a-b).join(',');
}
function reflectedOrientation(orientation){
  if(orientation==='D+')return 'D-';
  if(orientation==='D-')return 'D+';
  return orientation;
}
function canonicalResidualRow(r,reflect=false){
  const lineCells=g.lines[r.lineId].cells.map(cell=>
      reflect?reflectedCell(cell):cell
    ).sort((a,b)=>a-b),
    missing=r.missing.map(cell=>
      reflect?reflectedCell(cell):cell
    ).sort((a,b)=>a-b);
  return {
    player:r.player,
    orientation:reflect?reflectedOrientation(r.orientation):r.orientation,
    lineGeometry:lineGeometryKey(lineCells),
    missingGeometry:missing.join(','),
    missingCount:missing.length,
  };
}
function residualRowIdentity(r){
  return JSON.stringify([r.player,r.lineId,r.orientation,r.missing]);
}
function correctionSignature(a,b,{reflect=false}={}){
  const ra=residualRows(a),rb=residualRows(b),
    ka=new Map(ra.map(r=>[residualRowIdentity(r),r])),
    kb=new Map(rb.map(r=>[residualRowIdentity(r),r])),
    onlyA=[...ka.entries()].filter(([k])=>!kb.has(k)).map(([,r])=>r),
    onlyB=[...kb.entries()].filter(([k])=>!ka.has(k)).map(([,r])=>r),
    canonicalOnlyA=onlyA.map(r=>canonicalResidualRow(r,reflect))
      .sort((u,v)=>JSON.stringify(u).localeCompare(JSON.stringify(v))),
    canonicalOnlyB=onlyB.map(r=>canonicalResidualRow(r,reflect))
      .sort((u,v)=>JSON.stringify(u).localeCompare(JSON.stringify(v)));
  return {
    onlyACount:onlyA.length,
    onlyBCount:onlyB.length,
    onlyAOrientationCounts:orientationCounts(onlyA),
    onlyBOrientationCounts:orientationCounts(onlyB),
    symmetricDifferenceCount:onlyA.length+onlyB.length,
    canonicalOnlyA,
    canonicalOnlyB,
    exactCanonicalKey:JSON.stringify({
      onlyA:canonicalOnlyA,
      onlyB:canonicalOnlyB,
    }),
  };
}

const closed=buildCpcxPosition('444444',{geometry:g}),
  empty=buildCpcxPosition('',{geometry:g}),
  closedProjected=projectedResidualRows(closed),
  sideOnly=g.lines.filter(sideOnlyLine),
  crossing=centerCrossingResidualClasses(closed),
  oneStep=[];

for(let c=0;c<g.columns;c++){
  if(c===center||closed.heights[c]>=g.rows)continue;
  const eventCell=closed.heights[c]*g.columns+c,
    child=applyCpcxForcedEvent(closed,eventCell),
    algebra=cofactorStep(closedProjected,eventCell,closed.mover),
    exact=projectedResidualRows(child);
  oneStep.push({
    eventCell:label(eventCell),
    eventOwner:closed.mover,
    quotientTerminal:algebra.completed,
    fullTerminal:child.terminal,
    residualHomomorphism:
      residualKey(algebra.rows)===residualKey(exact),
  });
}

const exchange=[];
for(const x of [1,2,3,5,6,7]){
  const externalFirst=buildCpcxPosition(`${root}${x}4`,{geometry:g}),
    centerFirst=buildCpcxPosition(`${root}4${x}`,{geometry:g}),
    extDefects=defectCells(externalFirst),
    ctrDefects=defectCells(centerFirst),
    diffs=ownerDiff(externalFirst,centerFirst),
    xCell=x-1,
    reflectedRepresentative=x>4,
    correction=correctionSignature(externalFirst,centerFirst,{
      reflect:reflectedRepresentative,
    });
  exchange.push({
    x,
    distanceFromCenter:Math.abs(x-4),
    reflectedRepresentative,
    externalFirstSequence:`${root}${x}4`,
    centerFirstSequence:`${root}4${x}`,
    supportEqual:
      JSON.stringify(Array.from(externalFirst.heights))===
      JSON.stringify(Array.from(centerFirst.heights)),
    externalFirstDefects:extDefects.map(label),
    centerFirstDefects:ctrDefects.map(label),
    expectedDefectPair:[label(xCell),label(5*g.columns+center)],
    externalFirstExactlyTwoGaugeDefects:
      extDefects.length===2&&
      new Set(extDefects).has(xCell)&&
      new Set(extDefects).has(5*g.columns+center),
    centerFirstGaugeAligned:ctrDefects.length===0,
    physicalOwnerDiff:diffs.map(label),
    correction,
  });
}

const reflectionClasses=new Map();
for(const row of exchange){
  const key=String(row.distanceFromCenter);
  if(!reflectionClasses.has(key))reflectionClasses.set(key,[]);
  reflectionClasses.get(key).push(row);
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.turn6-center-spine-cofactor-equivalence.v0_2',
  observation:'exact saturated-center cofactor quotient plus geometry-gauge defect normalization at the turn-6 handoff',
  gauge:{
    formula:'zeroReservationOwner(cell) = row(cell) mod 2 on 7x6',
    closedCenterDefects:defectCells(closed).map(label),
    closedCenterGaugeAligned:defectCells(closed).length===0,
    emptyBoardDefects:defectCells(empty).map(label),
  },
  saturatedCenterQuotient:{
    sequence:'444444',
    sideSupport:Array.from(closed.heights).filter((_,c)=>c!==center),
    sideIsVirgin:Array.from(closed.heights)
      .filter((_,c)=>c!==center).every(h=>h===0),
    sideOnlyOriginalLineCount:sideOnly.length,
    projectedLiveResidualCount:closedProjected.length,
    projectedOrientationCounts:orientationCounts(closedProjected),
    centerCrossingResidualCount:crossing.length,
    centerCrossingResiduals:crossing,
    crossingOwnerParityRule:{
      p0Rows:[...new Set(crossing.filter(x=>x.player===0)
        .map(x=>x.centerRow))].sort((a,b)=>a-b),
      p1Rows:[...new Set(crossing.filter(x=>x.player===1)
        .map(x=>x.centerRow))].sort((a,b)=>a-b),
    },
    oneStepHomomorphism:oneStep,
    everyCurrentSideMovePreservesExactCofactorTransition:
      oneStep.every(x=>x.residualHomomorphism),
  },
  exchange,
  reflectionDefectClasses:[...reflectionClasses.entries()].map(([distance,rows])=>({
    distance:Number(distance),
    moves:rows.map(x=>x.x).sort((a,b)=>a-b),
    correctionSignatures:[...new Map(rows.map(x=>[
      x.correction.exactCanonicalKey,x.correction
    ])).values()],
    oneCorrectionSignatureUpToReflection:
      new Set(rows.map(x=>x.correction.exactCanonicalKey)).size===1,
  })),
  summary:{
    closedCenterIsGaugeAligned:defectCells(closed).length===0,
    closedCenterIsVirginSidePlusStaticCofactor:
      Array.from(closed.heights).filter((_,c)=>c!==center)
        .every(h=>h===0)&&
      oneStep.every(x=>x.residualHomomorphism),
    allCenterFirstOneSideStatesGaugeAligned:
      exchange.every(x=>x.centerFirstGaugeAligned),
    allExternalFirstStatesAreExactlyOneTwoCellGaugeDefect:
      exchange.every(x=>x.externalFirstExactlyTwoGaugeDefects),
    defectPairClassesByReflection:
      [...reflectionClasses.keys()].map(Number).sort((a,b)=>a-b),
    everyDistanceClassHasOneCorrectionSignature:
      [...reflectionClasses.values()].every(rows=>
        new Set(rows.map(x=>x.correction.exactCanonicalKey)).size===1
      ),
  },
  interpretation:{
    baseClass:'a saturated gauge-aligned center may be removed from the live action space and compiled into player-specific residual cofactors on the six side columns',
    parityControl:'center-first produces the gauge vacuum; off-center-first followed by D6 produces the same support substrate plus exactly two owner-gauge defects, x1 and D6',
    constrainedEquivalence:'state identity for this handoff is support + saturated-center cofactor + bounded gauge-defect descriptor, canonicalized under board reflection; raw support alone is insufficient',
    polynomialRoute:'the static cofactor and each defect correction are computed from winning-line incidence; no future reply tree is required',
  },
  theoremBoundary:{
    diagnosticOnly:true,
    oneStepCofactorHomomorphismQualifiedAtClosedCenter:true,
    genericFutureHomomorphismRequiresTheoremization:true,
    defectCorrectionNotYetAContinuationCongruence:true,
    noSolvedData:true,
    noOracle:true,
    noMinimax:true,
    noRecursiveSearch:true,
    noValueConclusion:true,
  },
},null,2));

import {
  createCpcxGeometry,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturation,
} from './cpcx-controller-saturation.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function positionFromClass(cls){
  const [moverText,heightsText,ownerText]=cls.key.split('|'),
    owner=new Int8Array(g.cellCount);
  for(let i=0;i<ownerText.length;i++)owner[i]=Number(ownerText[i])-1;
  return {
    geometry:g,
    moves:new Uint32Array(0),
    rank:cls.rank,
    mover:Number(moverText),
    heights:new Uint32Array(heightsText.split(',').map(Number)),
    owner,
    terminal:null,
  };
}

function targetResidual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine
  )??null;
}

function supportDebt(r){
  return r?.events.reduce((n,e)=>n+e.supportDistance,0)??null;
}

function residualSummary(r){
  if(!r)return null;
  return {
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    orientation:r.orientation,
    missingCount:r.missingCount,
    missing:r.missingCells.map(label),
    support:r.events.map(e=>e.supportDistance),
    supportDebt:supportDebt(r),
    eventParity:r.events.map(e=>e.eventRank&1),
    playable:r.currentlyPlayableCells.map(label),
  };
}

function traceSummary(trace){
  return (trace??[]).map(x=>({
    kind:x.kind,
    iteration:x.iteration??null,
    actionCell:Number.isInteger(x.actionCell)?label(x.actionCell):null,
    selectedTarget:Number.isInteger(x.selectedTarget)?label(x.selectedTarget):null,
    selectedMode:x.selectedMode??null,
    sourceMeasure:x.sourceMeasure??null,
    childMeasure:x.childMeasure??null,
    finalMeasure:x.finalMeasure??null,
    stepCount:x.stepCount??null,
    finalMover:x.finalMover??null,
    boundary:x.boundary?.kind??null,
  }));
}

const rows=[];
for(const cls of artifact.classes){
  const position=positionFromClass(cls),
    R=targetResidual(position),
    sixthMoves=[...new Set(cls.sources.map(s=>s.sixthMove))]
      .sort((a,b)=>a-b);

  if(!R)throw new Error(`universal target residual missing ${cls.classId}`);

  if(position.mover!==0){
    rows.push({
      classId:cls.classId,
      sixthMoves,
      sourceRank:position.rank,
      sourceMover:position.mover,
      sourceSupport:Array.from(position.heights),
      sourceResidual:residualSummary(R),
      result:{
        kind:'P1_TO_MOVE_BOUNDARY',
        exact:true,
        skippedControllerSaturation:true,
      },
    });
    continue;
  }

  const c=certifyCpcxProtectedDiagonalControllerSaturation(position,{
    protectedResidual:R,
  });

  rows.push({
    classId:cls.classId,
    sixthMoves,
    sourceRank:position.rank,
    sourceMover:position.mover,
    sourceSupport:Array.from(position.heights),
    sourceResidual:residualSummary(R),
    result:{
      kind:c.kind,
      exact:c.exact??false,
      seam:c.seam??null,
      player:c.player??null,
      sourceMeasure:c.sourceMeasure??null,
      finalMeasure:c.finalMeasure??null,
      rankDelta:c.rankDelta??null,
      controllerStepCount:c.controllerStepCount??null,
      normalizationPassCount:c.normalizationPassCount??null,
      forcedEventCount:c.forcedEventCount??null,
      finalRank:c.finalRank??null,
      finalMover:c.finalPosition?.mover??null,
      finalSupport:c.finalPosition?Array.from(c.finalPosition.heights):null,
      finalBoundary:c.finalBoundary?.kind??null,
      finalResidual:residualSummary(c.finalResidual),
      trace:traceSummary(c.trace),
    },
  });
}

const p0=rows.filter(x=>x.sourceMover===0),
  p1=rows.filter(x=>x.sourceMover===1),
  exactP0=p0.filter(x=>x.result.exact),
  wins=exactP0.filter(x=>
    x.result.kind==='CERTIFIED_FIRST_WIN'&&x.result.player===0
  ),
  open=exactP0.filter(x=>
    x.result.kind==='PROTECTED_DIAGONAL_CONTROLLER_SATURATION'
  ),
  failures=p0.filter(x=>!x.result.exact),
  finalMeasureClasses=new Map();

for(const row of open){
  const key=JSON.stringify(row.result.finalMeasure);
  if(!finalMeasureClasses.has(key))finalMeasureClasses.set(key,[]);
  finalMeasureClasses.get(key).push(row.classId);
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.controller-saturation.v0_1',
  root:'44444',
  observation:'deterministic highest-target controller saturation on the universal protected diagonal residual',
  targetLine,
  rows,
  summary:{
    unresolvedPhysicalClassCount:rows.length,
    p0ToMoveClassCount:p0.length,
    p1ToMoveClassCount:p1.length,
    p1ToMoveClassIds:p1.map(x=>x.classId),
    p0ExactCount:exactP0.length,
    p0FirstWinCount:wins.length,
    p0FirstWinClassIds:wins.map(x=>x.classId),
    p0OpenSaturationCount:open.length,
    p0FailureCount:failures.length,
    p0Failures:failures.map(x=>({
      classId:x.classId,
      sixthMoves:x.sixthMoves,
      seam:x.result.seam,
    })),
    allOpenReturnP1:open.every(x=>x.result.finalMover===1),
    allOpenStrictMeasureDecrease:open.every(x=>{
      const a=x.result.sourceMeasure,b=x.result.finalMeasure;
      return Array.isArray(a)&&Array.isArray(b)&&
        (b[0]<a[0]||(b[0]===a[0]&&b[1]<a[1]));
    }),
    finalMeasureClassCount:finalMeasureClasses.size,
    finalMeasureClasses:[...finalMeasureClasses.entries()]
      .map(([measure,classIds])=>({
        measure:JSON.parse(measure),
        classIds,
      }))
      .sort((a,b)=>
        a.measure[0]-b.measure[0]||
        a.measure[1]-b.measure[1]
      ),
    sixthMovesWithP0FirstWin:[...new Set(wins.flatMap(x=>x.sixthMoves))]
      .sort((a,b)=>a-b),
    sixthMovesWithOpenSaturation:[...new Set(open.flatMap(x=>x.sixthMoves))]
      .sort((a,b)=>a-b),
    sixthMovesWithP0Failure:[...new Set(failures.flatMap(x=>x.sixthMoves))]
      .sort((a,b)=>a-b),
  },
  boundary:{
    diagnosticOnly:true,
    controllerRuleGeneric:true,
    p1FreeReplyNotConsumed:true,
    p1ToMoveSourceClassesNotModified:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
    futureTreeGeneration:false,
    noBestSetConclusion:true,
  },
},null,2));

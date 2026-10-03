import {
  createCpcxGeometry,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturation,
} from './cpcx-controller-saturation.mjs';
import {
  certifyCpcxProtectedResidualForcedNormalization,
} from './cpcx-forced-normalization.mjs';
import {
  certifyCpcxProtectedResidualSupportTransition,
} from './cpcx-support-transition.mjs';
import {
  certifyCpcxProtectedResidualDiagonalTransfer,
} from './cpcx-diagonal-transfer.mjs';
import {
  certifyCpcxProtectedDiagonalAnchorPivot,
} from './cpcx-diagonal-anchor-pivot.mjs';

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
function physicalKey(position){
  return `${position.mover}|${Array.from(position.heights).join(',')}|${Array.from(position.owner).map(x=>x+1).join('')}`;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function sourceResidual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine
  )??null;
}
function liveResidual(position,{player,lineId}){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}
function supportDebt(r){
  return r.events.reduce((n,e)=>n+e.supportDistance,0);
}
function measure(position,r){
  return [
    r.missingCount,
    supportDebt(r),
    position.geometry.cellCount-position.rank,
  ];
}
function lexLess(a,b){
  for(let i=0;i<Math.min(a.length,b.length);i++){
    if(a[i]<b[i])return true;
    if(a[i]>b[i])return false;
  }
  return a.length<b.length;
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
    playable:r.currentlyPlayableCells.map(label),
  };
}
function immediateSummary(x){
  return {
    kind:x.kind,
    mover:x.mover??null,
    cell:Number.isInteger(x.cell)?label(x.cell):null,
    winningCells:(x.winningCells??[]).map(label),
    opponentThreatCells:(x.opponentThreatCells??x.threatCells??[]).map(label),
  };
}
function saturationSummary(c){
  return {
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
  };
}

function normalizeThenSaturate(position,R){
  if(position.terminal)return {
    exact:position.terminal.player===0,
    kind:position.terminal.player===0?'P0_TERMINAL':'P1_TERMINAL',
    terminal:position.terminal,
  };
  if(position.mover!==0)return {
    exact:false,
    kind:'EXPECTED_P0_TO_MOVE',
    mover:position.mover,
  };

  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'){
    return {
      exact:true,
      kind:'P0_IMMEDIATE_FIRST_WIN',
      finalPosition:null,
      finalResidual:null,
      boundary:immediateSummary(immediate),
    };
  }
  if(immediate.kind==='FORCED_LOSS_OVERLOAD'){
    return {
      exact:false,
      kind:'P0_FORCED_LOSS_OVERLOAD',
      boundary:immediateSummary(immediate),
    };
  }

  let q=position,qR=R;
  const normalization=[];

  if(immediate.kind==='FORCED_RESPONSE'){
    const n=certifyCpcxProtectedResidualForcedNormalization(q,{
      protectedResidual:qR,
    });
    if(n.kind==='CERTIFIED_FIRST_WIN'&&n.player===0)return {
      exact:true,
      kind:'FORCED_NORMALIZATION_FIRST_WIN',
      normalization:[{
        kind:n.kind,
        rankDelta:n.rankDelta??null,
        steps:(n.steps??[]).map(x=>({
          kind:x.kind,
          cell:label(x.cell),
          owner:x.owner,
        })),
      }],
    };
    if(!n.exact||n.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION')
      return {
        exact:false,
        kind:'FORCED_NORMALIZATION_FAILED',
        seam:n.seam??null,
      };
    normalization.push({
      kind:n.kind,
      rankDelta:n.rankDelta,
      steps:n.steps.map(x=>({
        kind:x.kind,
        cell:label(x.cell),
        owner:x.owner,
      })),
    });
    q=n.finalPosition;
    qR=liveResidual(q,{player:0,lineId:qR.lineId});
    if(!qR)return {
      exact:false,
      kind:'PROTECTED_RESIDUAL_LOST_DURING_NORMALIZATION',
    };
    if(q.mover===1)return {
      exact:true,
      kind:'NORMALIZATION_TO_P1_BOUNDARY',
      finalPosition:q,
      finalResidual:qR,
      normalization,
      saturation:null,
    };
    if(q.mover!==0)return {
      exact:false,
      kind:'NORMALIZATION_MOVER_MISMATCH',
      mover:q.mover,
    };
  }else if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION'){
    return {
      exact:false,
      kind:'UNSUPPORTED_P0_IMMEDIATE_BOUNDARY',
      boundary:immediateSummary(immediate),
    };
  }

  const s=certifyCpcxProtectedDiagonalControllerSaturation(q,{
    protectedResidual:qR,
  });
  if(s.kind==='CERTIFIED_FIRST_WIN'&&s.player===0)return {
    exact:true,
    kind:'CONTROLLER_SATURATION_FIRST_WIN',
    normalization,
    saturation:saturationSummary(s),
  };
  if(!s.exact||s.kind!=='PROTECTED_DIAGONAL_CONTROLLER_SATURATION')
    return {
      exact:false,
      kind:'CONTROLLER_SATURATION_FAILED',
      seam:s.seam??null,
      normalization,
      saturation:saturationSummary(s),
    };

  return {
    exact:true,
    kind:'CONTROLLER_SATURATION_TO_P1_BOUNDARY',
    finalPosition:s.finalPosition,
    finalResidual:s.finalResidual,
    normalization,
    saturation:saturationSummary(s),
  };
}

function applyP1Event(position,R,eventCell){
  const sourceMeasure=measure(position,R);

  if(R.missingCells.includes(eventCell)){
    let transfer=certifyCpcxProtectedResidualDiagonalTransfer(position,{
      protectedResidual:R,
      blockedCell:eventCell,
    }),mode='SAME_TRACK';

    if(!transfer.exact||
       transfer.kind!=='PROTECTED_RESIDUAL_DIAGONAL_TRANSFER'){
      const pivot=certifyCpcxProtectedDiagonalAnchorPivot(position,{
        protectedResidual:R,
        blockedCell:eventCell,
      });
      if(!pivot.exact||
         pivot.kind!=='PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER')
        return {
          exact:false,
          kind:'PROTECTED_TARGET_TRANSFER_FAILED',
          eventCell:label(eventCell),
          sameTrack:{
            kind:transfer.kind,
            seam:transfer.seam??null,
          },
          anchorPivot:{
            kind:pivot.kind,
            seam:pivot.seam??null,
          },
          sourceMeasure,
        };
      transfer=pivot;
      mode='ANCHOR_PIVOT';
    }

    const target=mode==='SAME_TRACK'?transfer.transfer:transfer.pivot,
      q=transfer.child,
      qR=liveResidual(q,{player:0,lineId:target.lineId});
    if(!qR)return {
      exact:false,
      kind:'TRANSFER_RESIDUAL_NOT_LIVE',
      eventCell:label(eventCell),
      sourceMeasure,
      transferMode:mode,
    };
    const closure=normalizeThenSaturate(q,qR),
      finalMeasure=closure.finalPosition&&closure.finalResidual
        ?measure(closure.finalPosition,closure.finalResidual)
        :null,
      strictDescentOrWin=closure.exact===true&&(
        closure.kind.endsWith('FIRST_WIN')||
        (finalMeasure&&lexLess(finalMeasure,sourceMeasure))
      );
    return {
      exact:closure.exact===true,
      kind:strictDescentOrWin
        ?'PROTECTED_TARGET_RESPONSE_DESCENT'
        :'PROTECTED_TARGET_RESPONSE_NO_DESCENT',
      eventCell:label(eventCell),
      sourceMeasure,
      transferMode:mode,
      transferLine:target.lineLabel,
      transferMeasure:measure(q,qR),
      finalMeasure,
      strictDescentOrWin,
      closure,
    };
  }

  const t=certifyCpcxProtectedResidualSupportTransition(position,{
    protectedResidual:R,
    eventCell,
  });
  if(t.kind==='TERMINAL_EVENT')return {
    exact:t.terminal?.player===0,
    kind:t.terminal?.player===0?'P0_TERMINAL_ON_P1_EVENT':'P1_TERMINAL_RESPONSE',
    eventCell:label(eventCell),
    terminal:t.terminal,
    sourceMeasure,
    strictDescentOrWin:t.terminal?.player===0,
  };
  if(!t.exact||t.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')
    return {
      exact:false,
      kind:'EXTERNAL_SUPPORT_TRANSITION_FAILED',
      eventCell:label(eventCell),
      seam:t.seam??null,
      sourceMeasure,
    };

  const q=applyCpcxForcedEvent(position,eventCell),
    qR=liveResidual(q,{player:0,lineId:R.lineId});
  if(!qR)return {
    exact:false,
    kind:'PROTECTED_RESIDUAL_LOST_AFTER_EXTERNAL_EVENT',
    eventCell:label(eventCell),
    sourceMeasure,
  };

  const closure=normalizeThenSaturate(q,qR),
    finalMeasure=closure.finalPosition&&closure.finalResidual
      ?measure(closure.finalPosition,closure.finalResidual)
      :null,
    strictDescentOrWin=closure.exact===true&&(
      closure.kind.endsWith('FIRST_WIN')||
      (finalMeasure&&lexLess(finalMeasure,sourceMeasure))
    );

  return {
    exact:closure.exact===true,
    kind:strictDescentOrWin
      ?'EXTERNAL_RESPONSE_DESCENT'
      :'EXTERNAL_RESPONSE_NO_DESCENT',
    eventCell:label(eventCell),
    sourceMeasure,
    supportDebtDelta:t.supportDebtDelta,
    afterP1Measure:measure(q,qR),
    finalMeasure,
    strictDescentOrWin,
    closure,
  };
}

// Construct the complete exact P1 boundary band:
//   - the three original P1-to-move unresolved classes;
//   - all exact P1 boundaries produced by deterministic controller saturation
//     from the 42 P0-to-move classes.
const sources=new Map();

for(const cls of artifact.classes){
  const p=positionFromClass(cls),R=sourceResidual(p);
  if(!R)throw new Error(`universal protected residual missing ${cls.classId}`);

  if(p.mover===1){
    const key=physicalKey(p);
    if(!sources.has(key))sources.set(key,{
      position:p,
      residual:R,
      provenance:[],
    });
    sources.get(key).provenance.push({
      kind:'ORIGINAL_P1_CLASS',
      classId:cls.classId,
      sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))]
        .sort((a,b)=>a-b),
    });
    continue;
  }

  const s=certifyCpcxProtectedDiagonalControllerSaturation(p,{
    protectedResidual:R,
  });
  if(!s.exact||s.kind!=='PROTECTED_DIAGONAL_CONTROLLER_SATURATION')
    throw new Error(`controller saturation failed for ${cls.classId}: ${s.seam??s.kind}`);

  const key=physicalKey(s.finalPosition);
  if(!sources.has(key))sources.set(key,{
    position:s.finalPosition,
    residual:s.finalResidual,
    provenance:[],
  });
  sources.get(key).provenance.push({
    kind:'SATURATED_FROM_P0_CLASS',
    classId:cls.classId,
    sixthMoves:[...new Set(cls.sources.map(x=>x.sixthMove))]
      .sort((a,b)=>a-b),
    sourceMeasure:s.sourceMeasure,
    finalMeasure:s.finalMeasure,
  });
}

const rows=[...sources.values()].map((source,index)=>{
  const p=source.position,R=source.residual;
  if(p.mover!==1)throw new Error('boundary source not P1 to move');

  const responses=frontier(p).map(eventCell=>
    applyP1Event(p,R,eventCell)
  );
  return {
    boundaryId:`B${index+1}`,
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    residual:residualSummary(R),
    measure:measure(p,R),
    provenance:source.provenance,
    responses,
  };
}).sort((a,b)=>
  a.measure[0]-b.measure[0]||
  a.measure[1]-b.measure[1]||
  a.measure[2]-b.measure[2]||
  a.rank-b.rank||
  a.boundaryId.localeCompare(b.boundaryId)
);

const all=rows.flatMap(row=>row.responses.map(x=>({
  boundaryId:row.boundaryId,
  sourceMeasure:row.measure,
  ...x,
}))),
  failures=all.filter(x=>!x.exact),
  descentFailures=all.filter(x=>!x.strictDescentOrWin),
  finalMeasureClasses=new Map();

for(const x of all){
  if(!x.strictDescentOrWin||!Array.isArray(x.finalMeasure))continue;
  const key=JSON.stringify(x.finalMeasure);
  if(!finalMeasureClasses.has(key))finalMeasureClasses.set(key,0);
  finalMeasureClasses.set(key,finalMeasureClasses.get(key)+1);
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.normalized-p1-band-response-descent.v0_1',
  root:'44444',
  observation:'complete current P1 boundary band after deterministic controller saturation; one free P1 event followed only by qualified protected transport, forced normalization, and controller saturation',
  rows,
  summary:{
    p1BoundaryPhysicalClassCount:rows.length,
    sourceMeasureClasses:[...new Set(rows.map(x=>
      JSON.stringify(x.measure)
    ))].map(JSON.parse).sort((a,b)=>
      a[0]-b[0]||a[1]-b[1]||a[2]-b[2]
    ),
    responseCount:all.length,
    exactResponseCount:all.length-failures.length,
    responseFailureCount:failures.length,
    responseFailures:failures.map(x=>({
      boundaryId:x.boundaryId,
      eventCell:x.eventCell,
      kind:x.kind,
      seam:x.seam??x.closure?.seam??null,
    })),
    strictDescentOrWinCount:all.length-descentFailures.length,
    strictDescentOrWinFailureCount:descentFailures.length,
    strictDescentOrWinFailures:descentFailures.map(x=>({
      boundaryId:x.boundaryId,
      eventCell:x.eventCell,
      kind:x.kind,
      sourceMeasure:x.sourceMeasure,
      finalMeasure:x.finalMeasure??null,
      seam:x.seam??x.closure?.seam??null,
    })),
    p1TerminalResponseCount:all.filter(x=>
      x.kind==='P1_TERMINAL_RESPONSE'
    ).length,
    p0FirstWinResponseCount:all.filter(x=>
      x.strictDescentOrWin&&
      (x.closure?.kind?.endsWith('FIRST_WIN')||
       x.kind==='P0_TERMINAL_ON_P1_EVENT')
    ).length,
    finalMeasureClassCount:finalMeasureClasses.size,
    finalMeasureClasses:[...finalMeasureClasses.entries()]
      .map(([m,count])=>({measure:JSON.parse(m),count}))
      .sort((a,b)=>
        a.measure[0]-b.measure[0]||
        a.measure[1]-b.measure[1]||
        a.measure[2]-b.measure[2]
      ),
    allBoundariesCoveredByAllSevenSixthMoves:[...new Set(rows.flatMap(r=>
      r.provenance.flatMap(p=>p.sixthMoves)
    ))].sort((a,b)=>a-b),
  },
  boundary:{
    diagnosticOnly:true,
    exactlyOneFreeP1EventPerSource:true,
    p1ExternalUsesQualifiedSupportTransition:true,
    p1TargetBlockUsesQualifiedSameTrackThenAnchorPivot:true,
    forcedNormalizationOnly:true,
    p0ControllerUsesQualifiedControllerSaturation:true,
    noSecondFreeP1Layer:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
    futureTreeGeneration:false,
    noBestSetConclusion:true,
  },
},null,2));

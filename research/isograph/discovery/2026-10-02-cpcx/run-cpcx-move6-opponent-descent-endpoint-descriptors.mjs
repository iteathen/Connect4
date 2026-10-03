import {
  createCpcxGeometry,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  runCpcxFirstWinCertificate,
  composeCpcxForcingMacro,
  composeCpcxForcedNormalization,
} from './cpcx-successor.mjs';
import {
  findAndCertifyCpcxPairStarProgress,
} from './cpcx-pair-star.mjs';
import {
  findAndCertifyCpcxPairHubForks,
} from './cpcx-fork.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturation,
} from './cpcx-controller-saturation.mjs';
import {
  certifyCpcxProtectedDiagonalOpponentResponseDescent,
} from './cpcx-opponent-response-descent.mjs';
import {
  certifyCpcxProtectedResidualDiagonalTransfer,
} from './cpcx-diagonal-transfer.mjs';
import {
  certifyCpcxProtectedDiagonalAnchorPivot,
} from './cpcx-diagonal-anchor-pivot.mjs';
import {
  certifyCpcxProtectedDiagonalTargetInheritanceHandoff,
} from './cpcx-diagonal-target-inheritance.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  rootLine='A6-B5-C4-D3';

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
function physicalKey(p){
  return `${p.mover}|${Array.from(p.heights).join(',')}|${Array.from(p.owner).map(x=>x+1).join('')}`;
}
function rootResidual(p){
  return scanCpcxObligations(p).find(o=>
    o.player===0&&o.lineLabel===rootLine
  )??null;
}
function supportDebt(r){
  return r.events.reduce((n,e)=>n+e.supportDistance,0);
}
function trackInfo(line){
  const cells=[...line.cells].sort((a,b)=>{
    const A=cpcxCell(g,a),B=cpcxCell(g,b);
    return A.column-B.column||A.row-B.row;
  }), first=cpcxCell(g,cells[0]),
    orientation=line.orientation,
    constant=orientation==='D+'
      ?first.row-first.column
      :first.row+first.column,
    track=[];
  for(let row=0;row<g.rows;row++)for(let column=0;column<g.columns;column++){
    const ok=orientation==='D+'
      ?row-column===constant
      :row+column===constant;
    if(ok)track.push(row*g.columns+column);
  }
  track.sort((a,b)=>cpcxCell(g,a).column-cpcxCell(g,b).column);
  const lineStart=track.findIndex(x=>x===cells[0]);
  return {
    orientation,
    constant,
    trackLength:track.length,
    windowOffset:lineStart,
    lineCells:cells.map(label),
  };
}
function d3WindowComplex(p){
  const d3=2*g.columns+3,
    obligations=new Map(scanCpcxObligations(p)
      .filter(o=>o.player===0)
      .map(o=>[o.lineId,o])),
    rows=g.lines.filter(line=>
      (line.orientation==='D+'||line.orientation==='D-')&&
      line.cells.includes(d3)
    ).map(line=>{
      const t=trackInfo(line),
        R=obligations.get(line.id)??null,
        p1Cells=line.cells.filter(cell=>p.owner[cell]===1),
        p0Cells=line.cells.filter(cell=>p.owner[cell]===0),
        emptyCells=line.cells.filter(cell=>p.owner[cell]===-1);
      return {
        orientation:line.orientation,
        windowOffset:t.windowOffset,
        lineCells:t.lineCells,
        liveForP0:p1Cells.length===0,
        p0Cells:p0Cells.map(label).sort(),
        p1Cells:p1Cells.map(label).sort(),
        emptyCells:emptyCells.map(label).sort(),
        residualTuple:R?[R.missingCount,supportDebt(R)]:null,
        residualMissing:R?[...R.missingCells].map(label):[],
        residualSupport:R?[...R.events]
          .sort((a,b)=>b.row-a.row||a.column-b.column)
          .map(e=>e.supportDistance):[],
      };
    }).sort((a,b)=>
      a.orientation.localeCompare(b.orientation)||
      a.windowOffset-b.windowOffset
    );
  return {
    liveMask:rows.map(x=>x.liveForP0?1:0).join(''),
    liveWindowCount:rows.filter(x=>x.liveForP0).length,
    rows,
  };
}

function frontierCells(p){
  const out=[];
  for(let c=0;c<p.geometry.columns;c++){
    const row=p.heights[c];
    if(row<p.geometry.rows)out.push(row*p.geometry.columns+c);
  }
  return out;
}

function smallResidualSummary(p,player){
  return scanCpcxObligations(p)
    .filter(o=>o.player===player&&o.missingCount<=3)
    .map(o=>({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      orientation:o.orientation,
      missingCount:o.missingCount,
      missing:o.missingCells.map(label),
      support:o.events.map(e=>e.supportDistance),
      supportDebt:supportDebt(o),
      playable:o.currentlyPlayableCells.map(label),
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      a.supportDebt-b.supportDebt||
      a.lineId-b.lineId
    );
}

function progressSummary(p){
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    seam:p.seam??p.reason??null,
    macroKind:p.macro?.kind??null,
    primaryCell:Number.isInteger(p.macro?.primaryCell)
      ?label(p.macro.primaryCell):null,
    secondaryCell:Number.isInteger(p.macro?.secondaryCell)
      ?label(p.macro.secondaryCell):null,
    blockerCells:(p.obligation?.blockingCells??[]).map(label),
  };
}

function transferKind(p,R,cell){
  const e=R.events.find(x=>x.cell===cell);
  if(!e||e.supportDistance!==0)return 'HIDDEN';
  const same=certifyCpcxProtectedResidualDiagonalTransfer(p,{
    protectedResidual:R,blockedCell:cell,
  });
  if(same.exact&&same.kind==='PROTECTED_RESIDUAL_DIAGONAL_TRANSFER')
    return 'SAME_TRACK';
  const pivot=certifyCpcxProtectedDiagonalAnchorPivot(p,{
    protectedResidual:R,blockedCell:cell,
  });
  if(pivot.exact&&pivot.kind==='PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER')
    return 'ANCHOR_PIVOT';
  return 'NO_TRANSFER';
}
function supportResourceState(p){
  const support=Array.from(p.heights),
    remaining=support.map(h=>g.rows-h),
    parity=remaining.map(x=>x&1),
    sideOddColumns=[];
  for(let c=0;c<g.columns;c++)
    if(c!==3&&parity[c])sideOddColumns.push(c);
  const centerOwnerWord=Array.from({length:g.rows},(_,row)=>
    p.owner[row*g.columns+3]
  );
  return {
    support,
    remaining,
    capacityParity:parity,
    oddCapacityColumns:parity
      .map((x,c)=>x?c:null).filter(Number.isInteger),
    sideOddCapacityColumns:sideOddColumns,
    sideOddCapacityCount:sideOddColumns.length,
    centerSaturated:support[3]===g.rows,
    centerOwnerWord,
    alternatingCenterSpine:
      support[3]===g.rows&&
      centerOwnerWord.every((owner,row)=>owner===(row&1)),
    singleOddSideDebt:
      support[3]===g.rows&&sideOddColumns.length===1,
  };
}

function descriptor(p,R){
  const line=g.lines[R.lineId],
    lineCells=[...line.cells],
    missing=new Set(R.missingCells),
    anchors=lineCells.filter(cell=>
      !missing.has(cell)&&p.owner[cell]===R.player
    ),
    events=[...R.events].sort((a,b)=>
      b.row-a.row||a.column-b.column||a.cell-b.cell
    ),
    phase=events.map(e=>e.eventRank&1),
    phase0=phase[0]??0,
    t=trackInfo(line);
  return {
    orientation:R.orientation,
    trackLength:t.trackLength,
    windowOffset:t.windowOffset,
    lineCells:t.lineCells,
    anchorCells:anchors.map(label).sort(),
    anchorCount:anchors.length,
    missingCount:R.missingCount,
    missingCells:events.map(e=>label(e.cell)),
    supportProfile:events.map(e=>e.supportDistance),
    supportDebt:supportDebt(R),
    relativeEventParity:phase.map(x=>x^phase0),
    playableCells:R.currentlyPlayableCells.map(label).sort(),
    targetTransferKinds:events.map(e=>({
      cell:label(e.cell),
      supportDistance:e.supportDistance,
      transferKind:transferKind(p,R,e.cell),
    })),
    remainingCapacity:g.cellCount-p.rank,
    supportResource:supportResourceState(p),
    d3WindowComplex:d3WindowComplex(p),
    mover:p.mover,
  };
}
function roleKey(d){
  return JSON.stringify({
    orientation:d.orientation,
    trackLength:d.trackLength,
    windowOffset:d.windowOffset,
    anchorCells:d.anchorCells,
    missingCount:d.missingCount,
    missingCells:d.missingCells,
    supportProfile:d.supportProfile,
    relativeEventParity:d.relativeEventParity,
    targetTransferKinds:d.targetTransferKinds,
    mover:d.mover,
  });
}
function coarseKey(d){
  return JSON.stringify({
    orientation:d.orientation,
    trackLength:d.trackLength,
    windowOffset:d.windowOffset,
    anchorCount:d.anchorCount,
    missingCount:d.missingCount,
    supportProfile:d.supportProfile,
    relativeEventParity:d.relativeEventParity,
    transferKinds:d.targetTransferKinds.map(x=>x.transferKind),
    mover:d.mover,
  });
}

const sources=new Map();
for(const cls of artifact.classes){
  const p=positionFromClass(cls),R=rootResidual(p);
  if(!R)throw new Error(`root residual missing ${cls.classId}`);
  const provenance={
    classId:cls.classId,
    sixthMoves:[...new Set(cls.sources.map(x=>x.sixthMove))]
      .sort((a,b)=>a-b),
  };
  if(p.mover===1){
    const key=physicalKey(p);
    if(!sources.has(key))sources.set(key,{position:p,residual:R,provenance:[]});
    sources.get(key).provenance.push({kind:'ORIGINAL_P1',...provenance});
    continue;
  }
  const s=certifyCpcxProtectedDiagonalControllerSaturation(p,{
    protectedResidual:R,
  });
  if(!s.exact||s.kind!=='PROTECTED_DIAGONAL_CONTROLLER_SATURATION')
    throw new Error(`saturation failed ${cls.classId}`);
  const key=physicalKey(s.finalPosition);
  if(!sources.has(key))sources.set(key,{
    position:s.finalPosition,residual:s.finalResidual,provenance:[],
  });
  sources.get(key).provenance.push({kind:'SATURATED_P1',...provenance});
}

const sourceDescriptors=[...sources.values()].map(source=>({
    descriptor:descriptor(source.position,source.residual),
    physicalKey:physicalKey(source.position),
  })),
  sourceRoleKeySet=new Set(sourceDescriptors.map(x=>roleKey(x.descriptor))),
  sourceCoarseKeySet=new Set(sourceDescriptors.map(x=>coarseKey(x.descriptor))),
  sourceMaskSet=new Set(sourceDescriptors.map(x=>
    x.descriptor.d3WindowComplex.liveMask
  )),
  novelMaskSecondLayerProbes=[],
  endpoints=[],terminals=[];
for(const source of sources.values()){
  const sourceDescriptor=descriptor(source.position,source.residual),
    sourceMask=sourceDescriptor.d3WindowComplex.liveMask;
  const c=certifyCpcxProtectedDiagonalOpponentResponseDescent(
    source.position,{protectedResidual:source.residual}
  );
  if(!c.exact||c.kind!=='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_DESCENT')
    throw new Error(`source response descent failed: ${c.seam??c.kind}`);
  for(const row of c.rows){
    if(row.kind==='CERTIFIED_FIRST_WIN'){
      terminals.push({
        sourceMeasure:c.sourceMeasure,
        eventCell:label(row.eventCell),
        player:row.player,
      });
      continue;
    }
    if(row.kind!=='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_EVENT_DESCENT'||
       !row.finalPosition||!row.finalResidual)
      throw new Error(`unexpected response row ${row.kind}`);
    const endpointPhysicalKey=physicalKey(row.finalPosition),
      endpointDescriptor=descriptor(row.finalPosition,row.finalResidual),
      endpointMask=endpointDescriptor.d3WindowComplex.liveMask;
    if(!sourceMaskSet.has(endpointMask)){
      const probe=certifyCpcxProtectedDiagonalOpponentResponseDescent(
        row.finalPosition,{protectedResidual:row.finalResidual}
      );
      const secondLayerRows=(probe.rows??[]).map(x=>{
        if(x.kind==='CERTIFIED_FIRST_WIN')return {
          eventCell:Number.isInteger(x.eventCell)?label(x.eventCell):null,
          kind:x.kind,
          player:x.player??null,
          finalMeasure:null,
          finalMask:null,
        };
        const finalDescriptor=x.finalPosition&&x.finalResidual
          ?descriptor(x.finalPosition,x.finalResidual)
          :null;
        let preControllerClosureProbe=null,
          noTransferTargetBlockProbe=null;
        if(finalDescriptor&&
           finalDescriptor.d3WindowComplex.liveMask==='100000'&&
           Number.isInteger(x.eventCell)){
          const immediateChild=applyCpcxForcedEvent(
              row.finalPosition,x.eventCell
            ),
            im=immediateChild.terminal
              ?null
              :classifyCpcxImmediate(immediateChild),
            pr=immediateChild.terminal
              ?null
              :classifyCpcxProgress(immediateChild,{player:0}),
            fw=immediateChild.terminal
              ?null
              :runCpcxFirstWinCertificate(immediateChild,{attacker:0});
          let oneProgressHandoff=null;
          if(!immediateChild.terminal&&pr?.exact){
            let successor=null;
            if(pr.kind==='FORCED_NORMALIZATION')
              successor=composeCpcxForcedNormalization(immediateChild,pr);
            else if(pr.kind==='CERTIFIED_FORCING_MACRO')
              successor=composeCpcxForcingMacro(immediateChild,pr);
            if(successor){
              const q=successor.concretePosition??null,
                protectedAfter=q
                  ?scanCpcxObligations(q).find(o=>
                    o.player===0&&
                    o.lineId===row.finalResidual.lineId
                  )??null
                  :null,
                nextProgress=q
                  ?classifyCpcxProgress(q,{player:0})
                  :null;
              oneProgressHandoff={
                successorKind:successor.kind,
                exact:successor.exact??false,
                seam:successor.seam??null,
                player:successor.player??null,
                nextMover:successor.nextMover??q?.mover??null,
                rank:successor.rank??(q?{
                  options:[q.rank],deltaOptions:[],parity:q.rank&1
                }:null),
                concrete:Boolean(q),
                support:q?Array.from(q.heights):null,
                protectedResidual:protectedAfter?{
                  lineId:protectedAfter.lineId,
                  lineLabel:protectedAfter.lineLabel,
                  missingCount:protectedAfter.missingCount,
                  missing:protectedAfter.missingCells.map(label),
                  support:protectedAfter.events.map(e=>e.supportDistance),
                  playable:protectedAfter.currentlyPlayableCells.map(label),
                }:null,
                nextProgress:nextProgress
                  ?progressSummary(nextProgress)
                  :null,
                p0SmallResiduals:q
                  ?smallResidualSummary(q,0).slice(0,24)
                  :[],
                p1SmallResiduals:q
                  ?smallResidualSummary(q,1).slice(0,24)
                  :[],
              };
            }
          }
          preControllerClosureProbe={
            eventCell:label(x.eventCell),
            terminal:immediateChild.terminal,
            immediate:im?{
              kind:im.kind,
              mover:im.mover??null,
              cell:Number.isInteger(im.cell)?label(im.cell):null,
              winningCells:(im.winningCells??[]).map(label),
              threatCells:(im.threatCells??
                im.opponentThreatCells??[]).map(label),
            }:null,
            progress:pr?progressSummary(pr):null,
            firstWin:fw?{
              kind:fw.kind,
              exact:fw.exact??false,
              player:fw.player??null,
              seam:fw.seam??null,
              traceLength:fw.trace?.length??0,
            }:null,
            oneProgressHandoff,
            p0SmallResiduals:immediateChild.terminal
              ?[]
              :smallResidualSummary(immediateChild,0).slice(0,24),
            p1SmallResiduals:immediateChild.terminal
              ?[]
              :smallResidualSummary(immediateChild,1).slice(0,24),
            support:immediateChild.terminal
              ?null:Array.from(immediateChild.heights),
            rank:immediateChild.rank,
            mover:immediateChild.mover,
          };
        }
        if(finalDescriptor&&
           finalDescriptor.d3WindowComplex.liveMask==='100000'&&
           x.finalPosition&&x.finalResidual){
          const dangerous=x.finalResidual.events.find(e=>
            e.supportDistance===0&&
            transferKind(x.finalPosition,x.finalResidual,e.cell)==='NO_TRANSFER'
          );
          if(dangerous){
            const inheritance=
              certifyCpcxProtectedDiagonalTargetInheritanceHandoff(
                x.finalPosition,{
                  protectedResidual:x.finalResidual,
                  blockedCell:dangerous.cell,
                }
              );
            let inheritanceClosure=null;
            if(
              inheritance.exact&&
              inheritance.kind==='PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF'
            ){
              const saturation=
                certifyCpcxProtectedDiagonalControllerSaturation(
                  inheritance.child,{
                    protectedResidual:inheritance.handoffResidual,
                  }
                );
              let responseDescent=null;
              if(
                saturation.exact&&
                saturation.kind==='PROTECTED_DIAGONAL_CONTROLLER_SATURATION'
              )responseDescent=
                certifyCpcxProtectedDiagonalOpponentResponseDescent(
                  saturation.finalPosition,{
                    protectedResidual:saturation.finalResidual,
                  }
                );
              inheritanceClosure={
                handoff:{
                  kind:inheritance.kind,
                  exact:inheritance.exact,
                  sourceMeasure:inheritance.sourceMeasure,
                  childMeasure:inheritance.childMeasure,
                  inheritedTargets:inheritance.inheritedTargets.map(label),
                  sourceLineLabel:inheritance.sourceResidual.lineLabel,
                  handoffLineLabel:inheritance.handoffResidual.lineLabel,
                  handoffMissing:inheritance.handoffResidual.missingCells.map(label),
                  handoffSupport:inheritance.handoffResidual.events.map(e=>
                    e.supportDistance
                  ),
                },
                saturation:{
                  kind:saturation.kind,
                  exact:saturation.exact??false,
                  seam:saturation.seam??null,
                  player:saturation.player??null,
                  sourceMeasure:saturation.sourceMeasure??null,
                  currentMeasure:saturation.currentMeasure??null,
                  finalMeasure:saturation.finalMeasure??null,
                  finalRank:saturation.finalRank??null,
                  descent:saturation.descent?{
                    kind:saturation.descent.kind,
                    exact:saturation.descent.exact??false,
                    seam:saturation.descent.seam??null,
                    selectedTarget:Number.isInteger(
                      saturation.descent.selectedTarget
                    )?label(saturation.descent.selectedTarget):null,
                    selectedMode:saturation.descent.selectedMode??null,
                    localSafety:saturation.descent.localSafety?{
                      kind:saturation.descent.localSafety.kind,
                      releasedCell:Number.isInteger(
                        saturation.descent.localSafety.releasedCell
                      )?label(saturation.descent.localSafety.releasedCell):null,
                      hazards:(saturation.descent.localSafety.hazards??[]).map(h=>({
                        lineId:h.lineId,
                        lineLabel:h.lineLabel,
                        classification:h.classification,
                      })),
                    }:null,
                  }:null,
                },
                responseDescent:responseDescent?{
                  kind:responseDescent.kind,
                  exact:responseDescent.exact??false,
                  seam:responseDescent.seam??null,
                  player:responseDescent.player??null,
                  sourceMeasure:responseDescent.sourceMeasure??null,
                  eventCount:responseDescent.eventCount??null,
                  failureCount:responseDescent.failures?.length??0,
                  failures:(responseDescent.failures??[]).map(f=>({
                    eventCell:Number.isInteger(f.eventCell)
                      ?label(f.eventCell):null,
                    seam:f.seam??f.kind??null,
                    sourceMeasure:f.sourceMeasure??null,
                    transportKind:f.transportKind??null,
                    transitionSeam:f.transition?.seam??null,
                    sameTrackSeam:f.sameTrack?.seam??null,
                    anchorPivotSeam:f.anchorPivot?.seam??null,
                    closureSeam:f.closure?.seam??null,
                  })),
                  descentFailures:(responseDescent.descentFailures??[]).map(f=>({
                    eventCell:Number.isInteger(f.eventCell)
                      ?label(f.eventCell):null,
                    kind:f.kind,
                    seam:f.seam??null,
                    sourceMeasure:f.sourceMeasure??null,
                    finalMeasure:f.finalMeasure??null,
                  })),
                  everyEventWinsOrStrictlyDescends:
                    responseDescent.everyEventWinsOrStrictlyDescends??false,
                }:null,
              };
            }
            const child=applyCpcxForcedEvent(
              x.finalPosition,dangerous.cell
            );
            const immediate=child.terminal
              ?null
              :classifyCpcxImmediate(child),
              progress=child.terminal
                ?null
                :classifyCpcxProgress(child,{player:0}),
              cert=child.terminal
                ?null
                :runCpcxFirstWinCertificate(child,{attacker:0});
            noTransferTargetBlockProbe={
              blockedCell:label(dangerous.cell),
              targetInheritance:inheritanceClosure,
              terminal:child.terminal,
              immediate:immediate?{
                kind:immediate.kind,
                mover:immediate.mover??null,
                cell:Number.isInteger(immediate.cell)
                  ?label(immediate.cell):null,
                winningCells:(immediate.winningCells??[]).map(label),
                threatCells:(immediate.threatCells??
                  immediate.opponentThreatCells??[]).map(label),
              }:null,
              progress:progress?progressSummary(progress):null,
              firstWin:cert?{
                kind:cert.kind,
                exact:cert.exact??false,
                player:cert.player??null,
                seam:cert.seam??null,
                traceLength:cert.trace?.length??0,
              }:null,
              p0SmallResiduals:child.terminal
                ?[]
                :smallResidualSummary(child,0).slice(0,24),
              p1SmallResiduals:child.terminal
                ?[]
                :smallResidualSummary(child,1).slice(0,24),
              pairStar:child.terminal
                ?[]
                :findAndCertifyCpcxPairStarProgress(child,{player:0})
                  .map(x=>({
                    hub:label(x.candidate.hub),
                    upperHub:label(x.candidate.upperHub),
                    supportDepth:x.candidate.supportDepth,
                    lowerLeaves:x.candidate.lowerLeaves.map(label),
                    upperLeaves:x.candidate.upperLeaves.map(label),
                    source:x.certificate.source,
                    singletonCells:(x.certificate.singletonCells??[]).map(label),
                    branchCount:x.certificate.branches?.length??0,
                  })),
              pairHubForks:child.terminal
                ?[]
                :findAndCertifyCpcxPairHubForks(child,{player:0})
                  .map(x=>({
                    hub:label(x.candidate.hub),
                    singletonCells:x.certificate.singletonCells.map(label),
                    deficiency:x.certificate.deficiency,
                  })),
              currentP0Actions:child.terminal?[]:frontierCells(child).map(actionCell=>{
                const next=applyCpcxForcedEvent(child,actionCell);
                if(next.terminal)return {
                  actionCell:label(actionCell),
                  terminal:next.terminal,
                  progress:null,
                  firstWin:null,
                };
                const progress=classifyCpcxProgress(next,{player:0}),
                  first=runCpcxFirstWinCertificate(next,{attacker:0});
                const row={
                  actionCell:label(actionCell),
                  terminal:null,
                  immediate:(()=>{
                    const im=classifyCpcxImmediate(next);
                    return {
                      kind:im.kind,
                      mover:im.mover??null,
                      cell:Number.isInteger(im.cell)?label(im.cell):null,
                      winningCells:(im.winningCells??[]).map(label),
                      threatCells:(im.threatCells??
                        im.opponentThreatCells??[]).map(label),
                    };
                  })(),
                  progress:progressSummary(progress),
                  firstWin:{
                    kind:first.kind,
                    exact:first.exact??false,
                    player:first.player??null,
                    seam:first.seam??null,
                    traceLength:first.trace?.length??0,
                  },
                  p0SmallResiduals:smallResidualSummary(next,0).slice(0,12),
                };
                if(label(actionCell)==='F6'){
                  row.f6OpponentResponses=frontierCells(next).map(replyCell=>{
                    const reply=applyCpcxForcedEvent(next,replyCell);
                    if(reply.terminal)return {
                      replyCell:label(replyCell),
                      terminal:reply.terminal,
                      immediate:null,
                      progress:null,
                      firstWin:null,
                    };
                    const im=classifyCpcxImmediate(reply),
                      rp=classifyCpcxProgress(reply,{player:0}),
                      rf=runCpcxFirstWinCertificate(reply,{attacker:0});
                    return {
                      replyCell:label(replyCell),
                      terminal:null,
                      immediate:{
                        kind:im.kind,
                        mover:im.mover??null,
                        cell:Number.isInteger(im.cell)?label(im.cell):null,
                        winningCells:(im.winningCells??[]).map(label),
                        threatCells:(im.threatCells??
                          im.opponentThreatCells??[]).map(label),
                      },
                      progress:progressSummary(rp),
                      firstWin:{
                        kind:rf.kind,
                        exact:rf.exact??false,
                        player:rf.player??null,
                        seam:rf.seam??null,
                        traceLength:rf.trace?.length??0,
                      },
                      p0SmallResiduals:smallResidualSummary(reply,0).slice(0,12),
                      p1SmallResiduals:smallResidualSummary(reply,1).slice(0,12),
                      support:Array.from(reply.heights),
                      rank:reply.rank,
                      mover:reply.mover,
                    };
                  });
                }
                return row;
              }),
              support:child.terminal?null:Array.from(child.heights),
              rank:child.rank,
              mover:child.mover,
            };
          }
        }
        return {
          eventCell:Number.isInteger(x.eventCell)?label(x.eventCell):null,
          kind:x.kind,
          player:x.player??null,
          finalMeasure:x.finalMeasure??null,
          finalMask:finalDescriptor?.d3WindowComplex.liveMask??null,
          finalDescriptor:finalDescriptor?{
            lineCells:finalDescriptor.lineCells,
            anchorCells:finalDescriptor.anchorCells,
            missingCount:finalDescriptor.missingCount,
            missingCells:finalDescriptor.missingCells,
            supportProfile:finalDescriptor.supportProfile,
            supportDebt:finalDescriptor.supportDebt,
            playableCells:finalDescriptor.playableCells,
            targetTransferKinds:finalDescriptor.targetTransferKinds,
            remainingCapacity:finalDescriptor.remainingCapacity,
            supportResource:finalDescriptor.supportResource,
            d3WindowComplex:finalDescriptor.d3WindowComplex,
          }:null,
          preControllerClosureProbe,
          noTransferTargetBlockProbe,
        };
      });
      novelMaskSecondLayerProbes.push({
        mask:endpointMask,
        sourceMeasure:row.sourceMeasure,
        endpointMeasure:row.finalMeasure,
        firstLayerEventCell:label(row.eventCell),
        exact:probe.exact??false,
        kind:probe.kind,
        seam:probe.seam??null,
        eventCount:probe.eventCount??null,
        secondLayerRows,
        nonterminalFinalMasks:[...new Set(secondLayerRows
          .map(x=>x.finalMask).filter(Boolean))].sort(),
        firstWinCount:secondLayerRows.filter(x=>
          x.kind==='CERTIFIED_FIRST_WIN'&&x.player===0
        ).length,
        failureEvents:(probe.failures??[]).map(x=>({
          eventCell:Number.isInteger(x.eventCell)?label(x.eventCell):null,
          seam:x.seam??x.kind??null,
        })),
      });
    }
    endpoints.push({
      sourceMeasure:row.sourceMeasure,
      finalMeasure:row.finalMeasure,
      sourceMask,
      eventCell:label(row.eventCell),
      transportKind:row.transportKind,
      physicalKey:endpointPhysicalKey,
      reentersQualifiedSourceBand:sources.has(endpointPhysicalKey),
      descriptor:endpointDescriptor,
      provenance:source.provenance,
    });
  }
}

for(const row of endpoints){
  row.reentersSourceRoleDescriptor=
    sourceRoleKeySet.has(roleKey(row.descriptor));
  row.reentersSourceCoarseDescriptor=
    sourceCoarseKeySet.has(coarseKey(row.descriptor));
  row.reentersSourceWindowMask=
    sourceMaskSet.has(row.descriptor.d3WindowComplex.liveMask);
}

const noTransferProbes=novelMaskSecondLayerProbes
    .flatMap(x=>x.secondLayerRows??[])
    .map(x=>x.noTransferTargetBlockProbe)
    .filter(Boolean),
  commonPostBlockP0Residuals=(()=>{
    if(!noTransferProbes.length)return [];
    let common=new Map(noTransferProbes[0].p0SmallResiduals.map(r=>[
      `${r.lineId}|${r.missing.join(',')}`,r
    ]));
    for(const probe of noTransferProbes.slice(1)){
      const keys=new Set(probe.p0SmallResiduals.map(r=>
        `${r.lineId}|${r.missing.join(',')}`
      ));
      common=new Map([...common].filter(([k])=>keys.has(k)));
    }
    return [...common.values()].sort((a,b)=>
      a.missingCount-b.missingCount||
      a.lineId-b.lineId
    );
  })();

const roleClasses=new Map(),coarseClasses=new Map();
for(const row of endpoints){
  for(const [map,key] of [
    [roleClasses,roleKey(row.descriptor)],
    [coarseClasses,coarseKey(row.descriptor)],
  ]){
    if(!map.has(key))map.set(key,{descriptor:JSON.parse(key),count:0});
    map.get(key).count+=1;
  }
}

const transferCounts={},maskTransitions=new Map();
for(const row of endpoints){
  for(const t of row.descriptor.targetTransferKinds)
    transferCounts[t.transferKind]=(transferCounts[t.transferKind]??0)+1;
  const to=row.descriptor.d3WindowComplex.liveMask,
    key=`${row.sourceMask}->${to}`;
  if(!maskTransitions.has(key))maskTransitions.set(key,{
    from:row.sourceMask,to,count:0,
    transportKinds:new Set(),
    sourceMeasures:new Set(),
    finalMeasures:new Set(),
  });
  const x=maskTransitions.get(key);
  x.count+=1;
  x.transportKinds.add(row.transportKind);
  x.sourceMeasures.add(JSON.stringify(row.sourceMeasure));
  x.finalMeasures.add(JSON.stringify(row.finalMeasure));
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.opponent-descent-endpoint-descriptors.v0_1',
  root:'44444',
  observation:'nonterminal endpoints of the already-qualified one-layer opponent-response descent theorem; no second free opponent layer is generated',
  endpointCount:endpoints.length,
  terminalCount:terminals.length,
  novelMaskSecondLayerProbes,
  endpoints,
  summary:{
    sourceBoundaryCount:sources.size,
    endpointCount:endpoints.length,
    noTransferTargetBlockProbeCount:noTransferProbes.length,
    noTransferTargetBlockPairStarCount:noTransferProbes.reduce(
      (n,x)=>n+(x.pairStar?.length??0),0
    ),
    noTransferTargetBlockPairHubForkCount:noTransferProbes.reduce(
      (n,x)=>n+(x.pairHubForks?.length??0),0
    ),
    targetInheritanceHandoffExactCount:noTransferProbes.filter(x=>
      x.targetInheritance?.handoff?.exact===true
    ).length,
    targetInheritanceSaturationExactCount:noTransferProbes.filter(x=>
      x.targetInheritance?.saturation?.exact===true
    ).length,
    targetInheritanceResponseDescentExactCount:noTransferProbes.filter(x=>
      x.targetInheritance?.responseDescent?.exact===true
    ).length,
    allNoTransferSeamsHaveStrictTargetInheritance:noTransferProbes.every(x=>
      x.targetInheritance?.handoff?.exact===true
    ),
    commonPostBlockCurrentActionLabels:(()=>{
      if(!noTransferProbes.length)return [];
      let labels=noTransferProbes[0].currentP0Actions.map(x=>x.actionCell);
      for(const probe of noTransferProbes.slice(1)){
        const set=new Set(probe.currentP0Actions.map(x=>x.actionCell));
        labels=labels.filter(x=>set.has(x));
      }
      return labels.sort();
    })(),
    commonPostBlockExactFirstWinActions:(()=>{
      if(!noTransferProbes.length)return [];
      let labels=noTransferProbes[0].currentP0Actions.filter(x=>
        x.terminal?.player===0||
        x.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&x.firstWin.player===0
      ).map(x=>x.actionCell);
      for(const probe of noTransferProbes.slice(1)){
        const set=new Set(probe.currentP0Actions.filter(x=>
          x.terminal?.player===0||
          x.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&x.firstWin.player===0
        ).map(x=>x.actionCell));
        labels=labels.filter(x=>set.has(x));
      }
      return labels.sort();
    })(),
    commonPostBlockP0Residuals,
    endpointCount:endpoints.length,
    terminalCount:terminals.length,
    exactSourceBandReentryCount:endpoints.filter(x=>
      x.reentersQualifiedSourceBand
    ).length,
    allEndpointsReenterQualifiedSourceBand:endpoints.every(x=>
      x.reentersQualifiedSourceBand
    ),
    nonReenteringEndpointCount:endpoints.filter(x=>
      !x.reentersQualifiedSourceBand
    ).length,
    sourceRoleDescriptorClassCount:sourceRoleKeySet.size,
    endpointRoleDescriptorReentryCount:endpoints.filter(x=>
      x.reentersSourceRoleDescriptor
    ).length,
    allEndpointsReenterSourceRoleDescriptor:endpoints.every(x=>
      x.reentersSourceRoleDescriptor
    ),
    sourceCoarseDescriptorClassCount:sourceCoarseKeySet.size,
    endpointCoarseDescriptorReentryCount:endpoints.filter(x=>
      x.reentersSourceCoarseDescriptor
    ).length,
    allEndpointsReenterSourceCoarseDescriptor:endpoints.every(x=>
      x.reentersSourceCoarseDescriptor
    ),
    sourceWindowMaskClassCount:sourceMaskSet.size,
    novelMaskSecondLayerProbeCount:novelMaskSecondLayerProbes.length,
    novelMaskSecondLayerExactCount:novelMaskSecondLayerProbes.filter(x=>
      x.exact
    ).length,
    novelMaskSecondLayerFailures:novelMaskSecondLayerProbes.filter(x=>
      !x.exact
    ),
    novelMaskSecondLayerNonterminalMasks:[...new Set(
      novelMaskSecondLayerProbes.flatMap(x=>x.nonterminalFinalMasks??[])
    )].sort(),
    novelMaskSecondLayerProducesSingleWindow:
      novelMaskSecondLayerProbes.some(x=>
        (x.nonterminalFinalMasks??[]).some(mask=>
          mask.split('').filter(bit=>bit==='1').length===1
        )
      ),
    endpointWindowMaskReentryCount:endpoints.filter(x=>
      x.reentersSourceWindowMask
    ).length,
    allEndpointsReenterSourceWindowMask:endpoints.every(x=>
      x.reentersSourceWindowMask
    ),
    roleDescriptorClassCount:roleClasses.size,
    coarseDescriptorClassCount:coarseClasses.size,
    roleDescriptorClasses:[...roleClasses.values()]
      .sort((a,b)=>b.count-a.count),
    coarseDescriptorClasses:[...coarseClasses.values()]
      .sort((a,b)=>b.count-a.count),
    orientationCounts:Object.fromEntries(
      [...new Set(endpoints.map(x=>x.descriptor.orientation))].sort()
        .map(k=>[k,endpoints.filter(x=>x.descriptor.orientation===k).length])
    ),
    anchorCountHistogram:Object.fromEntries(
      [...new Set(endpoints.map(x=>x.descriptor.anchorCount))].sort((a,b)=>a-b)
        .map(k=>[k,endpoints.filter(x=>x.descriptor.anchorCount===k).length])
    ),
    missingCountHistogram:Object.fromEntries(
      [...new Set(endpoints.map(x=>x.descriptor.missingCount))].sort((a,b)=>a-b)
        .map(k=>[k,endpoints.filter(x=>x.descriptor.missingCount===k).length])
    ),
    currentTargetTransferKinds:transferCounts,
    maskTransitionClassCount:maskTransitions.size,
    maskTransitions:[...maskTransitions.values()]
      .map(x=>({
        from:x.from,
        to:x.to,
        count:x.count,
        transportKinds:[...x.transportKinds].sort(),
        sourceMeasures:[...x.sourceMeasures].map(JSON.parse)
          .sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]),
        finalMeasures:[...x.finalMeasures].map(JSON.parse)
          .sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]),
      }))
      .sort((a,b)=>a.from.localeCompare(b.from)||a.to.localeCompare(b.to)),
    d3WindowMaskClassCount:new Set(endpoints.map(x=>
      x.descriptor.d3WindowComplex.liveMask
    )).size,
    d3WindowMaskClasses:[...new Set(endpoints.map(x=>
      x.descriptor.d3WindowComplex.liveMask
    ))].sort().map(mask=>({
      mask,
      count:endpoints.filter(x=>
        x.descriptor.d3WindowComplex.liveMask===mask
      ).length,
      minimumLiveWindowCount:Math.min(...endpoints
        .filter(x=>x.descriptor.d3WindowComplex.liveMask===mask)
        .map(x=>x.descriptor.d3WindowComplex.liveWindowCount)),
    })),
    minimumLiveD3WindowCount:Math.min(...endpoints.map(x=>
      x.descriptor.d3WindowComplex.liveWindowCount
    )),
    exhaustedMask111000:{
      count:endpoints.filter(x=>
        x.descriptor.d3WindowComplex.liveMask==='111000'
      ).length,
      centerSaturatedCount:endpoints.filter(x=>
        x.descriptor.d3WindowComplex.liveMask==='111000'&&
        x.descriptor.supportResource.centerSaturated
      ).length,
      alternatingCenterSpineCount:endpoints.filter(x=>
        x.descriptor.d3WindowComplex.liveMask==='111000'&&
        x.descriptor.supportResource.alternatingCenterSpine
      ).length,
      singleOddSideDebtCount:endpoints.filter(x=>
        x.descriptor.d3WindowComplex.liveMask==='111000'&&
        x.descriptor.supportResource.singleOddSideDebt
      ).length,
      resourceClasses:[...new Map(endpoints.filter(x=>
        x.descriptor.d3WindowComplex.liveMask==='111000'
      ).map(x=>[
        JSON.stringify({
          support:x.descriptor.supportResource.support,
          remaining:x.descriptor.supportResource.remaining,
          capacityParity:x.descriptor.supportResource.capacityParity,
          sideOddCapacityColumns:x.descriptor.supportResource.sideOddCapacityColumns,
          centerOwnerWord:x.descriptor.supportResource.centerOwnerWord,
        }),{
          support:x.descriptor.supportResource.support,
          remaining:x.descriptor.supportResource.remaining,
          capacityParity:x.descriptor.supportResource.capacityParity,
          sideOddCapacityColumns:x.descriptor.supportResource.sideOddCapacityColumns,
          centerOwnerWord:x.descriptor.supportResource.centerOwnerWord,
        }
      ])).values()],
    },
    noCurrentPlayableTargetLacksTransfer:endpoints.every(x=>
      x.descriptor.targetTransferKinds.every(t=>
        t.supportDistance!==0||t.transferKind!=='NO_TRANSFER'
      )
    ),
    allEndpointsOpponentToMove:endpoints.every(x=>x.descriptor.mover===1),
    representedSixthMoves:[...new Set(endpoints.flatMap(x=>
      x.provenance.flatMap(p=>p.sixthMoves)
    ))].sort((a,b)=>a-b),
  },
  boundary:{
    diagnosticOnly:true,
    endpointObservationOnly:true,
    secondLayerProbeRestrictedToNovelWindowMasks:true,
    secondLayerProbeIsFalsificationOnly:true,
    noSecondLayerResultUsedAsProofPremise:true,
    noTransferTargetBlockProbeRestrictedToSingleExposedTarget:true,
    preControllerClosureProbeInspectsExistingSecondLayerEventOnly:true,
    preControllerClosureProbeIsFalsificationOnly:true,
    oneProgressHandoffUsesOnlyExistingExactMacro:true,
    noTransferTargetBlockProbeIsFalsificationOnly:true,
    f6ResponseProbeIsOneCurrentOpponentLayerOnly:true,
    f6ResponseProbeIsFalsificationOnly:true,
    currentPlayableTargetTransferAuditOnly:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
    futureTreeGeneration:false,
    noBestSetConclusion:true,
  },
},null,2));

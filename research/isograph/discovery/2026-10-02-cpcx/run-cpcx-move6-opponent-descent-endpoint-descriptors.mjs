import {
  createCpcxGeometry,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
  closeCpcxForcedResponses,
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
import {
  certifyCpcxProtectedDiagonalControllerSaturationV2,
} from './cpcx-controller-saturation-v2.mjs';
import {
  certifyCpcxProtectedDiagonalOpponentResponseDescentV2,
} from './cpcx-opponent-response-descent-v2.mjs';
import {
  certifyCpcxProtectedResidualSupportAdvance,
} from './cpcx-support-advance.mjs';
import {
  certifyCpcxProtectedResidualTargetAcquisition,
} from './cpcx-target-acquisition.mjs';
import {
  certifyCpcxProtectedResidualForcedNormalization,
} from './cpcx-forced-normalization.mjs';
import {
  findCpcxVerticalThreeStageObligations,
  certifyCpcxVerticalThreeStageSetup,
} from './cpcx-three-stage.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  partitionCpcxVerticalTwoStageGuard,
} from './cpcx-two-stage.mjs';
import {
  certifyCpcxTruncatedTargetReservoir,
  analyzeCpcxOneDefectTargetReservoir,
} from './cpcx-reservoir.mjs';
import {
  deriveCpcxDisjunctiveBlockObligation,
} from './cpcx-cpc2.mjs';
import {
  certifyCpcxOneDefectTargetReservoirRcic,
} from './cpcx-one-defect-rcic.mjs';
import {
  certifyCpcxOneDefectAttachmentRcic,
} from './cpcx-one-defect-attachment-rcic.mjs';

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
    tertiaryCell:Number.isInteger(p.macro?.tertiaryCell)
      ?label(p.macro.tertiaryCell):null,
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
              const progressOptions=inheritance.handoffResidual.events.map(e=>{
                const progress=e.supportDistance===0
                  ?certifyCpcxProtectedResidualTargetAcquisition(
                    inheritance.child,{
                      controllerResidual:inheritance.handoffResidual,
                      targetCell:e.cell,
                    }
                  )
                  :certifyCpcxProtectedResidualSupportAdvance(
                    inheritance.child,{
                      controllerResidual:inheritance.handoffResidual,
                      targetCell:e.cell,
                    }
                  );
                let nextResidual=null,response=null,response2=null;
                if(progress.exact&&
                   progress.kind!=='CERTIFIED_FIRST_WIN'&&
                   progress.child){
                  nextResidual=scanCpcxObligations(progress.child).find(o=>
                    o.player===0&&
                    o.lineId===inheritance.handoffResidual.lineId
                  )??null;
                  if(nextResidual&&progress.child.mover===1&&
                     classifyCpcxImmediate(progress.child).kind===
                       'NO_IMMEDIATE_OBLIGATION')
                    response=certifyCpcxProtectedDiagonalOpponentResponseDescent(
                      progress.child,{protectedResidual:nextResidual}
                    ),
                    response2=certifyCpcxProtectedDiagonalOpponentResponseDescentV2(
                      progress.child,{protectedResidual:nextResidual}
                    );
                }
                let forcedNormalization=null,
                  postForcedProgressOptions=[];
                if(
                  nextResidual&&progress.child&&
                  classifyCpcxImmediate(progress.child).kind==='FORCED_RESPONSE'
                ){
                  const n=certifyCpcxProtectedResidualForcedNormalization(
                    progress.child,{protectedResidual:nextResidual}
                  );
                  forcedNormalization={
                    kind:n.kind,
                    exact:n.exact??false,
                    seam:n.seam??null,
                    steps:(n.steps??[]).map(step=>({
                      cell:Number.isInteger(step.cell)?label(step.cell):null,
                      owner:step.owner??null,
                      kind:step.kind??null,
                    })),
                    finalRank:n.finalRank??null,
                    finalMover:n.finalPosition?.mover??null,
                    finalSupport:n.finalPosition
                      ?Array.from(n.finalPosition.heights):null,
                    finalMissing:(n.finalMissingCells??[]).map(label),
                    finalSupportVector:n.finalSupportVector??null,
                  };
                  if(
                    n.exact&&
                    n.kind==='PROTECTED_RESIDUAL_FORCED_NORMALIZATION'&&
                    n.finalPosition?.mover===0
                  ){
                    const nr=scanCpcxObligations(n.finalPosition).find(o=>
                      o.player===0&&o.lineId===nextResidual.lineId
                    )??null;
                    if(nr){
                      postForcedProgressOptions=nr.events.map(ne=>{
                        const np=ne.supportDistance===0
                          ?certifyCpcxProtectedResidualTargetAcquisition(
                            n.finalPosition,{
                              controllerResidual:nr,targetCell:ne.cell,
                            }
                          )
                          :certifyCpcxProtectedResidualSupportAdvance(
                            n.finalPosition,{
                              controllerResidual:nr,targetCell:ne.cell,
                            }
                          );
                        let rr=null,rr2=null,nr2=null;
                        if(np.exact&&np.kind!=='CERTIFIED_FIRST_WIN'&&np.child){
                          nr2=scanCpcxObligations(np.child).find(o=>
                            o.player===0&&o.lineId===nr.lineId
                          )??null;
                          if(nr2&&np.child.mover===1&&
                             classifyCpcxImmediate(np.child).kind===
                               'NO_IMMEDIATE_OBLIGATION')
                            rr=certifyCpcxProtectedDiagonalOpponentResponseDescent(
                              np.child,{protectedResidual:nr2}
                            ),
                            rr2=certifyCpcxProtectedDiagonalOpponentResponseDescentV2(
                              np.child,{protectedResidual:nr2}
                            );
                        }
                        return {
                          target:label(ne.cell),
                          sourceSupportDistance:ne.supportDistance,
                          progressKind:np.kind,
                          progressExact:np.exact??false,
                          progressSeam:np.seam??null,
                          actionCell:Number.isInteger(np.actionCell)
                            ?label(np.actionCell):null,
                          terminalPlayer:np.player??null,
                          childResidual:nr2?{
                            missingCount:nr2.missingCount,
                            missing:nr2.missingCells.map(label),
                            support:nr2.events.map(x=>x.supportDistance),
                          }:null,
                          childImmediate:np.child
                            ?classifyCpcxImmediate(np.child).kind:null,
                          responseDescent:rr?{
                            kind:rr.kind,
                            exact:rr.exact??false,
                            seam:rr.seam??null,
                            sourceMeasure:rr.sourceMeasure??null,
                            eventCount:rr.eventCount??null,
                            failureCount:rr.failures?.length??0,
                            everyEventWinsOrStrictlyDescends:
                              rr.everyEventWinsOrStrictlyDescends??false,
                          }:null,
                          responseDescentV2:rr2?{
                            kind:rr2.kind,
                            exact:rr2.exact??false,
                            seam:rr2.seam??null,
                            sourceMeasure:rr2.sourceMeasure??null,
                            eventCount:rr2.eventCount??null,
                            failureCount:rr2.failures?.length??0,
                            everyEventWinsOrStrictlyDescends:
                              rr2.everyEventWinsOrStrictlyDescends??false,
                          }:null,
                        };
                      });
                    }
                  }
                }
                return {
                  target:label(e.cell),
                  sourceSupportDistance:e.supportDistance,
                  progressKind:progress.kind,
                  progressExact:progress.exact??false,
                  progressSeam:progress.seam??null,
                  actionCell:Number.isInteger(progress.actionCell)
                    ?label(progress.actionCell):null,
                  terminalPlayer:progress.player??null,
                  childResidual:nextResidual?{
                    missingCount:nextResidual.missingCount,
                    missing:nextResidual.missingCells.map(label),
                    support:nextResidual.events.map(x=>x.supportDistance),
                  }:null,
                  childImmediate:progress.child
                    ?classifyCpcxImmediate(progress.child).kind:null,
                  responseDescent:response?{
                    kind:response.kind,
                    exact:response.exact??false,
                    seam:response.seam??null,
                    sourceMeasure:response.sourceMeasure??null,
                    eventCount:response.eventCount??null,
                    failureCount:response.failures?.length??0,
                    everyEventWinsOrStrictlyDescends:
                      response.everyEventWinsOrStrictlyDescends??false,
                  }:null,
                  responseDescentV2:response2?{
                    kind:response2.kind,
                    exact:response2.exact??false,
                    seam:response2.seam??null,
                    sourceMeasure:response2.sourceMeasure??null,
                    eventCount:response2.eventCount??null,
                    failureCount:response2.failures?.length??0,
                    everyEventWinsOrStrictlyDescends:
                      response2.everyEventWinsOrStrictlyDescends??false,
                  }:null,
                  forcedNormalization,
                  postForcedProgressOptions,
                };
              });
              const saturation=
                certifyCpcxProtectedDiagonalControllerSaturation(
                  inheritance.child,{
                    protectedResidual:inheritance.handoffResidual,
                  }
                ),
                saturationV2=
                  certifyCpcxProtectedDiagonalControllerSaturationV2(
                    inheritance.child,{
                      protectedResidual:inheritance.handoffResidual,
                    }
                  );
              let responseDescent=null,responseDescentV2=null,
                singletonReservoir=null,singletonOneDefect=null;
              if(
                saturation.exact&&
                saturation.kind==='PROTECTED_DIAGONAL_CONTROLLER_SATURATION'
              )responseDescent=
                certifyCpcxProtectedDiagonalOpponentResponseDescent(
                  saturation.finalPosition,{
                    protectedResidual:saturation.finalResidual,
                  }
                );
              if(
                saturationV2.exact&&
                saturationV2.kind==='PROTECTED_DIAGONAL_CONTROLLER_SATURATION_V2'
              ){
                responseDescentV2=
                  certifyCpcxProtectedDiagonalOpponentResponseDescentV2(
                    saturationV2.finalPosition,{
                      protectedResidual:saturationV2.finalResidual,
                    }
                  );
                if(
                  saturationV2.finalResidual?.missingCount===1&&
                  saturationV2.finalPosition?.mover===1
                ){
                  const targetCell=saturationV2.finalResidual.missingCells[0];
                  singletonReservoir=certifyCpcxTruncatedTargetReservoir(
                    saturationV2.finalPosition,{
                      attacker:0,
                      targetCell,
                    }
                  );
                  singletonOneDefect=analyzeCpcxOneDefectTargetReservoir(
                    saturationV2.finalPosition,{
                      attacker:0,
                      targetCell,
                    }
                  );
                }
              }
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
                  progressOptions,
                },
                saturationV2:{
                  kind:saturationV2.kind,
                  exact:saturationV2.exact??false,
                  seam:saturationV2.seam??null,
                  player:saturationV2.player??null,
                  sourceMeasure:saturationV2.sourceMeasure??null,
                  finalMeasure:saturationV2.finalMeasure??null,
                  finalRank:saturationV2.finalRank??null,
                  finalResidual:saturationV2.finalResidual?{
                    lineId:saturationV2.finalResidual.lineId,
                    lineLabel:saturationV2.finalResidual.lineLabel,
                    missingCount:saturationV2.finalResidual.missingCount,
                    missing:saturationV2.finalResidual.missingCells.map(label),
                    support:saturationV2.finalResidual.events.map(e=>
                      e.supportDistance
                    ),
                    playable:saturationV2.finalResidual.currentlyPlayableCells.map(label),
                  }:null,
                  trace:(saturationV2.trace??[]).map(t=>({
                    kind:t.kind,
                    iteration:t.iteration??null,
                    actionCell:Number.isInteger(t.actionCell)
                      ?label(t.actionCell):null,
                    selectedTarget:Number.isInteger(t.selectedTarget)
                      ?label(t.selectedTarget):null,
                    selectedMode:t.selectedMode??null,
                    sourceMeasure:t.sourceMeasure??null,
                    childMeasure:t.childMeasure??null,
                    boundary:t.boundary?.kind??null,
                  })),
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
                  finalResidual:saturation.finalResidual?{
                    lineId:saturation.finalResidual.lineId,
                    lineLabel:saturation.finalResidual.lineLabel,
                    missingCount:saturation.finalResidual.missingCount,
                    missing:saturation.finalResidual.missingCells.map(label),
                    support:saturation.finalResidual.events.map(e=>
                      e.supportDistance
                    ),
                    playable:saturation.finalResidual.currentlyPlayableCells.map(label),
                  }:null,
                  trace:(saturation.trace??[]).map(t=>({
                    kind:t.kind,
                    iteration:t.iteration??null,
                    actionCell:Number.isInteger(t.actionCell)
                      ?label(t.actionCell):null,
                    selectedTarget:Number.isInteger(t.selectedTarget)
                      ?label(t.selectedTarget):null,
                    selectedMode:t.selectedMode??null,
                    sourceMeasure:t.sourceMeasure??null,
                    childMeasure:t.childMeasure??null,
                    boundary:t.boundary?.kind??null,
                    forcedEvents:(t.forcedEvents??[]).map(e=>({
                      cell:Number.isInteger(e.cell)?label(e.cell):null,
                      player:e.player??null,
                    })),
                  })),
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
                singletonReservoir:singletonReservoir?{
                  kind:singletonReservoir.kind,
                  exact:singletonReservoir.exact??false,
                  player:singletonReservoir.player??null,
                  seam:singletonReservoir.seam??null,
                  target:singletonReservoir.target?{
                    cell:label(singletonReservoir.target.cell),
                    supportDistance:singletonReservoir.target.supportDistance,
                    lineLabel:singletonReservoir.target.lineLabel,
                  }:null,
                }:null,
                singletonOneDefect:singletonOneDefect?{
                  kind:singletonOneDefect.kind,
                  exact:singletonOneDefect.exact??false,
                  totalRelevantEvents:
                    singletonOneDefect.totalRelevantEvents??null,
                  minimumUncoveredResiduals:
                    singletonOneDefect.minimumUncoveredResiduals??null,
                  fullCoverageTemplateCount:
                    singletonOneDefect.fullCoverageTemplateCount??null,
                }:null,
                responseDescentV2:responseDescentV2?{
                  kind:responseDescentV2.kind,
                  exact:responseDescentV2.exact??false,
                  seam:responseDescentV2.seam??null,
                  player:responseDescentV2.player??null,
                  sourceMeasure:responseDescentV2.sourceMeasure??null,
                  eventCount:responseDescentV2.eventCount??null,
                  failureCount:responseDescentV2.failures?.length??0,
                  failures:(responseDescentV2.failures??[]).map(f=>({
                    eventCell:Number.isInteger(f.eventCell)
                      ?label(f.eventCell):null,
                    seam:f.seam??f.kind??null,
                    transportKind:f.transportKind??null,
                    transitionSeam:f.transition?.seam??null,
                    closureSeam:f.closure?.seam??null,
                    closureBoundary:f.closure?.boundary?{
                      kind:f.closure.boundary.kind,
                      threatCells:(f.closure.boundary.threatCells??[]).map(label),
                      winningCells:(f.closure.boundary.winningCells??[]).map(label),
                    }:null,
                    closureCertificate:f.closure?.certificate?{
                      kind:f.closure.certificate.kind,
                      seam:f.closure.certificate.seam??null,
                      sourceMeasure:f.closure.certificate.sourceMeasure??null,
                      currentMeasure:f.closure.certificate.currentMeasure??null,
                    }:null,
                  })),
                  everyEventWinsOrStrictlyDescends:
                    responseDescentV2.everyEventWinsOrStrictlyDescends??false,
                }:null,
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
                    closureBoundary:f.closure?.boundary?{
                      kind:f.closure.boundary.kind,
                      threatCells:(f.closure.boundary.threatCells??[]).map(label),
                      winningCells:(f.closure.boundary.winningCells??[]).map(label),
                    }:null,
                    closureCertificate:f.closure?.certificate?{
                      kind:f.closure.certificate.kind,
                      seam:f.closure.certificate.seam??null,
                      sourceMeasure:f.closure.certificate.sourceMeasure??null,
                      currentMeasure:f.closure.certificate.currentMeasure??null,
                      descent:f.closure.certificate.descent?{
                        kind:f.closure.certificate.descent.kind,
                        seam:f.closure.certificate.descent.seam??null,
                        selectedTarget:Number.isInteger(
                          f.closure.certificate.descent.selectedTarget
                        )?label(f.closure.certificate.descent.selectedTarget):null,
                        actionCell:Number.isInteger(
                          f.closure.certificate.descent.actionCell
                        )?label(f.closure.certificate.descent.actionCell):null,
                      }:null,
                    }:null,
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
            let exactProgressFirst=null;
            if(
              !child.terminal&&progress?.exact&&
              inheritance.exact&&
              inheritance.kind==='PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF'
            ){
              let successor=null;
              if(progress.kind==='FORCED_NORMALIZATION')
                successor=composeCpcxForcedNormalization(child,progress);
              else if(progress.kind==='CERTIFIED_FORCING_MACRO')
                successor=composeCpcxForcingMacro(child,progress);
              if(successor){
                const q=successor.concretePosition??null,
                  R=q?scanCpcxObligations(q).find(o=>
                    o.player===0&&
                    o.lineId===inheritance.handoffResidual.lineId
                  )??null:null;
                let saturation2=null,response2=null;
                if(q&&R&&q.mover===0){
                  saturation2=certifyCpcxProtectedDiagonalControllerSaturationV2(
                    q,{protectedResidual:R}
                  );
                  if(
                    saturation2.exact&&
                    saturation2.kind===
                      'PROTECTED_DIAGONAL_CONTROLLER_SATURATION_V2'
                  )response2=
                    certifyCpcxProtectedDiagonalOpponentResponseDescentV2(
                      saturation2.finalPosition,{
                        protectedResidual:saturation2.finalResidual,
                      }
                    );
                }else if(q&&R&&q.mover===1&&
                         classifyCpcxImmediate(q).kind==='NO_IMMEDIATE_OBLIGATION'){
                  response2=certifyCpcxProtectedDiagonalOpponentResponseDescentV2(
                    q,{protectedResidual:R}
                  );
                }
                exactProgressFirst={
                  successorKind:successor.kind,
                  exact:successor.exact??false,
                  seam:successor.seam??null,
                  player:successor.player??null,
                  sourceKind:successor.source?.kind??null,
                  sourceSetupCell:Number.isInteger(successor.source?.setupCell)
                    ?label(successor.source.setupCell):null,
                  rankDescriptor:successor.rank??null,
                  guaranteedResidualCount:
                    successor.guaranteedResiduals?.length??null,
                  concrete:Boolean(q),
                  rank:q?.rank??null,
                  mover:q?.mover??null,
                  protectedResidual:R?{
                    lineId:R.lineId,
                    lineLabel:R.lineLabel,
                    missingCount:R.missingCount,
                    missing:R.missingCells.map(label),
                    support:R.events.map(e=>e.supportDistance),
                  }:null,
                  saturationV2:saturation2?{
                    kind:saturation2.kind,
                    exact:saturation2.exact??false,
                    seam:saturation2.seam??null,
                    finalMeasure:saturation2.finalMeasure??null,
                    finalResidual:saturation2.finalResidual?{
                      missingCount:saturation2.finalResidual.missingCount,
                      missing:saturation2.finalResidual.missingCells.map(label),
                      support:saturation2.finalResidual.events.map(e=>
                        e.supportDistance
                      ),
                    }:null,
                  }:null,
                  responseDescentV2:response2?{
                    kind:response2.kind,
                    exact:response2.exact??false,
                    seam:response2.seam??null,
                    sourceMeasure:response2.sourceMeasure??null,
                    eventCount:response2.eventCount??null,
                    failureCount:response2.failures?.length??0,
                    everyEventWinsOrStrictlyDescends:
                      response2.everyEventWinsOrStrictlyDescends??false,
                  }:null,
                };
              }
            }
            noTransferTargetBlockProbe={
              blockedCell:label(dangerous.cell),
              targetInheritance:inheritanceClosure,
              exactProgressFirst,
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
              verticalThreeStage:child.terminal?[]:
                findCpcxVerticalThreeStageObligations(child,{player:0})
                  .map(demand=>{
                    const certificate=certifyCpcxVerticalThreeStageSetup(
                        child,demand
                      ),
                      setup=applyCpcxForcedEvent(child,demand.setupCell),
                      childDemand=setup.terminal?null:
                        findCpcxVerticalTwoStageObligations(
                          setup,{player:0}
                        ).find(x=>
                          x.obligation.lineId===demand.obligation.lineId&&
                          x.lowerCell===demand.middleCell&&
                          x.upperCell===demand.upperCell
                        )??null,
                      childCertificate=childDemand
                        ?certifyCpcxVerticalTwoStage(setup,childDemand)
                        :null,
                      partition=childDemand&&
                        childCertificate?.kind==='POST_LOWER_FIRST_WIN_GUARD_FAILURE'
                        ?partitionCpcxVerticalTwoStageGuard(
                          setup,childDemand,childCertificate
                        )
                        :null;
                    return {
                      lineId:demand.obligation.lineId,
                      lineLabel:demand.obligation.lineLabel,
                      setupCell:label(demand.setupCell),
                      middleCell:label(demand.middleCell),
                      upperCell:label(demand.upperCell),
                      kind:certificate.kind,
                      exact:certificate.exact??false,
                      seam:certificate.seam??null,
                      childCertificateKind:
                        childCertificate?.kind??
                        certificate.childCertificate?.kind??null,
                      childCertificateExact:
                        childCertificate?.exact??
                        certificate.childCertificate?.exact??false,
                      riskCount:childCertificate?.risks?.length??0,
                      risks:(childCertificate?.risks??[]).map(x=>({
                        kind:x.kind,
                        defenderMove:Number.isInteger(x.defenderMove)
                          ?label(x.defenderMove):null,
                        targetCell:Number.isInteger(x.targetCell)
                          ?label(x.targetCell):null,
                        obligationId:x.obligationId??null,
                      })),
                      partition:partition?{
                        preemptCell:label(partition.preemptCell),
                        safeNonpreemptFrontier:
                          partition.safeNonpreemptFrontier.map(label),
                        hazardClasses:
                          partition.guardNormalizationClasses.map(x=>{
                            const afterHazard=applyCpcxForcedEvent(
                                setup,x.defenderMove
                              ),
                              normalized=afterHazard.terminal
                                ?null
                                :closeCpcxForcedResponses(afterHazard),
                              q=normalized?.kind==='OPEN'
                                ?normalized.position:null,
                              qp=q?classifyCpcxProgress(q,{player:0}):null,
                              qf=q?runCpcxFirstWinCertificate(
                                q,{attacker:0}
                              ):null,
                              vertical=q
                                ?findCpcxVerticalTwoStageObligations(
                                  q,{player:0}
                                ).map(d=>({
                                  lineId:d.obligation.lineId,
                                  lineLabel:d.obligation.lineLabel,
                                  lower:label(d.lowerCell),
                                  upper:label(d.upperCell),
                                  certificate:(()=>{
                                    const c=certifyCpcxVerticalTwoStage(q,d);
                                    return {
                                      kind:c.kind,
                                      exact:c.exact??false,
                                      riskCount:c.risks?.length??0,
                                    };
                                  })(),
                                }))
                                :[];
                            return {
                              defenderMove:label(x.defenderMove),
                              targetCells:x.targetCells.map(label),
                              terminal:afterHazard.terminal,
                              normalization:normalized?{
                                kind:normalized.kind,
                                player:normalized.player??null,
                                stepCount:normalized.steps?.length??0,
                                steps:(normalized.steps??[]).map(step=>({
                                  cell:label(step.cell),
                                  player:step.player,
                                })),
                                boundary:normalized.boundary?.kind??null,
                                finalRank:q?.rank??null,
                                finalMover:q?.mover??null,
                                finalSupport:q
                                  ?Array.from(q.heights):null,
                              }:null,
                              progress:qp?progressSummary(qp):null,
                              firstWin:qf?{
                                kind:qf.kind,
                                exact:qf.exact??false,
                                player:qf.player??null,
                                seam:qf.seam??null,
                                traceLength:qf.trace?.length??0,
                              }:null,
                              verticalTwoStage:vertical.map(v=>{
                                if(v.certificate.kind!==
                                     'POST_LOWER_FIRST_WIN_GUARD_FAILURE')
                                  return v;
                                const d=findCpcxVerticalTwoStageObligations(
                                    q,{player:0}
                                  ).find(x=>
                                    x.obligation.lineId===v.lineId&&
                                    label(x.lowerCell)===v.lower&&
                                    label(x.upperCell)===v.upper
                                  ),
                                  c=d?certifyCpcxVerticalTwoStage(q,d):null,
                                  pp=d&&c&&
                                    c.kind==='POST_LOWER_FIRST_WIN_GUARD_FAILURE'
                                    ?partitionCpcxVerticalTwoStageGuard(q,d,c)
                                    :null;
                                return {
                                  ...v,
                                  risks:(c?.risks??[]).map(x=>({
                                    kind:x.kind,
                                    defenderMove:Number.isInteger(x.defenderMove)
                                      ?label(x.defenderMove):null,
                                    targetCell:Number.isInteger(x.targetCell)
                                      ?label(x.targetCell):null,
                                    obligationId:x.obligationId??null,
                                  })),
                                  partition:pp?{
                                    preemptCell:label(pp.preemptCell),
                                    safeNonpreemptFrontier:
                                      pp.safeNonpreemptFrontier.map(label),
                                    hazardClasses:
                                      pp.guardNormalizationClasses.map(x=>({
                                        defenderMove:label(x.defenderMove),
                                        targetCells:x.targetCells.map(label),
                                      })),
                                    responseClasses:pp.responseClasses,
                                  }:null,
                                };
                              }),
                              postProgress:(()=>{
                                if(!q||!qp?.exact||
                                   qp.kind!=='CERTIFIED_FORCING_MACRO')
                                  return null;
                                const successor=composeCpcxForcingMacro(q,qp),
                                  next=successor?.concretePosition??null;
                                if(!successor?.exact)return {
                                  kind:successor?.kind??null,
                                  exact:false,
                                  seam:successor?.seam??null,
                                };
                                if(!next)return {
                                  kind:successor.kind,
                                  exact:true,
                                  concrete:false,
                                  sourceKind:successor.source?.kind??null,
                                  rank:successor.rank??null,
                                };
                                const np=classifyCpcxProgress(
                                    next,{player:0}
                                  ),
                                  nf=runCpcxFirstWinCertificate(
                                    next,{attacker:0}
                                  );
                                let forcedFollowup=null;
                                if(np.kind==='FORCED_NORMALIZATION'){
                                  const closed=closeCpcxForcedResponses(next),
                                    q2=closed.kind==='OPEN'
                                      ?closed.position:null,
                                    p2=q2?classifyCpcxProgress(
                                      q2,{player:0}
                                    ):null,
                                    f2=q2?runCpcxFirstWinCertificate(
                                      q2,{attacker:0}
                                    ):null,
                                    latent=q2?scanCpcxObligations(q2)
                                      .filter(o=>
                                        o.player===0&&
                                        o.missingCount===1&&
                                        o.events[0].supportDistance>0
                                      ).map(o=>{
                                        const targetCell=o.missingCells[0],
                                          ordinary=
                                            certifyCpcxTruncatedTargetReservoir(
                                              q2,{
                                                attacker:0,
                                                targetCell,
                                              }
                                            ),
                                          one=
                                            analyzeCpcxOneDefectTargetReservoir(
                                              q2,{
                                                attacker:0,
                                                targetCell,
                                              }
                                            );
                                        return {
                                          lineId:o.lineId,
                                          lineLabel:o.lineLabel,
                                          targetCell:label(targetCell),
                                          supportDistance:
                                            o.events[0].supportDistance,
                                          truncated:{
                                            kind:ordinary.kind,
                                            exact:ordinary.exact??false,
                                            player:ordinary.player??null,
                                            seam:ordinary.seam??null,
                                          },
                                          oneDefect:{
                                            kind:one.kind,
                                            exact:one.exact??false,
                                            totalRelevantEvents:
                                              one.totalRelevantEvents??null,
                                            minimumUncoveredResiduals:
                                              one.minimumUncoveredResiduals??null,
                                            fullCoverageTemplateCount:
                                              one.fullCoverageTemplateCount??null,
                                          },
                                          cpc2:(()=>{
                                            const c=
                                              deriveCpcxDisjunctiveBlockObligation(
                                                q2,{attacker:0}
                                              );
                                            return {
                                              kind:c.kind,
                                              exact:c.exact??false,
                                              player:c.player??null,
                                              seam:c.seam??null,
                                              blockingCells:
                                                (c.blockingCells??[])
                                                  .map(label),
                                              triggerCells:
                                                (c.triggerCertificates??[])
                                                  .map(x=>label(x.triggerCell)),
                                              unresolvedMoves:
                                                (c.unresolvedMoves??[])
                                                  .map(x=>{
                                                    const after=
                                                      applyCpcxForcedEvent(
                                                        q2,x.defenderCell
                                                      );
                                                    if(after.terminal)return {
                                                      defenderCell:
                                                        label(x.defenderCell),
                                                      reasons:
                                                        (x.unresolved??[])
                                                          .map(y=>y.reason),
                                                      terminal:
                                                        after.terminal,
                                                      forcedNormalization:null,
                                                    };
                                                    const closedHazard=
                                                        closeCpcxForcedResponses(
                                                          after
                                                        ),
                                                      q3=closedHazard.kind===
                                                        'OPEN'
                                                        ?closedHazard.position
                                                        :null,
                                                      c2=q3?
                                                        deriveCpcxDisjunctiveBlockObligation(
                                                          q3,{attacker:0}
                                                        ):null,
                                                      p3=q3?
                                                        classifyCpcxProgress(
                                                          q3,{player:0}
                                                        ):null,
                                                      f3=q3?
                                                        runCpcxFirstWinCertificate(
                                                          q3,{attacker:0}
                                                        ):null,
                                                      one3=q3?
                                                        analyzeCpcxOneDefectTargetReservoir(
                                                          q3,{
                                                            attacker:0,
                                                            targetCell,
                                                          }
                                                        ):null;
                                                    return {
                                                      defenderCell:
                                                        label(x.defenderCell),
                                                      reasons:
                                                        (x.unresolved??[])
                                                          .map(y=>y.reason),
                                                      terminal:null,
                                                      forcedNormalization:{
                                                        kind:
                                                          closedHazard.kind,
                                                        player:
                                                          closedHazard.player??
                                                          null,
                                                        steps:
                                                          (closedHazard.steps??
                                                            []).map(step=>({
                                                              cell:
                                                                label(step.cell),
                                                              player:
                                                                step.player,
                                                            })),
                                                        rank:q3?.rank??null,
                                                        mover:q3?.mover??null,
                                                        support:q3?
                                                          Array.from(
                                                            q3.heights
                                                          ):null,
                                                        cpc2:c2?{
                                                          kind:c2.kind,
                                                          exact:
                                                            c2.exact??false,
                                                          seam:
                                                            c2.seam??null,
                                                          blockingCells:
                                                            (c2.blockingCells??
                                                              []).map(label),
                                                          triggerCells:
                                                            (c2.triggerCertificates??
                                                              []).map(y=>
                                                                label(
                                                                  y.triggerCell
                                                                )
                                                              ),
                                                          unresolvedCount:
                                                            c2.unresolvedMoves?.
                                                              length??0,
                                                        }:null,
                                                        progress:p3?
                                                          progressSummary(p3):
                                                          null,
                                                        firstWin:f3?{
                                                          kind:f3.kind,
                                                          exact:
                                                            f3.exact??false,
                                                          player:
                                                            f3.player??null,
                                                          seam:
                                                            f3.seam??null,
                                                          traceLength:
                                                            f3.trace?.length??
                                                            0,
                                                        }:null,
                                                        oneDefect:one3?{
                                                          kind:one3.kind,
                                                          exact:
                                                            one3.exact??false,
                                                          totalRelevantEvents:
                                                            one3.
                                                              totalRelevantEvents??
                                                            null,
                                                          minimumUncoveredResiduals:
                                                            one3.
                                                              minimumUncoveredResiduals??
                                                            null,
                                                          fullCoverageTemplateCount:
                                                            one3.
                                                              fullCoverageTemplateCount??
                                                            null,
                                                        }:null,
                                                      },
                                                    };
                                                  }),
                                            };
                                          })(),
                                          rcic:(()=>{
                                            const c=
                                              certifyCpcxOneDefectTargetReservoirRcic(
                                                q2,{
                                                  attacker:0,
                                                  targetCell,
                                                  maxNodes:8192,
                                                  useCpc2Restriction:true,
                                                }
                                              );
                                            return {
                                              kind:c.kind,
                                              exact:c.exact??false,
                                              player:c.player??null,
                                              seam:c.seam??null,
                                              nodeCount:c.nodeCount??null,
                                              rootMeasure:
                                                c.rootMeasure??
                                                c.rootReservoirRank??null,
                                            };
                                          })(),
                                          attachmentRcic:(()=>{
                                            const c=
                                              certifyCpcxOneDefectAttachmentRcic(
                                                q2,{
                                                  attacker:0,
                                                  targetCell,
                                                  maxNodes:8192,
                                                  useCpc2Restriction:true,
                                                }
                                              );
                                            return {
                                              kind:c.kind,
                                              exact:c.exact??false,
                                              player:c.player??null,
                                              seam:c.seam??null,
                                              nodeCount:c.nodeCount??null,
                                              rootGap:c.rootGap??null,
                                              rootReservoirRank:
                                                c.rootReservoirRank??null,
                                            };
                                          })(),
                                        };
                                      }):[];
                                  forcedFollowup={
                                    normalization:{
                                      kind:closed.kind,
                                      player:closed.player??null,
                                      stepCount:closed.steps?.length??0,
                                      steps:(closed.steps??[]).map(step=>({
                                        cell:label(step.cell),
                                        player:step.player,
                                      })),
                                      boundary:closed.boundary?.kind??null,
                                    },
                                    rank:q2?.rank??null,
                                    mover:q2?.mover??null,
                                    support:q2?Array.from(q2.heights):null,
                                    progress:p2?progressSummary(p2):null,
                                    firstWin:f2?{
                                      kind:f2.kind,
                                      exact:f2.exact??false,
                                      player:f2.player??null,
                                      seam:f2.seam??null,
                                      traceLength:f2.trace?.length??0,
                                    }:null,
                                    latentP0Singletons:latent,
                                    p0SmallResiduals:q2
                                      ?smallResidualSummary(q2,0).slice(0,16)
                                      :[],
                                    p1SmallResiduals:q2
                                      ?smallResidualSummary(q2,1).slice(0,16)
                                      :[],
                                  };
                                }
                                return {
                                  kind:successor.kind,
                                  exact:true,
                                  concrete:true,
                                  sourceKind:successor.source?.kind??null,
                                  rank:next.rank,
                                  mover:next.mover,
                                  support:Array.from(next.heights),
                                  progress:progressSummary(np),
                                  firstWin:{
                                    kind:nf.kind,
                                    exact:nf.exact??false,
                                    player:nf.player??null,
                                    seam:nf.seam??null,
                                    traceLength:nf.trace?.length??0,
                                  },
                                  forcedFollowup,
                                  p0SmallResiduals:
                                    smallResidualSummary(next,0).slice(0,16),
                                  p1SmallResiduals:
                                    smallResidualSummary(next,1).slice(0,16),
                                };
                              })(),
                            };
                          }),
                        responseClasses:partition.responseClasses,
                      }:null,
                    };
                  }),
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
    targetInheritanceSaturationV2ExactCount:noTransferProbes.filter(x=>
      x.targetInheritance?.saturationV2?.exact===true
    ).length,
    targetInheritanceResponseDescentV2ExactCount:noTransferProbes.filter(x=>
      x.targetInheritance?.responseDescentV2?.exact===true
    ).length,
    targetInheritanceSingletonReservoirFirstWinCount:noTransferProbes.filter(x=>
      x.targetInheritance?.singletonReservoir?.kind==='CERTIFIED_FIRST_WIN'&&
      x.targetInheritance.singletonReservoir.player===0
    ).length,
    exactProgressFirstCount:noTransferProbes.filter(x=>
      x.exactProgressFirst?.exact===true
    ).length,
    exactProgressFirstResponseV2Count:noTransferProbes.filter(x=>
      x.exactProgressFirst?.responseDescentV2?.exact===true
    ).length,
    targetInheritanceResponseDescentExactCount:noTransferProbes.filter(x=>
      x.targetInheritance?.responseDescent?.exact===true
    ).length,
    targetInheritanceProgressOptionCensus:noTransferProbes.map(x=>({
      blockedCell:x.blockedCell,
      options:(x.targetInheritance?.handoff?.progressOptions??[]).map(o=>({
        target:o.target,
        sourceSupportDistance:o.sourceSupportDistance,
        progressKind:o.progressKind,
        progressExact:o.progressExact,
        progressSeam:o.progressSeam,
        actionCell:o.actionCell,
        childImmediate:o.childImmediate,
        responseKind:o.responseDescent?.kind??null,
        responseExact:o.responseDescent?.exact??false,
        responseSeam:o.responseDescent?.seam??null,
      })),
    })),
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

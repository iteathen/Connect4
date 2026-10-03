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
import {
  certifyCpcxProtectedDiagonalOpponentResponseDescent,
} from './cpcx-opponent-response-descent.mjs';
import {
  certifyCpcxProtectedResidualDiagonalTransfer,
} from './cpcx-diagonal-transfer.mjs';
import {
  certifyCpcxProtectedDiagonalAnchorPivot,
} from './cpcx-diagonal-anchor-pivot.mjs';

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
      novelMaskSecondLayerProbes.push({
        mask:endpointMask,
        sourceMeasure:row.sourceMeasure,
        endpointMeasure:row.finalMeasure,
        firstLayerEventCell:label(row.eventCell),
        exact:probe.exact??false,
        kind:probe.kind,
        seam:probe.seam??null,
        eventCount:probe.eventCount??null,
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
  endpoints,
  summary:{
    sourceBoundaryCount:sources.size,
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
    currentPlayableTargetTransferAuditOnly:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
    futureTreeGeneration:false,
    noBestSetConclusion:true,
  },
},null,2));

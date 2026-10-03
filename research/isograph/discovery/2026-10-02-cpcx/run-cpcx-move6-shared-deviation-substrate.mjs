import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {collapseCpcxDebtRepairTokenProduct} from './cpcx-token-collapse.mjs';
import {
  reflectCpcxCell,
  reflectCpcxOrientation,
} from './cpcx-control-quotient.mjs';
import {
  lowerBoundCpcxAbstractResidualCompletion,
} from './cpcx-deadline.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function lineKey(lineId,reflect){
  const cells=g.lines[lineId].cells
    .map(cell=>reflect?reflectCpcxCell(g,cell):cell)
    .sort((a,b)=>a-b);
  return cells.join(',');
}

function normalizeResidual(residual,reflect,successor){
  const originalCells=[...residual.missingCells],
    mappedCellPairs=originalCells.map((cell,index)=>({
      cell:reflect?reflectCpcxCell(g,cell):cell,
      index,
    })).sort((a,b)=>a.cell-b.cell),
    mappedCells=mappedCellPairs.map(x=>x.cell),
    supportProfiles=(residual.supportProfiles??[]).map(profile=>
      mappedCellPairs.map(x=>profile[x.index])
    ).sort((a,b)=>{
      const n=Math.min(a.length,b.length);
      for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
      return a.length-b.length;
    });
  const events=residual.events.map(e=>({
    cell:reflect?reflectCpcxCell(g,e.cell):e.cell,
    minSupportDistance:e.minSupportDistance,
    maxSupportDistance:e.maxSupportDistance,
    eventRankParity:e.eventRankParity,
    eventRankParityConsistent:e.eventRankParityConsistent??true,
  })).sort((a,b)=>a.cell-b.cell);

  const row={
    player:residual.player,
    orientation:reflect
      ?reflectCpcxOrientation(residual.orientation)
      :residual.orientation,
    missingCount:residual.missingCount,
    lineGeometry:lineKey(residual.lineId,reflect),
    missingCells:mappedCells,
    events,
    supportProfiles,
    supportProfilesExact:residual.supportProfilesExact===true,
    earliestCompletionLowerBound:
      lowerBoundCpcxAbstractResidualCompletion(
        {...successor,geometry:g},
        residual,
        {player:residual.player,cellCount:g.cellCount},
      ),
  };
  row.key=JSON.stringify({
    player:row.player,
    orientation:row.orientation,
    missingCount:row.missingCount,
    lineGeometry:row.lineGeometry,
    missingCells:row.missingCells,
    events:row.events,
  });
  return row;
}

function normalizedSupportPhase(phase,reflect){
  if(phase?.exact!==true||!Array.isArray(phase.vectors))return {
    exact:false,
    vectors:[],
  };
  const m=new Map();
  for(const vector of phase.vectors){
    const v=reflect?[...vector].reverse():[...vector];
    m.set(v.join(''),v);
  }
  return {
    exact:true,
    vectors:[...m.values()].sort((a,b)=>
      a.join('').localeCompare(b.join(''))
    ),
  };
}

function normalizedOpponentResidual(row,reflect){
  const sourceCells=[...(row.missingCells??[])],
    pairs=sourceCells.map((cell,index)=>({
      cell:reflect?reflectCpcxCell(g,cell):cell,
      index,
    })).sort((a,b)=>a.cell-b.cell),
    mappedCells=pairs.map(x=>x.cell),
    supportProfiles=(row.supportProfiles??[]).map(profile=>
      pairs.map(x=>profile[x.index])
    ).sort((a,b)=>{
      const n=Math.min(a.length,b.length);
      for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
      return a.length-b.length;
    });
  return {
    orientation:reflect
      ?reflectCpcxOrientation(row.orientation)
      :row.orientation,
    missingCount:row.missingCount,
    lineGeometry:lineKey(row.lineId,reflect),
    missingCells:mappedCells,
    supportProfiles,
    supportProfilesExact:row.supportProfilesExact===true,
  };
}

function normalizedOpponentEnvelope(envelope,reflect){
  if(envelope?.exact!==true)return {
    exact:false,
    possibleResiduals:[],
    guaranteedResiduals:[],
  };
  const sort=(a,b)=>
    a.missingCount-b.missingCount||
    a.orientation.localeCompare(b.orientation)||
    a.lineGeometry.localeCompare(b.lineGeometry)||
    a.missingCells.join(',').localeCompare(b.missingCells.join(','));
  return {
    exact:true,
    possibleResiduals:(envelope.possibleResiduals??[])
      .map(r=>normalizedOpponentResidual(r,reflect)).sort(sort),
    guaranteedResiduals:(envelope.guaranteedResiduals??[])
      .map(r=>normalizedOpponentResidual(r,reflect)).sort(sort),
  };
}

function normalizedToken(token,reflect){
  return {
    owner:token.owner,
    maxCount:token.maxCount??null,
    directKillCapacity:token.directKillCapacity??null,
    supportOnly:token.supportOnly??null,
    candidateCells:(token.candidateCells??[])
      .map(cell=>reflect?reflectCpcxCell(g,cell):cell)
      .sort((a,b)=>a-b),
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
      root,wing,repair,{retainComponents:false}
    );

  if(successor.kind==='CERTIFIED_FIRST_WIN'){
    rows.push({
      sixthMove:column+1,
      alreadyCertified:true,
      successorKind:successor.kind,
    });
    continue;
  }
  if(!successor.exact||successor.kind!=='ABSTRACT_SUCCESSOR')
    throw new Error('expected exact first-deviation abstract successor');

  const wingMean=wing.survivingFamily.columns.reduce((a,b)=>a+b,0)/
      wing.survivingFamily.columns.length,
    reflect=wingMean>(g.columns-1)/2,
    residuals=successor.guaranteedResiduals
      .map(r=>normalizeResidual(r,reflect,successor))
      .sort((a,b)=>
        a.missingCount-b.missingCount||
        a.orientation.localeCompare(b.orientation)||
        a.lineGeometry.localeCompare(b.lineGeometry)||
        a.key.localeCompare(b.key)
      ),
    blockerTokens=(successor.blockerTokens??[])
      .map(t=>normalizedToken(t,reflect)),
    supportPhase=normalizedSupportPhase(successor.supportPhase,reflect),
    opponentResidualEnvelope=normalizedOpponentEnvelope(
      successor.opponentResidualEnvelope,reflect
    ),
    singletonEnvelope=successor.opponentSingletonEnvelope??null;

  rows.push({
    sixthMove:column+1,
    alreadyCertified:false,
    reflectToCanonicalWing:reflect,
    survivingWing:wing.survivingFamily.columns
      .map(c=>reflect?g.columns-1-c:c)
      .sort((a,b)=>a-b)
      .map(c=>c+1),
    rank:successor.rank,
    nextMover:successor.nextMover,
    controlParityEquivalent:successor.controlParityEquivalent,
    supportPhase,
    opponentResidualEnvelope,
    residuals,
    blockerTokens,
    firstWinFacts:successor.firstWinFacts,
    opponentEarliestTerminalLowerBound:
      successor.firstWinFacts?.opponentEarliestTerminalLowerBound??null,
    opponentSingletonEnvelope:singletonEnvelope,
  });
}

const active=rows.filter(x=>!x.alreadyCertified);
if(!active.length)throw new Error('no unresolved carriers');

let commonKeys=new Set(active[0].residuals.map(r=>r.key));
for(const row of active.slice(1)){
  const keys=new Set(row.residuals.map(r=>r.key));
  commonKeys=new Set([...commonKeys].filter(k=>keys.has(k)));
}
const common=[...commonKeys]
  .map(key=>active[0].residuals.find(r=>r.key===key))
  .sort((a,b)=>
    a.missingCount-b.missingCount||
    a.orientation.localeCompare(b.orientation)||
    a.lineGeometry.localeCompare(b.lineGeometry)
  );

const pairRows=common.filter(r=>
  r.missingCount===2&&
  (r.orientation==='D+'||r.orientation==='D-')
);
const pairSupportProfileClasses=new Map();
for(const row of active){
  const pair=row.residuals.find(r=>
    r.missingCount===2&&
    r.missingCells[0]===15&&r.missingCells[1]===23
  );
  const key=JSON.stringify(pair?.supportProfiles??[]);
  if(!pairSupportProfileClasses.has(key))
    pairSupportProfileClasses.set(key,[]);
  pairSupportProfileClasses.get(key).push(row.sixthMove);
}

const nested=[];
for(const pair of pairRows){
  const pairSet=new Set(pair.missingCells);
  for(const larger of common){
    if(larger.missingCount<=2)continue;
    if(pair.missingCells.every(cell=>larger.missingCells.includes(cell)))
      nested.push({
        pairKey:pair.key,
        largerKey:larger.key,
        pair:{
          orientation:pair.orientation,
          missingCells:pair.missingCells,
          events:pair.events,
          lineGeometry:pair.lineGeometry,
        },
        larger:{
          orientation:larger.orientation,
          missingCount:larger.missingCount,
          missingCells:larger.missingCells,
          events:larger.events,
          lineGeometry:larger.lineGeometry,
        },
      });
  }
}

const phaseKeys=active.map(row=>
  JSON.stringify(row.supportPhase)
);
const uniquePhaseKeys=[...new Set(phaseKeys)];

const commonPairCells=new Set(pairRows.flatMap(r=>r.missingCells));
const opponentLowerBounds=active
  .map(row=>row.opponentEarliestTerminalLowerBound)
  .filter(Number.isInteger);
const opponentEnvelopeClasses=new Map();
for(const row of active){
  const key=JSON.stringify(row.opponentResidualEnvelope);
  if(!opponentEnvelopeClasses.has(key))opponentEnvelopeClasses.set(key,[]);
  opponentEnvelopeClasses.get(key).push(row.sixthMove);
}


const blockerAudit=active.map(row=>({
  sixthMove:row.sixthMove,
  tokenCount:row.blockerTokens.length,
  allSupportOnly:row.blockerTokens.every(t=>t.supportOnly===true),
  maxDirectKillCapacity:Math.max(0,...row.blockerTokens.map(t=>t.directKillCapacity??0)),
  candidateIntersectionWithCommonPair:[...new Set(row.blockerTokens.flatMap(t=>
    t.candidateCells.filter(cell=>commonPairCells.has(cell))
  ))].sort((a,b)=>a-b),
}));

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.shared-deviation-substrate.v0_1',
  root:'44444',
  stage:'FIRST_DEVIATION_AFTER_EXISTING_POLYNOMIAL_DEBT_VERTICAL_COLLAPSE',
  rows,
  commonResiduals:common,
  commonDiagonalPairs:pairRows,
  commonNestedRelations:nested,
  blockerAudit,
  summary:{
    carrierCount:active.length,
    commonResidualCount:common.length,
    commonDiagonalPairCount:pairRows.length,
    sharedPairSupportProfileClassCount:pairSupportProfileClasses.size,
    sharedPairSupportProfileClasses:[...pairSupportProfileClasses.entries()]
      .map(([key,moves])=>({moves,supportProfiles:JSON.parse(key)})),
    allSevenSharePairSupportProfiles:pairSupportProfileClasses.size===1,
    nestedCommonRelationCount:nested.length,
    allNextMoverP0:active.every(x=>x.nextMover===0),
    allControlParityEquivalent:active.every(x=>x.controlParityEquivalent===true),
    allSupportPhaseExact:active.every(x=>x.supportPhase?.exact===true),
    supportPhaseClassCount:uniquePhaseKeys.length,
    allSupportPhaseClassesEqual:uniquePhaseKeys.length===1,
    supportPhaseClass:uniquePhaseKeys.length===1?active[0].supportPhase:null,
    allOpponentSingletonEnvelopesExact:active.every(x=>
      x.opponentSingletonEnvelope?.exact===true
    ),
    allOpponentSingletonEnvelopesEmpty:active.every(x=>
      (x.opponentSingletonEnvelope?.possibleCells?.length??-1)===0
    ),
    opponentResidualEnvelopeClassCount:opponentEnvelopeClasses.size,
    opponentResidualEnvelopeClasses:[...opponentEnvelopeClasses.entries()]
      .map(([key,moves])=>({moves,envelope:JSON.parse(key)})),
    allSevenShareOpponentResidualEnvelope:opponentEnvelopeClasses.size===1,
    allOpponentTerminalLowerBoundsKnown:
      opponentLowerBounds.length===active.length,
    sharedOpponentEarliestTerminalLowerBound:
      opponentLowerBounds.length===active.length
        ?Math.min(...opponentLowerBounds)
        :null,
    opponentTerminalLowerBoundsByMove:Object.fromEntries(
      active.map(x=>[
        String(x.sixthMove),
        x.opponentEarliestTerminalLowerBound,
      ])
    ),
    allBlockersSupportOnly:blockerAudit.every(x=>x.allSupportOnly),
    allBlockersDisjointFromCommonPair:blockerAudit.every(x=>
      x.candidateIntersectionWithCommonPair.length===0
    ),
  },
  premises:{
    standardBoard:'7x6',
    targetSpecificDiagnostic:true,
    sourceCarriers:'existing set-wise CPCX debt repair + vertical two-stage/hazard collapse only',
    futureReplyExpansion:false,
    legalReplyTreeTraversal:false,
    solvedData:false,
    oracle:false,
    minimax:false,
    delayEquivalenceAssumed:false,
  },
  boundary:'common substrate is a theorem candidate only. Extra residuals are not projected away unless a claim-relative first-win theorem proves they are irrelevant to the selected certificate.',
},null,2));

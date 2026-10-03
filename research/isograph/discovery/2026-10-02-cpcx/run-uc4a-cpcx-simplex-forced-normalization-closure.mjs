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
import {
  certifyCpcxProtectedResidualSupportAdvance,
} from './cpcx-support-advance.mjs';
import {
  certifyCpcxProtectedResidualSupportTransition,
} from './cpcx-support-transition.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3',
  targetCells=['A6','B5','C4'].map(s=>
    (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65)
  ),
  b5=targetCells[1];

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
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function residual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine
  )??null;
}
function supportProfile(R){
  if(!R)return null;
  const m=new Map(R.events.map(e=>[e.cell,e.supportDistance]));
  return targetCells.map(cell=>R.missingCells.includes(cell)?m.get(cell):null);
}
function debt(R){
  return R?R.events.reduce((n,e)=>n+e.supportDistance,0):null;
}
function ownerClass(position){
  const owners=[];
  for(let c=0;c<3;c++)for(let r=0;r<position.heights[c];r++)
    owners.push(position.owner[r*g.columns+c]);
  if(!owners.length)return 'EMPTY';
  const s=new Set(owners);
  if(s.size>1)return 'MIXED';
  return owners[0]===0?'ALL_P0':'ALL_P1';
}
function immediateSummary(position){
  const x=classifyCpcxImmediate(position);
  return {
    kind:x.kind,
    mover:x.mover??null,
    cell:Number.isInteger(x.cell)?label(x.cell):null,
    winningCells:(x.winningCells??[]).map(label),
    opponentThreatCells:(x.opponentThreatCells??x.threatCells??[]).map(label),
  };
}
function stepEffect(before,after,eventCell,eventOwner){
  const a=residual(before),b=after.terminal?null:residual(after);
  if(!a)return {
    eventCell:label(eventCell),eventOwner,
    kind:'NO_SOURCE_RESIDUAL',
  };
  if(after.terminal)return {
    eventCell:label(eventCell),eventOwner,
    kind:'TERMINAL',
    terminal:after.terminal,
  };
  if(!b)return {
    eventCell:label(eventCell),eventOwner,
    kind:'RESIDUAL_KILLED_OR_COMPLETED',
  };
  const beforeMissing=new Set(a.missingCells),
    afterMissing=new Set(b.missingCells),
    removed=[...beforeMissing].filter(x=>!afterMissing.has(x));
  return {
    eventCell:label(eventCell),
    eventOwner,
    kind:removed.length
      ?'RESIDUAL_CONTRACTION'
      :debt(b)<debt(a)
        ?'SUPPORT_ADVANCE'
        :'SUPPORT_STUTTER',
    removedTargets:removed.map(label),
    beforeMissing:a.missingCells.map(label),
    afterMissing:b.missingCells.map(label),
    beforeDebt:debt(a),
    afterDebt:debt(b),
    debtDelta:debt(b)-debt(a),
  };
}
function runForcedClosure(source){
  const closed=closeCpcxForcedResponses(source);
  let q=source;
  const effects=[];
  for(const s of closed.steps??[]){
    const child=applyCpcxForcedEvent(q,s.cell);
    effects.push(stepEffect(q,child,s.cell,s.player));
    q=child;
  }
  const R=closed.position?.terminal?null:residual(closed.position),
    b5Event=R?.events.find(e=>e.cell===b5)??null;
  let nextB=null;
  if(closed.kind==='OPEN'&&closed.position.mover===0&&R&&b5Event){
    nextB=certifyCpcxProtectedResidualSupportAdvance(closed.position,{
      controllerResidual:R,targetCell:b5,
    });
  }
  return {
    kind:closed.kind,
    player:closed.player??null,
    stepCount:closed.steps?.length??0,
    steps:(closed.steps??[]).map(s=>({
      cell:label(s.cell),player:s.player,
    })),
    effects,
    result:closed.position?{
      rank:closed.position.rank,
      mover:closed.position.mover,
      supportHeights:Array.from(closed.position.heights).slice(0,3),
      ownerClass:ownerClass(closed.position),
      immediate:closed.position.terminal?null:immediateSummary(closed.position),
      residual:R?{
        missingCount:R.missingCount,
        missing:R.missingCells.map(label),
        supportProfile:supportProfile(R),
        supportDebt:debt(R),
        b5SupportDistance:b5Event?.supportDistance??null,
      }:null,
      nextBAdvance:nextB?{
        kind:nextB.kind,
        exact:nextB.exact??false,
        seam:nextB.seam??null,
        actionCell:Number.isInteger(nextB.actionCell)
          ?label(nextB.actionCell):null,
        sourceDebt:nextB.sourceSupportDebt??null,
        childDebt:nextB.childSupportDebt??null,
      }:null,
    }:null,
  };
}

const p0Cycle=[];
for(const cls of artifact.classes.filter(x=>x.mover===0)){
  const source=positionFromClass(cls),R=residual(source);
  if(!R)throw new Error(`target missing ${cls.classId}`);
  const advance=certifyCpcxProtectedResidualSupportAdvance(source,{
    controllerResidual:R,targetCell:b5,
  });
  if(advance.kind!=='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'||!advance.exact)
    throw new Error(`B advance failed ${cls.classId}`);

  for(const responseCell of frontier(advance.child)){
    const trans=certifyCpcxProtectedResidualSupportTransition(advance.child,{
      protectedResidual:residual(advance.child),eventCell:responseCell,
    });
    if(!trans.exact||trans.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')
      continue;
    const q=applyCpcxForcedEvent(advance.child,responseCell);
    const next=certifyCpcxProtectedResidualSupportAdvance(q,{
      controllerResidual:residual(q),targetCell:b5,
    });
    if(next.seam!=='SOURCE_IMMEDIATE_PRECEDENCE')continue;
    p0Cycle.push({
      classId:cls.classId,
      sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
      responseCell:label(responseCell),
      sourceB5Distance:R.events.find(e=>e.cell===b5)?.supportDistance??null,
      afterAdvanceB5Distance:residual(advance.child)?.events
        .find(e=>e.cell===b5)?.supportDistance??null,
      preNormalization:{
        rank:q.rank,
        mover:q.mover,
        supportHeights:Array.from(q.heights).slice(0,3),
        ownerClass:ownerClass(q),
        immediate:immediateSummary(q),
        residual:{
          missing:residual(q)?.missingCells.map(label)??[],
          supportProfile:supportProfile(residual(q)),
          supportDebt:debt(residual(q)),
        },
      },
      normalization:runForcedClosure(q),
    });
  }
}

const p1Boundary=[];
for(const cls of artifact.classes.filter(x=>x.mover===1)){
  const source=positionFromClass(cls),R=residual(source);
  if(!R)throw new Error(`target missing ${cls.classId}`);
  for(const eventCell of frontier(source)){
    const trans=certifyCpcxProtectedResidualSupportTransition(source,{
      protectedResidual:R,eventCell,
    });
    if(!trans.exact||trans.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')
      continue;
    const q=applyCpcxForcedEvent(source,eventCell);
    const advances=targetCells.map(targetCell=>
      certifyCpcxProtectedResidualSupportAdvance(q,{
        controllerResidual:residual(q),targetCell,
      })
    );
    if(!advances.every(x=>x.seam==='SOURCE_IMMEDIATE_PRECEDENCE'))continue;
    p1Boundary.push({
      classId:cls.classId,
      sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
      eventCell:label(eventCell),
      preNormalization:{
        rank:q.rank,
        mover:q.mover,
        supportHeights:Array.from(q.heights).slice(0,3),
        ownerClass:ownerClass(q),
        immediate:immediateSummary(q),
        residual:{
          missing:residual(q)?.missingCells.map(label)??[],
          supportProfile:supportProfile(residual(q)),
          supportDebt:debt(residual(q)),
        },
      },
      normalization:runForcedClosure(q),
    });
  }
}

const rows=[...p0Cycle.map(x=>({source:'P0_B_CYCLE',...x})),
  ...p1Boundary.map(x=>({source:'P1_BOUNDARY',...x}))];

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.simplex-forced-normalization-closure.v0_1',
  observation:'deterministic forced-normalization closure of every remaining SOURCE_IMMEDIATE_PRECEDENCE seam in the current universal-diagonal support automaton diagnostics',
  rows,
  summary:{
    totalSeamCount:rows.length,
    p0BCycleSeamCount:p0Cycle.length,
    p1BoundarySeamCount:p1Boundary.length,
    normalizationKinds:[...new Set(rows.map(x=>
      x.normalization.kind
    ))].sort(),
    normalizedMoverCounts:{
      p0:rows.filter(x=>x.normalization.result?.mover===0).length,
      p1:rows.filter(x=>x.normalization.result?.mover===1).length,
    },
    residualKilledOrCompletedCount:rows.filter(x=>
      x.normalization.result?.residual===null
    ).length,
    contractionStepCount:rows.reduce((n,x)=>
      n+x.normalization.effects.filter(e=>
        e.kind==='RESIDUAL_CONTRACTION'
      ).length,0
    ),
    supportAdvanceStepCount:rows.reduce((n,x)=>
      n+x.normalization.effects.filter(e=>
        e.kind==='SUPPORT_ADVANCE'
      ).length,0
    ),
    supportStutterStepCount:rows.reduce((n,x)=>
      n+x.normalization.effects.filter(e=>
        e.kind==='SUPPORT_STUTTER'
      ).length,0
    ),
    p0NormalizedStatesWithExactBReentry:rows.filter(x=>
      x.normalization.result?.mover===0&&
      ['PROTECTED_RESIDUAL_SUPPORT_ADVANCE','CERTIFIED_FIRST_WIN']
        .includes(x.normalization.result?.nextBAdvance?.kind)
    ).length,
    p1NormalizedStates:rows.filter(x=>
      x.normalization.result?.mover===1
    ).map(x=>({
      source:x.source,
      classId:x.classId,
      eventCell:x.responseCell??x.eventCell,
      supportHeights:x.normalization.result.supportHeights,
      ownerClass:x.normalization.result.ownerClass,
      residual:x.normalization.result.residual,
    })),
  },
  boundary:{
    diagnosticOnly:true,
    sourceSeamsAreExistingExactSupportTransitionOutputs:true,
    normalizationUsesOnlyDeterministicForcedResponses:true,
    noFreeSecondReplyLayer:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
  },
},null,2));

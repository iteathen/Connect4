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
  certifyCpcxProtectedResidualSupportTransition,
} from './cpcx-support-transition.mjs';
import {
  certifyCpcxProtectedResidualSupportAdvance,
} from './cpcx-support-advance.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3',
  targets=['A6','B5','C4'].map(s=>
    (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65)
  );

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

function residual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine&&o.missingCount===3
  )??null;
}

function supportProfile(R){
  const byCell=new Map(R.events.map(e=>[e.cell,e.supportDistance]));
  return targets.map(cell=>byCell.get(cell));
}

function supportOwners(position){
  const out=[];
  for(let c=0;c<3;c++){
    for(let r=0;r<position.heights[c];r++)out.push({
      column:c,
      row:r,
      owner:position.owner[r*g.columns+c],
    });
  }
  return out;
}

function ownerClass(position){
  const xs=supportOwners(position);
  if(!xs.length)return 'EMPTY';
  const values=[...new Set(xs.map(x=>x.owner))];
  if(values.length>1)return 'MIXED';
  return values[0]===0?'ALL_P0':'ALL_P1';
}

function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
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

function firstWinSummary(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    seam:x.seam??null,
  };
}

function advanceRole(cell){
  return ['ADVANCE_A','ADVANCE_B','ADVANCE_C'][cpcxCell(g,cell).column];
}

const classes=artifact.classes.filter(x=>x.mover===1),
  rows=[];

for(const cls of classes){
  const source=positionFromClass(cls),
    R=residual(source);
  if(!R)throw new Error(`protected residual missing ${cls.classId}`);

  const responses=[];
  for(const eventCell of frontier(source)){
    const transition=certifyCpcxProtectedResidualSupportTransition(source,{
      protectedResidual:R,
      eventCell,
    });
    if(transition.kind==='TERMINAL_EVENT'){
      responses.push({
        eventCell:label(eventCell),
        eventColumn:cpcxCell(g,eventCell).column+1,
        transitionKind:transition.kind,
        terminal:transition.terminal,
        p1Terminal:transition.terminal?.player===1,
      });
      continue;
    }

    if(!transition.exact){
      responses.push({
        eventCell:label(eventCell),
        eventColumn:cpcxCell(g,eventCell).column+1,
        transitionKind:transition.kind,
        seam:transition.seam??null,
      });
      continue;
    }

    const child=applyCpcxForcedEvent(source,eventCell);
    if(child.mover!==0)throw new Error('P1 event did not return turn to P0');
    const childR=residual(child);
    if(!childR)throw new Error('protected residual lost after exact transition');

    const immediate=classifyCpcxImmediate(child),
      first=runCpcxFirstWinCertificate(child,{attacker:0}),
      advances=[];

    for(const targetCell of targets){
      const advance=certifyCpcxProtectedResidualSupportAdvance(child,{
        controllerResidual:childR,
        targetCell,
      });
      advances.push({
        role:advanceRole(targetCell),
        targetCell:label(targetCell),
        kind:advance.kind,
        exact:advance.exact??false,
        seam:advance.seam??null,
        actionCell:Number.isInteger(advance.actionCell)
          ?label(advance.actionCell):null,
        sourceDebt:advance.sourceSupportDebt??null,
        childDebt:advance.childSupportDebt??null,
      });
    }

    responses.push({
      eventCell:label(eventCell),
      eventColumn:cpcxCell(g,eventCell).column+1,
      transitionKind:transition.kind,
      transitionDebtDelta:transition.supportDebtDelta,
      rank:child.rank,
      mover:child.mover,
      supportHeights:Array.from(child.heights).slice(0,3),
      ownerClass:ownerClass(child),
      supportProfile:supportProfile(childR),
      immediate:immediateSummary(immediate),
      existingFirstWin:firstWinSummary(first),
      p0SupportAdvances:advances,
      exactAdvanceRoles:advances.filter(x=>
        x.kind==='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'||
        x.kind==='CERTIFIED_FIRST_WIN'
      ).map(x=>x.role),
    });
  }

  rows.push({
    classId:cls.classId,
    sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
    sourceSupportHeights:Array.from(source.heights).slice(0,3),
    sourceOwnerClass:ownerClass(source),
    sourceSupportProfile:supportProfile(R),
    responses,
  });
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.diagonal-simplex-p1-boundary.v0_1',
  observation:'one current P1 event from each of the three P1-mover universal diagonal-defect classes, followed only by current-rank P0 structural classification',
  target:{
    line:targetLine,
    missing:['A6','B5','C4'],
  },
  rows,
  summary:{
    p1SourceClassCount:rows.length,
    sourceClassIds:rows.map(x=>x.classId),
    responseCount:rows.reduce((n,x)=>n+x.responses.length,0),
    p1TerminalResponses:rows.flatMap(x=>x.responses
      .filter(r=>r.p1Terminal)
      .map(r=>({classId:x.classId,eventCell:r.eventCell}))
    ),
    transitionFailures:rows.flatMap(x=>x.responses
      .filter(r=>r.transitionKind==='NO_CERTIFICATE')
      .map(r=>({classId:x.classId,eventCell:r.eventCell,seam:r.seam}))
    ),
    responsesWithAtLeastOneP0SupportAdvance:rows.flatMap(x=>x.responses
      .filter(r=>(r.exactAdvanceRoles?.length??0)>0)
      .map(r=>({
        classId:x.classId,
        eventCell:r.eventCell,
        roles:r.exactAdvanceRoles,
        ownerClass:r.ownerClass,
        supportHeights:r.supportHeights,
      }))
    ),
    everyNonterminalResponseHasP0SupportAdvance:rows.every(x=>
      x.responses.every(r=>
        r.p1Terminal===true||
        (r.exactAdvanceRoles?.length??0)>0
      )
    ),
    ownerClassesAfterResponse:[...new Set(rows.flatMap(x=>
      x.responses.map(r=>r.ownerClass).filter(Boolean)
    ))].sort(),
  },
  boundary:{
    diagnosticOnly:true,
    exactlyOneCurrentP1Event:true,
    protectedResidualTransitionUsesQualifiedGenericTheorem:true,
    p0FollowupClassificationIsCurrentRankOnly:true,
    noSecondP1Layer:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
  },
},null,2));

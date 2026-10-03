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
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function positionFromClass(cls){
  const [moverText,heightsText,ownerText]=cls.key.split('|');
  if(ownerText.length!==g.cellCount)throw new Error('owner key width');
  const owner=new Int8Array(g.cellCount);
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
    o.player===0&&o.lineLabel===targetLine&&o.missingCount===3
  )??null;
}

function supportProfile(position,residual){
  if(!residual)return null;
  const byCell=new Map(residual.events.map(e=>[e.cell,e.supportDistance]));
  const cells=['A6','B5','C4'].map(s=>
    (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65)
  );
  return cells.map(cell=>byCell.get(cell)??null);
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

function progressSummary(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    source:x.source??null,
    seam:x.seam??x.reason??null,
    macroKind:x.macro?.kind??null,
  };
}

function firstWinSummary(x){
  return {
    kind:x.kind,
    exact:x.exact??false,
    player:x.player??null,
    seam:x.seam??null,
    traceLength:x.trace?.length??0,
  };
}

function roleForColumn(column){
  if(column===0)return 'ADVANCE_A';
  if(column===1)return 'ADVANCE_B';
  if(column===2)return 'ADVANCE_C';
  return 'EXTERNAL';
}

function tupleKey(xs){return xs.join(',');}

const rows=[];
for(const cls of artifact.classes){
  const position=positionFromClass(cls),
    sourceResidual=targetResidual(position);
  if(!sourceResidual)throw new Error(`target residual missing ${cls.classId}`);
  const sourceProfile=supportProfile(position,sourceResidual),
    sourceDebt=sourceProfile.reduce((a,b)=>a+b,0),
    actions=[];

  for(const cell of frontier(position)){
    const child=applyCpcxForcedEvent(position,cell),
      childResidual=child.terminal?null:targetResidual(child),
      childProfile=childResidual?supportProfile(child,childResidual):null,
      immediate=child.terminal?null:classifyCpcxImmediate(child),
      progress=child.terminal?null:classifyCpcxProgress(child,{player:0}),
      first=child.terminal?null:runCpcxFirstWinCertificate(child,{attacker:0}),
      action={
        cell:label(cell),
        column:cpcxCell(g,cell).column,
        role:roleForColumn(cpcxCell(g,cell).column),
        actor:position.mover,
        terminal:child.terminal?{
          player:child.terminal.player,
          lineId:child.terminal.lineId,
        }:null,
        immediate:immediate?immediateSummary(immediate):null,
        progress:progress?progressSummary(progress):null,
        firstWin:first?firstWinSummary(first):null,
        targetRetained:childResidual!==null,
        targetProfile:childProfile,
        targetDebt:childProfile
          ?childProfile.reduce((a,b)=>a+b,0)
          :null,
        targetDebtDelta:childProfile
          ?childProfile.reduce((a,b)=>a+b,0)-sourceDebt
          :null,
      };

    action.p0ExactFirstWin=
      child.terminal?.player===0||
      first?.kind==='CERTIFIED_FIRST_WIN'&&first.player===0;
    action.p1ExactFirstWin=
      child.terminal?.player===1||
      first?.kind==='CERTIFIED_FIRST_WIN'&&first.player===1;
    action.p1ImmediateTerminal=
      position.mover===0&&
      immediate?.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&
      immediate.mover===1;
    action.safeOneRankForP0=
      !action.p1ExactFirstWin&&!action.p1ImmediateTerminal;
    action.safeTargetAdvance=
      position.mover===0&&
      action.safeOneRankForP0&&
      action.targetRetained&&
      action.targetDebtDelta===-1;
    actions.push(action);
  }

  rows.push({
    classId:cls.classId,
    rank:position.rank,
    mover:position.mover,
    sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
    supportHeights:Array.from(position.heights).slice(0,3),
    targetProfile:sourceProfile,
    targetDebt:sourceDebt,
    actions,
  });
}

const groups=new Map();
for(const row of rows){
  const key=tupleKey(row.supportHeights);
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(row);
}

function commonValues(sets){
  if(!sets.length)return [];
  let out=[...sets[0]];
  for(const s of sets.slice(1)){
    const set=new Set(s);
    out=out.filter(x=>set.has(x));
  }
  return out.sort();
}

const simplexGroups=[...groups.entries()]
  .map(([key,xs])=>{
    const p0=xs.filter(x=>x.mover===0),
      p1=xs.filter(x=>x.mover===1),
      safeAdvanceByClass=p0.map(x=>x.actions
        .filter(a=>a.safeTargetAdvance)
        .map(a=>a.cell)),
      safeAdvanceRolesByClass=p0.map(x=>x.actions
        .filter(a=>a.safeTargetAdvance)
        .map(a=>a.role)),
      exactWinByClass=p0.map(x=>x.actions
        .filter(a=>a.p0ExactFirstWin)
        .map(a=>a.cell));

    const p1ResponseRows=p1.map(x=>({
      classId:x.classId,
      terminalP1:x.actions.filter(a=>a.terminal?.player===1).map(a=>a.cell),
      p0CertifiedAfterResponse:x.actions
        .filter(a=>a.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&a.firstWin.player===0)
        .map(a=>a.cell),
      allResponsesP0Certified:x.actions.every(a=>
        a.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&a.firstWin.player===0
      ),
    }));

    return {
      supportHeights:key.split(',').map(Number),
      targetProfile:xs[0].targetProfile,
      targetDebt:xs[0].targetDebt,
      physicalClassCount:xs.length,
      classIds:xs.map(x=>x.classId),
      moverCounts:{
        p0:p0.length,
        p1:p1.length,
      },
      commonSafeAdvanceCells:commonValues(safeAdvanceByClass),
      commonSafeAdvanceRoles:commonValues(safeAdvanceRolesByClass),
      commonExactP0WinCells:commonValues(exactWinByClass),
      eachP0ClassHasSafeAdvance:p0.every(x=>
        x.actions.some(a=>a.safeTargetAdvance)
      ),
      safeAdvanceCellsByClass:Object.fromEntries(p0.map(x=>[
        x.classId,x.actions.filter(a=>a.safeTargetAdvance).map(a=>a.cell)
      ])),
      p1ResponseRows,
    };
  })
  .sort((a,b)=>
    a.supportHeights.reduce((x,y)=>x+y,0)-
      b.supportHeights.reduce((x,y)=>x+y,0)||
    a.supportHeights[0]-b.supportHeights[0]||
    a.supportHeights[1]-b.supportHeights[1]||
    a.supportHeights[2]-b.supportHeights[2]
  );

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.diagonal-simplex-transition-census.v0_1',
  observation:'one current legal event over every exact reflection-canonical unresolved move6 class, grouped by the ten-state diagonal support simplex',
  target:{
    line:targetLine,
    missing:['A6','B5','C4'],
    role:'P0 protected diagonal defect',
  },
  rows,
  simplexGroups,
  summary:{
    physicalClassCount:rows.length,
    simplexStateCount:simplexGroups.length,
    p0MoverClassCount:rows.filter(x=>x.mover===0).length,
    p1MoverClassCount:rows.filter(x=>x.mover===1).length,
    simplexStatesWhereEveryP0ClassHasSafeAdvance:simplexGroups
      .filter(x=>x.moverCounts.p0>0&&x.eachP0ClassHasSafeAdvance)
      .map(x=>x.supportHeights),
    simplexStatesWithCommonSafeAdvanceRole:simplexGroups
      .filter(x=>x.commonSafeAdvanceRoles.length>0)
      .map(x=>({
        supportHeights:x.supportHeights,
        roles:x.commonSafeAdvanceRoles,
      })),
    p1MoverClassesFullyCoveredByExistingP0Certificate:simplexGroups
      .flatMap(x=>x.p1ResponseRows)
      .filter(x=>x.allResponsesP0Certified)
      .map(x=>x.classId),
  },
  boundary:{
    diagnosticOnly:true,
    oneCurrentEventOnly:true,
    groupingUsesSupportSimplexOnly:true,
    noFutureReplyEnumerationBeyondP1CurrentFrontier:true,
    noMinimax:true,
    noSolvedData:true,
    oracle:false,
    recursiveSearch:false,
    noValueConclusion:true,
  },
},null,2));

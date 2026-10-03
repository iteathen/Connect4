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
  certifyCpcxProtectedResidualSupportAdvance,
} from './cpcx-support-advance.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3',
  targetCells=['A6','B5','C4'].map(s=>
    (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65)
  ),
  anchorCell=(3-1)*g.columns+(3), // D3
  targetSet=new Set(targetCells);

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

function supportProfile(residual){
  if(!residual)return null;
  const byCell=new Map(residual.events.map(e=>[e.cell,e.supportDistance]));
  return targetCells.map(cell=>byCell.get(cell)??null);
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

function supportOwners(position){
  const out=[];
  for(let c=0;c<3;c++){
    const owners=[];
    for(let r=0;r<position.heights[c];r++)
      owners.push(position.owner[r*g.columns+c]);
    out.push(owners);
  }
  return out;
}

function responseRole(cell){
  if(targetSet.has(cell))return 'BLOCK_TARGET';
  const {column}=cpcxCell(g,cell);
  if(column===0)return 'SUPPORT_A';
  if(column===1)return 'SUPPORT_B';
  if(column===2)return 'SUPPORT_C';
  return 'EXTERNAL';
}

function advanceRole(targetCell){
  const {column}=cpcxCell(g,targetCell);
  return ['ADVANCE_A','ADVANCE_B','ADVANCE_C'][column]??'UNKNOWN';
}

function lineCells(lineId){
  return g.lines[lineId]?.cells??[];
}

function transferAttachments(position,blockedCell,sourceLineId){
  if(position.terminal)return [];
  const oldRemaining=new Set(
    lineCells(sourceLineId).filter(cell=>cell!==blockedCell)
  );
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===0&&
      (o.orientation==='D+'||o.orientation==='D-')&&
      lineCells(o.lineId).includes(anchorCell)
    )
    .map(o=>{
      const overlap=lineCells(o.lineId).filter(cell=>oldRemaining.has(cell));
      return {
        lineId:o.lineId,
        lineLabel:o.lineLabel,
        orientation:o.orientation,
        missingCount:o.missingCount,
        missing:o.missingCells.map(label),
        support:o.events.map(e=>e.supportDistance),
        playable:o.currentlyPlayableCells.map(label),
        overlap:overlap.map(label),
        overlapCount:overlap.length,
      };
    })
    .filter(x=>x.overlapCount>0)
    .sort((a,b)=>
      b.overlapCount-a.overlapCount||
      a.missingCount-b.missingCount||
      a.lineId-b.lineId
    );
}

function signature(row){
  return JSON.stringify({
    responseRole:row.responseRole,
    terminalPlayer:row.terminal?.player??null,
    immediateKind:row.immediate?.kind??null,
    firstWinPlayer:
      row.firstWin?.kind==='CERTIFIED_FIRST_WIN'
        ?row.firstWin.player
        :null,
    targetRetained:row.targetRetained,
    targetProfile:row.targetProfile,
    transferLines:row.transferAttachments.map(x=>x.lineLabel),
    supportHeights:row.supportHeights,
  });
}

const rows=[];

for(const cls of artifact.classes){
  const source=positionFromClass(cls);
  if(source.mover!==0)continue;

  const residual=targetResidual(source);
  if(!residual)throw new Error(`target residual missing ${cls.classId}`);
  const sourceProfile=supportProfile(residual),
    sourceDebt=sourceProfile.reduce((a,b)=>a+b,0),
    advances=[];

  for(const targetCell of targetCells){
    const advance=certifyCpcxProtectedResidualSupportAdvance(source,{
      controllerResidual:residual,
      targetCell,
    });
    if(advance.kind==='CERTIFIED_FIRST_WIN'){
      advances.push({
        advanceRole:advanceRole(targetCell),
        targetCell:label(targetCell),
        advanceKind:advance.kind,
        actionCell:label(advance.actionCell),
        responses:[],
      });
      continue;
    }
    if(advance.kind!=='PROTECTED_RESIDUAL_SUPPORT_ADVANCE')
      throw new Error(
        `qualified simplex support advance failed ${cls.classId}/${label(targetCell)}: ${advance.seam}`
      );

    const child=advance.child,responses=[];
    for(const responseCell of frontier(child)){
      const next=applyCpcxForcedEvent(child,responseCell),
        live=next.terminal?null:targetResidual(next),
        profile=live?supportProfile(live):null,
        immediate=next.terminal?null:classifyCpcxImmediate(next),
        progress=next.terminal?null:classifyCpcxProgress(next,{player:0}),
        first=next.terminal?null:runCpcxFirstWinCertificate(next,{attacker:0}),
        directBlock=targetSet.has(responseCell),
        row={
          responseCell:label(responseCell),
          responseRole:responseRole(responseCell),
          terminal:next.terminal?{
            player:next.terminal.player,
            lineId:next.terminal.lineId,
          }:null,
          immediate:immediate?immediateSummary(immediate):null,
          progress:progress?progressSummary(progress):null,
          firstWin:first?firstWinSummary(first):null,
          targetRetained:live!==null,
          targetProfile:profile,
          targetDebt:profile?profile.reduce((a,b)=>a+b,0):null,
          targetDebtDeltaFromSource:
            profile?profile.reduce((a,b)=>a+b,0)-sourceDebt:null,
          directTargetBlock:directBlock,
          blockedTarget:directBlock?label(responseCell):null,
          supportHeights:Array.from(next.heights).slice(0,3),
          supportOwners:supportOwners(next),
          transferAttachments:
            !next.terminal&&!live&&directBlock
              ?transferAttachments(next,responseCell,residual.lineId)
              :[],
        };
      row.p0ExactFirstWin=
        next.terminal?.player===0||
        first?.kind==='CERTIFIED_FIRST_WIN'&&first.player===0;
      row.p1ExactFirstWin=
        next.terminal?.player===1||
        first?.kind==='CERTIFIED_FIRST_WIN'&&first.player===1;
      row.signature=signature(row);
      responses.push(row);
    }

    advances.push({
      advanceRole:advanceRole(targetCell),
      targetCell:label(targetCell),
      advanceKind:advance.kind,
      actionCell:label(advance.actionCell),
      childSupportDebt:advance.childSupportDebt,
      responses,
    });
  }

  rows.push({
    classId:cls.classId,
    rank:source.rank,
    sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
    sourceSupportHeights:Array.from(source.heights).slice(0,3),
    sourceSupportProfile:sourceProfile,
    sourceSupportDebt:sourceDebt,
    advances,
  });
}

const groups=new Map();
for(const row of rows){
  const key=row.sourceSupportHeights.join(',');
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(row);
}

function roleSummary(classRows,role){
  const advances=classRows.map(r=>
    r.advances.find(a=>a.advanceRole===role)
  ).filter(Boolean);
  const responses=advances.flatMap(a=>a.responses);
  return {
    sourceClassCount:advances.length,
    responseCount:responses.length,
    p1ExactFirstWinCount:responses.filter(x=>x.p1ExactFirstWin).length,
    p0ExactFirstWinCount:responses.filter(x=>x.p0ExactFirstWin).length,
    targetRetainedCount:responses.filter(x=>x.targetRetained).length,
    directTargetBlockCount:responses.filter(x=>x.directTargetBlock).length,
    transferredBlockCount:responses.filter(x=>
      x.directTargetBlock&&x.transferAttachments.length>0
    ).length,
    responseSignatureCount:new Set(responses.map(x=>x.signature)).size,
    noExactP1FirstWin:responses.every(x=>!x.p1ExactFirstWin),
    everyDirectBlockHasTransfer:responses
      .filter(x=>x.directTargetBlock)
      .every(x=>x.transferAttachments.length>0),
    directBlockTransferLines:[...new Set(responses
      .filter(x=>x.directTargetBlock)
      .flatMap(x=>x.transferAttachments.map(y=>y.lineLabel))
    )].sort(),
  };
}

const simplexGroups=[...groups.entries()].map(([key,classRows])=>({
  supportHeights:key.split(',').map(Number),
  classIds:classRows.map(x=>x.classId),
  roles:['ADVANCE_A','ADVANCE_B','ADVANCE_C'].map(role=>({
    role,
    ...roleSummary(classRows,role),
  })),
})).sort((a,b)=>
  a.supportHeights.reduce((x,y)=>x+y,0)-
    b.supportHeights.reduce((x,y)=>x+y,0)||
  a.supportHeights[0]-b.supportHeights[0]||
  a.supportHeights[1]-b.supportHeights[1]||
  a.supportHeights[2]-b.supportHeights[2]
);

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.diagonal-simplex-support-response-census.v0_1',
  observation:'one qualified P0 protected-residual support advance followed by exactly one current P1 frontier event',
  target:{
    line:targetLine,
    missing:['A6','B5','C4'],
    anchor:'D3',
  },
  rows,
  simplexGroups,
  summary:{
    p0SourceClassCount:rows.length,
    simplexStateCount:simplexGroups.length,
    rolesWithNoExactP1FirstWin:simplexGroups.flatMap(g=>
      g.roles.filter(r=>r.noExactP1FirstWin).map(r=>({
        supportHeights:g.supportHeights,
        role:r.role,
      }))
    ),
    rolesWhereEveryDirectBlockTransfers:simplexGroups.flatMap(g=>
      g.roles.filter(r=>r.everyDirectBlockHasTransfer).map(r=>({
        supportHeights:g.supportHeights,
        role:r.role,
        transferLines:r.directBlockTransferLines,
      }))
    ),
  },
  boundary:{
    diagnosticOnly:true,
    sourceAdvancesUseQualifiedProtectedResidualSupportAdvance:true,
    exactlyOneCurrentP1ResponseLayer:true,
    noSecondFreeReplyLayer:true,
    existingFirstWinCertificatesUsedOnlyAsDiagnostics:true,
    absenceOfCertificateIsNotSafety:true,
    noValueConclusion:true,
    recursiveSearch:false,
    minimax:false,
    solvedData:false,
    oracle:false,
  },
},null,2));

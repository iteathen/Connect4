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
  certifyCpcxProtectedResidualSupportAdvance,
} from './cpcx-support-advance.mjs';
import {
  certifyCpcxProtectedResidualSupportTransition,
} from './cpcx-support-transition.mjs';
import {
  certifyCpcxProtectedResidualForcedNormalization,
} from './cpcx-forced-normalization.mjs';
import {
  certifyCpcxProtectedResidualTargetAcquisition,
} from './cpcx-target-acquisition.mjs';
import {
  certifyCpcxProtectedResidualDiagonalTransfer,
} from './cpcx-diagonal-transfer.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3',
  targetCells=['A6','B5','C4'].map(s=>(Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65)),
  b5=targetCells[1];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function positionFromClass(cls){
  const [moverText,heightsText,ownerText]=cls.key.split('|'),owner=new Int8Array(g.cellCount);
  for(let i=0;i<ownerText.length;i++)owner[i]=Number(ownerText[i])-1;
  return {geometry:g,moves:new Uint32Array(0),rank:cls.rank,mover:Number(moverText),heights:new Uint32Array(heightsText.split(',').map(Number)),owner,terminal:null};
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
function residualByLine(position,lineId,player=0){
  return scanCpcxObligations(position).find(o=>o.player===player&&o.lineId===lineId)??null;
}
function rootResidual(position){
  return scanCpcxObligations(position).find(o=>o.player===0&&o.lineLabel===targetLine)??null;
}
function supportDebt(R){return R?R.events.reduce((n,e)=>n+e.supportDistance,0):null;}
function tuple(R){return R?[R.missingCount,supportDebt(R)]:null;}
function tupleLess(a,b){return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);}
function immediateSummary(x){
  return {kind:x.kind,mover:x.mover??null,cell:Number.isInteger(x.cell)?label(x.cell):null,winningCells:(x.winningCells??[]).map(label),opponentThreatCells:(x.opponentThreatCells??x.threatCells??[]).map(label)};
}
function normalizedRecord(sourceKind,cls,eventCell,q){
  const R=rootResidual(q); if(!R)return null;
  const n=certifyCpcxProtectedResidualForcedNormalization(q,{protectedResidual:R});
  if(n.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION'||!n.exact)return null;
  return {sourceKind,classId:cls.classId,eventCell:label(eventCell),position:n.finalPosition,normalization:{rankDelta:n.rankDelta,stepKinds:n.steps.map(x=>x.kind),sourceTuple:[n.sourceMissingCount,n.sourceSupportDebt],finalTuple:[n.finalMissingCount,n.finalSupportDebt]}};
}
function summarizeCertificate(c){
  return {kind:c.kind,exact:c.exact??false,seam:c.seam??null,player:c.player??null,actionCell:Number.isInteger(c.actionCell)?label(c.actionCell):null,targetCell:Number.isInteger(c.targetCell)?label(c.targetCell):null,missingCountDelta:c.missingCountDelta??null,supportDebtDelta:c.supportDebtDelta??null};
}
function descentWins(d){
  if(!d)return false;
  if(['FORCED_NORMALIZATION_FIRST_WIN','CONTROLLER_FIRST_WIN','EXTERNAL_IMMEDIATE_WIN'].includes(d.kind))return true;
  return d.kind==='FORCED_NORMALIZATION_THEN_DESCENT'&&descentWins(d.next);
}
function descentFinalTuple(d){
  if(!d)return null;
  if(Array.isArray(d.childTuple))return d.childTuple;
  if(d.kind==='FORCED_NORMALIZATION_THEN_DESCENT')return descentFinalTuple(d.next);
  return null;
}
function controllerDescent(position,R){
  if(position.terminal)return {kind:'SOURCE_TERMINAL',terminal:position.terminal,exact:false};
  if(position.mover!==R.player)return {kind:'WRONG_MOVER',exact:false};
  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind==='FORCED_LOSS_OVERLOAD')return {kind:'CONTROLLER_FORCED_LOSS_OVERLOAD',exact:false,immediate:immediateSummary(immediate)};
  if(immediate.kind==='FORCED_RESPONSE'){
    const n=certifyCpcxProtectedResidualForcedNormalization(position,{protectedResidual:R});
    if(n.kind==='CERTIFIED_FIRST_WIN')return {kind:'FORCED_NORMALIZATION_FIRST_WIN',exact:true,normalization:summarizeCertificate(n)};
    if(n.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION'||!n.exact)return {kind:'FORCED_NORMALIZATION_FAILED',exact:false,normalization:summarizeCertificate(n)};
    const finalR=residualByLine(n.finalPosition,R.lineId,R.player);
    if(!finalR)return {kind:'FORCED_NORMALIZATION_LOST_RESIDUAL',exact:false};
    if(n.finalPosition.mover!==R.player)return {kind:'FORCED_NORMALIZATION_TO_OPPONENT',exact:false,sourceTuple:tuple(R),finalTuple:tuple(finalR),normalization:{rankDelta:n.rankDelta,stepKinds:n.steps.map(x=>x.kind)}};
    const next=controllerDescentNoNormalization(n.finalPosition,finalR);
    return {kind:'FORCED_NORMALIZATION_THEN_DESCENT',exact:next.exact===true,sourceTuple:tuple(R),normalizedTuple:tuple(finalR),normalization:{rankDelta:n.rankDelta,stepKinds:n.steps.map(x=>x.kind)},next};
  }
  return controllerDescentNoNormalization(position,R);
}
function controllerDescentNoNormalization(position,R){
  const immediate=classifyCpcxImmediate(position),candidates=[];
  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&immediate.mover===R.player){
    for(const targetCell of R.missingCells){
      if(!(immediate.winningCells??[]).includes(targetCell))continue;
      const c=certifyCpcxProtectedResidualTargetAcquisition(position,{controllerResidual:R,targetCell});
      if(c.exact)candidates.push(c);
    }
    if(!candidates.length)return {kind:'EXTERNAL_IMMEDIATE_WIN',exact:true,immediate:immediateSummary(immediate),candidates:[]};
  }else if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION'){
    return {kind:'UNSUPPORTED_IMMEDIATE_BOUNDARY',exact:false,immediate:immediateSummary(immediate)};
  }
  for(const targetCell of R.missingCells){
    const e=R.events.find(x=>x.cell===targetCell);
    if(!e)continue;
    const c=e.supportDistance===0
      ?certifyCpcxProtectedResidualTargetAcquisition(position,{controllerResidual:R,targetCell})
      :certifyCpcxProtectedResidualSupportAdvance(position,{controllerResidual:R,targetCell});
    if(c.exact)candidates.push(c);
  }
  const scored=candidates.map(c=>({c,score:c.kind==='CERTIFIED_FIRST_WIN'?0:c.kind==='PROTECTED_RESIDUAL_TARGET_ACQUISITION'?1:2})).sort((a,b)=>a.score-b.score||((a.c.targetCell??0)-(b.c.targetCell??0)));
  if(!scored.length)return {kind:'NO_CONTROLLER_DESCENT',exact:false,immediate:immediateSummary(immediate),attempts:R.missingCells.map(targetCell=>{const e=R.events.find(x=>x.cell===targetCell);const c=e.supportDistance===0?certifyCpcxProtectedResidualTargetAcquisition(position,{controllerResidual:R,targetCell}):certifyCpcxProtectedResidualSupportAdvance(position,{controllerResidual:R,targetCell});return summarizeCertificate(c);})};
  const best=scored[0].c;
  return {kind:best.kind==='CERTIFIED_FIRST_WIN'?'CONTROLLER_FIRST_WIN':best.kind,exact:true,certificate:summarizeCertificate(best),sourceTuple:tuple(R),childTuple:best.kind==='PROTECTED_RESIDUAL_TARGET_ACQUISITION'?[best.childMissingCount,best.childSupportDebt]:best.kind==='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'?[R.missingCount,best.childSupportDebt]:null};
}

const generated=[];
for(const cls of artifact.classes.filter(x=>x.mover===0)){
  const source=positionFromClass(cls),R=rootResidual(source); if(!R)throw new Error(`target missing ${cls.classId}`);
  const advance=certifyCpcxProtectedResidualSupportAdvance(source,{controllerResidual:R,targetCell:b5});
  if(advance.kind!=='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'||!advance.exact)continue;
  for(const responseCell of frontier(advance.child)){
    const childR=rootResidual(advance.child),trans=certifyCpcxProtectedResidualSupportTransition(advance.child,{protectedResidual:childR,eventCell:responseCell});
    if(!trans.exact||trans.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')continue;
    const q=applyCpcxForcedEvent(advance.child,responseCell),qR=rootResidual(q); if(!qR)continue;
    const next=certifyCpcxProtectedResidualSupportAdvance(q,{controllerResidual:qR,targetCell:b5});
    if(next.seam!=='SOURCE_IMMEDIATE_PRECEDENCE')continue;
    const r=normalizedRecord('P0_B_CYCLE',cls,responseCell,q); if(r)generated.push(r);
  }
}
for(const cls of artifact.classes.filter(x=>x.mover===1)){
  const source=positionFromClass(cls),R=rootResidual(source); if(!R)throw new Error(`target missing ${cls.classId}`);
  for(const eventCell of frontier(source)){
    const trans=certifyCpcxProtectedResidualSupportTransition(source,{protectedResidual:R,eventCell});
    if(!trans.exact||trans.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')continue;
    const q=applyCpcxForcedEvent(source,eventCell),qR=rootResidual(q); if(!qR)continue;
    const advances=targetCells.map(targetCell=>certifyCpcxProtectedResidualSupportAdvance(q,{controllerResidual:qR,targetCell}));
    if(!advances.every(x=>x.seam==='SOURCE_IMMEDIATE_PRECEDENCE'))continue;
    const r=normalizedRecord('P1_BOUNDARY',cls,eventCell,q); if(r)generated.push(r);
  }
}
const normalized=[...new Map(generated.filter(x=>x.position.mover===1).map(x=>[physicalKey(x.position),x])).values()],rows=[];
for(const source of normalized){
  const position=source.position,R=rootResidual(position); if(!R)throw new Error('root residual missing');
  const responses=[];
  for(const eventCell of frontier(position)){
    if(R.missingCells.includes(eventCell)){
      const child=applyCpcxForcedEvent(position,eventCell);
      if(child.terminal){responses.push({eventCell:label(eventCell),role:'PROTECTED_TARGET_OCCUPATION',terminal:child.terminal,exact:child.terminal.player===0});continue;}
      const transfer=certifyCpcxProtectedResidualDiagonalTransfer(position,{
        protectedResidual:R,
        blockedCell:eventCell,
      });
      if(transfer.kind!=='PROTECTED_RESIDUAL_DIAGONAL_TRANSFER'||!transfer.exact){
        responses.push({eventCell:label(eventCell),role:'PROTECTED_TARGET_OCCUPATION',exact:false,seam:transfer.seam??transfer.kind,transfer:summarizeCertificate(transfer)});
        continue;
      }
      const transferR=residualByLine(transfer.child,transfer.transfer.lineId,R.player);
      if(!transferR){
        responses.push({eventCell:label(eventCell),role:'PROTECTED_TARGET_OCCUPATION',exact:false,seam:'TRANSFER_RESIDUAL_NOT_LIVE'});
        continue;
      }
      const descent=controllerDescent(transfer.child,transferR),
        sourceTuple=tuple(R),finalTuple=descentFinalTuple(descent),
        strictDescentOrWin=descent.exact===true&&(
          descentWins(descent)||
          (finalTuple?tupleLess(finalTuple,sourceTuple):transfer.strictTupleDecrease===true)
        );
      responses.push({eventCell:label(eventCell),role:'PROTECTED_TARGET_OCCUPATION',exact:descent.exact===true,strictDescentOrWin,sourceTuple,finalTuple,transfer:{kind:transfer.kind,lineLabel:transfer.transfer.lineLabel,overlap:transfer.transfer.overlapCells.map(label),tuple:[...transfer.transfer.tuple],playable:transfer.transfer.currentlyPlayableCells.map(label),strictTupleDecrease:transfer.strictTupleDecrease},descent});
      continue;
    }
    const trans=certifyCpcxProtectedResidualSupportTransition(position,{protectedResidual:R,eventCell});
    if(!trans.exact){responses.push({eventCell:label(eventCell),role:'EXTERNAL_SUPPORT_EVENT',exact:false,seam:trans.seam});continue;}
    if(trans.kind==='TERMINAL_EVENT'){
      responses.push({eventCell:label(eventCell),role:'EXTERNAL_SUPPORT_EVENT',exact:trans.terminal?.player===0,terminal:trans.terminal});continue;
    }
    const child=applyCpcxForcedEvent(position,eventCell),childR=residualByLine(child,R.lineId,R.player),descent=childR?controllerDescent(child,childR):{kind:'RESIDUAL_LOST',exact:false},
      sourceTuple=tuple(R),finalTuple=descentFinalTuple(descent),
      strictDescentOrWin=descent.exact===true&&(
        descentWins(descent)||(finalTuple!==null&&tupleLess(finalTuple,sourceTuple))
      );
    responses.push({eventCell:label(eventCell),role:'EXTERNAL_SUPPORT_EVENT',exact:descent.exact===true,strictDescentOrWin,sourceTuple,finalTuple,afterP1Tuple:childR?tuple(childR):null,p1SupportDebtDelta:trans.supportDebtDelta,descent});
  }
  rows.push({sourceKind:source.sourceKind,classId:source.classId,rank:position.rank,residual:{lineLabel:R.lineLabel,tuple:tuple(R),playable:R.currentlyPlayableCells.map(label)},responses});
}
const all=rows.flatMap(r=>r.responses.map(x=>({classId:r.classId,...x}))),
  failures=all.filter(x=>!x.exact),
  strictFailures=all.filter(x=>!x.strictDescentOrWin);
console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.normalized-p1-response-descent.v0_1',
  observation:'one current P1 event from every exact normalized universal-diagonal P1 boundary, followed by deterministic forced normalization if required and one theorem-qualified current P0 descent action',
  rows,
  summary:{
    normalizedP1PhysicalClassCount:rows.length,
    responseCount:all.length,
    exactResponseDescentCount:all.length-failures.length,
    responseDescentFailureCount:failures.length,
    everyCurrentP1ResponseHasExactControllerDescent:failures.length===0,
    strictDescentOrWinCount:all.length-strictFailures.length,
    strictDescentOrWinFailureCount:strictFailures.length,
    everyCurrentP1ResponseStrictlyDescendsOrWins:strictFailures.length===0,
    roleCounts:Object.fromEntries([...new Set(all.map(x=>x.role))].map(role=>[role,all.filter(x=>x.role===role).length])),
    descentKinds:[...new Set(all.map(x=>x.descent?.kind).filter(Boolean))].sort(),
    failures:failures.map(x=>({classId:x.classId,eventCell:x.eventCell,role:x.role,seam:x.seam??x.descent?.kind??null,descent:x.descent??null})),
    strictFailures:strictFailures.map(x=>({classId:x.classId,eventCell:x.eventCell,role:x.role,sourceTuple:x.sourceTuple??null,finalTuple:x.finalTuple??null,seam:x.seam??x.descent?.kind??null,descent:x.descent??null})),
  },
  boundary:{diagnosticOnly:true,exactlyOneCurrentP1Event:true,controllerFollowupIsCurrentRankOnlyAfterDeterministicForcedNormalization:true,noFreeSecondP1Layer:true,transferUsesQualifiedDiagonalTransfer:true,noValueConclusion:true,solvedData:false,oracle:false,minimax:false,recursiveSearch:false},
},null,2));

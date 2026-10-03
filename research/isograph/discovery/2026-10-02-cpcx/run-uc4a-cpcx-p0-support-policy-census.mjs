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
  roleNames=['ADVANCE_A','ADVANCE_B','ADVANCE_C'];

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
function targetResidual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine
  )??null;
}
function residualByLine(position,lineId,player=0){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}
function supportDebt(R){
  return R?R.events.reduce((n,e)=>n+e.supportDistance,0):null;
}
function tuple(R){return R?[R.missingCount,supportDebt(R)]:null;}
function tupleLess(a,b){
  return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
}
function supportProfile(R){
  const m=new Map(R.events.map(e=>[e.cell,e.supportDistance]));
  return R.missingCells.map(cell=>m.get(cell));
}
function ownerClass(position){
  const xs=[];
  for(let c=0;c<3;c++)for(let r=0;r<position.heights[c];r++)
    xs.push(position.owner[r*g.columns+c]);
  if(!xs.length)return 'EMPTY';
  const s=new Set(xs);
  if(s.size>1)return 'MIXED';
  return xs[0]===0?'ALL_P0':'ALL_P1';
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
function certificateSummary(c){
  return {
    kind:c.kind,
    exact:c.exact??false,
    seam:c.seam??null,
    player:c.player??null,
    actionCell:Number.isInteger(c.actionCell)?label(c.actionCell):null,
    targetCell:Number.isInteger(c.targetCell)?label(c.targetCell):null,
    missingCountDelta:c.missingCountDelta??null,
    supportDebtDelta:c.supportDebtDelta??null,
  };
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
function controllerDescentNoNormalization(position,R){
  const immediate=classifyCpcxImmediate(position),candidates=[];
  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&immediate.mover===R.player){
    for(const targetCell of R.missingCells){
      if(!(immediate.winningCells??[]).includes(targetCell))continue;
      const c=certifyCpcxProtectedResidualTargetAcquisition(position,{
        controllerResidual:R,targetCell,
      });
      if(c.exact)candidates.push(c);
    }
    if(!candidates.length)return {
      kind:'EXTERNAL_IMMEDIATE_WIN',
      exact:true,
      immediate:immediateSummary(immediate),
    };
  }else if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION'){
    return {
      kind:'UNSUPPORTED_IMMEDIATE_BOUNDARY',
      exact:false,
      immediate:immediateSummary(immediate),
    };
  }

  for(const targetCell of R.missingCells){
    const e=R.events.find(x=>x.cell===targetCell);
    if(!e)continue;
    const c=e.supportDistance===0
      ?certifyCpcxProtectedResidualTargetAcquisition(position,{
        controllerResidual:R,targetCell,
      })
      :certifyCpcxProtectedResidualSupportAdvance(position,{
        controllerResidual:R,targetCell,
      });
    if(c.exact)candidates.push(c);
  }
  const scored=candidates.map(c=>({
    c,
    score:c.kind==='CERTIFIED_FIRST_WIN'
      ?0
      :c.kind==='PROTECTED_RESIDUAL_TARGET_ACQUISITION'?1:2,
  })).sort((a,b)=>a.score-b.score||
    ((a.c.targetCell??0)-(b.c.targetCell??0)));
  if(!scored.length)return {
    kind:'NO_CONTROLLER_DESCENT',
    exact:false,
    immediate:immediateSummary(immediate),
  };
  const best=scored[0].c;
  return {
    kind:best.kind==='CERTIFIED_FIRST_WIN'
      ?'CONTROLLER_FIRST_WIN'
      :best.kind,
    exact:true,
    certificate:certificateSummary(best),
    sourceTuple:tuple(R),
    childTuple:best.kind==='PROTECTED_RESIDUAL_TARGET_ACQUISITION'
      ?[best.childMissingCount,best.childSupportDebt]
      :best.kind==='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'
        ?[R.missingCount,best.childSupportDebt]
        :null,
  };
}
function controllerDescent(position,R){
  if(position.terminal)return {
    kind:'SOURCE_TERMINAL',exact:false,terminal:position.terminal,
  };
  if(position.mover!==R.player)return {kind:'WRONG_MOVER',exact:false};
  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind==='FORCED_LOSS_OVERLOAD')return {
    kind:'CONTROLLER_FORCED_LOSS_OVERLOAD',
    exact:false,
    immediate:immediateSummary(immediate),
  };
  if(immediate.kind==='FORCED_RESPONSE'){
    const n=certifyCpcxProtectedResidualForcedNormalization(position,{
      protectedResidual:R,
    });
    if(n.kind==='CERTIFIED_FIRST_WIN')return {
      kind:'FORCED_NORMALIZATION_FIRST_WIN',
      exact:true,
      normalization:certificateSummary(n),
    };
    if(n.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION'||!n.exact)
      return {
        kind:'FORCED_NORMALIZATION_FAILED',
        exact:false,
        normalization:certificateSummary(n),
      };
    const finalR=residualByLine(n.finalPosition,R.lineId,R.player);
    if(!finalR)return {
      kind:'FORCED_NORMALIZATION_LOST_RESIDUAL',exact:false,
    };
    if(n.finalPosition.mover!==R.player)return {
      kind:'FORCED_NORMALIZATION_TO_OPPONENT_BOUNDARY',
      exact:true,
      sourceTuple:tuple(R),
      childTuple:tuple(finalR),
      normalization:{
        rankDelta:n.rankDelta,
        stepKinds:n.steps.map(x=>x.kind),
      },
      boundary:'deterministic forced response consumed the controller turn and returned to an opponent decision boundary',
    };
    const next=controllerDescentNoNormalization(n.finalPosition,finalR);
    return {
      kind:'FORCED_NORMALIZATION_THEN_DESCENT',
      exact:next.exact===true,
      sourceTuple:tuple(R),
      normalizedTuple:tuple(finalR),
      normalization:{
        rankDelta:n.rankDelta,
        stepKinds:n.steps.map(x=>x.kind),
      },
      next,
    };
  }
  return controllerDescentNoNormalization(position,R);
}
function evaluateResponse(position,R,eventCell,macroSourceTuple){
  if(R.missingCells.includes(eventCell)){
    const transfer=certifyCpcxProtectedResidualDiagonalTransfer(position,{
      protectedResidual:R,
      blockedCell:eventCell,
    });
    if(transfer.kind!=='PROTECTED_RESIDUAL_DIAGONAL_TRANSFER'||!transfer.exact)
      return {
        eventCell:label(eventCell),
        role:'PROTECTED_TARGET_OCCUPATION',
        safe:false,
        seam:transfer.seam??transfer.kind,
      };
    const transferR=residualByLine(
      transfer.child,transfer.transfer.lineId,R.player
    );
    if(!transferR)return {
      eventCell:label(eventCell),
      role:'PROTECTED_TARGET_OCCUPATION',
      safe:false,
      seam:'TRANSFER_RESIDUAL_NOT_LIVE',
    };
    const descent=controllerDescent(transfer.child,transferR),
      finalTuple=descentFinalTuple(descent),
      strictDescentOrWin=descent.exact===true&&(
        descentWins(descent)||
        (finalTuple?tupleLess(finalTuple,macroSourceTuple):
          tupleLess(tuple(transferR),macroSourceTuple))
      );
    return {
      eventCell:label(eventCell),
      role:'PROTECTED_TARGET_OCCUPATION',
      safe:strictDescentOrWin,
      strictDescentOrWin,
      transfer:{
        lineLabel:transfer.transfer.lineLabel,
        tuple:[...transfer.transfer.tuple],
        overlap:transfer.transfer.overlapCells.map(label),
      },
      finalTuple,
      descent,
    };
  }

  const trans=certifyCpcxProtectedResidualSupportTransition(position,{
    protectedResidual:R,eventCell,
  });
  if(!trans.exact)return {
    eventCell:label(eventCell),
    role:'EXTERNAL_SUPPORT_EVENT',
    safe:false,
    seam:trans.seam??trans.kind,
  };
  if(trans.kind==='TERMINAL_EVENT')return {
    eventCell:label(eventCell),
    role:'EXTERNAL_SUPPORT_EVENT',
    safe:trans.terminal?.player===R.player,
    terminal:trans.terminal,
  };

  const child=applyCpcxForcedEvent(position,eventCell),
    childR=residualByLine(child,R.lineId,R.player);
  if(!childR)return {
    eventCell:label(eventCell),
    role:'EXTERNAL_SUPPORT_EVENT',
    safe:false,
    seam:'PROTECTED_RESIDUAL_LOST',
  };
  const descent=controllerDescent(child,childR),
    finalTuple=descentFinalTuple(descent),
    strictDescentOrWin=descent.exact===true&&(
      descentWins(descent)||
      (finalTuple!==null&&tupleLess(finalTuple,macroSourceTuple))
    );
  return {
    eventCell:label(eventCell),
    role:'EXTERNAL_SUPPORT_EVENT',
    safe:strictDescentOrWin,
    strictDescentOrWin,
    p1SupportDebtDelta:trans.supportDebtDelta,
    afterP1Tuple:tuple(childR),
    finalTuple,
    descent,
  };
}
function intersection(lists){
  if(!lists.length)return [];
  let out=[...lists[0]];
  for(const list of lists.slice(1)){
    const s=new Set(list);
    out=out.filter(x=>s.has(x));
  }
  return out.sort();
}

const rows=[];
for(const cls of artifact.classes.filter(x=>x.mover===0)){
  const source=positionFromClass(cls),R=targetResidual(source);
  if(!R)throw new Error(`target residual missing ${cls.classId}`);
  const sourceTuple=tuple(R),roles=[];
  for(let i=0;i<R.missingCells.length;i++){
    const targetCell=R.missingCells[i],role=roleNames[cpcxCell(g,targetCell).column],
      advance=certifyCpcxProtectedResidualSupportAdvance(source,{
        controllerResidual:R,targetCell,
      });
    if(advance.kind==='CERTIFIED_FIRST_WIN'){
      roles.push({
        role,targetCell:label(targetCell),actionCell:label(advance.actionCell),
        advanceKind:advance.kind,safe:true,responseCount:0,responses:[],
      });
      continue;
    }
    if(advance.kind!=='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'||!advance.exact){
      roles.push({
        role,targetCell:label(targetCell),advanceKind:advance.kind,
        advanceSeam:advance.seam??null,safe:false,responseCount:0,responses:[],
      });
      continue;
    }
    const childR=residualByLine(advance.child,R.lineId,R.player);
    if(!childR)throw new Error(`advanced residual lost ${cls.classId}/${role}`);
    const responses=frontier(advance.child).map(eventCell=>
      evaluateResponse(advance.child,childR,eventCell,sourceTuple)
    );
    roles.push({
      role,
      targetCell:label(targetCell),
      actionCell:label(advance.actionCell),
      advanceKind:advance.kind,
      advanceTuple:tuple(childR),
      responseCount:responses.length,
      safe:responses.every(x=>x.safe),
      failureCount:responses.filter(x=>!x.safe).length,
      responses,
    });
  }
  const safeRoles=roles.filter(x=>x.safe).map(x=>x.role);
  rows.push({
    classId:cls.classId,
    rank:source.rank,
    sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
    supportHeights:Array.from(source.heights).slice(0,3),
    supportOwnerClass:ownerClass(source),
    sourceProfile:supportProfile(R),
    sourceTuple,
    roles,
    safeRoles,
    hasSafeRole:safeRoles.length>0,
  });
}

const groups=new Map();
for(const row of rows){
  const key=`${row.supportHeights.join(',')}|${row.supportOwnerClass}`;
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(row);
}
const policyGroups=[...groups.entries()].map(([key,xs])=>({
  key,
  supportHeights:[...xs[0].supportHeights],
  supportOwnerClass:xs[0].supportOwnerClass,
  classIds:xs.map(x=>x.classId),
  commonSafeRoles:intersection(xs.map(x=>x.safeRoles)),
  safeRolesByClass:Object.fromEntries(xs.map(x=>[x.classId,x.safeRoles])),
})).sort((a,b)=>
  a.supportHeights.reduce((x,y)=>x+y,0)-
    b.supportHeights.reduce((x,y)=>x+y,0)||
  a.supportHeights[0]-b.supportHeights[0]||
  a.supportHeights[1]-b.supportHeights[1]||
  a.supportHeights[2]-b.supportHeights[2]||
  a.supportOwnerClass.localeCompare(b.supportOwnerClass)
);

const unsafe=rows.filter(x=>!x.hasSafeRole),
  noCommonPolicy=policyGroups.filter(x=>x.commonSafeRoles.length===0);
console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.p0-support-policy-census.v0_1',
  observation:'for every current P0 unresolved universal-diagonal class, test each protected A/B/C support-advance role against the entire current P1 frontier and require exact win or strict lexicographic defect descent after deterministic normalization and one current P0 response',
  rows,
  policyGroups,
  summary:{
    p0SourceClassCount:rows.length,
    sourceClassesWithSafeRole:rows.length-unsafe.length,
    sourceClassesWithoutSafeRole:unsafe.length,
    everyP0SourceClassHasSafeRole:unsafe.length===0,
    unsafeClasses:unsafe.map(x=>({
      classId:x.classId,
      supportHeights:x.supportHeights,
      ownerClass:x.supportOwnerClass,
      roleFailures:Object.fromEntries(x.roles.map(r=>[
        r.role,
        r.responses.filter(y=>!y.safe).map(y=>({
          eventCell:y.eventCell,
          seam:y.seam??y.descent?.kind??null,
        })),
      ])),
    })),
    policyGroupCount:policyGroups.length,
    groupsWithCommonSafeRole:policyGroups.length-noCommonPolicy.length,
    groupsWithoutCommonSafeRole:noCommonPolicy.length,
    noCommonPolicyGroups:noCommonPolicy,
    roleSafeClassCounts:Object.fromEntries(roleNames.map(role=>[
      role,rows.filter(x=>x.safeRoles.includes(role)).length,
    ])),
    policyTable:policyGroups.map(x=>({
      supportHeights:x.supportHeights,
      ownerClass:x.supportOwnerClass,
      commonSafeRoles:x.commonSafeRoles,
    })),
  },
  boundary:{
    diagnosticOnly:true,
    controllerCandidateRolesAreOnlyTheThreeProtectedSupportColumns:true,
    exactlyOneCurrentP1ResponseLayer:true,
    controllerFollowupUsesNoFreeLayerWhenForcedNormalizationReturnsDirectlyToP1:true,
    noFreeSecondP1Layer:true,
    allTransitionsUseQualifiedGenericTheorems:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
  },
},null,2));

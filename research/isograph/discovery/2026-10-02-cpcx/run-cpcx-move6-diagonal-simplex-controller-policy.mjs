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
  targetLabels=['A6','B5','C4'],
  targetCells=targetLabels.map(s=>
    (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65)
  ),
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
function residualByLine(position,lineId,player=0){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineId===lineId
  )??null;
}
function rootResidual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine
  )??null;
}
function debt(R){
  return R?R.events.reduce((n,e)=>n+e.supportDistance,0):null;
}
function tuple(R){
  return R?[R.missingCount,debt(R)]:null;
}
function tupleLess(a,b){
  return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
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
function summarizeImmediate(x){
  return {
    kind:x.kind,
    mover:x.mover??null,
    cell:Number.isInteger(x.cell)?label(x.cell):null,
    winningCells:(x.winningCells??[]).map(label),
    opponentThreatCells:(x.opponentThreatCells??x.threatCells??[]).map(label),
  };
}
function summarizeCert(c){
  return {
    kind:c.kind,
    exact:c.exact??false,
    seam:c.seam??null,
    player:c.player??null,
    actionCell:Number.isInteger(c.actionCell)?label(c.actionCell):null,
    targetCell:Number.isInteger(c.targetCell)?label(c.targetCell):null,
    sourceSupportDebt:c.sourceSupportDebt??null,
    childSupportDebt:c.childSupportDebt??null,
    sourceMissingCount:c.sourceMissingCount??null,
    childMissingCount:c.childMissingCount??null,
  };
}

function controllerDescent(position,R,roundSourceTuple){
  if(position.terminal)return {
    exact:position.terminal.player===0,
    kind:position.terminal.player===0?'P0_TERMINAL':'P1_TERMINAL',
    terminal:position.terminal,
  };
  if(position.mover!==0)return {
    exact:tupleLess(tuple(R),roundSourceTuple),
    kind:tupleLess(tuple(R),roundSourceTuple)
      ?'RETURN_P1_STRICT_DESCENT'
      :'RETURN_P1_NO_DESCENT',
    finalTuple:tuple(R),
  };

  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind==='IMMEDIATE_TERMINAL_AVAILABLE'&&immediate.mover===0)
    return {
      exact:true,
      kind:'P0_IMMEDIATE_TERMINAL_AVAILABLE',
      immediate:summarizeImmediate(immediate),
    };
  if(immediate.kind==='FORCED_LOSS_OVERLOAD')
    return {
      exact:false,
      kind:'P0_FORCED_LOSS_OVERLOAD',
      immediate:summarizeImmediate(immediate),
    };

  if(immediate.kind==='FORCED_RESPONSE'){
    const normalized=certifyCpcxProtectedResidualForcedNormalization(
      position,{protectedResidual:R}
    );
    if(normalized.kind==='CERTIFIED_FIRST_WIN'&&normalized.player===0)
      return {
        exact:true,
        kind:'FORCED_NORMALIZATION_FIRST_WIN',
        normalization:summarizeCert(normalized),
      };
    if(normalized.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION'||
       !normalized.exact)
      return {
        exact:false,
        kind:'FORCED_NORMALIZATION_FAILED',
        normalization:summarizeCert(normalized),
      };

    const finalR=residualByLine(
      normalized.finalPosition,R.lineId,R.player
    );
    if(!finalR)return {
      exact:false,
      kind:'FORCED_NORMALIZATION_LOST_RESIDUAL',
    };

    if(normalized.finalPosition.mover===1){
      const finalTuple=tuple(finalR);
      return {
        exact:tupleLess(finalTuple,roundSourceTuple),
        kind:tupleLess(finalTuple,roundSourceTuple)
          ?'FORCED_NORMALIZATION_RETURN_P1_STRICT_DESCENT'
          :'FORCED_NORMALIZATION_RETURN_P1_NO_DESCENT',
        finalTuple,
        normalization:{
          rankDelta:normalized.rankDelta,
          stepKinds:normalized.steps.map(x=>x.kind),
        },
      };
    }

    return controllerDescentNoNormalization(
      normalized.finalPosition,finalR,roundSourceTuple
    );
  }

  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')
    return {
      exact:false,
      kind:'UNSUPPORTED_IMMEDIATE_BOUNDARY',
      immediate:summarizeImmediate(immediate),
    };

  return controllerDescentNoNormalization(position,R,roundSourceTuple);
}

function controllerDescentNoNormalization(position,R,roundSourceTuple){
  const attempts=[];
  for(const targetCell of R.missingCells){
    const event=R.events.find(x=>x.cell===targetCell);
    if(!event)continue;
    const c=event.supportDistance===0
      ?certifyCpcxProtectedResidualTargetAcquisition(position,{
        controllerResidual:R,targetCell,
      })
      :certifyCpcxProtectedResidualSupportAdvance(position,{
        controllerResidual:R,targetCell,
      });
    attempts.push(c);
  }

  const win=attempts.find(c=>
    c.kind==='CERTIFIED_FIRST_WIN'&&c.player===0
  );
  if(win)return {
    exact:true,
    kind:'P0_FIRST_WIN',
    certificate:summarizeCert(win),
  };

  const descents=attempts.filter(c=>c.exact&&[
    'PROTECTED_RESIDUAL_TARGET_ACQUISITION',
    'PROTECTED_RESIDUAL_SUPPORT_ADVANCE',
  ].includes(c.kind)).map(c=>{
    const finalTuple=c.kind==='PROTECTED_RESIDUAL_TARGET_ACQUISITION'
      ?[c.childMissingCount,c.childSupportDebt]
      :[R.missingCount,c.childSupportDebt];
    return {certificate:c,finalTuple};
  }).filter(x=>tupleLess(x.finalTuple,roundSourceTuple))
    .sort((a,b)=>
      a.finalTuple[0]-b.finalTuple[0]||
      a.finalTuple[1]-b.finalTuple[1]||
      (a.certificate.targetCell??0)-(b.certificate.targetCell??0)
    );

  if(descents.length)return {
    exact:true,
    kind:descents[0].certificate.kind,
    finalTuple:descents[0].finalTuple,
    certificate:summarizeCert(descents[0].certificate),
  };

  return {
    exact:false,
    kind:'NO_STRICT_CONTROLLER_DESCENT',
    sourceTuple:roundSourceTuple,
    currentTuple:tuple(R),
    immediate:summarizeImmediate(classifyCpcxImmediate(position)),
    attempts:attempts.map(summarizeCert),
  };
}

function evaluateResponse(positionAfterController,R,eventCell,roundSourceTuple){
  if(R.missingCells.includes(eventCell)){
    const transfer=certifyCpcxProtectedResidualDiagonalTransfer(
      positionAfterController,{
        protectedResidual:R,
        blockedCell:eventCell,
      }
    );
    if(transfer.kind!=='PROTECTED_RESIDUAL_DIAGONAL_TRANSFER'||
       !transfer.exact)
      return {
        exact:false,
        kind:'TARGET_BLOCK_TRANSFER_FAILED',
        eventCell:label(eventCell),
        transfer:{
          kind:transfer.kind,
          seam:transfer.seam??null,
        },
      };

    const nextR=residualByLine(
      transfer.child,transfer.transfer.lineId,R.player
    );
    if(!nextR)return {
      exact:false,
      kind:'TRANSFER_RESIDUAL_NOT_LIVE',
      eventCell:label(eventCell),
    };
    const descent=controllerDescent(
      transfer.child,nextR,roundSourceTuple
    );
    return {
      exact:descent.exact===true,
      kind:descent.exact
        ?'TARGET_BLOCK_THEN_DESCENT'
        :'TARGET_BLOCK_DESCENT_FAILURE',
      eventCell:label(eventCell),
      transfer:{
        lineLabel:transfer.transfer.lineLabel,
        overlapCount:transfer.transfer.overlapCount,
        sourceTuple:[...transfer.source.tuple],
        transferTuple:[...transfer.transfer.tuple],
      },
      descent,
    };
  }

  const transition=certifyCpcxProtectedResidualSupportTransition(
    positionAfterController,{
      protectedResidual:R,
      eventCell,
    }
  );
  if(!transition.exact)return {
    exact:false,
    kind:'EXTERNAL_TRANSITION_FAILED',
    eventCell:label(eventCell),
    seam:transition.seam??null,
  };
  if(transition.kind==='TERMINAL_EVENT')return {
    exact:transition.terminal?.player===0,
    kind:transition.terminal?.player===0
      ?'P0_TERMINAL_ON_P1_EVENT'
      :'P1_TERMINAL_ON_RESPONSE',
    eventCell:label(eventCell),
    terminal:transition.terminal,
  };

  const child=applyCpcxForcedEvent(positionAfterController,eventCell),
    nextR=residualByLine(child,R.lineId,R.player);
  if(!nextR)return {
    exact:false,
    kind:'PROTECTED_RESIDUAL_LOST_AFTER_EXTERNAL',
    eventCell:label(eventCell),
  };

  const descent=controllerDescent(child,nextR,roundSourceTuple);
  return {
    exact:descent.exact===true,
    kind:descent.exact
      ?'EXTERNAL_THEN_DESCENT'
      :'EXTERNAL_DESCENT_FAILURE',
    eventCell:label(eventCell),
    p1SupportDebtDelta:transition.supportDebtDelta,
    descent,
  };
}

const rows=[];
for(const cls of artifact.classes.filter(x=>x.mover===0)){
  const source=positionFromClass(cls),
    R=rootResidual(source);
  if(!R)throw new Error(`root residual missing ${cls.classId}`);
  const sourceTuple=tuple(R),
    roles=[];

  for(let i=0;i<targetCells.length;i++){
    const targetCell=targetCells[i],
      action=certifyCpcxProtectedResidualSupportAdvance(source,{
        controllerResidual:R,targetCell,
      });

    if(action.kind==='CERTIFIED_FIRST_WIN'){
      roles.push({
        role:roleNames[i],
        target:targetLabels[i],
        exact:true,
        safe:true,
        actionKind:action.kind,
        responses:[],
      });
      continue;
    }
    if(action.kind!=='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'||
       !action.exact){
      roles.push({
        role:roleNames[i],
        target:targetLabels[i],
        exact:false,
        safe:false,
        actionKind:action.kind,
        seam:action.seam??null,
        responses:[],
      });
      continue;
    }

    const childR=residualByLine(
      action.child,R.lineId,R.player
    );
    if(!childR)throw new Error('support advance lost residual');

    const responses=frontier(action.child).map(eventCell=>
      evaluateResponse(
        action.child,childR,eventCell,sourceTuple
      )
    );
    roles.push({
      role:roleNames[i],
      target:targetLabels[i],
      exact:true,
      safe:responses.every(x=>x.exact),
      actionKind:action.kind,
      actionCell:label(action.actionCell),
      childTuple:tuple(childR),
      responses,
    });
  }

  rows.push({
    classId:cls.classId,
    sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))]
      .sort((a,b)=>a-b),
    rank:source.rank,
    supportHeights:Array.from(source.heights).slice(0,3),
    ownerClass:ownerClass(source),
    sourceTuple,
    safeRoles:roles.filter(x=>x.safe).map(x=>x.role),
    roles,
  });
}

function keySupport(row){
  return row.supportHeights.join(',');
}
function keySupportOwner(row){
  return `${keySupport(row)}|${row.ownerClass}`;
}
function groupPolicy(keyFn){
  const groups=new Map();
  for(const row of rows){
    const key=keyFn(row);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([key,members])=>{
    let common=new Set(roleNames);
    for(const row of members){
      const safe=new Set(row.safeRoles);
      common=new Set([...common].filter(x=>safe.has(x)));
    }
    return {
      key,
      classIds:members.map(x=>x.classId),
      supportHeights:members[0].supportHeights,
      ownerClass:keyFn===keySupportOwner?members[0].ownerClass:null,
      commonSafeRoles:[...common].sort(),
      everyClassHasSafeRole:members.every(x=>x.safeRoles.length>0),
    };
  }).sort((a,b)=>a.key.localeCompare(b.key));
}

const supportPolicy=groupPolicy(keySupport),
  supportOwnerPolicy=groupPolicy(keySupportOwner),
  failures=rows.filter(x=>x.safeRoles.length===0);

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.diagonal-simplex-controller-policy.v0_1',
  observation:'one theorem-qualified P0 support role, one complete current P1 frontier, deterministic forced normalization, and at most one current P0 protected-carrier descent',
  rows,
  summary:{
    sourceClassCount:rows.length,
    classWithAtLeastOneSafeRoleCount:
      rows.filter(x=>x.safeRoles.length>0).length,
    classWithoutSafeRoleCount:failures.length,
    classesWithoutSafeRole:failures.map(x=>x.classId),
    supportTupleGroupCount:supportPolicy.length,
    supportTupleGroupsWithCommonSafeRole:
      supportPolicy.filter(x=>x.commonSafeRoles.length>0).length,
    supportTuplePolicy:supportPolicy,
    supportOwnerGroupCount:supportOwnerPolicy.length,
    supportOwnerGroupsWithCommonSafeRole:
      supportOwnerPolicy.filter(x=>x.commonSafeRoles.length>0).length,
    supportOwnerPolicy,
    globalCommonSafeRoles:roleNames.filter(role=>
      rows.every(x=>x.safeRoles.includes(role))
    ),
  },
  boundary:{
    diagnosticOnly:true,
    sourceClassesAreExactCurrentUnresolvedClasses:true,
    p0ActionUsesQualifiedProtectedSupportAdvance:true,
    p1ExternalEventUsesQualifiedProtectedSupportTransition:true,
    p1TargetBlockUsesQualifiedSameTrackDiagonalTransfer:true,
    forcedResponsesUseQualifiedProtectedForcedNormalization:true,
    p0FollowupUsesQualifiedSupportAdvanceOrTargetAcquisition:true,
    oneCurrentP1FrontierOnly:true,
    noSecondFreeP1Layer:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
    noValueConclusion:true,
  },
},null,2));

import {execFileSync} from 'node:child_process';
import {
  createCpcxGeometry,
  scanCpcxObligations,
  cpcxCell,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  runCpcxFirstWinCertificate,
} from './cpcx-successor.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';
import {
  certifyCpcxSupportReleaseAcquisition,
} from './cpcx-support-release-acquisition.mjs';
import {
  createCpcxResidualCarrier,
  compileCpcxResidualEventChain,
} from './cpcx-residual.mjs';

const endpointScript=new URL(
  './run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);
const endpoint=JSON.parse(execFileSync(process.execPath,[endpointScript.pathname],{
  encoding:'utf8',
  maxBuffer:768*1024*1024,
}));

const g=createCpcxGeometry(),c2=1*g.columns+2,c1=2;
function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function positionFromKey(key){
  const [moverText,targetText,heightsText,ownerText]=key.split('|'),
    heights=new Uint32Array(heightsText.split(',').map(Number)),
    owner=new Int8Array(ownerText.split(',').map(Number)),
    rank=Array.from(heights).reduce((a,b)=>a+b,0);
  return {
    geometry:g,moves:new Uint32Array(0),rank,
    mover:Number(moverText),heights,owner,terminal:null,
    targetCell:Number(targetText),
  };
}
function c2Singleton(position){
  return scanCpcxObligations(position).find(o=>
    o.player===1&&o.missingCount===1&&o.missingCells[0]===c2
  )??null;
}
function countBy(rows,fn){
  const out={};
  for(const row of rows){
    const k=fn(row)??'NULL';
    out[k]=(out[k]??0)+1;
  }
  return out;
}
function playableSingletons(position,player){
  return [...new Set(scanCpcxObligations(position)
    .filter(o=>o.player===player&&o.missingCount===1&&
      o.events[0]?.supportDistance===0)
    .map(o=>o.missingCells[0]))].sort((a,b)=>a-b);
}

const candidates=[];
for(const probe of endpoint.novelMaskSecondLayerProbes??[]){
  if(JSON.stringify(probe.sourceMeasure)!==JSON.stringify([3,9,27]))continue;
  for(const row of probe.secondLayerRows??[]){
    const nt=row.noTransferTargetBlockProbe,
      audit=nt?.exactProgressFirst?.postSuccessorActionAudit;
    if(!Array.isArray(audit))continue;
    for(const action of audit){
      if(!['D6','G4'].includes(action.actionCell))continue;
      for(const target of action.targetRcics??[]){
        if(target.targetCell!=='C3'||target.gapCapacity?.rootGap!==2)continue;
        candidates.push({
          actionCell:action.actionCell,
          gapCapacity:target.gapCapacity,
        });
      }
    }
  }
}

const reports=[];
for(const candidate of candidates){
  const nodes=(candidate.gapCapacity.unresolvedNodes??[]).filter(n=>n.key),
    seamRows=[],sharedRows=[];

  for(const node of nodes.filter(n=>n.gap===1)){
    const source=positionFromKey(node.key),
      sourceC2=c2Singleton(source);
    if(!sourceC2||sourceC2.events[0]?.supportDistance!==1)continue;

    for(const p1Cell of frontier(source)){
      if(p1Cell===c1)continue;
      const position=applyCpcxForcedEvent(source,p1Cell);
      if(position.terminal)continue;

      const live=c2Singleton(position),reservationActions=[];
      if(live&&live.events[0]?.supportDistance===1){
        for(const p0Cell of frontier(position)){
          const rc=certifyCpcxSupportReleaseResponseNeutralization(position,{
            opponentResidual:live,defenderActionCell:p0Cell,
          });
          if(rc.exact&&rc.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
            reservationActions.push(p0Cell);
        }
      }
      if(reservationActions.length)continue;
      if(classifyCpcxImmediate(position).kind!=='NO_IMMEDIATE_OBLIGATION')
        continue;

      const residuals=scanCpcxObligations(position).filter(o=>o.player===0),
        seen=new Set(),targets=[];
      for(const residual of residuals)for(const event of residual.events){
        if(event.supportDistance!==1)continue;
        const k=`${residual.lineId}|${event.cell}`;
        if(seen.has(k))continue;
        seen.add(k);
        targets.push({residual,targetCell:event.cell});
      }

      for(const t of targets)for(const actionCell of frontier(position)){
        const cert=certifyCpcxSupportReleaseAcquisition(position,{
          controllerResidual:t.residual,
          targetCell:t.targetCell,
          controllerActionCell:actionCell,
        });
        if(cert.seam!=='SUPPLY_CREATES_OPPONENT_IMMEDIATE_SINGLETON')continue;

        const urgent=[...(cert.cells??[])].sort((a,b)=>a-b),
          sameCell=urgent.length===1&&urgent[0]===t.targetCell,
          base={
            sourceKey:node.key,
            sourceRank:node.rank,
            p1EventCell:p1Cell,
            p1EventLabel:label(p1Cell),
            controllerRank:position.rank,
            residualLineId:t.residual.lineId,
            residualLineLabel:t.residual.lineLabel,
            targetCell:t.targetCell,
            targetLabel:label(t.targetCell),
            pinnedActionCell:actionCell,
            pinnedActionLabel:label(actionCell),
            urgentCells:urgent,
            urgentLabels:urgent.map(label),
            sameCell,
          };
        seamRows.push(base);
        if(!sameCell)continue;

        const targetEvent=t.residual.events.find(e=>e.cell===t.targetCell);
        if(!targetEvent||targetEvent.supportDistance!==1)
          throw new Error('target provenance drift');
        const supportCell=t.targetCell-g.columns,
          afterPinned=applyCpcxForcedEvent(position,actionCell),
          afterSupply=applyCpcxForcedEvent(afterPinned,supportCell);

        if(afterSupply.terminal)throw new Error('diagnostic seam supply terminal drift');
        const urgentRows=scanCpcxObligations(afterSupply).filter(o=>
          o.player===1&&o.missingCount===1&&o.missingCells[0]===t.targetCell&&
          o.events[0]?.supportDistance===0
        );

        let localSafe=false,localSeam=null,afterTarget=null,
          chain=null,closed=null,progress=null,first=null;
        const targetFrontier=frontier(afterSupply).includes(t.targetCell);
        if(!targetFrontier){
          localSeam='SHARED_TARGET_NOT_FRONTIER';
        }else{
          afterTarget=applyCpcxForcedEvent(afterSupply,t.targetCell);
          if(afterTarget.terminal&&afterTarget.terminal.player!==0){
            localSeam='SHARED_TARGET_NONCONTROLLER_TERMINAL';
          }else{
            const carrier=createCpcxResidualCarrier(position,[t.residual]);
            chain=compileCpcxResidualEventChain(carrier,[
              {cell:actionCell,owner:0},
              {cell:supportCell,owner:1},
              {cell:t.targetCell,owner:0},
            ]);
            const last=chain.steps[2],
              contracts=last.contracted.some(x=>
                x.player===0&&x.lineLabel===t.residual.lineLabel&&
                x.acquiredCell===t.targetCell
              ),
              completes=last.completions.some(x=>
                x.player===0&&x.lineLabel===t.residual.lineLabel&&
                x.completingCell===t.targetCell
              ),
              p1UrgentAfter=afterTarget.terminal
                ?[]
                :playableSingletons(afterTarget,1);
            if(!contracts&&!completes)
              localSeam='PROTECTED_RESIDUAL_NOT_ACQUIRED';
            else if(p1UrgentAfter.length)
              localSeam='POST_SHARED_DISCHARGE_P1_SINGLETON';
            else{
              localSafe=true;
              if(!afterTarget.terminal){
                closed=closeCpcxForcedResponses(afterTarget);
                progress=classifyCpcxProgress(closed.position,{player:0});
                first=runCpcxFirstWinCertificate(closed.position,{attacker:0});
              }
            }
          }
        }

        sharedRows.push({
          ...base,
          supportCell,
          supportLabel:label(supportCell),
          urgentResidualCount:urgentRows.length,
          localSafe,
          localSeam,
          targetTerminal:afterTarget?.terminal??null,
          cofactorLast:chain?{
            contracted:chain.steps[2].contracted.map(x=>x.lineLabel),
            completions:chain.steps[2].completions.map(x=>x.lineLabel),
            killed:chain.steps[2].killed.map(x=>x.lineLabel),
          }:null,
          normalization:closed?{
            kind:closed.kind,
            player:closed.player??null,
            stepCount:closed.steps?.length??0,
            boundary:closed.boundary?.kind??null,
          }:null,
          finalProgress:progress?{
            kind:progress.kind,
            exact:progress.exact??false,
            player:progress.player??null,
            source:progress.source??null,
            seam:progress.seam??null,
            macroKind:progress.macro?.kind??null,
          }:null,
          finalFirstWin:first?{
            kind:first.kind,
            exact:first.exact??false,
            player:first.player??null,
            seam:first.seam??null,
          }:null,
        });
      }
    }
  }

  reports.push({
    actionCell:candidate.actionCell,
    seamAttemptCount:seamRows.length,
    uniqueSharedCellCandidateCount:sharedRows.length,
    locallySafeSharedDischargeCount:sharedRows.filter(x=>x.localSafe).length,
    nonSharedUrgentHistogram:countBy(
      seamRows.filter(x=>!x.sameCell),
      x=>x.urgentLabels.join('+')
    ),
    sharedTargetHistogram:countBy(sharedRows,x=>x.targetLabel),
    sharedPinnedActionHistogram:countBy(sharedRows,x=>x.pinnedActionLabel),
    localSeamHistogram:countBy(sharedRows,x=>x.localSafe?'SAFE':x.localSeam),
    targetTerminalP0Count:sharedRows.filter(x=>
      x.targetTerminal?.player===0
    ).length,
    targetTerminalP1Count:sharedRows.filter(x=>
      x.targetTerminal?.player===1
    ).length,
    finalFirstWinP0Count:sharedRows.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===0
    ).length,
    finalFirstWinP1Count:sharedRows.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===1
    ).length,
    sharedRows,
  });
}

const all=reports.flatMap(x=>x.sharedRows);
console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-shared-acquisition-block-discharge-diagnostic.v0_1',
  root:'44444',
  reports,
  summary:{
    seamAttemptCount:reports.reduce((n,x)=>n+x.seamAttemptCount,0),
    sharedCellCandidateCount:all.length,
    locallySafeSharedDischargeCount:all.filter(x=>x.localSafe).length,
    targetHistogram:countBy(all,x=>x.targetLabel),
    pinnedActionHistogram:countBy(all,x=>x.pinnedActionLabel),
    localSeamHistogram:countBy(all,x=>x.localSafe?'SAFE':x.localSeam),
    targetTerminalP0Count:all.filter(x=>x.targetTerminal?.player===0).length,
    finalFirstWinP0Count:all.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===0
    ).length,
    finalFirstWinP1Count:all.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===1
    ).length,
  },
  boundary:{
    diagnosticOnly:true,
    sourceAcquisitionTheoremUnchanged:true,
    onlyFrozenRejectedSeamConsumed:true,
    noRetargeting:true,
    noLaterFreeP1Enumeration:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
  },
},null,2));

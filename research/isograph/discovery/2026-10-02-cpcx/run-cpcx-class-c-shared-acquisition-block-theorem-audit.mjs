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
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';
import {
  certifyCpcxSupportReleaseSharedAcquisitionBlock,
} from './cpcx-support-release-shared-acquisition-block.mjs';

const endpointScript=new URL(
  './run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);
const endpoint=JSON.parse(execFileSync(process.execPath,[endpointScript.pathname],{
  encoding:'utf8',
  maxBuffer:1024*1024*1024,
}));

const g=createCpcxGeometry(),
  c2=1*g.columns+2,
  c1=2,
  c3=2*g.columns+2;

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function frontier(position){
  const out=[];
  for(let column=0;column<g.columns;column++){
    const row=position.heights[column];
    if(row<g.rows)out.push(row*g.columns+column);
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
function stateKey(position,targetCell=c3){
  return [
    position.mover,
    targetCell,
    Array.from(position.heights).join(','),
    Array.from(position.owner).join(','),
  ].join('|');
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
          source:{
            firstLayerEventCell:probe.firstLayerEventCell??null,
            secondLayerEventCell:row.eventCell??null,
            blockedCell:nt.blockedCell??null,
            sourceMeasure:probe.sourceMeasure,
            endpointMeasure:probe.endpointMeasure,
          },
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
    nodeByKey=new Map(nodes.map(n=>[n.key,n])),
    rows=[];

  for(const node of nodes.filter(n=>n.gap===1)){
    const source=positionFromKey(node.key),
      sourceC2=c2Singleton(source);
    if(!sourceC2||sourceC2.events[0]?.supportDistance!==1)continue;

    for(const p1Cell of frontier(source)){
      if(p1Cell===c1)continue;
      const position=applyCpcxForcedEvent(source,p1Cell);
      if(position.terminal)continue;

      const live=c2Singleton(position),
        reservationActions=[];
      if(live&&live.events[0]?.supportDistance===1){
        for(const p0Cell of frontier(position)){
          const cert=certifyCpcxSupportReleaseResponseNeutralization(position,{
            opponentResidual:live,defenderActionCell:p0Cell,
          });
          if(cert.exact&&cert.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
            reservationActions.push(p0Cell);
        }
      }
      if(reservationActions.length)continue;
      if(classifyCpcxImmediate(position).kind!=='NO_IMMEDIATE_OBLIGATION')
        continue;

      const targets=[],seen=new Set();
      for(const residual of scanCpcxObligations(position)
        .filter(o=>o.player===0)){
        for(const event of residual.events){
          if(event.supportDistance!==1)continue;
          const k=`${residual.lineId}|${event.cell}`;
          if(seen.has(k))continue;
          seen.add(k);
          targets.push({residual,targetCell:event.cell});
        }
      }

      const certs=[],rejects=[];
      for(const target of targets){
        for(const actionCell of frontier(position)){
          const cert=certifyCpcxSupportReleaseSharedAcquisitionBlock(position,{
            controllerResidual:target.residual,
            targetCell:target.targetCell,
            controllerActionCell:actionCell,
          });
          if(!cert.exact||
             cert.kind!=='SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE'){
            rejects.push(cert.seam??cert.kind);
            continue;
          }

          const afterPinned=applyCpcxForcedEvent(position,actionCell),
            tokenEntryKey=!afterPinned.terminal&&afterPinned.mover===1
              ?stateKey(afterPinned,c3):null,
            afterSupply=applyCpcxForcedEvent(
              afterPinned,cert.sharedEdge.triggerCell
            ),
            afterResponse=applyCpcxForcedEvent(
              afterSupply,cert.sharedEdge.responseCell
            );
          let closed=null,q=afterResponse,first=null;
          if(!afterResponse.terminal){
            closed=closeCpcxForcedResponses(afterResponse);
            if(closed.kind==='OPEN')q=closed.position;
            else q=closed.position??afterResponse;
          }
          if(q&&!q.terminal)
            first=runCpcxFirstWinCertificate(q,{attacker:0});
          const qkey=q&&!q.terminal&&q.mover===1?stateKey(q,c3):null;

          certs.push({
            sourceKey:node.key,
            sourceRank:node.rank,
            p1EventCell:p1Cell,
            p1EventLabel:label(p1Cell),
            controllerRank:position.rank,
            protectedLineId:target.residual.lineId,
            protectedLineLabel:target.residual.lineLabel,
            targetCell:target.targetCell,
            targetLabel:label(target.targetCell),
            pinnedActionCell:actionCell,
            pinnedActionLabel:label(actionCell),
            tokenEntryKey,
            exactFixedCohortTokenEntry:
              Boolean(tokenEntryKey&&nodeByKey.has(tokenEntryKey)),
            triggerCell:cert.sharedEdge.triggerCell,
            triggerLabel:label(cert.sharedEdge.triggerCell),
            responseCell:cert.sharedEdge.responseCell,
            responseLabel:label(cert.sharedEdge.responseCell),
            contracted:cert.sharedEdge.controllerResidualContracted,
            completed:cert.sharedEdge.controllerResidualCompleted,
            terminal:afterResponse.terminal,
            normalizationKind:closed?.kind??null,
            normalizationPlayer:closed?.player??null,
            normalizationSteps:closed?.steps?.length??0,
            finalRank:q?.rank??null,
            finalMover:q?.mover??null,
            finalKey:qkey,
            exactFixedCohortReentry:Boolean(qkey&&nodeByKey.has(qkey)),
            finalFirstWin:first?{
              kind:first.kind,
              exact:first.exact??false,
              player:first.player??null,
              seam:first.seam??null,
            }:null,
          });
        }
      }

      rows.push({
        sourceKey:node.key,
        sourceRank:node.rank,
        p1EventCell:p1Cell,
        p1EventLabel:label(p1Cell),
        controllerRank:position.rank,
        targetCount:targets.length,
        certificateCount:certs.length,
        certificates:certs,
        rejectionSeams:countBy(rejects,x=>x),
      });
    }
  }

  const certs=rows.flatMap(x=>x.certificates);
  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    cohortStateCount:rows.length,
    theoremCoveredStateCount:rows.filter(x=>x.certificateCount>0).length,
    exactCertificateCount:certs.length,
    targetHistogram:countBy(certs,x=>x.targetLabel),
    pinnedActionHistogram:countBy(certs,x=>x.pinnedActionLabel),
    triggerHistogram:countBy(certs,x=>x.triggerLabel),
    responseHistogram:countBy(certs,x=>x.responseLabel),
    contractionCount:certs.filter(x=>x.contracted).length,
    completionCount:certs.filter(x=>x.completed).length,
    responseTerminalP0Count:certs.filter(x=>x.terminal?.player===0).length,
    responseTerminalP1Count:certs.filter(x=>x.terminal?.player===1).length,
    normalizationKinds:countBy(certs,x=>x.normalizationKind),
    exactFixedCohortTokenEntryCount:
      certs.filter(x=>x.exactFixedCohortTokenEntry).length,
    exactFixedCohortReentryCount:certs.filter(x=>x.exactFixedCohortReentry).length,
    finalP0FirstWinCount:certs.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===0
    ).length,
    finalP1FirstWinCount:certs.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===1
    ).length,
    rejectionSeams:countBy(
      rows.flatMap(x=>Object.entries(x.rejectionSeams)
        .flatMap(([k,n])=>Array.from({length:n},()=>k))),
      x=>x
    ),
    rows,
  });
}

const allRows=reports.flatMap(x=>x.rows),
  allCerts=allRows.flatMap(x=>x.certificates);
console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-shared-acquisition-block-theorem-audit.v0_1',
  root:'44444',
  qualifiedTheoremRun:37171239091,
  reports,
  summary:{
    cohortStateCount:allRows.length,
    theoremCoveredStateCount:allRows.filter(x=>x.certificateCount>0).length,
    exactCertificateCount:allCerts.length,
    targetHistogram:countBy(allCerts,x=>x.targetLabel),
    pinnedActionHistogram:countBy(allCerts,x=>x.pinnedActionLabel),
    exactFixedCohortTokenEntryCount:
      allCerts.filter(x=>x.exactFixedCohortTokenEntry).length,
    exactFixedCohortReentryCount:
      allCerts.filter(x=>x.exactFixedCohortReentry).length,
    finalP0FirstWinCount:allCerts.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===0
    ).length,
    finalP1FirstWinCount:allCerts.filter(x=>
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===1
    ).length,
  },
  boundary:{
    theoremUnchanged:true,
    exactFrozenClassCCohort:true,
    currentP0FrontierAuditOnly:true,
    namedSupplyAndResponseOnly:true,
    deterministicNormalizationOnly:true,
    noLaterFreeP1Enumeration:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
    recursiveSearch:false,
  },
},null,2));

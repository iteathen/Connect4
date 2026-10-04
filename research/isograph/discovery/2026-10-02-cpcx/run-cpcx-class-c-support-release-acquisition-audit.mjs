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
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';
import {
  certifyCpcxSupportReleaseAcquisition,
} from './cpcx-support-release-acquisition.mjs';

const endpointScript=new URL(
  './run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);
const endpoint=JSON.parse(execFileSync(process.execPath,[endpointScript.pathname],{
  encoding:'utf8',
  maxBuffer:768*1024*1024,
}));

const g=createCpcxGeometry(),
  c2=1*g.columns+2,
  c1=2;

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
    geometry:g,
    moves:new Uint32Array(0),
    rank,
    mover:Number(moverText),
    heights,
    owner,
    terminal:null,
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
            opponentResidual:live,
            defenderActionCell:p0Cell,
          });
          if(cert.exact&&cert.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
            reservationActions.push(p0Cell);
        }
      }
      if(reservationActions.length)continue;
      if(classifyCpcxImmediate(position).kind!=='NO_IMMEDIATE_OBLIGATION')
        continue;

      const progress=classifyCpcxProgress(position,{player:0}),
        residuals=scanCpcxObligations(position).filter(o=>o.player===0),
        depthOne=[];
      for(const residual of residuals){
        for(const event of residual.events){
          if(event.supportDistance!==1)continue;
          depthOne.push({
            residual,
            targetCell:event.cell,
          });
        }
      }

      const seenTargets=new Set(),targets=[];
      for(const t of depthOne){
        const k=`${t.residual.lineId}|${t.targetCell}`;
        if(seenTargets.has(k))continue;
        seenTargets.add(k);targets.push(t);
      }

      const certs=[],rejects=[];
      for(const t of targets){
        for(const p0Cell of frontier(position)){
          const cert=certifyCpcxSupportReleaseAcquisition(position,{
            controllerResidual:t.residual,
            targetCell:t.targetCell,
            controllerActionCell:p0Cell,
          });
          if(cert.exact&&cert.kind==='SUPPORT_RELEASE_ACQUISITION_EDGE'){
            const afterPinned=applyCpcxForcedEvent(position,p0Cell),
              afterSupply=applyCpcxForcedEvent(
                afterPinned,cert.acquisitionEdge.triggerCell
              ),
              afterAcquisition=applyCpcxForcedEvent(
                afterSupply,cert.acquisitionEdge.acquisitionCell
              );
            let closure=null,first=null;
            if(!afterAcquisition.terminal){
              closure=closeCpcxForcedResponses(afterAcquisition);
              if(closure.position&&!closure.position.terminal)
                first=runCpcxFirstWinCertificate(
                  closure.position,{attacker:0}
                );
            }
            certs.push({
              lineId:t.residual.lineId,
              lineLabel:t.residual.lineLabel,
              targetCell:t.targetCell,
              targetLabel:label(t.targetCell),
              actionCell:p0Cell,
              actionLabel:label(p0Cell),
              triggerCell:cert.acquisitionEdge.triggerCell,
              triggerLabel:label(cert.acquisitionEdge.triggerCell),
              acquisitionCell:cert.acquisitionEdge.acquisitionCell,
              acquisitionLabel:label(cert.acquisitionEdge.acquisitionCell),
              completed:cert.acquisitionEdge.completed,
              afterAcquisitionTerminal:afterAcquisition.terminal,
              normalizationKind:closure?.kind??null,
              normalizationPlayer:closure?.player??null,
              normalizationSteps:closure?.steps?.length??0,
              finalFirstWin:first?{
                kind:first.kind,
                exact:first.exact??false,
                player:first.player??null,
                seam:first.seam??null,
              }:null,
            });
          }else{
            rejects.push(cert.seam??cert.kind);
          }
        }
      }

      rows.push({
        sourceKey:node.key,
        sourceRank:node.rank,
        p1EventCell:p1Cell,
        p1EventLabel:label(p1Cell),
        controllerRank:position.rank,
        existingProgressKind:progress.kind,
        existingMacroKind:progress.macro?.kind??null,
        depthOneTargetCount:targets.length,
        depthOneTargets:targets.map(t=>({
          lineId:t.residual.lineId,
          lineLabel:t.residual.lineLabel,
          targetCell:t.targetCell,
          targetLabel:label(t.targetCell),
        })),
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
    statesWithDepthOneP0Target:rows.filter(x=>x.depthOneTargetCount>0).length,
    totalDepthOneTargetOccurrences:
      rows.reduce((n,x)=>n+x.depthOneTargetCount,0),
    acquisitionCoveredStateCount:rows.filter(x=>x.certificateCount>0).length,
    exactCertificateCount:certs.length,
    targetHistogram:countBy(certs,x=>x.targetLabel),
    actionHistogram:countBy(certs,x=>x.actionLabel),
    existingPlayableTwoPieceStateCount:rows.filter(x=>
      x.existingProgressKind==='CERTIFIED_FORCING_MACRO'&&
      x.existingMacroKind==='PLAYABLE_TWO_PIECE'
    ).length,
    acquisitionAndPlayableTwoPieceOverlap:rows.filter(x=>
      x.certificateCount>0&&
      x.existingProgressKind==='CERTIFIED_FORCING_MACRO'&&
      x.existingMacroKind==='PLAYABLE_TWO_PIECE'
    ).length,
    supplyBranchP0TerminalCount:certs.filter(x=>
      x.afterAcquisitionTerminal?.player===0||
      (x.normalizationKind==='CERTIFIED_FIRST_WIN'&&x.normalizationPlayer===0)||
      x.finalFirstWin?.kind==='CERTIFIED_FIRST_WIN'&&
      x.finalFirstWin?.player===0
    ).length,
    supplyBranchP1TerminalCount:certs.filter(x=>
      x.afterAcquisitionTerminal?.player===1||
      (x.normalizationKind==='CERTIFIED_FIRST_WIN'&&x.normalizationPlayer===1)||
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

const all=reports.flatMap(x=>x.rows),allCerts=all.flatMap(x=>x.certificates);
console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-support-release-acquisition-audit.v0_1',
  root:'44444',
  reports,
  summary:{
    cohortStateCount:all.length,
    statesWithDepthOneP0Target:all.filter(x=>x.depthOneTargetCount>0).length,
    acquisitionCoveredStateCount:all.filter(x=>x.certificateCount>0).length,
    exactCertificateCount:allCerts.length,
    targetHistogram:countBy(allCerts,x=>x.targetLabel),
    actionHistogram:countBy(allCerts,x=>x.actionLabel),
    existingPlayableTwoPieceStateCount:all.filter(x=>
      x.existingProgressKind==='CERTIFIED_FORCING_MACRO'&&
      x.existingMacroKind==='PLAYABLE_TWO_PIECE'
    ).length,
    acquisitionAndPlayableTwoPieceOverlap:all.filter(x=>
      x.certificateCount>0&&
      x.existingProgressKind==='CERTIFIED_FORCING_MACRO'&&
      x.existingMacroKind==='PLAYABLE_TWO_PIECE'
    ).length,
  },
  boundary:{
    qualifiedTheoremRun:37168820777,
    currentP0FrontierOnly:true,
    namedSupplyBranchOnly:true,
    noLaterFreeP1Enumeration:true,
    noRecursiveLegalMoveTraversal:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
  },
},null,2));

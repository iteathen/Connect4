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
  c1=2,
  c3=2*g.columns+2;

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
  const [moverText,targetText,heightsText,ownerText]=key.split('|');
  const heights=new Uint32Array(heightsText.split(',').map(Number)),
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
function progressSummary(p){
  if(!p)return null;
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    seam:p.seam??null,
    source:p.source??null,
    setupCell:Number.isInteger(p.setupCell)?label(p.setupCell):null,
  };
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
      residual=c2Singleton(source);
    if(!residual||residual.events[0]?.supportDistance!==1)continue;

    for(const p1Cell of frontier(source)){
      if(p1Cell===c1)continue;
      const afterP1=applyCpcxForcedEvent(source,p1Cell);
      if(afterP1.terminal)continue;

      // Reproduce the prior reservation audit exactly so this experiment
      // retains only rows that it did not cover.
      const live=c2Singleton(afterP1),
        reservationActions=[];
      if(live&&live.events[0]?.supportDistance===1){
        for(const p0Cell of frontier(afterP1)){
          const cert=certifyCpcxSupportReleaseResponseNeutralization(afterP1,{
            opponentResidual:live,
            defenderActionCell:p0Cell,
          });
          if(cert.exact&&cert.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
            reservationActions.push(p0Cell);
        }
      }
      if(reservationActions.length)continue;

      const immediate=classifyCpcxImmediate(afterP1),
        first=runCpcxFirstWinCertificate(afterP1,{attacker:0}),
        record={
          sourceKey:node.key,
          sourceRank:node.rank,
          sourceSupport:node.support,
          sourceDescriptor:node.descriptor,
          p1EventCell:p1Cell,
          p1EventLabel:label(p1Cell),
          afterP1Rank:afterP1.rank,
          immediate:{
            kind:immediate.kind,
            cell:Number.isInteger(immediate.cell)?label(immediate.cell):null,
            winningCells:(immediate.winningCells??[]).map(label),
            threatCells:(immediate.threatCells??
              immediate.opponentThreatCells??[]).map(label),
          },
          directFirstWin:{
            kind:first.kind,
            exact:first.exact??false,
            player:first.player??null,
            seam:first.seam??null,
          },
          normalization:null,
        };

      if(immediate.kind==='FORCED_RESPONSE'){
        const closure=closeCpcxForcedResponses(afterP1),
          q=closure.position,
          qkey=q&&!q.terminal?stateKey(q,c3):null,
          match=qkey?nodeByKey.get(qkey)??null:null,
          qfirst=q?runCpcxFirstWinCertificate(q,{attacker:0}):null,
          qprogress=q?classifyCpcxProgress(q,{player:0}):null,
          qC2=q?c2Singleton(q):null,
          p0C3=q?scanCpcxObligations(q).filter(o=>
            o.player===0&&o.missingCells.includes(c3)
          ).map(o=>({
            lineId:o.lineId,
            lineLabel:o.lineLabel,
            missingCount:o.missingCount,
            support:o.events.map(e=>e.supportDistance),
          })):[];

        record.normalization={
          kind:closure.kind,
          exact:closure.exact??false,
          player:closure.player??null,
          steps:(closure.steps??[]).map(s=>({
            rankBefore:s.rankBefore,
            player:s.player,
            cell:label(s.cell),
            terminal:s.terminal??null,
          })),
          boundary:{
            kind:closure.boundary?.kind??null,
            winningCells:(closure.boundary?.winningCells??[]).map(label),
            threatCells:(closure.boundary?.threatCells??
              closure.boundary?.opponentThreatCells??[]).map(label),
          },
          finalRank:q?.rank??null,
          finalMover:q?.mover??null,
          exactNodeReentry:Boolean(match),
          matchedNode:match?{
            rank:match.rank,
            gap:match.gap,
            descriptor:match.descriptor,
          }:null,
          c2Residual:qC2?{
            lineId:qC2.lineId,
            supportDistance:qC2.events[0]?.supportDistance??null,
          }:null,
          p0C3Residuals:p0C3,
          finalFirstWin:qfirst?{
            kind:qfirst.kind,
            exact:qfirst.exact??false,
            player:qfirst.player??null,
            seam:qfirst.seam??null,
          }:null,
          finalProgress:progressSummary(qprogress),
        };
      }

      rows.push(record);
    }
  }

  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    uncoveredRowCount:rows.length,
    immediateKinds:countBy(rows,x=>x.immediate.kind),
    directP0FirstWinCount:rows.filter(x=>
      x.directFirstWin.kind==='CERTIFIED_FIRST_WIN'&&
      x.directFirstWin.player===0
    ).length,
    forcedResponseRowCount:rows.filter(x=>
      x.immediate.kind==='FORCED_RESPONSE'
    ).length,
    forcedNormalizationKindHistogram:countBy(
      rows.filter(x=>x.normalization),
      x=>x.normalization.kind
    ),
    forcedNormalizationP0FirstWinCount:rows.filter(x=>
      x.normalization&&(
        (x.normalization.kind==='CERTIFIED_FIRST_WIN'&&
         x.normalization.player===0)||
        (x.normalization.kind==='TERMINAL'&&
         x.normalization.steps.at(-1)?.terminal?.player===0)
      )
    ).length,
    forcedNormalizationOpenCount:rows.filter(x=>
      x.normalization?.kind==='OPEN'
    ).length,
    exactKnownNodeReentryCount:rows.filter(x=>
      x.normalization?.exactNodeReentry
    ).length,
    finalProgressKinds:countBy(
      rows.filter(x=>x.normalization?.finalProgress),
      x=>x.normalization.finalProgress.kind
    ),
    rows,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-forced-normalization-seam-diagnostic.v0_1',
  root:'44444',
  reports,
  summary:{
    totalUncoveredRows:reports.reduce((n,x)=>n+x.uncoveredRowCount,0),
    immediateKinds:countBy(reports.flatMap(x=>x.rows),x=>x.immediate.kind),
    totalForcedResponseRows:
      reports.reduce((n,x)=>n+x.forcedResponseRowCount,0),
    totalForcedNormalizationP0FirstWins:
      reports.reduce((n,x)=>n+x.forcedNormalizationP0FirstWinCount,0),
    totalForcedNormalizationOpen:
      reports.reduce((n,x)=>n+x.forcedNormalizationOpenCount,0),
    totalExactKnownNodeReentries:
      reports.reduce((n,x)=>n+x.exactKnownNodeReentryCount,0),
  },
  boundary:{
    diagnosticOnly:true,
    currentP1EventOnly:true,
    deterministicForcedNormalizationOnly:true,
    noFreeP0EnumerationAfterRetention:true,
    noSecondFreeP1Frontier:true,
    noRecursiveLegalMoveTraversal:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
  },
},null,2));

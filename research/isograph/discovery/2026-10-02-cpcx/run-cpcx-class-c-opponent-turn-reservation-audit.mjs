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
  certifyCpcxSupportReleaseOpponentTurnReservation,
} from './cpcx-support-release-opponent-turn-reservation.mjs';

const endpointScript=new URL(
  './run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);
const endpoint=JSON.parse(execFileSync(process.execPath,[endpointScript.pathname],{
  encoding:'utf8',
  maxBuffer:1024*1024*1024,
}));

const g=createCpcxGeometry(),c3=2*g.columns+2;

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function cellByLabel(s){
  return (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65);
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
    position.mover,targetCell,
    Array.from(position.heights).join(','),
    Array.from(position.owner).join(','),
  ].join('|');
}
function countBy(rows,fn){
  const out={};
  for(const row of rows){
    const k=fn(row)??'NULL';
    out[k]=(out[k]??0)+1;
  }
  return out;
}
function reservations(position){
  if(position.terminal||position.mover!==1)return [];
  const out=[];
  for(const residual of scanCpcxObligations(position)){
    if(
      residual.player!==1||
      residual.missingCount!==1||
      residual.events[0]?.supportDistance!==1
    )continue;
    const cert=certifyCpcxSupportReleaseOpponentTurnReservation(position,{
      ownerResidual:residual,
    });
    if(!cert.exact||
       cert.kind!=='SUPPORT_RELEASE_OPPONENT_TURN_RESERVATION')continue;
    out.push({
      residualId:residual.id,
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      targetCell:cert.residual.targetCell,
      targetLabel:label(cert.residual.targetCell),
      triggerCell:cert.responseEdge.triggerCell,
      triggerLabel:label(cert.responseEdge.triggerCell),
      responseCell:cert.responseEdge.responseCell,
      responseLabel:label(cert.responseEdge.responseCell),
    });
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
    nodeRows=[];

  for(const node of nodes){
    const position=positionFromKey(node.key),
      tokens=reservations(position);
    if(tokens.length)nodeRows.push({
      key:node.key,
      rank:node.rank,
      support:node.support,
      gap:node.gap,
      tokens,
    });
  }

  const minRank=Math.min(...nodes.map(n=>n.rank)),
    roots=nodes.filter(n=>n.rank===minRank);
  if(roots.length!==1)throw new Error('expected one minimum-rank root');
  const root=roots[0],rootPosition=positionFromKey(root.key),
    b3=cellByLabel('B3'),
    afterB3=applyCpcxForcedEvent(rootPosition,b3),
    immediate=afterB3.terminal?null:classifyCpcxImmediate(afterB3),
    closed=afterB3.terminal?null:closeCpcxForcedResponses(afterB3),
    q=closed?.kind==='OPEN'?closed.position:null,
    qKey=q?stateKey(q,c3):null,
    rootTokens=q?reservations(q):[];

  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    fixedNodeCount:nodes.length,
    nodesWithReservationCount:nodeRows.length,
    exactReservationCount:nodeRows.reduce((n,x)=>n+x.tokens.length,0),
    triggerHistogram:countBy(
      nodeRows.flatMap(x=>x.tokens),x=>x.triggerLabel
    ),
    responseHistogram:countBy(
      nodeRows.flatMap(x=>x.tokens),x=>x.responseLabel
    ),
    targetHistogram:countBy(
      nodeRows.flatMap(x=>x.tokens),x=>x.targetLabel
    ),
    residualHistogram:countBy(
      nodeRows.flatMap(x=>x.tokens),x=>x.lineLabel
    ),
    rankHistogram:countBy(
      nodeRows.flatMap(x=>x.tokens.map(t=>({...t,rank:x.rank}))),
      x=>x.rank
    ),
    rootB3:{
      rootKey:root.key,
      rootRank:root.rank,
      afterB3Terminal:afterB3.terminal,
      immediateKind:immediate?.kind??null,
      immediateCell:Number.isInteger(immediate?.cell)
        ?label(immediate.cell):null,
      closureKind:closed?.kind??null,
      closurePlayer:closed?.player??null,
      closureSteps:closed?.steps?.map(x=>({
        player:x.player??null,
        cell:Number.isInteger(x.cell)?label(x.cell):null,
      }))??[],
      normalizedKey:qKey,
      normalizedRank:q?.rank??null,
      normalizedSupport:q?Array.from(q.heights):null,
      exactFixedNodeReentry:Boolean(qKey&&nodeByKey.has(qKey)),
      tokens:rootTokens,
    },
    nodeRows,
  });
}

const allTokens=reports.flatMap(r=>r.nodeRows.flatMap(x=>x.tokens));
console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-opponent-turn-reservation-audit.v0_1',
  root:'44444',
  qualifiedTheoremRun:37171910003,
  reports,
  summary:{
    totalFixedNodeCount:reports.reduce((n,x)=>n+x.fixedNodeCount,0),
    nodesWithReservationCount:
      reports.reduce((n,x)=>n+x.nodesWithReservationCount,0),
    exactReservationCount:allTokens.length,
    triggerHistogram:countBy(allTokens,x=>x.triggerLabel),
    responseHistogram:countBy(allTokens,x=>x.responseLabel),
    targetHistogram:countBy(allTokens,x=>x.targetLabel),
    bothRootB3NormalizeToFixedNode:reports.every(x=>
      x.rootB3.exactFixedNodeReentry
    ),
    rootsWithPostNormalizationReservation:reports.filter(x=>
      x.rootB3.tokens.length>0
    ).map(x=>x.actionCell),
  },
  boundary:{
    fixedPhysicalCohort:true,
    currentStateTheoremOnly:true,
    rootB3OneCurrentEventOnly:true,
    deterministicForcedNormalizationOnly:true,
    noP0ChoiceEnumeration:true,
    noNewPhysicalCohort:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
    recursiveSearch:false,
  },
},null,2));

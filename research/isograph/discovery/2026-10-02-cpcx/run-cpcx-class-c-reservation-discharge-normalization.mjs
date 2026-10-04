import {execFileSync} from 'node:child_process';
import {
  createCpcxGeometry,
  scanCpcxObligations,
  cpcxCell,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
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
  c3=2*g.columns+2;

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
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
  return {
    kind:p?.kind??null,
    exact:p?.exact??false,
    player:p?.player??null,
    source:p?.source??null,
    seam:p?.seam??null,
    macroKind:p?.macro?.kind??null,
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
    tokenMap=new Map();

  for(const node of nodes){
    const parent=positionFromKey(node.key);
    for(const trigger of node.unresolvedTriggers??[]){
      if(trigger.defenderTerminal||!Number.isInteger(trigger.defenderCell))
        continue;
      const afterP1=applyCpcxForcedEvent(parent,trigger.defenderCell);
      if(afterP1.terminal)continue;
      const residual=c2Singleton(afterP1);
      if(!residual||residual.events[0]?.supportDistance!==1)continue;

      for(const option of trigger.options??[]){
        if(!Number.isInteger(option.responseCell)||!option.childKey)continue;
        const cert=certifyCpcxSupportReleaseResponseNeutralization(afterP1,{
          opponentResidual:residual,
          defenderActionCell:option.responseCell,
        });
        if(!cert.exact||cert.kind!=='SUPPORT_RELEASE_RESPONSE_EDGE')continue;

        const afterP0=applyCpcxForcedEvent(afterP1,option.responseCell),
          actualChildKey=stateKey(afterP0,c3);
        if(actualChildKey!==option.childKey)
          throw new Error('reservation edge child key mismatch');

        const tokenKey=[
          option.childKey,
          cert.responseEdge.triggerCell,
          cert.responseEdge.responseCell,
        ].join('|');

        if(!tokenMap.has(tokenKey))tokenMap.set(tokenKey,{
          childKey:option.childKey,
          triggerCell:cert.responseEdge.triggerCell,
          responseCell:cert.responseEdge.responseCell,
          residualLineId:cert.residual.lineId,
          residualLineLabel:residual.lineLabel,
          predecessorCount:0,
          predecessors:[],
        });
        const token=tokenMap.get(tokenKey);
        token.predecessorCount++;
        if(token.predecessors.length<12)token.predecessors.push({
          parentKey:node.key,
          parentRank:node.rank,
          p1EventLabel:trigger.defenderLabel,
          p0ActionLabel:option.responseLabel,
        });
      }
    }
  }

  const rows=[];
  for(const token of tokenMap.values()){
    const child=positionFromKey(token.childKey);
    if(child.mover!==1)throw new Error('reservation child must be P1 to move');

    const afterSupply=applyCpcxForcedEvent(child,token.triggerCell);
    if(afterSupply.terminal)throw new Error('qualified reservation supply terminal');
    const afterResponse=applyCpcxForcedEvent(afterSupply,token.responseCell);
    if(afterResponse.terminal)
      throw new Error('qualified reservation response terminal');

    const closed=closeCpcxForcedResponses(afterResponse),
      q=closed.position,
      qkey=q&&!q.terminal?stateKey(q,c3):null,
      match=qkey?nodeByKey.get(qkey)??null:null,
      progress=q&&!q.terminal?classifyCpcxProgress(q,{player:0}):null,
      first=q&&!q.terminal
        ?runCpcxFirstWinCertificate(q,{attacker:0})
        :null;

    rows.push({
      childKey:token.childKey,
      childRank:child.rank,
      childSupport:Array.from(child.heights),
      predecessorCount:token.predecessorCount,
      predecessors:token.predecessors,
      token:{
        triggerCell:token.triggerCell,
        triggerLabel:label(token.triggerCell),
        responseCell:token.responseCell,
        responseLabel:label(token.responseCell),
        residualLineId:token.residualLineId,
        residualLineLabel:token.residualLineLabel,
      },
      discharge:{
        supplyRank:afterSupply.rank,
        responseRank:afterResponse.rank,
        responseSupport:Array.from(afterResponse.heights),
      },
      normalization:{
        kind:closed.kind,
        player:closed.player??null,
        stepCount:closed.steps?.length??0,
        steps:(closed.steps??[]).map(s=>({
          rankBefore:s.rankBefore,
          player:s.player,
          cell:label(s.cell),
          terminal:s.terminal??null,
        })),
        boundaryKind:closed.boundary?.kind??null,
        boundaryWinningCells:(closed.boundary?.winningCells??[]).map(label),
        boundaryThreatCells:(closed.boundary?.threatCells??
          closed.boundary?.opponentThreatCells??[]).map(label),
      },
      final:{
        rank:q?.rank??null,
        mover:q?.mover??null,
        support:q?Array.from(q.heights):null,
        terminal:q?.terminal??null,
        exactKnownNodeReentry:Boolean(match),
        matchedNode:match?{
          rank:match.rank,
          gap:match.gap,
          descriptor:match.descriptor,
        }:null,
        progress:progressSummary(progress),
        firstWin:first?{
          kind:first.kind,
          exact:first.exact??false,
          player:first.player??null,
          seam:first.seam??null,
          traceLength:first.trace?.length??0,
        }:null,
      },
    });
  }

  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    uniqueReservationStateCount:rows.length,
    predecessorEdgeCount:rows.reduce((n,x)=>n+x.predecessorCount,0),
    normalizationKinds:countBy(rows,x=>x.normalization.kind),
    normalizationStepCounts:countBy(rows,x=>x.normalization.stepCount),
    boundaryKinds:countBy(rows,x=>x.normalization.boundaryKind),
    finalProgressKinds:countBy(rows,x=>x.final.progress?.kind),
    finalFirstWinKinds:countBy(rows,x=>x.final.firstWin?.kind),
    p0FirstWinCount:rows.filter(x=>
      (x.normalization.kind==='CERTIFIED_FIRST_WIN'&&
       x.normalization.player===0)||
      (x.final.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&
       x.final.firstWin?.player===0)
    ).length,
    p1FirstWinCount:rows.filter(x=>
      (x.normalization.kind==='CERTIFIED_FIRST_WIN'&&
       x.normalization.player===1)||
      (x.final.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&
       x.final.firstWin?.player===1)
    ).length,
    exactKnownNodeReentryCount:rows.filter(x=>
      x.final.exactKnownNodeReentry
    ).length,
    rows,
  });
}

const all=reports.flatMap(x=>x.rows);
console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-reservation-discharge-normalization.v0_1',
  root:'44444',
  reports,
  summary:{
    uniqueReservationStateCount:all.length,
    predecessorEdgeCount:reports.reduce((n,x)=>n+x.predecessorEdgeCount,0),
    normalizationKinds:countBy(all,x=>x.normalization.kind),
    normalizationStepCounts:countBy(all,x=>x.normalization.stepCount),
    boundaryKinds:countBy(all,x=>x.normalization.boundaryKind),
    finalProgressKinds:countBy(all,x=>x.final.progress?.kind),
    finalFirstWinKinds:countBy(all,x=>x.final.firstWin?.kind),
    p0FirstWinCount:reports.reduce((n,x)=>n+x.p0FirstWinCount,0),
    p1FirstWinCount:reports.reduce((n,x)=>n+x.p1FirstWinCount,0),
    exactKnownNodeReentryCount:
      reports.reduce((n,x)=>n+x.exactKnownNodeReentryCount,0),
  },
  boundary:{
    theoremCertifiedTokensOnly:true,
    deterministicForcedNormalizationOnly:true,
    noAlternativeResponseEnumeration:true,
    noRecursiveLegalMoveTraversal:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
  },
},null,2));

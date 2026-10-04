import {execFileSync} from 'node:child_process';
import {
  createCpcxGeometry,
  scanCpcxObligations,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
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

const g=createCpcxGeometry();
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
const c2=1*g.columns+2,c1=2;
function c2Singleton(position){
  return scanCpcxObligations(position).find(o=>
    o.player===1&&
    o.missingCount===1&&
    o.missingCells[0]===c2
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
  for(const row of probe.secondLayerRows??[]){
    const nt=row.noTransferTargetBlockProbe,
      audit=nt?.exactProgressFirst?.postSuccessorActionAudit;
    if(!Array.isArray(audit))continue;
    for(const action of audit){
      if(!['D6','G4'].includes(action.actionCell))continue;
      for(const target of action.targetRcics??[]){
        if(target.targetCell!=='C3')continue;
        const cap=target.gapCapacity;
        if(cap?.rootGap!==2)continue;
        if(JSON.stringify(probe.sourceMeasure)!==JSON.stringify([3,9,27]))
          continue;
        candidates.push({
          source:{
            firstLayerEventCell:probe.firstLayerEventCell??null,
            secondLayerEventCell:row.eventCell??null,
            blockedCell:nt.blockedCell??null,
            sourceMeasure:probe.sourceMeasure??null,
            endpointMeasure:probe.endpointMeasure??null,
          },
          actionCell:action.actionCell,
          targetCell:target.targetCell,
          gapCapacity:cap,
        });
      }
    }
  }
}

const reports=[];
for(const candidate of candidates){
  const nodes=(candidate.gapCapacity.unresolvedNodes??[])
      .filter(n=>n.key),
    nodeByKey=new Map(nodes.map(n=>[n.key,n])),
    incomingReservations=new Map(),
    reservationEdgeRows=[];

  // Audit every already-generated RCIC transition for a theorem-backed
  // reservation token. No new response action is introduced here.
  for(const node of nodes){
    const parent=positionFromKey(node.key);
    for(const trigger of node.unresolvedTriggers??[]){
      if(trigger.defenderTerminal)continue;
      const p1Cell=trigger.defenderCell,
        afterP1=applyCpcxForcedEvent(parent,p1Cell);
      if(afterP1.terminal)continue;
      const residual=c2Singleton(afterP1);
      if(!residual||residual.events[0]?.supportDistance!==1)continue;

      for(const option of trigger.options??[]){
        if(!Number.isInteger(option.responseCell))continue;
        const cert=certifyCpcxSupportReleaseResponseNeutralization(afterP1,{
          opponentResidual:residual,
          defenderActionCell:option.responseCell,
        });
        const edge={
          parentKey:node.key,
          parentRank:node.rank,
          p1EventCell:p1Cell,
          p1EventLabel:trigger.defenderLabel,
          p0ResponseCell:option.responseCell,
          p0ResponseLabel:option.responseLabel,
          childKey:option.childKey??null,
          childGap:option.childGap??null,
          exact:cert.exact??false,
          kind:cert.kind,
          seam:cert.seam??null,
          reservation:cert.exact?{
            triggerCell:label(cert.responseEdge.triggerCell),
            responseCell:label(cert.responseEdge.responseCell),
            residualLineId:cert.residual.lineId,
            residualLineLabel:residual.lineLabel,
          }:null,
        };
        reservationEdgeRows.push(edge);
        if(edge.exact&&edge.childKey){
          if(!incomingReservations.has(edge.childKey))
            incomingReservations.set(edge.childKey,[]);
          incomingReservations.get(edge.childKey).push(edge);
        }
      }
    }
  }

  const gap1Rows=[];
  for(const node of nodes.filter(n=>n.gap===1)){
    const position=positionFromKey(node.key),
      residual=c2Singleton(position);
    if(!residual||residual.events[0]?.supportDistance!==1)continue;

    const eventRows=[];
    for(const p1Cell of frontier(position)){
      const afterP1=applyCpcxForcedEvent(position,p1Cell);
      if(afterP1.terminal){
        eventRows.push({
          p1EventCell:p1Cell,
          p1EventLabel:label(p1Cell),
          class:p1Cell===c1?'CURRENT_SUPPLY_TERMINAL':'P1_TERMINAL',
          terminal:afterP1.terminal,
          qualifiedActions:[],
          negativeSeams:{},
        });
        continue;
      }

      if(p1Cell===c1){
        eventRows.push({
          p1EventCell:p1Cell,
          p1EventLabel:label(p1Cell),
          class:'CURRENT_SUPPLY',
          terminal:null,
          immediateReservationAvailable:
            (incomingReservations.get(node.key)??[]).length>0,
          incomingReservations:incomingReservations.get(node.key)??[],
          qualifiedActions:[],
          negativeSeams:{},
        });
        continue;
      }

      const childResidual=c2Singleton(afterP1);
      if(!childResidual||childResidual.events[0]?.supportDistance!==1){
        eventRows.push({
          p1EventCell:p1Cell,
          p1EventLabel:label(p1Cell),
          class:'C2_RESIDUAL_CHANGED',
          terminal:null,
          qualifiedActions:[],
          negativeSeams:{},
          childResidual:childResidual?{
            lineId:childResidual.lineId,
            supportDistance:childResidual.events[0]?.supportDistance??null,
          }:null,
        });
        continue;
      }

      const actions=[],negative=[];
      for(const p0Cell of frontier(afterP1)){
        const cert=certifyCpcxSupportReleaseResponseNeutralization(afterP1,{
          opponentResidual:childResidual,
          defenderActionCell:p0Cell,
        });
        if(cert.exact&&cert.kind==='SUPPORT_RELEASE_RESPONSE_EDGE'){
          actions.push({
            actionCell:p0Cell,
            actionLabel:label(p0Cell),
            triggerLabel:label(cert.responseEdge.triggerCell),
            responseLabel:label(cert.responseEdge.responseCell),
            lineId:cert.residual.lineId,
            lineLabel:childResidual.lineLabel,
          });
        }else{
          negative.push({
            actionCell:p0Cell,
            actionLabel:label(p0Cell),
            seam:cert.seam??cert.kind,
          });
        }
      }
      eventRows.push({
        p1EventCell:p1Cell,
        p1EventLabel:label(p1Cell),
        class:'NONTERMINAL_NON_SUPPLY',
        terminal:null,
        qualifiedActions:actions,
        negativeSeams:countBy(negative,x=>x.seam),
      });
    }

    gap1Rows.push({
      key:node.key,
      rank:node.rank,
      support:node.support,
      descriptor:node.descriptor,
      c2Residual:{
        lineId:residual.lineId,
        lineLabel:residual.lineLabel,
        supportDistance:residual.events[0].supportDistance,
      },
      incomingReservationCount:(incomingReservations.get(node.key)??[]).length,
      eventRows,
    });
  }

  const allEvents=gap1Rows.flatMap(x=>x.eventRows),
    nonterminalNonSupply=allEvents.filter(x=>
      x.class==='NONTERMINAL_NON_SUPPLY'
    ),
    supplyRows=allEvents.filter(x=>
      x.class==='CURRENT_SUPPLY'||x.class==='CURRENT_SUPPLY_TERMINAL'
    );

  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    targetCell:candidate.targetCell,
    gap1C2DepthOneStateCount:gap1Rows.length,
    currentP1EventCount:allEvents.length,
    p1TerminalEventCount:allEvents.filter(x=>
      x.class==='P1_TERMINAL'||x.class==='CURRENT_SUPPLY_TERMINAL'
    ).length,
    currentSupplyCount:supplyRows.length,
    currentSupplyWithIncomingReservationCount:supplyRows.filter(x=>
      x.immediateReservationAvailable===true
    ).length,
    nonterminalNonSupplyCount:nonterminalNonSupply.length,
    nonterminalNonSupplyCoveredCount:nonterminalNonSupply.filter(x=>
      x.qualifiedActions.length>0
    ).length,
    allNonterminalNonSupplyCovered:
      nonterminalNonSupply.every(x=>x.qualifiedActions.length>0),
    qualifiedActionHistogram:countBy(
      nonterminalNonSupply.flatMap(x=>x.qualifiedActions),
      x=>x.actionLabel
    ),
    reservationEdgeAudit:{
      testedEdgeCount:reservationEdgeRows.length,
      exactReservationEdgeCount:reservationEdgeRows.filter(x=>x.exact).length,
      negativeSeams:countBy(
        reservationEdgeRows.filter(x=>!x.exact),x=>x.seam
      ),
    },
    gap1Rows,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-support-release-reservation-diagnostic.v0_1',
  root:'44444',
  candidateCount:reports.length,
  reports,
  summary:{
    allCandidatesCoverEveryNonterminalNonSupplyRow:
      reports.every(x=>x.allNonterminalNonSupplyCovered),
    totalGap1C2DepthOneStates:
      reports.reduce((n,x)=>n+x.gap1C2DepthOneStateCount,0),
    totalCurrentSupplyRows:
      reports.reduce((n,x)=>n+x.currentSupplyCount,0),
    totalCurrentSupplyRowsWithIncomingReservation:
      reports.reduce((n,x)=>n+x.currentSupplyWithIncomingReservationCount,0),
    totalReservationEdges:
      reports.reduce((n,x)=>n+x.reservationEdgeAudit.exactReservationEdgeCount,0),
  },
  boundary:{
    diagnosticOnly:true,
    supportReleaseTheoremUnchanged:true,
    reservoirRcicUnchanged:true,
    currentP1FrontierOnly:true,
    currentP0ExistentialFrontierOnly:true,
    noRecursiveFreeMoveTraversal:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
  },
},null,2));

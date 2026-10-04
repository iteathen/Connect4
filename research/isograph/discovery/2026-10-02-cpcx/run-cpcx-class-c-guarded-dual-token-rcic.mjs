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

const g=createCpcxGeometry(),c3=2*g.columns+2;

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
function depthOneP1Singletons(position){
  return scanCpcxObligations(position).filter(o=>
    o.player===1&&o.missingCount===1&&o.events[0]?.supportDistance===1
  );
}
function depthOneP0Targets(position){
  const out=[],seen=new Set();
  for(const residual of scanCpcxObligations(position).filter(o=>o.player===0)){
    for(const event of residual.events){
      if(event.supportDistance!==1)continue;
      const k=`${residual.lineId}|${event.cell}`;
      if(seen.has(k))continue;
      seen.add(k);
      out.push({residual,targetCell:event.cell});
    }
  }
  return out;
}
function countBy(rows,fn){
  const out={};
  for(const row of rows){
    const k=fn(row)??'NULL';
    out[k]=(out[k]??0)+1;
  }
  return out;
}
function progressFirstWin(position){
  if(position.terminal)return position.terminal.player===0?{
    exact:true,source:'POSITION_TERMINAL',certificate:position.terminal,
  }:null;
  const first=runCpcxFirstWinCertificate(position,{attacker:0});
  return first.kind==='CERTIFIED_FIRST_WIN'&&first.player===0?{
    exact:true,source:'EXISTING_FIRST_WIN',certificate:first,
  }:null;
}
function edgeId(parentKey,defenderCell,responseCell,childKey){
  return [parentKey,defenderCell,responseCell,childKey].join('|');
}
function parentTriggerId(parentKey,defenderCell){
  return [parentKey,defenderCell].join('|');
}
function rTokenId(childKey,cert){
  return [
    'R',childKey,
    cert.responseEdge.triggerCell,
    cert.responseEdge.responseCell,
    cert.residual.lineId,
  ].join('|');
}
function aTokenId(childKey,cert){
  return [
    'A',childKey,
    cert.sharedEdge.triggerCell,
    cert.sharedEdge.responseCell,
    cert.protectedResidual.lineId,
  ].join('|');
}
function routePriority(route){
  const order={
    BASE_FIRST_WIN:0,
    DIRECT_P0_FIRST_WIN:1,
    FORCED_NORMALIZATION_P0_FIRST_WIN:2,
    RESPONSE_RESERVATION_DISCHARGE_P0_FIRST_WIN:3,
    SHARED_DISCHARGE_P0_FIRST_WIN:4,
    EXISTING_RCIC_CHILD:5,
    FORCED_NORMALIZATION_REENTRY:6,
    RESPONSE_RESERVATION_DISCHARGE_REENTRY:7,
    SHARED_DISCHARGE_REENTRY:8,
    RESPONSE_RESERVATION_CHILD:9,
    SHARED_ACQUISITION_CHILD:10,
  };
  return order[route.kind]??99;
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
    rTokenById=new Map(),
    rTokenIdsByChild=new Map(),
    rTokenIdsByEdge=new Map(),
    aTokenById=new Map(),
    aTokenIdsByChild=new Map(),
    aTokenIdsByParentTrigger=new Map();

  // R tokens: unchanged qualified response-reservation theorem on existing
  // RCIC response edges.
  for(const node of nodes){
    const parent=positionFromKey(node.key);
    for(const trigger of node.unresolvedTriggers??[]){
      if(trigger.defenderTerminal||!Number.isInteger(trigger.defenderCell))
        continue;
      const afterP1=applyCpcxForcedEvent(parent,trigger.defenderCell);
      if(afterP1.terminal)continue;

      const residuals=depthOneP1Singletons(afterP1);
      if(!residuals.length)continue;

      for(const option of trigger.options??[]){
        if(
          option.result!=='LOWER_COVERAGE_GAP'||
          !Number.isInteger(option.responseCell)||
          !option.childKey||
          !nodeByKey.has(option.childKey)
        )continue;

        const afterP0=applyCpcxForcedEvent(afterP1,option.responseCell),
          actualChildKey=stateKey(afterP0,c3);
        if(actualChildKey!==option.childKey)
          throw new Error('existing RCIC child key mismatch');

        for(const residual of residuals){
          const cert=certifyCpcxSupportReleaseResponseNeutralization(afterP1,{
            opponentResidual:residual,
            defenderActionCell:option.responseCell,
          });
          if(!cert.exact||cert.kind!=='SUPPORT_RELEASE_RESPONSE_EDGE')continue;

          const id=rTokenId(option.childKey,cert),
            eId=edgeId(
              node.key,trigger.defenderCell,option.responseCell,option.childKey
            );
          if(!rTokenById.has(id))rTokenById.set(id,{
            id,type:'R',
            childKey:option.childKey,
            triggerCell:cert.responseEdge.triggerCell,
            responseCell:cert.responseEdge.responseCell,
            residualLineId:cert.residual.lineId,
            residualLineLabel:residual.lineLabel,
            predecessorCount:0,predecessors:[],
          });
          const token=rTokenById.get(id);
          token.predecessorCount++;
          if(token.predecessors.length<10)token.predecessors.push({
            parentKey:node.key,parentRank:node.rank,
            p1EventLabel:trigger.defenderLabel,
            p0ResponseLabel:option.responseLabel,
          });
          if(!rTokenIdsByChild.has(option.childKey))
            rTokenIdsByChild.set(option.childKey,new Set());
          rTokenIdsByChild.get(option.childKey).add(id);
          if(!rTokenIdsByEdge.has(eId))rTokenIdsByEdge.set(eId,new Set());
          rTokenIdsByEdge.get(eId).add(id);
        }
      }
    }
  }

  // A tokens: qualified shared acquisition/block theorem on the exact P0
  // controller state after one unresolved current P1 trigger.  Only token-entry
  // physical states already in the frozen cohort are admitted.
  for(const node of nodes){
    const parent=positionFromKey(node.key);
    for(const trigger of node.unresolvedTriggers??[]){
      if(trigger.defenderTerminal||!Number.isInteger(trigger.defenderCell))
        continue;
      const afterP1=applyCpcxForcedEvent(parent,trigger.defenderCell);
      if(afterP1.terminal||afterP1.mover!==0)continue;

      const pId=parentTriggerId(node.key,trigger.defenderCell);
      for(const target of depthOneP0Targets(afterP1)){
        for(const actionCell of frontier(afterP1)){
          const cert=certifyCpcxSupportReleaseSharedAcquisitionBlock(afterP1,{
            controllerResidual:target.residual,
            targetCell:target.targetCell,
            controllerActionCell:actionCell,
          });
          if(
            !cert.exact||
            cert.kind!=='SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE'
          )continue;

          const afterPinned=applyCpcxForcedEvent(afterP1,actionCell);
          if(afterPinned.terminal||afterPinned.mover!==1)continue;
          const childKey=stateKey(afterPinned,c3);
          if(!nodeByKey.has(childKey))continue;

          const id=aTokenId(childKey,cert);
          if(!aTokenById.has(id))aTokenById.set(id,{
            id,type:'A',childKey,
            triggerCell:cert.sharedEdge.triggerCell,
            responseCell:cert.sharedEdge.responseCell,
            protectedLineId:cert.protectedResidual.lineId,
            protectedLineLabel:cert.protectedResidual.lineLabel,
            pinnedActionCell:actionCell,
            pinnedActionLabel:label(actionCell),
            targetCell:target.targetCell,
            targetLabel:label(target.targetCell),
            predecessorCount:0,predecessors:[],
          });
          const token=aTokenById.get(id);
          token.predecessorCount++;
          if(token.predecessors.length<10)token.predecessors.push({
            parentKey:node.key,parentRank:node.rank,
            p1EventLabel:trigger.defenderLabel,
            pinnedActionLabel:label(actionCell),
          });
          if(!aTokenIdsByChild.has(childKey))
            aTokenIdsByChild.set(childKey,new Set());
          aTokenIdsByChild.get(childKey).add(id);
          if(!aTokenIdsByParentTrigger.has(pId))
            aTokenIdsByParentTrigger.set(pId,new Set());
          aTokenIdsByParentTrigger.get(pId).add(id);
        }
      }
    }
  }

  const nStatus=new Map(),rStatus=new Map(),aStatus=new Map(),
    nWitness=new Map(),rWitness=new Map(),aWitness=new Map(),
    rDischargeCache=new Map(),aDischargeCache=new Map(),
    afterP1Cache=new Map();

  function afterP1For(node,trigger){
    const k=`${node.key}|${trigger.defenderCell}`;
    if(afterP1Cache.has(k))return afterP1Cache.get(k);
    const child=applyCpcxForcedEvent(
      positionFromKey(node.key),trigger.defenderCell
    );
    afterP1Cache.set(k,child);
    return child;
  }

  function forcedRoute(afterP1){
    if(afterP1.terminal)return null;
    const immediate=classifyCpcxImmediate(afterP1);
    if(immediate.kind!=='FORCED_RESPONSE')return null;
    const closed=closeCpcxForcedResponses(afterP1);
    if(closed.kind==='CERTIFIED_FIRST_WIN')return closed.player===0?{
      kind:'FORCED_NORMALIZATION_P0_FIRST_WIN',
      steps:closed.steps?.length??0,
    }:null;
    if(closed.kind!=='OPEN'||!closed.position||closed.position.mover!==1)
      return null;
    const key=stateKey(closed.position,c3);
    if(!nodeByKey.has(key)||nStatus.get(key)!==true)return null;
    return {
      kind:'FORCED_NORMALIZATION_REENTRY',
      childKey:key,steps:closed.steps?.length??0,
    };
  }

  function normalizeAfterPrescribedResponse(afterResponse,kindPrefix){
    if(afterResponse.terminal)return afterResponse.terminal.player===0?{
      kind:`${kindPrefix}_P0_FIRST_WIN`,
      source:'PRESCRIBED_RESPONSE_TERMINAL',steps:0,
    }:null;
    const closed=closeCpcxForcedResponses(afterResponse);
    if(closed.kind==='CERTIFIED_FIRST_WIN')return closed.player===0?{
      kind:`${kindPrefix}_P0_FIRST_WIN`,
      source:'FORCED_NORMALIZATION',steps:closed.steps?.length??0,
    }:null;
    if(closed.kind!=='OPEN'||!closed.position||closed.position.mover!==1)
      return null;
    const key=stateKey(closed.position,c3);
    if(!nodeByKey.has(key)||nStatus.get(key)!==true)return null;
    return {
      kind:`${kindPrefix}_REENTRY`,
      childKey:key,steps:closed.steps?.length??0,
    };
  }

  function rDischargeRoute(token){
    if(rDischargeCache.has(token.id))return rDischargeCache.get(token.id);
    const child=positionFromKey(token.childKey);
    if(child.mover!==1){rDischargeCache.set(token.id,null);return null;}
    const afterSupply=applyCpcxForcedEvent(child,token.triggerCell);
    if(afterSupply.terminal){rDischargeCache.set(token.id,null);return null;}
    const afterResponse=applyCpcxForcedEvent(afterSupply,token.responseCell),
      route=normalizeAfterPrescribedResponse(
        afterResponse,'RESPONSE_RESERVATION_DISCHARGE'
      );
    rDischargeCache.set(token.id,route);
    return route;
  }

  function aDischargeRoute(token){
    if(aDischargeCache.has(token.id))return aDischargeCache.get(token.id);
    const child=positionFromKey(token.childKey);
    if(child.mover!==1){aDischargeCache.set(token.id,null);return null;}
    const afterSupply=applyCpcxForcedEvent(child,token.triggerCell);
    if(afterSupply.terminal){aDischargeCache.set(token.id,null);return null;}
    const afterResponse=applyCpcxForcedEvent(afterSupply,token.responseCell),
      route=normalizeAfterPrescribedResponse(
        afterResponse,'SHARED_DISCHARGE'
      );
    aDischargeCache.set(token.id,route);
    return route;
  }

  function ordinaryRoutes(node,trigger,afterP1){
    const routes=[];

    const first=progressFirstWin(afterP1);
    if(first)routes.push({
      kind:'DIRECT_P0_FIRST_WIN',source:first.source,
    });

    const forced=forcedRoute(afterP1);
    if(forced)routes.push(forced);

    for(const option of trigger.options??[]){
      if(option.result==='BASE_FIRST_WIN'){
        routes.push({
          kind:'BASE_FIRST_WIN',
          responseLabel:option.responseLabel??null,
          baseClass:option.baseClass??null,
        });
        continue;
      }
      if(
        option.result!=='LOWER_COVERAGE_GAP'||
        !option.childKey||
        !nodeByKey.has(option.childKey)
      )continue;

      if(nStatus.get(option.childKey)===true)routes.push({
        kind:'EXISTING_RCIC_CHILD',
        responseLabel:option.responseLabel??null,
        childKey:option.childKey,
        childGap:option.childGap??null,
      });

      const eId=edgeId(
        node.key,trigger.defenderCell,option.responseCell,option.childKey
      );
      for(const id of rTokenIdsByEdge.get(eId)??[]){
        if(rStatus.get(id)===true)routes.push({
          kind:'RESPONSE_RESERVATION_CHILD',
          responseLabel:option.responseLabel??null,
          childKey:option.childKey,
          tokenId:id,
          token:{
            triggerLabel:label(rTokenById.get(id).triggerCell),
            responseLabel:label(rTokenById.get(id).responseCell),
          },
        });
      }
    }

    const pId=parentTriggerId(node.key,trigger.defenderCell);
    for(const id of aTokenIdsByParentTrigger.get(pId)??[]){
      if(aStatus.get(id)!==true)continue;
      const token=aTokenById.get(id);
      routes.push({
        kind:'SHARED_ACQUISITION_CHILD',
        pinnedActionLabel:token.pinnedActionLabel,
        childKey:token.childKey,
        tokenId:id,
        token:{
          triggerLabel:label(token.triggerCell),
          responseLabel:label(token.responseCell),
          protectedLineLabel:token.protectedLineLabel,
          targetLabel:token.targetLabel,
        },
      });
    }

    routes.sort((a,b)=>
      routePriority(a)-routePriority(b)||
      String(a.responseLabel??a.pinnedActionLabel??'')
        .localeCompare(String(b.responseLabel??b.pinnedActionLabel??''))||
      String(a.childKey??'').localeCompare(String(b.childKey??''))
    );
    return routes;
  }

  function solvePhysical(node,token=null){
    const selections=[];
    for(const trigger of node.unresolvedTriggers??[]){
      if(trigger.defenderTerminal?.player===1)return {
        certified:false,
        failedTrigger:{
          defenderLabel:trigger.defenderLabel,
          reason:'P1_TERMINAL',terminal:trigger.defenderTerminal,
        },
        selections,
      };

      const afterP1=afterP1For(node,trigger);
      if(afterP1.terminal){
        if(afterP1.terminal.player===1)return {
          certified:false,
          failedTrigger:{
            defenderLabel:trigger.defenderLabel,
            reason:'P1_TERMINAL_RECOMPUTED',
            terminal:afterP1.terminal,
          },
          selections,
        };
        selections.push({
          defenderLabel:trigger.defenderLabel,
          route:{kind:'DIRECT_P0_FIRST_WIN',source:'POST_P1_TERMINAL'},
        });
        continue;
      }

      const routes=ordinaryRoutes(node,trigger,afterP1);
      if(token?.type==='R'&&trigger.defenderCell===token.triggerCell){
        const discharge=rDischargeRoute(token);
        if(discharge)routes.push({
          ...discharge,tokenId:token.id,
          reservedResponseLabel:label(token.responseCell),
        });
      }
      if(token?.type==='A'&&trigger.defenderCell===token.triggerCell){
        const discharge=aDischargeRoute(token);
        if(discharge)routes.push({
          ...discharge,tokenId:token.id,
          sharedResponseLabel:label(token.responseCell),
        });
      }

      routes.sort((a,b)=>
        routePriority(a)-routePriority(b)||
        String(
          a.responseLabel??a.pinnedActionLabel??
          a.reservedResponseLabel??a.sharedResponseLabel??''
        ).localeCompare(String(
          b.responseLabel??b.pinnedActionLabel??
          b.reservedResponseLabel??b.sharedResponseLabel??''
        ))
      );

      if(!routes.length)return {
        certified:false,
        failedTrigger:{
          defenderLabel:trigger.defenderLabel,
          reason:'NO_ADMITTED_CERTIFIED_ROUTE',
          immediate:classifyCpcxImmediate(afterP1).kind,
          optionCount:trigger.options?.length??0,
          tokenType:token?.type??null,
          tokenApplies:Boolean(
            token&&trigger.defenderCell===token.triggerCell
          ),
        },
        selections,
      };
      selections.push({
        defenderLabel:trigger.defenderLabel,
        route:routes[0],
        alternativeRouteCount:routes.length-1,
      });
    }
    return {certified:true,selections};
  }

  const ranks=[...new Set(nodes.map(n=>n.rank))].sort((a,b)=>b-a);
  for(const rank of ranks){
    const rankNodes=nodes.filter(n=>n.rank===rank)
      .sort((a,b)=>a.key.localeCompare(b.key));

    for(const node of rankNodes){
      for(const id of [...(rTokenIdsByChild.get(node.key)??[])].sort()){
        const token=rTokenById.get(id),
          solved=solvePhysical(node,token);
        rStatus.set(id,solved.certified);
        rWitness.set(id,solved);
      }
      for(const id of [...(aTokenIdsByChild.get(node.key)??[])].sort()){
        const token=aTokenById.get(id),
          solved=solvePhysical(node,token);
        aStatus.set(id,solved.certified);
        aWitness.set(id,solved);
      }
    }
    for(const node of rankNodes){
      const solved=solvePhysical(node,null);
      nStatus.set(node.key,solved.certified);
      nWitness.set(node.key,solved);
    }
  }

  const minRank=Math.min(...nodes.map(n=>n.rank)),
    roots=nodes.filter(n=>n.rank===minRank),
    root=roots.length===1?roots[0]:null;
  if(!root)throw new Error('expected exactly one minimum-rank Class-C root');

  const routeRows=[
      ...[...nWitness.values()].flatMap(x=>x.selections??[]),
      ...[...rWitness.values()].flatMap(x=>x.selections??[]),
      ...[...aWitness.values()].flatMap(x=>x.selections??[]),
    ].map(x=>x.route),
    failures=(map,tokenMap,type)=>[...map.entries()]
      .filter(([,x])=>!x.certified)
      .map(([id,x])=>{
        const key=type==='N'?id:tokenMap.get(id)?.childKey;
        return {
          proofState:type,
          id,
          key,
          rank:nodeByKey.get(key)?.rank??null,
          support:nodeByKey.get(key)?.support??null,
          ...x.failedTrigger,
        };
      }),
    nFailures=failures(nWitness,null,'N'),
    rFailures=failures(rWitness,rTokenById,'R'),
    aFailures=failures(aWitness,aTokenById,'A');

  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    physicalNodeCount:nodes.length,
    responseReservationStateCount:rTokenById.size,
    sharedAcquisitionStateCount:aTokenById.size,
    certifiedNStateCount:[...nStatus.values()].filter(Boolean).length,
    certifiedRStateCount:[...rStatus.values()].filter(Boolean).length,
    certifiedAStateCount:[...aStatus.values()].filter(Boolean).length,
    root:{
      key:root.key,rank:root.rank,support:root.support,
      descriptor:root.descriptor,
      certified:nStatus.get(root.key)===true,
      witness:nWitness.get(root.key),
    },
    certificationByRank:ranks.map(rank=>({
      rank,
      nCertified:nodes.filter(n=>
        n.rank===rank&&nStatus.get(n.key)===true
      ).length,
      nTotal:nodes.filter(n=>n.rank===rank).length,
      rCertified:[...rTokenById.values()].filter(t=>
        nodeByKey.get(t.childKey)?.rank===rank&&rStatus.get(t.id)===true
      ).length,
      rTotal:[...rTokenById.values()].filter(t=>
        nodeByKey.get(t.childKey)?.rank===rank
      ).length,
      aCertified:[...aTokenById.values()].filter(t=>
        nodeByKey.get(t.childKey)?.rank===rank&&aStatus.get(t.id)===true
      ).length,
      aTotal:[...aTokenById.values()].filter(t=>
        nodeByKey.get(t.childKey)?.rank===rank
      ).length,
    })),
    routeHistogram:countBy(routeRows,x=>x.kind),
    failureCensus:{
      nReasons:countBy(nFailures,x=>x.reason),
      nDefenderLabels:countBy(nFailures,x=>x.defenderLabel),
      nImmediateKinds:countBy(nFailures,x=>x.immediate),
      rReasons:countBy(rFailures,x=>x.reason),
      rDefenderLabels:countBy(rFailures,x=>x.defenderLabel),
      aReasons:countBy(aFailures,x=>x.reason),
      aDefenderLabels:countBy(aFailures,x=>x.defenderLabel),
      firstNFailures:nFailures.slice(0,20),
      firstRFailures:rFailures.slice(0,20),
      firstAFailures:aFailures.slice(0,20),
    },
    tokenProvenance:{
      responseReservations:{
        uniqueTokens:rTokenById.size,
        predecessorEdges:[...rTokenById.values()]
          .reduce((n,x)=>n+x.predecessorCount,0),
        triggerHistogram:countBy([...rTokenById.values()],x=>
          label(x.triggerCell)
        ),
        responseHistogram:countBy([...rTokenById.values()],x=>
          label(x.responseCell)
        ),
      },
      sharedAcquisition:{
        uniqueTokens:aTokenById.size,
        predecessorEdges:[...aTokenById.values()]
          .reduce((n,x)=>n+x.predecessorCount,0),
        triggerHistogram:countBy([...aTokenById.values()],x=>
          label(x.triggerCell)
        ),
        responseHistogram:countBy([...aTokenById.values()],x=>
          label(x.responseCell)
        ),
        pinnedActionHistogram:countBy([...aTokenById.values()],x=>
          x.pinnedActionLabel
        ),
        targetHistogram:countBy([...aTokenById.values()],x=>
          x.targetLabel
        ),
      },
    },
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-guarded-dual-token-rcic.v0_1',
  root:'44444',
  candidateCount:reports.length,
  reports,
  summary:{
    anyClassCRootCertified:reports.some(x=>x.root.certified),
    certifiedRootActions:reports.filter(x=>x.root.certified)
      .map(x=>x.actionCell),
    totalPhysicalNodes:reports.reduce((n,x)=>n+x.physicalNodeCount,0),
    totalResponseReservationStates:
      reports.reduce((n,x)=>n+x.responseReservationStateCount,0),
    totalSharedAcquisitionStates:
      reports.reduce((n,x)=>n+x.sharedAcquisitionStateCount,0),
    totalCertifiedNStates:
      reports.reduce((n,x)=>n+x.certifiedNStateCount,0),
    totalCertifiedRStates:
      reports.reduce((n,x)=>n+x.certifiedRStateCount,0),
    totalCertifiedAStates:
      reports.reduce((n,x)=>n+x.certifiedAStateCount,0),
  },
  boundary:{
    fixedPhysicalCohort:true,
    existingRcicResponsesPreserved:true,
    qualifiedResponseReservationTokensOnly:true,
    qualifiedSharedAcquisitionTokensOnly:true,
    sharedTokenEntryRequiresFixedPhysicalNode:true,
    deterministicForcedNormalizationOnly:true,
    currentP0FrontierUsedOnlyForQualifiedSharedTheorem:true,
    noOtherP0ResponseAdded:true,
    noNewPhysicalP1Nodes:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
    recursiveSearch:false,
  },
},null,2));

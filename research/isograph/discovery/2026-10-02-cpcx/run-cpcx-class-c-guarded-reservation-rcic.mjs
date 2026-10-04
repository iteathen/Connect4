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
function depthOneP1Singletons(position){
  return scanCpcxObligations(position).filter(o=>
    o.player===1&&
    o.missingCount===1&&
    o.events[0]?.supportDistance===1
  );
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
    exact:true,
    source:'POSITION_TERMINAL',
    certificate:position.terminal,
  }:null;
  const first=runCpcxFirstWinCertificate(position,{attacker:0});
  return first.kind==='CERTIFIED_FIRST_WIN'&&first.player===0?{
    exact:true,
    source:'EXISTING_FIRST_WIN',
    certificate:first,
  }:null;
}
function tokenId(childKey,cert){
  return [
    childKey,
    cert.responseEdge.triggerCell,
    cert.responseEdge.responseCell,
    cert.residual.lineId,
  ].join('|');
}
function edgeId(parentKey,defenderCell,responseCell,childKey){
  return [parentKey,defenderCell,responseCell,childKey].join('|');
}
function routePriority(route){
  const order={
    BASE_FIRST_WIN:0,
    DIRECT_P0_FIRST_WIN:1,
    FORCED_NORMALIZATION_P0_FIRST_WIN:2,
    RESERVATION_DISCHARGE_P0_FIRST_WIN:3,
    EXISTING_RCIC_CHILD:4,
    FORCED_NORMALIZATION_REENTRY:5,
    RESERVATION_DISCHARGE_REENTRY:6,
    RESERVATION_CHILD:7,
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
    tokenById=new Map(),
    tokenIdsByChild=new Map(),
    tokenIdsByEdge=new Map();

  // Freeze theorem-state creation on existing RCIC physical response edges.
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

          const id=tokenId(option.childKey,cert),
            eId=edgeId(
              node.key,trigger.defenderCell,option.responseCell,option.childKey
            );
          if(!tokenById.has(id))tokenById.set(id,{
            id,
            childKey:option.childKey,
            triggerCell:cert.responseEdge.triggerCell,
            responseCell:cert.responseEdge.responseCell,
            residualLineId:cert.residual.lineId,
            residualLineLabel:residual.lineLabel,
            predecessorCount:0,
            predecessors:[],
          });
          const token=tokenById.get(id);
          token.predecessorCount++;
          if(token.predecessors.length<10)token.predecessors.push({
            parentKey:node.key,
            parentRank:node.rank,
            p1EventLabel:trigger.defenderLabel,
            p0ResponseLabel:option.responseLabel,
          });
          if(!tokenIdsByChild.has(option.childKey))
            tokenIdsByChild.set(option.childKey,new Set());
          tokenIdsByChild.get(option.childKey).add(id);
          if(!tokenIdsByEdge.has(eId))tokenIdsByEdge.set(eId,new Set());
          tokenIdsByEdge.get(eId).add(id);
        }
      }
    }
  }

  const nStatus=new Map(),
    tStatus=new Map(),
    nWitness=new Map(),
    tWitness=new Map(),
    dischargeCache=new Map(),
    afterP1Cache=new Map();

  function afterP1For(node,trigger){
    const k=`${node.key}|${trigger.defenderCell}`;
    if(afterP1Cache.has(k))return afterP1Cache.get(k);
    const p=positionFromKey(node.key),
      child=applyCpcxForcedEvent(p,trigger.defenderCell);
    afterP1Cache.set(k,child);
    return child;
  }

  function forcedRoute(node,trigger,afterP1){
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
      childKey:key,
      steps:closed.steps?.length??0,
    };
  }

  function dischargeRoute(token){
    if(dischargeCache.has(token.id))return dischargeCache.get(token.id);
    const child=positionFromKey(token.childKey);
    if(child.mover!==1){
      dischargeCache.set(token.id,null);
      return null;
    }

    const afterSupply=applyCpcxForcedEvent(child,token.triggerCell);
    if(afterSupply.terminal){
      dischargeCache.set(token.id,null);
      return null;
    }
    const afterResponse=applyCpcxForcedEvent(
      afterSupply,token.responseCell
    );
    if(afterResponse.terminal){
      const route=afterResponse.terminal.player===0?{
        kind:'RESERVATION_DISCHARGE_P0_FIRST_WIN',
        source:'RESERVED_RESPONSE_TERMINAL',
        steps:0,
      }:null;
      dischargeCache.set(token.id,route);
      return route;
    }

    const closed=closeCpcxForcedResponses(afterResponse);
    if(closed.kind==='CERTIFIED_FIRST_WIN'){
      const route=closed.player===0?{
        kind:'RESERVATION_DISCHARGE_P0_FIRST_WIN',
        source:'FORCED_NORMALIZATION',
        steps:closed.steps?.length??0,
      }:null;
      dischargeCache.set(token.id,route);
      return route;
    }
    if(closed.kind!=='OPEN'||!closed.position||closed.position.mover!==1){
      dischargeCache.set(token.id,null);
      return null;
    }
    const key=stateKey(closed.position,c3);
    if(!nodeByKey.has(key)||nStatus.get(key)!==true){
      dischargeCache.set(token.id,null);
      return null;
    }
    const route={
      kind:'RESERVATION_DISCHARGE_REENTRY',
      childKey:key,
      steps:closed.steps?.length??0,
    };
    dischargeCache.set(token.id,route);
    return route;
  }

  function ordinaryRoutes(node,trigger,afterP1){
    const routes=[];

    const first=progressFirstWin(afterP1);
    if(first)routes.push({
      kind:'DIRECT_P0_FIRST_WIN',
      source:first.source,
    });

    const forced=forcedRoute(node,trigger,afterP1);
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
      for(const id of tokenIdsByEdge.get(eId)??[]){
        if(tStatus.get(id)===true)routes.push({
          kind:'RESERVATION_CHILD',
          responseLabel:option.responseLabel??null,
          childKey:option.childKey,
          tokenId:id,
          token:{
            triggerLabel:label(tokenById.get(id).triggerCell),
            responseLabel:label(tokenById.get(id).responseCell),
            residualLineLabel:tokenById.get(id).residualLineLabel,
          },
        });
      }
    }

    routes.sort((a,b)=>
      routePriority(a)-routePriority(b)||
      String(a.responseLabel??'').localeCompare(String(b.responseLabel??''))||
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
          reason:'P1_TERMINAL',
          terminal:trigger.defenderTerminal,
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
      if(token&&trigger.defenderCell===token.triggerCell){
        const discharge=dischargeRoute(token);
        if(discharge)routes.push({
          ...discharge,
          kind:discharge.kind,
          tokenId:token.id,
          reservedResponseLabel:label(token.responseCell),
        });
      }
      routes.sort((a,b)=>
        routePriority(a)-routePriority(b)||
        String(a.responseLabel??a.reservedResponseLabel??'')
          .localeCompare(String(b.responseLabel??b.reservedResponseLabel??''))
      );

      if(!routes.length)return {
        certified:false,
        failedTrigger:{
          defenderLabel:trigger.defenderLabel,
          reason:'NO_ADMITTED_CERTIFIED_ROUTE',
          immediate:classifyCpcxImmediate(afterP1).kind,
          optionCount:trigger.options?.length??0,
          tokenApplies:Boolean(token&&trigger.defenderCell===token.triggerCell),
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
      for(const id of [...(tokenIdsByChild.get(node.key)??[])].sort()){
        const token=tokenById.get(id),
          solved=solvePhysical(node,token);
        tStatus.set(id,solved.certified);
        tWitness.set(id,solved);
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
    ...[...tWitness.values()].flatMap(x=>x.selections??[]),
  ].map(x=>x.route);

  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    physicalNodeCount:nodes.length,
    reservationStateCount:tokenById.size,
    certifiedNStateCount:[...nStatus.values()].filter(Boolean).length,
    certifiedTStateCount:[...tStatus.values()].filter(Boolean).length,
    root:{
      key:root.key,
      rank:root.rank,
      support:root.support,
      descriptor:root.descriptor,
      certified:nStatus.get(root.key)===true,
      witness:nWitness.get(root.key),
    },
    certificationByRank:ranks.map(rank=>({
      rank,
      nCertified:nodes.filter(n=>n.rank===rank&&nStatus.get(n.key)===true).length,
      nTotal:nodes.filter(n=>n.rank===rank).length,
      tCertified:[...tokenById.values()].filter(t=>
        nodeByKey.get(t.childKey)?.rank===rank&&tStatus.get(t.id)===true
      ).length,
      tTotal:[...tokenById.values()].filter(t=>
        nodeByKey.get(t.childKey)?.rank===rank
      ).length,
    })),
    routeHistogram:countBy(routeRows,x=>x.kind),
    reservationTokenProvenance:{
      uniqueTokens:tokenById.size,
      predecessorEdges:[...tokenById.values()]
        .reduce((n,x)=>n+x.predecessorCount,0),
      triggerHistogram:countBy(
        [...tokenById.values()],x=>label(x.triggerCell)
      ),
      responseHistogram:countBy(
        [...tokenById.values()],x=>label(x.responseCell)
      ),
      residualHistogram:countBy(
        [...tokenById.values()],x=>x.residualLineLabel
      ),
    },
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-guarded-reservation-rcic.v0_1',
  root:'44444',
  candidateCount:reports.length,
  reports,
  summary:{
    anyClassCRootCertified:reports.some(x=>x.root.certified),
    certifiedRootActions:reports.filter(x=>x.root.certified)
      .map(x=>x.actionCell),
    totalPhysicalNodes:reports.reduce((n,x)=>n+x.physicalNodeCount,0),
    totalReservationStates:reports.reduce((n,x)=>n+x.reservationStateCount,0),
    totalCertifiedNStates:reports.reduce((n,x)=>n+x.certifiedNStateCount,0),
    totalCertifiedTStates:reports.reduce((n,x)=>n+x.certifiedTStateCount,0),
  },
  boundary:{
    fixedPhysicalCohort:true,
    existingRcicResponsesOnly:true,
    theoremCertifiedReservationStateOnly:true,
    directExistingFirstWinOnly:true,
    deterministicForcedNormalizationOnly:true,
    noArbitraryP0MoveEnumeration:true,
    noNewPhysicalChildren:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
    recursiveSearch:false,
  },
},null,2));

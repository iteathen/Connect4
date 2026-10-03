// CPCX latent-singleton pair-hub overload.
//
// Opponent-to-move first-win theorem:
// - attacker has one depth-one latent singleton t;
// - its support cell h is current frontier;
// - h is shared by at least two attacker two-piece residuals whose distinct
//   other endpoints are current frontier.
//
// The whole current defender frontier is audited once. No child frontier is
// recursively generated. A non-hub defender event is answered by A:h; the hub
// releases t and leaves at least one distinct spoke singleton. A hub occupation
// releases t directly and A:t terminals.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
  solveCpcxResponseCapacity,
} from './cpcx-closure.mjs';

function unique(values){
  return [...new Set(values)].sort((a,b)=>a-b);
}

function fail(seam,detail={}){
  return {
    schema:'connect4.cpcx.latent-singleton-pair-hub-overload.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam,
    ...detail,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

function frontierCells(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function isFrontier(position,cell){
  const {column,row}=cpcxCell(position.geometry,cell);
  return row===position.heights[column]&&
    row<position.geometry.rows&&
    position.owner[cell]===-1;
}

function playableSingletonCells(position,player){
  return unique(scanCpcxObligations(position)
    .filter(o=>
      o.player===player&&
      o.missingCount===1&&
      o.events[0].supportDistance===0
    )
    .map(o=>o.missingCells[0]));
}

function pairKey(a,b){
  return a<b?`${a},${b}`:`${b},${a}`;
}

export function findCpcxLatentSingletonPairHubCandidates(position,{
  attacker=position.mover^1,
  obligations=scanCpcxObligations(position),
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  const g=position.geometry,out=[],
    pairs=obligations.filter(o=>
      o.player===attacker&&o.missingCount===2
    );

  for(const singleton of obligations){
    if(singleton.player!==attacker||
       singleton.missingCount!==1||
       singleton.events[0].supportDistance!==1)continue;

    const targetCell=singleton.missingCells[0],
      target=cpcxCell(g,targetCell);
    if(target.row===0)continue;
    const hubCell=targetCell-g.columns;
    if(!isFrontier(position,hubCell))continue;

    const bySpoke=new Map();
    for(const pair of pairs){
      if(!pair.missingCells.includes(hubCell))continue;
      const other=pair.missingCells[0]===hubCell
        ?pair.missingCells[1]
        :pair.missingCells[0],
        hubEvent=pair.events.find(e=>e.cell===hubCell),
        otherEvent=pair.events.find(e=>e.cell===other);
      if(!hubEvent||!otherEvent||
         hubEvent.supportDistance!==0||
         otherEvent.supportDistance!==0||
         !isFrontier(position,other))continue;

      if(!bySpoke.has(other))bySpoke.set(other,{
        cell:other,
        lineIds:[],
        lineLabels:[],
      });
      const row=bySpoke.get(other);
      if(!row.lineIds.includes(pair.lineId))row.lineIds.push(pair.lineId);
      if(!row.lineLabels.includes(pair.lineLabel))
        row.lineLabels.push(pair.lineLabel);
    }

    const spokes=[...bySpoke.values()]
      .sort((a,b)=>a.cell-b.cell)
      .map(x=>({
        ...x,
        lineIds:[...x.lineIds].sort((a,b)=>a-b),
        lineLabels:[...x.lineLabels].sort(),
      }));
    if(spokes.length<2)continue;

    out.push({
      schema:'connect4.cpcx.latent-singleton-pair-hub-candidate.v0_1',
      attacker,
      defender:attacker^1,
      singleton:{
        lineId:singleton.lineId,
        lineLabel:singleton.lineLabel,
        targetCell,
      },
      targetCell,
      hubCell,
      spokes,
      distinctSpokeCount:spokes.length,
      residualDescriptionCount:spokes.reduce(
        (n,x)=>n+x.lineIds.length,0
      ),
      deduplicatedByPhysicalSpoke:true,
    });
  }

  out.sort((a,b)=>
    a.targetCell-b.targetCell||
    a.hubCell-b.hubCell||
    a.spokes.map(x=>x.cell).join(',')
      .localeCompare(b.spokes.map(x=>x.cell).join(','))
  );
  return out;
}

function capacityWitness(cells){
  const completionCells=unique(cells),
    demands=completionCells.map(cell=>`completion:${cell}`),
    resources=['defender-slot:0'],
    edges=demands.map(demand=>[demand,resources[0]]),
    matching=solveCpcxResponseCapacity({demands,resources,edges});
  return {
    completionCells,
    responseSlots:1,
    demandCount:demands.length,
    matching,
    overload:matching.perfect===false,
  };
}

export function auditCpcxLatentSingletonPairHubCurrentEvent(
  position,
  candidate,
  defenderCell
){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!candidate||!Number.isInteger(candidate.targetCell)||
     !Number.isInteger(candidate.hubCell))
    throw new TypeError('latent pair-hub candidate');
  if(!Number.isInteger(defenderCell))
    throw new TypeError('defenderCell');

  const defender=position.mover,attacker=defender^1;
  if(candidate.attacker!==attacker)
    return fail('ATTACKER_ROLE_MISMATCH');

  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')
    return fail('SOURCE_IMMEDIATE_PRECEDENCE',{boundary:immediate});

  const live=findCpcxLatentSingletonPairHubCandidates(position,{attacker})
    .find(x=>
      x.targetCell===candidate.targetCell&&
      x.hubCell===candidate.hubCell&&
      x.spokes.map(y=>y.cell).join(',')===
        candidate.spokes.map(y=>y.cell).join(',')
    );
  if(!live)return fail('CANDIDATE_NOT_CURRENT_LIVE');
  if(!isFrontier(position,defenderCell))
    return fail('DEFENDER_EVENT_NOT_CURRENT_FRONTIER',{defenderCell});

  const targetCell=live.targetCell,hubCell=live.hubCell,
    spokeSet=new Set(live.spokes.map(x=>x.cell)),
    afterDefender=applyCpcxForcedEvent(position,defenderCell);

  if(afterDefender.terminal)return fail(
    'DEFENDER_TERMINAL_ON_CURRENT_EVENT',
    {defenderCell,terminal:afterDefender.terminal}
  );

  if(defenderCell===hubCell){
    if(!isFrontier(afterDefender,targetCell))return fail(
      'HUB_OCCUPATION_DID_NOT_RELEASE_TARGET',
      {defenderCell,targetCell}
    );
    const terminal=applyCpcxForcedEvent(afterDefender,targetCell);
    if(!terminal.terminal||terminal.terminal.player!==attacker)return fail(
      'RELEASED_TARGET_NOT_ATTACKER_TERMINAL',
      {defenderCell,targetCell,terminal:terminal.terminal}
    );
    return {
      schema:'connect4.cpcx.latent-singleton-pair-hub-row.v0_1',
      kind:'CERTIFIED_FIRST_WIN_ROW',
      exact:true,
      player:attacker,
      attacker,
      defender,
      defenderCell,
      class:'HUB_OCCUPATION',
      attackerReplyCell:targetCell,
      result:'ATTACKER_TERMINAL',
      terminal:terminal.terminal,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
    };
  }

  if(!isFrontier(afterDefender,hubCell))return fail(
    'HUB_NOT_FRONTIER_STABLE',
    {defenderCell,hubCell}
  );

  const afterHub=applyCpcxForcedEvent(afterDefender,hubCell);
  if(afterHub.terminal){
    if(afterHub.terminal.player!==attacker)return fail(
      'WRONG_TERMINAL_ON_HUB',
      {defenderCell,terminal:afterHub.terminal}
    );
    return {
      schema:'connect4.cpcx.latent-singleton-pair-hub-row.v0_1',
      kind:'CERTIFIED_FIRST_WIN_ROW',
      exact:true,
      player:attacker,
      attacker,
      defender,
      defenderCell,
      class:'NON_HUB_EVENT',
      attackerReplyCell:hubCell,
      result:'ATTACKER_TERMINAL_ON_HUB',
      terminal:afterHub.terminal,
      recursive:false,
      choiceEnumeration:false,
      gameTreeTraversal:false,
    };
  }

  const attackerSingletons=playableSingletonCells(afterHub,attacker),
    defenderSingletons=playableSingletonCells(afterHub,defender),
    survivingSpokes=attackerSingletons.filter(cell=>
      spokeSet.has(cell)&&cell!==defenderCell
    );

  if(!attackerSingletons.includes(targetCell))return fail(
    'LATENT_TARGET_NOT_RELEASED_BY_HUB',
    {defenderCell,targetCell,attackerSingletons}
  );
  if(!survivingSpokes.length)return fail(
    'NO_SURVIVING_PAIR_SPOKE',
    {defenderCell,attackerSingletons}
  );
  if(defenderSingletons.length)return fail(
    'DEFENDER_COUNTERTERMINAL_AFTER_HUB',
    {
      defenderCell,
      defenderTerminalCells:defenderSingletons,
      attackerCompletionCells:attackerSingletons,
    }
  );

  const witnessCells=[targetCell,survivingSpokes[0]],
    capacity=capacityWitness(witnessCells);
  if(!capacity.overload)return fail(
    'RESPONSE_CAPACITY_NOT_OVERLOADED',
    {defenderCell,witnessCells,capacity}
  );

  return {
    schema:'connect4.cpcx.latent-singleton-pair-hub-row.v0_1',
    kind:'CERTIFIED_FIRST_WIN_ROW',
    exact:true,
    player:attacker,
    attacker,
    defender,
    defenderCell,
    class:spokeSet.has(defenderCell)
      ?'SPOKE_OCCUPATION'
      :'EXTERNAL_EVENT',
    attackerReplyCell:hubCell,
    result:'ATTACKER_SINGLETON_OVERLOAD',
    releasedTargetCell:targetCell,
    survivingSpokeCells:survivingSpokes,
    attackerSingletonCells:attackerSingletons,
    defenderSingletonCells:[],
    capacity,
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
  };
}

export function certifyCpcxLatentSingletonPairHubOverload(
  position,
  candidate
){
  if(!position?.geometry||!position?.heights||!position?.owner)
    throw new TypeError('exact CPCX position required');
  if(position.terminal)return fail('SOURCE_ALREADY_TERMINAL');
  if(!candidate||!Number.isInteger(candidate.targetCell)||
     !Number.isInteger(candidate.hubCell))
    throw new TypeError('latent pair-hub candidate');

  const defender=position.mover,attacker=defender^1;
  if(candidate.attacker!==attacker)
    return fail('ATTACKER_ROLE_MISMATCH');

  const immediate=classifyCpcxImmediate(position);
  if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')
    return fail('SOURCE_IMMEDIATE_PRECEDENCE',{boundary:immediate});

  const live=findCpcxLatentSingletonPairHubCandidates(position,{attacker})
    .find(x=>
      x.targetCell===candidate.targetCell&&
      x.hubCell===candidate.hubCell&&
      x.spokes.map(y=>y.cell).join(',')===
        candidate.spokes.map(y=>y.cell).join(',')
    );
  if(!live)return fail('CANDIDATE_NOT_CURRENT_LIVE');

  const rows=[];
  for(const defenderCell of frontierCells(position)){
    const row=auditCpcxLatentSingletonPairHubCurrentEvent(
      position,live,defenderCell
    );
    if(!row.exact)return {
      ...row,
      rows,
    };
    rows.push(row);
  }

  return {
    schema:'connect4.cpcx.latent-singleton-pair-hub-overload.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    defender,
    source:'LATENT_SINGLETON_PAIR_HUB_OVERLOAD',
    latentSingleton:{
      lineId:live.singleton.lineId,
      lineLabel:live.singleton.lineLabel,
      targetCell:live.targetCell,
      sourceSupportDistance:1,
    },
    hubCell:live.hubCell,
    spokes:live.spokes,
    distinctSpokeCount:live.spokes.length,
    currentFrontierEventCount:rows.length,
    rows,
    firstWinGuardPassed:true,
    responseCapacityDeduplicatedByPhysicalCell:true,
    proofRule:'each current defender event either occupies the support hub and releases the latent attacker terminal, or leaves the hub available; attacker hub then releases the latent target and leaves at least one distinct pair-spoke singleton, while defender counterterminals are excluded by exact audit',
    complexity:'O(boardWidth * liveLineCount * K); K is fixed Connect-K residual cardinality',
    recursive:false,
    choiceEnumeration:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}

export function findAndCertifyCpcxLatentSingletonPairHubOverloads(
  position,
  {attacker=position.mover^1}={}
){
  const out=[];
  for(const candidate of findCpcxLatentSingletonPairHubCandidates(
    position,{attacker}
  )){
    const certificate=certifyCpcxLatentSingletonPairHubOverload(
      position,candidate
    );
    if(certificate.exact)out.push({candidate,certificate});
  }
  return out;
}

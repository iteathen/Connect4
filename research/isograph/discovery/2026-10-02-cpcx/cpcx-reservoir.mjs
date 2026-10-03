// CPCX truncated target-reservoir first-win certificate.
//
// Port of the already-qualified structural theorem:
//   active attacker singleton at nonplayable target
// + finite truncated synchronized pairing
// + complete defender-residual coverage
// -> CERTIFIED_FIRST_WIN(attacker)
//
// The proof object is synthesized from the current position only. It does not
// traverse future reply histories, consume solved values, or use an oracle.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';

function unique(values){return [...new Set(values)].sort((a,b)=>a-b);}

function labelCell(g,cell){
  const {column,row}=cpcxCell(g,cell);
  return `${column<26?String.fromCharCode(65+column):`C${column+1}`}${row+1}`;
}

function playableSingletonCells(obligations,player){
  return unique(obligations
    .filter(o=>
      o.player===player&&
      o.missingCount===1&&
      o.events[0].supportDistance===0
    )
    .map(o=>o.missingCells[0]));
}

function targetSingleton(obligations,attacker,targetCell){
  return obligations.find(o=>
    o.player===attacker&&
    o.missingCount===1&&
    o.missingCells[0]===targetCell
  )??null;
}

function relevantCapacity(position,targetCell){
  const g=position.geometry,{column:tc,row:tr}=cpcxCell(g,targetCell),
    capacity=new Int16Array(g.columns);
  for(let c=0;c<g.columns;c++){
    capacity[c]=c===tc
      ?tr-position.heights[c]+1
      :g.rows-position.heights[c];
    if(capacity[c]<0)return null;
  }
  return capacity;
}

function residualHasCell(residual,cell){
  return residual.missingCells.includes(cell);
}

function coverageWitness(position,residual,targetCell,partner,length){
  const g=position.geometry,{column:tc,row:tr}=cpcxCell(g,targetCell);

  for(const cell of residual.missingCells){
    const {column,row}=cpcxCell(g,cell);
    if(column===tc&&row>tr)return {
      kind:'POST_TARGET_DEFERRAL',
      cell,
      cellLabel:labelCell(g,cell),
    };
  }

  for(const cell of residual.missingCells){
    const {column,row}=cpcxCell(g,cell),
      depth=row-position.heights[column],
      p=partner[column],
      L=p>=0?length[column]:0;
    if(depth<0)continue;

    // Vertical pairs begin after any synchronized odd prefix.
    // Response depths are L+1, L+3, ...
    if(depth>=L+1&&((depth-(L+1))&1)===0)return {
      kind:'VERTICAL_ATTACKER_RESPONSE',
      cell,
      cellLabel:labelCell(g,cell),
      depth,
      prefixLength:L,
    };

    if(p>=0&&depth<L){
      const mate=(position.heights[p]+depth)*g.columns+p;
      if(residualHasCell(residual,mate))return {
        kind:'SYNCHRONIZED_CROSS_PAIR',
        cells:[cell,mate],
        cellLabels:[labelCell(g,cell),labelCell(g,mate)],
        columns:[column,p],
        depth,
        prefixLength:L,
      };
    }
  }
  return null;
}

function templateEvidence(position,targetCell,defenderResiduals,capacity,partner,length){
  const g=position.geometry,{column:tc,row:tr}=cpcxCell(g,targetCell),
    targetDepth=tr-position.heights[tc],
    targetL=partner[tc]>=0?length[tc]:0,
    targetIsAttackerResponse=
      targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
  if(!targetIsAttackerResponse)return null;

  const coverage=[];
  for(const residual of defenderResiduals){
    const witness=coverageWitness(position,residual,targetCell,partner,length);
    if(!witness)return null;
    coverage.push({
      obligationId:residual.id,
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      missingCount:residual.missingCount,
      missingCells:[...residual.missingCells],
      witness,
    });
  }

  const synchronizedPairs=[];
  for(let c=0;c<g.columns;c++){
    const p=partner[c];
    if(p>=0&&c<p)synchronizedPairs.push({
      columns:[c,p],
      prefixLength:length[c],
    });
  }

  return {
    targetDepth,
    targetPrefixLength:targetL,
    targetIsAttackerResponse:true,
    synchronizedPairs,
    defenderResidualCount:defenderResiduals.length,
    coverage,
  };
}

function synthesizeTemplate(position,targetCell,defenderResiduals){
  const g=position.geometry,capacity=relevantCapacity(position,targetCell);
  if(!capacity)return null;
  const {column:tc}=cpcxCell(g,targetCell);
  if(capacity[tc]<=0)return null;

  let total=0;
  const odd=[];
  for(let c=0;c<g.columns;c++){
    total+=capacity[c];
    if(capacity[c]&1)odd.push(c);
  }
  if(total&1||odd.length&1)return null;

  // Standard 7x6 has at most six odd columns here. This is bounded structural
  // proof synthesis over column pairings, not legal-move or game-tree search.
  const partner=new Int16Array(g.columns);partner.fill(-1);
  const length=new Int16Array(g.columns);
  let found=null;

  function rec(pending){
    if(found)return;
    if(!pending.length){
      const evidence=templateEvidence(
        position,targetCell,defenderResiduals,capacity,partner,length
      );
      if(evidence)found={
        capacity:Array.from(capacity),
        totalRelevantEvents:total,
        oddColumns:[...odd],
        partner:Array.from(partner),
        prefixLength:Array.from(length),
        ...evidence,
      };
      return;
    }

    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],
        rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        // Target must be in a vertical tail, never a cross-pair endpoint.
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;
      length[a]=0;length[b]=0;
    }
  }

  rec(odd);
  return found;
}

export function certifyCpcxTruncatedTargetReservoir(position,{
  attacker=position.mover^1,
  targetCell,
  obligations=scanCpcxObligations(position),
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  const defender=attacker^1,g=position.geometry;

  if(position.terminal)return {
    kind:'NO_CERTIFICATE',exact:false,seam:'ALREADY_TERMINAL',
  };
  if(position.mover!==defender)return {
    kind:'NO_CERTIFICATE',exact:false,seam:'TARGET_RESERVOIR_REQUIRES_DEFENDER_TO_MOVE',
  };

  const target=targetSingleton(obligations,attacker,targetCell);
  if(!target)return {
    kind:'NO_CERTIFICATE',exact:false,seam:'TARGET_NOT_ACTIVE_ATTACKER_SINGLETON',
  };
  if(target.events[0].supportDistance<=0)return {
    kind:'NO_CERTIFICATE',exact:false,seam:'TARGET_NOT_NONPLAYABLE',
  };

  const attackerPlayable=playableSingletonCells(obligations,attacker),
    defenderPlayable=playableSingletonCells(obligations,defender);
  if(attackerPlayable.length||defenderPlayable.length)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'TARGET_RESERVOIR_REQUIRES_IMMEDIATE_NORMALIZATION',
    attackerPlayable,
    defenderPlayable,
  };

  const defenderResiduals=obligations.filter(o=>o.player===defender),
    template=synthesizeTemplate(position,targetCell,defenderResiduals);
  if(!template)return {
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'NO_TRUNCATED_TARGET_RESERVOIR_TEMPLATE',
  };

  return {
    schema:'connect4.cpcx.truncated-target-reservoir.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    defender,
    target:{
      cell:targetCell,
      label:labelCell(g,targetCell),
      supportDistance:target.events[0].supportDistance,
      obligationId:target.id,
      lineId:target.lineId,
      lineLabel:target.lineLabel,
    },
    template:{
      ...template,
      oddColumnLabels:template.oddColumns.map(c=>c+1),
      synchronizedPairs:template.synchronizedPairs.map(x=>({
        columns:x.columns,
        columnLabels:x.columns.map(c=>c+1),
        prefixLength:x.prefixLength,
      })),
    },
    firstWinGuard:{
      attackerPlayableSingletons:[],
      defenderPlayableSingletons:[],
      passed:true,
    },
    proofRule:'finite truncated event reservoir assigns target to an attacker response and blocks every live defender residual by exact attachment',
    theoremProvenance:'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md; qualified 2026-10-01 and reconstructed here from current CPCX state',
    proofSynthesisOnly:true,
    gameTreeTraversal:false,
    recursive:false,
  };
}

export function findCpcxTruncatedTargetReservoirCertificates(position,{
  attacker=position.mover^1,
  obligations=scanCpcxObligations(position),
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  const targets=unique(obligations
    .filter(o=>
      o.player===attacker&&
      o.missingCount===1&&
      o.events[0].supportDistance>0
    )
    .map(o=>o.missingCells[0]));
  const out=[];
  for(const targetCell of targets){
    const certificate=certifyCpcxTruncatedTargetReservoir(position,{
      attacker,targetCell,obligations,
    });
    if(certificate.exact)out.push(certificate);
  }
  return out;
}

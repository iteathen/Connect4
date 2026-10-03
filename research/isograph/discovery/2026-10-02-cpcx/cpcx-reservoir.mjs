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
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';

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

export function analyzeCpcxTargetReservoir(position,{
  attacker=position.mover^1,
  targetCell,
  obligations=scanCpcxObligations(position),
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  const defender=attacker^1,g=position.geometry,
    target=targetSingleton(obligations,attacker,targetCell);
  if(!target)return {
    schema:'connect4.cpcx.target-reservoir-analysis.v0_1',
    kind:'TARGET_NOT_ACTIVE_ATTACKER_SINGLETON',
    exact:true,
    attacker,defender,targetCell,
  };
  const capacity=relevantCapacity(position,targetCell);
  if(!capacity)return {
    schema:'connect4.cpcx.target-reservoir-analysis.v0_1',
    kind:'TARGET_CAPACITY_INVALID',
    exact:true,
    attacker,defender,targetCell,
  };
  const {column:targetColumn,row:targetRow}=cpcxCell(g,targetCell),
    targetDepth=targetRow-position.heights[targetColumn],
    oddColumns=[],
    evenColumns=[];
  let totalRelevantEvents=0;
  for(let c=0;c<g.columns;c++){
    totalRelevantEvents+=capacity[c];
    (capacity[c]&1?oddColumns:evenColumns).push(c);
  }
  return {
    schema:'connect4.cpcx.target-reservoir-analysis.v0_1',
    kind:totalRelevantEvents&1
      ?'ODD_RESERVOIR_DEFECT'
      :oddColumns.length&1
        ?'ODD_COLUMN_PAIRING_DEFECT'
        :'PAIRING_PARITY_ADMISSIBLE',
    exact:true,
    attacker,
    defender,
    target:{
      cell:targetCell,
      label:labelCell(g,targetCell),
      column:targetColumn,
      row:targetRow,
      supportDistance:target.events[0].supportDistance,
      targetDepth,
      obligationId:target.id,
      lineId:target.lineId,
      lineLabel:target.lineLabel,
    },
    capacity:Array.from(capacity),
    totalRelevantEvents,
    totalParity:totalRelevantEvents&1,
    oddColumns,
    oddColumnLabels:oddColumns.map(c=>c+1),
    evenColumns,
    unmatchedEventCountLowerBound:totalRelevantEvents&1,
    defenderResidualCount:obligations.filter(o=>o.player===defender).length,
    proofBoundary:'parity analysis only; an odd reservoir defect is not a first-win certificate and requires an independently proved phase-transfer/repair theorem',
    recursive:false,
    gameTreeTraversal:false,
  };
}


function oneDefectTemplateEvidence(
  position,targetCell,defenderResiduals,capacity,partner,length
){
  const g=position.geometry,{column:tc,row:tr}=cpcxCell(g,targetCell),
    targetDepth=tr-position.heights[tc],
    targetL=partner[tc]>=0?length[tc]:0,
    targetIsAttackerResponse=
      targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
  if(!targetIsAttackerResponse)return null;

  const tailLengths=Array.from({length:g.columns},(_,c)=>
      capacity[c]-(partner[c]>=0?length[c]:0)
    ),
    defectColumns=[];
  for(let c=0;c<g.columns;c++)if(tailLengths[c]&1)defectColumns.push(c);
  if(defectColumns.length!==1)return null;
  const defectColumn=defectColumns[0],
    defectRow=position.heights[defectColumn]+capacity[defectColumn]-1,
    defectCell=defectRow*g.columns+defectColumn;

  const coverage=[],uncovered=[];
  for(const residual of defenderResiduals){
    const witness=coverageWitness(position,residual,targetCell,partner,length);
    const row={
      obligationId:residual.id,
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      missingCount:residual.missingCount,
      missingCells:[...residual.missingCells],
    };
    if(witness)coverage.push({...row,witness});
    else uncovered.push(row);
  }

  const synchronizedPairs=[];
  for(let c=0;c<g.columns;c++){
    const p=partner[c];
    if(p>=0&&c<p)synchronizedPairs.push({
      columns:[c,p],
      prefixLength:length[c],
      parityClass:(capacity[c]&1)===(capacity[p]&1)
        ?'SAME_CAPACITY_PARITY'
        :'OPPOSITE_CAPACITY_PARITY',
    });
  }

  return {
    targetDepth,
    targetPrefixLength:targetL,
    targetIsAttackerResponse:true,
    tailLengths,
    defect:{
      column:defectColumn,
      columnLabel:defectColumn+1,
      cell:defectCell,
      cellLabel:labelCell(g,defectCell),
      tailLength:tailLengths[defectColumn],
      role:'UNMATCHED_DEFENDER_TOP_EVENT',
    },
    synchronizedPairs,
    defenderResidualCount:defenderResiduals.length,
    coveredResidualCount:coverage.length,
    uncoveredResidualCount:uncovered.length,
    coverage,
    uncovered,
  };
}

export function analyzeCpcxOneDefectTargetReservoir(position,{
  attacker=position.mover^1,
  targetCell,
  obligations=scanCpcxObligations(position),
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:'UNSUPPORTED_GEOMETRY',
    exact:false,
    attacker,defender,
    boundary:'current qualification scope is standard 7x6 Connect Four only',
  };

  const target=targetSingleton(obligations,attacker,targetCell);
  if(!target)return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:'TARGET_NOT_ACTIVE_ATTACKER_SINGLETON',
    exact:true,
    attacker,defender,targetCell,
  };
  if(position.mover!==defender)return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:'DEFENDER_NOT_TO_MOVE',
    exact:true,
    attacker,defender,targetCell,
  };
  if(target.events[0].supportDistance<=0)return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:'TARGET_NOT_NONPLAYABLE',
    exact:true,
    attacker,defender,targetCell,
  };

  const capacity=relevantCapacity(position,targetCell);
  if(!capacity)return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:'TARGET_CAPACITY_INVALID',
    exact:true,
    attacker,defender,targetCell,
  };

  const attackerPlayable=playableSingletonCells(obligations,attacker),
    defenderPlayable=playableSingletonCells(obligations,defender);
  if(attackerPlayable.length||defenderPlayable.length)return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:'IMMEDIATE_NORMALIZATION_REQUIRED',
    exact:true,
    attacker,defender,targetCell,
    attackerPlayable,
    defenderPlayable,
  };

  const totalRelevantEvents=Array.from(capacity).reduce((a,b)=>a+b,0);
  if((totalRelevantEvents&1)===0)return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:'RESERVOIR_NOT_ODD',
    exact:true,
    attacker,defender,targetCell,
    capacity:Array.from(capacity),
    totalRelevantEvents,
  };

  const defenderResiduals=obligations.filter(o=>o.player===defender),
    partner=new Int16Array(g.columns),length=new Int16Array(g.columns);
  partner.fill(-1);
  let candidateCount=0,maxCovered=-1;
  const best=[],full=[];

  function recordCandidate(){
    const evidence=oneDefectTemplateEvidence(
      position,targetCell,defenderResiduals,capacity,partner,length
    );
    if(!evidence)return;
    candidateCount+=1;
    const row={
      partner:Array.from(partner),
      prefixLength:Array.from(length),
      ...evidence,
    };
    if(evidence.coveredResidualCount>maxCovered){
      maxCovered=evidence.coveredResidualCount;
      best.length=0;
      best.push(row);
    }else if(evidence.coveredResidualCount===maxCovered){
      best.push(row);
    }
    if(evidence.uncoveredResidualCount===0)full.push(row);
  }

  function enumerate(remaining){
    if(!remaining.length){
      recordCandidate();
      return;
    }
    const a=remaining[0],rest=remaining.slice(1);

    // An unpaired column uses only same-column response pairs; if its remaining
    // capacity is odd, its final relevant event is the single defect.
    enumerate(rest);

    for(let j=0;j<rest.length;j++){
      const b=rest[j],
        next=rest.filter((_,k)=>k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max;L++){
        // The target itself may never be consumed as a synchronized cross
        // endpoint. Cells strictly below it may participate.
        const {column:tc}=cpcxCell(g,targetCell);
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        length[a]=L;length[b]=L;
        enumerate(next);
      }
      partner[a]=-1;partner[b]=-1;
      length[a]=0;length[b]=0;
    }
  }

  enumerate(Array.from({length:g.columns},(_,c)=>c));

  const sortKey=x=>[
    x.uncoveredResidualCount,
    x.synchronizedPairs.length,
    x.synchronizedPairs.reduce((n,p)=>n+p.prefixLength,0),
    x.defect.column,
    x.partner.join(','),
    x.prefixLength.join(','),
  ];
  const compare=(a,b)=>{
    const ka=sortKey(a),kb=sortKey(b);
    for(let i=0;i<ka.length;i++){
      if(typeof ka[i]==='number'&&typeof kb[i]==='number'){
        if(ka[i]!==kb[i])return ka[i]-kb[i];
      }else{
        const c=String(ka[i]).localeCompare(String(kb[i]));
        if(c)return c;
      }
    }
    return 0;
  };
  best.sort(compare);full.sort(compare);

  return {
    schema:'connect4.cpcx.one-defect-target-reservoir-analysis.v0_1',
    kind:full.length
      ?'ONE_DEFECT_STATIC_COVERAGE'
      :'ONE_DEFECT_STATIC_COVERAGE_GAP',
    exact:true,
    attacker,defender,
    target:{
      cell:targetCell,
      label:labelCell(g,targetCell),
      supportDistance:target.events[0].supportDistance,
      obligationId:target.id,
      lineId:target.lineId,
      lineLabel:target.lineLabel,
    },
    capacity:Array.from(capacity),
    totalRelevantEvents,
    totalParity:1,
    defenderResidualCount:defenderResiduals.length,
    candidateCount,
    maxCoveredResiduals:maxCovered,
    minimumUncoveredResiduals:
      maxCovered<0?defenderResiduals.length:defenderResiduals.length-maxCovered,
    fullCoverageTemplateCount:full.length,
    selectedFullCoverageTemplate:full[0]??null,
    fullCoverageTemplates:full.slice(0,64),
    fullCoverageTemplatesTruncated:full.length>64,
    bestPartialTemplates:best.slice(0,16),
    proofBoundary:full.length
      ?'static coverage plus one unmatched defender top event is exact structure only; first-win certification still requires a qualified defect transport/repair viability theorem'
      :'no one-defect template in the bounded standard7x6 synthesis covers every live defender residual; uncovered obligations are preserved as falsifiers',
    firstWinCertified:false,
    recursive:false,
    gameTreeTraversal:false,
  };
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

function partialTruncatedTemplateEvidence(
  position,targetCell,defenderResiduals,capacity,partner,length
){
  const g=position.geometry,{column:tc,row:tr}=cpcxCell(g,targetCell),
    targetDepth=tr-position.heights[tc],
    targetL=partner[tc]>=0?length[tc]:0,
    targetIsAttackerResponse=
      targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
  if(!targetIsAttackerResponse)return null;

  const coverage=[],uncovered=[];
  for(const residual of defenderResiduals){
    const witness=coverageWitness(
      position,residual,targetCell,partner,length
    ),row={
      obligationId:residual.id,
      lineId:residual.lineId,
      lineLabel:residual.lineLabel,
      orientation:residual.orientation,
      missingCount:residual.missingCount,
      missingCells:[...residual.missingCells],
    };
    if(witness)coverage.push({...row,witness});
    else uncovered.push(row);
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
    coveredResidualCount:coverage.length,
    uncoveredResidualCount:uncovered.length,
    coverage,
    uncovered,
  };
}

export function analyzeCpcxTruncatedTargetReservoirCoverage(position,{
  attacker=position.mover^1,
  targetCell,
  obligations=scanCpcxObligations(position),
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.truncated-target-coverage-analysis.v0_1',
    kind:'UNSUPPORTED_GEOMETRY',
    exact:false,
    attacker,defender,
  };

  const target=targetSingleton(obligations,attacker,targetCell);
  if(!target)return {
    schema:'connect4.cpcx.truncated-target-coverage-analysis.v0_1',
    kind:'TARGET_NOT_ACTIVE_ATTACKER_SINGLETON',
    exact:true,
    attacker,defender,targetCell,
  };
  if(position.mover!==defender)return {
    schema:'connect4.cpcx.truncated-target-coverage-analysis.v0_1',
    kind:'DEFENDER_NOT_TO_MOVE',
    exact:true,
    attacker,defender,targetCell,
  };
  if(target.events[0].supportDistance<=0)return {
    schema:'connect4.cpcx.truncated-target-coverage-analysis.v0_1',
    kind:'TARGET_NOT_NONPLAYABLE',
    exact:true,
    attacker,defender,targetCell,
  };

  const capacity=relevantCapacity(position,targetCell);
  if(!capacity)return {
    schema:'connect4.cpcx.truncated-target-coverage-analysis.v0_1',
    kind:'TARGET_CAPACITY_INVALID',
    exact:true,
    attacker,defender,targetCell,
  };
  let totalRelevantEvents=0;
  const odd=[];
  for(let c=0;c<g.columns;c++){
    totalRelevantEvents+=capacity[c];
    if(capacity[c]&1)odd.push(c);
  }
  if(totalRelevantEvents&1||odd.length&1)return {
    schema:'connect4.cpcx.truncated-target-coverage-analysis.v0_1',
    kind:'PAIRING_PARITY_INADMISSIBLE',
    exact:true,
    attacker,defender,targetCell,
    capacity:Array.from(capacity),
    totalRelevantEvents,
    oddColumns:odd,
  };

  const defenderResiduals=obligations.filter(o=>o.player===defender),
    partner=new Int16Array(g.columns),
    length=new Int16Array(g.columns);
  partner.fill(-1);
  let candidateCount=0,maxCovered=-1;
  const full=[],best=[];

  function record(){
    const evidence=partialTruncatedTemplateEvidence(
      position,targetCell,defenderResiduals,capacity,partner,length
    );
    if(!evidence)return;
    candidateCount+=1;
    const row={
      partner:Array.from(partner),
      prefixLength:Array.from(length),
      ...evidence,
    };
    if(evidence.coveredResidualCount>maxCovered){
      maxCovered=evidence.coveredResidualCount;
      best.length=0;
      best.push(row);
    }else if(evidence.coveredResidualCount===maxCovered){
      best.push(row);
    }
    if(evidence.uncoveredResidualCount===0)full.push(row);
  }

  function rec(pending){
    if(!pending.length){record();return;}
    const a=pending[0];
    for(let j=1;j<pending.length;j++){
      const b=pending[j],
        rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max;L+=2){
        const {column:tc}=cpcxCell(g,targetCell);
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        length[a]=L;length[b]=L;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;
      length[a]=0;length[b]=0;
    }
  }

  if(!odd.length)record();
  else rec(odd);

  const sort=(a,b)=>
    a.uncoveredResidualCount-b.uncoveredResidualCount||
    a.synchronizedPairs.length-b.synchronizedPairs.length||
    a.synchronizedPairs.reduce((n,p)=>n+p.prefixLength,0)-
      b.synchronizedPairs.reduce((n,p)=>n+p.prefixLength,0)||
    a.partner.join(',').localeCompare(b.partner.join(','))||
    a.prefixLength.join(',').localeCompare(b.prefixLength.join(','));
  full.sort(sort);best.sort(sort);

  return {
    schema:'connect4.cpcx.truncated-target-coverage-analysis.v0_1',
    kind:full.length
      ?'TRUNCATED_TARGET_STATIC_COVERAGE'
      :'TRUNCATED_TARGET_STATIC_COVERAGE_GAP',
    exact:true,
    attacker,defender,
    target:{
      cell:targetCell,
      label:labelCell(g,targetCell),
      supportDistance:target.events[0].supportDistance,
      obligationId:target.id,
      lineId:target.lineId,
      lineLabel:target.lineLabel,
    },
    capacity:Array.from(capacity),
    totalRelevantEvents,
    oddColumns:odd,
    defenderResidualCount:defenderResiduals.length,
    candidateCount,
    maxCoveredResiduals:maxCovered,
    minimumUncoveredResiduals:
      maxCovered<0?defenderResiduals.length:defenderResiduals.length-maxCovered,
    fullCoverageTemplateCount:full.length,
    selectedFullCoverageTemplate:full[0]??null,
    bestPartialTemplates:best.slice(0,16),
    proofBoundary:full.length
      ?'static ordinary-reservoir coverage only; certification still requires the qualified target-reservoir guards'
      :'bounded standard7x6 ordinary-reservoir template synthesis leaves explicit uncovered defender residuals; diagnostic only',
    firstWinCertified:false,
    recursive:false,
    gameTreeTraversal:false,
  };
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


export function findCpcxTargetReservoirSetupCertificates(position,{
  attacker=position.mover,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(position.terminal||position.mover!==attacker)return [];
  const g=position.geometry,out=[];
  for(let column=0;column<g.columns;column++){
    const row=position.heights[column];
    if(row>=g.rows)continue;
    const setupCell=row*g.columns+column,
      child=applyCpcxForcedEvent(position,setupCell);
    if(child.terminal){
      if(child.terminal.player===attacker)out.push({
        schema:'connect4.cpcx.target-reservoir-setup.v0_1',
        kind:'CERTIFIED_FIRST_WIN',
        exact:true,
        player:attacker,
        attacker,
        setupCell,
        setupLabel:labelCell(g,setupCell),
        source:'TERMINAL_ON_SETUP',
        childCertificate:null,
        rankDeltaToCertificate:1,
        gameTreeTraversal:false,
        recursive:false,
      });
      continue;
    }
    const certificates=findCpcxTruncatedTargetReservoirCertificates(child,{attacker});
    for(const childCertificate of certificates)out.push({
      schema:'connect4.cpcx.target-reservoir-setup.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:attacker,
      attacker,
      setupCell,
      setupLabel:labelCell(g,setupCell),
      source:'SETUP_TO_TRUNCATED_TARGET_RESERVOIR',
      childCertificate,
      rankDeltaToCertificate:1,
      theoremProvenance:'attacker setup lift + CPCX truncated target-reservoir theorem',
      gameTreeTraversal:false,
      recursive:false,
    });
  }
  return out.sort((a,b)=>a.setupCell-b.setupCell);
}

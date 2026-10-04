// CPCX target-reservoir coverage-gap ranked controlled invariant candidate.
//
// This module composes already-qualified local structural edges:
// - truncated target-reservoir pairing;
// - trigger-adaptive choice after the observed defender move;
// - exact current frontier residual-attachment response;
// - existing CPCX first-win certificates.
//
// It does NOT scan arbitrary P0 responses. For one defender trigger, admitted P0
// responses are only:
//   1. the mate prescribed by one best partial target-reservoir template; or
//   2. a currently playable cell belonging to one of that same template's
//      uncovered live defender residuals.
//
// A nonterminal child may re-enter only when the same attacker target remains
// structurally analyzable and minimumUncoveredResiduals strictly decreases.
// Gap zero is accepted only through the qualified ordinary target-reservoir
// certificate. The proof graph is solved bottom-up by gap rank, not by game
// value recursion.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  analyzeCpcxTruncatedTargetReservoirCoverage,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

function labelCell(g,cell){
  const {column,row}=cpcxCell(g,cell);
  return `${column<26?String.fromCharCode(65+column):`C${column+1}`}${row+1}`;
}

function frontier(position){
  const g=position.geometry,out=[];
  for(let column=0;column<g.columns;column++){
    const row=position.heights[column];
    if(row<g.rows)out.push(row*g.columns+column);
  }
  return out;
}

function stateKey(position,targetCell){
  return [
    position.mover,
    targetCell,
    Array.from(position.heights).join(','),
    Array.from(position.owner).join(','),
  ].join('|');
}

function templateResponse(position,analysis,template,defenderCell){
  const g=position.geometry,{column,row}=cpcxCell(g,defenderCell);
  if(row!==position.heights[column]||position.owner[defenderCell]!==-1)
    return null;

  const partner=template.partner[column],
    prefixLength=template.prefixLength[column];

  if(partner>=0&&prefixLength>0){
    const responseRow=position.heights[partner],
      responseCell=responseRow*g.columns+partner;
    return {
      cell:responseCell,
      role:'PARTIAL_TEMPLATE_RESPONSE',
      templateResponse:true,
      attachmentResponse:false,
    };
  }

  if((analysis.capacity?.[column]??0)>1)return {
    cell:defenderCell+g.columns,
    role:'PARTIAL_TEMPLATE_VERTICAL_RESPONSE',
    templateResponse:true,
    attachmentResponse:false,
  };

  return null;
}

function attachedResponses(position,uncovered){
  const ids=new Set(uncovered.map(x=>x.lineId)),
    currentFrontier=new Set(frontier(position)),
    out=new Map();

  for(const o of scanCpcxObligations(position)){
    if(o.player!==1||!ids.has(o.lineId))continue;
    for(const cell of o.missingCells){
      if(!currentFrontier.has(cell))continue;
      if(!out.has(cell))out.set(cell,{
        cell,
        role:'UNCOVERED_RESIDUAL_ATTACHMENT',
        templateResponse:false,
        attachmentResponse:true,
        lineIds:[],
        lineLabels:[],
      });
      const row=out.get(cell);
      row.lineIds.push(o.lineId);
      row.lineLabels.push(o.lineLabel);
    }
  }

  return [...out.values()].sort((a,b)=>a.cell-b.cell);
}

function mergeResponse(map,row){
  if(!row)return;
  const prior=map.get(row.cell);
  if(!prior){
    map.set(row.cell,row);
    return;
  }
  map.set(row.cell,{
    ...prior,
    role:[...new Set([
      ...String(prior.role).split('+'),
      ...String(row.role).split('+'),
    ])].join('+'),
    templateResponse:prior.templateResponse||row.templateResponse,
    attachmentResponse:prior.attachmentResponse||row.attachmentResponse,
    lineIds:[...new Set([...(prior.lineIds??[]),...(row.lineIds??[])])],
    lineLabels:[...new Set([...(prior.lineLabels??[]),...(row.lineLabels??[])])],
  });
}

function baseHandoff(position,{attacker,targetCell}){
  if(position.terminal)return position.terminal.player===attacker?{
    kind:'ATTACKER_TERMINAL',
    exact:true,
    player:attacker,
  }:{
    kind:'OPPONENT_TERMINAL',
    exact:false,
    player:position.terminal.player,
  };

  const existing=runCpcxFirstWinCertificate(position,{attacker});
  if(existing.kind==='CERTIFIED_FIRST_WIN'&&existing.player===attacker)return {
    kind:'EXISTING_CPCX_FIRST_WIN',
    exact:true,
    player:attacker,
    certificate:existing,
  };

  const ordinary=certifyCpcxTruncatedTargetReservoir(
    position,{attacker,targetCell}
  );
  if(ordinary.kind==='CERTIFIED_FIRST_WIN')return {
    kind:'ORDINARY_TARGET_RESERVOIR',
    exact:true,
    player:attacker,
    certificate:ordinary,
  };

  return {
    kind:'NO_BASE_HANDOFF',
    exact:false,
    existingSeam:existing.seam??existing.kind,
    ordinarySeam:ordinary.seam??ordinary.kind,
  };
}

function compareDescriptorRank(a,b){
  const ak=[
      a?.gap??Number.MAX_SAFE_INTEGER,
      a?.uncoveredMass??Number.MAX_SAFE_INTEGER,
      a?.uncoveredSupportSum??Number.MAX_SAFE_INTEGER,
      a?.uncoveredSupportMax??Number.MAX_SAFE_INTEGER,
    ],
    bk=[
      b?.gap??Number.MAX_SAFE_INTEGER,
      b?.uncoveredMass??Number.MAX_SAFE_INTEGER,
      b?.uncoveredSupportSum??Number.MAX_SAFE_INTEGER,
      b?.uncoveredSupportMax??Number.MAX_SAFE_INTEGER,
    ];
  for(let i=0;i<ak.length;i++)if(ak[i]!==bk[i])return ak[i]-bk[i];

  const ad=[...(a?.uncoveredSupportDistances??[])].sort((x,y)=>y-x),
    bd=[...(b?.uncoveredSupportDistances??[])].sort((x,y)=>y-x),
    n=Math.max(ad.length,bd.length);
  for(let i=0;i<n;i++){
    const av=ad[i]??-1,bv=bd[i]??-1;
    if(av!==bv)return av-bv;
  }

  const ac=a?.remainingCapacity??Number.MAX_SAFE_INTEGER,
    bc=b?.remainingCapacity??Number.MAX_SAFE_INTEGER;
  return ac-bc;
}

function descriptorStrictlyDecreases(parent,child){
  return compareDescriptorRank(child,parent)<0;
}

function gapDescriptor(position,analysis){
  const template=analysis?.bestPartialTemplates?.[0],
    uncovered=template?.uncovered??[],
    supportDistances=[];
  let uncoveredMass=0;
  for(const residual of uncovered){
    uncoveredMass+=residual.missingCount;
    for(const cell of residual.missingCells){
      const {column,row}=cpcxCell(position.geometry,cell);
      supportDistances.push(row-position.heights[column]);
    }
  }
  supportDistances.sort((a,b)=>a-b);
  return {
    gap:analysis?.minimumUncoveredResiduals??null,
    uncoveredMass,
    uncoveredSupportDistances:supportDistances,
    uncoveredSupportSum:supportDistances.reduce((a,b)=>a+b,0),
    uncoveredSupportMax:supportDistances.length
      ?Math.max(...supportDistances)
      :null,
    remainingCapacity:position.geometry.cellCount-position.rank,
    uncoveredShapes:uncovered.map(x=>({
      lineId:x.lineId,
      lineLabel:x.lineLabel,
      orientation:x.orientation,
      missingCount:x.missingCount,
      missingCells:[...x.missingCells],
    })),
  };
}

function analyzeGap(position,{attacker,targetCell}){
  const base=baseHandoff(position,{attacker,targetCell});
  if(base.exact)return {
    kind:'BASE',
    exact:true,
    base,
    gap:-1,
    analysis:null,
  };

  if(position.mover!==(attacker^1))return {
    kind:'NO_GAP_CLASS',
    exact:false,
    seam:'GAP_CLASS_REQUIRES_DEFENDER_TO_MOVE',
  };

  const analysis=analyzeCpcxTruncatedTargetReservoirCoverage(
    position,{attacker,targetCell}
  );
  if(analysis.kind!=='TRUNCATED_TARGET_STATIC_COVERAGE_GAP')return {
    kind:'NO_GAP_CLASS',
    exact:false,
    seam:analysis.kind,
    analysis,
  };

  const gap=analysis.minimumUncoveredResiduals;
  if(!Number.isInteger(gap)||gap<1)return {
    kind:'NO_GAP_CLASS',
    exact:false,
    seam:'INVALID_COVERAGE_GAP_MEASURE',
    analysis,
  };

  return {
    kind:'GAP',
    exact:true,
    gap,
    analysis,
  };
}

function responseOptions(position,analysis,template,defenderCell){
  const afterDefender=applyCpcxForcedEvent(position,defenderCell);
  if(afterDefender.terminal)return {
    afterDefender,
    responses:[],
  };

  const map=new Map();
  mergeResponse(
    map,
    templateResponse(position,analysis,template,defenderCell)
  );
  for(const response of attachedResponses(
    afterDefender,template.uncovered
  ))mergeResponse(map,response);

  return {
    afterDefender,
    responses:[...map.values()].sort((a,b)=>a.cell-b.cell),
  };
}

export function certifyCpcxReservoirCoverageGapCapacityRcic(position,{
  attacker=position.mover^1,
  targetCell,
  maxNodes=4096,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  if(!Number.isInteger(maxNodes)||maxNodes<1)throw new RangeError('maxNodes');

  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.reservoir-gap-capacity-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:'UNSUPPORTED_GEOMETRY',
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootClass=analyzeGap(position,{attacker,targetCell});
  if(rootClass.kind==='BASE')return {
    schema:'connect4.cpcx.reservoir-gap-capacity-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootGap:0,
    nodeCount:0,
    edgeCount:0,
    base:rootClass.base,
    proofRule:'direct handoff to an already-qualified first-win certificate',
    recursive:false,
    gameTreeTraversal:false,
  };
  if(rootClass.kind!=='GAP')return {
    schema:'connect4.cpcx.reservoir-gap-capacity-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    seam:rootClass.seam??rootClass.kind,
    analysis:rootClass.analysis??null,
    recursive:false,
    gameTreeTraversal:false,
  };

  const nodes=new Map(),
    queue=[{
      key:stateKey(position,targetCell),
      position,
      gapClass:rootClass,
    }];

  function ensureNode(p,gapClass){
    const key=stateKey(p,targetCell);
    if(nodes.has(key))return key;
    if(nodes.size>=maxNodes)return null;
    nodes.set(key,{
      key,
      position:p,
      rank:p.rank,
      support:Array.from(p.heights),
      gap:gapClass.gap,
      descriptor:gapDescriptor(p,gapClass.analysis),
      analysis:gapClass.analysis,
      status:'DISCOVERED',
      triggers:[],
    });
    return key;
  }

  ensureNode(position,rootClass);

  for(let qi=0;qi<queue.length;qi++){
    const work=queue[qi],node=nodes.get(work.key);
    if(!node)continue;
    const analysis=node.analysis,
      templates=analysis.bestPartialTemplates??[];

    if(!templates.length){
      node.status='UNRESOLVED';
      node.seam='NO_PARTIAL_RESERVOIR_TEMPLATE';
      continue;
    }

    for(const defenderCell of frontier(work.position)){
      const trigger={
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        options:[],
        rejected:[],
      };

      const seen=new Set();
      for(let templateIndex=0;templateIndex<templates.length;templateIndex++){
        const template=templates[templateIndex],
          branch=responseOptions(
            work.position,analysis,template,defenderCell
          );

        if(branch.afterDefender.terminal){
          trigger.defenderTerminal=branch.afterDefender.terminal;
          continue;
        }

        for(const response of branch.responses){
          const sig=[
            response.cell,
            templateIndex,
            response.templateResponse?1:0,
            response.attachmentResponse?1:0,
          ].join('|');
          if(seen.has(sig))continue;
          seen.add(sig);

          const meta=cpcxCell(g,response.cell);
          if(
            branch.afterDefender.mover!==attacker||
            branch.afterDefender.heights[meta.column]!==meta.row||
            branch.afterDefender.owner[response.cell]!==-1
          )continue;

          const child=applyCpcxForcedEvent(
            branch.afterDefender,response.cell
          ),childClass=analyzeGap(child,{attacker,targetCell});

          if(childClass.kind==='BASE'){
            trigger.options.push({
              templateIndex,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              role:response.role,
              lineIds:response.lineIds??[],
              lineLabels:response.lineLabels??[],
              result:'BASE_FIRST_WIN',
              baseClass:childClass.base.kind,
              childGap:-1,
              childKey:null,
            });
            continue;
          }

          if(childClass.kind==='GAP'){
            const childDescriptor=gapDescriptor(child,childClass.analysis);
            if(!descriptorStrictlyDecreases(node.descriptor,childDescriptor)){
              trigger.rejected.push({
                templateIndex,
                responseCell:response.cell,
                responseLabel:labelCell(g,response.cell),
                role:response.role,
                lineIds:response.lineIds??[],
                lineLabels:response.lineLabels??[],
                childClass:childClass.kind,
                childGap:childClass.gap,
                childDescriptor,
                seam:'COVERAGE_RANK_NOT_DECREASING',
              });
              continue;
            }
            const childKey=ensureNode(child,childClass);
            if(childKey===null)continue;
            trigger.options.push({
              templateIndex,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              role:response.role,
              lineIds:response.lineIds??[],
              lineLabels:response.lineLabels??[],
              result:'LOWER_COVERAGE_GAP',
              baseClass:null,
              childGap:childClass.gap,
              childDescriptor,
              childKey,
            });
            if(!queue.some(x=>x.key===childKey))
              queue.push({key:childKey,position:child,gapClass:childClass});
            continue;
          }

          trigger.rejected.push({
            templateIndex,
            responseCell:response.cell,
            responseLabel:labelCell(g,response.cell),
            role:response.role,
            lineIds:response.lineIds??[],
            lineLabels:response.lineLabels??[],
            childClass:childClass.kind,
            childGap:childClass.gap??null,
            childDescriptor:childClass.kind==='GAP'
              ?gapDescriptor(child,childClass.analysis)
              :null,
            seam:childClass.seam??null,
          });
        }
      }

      trigger.options.sort((a,b)=>
        (a.result==='BASE_FIRST_WIN'?0:1)-
          (b.result==='BASE_FIRST_WIN'?0:1)||
        a.childGap-b.childGap||
        a.responseCell-b.responseCell||
        a.templateIndex-b.templateIndex
      );
      node.triggers.push(trigger);
    }

    node.status='EXPANDED';
  }

  // Solve the finite structural proof DAG from lower gap to higher gap.
  const ordered=[...nodes.values()].sort((a,b)=>
    compareDescriptorRank(a.descriptor,b.descriptor)||
    b.rank-a.rank||
    a.key.localeCompare(b.key)
  );

  for(const node of ordered){
    if(node.status!=='EXPANDED')continue;
    let ok=true;
    for(const trigger of node.triggers){
      if(trigger.defenderTerminal?.player===defender){
        ok=false;
        trigger.selected=null;
        continue;
      }
      const selected=trigger.options.find(option=>
        option.result==='BASE_FIRST_WIN'||
        (
          option.result==='LOWER_COVERAGE_GAP'&&
          nodes.get(option.childKey)?.status==='CERTIFIED'
        )
      )??null;
      trigger.selected=selected;
      if(!selected)ok=false;
    }
    node.status=ok?'CERTIFIED':'UNRESOLVED';
    if(!ok)node.seam='COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE';
  }

  const rootKey=stateKey(position,targetCell),root=nodes.get(rootKey),
    certified=root?.status==='CERTIFIED',
    unresolvedNodes=[...nodes.values()]
      .filter(x=>x.status==='UNRESOLVED')
      .map(node=>({
        key:node.key,
        rank:node.rank,
        gap:node.gap,
        support:node.support,
        descriptor:node.descriptor,
        seam:node.seam??null,
        unresolvedTriggers:(node.triggers??[])
          .filter(trigger=>!trigger.selected)
          .map(trigger=>({
            defenderCell:trigger.defenderCell,
            defenderLabel:trigger.defenderLabel,
            defenderTerminal:trigger.defenderTerminal??null,
            optionCount:trigger.options.length,
            options:trigger.options,
            rejectedCount:trigger.rejected?.length??0,
            rejected:trigger.rejected??[],
          })),
      }))
      .sort((a,b)=>a.gap-b.gap||a.rank-b.rank||a.key.localeCompare(b.key));
  if(!certified)return {
    schema:'connect4.cpcx.reservoir-gap-capacity-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootGap:rootClass.gap,
    seam:root?.seam??'RESERVOIR_GAP_RCIC_UNRESOLVED',
    nodeCount:nodes.size,
    certifiedNodeCount:[...nodes.values()]
      .filter(x=>x.status==='CERTIFIED').length,
    unresolvedRootTriggers:(root?.triggers??[])
      .filter(x=>!x.selected)
      .map(x=>({
        defenderCell:x.defenderCell,
        defenderLabel:x.defenderLabel,
        defenderTerminal:x.defenderTerminal??null,
        optionCount:x.options.length,
        options:x.options,
      })),
    unresolvedNodeCount:unresolvedNodes.length,
    unresolvedNodes,
    recursive:false,
    gameTreeTraversal:false,
  };

  const certifiedNodes=[...nodes.values()]
    .filter(x=>x.status==='CERTIFIED')
    .map(node=>({
      key:node.key,
      rank:node.rank,
      gap:node.gap,
      support:node.support,
      triggers:node.triggers.map(trigger=>({
        defenderCell:trigger.defenderCell,
        defenderLabel:trigger.defenderLabel,
        selected:trigger.selected,
      })),
    }))
    .sort((a,b)=>a.gap-b.gap||a.rank-b.rank||a.key.localeCompare(b.key));

  return {
    schema:'connect4.cpcx.reservoir-gap-capacity-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootGap:rootClass.gap,
    nodeCount:nodes.size,
    certifiedNodeCount:certifiedNodes.length,
    edgeCount:certifiedNodes.reduce((n,node)=>n+node.triggers.length,0),
    measures:[...new Set(certifiedNodes.map(x=>x.gap))].sort((a,b)=>a-b),
    nodes:certifiedNodes,
    rcic:{
      obligations:[
        'preserve the active P0 singleton target',
        'discharge every currently uncovered live P1 residual before it can terminally complete',
      ],
      resources:[
        'one best partial truncated target-reservoir template selected after the observed P1 trigger',
        'that template\'s prescribed current P0 mate',
        'current frontier cells attached to that template\'s uncovered P1 residuals',
        'exact handoff to existing CPCX or ordinary target-reservoir first-win certificate',
      ],
      rank:'lexicographic(minimumUncoveredResiduals, uncoveredMissingCellMass, uncoveredSupportDebtSum, uncoveredSupportDebtMax, descendingSupportDebtVector, remainingCapacity)',
      strictDecrease:true,
      responseTotality:true,
      triggerAdaptiveTemplates:true,
      allowedNonterminalExit:'STRICTLY_LOWER_COVERAGE_GAP_ONLY',
      allowedTerminalExit:'P0_FIRST_WIN_ONLY',
    },
    proofRule:'ranked coverage repair with finite-capacity tiebreak: after every current P1 trigger choose only the existing partial target-reservoir or uncovered-residual attachment response; every nonterminal re-entry preserves the target and strictly decreases the frozen obstruction descriptor, using remaining physical capacity only after the reservoir obstruction coordinates tie, until a qualified base is reached',
    theoremProvenance:[
      'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
      'CPC_TRIGGER_ADAPTIVE_RENEWAL_THEOREM.md',
      'CPC_FRONTIER_RESIDUAL_ATTACHMENT_RESPONSE_THEOREM.md',
      'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
    ],
    standardBoardOnly:true,
    proofClassCandidate:true,
    rankRefinement:'LEXICOGRAPHIC_COVERAGE_OBSTRUCTION_V0_2',
    promotedToRuntime:false,
    solvedData:false,
    oracle:false,
    openingBook:false,
    priorBestMoveLabels:false,
    lossDelayAssumed:false,
    recursive:false,
    gameTreeTraversal:false,
  };
}


// Experimental successor to the gap-count candidate above.
//
// The gap-count rank is known to be incomplete on the move6 controls. This
// candidate keeps the same narrowly licensed response set but uses the finite
// truncated-reservoir size itself as the well-founded rank. A child may
// re-enter with the same coverage-gap count; it may not re-enter with a
// nondecreasing totalRelevantEvents value.
//
// This is intentionally a separate export so the earlier failed/partial rank
// remains preserved as negative evidence.
function analyzeAttachmentReservoirClass(position,{attacker,targetCell}){
  if(position.terminal)return position.terminal.player===attacker?{
    kind:'BASE',
    exact:true,
    base:{kind:'ATTACKER_TERMINAL',exact:true,player:attacker},
    analysis:null,
    reservoirRank:-1,
  }:{
    kind:'OPPONENT_FIRST_WIN',
    exact:false,
    player:position.terminal.player,
    seam:'OPPONENT_TERMINAL',
  };

  const existing=runCpcxFirstWinCertificate(position,{attacker});
  if(existing.kind==='CERTIFIED_FIRST_WIN'){
    if(existing.player===attacker)return {
      kind:'BASE',
      exact:true,
      base:{
        kind:'EXISTING_CPCX_FIRST_WIN',
        exact:true,
        player:attacker,
        certificate:existing,
      },
      analysis:null,
      reservoirRank:-1,
    };
    return {
      kind:'OPPONENT_FIRST_WIN',
      exact:false,
      player:existing.player,
      seam:'EXISTING_CPCX_OPPONENT_FIRST_WIN',
      certificate:existing,
    };
  }

  const ordinary=certifyCpcxTruncatedTargetReservoir(
    position,{attacker,targetCell}
  );
  if(ordinary.kind==='CERTIFIED_FIRST_WIN')return {
    kind:'BASE',
    exact:true,
    base:{
      kind:'ORDINARY_TARGET_RESERVOIR',
      exact:true,
      player:attacker,
      certificate:ordinary,
    },
    analysis:null,
    reservoirRank:0,
  };

  if(position.mover!==(attacker^1))return {
    kind:'NO_CLASS',
    exact:false,
    seam:'ATTACHMENT_RESERVOIR_REQUIRES_DEFENDER_TO_MOVE',
  };

  const analysis=analyzeCpcxTruncatedTargetReservoirCoverage(
    position,{attacker,targetCell}
  );
  if(analysis.kind!=='TRUNCATED_TARGET_STATIC_COVERAGE_GAP')return {
    kind:'NO_CLASS',
    exact:false,
    seam:analysis.kind,
    analysis,
  };

  const reservoirRank=analysis.totalRelevantEvents;
  if(!Number.isInteger(reservoirRank)||reservoirRank<1)return {
    kind:'NO_CLASS',
    exact:false,
    seam:'INVALID_RELEVANT_EVENT_RANK',
    analysis,
  };

  return {
    kind:'GAP',
    exact:true,
    gap:analysis.minimumUncoveredResiduals,
    reservoirRank,
    analysis,
  };
}

export function certifyCpcxReservoirAttachmentRcic(position,{
  attacker=position.mover^1,
  targetCell,
  maxNodes=8192,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  if(!Number.isInteger(maxNodes)||maxNodes<1)throw new RangeError('maxNodes');

  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.reservoir-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:'UNSUPPORTED_GEOMETRY',
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootClass=analyzeAttachmentReservoirClass(
    position,{attacker,targetCell}
  );
  if(rootClass.kind==='BASE')return {
    schema:'connect4.cpcx.reservoir-attachment-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootReservoirRank:0,
    nodeCount:0,
    base:rootClass.base,
    promotedToRuntime:false,
    proofClassCandidate:true,
    recursive:false,
    gameTreeTraversal:false,
  };
  if(rootClass.kind!=='GAP')return {
    schema:'connect4.cpcx.reservoir-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    seam:rootClass.seam??rootClass.kind,
    opponentPlayer:rootClass.player??null,
    recursive:false,
    gameTreeTraversal:false,
  };

  const nodes=new Map(),queue=[];
  function ensureNode(p,cls){
    const key=stateKey(p,targetCell);
    if(nodes.has(key))return key;
    if(nodes.size>=maxNodes)return null;
    const node={
      key,
      position:p,
      rank:p.rank,
      support:Array.from(p.heights),
      gap:cls.gap,
      reservoirRank:cls.reservoirRank,
      descriptor:{
        ...gapDescriptor(p,cls.analysis),
        totalRelevantEvents:cls.reservoirRank,
      },
      analysis:cls.analysis,
      status:'DISCOVERED',
      triggers:[],
    };
    nodes.set(key,node);
    queue.push({key,position:p,cls});
    return key;
  }

  const rootKey=ensureNode(position,rootClass);
  if(rootKey===null)throw new Error('root node bound');

  for(let qi=0;qi<queue.length;qi++){
    const work=queue[qi],node=nodes.get(work.key),
      templates=node.analysis.bestPartialTemplates??[];

    if(!templates.length){
      node.status='UNRESOLVED';
      node.seam='NO_PARTIAL_RESERVOIR_TEMPLATE';
      continue;
    }

    for(const defenderCell of frontier(work.position)){
      const trigger={
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        defenderTerminal:null,
        options:[],
        rejected:[],
      },seen=new Set();

      for(let templateIndex=0;templateIndex<templates.length;templateIndex++){
        const template=templates[templateIndex],
          branch=responseOptions(
            work.position,node.analysis,template,defenderCell
          );

        if(branch.afterDefender.terminal){
          trigger.defenderTerminal=branch.afterDefender.terminal;
          continue;
        }

        for(const response of branch.responses){
          const sig=[
            response.cell,
            templateIndex,
            response.templateResponse?1:0,
            response.attachmentResponse?1:0,
          ].join('|');
          if(seen.has(sig))continue;
          seen.add(sig);

          const meta=cpcxCell(g,response.cell);
          if(
            branch.afterDefender.mover!==attacker||
            branch.afterDefender.heights[meta.column]!==meta.row||
            branch.afterDefender.owner[response.cell]!==-1
          )continue;

          const child=applyCpcxForcedEvent(
            branch.afterDefender,response.cell
          ),childClass=analyzeAttachmentReservoirClass(
            child,{attacker,targetCell}
          );

          if(childClass.kind==='BASE'){
            trigger.options.push({
              templateIndex,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              role:response.role,
              lineIds:response.lineIds??[],
              lineLabels:response.lineLabels??[],
              result:'BASE_FIRST_WIN',
              baseClass:childClass.base.kind,
              childGap:-1,
              childReservoirRank:-1,
              childKey:null,
            });
            continue;
          }

          if(
            childClass.kind==='GAP'&&
            childClass.reservoirRank<node.reservoirRank
          ){
            const childKey=ensureNode(child,childClass);
            if(childKey===null)continue;
            trigger.options.push({
              templateIndex,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              role:response.role,
              lineIds:response.lineIds??[],
              lineLabels:response.lineLabels??[],
              result:'LOWER_RELEVANT_EVENT_RANK',
              baseClass:null,
              childGap:childClass.gap,
              childReservoirRank:childClass.reservoirRank,
              childKey,
            });
            continue;
          }

          trigger.rejected.push({
            templateIndex,
            responseCell:response.cell,
            responseLabel:labelCell(g,response.cell),
            role:response.role,
            lineIds:response.lineIds??[],
            lineLabels:response.lineLabels??[],
            childClass:childClass.kind,
            childGap:childClass.gap??null,
            childReservoirRank:childClass.reservoirRank??null,
            seam:childClass.seam??null,
            opponentPlayer:childClass.player??null,
          });
        }
      }

      trigger.options.sort((a,b)=>
        (a.result==='BASE_FIRST_WIN'?0:1)-
          (b.result==='BASE_FIRST_WIN'?0:1)||
        a.childReservoirRank-b.childReservoirRank||
        a.childGap-b.childGap||
        a.responseCell-b.responseCell||
        a.templateIndex-b.templateIndex
      );
      node.triggers.push(trigger);
    }
    node.status='EXPANDED';
  }

  // Every nonterminal edge points to a strictly smaller integer reservoirRank,
  // so this ordering is a topological proof-class order.
  const ordered=[...nodes.values()].sort((a,b)=>
    a.reservoirRank-b.reservoirRank||
    a.gap-b.gap||
    b.rank-a.rank||
    a.key.localeCompare(b.key)
  );

  for(const node of ordered){
    if(node.status!=='EXPANDED')continue;
    let ok=node.triggers.length>0;
    for(const trigger of node.triggers){
      if(trigger.defenderTerminal?.player===defender){
        trigger.selected=null;
        ok=false;
        continue;
      }

      const selected=trigger.options.find(option=>
        option.result==='BASE_FIRST_WIN'||(
          option.result==='LOWER_RELEVANT_EVENT_RANK'&&
          nodes.get(option.childKey)?.status==='CERTIFIED'
        )
      )??null;
      trigger.selected=selected;
      if(!selected)ok=false;
    }
    node.status=ok?'CERTIFIED':'UNRESOLVED';
    if(!ok)node.seam='ATTACHMENT_RESERVOIR_RESPONSE_TOTALITY_FAILURE';
  }

  const root=nodes.get(rootKey),certified=root?.status==='CERTIFIED',
    unresolvedNodes=[...nodes.values()]
      .filter(x=>x.status==='UNRESOLVED')
      .map(node=>({
        key:node.key,
        rank:node.rank,
        gap:node.gap,
        reservoirRank:node.reservoirRank,
        support:node.support,
        seam:node.seam??null,
        unresolvedTriggers:node.triggers
          .filter(x=>!x.selected)
          .map(trigger=>({
            defenderCell:trigger.defenderCell,
            defenderLabel:trigger.defenderLabel,
            defenderTerminal:trigger.defenderTerminal,
            optionCount:trigger.options.length,
            options:trigger.options,
            rejectedCount:trigger.rejected.length,
            rejected:trigger.rejected,
          })),
      }))
      .sort((a,b)=>
        a.reservoirRank-b.reservoirRank||
        a.gap-b.gap||
        a.rank-b.rank||
        a.key.localeCompare(b.key)
      );

  if(!certified)return {
    schema:'connect4.cpcx.reservoir-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootGap:rootClass.gap,
    rootReservoirRank:rootClass.reservoirRank,
    seam:root?.seam??'RESERVOIR_ATTACHMENT_RCIC_UNRESOLVED',
    nodeCount:nodes.size,
    certifiedNodeCount:[...nodes.values()]
      .filter(x=>x.status==='CERTIFIED').length,
    unresolvedNodeCount:unresolvedNodes.length,
    unresolvedNodes,
    promotedToRuntime:false,
    proofClassCandidate:true,
    recursive:false,
    gameTreeTraversal:false,
  };

  const certifiedNodes=[...nodes.values()]
    .filter(x=>x.status==='CERTIFIED')
    .map(node=>({
      key:node.key,
      rank:node.rank,
      gap:node.gap,
      reservoirRank:node.reservoirRank,
      support:node.support,
      triggers:node.triggers.map(trigger=>({
        defenderCell:trigger.defenderCell,
        defenderLabel:trigger.defenderLabel,
        selected:trigger.selected,
      })),
    }))
    .sort((a,b)=>
      a.reservoirRank-b.reservoirRank||
      a.gap-b.gap||
      a.rank-b.rank||
      a.key.localeCompare(b.key)
    );

  return {
    schema:'connect4.cpcx.reservoir-attachment-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootGap:rootClass.gap,
    rootReservoirRank:rootClass.reservoirRank,
    nodeCount:nodes.size,
    certifiedNodeCount:certifiedNodes.length,
    edgeCount:certifiedNodes.reduce((n,node)=>n+node.triggers.length,0),
    reservoirRanks:[...new Set(
      certifiedNodes.map(x=>x.reservoirRank)
    )].sort((a,b)=>a-b),
    nodes:certifiedNodes,
    rcic:{
      obligations:[
        'preserve the active P0 singleton target',
        'prevent any P1 first win before the target or an exact P0 handoff',
        'discharge uncovered live P1 residuals through exact current attachment when the partial pairing template alone does not cover them',
      ],
      resources:[
        'one best partial truncated target-reservoir template selected after the observed P1 trigger',
        'that template\'s prescribed current P0 mate',
        'current frontier cells attached to that template\'s uncovered P1 residuals',
        'exact handoff to existing CPCX or qualified ordinary target-reservoir first-win certificate',
      ],
      rank:'totalRelevantEvents',
      strictDecrease:true,
      responseTotality:true,
      triggerAdaptiveTemplates:true,
      firstWinPrecedence:true,
      allowedNonterminalExit:'SAME_TARGET_COVERAGE_GAP_WITH_STRICTLY_SMALLER_TOTAL_RELEVANT_EVENTS',
      allowedTerminalExit:'P0_FIRST_WIN_ONLY',
    },
    proofRule:'ranked target-reservoir attachment invariant: after every P1 trigger choose a response licensed by a partial pairing template or exact uncovered-residual frontier attachment; every nonterminal re-entry preserves the active P0 target and consumes a strict portion of the finite truncated reservoir; states with any certified P1 first win are rejected',
    theoremProvenance:[
      'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
      'CPC_TRIGGER_ADAPTIVE_RENEWAL_THEOREM.md',
      'CPC_FRONTIER_RESIDUAL_ATTACHMENT_RESPONSE_THEOREM.md',
      'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
    ],
    standardBoardOnly:true,
    proofClassCandidate:true,
    promotedToRuntime:false,
    solvedData:false,
    oracle:false,
    openingBook:false,
    priorBestMoveLabels:false,
    lossDelayAssumed:false,
    recursive:false,
    gameTreeTraversal:false,
  };
}


// Experimental target-adaptive successor to the fixed-target attachment RCIC.
//
// The response vocabulary is unchanged. Target switching occurs only *after*
// one already-licensed exact P0 response. The exact child may reconstruct a
// different current nonplayable P0 singleton target only when:
// - that target already enters an exact first-win base, or
// - its truncated-reservoir attachment class has strictly smaller
//   totalRelevantEvents than the parent node.
//
// This makes target identity a renewable RCIC resource while preserving a
// strict integer rank. It is a theorem candidate only and is not runtime
// authority.
function latentAttackerTargets(position,attacker){
  const cells=new Set();
  for(const o of scanCpcxObligations(position)){
    if(
      o.player===attacker&&
      o.missingCount===1&&
      o.events[0].supportDistance>0
    )cells.add(o.missingCells[0]);
  }
  return [...cells].sort((a,b)=>a-b);
}

function adaptiveAttachmentReentries(position,{
  attacker,
  preferredTargetCell,
  parentReservoirRank,
}){
  const targets=[
    preferredTargetCell,
    ...latentAttackerTargets(position,attacker)
      .filter(x=>x!==preferredTargetCell),
  ];
  const out=[];
  for(const targetCell of targets){
    const cls=analyzeAttachmentReservoirClass(
      position,{attacker,targetCell}
    );
    if(cls.kind==='BASE'){
      out.push({
        kind:'BASE',
        exact:true,
        targetCell,
        targetSwitch:targetCell!==preferredTargetCell,
        base:cls.base,
        reservoirRank:-1,
        gap:-1,
        analysis:null,
      });
      continue;
    }
    if(
      cls.kind==='GAP'&&
      Number.isInteger(cls.reservoirRank)&&
      cls.reservoirRank<parentReservoirRank
    )out.push({
      kind:'GAP',
      exact:true,
      targetCell,
      targetSwitch:targetCell!==preferredTargetCell,
      base:null,
      reservoirRank:cls.reservoirRank,
      gap:cls.gap,
      analysis:cls.analysis,
    });
  }
  out.sort((a,b)=>
    (a.kind==='BASE'?0:1)-(b.kind==='BASE'?0:1)||
    a.reservoirRank-b.reservoirRank||
    (a.targetSwitch?1:0)-(b.targetSwitch?1:0)||
    a.targetCell-b.targetCell
  );
  return out;
}

export function certifyCpcxTargetAdaptiveReservoirAttachmentRcic(position,{
  attacker=position.mover^1,
  targetCell,
  maxNodes=8192,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  if(!Number.isInteger(maxNodes)||maxNodes<1)throw new RangeError('maxNodes');

  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.target-adaptive-reservoir-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:'UNSUPPORTED_GEOMETRY',
    proofClassCandidate:true,
    promotedToRuntime:false,
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootClass=analyzeAttachmentReservoirClass(
    position,{attacker,targetCell}
  );
  if(rootClass.kind==='BASE')return {
    schema:'connect4.cpcx.target-adaptive-reservoir-attachment-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    rootTargetCell:targetCell,
    rootTargetLabel:labelCell(g,targetCell),
    rootReservoirRank:0,
    nodeCount:0,
    base:rootClass.base,
    targetSwitchCount:0,
    proofClassCandidate:true,
    promotedToRuntime:false,
    recursive:false,
    gameTreeTraversal:false,
  };
  if(rootClass.kind!=='GAP')return {
    schema:'connect4.cpcx.target-adaptive-reservoir-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    rootTargetCell:targetCell,
    rootTargetLabel:labelCell(g,targetCell),
    seam:rootClass.seam??rootClass.kind,
    opponentPlayer:rootClass.player??null,
    proofClassCandidate:true,
    promotedToRuntime:false,
    recursive:false,
    gameTreeTraversal:false,
  };

  const nodes=new Map(),queue=[];
  function ensureNode(p,cls,nodeTargetCell){
    const key=stateKey(p,nodeTargetCell);
    if(nodes.has(key))return key;
    if(nodes.size>=maxNodes)return null;
    const node={
      key,
      position:p,
      targetCell:nodeTargetCell,
      targetLabel:labelCell(g,nodeTargetCell),
      rank:p.rank,
      support:Array.from(p.heights),
      gap:cls.gap,
      reservoirRank:cls.reservoirRank,
      descriptor:{
        ...gapDescriptor(p,cls.analysis),
        totalRelevantEvents:cls.reservoirRank,
      },
      analysis:cls.analysis,
      status:'DISCOVERED',
      triggers:[],
    };
    nodes.set(key,node);
    queue.push({key,position:p,targetCell:nodeTargetCell,cls});
    return key;
  }

  const rootKey=ensureNode(position,rootClass,targetCell);
  if(rootKey===null)throw new Error('root node bound');

  for(let qi=0;qi<queue.length;qi++){
    const work=queue[qi],node=nodes.get(work.key),
      templates=node.analysis.bestPartialTemplates??[];

    if(!templates.length){
      node.status='UNRESOLVED';
      node.seam='NO_PARTIAL_RESERVOIR_TEMPLATE';
      continue;
    }

    for(const defenderCell of frontier(work.position)){
      const trigger={
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        defenderTerminal:null,
        options:[],
        rejected:[],
      },seen=new Set();

      for(let templateIndex=0;templateIndex<templates.length;templateIndex++){
        const template=templates[templateIndex],
          branch=responseOptions(
            work.position,node.analysis,template,defenderCell
          );

        if(branch.afterDefender.terminal){
          trigger.defenderTerminal=branch.afterDefender.terminal;
          continue;
        }

        for(const response of branch.responses){
          const sig=[
            response.cell,
            templateIndex,
            response.templateResponse?1:0,
            response.attachmentResponse?1:0,
          ].join('|');
          if(seen.has(sig))continue;
          seen.add(sig);

          const meta=cpcxCell(g,response.cell);
          if(
            branch.afterDefender.mover!==attacker||
            branch.afterDefender.heights[meta.column]!==meta.row||
            branch.afterDefender.owner[response.cell]!==-1
          )continue;

          const child=applyCpcxForcedEvent(
              branch.afterDefender,response.cell
            ),
            reentries=adaptiveAttachmentReentries(child,{
              attacker,
              preferredTargetCell:node.targetCell,
              parentReservoirRank:node.reservoirRank,
            });

          if(!reentries.length){
            trigger.rejected.push({
              templateIndex,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              role:response.role,
              lineIds:response.lineIds??[],
              lineLabels:response.lineLabels??[],
              seam:'NO_DECREASING_TARGET_ADAPTIVE_HANDOFF',
              availableLatentTargets:
                latentAttackerTargets(child,attacker).map(cell=>({
                  cell,
                  label:labelCell(g,cell),
                })),
            });
            continue;
          }

          for(const reentry of reentries){
            if(reentry.kind==='BASE'){
              trigger.options.push({
                templateIndex,
                responseCell:response.cell,
                responseLabel:labelCell(g,response.cell),
                role:response.role,
                lineIds:response.lineIds??[],
                lineLabels:response.lineLabels??[],
                result:'BASE_FIRST_WIN',
                baseClass:reentry.base.kind,
                parentTargetCell:node.targetCell,
                parentTargetLabel:node.targetLabel,
                childTargetCell:reentry.targetCell,
                childTargetLabel:labelCell(g,reentry.targetCell),
                targetSwitch:reentry.targetSwitch,
                childGap:-1,
                childReservoirRank:-1,
                childKey:null,
              });
              continue;
            }

            const childKey=ensureNode(
              child,reentry,reentry.targetCell
            );
            if(childKey===null)continue;
            trigger.options.push({
              templateIndex,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              role:response.role,
              lineIds:response.lineIds??[],
              lineLabels:response.lineLabels??[],
              result:'LOWER_RELEVANT_EVENT_RANK',
              baseClass:null,
              parentTargetCell:node.targetCell,
              parentTargetLabel:node.targetLabel,
              childTargetCell:reentry.targetCell,
              childTargetLabel:labelCell(g,reentry.targetCell),
              targetSwitch:reentry.targetSwitch,
              childGap:reentry.gap,
              childReservoirRank:reentry.reservoirRank,
              childKey,
            });
          }
        }
      }

      trigger.options.sort((a,b)=>
        (a.result==='BASE_FIRST_WIN'?0:1)-
          (b.result==='BASE_FIRST_WIN'?0:1)||
        a.childReservoirRank-b.childReservoirRank||
        (a.targetSwitch?1:0)-(b.targetSwitch?1:0)||
        a.childGap-b.childGap||
        a.responseCell-b.responseCell||
        a.templateIndex-b.templateIndex
      );
      node.triggers.push(trigger);
    }
    node.status='EXPANDED';
  }

  const ordered=[...nodes.values()].sort((a,b)=>
    a.reservoirRank-b.reservoirRank||
    a.gap-b.gap||
    b.rank-a.rank||
    a.key.localeCompare(b.key)
  );

  for(const node of ordered){
    if(node.status!=='EXPANDED')continue;
    let ok=node.triggers.length>0;
    for(const trigger of node.triggers){
      if(trigger.defenderTerminal?.player===defender){
        trigger.selected=null;
        ok=false;
        continue;
      }
      const selected=trigger.options.find(option=>
        option.result==='BASE_FIRST_WIN'||(
          option.result==='LOWER_RELEVANT_EVENT_RANK'&&
          nodes.get(option.childKey)?.status==='CERTIFIED'
        )
      )??null;
      trigger.selected=selected;
      if(!selected)ok=false;
    }
    node.status=ok?'CERTIFIED':'UNRESOLVED';
    if(!ok)
      node.seam='TARGET_ADAPTIVE_ATTACHMENT_RESPONSE_TOTALITY_FAILURE';
  }

  const root=nodes.get(rootKey),certified=root?.status==='CERTIFIED',
    unresolvedNodes=[...nodes.values()]
      .filter(x=>x.status==='UNRESOLVED')
      .map(node=>({
        key:node.key,
        rank:node.rank,
        targetCell:node.targetCell,
        targetLabel:node.targetLabel,
        gap:node.gap,
        reservoirRank:node.reservoirRank,
        support:node.support,
        seam:node.seam??null,
        unresolvedTriggers:node.triggers
          .filter(x=>!x.selected)
          .map(trigger=>({
            defenderCell:trigger.defenderCell,
            defenderLabel:trigger.defenderLabel,
            defenderTerminal:trigger.defenderTerminal,
            optionCount:trigger.options.length,
            options:trigger.options,
            rejectedCount:trigger.rejected.length,
            rejected:trigger.rejected,
          })),
      }))
      .sort((a,b)=>
        a.reservoirRank-b.reservoirRank||
        a.gap-b.gap||
        a.rank-b.rank||
        a.key.localeCompare(b.key)
      );

  if(!certified)return {
    schema:'connect4.cpcx.target-adaptive-reservoir-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    rootTargetCell:targetCell,
    rootTargetLabel:labelCell(g,targetCell),
    rootGap:rootClass.gap,
    rootReservoirRank:rootClass.reservoirRank,
    seam:root?.seam??'TARGET_ADAPTIVE_RESERVOIR_ATTACHMENT_UNRESOLVED',
    nodeCount:nodes.size,
    certifiedNodeCount:[...nodes.values()]
      .filter(x=>x.status==='CERTIFIED').length,
    unresolvedNodeCount:unresolvedNodes.length,
    unresolvedNodes,
    proofClassCandidate:true,
    promotedToRuntime:false,
    recursive:false,
    gameTreeTraversal:false,
  };

  const certifiedNodes=[...nodes.values()]
    .filter(x=>x.status==='CERTIFIED')
    .map(node=>({
      key:node.key,
      rank:node.rank,
      targetCell:node.targetCell,
      targetLabel:node.targetLabel,
      gap:node.gap,
      reservoirRank:node.reservoirRank,
      support:node.support,
      triggers:node.triggers.map(trigger=>({
        defenderCell:trigger.defenderCell,
        defenderLabel:trigger.defenderLabel,
        selected:trigger.selected,
      })),
    }))
    .sort((a,b)=>
      a.reservoirRank-b.reservoirRank||
      a.gap-b.gap||
      a.rank-b.rank||
      a.key.localeCompare(b.key)
    );
  const selectedEdges=certifiedNodes.flatMap(node=>
    node.triggers.map(x=>x.selected).filter(Boolean)
  );

  return {
    schema:'connect4.cpcx.target-adaptive-reservoir-attachment-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    rootTargetCell:targetCell,
    rootTargetLabel:labelCell(g,targetCell),
    rootGap:rootClass.gap,
    rootReservoirRank:rootClass.reservoirRank,
    nodeCount:nodes.size,
    certifiedNodeCount:certifiedNodes.length,
    edgeCount:selectedEdges.length,
    targetSwitchCount:selectedEdges.filter(x=>x.targetSwitch).length,
    targetCells:[...new Set(
      certifiedNodes.map(x=>x.targetCell)
    )].sort((a,b)=>a-b),
    targetLabels:[...new Set(
      certifiedNodes.map(x=>x.targetLabel)
    )].sort(),
    reservoirRanks:[...new Set(
      certifiedNodes.map(x=>x.reservoirRank)
    )].sort((a,b)=>a-b),
    nodes:certifiedNodes,
    rcic:{
      obligations:[
        'maintain at least one mechanically reconstructed nonplayable P0 singleton target',
        'prevent any P1 first win before an exact P0 terminal/base handoff',
        'discharge uncovered live P1 residuals through template or exact current attachment responses',
      ],
      resources:[
        'trigger-adaptive partial target-reservoir template',
        'template-prescribed current P0 response',
        'current frontier attachment to uncovered P1 residuals',
        'exact target reconstruction after the realized response',
      ],
      rank:'totalRelevantEvents of the active target reservoir',
      strictDecrease:true,
      targetRenewal:true,
      responseTotality:true,
      firstWinPrecedence:true,
      allowedNonterminalExit:
        'ANY_RECONSTRUCTED_P0_SINGLETON_TARGET_WITH_STRICTLY_SMALLER_TOTAL_RELEVANT_EVENTS',
      allowedTerminalExit:'P0_FIRST_WIN_ONLY',
    },
    proofRule:'target-adaptive ranked attachment invariant: P0 responses remain restricted to qualified partial-reservoir/template or uncovered-residual attachment edges; after the exact response the active latent P0 singleton target may be reconstructed, but every nonterminal target handoff must strictly reduce the finite truncated-reservoir event rank',
    theoremProvenance:[
      'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
      'CPC_TRIGGER_ADAPTIVE_RENEWAL_THEOREM.md',
      'CPC_FRONTIER_RESIDUAL_ATTACHMENT_RESPONSE_THEOREM.md',
      'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
    ],
    standardBoardOnly:true,
    proofClassCandidate:true,
    promotedToRuntime:false,
    solvedData:false,
    oracle:false,
    openingBook:false,
    priorBestMoveLabels:false,
    lossDelayAssumed:false,
    recursive:false,
    gameTreeTraversal:false,
  };
}

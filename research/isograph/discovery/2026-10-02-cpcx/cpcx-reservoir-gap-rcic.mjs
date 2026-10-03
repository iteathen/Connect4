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

export function certifyCpcxReservoirCoverageGapRcic(position,{
  attacker=position.mover^1,
  targetCell,
  maxNodes=4096,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  if(!Number.isInteger(maxNodes)||maxNodes<1)throw new RangeError('maxNodes');

  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.reservoir-gap-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:'UNSUPPORTED_GEOMETRY',
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootClass=analyzeGap(position,{attacker,targetCell});
  if(rootClass.kind==='BASE')return {
    schema:'connect4.cpcx.reservoir-gap-rcic.v0_1',
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
    schema:'connect4.cpcx.reservoir-gap-rcic.v0_1',
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

          if(
            childClass.kind==='GAP'&&
            childClass.gap<node.gap
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
              result:'LOWER_COVERAGE_GAP',
              baseClass:null,
              childGap:childClass.gap,
              childKey,
            });
            if(!queue.some(x=>x.key===childKey))
              queue.push({key:childKey,position:child,gapClass:childClass});
          }
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
    a.gap-b.gap||
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
    certified=root?.status==='CERTIFIED';
  if(!certified)return {
    schema:'connect4.cpcx.reservoir-gap-rcic.v0_1',
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
    schema:'connect4.cpcx.reservoir-gap-rcic.v0_1',
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
      rank:'minimumUncoveredResiduals',
      strictDecrease:true,
      responseTotality:true,
      triggerAdaptiveTemplates:true,
      allowedNonterminalExit:'STRICTLY_LOWER_COVERAGE_GAP_ONLY',
      allowedTerminalExit:'P0_FIRST_WIN_ONLY',
    },
    proofRule:'ranked coverage repair: after every current P1 trigger choose a response licensed by a partial target-reservoir template or exact uncovered-residual frontier attachment; every nonterminal re-entry must preserve the target and strictly decrease the exact minimum uncovered-residual count until the qualified ordinary target-reservoir base is reached',
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

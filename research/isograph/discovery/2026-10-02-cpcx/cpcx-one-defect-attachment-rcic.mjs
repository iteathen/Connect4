// CPCX odd-reservoir / one-defect attachment RCIC candidate.
//
// Purpose:
// Extend the failed full-coverage one-defect candidate with the exact
// frontier-residual attachment response already used by the even-reservoir
// coverage-gap candidate.
//
// This is a structural proof-class candidate only. It is NOT runtime authority.
//
// State class:
// - standard 7x6 Connect Four;
// - defender to move;
// - one active nonplayable attacker singleton target;
// - odd truncated target reservoir;
// - one-defect static coverage OR one-defect static coverage gap.
//
// Admitted responses after an observed defender trigger:
// 1. the current mate prescribed by one synthesized one-defect template;
// 2. a current frontier cell attached to one residual that this template leaves
//    uncovered;
// 3. at the unique unmatched defect handoff, one current attacker setup whose
//    exact child enters a qualified base or a strictly smaller odd-reservoir
//    state;
// 4. current defender moves outside an exact CPC2 blocker set are already
//    discharged by the CPC2 first-win theorem.
//
// Every nonterminal re-entry preserves the same target and strictly decreases
// totalRelevantEvents. Hence the proof graph is well founded. No W/D/L oracle,
// opening book, minimax, negamax, alpha-beta, or unrestricted reply recursion
// is used.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {deriveCpcxDisjunctiveBlockObligation} from './cpcx-cpc2.mjs';
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
  if(existing.kind==='CERTIFIED_FIRST_WIN'){
    if(existing.player===attacker)return {
      kind:'EXISTING_CPCX_FIRST_WIN',
      exact:true,
      player:attacker,
      certificate:existing,
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

function analyzeOddClass(position,{attacker,targetCell}){
  const base=baseHandoff(position,{attacker,targetCell});
  if(base.exact)return {
    kind:'BASE',
    exact:true,
    base,
    reservoirRank:-1,
    gap:-1,
    analysis:null,
  };
  if(base.kind==='OPPONENT_FIRST_WIN')return {
    kind:'OPPONENT_FIRST_WIN',
    exact:false,
    player:base.player,
    seam:base.seam,
    base,
  };

  if(position.mover!==(attacker^1))return {
    kind:'NO_CLASS',
    exact:false,
    seam:'ODD_ATTACHMENT_REQUIRES_DEFENDER_TO_MOVE',
  };

  const analysis=analyzeCpcxOneDefectTargetReservoir(
    position,{attacker,targetCell}
  );
  if(
    analysis.kind!=='ONE_DEFECT_STATIC_COVERAGE'&&
    analysis.kind!=='ONE_DEFECT_STATIC_COVERAGE_GAP'
  )return {
    kind:'NO_CLASS',
    exact:false,
    seam:analysis.kind,
    analysis,
  };

  const reservoirRank=analysis.totalRelevantEvents,
    gap=analysis.minimumUncoveredResiduals??0;
  if(
    !Number.isInteger(reservoirRank)||
    reservoirRank<1||
    (reservoirRank&1)!==1||
    !Number.isInteger(gap)||
    gap<0
  )return {
    kind:'NO_CLASS',
    exact:false,
    seam:'INVALID_ODD_RESERVOIR_CLASS',
    analysis,
  };

  return {
    kind:'ODD',
    exact:true,
    reservoirRank,
    gap,
    analysis,
  };
}

function templateRows(analysis){
  if(analysis.kind==='ONE_DEFECT_STATIC_COVERAGE'){
    const rows=analysis.fullCoverageTemplates?.length
      ?analysis.fullCoverageTemplates
      :analysis.selectedFullCoverageTemplate
        ?[analysis.selectedFullCoverageTemplate]
        :[];
    return rows.map((template,index)=>({
      template,
      templateIndex:index,
      source:'FULL_ONE_DEFECT_TEMPLATE',
    }));
  }
  return (analysis.bestPartialTemplates??[]).map((template,index)=>({
    template,
    templateIndex:index,
    source:'PARTIAL_ONE_DEFECT_TEMPLATE',
  }));
}

function templateResponse(position,analysis,template,defenderCell){
  const g=position.geometry,{column,row}=cpcxCell(g,defenderCell);
  if(row!==position.heights[column]||position.owner[defenderCell]!==-1)
    return null;

  const depth=row-position.heights[column],
    partner=template.partner[column],
    prefixLength=template.prefixLength[column];

  if(partner>=0&&depth<prefixLength){
    const responseRow=position.heights[partner]+depth,
      responseCell=responseRow*g.columns+partner;
    return {
      cell:responseCell,
      role:'ONE_DEFECT_CROSS_RESPONSE',
      defectHandoff:false,
      templateResponse:true,
      attachmentResponse:false,
    };
  }

  if(depth+1<(analysis.capacity?.[column]??0))return {
    cell:defenderCell+g.columns,
    role:'ONE_DEFECT_VERTICAL_RESPONSE',
    defectHandoff:false,
    templateResponse:true,
    attachmentResponse:false,
  };

  if(defenderCell===template.defect?.cell)return {
    cell:null,
    role:'ONE_DEFECT_HANDOFF',
    defectHandoff:true,
    templateResponse:false,
    attachmentResponse:false,
  };

  return null;
}

function attachedResponses(position,uncovered){
  const ids=new Set((uncovered??[]).map(x=>x.lineId)),
    currentFrontier=new Set(frontier(position)),
    out=new Map();

  if(!ids.size)return [];
  for(const o of scanCpcxObligations(position)){
    if(o.player!==1||!ids.has(o.lineId))continue;
    for(const cell of o.missingCells){
      if(!currentFrontier.has(cell))continue;
      if(!out.has(cell))out.set(cell,{
        cell,
        role:'UNCOVERED_RESIDUAL_ATTACHMENT',
        defectHandoff:false,
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
  if(!row||!Number.isInteger(row.cell))return;
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

function directLowerOrBase(position,{
  attacker,
  targetCell,
  parentReservoirRank,
}){
  const base=baseHandoff(position,{attacker,targetCell});
  if(base.exact)return [{
    kind:'BASE',
    exact:true,
    base,
    position,
    reservoirRank:-1,
    gap:-1,
    analysis:null,
    normalizationSteps:[],
  }];

  const cls=analyzeOddClass(position,{attacker,targetCell});
  if(
    cls.kind==='ODD'&&
    cls.reservoirRank<parentReservoirRank
  )return [{
    ...cls,
    position,
    normalizationSteps:[],
  }];

  return [];
}

function reentryOptions(position,{
  attacker,
  targetCell,
  parentReservoirRank,
}){
  const direct=directLowerOrBase(position,{
    attacker,targetCell,parentReservoirRank,
  });
  if(direct.length)return direct;

  const normalized=closeCpcxForcedResponses(position);
  if(normalized.kind==='CERTIFIED_FIRST_WIN'){
    if(normalized.player!==attacker)return [];
    return [{
      kind:'BASE',
      exact:true,
      base:{
        kind:'FORCED_NORMALIZATION_FIRST_WIN',
        exact:true,
        player:attacker,
        closure:normalized,
      },
      position:normalized.position,
      reservoirRank:-1,
      gap:-1,
      analysis:null,
      normalizationSteps:normalized.steps,
    }];
  }
  if(normalized.kind==='TERMINAL'){
    if(normalized.position.terminal?.player!==attacker)return [];
    return [{
      kind:'BASE',
      exact:true,
      base:{
        kind:'FORCED_NORMALIZATION_TERMINAL',
        exact:true,
        player:attacker,
        closure:normalized,
      },
      position:normalized.position,
      reservoirRank:-1,
      gap:-1,
      analysis:null,
      normalizationSteps:normalized.steps,
    }];
  }
  if(normalized.kind!=='OPEN')return [];

  const current=normalized.position,
    stable=directLowerOrBase(current,{
      attacker,targetCell,parentReservoirRank,
    });
  if(stable.length)return stable.map(x=>({
    ...x,
    normalizationSteps:normalized.steps,
  }));

  // If deterministic normalization hands the turn to the attacker, one current
  // setup lift is permitted. This is controller choice at the current rank,
  // not adversary reply traversal.
  if(current.mover===attacker){
    const out=[];
    for(const setupCell of frontier(current)){
      const child=applyCpcxForcedEvent(current,setupCell);
      if(child.terminal){
        if(child.terminal.player===attacker)out.push({
          kind:'BASE',
          exact:true,
          base:{
            kind:'ATTACKER_TERMINAL',
            exact:true,
            player:attacker,
          },
          position:child,
          reservoirRank:-1,
          gap:-1,
          analysis:null,
          normalizationSteps:normalized.steps,
          setupAfterNormalization:{
            setupCell,
            setupLabel:labelCell(current.geometry,setupCell),
          },
        });
        continue;
      }
      for(const option of directLowerOrBase(child,{
        attacker,targetCell,parentReservoirRank,
      }))out.push({
        ...option,
        normalizationSteps:normalized.steps,
        setupAfterNormalization:{
          setupCell,
          setupLabel:labelCell(current.geometry,setupCell),
        },
      });
    }
    out.sort((a,b)=>
      (a.kind==='BASE'?0:1)-(b.kind==='BASE'?0:1)||
      a.reservoirRank-b.reservoirRank||
      (a.setupAfterNormalization?.setupCell??-1)-
        (b.setupAfterNormalization?.setupCell??-1)
    );
    return out;
  }

  return [];
}

function defectSetupOptions(position,{
  attacker,
  targetCell,
  parentReservoirRank,
}){
  if(position.mover!==attacker)return [];
  const out=[];
  for(const setupCell of frontier(position)){
    const child=applyCpcxForcedEvent(position,setupCell);
    if(child.terminal){
      if(child.terminal.player===attacker)out.push({
        kind:'BASE',
        exact:true,
        base:{kind:'ATTACKER_TERMINAL',exact:true,player:attacker},
        position:child,
        reservoirRank:-1,
        gap:-1,
        analysis:null,
        normalizationSteps:[],
        defectSetup:{
          setupCell,
          setupLabel:labelCell(position.geometry,setupCell),
        },
      });
      continue;
    }

    for(const option of reentryOptions(child,{
      attacker,targetCell,parentReservoirRank,
    }))out.push({
      ...option,
      defectSetup:{
        setupCell,
        setupLabel:labelCell(position.geometry,setupCell),
      },
    });
  }
  out.sort((a,b)=>
    (a.kind==='BASE'?0:1)-(b.kind==='BASE'?0:1)||
    a.reservoirRank-b.reservoirRank||
    (a.defectSetup?.setupCell??-1)-(b.defectSetup?.setupCell??-1)
  );
  return out;
}

export function certifyCpcxOneDefectAttachmentRcic(position,{
  attacker=position.mover^1,
  targetCell,
  maxNodes=8192,
  useCpc2Restriction=true,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  if(!Number.isInteger(maxNodes)||maxNodes<1)throw new RangeError('maxNodes');

  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.one-defect-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:'UNSUPPORTED_GEOMETRY',
    proofClassCandidate:true,
    promotedToRuntime:false,
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootClass=analyzeOddClass(position,{attacker,targetCell});
  if(rootClass.kind==='BASE')return {
    schema:'connect4.cpcx.one-defect-attachment-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootGap:0,
    rootReservoirRank:0,
    nodeCount:0,
    base:rootClass.base,
    proofClassCandidate:true,
    promotedToRuntime:false,
    recursive:false,
    gameTreeTraversal:false,
  };
  if(rootClass.kind!=='ODD')return {
    schema:'connect4.cpcx.one-defect-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    seam:rootClass.seam??rootClass.kind,
    opponentPlayer:rootClass.player??null,
    proofClassCandidate:true,
    promotedToRuntime:false,
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
      templates=templateRows(node.analysis);

    if(!templates.length){
      node.status='UNRESOLVED';
      node.seam='NO_ONE_DEFECT_TEMPLATE_ROWS';
      continue;
    }

    const cpc2=useCpc2Restriction
      ?deriveCpcxDisjunctiveBlockObligation(work.position,{attacker})
      :null,
      blockerSet=cpc2?.kind==='DISJUNCTIVE_BLOCK_OBLIGATION'
        ?new Set(cpc2.blockingCells)
        :null;

    for(const defenderCell of frontier(work.position)){
      const trigger={
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        cpc2OutsideBlocker:
          blockerSet!==null&&!blockerSet.has(defenderCell),
        defenderTerminal:null,
        options:[],
        rejected:[],
      };

      if(trigger.cpc2OutsideBlocker){
        trigger.options.push({
          result:'CPC2_OUTSIDE_BLOCKER_FIRST_WIN',
          baseClass:'CPC2_TRIGGER_OVERLOAD',
          templateIndex:null,
          responseCell:null,
          responseLabel:null,
          childReservoirRank:-1,
          childGap:-1,
          childKey:null,
        });
        node.triggers.push(trigger);
        continue;
      }

      const afterDefender=applyCpcxForcedEvent(
        work.position,defenderCell
      );
      if(afterDefender.terminal){
        trigger.defenderTerminal=afterDefender.terminal;
        node.triggers.push(trigger);
        continue;
      }

      const seen=new Set();
      for(const row of templates){
        const {template,templateIndex,source}=row,
          policy=templateResponse(
            work.position,node.analysis,template,defenderCell
          );

        if(policy?.defectHandoff){
          const options=defectSetupOptions(afterDefender,{
            attacker,
            targetCell,
            parentReservoirRank:node.reservoirRank,
          });
          for(const option of options){
            const sig=[
              'DEFECT',
              templateIndex,
              option.defectSetup?.setupCell??-1,
              option.kind,
              option.reservoirRank,
            ].join('|');
            if(seen.has(sig))continue;
            seen.add(sig);
            if(option.kind==='BASE'){
              trigger.options.push({
                result:'BASE_FIRST_WIN',
                baseClass:option.base.kind,
                templateIndex,
                templateSource:source,
                policyKind:'ONE_DEFECT_HANDOFF',
                responseCell:option.defectSetup?.setupCell??null,
                responseLabel:option.defectSetup?.setupLabel??null,
                normalizationStepCount:
                  option.normalizationSteps?.length??0,
                setupAfterNormalization:
                  option.setupAfterNormalization??null,
                childReservoirRank:-1,
                childGap:-1,
                childKey:null,
              });
              continue;
            }
            const childKey=ensureNode(option.position,option);
            if(childKey===null)continue;
            trigger.options.push({
              result:'LOWER_ODD_RESERVOIR',
              baseClass:null,
              templateIndex,
              templateSource:source,
              policyKind:'ONE_DEFECT_HANDOFF',
              responseCell:option.defectSetup?.setupCell??null,
              responseLabel:option.defectSetup?.setupLabel??null,
              normalizationStepCount:
                option.normalizationSteps?.length??0,
              setupAfterNormalization:
                option.setupAfterNormalization??null,
              childReservoirRank:option.reservoirRank,
              childGap:option.gap,
              childKey,
            });
          }
          if(!options.length)trigger.rejected.push({
            templateIndex,
            templateSource:source,
            policyKind:'ONE_DEFECT_HANDOFF',
            seam:'NO_DECREASING_DEFECT_SETUP',
            defectCell:template.defect?.cell??null,
            defectLabel:template.defect?.cellLabel??null,
          });
          continue;
        }

        const responseMap=new Map();
        mergeResponse(responseMap,policy);
        for(const response of attachedResponses(
          afterDefender,template.uncovered??[]
        ))mergeResponse(responseMap,response);

        for(const response of responseMap.values()){
          const sig=[
            templateIndex,
            response.cell,
            response.templateResponse?1:0,
            response.attachmentResponse?1:0,
          ].join('|');
          if(seen.has(sig))continue;
          seen.add(sig);

          const meta=cpcxCell(g,response.cell);
          if(
            afterDefender.mover!==attacker||
            afterDefender.heights[meta.column]!==meta.row||
            afterDefender.owner[response.cell]!==-1
          ){
            trigger.rejected.push({
              templateIndex,
              templateSource:source,
              policyKind:response.role,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              seam:'ODD_ATTACHMENT_RESPONSE_ILLEGAL',
            });
            continue;
          }

          const child=applyCpcxForcedEvent(
              afterDefender,response.cell
            ),
            options=reentryOptions(child,{
              attacker,
              targetCell,
              parentReservoirRank:node.reservoirRank,
            });

          if(!options.length){
            trigger.rejected.push({
              templateIndex,
              templateSource:source,
              policyKind:response.role,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              seam:'NO_DECREASING_ODD_REENTRY',
            });
            continue;
          }

          for(const option of options){
            if(option.kind==='BASE'){
              trigger.options.push({
                result:'BASE_FIRST_WIN',
                baseClass:option.base.kind,
                templateIndex,
                templateSource:source,
                policyKind:response.role,
                responseCell:response.cell,
                responseLabel:labelCell(g,response.cell),
                lineIds:response.lineIds??[],
                lineLabels:response.lineLabels??[],
                normalizationStepCount:
                  option.normalizationSteps?.length??0,
                setupAfterNormalization:
                  option.setupAfterNormalization??null,
                childReservoirRank:-1,
                childGap:-1,
                childKey:null,
              });
              continue;
            }

            const childKey=ensureNode(option.position,option);
            if(childKey===null)continue;
            trigger.options.push({
              result:'LOWER_ODD_RESERVOIR',
              baseClass:null,
              templateIndex,
              templateSource:source,
              policyKind:response.role,
              responseCell:response.cell,
              responseLabel:labelCell(g,response.cell),
              lineIds:response.lineIds??[],
              lineLabels:response.lineLabels??[],
              normalizationStepCount:
                option.normalizationSteps?.length??0,
              setupAfterNormalization:
                option.setupAfterNormalization??null,
              childReservoirRank:option.reservoirRank,
              childGap:option.gap,
              childKey,
            });
          }
        }
      }

      trigger.options.sort((a,b)=>
        (a.result==='CPC2_OUTSIDE_BLOCKER_FIRST_WIN'?0:
          a.result==='BASE_FIRST_WIN'?1:2)-
        (b.result==='CPC2_OUTSIDE_BLOCKER_FIRST_WIN'?0:
          b.result==='BASE_FIRST_WIN'?1:2)||
        a.childReservoirRank-b.childReservoirRank||
        a.childGap-b.childGap||
        (a.responseCell??-1)-(b.responseCell??-1)||
        (a.templateIndex??-1)-(b.templateIndex??-1)
      );
      node.triggers.push(trigger);
    }
    node.status='EXPANDED';
  }

  // Every admitted nonterminal edge has a strictly smaller positive odd
  // integer reservoir rank, so this ordering is a proof-class topological
  // order rather than a game-value recursion.
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
        option.result==='CPC2_OUTSIDE_BLOCKER_FIRST_WIN'||
        option.result==='BASE_FIRST_WIN'||(
          option.result==='LOWER_ODD_RESERVOIR'&&
          nodes.get(option.childKey)?.status==='CERTIFIED'
        )
      )??null;
      trigger.selected=selected;
      if(!selected)ok=false;
    }
    node.status=ok?'CERTIFIED':'UNRESOLVED';
    if(!ok)node.seam='ONE_DEFECT_ATTACHMENT_RESPONSE_TOTALITY_FAILURE';
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
            cpc2OutsideBlocker:trigger.cpc2OutsideBlocker,
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
    schema:'connect4.cpcx.one-defect-attachment-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootGap:rootClass.gap,
    rootReservoirRank:rootClass.reservoirRank,
    seam:root?.seam??'ONE_DEFECT_ATTACHMENT_RCIC_UNRESOLVED',
    nodeCount:nodes.size,
    certifiedNodeCount:[...nodes.values()]
      .filter(x=>x.status==='CERTIFIED').length,
    unresolvedNodeCount:unresolvedNodes.length,
    unresolvedNodes,
    cpc2RestrictionTransport:useCpc2Restriction,
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
    schema:'connect4.cpcx.one-defect-attachment-rcic.v0_1',
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
    edgeCount:certifiedNodes.reduce(
      (n,node)=>n+node.triggers.length,0
    ),
    reservoirRanks:[...new Set(
      certifiedNodes.map(x=>x.reservoirRank)
    )].sort((a,b)=>a-b),
    nodes:certifiedNodes,
    rcic:{
      obligations:[
        'preserve the active nonplayable P0 singleton target',
        'prevent any P1 first win before target/base handoff',
        'discharge uncovered P1 residuals through exact frontier attachment',
        'transport the single unmatched odd-reservoir event through a proved defect handoff',
      ],
      resources:[
        'trigger-adaptive one-defect full or best-partial reservoir template',
        'template-prescribed cross/vertical response',
        'current frontier attachment to a template-uncovered P1 residual',
        'one current P0 setup at the unmatched defect handoff',
        'CPC2 exact blocker restriction when available',
        'exact handoff to existing CPCX or ordinary even-reservoir first-win certificate',
      ],
      rank:'totalRelevantEvents',
      strictDecrease:true,
      responseTotality:true,
      oneDefectTransport:true,
      firstWinPrecedence:true,
      allowedNonterminalExit:
        'SAME_TARGET_ODD_RESERVOIR_CLASS_WITH_STRICTLY_SMALLER_TOTAL_RELEVANT_EVENTS',
      allowedTerminalExit:'P0_FIRST_WIN_ONLY',
    },
    proofRule:'odd-reservoir ranked attachment invariant: after each observed P1 trigger, P0 may use only a synthesized one-defect template response, a current frontier blocker attached to an uncovered P1 residual, or one current setup at the unmatched defect handoff; every nonterminal child preserves the target and strictly reduces the finite odd reservoir rank',
    theoremProvenance:[
      'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
      'CPC_TRIGGER_ADAPTIVE_RENEWAL_THEOREM.md',
      'CPC_FRONTIER_RESIDUAL_ATTACHMENT_RESPONSE_THEOREM.md',
      'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
      'forward CPC2 disjunctive blocker theorem',
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

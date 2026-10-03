// CPCX one-defect target-reservoir RCIC.
//
// Standard-7x6 research-side instantiation of the generic ranked controlled-
// invariant theorem.  This is not W/D/L search and does not use solved data.
//
// A node is a defender-to-move state with:
// - one active nonplayable attacker singleton target;
// - an exact one-defect full-coverage target-reservoir template;
// - rank mu = total relevant truncated-reservoir events (odd).
//
// For each current defender trigger, exactly one template-prescribed paired
// response is admitted.  If the trigger is the unmatched defect event, one
// current attacker setup may be selected only when its exact child:
// - is an attacker terminal;
// - has an existing CPCX first-win certificate;
// - has an ordinary truncated target-reservoir certificate; or
// - re-enters this one-defect class with strictly smaller mu.
//
// The proof graph is built with an explicit worklist.  There is no recursive
// legal-move value traversal, no unrestricted value search, and no oracle premise.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent,closeCpcxForcedResponses} from './cpcx-closure.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

function unique(values){return [...new Set(values)].sort((a,b)=>a-b);}

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

function positionKey(position,targetCell){
  return [
    position.mover,
    targetCell,
    Array.from(position.heights).join(','),
    Array.from(position.owner).join(','),
  ].join('|');
}

function targetStillActive(position,attacker,targetCell){
  return scanCpcxObligations(position).some(o=>
    o.player===attacker&&
    o.missingCount===1&&
    o.missingCells[0]===targetCell&&
    o.events[0].supportDistance>0
  );
}

function templateResponse(position,analysis,template,defenderCell){
  const g=position.geometry,{column,row}=cpcxCell(g,defenderCell);
  if(row!==position.heights[column]||position.owner[defenderCell]!==-1)
    return {kind:'INVALID_DEFENDER_TRIGGER',exact:false};

  const depth=row-position.heights[column],
    partner=template.partner[column],
    prefixLength=template.prefixLength[column];

  if(partner>=0&&depth<prefixLength){
    const responseRow=position.heights[partner]+depth,
      responseCell=responseRow*g.columns+partner;
    return {
      kind:'SYNCHRONIZED_CROSS_RESPONSE',
      exact:true,
      responseCell,
      responseLabel:labelCell(g,responseCell),
    };
  }

  if(depth+1<analysis.capacity[column]){
    const responseCell=defenderCell+g.columns;
    return {
      kind:'VERTICAL_RESPONSE',
      exact:true,
      responseCell,
      responseLabel:labelCell(g,responseCell),
    };
  }

  if(defenderCell!==template.defect.cell)return {
    kind:'DEFECT_IDENTITY_MISMATCH',
    exact:false,
    expectedDefectCell:template.defect.cell,
    actualCell:defenderCell,
  };

  return {
    kind:'DEFECT_HANDOFF',
    exact:true,
    responseCell:null,
  };
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

  const ordinary=certifyCpcxTruncatedTargetReservoir(
    position,{attacker,targetCell}
  );
  if(ordinary.kind==='CERTIFIED_FIRST_WIN')return {
    kind:'ORDINARY_TARGET_RESERVOIR',
    exact:true,
    player:attacker,
    certificate:ordinary,
  };

  const existing=runCpcxFirstWinCertificate(position,{attacker});
  if(existing.kind==='CERTIFIED_FIRST_WIN'&&existing.player===attacker)return {
    kind:'EXISTING_CPCX_FIRST_WIN',
    exact:true,
    player:attacker,
    certificate:existing,
  };

  return {
    kind:'NO_BASE_HANDOFF',
    exact:false,
    ordinarySeam:ordinary.seam??ordinary.kind,
    existingSeam:existing.seam??existing.kind,
  };
}

function classifyReentry(position,{
  attacker,
  targetCell,
  parentMeasure,
}){
  const directBase=baseHandoff(position,{attacker,targetCell});
  if(directBase.exact)return {
    kind:'BASE',
    exact:true,
    handoff:directBase,
    position,
    normalizationSteps:[],
  };

  const normalized=closeCpcxForcedResponses(position);
  if(normalized.kind==='CERTIFIED_FIRST_WIN')return normalized.player===attacker?{
    kind:'BASE',
    exact:true,
    handoff:{
      kind:'FORCED_NORMALIZATION_FIRST_WIN',
      exact:true,
      player:attacker,
      closure:normalized,
    },
    position:normalized.position,
    normalizationSteps:normalized.steps,
  }:{
    kind:'NO_REENTRY',
    exact:false,
    seam:'OPPONENT_FIRST_WIN_DURING_ONE_DEFECT_NORMALIZATION',
    player:normalized.player,
    normalizationSteps:normalized.steps,
  };
  if(normalized.kind==='TERMINAL'){
    const player=normalized.position.terminal?.player;
    return player===attacker?{
      kind:'BASE',
      exact:true,
      handoff:{
        kind:'FORCED_NORMALIZATION_TERMINAL',
        exact:true,
        player:attacker,
        closure:normalized,
      },
      position:normalized.position,
      normalizationSteps:normalized.steps,
    }:{
      kind:'NO_REENTRY',
      exact:false,
      seam:'OPPONENT_TERMINAL_DURING_ONE_DEFECT_NORMALIZATION',
      player,
      normalizationSteps:normalized.steps,
    };
  }
  if(normalized.kind!=='OPEN')return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'UNSUPPORTED_ONE_DEFECT_NORMALIZATION_BOUNDARY',
    boundary:normalized.boundary,
    normalizationSteps:normalized.steps,
  };

  const current=normalized.position,
    base=baseHandoff(current,{attacker,targetCell});
  if(base.exact)return {
    kind:'BASE',
    exact:true,
    handoff:base,
    position:current,
    normalizationSteps:normalized.steps,
  };

  if(current.mover!==(attacker^1))return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'ONE_DEFECT_REENTRY_REQUIRES_DEFENDER_TO_MOVE',
    normalizationSteps:normalized.steps,
  };
  if(!targetStillActive(current,attacker,targetCell))return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'ONE_DEFECT_TARGET_NOT_PRESERVED',
    normalizationSteps:normalized.steps,
  };

  const analysis=analyzeCpcxOneDefectTargetReservoir(
    current,{attacker,targetCell}
  );
  if(analysis.kind!=='ONE_DEFECT_STATIC_COVERAGE')return {
    kind:'NO_REENTRY',
    exact:false,
    seam:analysis.kind,
    analysis,
    normalizationSteps:normalized.steps,
  };
  if(!Number.isInteger(analysis.totalRelevantEvents)||
     analysis.totalRelevantEvents>=parentMeasure)return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'ONE_DEFECT_MEASURE_NOT_DECREASING',
    parentMeasure,
    childMeasure:analysis.totalRelevantEvents??null,
    analysis,
    normalizationSteps:normalized.steps,
  };

  return {
    kind:'LOWER_ONE_DEFECT',
    exact:true,
    measure:analysis.totalRelevantEvents,
    analysis,
    position:current,
    normalizationSteps:normalized.steps,
  };
}

function defectRepair(position,{
  attacker,
  targetCell,
  parentMeasure,
}){
  if(position.mover!==attacker)return {
    kind:'NO_DEFECT_REPAIR',
    exact:false,
    seam:'DEFECT_HANDOFF_NOT_ATTACKER_TO_MOVE',
    candidates:[],
  };

  const candidates=[];
  for(const repairCell of frontier(position)){
    const child=applyCpcxForcedEvent(position,repairCell);
    if(child.terminal){
      if(child.terminal.player===attacker)candidates.push({
        repairCell,
        repairLabel:labelCell(position.geometry,repairCell),
        class:'ATTACKER_TERMINAL',
        priority:0,
        measure:-1,
        child:null,
        reentry:null,
      });
      continue;
    }

    const reentry=classifyReentry(child,{
      attacker,targetCell,parentMeasure,
    });
    if(!reentry.exact)continue;

    const priority=reentry.kind==='BASE'?1:2,
      measure=reentry.kind==='LOWER_ONE_DEFECT'
        ?reentry.measure
        :-1;
    candidates.push({
      repairCell,
      repairLabel:labelCell(position.geometry,repairCell),
      class:reentry.kind==='BASE'
        ?reentry.handoff.kind
        :'LOWER_ONE_DEFECT',
      priority,
      measure,
      child:reentry.kind==='LOWER_ONE_DEFECT'?reentry.position:null,
      reentry,
    });
  }

  candidates.sort((a,b)=>
    a.priority-b.priority||
    a.measure-b.measure||
    a.repairCell-b.repairCell
  );
  if(!candidates.length)return {
    kind:'NO_DEFECT_REPAIR',
    exact:false,
    seam:'NO_STRUCTURAL_DEFECT_REPAIR',
    candidates:[],
  };
  return {
    kind:'DEFECT_REPAIR',
    exact:true,
    selected:candidates[0],
    candidateCount:candidates.length,
    candidates:candidates.map(x=>({
      repairCell:x.repairCell,
      repairLabel:x.repairLabel,
      class:x.class,
      measure:x.measure,
    })),
  };
}

export function certifyCpcxOneDefectTargetReservoirRcic(position,{
  attacker=position.mover^1,
  targetCell,
  maxNodes=4096,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(!Number.isInteger(targetCell))throw new RangeError('targetCell');
  if(!Number.isInteger(maxNodes)||maxNodes<1)throw new RangeError('maxNodes');

  const g=position.geometry,defender=attacker^1;
  if(g.columns!==7||g.rows!==6||g.connect!==4)return {
    schema:'connect4.cpcx.one-defect-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    defender,
    seam:'UNSUPPORTED_GEOMETRY',
    recursive:false,
    gameTreeTraversal:false,
  };
  if(position.terminal||position.mover!==defender)return {
    schema:'connect4.cpcx.one-defect-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    defender,
    seam:position.terminal?'ALREADY_TERMINAL':'DEFENDER_NOT_TO_MOVE',
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootAnalysis=analyzeCpcxOneDefectTargetReservoir(
    position,{attacker,targetCell}
  );
  if(rootAnalysis.kind!=='ONE_DEFECT_STATIC_COVERAGE')return {
    schema:'connect4.cpcx.one-defect-rcic.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    defender,
    seam:rootAnalysis.kind,
    analysis:rootAnalysis,
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootKey=positionKey(position,targetCell),
    nodes=new Map(),
    queue=[{
      key:rootKey,
      position,
      analysis:rootAnalysis,
    }];
  nodes.set(rootKey,{
    key:rootKey,
    status:'PENDING',
    measure:rootAnalysis.totalRelevantEvents,
    rank:position.rank,
    support:Array.from(position.heights),
    edges:[],
  });

  for(let qi=0;qi<queue.length;qi++){
    if(nodes.size>maxNodes)return {
      schema:'connect4.cpcx.one-defect-rcic.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      attacker,
      defender,
      seam:'ONE_DEFECT_RCIC_NODE_BOUND',
      nodeCount:nodes.size,
      maxNodes,
      recursive:false,
      gameTreeTraversal:false,
    };

    const work=queue[qi],node=nodes.get(work.key),
      current=work.position,analysis=work.analysis,
      template=analysis.selectedFullCoverageTemplate;
    if(!template)return {
      schema:'connect4.cpcx.one-defect-rcic.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      attacker,
      defender,
      seam:'ONE_DEFECT_RCIC_TEMPLATE_MISSING',
      failedNode:work.key,
      recursive:false,
      gameTreeTraversal:false,
    };

    const currentFrontier=frontier(current);
    for(const defenderCell of currentFrontier){
      const afterDefender=applyCpcxForcedEvent(current,defenderCell);
      if(afterDefender.terminal)return {
        schema:'connect4.cpcx.one-defect-rcic.v0_1',
        kind:'NO_CERTIFICATE',
        exact:false,
        attacker,
        defender,
        seam:'DEFENDER_FIRST_WIN_INSIDE_ONE_DEFECT_RCIC',
        failedNode:work.key,
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        terminal:afterDefender.terminal,
        recursive:false,
        gameTreeTraversal:false,
      };

      const policy=templateResponse(
        current,analysis,template,defenderCell
      );
      if(!policy.exact)return {
        schema:'connect4.cpcx.one-defect-rcic.v0_1',
        kind:'NO_CERTIFICATE',
        exact:false,
        attacker,
        defender,
        seam:policy.kind,
        failedNode:work.key,
        defenderCell,
        policy,
        recursive:false,
        gameTreeTraversal:false,
      };

      if(policy.kind==='DEFECT_HANDOFF'){
        const repair=defectRepair(afterDefender,{
          attacker,
          targetCell,
          parentMeasure:analysis.totalRelevantEvents,
        });
        if(!repair.exact)return {
          schema:'connect4.cpcx.one-defect-rcic.v0_1',
          kind:'NO_CERTIFICATE',
          exact:false,
          attacker,
          defender,
          seam:repair.seam,
          failedNode:work.key,
          defenderCell,
          defenderLabel:labelCell(g,defenderCell),
          repair,
          recursive:false,
          gameTreeTraversal:false,
        };

        const selected=repair.selected;
        if(selected.class==='ATTACKER_TERMINAL'||selected.reentry?.kind==='BASE'){
          node.edges.push({
            defenderCell,
            defenderLabel:labelCell(g,defenderCell),
            policyKind:'DEFECT_HANDOFF',
            repairCell:selected.repairCell,
            repairLabel:selected.repairLabel,
            result:'BASE_FIRST_WIN',
            baseClass:selected.class,
          });
          continue;
        }

        const child=selected.child,
          childAnalysis=selected.reentry.analysis,
          childKey=positionKey(child,targetCell);
        node.edges.push({
          defenderCell,
          defenderLabel:labelCell(g,defenderCell),
          policyKind:'DEFECT_HANDOFF',
          repairCell:selected.repairCell,
          repairLabel:selected.repairLabel,
          result:'LOWER_ONE_DEFECT',
          childKey,
          childMeasure:childAnalysis.totalRelevantEvents,
        });
        if(!nodes.has(childKey)){
          nodes.set(childKey,{
            key:childKey,
            status:'PENDING',
            measure:childAnalysis.totalRelevantEvents,
            rank:child.rank,
            support:Array.from(child.heights),
            edges:[],
          });
          queue.push({key:childKey,position:child,analysis:childAnalysis});
        }
        continue;
      }

      const responseCell=policy.responseCell,
        responseMeta=cpcxCell(g,responseCell);
      if(afterDefender.mover!==attacker||
         responseMeta.row!==afterDefender.heights[responseMeta.column]||
         afterDefender.owner[responseCell]!==-1)return {
        schema:'connect4.cpcx.one-defect-rcic.v0_1',
        kind:'NO_CERTIFICATE',
        exact:false,
        attacker,
        defender,
        seam:'ONE_DEFECT_TEMPLATE_RESPONSE_ILLEGAL',
        failedNode:work.key,
        defenderCell,
        responseCell,
        policy,
        recursive:false,
        gameTreeTraversal:false,
      };

      const child=applyCpcxForcedEvent(afterDefender,responseCell);
      if(child.terminal){
        if(child.terminal.player!==attacker)return {
          schema:'connect4.cpcx.one-defect-rcic.v0_1',
          kind:'NO_CERTIFICATE',
          exact:false,
          attacker,
          defender,
          seam:'WRONG_TERMINAL_ON_TEMPLATE_RESPONSE',
          failedNode:work.key,
          defenderCell,
          responseCell,
          terminal:child.terminal,
          recursive:false,
          gameTreeTraversal:false,
        };
        node.edges.push({
          defenderCell,
          defenderLabel:labelCell(g,defenderCell),
          policyKind:policy.kind,
          responseCell,
          responseLabel:labelCell(g,responseCell),
          result:'ATTACKER_TERMINAL',
        });
        continue;
      }

      const reentry=classifyReentry(child,{
        attacker,
        targetCell,
        parentMeasure:analysis.totalRelevantEvents,
      });
      if(!reentry.exact)return {
        schema:'connect4.cpcx.one-defect-rcic.v0_1',
        kind:'NO_CERTIFICATE',
        exact:false,
        attacker,
        defender,
        seam:reentry.seam??'ONE_DEFECT_REENTRY_FAILED',
        failedNode:work.key,
        defenderCell,
        responseCell,
        reentry,
        recursive:false,
        gameTreeTraversal:false,
      };

      if(reentry.kind==='BASE'){
        node.edges.push({
          defenderCell,
          defenderLabel:labelCell(g,defenderCell),
          policyKind:policy.kind,
          responseCell,
          responseLabel:labelCell(g,responseCell),
          result:'BASE_FIRST_WIN',
          baseClass:reentry.handoff.kind,
        });
        continue;
      }

      const reentryPosition=reentry.position,
        childKey=positionKey(reentryPosition,targetCell);
      node.edges.push({
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        policyKind:policy.kind,
        responseCell,
        responseLabel:labelCell(g,responseCell),
        result:'LOWER_ONE_DEFECT',
        childKey,
        childMeasure:reentry.measure,
        normalizationStepCount:reentry.normalizationSteps.length,
      });
      if(!nodes.has(childKey)){
        nodes.set(childKey,{
          key:childKey,
          status:'PENDING',
          measure:reentry.measure,
          rank:reentryPosition.rank,
          support:Array.from(reentryPosition.heights),
          edges:[],
        });
        queue.push({
          key:childKey,
          position:reentryPosition,
          analysis:reentry.analysis,
        });
      }
    }

    if(node.edges.length!==currentFrontier.length)return {
      schema:'connect4.cpcx.one-defect-rcic.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      attacker,
      defender,
      seam:'ONE_DEFECT_RESPONSE_TOTALITY_FAILURE',
      failedNode:work.key,
      edgeCount:node.edges.length,
      frontierCount:currentFrontier.length,
      recursive:false,
      gameTreeTraversal:false,
    };
    node.status='VERIFIED';
  }

  const rows=[...nodes.values()];
  if(rows.some(x=>x.status!=='VERIFIED'))throw new Error('unverified RCIC node');
  for(const node of rows)for(const edge of node.edges){
    if(edge.result!=='LOWER_ONE_DEFECT')continue;
    const child=nodes.get(edge.childKey);
    if(!child||child.measure>=node.measure)throw new Error('RCIC rank violation');
  }

  return {
    schema:'connect4.cpcx.one-defect-rcic.v0_1',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,
    defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootMeasure:rootAnalysis.totalRelevantEvents,
    nodeCount:rows.length,
    edgeCount:rows.reduce((n,x)=>n+x.edges.length,0),
    maxPhysicalRank:Math.max(...rows.map(x=>x.rank)),
    measures:unique(rows.map(x=>x.measure)),
    nodes:rows,
    rcic:{
      obligations:[
        'preserve the active attacker singleton target',
        'prevent defender first win before target/qualified handoff',
      ],
      resources:[
        'one-defect full-coverage target-reservoir template',
        'template-prescribed cross/vertical response',
        'one current attacker setup at an unmatched defect handoff',
        'exact handoff to existing CPCX/ordinary reservoir certificate',
      ],
      rank:'totalRelevantEvents',
      strictDecrease:true,
      responseTotality:true,
      allowedNonterminalExit:'LOWER_ONE_DEFECT_ONLY',
      allowedTerminalExit:'ATTACKER_FIRST_WIN_ONLY',
    },
    proofRule:'ranked controlled invariant: every defender trigger has one exact structural response or one defect-handoff repair; every nonterminal re-entry preserves one-defect full coverage and strictly decreases the finite relevant-event reservoir',
    theoremProvenance:[
      'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
      'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
    ],
    standardBoardOnly:true,
    solvedData:false,
    oracle:false,
    openingBook:false,
    priorBestMoveLabels:false,
    lossDelayAssumed:false,
    ordinaryGameTreeSearch:false,
    structuralProofGraph:true,
    recursive:false,
    gameTreeTraversal:false,
  };
}

export function findCpcxPairSetupOneDefectRcicCertificates(position,{
  attacker=position.mover,
  maxNodes=4096,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  if(position.terminal||position.mover!==attacker)return [];

  const obligations=scanCpcxObligations(position),out=[];
  for(const o of obligations){
    if(o.player!==attacker||o.missingCount!==2)continue;
    const playable=o.events.filter(e=>e.supportDistance===0);
    if(playable.length!==1)continue;
    const setupCell=playable[0].cell,
      targetCell=o.missingCells.find(x=>x!==setupCell);
    if(!Number.isInteger(targetCell))continue;

    const child=applyCpcxForcedEvent(position,setupCell);
    if(child.terminal){
      if(child.terminal.player===attacker)out.push({
        schema:'connect4.cpcx.pair-setup-one-defect-rcic.v0_1',
        kind:'CERTIFIED_FIRST_WIN',
        exact:true,
        player:attacker,
        attacker,
        source:'TERMINAL_ON_PAIR_SETUP',
        obligationId:o.id,
        lineId:o.lineId,
        lineLabel:o.lineLabel,
        setupCell,
        setupLabel:labelCell(position.geometry,setupCell),
        targetCell,
        targetLabel:labelCell(position.geometry,targetCell),
        childCertificate:null,
        recursive:false,
        gameTreeTraversal:false,
      });
      continue;
    }

    const rcic=certifyCpcxOneDefectTargetReservoirRcic(child,{
      attacker,targetCell,maxNodes,
    });
    if(rcic.kind!=='CERTIFIED_FIRST_WIN')continue;
    out.push({
      schema:'connect4.cpcx.pair-setup-one-defect-rcic.v0_1',
      kind:'CERTIFIED_FIRST_WIN',
      exact:true,
      player:attacker,
      attacker,
      source:'PAIR_SETUP_TO_ONE_DEFECT_RCIC',
      obligationId:o.id,
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      setupCell,
      setupLabel:labelCell(position.geometry,setupCell),
      targetCell,
      targetLabel:labelCell(position.geometry,targetCell),
      childCertificate:rcic,
      recursive:false,
      gameTreeTraversal:false,
    });
  }

  return out.sort((a,b)=>
    a.setupCell-b.setupCell||
    a.targetCell-b.targetCell||
    a.lineId-b.lineId
  );
}

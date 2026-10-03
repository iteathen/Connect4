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

function stableDefenderReentry(position,{
  attacker,
  targetCell,
  parentMeasure,
  normalizationSteps=[],
}){
  if(position.mover!==(attacker^1))return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'ONE_DEFECT_REENTRY_REQUIRES_DEFENDER_TO_MOVE',
    normalizationSteps,
  };
  if(!targetStillActive(position,attacker,targetCell))return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'ONE_DEFECT_TARGET_NOT_PRESERVED',
    normalizationSteps,
  };

  const analysis=analyzeCpcxOneDefectTargetReservoir(
    position,{attacker,targetCell}
  );
  if(analysis.kind!=='ONE_DEFECT_STATIC_COVERAGE')return {
    kind:'NO_REENTRY',
    exact:false,
    seam:analysis.kind,
    analysis,
    normalizationSteps,
  };
  if(!Number.isInteger(analysis.totalRelevantEvents)||
     analysis.totalRelevantEvents>=parentMeasure)return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'ONE_DEFECT_MEASURE_NOT_DECREASING',
    parentMeasure,
    childMeasure:analysis.totalRelevantEvents??null,
    analysis,
    normalizationSteps,
  };

  return {
    kind:'LOWER_ONE_DEFECT',
    exact:true,
    measure:analysis.totalRelevantEvents,
    analysis,
    position,
    normalizationSteps,
  };
}

function attackerSetupAfterNormalization(position,{
  attacker,
  targetCell,
  parentMeasure,
  normalizationSteps,
}){
  if(position.mover!==attacker)return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'ONE_DEFECT_SETUP_REQUIRES_ATTACKER_TO_MOVE',
    normalizationSteps,
  };

  const candidates=[];
  for(const setupCell of frontier(position)){
    const child=applyCpcxForcedEvent(position,setupCell);
    if(child.terminal){
      if(child.terminal.player===attacker)candidates.push({
        setupCell,
        setupLabel:labelCell(position.geometry,setupCell),
        class:'ATTACKER_TERMINAL',
        priority:0,
        measure:-1,
        child:null,
        reentry:{
          kind:'BASE',
          exact:true,
          handoff:{
            kind:'ATTACKER_TERMINAL',
            exact:true,
            player:attacker,
          },
          position:child,
          normalizationSteps,
        },
      });
      continue;
    }

    const base=baseHandoff(child,{attacker,targetCell});
    if(base.exact){
      candidates.push({
        setupCell,
        setupLabel:labelCell(position.geometry,setupCell),
        class:base.kind,
        priority:1,
        measure:-1,
        child:null,
        reentry:{
          kind:'BASE',
          exact:true,
          handoff:base,
          position:child,
          normalizationSteps,
        },
      });
      continue;
    }

    const stable=stableDefenderReentry(child,{
      attacker,targetCell,parentMeasure,normalizationSteps,
    });
    if(!stable.exact)continue;
    candidates.push({
      setupCell,
      setupLabel:labelCell(position.geometry,setupCell),
      class:'LOWER_ONE_DEFECT',
      priority:2,
      measure:stable.measure,
      child:stable.position,
      reentry:stable,
    });
  }

  candidates.sort((a,b)=>
    a.priority-b.priority||
    a.measure-b.measure||
    a.setupCell-b.setupCell
  );
  if(!candidates.length)return {
    kind:'NO_REENTRY',
    exact:false,
    seam:'NO_ONE_DEFECT_SETUP_AFTER_NORMALIZATION',
    normalizationSteps,
  };

  const selected=candidates[0];
  return {
    ...selected.reentry,
    setupAfterNormalization:{
      setupCell:selected.setupCell,
      setupLabel:selected.setupLabel,
      class:selected.class,
      candidateCount:candidates.length,
      candidates:candidates.map(x=>({
        setupCell:x.setupCell,
        setupLabel:x.setupLabel,
        class:x.class,
        measure:x.measure,
      })),
    },
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

  if(current.mover===attacker)return attackerSetupAfterNormalization(current,{
    attacker,
    targetCell,
    parentMeasure,
    normalizationSteps:normalized.steps,
  });

  return stableDefenderReentry(current,{
    attacker,
    targetCell,
    parentMeasure,
    normalizationSteps:normalized.steps,
  });
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


function evaluateAdaptiveTemplateBranch(
  current,analysis,template,templateIndex,defenderCell,afterDefender,{
    attacker,
    targetCell,
  }
){
  const g=current.geometry,
    policy=templateResponse(current,analysis,template,defenderCell);
  if(!policy.exact)return {
    exact:false,
    seam:policy.kind,
    templateIndex,
    policy,
  };

  if(policy.kind==='DEFECT_HANDOFF'){
    const repair=defectRepair(afterDefender,{
      attacker,
      targetCell,
      parentMeasure:analysis.totalRelevantEvents,
    });
    if(!repair.exact)return {
      exact:false,
      seam:repair.seam,
      templateIndex,
      policy,
      repair,
    };
    const selected=repair.selected;
    if(selected.class==='ATTACKER_TERMINAL'||selected.reentry?.kind==='BASE')return {
      exact:true,
      result:'BASE_FIRST_WIN',
      edge:{
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        templateIndex,
        templateDefectCell:template.defect.cell,
        templateDefectLabel:template.defect.cellLabel,
        policyKind:'DEFECT_HANDOFF',
        repairCell:selected.repairCell,
        repairLabel:selected.repairLabel,
        result:'BASE_FIRST_WIN',
        baseClass:selected.class,
      },
      child:null,
      childAnalysis:null,
      measure:-1,
    };

    const child=selected.child,
      childAnalysis=selected.reentry.analysis;
    return {
      exact:true,
      result:'LOWER_ONE_DEFECT',
      edge:{
        defenderCell,
        defenderLabel:labelCell(g,defenderCell),
        templateIndex,
        templateDefectCell:template.defect.cell,
        templateDefectLabel:template.defect.cellLabel,
        policyKind:'DEFECT_HANDOFF',
        repairCell:selected.repairCell,
        repairLabel:selected.repairLabel,
        result:'LOWER_ONE_DEFECT',
        childMeasure:childAnalysis.totalRelevantEvents,
        normalizationStepCount:selected.reentry.normalizationSteps?.length??0,
        setupAfterNormalization:selected.reentry.setupAfterNormalization??null,
      },
      child,
      childAnalysis,
      measure:childAnalysis.totalRelevantEvents,
    };
  }

  const responseCell=policy.responseCell,
    responseMeta=cpcxCell(g,responseCell);
  if(afterDefender.mover!==attacker||
     responseMeta.row!==afterDefender.heights[responseMeta.column]||
     afterDefender.owner[responseCell]!==-1)return {
    exact:false,
    seam:'ONE_DEFECT_TEMPLATE_RESPONSE_ILLEGAL',
    templateIndex,
    policy,
    responseCell,
  };

  const child=applyCpcxForcedEvent(afterDefender,responseCell);
  if(child.terminal)return child.terminal.player===attacker?{
    exact:true,
    result:'ATTACKER_TERMINAL',
    edge:{
      defenderCell,
      defenderLabel:labelCell(g,defenderCell),
      templateIndex,
      templateDefectCell:template.defect.cell,
      templateDefectLabel:template.defect.cellLabel,
      policyKind:policy.kind,
      responseCell,
      responseLabel:labelCell(g,responseCell),
      result:'ATTACKER_TERMINAL',
    },
    child:null,
    childAnalysis:null,
    measure:-1,
  }:{
    exact:false,
    seam:'WRONG_TERMINAL_ON_TEMPLATE_RESPONSE',
    templateIndex,
    policy,
    terminal:child.terminal,
  };

  const reentry=classifyReentry(child,{
    attacker,
    targetCell,
    parentMeasure:analysis.totalRelevantEvents,
  });
  if(!reentry.exact)return {
    exact:false,
    seam:reentry.seam??'ONE_DEFECT_REENTRY_FAILED',
    templateIndex,
    policy,
    responseCell,
    reentry,
  };

  if(reentry.kind==='BASE')return {
    exact:true,
    result:'BASE_FIRST_WIN',
    edge:{
      defenderCell,
      defenderLabel:labelCell(g,defenderCell),
      templateIndex,
      templateDefectCell:template.defect.cell,
      templateDefectLabel:template.defect.cellLabel,
      policyKind:policy.kind,
      responseCell,
      responseLabel:labelCell(g,responseCell),
      result:'BASE_FIRST_WIN',
      baseClass:reentry.handoff.kind,
      normalizationStepCount:reentry.normalizationSteps?.length??0,
      setupAfterNormalization:reentry.setupAfterNormalization??null,
    },
    child:null,
    childAnalysis:null,
    measure:-1,
  };

  return {
    exact:true,
    result:'LOWER_ONE_DEFECT',
    edge:{
      defenderCell,
      defenderLabel:labelCell(g,defenderCell),
      templateIndex,
      templateDefectCell:template.defect.cell,
      templateDefectLabel:template.defect.cellLabel,
      policyKind:policy.kind,
      responseCell,
      responseLabel:labelCell(g,responseCell),
      result:'LOWER_ONE_DEFECT',
      childMeasure:reentry.measure,
      normalizationStepCount:reentry.normalizationSteps?.length??0,
      setupAfterNormalization:reentry.setupAfterNormalization??null,
    },
    child:reentry.position,
    childAnalysis:reentry.analysis,
    measure:reentry.measure,
  };
}

function enumerateReentryOptions(position,{
  attacker,
  targetCell,
  parentMeasure,
}){
  const directBase=baseHandoff(position,{attacker,targetCell});
  if(directBase.exact)return [{
    kind:'BASE',
    exact:true,
    handoff:directBase,
    position,
    normalizationSteps:[],
  }];

  const normalized=closeCpcxForcedResponses(position);
  if(normalized.kind==='CERTIFIED_FIRST_WIN')return normalized.player===attacker?[{
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
  }]:[];
  if(normalized.kind==='TERMINAL'){
    const player=normalized.position.terminal?.player;
    return player===attacker?[{
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
    }]:[];
  }
  if(normalized.kind!=='OPEN')return [];

  const current=normalized.position,
    base=baseHandoff(current,{attacker,targetCell});
  if(base.exact)return [{
    kind:'BASE',
    exact:true,
    handoff:base,
    position:current,
    normalizationSteps:normalized.steps,
  }];

  if(current.mover===attacker){
    const out=[];
    for(const setupCell of frontier(current)){
      const child=applyCpcxForcedEvent(current,setupCell);
      if(child.terminal){
        if(child.terminal.player===attacker)out.push({
          kind:'BASE',
          exact:true,
          handoff:{
            kind:'ATTACKER_TERMINAL',
            exact:true,
            player:attacker,
          },
          position:child,
          normalizationSteps:normalized.steps,
          setupAfterNormalization:{
            setupCell,
            setupLabel:labelCell(current.geometry,setupCell),
            class:'ATTACKER_TERMINAL',
          },
        });
        continue;
      }

      const childBase=baseHandoff(child,{attacker,targetCell});
      if(childBase.exact){
        out.push({
          kind:'BASE',
          exact:true,
          handoff:childBase,
          position:child,
          normalizationSteps:normalized.steps,
          setupAfterNormalization:{
            setupCell,
            setupLabel:labelCell(current.geometry,setupCell),
            class:childBase.kind,
          },
        });
        continue;
      }

      const stable=stableDefenderReentry(child,{
        attacker,targetCell,parentMeasure,
        normalizationSteps:normalized.steps,
      });
      if(stable.exact)out.push({
        ...stable,
        setupAfterNormalization:{
          setupCell,
          setupLabel:labelCell(current.geometry,setupCell),
          class:'LOWER_ONE_DEFECT',
        },
      });
    }
    return out.sort((a,b)=>
      (a.kind==='BASE'?0:1)-(b.kind==='BASE'?0:1)||
      (a.measure??-1)-(b.measure??-1)||
      (a.setupAfterNormalization?.setupCell??-1)-
        (b.setupAfterNormalization?.setupCell??-1)
    );
  }

  const stable=stableDefenderReentry(current,{
    attacker,targetCell,parentMeasure,
    normalizationSteps:normalized.steps,
  });
  return stable.exact?[stable]:[];
}

function enumerateDefectRepairOptions(position,{
  attacker,
  targetCell,
  parentMeasure,
}){
  if(position.mover!==attacker)return [];
  const out=[];
  for(const repairCell of frontier(position)){
    const child=applyCpcxForcedEvent(position,repairCell);
    if(child.terminal){
      if(child.terminal.player===attacker)out.push({
        kind:'BASE',
        exact:true,
        handoff:{
          kind:'ATTACKER_TERMINAL',
          exact:true,
          player:attacker,
        },
        position:child,
        normalizationSteps:[],
        defectRepair:{
          repairCell,
          repairLabel:labelCell(position.geometry,repairCell),
          class:'ATTACKER_TERMINAL',
        },
      });
      continue;
    }

    const reentries=enumerateReentryOptions(child,{
      attacker,targetCell,parentMeasure,
    });
    for(const reentry of reentries)out.push({
      ...reentry,
      defectRepair:{
        repairCell,
        repairLabel:labelCell(position.geometry,repairCell),
        class:reentry.kind==='BASE'
          ?reentry.handoff.kind
          :'LOWER_ONE_DEFECT',
      },
    });
  }
  return out.sort((a,b)=>
    (a.kind==='BASE'?0:1)-(b.kind==='BASE'?0:1)||
    (a.measure??-1)-(b.measure??-1)||
    (a.defectRepair?.repairCell??-1)-(b.defectRepair?.repairCell??-1)
  );
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
    schema:'connect4.cpcx.one-defect-rcic.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:'UNSUPPORTED_GEOMETRY',
    recursive:false,
    gameTreeTraversal:false,
  };
  if(position.terminal||position.mover!==defender)return {
    schema:'connect4.cpcx.one-defect-rcic.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:position.terminal?'ALREADY_TERMINAL':'DEFENDER_NOT_TO_MOVE',
    recursive:false,
    gameTreeTraversal:false,
  };

  const rootAnalysis=analyzeCpcxOneDefectTargetReservoir(
    position,{attacker,targetCell}
  );
  if(rootAnalysis.kind!=='ONE_DEFECT_STATIC_COVERAGE')return {
    schema:'connect4.cpcx.one-defect-rcic.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    seam:rootAnalysis.kind,
    analysis:rootAnalysis,
    recursive:false,
    gameTreeTraversal:false,
  };

  const memo=new Map(),active=new Set();
  let evaluatedNodes=0;

  function prove(current,analysis){
    const key=positionKey(current,targetCell);
    if(memo.has(key))return memo.get(key);
    if(active.has(key))return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'ONE_DEFECT_RCIC_CYCLE',
      key,
    };
    evaluatedNodes+=1;
    if(evaluatedNodes>maxNodes)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'ONE_DEFECT_RCIC_NODE_BOUND',
      nodeCount:evaluatedNodes,
      maxNodes,
    };

    const measure=analysis.totalRelevantEvents;
    if(!Number.isInteger(measure))return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'ONE_DEFECT_RCIC_MEASURE_MISSING',
      key,
    };
    if(analysis.fullCoverageTemplatesTruncated)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'ONE_DEFECT_TEMPLATE_SET_TRUNCATED',
      key,
      fullCoverageTemplateCount:analysis.fullCoverageTemplateCount,
    };

    const templates=analysis.fullCoverageTemplates?.length
      ?analysis.fullCoverageTemplates
      :analysis.selectedFullCoverageTemplate
        ?[analysis.selectedFullCoverageTemplate]
        :[];
    if(!templates.length)return {
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'ONE_DEFECT_RCIC_TEMPLATE_MISSING',
      key,
    };

    active.add(key);
    const failures=[];

    for(let templateIndex=0;templateIndex<templates.length;templateIndex++){
      const template=templates[templateIndex],edges=[];
      let templateOk=true;

      for(const defenderCell of frontier(current)){
        const afterDefender=applyCpcxForcedEvent(current,defenderCell);
        if(afterDefender.terminal){
          templateOk=false;
          failures.push({
            templateIndex,
            defenderCell,
            defenderLabel:labelCell(g,defenderCell),
            seam:'DEFENDER_FIRST_WIN_INSIDE_ONE_DEFECT_RCIC',
            terminal:afterDefender.terminal,
          });
          break;
        }

        const policy=templateResponse(
          current,analysis,template,defenderCell
        );
        if(!policy.exact){
          templateOk=false;
          failures.push({
            templateIndex,
            defenderCell,
            defenderLabel:labelCell(g,defenderCell),
            seam:policy.kind,
          });
          break;
        }

        let options=[];
        if(policy.kind==='DEFECT_HANDOFF'){
          options=enumerateDefectRepairOptions(afterDefender,{
            attacker,targetCell,parentMeasure:measure,
          });
        }else{
          const responseCell=policy.responseCell,
            responseMeta=cpcxCell(g,responseCell);
          if(afterDefender.mover!==attacker||
             responseMeta.row!==afterDefender.heights[responseMeta.column]||
             afterDefender.owner[responseCell]!==-1){
            templateOk=false;
            failures.push({
              templateIndex,
              defenderCell,
              defenderLabel:labelCell(g,defenderCell),
              seam:'ONE_DEFECT_TEMPLATE_RESPONSE_ILLEGAL',
              responseCell,
            });
            break;
          }

          const child=applyCpcxForcedEvent(afterDefender,responseCell);
          if(child.terminal){
            if(child.terminal.player===attacker)options=[{
              kind:'BASE',
              exact:true,
              handoff:{
                kind:'ATTACKER_TERMINAL',
                exact:true,
                player:attacker,
              },
              position:child,
              normalizationSteps:[],
            }];
          }else{
            options=enumerateReentryOptions(child,{
              attacker,targetCell,parentMeasure:measure,
            });
          }
        }

        let selected=null;
        const optionFailures=[];
        for(const option of options){
          if(option.kind==='BASE'){
            selected=option;
            break;
          }
          if(option.kind!=='LOWER_ONE_DEFECT'||
             !Number.isInteger(option.measure)||
             option.measure>=measure){
            optionFailures.push({
              kind:option.kind,
              measure:option.measure??null,
              seam:'ONE_DEFECT_MEASURE_NOT_DECREASING',
            });
            continue;
          }

          const childProof=prove(option.position,option.analysis);
          if(childProof.kind==='CERTIFIED_FIRST_WIN'){
            selected={...option,childProof};
            break;
          }
          optionFailures.push({
            kind:option.kind,
            measure:option.measure,
            seam:childProof.seam??childProof.kind,
          });
        }

        if(!selected){
          templateOk=false;
          failures.push({
            templateIndex,
            defenderCell,
            defenderLabel:labelCell(g,defenderCell),
            policyKind:policy.kind,
            seam:'NO_CERTIFIED_RCIC_RESPONSE_OPTION',
            optionCount:options.length,
            optionFailures,
          });
          break;
        }

        edges.push({
          defenderCell,
          defenderLabel:labelCell(g,defenderCell),
          policyKind:policy.kind,
          responseCell:policy.responseCell,
          responseLabel:policy.responseCell===null
            ?null
            :labelCell(g,policy.responseCell),
          defectRepair:selected.defectRepair??null,
          setupAfterNormalization:selected.setupAfterNormalization??null,
          normalizationStepCount:selected.normalizationSteps?.length??0,
          result:selected.kind==='BASE'
            ?'BASE_FIRST_WIN'
            :'LOWER_ONE_DEFECT',
          baseClass:selected.kind==='BASE'
            ?selected.handoff.kind
            :null,
          childMeasure:selected.kind==='LOWER_ONE_DEFECT'
            ?selected.measure
            :null,
          childKey:selected.kind==='LOWER_ONE_DEFECT'
            ?positionKey(selected.position,targetCell)
            :null,
        });
      }

      if(templateOk){
        const result={
          schema:'connect4.cpcx.one-defect-rcic-node.v0_2',
          kind:'CERTIFIED_FIRST_WIN',
          exact:true,
          player:attacker,
          key,
          rank:current.rank,
          measure,
          support:Array.from(current.heights),
          selectedTemplateIndex:templateIndex,
          selectedTemplate:{
            defect:template.defect,
            synchronizedPairs:template.synchronizedPairs,
            partner:template.partner,
            prefixLength:template.prefixLength,
          },
          edgeCount:edges.length,
          edges,
        };
        memo.set(key,result);
        active.delete(key);
        return result;
      }
    }

    active.delete(key);
    const failed={
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'NO_VIABLE_ONE_DEFECT_FULL_TEMPLATE',
      key,
      rank:current.rank,
      measure,
      templateCount:templates.length,
      failures,
    };
    memo.set(key,failed);
    return failed;
  }

  const root=prove(position,rootAnalysis);
  if(root.kind!=='CERTIFIED_FIRST_WIN')return {
    schema:'connect4.cpcx.one-defect-rcic.v0_2',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    seam:root.seam??root.kind,
    rootFailure:root,
    evaluatedNodes,
    recursive:false,
    gameTreeTraversal:false,
  };

  const certifiedNodes=[...memo.values()]
    .filter(x=>x.kind==='CERTIFIED_FIRST_WIN')
    .sort((a,b)=>a.measure-b.measure||a.key.localeCompare(b.key));

  return {
    schema:'connect4.cpcx.one-defect-rcic.v0_2',
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:attacker,
    attacker,defender,
    targetCell,
    targetLabel:labelCell(g,targetCell),
    rootMeasure:rootAnalysis.totalRelevantEvents,
    nodeCount:certifiedNodes.length,
    evaluatedNodeCount:evaluatedNodes,
    edgeCount:certifiedNodes.reduce((n,x)=>n+x.edgeCount,0),
    maxPhysicalRank:Math.max(...certifiedNodes.map(x=>x.rank)),
    measures:unique(certifiedNodes.map(x=>x.measure)),
    nodes:certifiedNodes,
    rootNodeKey:root.key,
    rcic:{
      quantifierOrder:'EXISTS_COMPLETE_TEMPLATE_THEN_FORALL_DEFENDER_TRIGGERS',
      templateReconstruction:'each lower exact macro-state may choose its own complete full-coverage template',
      obligations:[
        'preserve the active attacker singleton target',
        'prevent defender first win before target/qualified handoff',
      ],
      resources:[
        'one complete one-defect full-coverage target-reservoir template per macro-state',
        'template-prescribed cross/vertical response',
        'one current attacker setup at an unmatched defect handoff or after deterministic normalization',
        'exact handoff to existing CPCX/ordinary reservoir certificate',
      ],
      rank:'totalRelevantEvents',
      strictDecrease:true,
      responseTotality:true,
      allowedNonterminalExit:'LOWER_ONE_DEFECT_ONLY',
      allowedTerminalExit:'ATTACKER_FIRST_WIN_ONLY',
    },
    proofRule:'ranked controlled invariant with complete-template choice: at each exact macro-state choose one full-coverage structural template that answers every legal defender trigger; every nonterminal response reconstructs the one-defect class at strictly lower finite reservoir rank',
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
    proofClassInduction:true,
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

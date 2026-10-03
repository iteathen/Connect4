import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
import {
  analyzeCpcxTargetReservoir,
  analyzeCpcxOneDefectTargetReservoir,
  analyzeCpcxTruncatedTargetReservoirCoverage,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {
  certifyCpcxReservoirCoverageGapRcic,
  certifyCpcxReservoirAttachmentRcic,
} from './cpcx-reservoir-gap-rcic.mjs';
import {
  canonicalizeCpcxExactReflection,
  reflectCpcxCell,
} from './cpcx-control-quotient.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

const coverageRcicCache=new Map(),attachmentRcicCache=new Map();

function exactRcicKey(position,targetCell){
  const c=canonicalizeCpcxExactReflection(position),
    canonicalTarget=c.reflected?reflectCpcxCell(position.geometry,targetCell):targetCell;
  return {
    key:`${c.key}|target:${canonicalTarget}`,
    position:c.position,
    targetCell:canonicalTarget,
    reflected:c.reflected,
  };
}

function cachedCoverageRcic(position,targetCell){
  const k=exactRcicKey(position,targetCell);
  if(!coverageRcicCache.has(k.key))coverageRcicCache.set(
    k.key,
    certifyCpcxReservoirCoverageGapRcic(
      k.position,{attacker:0,targetCell:k.targetCell,maxNodes:2048}
    )
  );
  return coverageRcicCache.get(k.key);
}

function cachedAttachmentRcic(position,targetCell){
  const k=exactRcicKey(position,targetCell);
  if(!attachmentRcicCache.has(k.key))attachmentRcicCache.set(
    k.key,
    certifyCpcxReservoirAttachmentRcic(
      k.position,{attacker:0,targetCell:k.targetCell,maxNodes:4096}
    )
  );
  return attachmentRcicCache.get(k.key);
}


function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%position.geometry.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return null;
  return {
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function exactVertical(position,column){
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player:0})){
    if(demand.column!==column)continue;
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    if(certificate.exact&&certificate.kind==='PREEMPT_OR_FORCED_UPPER')
      return {demand,certificate};
  }
  return null;
}
function resultSummary(position){
  if(position.terminal)return {
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:position.terminal.player,
    source:'TERMINAL',
    seam:null,
  };
  const progress=classifyCpcxProgress(position,{player:0}),
    certificate=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:certificate.kind,
    exact:certificate.exact,
    player:certificate.player??null,
    source:progress.source??progress.macro?.kind??progress.kind,
    progressKind:progress.kind,
    seam:certificate.seam??progress.seam??null,
    blockingCells:progress.obligation?.blockingCells?.map(label)??null,
    traceLength:certificate.trace?.length??0,
  };
}
function frontierCells(position){
  const out=[];
  for(let column=0;column<g.columns;column++){
    const row=position.heights[column];
    if(row<g.rows)out.push(row*g.columns+column);
  }
  return out;
}
function setupRole(pair,cell){
  if(pair.cells.includes(cell))return 'PAIR_ENDPOINT';
  if(pair.events.some(x=>x.frontierCell===cell))return 'PAIR_COLUMN_SUPPORT';
  const cellLabel=label(cell);
  if((pair.ladderAttachments??[]).some(a=>
    a.extraSupport?.some(x=>x.distance===0&&x.frontier===cellLabel)
  ))return 'PLAYABLE_LADDER_TRIGGER';
  return 'EXTERNAL_SETUP';
}
function allSetupRows(position,pair){
  if(position.mover!==0)return [];
  return frontierCells(position).map(setupCell=>{
    const child=applyCpcxForcedEvent(position,setupCell),
      result=resultSummary(child);
    return {
      setupCell,
      setupLabel:label(setupCell),
      role:setupRole(pair,setupCell),
      terminal:child.terminal,
      certified:result.kind==='CERTIFIED_FIRST_WIN'&&result.player===0,
      result,
    };
  });
}

function pairKey(row){
  return [
    Math.max(...row.distances),
    row.distances.reduce((a,b)=>a+b,0),
    Math.min(...row.distances),
    row.orientation,
    row.cells.join(','),
  ];
}
function comparePair(a,b){
  const ka=pairKey(a),kb=pairKey(b);
  for(let i=0;i<ka.length;i++){
    if(typeof ka[i]==='number'&&typeof kb[i]==='number'){
      if(ka[i]!==kb[i])return ka[i]-kb[i];
    }else{
      const c=String(ka[i]).localeCompare(String(kb[i]));
      if(c)return c;
    }
  }
  return 0;
}
function pairRows(position){
  const rows=[];
  for(const o of scanCpcxObligations(position)){
    if(o.player!==0||o.missingCount!==2)continue;
    const events=o.missingCells.map(cell=>{
      const meta=cpcxCell(g,cell),
        supportDistance=meta.row-position.heights[meta.column],
        frontierCell=position.heights[meta.column]*g.columns+meta.column;
      return {
        cell,
        label:label(cell),
        column:meta.column,
        row:meta.row,
        supportDistance,
        frontierCell,
        frontierLabel:label(frontierCell),
        frontierIsTarget:frontierCell===cell,
      };
    });
    rows.push({
      obligationId:o.id,
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      orientation:o.orientation,
      cells:[...o.missingCells],
      cellLabels:o.missingCells.map(label),
      distances:events.map(x=>x.supportDistance).sort((a,b)=>a-b),
      events,
    });
  }
  rows.sort(comparePair);
  return rows;
}
function ladderAttachments(position,pair){
  const obs=scanCpcxObligations(position).filter(o=>o.player===0),
    out=[];
  for(const liftRows of [2,4]){
    const lifted=[];
    let valid=true;
    for(const cell of pair.cells){
      const meta=cpcxCell(g,cell);
      if(meta.row+liftRows>=g.rows){valid=false;break;}
      lifted.push(cell+liftRows*g.columns);
    }
    if(!valid)continue;
    for(const o of obs){
      if(o.lineId===pair.lineId)continue;
      if(!lifted.every(cell=>o.missingCells.includes(cell)))continue;
      const extras=o.missingCells.filter(cell=>!lifted.includes(cell));
      out.push({
        liftRows,
        obligationId:o.id,
        lineId:o.lineId,
        lineLabel:o.lineLabel,
        orientation:o.orientation,
        missingCount:o.missingCount,
        liftedCells:lifted.map(label),
        extraCells:extras.map(label),
        extraCellIds:[...extras],
        extraSupport:extras.map(cell=>{
          const meta=cpcxCell(g,cell);
          return {
            cell:label(cell),
            distance:meta.row-position.heights[meta.column],
            frontier:label(position.heights[meta.column]*g.columns+meta.column),
          };
        }),
        exactOneTriggerRung:o.missingCount===lifted.length+1,
        sameOrientation:o.orientation===pair.orientation,
      });
    }
  }
  return out.sort((a,b)=>
    a.liftRows-b.liftRows||
    a.missingCount-b.missingCount||
    Number(b.sameOrientation)-Number(a.sameOrientation)||
    a.lineId-b.lineId
  );
}

function reservoirTemplateResponse(position,coverage,template,defenderCell){
  const {column,row}=cpcxCell(g,defenderCell);
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
    };
  }
  if((coverage.capacity?.[column]??0)>1)return {
    cell:defenderCell+g.columns,
    role:'PARTIAL_TEMPLATE_VERTICAL_RESPONSE',
  };
  return null;
}

function currentAttachedResponses(position,uncoveredLineIds){
  const ids=new Set(uncoveredLineIds),
    frontier=new Set(frontierCells(position)),
    cells=new Map();
  for(const o of scanCpcxObligations(position)){
    if(o.player!==1||!ids.has(o.lineId))continue;
    for(const cell of o.missingCells){
      if(!frontier.has(cell))continue;
      const key=cell;
      if(!cells.has(key))cells.set(key,{
        cell,
        role:'UNCOVERED_RESIDUAL_ATTACHMENT',
        lineIds:[],
        lineLabels:[],
      });
      const row=cells.get(key);
      row.lineIds.push(o.lineId);
      row.lineLabels.push(o.lineLabel);
    }
  }
  return [...cells.values()].sort((a,b)=>a.cell-b.cell);
}

function evaluateCoverageRepairChild(position,targetCell,parentGap,response){
  const child=applyCpcxForcedEvent(position,response.cell);
  if(child.terminal)return child.terminal.player===0?{
    ...response,
    result:'ATTACKER_TERMINAL',
    exact:true,
    childGap:-1,
    certificateSource:'TERMINAL',
  }:{
    ...response,
    result:'WRONG_TERMINAL',
    exact:false,
    childGap:null,
    terminal:child.terminal,
  };

  const certificate=runCpcxFirstWinCertificate(child,{attacker:0});
  if(certificate.kind==='CERTIFIED_FIRST_WIN'&&certificate.player===0)return {
    ...response,
    result:'EXISTING_CPCX_FIRST_WIN',
    exact:true,
    childGap:-1,
    certificateSource:
      certificate.trace?.[0]?.progress?.source??
      certificate.trace?.[0]?.progress?.kind??
      null,
    certificateTraceLength:certificate.trace?.length??0,
  };

  const ordinary=certifyCpcxTruncatedTargetReservoir(
      child,{attacker:0,targetCell}
    );
  if(ordinary.kind==='CERTIFIED_FIRST_WIN')return {
    ...response,
    result:'ORDINARY_TARGET_RESERVOIR',
    exact:true,
    childGap:0,
    certificateSource:'TRUNCATED_TARGET_RESERVOIR',
  };

  const next=analyzeCpcxTruncatedTargetReservoirCoverage(
      child,{attacker:0,targetCell}
    ),
    childGap=next.minimumUncoveredResiduals??null;
  if(
    next.kind==='TRUNCATED_TARGET_STATIC_COVERAGE_GAP'&&
    Number.isInteger(childGap)&&
    childGap<parentGap
  )return {
    ...response,
    result:'LOWER_COVERAGE_GAP',
    exact:true,
    childGap,
    childDefenderResidualCount:next.defenderResidualCount,
    certificateSource:null,
    nextCoverageKind:next.kind,
  };

  return {
    ...response,
    result:'NO_STRICT_REPAIR',
    exact:false,
    childGap,
    childDefenderResidualCount:next.defenderResidualCount??null,
    nextCoverageKind:next.kind,
    certificateSeam:certificate.seam??certificate.kind,
  };
}

function reservoirCoverageRepairProbe(position,targetCell,coverage){
  if(
    position.mover!==1||
    coverage?.kind!=='TRUNCATED_TARGET_STATIC_COVERAGE_GAP'
  )return null;
  const template=coverage.bestPartialTemplates?.[0];
  if(!template)return null;
  const parentGap=coverage.minimumUncoveredResiduals,
    uncoveredLineIds=template.uncovered.map(x=>x.lineId),
    rows=[];

  for(const defenderCell of frontierCells(position)){
    const afterDefender=applyCpcxForcedEvent(position,defenderCell);
    if(afterDefender.terminal){
      rows.push({
        defenderCell:label(defenderCell),
        defenderTerminal:afterDefender.terminal,
        candidateCount:0,
        successfulRepairs:[],
        allCandidates:[],
        covered:false,
      });
      continue;
    }

    const candidates=new Map(),
      templateResponse=reservoirTemplateResponse(
        position,coverage,template,defenderCell
      );
    if(templateResponse)candidates.set(templateResponse.cell,templateResponse);
    for(const response of currentAttachedResponses(
      afterDefender,uncoveredLineIds
    )){
      if(candidates.has(response.cell)){
        const prior=candidates.get(response.cell);
        candidates.set(response.cell,{
          ...prior,
          role:prior.role+'+UNCOVERED_RESIDUAL_ATTACHMENT',
          lineIds:response.lineIds,
          lineLabels:response.lineLabels,
        });
      }else candidates.set(response.cell,response);
    }

    const allCandidates=[];
    for(const response of [...candidates.values()].sort((a,b)=>a.cell-b.cell)){
      const meta=cpcxCell(g,response.cell);
      if(
        afterDefender.mover!==0||
        afterDefender.heights[meta.column]!==meta.row||
        afterDefender.owner[response.cell]!==-1
      ){
        allCandidates.push({
          ...response,
          responseLabel:label(response.cell),
          result:'ILLEGAL_RESPONSE',
          exact:false,
        });
        continue;
      }
      allCandidates.push({
        ...evaluateCoverageRepairChild(
          afterDefender,targetCell,parentGap,response
        ),
        responseLabel:label(response.cell),
      });
    }
    const successfulRepairs=allCandidates.filter(x=>x.exact);
    rows.push({
      defenderCell:label(defenderCell),
      defenderTerminal:null,
      candidateCount:allCandidates.length,
      successfulRepairs,
      allCandidates,
      covered:successfulRepairs.length>0,
    });
  }

  return {
    parentGap,
    targetCell:label(targetCell),
    uncovered:template.uncovered.map(x=>({
      lineId:x.lineId,
      lineLabel:x.lineLabel,
      orientation:x.orientation,
      missingCount:x.missingCount,
      missingCells:x.missingCells.map(label),
    })),
    triggerCount:rows.length,
    coveredTriggerCount:rows.filter(x=>x.covered).length,
    allCurrentTriggersCovered:rows.every(x=>x.covered),
    rows,
    proofBoundary:'one current P1 trigger / one P0 response layer only; candidate responses are restricted to the selected partial reservoir template mate or current frontier cells attached to its uncovered P1 residuals; any lower-gap result is discovery evidence, not yet a promoted induction theorem',
  };
}

function ladderPoisonBranches(position,pair){
  if(position.mover!==0)return [];
  const out=[];
  for(const attachment of ladderAttachments(position,pair)){
    if(
      attachment.liftRows!==2||
      !attachment.exactOneTriggerRung||
      !attachment.sameOrientation
    )continue;
    const playableExtras=attachment.extraSupport
      .map((x,i)=>({meta:x,cell:attachment.extraCellIds[i]}))
      .filter(x=>x.meta.distance===0);
    for(const extra of playableExtras){
      const afterTrigger=applyCpcxForcedEvent(position,extra.cell);
      if(afterTrigger.terminal){
        out.push({
          triggerCell:label(extra.cell),
          upperLine:attachment.lineLabel,
          terminalOnTrigger:afterTrigger.terminal,
          branches:[],
        });
        continue;
      }
      if(afterTrigger.mover!==1)throw new Error('expected P1 after ladder trigger');
      const branches=[];
      for(const event of pair.events){
        if(event.supportDistance!==1)continue;
        const supportCell=event.frontierCell,
          afterSupport=applyCpcxForcedEvent(afterTrigger,supportCell);
        if(afterSupport.terminal){
          branches.push({
            endpoint:event.label,
            supportCell:label(supportCell),
            defenderTerminal:afterSupport.terminal,
            endpointLegal:false,
            result:null,
          });
          continue;
        }
        const endpointMeta=cpcxCell(g,event.cell),
          endpointLegal=
            afterSupport.heights[endpointMeta.column]===endpointMeta.row&&
            afterSupport.owner[event.cell]===-1;
        if(!endpointLegal){
          branches.push({
            endpoint:event.label,
            supportCell:label(supportCell),
            defenderTerminal:null,
            endpointLegal:false,
            result:null,
          });
          continue;
        }
        const afterEndpoint=applyCpcxForcedEvent(afterSupport,event.cell),
          result=resultSummary(afterEndpoint),
          lineage=afterEndpoint.terminal?null:lineageAfter(afterEndpoint,pair.lineId),
          targetCell=lineage?.missingCount===1?lineage.missingCells[0]:null,
          reservoir=Number.isInteger(targetCell)&&!afterEndpoint.terminal
            ?analyzeCpcxTargetReservoir(afterEndpoint,{attacker:0,targetCell})
            :null,
          oneDefect=Number.isInteger(targetCell)&&!afterEndpoint.terminal
            ?analyzeCpcxOneDefectTargetReservoir(afterEndpoint,{attacker:0,targetCell})
            :null,
          reservoirCoverage=Number.isInteger(targetCell)&&!afterEndpoint.terminal
            ?analyzeCpcxTruncatedTargetReservoirCoverage(
              afterEndpoint,{attacker:0,targetCell}
            )
            :null,
          coverageRcic=
            Number.isInteger(targetCell)&&
            !afterEndpoint.terminal&&
            reservoirCoverage?.kind==='TRUNCATED_TARGET_STATIC_COVERAGE_GAP'
              ?cachedCoverageRcic(afterEndpoint,targetCell)
              :null,
          attachmentRcic=
            Number.isInteger(targetCell)&&
            !afterEndpoint.terminal&&
            reservoirCoverage?.kind==='TRUNCATED_TARGET_STATIC_COVERAGE_GAP'
              ?cachedAttachmentRcic(afterEndpoint,targetCell)
              :null;
        branches.push({
          endpoint:event.label,
          supportCell:label(supportCell),
          defenderTerminal:null,
          endpointLegal:true,
          endpointTerminal:afterEndpoint.terminal,
          lineage:lineage?{
            missingCount:lineage.missingCount,
            missingCells:lineage.missingCells.map(label),
            support:lineage.events.map(e=>({
              cell:label(e.cell),
              distance:e.supportDistance,
            })),
          }:null,
          result,
          reservoir:reservoir?{
            kind:reservoir.kind,
            totalRelevantEvents:reservoir.totalRelevantEvents??null,
            totalParity:reservoir.totalParity??null,
            oddColumns:reservoir.oddColumnLabels??null,
          }:null,
          oneDefect:oneDefect?{
            kind:oneDefect.kind,
            totalRelevantEvents:oneDefect.totalRelevantEvents??null,
            fullCoverageTemplateCount:oneDefect.fullCoverageTemplateCount??null,
            minimumUncoveredResiduals:oneDefect.minimumUncoveredResiduals??null,
          }:null,
          reservoirCoverage:reservoirCoverage?{
            kind:reservoirCoverage.kind,
            fullCoverageTemplateCount:
              reservoirCoverage.fullCoverageTemplateCount??null,
            minimumUncoveredResiduals:
              reservoirCoverage.minimumUncoveredResiduals??null,
            bestUncovered:(reservoirCoverage.bestPartialTemplates?.[0]?.uncovered??[])
              .map(x=>({
                lineId:x.lineId,
                lineLabel:x.lineLabel,
                orientation:x.orientation,
                missingCount:x.missingCount,
                missingCells:x.missingCells.map(label),
              })),
          }:null,
          coverageRepair:Number.isInteger(targetCell)&&!afterEndpoint.terminal
            ?reservoirCoverageRepairProbe(
              afterEndpoint,targetCell,reservoirCoverage
            )
            :null,
          attachmentRcic:attachmentRcic?{
            kind:attachmentRcic.kind,
            exact:attachmentRcic.exact,
            player:attachmentRcic.player??null,
            seam:attachmentRcic.seam??null,
            rootGap:attachmentRcic.rootGap??null,
            rootReservoirRank:attachmentRcic.rootReservoirRank??null,
            nodeCount:attachmentRcic.nodeCount??null,
            certifiedNodeCount:attachmentRcic.certifiedNodeCount??null,
            reservoirRanks:attachmentRcic.reservoirRanks??null,
            unresolvedNodeCount:attachmentRcic.unresolvedNodeCount??0,
          }:null,
          coverageRcic:coverageRcic?{
            kind:coverageRcic.kind,
            exact:coverageRcic.exact,
            player:coverageRcic.player??null,
            seam:coverageRcic.seam??null,
            rootGap:coverageRcic.rootGap??null,
            nodeCount:coverageRcic.nodeCount??null,
            certifiedNodeCount:coverageRcic.certifiedNodeCount??null,
            measures:coverageRcic.measures??null,
            unresolvedNodeCount:coverageRcic.unresolvedNodeCount??0,
            unresolvedNodes:(coverageRcic.unresolvedNodes??[])
              .slice(0,32)
              .map(node=>({
                rank:node.rank,
                gap:node.gap,
                support:node.support,
                seam:node.seam,
                descriptor:node.descriptor??null,
                unresolvedTriggers:node.unresolvedTriggers.map(t=>({
                  defenderCell:t.defenderLabel,
                  defenderTerminal:t.defenderTerminal,
                  optionCount:t.optionCount,
                  optionResults:t.options.map(o=>({
                    responseLabel:o.responseLabel,
                    role:o.role,
                    result:o.result,
                    childGap:o.childGap,
                  })),
                  rejectedCount:t.rejectedCount??0,
                  rejected:(t.rejected??[]).map(o=>({
                    responseLabel:o.responseLabel,
                    role:o.role,
                    childClass:o.childClass,
                    childGap:o.childGap,
                    childDescriptor:o.childDescriptor,
                    seam:o.seam,
                  })),
                })),
              })),
          }:null,
        });
      }
      out.push({
        triggerCell:label(extra.cell),
        upperLine:attachment.lineLabel,
        terminalOnTrigger:null,
        branches,
      });
    }
  }
  return out;
}

function lineageAfter(position,lineId){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineId===lineId
  )??null;
}
function setupRows(position,pair){
  if(position.mover!==0)return [];
  const actions=[...new Set(pair.events.map(x=>x.frontierCell))].sort((a,b)=>a-b),
    out=[];
  for(const setupCell of actions){
    const before=pair.events.find(x=>x.frontierCell===setupCell),
      child=applyCpcxForcedEvent(position,setupCell),
      lineage=child.terminal?null:lineageAfter(child,pair.lineId),
      immediate=child.terminal?null:classifyCpcxImmediate(child),
      result=resultSummary(child);
    out.push({
      setupCell,
      setupLabel:label(setupCell),
      endpointColumn:before?.column??null,
      setupIsEndpoint:pair.cells.includes(setupCell),
      setupRole:pair.cells.includes(setupCell)
        ?'ENDPOINT_CONTRACTION'
        :'SUPPORT_LIFT',
      terminal:child.terminal,
      lineage:lineage?{
        missingCount:lineage.missingCount,
        missingCells:lineage.missingCells.map(label),
        support:lineage.events.map(e=>({
          cell:label(e.cell),
          distance:e.supportDistance,
        })),
      }:null,
      immediate:immediate?{
        kind:immediate.kind,
        cell:Number.isInteger(immediate.cell)?label(immediate.cell):null,
        threatCells:immediate.threatCells?.map(label)??null,
      }:null,
      result,
    });
  }
  return out;
}
function analyzeState(position,source){
  const existing=resultSummary(position),
    pairs=pairRows(position),
    best=pairs[0]??null;
  return {
    ...source,
    rank:position.rank,
    mover:position.mover,
    support:Array.from(position.heights),
    existing,
    pairCount:pairs.length,
    bestPair:best?{
      lineId:best.lineId,
      lineLabel:best.lineLabel,
      orientation:best.orientation,
      cells:best.cellLabels,
      distances:best.distances,
      events:best.events.map(x=>({
        cell:x.label,
        distance:x.supportDistance,
        frontier:x.frontierLabel,
        frontierIsTarget:x.frontierIsTarget,
      })),
      setups:setupRows(position,best),
      ladderAttachments:ladderAttachments(position,best),
      allSetups:allSetupRows(position,{...best,ladderAttachments:ladderAttachments(position,best)}),
      ladderPoisonBranches:ladderPoisonBranches(position,best),
    }:null,
    allPairs:pairs.map(pair=>({
      lineId:pair.lineId,
      lineLabel:pair.lineLabel,
      orientation:pair.orientation,
      cells:pair.cellLabels,
      distances:pair.distances,
    })),
  };
}

const states=[];
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells;

  for(const stolen of [t2,t3]){
    const theft=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:stolen,owner:1},
    ]);
    if(!theft)throw new Error('invalid theft state');
    const repair=materialize(theft,[{cell:r1,owner:0}]);
    if(!repair)throw new Error('invalid theft repair');
    const vertical=exactVertical(repair,cpcxCell(g,t1).column);
    if(!vertical)throw new Error('expected exact vertical theorem');

    const {demand,certificate}=vertical,
      preempt=materialize(repair,[{cell:demand.lowerCell,owner:1}]);
    if(!preempt)throw new Error('invalid preempt state');
    const preemptExisting=resultSummary(preempt);
    if(preemptExisting.kind!=='CERTIFIED_FIRST_WIN')states.push(analyzeState(preempt,{
      sixthMove:sixthColumn+1,
      stolenTrigger:label(stolen),
      resolution:'PREEMPT',
      externalCell:null,
    }));

    for(const externalCell of certificate.nonpreemptFrontier){
      const delayed=materialize(repair,[
        {cell:externalCell,owner:1},
        {cell:demand.lowerCell,owner:0},
        {cell:demand.upperCell,owner:1},
      ]);
      if(!delayed)throw new Error('invalid delayed state');
      const existing=resultSummary(delayed);
      if(existing.kind==='CERTIFIED_FIRST_WIN'&&existing.player===0)continue;
      states.push(analyzeState(delayed,{
        sixthMove:sixthColumn+1,
        stolenTrigger:label(stolen),
        resolution:'DELAYED',
        externalCell:label(externalCell),
      }));
    }
  }
}

const profileCounts={},
  setupOutcomeCounts={},
  orientationProfileCounts={},
  ladderAttachmentCounts={},
  uniqueSetupPatterns=new Map(),
  certifiedSetupSourceCounts={},
  certifiedSetupRoleCounts={},
  poisonBranchSourceCounts={},
  poisonBranchProfileCounts={},
  coverageRepairParentGapCounts={},
  coverageRepairClosedTriggerCounts={},
  coverageRepairResultCounts={},
  coverageRcicCounts={},
  coverageRcicByGap={},
  attachmentRcicCounts={},
  attachmentRcicByGap={};
for(const row of states){
  const pair=row.bestPair;
  if(!pair)continue;
  const profile=pair.distances.join(',');
  profileCounts[profile]=(profileCounts[profile]??0)+1;
  const op=`${pair.orientation}|${profile}`;
  orientationProfileCounts[op]=(orientationProfileCounts[op]??0)+1;
  for(const ladder of pair.ladderPoisonBranches??[]){
    for(const branch of ladder.branches??[]){
      const profile=pair.distances.join(',');
      const source=branch.result?.source??branch.result?.kind??'NO_RESULT';
      const key=`${profile}|${source}|${branch.result?.kind??'NO_RESULT'}|${branch.result?.player??''}`;
      poisonBranchSourceCounts[source]=(poisonBranchSourceCounts[source]??0)+1;
      poisonBranchProfileCounts[key]=(poisonBranchProfileCounts[key]??0)+1;
      const arcic=branch.attachmentRcic;
      if(arcic){
        const key=`${arcic.kind}|${arcic.player??''}|${arcic.seam??''}`;
        attachmentRcicCounts[key]=(attachmentRcicCounts[key]??0)+1;
        const gapKey=`${arcic.rootGap}|${arcic.kind}`;
        attachmentRcicByGap[gapKey]=(attachmentRcicByGap[gapKey]??0)+1;
      }
      const rcic=branch.coverageRcic;
      if(rcic){
        const key=`${rcic.kind}|${rcic.player??''}|${rcic.seam??''}`;
        coverageRcicCounts[key]=(coverageRcicCounts[key]??0)+1;
        const gapKey=`${rcic.rootGap}|${rcic.kind}`;
        coverageRcicByGap[gapKey]=(coverageRcicByGap[gapKey]??0)+1;
      }
      const repair=branch.coverageRepair;
      if(repair){
        coverageRepairParentGapCounts[repair.parentGap]=
          (coverageRepairParentGapCounts[repair.parentGap]??0)+1;
        const closedKey=`${repair.coveredTriggerCount}/${repair.triggerCount}`;
        coverageRepairClosedTriggerCounts[closedKey]=
          (coverageRepairClosedTriggerCounts[closedKey]??0)+1;
        for(const row of repair.rows)for(const response of row.successfulRepairs){
          coverageRepairResultCounts[response.result]=
            (coverageRepairResultCounts[response.result]??0)+1;
        }
      }
    }
  }
  for(const s of pair.allSetups??[]){
    if(!s.certified)continue;
    const source=s.result.source??s.result.kind;
    certifiedSetupSourceCounts[source]=(certifiedSetupSourceCounts[source]??0)+1;
    certifiedSetupRoleCounts[s.role]=(certifiedSetupRoleCounts[s.role]??0)+1;
  }
  for(const s of pair.setups){
    const key=[
      profile,
      s.setupRole,
      s.result.kind,
      s.result.player??'',
      s.result.source??'',
      s.result.seam??'',
    ].join('|');
    setupOutcomeCounts[key]=(setupOutcomeCounts[key]??0)+1;
  }
  const pattern=JSON.stringify({
    orientation:pair.orientation,
    distances:pair.distances,
    setupRoles:pair.setups.map(s=>s.setupRole).sort(),
    setupResults:pair.setups.map(s=>({
      role:s.setupRole,
      kind:s.result.kind,
      player:s.result.player,
      source:s.result.source,
      seam:s.result.seam,
      immediate:s.immediate?.kind??null,
      lineageCount:s.lineage?.missingCount??null,
      lineageSupport:s.lineage?.support?.map(x=>x.distance).sort((a,b)=>a-b)??null,
    })).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),
  });
  if(!uniqueSetupPatterns.has(pattern))uniqueSetupPatterns.set(pattern,{
    count:0,
    example:{
      sixthMove:row.sixthMove,
      stolenTrigger:row.stolenTrigger,
      resolution:row.resolution,
      externalCell:row.externalCell,
      line:pair.lineLabel,
    },
    pattern:JSON.parse(pattern),
  });
  uniqueSetupPatterns.get(pattern).count+=1;
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.latent-two-piece-classes.v0_1',
  root:'44444',
  stateCount:states.length,
  summary:{
    statesWithoutPair:states.filter(x=>!x.bestPair).length,
    profileCounts,
    orientationProfileCounts,
    ladderAttachmentCounts,
    setupOutcomeCounts,
    statesWithCertifiedCurrentSetup:states.filter(x=>
      x.bestPair?.allSetups?.some(s=>s.certified)
    ).length,
    certifiedSetupSourceCounts,
    certifiedSetupRoleCounts,
    poisonBranchSourceCounts,
    poisonBranchProfileCounts,
    coverageRepairParentGapCounts,
    coverageRepairClosedTriggerCounts,
    coverageRepairResultCounts,
    coverageRcicCounts,
    coverageRcicByGap,
    coverageRcicUniqueExactStates:coverageRcicCache.size,
    attachmentRcicCounts,
    attachmentRcicByGap,
    attachmentRcicUniqueExactStates:attachmentRcicCache.size,
    uniqueSetupPatternCount:uniqueSetupPatterns.size,
    uniqueSetupPatterns:[...uniqueSetupPatterns.values()]
      .sort((a,b)=>b.count-a.count||JSON.stringify(a.pattern).localeCompare(JSON.stringify(b.pattern))),
  },
  states,
  premises:{
    diagnosticOnly:true,
    expansion:'one endpoint-column frontier event from the mechanically best live P0 two-piece residual in each unresolved theorem-defined theft/vertical state',
    noFutureReservation:true,
    standardBoard:'7x6',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

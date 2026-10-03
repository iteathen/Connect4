import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {deriveCpcxDisjunctiveBlockObligation} from './cpcx-cpc2.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  source=buildCpcxPosition('4444441123312',{geometry:g}),
  attacker=0,targetCell=3*g.columns+4,
  analysis=analyzeCpcxOneDefectTargetReservoir(source,{attacker,targetCell}),
  defenderCell=3*g.columns+0, // A4
  afterDefender=applyCpcxForcedEvent(source,defenderCell);

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function policy(template){
  const {column,row}=cpcxCell(g,defenderCell),
    depth=row-source.heights[column],
    partner=template.partner[column],
    L=template.prefixLength[column];
  if(partner>=0&&depth<L){
    const responseCell=(source.heights[partner]+depth)*g.columns+partner;
    return {kind:'SYNCHRONIZED_CROSS_RESPONSE',responseCell};
  }
  if(depth+1<analysis.capacity[column])
    return {kind:'VERTICAL_RESPONSE',responseCell:defenderCell+g.columns};
  if(defenderCell===template.defect.cell)
    return {kind:'DEFECT_HANDOFF',responseCell:null};
  return {kind:'NO_TEMPLATE_RESPONSE',responseCell:null};
}
function childSummary(child){
  if(!child)return null;
  if(child.terminal)return {
    terminal:child.terminal,
    rank:child.rank,
    mover:child.mover,
    support:Array.from(child.heights),
  };
  const one=analyzeCpcxOneDefectTargetReservoir(child,{attacker,targetCell}),
    ordinary=certifyCpcxTruncatedTargetReservoir(child,{attacker,targetCell}),
    cpc2=child.mover===1
      ?deriveCpcxDisjunctiveBlockObligation(child,{attacker})
      :null,
    progress=classifyCpcxProgress(child,{player:attacker}),
    cert=runCpcxFirstWinCertificate(child,{attacker});
  return {
    terminal:null,
    rank:child.rank,
    mover:child.mover,
    support:Array.from(child.heights),
    oneDefect:{
      kind:one.kind,
      totalRelevantEvents:one.totalRelevantEvents??null,
      fullCoverageTemplateCount:one.fullCoverageTemplateCount??null,
      minimumUncoveredResiduals:one.minimumUncoveredResiduals??null,
    },
    ordinary:{
      kind:ordinary.kind,
      seam:ordinary.seam??null,
    },
    cpc2:cpc2?{
      kind:cpc2.kind,
      blockingLabels:cpc2.blockingLabels??null,
      seam:cpc2.seam??null,
    }:null,
    progress:{
      kind:progress.kind,
      source:progress.source??null,
      macroKind:progress.macro?.kind??null,
      blockingCells:progress.obligation?.blockingCells?.map(label)??null,
    },
    certificate:{
      kind:cert.kind,
      player:cert.player??null,
      seam:cert.seam??null,
      traceLength:cert.trace?.length??0,
    },
  };
}

const rows=[],seen=new Set();
for(let i=0;i<(analysis.fullCoverageTemplates??[]).length;i++){
  const t=analysis.fullCoverageTemplates[i],p=policy(t),
    key=`${p.kind}:${p.responseCell}`;
  if(seen.has(key))continue;
  seen.add(key);
  let child=null;
  if(Number.isInteger(p.responseCell)){
    const meta=cpcxCell(g,p.responseCell);
    if(afterDefender.mover===0&&
       afterDefender.heights[meta.column]===meta.row&&
       afterDefender.owner[p.responseCell]===-1)
      child=applyCpcxForcedEvent(afterDefender,p.responseCell);
  }
  rows.push({
    templateIndex:i,
    defect:t.defect,
    policyKind:p.kind,
    responseCell:p.responseCell,
    responseLabel:Number.isInteger(p.responseCell)?label(p.responseCell):null,
    child:childSummary(child),
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-trigger-option-localization.v0_1',
  sourceSequence:'4444441123312',
  sourceRank:source.rank,
  sourceSupport:Array.from(source.heights),
  target:'E4',
  sourceOneDefect:{
    kind:analysis.kind,
    totalRelevantEvents:analysis.totalRelevantEvents,
    fullCoverageTemplateCount:analysis.fullCoverageTemplateCount,
  },
  defenderTrigger:'A4',
  rows,
  premises:{
    diagnosticOnly:true,
    responseSet:'only responses prescribed by complete one-defect full-coverage templates',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

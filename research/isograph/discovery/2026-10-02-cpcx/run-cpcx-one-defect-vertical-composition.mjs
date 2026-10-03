import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  deriveCpcxVerticalOpponentSingletonEnvelope,
} from './cpcx-two-stage.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  p=buildCpcxPosition('444444112331211',{geometry:g}),
  attacker=0,targetCell=3*g.columns+4;

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function summary(position){
  if(position.terminal)return {
    rank:position.rank,mover:position.mover,
    support:Array.from(position.heights),
    terminal:position.terminal,
  };
  const one=analyzeCpcxOneDefectTargetReservoir(position,{attacker,targetCell}),
    ordinary=certifyCpcxTruncatedTargetReservoir(position,{attacker,targetCell}),
    progress=classifyCpcxProgress(position,{player:attacker}),
    cert=runCpcxFirstWinCertificate(position,{attacker});
  return {
    rank:position.rank,mover:position.mover,
    support:Array.from(position.heights),
    oneDefect:{
      kind:one.kind,
      totalRelevantEvents:one.totalRelevantEvents??null,
      fullCoverageTemplateCount:one.fullCoverageTemplateCount??null,
      minimumUncoveredResiduals:one.minimumUncoveredResiduals??null,
    },
    ordinary:{kind:ordinary.kind,seam:ordinary.seam??null},
    progress:{
      kind:progress.kind,
      source:progress.source??null,
      macroKind:progress.macro?.kind??null,
      primary:progress.macro?label(progress.macro.primaryCell):null,
      secondary:progress.macro?label(progress.macro.secondaryCell):null,
      certificateKind:progress.macro?.certificate?.kind??null,
    },
    certificate:{
      kind:cert.kind,
      player:cert.player??null,
      seam:cert.seam??null,
      traceLength:cert.trace?.length??0,
    },
  };
}

const rows=findCpcxVerticalTwoStageObligations(p,{player:attacker})
  .map(demand=>({demand,certificate:certifyCpcxVerticalTwoStage(p,demand)}));
const selected=rows.find(x=>x.certificate.exact&&[
  'PREEMPT_OR_FORCED_UPPER','FORCED_UPPER_RESPONSE',
  'ATTACKER_TERMINAL_ON_LOWER','PREEXISTING_CURRENT_TERMINAL',
].includes(x.certificate.kind));
if(!selected)throw new Error('no exact vertical row');

const {demand,certificate}=selected,
  defender=attacker^1,
  resolutions=[];

function add(kind,events,externalCell=null){
  let current=p,legal=true;
  for(const e of events){
    const meta=cpcxCell(g,e.cell);
    if(current.mover!==e.owner||
       current.heights[meta.column]!==meta.row||
       current.owner[e.cell]!==-1){
      legal=false;break;
    }
    current=applyCpcxForcedEvent(current,e.cell);
    if(current.terminal)break;
  }
  resolutions.push({
    kind,
    externalCell:externalCell===null?null:label(externalCell),
    events:events.map(e=>({cell:label(e.cell),owner:e.owner})),
    legal,
    state:legal?summary(current):null,
  });
}

if(certificate.kind==='PREEMPT_OR_FORCED_UPPER'){
  add('PREEMPT',[{cell:demand.lowerCell,owner:defender}]);
  for(const externalCell of certificate.nonpreemptFrontier){
    add('DELAYED',[
      {cell:externalCell,owner:defender},
      {cell:demand.lowerCell,owner:attacker},
      {cell:demand.upperCell,owner:defender},
    ],externalCell);
  }
}else if(certificate.kind==='FORCED_UPPER_RESPONSE'){
  add('FORCED_UPPER',[
    {cell:demand.lowerCell,owner:attacker},
    {cell:demand.upperCell,owner:defender},
  ]);
}

const envelope=certificate.exact
  ?deriveCpcxVerticalOpponentSingletonEnvelope(p,demand,certificate)
  :null;

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-vertical-composition-localization.v0_1',
  sequence:'444444112331211',
  source:summary(p),
  selected:{
    lower:label(demand.lowerCell),
    upper:label(demand.upperCell),
    line:demand.obligation.lineLabel,
    certificateKind:certificate.kind,
    nonpreemptFrontier:certificate.nonpreemptFrontier?.map(label)??null,
  },
  opponentSingletonEnvelope:envelope,
  resolutions,
  premises:{
    diagnosticOnly:true,
    expansion:'one already-qualified vertical two-stage macro response partition only',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  analyzeCpcxTargetReservoir,
  analyzeCpcxOneDefectTargetReservoir,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry();

const rows=[
  {name:'F9_A3_B2',sequence:'4444441123312',target:'E4'},
  {name:'F9_A3_A4',sequence:'4444441123311',target:'E4'},

  {name:'F17_A2_A3',sequence:'4444417765511',target:'C4'},
  {name:'F17_A2_E3',sequence:'4444417765515',target:'C4'},
  {name:'F17_A2_G3',sequence:'4444417765517',target:'C4'},
  {name:'F17_A2_D6',sequence:'4444417765514',target:'C4'},
  {name:'F17_A2_F2',sequence:'4444417765516',target:'C4'},

  {name:'F18_A2_A3',sequence:'4444417465511',target:'C4'},
  {name:'F18_A2_E3',sequence:'4444417465515',target:'C4'},
  {name:'F18_A2_F2',sequence:'4444417465516',target:'C4'},
  {name:'F18_A2_G2',sequence:'4444417465517',target:'C4'},
];

function cell(label){
  const column=label.charCodeAt(0)-65,row=Number(label.slice(1))-1;
  return row*g.columns+column;
}
function compactAnalysis(a){
  return {
    kind:a.kind,
    exact:a.exact??false,
    totalRelevantEvents:a.totalRelevantEvents??null,
    fullCoverageTemplateCount:a.fullCoverageTemplateCount??null,
    fullCoverageTemplatesTruncated:a.fullCoverageTemplatesTruncated??null,
    minimumUncoveredResiduals:a.minimumUncoveredResiduals??null,
    selectedDefect:a.selectedFullCoverageTemplate?.defect??null,
    bestUncovered:(a.bestPartialTemplates??[]).slice(0,3).map(t=>({
      defect:t.defect,
      uncovered:t.uncovered?.map(u=>({
        lineLabel:u.lineLabel,
        missingCount:u.missingCount,
        missingCells:u.missingCells,
      }))??[],
    })),
  };
}

const out=[];
for(const row of rows){
  let p;
  try{
    p=buildCpcxPosition(row.sequence,{geometry:g});
  }catch(error){
    out.push({...row,error:String(error)});
    continue;
  }
  const targetCell=cell(row.target),
    obligations=scanCpcxObligations(p),
    targetResidual=obligations.find(o=>
      o.player===0&&o.missingCount===1&&o.missingCells[0]===targetCell
    )??null,
    one=analyzeCpcxOneDefectTargetReservoir(p,{attacker:0,targetCell}),
    parity=analyzeCpcxTargetReservoir(p,{attacker:0,targetCell}),
    ordinary=certifyCpcxTruncatedTargetReservoir(p,{attacker:0,targetCell}),
    progress=classifyCpcxProgress(p,{player:0}),
    cert=runCpcxFirstWinCertificate(p,{attacker:0});
  out.push({
    ...row,
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    targetResidual:targetResidual?{
      lineLabel:targetResidual.lineLabel,
      supportDistance:targetResidual.events[0].supportDistance,
    }:null,
    parity:{
      kind:parity.kind,
      totalRelevantEvents:parity.totalRelevantEvents??null,
      oddColumns:parity.oddColumnLabels??null,
    },
    oneDefect:compactAnalysis(one),
    ordinary:{
      kind:ordinary.kind,
      seam:ordinary.seam??null,
    },
    progress:{
      kind:progress.kind,
      source:progress.source??null,
      macroKind:progress.macro?.kind??null,
      seam:progress.seam??null,
    },
    certificate:{
      kind:cert.kind,
      player:cert.player??null,
      seam:cert.seam??null,
      traceLength:cert.trace?.length??0,
    },
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-lower-child-localization.v0_1',
  rows:out,
  premises:{
    diagnosticOnly:true,
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

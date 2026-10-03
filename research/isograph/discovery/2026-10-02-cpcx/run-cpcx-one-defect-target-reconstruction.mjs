import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  rows=[
    {name:'REPAIR_E1',sequence:'44444411233121115'},
    {name:'REPAIR_G1',sequence:'44444411233121117'},
    {name:'REPAIR_C3',sequence:'44444411233121113'},
  ];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

const out=[];
for(const row of rows){
  const p=buildCpcxPosition(row.sequence,{geometry:g}),
    obs=scanCpcxObligations(p),
    targets=[...new Set(obs.filter(o=>
      o.player===0&&o.missingCount===1&&o.events[0].supportDistance>0
    ).map(o=>o.missingCells[0]))].sort((a,b)=>a-b),
    targetRows=[];
  for(const targetCell of targets){
    const residual=obs.find(o=>
        o.player===0&&o.missingCount===1&&o.missingCells[0]===targetCell
      ),
      one=analyzeCpcxOneDefectTargetReservoir(p,{attacker:0,targetCell}),
      ordinary=certifyCpcxTruncatedTargetReservoir(p,{attacker:0,targetCell});
    targetRows.push({
      targetCell,
      targetLabel:label(targetCell),
      lineLabel:residual?.lineLabel??null,
      supportDistance:residual?.events[0]?.supportDistance??null,
      oneDefect:{
        kind:one.kind,
        totalRelevantEvents:one.totalRelevantEvents??null,
        fullCoverageTemplateCount:one.fullCoverageTemplateCount??null,
        minimumUncoveredResiduals:one.minimumUncoveredResiduals??null,
        fullCoverageTemplatesTruncated:one.fullCoverageTemplatesTruncated??null,
      },
      ordinary:{
        kind:ordinary.kind,
        seam:ordinary.seam??null,
      },
    });
  }
  const progress=classifyCpcxProgress(p,{player:0}),
    cert=runCpcxFirstWinCertificate(p,{attacker:0});
  out.push({
    ...row,
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    targets:targetRows,
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
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-target-reconstruction.v0_1',
  rows:out,
  premises:{
    diagnosticOnly:true,
    targetRule:'all current P0 singleton residuals with positive support distance, reconstructed from exact child',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

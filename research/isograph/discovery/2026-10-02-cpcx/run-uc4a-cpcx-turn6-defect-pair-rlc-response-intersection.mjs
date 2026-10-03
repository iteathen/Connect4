import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  deriveCpcxSaturatedColumnRlcProfile,
} from './cpcx-saturated-column-cofactor.mjs';
import {
  certifyCpcxResidualDefectTransport,
} from './cpcx-residual-defect-transport.mjs';

const g=createCpcxGeometry(),center=3,root='44444';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function dominates(a,b){
  return a.A>=b.A&&a.B>=b.B&&(a.A>b.A||a.B>b.B);
}
function maxima(profile){
  const xs=profile.candidates;
  return xs.filter(x=>!xs.some(y=>y!==x&&dominates(y,x)));
}
function commonColumns(a,b){
  const B=new Set(b.map(x=>x.column));
  return a.filter(x=>B.has(x.column)).map(x=>x.column).sort((u,v)=>u-v);
}
function rowSummary(x){
  return {
    column:x.column+1,
    landing:label(x.landing),
    A:x.A,
    B:x.B,
    H:x.H,
  };
}

const rows=[];
for(const x of [1,2,3,5,6,7]){
  const defect=buildCpcxPosition(`${root}${x}4`,{geometry:g}),
    aligned=buildCpcxPosition(`${root}4${x}`,{geometry:g}),
    responses=[];

  for(const eventCell of frontier(defect)){
    const transport=certifyCpcxResidualDefectTransport(defect,aligned,{
      eventCell,
      saturatedColumn:center,
    });
    if(!transport.exact)
      throw new Error(`defect transport failed x=${x} cell=${label(eventCell)} ${transport.seam}`);

    const childDefect=applyCpcxForcedEvent(defect,eventCell),
      childAligned=applyCpcxForcedEvent(aligned,eventCell);

    if(childDefect.terminal||childAligned.terminal){
      responses.push({
        p2Event:label(eventCell),
        transportKind:transport.kind,
        defectTerminal:childDefect.terminal,
        alignedTerminal:childAligned.terminal,
        terminalDifference:
          JSON.stringify(childDefect.terminal)!==
          JSON.stringify(childAligned.terminal),
        sourceDefectSize:transport.sourceDefectSize??null,
        targetDefectSize:transport.targetDefectSize??null,
      });
      continue;
    }

    const qDefect=deriveCpcxSaturatedColumnRlcProfile(childDefect,{
        column:center,
      }),
      qAligned=deriveCpcxSaturatedColumnRlcProfile(childAligned,{
        column:center,
      });
    if(!qDefect.exact||!qAligned.exact)
      throw new Error('cofactor RLC profile failed');

    const mDefect=maxima(qDefect),
      mAligned=maxima(qAligned),
      common=commonColumns(mDefect,mAligned);

    responses.push({
      p2Event:label(eventCell),
      transportKind:transport.kind,
      sourceDefectSize:transport.sourceDefectSize??null,
      targetDefectSize:transport.targetDefectSize??null,
      defectDelta:transport.defectDelta??null,
      defectMaxima:mDefect.map(rowSummary),
      alignedMaxima:mAligned.map(rowSummary),
      commonMaxColumns:common.map(c=>c+1),
      hasCommonParetoResponse:common.length>0,
      sameParetoSet:
        JSON.stringify(mDefect.map(r=>r.column))===
        JSON.stringify(mAligned.map(r=>r.column)),
    });
  }

  rows.push({
    x,
    distanceFromCenter:Math.abs(x-4),
    defectSequence:`${root}${x}4`,
    alignedSequence:`${root}4${x}`,
    responses,
  });
}

const all=rows.flatMap(r=>r.responses.map(x=>({
  sourceX:r.x,
  distanceFromCenter:r.distanceFromCenter,
  ...x,
}))),
  nonterminal=all.filter(x=>
    x.defectTerminal===undefined&&x.alignedTerminal===undefined
  ),
  noCommon=nonterminal.filter(x=>!x.hasCommonParetoResponse),
  terminalDiff=all.filter(x=>x.terminalDifference===true);

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.turn6-defect-pair-rlc-response-intersection.v0_1',
  observation:'one arbitrary common P2 event from each center-handoff owner-exchange pair, followed by current-rank cofactored RLC Pareto comparison for P1',
  rows,
  summary:{
    pairCount:rows.length,
    responseCount:all.length,
    nonterminalResponseCount:nonterminal.length,
    terminalResponseCount:all.length-nonterminal.length,
    terminalDifferenceCount:terminalDiff.length,
    everyNonterminalPairHasCommonRlcParetoResponse:noCommon.length===0,
    noCommonResponseCases:noCommon.map(x=>({
      sourceX:x.sourceX,
      p2Event:x.p2Event,
      defectMaxima:x.defectMaxima,
      alignedMaxima:x.alignedMaxima,
    })),
    sameParetoSetCount:nonterminal.filter(x=>x.sameParetoSet).length,
    commonResponseCardinalityClasses:[
      ...new Set(nonterminal.map(x=>x.commonMaxColumns.length))
    ].sort((a,b)=>a-b),
    maxObservedDefectSize:Math.max(...all
      .map(x=>x.sourceDefectSize??0)),
    defectGrowthObserved:all.some(x=>
      Number.isInteger(x.sourceDefectSize)&&
      Number.isInteger(x.targetDefectSize)&&
      x.targetDefectSize>x.sourceDefectSize
    ),
  },
  boundary:{
    diagnosticOnly:true,
    exactlyOneCommonAdversaryEvent:true,
    nextControllerStepIsCurrentRankOnly:true,
    rlcRuleIsTheOriginalABParetoRuleOnExactSaturatedColumnCofactor:true,
    noSecondAdversaryLayer:true,
    noValueConclusion:true,
    noSolvedData:true,
    noOracle:true,
    noMinimax:true,
    noRecursiveSearch:true,
  },
},null,2));

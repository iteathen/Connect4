import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';

const g=createCpcxGeometry(),root='44444';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function liveLine(position,player,line){
  const opponent=player^1;
  return line.cells.every(cell=>position.owner[cell]!==opponent);
}
function tuple(position,column){
  if(position.heights[column]>=g.rows)return null;
  const landing=position.heights[column]*g.columns+column,
    mover=position.mover,
    A=g.lines.filter(line=>
      line.cells.includes(landing)&&liveLine(position,mover,line)
    ).length,
    B=g.lines.filter(line=>
      line.cells.includes(landing)&&liveLine(position,mover^1,line)
    ).length,
    H=g.rows-position.heights[column]-1;
  return {column:column+1,cell:label(landing),A,B,H};
}
function rows(position){
  return Array.from({length:g.columns},(_,c)=>tuple(position,c)).filter(Boolean);
}
function dominates(a,b){
  return a.A>=b.A&&a.B>=b.B&&(a.A>b.A||a.B>b.B);
}
function maxima(xs){
  return xs.filter(x=>!xs.some(y=>y!==x&&dominates(y,x)));
}
function diffCells(a,b){
  const out=[];
  for(let i=0;i<g.cellCount;i++)if(a.owner[i]!==b.owner[i])out.push(i);
  return out;
}
function affectedLines(cells){
  const s=new Set(cells);
  return g.lines.filter(line=>line.cells.some(cell=>s.has(cell)));
}

const exchangeRows=[1,2,3,5,6,7].map(x=>{
  const externalFirst=buildCpcxPosition(`${root}${x}4`,{geometry:g}),
    centerFirst=buildCpcxPosition(`${root}4${x}`,{geometry:g}),
    externalRows=rows(externalFirst),
    centerRows=rows(centerFirst),
    externalMax=maxima(externalRows),
    centerMax=maxima(centerRows),
    diffs=diffCells(externalFirst,centerFirst),
    incident=affectedLines(diffs);
  return {
    x,
    reflected:8-x,
    externalFirst:`${root}${x}4`,
    centerFirst:`${root}4${x}`,
    exchangeCells:diffs.map(label),
    affectedLineCount:incident.length,
    externalFirstMaxima:externalMax,
    centerFirstMaxima:centerMax,
    sameParetoActionSet:
      JSON.stringify(externalMax.map(r=>r.column))===
      JSON.stringify(centerMax.map(r=>r.column)),
    sameUniqueParetoAction:
      externalMax.length===1&&centerMax.length===1&&
      externalMax[0].column===centerMax[0].column,
    sameFullRlcTupleVector:
      JSON.stringify(externalRows)===JSON.stringify(centerRows),
  };
});

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.turn6-exchange-congruence-boundary.v0_1',
  observation:'RLC (A,B,H) action-selection comparison across exact x1<->D6 ownership-exchange pairs',
  exchangeRows,
  summary:{
    pairCount:exchangeRows.length,
    sameParetoActionSetMoves:exchangeRows
      .filter(x=>x.sameParetoActionSet).map(x=>x.x),
    sameUniqueParetoActionMoves:exchangeRows
      .filter(x=>x.sameUniqueParetoAction).map(x=>x.x),
    fullTupleVectorEqualMoves:exchangeRows
      .filter(x=>x.sameFullRlcTupleVector).map(x=>x.x),
    globalRlcExchangeCongruence:
      exchangeRows.every(x=>x.sameParetoActionSet),
    nearCenterExchangePreservesUniqueSelection:
      exchangeRows.filter(x=>x.x===3||x.x===5)
        .every(x=>x.sameUniqueParetoAction),
    farExchangeRequiresIncidentConeCorrection:
      exchangeRows.filter(x=>![3,5].includes(x.x))
        .every(x=>!x.sameParetoActionSet),
  },
  interpretation:{
    positive:'the x=3 and x=5 exchange pairs preserve the unique next RLC selected column even though A and B values exchange asymmetrically',
    negative:'the ownership exchange is not a global congruence of the raw RLC Pareto selector for x=1,2,6,7',
    consequence:'reuse must be claim-relative: the common support substrate and all lines outside the exchange cone may be reused exactly, while the 10-12 incident lines require a bounded correction theorem',
  },
  boundary:{
    diagnosticOnly:true,
    currentRankOnly:true,
    noSolvedData:true,
    noOracle:true,
    noRecursiveSearch:true,
    noValueConclusion:true,
  },
},null,2));

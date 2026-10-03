import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {collapseCpcxDebtRepairTokenProduct} from './cpcx-token-collapse.mjs';
import {classifyCpcxSuccessor} from './cpcx-successor.mjs';

const g=createCpcxGeometry();
const root=buildCpcxPosition('44444',{geometry:g});

function cellLabel(cell){
  const c=cell%g.columns,r=Math.floor(cell/g.columns);
  return `${String.fromCharCode(65+c)}${r+1}`;
}
function reflectCell(cell){
  const c=cell%g.columns,r=Math.floor(cell/g.columns);
  return r*g.columns+(g.columns-1-c);
}
function canonicalCell(cell,reflect){
  return reflect?reflectCell(cell):cell;
}
function canonicalizeCarrier(move,wing,carrier){
  if(carrier.kind!=='ABSTRACT_SUCCESSOR')return null;
  // Normalize the selected untouched wing to A/B/C.
  const reflect=wing.survivingFamily.columns[0]>3;
  return {
    reflect,
    nextMover:carrier.nextMover,
    rank:carrier.rank,
    residuals:carrier.guaranteedResiduals.map(r=>({
      player:r.player,
      orientation:r.orientation,
      missingCount:r.missingCount,
      cells:r.missingCells.map(c=>canonicalCell(c,reflect)).sort((a,b)=>a-b),
      labels:r.missingCells.map(c=>cellLabel(canonicalCell(c,reflect))).sort(),
      events:(r.events??[]).map(e=>({
        cell:canonicalCell(e.cell,reflect),
        label:cellLabel(canonicalCell(e.cell,reflect)),
        min:e.minSupportDistance,
        max:e.maxSupportDistance,
        parity:e.eventRankParity??null,
      })).sort((a,b)=>a.cell-b.cell),
    })).sort((a,b)=>
      a.player-b.player||
      a.missingCount-b.missingCount||
      a.cells.join(',').localeCompare(b.cells.join(','))
    ),
    blockerTokens:(carrier.blockerTokens??[]).map(t=>({
      owner:t.owner,
      maxCount:t.maxCount??null,
      exactCount:t.exactCount??null,
      directKillCapacity:t.directKillCapacity??null,
      supportOnly:t.supportOnly??null,
      cells:(t.candidateCells??[]).map(c=>canonicalCell(c,reflect)).sort((a,b)=>a-b),
      labels:(t.candidateCells??[]).map(c=>cellLabel(canonicalCell(c,reflect))).sort(),
    })),
    opponentSingletonEnvelope:carrier.opponentSingletonEnvelope??null,
    firstWinFacts:carrier.firstWinFacts??null,
  };
}

const rows=[];
for(let move=1;move<=7;move++){
  const column=move-1,actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,actionOwner:1,attacker:0,
    });
  const classes=[];
  for(const decisionIndex of [0,1]){
    const repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex}),
      carrier=collapseCpcxDebtRepairTokenProduct(root,wing,repair),
      progress=carrier.exact&&carrier.kind==='ABSTRACT_SUCCESSOR'
        ?classifyCpcxSuccessor(carrier,{attacker:0})
        :carrier;
    classes.push({
      decisionIndex,
      repair:{
        deviationFrontier:repair.deviationFrontier,
        deviationLabels:repair.deviationFrontier.map(cellLabel),
        guaranteedResiduals:repair.guaranteedResiduals.map(r=>({
          line:r.lineLabel,
          orientation:r.orientation,
          missingCount:r.missingCount,
          cells:r.missingCells,
          labels:r.missingCells.map(cellLabel),
          events:r.events,
        })),
      },
      carrier,
      canonical:canonicalizeCarrier(move,wing,carrier),
      progress:{
        kind:progress.kind,
        seam:progress.seam??null,
      },
    });
  }
  rows.push({
    move,
    actionCell,
    actionLabel:cellLabel(actionCell),
    untouchedWing:wing.survivingFamily.columns.map(c=>c+1),
    anchoredLine:wing.anchoredLine,
    classes,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6-seam-census.v0_1',
  root:'44444',
  recursive:false,
  oracleUsed:false,
  solvedDataUsed:false,
  rows,
},null,2));

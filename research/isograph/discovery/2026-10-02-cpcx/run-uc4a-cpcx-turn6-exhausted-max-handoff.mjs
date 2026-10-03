import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';

const g=createCpcxGeometry(),root='44444',center=3;

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function liveLine(position,player,line){
  const opponent=player^1;
  return line.cells.every(cell=>position.owner[cell]!==opponent);
}
function localTuple(position,column){
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
function candidateRows(position){
  return Array.from({length:g.columns},(_,c)=>localTuple(position,c))
    .filter(Boolean);
}
function dominates(a,b){
  return a.A>=b.A&&a.B>=b.B&&(a.A>b.A||a.B>b.B);
}
function maxima(rows){
  return rows.filter(x=>!rows.some(y=>y!==x&&dominates(y,x)));
}
function ownerDiff(a,b){
  const out=[];
  for(let cell=0;cell<g.cellCount;cell++)
    if(a.owner[cell]!==b.owner[cell])out.push({
      cell:label(cell),
      a:a.owner[cell],
      b:b.owner[cell],
    });
  return out;
}
function sideTokenCount(position){
  return Array.from(position.heights)
    .filter((_,c)=>c!==center).reduce((a,b)=>a+b,0);
}

const rootPosition=buildCpcxPosition(root,{geometry:g}),
  rootRows=candidateRows(rootPosition),
  rootMax=maxima(rootRows),
  rootCenter=rootRows.find(x=>x.column===4);

if(rootCenter.A!==6||rootCenter.B!==6||rootCenter.H!==0)
  throw new Error('unexpected root center tuple');
if(JSON.stringify(rootMax.map(x=>x.column))!==JSON.stringify([4]))
  throw new Error('unexpected root Pareto frontier');

const branches=[];
for(let sixth=1;sixth<=7;sixth++){
  const after=buildCpcxPosition(`${root}${sixth}`,{geometry:g}),
    rows=candidateRows(after),
    max=maxima(rows),
    centerRow=rows.find(x=>x.column===4)??null,
    response=sixth===4?3:4,
    child=buildCpcxPosition(`${root}${sixth}${response}`,{geometry:g});

  branches.push({
    sixthMove:sixth,
    class:sixth===4?'CENTER_CONSUMED':'CENTER_DECLINED',
    afterSixth:{
      mover:after.mover,
      support:Array.from(after.heights),
      paretoMaxima:max,
      centerTuple:centerRow,
      centerTuplePreservedFromRoot:
        sixth!==4&&
        centerRow?.A===rootCenter.A&&
        centerRow?.B===rootCenter.B&&
        centerRow?.H===rootCenter.H,
      centerRemainsUniqueMaximum:
        sixth!==4&&max.length===1&&max[0].column===4,
    },
    response:{
      column:response,
      reason:sixth===4
        ?'reflection-canonical side maximum after center consumption'
        :'inherited exhausted center maximum',
      childSequence:`${root}${sixth}${response}`,
      mover:child.mover,
      support:Array.from(child.heights),
      centerFull:child.heights[center]===g.rows,
      sideTokenCount:sideTokenCount(child),
    },
  });
}

const centerBranch=buildCpcxPosition('4444443',{geometry:g}),
  nearOffCenterBranch=buildCpcxPosition('4444434',{geometry:g}),
  exchange=ownerDiff(centerBranch,nearOffCenterBranch);

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.turn6-exhausted-max-handoff.v0_1',
  root,
  rootRlc:{
    mover:rootPosition.mover,
    candidates:rootRows,
    paretoMaxima:rootMax,
    exhaustedUniqueMaximum:rootCenter,
    oldBoundary:'UNIQUE_MAX_EXHAUSTS_COLUMN',
  },
  branches,
  centerVsNearOffCenterExchange:{
    centerConsumedThenP0Side:'4444443',
    offCenterThenP0Center:'4444434',
    supportEqual:
      JSON.stringify(Array.from(centerBranch.heights))===
      JSON.stringify(Array.from(nearOffCenterBranch.heights)),
    moverEqual:centerBranch.mover===nearOffCenterBranch.mover,
    ownerDifferences:exchange,
    exactTwoCellExchange:
      JSON.stringify(exchange.map(x=>x.cell).sort())===
      JSON.stringify(['C1','D6'].sort())&&
      exchange[0]?.a===exchange[1]?.b&&
      exchange[0]?.b===exchange[1]?.a,
  },
  summary:{
    rootCenterIsUniqueParetoMaximum:
      rootMax.length===1&&rootMax[0].column===4,
    rootCenterTuple:[rootCenter.A,rootCenter.B,rootCenter.H],
    allOffCenterMovesPassCenterTupleIntactToP0:
      branches.filter(x=>x.sixthMove!==4).every(x=>
        x.afterSixth.centerTuplePreservedFromRoot
      ),
    allOffCenterMovesLeaveCenterAsUniqueP0ParetoMaximum:
      branches.filter(x=>x.sixthMove!==4).every(x=>
        x.afterSixth.centerRemainsUniqueMaximum
      ),
    centerMoveConsumesMaximumAndLeavesSymmetricSideMaxima:
      JSON.stringify(branches.find(x=>x.sixthMove===4)
        .afterSixth.paretoMaxima.map(x=>x.column))===
      JSON.stringify([3,5]),
    everyPolicyResponseProducesFullCenterPlusOneSideToken:
      branches.every(x=>
        x.response.centerFull&&x.response.sideTokenCount===1
      ),
    centerBranchReentersNearOffCenterExchangeClass:
      JSON.stringify(exchange.map(x=>x.cell).sort())===
      JSON.stringify(['C1','D6'].sort()),
  },
  interpretation:{
    exhaustedMaximumHandoff:'At 44444, D6 is the unique rank-local (A,B) maximum but H=0. Any off-center P2 move is incidence-disjoint from the D6 local cone, so the exact (6,6,0) maximum is inherited unchanged by P1 and remains unique.',
    consumedMaximumBoundary:'If P2 consumes D6 instead, the center column becomes a fixed alternating parity spine and P1 receives the virgin six-column side substrate; the RLC Pareto frontier becomes the reflection pair {3,5}.',
    macroConvergence:'Using response 4 after every off-center sixth move, and representative response 3 (or reflected 5) after center closure, every branch reaches a full-center + one-side-token support class. The center branch and sixth-move-3 branch are the two ownership-exchange realizations of the same support state.',
  },
  theoremBoundary:{
    diagnosticOnly:true,
    exactRankLocalIncidence:true,
    noSolvedData:true,
    noOracle:true,
    noMinimax:true,
    noRecursiveSearch:true,
    noValueConclusion:true,
    nextProofObligation:'show the two-cell ownership exchange is a congruence for the relevant RLC/RCIC continuation claim, or localize the finite correction to its incident winning-line cone',
  },
},null,2));

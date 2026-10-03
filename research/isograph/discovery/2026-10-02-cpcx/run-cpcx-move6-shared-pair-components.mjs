import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {collapseCpcxDebtRepairTokenProduct} from './cpcx-token-collapse.mjs';
import {
  reflectCpcxCell,
  reflectCpcxOrientation,
} from './cpcx-control-quotient.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function canonicalCell(cell,reflect){
  return reflect?reflectCpcxCell(g,cell):cell;
}
function canonicalPhase(v,reflect){return reflect?[...v].reverse():[...v];}
function pairRecord(carrier,reflect){
  const rows=carrier.guaranteedResiduals.filter(r=>
    r.player===0&&
    r.missingCount===2&&
    ['D+','D-'].includes(r.orientation)
  ).map(r=>({
    lineId:r.lineId,
    orientation:reflect?reflectCpcxOrientation(r.orientation):r.orientation,
    cells:r.missingCells.map(x=>canonicalCell(x,reflect)).sort((a,b)=>a-b),
    events:r.events.map(e=>({
      cell:canonicalCell(e.cell,reflect),
      min:e.minSupportDistance,
      max:e.maxSupportDistance,
      parity:e.eventRankParity,
    })).sort((a,b)=>a.cell-b.cell),
  })).filter(r=>r.cells[0]===15&&r.cells[1]===23);
  if(rows.length!==1)return null;
  return rows[0];
}

const rows=[];
for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,actionOwner:1,attacker:0,
    }),
    repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex:0}),
    successor=collapseCpcxDebtRepairTokenProduct(root,wing,repair,{
      retainComponents:true,
    });
  if(successor.kind!=='ABSTRACT_SUCCESSOR'||!successor.exact)
    throw new Error('expected exact abstract first-deviation successor');
  const wingMean=wing.survivingFamily.columns.reduce((a,b)=>a+b,0)/
      wing.survivingFamily.columns.length,
    reflect=wingMean>(g.columns-1)/2,
    components=(successor.componentCarriers??[]).map((carrier,index)=>({
      index,
      rank:carrier.rank,
      nextMover:carrier.nextMover,
      pair:pairRecord(carrier,reflect),
      phase:carrier.supportPhase?.exact===true
        ?carrier.supportPhase.vectors.map(v=>canonicalPhase(v,reflect))
          .sort((a,b)=>a.join('').localeCompare(b.join('')))
        :null,
      blockerTokens:(carrier.blockerTokens??[]).map(t=>({
        owner:t.owner,
        maxCount:t.maxCount??null,
        directKillCapacity:t.directKillCapacity??null,
        supportOnly:t.supportOnly??null,
        candidateCells:(t.candidateCells??[])
          .map(x=>canonicalCell(x,reflect)).sort((a,b)=>a-b),
      })),
      firstWinClosed:
        carrier.firstWinFacts?.nextImmediateNormalizationClosed===true,
    }));
  rows.push({
    sixthMove:column+1,
    reflect,
    componentCount:components.length,
    components,
  });
}

const states=new Map();
for(const row of rows)for(const component of row.components){
  const key=JSON.stringify({
    rankParity:component.rank?.parity??null,
    rankDeltaOptions:component.rank?.deltaOptions??null,
    pair:component.pair,
    phase:component.phase,
    blockerTokens:component.blockerTokens,
    firstWinClosed:component.firstWinClosed,
  });
  if(!states.has(key))states.set(key,{key,members:[],sample:component});
  states.get(key).members.push({
    sixthMove:row.sixthMove,
    componentIndex:component.index,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.shared-pair-component-states.v0_1',
  root:'44444',
  rows,
  quotient:{
    classCount:states.size,
    classes:[...states.values()].map((x,i)=>({
      classId:`P${i+1}`,
      members:x.members,
      sample:x.sample,
    })),
  },
  premises:{
    source:'existing first-deviation debt/vertical/hazard polynomial collapse with retainComponents=true',
    futureReplyExpansion:false,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    minimax:false,
  },
  boundary:'component states are theorem-discovery coordinates. Any promoted pair-support law must be stated directly over residual attachment/support/phase and may not enumerate these components at runtime.',
},null,2));

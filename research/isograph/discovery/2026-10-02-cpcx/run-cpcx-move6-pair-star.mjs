import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {
  findCpcxPairStarHubLadders,
  certifyCpcxPairStarHubLadder,
} from './cpcx-pair-star.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

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
function inspect(position){
  const candidates=findCpcxPairStarHubLadders(position,{player:0}),
    rows=candidates.map(candidate=>({
      supportDepth:candidate.supportDepth,
      hub:label(candidate.hub),
      upperHub:label(candidate.upperHub),
      lowerLeaves:candidate.lowerLeaves.map(label),
      upperLeaves:candidate.upperLeaves.map(label),
      certificate:(()=>{
        const c=certifyCpcxPairStarHubLadder(position,candidate);
        return {
          kind:c.kind,
          exact:c.exact??false,
          source:c.source??null,
          defenderTerminalCells:c.defenderTerminalCells?.map(label)??null,
          branchCount:c.branches?.length??0,
          branchResults:c.branches?.map(x=>x.result)??[],
        };
      })(),
    }));
  return {
    rank:position.rank,
    mover:position.mover,
    support:Array.from(position.heights),
    candidateCount:candidates.length,
    certifiedCount:rows.filter(x=>x.certificate.exact).length,
    rows,
  };
}

const rows=[];
for(let column=0;column<g.columns;column++){
  const sixthCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells;

  for(const stolen of [t2,t3]){
    const p=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:stolen,owner:1},
    ]);
    if(!p)throw new Error('invalid first-decision theft');
    rows.push({
      sixthMove:column+1,
      class:stolen===t2?'FIRST_DECISION_STEAL_TRIGGER_2':'FIRST_DECISION_STEAL_TRIGGER_3',
      stolenTrigger:label(stolen),
      triggerOrder:[t1,t2,t3].map(label),
      pairStars:inspect(p),
    });
  }

  const second=materialize(root,[
    {cell:sixthCell,owner:1},
    {cell:t1,owner:0},
    {cell:r1,owner:1},
    {cell:t2,owner:0},
    {cell:t3,owner:1},
  ]);
  if(!second)throw new Error('invalid second-decision final theft');
  rows.push({
    sixthMove:column+1,
    class:'SECOND_DECISION_STEAL_FINAL_TRIGGER',
    stolenTrigger:label(t3),
    triggerOrder:[t1,t2,t3].map(label),
    pairStars:inspect(second),
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.pair-star-census.v0_1',
  root:'44444',
  rows,
  summary:{
    stateCount:rows.length,
    statesWithPairStar:rows.filter(x=>x.pairStars.candidateCount>0).length,
    statesWithCertifiedPairStar:rows.filter(x=>x.pairStars.certifiedCount>0).length,
    byClass:Object.fromEntries(
      [...new Set(rows.map(x=>x.class))].map(k=>[
        k,
        {
          count:rows.filter(x=>x.class===k).length,
          withCandidate:rows.filter(x=>x.class===k&&x.pairStars.candidateCount>0).length,
          withCertified:rows.filter(x=>x.class===k&&x.pairStars.certifiedCount>0).length,
        },
      ])
    ),
  },
  premises:{
    diagnosticOnly:true,
    theorem:'generic CPCX pair-star hub-ladder progress',
    standardBoard:'7x6',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

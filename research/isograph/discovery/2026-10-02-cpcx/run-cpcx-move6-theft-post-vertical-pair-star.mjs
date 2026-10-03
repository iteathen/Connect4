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
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
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
function exactVertical(position,column){
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player:0})){
    if(demand.column!==column)continue;
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    if(certificate.exact&&certificate.kind==='PREEMPT_OR_FORCED_UPPER')
      return {demand,certificate};
  }
  return null;
}
function pairStars(position){
  const rows=[];
  for(const candidate of findCpcxPairStarHubLadders(position,{player:0})){
    const certificate=certifyCpcxPairStarHubLadder(position,candidate);
    rows.push({
      supportDepth:candidate.supportDepth,
      hub:label(candidate.hub),
      upperHub:label(candidate.upperHub),
      exact:certificate.exact??false,
      kind:certificate.kind,
      source:certificate.source??null,
    });
  }
  return rows;
}

const rows=[];
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells;

  for(const stolen of [t2,t3]){
    const theft=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:stolen,owner:1},
    ]);
    if(!theft)throw new Error('invalid theft state');
    const repair=materialize(theft,[{cell:r1,owner:0}]);
    if(!repair)throw new Error('invalid theft repair');

    const vertical=exactVertical(repair,cpcxCell(g,t1).column);
    if(!vertical)throw new Error('expected exact vertical theorem');
    const {demand,certificate}=vertical;

    const preempt=materialize(repair,[{
      cell:demand.lowerCell,owner:1,
    }]);
    if(!preempt)throw new Error('invalid preempt state');
    rows.push({
      sixthMove:sixthColumn+1,
      stolenTrigger:label(stolen),
      resolution:'PREEMPT',
      externalCell:null,
      rank:preempt.rank,
      support:Array.from(preempt.heights),
      pairStars:pairStars(preempt),
    });

    for(const externalCell of certificate.nonpreemptFrontier){
      const delayed=materialize(repair,[
        {cell:externalCell,owner:1},
        {cell:demand.lowerCell,owner:0},
        {cell:demand.upperCell,owner:1},
      ]);
      if(!delayed)throw new Error('invalid delayed state');
      rows.push({
        sixthMove:sixthColumn+1,
        stolenTrigger:label(stolen),
        resolution:'DELAYED',
        externalCell:label(externalCell),
        rank:delayed.rank,
        support:Array.from(delayed.heights),
        pairStars:pairStars(delayed),
      });
    }
  }
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.theft-post-vertical-pair-star-census.v0_1',
  root:'44444',
  rows,
  summary:{
    stateCount:rows.length,
    withCandidate:rows.filter(x=>x.pairStars.length>0).length,
    withCertified:rows.filter(x=>x.pairStars.some(y=>y.exact)).length,
    certifiedPairStarCount:rows.reduce((n,x)=>
      n+x.pairStars.filter(y=>y.exact).length,0
    ),
    byResolution:Object.fromEntries(
      ['PREEMPT','DELAYED'].map(kind=>[
        kind,
        {
          count:rows.filter(x=>x.resolution===kind).length,
          withCandidate:rows.filter(x=>
            x.resolution===kind&&x.pairStars.length>0
          ).length,
          withCertified:rows.filter(x=>
            x.resolution===kind&&x.pairStars.some(y=>y.exact)
          ).length,
        },
      ])
    ),
  },
  premises:{
    diagnosticOnly:true,
    expansion:'stolen-trigger debt repair plus one already-qualified vertical two-stage resolution layer',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

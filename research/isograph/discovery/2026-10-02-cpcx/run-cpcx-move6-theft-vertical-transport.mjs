import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

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
  if(!v.legal)return null;
  const rank=position.rank+events.length;
  return {
    position:{
      geometry:position.geometry,
      moves:appendMoves(position,events),
      rank,
      mover:(position.mover+events.length)&1,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal:v.terminal?{player:v.terminal.player,lineId:v.terminal.lineId}:null,
    },
    terminal:v.terminal,
  };
}
function progressSummary(position){
  if(position.terminal)return {
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:position.terminal.player,
    source:'TERMINAL',
    seam:null,
  };
  const p=classifyCpcxProgress(position,{player:0}),
    c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    macroKind:p.macro?.kind??null,
    seam:c.seam??p.seam??null,
    certificateKind:c.kind,
    certificatePlayer:c.player??null,
    traceLength:c.trace?.length??0,
  };
}
function residualSummary(position){
  return scanCpcxObligations(position)
    .filter(o=>o.player===0&&o.missingCount<=3)
    .map(o=>({
      lineId:o.lineId,
      line:o.lineLabel,
      orientation:o.orientation,
      missingCount:o.missingCount,
      missing:o.missingCells.map(label),
      support:o.events.map(e=>({
        cell:label(e.cell),
        distance:e.supportDistance,
      })),
      playable:o.currentlyPlayableCells.map(label),
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      a.orientation.localeCompare(b.orientation)||
      a.lineId-b.lineId
    );
}
function exactVertical(position,column){
  const rows=[];
  for(const d of findCpcxVerticalTwoStageObligations(position,{player:0})){
    if(d.column!==column)continue;
    const certificate=certifyCpcxVerticalTwoStage(position,d);
    rows.push({demand:d,certificate});
  }
  return rows.find(x=>
    x.certificate.exact&&
    x.certificate.kind==='PREEMPT_OR_FORCED_UPPER'
  )??null;
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
    if(!theft||theft.terminal)throw new Error('invalid theft state');

    const repair=materialize(theft.position,[{cell:r1,owner:0}]);
    if(!repair||repair.terminal)throw new Error('invalid first-debt repair');

    const column=cpcxCell(g,t1).column,
      vertical=exactVertical(repair.position,column);
    if(!vertical)throw new Error('expected exact vertical transport');

    const {demand,certificate}=vertical,
      classes=[];

    const preempt=materialize(repair.position,[
      {cell:demand.lowerCell,owner:1},
    ]);
    if(!preempt)throw new Error('invalid preempt');
    classes.push({
      class:'PREEMPT',
      events:[{cell:label(demand.lowerCell),owner:1}],
      rank:preempt.position.rank,
      mover:preempt.position.mover,
      support:Array.from(preempt.position.heights),
      progress:progressSummary(preempt.position),
      residuals:residualSummary(preempt.position),
    });

    for(const externalCell of certificate.nonpreemptFrontier){
      const delayed=materialize(repair.position,[
        {cell:externalCell,owner:1},
        {cell:demand.lowerCell,owner:0},
        {cell:demand.upperCell,owner:1},
      ]);
      if(!delayed)throw new Error('invalid delayed class');
      classes.push({
        class:'DELAYED',
        externalCell:label(externalCell),
        events:[
          {cell:label(externalCell),owner:1},
          {cell:label(demand.lowerCell),owner:0},
          {cell:label(demand.upperCell),owner:1},
        ],
        rank:delayed.position.rank,
        mover:delayed.position.mover,
        support:Array.from(delayed.position.heights),
        progress:progressSummary(delayed.position),
        residuals:residualSummary(delayed.position),
      });
    }

    rows.push({
      sixthMove:sixthColumn+1,
      sixthCell:label(sixthCell),
      stolenTrigger:label(stolen),
      survivingWing:wing.survivingFamily.columns.map(x=>x+1),
      triggerOrder:[t1,t2,t3].map(label),
      debtRepair:label(r1),
      vertical:{
        lower:label(demand.lowerCell),
        upper:label(demand.upperCell),
        certificateKind:certificate.kind,
        nonpreemptCount:certificate.nonpreemptFrontier.length,
      },
      classes,
    });
  }
}

const outcomeCounts={};
for(const row of rows)for(const c of row.classes){
  const key=[c.class,c.progress.kind,c.progress.source??c.progress.macroKind??c.progress.seam??'NONE'].join('|');
  outcomeCounts[key]=(outcomeCounts[key]??0)+1;
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.theft-vertical-transport.v0_1',
  root:'44444',
  rows,
  summary:{
    theftStateCount:rows.length,
    resolutionClassCount:rows.reduce((n,x)=>n+x.classes.length,0),
    outcomeCounts,
  },
  premises:{
    standardBoard:'7x6',
    theoremDefinedExpansion:'first debt repair + exact vertical two-stage preempt/delayed classes only',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
    proofStatus:'DISCOVERY_ONLY',
  },
},null,2));

import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {closeCpcxForcedResponses,applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function reflectCell(cell){
  const {column,row}=cpcxCell(g,cell);
  return row*g.columns+(g.columns-1-column);
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
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:v.terminal?{player:v.terminal.player,lineId:v.terminal.lineId}:null,
  };
}
function verticalRows(position,attacker){
  const rows=[];
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player:attacker})){
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    rows.push({demand,certificate});
  }
  rows.sort((a,b)=>
    a.demand.lowerCell-b.demand.lowerCell||
    a.demand.upperCell-b.demand.upperCell||
    a.demand.obligation.lineId-b.demand.obligation.lineId
  );
  return rows;
}
function selectVertical(position,attacker){
  return verticalRows(position,attacker).find(x=>
    x.certificate.exact&&[
      'PREEMPT_OR_FORCED_UPPER',
      'FORCED_UPPER_RESPONSE',
      'ATTACKER_TERMINAL_ON_LOWER',
      'PREEXISTING_CURRENT_TERMINAL',
    ].includes(x.certificate.kind)
  )??null;
}
function physicalKey(position,reflect=false){
  const heights=reflect
    ?Array.from(position.heights).reverse()
    :Array.from(position.heights);
  const owner=[];
  for(let row=0;row<g.rows;row++)for(let column=0;column<g.columns;column++){
    const sourceColumn=reflect?g.columns-1-column:column;
    owner.push(position.owner[row*g.columns+sourceColumn]+1);
  }
  return `${position.mover}|${heights.join(',')}|${owner.join('')}`;
}
function canonicalPhysical(position){
  const direct=physicalKey(position,false),reflected=physicalKey(position,true);
  return reflected<direct?{key:reflected,reflect:true}:{key:direct,reflect:false};
}
function canonCell(cell,reflect){return reflect?reflectCell(cell):cell;}
function canonOrientation(orientation,reflect){
  if(!reflect)return orientation;
  if(orientation==='D+')return 'D-';
  if(orientation==='D-')return 'D+';
  return orientation;
}
function obligationSummary(position,reflect){
  const obs=scanCpcxObligations(position),
    small=obs.filter(o=>o.missingCount<=3).map(o=>({
      player:o.player,
      orientation:canonOrientation(o.orientation,reflect),
      missingCount:o.missingCount,
      missing:o.missingCells
        .map(cell=>canonCell(cell,reflect))
        .sort((a,b)=>a-b)
        .map(label),
      playable:o.events
        .filter(e=>e.supportDistance===0)
        .map(e=>canonCell(e.cell,reflect))
        .sort((a,b)=>a-b)
        .map(label),
    }));
  small.sort((a,b)=>
    a.player-b.player||
    a.missingCount-b.missingCount||
    a.orientation.localeCompare(b.orientation)||
    a.missing.join(',').localeCompare(b.missing.join(','))
  );
  return {
    counts:{
      p0:obs.filter(o=>o.player===0).reduce((m,o)=>
        (m[o.missingCount]=(m[o.missingCount]??0)+1,m),{}),
      p1:obs.filter(o=>o.player===1).reduce((m,o)=>
        (m[o.missingCount]=(m[o.missingCount]??0)+1,m),{}),
    },
    small,
  };
}
function triggerLiftSummary(position){
  if(position.mover!==0)return [];
  const out=[];
  for(let column=0;column<g.columns;column++){
    const row=position.heights[column];
    if(row>=g.rows)continue;
    const cell=row*g.columns+column,
      child=applyCpcxForcedEvent(position,cell),
      progress=classifyCpcxProgress(child,{player:0});
    out.push({
      triggerCell:label(cell),
      terminal:child.terminal,
      progress:{
        kind:progress.kind,
        exact:progress.exact??false,
        player:progress.player??null,
        source:progress.source??null,
        seam:progress.seam??null,
        macroKind:progress.macro?.kind??null,
        blockingCells:progress.obligation?.blockingCells?.map(label)??null,
      },
    });
  }
  return out;
}
function addState(groups,position,source){
  if(position.terminal)return;
  const progress=classifyCpcxProgress(position,{player:0}),
    opposingProgress=classifyCpcxProgress(position,{player:1});
  if(!['NO_CERTIFICATE','PROJECTION_ONLY'].includes(progress.kind))return;
  const canonical=canonicalPhysical(position);
  if(!groups.has(canonical.key))groups.set(canonical.key,{
    key:canonical.key,
    reflect:canonical.reflect,
    rank:position.rank,
    mover:position.mover,
    support:(canonical.reflect
      ?Array.from(position.heights).reverse()
      :Array.from(position.heights)),
    progress:{
      kind:progress.kind,
      seam:progress.seam??null,
      projectionCount:progress.projections?.length??0,
    },
    opposingProgress:{
      kind:opposingProgress.kind,
      exact:opposingProgress.exact??false,
      player:opposingProgress.player??null,
      source:opposingProgress.source??null,
      seam:opposingProgress.seam??null,
    },
    obligations:obligationSummary(position,canonical.reflect),
    triggerLift:triggerLiftSummary(position),
    sources:[],
  });
  groups.get(canonical.key).sources.push(source);
}
function resolutionStates(position,row,attacker,sourceBase,groups){
  const {demand,certificate}=row,defender=attacker^1,
    lower=demand.lowerCell,upper=demand.upperCell;
  if(certificate.kind==='PREEMPT_OR_FORCED_UPPER'){
    const preempt=materialize(position,[{cell:lower,owner:defender}]);
    if(preempt)addState(groups,preempt,{...sourceBase,resolution:'PREEMPT'});
    for(const externalCell of certificate.nonpreemptFrontier){
      const delayed=materialize(position,[
        {cell:externalCell,owner:defender},
        {cell:lower,owner:attacker},
        {cell:upper,owner:defender},
      ]);
      if(delayed)addState(groups,delayed,{
        ...sourceBase,
        resolution:'DELAYED',
        externalCell:label(externalCell),
      });
    }
  }else if(certificate.kind==='FORCED_UPPER_RESPONSE'){
    const forced=materialize(position,[
      {cell:lower,owner:attacker},
      {cell:upper,owner:defender},
    ]);
    if(forced)addState(groups,forced,{...sourceBase,resolution:'FORCED_UPPER'});
  }
}

export function buildCpcxMove6UnresolvedClassesArtifact(){
  const groups=new Map();
for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{actionCell,actionOwner:1,attacker:0});
  for(let decisionIndex=0;decisionIndex<=1;decisionIndex++){
    const repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex});
    for(const deviationCell of repair.deviationFrontier){
      const postRepair=materialize(root,[
        ...repair.prefix,
        {cell:deviationCell,owner:repair.defender},
        {cell:repair.requiredResponseCell,owner:repair.attacker},
      ]);
      if(!postRepair||postRepair.terminal)continue;
      const normalized=closeCpcxForcedResponses(postRepair);
      if(normalized.kind!=='OPEN')continue;
      const selected=selectVertical(normalized.position,repair.attacker);
      if(!selected) {
        addState(groups,normalized.position,{
          sixthMove:column+1,
          decisionIndex,
          deviationCell:label(deviationCell),
          resolution:'NO_EXACT_VERTICAL',
        });
        continue;
      }
      resolutionStates(
        normalized.position,
        selected,
        repair.attacker,
        {
          sixthMove:column+1,
          decisionIndex,
          deviationCell:label(deviationCell),
          verticalKind:selected.certificate.kind,
          lowerCell:label(selected.demand.lowerCell),
          upperCell:label(selected.demand.upperCell),
        },
        groups,
      );
    }
  }
}

const classes=[...groups.values()]
  .sort((a,b)=>a.rank-b.rank||a.key.localeCompare(b.key))
  .map((row,index)=>({...row,classId:`U${index+1}`}));

return {
  schema:'connect4.cpcx.move6.unresolved-current-state-classes.v0_1',
  root:'44444',
  classCount:classes.length,
  classes,
  premises:{
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    classKey:'exact occupancy + support + mover, quotiented only by board reflection',
    expansion:'one theorem-defined vertical resolution layer plus one current-frontier attacker cofactor probe',
  },
};
}


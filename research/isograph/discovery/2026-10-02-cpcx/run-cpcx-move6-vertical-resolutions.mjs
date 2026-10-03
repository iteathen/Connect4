import {createCpcxGeometry,buildCpcxPosition,cpcxCell} from './cpcx.mjs';
import {
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {verifyCpcxFixedEventScript} from './cpcx-wing.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';

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
  if(!v.legal)return {kind:'INVALID',exact:false,verification:v};
  const rank=position.rank+events.length;
  return {
    kind:v.terminal?'TERMINAL':'POSITION',
    exact:true,
    terminal:v.terminal,
    position:{
      geometry:position.geometry,
      moves:appendMoves(position,events),
      rank,
      mover:(position.mover+events.length)&1,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal:v.terminal?{player:v.terminal.player,lineId:v.terminal.lineId}:null,
    },
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

function progressSummary(p){
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    seam:p.seam??null,
    macro:p.macro?{
      kind:p.macro.kind,
      primaryCell:label(p.macro.primaryCell),
      secondaryCell:label(p.macro.secondaryCell),
      certificateKind:p.macro.certificate?.kind??null,
    }:null,
    blockingCells:p.obligation?.blockingCells?.map(label)??null,
    projectionCount:p.projections?.length??null,
  };
}

function resolutionClasses(position,row,attacker){
  const {demand,certificate}=row,defender=attacker^1,
    lower=demand.lowerCell,upper=demand.upperCell,out=[];
  function add(kind,events,externalCell=null){
    const m=materialize(position,events);
    if(!m.exact){
      out.push({kind,externalCell:externalCell===null?null:label(externalCell),legal:false});
      return;
    }
    const progress=m.terminal
      ?{kind:'CERTIFIED_FIRST_WIN',exact:true,player:m.terminal.player,source:'TERMINAL_RESOLUTION'}
      :classifyCpcxProgress(m.position,{player:attacker});
    out.push({
      kind,
      externalCell:externalCell===null?null:label(externalCell),
      events:events.map(e=>({cell:label(e.cell),owner:e.owner})),
      rank:m.position.rank,
      mover:m.position.mover,
      terminal:m.terminal,
      progress:progressSummary(progress),
    });
  }

  if(certificate.kind==='PREEMPT_OR_FORCED_UPPER'){
    add('PREEMPT',[{cell:lower,owner:defender}]);
    for(const externalCell of certificate.nonpreemptFrontier){
      add('DELAYED',[
        {cell:externalCell,owner:defender},
        {cell:lower,owner:attacker},
        {cell:upper,owner:defender},
      ],externalCell);
    }
  }else if(certificate.kind==='FORCED_UPPER_RESPONSE'){
    add('FORCED_UPPER',[
      {cell:lower,owner:attacker},
      {cell:upper,owner:defender},
    ]);
  }else{
    out.push({kind:certificate.kind,terminalByCertificate:true});
  }
  return out;
}

const rows=[];
for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{actionCell,actionOwner:1,attacker:0}),
    decisions=[];

  for(let decisionIndex=0;decisionIndex<=1;decisionIndex++){
    const repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex}),
      deviations=[];

    for(const deviationCell of repair.deviationFrontier){
      const prefix=[
          ...repair.prefix,
          {cell:deviationCell,owner:repair.defender},
          {cell:repair.requiredResponseCell,owner:repair.attacker},
        ],
        m=materialize(root,prefix);
      if(!m.exact||m.terminal){
        deviations.push({
          deviationCell:label(deviationCell),
          kind:m.terminal?'TERMINAL_AFTER_REPAIR':'INVALID_REPAIR',
          terminal:m.terminal??null,
        });
        continue;
      }

      const normalized=closeCpcxForcedResponses(m.position);
      if(normalized.kind==='CERTIFIED_FIRST_WIN'){
        deviations.push({
          deviationCell:label(deviationCell),
          kind:'NORMALIZATION_FIRST_WIN',
          player:normalized.player,
        });
        continue;
      }
      if(normalized.kind!=='OPEN'){
        deviations.push({
          deviationCell:label(deviationCell),
          kind:'NORMALIZATION_BOUNDARY',
          boundary:normalized.kind,
        });
        continue;
      }

      const selected=selectVertical(normalized.position,repair.attacker);
      if(!selected){
        deviations.push({
          deviationCell:label(deviationCell),
          kind:'NO_EXACT_VERTICAL',
          verticalRows:verticalRows(normalized.position,repair.attacker)
            .map(x=>x.certificate.kind),
        });
        continue;
      }

      deviations.push({
        deviationCell:label(deviationCell),
        kind:'VERTICAL_RESOLUTION_CLASS',
        normalizedRank:normalized.position.rank,
        normalizedMover:normalized.position.mover,
        lowerCell:label(selected.demand.lowerCell),
        upperCell:label(selected.demand.upperCell),
        certificateKind:selected.certificate.kind,
        resolutions:resolutionClasses(
          normalized.position,selected,repair.attacker
        ),
      });
    }

    decisions.push({decisionIndex,deviations});
  }

  rows.push({
    sixthMove:column+1,
    actionCell:label(actionCell),
    survivingWing:wing.survivingFamily.columns.map(x=>x+1),
    triggerOrder:wing.anchoredLine.triggerCells.map(label),
    decisions,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.vertical-resolution-progress.v0_1',
  root:'44444',
  rows,
  premises:{
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    expansion:'one theorem-defined vertical resolution layer only',
  },
},null,2));

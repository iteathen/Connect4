import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {deriveCpcxDisjunctiveBlockObligation} from './cpcx-cpc2.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
import {
  analyzeCpcxTruncatedTargetReservoirCoverage,
} from './cpcx-reservoir.mjs';

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
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
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
function cert(position){
  if(position.terminal)return {
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:position.terminal.player,
    source:'TERMINAL',
    seam:null,
    traceLength:0,
  };
  const p=classifyCpcxProgress(position,{player:0}),
    c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:c.kind,
    exact:c.exact,
    player:c.player??null,
    source:p.source??p.macro?.kind??p.kind,
    progressKind:p.kind,
    seam:c.seam??p.seam??null,
    traceLength:c.trace?.length??0,
    blockers:p.obligation?.blockingLabels??null,
  };
}
function pairRows(position){
  const rows=[];
  for(const o of scanCpcxObligations(position)){
    if(o.player!==0||o.missingCount!==2)continue;
    const events=o.missingCells.map(cell=>{
      const m=cpcxCell(g,cell),
        supportDistance=m.row-position.heights[m.column],
        frontierCell=position.heights[m.column]*g.columns+m.column;
      return {cell,column:m.column,row:m.row,supportDistance,frontierCell};
    });
    rows.push({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      orientation:o.orientation,
      cells:[...o.missingCells],
      events,
      distances:events.map(x=>x.supportDistance).sort((a,b)=>a-b),
    });
  }
  rows.sort((a,b)=>
    Math.max(...a.distances)-Math.max(...b.distances)||
    a.distances.reduce((x,y)=>x+y,0)-b.distances.reduce((x,y)=>x+y,0)||
    a.orientation.localeCompare(b.orientation)||
    a.lineId-b.lineId
  );
  return rows;
}
function ladderAttachments(position,pair){
  const obs=scanCpcxObligations(position).filter(o=>o.player===0),out=[];
  for(const liftRows of [2]){
    const lifted=pair.cells.map(cell=>cell+liftRows*g.columns);
    if(lifted.some(cell=>cell>=g.cellCount))continue;
    for(const o of obs){
      if(o.lineId===pair.lineId||o.orientation!==pair.orientation)continue;
      if(!lifted.every(cell=>o.missingCells.includes(cell)))continue;
      const extras=o.missingCells.filter(cell=>!lifted.includes(cell));
      if(extras.length!==1)continue;
      const x=cpcxCell(g,extras[0]),
        d=x.row-position.heights[x.column];
      if(d!==0)continue;
      out.push({
        lineId:o.lineId,
        lineLabel:o.lineLabel,
        triggerCell:extras[0],
        liftedCells:lifted,
      });
    }
  }
  return out;
}
function singletonLineage(position,lineId){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineId===lineId&&o.missingCount===1
  )??null;
}
function endpointResponses(afterDefender,pair){
  if(afterDefender.terminal||afterDefender.mover!==0)return [];
  const rows=[];
  for(const event of pair.events){
    const meta=cpcxCell(g,event.cell);
    if(afterDefender.heights[meta.column]!==meta.row||
       afterDefender.owner[event.cell]!==-1)continue;
    const child=applyCpcxForcedEvent(afterDefender,event.cell),
      c=cert(child),
      lineage=child.terminal?null:singletonLineage(child,pair.lineId),
      target=lineage?.missingCells?.[0],
      coverage=Number.isInteger(target)&&!child.terminal
        ?analyzeCpcxTruncatedTargetReservoirCoverage(
          child,{attacker:0,targetCell:target}
        )
        :null;
    rows.push({
      endpointCell:label(event.cell),
      terminal:child.terminal,
      certificate:c,
      lineage:lineage?{
        target:label(target),
        supportDistance:lineage.events[0].supportDistance,
      }:null,
      coverage:coverage?{
        kind:coverage.kind,
        fullCoverageTemplateCount:coverage.fullCoverageTemplateCount??null,
        minimumUncoveredResiduals:coverage.minimumUncoveredResiduals??null,
      }:null,
      certified:c.kind==='CERTIFIED_FIRST_WIN'&&c.player===0,
    });
  }
  return rows;
}

const sourceStates=[];
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
    if(!repair)throw new Error('invalid repair');
    const vertical=exactVertical(repair,cpcxCell(g,t1).column);
    if(!vertical)throw new Error('missing vertical');
    const {demand,certificate}=vertical,
      preempt=materialize(repair,[{cell:demand.lowerCell,owner:1}]);
    if(!preempt)throw new Error('invalid preempt');
    if(cert(preempt).kind!=='CERTIFIED_FIRST_WIN')sourceStates.push({
      position:preempt,
      sixthMove:sixthColumn+1,
      stolenTrigger:label(stolen),
      resolution:'PREEMPT',
      externalCell:null,
    });
    for(const externalCell of certificate.nonpreemptFrontier){
      const delayed=materialize(repair,[
        {cell:externalCell,owner:1},
        {cell:demand.lowerCell,owner:0},
        {cell:demand.upperCell,owner:1},
      ]);
      if(!delayed)throw new Error('invalid delayed');
      const c=cert(delayed);
      if(!(c.kind==='CERTIFIED_FIRST_WIN'&&c.player===0))sourceStates.push({
        position:delayed,
        sixthMove:sixthColumn+1,
        stolenTrigger:label(stolen),
        resolution:'DELAYED',
        externalCell:label(externalCell),
      });
    }
  }
}

const rows=[];
for(const src of sourceStates){
  const pairs=pairRows(src.position),pair=pairs[0];
  if(!pair)continue;
  const ladders=ladderAttachments(src.position,pair);
  for(const ladder of ladders){
    const afterTrigger=applyCpcxForcedEvent(src.position,ladder.triggerCell);
    if(afterTrigger.terminal){
      rows.push({
        sixthMove:src.sixthMove,stolenTrigger:src.stolenTrigger,
        resolution:src.resolution,externalCell:src.externalCell,
        pairLine:pair.lineLabel,pairProfile:pair.distances,
        upperLine:ladder.lineLabel,triggerCell:label(ladder.triggerCell),
        triggerTerminal:afterTrigger.terminal,
        cpc2:null,responses:[],
      });
      continue;
    }

    const cpc2=deriveCpcxDisjunctiveBlockObligation(
      afterTrigger,{attacker:0}
    );
    const responses=[];
    for(const defenderCell of frontier(afterTrigger)){
      const child=applyCpcxForcedEvent(afterTrigger,defenderCell);
      const base=cert(child),
        endpoint=endpointResponses(child,pair);
      responses.push({
        defenderCell:label(defenderCell),
        defenderTerminal:child.terminal,
        baseCertificate:base,
        endpointResponses:endpoint,
        closed:
          (base.kind==='CERTIFIED_FIRST_WIN'&&base.player===0)||
          endpoint.some(x=>x.certified),
      });
    }
    rows.push({
      sixthMove:src.sixthMove,stolenTrigger:src.stolenTrigger,
      resolution:src.resolution,externalCell:src.externalCell,
      rank:src.position.rank,
      pairLine:pair.lineLabel,
      pairOrientation:pair.orientation,
      pairProfile:pair.distances,
      pairCells:pair.cells.map(label),
      upperLine:ladder.lineLabel,
      triggerCell:label(ladder.triggerCell),
      cpc2:{
        kind:cpc2.kind,
        exact:cpc2.exact??false,
        blockers:cpc2.blockingLabels??[],
        seam:cpc2.seam??null,
      },
      responseCount:responses.length,
      closedResponseCount:responses.filter(x=>x.closed).length,
      allResponsesClosed:responses.every(x=>x.closed),
      responses,
    });
  }
}

const classCounts={};
for(const row of rows){
  const k=[
    row.pairProfile.join(','),
    row.cpc2.kind,
    row.allResponsesClosed?'CLOSED':'OPEN',
    row.closedResponseCount+'/'+row.responseCount,
  ].join('|');
  classCounts[k]=(classCounts[k]??0)+1;
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.ladder-trigger-response-census.v0_1',
  root:'44444',
  rows,
  summary:{
    unresolvedSourceStateCount:sourceStates.length,
    ladderTriggerStateCount:rows.length,
    triggerTerminals:rows.filter(x=>x.triggerTerminal).length,
    allResponsesClosedCount:rows.filter(x=>x.allResponsesClosed).length,
    cpc2ObligationCount:rows.filter(x=>
      x.cpc2?.kind==='DISJUNCTIVE_BLOCK_OBLIGATION'
    ).length,
    classCounts,
  },
  premises:{
    diagnosticOnly:true,
    expansion:'one mechanically attached +2 same-orientation ladder trigger, one complete current P1 frontier layer, then at most one lower-pair endpoint contraction',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

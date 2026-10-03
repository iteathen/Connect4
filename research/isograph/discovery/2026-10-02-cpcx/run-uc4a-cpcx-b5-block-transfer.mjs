import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  collapseCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';

const g=createCpcxGeometry(),
  defectLine='A6-B5-C4-D3',
  fixtures=[
    {id:'U4',sequence:'4444447677'},
    {id:'U5',sequence:'4444447577'},
    {id:'U12',sequence:'444444767577'},
    {id:'U13',sequence:'444444776566'},
  ];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%g.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return null;
  return {
    geometry:g,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function canonicalWing(w){
  return w.anchoredLine.triggerCells
    .map(cell=>cpcxCell(g,cell).column)
    .sort((a,b)=>a-b).join(',')==='0,1,2'&&
    cpcxCell(g,w.anchoredLine.anchorCell).column===3;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function residual(position,{player=0,lineLabel=defectLine}={}){
  return scanCpcxObligations(position).find(o=>
    o.player===player&&o.lineLabel===lineLabel
  )??null;
}
function residualSummary(r){
  if(!r)return null;
  return {
    lineId:r.lineId,
    lineLabel:r.lineLabel,
    orientation:r.orientation,
    missingCount:r.missingCount,
    missing:r.missingCells.map(label),
    support:r.events.map(e=>e.supportDistance),
    supportSum:r.events.reduce((n,e)=>n+e.supportDistance,0),
    eventParity:r.events.map(e=>e.eventRank&1),
    playable:r.currentlyPlayableCells.map(label),
  };
}
function progressSummary(p){
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    macroKind:p.macro?.kind??null,
    primaryCell:Number.isInteger(p.macro?.primaryCell)
      ?label(p.macro.primaryCell):null,
    secondaryCell:Number.isInteger(p.macro?.secondaryCell)
      ?label(p.macro.secondaryCell):null,
    blockerCells:(p.obligation?.blockingCells??[]).map(label),
  };
}
function diagonalAttachments(position,oldLineCells,blockedCell){
  const old=new Set(oldLineCells.filter(c=>c!==blockedCell));
  return scanCpcxObligations(position)
    .filter(o=>o.player===0&&(o.orientation==='D+'||o.orientation==='D-'))
    .map(o=>{
      const lineCells=g.lines[o.lineId].cells,
        overlap=lineCells.filter(c=>old.has(c));
      return {
        lineId:o.lineId,
        lineLabel:o.lineLabel,
        orientation:o.orientation,
        missingCount:o.missingCount,
        missing:o.missingCells.map(label),
        support:o.events.map(e=>e.supportDistance),
        playable:o.currentlyPlayableCells.map(label),
        overlapCells:overlap.map(label),
        overlapCount:overlap.length,
      };
    })
    .filter(x=>x.overlapCount>0)
    .sort((a,b)=>
      b.overlapCount-a.overlapCount||
      a.missingCount-b.missingCount||
      a.lineId-b.lineId
    );
}
function currentImmediate(position,player){
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===player&&
      o.missingCount===1&&
      o.events[0].supportDistance===0
    )
    .map(o=>o.missingCells[0])
    .sort((a,b)=>a-b);
}

const rows=[];
for(const f of fixtures){
  const source=buildCpcxPosition(f.sequence,{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
      .find(canonicalWing);
  if(!wing)throw new Error(`source wing missing ${f.id}`);

  const t=wing.anchoredLine.triggerCells,
    r=wing.anchoredLine.requiredResponseCells,
    short=materialize(source,[
      {cell:t[0],owner:0},
      {cell:r[0],owner:1},
      {cell:t[1],owner:0},
      {cell:t[2],owner:1},
      {cell:r[1],owner:0},
    ]);
  if(!short||short.mover!==1)throw new Error(`bad one-short source ${f.id}`);

  const demands=findCpcxVerticalTwoStageObligations(short,{player:0}),
    demand=demands.find(d=>label(d.lowerCell)==='B3'&&label(d.upperCell)==='B4');
  if(!demand)throw new Error(`B3/B4 vertical demand missing ${f.id}`);
  const certificate=certifyCpcxVerticalTwoStage(short,demand);
  if(!certificate.exact||certificate.kind!=='PREEMPT_OR_FORCED_UPPER')
    throw new Error(`B3/B4 parent certificate missing ${f.id}`);
  const collapsed=collapseCpcxVerticalTwoStage(short,demand,certificate),
    sourceDefect=residual(short);
  if(!sourceDefect)throw new Error(`source defect missing ${f.id}`);

  const preempt=applyCpcxForcedEvent(short,demand.lowerCell);
  if(preempt.terminal||preempt.mover!==0)
    throw new Error(`preempt state invalid ${f.id}`);
  const preemptDefect=residual(preempt);
  if(!preemptDefect)throw new Error(`preempt killed defect ${f.id}`);

  const support=applyCpcxForcedEvent(preempt,demand.upperCell);
  if(support.terminal||support.mover!==1)
    throw new Error(`B4 support state invalid ${f.id}`);
  const supportedDefect=residual(support),
    b5=sourceDefect.missingCells.find(cell=>cpcxCell(g,cell).column===1);
  if(!supportedDefect||!Number.isInteger(b5))
    throw new Error(`supported defect target missing ${f.id}`);
  const b5Event=supportedDefect.events.find(e=>e.cell===b5);
  if(!b5Event||b5Event.supportDistance!==0)
    throw new Error(`B5 not released ${f.id}`);

  const replyRows=[];
  for(const replyCell of frontier(support)){
    const child=applyCpcxForcedEvent(support,replyCell),
      rr={
        replyCell:label(replyCell),
        role:replyCell===b5?'BLOCK_B5':'EXTERNAL',
        terminal:child.terminal?{
          player:child.terminal.player,
          lineId:child.terminal.lineId,
        }:null,
      };

    if(!child.terminal&&replyCell===b5){
      rr.oldDefectAfterBlock=residualSummary(residual(child));
      rr.diagonalAttachments=diagonalAttachments(
        child,g.lines[sourceDefect.lineId].cells,b5
      );
      rr.progress=progressSummary(classifyCpcxProgress(child,{player:0}));
    }else if(!child.terminal){
      const meta=cpcxCell(g,b5),
        b5StillLegal=child.heights[meta.column]===meta.row&&child.owner[b5]===-1;
      rr.b5StillLegal=b5StillLegal;
      if(b5StillLegal){
        const take=applyCpcxForcedEvent(child,b5);
        rr.takeB5={
          terminal:take.terminal?{
            player:take.terminal.player,
            lineId:take.terminal.lineId,
          }:null,
          contractedDefect:residualSummary(residual(take)),
          opponentImmediate:take.terminal?[]:currentImmediate(take,1).map(label),
          progress:take.terminal?null:
            progressSummary(classifyCpcxProgress(take,{player:0})),
        };
      }
    }
    replyRows.push(rr);
  }

  const block=replyRows.find(x=>x.role==='BLOCK_B5'),
    external=replyRows.filter(x=>x.role==='EXTERNAL');

  rows.push({
    id:f.id,
    sequence:f.sequence,
    sourceRank:short.rank,
    parentVertical:{
      lineId:demand.obligation.lineId,
      lineLabel:demand.obligation.lineLabel,
      lower:label(demand.lowerCell),
      upper:label(demand.upperCell),
      certificateKind:certificate.kind,
      exact:certificate.exact,
      nonpreemptFrontier:certificate.nonpreemptFrontier.map(label),
      collapsed:{
        exact:collapsed.exact,
        rankDeltaOptions:collapsed.rankDeltaOptions,
        rankDeltaParity:collapsed.rankDeltaParity,
        nextMover:collapsed.nextMover,
        protectedDefectRetained:collapsed.guaranteedResiduals.some(x=>
          x.lineId===sourceDefect.lineId&&
          x.missingCells.join(',')===sourceDefect.missingCells.join(',')
        ),
      },
    },
    defect:{
      source:residualSummary(sourceDefect),
      afterPreempt:residualSummary(preemptDefect),
      afterP0B4:residualSummary(supportedDefect),
      sourceToPreemptSupportDelta:
        preemptDefect.events.reduce((n,e)=>n+e.supportDistance,0)-
        sourceDefect.events.reduce((n,e)=>n+e.supportDistance,0),
      preemptToSupportDelta:
        supportedDefect.events.reduce((n,e)=>n+e.supportDistance,0)-
        preemptDefect.events.reduce((n,e)=>n+e.supportDistance,0),
    },
    firstWinBeforeP1Reply:{
      p0Immediate:currentImmediate(support,0).map(label),
      p1Immediate:currentImmediate(support,1).map(label),
    },
    b5Block:block,
    externalReplies:external,
  });
}

function key(x){return JSON.stringify(x);}
const blockAttachmentKeys=rows.map(r=>
  key(r.b5Block?.diagonalAttachments??[])
);
const commonAttachmentLabels=(()=>{
  if(!rows.length)return [];
  let labels=(rows[0].b5Block?.diagonalAttachments??[])
    .map(x=>x.lineLabel);
  for(const row of rows.slice(1)){
    const s=new Set((row.b5Block?.diagonalAttachments??[]).map(x=>x.lineLabel));
    labels=labels.filter(x=>s.has(x));
  }
  return [...new Set(labels)].sort();
})();

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.b5-block-transfer.v0_1',
  observation:'one-support-short parent vertical collapse, then preempt-side B4 release of the protected diagonal B5 target',
  rows,
  summary:{
    allParentVerticalExact:rows.every(r=>
      r.parentVertical.exact&&
      r.parentVertical.certificateKind==='PREEMPT_OR_FORCED_UPPER'
    ),
    allParentCollapsesRetainDefect:rows.every(r=>
      r.parentVertical.collapsed.protectedDefectRetained
    ),
    parentRankDeltaOptions:[...new Set(rows.flatMap(r=>
      r.parentVertical.collapsed.rankDeltaOptions
    ))].sort((a,b)=>a-b),
    allPreemptDecreaseSupportDebtByOne:rows.every(r=>
      r.defect.sourceToPreemptSupportDelta===-1
    ),
    allP0B4DecreaseSupportDebtByOne:rows.every(r=>
      r.defect.preemptToSupportDelta===-1
    ),
    allB5ReleasedAfterP0B4:rows.every(r=>
      r.defect.afterP0B4?.playable?.includes('B5')
    ),
    anyImmediateP1TerminalBeforeB5Decision:rows.some(r=>
      r.firstWinBeforeP1Reply.p1Immediate.length>0
    ),
    allHaveB5BlockClass:rows.every(r=>r.b5Block!==undefined),
    oldDefectKilledByB5Block:rows.every(r=>
      r.b5Block?.oldDefectAfterBlock===null
    ),
    b5BlockAttachmentClassCount:new Set(blockAttachmentKeys).size,
    commonAttachedDiagonalLineLabels:commonAttachmentLabels,
    allExternalRepliesLeaveB5Legal:rows.every(r=>
      r.externalReplies.every(x=>x.b5StillLegal===true)
    ),
    allExternalTakeB5ContractsOldDefect:rows.every(r=>
      r.externalReplies.every(x=>
        x.takeB5?.contractedDefect?.missingCount===2
      )
    ),
    anyExternalTakeB5AllowsImmediateP1Terminal:rows.some(r=>
      r.externalReplies.some(x=>
        (x.takeB5?.opponentImmediate?.length??0)>0
      )
    ),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    replyEnumerationDiscoveryOnly:true,
    noReplyEnumerationPromoted:true,
    noValueConclusion:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
  },
},null,2));

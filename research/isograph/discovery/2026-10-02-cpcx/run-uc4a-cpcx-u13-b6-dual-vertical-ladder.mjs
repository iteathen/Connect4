import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {
  findCpcxVerticalThreeStageObligations,
  certifyCpcxVerticalThreeStageSetup,
} from './cpcx-three-stage.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  source=buildCpcxPosition('444444776566',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function cellByLabel(s){
  return (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65);
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)out[position.moves.length+i]=events[i].cell%g.columns;
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
function certSummary(c,d){
  return {
    lineId:d.obligation.lineId,
    lineLabel:d.obligation.lineLabel,
    setup:label(d.setupCell),
    middle:label(d.middleCell),
    upper:label(d.upperCell),
    kind:c.kind,
    exact:c.exact??false,
    player:c.player??null,
    seam:c.seam??null,
    childCertificateKind:c.childCertificate?.kind??null,
    totalRankDeltaOptions:c.totalRankDeltaOptions??null,
  };
}

const wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
  .find(canonicalWing);
if(!wing)throw new Error('wing missing');

const t=wing.anchoredLine.triggerCells,
  r=wing.anchoredLine.requiredResponseCells;
let p=materialize(source,[
  {cell:t[0],owner:0},
  {cell:r[0],owner:1},
  {cell:t[1],owner:0},
  {cell:t[2],owner:1},
  {cell:r[1],owner:0},
]);
if(!p)throw new Error('short state invalid');
for(const s of ['B3','B4','B5','C2','F4','A3','E2','E3']){
  p=applyCpcxForcedEvent(p,cellByLabel(s));
  if(p.terminal)throw new Error(`${s} terminal`);
}
const closed=closeCpcxForcedResponses(p);
if(closed.kind!=='OPEN')throw new Error('target block normalization not open');
p=closed.position;
if(p.rank!==26||p.mover!==0)throw new Error('expected rank26 P0 state');

const b6=cellByLabel('B6');
if(!frontier(p).includes(b6))throw new Error('B6 not current frontier');
const afterSetup=applyCpcxForcedEvent(p,b6);
if(afterSetup.terminal||afterSetup.mover!==1)
  throw new Error('B6 setup invalid');

const sourceLadders=findCpcxVerticalThreeStageObligations(afterSetup,{player:0})
  .map(d=>({
    lineId:d.obligation.lineId,
    lineLabel:d.obligation.lineLabel,
    column:d.column,
    setup:label(d.setupCell),
    middle:label(d.middleCell),
    upper:label(d.upperCell),
  }));

const rows=[];
for(const defenderCell of frontier(afterSetup)){
  const child=applyCpcxForcedEvent(afterSetup,defenderCell),
    row={
      defenderCell:label(defenderCell),
      terminal:child.terminal?{
        player:child.terminal.player,
        lineId:child.terminal.lineId,
      }:null,
      rank:child.rank,
      mover:child.mover,
      support:Array.from(child.heights),
    };

  if(!child.terminal){
    const immediate=classifyCpcxImmediate(child),
      demands=findCpcxVerticalThreeStageObligations(child,{player:0}),
      certificates=demands.map(d=>({
        demand:d,
        certificate:certifyCpcxVerticalThreeStageSetup(child,d),
      })),
      exact=certificates.filter(x=>x.certificate.exact),
      first=runCpcxFirstWinCertificate(child,{attacker:0});

    row.immediate={
      kind:immediate.kind,
      winningCells:(immediate.winningCells??[]).map(label),
      opponentThreatCells:(immediate.opponentThreatCells??immediate.threatCells??[]).map(label),
      forcedCell:Number.isInteger(immediate.cell)?label(immediate.cell):null,
    };
    row.ladders=certificates.map(x=>certSummary(x.certificate,x.demand));
    row.exactLadders=exact.map(x=>certSummary(x.certificate,x.demand));
    row.firstWin={
      kind:first.kind,
      exact:first.exact??false,
      player:first.player??null,
      seam:first.seam??null,
      traceLength:first.trace?.length??0,
    };
  }
  rows.push(row);
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.u13-b6-dual-vertical-ladder.v0_1',
  source:{
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    setupCell:'B6',
  },
  afterB6:{
    rank:afterSetup.rank,
    mover:afterSetup.mover,
    support:Array.from(afterSetup.heights),
    sourceLadders,
  },
  rows,
  summary:{
    defenderReplyCount:rows.length,
    defenderTerminalReplies:rows.filter(x=>x.terminal?.player===1)
      .map(x=>x.defenderCell),
    everyNonterminalReplyLeavesExactThreeStage:rows.every(x=>
      x.terminal?.player===0||
      (x.terminal===null&&(x.exactLadders?.length??0)>0)
    ),
    exactLadderCountsByReply:Object.fromEntries(rows.map(x=>[
      x.defenderCell,x.exactLadders?.length??0
    ])),
    exactLadderSetupsByReply:Object.fromEntries(rows.map(x=>[
      x.defenderCell,(x.exactLadders??[]).map(y=>y.setup)
    ])),
    firstWinReplies:rows.filter(x=>
      x.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&x.firstWin.player===0
    ).map(x=>x.defenderCell),
  },
  boundary:{
    diagnosticOnly:true,
    consumedU13Fixture:true,
    oneP0SetupPlusOneCurrentP1ReplyOnly:true,
    replyEnumerationDiscoveryOnly:true,
    noReplyEnumerationPromoted:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
  },
},null,2));

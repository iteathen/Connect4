import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
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
  if(!v.legal)return {kind:'INVALID',verification:v};
  const rank=position.rank+events.length,
    p={
      geometry:position.geometry,
      moves:appendMoves(position,events),
      rank,
      mover:(position.mover+events.length)&1,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal:v.terminal?{player:v.terminal.player,lineId:v.terminal.lineId}:null,
    };
  return {kind:v.terminal?'TERMINAL':'POSITION',position:p,terminal:v.terminal};
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function summary(position){
  const p=classifyCpcxProgress(position,{player:0}),
    c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    rank:position.rank,
    mover:position.mover,
    support:Array.from(position.heights),
    progress:{
      kind:p.kind,
      exact:p.exact??false,
      player:p.player??null,
      source:p.source??null,
      seam:p.seam??null,
      macroKind:p.macro?.kind??null,
      blockingCells:p.obligation?.blockingCells?.map(label)??null,
    },
    certificate:{
      kind:c.kind,
      exact:c.exact,
      player:c.player??null,
      seam:c.seam??null,
      traceLength:c.trace?.length??0,
    },
  };
}

const rows=[];
for(let column=0;column<g.columns;column++){
  const sixthCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells,
    first=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
    ]);
  if(first.kind!=='POSITION')throw new Error('first trigger did not produce decision state');

  const responses=[];
  for(const defenderCell of frontier(first.position)){
    const afterD=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
    ]);
    if(afterD.kind!=='POSITION'){
      responses.push({
        defenderCell:label(defenderCell),
        class:'DEFENDER_TERMINAL_OR_INVALID',
        terminal:afterD.terminal??null,
      });
      continue;
    }

    const cls=defenderCell===r1
      ?'HONOR_FIRST_SUPPORT'
      :defenderCell===t2
        ?'STEAL_TRIGGER_2'
        :defenderCell===t3
          ?'STEAL_TRIGGER_3'
          :'EXTERNAL_DEVIATION';

    if(defenderCell===t2||defenderCell===t3){
      responses.push({
        defenderCell:label(defenderCell),
        class:cls,
        state:summary(afterD.position),
      });
      continue;
    }

    const afterT2=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
      {cell:t2,owner:0},
    ]);
    if(afterT2.kind==='TERMINAL'){
      responses.push({
        defenderCell:label(defenderCell),
        class:cls,
        advance:{kind:'TERMINAL',terminal:afterT2.terminal},
      });
      continue;
    }
    if(afterT2.kind!=='POSITION'){
      responses.push({
        defenderCell:label(defenderCell),
        class:cls,
        advance:{kind:'INVALID'},
      });
      continue;
    }

    const immediate=classifyCpcxImmediate(afterT2.position);
    if(immediate.kind!=='FORCED_RESPONSE'||immediate.cell!==t3){
      responses.push({
        defenderCell:label(defenderCell),
        class:cls,
        advance:{
          kind:'NORMALIZATION_MISMATCH',
          immediate,
          state:summary(afterT2.position),
        },
      });
      continue;
    }

    const normalized=applyCpcxForcedEvent(afterT2.position,t3);
    responses.push({
      defenderCell:label(defenderCell),
      class:cls,
      advance:{
        kind:'FORCED_TRIGGER3_BLOCK',
        trigger2:label(t2),
        forcedBlock:label(t3),
        state:summary(normalized),
      },
    });
  }

  rows.push({
    sixthMove:column+1,
    sixthCell:label(sixthCell),
    survivingWing:wing.survivingFamily.columns.map(x=>x+1),
    triggerOrder:[t1,t2,t3].map(label),
    firstSupportResponse:label(r1),
    responses,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.forward-wing-partition.v0_1',
  root:'44444',
  rows,
  premises:{
    standardBoard:'7x6',
    firstWinPrecedence:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

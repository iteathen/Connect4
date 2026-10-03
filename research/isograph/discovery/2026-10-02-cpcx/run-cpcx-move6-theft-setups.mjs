import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
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
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function progressSummary(p){
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    seam:p.seam??null,
    macroKind:p.macro?.kind??null,
    blockingCells:p.obligation?.blockingCells?.map(label)??null,
  };
}

const rows=[];
for(let column=0;column<g.columns;column++){
  const sixthCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells;

  for(const stolen of [t2,t3]){
    const state=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:stolen,owner:1},
    ]);
    if(!state)throw new Error('invalid theft state');

    const setups=[];
    for(const setupCell of frontier(state)){
      const child=applyCpcxForcedEvent(state,setupCell);
      if(child.terminal){
        setups.push({
          setupCell:label(setupCell),
          terminal:child.terminal,
          certified:child.terminal.player===0,
          progress:child.terminal.player===0
            ?{kind:'CERTIFIED_FIRST_WIN',exact:true,player:0,source:'TERMINAL_ON_SETUP'}
            :{kind:'OPPONENT_TERMINAL',exact:true,player:1},
        });
        continue;
      }
      const progress=classifyCpcxProgress(child,{player:0}),
        certificate=runCpcxFirstWinCertificate(child,{attacker:0});
      setups.push({
        setupCell:label(setupCell),
        terminal:null,
        certified:certificate.kind==='CERTIFIED_FIRST_WIN'&&certificate.player===0,
        progress:progressSummary(progress),
        certificate:{
          kind:certificate.kind,
          exact:certificate.exact,
          player:certificate.player??null,
          seam:certificate.seam??null,
          traceLength:certificate.trace?.length??0,
          firstSource:certificate.trace?.[0]?.progress?.source??null,
        },
      });
    }

    rows.push({
      sixthMove:column+1,
      sixthCell:label(sixthCell),
      survivingWing:wing.survivingFamily.columns.map(x=>x+1),
      triggerOrder:[t1,t2,t3].map(label),
      stolenTrigger:label(stolen),
      support:Array.from(state.heights),
      certifiedSetups:setups.filter(x=>x.certified),
      allSetups:setups,
    });
  }
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.theft-setup-discovery.v0_1',
  root:'44444',
  rows,
  summary:{
    theftStateCount:rows.length,
    statesWithCertifiedSetup:rows.filter(x=>x.certifiedSetups.length>0).length,
    allTheftStatesHaveCertifiedSetup:rows.every(x=>x.certifiedSetups.length>0),
  },
  premises:{
    standardBoard:'7x6',
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    delayEquivalenceAssumed:false,
    proofStatus:'DISCOVERY_ONLY',
    expansion:'one current attacker setup followed only by existing CPCX exact certificate iteration',
  },
},null,2));

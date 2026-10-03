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
  if(!v.legal)return null;
  return {
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:v.terminal?{player:v.terminal.player,lineId:v.terminal.lineId}:null,
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
function certSummary(position){
  if(position.terminal)return {
    kind:'TERMINAL',
    exact:true,
    player:position.terminal.player,
    source:'TERMINAL',
    seam:null,
  };
  const progress=classifyCpcxProgress(position,{player:0}),
    cert=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:cert.kind,
    exact:cert.exact,
    player:cert.player??null,
    source:progress.source??progress.macro?.kind??progress.kind,
    seam:cert.seam??null,
    progressKind:progress.kind,
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
    const theft=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:stolen,owner:1},
    ]);
    if(!theft||theft.terminal)throw new Error('invalid theft state');

    const setups=[];
    for(const setupCell of frontier(theft)){
      const afterSetup=applyCpcxForcedEvent(theft,setupCell);
      if(afterSetup.terminal){
        setups.push({
          setupCell:label(setupCell),
          terminal:afterSetup.terminal,
          allRepliesCertified:afterSetup.terminal.player===0,
          replies:[],
        });
        continue;
      }

      const replies=[];
      for(const defenderCell of frontier(afterSetup)){
        const child=applyCpcxForcedEvent(afterSetup,defenderCell);
        const summary=certSummary(child);
        replies.push({
          defenderCell:label(defenderCell),
          support:Array.from(child.heights),
          certified:summary.kind==='CERTIFIED_FIRST_WIN'&&summary.player===0,
          result:summary,
        });
      }
      setups.push({
        setupCell:label(setupCell),
        terminal:null,
        replyCount:replies.length,
        certifiedReplyCount:replies.filter(x=>x.certified).length,
        allRepliesCertified:replies.every(x=>x.certified),
        replies,
      });
    }

    rows.push({
      sixthMove:column+1,
      stolenTrigger:label(stolen),
      support:Array.from(theft.heights),
      universalSetups:setups.filter(x=>x.allRepliesCertified),
      bestSetups:[...setups]
        .sort((a,b)=>
          (b.certifiedReplyCount??(b.allRepliesCertified?99:0))-
          (a.certifiedReplyCount??(a.allRepliesCertified?99:0))||
          a.setupCell.localeCompare(b.setupCell)
        )
        .slice(0,3),
    });
  }
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.theft-two-ply-setup-discovery.v0_1',
  root:'44444',
  rows,
  summary:{
    theftStateCount:rows.length,
    statesWithUniversalSetup:rows.filter(x=>x.universalSetups.length>0).length,
    allTheftStatesHaveUniversalSetup:rows.every(x=>x.universalSetups.length>0),
  },
  premises:{
    standardBoard:'7x6',
    solvedData:false,
    oracle:false,
    delayEquivalenceAssumed:false,
    recursiveSearch:false,
    proofStatus:'DISCOVERY_ONLY',
    expansion:'one current attacker setup and one complete current defender frontier layer; endpoints use only existing CPCX exact certificate iteration',
  },
},null,2));

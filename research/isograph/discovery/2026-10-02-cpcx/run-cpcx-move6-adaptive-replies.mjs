import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
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

function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}

function decisionPrefix(wing,decisionIndex){
  const events=[{cell:wing.action.cell,owner:wing.action.owner}];
  for(let i=0;i<=decisionIndex;i++){
    events.push({cell:wing.anchoredLine.triggerCells[i],owner:wing.attacker});
    if(i<decisionIndex)events.push({
      cell:wing.anchoredLine.requiredResponseCells[i],
      owner:wing.action.owner,
    });
  }
  return events;
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
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,actionOwner:1,attacker:0,
    }),
    decisions=[];

  for(const decisionIndex of [0,1]){
    const prefix=decisionPrefix(wing,decisionIndex),
      decision=materialize(root,prefix),
      required=wing.anchoredLine.requiredResponseCells[decisionIndex],
      deviations=frontier(decision).filter(cell=>cell!==required),
      deviationRows=[];

    for(const deviationCell of deviations){
      const afterDeviation=materialize(root,[
        ...prefix,{cell:deviationCell,owner:1},
      ]);
      if(!afterDeviation||afterDeviation.terminal){
        deviationRows.push({
          deviationCell:label(deviationCell),
          decisionTerminal:afterDeviation?.terminal??null,
          certifiedReplies:[],
        });
        continue;
      }

      const replies=[];
      for(const responseCell of frontier(afterDeviation)){
        const child=materialize(root,[
          ...prefix,
          {cell:deviationCell,owner:1},
          {cell:responseCell,owner:0},
        ]);
        if(!child)continue;
        if(child.terminal){
          replies.push({
            responseCell:label(responseCell),
            terminal:child.terminal,
            certified:child.terminal.player===0,
            progress:child.terminal.player===0
              ?{kind:'CERTIFIED_FIRST_WIN',exact:true,player:0,source:'TERMINAL_ON_ADAPTIVE_REPLY'}
              :{kind:'OPPONENT_TERMINAL',exact:true,player:1},
          });
          continue;
        }
        const progress=classifyCpcxProgress(child,{player:0}),
          certificate=runCpcxFirstWinCertificate(child,{attacker:0});
        replies.push({
          responseCell:label(responseCell),
          terminal:null,
          certified:certificate.kind==='CERTIFIED_FIRST_WIN'&&certificate.player===0,
          progress:progressSummary(progress),
          certificate:{
            kind:certificate.kind,
            exact:certificate.exact,
            player:certificate.player??null,
            seam:certificate.seam??null,
            traceLength:certificate.trace?.length??0,
          },
        });
      }

      const certifiedReplies=replies.filter(x=>x.certified);
      deviationRows.push({
        deviationCell:label(deviationCell),
        support:Array.from(afterDeviation.heights),
        certifiedReplies,
        allReplies:replies,
      });
    }

    decisions.push({
      decisionIndex,
      requiredResponseCell:label(required),
      deviationCount:deviationRows.length,
      closedDeviationCount:deviationRows.filter(x=>x.certifiedReplies.length>0).length,
      allDeviationsClosed:deviationRows.every(x=>x.certifiedReplies.length>0),
      deviations:deviationRows,
    });
  }

  rows.push({
    sixthMove:column+1,
    actionCell:label(actionCell),
    survivingWing:wing.survivingFamily.columns.map(x=>x+1),
    triggerOrder:wing.anchoredLine.triggerCells.map(label),
    honoredPathWin:wing.honoredPath.exact&&wing.honoredPath.terminalOnThirdTrigger,
    decisions,
    allDeviationClassesClosed:decisions.every(x=>x.allDeviationsClosed),
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.adaptive-deviation-replies.v0_1',
  root:'44444',
  rows,
  summary:{
    sixthMovesWithAllDeviationClassesClosed:rows
      .filter(x=>x.allDeviationClassesClosed)
      .map(x=>x.sixthMove),
    allSixthMovesClosed:rows.every(x=>x.allDeviationClassesClosed&&x.honoredPathWin),
  },
  premises:{
    standardBoard:'7x6',
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    responseSynthesis:'one current P0 reply after each theorem-defined wing deviation; child may advance only through CPCX deterministic normalization/exact macros and must terminate in an exact P0 first-win certificate',
    delayEquivalenceAssumed:false,
  },
},null,2));

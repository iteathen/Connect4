import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {deriveCpcxDisjunctiveBlockObligation} from './cpcx-cpc2.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {composeCpcxForcingMacro} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function smallResiduals(position){
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
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      a.orientation.localeCompare(b.orientation)||
      a.lineId-b.lineId
    );
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
      primary:label(p.macro.primaryCell),
      secondary:label(p.macro.secondaryCell),
      lineId:p.macro.lineId,
      line:p.macro.demand?.obligation?.lineLabel??null,
      certificateKind:p.macro.certificate?.kind??null,
    }:null,
    blockers:p.obligation?.blockingLabels??null,
  };
}

const rows=[];
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    afterSixth=applyCpcxForcedEvent(root,sixthCell);
  if(afterSixth.terminal)throw new Error('sixth terminal');

  for(const setupCell of frontier(afterSixth)){
    const afterSetup=applyCpcxForcedEvent(afterSixth,setupCell);
    if(afterSetup.terminal)continue;
    const cpc2=deriveCpcxDisjunctiveBlockObligation(afterSetup,{attacker:0});
    if(cpc2.kind!=='DISJUNCTIVE_BLOCK_OBLIGATION')continue;

    const blockers=[];
    for(const blockerCell of cpc2.blockingCells){
      const child=applyCpcxForcedEvent(afterSetup,blockerCell);
      if(child.terminal){
        blockers.push({
          blocker:label(blockerCell),
          terminal:child.terminal,
          beforeMacro:null,
          successor:null,
        });
        continue;
      }

      const progress=classifyCpcxProgress(child,{player:0});
      if(progress.kind!=='CERTIFIED_FORCING_MACRO'){
        blockers.push({
          blocker:label(blockerCell),
          terminal:null,
          beforeMacro:progressSummary(progress),
          successor:{
            kind:'NO_FORCING_MACRO',
            rank:child.rank,
            mover:child.mover,
            support:Array.from(child.heights),
            residuals:smallResiduals(child),
          },
        });
        continue;
      }

      const successor=composeCpcxForcingMacro(child,progress);
      if(!successor.exact||!successor.concretePosition){
        blockers.push({
          blocker:label(blockerCell),
          terminal:null,
          beforeMacro:progressSummary(progress),
          successor:{
            kind:successor.kind,
            exact:successor.exact??false,
            abstract:true,
            rank:successor.rank??null,
            nextMover:successor.nextMover??null,
          },
        });
        continue;
      }

      const next=successor.concretePosition,
        nextProgress=classifyCpcxProgress(next,{player:0});
      blockers.push({
        blocker:label(blockerCell),
        terminal:null,
        beforeMacro:progressSummary(progress),
        successor:{
          kind:'CONCRETE_SUCCESSOR',
          rank:next.rank,
          mover:next.mover,
          support:Array.from(next.heights),
          macroSource:successor.source,
          nextProgress:progressSummary(nextProgress),
          residuals:smallResiduals(next),
        },
      });
    }

    rows.push({
      sixthMove:sixthColumn+1,
      setup:label(setupCell),
      cpc2:{
        blockers:[...cpc2.blockingLabels],
        outsideMoveCount:cpc2.outsideMoveCertificates.length,
      },
      blockers,
    });
  }
}

const signatures=new Map();
for(const row of rows)for(const b of row.blockers){
  const s=b.successor;
  if(!s?.residuals)continue;
  const sig=JSON.stringify({
    macro:b.beforeMacro?.macro?.kind??null,
    nextProgress:s.nextProgress?.kind??null,
    residuals:s.residuals.map(r=>({
      o:r.orientation,
      n:r.missingCount,
      support:r.support.map(x=>x.distance).sort((a,b)=>a-b),
    })),
  });
  if(!signatures.has(sig))signatures.set(sig,{
    count:0,
    example:{
      sixthMove:row.sixthMove,
      setup:row.setup,
      blocker:b.blocker,
    },
    signature:JSON.parse(sig),
  });
  signatures.get(sig).count+=1;
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.restriction-ladder.v0_1',
  root:'44444',
  rows,
  summary:{
    restrictionSetupCount:rows.length,
    blockerChildCount:rows.reduce((n,x)=>n+x.blockers.length,0),
    concreteMacroSuccessorCount:rows.reduce((n,x)=>
      n+x.blockers.filter(b=>b.successor?.kind==='CONCRETE_SUCCESSOR').length,0
    ),
    abstractMacroSuccessorCount:rows.reduce((n,x)=>
      n+x.blockers.filter(b=>b.successor?.abstract===true).length,0
    ),
    signatureCount:signatures.size,
    signatures:[...signatures.values()].sort((a,b)=>b.count-a.count),
  },
  premises:{
    diagnosticOnly:true,
    expansion:'one P0 setup, exact CPC2 blocker restriction, then at most one already-certified CPCX forcing macro',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

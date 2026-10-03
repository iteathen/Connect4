import {createCpcxGeometry,buildCpcxPosition,cpcxCell} from './cpcx.mjs';
import {attemptCpcxDisjointWingFirstWin} from './cpcx-move6-certificate.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g}),
  result=attemptCpcxDisjointWingFirstWin(root,{attacker:0});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function residual(r){
  return {
    player:r.player,
    line:r.lineLabel,
    orientation:r.orientation,
    missingCount:r.missingCount,
    missing:(r.missingCells??[]).map(label),
    support:(r.events??[]).map(e=>({
      cell:label(e.cell),
      min:e.minSupportDistance??null,
      max:e.maxSupportDistance??null,
      parity:e.eventRankParity??null,
    })),
  };
}

function carrier(s){
  if(!s)return null;
  if(s.kind!=='ABSTRACT_SUCCESSOR')return {
    kind:s.kind,
    exact:s.exact??false,
    seam:s.seam??null,
  };
  return {
    kind:s.kind,
    exact:s.exact,
    nextMover:s.nextMover,
    rank:s.rank,
    guaranteedResiduals:(s.guaranteedResiduals??[]).map(residual),
    blockerTokens:(s.blockerTokens??[]).map(t=>({
      owner:t.owner,
      maxCount:t.maxCount??null,
      exactCount:t.exactCount??null,
      kind:t.kind??null,
      candidates:(t.candidateCells??[]).map(label),
      directKillCapacity:t.directKillCapacity??null,
      supportOnly:t.supportOnly??null,
    })),
    opponentSingletonEnvelope:s.opponentSingletonEnvelope??null,
    firstWinFacts:s.firstWinFacts??null,
    source:s.source??null,
  };
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6-carrier-diagnostic.v0_1',
  root:'44444',
  rows:result.rows.map(row=>({
    sixthMove:row.actionColumn+1,
    survivingWing:row.survivingWing?.map(x=>x+1)??null,
    responseClasses:(row.responseClasses??[]).map(x=>({
      class:x.class,
      result:{
        kind:x.result.kind,
        seam:x.result.seam??null,
      },
      successor:carrier(x.successor),
    })),
  })),
  premises:{
    solvedData:false,
    recursiveSearch:false,
    diagnosticOnly:true,
  },
},null,2));

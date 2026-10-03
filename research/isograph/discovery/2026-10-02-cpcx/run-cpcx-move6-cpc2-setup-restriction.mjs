import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {deriveCpcxDisjunctiveBlockObligation} from './cpcx-cpc2.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

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
function certSummary(position){
  if(position.terminal)return {
    kind:'CERTIFIED_FIRST_WIN',
    exact:true,
    player:position.terminal.player,
    seam:null,
    traceLength:0,
    firstSource:'TERMINAL',
  };
  const c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:c.kind,
    exact:c.exact,
    player:c.player??null,
    seam:c.seam??null,
    traceLength:c.trace?.length??0,
    firstSource:c.trace?.[0]?.progress?.source??c.trace?.[0]?.progress?.kind??null,
  };
}

const rows=[];
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    afterSixth=applyCpcxForcedEvent(root,sixthCell);
  if(afterSixth.terminal)throw new Error('sixth move unexpectedly terminal');
  if(afterSixth.mover!==0)throw new Error('expected P0 after sixth move');

  const setups=[];
  for(const setupCell of frontier(afterSixth)){
    const afterSetup=applyCpcxForcedEvent(afterSixth,setupCell);
    if(afterSetup.terminal){
      setups.push({
        setupCell:label(setupCell),
        class:'TERMINAL_ON_SETUP',
        certified:afterSetup.terminal.player===0,
        terminal:afterSetup.terminal,
        cpc2:null,
        blockerChildren:[],
      });
      continue;
    }

    const direct=certSummary(afterSetup);
    if(direct.kind==='CERTIFIED_FIRST_WIN'&&direct.player===0){
      setups.push({
        setupCell:label(setupCell),
        class:'EXISTING_CPCX_FIRST_WIN',
        certified:true,
        direct,
        cpc2:null,
        blockerChildren:[],
      });
      continue;
    }

    const cpc2=deriveCpcxDisjunctiveBlockObligation(afterSetup,{attacker:0});
    if(cpc2.kind==='CERTIFIED_FIRST_WIN'){
      setups.push({
        setupCell:label(setupCell),
        class:'CPC2_NO_BLOCKING_MOVE',
        certified:cpc2.player===0,
        direct,
        cpc2:{
          kind:cpc2.kind,
          exact:cpc2.exact,
          blockingLabels:[],
          outsideMoveCount:cpc2.outsideMoveCertificates?.length??null,
        },
        blockerChildren:[],
      });
      continue;
    }

    if(cpc2.kind!=='DISJUNCTIVE_BLOCK_OBLIGATION'){
      setups.push({
        setupCell:label(setupCell),
        class:'NO_EXACT_CPC2_RESTRICTION',
        certified:false,
        direct,
        cpc2:{
          kind:cpc2.kind,
          exact:cpc2.exact??false,
          seam:cpc2.seam??null,
        },
        blockerChildren:[],
      });
      continue;
    }

    const blockerChildren=[];
    for(const blockerCell of cpc2.blockingCells){
      const child=applyCpcxForcedEvent(afterSetup,blockerCell),
        certificate=certSummary(child);
      blockerChildren.push({
        blockerCell:label(blockerCell),
        terminal:child.terminal,
        certificate,
        certified:
          certificate.kind==='CERTIFIED_FIRST_WIN'&&certificate.player===0,
      });
    }

    setups.push({
      setupCell:label(setupCell),
      class:'CPC2_RESTRICTION',
      certified:blockerChildren.every(x=>x.certified),
      direct,
      cpc2:{
        kind:cpc2.kind,
        exact:cpc2.exact,
        blockingLabels:[...cpc2.blockingLabels],
        outsideMoveCount:cpc2.outsideMoveCertificates.length,
        responseCapacity:cpc2.responseCapacity,
      },
      blockerChildren,
    });
  }

  rows.push({
    sixthMove:sixthColumn+1,
    sixthCell:label(sixthCell),
    support:Array.from(afterSixth.heights),
    certifiedSetups:setups.filter(x=>x.certified),
    bestRestrictionSetups:[...setups]
      .filter(x=>x.class==='CPC2_RESTRICTION')
      .sort((a,b)=>
        a.blockerChildren.filter(x=>!x.certified).length-
          b.blockerChildren.filter(x=>!x.certified).length||
        a.blockerChildren.length-b.blockerChildren.length||
        a.setupCell.localeCompare(b.setupCell)
      )
      .slice(0,3),
    allSetups:setups,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.one-setup-cpc2-restriction.v0_1',
  root:'44444',
  rows,
  summary:{
    sixthMoveCount:rows.length,
    movesWithCertifiedSetup:rows.filter(x=>x.certifiedSetups.length>0).map(x=>x.sixthMove),
    allSixthMovesClosed:rows.every(x=>x.certifiedSetups.length>0),
    certifiedSetupCounts:Object.fromEntries(rows.map(x=>[
      String(x.sixthMove),x.certifiedSetups.length
    ])),
  },
  premises:{
    standardBoard:'7x6',
    proofStatus:'DISCOVERY_ONLY',
    boundedComposition:'one current P0 setup + one exact CPC2 defender restriction layer + existing nonrecursive CPCX certificate iteration on restriction children',
    unrestrictedDefenderEnumeration:false,
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));

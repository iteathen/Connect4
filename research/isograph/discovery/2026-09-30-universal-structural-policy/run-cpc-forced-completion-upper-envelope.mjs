#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-forced-completion-upper-envelope.mjs <JSMinSys checkout>');

const EXPECTED_SHA='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED_SHA);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

function moves(sequence){return Array.from(sequence,c=>Number(c)-1);}
function state(sequence){
  return connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
}
function absInterval(s){return [s.interval[0]-2,s.interval[1]-2];}
function bitMarked(bits,cell){return (bits[cell>>>5]&(1<<(cell&31)))!==0;}
function bitCells(bits){
  const out=[];
  for(let cell=0;cell<g.cellCount;cell++)if(bitMarked(bits,cell))
    out.push({cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1});
  return out;
}
function legalColumns(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function maskColumns(mask){
  const out=[];
  for(let c=0;c<g.columns;c++)if(mask&(1<<c))out.push(c+1);
  return out;
}

function evaluate(sequence){
  const q=state(sequence);
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  const rank=q.words[g.metaOffset]>>>2;
  return {
    sequence,q,scratch,kind,kindName:KIND.get(kind),rank,mover:rank&1,
    interval:absInterval(scratch),
    terminal:q.words[g.metaOffset]&3,
  };
}

function aggregateProfile(e,attacker){
  const attackerBits=attacker===0?e.scratch.activeSingletonCells:e.scratch.activeSingletonCellsOther;
  const defenderBits=attacker===0?e.scratch.activeSingletonCellsOther:e.scratch.activeSingletonCells;
  const attackerCells=bitCells(attackerBits);
  const defenderCells=bitCells(defenderBits);
  const playableAttacker=attackerCells.filter(x=>e.q.words[g.cellColumn[x.cell]]===g.cellRow[x.cell]);
  const playableDefender=defenderCells.filter(x=>e.q.words[g.cellColumn[x.cell]]===g.cellRow[x.cell]);
  return {attackerBits,defenderBits,attackerCells,defenderCells,playableAttacker,playableDefender};
}

function tacticalOpponentWinUpper(e,attacker){
  const attackerValue=attacker===0?1:-1;
  if(e.terminal!==0)return null;
  if(e.kind!==CPC_EXACT || e.interval[0]!==attackerValue || e.interval[1]!==attackerValue)return null;

  const p=aggregateProfile(e,attacker);
  if(p.playableAttacker.length>=2){
    return {upper:2,route:'MULTIPLE_PLAYABLE_SINGLETONS',playableTargets:p.playableAttacker.map(x=>({column:x.column,row:x.row}))};
  }

  if(p.playableAttacker.length===1){
    const target=p.playableAttacker[0];
    const c=target.column-1;
    const h=e.q.words[c];
    const aboveRow=h+1;
    if(aboveRow<g.rows){
      const above=aboveRow*g.columns+c;
      if(bitMarked(p.attackerBits,above)){
        return {
          upper:2,
          route:'STACKED_SINGLETON_RELEASE',
          playableTarget:{column:target.column,row:target.row},
          releasedTarget:{column:c+1,row:aboveRow+1},
        };
      }
    }
  }

  if(p.playableAttacker.length===0 && p.attackerCells.length){
    const legal=legalColumns(e.q);
    const lifted=[];
    let allLift=legal.length>0;
    for(const c of legal){
      const h=e.q.words[c],aboveRow=h+1;
      if(aboveRow>=g.rows){allLift=false;break;}
      const cell=aboveRow*g.columns+c;
      if(!bitMarked(p.attackerBits,cell)){allLift=false;break;}
      lifted.push({column:c+1,row:aboveRow+1});
    }
    if(allLift)return {upper:2,route:'ALL_LEGAL_MOVES_SINGLETON_LIFT',liftedTargets:lifted};
  }

  if(e.scratch.precursorCount[0]>0 && e.scratch.preemptionCount[0]===0){
    return {
      upper:4,
      route:'FORK_PRECURSOR_DEFICIENCY',
      precursorCount:e.scratch.precursorCount[0],
    };
  }

  throw new Error('Pinned CPC returned exact opponent win through an unclassified nonterminal route at '+e.sequence);
}

function restriction(e){
  if(e.kind!==CPC_RESTRICT || e.scratch.preemptionCount[0]!==1 || e.scratch.forcedColumn[0]<0)return null;
  return {
    forcedColumn:e.scratch.forcedColumn[0]+1,
    preemptionColumns:maskColumns(e.scratch.preemptionMask32[0]>>>0),
    noncompliantUpper:4,
  };
}

function summarize(e,attacker){
  const t=tacticalOpponentWinUpper(e,attacker);
  const r=restriction(e);
  const p=aggregateProfile(e,attacker);
  return {
    sequence:e.sequence,
    rank:e.rank,
    mover:e.mover+1,
    basisSize:e.q.basis.length,
    kind:e.kindName,
    absoluteInterval:e.interval,
    terminalCode:e.terminal,
    tacticalUpper:t,
    restriction:r,
    aggregateSingletonProfile:{
      attacker:p.attackerCells.map(({cell,...x})=>x),
      defender:p.defenderCells.map(({cell,...x})=>x),
      playableAttacker:p.playableAttacker.map(({cell,...x})=>x),
      playableDefender:p.playableDefender.map(({cell,...x})=>x),
    },
    precursorCount:e.scratch.precursorCount[0],
    preemptionCount:e.scratch.preemptionCount[0],
  };
}

// Hall-fork control: 2232 --A4--> CPC exact attacker win in <=2 more plies.
const hallRoot='2232';
const hallAttacker=hallRoot.length&1;
const hallPost=evaluate(hallRoot+'4');
const hallTactical=tacticalOpponentWinUpper(hallPost,hallAttacker);
assert(hallTactical,'expected CPC exact-loss route after 2232 + setup 4');
assert.equal(hallTactical.upper,2);
const hallUpper=1+hallTactical.upper;
assert.equal(hallUpper,3);

// Forced-singleton-lift control expressed through CPC restriction transport.
const chainRoot='32612636';
const chainAttacker=chainRoot.length&1;
const chainAfterSetup=evaluate(chainRoot+'4');
const chainRestrict=restriction(chainAfterSetup);
assert(chainRestrict,'expected unique CPC restriction after first setup');
assert.equal(chainRestrict.forcedColumn,5);

const chainAfterForced=chainRoot+'45';
const chainFinalPost=evaluate(chainAfterForced+'4');
const chainFinalTactical=tacticalOpponentWinUpper(chainFinalPost,chainAttacker);
assert(chainFinalTactical,'expected CPC exact-loss route after second setup');
assert.equal(chainFinalTactical.upper,2);

const chainChildUpper=1+chainFinalTactical.upper; // attacker setup at R + CPC tactical upper
assert.equal(chainChildUpper,3);
const chainPostFirstSetupUpper=Math.max(chainRestrict.noncompliantUpper,1+chainChildUpper);
assert.equal(chainPostFirstSetupUpper,4);
const chainUpper=1+chainPostFirstSetupUpper;
assert.equal(chainUpper,5);

// Consumed v4 boundary: one attacker setup, plus exact compliant transport for unique restrictions.
const v4Root='444441566';
const lower=new Map([[2,3],[3,3],[6,5]]);
const boundary=[];
for(const candidate of [2,3,6]){
  const childSequence=v4Root+candidate;
  const attacker=childSequence.length&1;
  const q=state(childSequence);
  const setups=[];
  for(const c of legalColumns(q)){
    const post=evaluate(childSequence+String(c+1));
    const t=tacticalOpponentWinUpper(post,attacker);
    const r=restriction(post);
    let compliant=null;
    if(r){
      const compliantSequence=post.sequence+String(r.forcedColumn);
      const compliantEval=evaluate(compliantSequence);
      compliant=summarize(compliantEval,attacker);
    }
    setups.push({
      setupColumn:c+1,
      postSetup:summarize(post,attacker),
      compliantSuccessor:compliant,
    });
  }

  if(candidate===2||candidate===3){
    assert(setups.every(x=>x.postSetup.kind==='CPC_NONE'));
  }else{
    const forced=setups.filter(x=>x.postSetup.restriction);
    assert.deepEqual(forced.map(x=>[x.setupColumn,x.postSetup.restriction.forcedColumn]),[[2,3],[3,2]]);
    assert(forced.every(x=>x.compliantSuccessor.kind==='CPC_NONE'));
  }

  boundary.push({
    candidate,
    childSequence,
    lowerFromCpcEnvelope:lower.get(candidate),
    finiteUpperFromThisGrammar:null,
    interval:[lower.get(candidate),null],
    setups,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_forced_completion_upper_envelope.v1',
  createdAt:new Date().toISOString(),
  jsMinSysSha:EXPECTED_SHA,
  oracleUsed:false,
  solvedInputsUsed:false,
  obligationAuthority:'one native CPC aggregate evaluation per examined state',
  theorem:'native CPC exact opponent-loss routes carry <=4-ply tactical upper; exact unique CPC restriction transports a finite child upper by max(4,1+U); attacker setup adds one ply',
  controls:{
    hallFork:{
      prefix:hallRoot,
      setupColumn:4,
      postSetup:summarize(hallPost,hallAttacker),
      upperFromRoot:hallUpper,
    },
    forcedRestrictionChain:{
      prefix:chainRoot,
      firstSetupColumn:4,
      firstPostSetup:summarize(chainAfterSetup,chainAttacker),
      forcedResponseColumn:chainRestrict.forcedColumn,
      secondSetupColumn:4,
      finalPostSetup:summarize(chainFinalPost,chainAttacker),
      childUpper:chainChildUpper,
      postFirstSetupUpper:chainPostFirstSetupUpper,
      upperFromRoot:chainUpper,
    },
    v4ConsumedBoundary:{
      prefix:v4Root,
      children:boundary,
      conclusion:'Candidates 2/3 expose no one-setup CPC route; candidate 6 exposes exactly the forced 2<->3 restrictions, but both compliant successors remain CPC_NONE. No finite upper bound and no v5 license follow.',
    }
  },
  boundary:'This grammar centralizes the earlier Hall-fork and forced-singleton-lift upper certificates inside CPC. It does not claim CPC currently closes the consumed v4 children.'
},null,2));

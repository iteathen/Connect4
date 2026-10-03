// CPCX pair-star hub-ladder progress theorem.
//
// Port of the qualified CPC pair-star theorem.  This is a strict structural
// progress primitive, not a first-win theorem.
//
// Premise:
//   live attacker pair residuals {x,h}, {h,y}, {u,h+}, {h+,v}
// where h+ is immediately above h, x!=y, u!=v, and h is either currently
// playable or exactly one support event away.
//
// Conclusion:
// - if h is playable, attacker h is terminal or contracts both lower pairs to
//   singleton residuals;
// - if h is one support event away, attacker first plays that support.  Subject
//   to the explicit no-immediate-defender-terminal guard, every defender reply
//   lets the attacker take h or h+ and reach terminal or at least one live
//   singleton residual within three physical plies.
//
// The theorem does not assert that the singleton is playable or that a first
// win follows.  It is intended for later CPCX proof-class composition.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';

function unique(values){return [...new Set(values)].sort((a,b)=>a-b);}

function frontier(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function singletonCells(position,player){
  return new Set(scanCpcxObligations(position)
    .filter(o=>o.player===player&&o.missingCount===1)
    .map(o=>o.missingCells[0]));
}

function playableSingletonCells(position,player){
  return unique(scanCpcxObligations(position)
    .filter(o=>
      o.player===player&&
      o.missingCount===1&&
      o.events[0].supportDistance===0
    )
    .map(o=>o.missingCells[0]));
}

function pairAdjacency(position,player){
  const map=new Map();
  for(const o of scanCpcxObligations(position)){
    if(o.player!==player||o.missingCount!==2)continue;
    const [a,b]=o.missingCells;
    if(!map.has(a))map.set(a,[]);
    if(!map.has(b))map.set(b,[]);
    map.get(a).push({
      obligationId:o.id,
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      otherCell:b,
    });
    map.get(b).push({
      obligationId:o.id,
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      otherCell:a,
    });
  }
  return map;
}

function chooseTwo(rows,exclude){
  const byOther=new Map();
  for(const row of rows??[]){
    if(row.otherCell===exclude)continue;
    if(!byOther.has(row.otherCell))byOther.set(row.otherCell,row);
  }
  const out=[...byOther.values()].sort((a,b)=>
    a.otherCell-b.otherCell||
    a.lineId-b.lineId
  );
  return out.length>=2?out.slice(0,2):null;
}

export function findCpcxPairStarHubLadders(position,{
  player=position.mover,
}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  const g=position.geometry,adj=pairAdjacency(position,player),out=[];

  for(let column=0;column<g.columns;column++){
    const baseHeight=position.heights[column];
    for(let row=baseHeight;row+1<g.rows&&row<=baseHeight+1;row++){
      const hub=row*g.columns+column,
        upperHub=hub+g.columns,
        lower=chooseTwo(adj.get(hub),upperHub),
        upper=chooseTwo(adj.get(upperHub),hub);
      if(!lower||!upper)continue;

      out.push({
        schema:'connect4.cpcx.pair-star-candidate.v0_1',
        player,
        column,
        hub,
        upperHub,
        supportDepth:row-baseHeight,
        lowerResiduals:lower,
        upperResiduals:upper,
        lowerLeaves:lower.map(x=>x.otherCell),
        upperLeaves:upper.map(x=>x.otherCell),
      });
    }
  }

  out.sort((a,b)=>
    a.supportDepth-b.supportDepth||
    a.hub-b.hub||
    a.lowerLeaves.join(',').localeCompare(b.lowerLeaves.join(','))||
    a.upperLeaves.join(',').localeCompare(b.upperLeaves.join(','))
  );
  return out;
}

function exactLeafSurvival(position,player,cells){
  const singles=singletonCells(position,player);
  return cells.filter(cell=>singles.has(cell));
}

export function certifyCpcxPairStarHubLadder(position,candidate){
  if(!candidate||candidate.player!==position.mover)return {
    kind:'TURN_MISMATCH',
    exact:false,
  };
  const player=candidate.player,defender=player^1,g=position.geometry,
    {column,hub,upperHub,supportDepth}=candidate;

  if(supportDepth!==0&&supportDepth!==1)return {
    kind:'UNSUPPORTED_HUB_DEPTH',
    exact:false,
    supportDepth,
  };

  if(supportDepth===0){
    const child=applyCpcxForcedEvent(position,hub);
    if(child.terminal)return child.terminal.player===player?{
      schema:'connect4.cpcx.pair-star-progress.v0_1',
      kind:'CERTIFIED_PAIR_STAR_PROGRESS',
      exact:true,
      player,
      source:'DIRECT_HUB_TERMINAL',
      supportDepth,
      hub,
      upperHub,
      terminal:child.terminal,
      progressMeasure:{fromPairCardinality:2,toResidualCardinality:0},
      branches:[],
      recursive:false,
      choiceEnumeration:false,
    }:{
      kind:'WRONG_TERMINAL_ON_DIRECT_HUB',
      exact:false,
      terminal:child.terminal,
    };

    const survivors=exactLeafSurvival(
      child,player,candidate.lowerLeaves
    );
    if(survivors.length<2)return {
      kind:'DIRECT_HUB_SINGLETON_FAILURE',
      exact:false,
      hub,
      survivors,
    };
    return {
      schema:'connect4.cpcx.pair-star-progress.v0_1',
      kind:'CERTIFIED_PAIR_STAR_PROGRESS',
      exact:true,
      player,
      source:'DIRECT_HUB_TO_TWO_SINGLETONS',
      supportDepth,
      hub,
      upperHub,
      singletonCells:unique(survivors),
      progressMeasure:{fromPairCardinality:2,toResidualCardinality:1},
      branches:[],
      recursive:false,
      choiceEnumeration:false,
    };
  }

  // supportDepth === 1: current frontier in the hub column is directly below h.
  const supportCell=(position.heights[column])*g.columns+column,
    support=applyCpcxForcedEvent(position,supportCell);
  if(support.terminal)return support.terminal.player===player?{
    schema:'connect4.cpcx.pair-star-progress.v0_1',
    kind:'CERTIFIED_PAIR_STAR_PROGRESS',
    exact:true,
    player,
    source:'SUPPORT_TERMINAL',
    supportDepth,
    supportCell,
    hub,
    upperHub,
    terminal:support.terminal,
    progressMeasure:{fromPairCardinality:2,toResidualCardinality:0},
    branches:[],
    recursive:false,
    choiceEnumeration:false,
  }:{
    kind:'WRONG_TERMINAL_ON_SUPPORT',
    exact:false,
    terminal:support.terminal,
  };

  const defenderWins=playableSingletonCells(support,defender);
  if(defenderWins.length)return {
    kind:'FIRST_WIN_GUARD_FAILURE',
    exact:false,
    supportCell,
    defenderTerminalCells:defenderWins,
  };

  const branches=[];
  for(const defenderCell of frontier(support)){
    const afterDefender=applyCpcxForcedEvent(support,defenderCell);
    if(afterDefender.terminal)return {
      kind:'DEFENDER_TERMINAL_INSIDE_PAIR_STAR',
      exact:false,
      supportCell,
      defenderCell,
      terminal:afterDefender.terminal,
    };

    if(defenderCell===hub){
      const meta=cpcxCell(g,upperHub);
      if(afterDefender.heights[meta.column]!==meta.row||
         afterDefender.owner[upperHub]!==-1)return {
        kind:'UPPER_HUB_NOT_RELEASED',
        exact:false,
        supportCell,
        defenderCell,
        upperHub,
      };
      const child=applyCpcxForcedEvent(afterDefender,upperHub);
      if(child.terminal){
        if(child.terminal.player!==player)return {
          kind:'WRONG_TERMINAL_ON_UPPER_HUB',
          exact:false,
          defenderCell,
          terminal:child.terminal,
        };
        branches.push({
          defenderCell,
          responseCell:upperHub,
          class:'UPPER_HUB',
          result:'ATTACKER_TERMINAL',
          singletonCells:[],
        });
        continue;
      }
      const survivors=exactLeafSurvival(
        child,player,candidate.upperLeaves
      );
      if(survivors.length<2)return {
        kind:'UPPER_HUB_SINGLETON_FAILURE',
        exact:false,
        defenderCell,
        survivors,
      };
      branches.push({
        defenderCell,
        responseCell:upperHub,
        class:'UPPER_HUB',
        result:'TWO_SINGLETONS',
        singletonCells:unique(survivors),
      });
      continue;
    }

    const meta=cpcxCell(g,hub);
    if(afterDefender.heights[meta.column]!==meta.row||
       afterDefender.owner[hub]!==-1)return {
      kind:'LOWER_HUB_NOT_PLAYABLE',
      exact:false,
      defenderCell,
      hub,
    };
    const child=applyCpcxForcedEvent(afterDefender,hub);
    if(child.terminal){
      if(child.terminal.player!==player)return {
        kind:'WRONG_TERMINAL_ON_LOWER_HUB',
        exact:false,
        defenderCell,
        terminal:child.terminal,
      };
      branches.push({
        defenderCell,
        responseCell:hub,
        class:'LOWER_HUB',
        result:'ATTACKER_TERMINAL',
        singletonCells:[],
      });
      continue;
    }
    const survivors=exactLeafSurvival(
      child,player,candidate.lowerLeaves
    );
    if(!survivors.length)return {
      kind:'LOWER_HUB_SINGLETON_FAILURE',
      exact:false,
      defenderCell,
      survivors,
    };
    branches.push({
      defenderCell,
      responseCell:hub,
      class:'LOWER_HUB',
      result:'SINGLETON_PROGRESS',
      singletonCells:unique(survivors),
    });
  }

  return {
    schema:'connect4.cpcx.pair-star-progress.v0_1',
    kind:'CERTIFIED_PAIR_STAR_PROGRESS',
    exact:true,
    player,
    source:'ONE_SUPPORT_PAIR_STAR',
    supportDepth,
    supportCell,
    hub,
    upperHub,
    lowerLeaves:[...candidate.lowerLeaves],
    upperLeaves:[...candidate.upperLeaves],
    firstWinGuard:{
      defenderTerminalCells:[],
      passed:true,
    },
    branches,
    flatDefenderFrontierQuantification:true,
    progressMeasure:{fromPairCardinality:2,toResidualCardinality:1},
    theoremProvenance:'CPC_PAIR_STAR_HUB_LADDER_THEOREM.md; fresh qualification retained in CPC_PAIR_STAR_FRESH_QUALIFICATION_0_1.json',
    recursive:false,
    choiceEnumeration:false,
  };
}

export function findAndCertifyCpcxPairStarProgress(position,{
  player=position.mover,
}={}){
  const out=[];
  for(const candidate of findCpcxPairStarHubLadders(position,{player})){
    const certificate=certifyCpcxPairStarHubLadder(position,candidate);
    if(certificate.exact)out.push({candidate,certificate});
  }
  return out;
}

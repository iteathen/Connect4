// Cold rule-only research control. No outcome tables or production solver imports.
import assert from 'node:assert/strict';
import {geometry,replay} from './probe.mjs';

export function phaseFeatures(width,height,moves){
  const g=geometry(width,height),s=replay(g,moves),attacker=s.rank&1;
  const phase=Array.from(s.heights,h=>h&1);
  const unmatched=Array.from(s.heights,h=>(height-h)&1);
  // Extend the response coloring below the frontier solely to check whether the
  // actual prefix is consistent with it. This is not reconstruction of history.
  const template=Array.from({length:g.cells},(_,x)=>
    attacker^((Math.floor(x/width)-s.heights[x%width])&1));
  const prefixConsistent=s.board.every((p,x)=>p<0||p===template[x]);
  const monochromatic=[0,0];
  for(const l of g.lines)if(l.every(x=>template[x]===template[l[0]]))
    monochromatic[template[l[0]]]++;
  return {width,height,moves:moves.map(c=>c+1),rank:s.rank,attacker,
    responder:attacker^1,phase,unmatched,prefixConsistent,monochromatic,
    bulkSafe:prefixConsistent&&monochromatic[0]===0&&monochromatic[1]===0,
    pairsRemaining:Array.from(s.heights,h=>Math.floor((height-h)/2)),
    firstPossibleUnmatchedMove:unmatched.some(Boolean)?Math.min(...Array.from(s.heights,(h,c)=>
      unmatched[c]?height-h:Infinity)):null};
}

export function boundaryWitness(stack,sidePairs){
  assert.ok([1,3,5].includes(stack));
  assert.equal(sidePairs.length,6);
  assert.ok(sidePairs.every(n=>Number.isInteger(n)&&n>=0&&n<=3));
  const moves=Array(stack).fill(3),sides=[0,1,2,4,5,6];
  for(let i=0;i<6;i++)for(let n=0;n<sidePairs[i];n++)moves.push(sides[i],sides[i]);
  for(let n=stack;n<6;n++)moves.push(3);
  return moves;
}

export function boundaryCensus(){
  const g=geometry(7,6),counts={states:0,fullDraw:0,immediateP0Win:0,
    noImmediateP0WinAndTwoP1Threats:0,noImmediateP0WinAndOneP1Threat:0,
    noImmediateThreats:0};
  const byRank={},witnesses={};
  function win(board,p){return g.lines.some(l=>l.every(x=>board[x]===p));}
  function immediate(s,p){
    const actions=[];
    for(let c=0;c<7;c++)if(s.heights[c]<6){
      const x=s.heights[c]*7+c;s.board[x]=p;
      if(win(s.board,p))actions.push(c+1);
      s.board[x]=-1;
    }
    return actions;
  }
  for(let code=0;code<4096;code++){
    const pairs=Array.from({length:6},(_,i)=>(code>>>(2*i))&3);
    const states=[1,3,5].map(stack=>replay(g,boundaryWitness(stack,pairs)));
    for(const s of states){
      // replay checks legal support and rejects any move after an earlier win.
      assert.equal(win(s.board,0)||win(s.board,1),false);
      assert.equal(s.rank&1,0);
      assert.deepEqual(s.board,states[0].board);
    }
    const s=states[0],own=immediate(s,0),opponent=immediate(s,1);
    const kind=s.rank===42?'fullDraw':own.length?'immediateP0Win':
      opponent.length>=2?'noImmediateP0WinAndTwoP1Threats':
      opponent.length?'noImmediateP0WinAndOneP1Threat':'noImmediateThreats';
    counts.states++;counts[kind]++;byRank[s.rank]??={};
    byRank[s.rank][kind]=(byRank[s.rank][kind]??0)+1;
    witnesses[kind]??={sidePairs:pairs,moves:boundaryWitness(3,pairs).map(c=>c+1),own,opponent};
  }
  return {scope:'7x6, P0 strict same-column response after odd center stacks 1/3/5',
    boardOutcomesRead:false,gameTreeSearched:false,counts,byRank,witnesses,
    endpointSetsEqual:true,endpointSetSizeFormula:'(H/2+1)^(W-1) for this single-defect safe response family',
    noPolynomialWidthClaim:true};
}

// Restricted strategy diagnostic: P0 takes an immediate win if available,
// otherwise replies immediately above P1. Stop UNKNOWN at a nonwinning unmatched
// top event. Explore only P1's choices within this fixed P0 policy, never minimax
// or solved labels. Every state is identified by its commuting pair counters.
export function opportunisticFollowup(stack){
  assert.ok([1,3,5].includes(stack));
  const g=geometry(7,6),start=replay(g,Array(stack).fill(3));
  const seen=new Set(),unknownKeys=[],stats={states:0,opponentChoices:0,immediateWinResponses:0,
    pairedResponses:0,unknownTopEvents:0,drawEvents:0};
  let drawWitness=null,unknownWitness=null;
  function win(b,p){return g.lines.some(l=>l.every(x=>b[x]===p));}
  function move(s,c){
    const board=s.board.slice(),heights=s.heights.slice();
    board[heights[c]++*7+c]=s.rank&1;
    return {board,heights,rank:s.rank+1,moves:[...s.moves,c]};
  }
  function visit(s){
    // Under this restricted policy, support fixes every occupied owner. Check
    // that guard even on a repeated key before using support-only memoization.
    for(let r=0;r<6;r++)for(let c=0;c<7;c++)assert.equal(s.board[r*7+c],
      r<s.heights[c]?((r&1)^(c===3?0:1)):-1);
    const key=Array.from(s.heights).join(',');if(seen.has(key))return;
    seen.add(key);stats.states++;assert.equal(s.rank&1,1);
    for(let c=0;c<7;c++)if(s.heights[c]<6){
      stats.opponentChoices++;
      const t=move(s,c);assert.equal(win(t.board,1),false,'safe coloring guards first win');
      if(t.rank===42){stats.drawEvents++;drawWitness??=t.moves;continue;}
      let immediate=false;
      for(let d=0;d<7;d++)if(t.heights[d]<6){
        const cell=t.heights[d]*7+d;t.board[cell]=0;
        if(win(t.board,0))immediate=true;
        t.board[cell]=-1;
      }
      if(immediate){stats.immediateWinResponses++;continue;}
      if(t.heights[c]===6){stats.unknownTopEvents++;unknownWitness??=t.moves;
        unknownKeys.push(Array.from(t.heights).join(','));continue;}
      stats.pairedResponses++;const u=move(t,c);
      assert.equal(win(u.board,0),false);visit(u);
    }
  }
  visit(start);
  return {stack,stats,drawWitness:drawWitness?.map(c=>c+1)??null,
    unknownWitness:unknownWitness?.map(c=>c+1)??null,unknownKeys:unknownKeys.sort(),
    conclusion:stats.drawEvents?'NOT_A_FORCED_WIN_POLICY':stats.unknownTopEvents?'UNCOVERED':'FORCED_WIN_WITHIN_CHECKED_POLICY',
    counterStateUpperBound:((6-stack-1)/2+1)*4**6};
}

export function interruptedDrawSchedule(stack){
  const g=geometry(7,6),moves=boundaryWitness(stack,[3,3,3,3,3,3]);
  for(let end=stack+1;end<moves.length;end+=2){
    const s=replay(g,moves.slice(0,end));
    for(let c=0;c<7;c++)if(s.heights[c]<6){
      const x=s.heights[c]*7+c;s.board[x]=0;
      const line=g.lines.find(l=>l.every(y=>s.board[y]===0));
      s.board[x]=-1;
      if(line)return {prefix:moves.slice(0,end).map(c=>c+1),winningColumn:c+1,
        winningCells:line.map(y=>({column:y%7+1,row:Math.floor(y/7)+1})),
        strictFollowupColumn:moves[end]+1};
    }
  }
  return null;
}

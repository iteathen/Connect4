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
    firstPossibleUnmatchedMove:Math.min(...Array.from(s.heights,(h,c)=>
      unmatched[c]?height-h:Infinity))};
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

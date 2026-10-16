// Exact one-opponent-reply universal threat fusion over ordinary residual q.
// This is a SHORT-HORIZON algebraic value predicate, not a full WDL solver.
//
// No winning-policy search, solved-game data, minimax, q child exploration,
// stored certificates, or oracle inputs are used. For P1 to move it returns
// a bitmask classifying *all* P1 replies at once from three residual singleton
// masks, without constructing even one P1 continuation state.

const subset=(a,b)=>(a&b)===a;
function popcount(x){let n=0;for(;x;x&=x-1n)n++;return n;}
function normalize(masks){
  const arr=[...new Set(masks.map(String))].map(BigInt)
    .sort((a,b)=>popcount(a)-popcount(b)||(a<b?-1:a>b?1:0));
  const result=[];
  for(const x of arr)if(!result.some(y=>subset(y,x)))result.push(x);
  return result;
}
export function createUniversalOneReplyFusion({width:W,height:H,connect:K}){
  if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
    throw Error('invalid finite Connect-K board');
  if(W>42)throw Error('bitmask action width unsupported');
  const bit=(col,row)=>1n<<BigInt(row*W+col);
  const rank=q=>q.h.reduce((sum,x)=>sum+x,0);
  const isSingleton=(R,x)=>R.some(req=>req===x);
  const scan=q=>{
    if(!q||!Array.isArray(q.h)||q.h.length!==W||
       q.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
       !Array.isArray(q.R0)||!Array.isArray(q.R1)||
       q.R0.some(x=>typeof x!=='bigint')||q.R1.some(x=>typeof x!=='bigint'))
       throw Error('invalid q coordinates');
    let L=0n,T=0n,B=0n,U=0n,lookups=0;
    for(let c=0;c<W;c++){
      if(q.h[c]===H)continue;
      const cb=1n<<BigInt(c),landing=bit(c,q.h[c]);
      L|=cb;
      lookups+=2;
      if(isSingleton(q.R0,landing))T|=cb;
      if(isSingleton(q.R1,landing))B|=cb;
      if(q.h[c]+1<H){
        lookups++;
        if(isSingleton(q.R0,bit(c,q.h[c]+1)))U|=cb;
      }
    }
    return {L,T,B,U,lookups};
  };
  function analyzeOpponentReplies(q) {
    if((rank(q)&1)!==1)throw Error('universal P1 reply fusion requires P1 to move');
    const {L,T,B,U,lookups}=scan(q);
    if(L===0n)throw Error('nonterminal P1 move has no legal action');
    let remaining;
    const threats=popcount(T);
    if(threats>=2)remaining=L;
    else if(threats===1)remaining=(L&~T)|U;
    else remaining=U;
    // An immediate P1 win is an absorbing terminal, and therefore cannot
    // permit P0's subsequent winning reply.
    const good=remaining&L&~B;
    const all=(good===L);
    return Object.freeze({
      legalMask:L,existingP0WinMask:T,
      immediateP1WinMask:B,upperLatentP0Mask:U,
      opponentRepliesLeavingImmediateP0Win:good,
      counterReplyMask:L&~good,
      allOpponentRepliesCovered:all,
      proofCase:threats>=2?'T_GE_2':threats===1?'T_EQ_1':'T_EQ_0',
      existingThreatCount:threats,
      qChildStatesEvaluated:0,opponentReplyChildrenExpanded:0,
      singletonMembershipLookups:lookups,
      bitMaskAlgebraOperations:threats>=2?3:threats===1?5:3
    });
  }
  function nextP0Local(q,col) {
    if((rank(q)&1)!==0)throw Error('P0 action cofactor requires P0 to move');
    if(!Number.isInteger(col)||col<0||col>=W||q.h[col]>=H)
      throw Error('illegal P0 action');
    const cell=bit(col,q.h[col]);
    const own=normalize(q.R0.map(x=>x&~cell));
    if(own.includes(0n))return {terminal:'P0_WIN'};
    const h=q.h.slice();h[col]++;
    if(rank({h})===W*H)return {terminal:'DRAW'};
    const opponent=normalize(q.R1.filter(x=>(x&cell)===0n));
    return {q:{h,R0:own,R1:opponent}};
  }
  function p0WinsWithinTwoOwnMoves(q){
    if((rank(q)&1)!==0)throw Error('P0 two-move fusion requires P0 to move');
    const actions=scan(q).L;
    const rows=[];
    let forcedMask=0n,immediateMask=0n,childQConstructed=0;
    for(let c=0;c<W;c++){
      const mask=1n<<BigInt(c);
      if((actions&mask)===0n)continue;
      const edge=nextP0Local(q,c);
      if(edge.terminal==='P0_WIN'){
        immediateMask|=mask;forcedMask|=mask;
        rows.push({column:c,reason:'DIRECT_TERMINAL_P0_WIN',allOpponentRepliesCovered:true});
      }else if(edge.terminal!==undefined){
        rows.push({column:c,reason:'NONWIN_TERMINAL',allOpponentRepliesCovered:false});
      }else{
        childQConstructed++;
        const continuation=analyzeOpponentReplies(edge.q);
        if(continuation.allOpponentRepliesCovered)forcedMask|=mask;
        rows.push({
          column:c,reason:continuation.allOpponentRepliesCovered?
            'FUSED_UNIVERSAL_OPPONENT_RESPONSE':'NOT_PROVEN_IN_TWO',
          allOpponentRepliesCovered:continuation.allOpponentRepliesCovered,
          childUniversal:continuation
        });
      }
    }
    return {
      certifiedP0WinningActionsMask:forcedMask,immediateWinningActionsMask:immediateMask,
      actionCertificates:rows,
      P0CandidateActionCofactors:rows.length,
      P1ContinuationQStatesExpanded:0,
      P0ContinuationQStatesConstructed:childQConstructed,
      strategicGameTreeSearchUsed:false,
      scope:'P0 can force a first win on this P0 move or on its immediately following turn; false means only not certified by this exact bounded horizon'
    };
  }
  return Object.freeze({
    width:W,height:H,connect:K,bit,scan,
    analyzeOpponentReplies,p0WinsWithinTwoOwnMoves,
    nextP0Local
  });
}

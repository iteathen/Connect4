// A single, rule-derived source-q response-cover matrix for
//    forall P1 b : exists P0 a : forall P1 d : exists immediate P0 win
// (P0 may also win immediately on a).
//
// No cofactor child q objects, recursive descendant game solves, searched
// policies, oracle labels, or solved certificate inputs. O(W^3) local
// board-column incidence operations on ORIGINAL normalized R0/R1.
//
// This is a FIXED-HORIZON operator. It still scans finite action labels;
// do not call it a full-depth nonbranching WDL solver.

function pc(mask){let n=0;for(;mask;mask&=mask-1n)n++;return n;}
export function createUniversalResponseCover({width:W,height:H,connect:K}){
  if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
    throw Error('unsupported finite gravity geometry');
  const bit=(c,r)=>1n<<BigInt(r*W+c),N=W*H;
  function compute(q,{omitP1Pairs=false,omitP0Pairs=false,omitUpper=false}={}){
    if(!q||!Array.isArray(q.h)||q.h.length!==W||
      q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
      !Array.isArray(q.R0)||!Array.isArray(q.R1)||
      q.R0.some(x=>typeof x!=='bigint'||x===0n)||
      q.R1.some(x=>typeof x!=='bigint'||x===0n))
      throw Error('invalid q carrier');
    const rank=q.h.reduce((s,v)=>s+v,0);
    if(rank%2!==1||rank===N)throw Error('requires P1 nonterminal mover');
    const own=new Set(q.R0.map(String)),opp=new Set(q.R1.map(String));
    const stats={
      parentQInputs:1,childQStatesConstructed:0,recursiveGameSolves:0,
      P1InitialActionLabels:0,P0ReplyActionLabels:0,
      secondP1LandingLabels:0,
      sourceResidualMembershipQueries:0,
      sizeTwoSourceQueries:0,
      sourceP0PairHits:0,sourceP1PairHits:0,
      sourceUpperHits:0,
      P1FirstWinGuards:0,P1DrawGuards:0,
      P0ImmediateWinRows:0,P0DrawRows:0,
      laterP1WinBlockingRows:0,
      successfulResponsePairs:0,universalAndWork:0
    };
    const has=(pool,mask)=>{stats.sourceResidualMembershipQueries++;
      if(pc(mask)===2)stats.sizeTwoSourceQueries++;
      return pool.has(String(mask));};
    const columns=Array.from({length:W},()=>0n);
    let initialLegal=0n,validInitialP1=0n;
    for(let b=0;b<W;b++){
      const hb=q.h[b];if(hb===H)continue;
      stats.P1InitialActionLabels++;
      const bMask=1n<<BigInt(b),x=bit(b,hb);
      initialLegal|=bMask;
      // An immediate P1 first win or last-move draw makes P0 future
      // victory in this fixed horizon impossible regardless of reply.
      if(has(opp,x)){stats.P1FirstWinGuards++;continue;}
      if(rank+1===N){stats.P1DrawGuards++;continue;}
      validInitialP1|=bMask;
      // The whole P1/P0 action incidence is calculated from the initial
      // support, not by materializing either resulting q child.
      for(let a=0;a<W;a++){
        const rowY=q.h[a]+Number(a===b);
        if(rowY>=H)continue;
        const y=bit(a,rowY);
        stats.P0ReplyActionLabels++;
        if(has(own,y)){
          columns[a]|=bMask;stats.P0ImmediateWinRows++;
          stats.successfulResponsePairs++;continue;
        }
        if(rank+2===N){stats.P0DrawRows++;continue;}
        let L=0n,T=0n,U=0n,B=0n;
        for(let c=0;c<W;c++){
          const rz=q.h[c]+Number(c===b)+Number(c===a);
          if(rz>=H)continue;
          stats.secondP1LandingLabels++;
          const cMask=1n<<BigInt(c),z=bit(c,rz);
          L|=cMask;
          const p0single=has(own,z);
          const p0pair=!omitP0Pairs&&has(own,y|z);
          if(p0pair)stats.sourceP0PairHits++;
          if(p0single||p0pair)T|=cMask;
          const p1single=has(opp,z);
          const p1pair=!omitP1Pairs&&has(opp,x|z);
          if(p1pair)stats.sourceP1PairHits++;
          if(p1single||p1pair)B|=cMask;
          if(!omitUpper&&rz+1<H){
            const upper=bit(c,rz+1);
            const singleton=has(own,upper);
            const pair=!omitP0Pairs&&has(own,y|upper);
            if(singleton||pair){U|=cMask;stats.sourceUpperHits++;}
            if(pair)stats.sourceP0PairHits++;
          }
        }
        if(B!==0n){stats.laterP1WinBlockingRows++;continue;}
        const threats=pc(T);
        const covered=threats>=2||
           (threats===1&&(T&U)!==0n)||
           (threats===0&&U===L);
        if(covered){
          columns[a]|=bMask;stats.successfulResponsePairs++;
        }
      }
    }
    let covered=0n;
    for(const colMask of columns)covered|=colMask;
    stats.universalAndWork=W;
    const responseByB=[];
    for(let b=0;b<W;b++){
      if((initialLegal&(1n<<BigInt(b)))===0n)continue;
      let responses=0n;
      for(let a=0;a<W;a++)
        if((columns[a]&(1n<<BigInt(b)))!==0n)
          responses|=1n<<BigInt(a);
      responseByB.push({initialP1:b,certifiedP0RepliesMask:responses});
    }
    const all=covered===initialLegal;
    return {
      schema:'connect4.universal-response-cover.source-q.v0_1',
      initialLegalP1Mask:initialLegal,
      initialP1WithoutImmediateWinOrDrawMask:validInitialP1,
      coveredInitialP1Mask:covered,
      uncoveredInitialP1Mask:initialLegal&~covered,
      responseCoverByP0Column:columns,
      responseActionsByP1:responseByB,
      universalBoundedP0Win:all,
      statistics:stats,
      semantics:'for all P1 first b, exists P0 a winning immediately or after every P1 d with an immediate P0 answer; all computed from source q with size<=2 requirements',
      arbitraryHorizonWDLClaim:false
    };
  }
  return Object.freeze({compute,width:W,height:H,connect:K});
}

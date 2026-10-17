// Source-only full-future strategic comparison using column-permuted
// residual-upset simulation. No search over future move sequences, successor
// game-value calls, solved outcome labels or q-descendant construction.
// Candidate P1 first actions b,c are compared by a bijection of EVERY
// future legal column choice, preserving gravity/capacity/terminal guards.
export function createColumnTransportFullFuture({width:W,height:H,connect:K}) {
  if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||W*H>42)
    throw Error('invalid board geometry');
  const N=W*H, bit=(c,r)=>1n<<BigInt(r*W+c);
  function compute(q,{maxOperations=300000,maxMs=15000,maxRepresentatives=10000}={}) {
    const started=Date.now();
    if(!q||!Array.isArray(q.h)||q.h.length!==W||
       q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
       !Array.isArray(q.R0)||!Array.isArray(q.R1)||
       q.R0.some(x=>typeof x!=='bigint'||x<=0n)||
       q.R1.some(x=>typeof x!=='bigint'||x<=0n))
      throw Error('expected normalized legal nonterminal source q');
    const rank=q.h.reduce((s,x)=>s+x,0);
    if((rank&1)!==1||rank>=N)throw Error('P1 nonterminal source required');
    const stats={sourceResidualInputs:q.R0.length+q.R1.length,
      legalP1Columns:0,unorderedP1Pairs:0,terminalOrDrawExcluded:0,
      sameCapacityShapePairs:0,incompatibleCapacityShapePairs:0,
      columnPermutationCandidates:0,permutationNodesVisited:0,
      sourceResidualCofactorTests:0,sourceAntichainSubsetTests:0,
      generatorContainmentTests:0,permutedCellBitTests:0,
      P0ResidualUpsetInclusionProbes:0,P1ResidualUpsetInclusionProbes:0,
      samePermutationFullGameIsomorphisms:0,weakDirectionPairs:0,
      weakTwoDirectionsPairs:0,certifiedIncomparablePairs:0,
      futureGameStatesEnumerated:0,sourceChildQMaterializations:0,
      solvedValueQueries:0,operations:0,elapsedMs:0};
    class Budget extends Error {constructor(kind){super('COLUMN_TRANSPORT_'+kind+'_LIMIT');this.kind=kind;}}
    const charge=(field)=>{stats[field]++;stats.operations++;
      if(stats.operations>maxOperations)throw new Budget('OPERATIONS');
      if(Date.now()-started>maxMs)throw new Budget('TIME');
    };
    function normalize(masks) {
      const seen=new Set(),result=[];
      for(const m of masks)seen.add(String(m));
      const raw=[...seen].map(BigInt).sort((a,b)=>a<b?-1:a>b?1:0);
      for(const m of raw) {
        let redundant=false;
        for(const n of raw)if(m!==n){
          charge('sourceAntichainSubsetTests');
          if((m&n)===n){redundant=true;break;}
        }
        if(!redundant)result.push(m);
      }
      return result;
    }
    const hChildren=Array(W),resChildren=Array(W),legal=[];
    const ones=new Set(q.R1.map(String));
    for(let c=0;c<W;c++){
      if(q.h[c]>=H)continue;
      legal.push(c);stats.legalP1Columns++;
      const played=bit(c,q.h[c]),h=q.h.slice();h[c]++;
      if(ones.has(String(played))||rank+1===N) {
        resChildren[c]={terminal:true};hChildren[c]=h;continue;
      }
      const r1=q.R1.map(m=>{charge('sourceResidualCofactorTests');return m&~played;});
      const r0=q.R0.filter(m=>{charge('sourceResidualCofactorTests');return (m&played)===0n;});
      resChildren[c]={P0:normalize(r0),P1:normalize(r1),terminal:false};
      hChildren[c]=h;
    }
    function transport(mask,hA,perm) {
      let out=0n;
      for(let c=0;c<W;c++){
        for(let row=hA[c];row<H;row++){
          const b=bit(c,row);
          if((mask&b)!==0n){charge('permutedCellBitTests');out|=bit(perm[c],row);}
        }
      }
      return out;
    }
    function included(poolA,poolB,tag) {
      for(const a of poolA){
        charge(tag);
        let found=false;
        for(const b of poolB){
          charge('generatorContainmentTests');
          if((b&a)===b){found=true;break;}
        }
        if(!found)return false;
      }
      return true;
    }
    const pairs=[];
    for(let i=0;i<legal.length;i++)for(let j=i+1;j<legal.length;j++){
      const b=legal[i],c=legal[j];charge('unorderedP1Pairs');
      const A=resChildren[b],B=resChildren[c],ha=hChildren[b],hb=hChildren[c];
      if(A.terminal||B.terminal){
        stats.terminalOrDrawExcluded++;
        pairs.push({originalP1Replies:[b,c],status:'TERMINAL_GUARD_EXCLUDED'});
        continue;
      }
      const histA=Array(H+1).fill(0),histB=Array(H+1).fill(0);
      for(const x of ha)histA[x]++;
      for(const x of hb)histB[x]++;
      if(histA.some((x,k)=>x!==histB[k])){
        stats.incompatibleCapacityShapePairs++;
        pairs.push({originalP1Replies:[b,c],status:'NO_COLUMN_CAPACITY_BIJECTION'});
        continue;
      }
      stats.sameCapacityShapePairs++;
      const forward={exists:false,perm:null},reverse={exists:false,perm:null},
        exactIso={exists:false,perm:null};
      const perm=Array(W).fill(-1),used=Array(W).fill(false);
      const tryPermutation=()=>{
        if(stats.columnPermutationCandidates>=maxRepresentatives)throw new Budget('PERMUTATIONS');
        charge('columnPermutationCandidates');
        const A0=A.P0.map(m=>transport(m,ha,perm)),
          A1=A.P1.map(m=>transport(m,ha,perm));
        const f0=included(A0,B.P0,'P0ResidualUpsetInclusionProbes'),
          f1=f0&&included(B.P1,A1,'P1ResidualUpsetInclusionProbes');
        const r0=included(B.P0,A0,'P0ResidualUpsetInclusionProbes'),
          r1=r0&&included(A1,B.P1,'P1ResidualUpsetInclusionProbes');
        if(f0&&f1&&!forward.exists){forward.exists=true;forward.perm=perm.slice();}
        if(r0&&r1&&!reverse.exists){reverse.exists=true;reverse.perm=perm.slice();}
        if(f0&&f1&&r0&&r1&&!exactIso.exists){exactIso.exists=true;exactIso.perm=perm.slice();}
      };
      const enumerate=k=>{
        charge('permutationNodesVisited');
        if(k===W){tryPermutation();return;}
        for(let z=0;z<W;z++){
          if(used[z]||ha[k]!==hb[z])continue;
          used[z]=true;perm[k]=z;enumerate(k+1);perm[k]=-1;used[z]=false;
          if(forward.exists&&reverse.exists&&exactIso.exists)return;
        }
      };
      try {enumerate(0);}
      catch(e){
        if(e instanceof Budget) {
          pairs.push({originalP1Replies:[b,c],status:'BUDGET_PARTIAL',kind:e.kind,
            forwardCertified:forward.exists,reverseCertified:reverse.exists,
            exactIsomorphismCertified:exactIso.exists});
          stats.elapsedMs=Date.now()-started;
          return {status:'BUDGET_PARTIAL',sourceRank:rank,pairs,statistics:stats,
            scope:'only positively witnessed relations certified; unresolved pairs must not be inferred'};
        }
        throw e;
      }
      const status=exactIso.exists?'EXACT_FUTURE_FUNCTION_ISOMORPHISM':
        forward.exists&&reverse.exists?'EQUAL_WDL_TWO_SIMULATIONS':
        forward.exists?'A_WEAKLY_LOWER_P0_WDL':
        reverse.exists?'B_WEAKLY_LOWER_P0_WDL':'INCOMPARABLE';
      if(exactIso.exists)stats.samePermutationFullGameIsomorphisms++;
      if(forward.exists&&reverse.exists)stats.weakTwoDirectionsPairs++;
      else if(forward.exists||reverse.exists)stats.weakDirectionPairs++;
      else stats.certifiedIncomparablePairs++;
      pairs.push({originalP1Replies:[b,c],status,
        ANoBetterThanB:forward.exists,BNoBetterThanA:reverse.exists,
        samePermutationIsomorphism:exactIso.exists,
        forwardColumnPermutation:forward.perm,
        reverseColumnPermutation:reverse.perm,
        exactFutureActionTransport:exactIso.perm});
    }
    stats.elapsedMs=Date.now()-started;
    return {status:'COMPLETE',sourceRank:rank,legalP1Columns:legal,pairs,
      statistics:stats,
      semantics:'exact full-future weak WDL order after original P1 reply for fixed column-permutation simulation; preserves full P0/P1 response quantifier dependency and retains all labels; no root WDL determined'};
  }
  return Object.freeze({compute,width:W,height:H,connect:K});
}

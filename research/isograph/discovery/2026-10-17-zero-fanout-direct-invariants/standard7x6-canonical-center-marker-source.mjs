// Source-only exact canonical single-center-marker XOR event placement/phase.
// Scores ONE supplied hypothetical full schedule from q. No game value,
// optimal strategy, policy search, or independently evaluated future games.
// W,H,K stay symbolic; actual research sample W=7,H=6,K=4 at 44444.
export function createSingleCenterMarkerSource({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<3||W%2!==1||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('unsupported odd-width gravity geometry');
 const C=(W-1)/2,N=W*H,bit=id=>1n<<BigInt(id);
 function evaluate(q,noncenterWord,centerRank){
  if(!Array.isArray(q.h)||q.h.length!==W||q.h[C]!==H-1||
     !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('requires legal nonterminal q whose center has one future event');
  const n=q.h.reduce((s,x)=>s+x,0),T=N-n;
  if(!Array.isArray(noncenterWord)||noncenterWord.length!==T-1||
    !Number.isInteger(centerRank)||centerRank<1||centerRank>T)
   throw Error('invalid source noncenter multiset word / center insertion rank');
  const h=q.h.slice(),local={L:0,R:0},seen=Array(W).fill(0),
    futureRank=Array(N).fill(-1),owner=Array(N).fill(-1), events=[];
  let phaseChecks=0;
  for(let i=0;i<noncenterWord.length;i++){
   const c=noncenterWord[i];
   if(!Number.isInteger(c)||c<0||c>=W||c===C||h[c]>=H)
    throw Error('invalid noncenter future gravity symbol');
   const side=c<C?'L':'R',other=side==='L'?'R':'L';
   const j=++local[side],oppositePrefix=local[other];
   const markerBefore=i>=centerRank-1?1:0;
   const globalRank=j+oppositePrefix+markerBefore;
   const rankExpected=i+1+markerBefore;
   const row=h[c]++,id=row*W+c;
   const predicted=(n+j-1+oppositePrefix+markerBefore)&1;
   const actual=(n+rankExpected-1)&1;
   if(globalRank!==rankExpected||predicted!==actual)
    throw Error('single marker XOR phase/rank identity mismatch');
   futureRank[id]=globalRank;owner[id]=predicted;
   events.push({physicalCellId:id,relativeRank:globalRank,
    region:side,localRank:j,oppositeEarlier:oppositePrefix,
    markerEarlier:markerBefore,owner:predicted});
   phaseChecks++;seen[c]++;
  }
  if(seen.some((z,c)=>c===C?z!==0:z!==H-q.h[c]))
   throw Error('noncenter word is not complete legal source multiset');
  const centerId=(H-1)*W+C,centerOwner=(n+centerRank-1)&1;
  if(h[C]!==H-1)throw Error('wrong canonical center release');
  futureRank[centerId]=centerRank;owner[centerId]=centerOwner;
  const fullWord=noncenterWord.slice();
  fullWord.splice(centerRank-1,0,C);
  let first=Infinity,winner=null,trigger=null,generatorTests=0;
  for(let p=0;p<2;p++)for(const G of (p===0?q.R0:q.R1)){
   let good=true,latest=0;
   for(let id=0;id<N;id++)if((G&bit(id))!==0n){
    if(owner[id]!==p){good=false;break;}
    latest=Math.max(latest,futureRank[id]);
   }
   generatorTests++;
   if(good&&latest<first){first=latest;winner=p;trigger={p,residualCells:Array.from({length:N},(_,id)=>id)
     .filter(id=>(G&bit(id))!==0n),centerRequired:(G&bit(centerId))!==0n};}
  }
  if(winner!==null&&((n+first-1)&1)!==winner)
   throw Error('marker source first terminal player parity mismatch');
  return {centerRank,centerOwner,sourceCenterEventId:centerId,
   firstWinner:winner,firstWinAbsoluteMove:Number.isFinite(first)?n+first:null,
   firstWinningSourceResidual:trigger,
   markerOwnersAndTimesByFutureCell:{owner,relativeRank:futureRank},
   fullHypotheticalWordOneBased:fullWord.map(c=>c+1).join(''),
   noncenterWordOneBased:noncenterWord.map(c=>c+1).join(''),
   eventSample:events.slice(0,6),phaseChecks,generatorTests};
 }
 return Object.freeze({W,H,K,centerIndex:C,evaluate});
}

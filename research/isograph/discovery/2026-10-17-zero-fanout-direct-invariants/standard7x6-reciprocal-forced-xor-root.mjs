// Reciprocal forced-response root WDL equality / weak-order certificate.
// SOURCE-ONLY: scans q=(h,R0,R1); no game value, rollout, oracle,
// recursive future state or strategy enumeration. Conditions frozen in
// docs/research/2026-10-17-7x6-reciprocal-forced-reply-binary-exchange-root-theorem.md.
// All geometry variables W,H,K retained. Primary domain W=7,H=6,K=4.
export function createReciprocalForcedXorRoot({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('unsupported geometry');
 const bit=(c,r)=>1n<<BigInt(r*W+c);
 const isSingleton=m=>m!==0n&&(m&(m-1n))===0n;
 function pop(m){let z=0;for(;m;m&=m-1n)z++;return z;}
 function normalize(gs){
  const unique=[...new Set(gs.map(String))].map(BigInt).sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];for(const g of unique)if(!out.some(z=>(g&z)===z))out.push(g);
  return out;
 }
 function sourceUpSubset(a,b){
  return a.every(g=>b.some(f=>(g&f)===f));
 }
 function sourceFavorableLE(A,B){
  return sourceUpSubset(A.R0,B.R0)&&sourceUpSubset(B.R1,A.R1);
 }
 function analyze(q){
  const n=q.h.reduce((s,x)=>s+x,0),p=n&1,o=1-p;
  if(!Array.isArray(q.h)||q.h.length!==W||q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1))throw Error('bad source q');
  const R=[q.R0,q.R1],legal=[];
  for(let c=0;c<W;c++)if(q.h[c]<H)legal.push(c);
  const stat={originalSourceGeneratorsExamined:0,
   allCurrentUnorderedLegalPairs:legal.length*(legal.length-1)/2,
   sourceTwoCellThreatSeeds:0,firstActionThreatScans:0,
   reciprocalThreatAndCounterwinGuardsPassed:0,
   sourceTwoPlyCofactorAntichainPairs:0,
   sourceOddIncidenceGeneratorsExamined:0,
   comparedFullFutureUpsetRelations:0,
   sameFullFuturePrograms:0,oneWayWeakWDLOrders:0,incomparable:0,
   evaluatedStrategicFutureGameValues:0,
   constructedIndependentStrategicGameTrees:0,
   sourceStaticProofOnly:true};
  const wins=R[p],other=R[o],certificates=[];
  const sourceFirst=(c,expected){
   stat.firstActionThreatScans++;
   const x=bit(c,q.h[c]);
   const hc=q.h.slice();hc[c]++;
   const own=normalize(wins.map(g=>g&~x));
   if(own.includes(0n))return {ok:false,reason:'IMMEDIATE_FIRST_WIN'};
   const opp=normalize(other.filter(g=>(g&x)===0n));
   const playable=hc.flatMap((height,col)=>height<H?[bit(col,height)]:[]);
   const pSingleton=own.filter(g=>isSingleton(g)&&playable.includes(g));
   const oSingleton=opp.filter(g=>isSingleton(g)&&playable.includes(g));
   if(pSingleton.length!==1||pSingleton[0]!==expected||
      oSingleton.length!==0)return {ok:false,reason:'NOT_UNIQUE_FORCED_REPLY_OR_OPPONENT_COUNTERWIN'};
   return {ok:true};
  };
  const afterTwo=(c,d)=>{
   const x=bit(c,q.h[c]),y=bit(d,q.h[d]);
   const h=q.h.slice();h[c]++;h[d]++;
   const own=normalize(wins.filter(g=>(g&y)===0n).map(g=>g&~x));
   const opp=normalize(other.filter(g=>(g&x)===0n).map(g=>g&~y));
   const q2={h,R0:p===0?own:opp,R1:p===1?own:opp};
   if(own.includes(0n)||opp.includes(0n))throw Error('uncaught terminal move after forced reply');
   return q2;
  };
  for(let i=0;i<legal.length;i++)for(let j=i+1;j<legal.length;j++){
   const a=legal[i],b=legal[j],x=bit(a,q.h[a]),y=bit(b,q.h[b]),xy=x|y;
   stat.originalSourceGeneratorsExamined+=wins.length;
   if(!wins.includes(xy))continue;
   stat.sourceTwoCellThreatSeeds++;
   const fa=sourceFirst(a,y);
   if(!fa.ok)continue;
   const fb=sourceFirst(b,x);
   if(!fb.ok)continue;
   if(n+2>=W*H)continue; // terminal full-board draw, handled by other direct source rules
   stat.reciprocalThreatAndCounterwinGuardsPassed++;
   const qa=afterTwo(a,b),qb=afterTwo(b,a);
   stat.sourceTwoPlyCofactorAntichainPairs++;
   const abLEba=sourceFavorableLE(qa,qb);
   const baLEab=sourceFavorableLE(qb,qa);
   stat.comparedFullFutureUpsetRelations+=2;
   let odd=0;
   for(const g of [...q.R0,...q.R1]){
    stat.sourceOddIncidenceGeneratorsExamined++;
    if(Boolean(g&x)!==Boolean(g&y))odd++;
   }
   const classification=abLEba&&baLEab?'EXACT_ROOT_VALUE_TIE':
     abLEba?'ROOT_A_WDL_LE_ROOT_B':baLEab?'ROOT_B_WDL_LE_ROOT_A':'INCOMPARABLE';
   if(classification==='EXACT_ROOT_VALUE_TIE')stat.sameFullFuturePrograms++;
   else if(classification==='INCOMPARABLE')stat.incomparable++;
   else stat.oneWayWeakWDLOrders++;
   certificates.push({
    literalA:a+1,literalB:b+1,classification,
    sourceOwner:p,forcedReplies:[b+1,a+1],
    commonTwoPlySupport:qa.h,
    resultingResidualCountsAB:[qa.R0.length,qa.R1.length],
    resultingResidualCountsBA:[qb.R0.length,qb.R1.length],
    oddIncidentOriginalSourceGenerators:odd,
    sourceTwoPlyFutureGamesIdentical:abLEba&&baLEab,
    rootScalarOrderABlessOrEqualBA:abLEba,
    rootScalarOrderBAlessOrEqualAB:baLEab
   });
  }
  return {status:'SOURCE_ONLY_RECIPROCAL_REPLY_WDL_ORDERS',mover:p,
    rootLegalLiteralColumns:legal.map(z=>z+1),certificates,stats:stat};
 }
 return Object.freeze({analyze});
}

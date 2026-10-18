// Exact ORIGINAL q-only column-chain maximum-completion precedence.
 // Frozen proof: docs/research/2026-10-18-unfolded-winning-line-maxima-poset-temporal-quotient.md
// NO complete future words, strategic successor q, or WDL evaluations in this module.
export function createGravityPosetMaximalRaceInterface({width:W,height:H,connect:K}) {
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original W,H,K');
 const N=W*H,bit=z=>1n<<BigInt(z);
 const above=Array.from({length:N},(_,z)=>{
  const c=z%W,r=Math.floor(z/W);let m=0n;
  for(let s=r+1;s<H;s++)m|=bit(s*W+c);
  return m;
 });
 const sourcePairPrecedes=(A,B)=>{
  if((A&B)!==0n)return false;
  for(let z=0;z<N;z++)if((A&bit(z))!==0n&&(above[z]&B)===0n)return false;
  return true;
 };
 function analyze(q,{maxExamples=12}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(r=>!Number.isInteger(r)||r<0||r>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('original nonterminal q=(h,R0,R1) required');
  const n=h.reduce((a,b)=>a+b,0);
  if(n>=N)throw Error('terminal support');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(r*W+c);
  for(const m of [...q.R0,...q.R1])if((m&~future)!==0n)
   throw Error('source generator not in current future support');
  const count={SHARED_CELL_EXCLUSION:0,P0_FORCED_FIRST:0,P1_FORCED_FIRST:0,CHRONOLOGY_UNRESOLVED:0};
  const examples={SHARED_CELL_EXCLUSION:[],P0_FORCED_FIRST:[],P1_FORCED_FIRST:[],CHRONOLOGY_UNRESOLVED:[]};
  const pairClasses=[];
  for(let i=0;i<q.R0.length;i++)for(let j=0;j<q.R1.length;j++){
   const A=q.R0[i],B=q.R1[j];let kind;
   if((A&B)!==0n)kind='SHARED_CELL_EXCLUSION';
   else {
    const ab=sourcePairPrecedes(A,B),ba=sourcePairPrecedes(B,A);
    if(ab&&ba)throw Error('opposite strict gravity chain precedences impossible');
    kind=ab?'P0_FORCED_FIRST':ba?'P1_FORCED_FIRST':'CHRONOLOGY_UNRESOLVED';
   }
   count[kind]++;
   if(examples[kind].length<maxExamples)examples[kind].push({p0GeneratorIndex:i,
      p1GeneratorIndex:j,p0GeneratorHex:'0x'+A.toString(16),p1GeneratorHex:'0x'+B.toString(16)});
   pairClasses.push(kind);
  }
  const disjoint=count.P0_FORCED_FIRST+count.P1_FORCED_FIRST+count.CHRONOLOGY_UNRESOLVED;
  return {status:count.CHRONOLOGY_UNRESOLVED===0?
     'CERTIFIED_FIXED_WORD_CHRONOLOGY_ELIMINATED_GIVEN_EVENT_OWNER_PHASE':'INCOMPLETE',
    kind:'SOURCE_GRAVITY_CHAIN_MAXIMAL_WINLINE_TEMPORAL_ORDER',
    originalPly:n,originalHeights:h.slice(),originalFutureEvents:N-n,
    originalResidualGeneratorCounts:[q.R0.length,q.R1.length],
    classes:count,firstTwelveExamplesByClass:examples,
    sourceCrossPlayerPairsTotal:q.R0.length*q.R1.length,
    sourceDisjointCrossPlayerPairs:disjoint,
    originalPriorRaceFreeGuard:disjoint===0,
    strongerStaticTemporalRaceEliminationGuard:count.CHRONOLOGY_UNRESOLVED===0,
    flatPairClassRowMajor:pairClasses,
    originalRootWDL:null,bestOriginalLevel2Column:null,
    sourceIndependentFutureGameValues:0,
    sourceStrategicallyAlternativeSuccessorStates:0,
    sourceFutureGravitySchedulesEnumerated:0,
    sourceOriginalMaskPairComparisons:q.R0.length*q.R1.length};
 }
 return Object.freeze({analyze,sourcePairPrecedes});
}

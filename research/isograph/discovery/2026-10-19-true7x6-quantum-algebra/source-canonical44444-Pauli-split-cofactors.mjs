// SOURCE ONLY: genuine original W7,H6,K4 44444 residual Pauli
// projector/canonical splitting CONDITIONAL stabilizer quotient.
// 18 outer split pairs are a hypothetical Clifford gauge, NOT a proven
// legal adaptive defender strategy. Direct source one-action cofactors
// are original q representation identities, NOT WDL value queries.
// Frozen theorem: docs/research/2026-10-19-true7x6-canonical44444-conditional-stabilizer-gauge-and-source-cofactor.md
export function sourceCanonical44444PauliSplitCofactors(){
 const W=7,H=6,K=4,N=42,center=3,history=[3,3,3,3,3],
  bit=z=>1n<<BigInt(z),index=(c,r)=>r*W+c,
  directions=[[1,0],[0,1],[1,1],[1,-1]];
 const winlines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of directions){
  const x=c+(K-1)*dc,y=r+(K-1)*dr;
  if(x<0||x>=W||y<0||y>=H)continue;
  const cells=Array.from({length:K},(_,t)=>index(c+t*dc,r+t*dr));
  winlines.push(cells.reduce((s,z)=>s|bit(z),0n));
 }
 function pop(mask){let t=0;for(;mask;mask&=mask-1n)t++;return t;}
 function normalize(masks) {
  const unique=[...new Set(masks.map(x=>x.toString(16)))].map(s=>BigInt('0x'+s));
  unique.sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const out=[];
  for(const G of unique){
   if(!out.some(F=>(G&F)===F))out.push(G);
  }
  return out;
 }
 let h=Array(W).fill(0),p0=0n,p1=0n;
 for(let ply=0;ply<history.length;ply++){
  const c=history[ply],z=index(c,h[c]++);
  if(ply%2===0)p0|=bit(z);else p1|=bit(z);
 }
 if(h[center]!==5||pop(p0)!==3||pop(p1)!==2)
  throw Error('canonical original 44444 prefix invalid');
 for(const L of winlines)if((L&p0)===L||(L&p1)===L)
  throw Error('source canonical history had an earlier first win');
 function buildRequirements(own,opponent){
  const eligible=[];
  for(const L of winlines){
   if((L&opponent)!==0n)continue;
   const G=L&~own;
   if(G===0n)throw Error('original canonical source would already have first winner');
   eligible.push(G);
  }
  return normalize(eligible);
 }
 const R0=buildRequirements(p0,p1),R1=buildRequirements(p1,p0);
 const pairs=[],pairBySite=new Map();
 for(let c=0;c<W;c++){
  if(c===center)continue;
  for(let r=0;r<H;r+=2){
   const lower=index(c,r),upper=index(c,r+1),id=pairs.length;
   pairs.push({id,column:c,lowerRow:r,lower,upper,
    projectiveEigenvalue:-1});
   pairBySite.set(lower,{id,upper:false});
   pairBySite.set(upper,{id,upper:true});
  }
 }
 const z=index(center,5),splitPairNum=pairs.length;
 // Global Z parity is -1 because complete hypothetical 42
 // alternating placements have 21 P1 sites; canonical 5-site
 // prefix has Z sign +1 and 18 split pairs multiply sign +1.
 const prefixZEigenvalue=((pop(p1)&1)===1)?-1:1;
 const allZ=-1,outerSplitZ=Math.pow(-1,pairs.length);
 const centerEigenvalue=allZ*prefixZEigenvalue*outerSplitZ;
 if(centerEigenvalue!==-1||pairBySite.size!==36||splitPairNum!==18)
  throw Error('canonical algebraic parity center-lock preflight invalid');
 function gauge(p,G){
  for(const pair of pairs){
   if((G&bit(pair.lower))!==0n&&(G&bit(pair.upper))!==0n)
    return {status:'ORTHOGONAL_TO_PAIRED_STABILIZERS',
     exactBlockingPairID:pair.id};
  }
  if((G&bit(z))!==0n&&p===0)
   return {status:'ORTHOGONAL_TO_CENTER_QUOTA_STABILIZER'};
  let must0=0n,must1=0n,centerLiteralConsumed=(G&bit(z))!==0n;
  for(const pair of pairs){
   if((G&bit(pair.lower))!==0n) {
    if(p===0)must0|=bit(pair.id);
    else must1|=bit(pair.id);
   }
   if((G&bit(pair.upper))!==0n){
    if(p===0)must1|=bit(pair.id);
    else must0|=bit(pair.id);
   }
  }
  if((must0&must1)!==0n)throw Error('missed split pair contradiction');
  let seen=0n;
  for(const pair of pairs)seen|=bit(pair.lower)|bit(pair.upper);
  if((G&~(seen|bit(z)))!==0n)throw Error('canonical future source generator outside gauge coverage');
  return {status:'NONZERO_SIGNED_SOURCE_PROJECTOR',
   must0Hex:'0x'+must0.toString(16),must1Hex:'0x'+must1.toString(16),
   gaugeDegree:pop(must0|must1),
   centerTopP1LiteralConsumed:Boolean(centerLiteralConsumed)};
 }
 function gaugeAll(p,arr){
  const categories={},remaining=[];
  arr.forEach((G,i)=>{
   const g=gauge(p,G);
   categories[g.status]=(categories[g.status]??0)+1;
   if(g.status==='NONZERO_SIGNED_SOURCE_PROJECTOR'){
    remaining.push({originalRIndex:i,originalMaskHex:'0x'+G.toString(16),...g,
     must0:BigInt(g.must0Hex),must1:BigInt(g.must1Hex)});
   }
  });
  // Existential OR of signed conjunctions. A (subset) absorbs B
  // when all literals of A are contained in B with identical signs.
  const reduced=[];
  for(const A of remaining){
   const a0=A.must0,a1=A.must1;
   if(remaining.some(B=>B.originalRIndex!==A.originalRIndex&&
       (B.must0&a0)===B.must0&&(B.must1&a1)===B.must1&&
       ((B.must0!==a0||B.must1!==a1)||B.originalRIndex<A.originalRIndex)))
     continue;
   reduced.push(A);
  }
  const hist={},histReduced={};
  for(const a of remaining)hist[a.gaugeDegree]=(hist[a.gaugeDegree]??0)+1;
  for(const a of reduced)histReduced[a.gaugeDegree]=(histReduced[a.gaugeDegree]??0)+1;
  return {originalResidualCount:arr.length,orthogonalityCategories:categories,
   signedNonzeroOriginalResidualCount:remaining.length,
   canonicalReducedSignedClauseCount:reduced.length,
   signedDegreeHistogram:hist,reducedSignedDegreeHistogram:histReduced,
   hasEmptySignedClause:reduced.some(a=>a.gaugeDegree===0),
   clauses:reduced.map(a=>({originalRIndex:a.originalRIndex,
    originalMaskHex:a.originalMaskHex,
    must0Hex:a.must0Hex,must1Hex:a.must1Hex,
    degree:a.gaugeDegree,
    centerTopP1LiteralConsumed:a.centerTopP1LiteralConsumed}))};
 }
 function cofactorNextP1Action(column){
  if(!Number.isInteger(column)||column<0||column>=W||h[column]>=H)
   throw Error('not a legal original rank5 action');
  const x=index(column,h[column]),m=bit(x);
  if(R1.some(G=>G===m))
   return {action:column+1,sourceTerminal:'P1_FIRST_WIN',
    originalLandingSite:x,sourceFutureGameWDLQueries:0};
  const h2=h.slice();h2[column]++;
  const nextR1=normalize(R1.map(G=>G&~m));
  const nextR0=normalize(R0.filter(G=>(G&m)===0n));
  return {action:column+1,sourceTerminal:h2.every(x=>x===H)?'FULL_DRAW':'NONTERMINAL',
   originalLandingSite:x,
   afterHeight:h2,
   afterR0:nextR0.map(G=>'0x'+G.toString(16)),
   afterR1:nextR1.map(G=>'0x'+G.toString(16)),
   sourceFutureGameWDLQueries:0,
   sourceFutureGameStatesSearched:0};
 }
 return {
  status:'SOURCE_CANONICAL44444_CONDITIONAL_PAULI_GAUGE',
  board:{W,H,K,oneBasedHistory:'44444',rank:history.length,
   originalGeometricLines:winlines.length,
   sourceCurrentMover:'P1',sourceFutureCells:37,
   R0:R0.length,R1:R1.length},
  originalPrefix:{h,ownedP0:'0x'+p0.toString(16),
   ownedP1:'0x'+p1.toString(16)},
  R0:R0.map(x=>'0x'+x.toString(16)),
  R1:R1.map(x=>'0x'+x.toString(16)),
  conditionalStabilizerBasis:{outerVerticalSplitPairCount:18,
   physicalFuturePairCoveredSites:36,
   centerTopPhysicalID:z,
   globalHypotheticalFullWordAllZ:-1,prefixFiveOwnedZ:prefixZEigenvalue,
   splitPairZProduct:outerSplitZ,
   impliedCenterTopZEigenvalue:centerEigenvalue,
   independentFutureOwnerBitsAfterConditionalGauge:18,
   onlineStrategyEnforceability:'UNPROVED'},
  pairs,PauliP1RequirementProjection:gaugeAll(1,R1),
  PauliP0RequirementProjection:gaugeAll(0,R0),
  sevenOriginalCurrentP1ActionCofactors:Array.from({length:W},(_,c)=>cofactorNextP1Action(c)),
  sourceStrategicFutureGameStateValuesComputed:0,
  sourceACompleteNoP1WinCertificate:false,
  sourceWDL:null,sourceSelectedBestMove:null
 };
}

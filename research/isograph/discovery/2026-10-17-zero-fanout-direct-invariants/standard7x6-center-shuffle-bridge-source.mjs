// Source-only center-FULL 2-region bounded-word shuffle factorization.
// One fixed supplied hypothetical word is a payoff INPUT, not a game search.
// All W,H,K symbolic but W odd, center column completely filled.
// Frozen theorem docs/research/2026-10-17-center-full-left-right-shuffle-xor-bridge-factorization.md
export function createFilledCenterShuffleBridge({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<3||W%2!==1||H<1||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('unsupported geometry / center partition');
 const C=(W-1)/2,N=W*H,bit=id=>1n<<BigInt(id);
 const code=(c)=>c<C?'L':c>C?'R':'C';
 function classify(q){
  if(!Array.isArray(q.h)||q.h.length!==W||q.h[C]!==H||
    !Array.isArray(q.R0)||!Array.isArray(q.R1))throw Error('needs actual source q with filled center column');
  const parts=[[],[]];
  const ownerLines=[q.R0,q.R1];
  for(let p=0;p<2;p++)for(const G of ownerLines[p]){
   if(G===0n)throw Error('nonterminal source only');
   let left=0n,right=0n;
   for(let id=0;id<N;id++)if((G&bit(id))!==0n){
    const c=id%W,r=Math.floor(id/W);
    if(r<q.h[c])throw Error('residual generator reaches occupied cell');
    if(c===C)throw Error('full center cannot contain future requirement');
    if(c<C)left|=bit(id);
    else right|=bit(id);
   }
   if(!left&&!right)throw Error('nonempty generator must occur in one region');
   const category=left&&right?'BRIDGE':left?'LEFT':'RIGHT';
   parts[p].push({p,mask:G,left,right,category});
  }
  const count=(p,type)=>parts[p].filter(g=>g.category===type).length;
  return {h:q.h.slice(),R:parts,
   categories:{
    P0:{left:count(0,'LEFT'),right:count(0,'RIGHT'),bridge:count(0,'BRIDGE')},
    P1:{left:count(1,'LEFT'),right:count(1,'RIGHT'),bridge:count(1,'BRIDGE')}
   },
   centerColumnOneBased:C+1};
 }
 function evaluate(q,word){
  const source=classify(q),n=q.h.reduce((s,x)=>s+x,0),T=N-n;
  if(!Array.isArray(word)||word.length!==T)throw Error('full remaining hypothetical word required');
  const h=q.h.slice(),eventRank=Array(N).fill(-1),owner=Array(N).fill(-1),
   left=[],right=[],events=[],local={L:0,R:0};
  let parityMatches=0;
  for(let t=0;t<word.length;t++){
   const c=word[t];
   if(!Number.isInteger(c)||c<0||c>=W||c===C||h[c]>=H)throw Error('gravity illegal suffix or center symbol');
   const r=h[c]++,id=r*W+c,side=code(c),opposite=side==='L'?'R':'L';
   const localRank=++local[side],otherPrior=local[opposite];
   const globalRelative=t+1,assertRank=localRank+otherPrior;
   const predicted=(n+localRank-1+otherPrior)&1,actual=(n+t)&1;
   if(globalRelative!==assertRank||actual!==predicted)throw Error('two-shuffle phase identity failed');
   parityMatches++;
   const e={id,c,r,side,localRank,otherPrior,relativeRank:globalRelative,owner:predicted};
   events.push(e);eventRank[id]=globalRelative;owner[id]=predicted;
   if(side==='L')left.push(c);else right.push(c);
  }
  const needed=q.h.map(z=>H-z),counts=Array(W).fill(0);
  for(const c of word)counts[c]++;
  if(counts.some((x,c)=>x!==needed[c]))throw Error('not complete remaining source gravity multiset');
  const vals={P0:{left:0,right:0,bridge:0},P1:{left:0,right:0,bridge:0}};
  let firstRank=Infinity,firstOwner=null,winningGenerator=null;
  let conjunctionComparisons=0;
  for(let p=0;p<2;p++)for(const rec of source.R[p]){
   let leftValue=1,rightValue=1,latest=0,whole=1;
   for(let id=0;id<N;id++)if((rec.mask&bit(id))!==0n){
    const x=(owner[id]===p)?1:0;
    if(id%W<C)leftValue&=x;else rightValue&=x;
    whole&=x;latest=Math.max(latest,eventRank[id]);
   }
   conjunctionComparisons++;
   if((leftValue&rightValue)!==whole)throw Error('left/right Boolean bridge product differed whole residual');
   if(whole){
    vals[p===0?'P0':'P1'][rec.category.toLowerCase()]++;
    if(latest<firstRank){
     firstRank=latest;firstOwner=p;
     winningGenerator={category:rec.category,physicalCellIds:Array.from({length:N},(_,i)=>i)
       .filter(id=>(rec.mask&bit(id))!==0n)};
    }
   }
  }
  if(firstOwner!==null&&((n+firstRank-1)&1)!==firstOwner)
   throw Error('source first-winning rank disagrees shared turn parity');
  return {firstWinAbsoluteTurn:Number.isFinite(firstRank)?n+firstRank:null,
   firstWinner:firstOwner,
   sourceGeneratorPartition:source.categories,
   sourceWinningGenerator:winningGenerator,
   phaseChecks:parityMatches,booleanBridgeConjunctionChecks:conjunctionComparisons,
   leftWord:left,rightWord:right,
   leftWordOneBased:left.map(c=>c+1).join(''),rightWordOneBased:right.map(c=>c+1).join(''),
   interleavedFullWordOneBased:word.map(c=>c+1).join(''),
   eventSample:events.slice(0,12),sourceWinFactorsByCategory:vals};
 }
 return Object.freeze({W,H,K,centerIndex:C,classify,evaluate});
}

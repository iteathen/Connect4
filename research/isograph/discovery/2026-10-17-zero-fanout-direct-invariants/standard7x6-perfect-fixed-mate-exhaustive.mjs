// Exhaustively enumerate fixed perfect immediate-mate source certs for standard
// 7x6 Connect4 after each P1 first action at canonical legal history 44444.
// Enumerates static matching witnesses ONLY, NOT strategic game continuations.
// W,H,K remain named parameters; current primary board is strictly 7,6,4.
const W=7,H=6,K=4,bit=(c,r)=>1n<<BigInt(r*W+c),wh=W*H;
const pop=x=>{let k=0;while(x){k++;x&=x-1n;}return k;};
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xe=c+(K-1)*dx,ye=r+(K-1)*dy;
  if(xe<0||xe>=W||ye<0||ye>=H)continue;
  lines.push(Array.from({length:K},(_,i)=>bit(c+i*dx,r+i*dy)).reduce((a,b)=>a|b,0n));
 }
if(lines.length!==69)throw Error('bad standard 69 lines');
function prefix(str){
 const h=Array(W).fill(0),P=[0n,0n];
 for(let turn=0;turn<str.length;turn++){
  const c=Number(str[turn])-1,p=turn%2;
  if(c<0||c>=W||h[c]>=H)throw Error('invalid history');
  const x=bit(c,h[c]++);P[p]|=x;
  if(lines.some(g=>(g&P[p])===g))throw Error('history already terminal');
 }
 return {h,P};
}
function antichain(xs){
 const uniq=[...new Set(xs.map(String))].map(BigInt).sort((a,b)=>pop(a)-pop(b));
 return uniq.filter((m,i)=>!uniq.some((u,j)=>j<i&&(m&u)===u));
}
function checkPairing(h,pairs){
 const future=[];
 for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future.push(bit(c,r));
 let seen=0n;
 for(const pair of pairs){
  if(pop(pair)!==2 || (seen&pair)!==0n)throw Error('invalid pair or duplicate');
  seen|=pair;
 }
 if(pairs.length*2!==future.length||seen!==future.reduce((s,x)=>s|x,0n))throw Error('incomplete matching');
}
function run(c6){
 const state=prefix('44444'+String(c6)),h=state.h,m=h.map(x=>H-x);
 const R=antichain(lines.filter(g=>(g&state.P[1])===0n)
  .map(g=>g&~state.P[0]).filter(g=>g!==0n));
 const option=Array.from({length:W},()=>[]);
 for(let c=0;c<W;c++)if(m[c]>0){
  if(m[c]%2===0){
   const pairs=[];
   for(let r=h[c];r<H;r+=2)pairs.push(bit(c,r)|bit(c,r+1));
   option[c].push({columns:[c],t:0,pairs,kind:'vertical'});
  }
  for(let d=c+1;d<W;d++)if(m[d]&&m[c]%2===m[d]%2){
   for(let t=m[c]%2?1:2;t<=Math.min(m[c],m[d]);t+=2){
    const pairs=[];
    for(let j=0;j<t;j++)pairs.push(bit(c,h[c]+j)|bit(d,h[d]+j));
    for(const z of [c,d])for(let r=h[z]+t;r<H;r+=2)
     pairs.push(bit(z,r)|bit(z,r+1));
    option[c].push({columns:[c,d],t,pairs,kind:'cross-prefix'});
   }
  }
 }
 let examined=0,winner=0,bestCovered=-1,bestWitness=null,tiedBestCount=0;
 const counts={};
 const mask=m.reduce((s,n,c)=>n?s|(1<<c):s,0);
 function dfs(unused,pairs,blocks){
  if(!unused){
   examined++;checkPairing(h,pairs);
   let covered=0;
   for(const g of R)if(pairs.some(p=>(g&p)===p))covered++;
   if(covered>bestCovered){
    bestCovered=covered;tiedBestCount=1;
    const missed=R.filter(g=>!pairs.some(p=>(g&p)===p));
    bestWitness={blocks:blocks.map(b=>({columns:b.columns.map(x=>x+1),crossPrefix:b.t,kind:b.kind})),
     uncoveredRequirements:missed.slice(0,5).map(String),uncoveredCount:missed.length};
   }else if(covered===bestCovered)tiedBestCount++;
   if(covered===R.length)winner++;
   return;
  }
  let c=0;while(!(unused&(1<<c)))c++;
  for(const o of option[c]){
   const cols=o.columns.reduce((s,d)=>s|(1<<d),0);
   if((unused&cols)!==cols)continue;
   dfs(unused&~cols,pairs.concat(o.pairs),blocks.concat(o));
  }
 }
 dfs(mask,[],[]);
 return {history:'44444'+String(c6),heights:h,remaining:wh-6,
  P0ResidualGeneratorCount:R.length,allStaticMatchingsExamined:examined,
  matchingsCoveringEveryP0Residual: winner,
  maxNumberOfP0ResidualsCovered:bestCovered,
  minUncoveredAtBest:R.length-bestCovered,
  bestMatchingsCount:tiedBestCount,bestWitness,
  optionsByLowestColumn:option.map(z=>z.length)};
}
const results=[];
for(let c=1;c<=W;c++)results.push(run(c));
console.log(JSON.stringify({schema:'connect4.7x6.perfect_mate_exhaustive.canonical44444_v0_1',
 date:'2026-10-17',board:{W,H,K,geometricWinningLines:lines.length},
 semantics:'Original P1 turn6 literal action; static perfect mate responder P1 against P0 attacker from move7; certificate requires every P0 original residual generator to contain one entire pair.',
 producerFutureStrategicGamesEvaluated:0,results},null,2));

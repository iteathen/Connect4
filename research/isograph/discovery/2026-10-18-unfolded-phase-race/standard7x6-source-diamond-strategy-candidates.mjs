// Frozen SOURCE-ONLY candidate selector for testing whether same-q two-round
// chronology diamonds imply SAME ROOT FIRST ACTION game value (hypothesis NOT assumed).
// No recursive WDL, no oracle labels, no speculative strategic game values.
// Exact 7x6 physical states generated as source input by original 69 K-line masks.
import {createOriginalTwoRoundTraceDiamond} from './original-q-two-round-owner-preserving-diamond.mjs';
export function generateDiamondStrategyCandidatePacket({seed=20261018,games=4500,maxCandidateRoots=800,minRank=32}={}){
 const W=7,H=6,N=42,bit=e=>1n<<BigInt(e),index=(c,r)=>r*W+c;
 const windows=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(cc.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   windows.push(cc.map(([x,y])=>index(x,y)));
 }
 if(windows.length!==69)throw Error('not 69 original windows');
 const diamond=createOriginalTwoRoundTraceDiamond({width:W,height:H,connect:4});
 let randomState=seed>>>0;
 function rng(){randomState^=randomState<<13;randomState^=randomState>>>17;randomState^=randomState<<5;return randomState>>>0;}
 const popcount=m=>{let n=0;while(m){m&=m-1n;n++;}return n;};
 function normalize(xs){
  const v=[...new Set(xs)].sort((a,b)=>popcount(a)-popcount(b)||(a<b?-1:a>b?1:0)),ans=[];
  for(const x of v)if(!ans.some(z=>(z&x)===z))ans.push(x);
  return ans;
 }
 function buildQ(board,h){
  const R=[0,1].map(p=>{
   const raw=[];
   for(const w of windows){
    if(w.some(z=>board[z]===1-p))continue;
    let m=0n;
    for(const z of w)if(board[z]===-1)m|=bit(z);
    if(m===0n)throw Error('unexpected source winner in nonterminal original position');
    raw.push(m);
   }
   return normalize(raw);
  });
  return {h:h.slice(),R0:R[0],R1:R[1]};
 }
 function moveWins(board,c,r,p){
  const x=index(c,r);board[x]=p;
  const yes=windows.some(w=>w.includes(x)&&w.every(z=>board[z]===p));
  board[x]=-1;return yes;
 }
 const packet={schema:'connect4.original7x6.source_diamond_strategy_candidate_packet_v0_1',
  generatedBy:'standard7x6-source-diamond-strategy-candidates.mjs',
  inputs:{seed,games,maxCandidateRoots,minRank},game:{W,H,K:4,originalWinlines:69,
   firstWinStopped:true},method:'Generate original 7x6 gravity histories, uniformly from legal nonwinning next actions. At ranks >= minRank and with >=4 originally legal columns, compute q from independently built original winline residual masks. For each unordered root first-action pair (a,c) source-select lexicographically first legal b,d yielding original four-distinct two-round no-early-win q diamond. Freeze all roots/pairs before independent physical minimax. Candidate certificate does NOT imply root first-action equality.',
  stats:{nonwinningHistoriesGenerated:0,sourcePositionsConsidered:0,
   rootsWithFourLegalColumns:0,sourceDiamondMaskWitnessAttempts:0,
   rootsWithOneOrMoreSourceDiamondRootActionPairs:0,
   sourceSelectedRootActionPairs:0,alternativeGameValueCalculations:0},
  qCandidates:[]};
 for(let game=0;game<games && packet.qCandidates.length<maxCandidateRoots;game++){
  const board=Array(N).fill(-1),h=Array(W).fill(0);let history='';
  for(let n=0;n<N && packet.qCandidates.length<maxCandidateRoots;n++){
   if(n>=minRank){
    packet.stats.sourcePositionsConsidered++;
    const legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
    if(legal.length>=4){
     packet.stats.rootsWithFourLegalColumns++;
     const q=buildQ(board,h),pairs=[];
     for(let i=0;i<legal.length;i++)for(let j=i+1;j<legal.length;j++){
      const a=legal[i],c=legal[j];
      let witness=null;
      for(const b of legal){if(witness)break;if(b===a||b===c)continue;
       for(const d of legal){
        if(d===a||d===b||d===c)continue;
        packet.stats.sourceDiamondMaskWitnessAttempts++;
        const cert=diamond.check(q,[a,b,c,d]);
        if(cert.status==='CERTIFIED_TWO_ROUND_OWNER_PRESERVING_QO_DIAMOND'){
         witness=[a,b,c,d];break;
        }
       }
      }
      if(witness){packet.stats.sourceSelectedRootActionPairs++;
       pairs.push({originalFirstActionA:a,originalFirstActionC:c,
        sourceFixedTwoRoundDiamond:witness});
      }
     }
     if(pairs.length){
      packet.stats.rootsWithOneOrMoreSourceDiamondRootActionPairs++;
      packet.qCandidates.push({originalHistory:history,originalPly:n,
       originalHeights:h.slice(),originalSourceRCounts:[q.R0.length,q.R1.length],
       originalLegalFirstColumns:legal,sourceRootFirstActionPairs:pairs});
     }
    }
   }
   const safe=[];
   for(let c=0;c<W;c++)if(h[c]<H&&!moveWins(board,c,h[c],n&1))safe.push(c);
   if(!safe.length)break;
   const c=safe[rng()%safe.length],x=index(c,h[c]++);
   board[x]=n&1;history+=String(c+1);
  }
  packet.stats.nonwinningHistoriesGenerated++;
 }
 packet.stats.candidateRoots=packet.qCandidates.length;
 return packet;
}

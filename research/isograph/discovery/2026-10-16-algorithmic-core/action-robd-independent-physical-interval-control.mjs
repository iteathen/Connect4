// Independent physical first-win gravity recursion for bounded WDL intervals.
// ONLY THIS VALIDATOR explores concrete game continuations; never a producer input.
export function checkPhysicalBoundedActionIntervals({width:W=7,height:H=6,connect:K=4,history='44444',futurePlies=8,maxTransitions=10000000}={}) {
 const dirs=[[1,0],[0,1],[1,1],[1,-1]],board=Array(W*H).fill(2),height=Array(W).fill(0);
 const stats={transitions:0,terminalP0:0,terminalP1:0,terminalDraw:0,cutoffs:0,prunedBranches:0};
 const token=(lo,hi)=>(lo+1)|((hi+1)<<2);
 function win(c,r,p){
  for(const [dx,dy] of dirs){
   let run=1;
   for(const sign of [-1,1])for(let j=1;j<K;j++){
    const x=c+dx*j*sign,y=r+dy*j*sign;
    if(x<0||x>=W||y<0||y>=H||board[y*W+x]!==p)break;
    run++;
   }
   if(run>=K)return true;
  }
  return false;
 }
 let rank=0;
 for(const raw of history){
  const c=Number(raw)-1,p=rank%2;
  if(!Number.isInteger(c)||c<0||c>=W||height[c]===H)
    throw Error('invalid physical source');
  const r=height[c]++;board[r*W+c]=p;rank++;
  if(win(c,r,p))throw Error('source was already terminal');
 }
 if(rank+futurePlies>W*H||futurePlies<1)throw Error('future horizon beyond board');
 function solve(remaining,p,occupied){
  if(remaining===0){stats.cutoffs++;return token(-1,1);}
  let lo=p===0?-1:1,hi=lo;
  for(let c=0;c<W;c++){
   const r=height[c];if(r>=H)continue;
   if(++stats.transitions>maxTransitions)throw Error('independent physical budget exhausted');
   board[r*W+c]=p;height[c]++;
   let result;
   if(win(c,r,p)){
    stats[p===0?'terminalP0':'terminalP1']++;const v=p===0?1:-1;result=token(v,v);
   }else if(occupied+1===W*H){stats.terminalDraw++;result=token(0,0);}
   else result=solve(remaining-1,1-p,occupied+1);
   height[c]--;board[r*W+c]=2;
   const L=(result&3)-1,U=((result>>2)&3)-1;
   if(p===0){lo=Math.max(lo,L);hi=Math.max(hi,U);}
   else {lo=Math.min(lo,L);hi=Math.min(hi,U);}
   if((p===0&&lo===1&&hi===1)||(p===1&&lo===-1&&hi===-1)){stats.prunedBranches++;break;}
  }
  return token(lo,hi);
 }
 const mover=rank%2,out=[];
 for(let c=0;c<W;c++){
  const r=height[c];if(r>=H)continue;
  board[r*W+c]=mover;height[c]++;
  let result;
  if(win(c,r,mover)){const v=mover===0?1:-1;result=token(v,v);}
  else if(rank+1===W*H)result=token(0,0);
  else result=solve(futurePlies-1,1-mover,rank+1);
  height[c]--;board[r*W+c]=2;
  out.push({column:c+1,lower:(result&3)-1,upper:((result>>2)&3)-1});
 }
 return {status:'PASS',geometry:{W,H,K},history,futurePlies,mover,actionIntervals:out,statistics:stats,
  sourceGameSearchInCandidate:false,validatorOnly:true};
}

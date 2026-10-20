// Reproducible bounded ORIGINAL source-position sampler: no minimax, best labels or solved oracle.
// Produces legal gravity/alternating firstwin-free trajectories from EMPTY; both players voluntarily avoid immediate wins.
// This source sampling is EXPERIMENTAL VALIDATION ONLY, not part of the zero-strategic-branching theorem.
import {originalLines,sourceFirstEntryMultitrap} from './maximal-first-entry-source.mjs';

const gamesPerBoard=600;
const boards=[[5,6],[6,6],[7,5],[7,6],[8,6],[10,6]];
let seed=0x7f4a7c15;
const rand=()=>{
 seed^=(seed<<13);seed^=seed>>>17;seed^=(seed<<5);
 return seed>>>0;
};

for(const [W,H] of boards){
 const lines=originalLines(W,H,4),bycell=Array.from({length:W*H},()=>[]);
 for(const L of lines)for(const x of L)bycell[x].push(L);
 const counts={screenedSourceStates:0,noTraps:0,oddNontrap:0,counterLineGuard:0,positiveSingleTrap:0,positiveMultiAlreadySingle:0,positiveMultiStrict:0,other:0};
 const examples=[];
 for(let game=0;game<gamesPerBoard;game++){
  const owner=new Int8Array(W*H).fill(-1),heights=Array(W).fill(0);
  let history='';
  for(let n=0;n<W*H;n++){
   if(n>=8){
    const result=sourceFirstEntryMultitrap({W,H,K:4,board:owner,heights,lines});
    counts.screenedSourceStates++;
    if(result.verdict==='EXACT_A_FIRSTWIN'){
     const k=result.traps.length>=2?(result.oldSingleTrapWinners.length?'positiveMultiAlreadySingle':'positiveMultiStrict'):'positiveSingleTrap';
     counts[k]++;
     if(examples.length<12 && result.traps.length>=2)examples.push({history,rank:n,traps:result.traps.map(x=>x+1),singleCovered:result.oldSingleTrapWinners.length>0,bound:result.maxAdditionalPlies});
    }else if(result.reason==='no_latent_traps')counts.noTraps++;
    else if(result.reason==='nontrap_odd_remaining_capacity')counts.oddNontrap++;
    else if(result.reason==='D_possible_counterfirstwin_envelope')counts.counterLineGuard++;
    else counts.other++;
   }
   const D=n%2,actions=[];
   for(let c=0;c<W;c++)if(heights[c]<H){
    const x=c*H+heights[c];
    if(!bycell[x].some(L=>L.every(e=>e===x || owner[e]===D)))actions.push(c);
   }
   if(actions.length===0)break;
   const c=actions[rand()%actions.length];
   owner[c*H+heights[c]]=D;heights[c]++;
   history+=(c<9?String(c+1):String.fromCharCode('A'.charCodeAt(0)+c-9));
  }
 }
 console.log(JSON.stringify({W,H,gamesPerBoard,counts,firstMultitrapPositives:examples}));
}
// Source-only, original-gravity firstwin-free legal prefix sampler for odd-base matched interference theorem.
// This samples NON-optimal/cooperative real positions; no solved labels, no minimax, no child WDL lookups.
import {originalLines} from './maximal-first-entry-source.mjs';
import {oddBaseInterferenceSource} from './odd-base-first-entry-interference-source.mjs';

const boards=[[5,6],[6,6],[7,5],[7,6],[8,6],[10,6]];
const gamesPerBoard=600;
let seed=0x7f4a7c15;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
for(const [W,H] of boards){
 const lines=originalLines(W,H,4),bycell=Array.from({length:W*H},()=>[]);
 for(const L of lines)for(const x of L)bycell[x].push(L);
 const tally={states:0,noTrap:0,oddCount:0,opponentLine:0,signedWins:0,
  addedByOddBase:0,positiveViaOddBasePair:0,positiveViaTwoTraps:0};
 const examples=[];
 for(let game=0;game<gamesPerBoard;game++){
  const board=new Int8Array(W*H).fill(-1),heights=Array(W).fill(0);
  let history='';
  for(let n=0;n<W*H;n++){
   if(n>=8){
    const cert=oddBaseInterferenceSource({W,H,K:4,board,heights,lines});
    tally.states++;
    if(cert.verdict==='EXACT_A_FIRSTWIN'){
     tally.signedWins++;
     if(cert.oddColumns.length)tally.addedByOddBase++;
     if(cert.dischargeMechanisms.viaOddPair)tally.positiveViaOddBasePair++;
     if(cert.dischargeMechanisms.viaTwoTraps)tally.positiveViaTwoTraps++;
     if(examples.length<12&&cert.oddColumns.length)examples.push({rank:n,history,respondent:cert.A,
      traps:cert.trapColumns,oddBasePairs:cert.oddBasePairs,pairs:cert.pairedReplyCapacity,discharge:cert.dischargeMechanisms});
    }else if(cert.reason==='no_trap')tally.noTrap++;
    else if(cert.reason==='odd_nontrap_count')tally.oddCount++;
    else if(cert.reason==='opponent_original_K_window_not_disqualified')tally.opponentLine++;
   }
   const p=n%2;const legal=[];
   for(let c=0;c<W;c++)if(heights[c]<H){
    const x=c*H+heights[c];
    if(!bycell[x].some(L=>L.every(e=>e===x||board[e]===p)))legal.push(c);
   }
   if(!legal.length)break;
   const c=legal[rnd()%legal.length];
   board[c*H+heights[c]++]=p;
   history+=(c<9?String(c+1):String.fromCharCode(65+c-9));
  }
 }
 process.stdout.write(JSON.stringify({W,H,gamesPerBoard,tally,firstPositiveOddHistoryExamples:examples})+'\n');
}
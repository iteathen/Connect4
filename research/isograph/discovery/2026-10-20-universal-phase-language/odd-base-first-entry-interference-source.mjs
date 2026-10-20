// ORIGINAL source-only guarded interference certificate: first-entry trap + matched ODD base frontiers.
// No future game-valued states, Oracle, selected terminal28 line inputs, or search.
import {originalLines, fromOriginalHistory, sourceFirstEntryMultitrap} from './maximal-first-entry-source.mjs';

const idx=(c,r,H)=>c*H+r;
export function oddBaseInterferenceSource(q){
 const {W,H,board,heights,lines}=q;
 const D=heights.reduce((a,b)=>a+b,0)%2,A=1-D;
 const traps=[],sourceTrapLines=[];
 for(let c=0;c<W;c++)if(H-heights[c]>=2){
  const y=idx(c,heights[c]+1,H);
  const line=lines.find(L=>L.includes(y)&&L.every(e=>e===y||board[e]===A));
  if(line){traps.push(c);sourceTrapLines.push({column:c,target:y,line});}
 }
 const common={A,D,trapColumns:traps};
 if(traps.length===0)return {verdict:'INCOMPLETE',reason:'no_trap',...common};
 const trapSet=new Set(traps), nontraps=Array.from({length:W},(_,c)=>c).filter(c=>!trapSet.has(c));
 const odd=nontraps.filter(c=>(H-heights[c])%2!==0);
 if(odd.length%2)return {verdict:'INCOMPLETE',reason:'odd_nontrap_count',oddColumns:odd,...common};
 // Frozen canonical sorted matching: one cross-column base pair per two odd columns.
 const pairs=[];for(let i=0;i<odd.length;i+=2)pairs.push([odd[i],odd[i+1]]);
 const L=new Set(), B=new Set(), X=new Set(traps.map(c=>idx(c,heights[c],H)));
 for(const c of nontraps){
  const first=heights[c]+((H-heights[c])%2);
  if(first!==heights[c])B.add(idx(c,heights[c],H));
  for(let r=first;r<H;r+=2)L.add(idx(c,r,H));
 }
 const noFirstWinDLine=[];
 let blocked=0,viaInaccessible=0,viaOddPair=0,viaTwoTraps=0;
 for(const winline of lines){
  if(winline.some(e=>board[e]===A)){blocked++;continue;}
  const G=winline.filter(e=>board[e]===-1);
  if(!G.length)return {verdict:'INCOMPLETE',reason:'source_terminal_invalid',...common};
  let mechanism=null;
  if(G.some(e=>!L.has(e)&&!B.has(e)&&!X.has(e))){mechanism='inaccessible';viaInaccessible++;}
  else if(pairs.some(([c,d])=>G.includes(idx(c,heights[c],H))&&G.includes(idx(d,heights[d],H)))){mechanism='oddBasePair';viaOddPair++;}
  else if(G.filter(e=>X.has(e)).length>=2){mechanism='twoTraps';viaTwoTraps++;}
  if(!mechanism)noFirstWinDLine.push({residual:G,winLine:winline});
 }
 const evenPairCount=nontraps.reduce((s,c)=>s+(H-heights[c]),0)/2;
 const base={...common,oddColumns:odd,oddBasePairs:pairs,sourceTrapLines,
  E:[...L],oddBaseFrontiers:[...B],trapFrontiers:[...X],
  checkedOriginalLines:lines.length,opponentViableOriginalLines:lines.length-blocked,
  dischargeMechanisms:{viaInaccessible,viaOddPair,viaTwoTraps},pairedReplyCapacity:evenPairCount,
  maxAdditionalPlies:2*evenPairCount+2};
 if(noFirstWinDLine.length)return {verdict:'INCOMPLETE',reason:'opponent_original_K_window_not_disqualified',counterExamples:noFirstWinDLine.slice(0,3),...base};
 return {verdict:'EXACT_A_FIRSTWIN',...base,olderEvenTrapPositive:sourceFirstEntryMultitrap(q).verdict==='EXACT_A_FIRSTWIN'};
}

if(process.argv[1]?.endsWith('/odd-base-first-entry-interference-source.mjs')){
 const examples=[
  [7,6,'74254126764411163322446'],
  [7,6,'6326226316246461'],
  [7,6,'414']
 ];
 for(const [W,H,history] of examples){
  const q=fromOriginalHistory(W,H,4,history),result=oddBaseInterferenceSource(q);
  process.stdout.write(JSON.stringify({W,H,rank:history.length,history,result})+'\n');
 }
}

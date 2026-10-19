// Independent physical GRID falsifier: enumerate all P1 choices against
// ONE frozen P0 online mirror/spare strategy on actual first-win-stopped
// original Connect-K gravity positions. Branching is validation-only.
import {createHorizontalOnlyOddAreaFirstDraw} from './source-horizontal-only-odd-area-P0-draw-response.mjs';
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
function buildOriginalLines(W,H,K){
 const all=[],inc=Array.from({length:W*H},()=>[]);
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of DIRS){
  const ex=c+(K-1)*dx,er=r+(K-1)*dy;
  if(ex<0||ex>=W||er<0||er>=H)continue;
  let mask=0n,sites=[];
  for(let j=0;j<K;j++){
   const z=(r+j*dy)*W+c+j*dx;
   mask|=1n<<BigInt(z);sites.push(z);
  }
  const line={start:[c,r],dx,dy,mask};
  all.push(line);
  for(const z of sites)inc[z].push(line);
 }
 return {all,inc};
}
function fullyControl(W,H,K,maxStates){
 const policy=createHorizontalOnlyOddAreaFirstDraw({width:W,height:H,connect:K}),
  {all,inc}=buildOriginalLines(W,H,K);
 const memo=new Set(),stats={W,H,K,originalWinningLines:all.length,
  physicalSourceStates:0,physicalP1AdversarialChoices:0,
  sourceP0LegalResponses:0,physicalDrawTerminals:0,
  P1FirstWins:0,P0FirstWins:0,sourceFutureGameValuesQueried:0,
  witness:null};
 function put(s,c,p){
  if(c<0||c>=W||s.h[c]>=H)throw Error('ORIGINAL_ILLEGAL_GRAVITY_DROP');
  const row=s.h[c],z=row*W+c,bit=1n<<BigInt(z),n=s.h.slice();n[c]++;
  if(((s.p0|s.p1)&bit)!==0n)throw Error('ORIGINAL_DOUBLE_OWNED_CELL');
  const owns=p===0?s.p0|bit:s.p1|bit;
  const firstWin=inc[z].find(L=>(owns&L.mask)===L.mask);
  return {s:{h:n,p0:p===0?owns:s.p0,p1:p===1?owns:s.p1},
   row,firstWin,full:n.every(h=>h===H)};
 }
 const start=put({h:Array(W).fill(0),p0:0n,p1:0n},policy.opening(),0);
 if(start.firstWin)throw Error('OPENING_CANNOT_K_WIN_WHEN_H_LT_K');
 if(start.full)return {status:'ROOT_FILLED_DRAW_AFTER_P0_INITIAL',...stats,
   physicalDrawTerminals:1};
 function dfs(s,history){
  const fingerprint=s.h.join('.')+'|'+s.p0.toString(16)+'|'+s.p1.toString(16);
  if(memo.has(fingerprint))return 'PASS';
  memo.add(fingerprint);stats.physicalSourceStates++;
  if(stats.physicalSourceStates>maxStates)return 'BUDGET_INCOMPLETE';
  for(let c=0;c<W;c++){
   if(s.h[c]>=H)continue;
   stats.physicalP1AdversarialChoices++;
   const p1=put(s,c,1),prefix=history.concat(c+1);
   if(p1.firstWin){
    stats.P1FirstWins++;stats.witness={history:prefix.join(''),
      line:p1.firstWin,player:1,sourceBefore:s.h};
    return 'P1_FIRST_WIN_COUNTEREXAMPLE';
   }
   if(p1.full)throw Error('ODD_TOTAL_AREA_P1_CANNOT_FILL_BOARD');
   const r=policy.reply({heightsBeforeP1:s.h,p1Column:c});
   const d=put(p1.s,r.originalP0Column,0);
   if(d.row!==r.originalP0Row||p1.row!==r.originalP1Row)
    throw Error('SOURCE_P0_MATE_ROW_MISMATCH');
   stats.sourceP0LegalResponses++;
   if(d.firstWin){
    stats.P0FirstWins++;stats.witness={history:prefix.concat(r.originalP0Column+1).join(''),
      line:d.firstWin,player:0,sourceBefore:s.h};
    return 'P0_FIRST_WIN_VIOLATES_STRONG_DRAW_POLICY';
   }
   if(d.full){stats.physicalDrawTerminals++;continue;}
   const result=dfs(d.s,prefix.concat(r.originalP0Column+1));
   if(result!=='PASS')return result;
  }
  return 'PASS';
 }
 const result=dfs(start.s,[policy.opening()+1]);
 return {status:result,...stats,sourceOpponentStrategiesEnumerated:0,
   independentPhysicalAdversarialBranching:true};
}
export function independentOddAreaP0HorizontalCampaign(){
 const results=[],incomplete=[],counterexamples=[];
 for(let K=3;K<=8;K++)
  for(let H=1;H<K && H<=7;H+=2)
   for(let W=1;W<=9;W+=2){
    if(W*H>23)continue;
    try{
     const r=fullyControl(W,H,K,180000);
     if(r.status==='PASS'||r.status==='ROOT_FILLED_DRAW_AFTER_P0_INITIAL')
      results.push(r);
     else if(r.status==='BUDGET_INCOMPLETE')incomplete.push({W,H,K,states:r.physicalSourceStates});
     else counterexamples.push(r);
    }catch(e){counterexamples.push({W,H,K,error:String(e)})}
   }
 const sum=k=>results.reduce((a,b)=>a+(b[k]??0),0);
 const rejected=[];
 for(const [W,H,K] of [[4,3,4],[5,2,4],[5,5,4],[3,3,3],[1,2,3]]){
  try{createHorizontalOnlyOddAreaFirstDraw({width:W,height:H,connect:K});
    rejected.push({W,H,K,rejected:false});
  }catch(e){rejected.push({W,H,K,rejected:true})}
 }
 return {status:counterexamples.length?'COUNTEREXAMPLE':
    incomplete.length?'BOUNDED_PHYSICAL_INCOMPLETE':'ALL_ODD_AREA_PHYSICAL_P1_BRANCHES_DRAW',
  sourceTheoremGuard:'K>=3,H<K, W odd,H odd',
  completedCases:results.length,incompleteCases:incomplete.length,
  physicalUniqueStates:sum('physicalSourceStates'),
  P1AlternativeMoves:sum('physicalP1AdversarialChoices'),
  P0Responses:sum('sourceP0LegalResponses'),
  fullDrawTerminals:sum('physicalDrawTerminals'),
  P0FirstWins:sum('P0FirstWins'),
  P1FirstWins:sum('P1FirstWins'),
  byK:Object.fromEntries([3,4,5,6,7,8].map(k=>[k,results.filter(r=>r.K===k).length])),
  examples:results.filter(r=>r.W===5&&r.H===3&&r.K===4||
    r.W===7&&r.H===3&&r.K===5).slice(0,4),
  guardNegativeChecks:rejected,counterexamples,incomplete,
  sourceFutureGameWDLEvaluations:0};
}

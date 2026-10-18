// Independent PHYSICAL gravity and direct four-in-a-row terminal checker.
// DFS explores multiple ATTACKER continuations only to FALSIFY a FROZEN source defender.
// No original source q residual computation or strategic valuation in the source producer.
// No certificate proof claim from this control alone; bounded results are INCOMPLETE.
export function validateCriticalSourcePolicyPhysical({history,certificate,W=7,H=6,K=4,nodeBudget=50000}){
  if(certificate?.status!=="CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN")throw Error("requires positive certificate");
  const N=W*H, board=Array(N).fill(-1),h=Array(W).fill(0),id=(c,r)=>r*W+c;
  const win=(x,p)=>{
    const c=x%W,r=Math.floor(x/W);
    for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
      let n=1;
      for(const s of [-1,1]){
        for(let i=1;;i++){
          const a=c+s*i*dc,b=r+s*i*dr;
          if(a<0||a>=W||b<0||b>=H||board[id(a,b)]!==p)break;
          n++;
        }
      }
      if(n>=K)return true;
    }
    return false;
  };
  let ply=0;
  function place(c,p){
    if(c<0||c>=W||h[c]>=H)throw Error("illegal physical placement");
    const x=id(c,h[c]++);
    board[x]=p;ply++;
    return {x,isWin:win(x,p)};
  }
  function undo(x){board[x]=-1;h[x%W]--;ply--;}
  for(let t=0;t<history.length;t++){
    const c=Number(history[t])-1,p=t&1;
    const z=place(c,p);
    if(z.isWin)throw Error("source history already terminal at move "+(t+1));
  }
  const p=ply&1,o=1-p,selected=certificate.staticCriticalSubfamilySelection;
  if(p!==certificate.originalCurrentMover||selected.length!==certificate.originalOwnerResidualSourceRHex.length)
    throw Error("physical certificate mover / critical selection mismatch");
  const bit=z=>1n<<BigInt(z);
  const originalG=selected.map(s=>BigInt(s.originalGHex));
  const critical=selected.map(s=>BigInt(s.selectedCriticalSetHex));
  const mapping=new Map(certificate.staticCriticalGateResponseMap.map(z=>[
    z.pFirstCriticalTouchOriginalID,z.oOriginalResponseID
  ]));
  const tally={physicalAttackerBranches:0,physicalDefenderReplies:0,terminalDefenderWins:0,
    terminalDraws:0,terminalAttackerWins:0,physicallyIllegalDefenderReplies:0,
    sourceMapMissingForLiveCriticalCell:0,criticalInvariantFailures:0,
    sourceInputPly:history.length,sourceOriginalMover:p,
    branchedFutureGamesInSource:0,physicalValidatorBranching:true};
  let witness=null,exhausted=false;
  function defenseActive(x){
    let seen=false;
    for(let j=0;j<originalG.length;j++){
      if((critical[j]&bit(x))===0n)continue;
      // A generator is live iff no original future cell in it is o-owned.
      let oBlocked=false;
      for(let z=0;z<N;z++)if((originalG[j]&bit(z))!==0n&&board[z]===o){oBlocked=true;break;}
      if(!oBlocked){seen=true;break;}
    }
    return seen;
  }
  function currentCriticalInvariant(){
    for(let j=0;j<originalG.length;j++){
      let oBlocked=false,pTouched=false;
      for(let z=0;z<N;z++)if((originalG[j]&bit(z))!==0n&&board[z]===o)oBlocked=true;
      if(oBlocked)continue;
      for(let z=0;z<N;z++)if((critical[j]&bit(z))!==0n&&board[z]===p)pTouched=true;
      if(pTouched)return false;
    }
    return true;
  }
  function dfs(path){
    if(exhausted||witness)return;
    if(tally.physicalAttackerBranches>=nodeBudget){exhausted=true;return;}
    if(ply===N){tally.terminalDraws++;return;}
    for(let c=0;c<W;c++){
      if(h[c]>=H)continue;
      if(tally.physicalAttackerBranches>=nodeBudget){exhausted=true;return;}
      tally.physicalAttackerBranches++;
      const {x,isWin}=place(c,p),newPath=path.concat(c+1);
      if(isWin){
        tally.terminalAttackerWins++;
        witness={reason:"PHYSICAL_ATTACKER_FIRST_WIN_UNDER_SOURCE_POLICY",history:history+newPath.join(""),physicalWinningCell:x};
        undo(x);return;
      }
      if(ply===N){tally.terminalDraws++;undo(x);continue;}
      let y;
      if(defenseActive(x)){
        y=mapping.get(x);
        if(y===undefined){tally.sourceMapMissingForLiveCriticalCell++;
          witness={reason:"SOURCE_POLICY_MISSING_LIVE_CRITICAL_CELL",history:history+newPath.join(""),x};undo(x);return;
        }
      }else{
        const idle=h.findIndex(z=>z<H);
        if(idle<0){tally.terminalDraws++;undo(x);continue;}
        y=id(idle,h[idle]);
      }
      if(y<0||y>=N||h[y%W]!==Math.floor(y/W)){
        tally.physicallyIllegalDefenderReplies++;
        witness={reason:"ILLEGAL_GRAVITY_SOURCE_DEFENDER_RESPONSE",history:history+newPath.join(""),x,invalidDefenderCell:y};
        undo(x);return;
      }
      const z=place(y%W,o),continuation=newPath.concat(y%W+1);
      tally.physicalDefenderReplies++;
      if(z.isWin)tally.terminalDefenderWins++;
      else if(ply===N)tally.terminalDraws++;
      else if(!currentCriticalInvariant()){
        tally.criticalInvariantFailures++;
        witness={reason:"CRITICAL_SUBFAMILY_INVARIANT_FAILED",history:history+continuation.join(""),x,y};
      }else dfs(continuation);
      undo(z.x);undo(x);
      if(witness||exhausted)return;
    }
  }
  if(!currentCriticalInvariant())throw Error("critical invariant false at original root");
  dfs([]);
  return {status:witness?"PHYSICAL_COUNTEREXAMPLE":exhausted?"PHYSICAL_CONTROL_BUDGET_INCOMPLETE":"PHYSICAL_POLICY_PASS",
    history,sourceCertificateKind:certificate.kind,details:tally,witness,
    validatorDistinctFromOriginalSource:true};
}

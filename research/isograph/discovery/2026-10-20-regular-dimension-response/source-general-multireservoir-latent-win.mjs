// Non-search guarded WDL sufficient WIN for the player responding SECOND:
// a physically latent original K-line target in danger column plus any
// number of even-capacity "burnable" other-column paired reservoirs.
// Owner-specific maximal defender win-mask veto includes opponent FIRST-WIN.
// Source reads ONLY current true original q and W/H/K; NO solved future WDL.
export function kWindows(W,H,K){
 const list=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   let cells=Array.from({length:K},(_,i)=>[c+i*dc,r+i*dr]);
   if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
     list.push(cells);
 }
 return list;
}
export function sourceMultiReservoirResponderWin(q,K=4){
 const {W,H,n,h,b}=q;
 if(!Number.isInteger(n)||n!==h.reduce((a,v)=>a+v,0))
   return {status:"INCOMPLETE",reason:"source_not_well_formed"};
 const D=n%2,A=1-D,L=kWindows(W,H,K);
 if(L.some(line=>[0,1].some(p=>line.every(([c,r])=>b[c][r]===p))))
   return {status:"INCOMPLETE",reason:"source_already_firstwin_terminal"};
 // Collect legitimate original A monochrome K4-or-other-K windows that are
 // one future cell from winning; also collect original defender requirements.
 const Aone=new Set(),Dreq=[];
 const encode=(c,r)=>c*H+r;
 for(const line of L){
   let owners=[0,0],empty=[];
   for(const [c,r] of line){
     let v=b[c][r];
     if(v===-1)empty.push(encode(c,r));
     else if(v===0||v===1)owners[v]++;
     else return {status:"INCOMPLETE",reason:"invalid_board_owner"};
   }
   if(owners[D]===0&&owners[A]===K-1&&empty.length===1)
     Aone.add(empty[0]);
   if(owners[A]===0)Dreq.push(empty);
 }
 const legal=h.map((v,c)=>v<H?c:-1).filter(c=>c>=0);
 for(const danger of legal){
   if(H-h[danger]<2)continue;
   const x=encode(danger,h[danger]);
   const y=encode(danger,h[danger]+1);
   if(!Aone.has(y))continue;
   const t=h.map(z=>H-z);
   if(t.some((v,c)=>c!==danger&&(v%2)!==0))continue;
   const maxD=new Set([x]),reservoirs=[];
   for(let c=0;c<W;c++)if(c!==danger){
     for(let r=h[c];r<H;r+=2)
       maxD.add(encode(c,r));
     if(t[c]>0)reservoirs.push({columnOneBased:c+1,pairedCapacity:t[c]/2,
       defenderLowerRowsOneBased:Array.from({length:t[c]/2},(_,j)=>h[c]+2*j+1)});
   }
   const counterexample=Dreq.find(requirement=>requirement.every(cell=>maxD.has(cell)));
   if(counterexample)continue;
   const quota=reservoirs.reduce((z,v)=>z+v.pairedCapacity,0);
   return {
     status:"SOURCE_PROVED_RESPONDER_FIRST_WIN",
     sourceDPlayer:D,sourceAPlayer:A,
     rank:n, originalGeometry:{W,H,K},
     dangerColumnOneBased:danger+1,
     originalDangerLowerOneBased:[danger+1,h[danger]+1],
     originalLatentAttackerWinningTargetOneBased:[danger+1,h[danger]+2],
     otherColumnEvenReservoirs:reservoirs,
     totalReservoirPairs:quota,
     defenderMaximalAdditionalOwnerCellsOneBased:
       [...maxD].sort((a,b)=>a-b).map(id=>[Math.floor(id/H)+1,id%H+1]),
     originalDefenderLiveWinningRequirementCount:Dreq.length,
     defenderWinningRequirementsContainedInMaxMask:0,
     maximumAdditionalPliesUntilAttackerFirstwin:2*quota+2,
     policy:"If D chooses danger lower, A immediately firstwins above. Else A upper-mates D in the SAME even-remaining column. All D winning K-window residuals fail maximal possible extra D mask."
   };
 }
 return {status:"INCOMPLETE",reason:"no_guarded_latent_terminal_plus_all_other_even_pair_reservoirs"};
}

// SOURCE exact original physical 7x6 K4 FOUR-RIBBON DC / Radon
// reconstruction theorem. From 69 legitimate non-wrapped four-cell
// line sums rank_Q38/rank_GF2 35, FOUR active-strand DC moments
// reach rankQ42 and SEVEN full active strand parity moments reach
// rankGF2 42, no external owner anchor required. Game WDL UNTOUCHED.
export function sourceOriginal7x6UnfoldedRadonDC(){
 const W=7,H=6,K=4,index=(c,r)=>r*W+c,dirs=[[1,0],[0,1],[1,1],[1,-1]];
 const winlines=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of dirs)
  if(x+3*dx>=0&&x+3*dx<W&&y+3*dy>=0&&y+3*dy<H)
   winlines.push([0,1,2,3].map(k=>index(x+k*dx,y+k*dy)));
 const strands=[];
 for(let r=0;r<H;r++)strands.push({dir:'H',index:r,sites:Array.from({length:W},(_,c)=>index(c,r))});
 for(let c=0;c<W;c++)strands.push({dir:'V',index:c,sites:Array.from({length:H},(_,r)=>index(c,r))});
 for(let d=-(H-1);d<W;d++){
  const sites=[];
  for(let c=0;c<W;c++){const r=c-d;if(r>=0&&r<H)sites.push(index(c,r))}
  strands.push({dir:'R',index:d,sites});
 }
 for(let d=0;d<W+H-1;d++){
  const sites=[];
  for(let c=0;c<W;c++){const r=d-c;if(r>=0&&r<H)sites.push(index(c,r))}
  strands.push({dir:'F',index:d,sites});
 }
 const active=strands.filter(s=>s.sites.length>=4);
 const pick=(dir,id)=>{
  const s=active.find(s=>s.dir===dir&&s.index===id);
  if(!s)throw Error('missing original 7x6 full winning-capable strand '+dir+' '+id);
  return s;
 };
 const realSelected=[pick('H',0),pick('H',1),pick('H',2),pick('R',-1)];
 const binarySelected=[pick('H',0),pick('H',1),pick('H',2),
  pick('V',0),pick('V',1),pick('R',-1),pick('R',0)];
 const GFmask=ids=>ids.reduce((m,j)=>m|(1n<<BigInt(j)),0n);
 function rank2(lists){
  const piv=new Map();let rank=0;
  for(const ids of lists){
   let v=GFmask(ids);
   while(v){
    const j=v.toString(2).length-1;
    if(piv.has(j))v^=piv.get(j);
    else{piv.set(j,v);rank++;break}
   }
  }
  return rank;
 }
 function rankMod(lists,prime=101){
  const rows=lists.map(ids=>Array.from({length:42},(_,j)=>ids.includes(j)?1:0));
  let rank=0;
  function pow(a,n){let x=1;while(n){if(n&1)x=x*a%prime;a=a*a%prime;n=Math.floor(n/2)}return x}
  for(let j=0;j<42;j++){
   let i=rank;while(i<rows.length&&!rows[i][j])i++;
   if(i>=rows.length)continue;
   [rows[i],rows[rank]]=[rows[rank],rows[i]];
   const iv=pow(rows[rank][j],prime-2);
   for(let k=j;k<42;k++)rows[rank][k]=rows[rank][k]*iv%prime;
   for(let r=rank+1;r<rows.length;r++){
    let factor=rows[r][j];if(!factor)continue;
    for(let k=j;k<42;k++)
     rows[r][k]=(rows[r][k]-factor*rows[rank][k]+prime*prime)%prime;
   }
   rank++;
  }
  return rank;
 }
 const rankGFsteps=Array.from({length:8},(_,i)=>rank2(winlines.concat(binarySelected.slice(0,i).map(x=>x.sites))));
 const rankRealSteps=Array.from({length:5},(_,i)=>rankMod(winlines.concat(realSelected.slice(0,i).map(x=>x.sites))));
 const rankGFactive=rank2(winlines.concat(active.map(x=>x.sites))),
  rankRealActive=rankMod(winlines.concat(active.map(x=>x.sites)));
 if(winlines.length!==69||active.length!==25||strands.length!==37||
  JSON.stringify(rankGFsteps)!==JSON.stringify([35,36,37,38,39,40,41,42])||
  JSON.stringify(rankRealSteps)!==JSON.stringify([38,39,40,41,42])||
  rankGFactive!==42||rankRealActive!==42)
  throw Error('original7x6 two-field Fourier DC reconstruction cannot be certified');
 const probes=(sources)=>sources.map(s=>({orientation:s.dir,strandIndex:s.index,
  numberOfActualPhysicalSites:s.sites.length,physicalSiteIDs:s.sites.slice(),
  equalsUnnormalizedZeroDFTFrequency:true}));
 return {
  status:'SOURCE_TRUE7X6_K4_UNFOLDED_FOURIER_DC_COMPLETE_TWO_FIELD_RECOVERY',
  board:[W,H,K],originalPhysicalCells:42,
  physicalFourWinMovingWindowMeasurements:winlines.length,
  totalFourRibbonStrands:strands.length,activeWinningCapableStrands:active.length,
  originalMovingFourSiteWinningLineIDs:winlines,
  originalAllActiveFullStrandDCPhysicalIDs:active.map(s=>s.sites),
  GF2:{
   sourceField:'GF2',
   original69WindowParityRank:rankGFsteps[0],
   exactlySevenExtraFullStrandParities:probes(binarySelected),
   rankAfterEachAddedDC:rankGFsteps,
   fullAugmentedRank:rankGFsteps.at(-1),
   original128ElementHiddenSubgroupEliminatedCompletely:true,
   noExternalAbsoluteOwnerAnchorNeeded:true,
   sourceMeasurements:winlines.concat(binarySelected.map(s=>s.sites))
  },
  Rational:{
   sourceField:'Q',
   original69WindowSumRankCertifiedByMod101:rankRealSteps[0],
   exactlyFourExtraFullStrandIntegerSums:probes(realSelected),
   rankMod101AfterEachDC:rankRealSteps,
   fullAugmentedRank:rankRealSteps.at(-1),
   sourceMeasurements:winlines.concat(realSelected.map(s=>s.sites))
  },
  sourceNoGameFutureWDLQueries:0,
  noOriginalConnect4RootWDLOrBestMoveEstablished:true
 };
}

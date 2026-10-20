// ORIGINAL W7,H6,K4. Geometric four-ribbon junction network is
// CONSTRUCTED FIRST: 37 finite strands, 42 four-way physical junctions,
// 168 alias appearances; only after that define owner projectors
// K_p=T diag(n_p) T^† and hypothetical ensemble mean operators.
// F_ribbon unitary; T=F_ribbon M/2 exactly isometric.
// Cross DIFFERENT orientation-strand pairs intersect at at most ONE
// physical site. Fourier cross-junction matrix entry is one single
// complex phase. This is NOT previous "compute P0/P1 winline stats on
// flat grid then attach DFT" methodology and is NOT a strategic WDL.
// Frozen research:
// docs/research/2026-10-19-CORRECTED-original7x6-unfold-FIRST-two-owner-wave-junction-network.md
export function sourceTrue7x6UnfoldFirstOwnerJunctionWaves(){
 const W=7,H=6,K=4,N=42,site=(c,r)=>r*7+c;
 const strands=[];
 function add(orientation,label,c,r,dc,dr){
  const cells=[];
  while(c>=0&&c<W&&r>=0&&r<H){
   cells.push(site(c,r));c+=dc;r+=dr;
  }
  strands.push({orientation,label,cells,length:cells.length});
 }
 for(let r=0;r<H;r++)add('H','row'+r,0,r,1,0);
 for(let c=0;c<W;c++)add('V','col'+c,c,0,0,1);
 for(let c=0;c<W;c++)add('R','c-r='+c,c,0,1,1);
 for(let r=1;r<H;r++)add('R','c-r='+(-r),0,r,1,1);
 for(let r=0;r<H;r++)add('F','c+r='+r,0,r,1,-1);
 for(let c=1;c<W;c++)add('F','c+r='+(c+H-1),c,H-1,1,-1);
 if(strands.length!==37)throw Error('original unfolded strand count not37');
 const appearance=[],perSite=Array.from({length:N},()=>[]);
 for(let s=0;s<strands.length;s++){
  for(let t=0;t<strands[s].length;t++){
   const e=strands[s].cells[t],a=appearance.length;
   appearance.push({appearance:a,strand:s,localPosition:t,site:e});
   perSite[e].push({strand:s,position:t,appearance:a});
  }
 }
 if(appearance.length!==168||perSite.some(x=>x.length!==4||
   new Set(x.map(v=>strands[v.strand].orientation)).size!==4))
  throw Error('fourfold true physical aliases missing');
 // Undirected 37-strand / 42-site bipartite graph.
 function graphConnected(nodes,edges){
  const adj=Array.from({length:nodes},()=>[]);
  for(const [a,b] of edges){adj[a].push(b);adj[b].push(a);}
  const q=[0],seen=new Set([0]);
  for(let i=0;i<q.length;i++)for(const j of adj[q[i]])
   if(!seen.has(j)){seen.add(j);q.push(j)}
  return seen.size===nodes;
 }
 const bipEdges=appearance.map(x=>[x.strand,37+x.site]);
 const bipConnected=graphConnected(79,bipEdges);
 const strandPairEdges=[],keySet=new Set(),pairByKey=new Map();
 for(let e=0;e<N;e++)for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
  const a=perSite[e][i],b=perSite[e][j],
    low=Math.min(a.strand,b.strand),high=Math.max(a.strand,b.strand),
    key=low+':'+high;
  if(keySet.has(key))throw Error('two different physical original sites where SAME two direction strands intersect');
  keySet.add(key);
  const data={strandA:low,strandB:high,physicalCell:e,
   posA:perSite[e].find(x=>x.strand===low).position,
   posB:perSite[e].find(x=>x.strand===high).position};
  strandPairEdges.push(data);pairByKey.set(key,data);
 }
 const crossConnected=graphConnected(37,strandPairEdges.map(x=>[x.strandA,x.strandB]));
 if(!bipConnected||!crossConnected||strandPairEdges.length!==252)
  throw Error('original fourfold ribbon physical connectivity missing');
 function Fcoefficient(s,k,e) {
  const strand=strands[s],pos=strand.cells.indexOf(e);
  if(pos<0)return {re:0,im:0};
  const theta=2*Math.PI*k*pos/strand.length;
  return {re:Math.cos(theta)/(2*Math.sqrt(strand.length)),
   im:Math.sin(theta)/(2*Math.sqrt(strand.length))};
 }
 const conjugate=z=>({re:z.re,im:-z.im});
 const multiply=(a,b)=>({re:a.re*b.re-a.im*b.im,
   im:a.re*b.im+a.im*b.re});
 function spectralKernelElement(s,k,t,l,weightByOriginalSite) {
  const alpha=strands[s],beta=strands[t];
  if(!Number.isInteger(k)||k<0||k>=alpha.length||
    !Number.isInteger(l)||l<0||l>=beta.length)
   throw Error('invalid true original finite-ribbon mode index');
  if(!Array.isArray(weightByOriginalSite)||weightByOriginalSite.length!==42)
   throw Error('42 physical junction weights required');
  let re=0,im=0,numberOfSharedPhysicalSites=0;
  for(const e of alpha.cells){
   if(!beta.cells.includes(e))continue;
   numberOfSharedPhysicalSites++;
   const term=multiply(Fcoefficient(s,k,e),conjugate(Fcoefficient(t,l,e))),
     w=weightByOriginalSite[e];
   re+=w*term.re;im+=w*term.im;
  }
  return {re,im,numberOfSharedPhysicalSites};
 }
 // Actual ordinary board owner indicator: TRUE gravity & firstwin stop.
 const directions=[[1,0],[0,1],[1,1],[1,-1]],windows=[];
 for(let r=0;r<6;r++)for(let c=0;c<7;c++)
  for(const [dc,dr] of directions)
   if(c+3*dc>=0&&c+3*dc<7&&r+3*dr>=0&&r+3*dr<6)
    windows.push([0,1,2,3].map(j=>site(c+j*dc,r+j*dr)));
 function actualBoard(word){
  const values=Array(42).fill(-1),heights=Array(7).fill(0);
  let terminal=null;
  for(let t=0;t<word.length;t++){
   const c=Number(word[t])-1,p=t%2;
   if(terminal!==null)throw Error('cannot continue actual real original game after first winner');
   if(!Number.isInteger(c)||c<0||c>=7||heights[c]>=6)
    throw Error('actual standard original legal column needed');
   const e=site(c,heights[c]++);values[e]=p;
   if(windows.some(line=>line.includes(e)&&line.every(id=>values[id]===p)))
    terminal=p===0?'P0_WIN':'P1_WIN';
   else if(heights.every(x=>x===6))terminal='DRAW';
  }
  const own0=values.map(v=>v===0?1:0),
    own1=values.map(v=>v===1?1:0),
    empty=values.map(v=>v===-1?1:0);
  return {word,heights,physicalOwner:values,own0,own1,empty,
   signedOwner:values.map(v=>v===0?1:v===1?-1:0),terminal};
 }
 const examples={
  empty:actualBoard(''),
  real44444:actualBoard('44444'),
  real444444:actualBoard('444444'),
  legalDraw:actualBoard('123456123456654321654321123456123456777777'),
  P1Terminal14:actualBoard('44444421122333')
 };
 const binomial=(n,k)=>{if(k<0||k>n)return 0n;
  let b=1n;k=Math.min(k,n-k);
  for(let j=1;j<=k;j++)b=b*BigInt(n-k+j)/BigInt(j);
  return b;};
 function expectedCompleteOwnerWaves(realBoard){
  if(realBoard.terminal!==null)throw Error('conditional hypothetical complete interleaving requires real nonterminal source');
  const ply=realBoard.word.length,Nfuture=42-ply,p0=[],p1=[],mu=[],
    marginals=[];
  for(let e=0;e<42;e++){
   const known=realBoard.physicalOwner[e];
   if(known!==-1){
    const a=known===0?1:0,b=known===1?1:0;
    p0.push(a);p1.push(b);mu.push(a-b);
    marginals.push({site:e,p0Numerator:String(a),p1Numerator:String(b),
     signedNumerator:String(a-b),denominator:'1',source:'ACTUAL_INITIAL_OWNER'});
    continue;
   }
   const c=e%7,row=Math.floor(e/7),m=6-realBoard.heights[c],
    k=row-realBoard.heights[c],den=binomial(Nfuture,m);
   let sign=0n;
   for(let t=k;t<=Nfuture-m+k;t++){
    const ways=binomial(t,k)*binomial(Nfuture-1-t,m-k-1);
    sign+=((ply+t)&1)?-ways:ways;
   }
   if((den+sign)%2n!==0n)
    throw Error('exact rational conditional natural owner Fourier parity failed');
   const a=(den+sign)/2n,b=(den-sign)/2n;
   p0.push(Number(a)/Number(den));
   p1.push(Number(b)/Number(den));
   mu.push(Number(sign)/Number(den));
   marginals.push({site:e,p0Numerator:String(a),p1Numerator:String(b),
    signedNumerator:String(sign),denominator:String(den),
    source:'HYPOTHETICAL_COMPLETE_ORIGINAL_CHAIN_SHUFFLE'});
  }
  let overlap=0,slack=0,signedTrace=0;
  for(let e=0;e<42;e++){
   overlap+=p0[e]*p1[e];
   slack+=1-mu[e]*mu[e];
   signedTrace+=mu[e];
  }
  return {originalStartingWord:realBoard.word,
   startingStateFirstWinFree:true,
   trueOriginalP0AndP1MeanCellFields:{P0:p0,P1:p1,signed:mu},
   naturalTemporalParityWaveExactSiteRationals:marginals,
   meanOwnerCrossHistoryOverlapTrace:overlap,
   meanOwnerCancellationsVarianceSlackTrace:slack,
   slackEqualsFourTimesCrossHistoryOverlap:Math.abs(slack-4*overlap)<1e-11,
   globalSignedOwnerTrace:signedTrace,
   playerSignedOwnerTotalPerVerticalPhysicalColumn:
    Array.from({length:7},(_,c)=>Array.from({length:6},(_,r)=>mu[site(c,r)]).reduce((a,b)=>a+b,0)),
   mathematicallyCompletesBeyondAnyOriginalFirstWin:true,
   actualGameWDLComputed:false};
 }
 const meanEmpty=expectedCompleteOwnerWaves(examples.empty),
   mean44444=expectedCompleteOwnerWaves(examples.real44444);
 const H1=strands.findIndex(s=>s.orientation==='H'&&s.label==='row1'),
   V3=strands.findIndex(s=>s.orientation==='V'&&s.label==='col3'),
   R1=strands.findIndex(s=>s.orientation==='R'&&s.label==='c-r=1');
 if([H1,V3,R1].some(x=>x<0))
  throw Error('original physical Fourier triangle not found');
 const cHV=spectralKernelElement(H1,1,V3,1,Array(42).fill(1)),
  cVR=spectralKernelElement(V3,1,R1,1,Array(42).fill(1)),
  cRH=spectralKernelElement(R1,1,H1,1,Array(42).fill(1));
 const holonomy=multiply(multiply(cHV,cVR),cRH),
  expectedAngle=2*Math.PI/7,phase=Math.atan2(holonomy.im,holonomy.re),
  expectedPhase={re:Math.cos(expectedAngle),im:Math.sin(expectedAngle)};
 if(Math.abs(Math.cos(phase)-expectedPhase.re)>1e-11||
    Math.abs(Math.sin(phase)-expectedPhase.im)>1e-11)
  throw Error('original 7x6 crossing geometry nontrivial Fourier triangle phase incorrect');
 function oneHistoryProjectorSummary(b){
  const tr0=b.own0.reduce((a,v)=>a+v,0),
    tr1=b.own1.reduce((a,v)=>a+v,0),
    trE=b.empty.reduce((a,v)=>a+v,0);
  if(tr0+tr1+trE!==42||b.own0.some((v,e)=>v*b.own1[e]!==0))
   throw Error('P0 and P1 simultaneous same-cell occupancy impossible');
  return {originalWord:b.word,physicalOwnerProjectorRanks:{P0:tr0,P1:tr1,empty:trE},
   signedOwnerProjectorSquareEqualsOccupiedProjector:true,
   P0P1OwnerProjectorProductExactlyZero:true,
   originalRealFirstWinTerminal:b.terminal,
   physicalOwnerBitSigns:b.signedOwner};
 }
 return {
  status:'SOURCE_TRUE7X6_UNFOLD_FIRST_FOURWAY_WAVE_JUNCTION_INTERFERENCE',
  originalBoard:[7,6,4],physicalCells:42,
  originalStrandCount:strands.length,
  originalFourWayJunctionCount:perSite.length,
  originalDirectionalAppearanceCount:appearance.length,
  bipartiteGraph:{nodes:79,edges:bipEdges.length,connected:bipConnected,
   cycleRank:bipEdges.length-79+1},
  strandOnlyProjectedGraph:{nodes:37,edges:strandPairEdges.length,
   connected:crossConnected,cycleRank:strandPairEdges.length-37+1},
  originalK4WinLines:windows.length,
  physicalIsometry:'T=F_ribbons*M/2; T_dagger*T=I42',
  physicalFourFoldAliasProjector:'P_phys=T*T_dagger, rank42, nullity126',
  singleCrossOrientationJunction:
   'K_owner(σk,τl)=owner(e)*exp(2πi[k tσ(e)/lσ-l tτ(e)/lτ])/(4sqrt(lσ*lτ)) if unique site e; otherwise0',
  sameStrandModeInterference:
   'K_owner(σk,σl)=sum_{e in σ}owner(e)*exp(2πi(k-l)tσ(e)/lσ)/(4*lσ)',
  physicalOwnerProjectorIdentities:
   'K_p^2=K_p, K_p K_q=0, Sum_p K_p=P_phys, Delta^2=K0+K1 (occupied)',
  expectedOwnerOverlayIdentities:
   'E[K0]E[K1]=Tdiag(p0(e)p1(e))T†; Gamma=E[K0+K1]-(E[K0]-E[K1])²=Tdiag(o_e-mu_e²)T†',
  completeHypotheticalOwnerWaveSlack:
   'Gamma=P_phys-Delta_mean²=4 E[K0]E[K1]; traceGamma=4sum_e p0(e)p1(e)',
  geometry:{strands,appearance,perSite,strandPairEdges},
  realOriginalHistoryProjectorControls:Object.fromEntries(
    Object.entries(examples).map(([k,v])=>[k,oneHistoryProjectorSummary(v)])),
  conditionalHypotheticalOriginalCompletionWaves:{empty:meanEmpty,
   real44444:mean44444},
  originalCrossingTriangle:{
   actualStrandIDs:[H1,V3,R1],modes:[1,1,1],
   actualPhysicalJunctionSites:[site(3,1),site(3,2),site(2,1)],
   separateFourierCrossAmplitudes:[cHV,cVR,cRH],
   product:holonomy,phaseRadians:phase,
   geometricPhaseCharacter:'exp(2πi/7)',
   interpretation:'Nontrivial Fourier-mode cycle phase from three DIFFERENT true physical junctions, not quantum evolution or game outcome'
  },
  sourceWDLOrBestOriginalMove:null,sourceFutureStrategicGamesEvaluated:0
 };
}

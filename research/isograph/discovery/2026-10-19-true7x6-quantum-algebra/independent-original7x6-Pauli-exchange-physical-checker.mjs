// FROZEN INDEPENDENT ORIGINAL physical 7x6 K4 checker for the prior
// sparse Pauli/parity source. No imported source line masks, incidence,
// eigenvalue calculations, or color-grid reconstruction: all rebuilt here.
// The 756 full words are hypothetical gravity interleavings with first-win
// stop SUSPENDED solely for algebra (NOT 1512 legal entire game histories).
// A different, explicit original cooperative 42-move word is checked
// under ACTUAL FIRST-WIN STOP. No WDL minimax or future game-value query.
import {sourceTrue7x6K4PauliExchange} from './source-original7x6-Pauli-affine-exchange.mjs';
function physical7x6K4(){
 const W=7,H=6,K=4,dir=[
  {name:'horizontal',x:1,y:0},
  {name:'vertical',x:0,y:1},
  {name:'rising',x:1,y:1},
  {name:'falling',x:1,y:-1}
 ];
 const lines=[];
 for(let row=0;row<H;row++)for(let col=0;col<W;col++){
  for(const d of dir){
   const endCol=col+(K-1)*d.x,endRow=row+(K-1)*d.y;
   if(endCol<0||endCol>=W||endRow<0||endRow>=H)continue;
   const sites=[];
   for(let k=0;k<K;k++)
    sites.push((row+k*d.y)*W+col+k*d.x);
   lines.push({orientation:d.name,sites,key:sites.slice().sort((a,b)=>a-b).join(',')});
  }
 }
 return {W,H,K,lines};
}
function physicalColumnWordToOwners(word){
 const W=7,H=6,N=42,heights=Array(W).fill(0),owner=Array(N).fill(-1);
 if(!Array.isArray(word)||word.length!==N)throw Error('wrong original full gravity word length');
 for(let t=0;t<N;t++){
  const c=word[t];
  if(!Number.isInteger(c)||c<0||c>=W||heights[c]>=H)
   throw Error('invalid gravity interleaving at t='+t);
  const row=heights[c]++,z=row*W+c;
  if(owner[z]!==-1)throw Error('duplicate original cell');
  owner[z]=t%2; // alternating owner, including hypothetical continuation beyond terminal
 }
 if(heights.some(x=>x!==H)||owner.some(x=>x<0))
  throw Error('hypothetical full physical occupancy incomplete');
 return owner;
}
function rawPauliLineNumerator(owner,sites){
 const z=sites.map(i=>owner[i]===0?1:-1);
 let out=1;
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)out+=z[i]*z[j];
 out+=z.reduce((a,b)=>a*b,1);
 return out;
}
function independentEnergy8FromTerms(owner,terms){
 let result=0;
 for(const item of terms){
  let mask=BigInt(item.PauliZSupportMaskHex),sign=1;
  while(mask){
   const lowest=mask&(-mask);
   let site=0n,x=lowest;
   while(x>1n){x>>=1n;site++;}
   if(owner[Number(site)]===1)sign=-sign;
   mask^=lowest;
  }
  result+=sign*item.numerator;
 }
 return result;
}
function independentFullBoardOrdinaryFirstWinControl(){
 const {lines}=physical7x6K4();
 const W=7,H=6,N=42,word=[],q=Array(W).fill(0),board=Array(N).fill(-1);
 // Even-width 6-column phase stripe, then odd-width c7 tail.
 for(let row=0;row<H;row++){
  const sequence=((row>>1)&1)?[5,4,3,2,1,0]:[0,1,2,3,4,5];
  word.push(...sequence);
 }
 for(let row=0;row<H;row++)word.push(6);
 if(word.length!==N)throw Error('constructive true7x6 full history not42');
 let wins=0;
 for(let i=0;i<N;i++){
  const col=word[i],row=q[col]++,id=row*W+col,p=i%2;
  if(board[id]!==-1)throw Error('physical full draw double placed');
  board[id]=p;
  for(const L of lines){
   if(L.sites.includes(id)&&L.sites.every(z=>board[z]===p))
    wins++;
  }
  if(wins>0)throw Error('original first-win-stopped cooperative physical draw witness invalid at ply'+(i+1));
 }
 if(q.some(h=>h!==H))throw Error('actual physical draw not full');
 const noMono=lines.every(L=>new Set(L.sites.map(z=>board[z])).size!==1);
 if(!noMono)throw Error('physically tested completed draw has monochrome line');
 return {status:'ORIGINAL_FIRST_WIN_STOPPED_42_PLY_COOPERATIVE_DRAW',
   literalOriginalColumnWordOneBased:word.map(c=>c+1).join(''),
   gameMoves:42,physicalOriginalWinlinesChecked:lines.length,
   firstWinOccurred:false,terminal:'DRAW',monoK4LinesAtFull:0,
   p0Cells:board.filter(p=>p===0).length,p1Cells:board.filter(p=>p===1).length,
   fullFinalColoring:board};
}
export function independentOriginal7x6K4QuantumPauliValidation(){
 const algebra=sourceTrue7x6K4PauliExchange(),physical=physical7x6K4();
 const failures=[],Klines=physical.lines,byKey=new Map(Klines.map(L=>[L.key,L]));
 const actualWindows=algebra.windows.map(L=>L.cells.slice().sort((a,b)=>a-b).join(','));
 const sourceWindowKeys=new Set(actualWindows),sourcePauliTerms=algebra.terms;
 if(Klines.length!==69||algebra.windows.length!==69||
    sourceWindowKeys.size!==69||sourceWindowKeys.size!==byKey.size||
    sourceWindowKeys.size!==[...byKey.keys()].filter(k=>sourceWindowKeys.has(k)).length)
   failures.push({type:'SOURCE_INDEPENDENT_ORIGINAL_69_WINDOW_MISMATCH'});
 if(sourcePauliTerms.length!==352||algebra.sourceGF2DifferenceRank!==41||
    algebra.witnesses.length!==756)
   failures.push({type:'SOURCE_RANK_GEOMETRY_OR_TERMS_MISMATCH'});
 const stats={sourceQuantumStatevectorUsed:false,sourceGameTreeWDLValues:0,
   validatedDimensions:[7,6,4],
   independentOriginalWindowCount:Klines.length,
   sourceGravitySwapWitnesses:algebra.witnesses.length,
   actualPhysicalGravityShuffleWordChecks:0,
   physicalOwnerQuotaP0Checks:0,physicalOwnerQuotaP1Checks:0,
   originalCellOwnerExchangeChecks:0,
   originalWindowPauliProjectorChecks:0,
   lineTruthExchangeIncidenceChecks:0,
   fullHamiltonianPauliEnergyChecks:0,
   changedMonoLineValuesAcrossSwaps:0,
   changedMonoWindowOrientations:{horizontal:0,vertical:0,rising:0,falling:0},
   nontrivialPauliStabilizerGraphEdges:0,
   independentParityConnectivityVertexCount:0,
   sourceStaticUnsolvedWDL:null,
   firstWinStoppedControl:null};
 // Independent graph connectivity check on original physical event graph.
 const adjacency=Array.from({length:42},()=>new Set());
 const exchangeKeys=new Set();
 for(const witness of algebra.witnesses){
  const {a,b,r,s,x,y}=witness;
  const expectX=r*7+a,expectY=s*7+b;
  if(a>=b||x!==expectX||y!==expectY)
   failures.push({type:'INVALID_SOURCE_PHYSICAL_PAIR',a,b,r,s,x,y});
  const pair=[x,y].sort((i,j)=>i-j).join(':');
  if(exchangeKeys.has(pair))failures.push({type:'DUPLICATE_PHYSICAL_PAIR',x,y});
  exchangeKeys.add(pair);
  adjacency[x].add(y);adjacency[y].add(x);
  stats.nontrivialPauliStabilizerGraphEdges++;
  const realXY=physicalColumnWordToOwners(witness.originalHypotheticalCompleteColumnsXY);
  const realYX=physicalColumnWordToOwners(witness.originalHypotheticalCompleteColumnsYX);
  stats.actualPhysicalGravityShuffleWordChecks+=2;
  const q0=realXY.filter(v=>v===0).length,q1=realXY.filter(v=>v===1).length;
  const q0b=realYX.filter(v=>v===0).length,q1b=realYX.filter(v=>v===1).length;
  if(q0!==21||q1!==21||q0b!==21||q1b!==21)
   failures.push({type:'ABSOLUTE_OWNER_QUOTA_WRONG',x,y,q0,q1,q0b,q1b});
  stats.physicalOwnerQuotaP0Checks+=2;stats.physicalOwnerQuotaP1Checks+=2;
  let actualDelta=0n;
  for(let id=0;id<42;id++)if(realXY[id]!==realYX[id])actualDelta|=1n<<BigInt(id);
  if(actualDelta!==BigInt(witness.differenceXorMaskHex)||
     actualDelta!==((1n<<BigInt(x))|(1n<<BigInt(y)))||
     realXY[x]===realXY[y] || realYX[x]===realYX[y])
   failures.push({type:'DIFFERENCE_OR_ADJACENT_OWNER_INCORRECT',x,y});
  stats.originalCellOwnerExchangeChecks++;
  let monoXY=0,monoYX=0;
  for(const L of Klines){
   const pXY=L.sites.every(z=>realXY[z]===realXY[L.sites[0]])?1:0;
   const pYX=L.sites.every(z=>realYX[z]===realYX[L.sites[0]])?1:0;
   const zXY=rawPauliLineNumerator(realXY,L.sites),
         zYX=rawPauliLineNumerator(realYX,L.sites);
   if(8*pXY!==zXY||8*pYX!==zYX)
    failures.push({type:'PAULI_MONOWIN_PROJECTOR_MISMATCH',x,y,line:L.key});
   stats.originalWindowPauliProjectorChecks+=2;
   monoXY+=pXY;monoYX+=pYX;
   if(pXY!==pYX){
    stats.changedMonoLineValuesAcrossSwaps++;
    stats.changedMonoWindowOrientations[L.orientation]++;
    if(L.sites.includes(x)===L.sites.includes(y))
     failures.push({type:'ODD_INCIDENCE_EXCHANGE_GUARD_FALSE',x,y,line:L.key});
   }
   stats.lineTruthExchangeIncidenceChecks++;
  }
  const hXY=independentEnergy8FromTerms(realXY,sourcePauliTerms),
    hYX=independentEnergy8FromTerms(realYX,sourcePauliTerms);
  if(hXY!==8*monoXY||hYX!==8*monoYX)
   failures.push({type:'MERGED_352_PAULI_SUM_INCORRECT',x,y,
    sourceHXY:hXY,physicalHXY:8*monoXY,sourceHYX:hYX,physicalHYX:8*monoYX});
  stats.fullHamiltonianPauliEnergyChecks+=2;
  if(failures.length>12)return {status:'REJECTED',stats,failures:failures.slice(0,13)};
 }
 const queue=[0],seen=new Set([0]);
 while(queue.length){
  const v=queue.shift();
  for(const y of adjacency[v])if(!seen.has(y)){seen.add(y);queue.push(y)}
 }
 stats.independentParityConnectivityVertexCount=seen.size;
 if(seen.size!==42||exchangeKeys.size!==756||
    stats.nontrivialPauliStabilizerGraphEdges!==756)
  failures.push({type:'CROSS_COLUMN_EXCHANGE_GRAPH_NOT_CONNECTED'});
 const drawn=independentFullBoardOrdinaryFirstWinControl();
 const hStatic=independentEnergy8FromTerms(drawn.fullFinalColoring,algebra.terms);
 if(hStatic!==0)
  failures.push({type:'PHYSICAL_COOPERATIVE_DRAW_HAS_NONZERO_STATIC_HAMILTONIAN',hStatic});
 stats.firstWinStoppedControl={...drawn,fullFinalColoring:undefined,
  staticHamiltonian8:hStatic};
 return {status:failures.length?'REJECTED':'INDEPENDENT_ORIGINAL7X6_PAULI_QUANTUM_PILOT_PASS',
  stats,failures,
  sourceReported:{PauliBasis:algebra.PauliBasis,
    sourceGF2DifferenceRank:algebra.sourceGF2DifferenceRank,
    fullHypotheticalShuffleOwnerAffineDimension:algebra.sourceGF2DifferenceRank,
    unconditionalPauliZStabilizers:algebra.sourceUnconditionalLinearOwnerConstraints,
    originalStaticGeometricWindows:algebra.geometry.windows,
    sourceFutureStrategicGameValuesComputed:algebra.sourceFutureStrategicGameValuesComputed},
  actualOriginalFirstWinStoppedWDLRootProven:null,
  note:'756*2 hypothetically complete gravity shuffles ignore first-win stopping; only separate 42-move draw control is a true first-win-stopped full game. No P0/P1 perfect-play classifier is implied.'};
}

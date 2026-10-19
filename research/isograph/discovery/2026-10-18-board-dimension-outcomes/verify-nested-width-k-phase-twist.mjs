// Reproducible STATIC geometry/phase falsifier for
// docs/research/2026-10-18-nested-width-parity-k-connection-twist.md
// No game-tree search or WDL oracle. Actual prefix is first-win-free.
// A full hypothetical column word may extend beyond terminal solely to
// test the published fixed-word source ownership/parity identities.
export function verifyNestedWidthKPhase({seed=20261018,cases=1536}={}) {
 let state=seed>>>0;
 function nextU32(){state=(Math.imul(1664525,state)+1013904223)>>>0;return state;}
 function pick(n){return nextU32()%n;}
 const dirs=[[1,0],[0,1],[1,1],[1,-1]];
 const stats={
  seed,cases,originalLegalFirstWinFreePrefixes:0,realGeometryCases:0,
  fullWordsGravityLegal:0,columnParityXorChecks:0,sourcePhaseOwnerChecks:0,
  localSeamChecks:0,widthMoveSeamChecks:0,
  monochromeKWindowEquivalences:0,diagonalEndpointChecks:0,
  horizontalEndpointChecks:0,orientationTwistWrongMutationMismatches:0,
  heightPlusTwoPairAndEpsilonChecks:0,
  heightPlusTwoNewLineCountChecks:0,widthPlusOneNewLineCountChecks:0,
  testsByK:{},errors:[]
 };
 function fail(kind,detail){stats.errors.push({kind,detail});if(stats.errors.length>3)throw Error('too many failures: '+JSON.stringify(stats.errors));}
 function lineCount(W,H,K) {
  let count=0;
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(let [dx,dy] of dirs) {
   const ex=c+(K-1)*dx,ey=r+(K-1)*dy;
   if(ex>=0&&ex<W&&ey>=0&&ey<H)count++;
  }
  return count;
 }
 function winnerAfterMove(board,W,H,K,c,r,player) {
  const id=(x,y)=>y*W+x;
  for(const [dx,dy] of dirs) {
   let len=1;
   for(const sign of [-1,1]) {
    for(let k=1;k<K;k++){
     const x=c+sign*k*dx,y=r+sign*k*dy;
     if(x<0||x>=W||y<0||y>=H||board[id(x,y)]!==player)break;
     len++;
    }
   }
   if(len>=K)return true;
  }
  return false;
 }
 for(let test=0;test<cases;test++) {
  let W=4+pick(9),H=4+pick(10),K=3+pick(Math.min(6,W,H)-2);
  let N=W*H,h=Array(W).fill(0),full=[];
  const ranks=Array(N).fill(0),grid=new Uint8Array(N);
  let firstWinAt=Infinity;
  for(let i=0;i<N;i++) {
   const legal=[];for(let c=0;c<W;c++)if(h[c]<H)legal.push(c);
   if(!legal.length){fail('full word incomplete',{W,H,K,i});break;}
   const c=legal[pick(legal.length)],r=h[c]++,id=r*W+c;
   full.push(c);ranks[id]=i+1;
   grid[id]=1+(i%2);
   if(firstWinAt===Infinity&&winnerAfterMove(grid,W,H,K,c,r,grid[id]))firstWinAt=i+1;
  }
  if(full.length!==N)continue;
  stats.fullWordsGravityLegal++;
  const limit=(firstWinAt===Infinity?N:firstWinAt-1);
  const n=pick(limit+1),h0=Array(W).fill(0);
  for(let i=0;i<n;i++)h0[full[i]]++;
  // n is before a first winner, so genuine first-win-stopped prefix.
  stats.originalLegalFirstWinFreePrefixes++;
  stats.testsByK[K]=(stats.testsByK[K]??0)+1;
  const p=n%2,eta=h0.map(z=>z%2),kappa=h0.map(z=>(n-z)&1),delta=kappa.slice(0,-1).map((v,i)=>v^kappa[i+1]);
  if(kappa.reduce((x,y)=>x^y,0)!==(((W-1)&1)&p))fail('width phase xor',{W,H,K,n,kappa});
  stats.columnParityXorChecks++;
  for(let i=0;i<W-1;i++){if(delta[i]!== (eta[i]^eta[i+1]))fail('seam formula',{W,H,K,n,i});stats.localSeamChecks++;}
  const a=h0.findIndex(z=>z<H);
  if(a<0){fail('no legal root action',{W,H,K,n});continue;}
  const h1=h0.slice();h1[a]++;
  const kap1=h1.map(z=>((n+1-z)&1)),del1=kap1.slice(0,-1).map((v,i)=>v^kap1[i+1]);
  for(let c=0;c<W-1;c++){
   const predicted=delta[c]^(a===c?1:0)^(a===c+1?1:0);
   if(predicted!==del1[c])fail('single-move seam update',{W,H,K,n,a,c,predicted,actual:del1[c]});
   stats.widthMoveSeamChecks++;
  }
  for(let c=0;c<W;c++) {
   const E=H-h0[c],newE=H+2-h0[c];
   if((E&1)!==(newE&1)||Math.floor(newE/2)!==Math.floor(E/2)+1)
    fail('height2 pair decomposition',{W,H,K,n,c});
   stats.heightPlusTwoPairAndEpsilonChecks++;
  }
  let before=lineCount(W,H,K),newH=lineCount(W,H+2,K),newW=lineCount(W+1,H,K);
  if(newH-before!==8*W-6*(K-1))fail('new 2 rows count',{W,H,K,before,newH});
  if(newW-before!==4*H-3*(K-1))fail('new column count',{W,H,K,before,newW});
  stats.heightPlusTwoNewLineCountChecks++;
  stats.widthPlusOneNewLineCountChecks++;
  const beta=new Int8Array(N).fill(-1);
  const counts=Array(W).fill(0);
  for(let i=n;i<N;i++) {
   const c=full[i],r=h0[c]+counts[c],z=r*W+c;
   const other=(i-n-counts[c])&1;
   if(ranks[z]!==i+1)fail('future rank mapping',{W,H,K,n,c,r,i});
   beta[z]=other;counts[c]++;
   const directOwner=i&1,sourceOwner=(r&1)^kappa[c]^other;
   if(directOwner!==sourceOwner)fail('owner-phase equation',{W,H,K,n,c,r,directOwner,sourceOwner});
   stats.sourcePhaseOwnerChecks++;
  }
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(let [dx,dy] of [[1,0],[1,1],[1,-1]]) {
   const ex=c+(K-1)*dx,ey=r+(K-1)*dy;
   if(ex<0||ex>=W||ey<0||ey>=H)continue;
   const zz=[];
   for(let i=0;i<K;i++)zz.push((r+i*dy)*W+c+i);
   if(zz.some(z=>ranks[z]<=n))continue;
   const d=(dy===0?0:1);
   let allEqual=true,allIdentitySteps=true,wrongMutationMatches=true;
   for(let i=0;i<K-1;i++) {
    const x=zz[i],y=zz[i+1],cx=c+i;
    const observed=(ranks[x]&1)===(ranks[y]&1);
    const expected=(beta[x]^beta[y])===(delta[cx]^d);
    if(observed!==expected)fail('local owner/delta/beta equivalence',{W,H,K,n,c,r,dy,i});
    allEqual&&=observed;allIdentitySteps&&=expected;
    wrongMutationMatches&&=((beta[x]^beta[y])===delta[cx]);
   }
   if(allEqual!==allIdentitySteps)fail('whole K-window monochrome',{W,H,K,n,c,r,dy});
   stats.monochromeKWindowEquivalences++;
   if(d===1 && wrongMutationMatches!==allEqual)stats.orientationTwistWrongMutationMismatches++;
   if(allEqual) {
    const observed=beta[zz[0]]^beta[zz[K-1]];
    const formula=eta[c]^eta[c+K-1]^(d&((K-1)&1));
    if(observed!==formula)fail('endpoint twist',{W,H,K,n,c,r,dy,observed,formula});
    if(d)stats.diagonalEndpointChecks++;else stats.horizontalEndpointChecks++;
   }
  }
  stats.realGeometryCases++;
 }
 return stats;
}

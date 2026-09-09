import assert from'node:assert/strict';import{DenseLineSolver}from'./dense_solver.mjs';import{rollout,rng,geometry,won}from'./support.mjs';
const G=geometry(),rnd=rng(0xa16470de),q=new DenseLineSolver(56000);const arena=q.arena;let checks=0,roots=0,seenGroups=new Set(),maxBoth=0;
for(let n=0;n<=40;n++)for(let r=0;r<16;r++){
 const s=rollout(n,rnd);if(!s)continue;q.compile(s);assert.equal(q.arena,arena);roots++;seenGroups.add(q.groups);maxBoth=Math.max(maxBoth,q.bothCount);
 const live=q.rootLive.slice(),b=s.b.slice(),heights=s.heights.slice();let elo=q.eLo,ehi=q.eHi,height=q.height,moves=n;
 for(let step=0;step<43-n;step++){
  const c=live.subarray(0,3),o=live.subarray(3),u=Uint32Array.from(c,(v,g)=>v|o[g]);
  const k0=(height|((c[0]&q.sm0)<<21))>>>0,k1=(((c[0]>>>11)|(c[1]<<21))&q.sm1)>>>0,k2=(((c[1]>>>11)|(c[2]<<21))&q.sm2)>>>0;
  assert.equal(k0&0x1fffff,height);const choice=[((k0>>>21)|(k1<<11))>>>0,((k1>>>21)|(k2<<11))>>>0,(k2>>>21)>>>0],untouched=new Uint32Array(3);
  for(let i=0;i<q.bothCount;i++)if(((q.lo[i]&elo)>>>0)===q.lo[i]&&((q.hi[i]&ehi)>>>0)===q.hi[i])untouched[i>>>5]|=1<<(i&31);
  const p=(moves-n)&1;
  for(let g=0;g<3;g++){
   const shared=(2**Math.max(0,Math.min(32,q.bothCount-32*g))-1)>>>0;
   const dc=((u[g]&q.rootLive[p*3+g]&~shared)|choice[g])>>>0;
   const dop=((u[g]&q.rootLive[(p^1)*3+g]&~shared)|(u[g]&shared&~choice[g])|untouched[g])>>>0;
   assert.equal(dc,c[g]);assert.equal(dop,o[g]);
  }
  checks++;const choices=[];for(let col=0;col<7;col++)if(heights[col]<6)choices.push(col);if(!choices.length)break;
  const col=choices[rnd()%choices.length],row=heights[col],cell=col*7+row,player=(moves&1)+1;b[row*7+col]=player;
  if(won(b,7,6,4,col,row,player))break;heights[col]++;height+=1<<(col*3);moves++;
  const bit=1<<(cell&31);if(cell<32)elo=(elo&~bit)>>>0;else ehi=(ehi&~bit)>>>0;
  for(let g=0;g<3;g++){const old=live[g];live[g]=(live[g+3]&~q.inc[cell*3+g])>>>0;live[g+3]=old;}
 }
}
console.log(JSON.stringify({status:'PASS',roots,checks,goalWordCounts:[...seenGroups],maxSharedGoals:maxBoth,fixedArenaReused:true,claim:'Exact live-mask reconstruction from packed key + immutable program + frontiers on legal states. No cross-program reuse or concurrency claim.'}));

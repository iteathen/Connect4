// Standalone reconstruction of frozen canonical-q binary payoff candidate.
// Actual W=7,H=6,K=4, SOURCE payoff consumes only q and supplied gravity order.
// Physical first-win scorer is a separate array-grid reference (no minimax).
const W=7,H=6,K=4,N=W*H,B=id=>1n<<BigInt(id),lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(let [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
 let ce=c+(K-1)*dc,re=r+(K-1)*dr;
 if(ce>=W||re<0||re>=H)continue;
 let mask=0n;for(let j=0;j<K;j++)mask|=B((r+j*dr)*W+c+j*dc);
 lines.push(mask);
}
if(lines.length!==69)throw Error('wrong 7x6 geometry');
let seed=0x77553321>>>0;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function schedule(prefix=''){
 let h=Array(W).fill(0),seq=[...prefix].map(x=>Number(x)-1);
 for(let c of seq){if(c<0||c>=W||h[c]++>=H)throw Error('bad prefix');}
 while(seq.length<N){let a=[];for(let c=0;c<W;c++)if(h[c]<H)a.push(c);
  let c=a[rand()%a.length];seq.push(c);h[c]++;}
 return seq;
}
function physical(seq){
 let g=Array.from({length:W},()=>Array(H).fill(-1)),h=Array(W).fill(0);
 for(let t=0;t<seq.length;t++){
  const c=seq[t],r=h[c]++,p=t%2;g[c][r]=p;
  for(let [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
   let ct=1;for(let sign of [-1,1]){let x=c+dx*sign,y=r+dy*sign;
    while(x>=0&&x<W&&y>=0&&y<H&&g[x][y]===p){ct++;x+=dx*sign;y+=dy*sign;}}
   if(ct>=K)return {winner:p,turn:t+1};
  }
 }
 return {winner:null,turn:null};
}
function antichain(arr){
 let u=[...new Set(arr.map(String))].map(BigInt).sort((x,y)=>{
  let n=a=>{let s=0;while(a){a&=a-1n;s++;}return s;};return n(x)-n(y);});
 let a=[];for(let x of u)if(!a.some(y=>(x&y)===y))a.push(x);return a;
}
function qfrom(seq,n){
 let h=Array(W).fill(0),P=[0n,0n];
 for(let t=0;t<n;t++){let c=seq[t],id=h[c]++*W+c;P[t%2]|=B(id);}
 let R=[[],[]];for(let p=0;p<2;p++)for(let g of lines){
  if((g&P[1-p])!==0n)continue;
  let x=g&~P[p];if(x===0n)throw Error('source already terminal');R[p].push(x);
 }
 return {h,R:R.map(antichain)};
}
function qpayoff(q,seq,n,stats){
 const owner=Array(N).fill(-1),time=Array(N).fill(0),h=q.h.slice();
 for(let t=n;t<N;t++){
  const c=seq[t],r=h[c]++,id=r*W+c,z=t-n,earlierSame=r-q.h[c];
  owner[id]=t%2;time[id]=z+1;
  if(((n&1)^(earlierSame&1)^((z-earlierSame)&1))!==owner[id])throw Error('XOR phase mismatch');
  stats.eventPhases++;
 }
 let first=Infinity,win=null;
 for(let p=0;p<2;p++)for(let g of q.R[p]){
  let latest=0,okay=true;
  for(let id=0;id<N;id++)if((g&B(id))!==0n){stats.generatorCells++;
   if(owner[id]!==p){okay=false;break;}latest=Math.max(latest,time[id]);}
  if(okay&&latest<first){first=latest;win=p;}
 }
 if(win!==null&&win!==((n+first-1)&1))throw Error('winner parity mismatch');
 return {winner:win,relativeTurn:win===null?null:first};
}
let stats={schema:'connect4.7x6.source_q_binary_payoff_v0_1',board:{W,H,K,lines:69},seed:seed,
 referenceSchedules:0,canonical:{},eventPhases:0,generatorCells:0,wrongWinner:0,wrongFirstWinTime:0,draws:0};
function check(seq,n){let ph=physical(seq);if(ph.turn!==null&&ph.turn<=n)throw Error('prefix terminal');
 let q=qfrom(seq,n),fromQ=qpayoff(q,seq,n,stats),ref={winner:ph.winner,relativeTurn:ph.turn===null?null:ph.turn-n};
 if(fromQ.winner!==ref.winner){stats.wrongWinner++;throw Error('winner mismatch');}
 if(fromQ.relativeTurn!==ref.relativeTurn){stats.wrongFirstWinTime++;throw Error('time mismatch');}
 stats.referenceSchedules++;if(ref.winner===null)stats.draws++;return q;
}
for(let pre of ['44444','444444','4444442']){
 let seq=schedule(pre),q=check(seq,pre.length);
 stats.canonical[pre]={ply:pre.length,h:q.h,R:q.R.map(x=>x.length)};
}
for(let i=0;i<22000;i++){
 let seq=schedule(),p=physical(seq),maxN=p.turn===null?N:p.turn-1;
 let n=rand()%Math.max(1,maxN+1);
 check(seq,n);
}
stats.seedFinal=seed;
console.log(JSON.stringify(stats));

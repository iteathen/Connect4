import assert from 'node:assert/strict';

const W=7,H=6,CELLS=42;
let seed=0x51a7c0de>>>0;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function won(bits,bit){for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){const cell=Number(BigInt.asUintN(64,bit).toString(2).length-1);const r=Math.trunc(cell/W),c=cell-r*W;for(let k=-3;k<=0;k++){let ok=true;for(let j=0;j<4;j++){const x=c+(k+j)*dx,y=r+(k+j)*dy;if(x<0||x>=W||y<0||y>=H||((bits>>BigInt(y*W+x))&1n)===0n){ok=false;break;}}if(ok)return true;}}return false;}
function randomState(target){let p0=0n,p1=0n;const h=new Uint8Array(W);for(let mv=0;mv<target;mv++){const cs=[];for(let c=0;c<W;c++)if(h[c]<H){const bit=1n<<BigInt(h[c]*W+c),bits=(mv&1)?p1:p0;if(!won(bits|bit,bit))cs.push(c);}if(!cs.length)break;const c=cs[rnd()%cs.length],bit=1n<<BigInt(h[c]*W+c);if(mv&1)p1|=bit;else p0|=bit;h[c]++;}return{h,ply:h.reduce((a,b)=>a+b,0)};}
function directRank(h,cell){const row=Math.trunc(cell/W),col=cell-row*W;let n=row-h[col]+1;for(let c=0;c<W;c++)if(c!==col)n+=H-h[c];return n;}
function algebraicRank(ply,cell){const row=Math.trunc(cell/W);return (W-1)*H-ply+row+1;}
function ownerFromRank(sideToMove,rank){return sideToMove^((rank-1)&1);}
let states=0,targets=0,rankMismatch=0,ownerMismatch=0,deltaMismatch=0;
for(const plyTarget of[0,4,8,12,16,20,24,28,32,36,40])for(let k=0;k<250;k++){
 const s=randomState(plyTarget),side=s.ply&1;states++;
 for(let c=0;c<W;c++)for(let r=s.h[c];r<H;r++){
   const cell=r*W+c,d=directRank(s.h,cell),a=algebraicRank(s.ply,cell);targets++;if(d!==a)rankMismatch++;
   const od=ownerFromRank(side,d),oa=ownerFromRank(side,a);if(od!==oa)ownerMismatch++;
   for(let delta=0;delta<=12;delta++){
     const shifted=ownerFromRank(side,a+delta),expected=oa^(delta&1);if(shifted!==expected)deltaMismatch++;
   }
 }
}
assert.equal(rankMismatch,0);assert.equal(ownerMismatch,0);assert.equal(deltaMismatch,0);
console.log(JSON.stringify({kind:'connect4-u1-event-rank-parity',status:'pass',states,targets,deltaChecks:targets*13,rankMismatch,ownerMismatch,deltaMismatch,identity:'N(t)=(r-h_c+1)+sum_{d!=c}(H-h_d)=(W-1)H-ply+r+1',releaseLaw:'owner flips iff released/reserved event-count delta is odd'},null,2));
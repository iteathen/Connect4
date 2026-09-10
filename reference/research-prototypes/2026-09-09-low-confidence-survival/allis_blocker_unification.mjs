import assert from 'node:assert/strict';
const W=7,H=6,CELLS=42;
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
 const x=c+3*dx,y=r+3*dy;if(x<0||x>=W||y<0||y>=H)continue;let m=0n;for(let j=0;j<4;j++)m|=1n<<BigInt((r+j*dy)*W+c+j*dx);lines.push(m);
}
assert.equal(lines.length,69);
function pc(v){let n=0;while(v){v&=v-1n;n++;}return n;}
const uu=new Set();for(const l of lines){const cs=[];for(let i=0;i<CELLS;i++)if((l>>BigInt(i))&1n)cs.push(i);for(let s=1;s<16;s++){let m=0n;for(let j=0;j<4;j++)if((s>>j)&1)m|=1n<<BigInt(cs[j]);uu.add(m.toString());}}
const masks=[...uu].map(BigInt).sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));assert.equal(masks.length,625);
const id=new Map(masks.map((m,i)=>[m.toString(),i]));
const up=new Array(625);for(let b=0;b<625;b++){let z=0n;for(let r=0;r<625;r++)if((masks[b]&~masks[r])===0n)z|=1n<<BigInt(r);up[b]=z;}
function canon(ids){ids.sort((a,b)=>a-b);const out=[];outer:for(const rid of ids){const m=masks[rid];for(const p of out)if((masks[p]&~m)===0n)continue outer;out.push(rid);}return out;}
function compile(p0,p1,pl){const occ=p0|p1,opp=pl?p0:p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(id.get(rem.toString()));}return canon(out);}
function won(bits,bit){for(const l of lines)if((l&bit)!==0n&&(l&bits)===l)return true;return false;}
let seed=0x71f0cafe>>>0;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function randomRoot(ply){let p0=0n,p1=0n;const h=new Uint8Array(W);for(let mv=0;mv<ply;mv++){const cs=[];for(let c=0;c<W;c++)if(h[c]<H){const bit=1n<<BigInt(h[c]*W+c),b=(mv&1)?p1:p0;if(!won(b|bit,bit))cs.push(c);}if(!cs.length)return null;const c=cs[rnd()%cs.length],bit=1n<<BigInt(h[c]*W+c);if(mv&1)p1|=bit;else p0|=bit;h[c]++;}return {p0,p1,h,ply};}
function empty(h,cell){const row=Math.trunc(cell/W),col=cell-row*W;return row>=h[col];}
function playable(h,cell){const row=Math.trunc(cell/W),col=cell-row*W;return h[col]===row;}
function bitsReq(reqs){let z=0n;for(const r of reqs)z|=1n<<BigInt(r);return z;}
function directContains(reqs,bm){let z=0n;for(const rid of reqs)if((masks[rid]&bm)===bm)z|=1n<<BigInt(rid);return z;}
function generic(reqBits,blockers){let z=0n;for(const bm of blockers){const bid=id.get(bm.toString());if(bid!==undefined)z|=up[bid];}return z&reqBits;}
const cnt={A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0};let roots=0, mismatches=0;
function check(type,reqs,reqBits,blockers,direct,detail=''){cnt[type]++;const g=generic(reqBits,blockers);if(g!==direct){mismatches++;throw new Error(`${type} mismatch ${detail} direct=${direct.toString(16)} generic=${g.toString(16)}`);}}
function componentBlocker(q,s){const srow=Math.trunc(s/W);return (((srow+1)&1)===0)?(1n<<BigInt(s)):((1n<<BigInt(q))|(1n<<BigInt(s)));}
function liveOwnGroups(p0,p1,pl){const opp=pl?p0:p1,occ=p0|p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push({line:l,rem});}return out;}
function enumerateTailBlockers(cols,starts){const out=[];function rec(i,m){if(i===cols.length){out.push(m);return;}const c=cols[i],start=starts[i];for(let r=start+1;r<H;r++)rec(i+1,m|(1n<<BigInt(r*W+c)));}rec(0,0n);return out;}
for(const ply of [8,12,16,20,24,28,32,34])for(let k=0;k<220;k++){
 const s=randomRoot(ply);if(!s)continue;roots++;const reqs=compile(s.p0,s.p1,0),reqBits=bitsReq(reqs),h=s.h;
 for(let c=0;c<W;c++)for(let lo=0;lo<H-1;lo++){const u=lo+1;if(((u+1)&1)!==0)continue;const a=lo*W+c,b=u*W+c;if(!empty(h,a)||!empty(h,b))continue;const bm=1n<<BigInt(b);check('A1',reqs,reqBits,[bm],directContains(reqs,bm));}
 for(let c=0;c<W;c++)for(let lo=0;lo<H-1;lo++){const u=lo+1;if(((u+1)&1)!==1)continue;const a=lo*W+c,b=u*W+c;if(!empty(h,a)||!empty(h,b))continue;const bm=(1n<<BigInt(a))|(1n<<BigInt(b));check('A3',reqs,reqBits,[bm],directContains(reqs,bm));}
 const play=[];for(let c=0;c<W;c++)if(h[c]<H)play.push(h[c]*W+c);
 for(let i=0;i<play.length;i++)for(let j=i+1;j<play.length;j++){const bm=(1n<<BigInt(play[i]))|(1n<<BigInt(play[j]));check('A2',reqs,reqBits,[bm],directContains(reqs,bm));}
 for(let c1=0;c1<W;c1++)for(let c2=c1+1;c2<W;c2++)for(let l1=0;l1<H-1;l1++)for(let l2=0;l2<H-1;l2++){
   const u1=l1+1,u2=l2+1;if(((u1+1)&1)!==1||((u2+1)&1)!==1)continue;const a=l1*W+c1,b=u1*W+c1,c=l2*W+c2,d=u2*W+c2;if(!empty(h,a)||!empty(h,b)||!empty(h,c)||!empty(h,d))continue;
   const bs=[(1n<<BigInt(a))|(1n<<BigInt(b)),(1n<<BigInt(c))|(1n<<BigInt(d)),(1n<<BigInt(b))|(1n<<BigInt(d))];let direct=0n;for(const bm of bs)direct|=directContains(reqs,bm);check('A5',reqs,reqBits,bs,direct);
 }
 for(let c1=0;c1<W;c1++)for(let c2=c1+1;c2<W;c2++)for(let l1=0;l1<H-2;l1++)for(let l2=0;l2<H-2;l2++){
   const m1=l1+1,u1=l1+2,m2=l2+1,u2=l2+2;if(((u1+1)&1)!==0||((u2+1)&1)!==0)continue;
   const a=l1*W+c1,b=m1*W+c1,c=u1*W+c1,d=l2*W+c2,e=m2*W+c2,f=u2*W+c2;if(![a,b,c,d,e,f].every(x=>empty(h,x)))continue;
   const bs=[(1n<<BigInt(b))|(1n<<BigInt(c)),(1n<<BigInt(e))|(1n<<BigInt(f)),(1n<<BigInt(c))|(1n<<BigInt(f)),(1n<<BigInt(b))|(1n<<BigInt(e))];
   if(playable(h,a))bs.push((1n<<BigInt(a))|(1n<<BigInt(f)));if(playable(h,d))bs.push((1n<<BigInt(d))|(1n<<BigInt(c)));
   let direct=0n;for(const bm of bs)direct|=directContains(reqs,bm);check('A6',reqs,reqBits,bs,direct);
 }
 for(let j=0;j<play.length;j++){const p2=play[j],r2=Math.trunc(p2/W),c2=p2-r2*W;if(r2+1>=H)continue;const q2=(r2+1)*W+c2;if(((r2+2)&1)!==0||!empty(h,q2))continue;
   for(let i=0;i<play.length;i++)if(i!==j)for(let z=i+1;z<play.length;z++)if(z!==j){const p1=play[i],p3=play[z];const bs=[(1n<<BigInt(p1))|(1n<<BigInt(q2)),(1n<<BigInt(p2))|(1n<<BigInt(p3))];let direct=0n;for(const bm of bs)direct|=directContains(reqs,bm);check('A7',reqs,reqBits,bs,direct);}
 }
 for(const g of liveOwnGroups(s.p0,s.p1,1)){
   const empt=[];for(let cell=0;cell<CELLS;cell++)if((g.rem>>BigInt(cell))&1n)empt.push(cell);
   if(!empt.length||empt.some(q=>Math.trunc(q/W)===H-1))continue;
   const succ=empt.map(q=>q+W);let sb=0n;for(const x of succ)sb|=1n<<BigInt(x);const bs8=[sb];for(let i=0;i<empt.length;i++)bs8.push(componentBlocker(empt[i],succ[i]));let direct8=directContains(reqs,sb);for(let i=1;i<bs8.length;i++)direct8|=directContains(reqs,bs8[i]);check('A8',reqs,reqBits,bs8,direct8);
   let ae=true;const cols=[],starts=[],cl=[];for(const q of empt){const r=Math.trunc(q/W),c=q-r*W;if(((r+1)&1)!==0||r===0||!empty(h,q-W)){ae=false;break;}cols.push(c);starts.push(r);cl.push(1n<<BigInt(q));}
   if(ae){const uniq=[],st=[];for(let i=0;i<cols.length;i++){const j=uniq.indexOf(cols[i]);if(j<0){uniq.push(cols[i]);st.push(starts[i]);}else st[j]=Math.min(st[j],starts[i]);}
     const tail=enumerateTailBlockers(uniq,st),bs4=[...cl,...tail];let direct4=0n;for(const bm of cl)direct4|=directContains(reqs,bm);
     for(const rid of reqs){const rm=masks[rid];let ok=true;for(let i=0;i<uniq.length;i++){let hit=false;for(let r=st[i]+1;r<H;r++)if((rm>>BigInt(r*W+uniq[i]))&1n){hit=true;break;}if(!hit){ok=false;break;}}if(ok)direct4|=1n<<BigInt(rid);}
     check('A4',reqs,reqBits,bs4,direct4);
   }
   for(const q of empt){if(!playable(h,q))continue;const qr=Math.trunc(q/W),qc=q-qr*W;for(const x of play){const xr=Math.trunc(x/W),xc=x-xr*W;if(xc===qc||x===q)continue;let sblock=1n<<BigInt(x);for(const si of succ)sblock|=1n<<BigInt(si);const pair=(1n<<BigInt(q))|(1n<<BigInt(x));const bs9=[sblock,pair];for(let i=0;i<empt.length;i++)bs9.push(componentBlocker(empt[i],succ[i]));let direct9=directContains(reqs,sblock)|directContains(reqs,pair);for(let i=2;i<bs9.length;i++)direct9|=directContains(reqs,bs9[i]);check('A9',reqs,reqBits,bs9,direct9);}
   }
 }
}
console.log(JSON.stringify({roots,cnt,mismatches,universe:masks.length,totalInstances:Object.values(cnt).reduce((a,b)=>a+b,0)}));

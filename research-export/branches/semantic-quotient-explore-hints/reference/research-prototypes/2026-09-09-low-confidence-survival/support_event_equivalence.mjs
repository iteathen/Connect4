import { performance } from 'node:perf_hooks';

function run(W,H,K){
  const CELLS=W*H, lines=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(K-1)*dx,y=r+(K-1)*dy;if(x<0||x>=W||y<0||y>=H)continue;let m=0n;for(let j=0;j<K;j++)m|=1n<<BigInt((r+j*dy)*W+c+j*dx);lines.push(m);
  }
  function pc(v){let n=0;while(v){v&=v-1n;n++;}return n;}
  function won(bits,bit){for(const l of lines)if((l&bit)!==0n&&(l&bits)===l)return true;return false;}
  function canon(ms){ms.sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));const out=[];outer:for(const m of ms){for(const p of out)if((p&~m)===0n)continue outer;out.push(m);}return out;}
  function reqs(st,pl){const occ=st.p0|st.p1,opp=pl?st.p0:st.p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(rem);}return canon(out);}
  function physKey(p0,p1){return `${p0.toString(16)}/${p1.toString(16)}`;}
  const memo=new Map(), states=new Map();
  function value(st){const k=physKey(st.p0,st.p1);if(memo.has(k))return memo.get(k);states.set(k,st);if(st.moves===CELLS){memo.set(k,0);return 0;}const pl=st.moves&1;let best=pl?99:-99,any=false;for(let c=0;c<W;c++){const row=st.h[c];if(row===H)continue;any=true;const bit=1n<<BigInt(row*W+c),bits=pl?st.p1:st.p0;let v;if(won(bits|bit,bit))v=pl?-Math.trunc((CELLS+1-st.moves)/2):Math.trunc((CELLS+1-st.moves)/2);else{const h=st.h.slice();h[c]++;const ch={p0:pl?st.p0:st.p0|bit,p1:pl?st.p1|bit:st.p1,h,moves:st.moves+1};v=value(ch);}if(pl){if(v<best)best=v;}else if(v>best)best=v;}if(!any)best=0;memo.set(k,best);return best;}
  const root={p0:0n,p1:0n,h:new Uint8Array(W),moves:0};const rootValue=value(root);
  function supportKeys(st){const r0=reqs(st,0),r1=reqs(st,1),rstr=`${r0.map(x=>x.toString(16)).join('.')}/${r1.map(x=>x.toString(16)).join('.')}`;let hp=0;for(let c=0;c<W;c++)hp|=st.h[c]<<(3*c);const heightKey=`${st.moves}|${hp>>>0}|${rstr}`;
    let union=0n;for(const m of r0)union|=m;for(const m of r1)union|=m;let deadPool=0;const gaps=[];for(let c=0;c<W;c++){let nr=99;for(let r=st.h[c];r<H;r++)if((union>>BigInt(r*W+c))&1n){nr=r;break;}if(nr===99){deadPool+=H-st.h[c];gaps.push('x');}else gaps.push(String(nr-st.h[c]));}
    const eventKey=`${st.moves}|${deadPool}|${gaps.join(',')}|${rstr}`;return {heightKey,eventKey};
  }
  const groups=new Map(),heightSet=new Set();for(const [pk,st] of states){const ks=supportKeys(st);heightSet.add(ks.heightKey);let g=groups.get(ks.eventKey);if(!g){g=[];groups.set(ks.eventKey,g);}g.push(pk);}
  function succSig(st){const labels=[];const pl=st.moves&1;for(let c=0;c<W;c++){const row=st.h[c];if(row===H)continue;const bit=1n<<BigInt(row*W+c),bits=pl?st.p1:st.p0;if(won(bits|bit,bit)){const v=pl?-Math.trunc((CELLS+1-st.moves)/2):Math.trunc((CELLS+1-st.moves)/2);labels.push(`T${v}`);}else{const h=st.h.slice();h[c]++;const ch={p0:pl?st.p0:st.p0|bit,p1:pl?st.p1|bit:st.p1,h,moves:st.moves+1};labels.push(`S${supportKeys(ch).eventKey}`);}}return [...new Set(labels)].sort().join(';');}
  let mergedGroups=0,mergedStates=0,maxGroup=1,valueMismatch=0,succMismatch=0;const witnesses=[];
  for(const [ek,pks] of groups){if(pks.length<2)continue;mergedGroups++;mergedStates+=pks.length-1;if(pks.length>maxGroup)maxGroup=pks.length;const v0=memo.get(pks[0]),s0=succSig(states.get(pks[0]));for(let i=1;i<pks.length;i++){const vi=memo.get(pks[i]),si=succSig(states.get(pks[i]));if(vi!==v0){valueMismatch++;if(witnesses.length<5)witnesses.push({kind:'value',ek,a:pks[0],b:pks[i],v0,vi});}if(si!==s0){succMismatch++;if(witnesses.length<5)witnesses.push({kind:'succ',ek,a:pks[0],b:pks[i]});}}}
  return {profile:`${W}x${H}c${K}`,lines:lines.length,physicalStates:states.size,residualHeightStates:heightSet.size,eventStates:groups.size,eventReductionVsPhysicalPct:100*(1-groups.size/states.size),eventReductionVsResidualHeightPct:100*(1-groups.size/heightSet.size),mergedGroups,mergedStates,maxGroup,valueMismatch,succMismatch,rootValue,witnesses};
}
const t=performance.now();const results=[run(4,3,3),run(4,4,4),run(5,3,4),run(4,5,4)];console.log(JSON.stringify({kind:'support-event-equivalence',ms:performance.now()-t,results}));

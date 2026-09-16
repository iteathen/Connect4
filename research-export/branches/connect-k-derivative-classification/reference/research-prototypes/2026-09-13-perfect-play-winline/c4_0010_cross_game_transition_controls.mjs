import assert from 'node:assert/strict';

function test(C,R,K){
 const N=C*R, bit=i=>1n<<BigInt(i), cell=(c,r)=>r*C+c;
 const lines=[];
 for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const l=[];for(let i=0;i<K;i++){const x=c+i*dc,y=r+i*dr;if(x<0||x>=C||y<0||y>=R){l.length=0;break;}l.push(cell(x,y));}if(l.length===K)lines.push(l);
 }
 const masks=lines.map(l=>l.reduce((m,x)=>m|bit(x),0n));
 const win=b=>masks.some(m=>(b&m)===m);
 const pop=x0=>{let x=x0,n=0;while(x){x&=x-1n;n++;}return n;};
 const heights=(p0,p1)=>{const o=p0|p1,h=Array(C).fill(0);for(let c=0;c<C;c++)while(h[c]<R&&(o&bit(cell(c,h[c]))))h[c]++;return h;};
 const states=[], map=new Map();
 function intern(p0,p1){const k=`${p0}/${p1}`;if(map.has(k))return map.get(k);const ply=pop(p0|p1);let term=null;if(win(p0))term=1;else if(win(p1))term=-1;else if(ply===N)term=0;const s={id:states.length,p0,p1,ply,side:ply&1,term,ch:[]};map.set(k,s.id);states.push(s);return s.id;}
 intern(0n,0n);
 for(let i=0;i<states.length;i++){const s=states[i];if(s.term!==null)continue;const h=heights(s.p0,s.p1);for(let c=0;c<C;c++){if(h[c]>=R)continue;const x=cell(c,h[c]);const a=s.side===0?s.p0|bit(x):s.p0,b=s.side===1?s.p1|bit(x):s.p1;s.ch.push(intern(a,b));}}
 const memo=new Int8Array(states.length);memo.fill(2);
 function val(id){if(memo[id]!==2)return memo[id];const s=states[id];if(s.term!==null)return memo[id]=s.term;let v=s.side===0?-1:1;for(const kid of s.ch){const q=val(kid);v=s.side===0?Math.max(v,q):Math.min(v,q);}return memo[id]=v;}
 for(let i=states.length-1;i>=0;i--)val(i);
 function anti(s,p){const own=p===0?s.p0:s.p1,opp=p===0?s.p1:s.p0, rs=[];for(let i=0;i<lines.length;i++){if(masks[i]&opp)continue;rs.push(lines[i].filter(x=>!(own&bit(x))));}rs.sort((a,b)=>a.length-b.length||a.join(',').localeCompare(b.join(',')));const m=[];for(const a of rs){const z=new Set(a);if(m.some(e=>e.every(x=>z.has(x))))continue;m.push(a);}return m;}
 const rk=rs=>rs.map(r=>[...r].sort((a,b)=>a-b).join('.')).sort().join('|');
 const qkey=s=>{const h=heights(s.p0,s.p1);return `${h.join(',')};${rk(anti(s,0))};${rk(anti(s,1))}`;};
 const groups=new Map();let smallest=null;
 for(const s of states){if(s.term!==null)continue;const key=qkey(s);let g=groups.get(key);if(!g){g=[];groups.set(key,g);}g.push(s);}
 let bad=0;
 for(const g of groups.values()){const vs=new Set(g.map(s=>memo[s.id]));if(vs.size>1){bad++;for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++)if(memo[g[i].id]!==memo[g[j].id]){const a=g[i],b=g[j],metric=[Math.max(a.ply,b.ply),a.ply+b.ply,a.id,b.id];if(!smallest||metric.some((x,k)=>x<smallest.metric[k]&&metric.slice(0,k).every((y,z)=>y===smallest.metric[z])))smallest={metric,a,b};}}}
 let transitionMismatchClasses=0;
 for(const g of groups.values()){
   if(g.length<2)continue;
   const sig=s=>JSON.stringify(s.ch.map(id=>{const k=states[id];return k.term!==null?`T:${k.term}`:qkey(k);}));
   const first=sig(g[0]);if(g.some(x=>sig(x)!==first))transitionMismatchClasses+=1;
 }
 const board=s=>{const out=[];for(let r=R-1;r>=0;r--){let q='';for(let c=0;c<C;c++){const x=cell(c,r);q+=(s.p0&bit(x))?'0':(s.p1&bit(x))?'1':'.';}out.push(q);}return out;};
 return {domain:`${C}x${R} connect-${K}`,lines:lines.length,states:states.length,nonterminal:states.filter(s=>s.term===null).length,classes:groups.size,mismatchClasses:bad,transitionMismatchClasses,smallest:smallest?{metric:smallest.metric,a:{ply:smallest.a.ply,value:memo[smallest.a.id],board:board(smallest.a)},b:{ply:smallest.b.ply,value:memo[smallest.b.id],board:board(smallest.b)}}:null};
}
const controls=[];
for(const cfg of [[3,3,3],[3,4,3],[4,3,3],[4,4,3],[4,4,4],[5,3,3],[5,3,4]]){
 const r=test(...cfg);delete r.ms;controls.push(r);
}
const output={
 kind:'c4-0010-cross-game-transition-controls',
 generatedAt:'2026-09-13',
 attribution:{researchDirection:'Josh Oshiro',formalizationQualification:'OpenAI ChatGPT'},
 controls,
 summary:{
  domains:controls.length,
  totalStates:controls.reduce((a,x)=>a+x.states,0),
  totalNonterminalStates:controls.reduce((a,x)=>a+x.nonterminal,0),
  wdlMismatchClasses:controls.reduce((a,x)=>a+x.mismatchClasses,0),
  transitionMismatchClasses:controls.reduce((a,x)=>a+x.transitionMismatchClasses,0),
 },
 claimBoundary:'Qualification input only. C4-0010 already owns the accepted ordinary forward quotient; these controls independently recheck value and successor congruence on bounded complete games.',
};
console.log(JSON.stringify(output,null,2));

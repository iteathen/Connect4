#!/usr/bin/env node
import assert from 'node:assert/strict';

const W = 7, H = 6, CELLS = 42;
const SEQUENCE = '4665655546';
const TYPE_NAME = Object.freeze({ A1:'Claimeven', A2:'Baseinverse', A3:'Vertical', A4:'Aftereven', A5:'Lowinverse', A6:'Highinverse', A7:'Baseclaim', A8:'Before', A9:'Specialbefore' });

const lines = [];
for (let r=0;r<H;r++) for (let c=0;c<W;c++) for (const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
  const x=c+3*dx,y=r+3*dy; if(x<0||x>=W||y<0||y>=H) continue;
  let m=0n; for(let j=0;j<4;j++) m |= 1n << BigInt((r+j*dy)*W+c+j*dx); lines.push(m);
}
assert.equal(lines.length,69);
function pc(v){let n=0;while(v){v&=v-1n;n++;}return n;}
const uu=new Set();
for(const l of lines){const cs=[];for(let i=0;i<CELLS;i++)if((l>>BigInt(i))&1n)cs.push(i);for(let s=1;s<16;s++){let m=0n;for(let j=0;j<4;j++)if((s>>j)&1)m|=1n<<BigInt(cs[j]);uu.add(m.toString());}}
const masks=[...uu].map(BigInt).sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));
assert.equal(masks.length,625);
const id=new Map(masks.map((m,i)=>[m.toString(),i]));
function canon(ids){ids.sort((a,b)=>a-b);const out=[];outer:for(const rid of ids){const m=masks[rid];for(const p of out)if((masks[p]&~m)===0n)continue outer;out.push(rid);}return out;}
function won(bits,bit){for(const l of lines)if((l&bit)!==0n&&(l&bits)===l)return true;return false;}
function parse(seq){let p0=0n,p1=0n;const h=new Uint8Array(W);for(let mv=0;mv<seq.length;mv++){const c=seq.charCodeAt(mv)-49,r=h[c];assert(c>=0&&c<W&&r<H);const bit=1n<<BigInt(r*W+c);if(mv&1){p1|=bit;assert(!won(p1,bit));}else{p0|=bit;assert(!won(p0,bit));}h[c]++;}return {p0,p1,h,ply:seq.length};}
function compile(p0,p1,pl){const occ=p0|p1,opp=pl?p0:p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(id.get(rem.toString()));}return canon(out);}
function empty(h,cell){const row=Math.trunc(cell/W),col=cell-row*W;return row>=h[col];}
function playable(h,cell){const row=Math.trunc(cell/W),col=cell-row*W;return h[col]===row;}
function coord(cell){return `${String.fromCharCode(65+(cell%W))}${Math.trunc(cell/W)+1}`;}
function cells(mask){const out=[];for(let i=0;i<CELLS;i++)if((mask>>BigInt(i))&1n)out.push(i);return out;}
function key(mask){return cells(mask).map(coord).join('-');}
function liveOwnGroups(p0,p1,pl){const opp=pl?p0:p1,occ=p0|p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push({line:l,rem});}return out;}
function componentBlocker(q,s){const srow=Math.trunc(s/W);return (((srow+1)&1)===0)?(1n<<BigInt(s)):((1n<<BigInt(q))|(1n<<BigInt(s)));}
function enumerateTailBlockers(cols,starts){const out=[];function rec(i,m){if(i===cols.length){out.push(m);return;}const c=cols[i],start=starts[i];for(let r=start+1;r<H;r++)rec(i+1,m|(1n<<BigInt(r*W+c)));}rec(0,0n);return out;}

const root=parse(SEQUENCE), p0Reqs=compile(root.p0,root.p1,0), h=root.h;
const responseMask = (()=>{let m=0n;for(const row of [1,3,5])for(let c=0;c<W;c++)m|=1n<<BigInt(row*W+c);return m;})();
const coreRids=p0Reqs.filter(rid => (masks[rid]&responseMask)===0n);
assert.equal(coreRids.length,7);
const coreMasks=coreRids.map(rid=>masks[rid]);
const coreLabels=coreMasks.map(key);

const instances=[];
function coverage(blockers){let bits=0;for(let i=0;i<coreMasks.length;i++)if(blockers.some(bm=>(bm&~coreMasks[i])===0n))bits|=1<<i;return bits;}
function add(type, blockers, footprint, detail={}){
  const solved=coverage(blockers); if(!solved)return;
  instances.push({type,name:TYPE_NAME[type],blockers,footprint,solved,detail});
}

// A1 Claimeven
for(let col=0;col<W;col++)for(let lower=0;lower<H-1;lower++){
  const upper=lower+1;if(((upper+1)&1)!==0)continue;const a=lower*W+col,b=upper*W+col;if(!empty(h,a)||!empty(h,b))continue;
  add('A1',[1n<<BigInt(b)],(1n<<BigInt(a))|(1n<<BigInt(b)),{column:col+1});
}
// A3 Vertical
for(let col=0;col<W;col++)for(let lower=0;lower<H-1;lower++){
  const upper=lower+1;if(((upper+1)&1)!==1)continue;const a=lower*W+col,b=upper*W+col;if(!empty(h,a)||!empty(h,b))continue;
  const pair=(1n<<BigInt(a))|(1n<<BigInt(b));add('A3',[pair],pair,{column:col+1});
}
const play=[];for(let c=0;c<W;c++)if(h[c]<H)play.push(h[c]*W+c);
// A2 Baseinverse
for(let i=0;i<play.length;i++)for(let j=i+1;j<play.length;j++){
  const a=play[i],b=play[j],pair=(1n<<BigInt(a))|(1n<<BigInt(b));add('A2',[pair],pair,{playablePair:[coord(a),coord(b)],phaseWeightAfterTriggerResponse:2});
}
// A5 Lowinverse
for(let c1=0;c1<W;c1++)for(let c2=c1+1;c2<W;c2++)for(let l1=0;l1<H-1;l1++)for(let l2=0;l2<H-1;l2++){
  const u1=l1+1,u2=l2+1;if(((u1+1)&1)!==1||((u2+1)&1)!==1)continue;const a=l1*W+c1,b=u1*W+c1,c=l2*W+c2,d=u2*W+c2;if(!empty(h,a)||!empty(h,b)||!empty(h,c)||!empty(h,d))continue;
  const bs=[(1n<<BigInt(a))|(1n<<BigInt(b)),(1n<<BigInt(c))|(1n<<BigInt(d)),(1n<<BigInt(b))|(1n<<BigInt(d))];
  add('A5',bs,(1n<<BigInt(a))|(1n<<BigInt(b))|(1n<<BigInt(c))|(1n<<BigInt(d)),{columns:[c1+1,c2+1]});
}
// A6 Highinverse
for(let c1=0;c1<W;c1++)for(let c2=c1+1;c2<W;c2++)for(let l1=0;l1<H-2;l1++)for(let l2=0;l2<H-2;l2++){
  const m1=l1+1,u1=l1+2,m2=l2+1,u2=l2+2;if(((u1+1)&1)!==0||((u2+1)&1)!==0)continue;
  const a=l1*W+c1,b=m1*W+c1,c=u1*W+c1,d=l2*W+c2,e=m2*W+c2,f=u2*W+c2;if(![a,b,c,d,e,f].every(x=>empty(h,x)))continue;
  const bs=[(1n<<BigInt(b))|(1n<<BigInt(c)),(1n<<BigInt(e))|(1n<<BigInt(f)),(1n<<BigInt(c))|(1n<<BigInt(f)),(1n<<BigInt(b))|(1n<<BigInt(e))];
  if(playable(h,a))bs.push((1n<<BigInt(a))|(1n<<BigInt(f)));if(playable(h,d))bs.push((1n<<BigInt(d))|(1n<<BigInt(c)));
  add('A6',bs,[a,b,c,d,e,f].reduce((m,x)=>m|(1n<<BigInt(x)),0n),{columns:[c1+1,c2+1]});
}
// A7 Baseclaim
for(let j=0;j<play.length;j++){
  const p2=play[j],r2=Math.trunc(p2/W),c2=p2-r2*W;if(r2+1>=H)continue;const q2=(r2+1)*W+c2;if(((r2+2)&1)!==0||!empty(h,q2))continue;
  for(let i=0;i<play.length;i++)if(i!==j)for(let z=i+1;z<play.length;z++)if(z!==j){const p1=play[i],p3=play[z];const bs=[(1n<<BigInt(p1))|(1n<<BigInt(q2)),(1n<<BigInt(p2))|(1n<<BigInt(p3))];add('A7',bs,(1n<<BigInt(p1))|(1n<<BigInt(p2))|(1n<<BigInt(q2))|(1n<<BigInt(p3)),{playable:[coord(p1),coord(p2),coord(p3)],upper:coord(q2)});}
}
// A4/A8/A9 from live P1 completion groups (candidate generation only).
for(const g of liveOwnGroups(root.p0,root.p1,1)){
  const empt=cells(g.rem);if(!empt.length||empt.some(q=>Math.trunc(q/W)===H-1))continue;
  const succ=empt.map(q=>q+W);let sb=0n;for(const x of succ)sb|=1n<<BigInt(x);
  const bs8=[sb];for(let i=0;i<empt.length;i++)bs8.push(componentBlocker(empt[i],succ[i]));
  add('A8',bs8,g.rem|sb,{ownResidual:key(g.rem),successors:succ.map(coord)});

  let ae=true;const cols=[],starts=[],cl=[];for(const q of empt){const r=Math.trunc(q/W),c=q-r*W;if(((r+1)&1)!==0||r===0||!empty(h,q-W)){ae=false;break;}cols.push(c);starts.push(r);cl.push(1n<<BigInt(q));}
  if(ae){const uniq=[],st=[];for(let i=0;i<cols.length;i++){const j=uniq.indexOf(cols[i]);if(j<0){uniq.push(cols[i]);st.push(starts[i]);}else st[j]=Math.min(st[j],starts[i]);}const tail=enumerateTailBlockers(uniq,st),bs4=[...cl,...tail];let footprint=g.rem;for(const b of bs4)footprint|=b;add('A4',bs4,footprint,{ownResidual:key(g.rem)});}

  for(const q of empt){if(!playable(h,q))continue;const qr=Math.trunc(q/W),qc=q-qr*W;for(const x of play){const xr=Math.trunc(x/W),xc=x-xr*W;if(xc===qc||x===q)continue;let sblock=1n<<BigInt(x);for(const si of succ)sblock|=1n<<BigInt(si);const pair=(1n<<BigInt(q))|(1n<<BigInt(x));const bs9=[sblock,pair];for(let i=0;i<empt.length;i++)bs9.push(componentBlocker(empt[i],succ[i]));let footprint=g.rem|sblock|pair;add('A9',bs9,footprint,{ownResidual:key(g.rem),specialPlayable:coord(x),trigger:coord(q)});}
}

function bitsIndices(bits){const out=[];for(let i=0;i<coreMasks.length;i++)if(bits&(1<<i))out.push(i);return out;}
const summaries={};
for(const type of Object.keys(TYPE_NAME)){
  const xs=instances.filter(x=>x.type===type);const profiles=new Map();
  for(const x of xs){const k=bitsIndices(x.solved).join(',');if(!profiles.has(k))profiles.set(k,{requirements:bitsIndices(x.solved).map(i=>coreLabels[i]),count:0,examples:[]});const p=profiles.get(k);p.count++;if(p.examples.length<4)p.examples.push({blockers:x.blockers.map(key),footprint:key(x.footprint),detail:x.detail});}
  summaries[type]={name:TYPE_NAME[type],instanceCount:xs.length,coverageProfiles:[...profiles.values()]};
}
const byRequirement=coreLabels.map((label,i)=>({requirement:label,candidateTypes:[...new Set(instances.filter(x=>x.solved&(1<<i)).map(x=>x.type))].sort(),candidateInstances:instances.filter(x=>x.solved&(1<<i)).length}));

const directBaseinverse=instances.filter(x=>x.type==='A2').map(x=>({blockers:x.blockers.map(key),covers:bitsIndices(x.solved).map(i=>coreLabels[i]),detail:x.detail}));

console.log(`ZERO_PHASE_FRAGMENT_CENSUS=${JSON.stringify({
  kind:'standard7x6-zero-phase-seven-core-fragment-census-v1',
  attribution:{researchDirectionInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  sequence:SEQUENCE,
  heights:[...h],
  playableCells:play.map(coord),
  coreRequirements:coreLabels,
  candidateInstanceCount:instances.length,
  byRequirement,
  summaries,
  directBaseinverse,
  authority:'Historical Allis A1-A9 generator is used only to enumerate candidate structural fragments. Candidate presence is not compatibility, realizability, W/D/L, or proof authority.',
  exactBoundary:'Core requirements and support/playability are reconstructed exactly. Blocker-subset coverage is exact conditional on a fragment being valid. Joint fragment validity remains to be established by typed C/N compatibility.',
})}`);

import assert from 'node:assert/strict';
const W=7,H=6,K=4,idx=(c,r)=>r*W+c,bit=i=>1n<<BigInt(i);
const lines=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){let m=0n,ok=true;for(let i=0;i<K;i++){const x=c+i*dc,y=r+i*dr;if(x<0||x>=W||y<0||y>=H){ok=false;break}m|=bit(idx(x,y))}if(ok)lines.push(m)}assert.equal(lines.length,69);
const won=(bits,last)=>{const b=bit(last);return lines.some(m=>(m&b)!==0n&&(bits&m)===m)};
const heights=(p0,p1)=>{const o=p0|p1,h=Array(W).fill(0);for(let c=0;c<W;c++)while(h[c]<H&&(o&bit(idx(c,h[c]))))h[c]++;return h};
const configs={
  1:{reply:2,normal:[3,4,7],initial:[1,2],empty:[5,6]},
  2:{reply:3,normal:[1,4,5],initial:[2,3],empty:[6,7]},
  3:{reply:4,normal:[1,2,5,6,7],initial:[3,4],empty:null},
};
function response(cfg,p0,p1,last){const h=heights(p0,p1),c=(last%W)+1,r=Math.trunc(last/W)+1;
 if(cfg.normal.includes(c)){if(r>=H)return -1;const rc=c-1,rr=r;return h[rc]===rr?idx(rc,rr):-1;}
 for(const [kind,pair] of [['initial',cfg.initial],['empty',cfg.empty]]){if(!pair||!pair.includes(c))continue;const [a,b]=pair,other=c===a?b:a;
   // Empty coupled pair: first P0 bottom move is answered at the other bottom.
   if(kind==='empty' && h[a-1]+h[b-1]===1){ // after P0 first local move
     if(h[other-1]!==0)return -1;return idx(other-1,0);
   }
   if(r<H){const rr=r;if(h[c-1]!==rr)return -1;return idx(c-1,rr);}
   const oh=h[other-1];if(oh>=H)return -1;return idx(other-1,oh);
 }
 return -1;
}
function run(first){const cfg=configs[first];let p0=bit(idx(first-1,0)),p1=bit(idx(cfg.reply-1,0));const q=[[p0,p1]],seen=new Set([`${p0}/${p1}`]);let edges=0,p0Wins=0,p1Wins=0,invalid=0,draws=0,maxPly=2;
 for(let qi=0;qi<q.length;qi++){[p0,p1]=q[qi];const h=heights(p0,p1);let any=false;const ply=(()=>{let x=p0|p1,n=0;while(x){x&=x-1n;n++;}return n})();maxPly=Math.max(maxPly,ply);
  for(let c=0;c<W;c++){if(h[c]>=H)continue;any=true;edges++;const x=idx(c,h[c]),np0=p0|bit(x);if(won(np0,x)){p0Wins++;continue}const y=response(cfg,np0,p1,x);if(y<0){invalid++;continue}const np1=p1|bit(y);if(won(np1,y)){p1Wins++;continue}const key=`${np0}/${np1}`;if(!seen.has(key)){seen.add(key);q.push([np0,np1])}}
  if(!any)draws++;
 }
 assert.equal(p0Wins,0);assert.equal(invalid,0);return {opening:[first,cfg.reply],p0TurnStates:q.length,p0MoveEdges:edges,p0ImmediateWins:p0Wins,p1TerminalWins:p1Wins,invalidResponses:invalid,drawTerminalStates:draws,maxPly};}
console.log(JSON.stringify([1,2,3].map(run),null,2));

import assert from 'node:assert/strict';

function linesFor(W,H,K){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(K-1)*dx,y=r+(K-1)*dy;
    if(x<0||x>=W||y<0||y>=H)continue;
    let mask=0n;const cells=[];
    for(let i=0;i<K;i++){const q=(r+i*dy)*W+c+i*dx;mask|=1n<<BigInt(q);cells.push(q);}
    out.push({mask,cells});
  }
  return out;
}

function game(W,H,K){
  const cells=W*H,lines=linesFor(W,H,K),key=(a,b)=>`${a.toString(16)}/${b.toString(16)}`;
  const won=(bits,bit)=>lines.some(l=>(l.mask&bit)!==0n&&(l.mask&bits)===l.mask);
  const states=new Map(),byPly=Array.from({length:cells+1},()=>[]),stack=[{p0:0n,p1:0n,h:new Uint8Array(W),moves:0}];
  while(stack.length){
    const s=stack.pop(),k=key(s.p0,s.p1);if(states.has(k))continue;
    const side=s.moves&1,edges=[];
    for(let c=0;c<W;c++){
      const r=s.h[c];if(r===H)continue;
      const idx=r*W+c,bit=1n<<BigInt(idx),nextBits=(side?s.p1:s.p0)|bit;
      if(won(nextBits,bit)){edges.push({terminal:true,winner:side,c,r,idx});continue;}
      const h=s.h.slice();h[c]++;
      const ch={p0:side?s.p0:s.p0|bit,p1:side?s.p1|bit:s.p1,h,moves:s.moves+1};
      const ck=key(ch.p0,ch.p1);edges.push({terminal:false,key:ck,c,r,idx});if(!states.has(ck))stack.push(ch);
    }
    states.set(k,{...s,key:k,edges});byPly[s.moves].push(k);
  }
  return{W,H,K,cells,lines,states,byPly,root:key(0n,0n)};
}

function residuals(g,s,p){
  const own=p?s.p1:s.p0,opp=p?s.p0:s.p1,raw=[];
  for(const l of g.lines){
    if(l.mask&opp)continue;
    let mask=0n,n=0;
    for(const q of l.cells){const b=1n<<BigInt(q);if(!(own&b)){mask|=b;n++;}}
    if(n)raw.push({mask,n});
  }
  raw.sort((a,b)=>a.n-b.n);
  const min=[];outer:for(const x of raw){for(const y of min)if((y.mask&x.mask)===y.mask)continue outer;min.push(x);}return min;
}

function playableMask(g,s){let m=0n;for(let c=0;c<g.W;c++)if(s.h[c]<g.H)m|=1n<<BigInt(s.h[c]*g.W+c);return m;}
function playableSingletons(g,s,p){const pm=playableMask(g,s);return residuals(g,s,p).filter(x=>x.n===1&&(x.mask&pm)!==0n).length;}
function overloadLeaf(g,s){
  if((s.moves&1)!==1||!s.edges.length||s.edges.some(e=>e.terminal&&e.winner===1))return false;
  return s.edges.every(e=>!e.terminal&&playableSingletons(g,g.states.get(e.key),0)>0);
}

function solve(g){
  const d=new Map();
  for(let ply=g.cells;ply>=0;ply--)for(const k of g.byPly[ply]){
    const s=g.states.get(k),side=s.moves&1,vals=s.edges.map(e=>e.terminal?(e.winner===0?1:-1):d.get(e.key).value);
    d.set(k,{value:vals.length?(side===0?Math.max(...vals):Math.min(...vals)):0});
  }
  for(let ply=g.cells;ply>=0;ply--)for(const k of g.byPly[ply]){
    const s=g.states.get(k),x=d.get(k);if(x.value!==1)continue;
    if((s.moves&1)===0&&s.edges.some(e=>e.terminal&&e.winner===0)){x.rank=0;x.kind='I';continue;}
    if(overloadLeaf(g,s)){x.rank=0;x.kind='O';continue;}
    if((s.moves&1)===0){
      const rs=s.edges.filter(e=>!e.terminal&&d.get(e.key)?.value===1&&Number.isFinite(d.get(e.key)?.rank)).map(e=>d.get(e.key).rank);
      if(rs.length){x.rank=1+Math.min(...rs);x.kind='E';}
    }else if(!s.edges.some(e=>e.terminal&&e.winner===1)){
      const cs=s.edges.filter(e=>!e.terminal).map(e=>d.get(e.key));
      if(cs.length===s.edges.length&&cs.every(c=>c?.value===1&&Number.isFinite(c.rank))){x.rank=1+Math.max(...cs.map(c=>c.rank));x.kind='A';}
    }
  }
  return d;
}

function grammar(g,d){
  const chosen=new Map();
  const wins=[...g.states.keys()].filter(k=>d.get(k).value===1&&Number.isFinite(d.get(k).rank)).sort((a,b)=>d.get(a).rank-d.get(b).rank||a.localeCompare(b));
  for(const k of wins){
    const s=g.states.get(k),x=d.get(k);
    if(x.kind==='I'||x.kind==='O'){x.expr=x.kind;chosen.set(k,[]);continue;}
    if(x.kind==='E'){
      const opts=s.edges.filter(e=>!e.terminal&&d.get(e.key)?.value===1&&Number.isFinite(d.get(e.key)?.rank));
      const min=Math.min(...opts.map(e=>d.get(e.key).rank));
      const es=opts.filter(e=>d.get(e.key).rank===min).sort((a,b)=>d.get(a.key).expr.localeCompare(d.get(b.key).expr)||a.c-b.c);
      const e=es[0];x.expr=`E(${d.get(e.key).expr})`;chosen.set(k,[e]);
    }else{
      const es=s.edges.filter(e=>!e.terminal);assert(es.every(e=>d.get(e.key)?.expr));
      const classes=[...new Set(es.map(e=>d.get(e.key).expr))].sort();
      assert(classes.every(c=>c==='I'||c.startsWith('E(')),'P1 child must be I or E(...)');
      x.expr=`A(${classes.join('|')})`;chosen.set(k,es);
    }
  }
  return chosen;
}

function cone(g,d,chosen,roots){
  const seen=new Set(),stack=[...roots],rules=new Set(),aRules=new Set();
  let edges=0,aNodes=0,raw=0,norm=0,unary=0,binary=0,wide=0,maxArity=0;
  while(stack.length){
    const k=stack.pop();if(seen.has(k))continue;seen.add(k);
    const s=g.states.get(k),x=d.get(k),es=chosen.get(k)||[];rules.add(x.expr);edges+=es.length;
    if(x.kind==='A'){
      aNodes++;aRules.add(x.expr);const cls=new Set(es.map(e=>d.get(e.key).expr));raw+=es.length;norm+=cls.size;maxArity=Math.max(maxArity,cls.size);
      if(cls.size===1)unary++;else if(cls.size===2)binary++;else wide++;
    }
    for(const e of es)if(!e.terminal)stack.push(e.key);
  }
  return{states:seen.size,edges,rules:rules.size,alternativeRules:aRules.size,aNodes,rawBranches:raw,normalizedBranches:norm,branchReduction:raw?1-norm/raw:0,unaryA:unary,binaryA:binary,wideA:wide,maxNormalizedArity:maxArity,ruleSet:[...rules].sort()};
}

function profile(W,H,K){
  const g=game(W,H,K),d=solve(g),chosen=grammar(g,d);
  const wins=[...g.states.keys()].filter(k=>d.get(k).value===1&&Number.isFinite(d.get(k).rank));
  const maxRank=Math.max(...wins.map(k=>d.get(k).rank)),maxRoots=wins.filter(k=>d.get(k).rank===maxRank),root=d.get(g.root);
  return{profile:`${W}x${H}c${K}`,materializedStates:g.states.size,winningStates:wins.length,maxRank,maxRankStates:maxRoots.length,root:{value:root.value,rank:root.rank??null,expression:root.expr??null},rootCone:root.expr?cone(g,d,chosen,[g.root]):null,allMaxRankCones:cone(g,d,chosen,maxRoots)};
}

const result={kind:'recursive-alternative-convergence-control',profiles:[[4,3,3],[4,4,3],[5,3,4],[4,4,4]].map(x=>profile(...x))};
assert.equal(result.profiles[0].root.expression,'E(A(E(A(E(A(E(O)|I))|I))|E(O)))');
assert.equal(result.profiles[1].root.expression,result.profiles[0].root.expression);
console.log(JSON.stringify(result,null,2));

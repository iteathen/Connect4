import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

function linesFor(W,H,K){
  const lines=[];
  for(let r=0;r<H;r++) for(let c=0;c<W;c++) for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(K-1)*dx, y=r+(K-1)*dy;
    if(x<0||x>=W||y<0||y>=H) continue;
    let m=0n;
    for(let j=0;j<K;j++) m |= 1n<<BigInt((r+j*dy)*W+c+j*dx);
    lines.push(m);
  }
  return lines;
}

function makeGame(W,H,K,sequence=''){
  const CELLS=W*H, lines=linesFor(W,H,K);
  function won(bits,bit){ for(const l of lines) if((l&bit)!==0n && (l&bits)===l) return true; return false; }
  function key(p0,p1){return `${p0.toString(16)}/${p1.toString(16)}`;}
  let rp0=0n,rp1=0n; const rh=new Uint8Array(W);
  for(let mv=0;mv<sequence.length;mv++){
    const c=sequence.charCodeAt(mv)-49, r=rh[c];
    assert(c>=0&&c<W&&r<H,`bad sequence ${sequence}`);
    const bit=1n<<BigInt(r*W+c);
    if(mv&1){rp1|=bit; assert(!won(rp1,bit),`terminal prefix ${sequence}`);} else {rp0|=bit; assert(!won(rp0,bit),`terminal prefix ${sequence}`);}
    rh[c]++;
  }
  const root={p0:rp0,p1:rp1,h:rh,moves:sequence.length};
  const states=new Map(); const byPly=Array.from({length:CELLS+1},()=>[]);
  const stack=[root];
  while(stack.length){
    const st=stack.pop(), k=key(st.p0,st.p1);
    if(states.has(k)) continue;
    const edges=[]; const pl=st.moves&1;
    for(let c=0;c<W;c++){
      const row=st.h[c]; if(row===H) continue;
      const bit=1n<<BigInt(row*W+c), bits=pl?st.p1:st.p0;
      if(won(bits|bit,bit)){
        const score=pl ? -Math.trunc((CELLS+1-st.moves)/2) : Math.trunc((CELLS+1-st.moves)/2);
        edges.push({c,terminal:true,score});
      }else{
        const h=st.h.slice(); h[c]++;
        const ch={p0:pl?st.p0:st.p0|bit,p1:pl?st.p1|bit:st.p1,h,moves:st.moves+1};
        const ck=key(ch.p0,ch.p1); edges.push({c,terminal:false,key:ck});
        if(!states.has(ck)) stack.push(ch);
      }
    }
    const node={...st,key:k,edges}; states.set(k,node); byPly[st.moves].push(k);
  }
  return {W,H,K,CELLS,lines,rootKey:key(root.p0,root.p1),rootMoves:root.moves,states,byPly};
}

function analyze(game){
  const {states,byPly,CELLS,rootKey,rootMoves}=game;
  const makeIntern=()=>{const m=new Map(),defs=[];return {get(sig){let x=m.get(sig);if(x===undefined){x=defs.length;m.set(sig,x);defs.push(sig);}return x;},defs};};
  const shapeIntern=makeIntern(), proofIntern=makeIntern(), proofLIntern=makeIntern(), exactIntern=makeIntern(), exactLIntern=makeIntern();
  const data=new Map(); let edges=0; const proofCostById=[]; const dataCost=id=>proofCostById[Number(id)]??1e9;
  function relativeOutcome(abs,pl){ if(abs===0)return 'D'; const currentWins=pl===0?abs>0:abs<0; return currentWins?'W':'L'; }
  for(let ply=CELLS;ply>=rootMoves;ply--){
    for(const k of byPly[ply]){
      const st=states.get(k), pl=st.moves&1; edges+=st.edges.length; const vals=[];
      for(const e of st.edges){
        if(e.terminal) vals.push({e,score:e.score,proof:null});
        else {const ch=data.get(e.key); vals.push({e,score:ch.score,proof:ch});}
      }
      let score=0; if(vals.length) score=pl===0?Math.max(...vals.map(x=>x.score)):Math.min(...vals.map(x=>x.score));
      const rel=relativeOutcome(score,pl);
      const term=vals.some(x=>x.e.terminal)?1:0;
      const childBehavior=[...new Set(vals.filter(x=>!x.e.terminal).map(x=>x.proof.behavior))].sort((a,b)=>a-b);
      const behavior=shapeIntern.get(`${rel}|T${term}|${childBehavior.join(',')}`);

      let proofSig;
      if(rel==='W'){
        if(vals.some(x=>x.e.terminal)) proofSig='T:W';
        else {const ws=vals.filter(x=>!x.e.terminal&&relativeOutcome(x.score,1-pl)==='L').map(x=>({id:x.proof.wdlProof,cost:x.proof.wdlTreeCost})).sort((a,b)=>a.cost-b.cost||a.id-b.id); proofSig=`W:${ws[0].id}`;}
      }else if(rel==='L'){
        const deps=[...new Set(vals.filter(x=>!x.e.terminal).map(x=>x.proof.wdlProof))].sort((a,b)=>a-b); proofSig=`L:${deps.join(',')}`;
      }else if(vals.length===0) proofSig='T:D';
      else {
        const oppWinDeps=[...new Set(vals.filter(x=>!x.e.terminal&&relativeOutcome(x.score,1-pl)==='W').map(x=>x.proof.wdlProof))].sort((a,b)=>a-b);
        const d=vals.filter(x=>!x.e.terminal&&relativeOutcome(x.score,1-pl)==='D').map(x=>({id:x.proof.wdlProof,cost:x.proof.wdlTreeCost})).sort((a,b)=>a.cost-b.cost||a.id-b.id)[0].id;
        proofSig=`D:${d}|${oppWinDeps.join(',')}`;
      }
      const wdlProof=proofIntern.get(proofSig); let wdlTreeCost=1;
      if(proofSig.startsWith('W:')) wdlTreeCost+=dataCost(proofSig.slice(2));
      else if(proofSig.startsWith('L:')){const s=proofSig.slice(2);if(s)for(const x of s.split(','))wdlTreeCost+=dataCost(x);}
      else if(proofSig.startsWith('D:')){const [a,b]=proofSig.slice(2).split('|');if(a)wdlTreeCost+=dataCost(a);if(b)for(const x of b.split(','))wdlTreeCost+=dataCost(x);}

      let proofLSig;
      if(rel==='W'){
        const imm=vals.filter(x=>x.e.terminal).sort((a,b)=>a.e.c-b.e.c)[0];
        if(imm) proofLSig=`T:W@${imm.e.c}`;
        else proofLSig=`W:${vals.filter(x=>!x.e.terminal&&relativeOutcome(x.score,1-pl)==='L').map(x=>`${x.e.c}:${x.proof.wdlProofL}`).sort()[0]}`;
      }else if(rel==='L') proofLSig=`L:${[...new Set(vals.filter(x=>!x.e.terminal).map(x=>`${x.e.c}:${x.proof.wdlProofL}`))].sort().join(',')}`;
      else if(vals.length===0) proofLSig='T:D';
      else {
        const draw=vals.filter(x=>!x.e.terminal&&relativeOutcome(x.score,1-pl)==='D').map(x=>`${x.e.c}:${x.proof.wdlProofL}`).sort()[0];
        const wins=[...new Set(vals.filter(x=>!x.e.terminal&&relativeOutcome(x.score,1-pl)==='W').map(x=>`${x.e.c}:${x.proof.wdlProofL}`))].sort();
        proofLSig=`D:${draw}|${wins.join(',')}`;
      }
      const wdlProofL=proofLIntern.get(proofLSig);

      const termScores=[...new Set(vals.filter(x=>x.e.terminal).map(x=>x.score))].sort((a,b)=>a-b);
      const exactDeps=[...new Set(vals.filter(x=>!x.e.terminal).map(x=>x.proof.exactProof))].sort((a,b)=>a-b);
      const exactProof=exactIntern.get(`V${score}|T${termScores.join(',')}|C${exactDeps.join(',')}`);
      const exactLDeps=[...new Set(vals.filter(x=>!x.e.terminal).map(x=>`${x.e.c}:${x.proof.exactProofL}`))].sort();
      const exactLTerms=[...new Set(vals.filter(x=>x.e.terminal).map(x=>`${x.e.c}:${x.score}`))].sort();
      const exactProofL=exactLIntern.get(`V${score}|T${exactLTerms.join(',')}|C${exactLDeps.join(',')}`);
      if(proofCostById[wdlProof]===undefined||wdlTreeCost<proofCostById[wdlProof]) proofCostById[wdlProof]=wdlTreeCost;
      data.set(k,{score,behavior,wdlProof,wdlTreeCost,wdlProofL,exactProof,exactProofL});
    }
  }
  function parseRefs(sig,kind){
    const refs=[];
    if(kind==='wdl'){
      if(sig.startsWith('W:'))refs.push(Number(sig.slice(2)));
      else if(sig.startsWith('L:')){const s=sig.slice(2);if(s)for(const x of s.split(','))refs.push(Number(x));}
      else if(sig.startsWith('D:')){const [a,b]=sig.slice(2).split('|');if(a)refs.push(Number(a));if(b)for(const x of b.split(','))refs.push(Number(x));}
    }else if(kind==='wdlL'){
      if(sig.startsWith('T:'))return refs;for(const p of sig.slice(2).split('|').flatMap(x=>x?x.split(','):[])){const i=p.lastIndexOf(':');if(i>=0)refs.push(Number(p.slice(i+1)));}
    }else if(kind==='exact'){
      const i=sig.indexOf('|C');if(i>=0){const s=sig.slice(i+2);if(s)for(const x of s.split(','))refs.push(Number(x));}
    }else if(kind==='exactL'){
      const i=sig.indexOf('|C');if(i>=0){const s=sig.slice(i+2);if(s)for(const p of s.split(',')){const j=p.lastIndexOf(':');refs.push(Number(p.slice(j+1)));}}
    }
    return refs.filter(Number.isFinite);
  }
  function closureSize(root,defs,kind){const seen=new Set(),stack=[root];while(stack.length){const x=stack.pop();if(seen.has(x))continue;seen.add(x);for(const r of parseRefs(defs[x],kind))if(!seen.has(r))stack.push(r);}return seen.size;}
  function treeCost(root,defs,kind,memo=new Map()){const mk=`${kind}:${root}`;if(memo.has(mk))return memo.get(mk);let n=1;for(const r of parseRefs(defs[root],kind))n+=treeCost(r,defs,kind,memo);memo.set(mk,n);return n;}
  const root=data.get(rootKey),rootPl=rootMoves&1;
  return {states:states.size,edges,rootScore:root.score,rootWDL:relativeOutcome(root.score,rootPl),behaviorShapes:shapeIntern.defs.length,wdlProofShapes:proofIntern.defs.length,rootWdlProofDag:closureSize(root.wdlProof,proofIntern.defs,'wdl'),rootWdlProofTree:treeCost(root.wdlProof,proofIntern.defs,'wdl'),labeledWdlProofShapes:proofLIntern.defs.length,rootLabeledWdlProofDag:closureSize(root.wdlProofL,proofLIntern.defs,'wdlL'),exactProofShapes:exactIntern.defs.length,rootExactProofDag:closureSize(root.exactProof,exactIntern.defs,'exact'),labeledExactProofShapes:exactLIntern.defs.length,rootLabeledExactProofDag:closureSize(root.exactProofL,exactLIntern.defs,'exactL'),proofDefs:game.W*game.H<=12?proofIntern.defs:undefined,rootProofId:game.W*game.H<=12?root.wdlProof:undefined};
}

const small=[[4,3,3,''],[4,4,4,''],[5,3,4,''],[4,5,4,'']];
const frozen=['764353221241721325116531','5563576621726752473477144213','3253472274311154254412135','24763565123272565531172315','544111352647536626717444135','3412761563244125763551573','1174534625627233274533652316','463141571213634656162165252'];
const started=performance.now(),results=[];
for(const [W,H,K,seq] of small){const t=performance.now(),a=analyze(makeGame(W,H,K,seq));results.push({kind:'small',profile:`${W}x${H}c${K}`,...a,ms:performance.now()-t});}
for(const sequence of frozen){const t=performance.now(),a=analyze(makeGame(7,6,4,sequence));results.push({kind:'frozen7x6',sequence,...a,ms:performance.now()-t});}
console.log(JSON.stringify({kind:'searchless-dependency-shapes',elapsedMs:performance.now()-started,results},null,2));

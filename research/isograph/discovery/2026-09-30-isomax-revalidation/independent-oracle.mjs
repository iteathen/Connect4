// Deliberately no imports from the research implementation under comparison.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export const TRAINED=['6x3-k3','4x5-k4','6x3-k4'];
export function assertCarrier(W,H,K,toy=false){
  assert.ok([W,H,K].every(Number.isInteger));
  assert.ok(TRAINED.includes(`${W}x${H}-k${K}`)||(toy&&W>0&&H>0&&W*H<=9&&K>=2&&K<=Math.max(W,H)),'carrier outside trained allowlist / tiny toy domain');
}
const lexical=(a,b)=>a<b?-1:a>b?1:0;
const maskOf=cells=>cells.reduce((n,c)=>n+2**c,0);
function cellsOf(mask,N){const out=[];for(let c=0;c<N;c++)if(Math.floor(mask/2**c)%2)out.push(c);return out;}
function* orders(n){
  const a=Array.from({length:n},(_,i)=>i);
  do{yield [...a];let k=n-2;while(k>=0&&a[k]>=a[k+1])k--;if(k<0)return;let l=n-1;while(a[l]<=a[k])l--;[a[k],a[l]]=[a[l],a[k]];a.splice(k+1,n,...a.slice(k+1).reverse());}while(true);
}
export function slotMatching(needs,owner,mover,remaining){
  // Augmenting paths in a bipartite graph, independent of sorted greedy slots.
  const slots=Array.from({length:remaining},(_,i)=>i+1).filter(i=>(i%2===1?mover:1-mover)===owner);
  const assigned=new Map();
  function place(cell,seen){
    if(needs[cell]<=0)return false;
    for(const slot of slots){if(slot<needs[cell]||seen.has(slot))continue;seen.add(slot);if(!assigned.has(slot)||place(assigned.get(slot),seen)){assigned.set(slot,cell);return true;}}
    return false;
  }
  return needs.every((_,i)=>place(i,new Set()));
}
export function canonicalComponents(q,W,H,cache=new Map()){
  const families=[q.r0,q.r1].map(rs=>rs.map(m=>cellsOf(m,W*H)));
  const neighbors=Array.from({length:W},()=>new Set());
  for(const cells of families.flat()){const cols=[...new Set(cells.map(c=>c%W))];for(const c of cols)for(const d of cols)neighbors[c].add(d);}
  const unseen=new Set(Array.from({length:W},(_,i)=>i)),types=[],counts=new Map();
  while(unseen.size){
    const stack=[unseen.values().next().value],cols=[];unseen.delete(stack[0]);
    while(stack.length){const c=stack.pop();cols.push(c);for(const d of neighbors[c])if(unseen.delete(d))stack.push(d);}
    cols.sort((a,b)=>a-b);const n=cols.length,local=new Map(cols.map((c,i)=>[c,i]));
    const h=cols.map(c=>q.h[c]);
    const residual=families.map(rs=>rs.filter(cells=>local.has(cells[0]%W)).map(cells=>cells.map(c=>[Math.floor(c/W),local.get(c%W)])));
    const raw=JSON.stringify([h,residual]);let result=cache.get(raw);
    if(!result){
      let type=null,descriptor=null;
      // Permutations list source columns in destination order, the inverse convention of the legacy harness.
      for(const order of orders(n)){
        const destination=Array(n);order.forEach((src,dst)=>{destination[src]=dst;});
        const exact=residual.map(rs=>rs.map(cells=>maskOf(cells.map(([r,c])=>r*n+destination[c]))).sort((a,b)=>a-b).join('.'));
        const candidate=order.map(c=>h[c]).join(',')+'|'+exact.join('|');
        if(type===null||candidate<type)type=candidate;
        const relative=residual.map(rs=>rs.map(cells=>cells.map(([r,c])=>`${r-h[c]}:${destination[c]}`).sort().join(',')).sort().join(';'));
        const d=`w${n}|cap=${order.map(c=>(H-h[c])%2).join('.')}|r0=${relative[0]}|r1=${relative[1]}`;
        if(descriptor===null||d<descriptor)descriptor=d;
      }
      result={type,descriptor};cache.set(raw,result);
    }
    types.push(result.type);counts.set(result.descriptor,(counts.get(result.descriptor)??0)+1);
  }
  return {components:types.sort(),roleCapparZoe:[...counts].sort(([a],[b])=>lexical(a,b)).map(([d,n])=>[d,n%2?'O':'E'])};
}

export function createOracle(W,H,K,{toy=false}={}){
  assertCarrier(W,H,K,toy);const N=W*H,powers=Array.from({length:N},(_,i)=>3**i);
  const codes=[],index=new Map(),rankStarts=[0],componentCache=new Map();let values;
  function decode(code){const cells=Array(N);for(let i=0;i<N;i++){cells[i]=code%3;code=Math.floor(code/3);}return cells;}
  function support(cells){return Array.from({length:W},(_,c)=>{let r=0;while(r<H&&cells[r*W+c])r++;return r;});}
  function winnerOf(cells){
    // Maximal runs scanned on physical cells; no precomputed winning bit masks.
    for(let cell=0;cell<N;cell++)if(cells[cell]){
      const x=cell%W,y=Math.floor(cell/W),p=cells[cell];
      for(const [dx,dy] of [[1,0],[0,1],[1,1],[-1,1]]){
        const px=x-dx,py=y-dy;if(px>=0&&px<W&&py>=0&&py<H&&cells[py*W+px]===p)continue;
        let length=1,c=x+dx,r=y+dy;
        while(c>=0&&c<W&&r>=0&&r<H&&cells[r*W+c]===p){length++;if(length>=K)return p-1;c+=dx;r+=dy;}
      }
    }
    return null;
  }
  function children(code,cells,h,rank){return h.flatMap((r,c)=>r===H?[]:[code+(rank%2+1)*powers[r*W+c]]);}
  function immediate(cells,h,player){
    for(let c=0;c<W;c++)if(h[c]<H){const pos=h[c]*W+c;cells[pos]=player+1;const wins=winnerOf(cells)===player;cells[pos]=0;if(wins)return true;}return false;
  }
  // Geometry is enumerated by pairs of endpoints, separate from win run scanning.
  const lines=[];
  for(let s=0;s<N;s++)for(let e=s+1;e<N;e++){
    const x=s%W,y=Math.floor(s/W),dx=(e%W-x)/(K-1),dy=(Math.floor(e/W)-y)/(K-1);
    if(!Number.isInteger(dx)||!Number.isInteger(dy)||Math.max(Math.abs(dx),Math.abs(dy))!==1)continue;
    lines.push(Array.from({length:K},(_,i)=>(y+i*dy)*W+x+i*dx));
  }
  function quotient(cells,h){
    function residual(player){
      const sets=new Map();
      for(const line of lines){if(line.some(c=>cells[c]===2-player))continue;const empty=line.filter(c=>!cells[c]);if(empty.length)sets.set(empty.join(','),new Set(empty));}
      const small=[...sets.values()].sort((a,b)=>a.size-b.size),kept=[];
      for(const s of small)if(!kept.some(t=>[...t].every(c=>s.has(c))))kept.push(s);
      return kept.map(s=>maskOf([...s])).sort((a,b)=>a-b);
    }
    return {h:[...h],r0:residual(0),r1:residual(1)};
  }
  function reduction(q,rank){
    const remaining=N-rank,mover=rank%2;
    const families=[q.r0,q.r1].map((rs,p)=>rs.map(m=>[m,cellsOf(m,N)]).filter(([,cs])=>slotMatching(cs.map(c=>Math.floor(c/W)-q.h[c%W]+1),p,mover,remaining)));
    const frontier=q.h.flatMap((h,c)=>h===H?[]:[h*W+c]);
    const nonwinning=frontier.filter(c=>!families[mover].some(([,cs])=>cs.length===1&&cs[0]===c));
    families[1-mover]=families[1-mover].filter(([,cs])=>!nonwinning.every(c=>cs.includes(c)));
    const caps=q.h.flatMap((h,c)=>h===H?[]:[(H-1)*W+c]);
    const nonfinal=1-((N-1)%2);
    if(caps.length)families[nonfinal]=families[nonfinal].filter(([,cs])=>!caps.every(c=>cs.includes(c)));
    return {h:[...q.h],r0:families[0].map(([m])=>m),r1:families[1].map(([m])=>m)};
  }
  function enumerate({loadRank=()=>null,saveRank=()=>{},progress=()=>{}}={}){
    let frontier=[0];
    for(let rank=0;rank<=N;rank++){
      const restored=loadRank(rank);if(restored)frontier=restored;
      for(const code of frontier){assert.ok(!index.has(code));index.set(code,codes.length);codes.push(code);}
      saveRank(rank,frontier);rankStarts[rank+1]=codes.length;progress({phase:'reachable',rank,states:codes.length,rankStates:frontier.length});
      if(rank===N)break;
      const nextRestored=loadRank(rank+1);if(nextRestored){frontier=nextRestored;continue;}
      const next=new Set();
      for(const code of frontier){const cells=decode(code);if(winnerOf(cells)!==null)continue;for(const child of children(code,cells,support(cells),rank))next.add(child);}
      frontier=[...next];
    }
    return codes.length;
  }
  function solve({progress=()=>{},restored=null}={}){
    values=restored??new Int8Array(codes.length).fill(2);assert.equal(values.length,codes.length);
    function negamax(code){const i=index.get(code);assert.notEqual(i,undefined);if(values[i]!==2)return values[i];
      const cells=decode(code),h=support(cells),rank=h.reduce((a,b)=>a+b,0);
      if(winnerOf(cells)!==null)return values[i]=-1;
      if(rank===N)return values[i]=0;
      let best=-1;for(const child of children(code,cells,h,rank)){best=Math.max(best,-negamax(child));if(best===1)break;}
      return values[i]=best;
    }
    for(let i=0;i<codes.length;i++){negamax(codes[i]);if(i%100000===0)progress({phase:'wdl',visited:i,total:codes.length});}
    return values;
  }
  function row(code){
    const cells=decode(code),h=support(cells),rank=h.reduce((a,b)=>a+b,0),winner=winnerOf(cells),terminal=winner!==null||rank===N;
    let a=0,b=0;cells.forEach((p,c)=>{if(p===1)a+=2**c;if(p===2)b+=2**c;});
    const out={key:`${a}:${b}`,a,b,rank,h,terminal,winner,wdlAbsolute:values?values[index.get(code)]*(rank%2?-1:1):null,t2:null,q:null,rfg:null,components:null,roleCapparZoe:null};
    if(terminal)return out;
    let t2='O';
    if(immediate(cells,h,rank%2))t2='W';
    else if(children(code,cells,h,rank).every(child=>{const cs=decode(child),hs=support(cs);return hs.reduce((a,b)=>a+b,0)<N&&immediate(cs,hs,1-rank%2);}))t2='L2';
    const q=quotient(cells,h),rfg=reduction(q,rank);Object.assign(out,{t2,q,rfg});
    if(t2==='O')Object.assign(out,canonicalComponents(rfg,W,H,componentCache));
    return out;
  }
  return {codes,index,rankStarts,enumerate,solve,row,decode,codeFromCells:cells=>cells.reduce((n,p,c)=>n+p*powers[c],0)};
}

// Structural dependency image computed with BigInt rows and least-column pivots.
// The legacy implementation uses sparse arrays, greatest pivots and trace DAGs.
export function dependencyImage(signatures){
  const unique=[...new Map(signatures.map(s=>[JSON.stringify(s),s])).values()].sort((a,b)=>lexical(JSON.stringify(a),JSON.stringify(b)));
  const features=unique.map(sig=>{const atoms=sig.flatMap(([d,z])=>z==='O'?[JSON.stringify(['p',d]),JSON.stringify(['o',d])]:[JSON.stringify(['p',d])]).sort();
    const low=['1',...atoms],odd=sig.filter(([,z])=>z==='O').map(([d])=>d).sort(),high=[];
    for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++)low.push(JSON.stringify([atoms[i],atoms[j]]));
    for(let i=0;i<odd.length;i++)for(let j=i+1;j<odd.length;j++)for(let k=j+1;k<odd.length;k++)high.push(JSON.stringify([odd[i],odd[j],odd[k]]));
    return {low,high};});
  const lowerColumns=[...new Set(features.flatMap(r=>r.low))].sort(),oooColumns=[...new Set(features.flatMap(r=>r.high))].sort();
  const lowIndex=new Map(lowerColumns.map((k,i)=>[k,i])),highIndex=new Map(oooColumns.map((k,i)=>[k,i]));
  const vector=(xs,idx)=>xs.reduce((b,k)=>b|(1n<<BigInt(idx.get(k))),0n);
  const pivots=new Map(),residues=[];
  for(const f of features){let low=vector(f.low,lowIndex),high=vector(f.high,highIndex);
    while(low){const p=low&-low,prior=pivots.get(p);if(!prior){pivots.set(p,{low,high});low=null;break;}low^=prior.low;high^=prior.high;}
    if(low===0n)residues.push(high);
  }
  const result=canonicalImage(oooColumns,residues);
  return {structuralClasses:unique.length,lowerRank:pivots.size,leftNullity:residues.length,...result};
}

function canonicalImage(oooColumns,residues){
  const canonical=new Map();
  for(let row of residues){while(row){const p=row&-row;if(canonical.has(p))row^=canonical.get(p);else{canonical.set(p,row);break;}}}
  // Reduced row echelon form has a unique semantic-column certificate.
  const ordered=[...canonical.keys()].sort((a,b)=>a<b?-1:1);
  for(let i=ordered.length-1;i>=0;i--){const p=ordered[i],v=canonical.get(p);for(let j=0;j<i;j++){const q=ordered[j];if(canonical.get(q)&p)canonical.set(q,canonical.get(q)^v);}}
  const rref=ordered.map(p=>canonical.get(p).toString(16));
  const certificate={oooColumns,rref};
  return {oooRank:rref.length,...certificate,canonicalImageSha256:createHash('sha256').update(JSON.stringify(certificate)).digest('hex')};
}

// Comparison-only adapter: canonicalize an externally supplied dependency image.
// This is not used to derive the independent structural dependencies above.
export function canonicalExternalImage(semanticTriples,dependencies){
  const oooColumns=[...new Set(semanticTriples)].sort();
  const positions=new Map(oooColumns.map((x,i)=>[x,i]));
  const residues=dependencies.map(dep=>dep.oooResidue.reduce((row,i)=>row^(1n<<BigInt(positions.get(semanticTriples[i]))),0n));
  return canonicalImage(oooColumns,residues);
}

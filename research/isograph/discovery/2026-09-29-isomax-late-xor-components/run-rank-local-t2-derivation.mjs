import fs from 'node:fs';
import assert from 'node:assert/strict';

function auditCase(W,H,K){
  const N=W*H;

  function winMasks(){
    const out=[];
    for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
      const ec=c+(K-1)*dc,er=r+(K-1)*dr;
      if(ec<0||ec>=W||er<0||er>=H)continue;
      let m=0;
      for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);
      out.push(m>>>0);
    }
    return [...new Set(out)];
  }

  const L=winMasks();
  const won=b=>L.some(m=>((b&m)>>>0)===m);

  function bits(m){
    const out=[];
    for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));
    return out;
  }

  function normalize(xs){
    xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
    return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
  }

  function residuals(self,opp){
    const out=[];
    for(const l of L){
      if(l&opp)continue;
      const z=(l&~self)>>>0;
      if(z)out.push(z);
    }
    return normalize(out);
  }

  const states=new Map();

  function sk(a,b){return a+':'+b;}

  function visit(a,b,h,rank){
    const key=sk(a,b);
    if(states.has(key))return key;
    const A=won(a),B=won(b);
    assert.equal(A&&B,false);
    const terminal=A||B||rank===N;
    const rec={key,a,b,h:[...h],rank,terminal,winner:A?0:B?1:null,children:[]};
    states.set(key,rec);
    if(terminal)return key;
    for(let c=0;c<W;c++)if(h[c]<H){
      const bit=1<<(h[c]*W+c);
      h[c]++;
      const child=(rank&1)?visit(a,b|bit,h,rank+1):visit(a|bit,b,h,rank+1);
      h[c]--;
      rec.children.push({col:c,key:child});
    }
    return key;
  }

  visit(0,0,new Uint8Array(W),0);

  function qOf(x){
    return {h:[...x.h],r0:residuals(x.a,x.b),r1:residuals(x.b,x.a)};
  }

  function cnt(q){
    const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,mover=rank&1;
    const mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
    return {rank,rem,mover,p0:mover===0?mm:oo,p1:mover===1?mm:oo};
  }

  function feasible(mask,h,p){
    const c=cnt({h,r0:[],r1:[]});
    const needs=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);
    if(needs.some(x=>x<=0))return false;
    let slot=p===c.mover?1:2;
    for(const need of needs){
      while(slot<need)slot+=2;
      if(slot>c.rem)return false;
      slot+=2;
    }
    return true;
  }

  function R(q){
    return {h:q.h,r0:q.r0.filter(m=>feasible(m,q.h,0)),r1:q.r1.filter(m=>feasible(m,q.h,1))};
  }

  function F(q){
    const c=cnt(q),own=c.mover?q.r1:q.r0;
    let frontier=0;
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const b=1<<(q.h[col]*W+col);
      if(!own.some(x=>x===b))frontier|=b;
    }
    return c.mover
      ? {h:q.h,r0:q.r0.filter(x=>(x&frontier)!==frontier),r1:q.r1}
      : {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&frontier)!==frontier)};
  }

  function G(q){
    let caps=0;
    for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);
    if(!caps)return q;
    const nonFinal=1-((N-1)&1);
    return nonFinal
      ? {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&caps)!==caps)}
      : {h:q.h,r0:q.r0.filter(x=>(x&caps)!==caps),r1:q.r1};
  }

  const RFG=q=>G(F(R(q)));

  function immediateWinningColumns(q,player){
    const rs=player?q.r1:q.r0,out=[];
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const bit=1<<(q.h[col]*W+col);
      if(rs.some(x=>x===bit))out.push(col);
    }
    return out;
  }

  function childDerivedT2(x){
    const q=qOf(x),c=cnt(q);
    if(immediateWinningColumns(q,c.mover).length>0)return 'W';
    let hasLegal=false;
    for(const e of x.children){
      hasLegal=true;
      const child=states.get(e.key);
      if(child.terminal){
        if(child.winner===null)return 'O';
        if(child.winner===c.mover)return 'W';
        return 'O';
      }
      const cq=qOf(child),cc=cnt(cq);
      if(immediateWinningColumns(cq,cc.mover).length===0)return 'O';
    }
    return hasLegal?'L2':'O';
  }

  function isSingleton(m){
    return m!==0&&((m&(m-1))>>>0)===0;
  }

  function directT2(q){
    const c=cnt(q);
    const own=c.mover?q.r1:q.r0;
    const opp=c.mover?q.r0:q.r1;
    const ownSingleton=new Set(own.filter(isSingleton));
    const oppSingleton=new Set(opp.filter(isSingleton));
    const legal=[];

    for(let col=0;col<W;col++)if(q.h[col]<H){
      const bit=(1<<(q.h[col]*W+col))>>>0;
      legal.push({col,bit});
      if(ownSingleton.has(bit))return 'W';
    }

    if(legal.length===0)return 'O';

    for(const move of legal){
      let oppImmediate=false;
      for(let col=0;col<W&&!oppImmediate;col++){
        let row=q.h[col];
        if(col===move.col)row++;
        if(row>=H)continue;
        const bit=(1<<(row*W+col))>>>0;
        if(oppSingleton.has(bit))oppImmediate=true;
      }
      if(!oppImmediate)return 'O';
    }

    return 'L2';
  }

  const nts=[...states.values()].filter(x=>!x.terminal);
  let qoMismatch=0,rfgMismatch=0,firstQo=null,firstRfg=null;
  const counts={W:0,L2:0,O:0};

  for(const x of nts){
    const ref=childDerivedT2(x);
    counts[ref]++;
    const q=qOf(x);
    const qo=directT2(q);
    const rfg=directT2(RFG(q));

    if(qo!==ref){
      qoMismatch++;
      if(firstQo===null)firstQo={
        key:x.key,rank:x.rank,h:x.h,reference:ref,direct:qo,
        q:{r0:q.r0,r1:q.r1}
      };
    }
    if(rfg!==ref){
      rfgMismatch++;
      if(firstRfg===null){
        const z=RFG(q);
        firstRfg={
          key:x.key,rank:x.rank,h:x.h,reference:ref,direct:rfg,
          q:{r0:q.r0,r1:q.r1},
          rfg:{r0:z.r0,r1:z.r1}
        };
      }
    }
  }

  return {
    label:W+'x'+H+'-k'+K,
    width:W,height:H,k:K,
    physicalStates:states.size,
    nonterminalStates:nts.length,
    referenceCounts:counts,
    QO_DIRECT:{
      mismatches:qoMismatch,
      exact:qoMismatch===0,
      firstMismatch:firstQo
    },
    RFG_DIRECT:{
      mismatches:rfgMismatch,
      exact:rfgMismatch===0,
      firstMismatch:firstRfg
    }
  };
}

const specs=[
  [3,3,3],
  [3,4,3],
  [4,3,3],
  [4,4,4],
  [4,4,3],
  [3,5,3],
  [5,3,3],
  [3,6,3]
];

const cases=specs.map(x=>auditCase(...x));

const out={
  schema:'connect4.isomax.rank_local_t2_derivation.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-022',
  reference:'frozen child-derived T2 from EW-RS-016/EW-RS-018',
  directLaw:{
    W:'current-mover singleton residual intersects current legal frontier',
    frontierUpdate:'a move replaces the moved column frontier cell by the next cell above, if any; other frontier cells are unchanged',
    opponentRelease:'opponent has an immediate reply iff its current singleton-residual cells intersect the updated frontier',
    L2:'every legal move releases or preserves an immediate opponent reply',
    O:'otherwise'
  },
  cases,
  crossCase:{
    qoDirectExactAll:cases.every(c=>c.QO_DIRECT.exact),
    rfgDirectExactAll:cases.every(c=>c.RFG_DIRECT.exact),
    qoMismatchTotal:cases.reduce((s,c)=>s+c.QO_DIRECT.mismatches,0),
    rfgMismatchTotal:cases.reduce((s,c)=>s+c.RFG_DIRECT.mismatches,0)
  },
  interpretationGuard:[
    'QO_DIRECT uses only current support, current residual singleton cells and mover/rank; it does not inspect child states.',
    'RFG_DIRECT asks whether the same fact survives the existing R/F/G safe-forgetting representation.',
    'Equality to T2 does not by itself establish Q-V sufficiency or standard-7x6 qualification.'
  ]
};

fs.writeFileSync(
  new URL('./RANK_LOCAL_T2_DERIVATION_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'RANK_LOCAL_T2_DERIVATION_COMPLETE',
  crossCase:out.crossCase,
  cases:cases.map(c=>({
    label:c.label,
    states:c.physicalStates,
    qo:c.QO_DIRECT.mismatches,
    rfg:c.RFG_DIRECT.mismatches
  }))
},null,2));

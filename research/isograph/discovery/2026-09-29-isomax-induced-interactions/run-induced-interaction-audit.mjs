import fs from 'node:fs';
import assert from 'node:assert/strict';

function auditCase(W,H,K){
  const N=W*H;
  function masks(){
    const o=[];
    for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
      const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;
      let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);o.push(m>>>0);
    }
    return [...new Set(o)];
  }
  const L=masks(),won=b=>L.some(m=>((b&m)>>>0)===m);
  function bits(m){const o=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)o.push(31-Math.clz32(v&-v));return o;}
  function cols(m){return [...new Set(bits(m).map(b=>b%W))].sort((a,b)=>a-b);}
  function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
  function residuals(a,b){const o=[];for(const l of L){if(l&b)continue;const r=(l&~a)>>>0;if(r)o.push(r);}return norm(o);}
  const states=new Map(),byRank=Array.from({length:N+1},()=>[]);
  function visit(a,b,h,r){
    const k=a+':'+b;if(states.has(k))return k;
    const A=won(a),B=won(b);assert.equal(A&&B,false);
    const t=A||B||r===N,x={k,a,b,h:[...h],r,t,w:A?0:B?1:null,ch:[]};
    states.set(k,x);byRank[r].push(x);if(t)return k;
    for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const y=(r&1)?visit(a,b|bit,h,r+1):visit(a|bit,b,h,r+1);h[c]--;x.ch.push({c,k:y});}
    return k;
  }
  visit(0,0,new Uint8Array(W),0);
  const nts=[...states.values()].filter(x=>!x.t);
  function q(x){return{h:[...x.h],r0:residuals(x.a,x.b),r1:residuals(x.b,x.a)};}
  function cnt(x){const r=x.h.reduce((a,b)=>a+b,0),n=N-r,m=r&1;return{r,n,m,p0:m?Math.floor(n/2):Math.ceil(n/2),p1:m?Math.ceil(n/2):Math.floor(n/2)};}
  function feasible(mask,h,p){const c=cnt({h,r0:[],r1:[]}),ds=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);let s=p===c.m?1:2;for(const d of ds){while(s<d)s+=2;if(s>c.n)return false;s+=2;}return true;}
  function R(x){return{h:x.h,r0:x.r0.filter(z=>feasible(z,x.h,0)),r1:x.r1.filter(z=>feasible(z,x.h,1))};}
  function F(x){const c=cnt(x),own=c.m?x.r1:x.r0;let f=0;for(let col=0;col<W;col++)if(x.h[col]<H){const b=1<<(x.h[col]*W+col);if(!own.some(z=>z===b))f|=b;}return c.m?{h:x.h,r0:x.r0.filter(z=>(z&f)!==f),r1:x.r1}:{h:x.h,r0:x.r0,r1:x.r1.filter(z=>(z&f)!==f)};}
  function G(x){let caps=0;for(let col=0;col<W;col++)if(x.h[col]<H)caps|=1<<((H-1)*W+col);if(!caps)return x;const finalPlayer=(N-1)&1,nonFinal=1-finalPlayer;return nonFinal?{h:x.h,r0:x.r0,r1:x.r1.filter(z=>(z&caps)!==caps)}:{h:x.h,r0:x.r0.filter(z=>(z&caps)!==caps),r1:x.r1};}
  function Hc(x){const open=[];for(let c=0;c<W;c++)if(x.h[c]<H)open.push(c);if(open.length!==1)return x;const col=open[0],rank=x.h.reduce((a,b)=>a+b,0);function keep(mask,owner){for(const b of bits(mask))if(b%W===col){const d=Math.floor(b/W)-x.h[col]+1;if(d>0&&((rank+d-1)&1)!==owner)return false;}return true;}return{h:x.h,r0:x.r0.filter(z=>keep(z,0)),r1:x.r1.filter(z=>keep(z,1))};}
  const stageFns={QO:x=>x,R:x=>R(x),RF:x=>F(R(x)),RFG:x=>G(F(R(x))),RFGH:x=>Hc(G(F(R(x))))};
  const stageNames=Object.keys(stageFns);

  function partition(x){
    const parent=[...Array(W).keys()];
    function find(a){while(parent[a]!==a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
    function union(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
    for(const m of [...x.r0,...x.r1]){const cs=cols(m);for(let i=1;i<cs.length;i++)union(cs[0],cs[i]);}
    const gs=new Map();for(let c=0;c<W;c++){const r=find(c);if(!gs.has(r))gs.set(r,[]);gs.get(r).push(c);}
    const comps=[...gs.values()].map(cs=>cs.sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]);
    const cid=Array(W);comps.forEach((cs,i)=>cs.forEach(c=>cid[c]=i));
    function sig(cs){
      const set=new Set(cs),inside=m=>cols(m).every(c=>set.has(c));
      return cs.map(c=>x.h[c]).join(',')+'|'+x.r0.filter(inside).join('.')+'|'+x.r1.filter(inside).join('.');
    }
    return {comps,cid,sigs:comps.map(sig)};
  }
  function removed(a,b,owner){
    const A=new Set((owner?a.r1:a.r0).map(x=>x>>>0)),B=new Set((owner?b.r1:b.r0).map(x=>x>>>0));
    return [...A].filter(x=>!B.has(x));
  }
  function stepDeletions(q0){
    const qR=R(q0),qF=F(qR),qG=G(qF),qH=Hc(qG);
    return {
      finals:{RFG:qG,RFGH:qH},
      rows:[
        ['R',q0,qR],['F',qR,qF],['G',qF,qG],['H',qG,qH]
      ]
    };
  }

  const qmap=new Map(),parts={};
  for(const s of stageNames)parts[s]=new Map();
  for(const x of nts){
    const q0=q(x);qmap.set(x.k,q0);
    for(const s of stageNames)parts[s].set(x.k,partition(stageFns[s](q0)));
  }

  const staticStats={RFG:{},RFGH:{}};
  for(const frontier of ['RFG','RFGH'])staticStats[frontier]={
    states:nts.length,statesWithMorePostComponentsThanQO:0,totalPostComponents:0,totalQOComponents:0,
    deletedByStage:{R:0,F:0,G:0,H:0},bridgeDeletedByStage:{R:0,F:0,G:0,H:0},
    statesWithDeletedBridge:0,maxComponentsLinkedByDeletedResidual:0,examples:[]
  };

  for(const x of nts){
    const q0=qmap.get(x.k),del=stepDeletions(q0),p0=parts.QO.get(x.k);
    for(const frontier of ['RFG','RFGH']){
      const st=staticStats[frontier],pf=parts[frontier].get(x.k);
      st.totalQOComponents+=p0.comps.length;st.totalPostComponents+=pf.comps.length;
      if(pf.comps.length>p0.comps.length)st.statesWithMorePostComponentsThanQO++;
      let hasBridge=false;
      for(const [stage,a,b] of del.rows){
        if(frontier==='RFG'&&stage==='H')continue;
        for(const owner of [0,1])for(const m of removed(a,b,owner)){
          st.deletedByStage[stage]++;
          const cs=cols(m),ids=[...new Set(cs.map(c=>pf.cid[c]))].sort((u,v)=>u-v);
          if(ids.length>1){
            hasBridge=true;st.bridgeDeletedByStage[stage]++;st.maxComponentsLinkedByDeletedResidual=Math.max(st.maxComponentsLinkedByDeletedResidual,ids.length);
            if(st.examples.length<24)st.examples.push({state:x.k,support:q0.h,frontier,stage,owner,mask:m,columns:cs,postComponentIds:ids,postComponents:ids.map(i=>pf.comps[i])});
          }
        }
      }
      if(hasBridge)st.statesWithDeletedBridge++;
    }
  }

  const dynamic={};
  for(const stage of stageNames)dynamic[stage]={
    nonterminalTransitions:0,remoteEffectTransitions:0,remoteMergeTransitions:0,remoteSplitTransitions:0,remoteTypeChangeTransitions:0,
    statesWithRemoteEffect:new Set(),examples:[]
  };
  for(const x of nts){
    for(const e of x.ch){
      const y=states.get(e.k);if(y.t)continue;
      for(const stage of stageNames){
        const pre=parts[stage].get(x.k),post=parts[stage].get(y.k),st=dynamic[stage];st.nonterminalTransitions++;
        const mi=pre.cid[e.c],moved=new Set(pre.comps[mi]);
        let remoteEffect=false,merge=false,split=false,typeChange=false;
        for(let i=0;i<pre.comps.length;i++)if(i!==mi){
          const cs=pre.comps[i],set=new Set(cs),hit=[];
          for(let j=0;j<post.comps.length;j++)if(post.comps[j].some(c=>set.has(c)))hit.push(j);
          if(hit.some(j=>post.comps[j].some(c=>!set.has(c)))){remoteEffect=true;merge=true;continue;}
          const covered=[...new Set(hit.flatMap(j=>post.comps[j]).filter(c=>set.has(c)))].sort((a,b)=>a-b);
          assert.deepEqual(covered,cs);
          if(hit.length!==1){remoteEffect=true;split=true;continue;}
          const j=hit[0];
          if(post.comps[j].length!==cs.length||post.comps[j].some((c,k)=>c!==cs[k])){remoteEffect=true;split=true;continue;}
          if(pre.sigs[i]!==post.sigs[j]){remoteEffect=true;typeChange=true;}
        }
        if(remoteEffect){
          st.remoteEffectTransitions++;st.statesWithRemoteEffect.add(x.k);
          if(merge)st.remoteMergeTransitions++;if(split)st.remoteSplitTransitions++;if(typeChange)st.remoteTypeChangeTransitions++;
          if(st.examples.length<24)st.examples.push({state:x.k,child:e.k,moveColumn:e.c,movedPreComponent:pre.comps[mi],preComponents:pre.comps,postComponents:post.comps,merge,split,typeChange});
        }
      }
    }
  }
  for(const stage of stageNames)dynamic[stage].statesWithRemoteEffect=dynamic[stage].statesWithRemoteEffect.size;

  return {
    label:W+'x'+H+'-k'+K,width:W,height:H,k:K,
    physicalStates:states.size,nonterminalStates:nts.length,
    staticFillIn:staticStats,
    dynamicLocality:dynamic
  };
}

const cases=[
  auditCase(3,3,3),auditCase(3,4,3),auditCase(4,3,3),
  auditCase(4,4,3),auditCase(4,4,4),auditCase(3,5,3),auditCase(5,3,3)
];
const out={
  schema:'connect4.isomax.induced_interaction_audit.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-020',
  question:'After exact safe-forgetting, what effective interactions must be retained before residual-incidence components can be treated as dynamically independent?',
  tests:{
    staticFillIn:'deleted residual spans multiple post-reduction components',
    dynamicLocality:'move in one pre-component changes any disjoint pre-component at same reduction stage'
  },
  cases,
  crossCase:{
    anyRFGDeletedBridge:cases.some(c=>c.staticFillIn.RFG.statesWithDeletedBridge>0),
    anyRFGHDeletedBridge:cases.some(c=>c.staticFillIn.RFGH.statesWithDeletedBridge>0),
    anyQORemoteEffect:cases.some(c=>c.dynamicLocality.QO.remoteEffectTransitions>0),
    anyRRemoteEffect:cases.some(c=>c.dynamicLocality.R.remoteEffectTransitions>0),
    anyRFRemoteEffect:cases.some(c=>c.dynamicLocality.RF.remoteEffectTransitions>0),
    anyRFGRemoteEffect:cases.some(c=>c.dynamicLocality.RFG.remoteEffectTransitions>0),
    anyRFGHRemoteEffect:cases.some(c=>c.dynamicLocality.RFGH.remoteEffectTransitions>0)
  },
  interpretationGuard:[
    'A deleted bridge is evidence that residual-incidence connectivity changes under safe forgetting; it does not prove a Schur-complement-like effective interaction is semantically required.',
    'A remote-effect transition is direct evidence that component dynamics are context-coupled at that reduction stage.',
    'Absence of remote effects is evidence for local transition factorization only within the tested bounded carrier.',
    'No XOR or component value law is assumed.'
  ]
};
fs.writeFileSync(new URL('./INDUCED_INTERACTION_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({
  status:'INDUCED_INTERACTION_AUDIT_COMPLETE',
  crossCase:out.crossCase,
  cases:cases.map(c=>({
    label:c.label,
    rfgBridgeStates:c.staticFillIn.RFG.statesWithDeletedBridge,
    rfghBridgeStates:c.staticFillIn.RFGH.statesWithDeletedBridge,
    remote:Object.fromEntries(Object.entries(c.dynamicLocality).map(([k,v])=>[k,v.remoteEffectTransitions]))
  }))
},null,2));
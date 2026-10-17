// Independent VALIDATION ONLY: all fixed 2-cell matchings, all attacker
// first-touch orders on genuine 7x6 gravity support profiles with <=8
// FUTURE events. No physical smaller board, winning/value computation,
// gameplay solver, or matching-enumeration inside the source proof producer.
// Frozen BEFORE control run. 2026-10-17, research/semantic-quotient.
const W=7,H=6,K=4,bit=(c,r)=>r*W+c;
const stats={schema:'connect4.7x6.fixed_mate_release_order_20261017_v0_1',
 domain:{W,H,K,scope:'all standard-board height profiles with 2,4,6,8 remaining future cells'},
 profiles:0,attackerOrderDFSCalls:0,allPerfectMatchingsConsidered:0,
 releaseRobustPerfectMatchings:0,normalFormPerfectMatchings:0,
 mismatchingProfiles:0,actualButNotNormalForm:0,normalFormButNotActual:0,
 byRemaining:{},counterexamples:[]};
function key(pairs){
 return pairs.map(([x,y])=>[Math.min(x,y),Math.max(x,y)].join(':')).sort().join('|');
}
function normalForm(m){
 const hs=m.map(v=>H-v),cols=m.flatMap((v,c)=>v?[c]:[]);
 const expected=new Set(),mask=cols.reduce((v,c)=>v|(1<<c),0);
 const options=Array.from({length:W},()=>[]);
 for(const c of cols){
  if(m[c]%2===0){
   const ps=[];for(let r=hs[c];r<H;r+=2)ps.push([bit(c,r),bit(c,r+1)]);
   options[c].push({cols:[c],pairs:ps});
  }
  for(let d=c+1;d<W;d++)if(m[d]>0&&m[c]%2===m[d]%2){
   const start=m[c]%2?1:2;
   for(let t=start;t<=Math.min(m[c],m[d]);t+=2){
    const ps=[];for(let j=0;j<t;j++)ps.push([bit(c,hs[c]+j),bit(d,hs[d]+j)]);
    for(const z of [c,d])for(let r=hs[z]+t;r<H;r+=2)
     ps.push([bit(z,r),bit(z,r+1)]);
    options[c].push({cols:[c,d],pairs:ps});
   }
  }
 }
 function rec(unused,pairs){
  if(unused===0){expected.add(key(pairs));return;}
  let c=0;while(!(unused&(1<<c)))c++;
  for(const opt of options[c]){
   const cm=opt.cols.reduce((a,z)=>a|(1<<z),0);
   if((unused&cm)===cm)rec(unused&~cm,pairs.concat(opt.pairs));
  }
 }
 rec(mask,[]);return expected;
}
function isRobust(m,pairs){
 const num=pairs.length,full=(1<<num)-1,srcHeights=m.map(v=>H-v);
 const partner=new Map();
 for(let i=0;i<num;i++){
  const [x,y]=pairs[i];partner.set(x,{y,pair:i});partner.set(y,{y:x,pair:i});
 }
 const memo=new Map();
 function visit(done){
  stats.attackerOrderDFSCalls++;
  if(done===full)return true;
  if(memo.has(done))return memo.get(done);
  const h=srcHeights.slice();
  for(let i=0;i<num;i++)if((done&(1<<i))!==0)
   for(const x of pairs[i])h[x%W]++;
  let legal=false;
  for(let c=0;c<W;c++)if(h[c]<H){
   const x=bit(c,h[c]),match=partner.get(x);
   if(!match)throw Error('bad event set');
   if(done&(1<<match.pair))throw Error('done pair contains playable event');
   legal=true;
   const yc=match.y%W,yr=Math.floor(match.y/W);
   if(yr!==h[yc]+(yc===c?1:0)){memo.set(done,false);return false;}
   if(!visit(done|(1<<match.pair))){memo.set(done,false);return false;}
  }
  if(!legal){memo.set(done,false);return false;}
  memo.set(done,true);return true;
 }
 return visit(0);
}
const m=Array(W).fill(0);
function evaluate(total){
 if(total===0||total>8||total%2) return;
 stats.profiles++;
 const future=[];for(let c=0;c<W;c++)for(let r=H-m[c];r<H;r++)future.push(bit(c,r));
 const normal=normalForm(m),observed=new Set(),num=total/2;
 const buck=stats.byRemaining[total]??(stats.byRemaining[total]={profiles:0,matchings:0,robust:0,normal:0,mismatches:0});
 buck.profiles++;buck.normal+=normal.size;stats.normalFormPerfectMatchings+=normal.size;
 function match(rest,pairs){
  if(rest.length===0){
   stats.allPerfectMatchingsConsidered++;buck.matchings++;
   if(isRobust(m,pairs)){
    stats.releaseRobustPerfectMatchings++;buck.robust++;
    observed.add(key(pairs));
   }
   return;
  }
  for(let i=1;i<rest.length;i++){
   const next=rest.slice(1,i).concat(rest.slice(i+1));
   match(next,pairs.concat([[rest[0],rest[i]]]));
  }
 }
 match(future,[]);
 const diffAct=[...observed].filter(x=>!normal.has(x));
 const diffNom=[...normal].filter(x=>!observed.has(x));
 if(diffAct.length||diffNom.length){
  stats.mismatchingProfiles++;buck.mismatches++;
  stats.actualButNotNormalForm+=diffAct.length;stats.normalFormButNotActual+=diffNom.length;
  if(stats.counterexamples.length<12)stats.counterexamples.push({heights:m.map(x=>H-x),rem:m.slice(),robustNotNormal:diffAct.slice(0,2),normalNotRobust:diffNom.slice(0,2)});
 }
}
function iterate(col,total){
 if(col===W){evaluate(total);return;}
 for(let k=0;k<=Math.min(H,8-total);k++){m[col]=k;iterate(col+1,total+k);}
}
iterate(0,0);
if(stats.mismatchingProfiles)throw Error('CANDIDATE_FIXED_MATE_NORMAL_FORM_COUNTEREXAMPLE '+JSON.stringify(stats.counterexamples.slice(0,3)));
console.log(JSON.stringify(stats,null,2));

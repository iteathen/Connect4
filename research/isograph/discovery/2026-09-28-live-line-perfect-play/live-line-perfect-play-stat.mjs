import fs from 'node:fs';

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const CENTER=[4,3,5,2,6,1,7];
const lines=[];
for(let r=1;r<=H;r++)for(let c=1;c<=W;c++)for(const[dc,dr]of DIRS){
  const L=[]; let ok=true;
  for(let i=0;i<K;i++){const x=c+i*dc,y=r+i*dr;if(x<1||x>W||y<1||y>H){ok=false;break;}L.push([x,y]);}
  if(ok)lines.push(L);
}
if(lines.length!==69)throw new Error('geometry');
const key=(c,r)=>`${c},${r}`;
const through=new Map();
for(let c=1;c<=W;c++)for(let r=1;r<=H;r++)through.set(key(c,r),[]);
lines.forEach((L,i)=>L.forEach(([c,r])=>through.get(key(c,r)).push(i)));

// Qualified zero-reservation CPC baseline for standard 7x6:
// physical odd rows -> P0, physical even rows -> P1.
const q0Owner=physicalRow=>((physicalRow-1)&1);

function parse(path){
  return fs.readFileSync(path,'utf8').trim().split(/\n/).filter(Boolean).map(row=>{
    const a=row.split('\t');
    return {group:a[0],sourceSet:a[1],sourceLine:+a[2],sequence:a[3],oracleScore:+a[4],moveScores:a[5].split(',').map(Number)};
  });
}
function enrich(rec){
  const occ=[new Set(),new Set()],heights=Array(W+1).fill(0);
  for(let ply=0;ply<rec.sequence.length;ply++){const c=+rec.sequence[ply],r=++heights[c];occ[ply&1].add(key(c,r));}
  const stm=rec.sequence.length&1,opp=stm^1,features=[];
  for(let c=1;c<=W;c++){
    if(heights[c]>=H||rec.moveScores[c-1]===-1000){features.push(null);continue;}
    const r=heights[c]+1;
    let ownMat=0,blockMat=0,win=0,threat=0;
    let ownAligned=0,blockAligned=0,ownMisaligned=0,blockMisaligned=0;
    let ownParityProduct=0,blockParityProduct=0,ownAllAligned=0,blockAllAligned=0;
    for(const li of through.get(key(c,r))){
      const L=lines[li]; let ownN=0,oppN=0; const empty=[];
      for(const[x,y]of L){const k=key(x,y);if(occ[stm].has(k))ownN++;else if(occ[opp].has(k))oppN++;else empty.push([x,y]);}
      if(oppN===0){
        const weight=2**ownN; ownMat+=weight; if(ownN===3)win++;
        const rem=empty.filter(([x,y])=>!(x===c&&y===r));
        const aligned=rem.filter(([,y])=>q0Owner(y)===stm).length,mis=rem.length-aligned;
        ownAligned+=weight*aligned; ownMisaligned+=weight*mis;
        ownParityProduct+=weight*(aligned+1)/(rem.length+1);
        if(mis===0)ownAllAligned+=weight;
      }
      if(ownN===0){
        const weight=2**oppN; blockMat+=weight; if(oppN===3)threat++;
        const rem=empty.filter(([x,y])=>!(x===c&&y===r));
        const aligned=rem.filter(([,y])=>q0Owner(y)===opp).length,mis=rem.length-aligned;
        blockAligned+=weight*aligned; blockMisaligned+=weight*mis;
        blockParityProduct+=weight*(aligned+1)/(rem.length+1);
        if(mis===0)blockAllAligned+=weight;
      }
    }
    features.push({c,ownMat,blockMat,win,threat,ownAligned,blockAligned,ownMisaligned,blockMisaligned,
      ownParityProduct,blockParityProduct,ownAllAligned,blockAllAligned});
  }
  const wins=features.filter(Boolean).filter(f=>f.win).length;
  const threats=features.filter(Boolean).filter(f=>f.threat).length;
  return {...rec,features,kind:wins?'own-win':threats===1?'forced-block':threats>1?'multi':'quiet'};
}
function bestSet(r){const m=Math.max(...r.moveScores.filter(v=>v!==-1000));return new Set(r.moveScores.map((v,i)=>v===m?i+1:null).filter(Boolean));}
function eligible(r){
  let xs=r.features.filter(Boolean);
  const wins=xs.filter(f=>f.win); if(wins.length)return wins;
  const blocks=xs.filter(f=>f.threat); if(blocks.length===1)return blocks;
  return xs;
}
const scores={
  liveTotal:f=>f.ownMat+f.blockMat,
  parityAlignedTotal:f=>f.ownAligned+f.blockAligned,
  parityNetTotal:f=>(f.ownAligned-f.ownMisaligned)+(f.blockAligned-f.blockMisaligned),
  parityProductTotal:f=>f.ownParityProduct+f.blockParityProduct,
  livePlusParityAligned:f=>f.ownMat+f.blockMat+f.ownAligned+f.blockAligned,
  livePlusParityNet:f=>f.ownMat+f.blockMat+(f.ownAligned-f.ownMisaligned)+(f.blockAligned-f.blockMisaligned),
  livePlusAllAligned:f=>f.ownMat+f.blockMat+f.ownAllAligned+f.blockAllAligned
};
function metric(data,score){
  let exact=0,contains=0,wdl=0,ties=0;
  for(const r of data){
    const xs=eligible(r); let max=-Infinity,top=[];
    for(const f of xs){const s=score(f);if(s>max){max=s;top=[f.c];}else if(s===max)top.push(f.c);}
    const pick=CENTER.find(c=>top.includes(c)),best=bestSet(r);
    exact+=best.has(pick); contains+=top.some(c=>best.has(c)); ties+=top.length;
    const ps=Math.sign(r.oracleScore),cs=Math.sign(r.moveScores[pick-1]);wdl+=(ps===0?cs===0:ps===cs);
  }
  return {n:data.length,exactBest:exact/data.length,topContainsBest:contains/data.length,wdlPreserving:wdl/data.length,avgTie:ties/data.length};
}
function report(data){return Object.fromEntries(Object.entries(scores).map(([k,v])=>[k,metric(data,v)]));}
const calibration=parse('reference/oracles/solved-actions-v1.tsv').map(enrich);
const beginning=parse('reference/oracles/beginning-spotchecks-v1.tsv').map(enrich);
console.log(JSON.stringify({
  schema:'connect4.live-line-perfect-play-stat.v1',
  boundary:{
    solvedLabelsUsedForValidation:true,
    solvedLabelsUsedToDefineFeatures:false,
    target44UsedToTuneFeatures:false,
    featureInputs:['7x6 geometry','current occupancy','gravity','side to move','zero-reservation CPC row parity']
  },
  calibration:{all:report(calibration),quiet:report(calibration.filter(x=>x.kind==='quiet'))},
  beginningSpotcheck:{all:report(beginning),quiet:report(beginning.filter(x=>x.kind==='quiet'))},
  note:'Beginning spotcheck corpus is explicitly nonrepresentative; see its metadata.'
},null,2));

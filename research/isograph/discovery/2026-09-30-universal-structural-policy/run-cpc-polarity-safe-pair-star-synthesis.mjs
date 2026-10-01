#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

const W=7,H=6,K=4,DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const key=(x,y)=>x+','+y,id=(x,y)=>y*W+x,named=cell=>({column:(cell%W)+1,row:Math.floor(cell/W)+1});
function lines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([cx,cy])=>cx>=0&&cx<W&&cy>=0&&cy<H))out.push(cells);
  }
  return out;
}
const LINES=lines();
function empty(){return {heights:Array(W).fill(0),stones:[new Set(),new Set()],rank:0,mover:0,win:false};}
function ownsLine(S,L){return L.every(([x,y])=>S.has(key(x,y)));}
function legal(P){return Array.from({length:W},(_,c)=>c).filter(c=>P.heights[c]<H);}
function apply(P,c){
  assert(P.heights[c]<H);
  const heights=P.heights.slice(),stones=[new Set(P.stones[0]),new Set(P.stones[1])];
  const playedBy=P.mover,y=heights[c]++;
  stones[playedBy].add(key(c,y));
  const win=LINES.some(L=>ownsLine(stones[playedBy],L));
  return {heights,stones,rank:P.rank+1,mover:1-playedBy,playedBy,landing:[c,y],win};
}
function position(sequence){
  let P=empty();
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1;
    assert(Number.isInteger(c)&&c>=0&&c<W&&P.heights[c]<H);
    const Q=apply(P,c);
    assert(!Q.win||i+1===sequence.length,'prior terminal');
    P=Q;
  }
  return P;
}
function winningFrontier(P,player){
  const out=[];
  for(const c of legal(P)){
    const S=new Set(P.stones[player]);
    S.add(key(c,P.heights[c]));
    if(LINES.some(L=>ownsLine(S,L)))out.push(c);
  }
  return out;
}
function normalizeResiduals(xs){
  const uniq=[],seen=new Set();
  for(const cells of xs){
    const a=[...cells].sort((a,b)=>a-b),s=a.join(',');
    if(!seen.has(s)){seen.add(s);uniq.push(a);}
  }
  uniq.sort((a,b)=>a.length-b.length||a.join(',').localeCompare(b.join(',')));
  const out=[];
  outer:for(const a of uniq){
    for(const b of out)if(b.length<=a.length&&b.every(x=>a.includes(x)))continue outer;
    out.push(a);
  }
  return out;
}
function liveResiduals(P,player){
  const opp=1-player,out=[];
  for(const L of LINES){
    if(L.some(([x,y])=>P.stones[opp].has(key(x,y))))continue;
    const missing=L.filter(([x,y])=>!P.stones[player].has(key(x,y))).map(([x,y])=>id(x,y));
    if(missing.length)out.push(missing);
  }
  return normalizeResiduals(out);
}
function pairAdjacency(P,player){
  const adj=new Map();
  for(const r of liveResiduals(P,player)){
    if(r.length!==2)continue;
    const [a,b]=r;
    if(!adj.has(a))adj.set(a,new Set());
    if(!adj.has(b))adj.set(b,new Set());
    adj.get(a).add(b);adj.get(b).add(a);
  }
  return adj;
}
function combinations2(xs){
  const out=[];
  for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)out.push([xs[i],xs[j]]);
  return out;
}
function findStars(P){
  const adj=pairAdjacency(P,P.mover),out=[];
  for(let c=0;c<W;c++)for(let row=P.heights[c];row+1<H;row++){
    const depth=row-P.heights[c];if(depth>1)break;
    const h=id(c,row),hp=id(c,row+1);
    const lower=[...(adj.get(h)??[])].filter(x=>x!==hp);
    const upper=[...(adj.get(hp)??[])].filter(x=>x!==h);
    if(lower.length<2||upper.length<2)continue;
    for(const [x,y] of combinations2(lower))for(const [u,v] of combinations2(upper))
      out.push({column:c,row,depth,hub:h,upperHub:hp,x,y,u,v});
  }
  return out;
}
function singletonSet(P,player){return new Set(liveResiduals(P,player).filter(r=>r.length===1).map(r=>r[0]));}

function moves(s){return Array.from(s,c=>Number(c)-1);}
function evalCpc(sequence,attacker){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  const interval=[scratch.interval[0]-2,scratch.interval[1]-2],attackerValue=attacker===0?1:-1;
  let exactPolarity='UNRESOLVED';
  if(kind===CPC_EXACT){
    if(interval[0]===attackerValue)exactPolarity='ATTACKER';
    else if(interval[0]===0)exactPolarity='DRAW';
    else exactPolarity='DEFENDER';
  }
  return {
    kind:KIND.get(kind),interval,exactPolarity,
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask32:scratch.preemptionMask32[0]>>>0,
  };
}
function cpcAllowedReplies(P,sequence,attacker){
  const c=evalCpc(sequence,attacker);
  if(c.kind==='CPC_EXACT')return {cpc:c,replies:[],closed:c.exactPolarity};
  if(c.kind==='CPC_RESTRICT'&&c.preemptionCount>0){
    const replies=legal(P).filter(col=>(c.preemptionMask32&(1<<col))!==0);
    return {cpc:c,replies,closed:null};
  }
  return {cpc:c,replies:legal(P),closed:null};
}

function starEndpoints(P,sequence,star){
  const attacker=P.mover,defender=1-attacker,c=star.column,endpoints=[];
  if(star.depth===0){
    const A=apply(P,c);
    if(A.win)return {valid:true,guard:true,endpoints:[{sequence:sequence+String(c+1),terminal:true}]};
    const singles=singletonSet(A,attacker);
    if(!(singles.has(star.x)&&singles.has(star.y)))return {valid:false,guard:true,endpoints:[]};
    endpoints.push({sequence:sequence+String(c+1),terminal:false});
    return {valid:true,guard:true,endpoints};
  }

  const S=apply(P,c);
  const supportSequence=sequence+String(c+1);
  if(S.win)return {valid:true,guard:true,endpoints:[{sequence:supportSequence,terminal:true}]};
  if(winningFrontier(S,defender).length)return {valid:false,guard:false,endpoints:[]};

  for(const d of legal(S)){
    const D=apply(S,d);
    if(D.win)return {valid:false,guard:false,endpoints:[]};
    const ds=supportSequence+String(d+1);
    if(d===c){
      const A=apply(D,c);
      const as=ds+String(c+1);
      if(!A.win){
        const singles=singletonSet(A,attacker);
        if(!(singles.has(star.u)&&singles.has(star.v)))return {valid:false,guard:true,endpoints:[]};
      }
      endpoints.push({sequence:as,terminal:A.win,defenderReply:d+1});
    }else{
      const A=apply(D,c);
      const as=ds+String(c+1);
      if(!A.win){
        const singles=singletonSet(A,attacker);
        if(![star.x,star.y].some(x=>singles.has(x)))return {valid:false,guard:true,endpoints:[]};
      }
      endpoints.push({sequence:as,terminal:A.win,defenderReply:d+1});
    }
  }
  return {valid:true,guard:true,endpoints};
}

function classifyStar(P,sequence,star){
  const attacker=P.mover,e=starEndpoints(P,sequence,star);
  if(!e.valid)return {...e,polaritySafe:false,cpcClosed:false,endpointCpc:[]};
  const endpointCpc=e.endpoints.map(ep=>({
    ...ep,
    cpc:ep.terminal?{kind:'TERMINAL',exactPolarity:'ATTACKER'}:evalCpc(ep.sequence,attacker)
  }));
  const polaritySafe=endpointCpc.every(ep=>ep.cpc.exactPolarity!=='DEFENDER'&&ep.cpc.exactPolarity!=='DRAW');
  const cpcClosed=polaritySafe&&endpointCpc.every(ep=>
    ep.cpc.kind==='TERMINAL'||ep.cpc.kind==='CPC_EXACT'||ep.cpc.kind==='CPC_RESTRICT'
  );
  return {...e,polaritySafe,cpcClosed,endpointCpc};
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];
const rows=[];
for(const root of roots){
  const P=position(root.sequence),attacker=P.mover,setups=[];
  for(const a of legal(P)){
    const A=apply(P,a),aseq=root.sequence+String(a+1);
    if(A.win){
      setups.push({setupColumn:a+1,postSetup:'ATTACKER_TERMINAL',robust:true,replies:[]});
      continue;
    }
    const allowed=cpcAllowedReplies(A,aseq,attacker);
    if(allowed.closed){
      setups.push({
        setupColumn:a+1,
        postSetupCpc:allowed.cpc,
        postSetupClosed:allowed.closed,
        robust:allowed.closed==='ATTACKER',
        replies:[]
      });
      continue;
    }
    const replies=[];
    let robust=true;
    for(const d of allowed.replies){
      const D=apply(A,d),dseq=aseq+String(d+1);
      if(D.win){
        replies.push({defenderReply:d+1,defenderTerminal:true,stars:[],hasPolaritySafeStar:false});
        robust=false;continue;
      }
      const stars=findStars(D).map(star=>{
        const c=classifyStar(D,dseq,star);
        return {
          hub:named(star.hub),upperHub:named(star.upperHub),depth:star.depth,
          leaves:{lower:[named(star.x),named(star.y)],upper:[named(star.u),named(star.v)]},
          guard:c.guard,
          polaritySafe:c.polaritySafe,
          cpcClosed:c.cpcClosed,
          endpoints:c.endpointCpc?.map(ep=>({
            defenderReply:ep.defenderReply??null,
            terminal:ep.terminal,
            kind:ep.cpc.kind,
            polarity:ep.cpc.exactPolarity,
            forced:ep.cpc.forcedColumn??null
          }))??[]
        };
      });
      const safe=stars.filter(s=>s.polaritySafe);
      replies.push({
        defenderReply:d+1,
        starCount:stars.length,
        polaritySafeStarCount:safe.length,
        cpcClosedStarCount:safe.filter(s=>s.cpcClosed).length,
        hasPolaritySafeStar:safe.length>0,
        stars:safe.slice(0,4)
      });
      if(!safe.length)robust=false;
    }
    setups.push({
      setupColumn:a+1,
      postSetupCpc:allowed.cpc,
      defenderReplyColumns:allowed.replies.map(x=>x+1),
      robust,
      replies
    });
  }
  rows.push({id:root.id,sequence:root.sequence,attacker:attacker+1,setups});
}

console.log(JSON.stringify({
  schema:'connect4.cpc_polarity_safe_pair_star_synthesis.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  rows,
  summary:rows.map(r=>({
    id:r.id,
    robustSetups:r.setups.filter(s=>s.robust).map(s=>s.setupColumn),
    setupSummary:r.setups.map(s=>({
      setup:s.setupColumn,
      robust:s.robust,
      postSetupClosed:s.postSetupClosed??null,
      replyCount:s.replies.length,
      repliesWithSafeStar:s.replies.filter(x=>x.hasPolaritySafeStar).length
    }))
  })),
  boundary:[
    'This is theorem-discovery synthesis on consumed training evidence, not a promoted proof rule.',
    'A polarity-safe pair-star means every endpoint avoids CPC-exact defender/draw closure; unresolved/restricted endpoints may still require later proof.',
    'No oracle value is used.'
  ]
},null,2));

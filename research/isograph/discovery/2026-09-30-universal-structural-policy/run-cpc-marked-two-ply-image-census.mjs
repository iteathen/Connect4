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
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,prepareConnect4CpcScratch,evaluateConnect4Cpc32}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

const moveArray=s=>Array.from(s,c=>Number(c)-1);
function qstate(sequence){return connect4RbaFromMoves(moveArray(sequence),{geometry:g,canonical:false});}
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function minimalBySize(q,player){
  const base=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,base,i))active.push(q.basis[i]);
  const minimal=active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
  const hist={};
  for(const id of minimal)hist[g.shapeSize[id]]=(hist[g.shapeSize[id]]??0)+1;
  return {active:active.length,minimal:minimal.length,hist};
}
function evalCpc(sequence){
  const q=qstate(sequence),rank=q.words[g.metaOffset]>>>2,mover=rank&1;
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  return {
    sequence,q,rank,mover,terminal:q.words[g.metaOffset]&3,
    kind,kindName:KIND.get(kind),
    interval:[scratch.interval[0]-2,scratch.interval[1]-2],
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask:scratch.preemptionMask32[0]>>>0,
    precursorCount:scratch.precursorCount[0],
  };
}
function summary(e,attacker){
  const m=minimalBySize(e.q,attacker);
  return {
    sequence:e.sequence,rank:e.rank,mover:e.mover+1,terminalCode:e.terminal,
    kind:e.kindName,absoluteInterval:e.interval,
    forcedColumn:e.forcedColumn===null?null:e.forcedColumn+1,
    preemptionCount:e.preemptionCount,preemptionMask32:e.preemptionMask,
    precursorCount:e.precursorCount,
    attackerResiduals:m,
  };
}
function admissibleDefenderReplies(postSetup,attacker){
  if(postSetup.terminal!==0)return [];
  const attackerValue=attacker===0?1:-1;
  if(postSetup.kind===CPC_EXACT && postSetup.interval[0]===attackerValue && postSetup.interval[1]===attackerValue){
    return [];
  }
  if(postSetup.kind===CPC_RESTRICT && postSetup.forcedColumn!==null){
    return [postSetup.forcedColumn];
  }
  return legal(postSetup.q);
}

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];

const rows=[];
for(const root of roots){
  const base=qstate(root.sequence),attacker=(base.words[g.metaOffset]>>>2)&1;
  const setups=[];
  for(const a of legal(base)){
    const post=evalCpc(root.sequence+String(a+1));
    const attackerValue=attacker===0?1:-1;
    const postAlreadyCertified=post.terminal!==0 ||
      (post.kind===CPC_EXACT && post.interval[0]===attackerValue && post.interval[1]===attackerValue);
    const replies=admissibleDefenderReplies(post,attacker);
    const children=[];
    for(const r of replies){
      const child=evalCpc(post.sequence+String(r+1));
      children.push(summary(child,attacker));
    }
    const allChildrenExactAttackerWin=children.length>0&&children.every(x=>
      x.terminalCode!==0 ||
      (x.kind==='CPC_EXACT'&&x.absoluteInterval[0]===attackerValue&&x.absoluteInterval[1]===attackerValue)
    );
    const allChildrenRestrictedOrExact=children.length>0&&children.every(x=>
      x.terminalCode!==0||x.kind==='CPC_EXACT'||x.kind==='CPC_RESTRICT'
    );
    const commonKind=children.length&&children.every(x=>x.kind===children[0].kind)?children[0].kind:null;
    const commonPrecursorCount=children.length&&children.every(x=>x.precursorCount===children[0].precursorCount)?children[0].precursorCount:null;
    setups.push({
      setupColumn:a+1,
      postSetup:summary(post,attacker),
      postAlreadyCertified,
      admissibleDefenderReplyColumns:replies.map(c=>c+1),
      defenderResponses:children,
      branchSummary:{
        replyCount:children.length,
        allChildrenExactAttackerWin,
        allChildrenRestrictedOrExact,
        commonKind,
        commonPrecursorCount,
        minAttackerPairResiduals:children.length?Math.min(...children.map(x=>x.attackerResiduals.hist['2']??0)):null,
        maxAttackerPairResiduals:children.length?Math.max(...children.map(x=>x.attackerResiduals.hist['2']??0)):null,
        minAttackerTripleResiduals:children.length?Math.min(...children.map(x=>x.attackerResiduals.hist['3']??0)):null,
        maxAttackerTripleResiduals:children.length?Math.max(...children.map(x=>x.attackerResiduals.hist['3']??0)):null,
      }
    });
  }
  rows.push({...root,attacker:attacker+1,setups});
}

console.log(JSON.stringify({
  schema:'connect4.cpc_marked_two_ply_image_census.v1',
  createdAt:new Date().toISOString(),
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  proofAuthority:false,
  purpose:'theorem discovery only: attacker setup followed by CPC-admissible defender responses; no recursive expansion and no move-selection conclusion',
  rows,
  boundary:[
    'This census is not itself a runtime theorem or proof premise.',
    'Any useful common successor property must be re-derived as a current-state CPC consequence before promotion.',
    'CPC restrictions are honored exactly; CPC_NONE/BOUND states retain every legal defender reply.'
  ]
},null,2));
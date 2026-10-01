#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {connect4CpcTargetOwner32}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);

const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const C1=0,C5=4;
const C5R3=2*g.columns+4;
const C3R5=4*g.columns+2;
const C5R5=4*g.columns+4;
const sequence='444441566666232222423317757';

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function shapeHasCell(id,cell){
  const n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}
function shapeEqualsPair(id,a,b){
  if(g.shapeSize[id]!==2)return false;
  const base=id*4,x=g.shapeCells[base],y=g.shapeCells[base+1];
  return (x===a&&y===b)||(x===b&&y===a);
}
function hasActivePair(q,player,a,b){
  return activeIds(q,player).some(id=>shapeEqualsPair(id,a,b));
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({id,cell,column:c+1,row:r+1});
  }
  return out;
}

function synthesizeTargetCertificate(q,targetColumn,targetRow){
  const target=targetRow*g.columns+targetColumn;

  function coverageWitness(id,partner,length){
    const n=g.shapeSize[id],base=id*4;
    for(let j=0;j<n;j++){
      const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
      if(c===targetColumn&&r>targetRow)
        return {kind:'post-target-deferral',cell,column:c+1,row:r+1};
    }
    for(let j=0;j<n;j++){
      const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell],
        depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
      if(depth<0)continue;
      if(depth>=L+1&&((depth-(L+1))&1)===0)
        return {kind:'vertical-response',cell,column:c+1,row:r+1};
      if(p>=0&&depth<L){
        const mate=(q.words[p]+depth)*g.columns+p;
        if(shapeHasCell(id,mate))
          return {kind:'cross-pair',cells:[cell,mate],columns:[c+1,p+1],depth,L};
      }
    }
    return null;
  }

  function buildPairMap(capacity,partner,length){
    const mate=new Int32Array(g.cellCount);mate.fill(-1);
    const role=new Uint8Array(g.cellCount);
    for(let c=0;c<7;c++){
      const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
      if(p>=0&&c<p){
        const hp=q.words[p];
        for(let d=0;d<L;d++){
          const a=(h+d)*7+c,b=(hp+d)*7+p;
          mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
        }
      }
      for(let d=L;d<cap;d+=2){
        if(d+1>=cap)throw new Error('odd vertical tail');
        const lo=(h+d)*7+c,hi=(h+d+1)*7+c;
        mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
      }
    }
    return {mate,role};
  }

  if(!hasActiveSingleton(q,P1,target))return null;
  if(connect4CpcTargetOwner32(g,q.words,0,target)!==P1)return null;
  const targetDepth=targetRow-q.words[targetColumn];
  if(targetDepth<=0)return null;
  if(playableSingletons(q,P2).length)return null;

  const capacity=new Uint32Array(7),odd=[];
  let total=0;
  for(let c=0;c<7;c++){
    const cap=c===targetColumn?targetRow-q.words[c]+1:6-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;

  const defenderIds=activeIds(q,P2);
  const partner=new Int32Array(7);partner.fill(-1);
  const length=new Uint32Array(7);
  let found=null;

  function evaluate(){
    const targetL=partner[targetColumn]>=0?length[targetColumn]:0;
    const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(id,partner,length);
      if(!witness)return null;
      coverage.push({residualId:id,size:g.shapeSize[id],containsTarget:shapeHasCell(id,target),witness});
    }
    const pairs=[];
    for(let c=0;c<7;c++)if(partner[c]>=0&&c<partner[c])
      pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(capacity,partner,length);
    return {
      target:{column:targetColumn+1,row:targetRow+1,cell:target},
      capacity:Array.from(capacity),
      oddColumns:odd.map(c=>c+1),
      synchronizedPairs:pairs,
      targetIsResponse,
      targetDepth,
      targetPrefixLength:targetL,
      defenderResidualCount:defenderIds.length,
      coverage,
      mate:Array.from(map.mate),
      role:Array.from(map.role),
    };
  }

  function rec(pending){
    if(found)return;
    if(!pending.length){found=evaluate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===targetColumn||b===targetColumn)&&L>=capacity[targetColumn])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}

function validateTargetCertificate(q,template){
  const target=template.target.cell;
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;

  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(((state.words[g.metaOffset]>>>2)&1)!==P2){
      failures.push({kind:'wrong-mover',support:support(state)});return;
    }
    let legal=0;
    for(let c=0;c<7;c++){
      if(state.words[c]>=6)continue;
      legal++;
      const row=state.words[c],cell=row*7+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r});continue;
      }
      const d=step(state,c);
      if(d.terminal===P2_WIN){
        failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;
      }
      if(d.terminal){
        failures.push({kind:'other-defender-terminal',terminal:d.terminal});continue;
      }
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){
        failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;
      }
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){
        p1Terminals++;
        if(m===target)targetTerminals++;
        continue;
      }
      if(a.terminal){
        failures.push({kind:'other-response-terminal',terminal:a.terminal});continue;
      }
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }

  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,
    failures:failures.slice(0,20),
  };
}

const state=fromSequence(sequence);
assert.equal(state.terminal,0);
assert.equal(state.words[g.metaOffset]>>>2,27);
assert.equal((state.words[g.metaOffset]>>>2)&1,P2);
assert.deepEqual(support(state),[2,6,3,6,2,5,3]);

const c5r5Singleton=hasActiveSingleton(state,P1,C5R5);
const obstructionPresent=hasActivePair(state,P2,C5R3,C3R5);
assert(c5r5Singleton);
assert(obstructionPresent);

const legalDefenderReplies=[];
const rows=[];
for(let d=0;d<7;d++){
  if(state.words[d]>=6)continue;
  legalDefenderReplies.push(d+1);
  const reply=step(state,d);

  if(d===C5){
    const p1=reply.terminal===0&&reply.words[C1]<6?step(reply,C1):null;
    const c3r5P1Singleton=!!p1&&p1.terminal===0&&hasActiveSingleton(p1,P1,C3R5);
    const defenderPlayableSingletons=!!p1&&p1.terminal===0?playableSingletons(p1,P2):[];
    const template=
      !!p1&&p1.terminal===0&&c3r5P1Singleton&&defenderPlayableSingletons.length===0
        ?synthesizeTargetCertificate(p1,2,4)
        :null;
    const validation=template?validateTargetCertificate(p1,template):null;
    rows.push({
      defenderColumn:d+1,
      replyTerminal:reply.terminal,
      kind:'contested-c3-target',
      p1MoveColumn:1,
      p1MoveTerminal:p1?.terminal??null,
      supportAfterP1:p1?support(p1):null,
      c3r5P1Singleton,
      c3r5ActiveForP2:!!p1&&p1.terminal===0&&activeIds(p1,P2).some(id=>shapeHasCell(id,C3R5)),
      defenderPlayableSingletons,
      targetTemplate:template?{
        target:template.target,
        capacity:template.capacity,
        oddColumns:template.oddColumns,
        synchronizedPairs:template.synchronizedPairs,
        targetIsResponse:template.targetIsResponse,
        defenderResidualCount:template.defenderResidualCount,
        coverage:template.coverage,
      }:null,
      validation,
      accept:
        reply.terminal===0&&
        !!p1&&p1.terminal===0&&
        c3r5P1Singleton&&
        defenderPlayableSingletons.length===0&&
        !!template&&template.targetIsResponse===true&&
        !!validation?.pass,
    });
    continue;
  }

  const p1=reply.terminal===0&&reply.words[C5]<6?step(reply,C5):null;
  const obstructionPresentAfterBlock=
    !!p1&&p1.terminal===0&&hasActivePair(p1,P2,C5R3,C3R5);
  const targetActive=
    !!p1&&p1.terminal===0&&hasActiveSingleton(p1,P1,C5R5);
  const defenderPlayableSingletons=!!p1&&p1.terminal===0?playableSingletons(p1,P2):[];
  const template=
    !!p1&&p1.terminal===0&&!obstructionPresentAfterBlock&&targetActive&&defenderPlayableSingletons.length===0
      ?synthesizeTargetCertificate(p1,4,4)
      :null;
  const validation=template?validateTargetCertificate(p1,template):null;

  rows.push({
    defenderColumn:d+1,
    replyTerminal:reply.terminal,
    kind:'c5-endpoint-block',
    p1MoveColumn:5,
    p1MoveTerminal:p1?.terminal??null,
    supportAfterP1:p1?support(p1):null,
    obstructionPresentAfterBlock,
    c5r5Singleton:targetActive,
    defenderPlayableSingletons,
    targetTemplate:template?{
      target:template.target,
      capacity:template.capacity,
      oddColumns:template.oddColumns,
      synchronizedPairs:template.synchronizedPairs,
      targetIsResponse:template.targetIsResponse,
      defenderResidualCount:template.defenderResidualCount,
      coverage:template.coverage,
    }:null,
    validation,
    accept:
      reply.terminal===0&&
      !!p1&&p1.terminal===0&&
      !obstructionPresentAfterBlock&&
      targetActive&&
      defenderPlayableSingletons.length===0&&
      !!template&&template.targetIsResponse===true&&
      !!validation?.pass,
  });
}

const accept=
  legalDefenderReplies.length===rows.length&&
  rows.every(x=>x.accept===true);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank27_c5_obstruction_endpoint_handoff.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_RANK27_C5_OBSTRUCTION_ENDPOINT_HANDOFF_THEOREM.md',
  state:{
    sequence,
    rank:27,
    mover:2,
    support:support(state),
    c5r5Singleton,
    obstruction:{
      cells:[
        {column:5,row:3,cell:C5R3},
        {column:3,row:5,cell:C3R5},
      ],
      obstructionPresent,
    },
    obstructionPresent,
  },
  legalDefenderReplies,
  rows,
  accept,
  conclusion:accept?[
    'The exact rank-27 c5r5 obstruction state is a Player-1 win.',
    'Every non-c5 defender reply is closed by P1:c5 occupying the live c5r3 endpoint, deleting the sole uncovered obstruction, and re-entering a freshly synthesized c5r5 target-reservoir certificate.',
    'The contested P2:c5 reply is closed by P1:c1 contraction to singleton c3r5 and a fresh response-assigned c3r5 target-reservoir certificate that covers every active defender residual.',
    'Together with the qualified rank-27 c7-taken composition, every defender reply after the rank-24 structural P1:c7 candidate is now closed without solved-value premises.'
  ]:[
    'At least one frozen endpoint-block or contested-target premise failed; the rank-27 composition theorem is rejected or requires narrowing.'
  ],
  boundary:[
    'All state transitions use exact RBA cofactors and each target-reservoir template is freshly synthesized on its exact current state.',
    'The contested target remains part of the active defender residual family and is covered only if the finite response law assigns it to Player 1 before defender completion.',
    'No oracle, Pons, solved W/D/L input, local game-tree value, minimax, best-move table, physical-position identity, BSFP solved frontier, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));

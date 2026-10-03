import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  compileCpcxPostActionWingAttack,
  classifyCpcxWingDeviation,
} from './cpcx-wing.mjs';
import {
  buildCpcxQCarrier,
  keyCpcxQCarrier,
  permuteCpcxQCarrier,
  canonicalizeCpcxQColumnOrbit,
} from './cpcx-q-quotient.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function play(position,cells){
  let p=position;
  for(const cell of cells){
    if(p.terminal)return null;
    const {column,row}=cpcxCell(g,cell);
    if(row!==p.heights[column]||p.owner[cell]!==-1)return null;
    p=applyCpcxForcedEvent(p,cell);
  }
  return p;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function compareArrays(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
  return a.length-b.length;
}
function normalizeFamily(family){
  return family.map(cells=>[...cells].sort((a,b)=>a-b))
    .sort((a,b)=>a.length-b.length||compareArrays(a,b));
}
function* permutations(n){
  const a=Array.from({length:n},(_,i)=>i);
  function* rec(k){
    if(k===n){yield [...a];return;}
    for(let i=k;i<n;i++){
      [a[k],a[i]]=[a[i],a[k]];
      yield* rec(k+1);
      [a[k],a[i]]=[a[i],a[k]];
    }
  }
  yield* rec(0);
}
function mapCell(cell,p){
  const column=cell%g.columns,row=Math.floor(cell/g.columns);
  return row*g.columns+p[column];
}
function supportAndMoverResidualKey(position){
  const q=buildCpcxQCarrier(position),
    mover=position.mover;
  let bestKey=null,bestPermutation=null,bestMappedOpponent=null;
  for(const p of permutations(g.columns)){
    const support=Array(g.columns).fill(0);
    for(let c=0;c<g.columns;c++)support[p[c]]=q.support[c];
    const moverResiduals=normalizeFamily(
      q.residuals[mover].map(cells=>cells.map(cell=>mapCell(cell,p)))
    );
    const opponentResiduals=normalizeFamily(
      q.residuals[mover^1].map(cells=>cells.map(cell=>mapCell(cell,p)))
    );
    const key=JSON.stringify({
      mover,
      rank:q.rank,
      support,
      moverResiduals,
    });
    if(bestKey===null||key<bestKey){
      bestKey=key;
      bestPermutation=[...p];
      bestMappedOpponent=opponentResiduals;
    }
  }
  return {
    key:bestKey,
    permutation:bestPermutation,
    mappedOpponentResiduals:bestMappedOpponent,
    q,
  };
}
function residualKey(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function diffFamilies(a,b){
  const A=new Map(a.map(x=>[residualKey(x),x])),
    B=new Map(b.map(x=>[residualKey(x),x]));
  return {
    onlyA:[...A].filter(([k])=>!B.has(k)).map(([,x])=>x),
    onlyB:[...B].filter(([k])=>!A.has(k)).map(([,x])=>x),
  };
}
function supportInfo(position,cells){
  return cells.map(cell=>{
    const {column,row}=cpcxCell(g,cell);
    return {
      cell:label(cell),
      column:column+1,
      row:row+1,
      supportDistance:row-position.heights[column],
      isFrontier:row===position.heights[column],
      isTop:row===g.rows-1,
    };
  });
}
function capSubset(position,cells){
  return cells.every(cell=>{
    const {column,row}=cpcxCell(g,cell);
    return row===g.rows-1&&position.heights[column]<g.rows;
  });
}

const states=[];
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells;

  for(const stolen of [t2,t3]){
    const theft=play(root,[sixthCell,t1,stolen]);
    if(!theft||theft.terminal)throw new Error('invalid theft');
    states.push({
      stage:'THEFT',
      sixthMove:sixthColumn+1,
      class:stolen===t2?'STEAL_TRIGGER_2':'STEAL_TRIGGER_3',
      detail:label(stolen),
      position:theft,
    });
  }

  const afterT1=play(root,[sixthCell,t1]);
  if(!afterT1||afterT1.terminal)throw new Error('invalid t1');
  for(const defenderCell of frontier(afterT1)){
    if(defenderCell===t2||defenderCell===t3)continue;
    const deviation=defenderCell===r1
      ?{stealsFutureTrigger:false}
      :classifyCpcxWingDeviation(wing,{
        decisionIndex:0,actualReplyCell:defenderCell,
      });
    if(deviation.stealsFutureTrigger)continue;
    const afterT2=play(afterT1,[defenderCell,t2]);
    if(!afterT2||afterT2.terminal)continue;
    const immediate=classifyCpcxImmediate(afterT2);
    if(immediate.kind!=='FORCED_RESPONSE'||immediate.cell!==t3)
      throw new Error('expected final block');
    const finalBlock=play(afterT2,[t3]);
    if(!finalBlock||finalBlock.terminal)
      throw new Error('invalid final block');
    states.push({
      stage:'FORCED_FINAL_BLOCK',
      sixthMove:sixthColumn+1,
      class:defenderCell===r1?'HONOR_FIRST_SUPPORT':'EXTERNAL_NONSTEAL',
      detail:label(defenderCell),
      position:finalBlock,
    });
  }
}

for(const row of states){
  const m=supportAndMoverResidualKey(row.position),
    qOrbit=canonicalizeCpcxQColumnOrbit(row.position);
  row.fullQKey=qOrbit.key;
  row.moverKey=m.key;
  row.moverPermutation=m.permutation;
  row.mappedOpponentResiduals=m.mappedOpponentResiduals;
  row.residualCounts=m.q.residuals.map(x=>x.length);
}

function analyzeStage(stage){
  const rows=states.filter(x=>x.stage===stage),
    full=new Map(),mover=new Map();
  for(const row of rows){
    if(!full.has(row.fullQKey))full.set(row.fullQKey,[]);
    full.get(row.fullQKey).push(row);
    if(!mover.has(row.moverKey))mover.set(row.moverKey,[]);
    mover.get(row.moverKey).push(row);
  }

  const moverClasses=[...mover.values()].map((members,i)=>{
    const base=members[0],
      diffs=members.slice(1).map(other=>{
        const d=diffFamilies(
          base.mappedOpponentResiduals,
          other.mappedOpponentResiduals
        );
        return {
          against:{
            sixthMove:other.sixthMove,
            class:other.class,
            detail:other.detail,
          },
          onlyBase:d.onlyA.map(cells=>({
            cells:cells.map(label),
            size:cells.length,
            support:supportInfo(base.position,cells),
            allTopCaps:capSubset(base.position,cells),
          })),
          onlyOther:d.onlyB.map(cells=>({
            cells:cells.map(label),
            size:cells.length,
            support:supportInfo(other.position,cells),
            allTopCaps:capSubset(other.position,cells),
          })),
        };
      });
    return {
      classId:`${stage}-M${i+1}`,
      members:members.map(x=>({
        sixthMove:x.sixthMove,
        class:x.class,
        detail:x.detail,
        residualCounts:x.residualCounts,
      })),
      fullQClassCount:new Set(members.map(x=>x.fullQKey)).size,
      opponentResidualDifferences:diffs,
    };
  }).sort((a,b)=>a.members[0].sixthMove-b.members[0].sixthMove);

  return {
    stage,
    stateCount:rows.length,
    fullQClassCount:full.size,
    supportPlusMoverResidualClassCount:mover.size,
    reductionIfOpponentResidualsIgnored:full.size-mover.size,
    moverClasses,
  };
}

const result=[
  analyzeStage('THEFT'),
  analyzeStage('FORCED_FINAL_BLOCK'),
];

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.opponent-residual-gap.v0_1',
  root:'44444',
  stages:result,
  summary:Object.fromEntries(result.map(x=>[
    x.stage,{
      states:x.stateCount,
      fullQClasses:x.fullQClassCount,
      moverCarrierClasses:x.supportPlusMoverResidualClassCount,
      potentialOpponentResidualMerges:
        x.reductionIfOpponentResidualsIgnored,
    },
  ])),
  premises:{
    standardBoard:'7x6',
    discoveryOnly:true,
    producerUsesSolvedData:false,
    comparison:'complete q_o versus support+mover-residual carrier under arbitrary column transporter',
    theoremProvenance:[
      'EARLIEST_MERGE_WITNESS_RESULT.md',
      'OPPONENT_RESIDUAL_DELETION_AUDIT.md',
      'OPPONENT_RESIDUAL_LITERAL_EQUIVALENCE_RESULT.md',
      'OPEN_CAP_TERMINAL_DOMINANCE_RESULT.md',
    ],
  },
  boundary:'ignoring opponent residuals is never itself sound. A coarser mover carrier is only a locator for candidate terminal-dominance obligations; every omitted opponent residual requires an independent rule-only first-terminal dominance proof before any quotient is promoted.',
},null,2));

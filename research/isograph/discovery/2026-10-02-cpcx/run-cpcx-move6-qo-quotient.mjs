import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  buildCpcxQCarrier,
  keyCpcxQCarrier,
  permuteCpcxQCarrier,
  canonicalizeCpcxQColumnOrbit,
  findCpcxQColumnTransporter,
} from './cpcx-q-quotient.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function legalColumns(position){
  const out=[];
  for(let c=0;c<g.columns;c++)if(position.heights[c]<g.rows)out.push(c);
  return out;
}

function verifyTransport(a,b,transporter){
  if(!transporter)return {exact:false,seam:'NO_TRANSPORTER'};
  const p=transporter.permutation,
    checks=[];
  for(const c of legalColumns(a)){
    const d=p[c];
    if(b.heights[d]>=g.rows)return {
      exact:false,seam:'TRANSPORTED_ACTION_ILLEGAL',column:c,mapped:d,
    };
    const ca=applyCpcxForcedEvent(
        a,a.heights[c]*g.columns+c
      ),
      cb=applyCpcxForcedEvent(
        b,b.heights[d]*g.columns+d
      );
    if((ca.terminal?.player??null)!==(cb.terminal?.player??null))return {
      exact:false,seam:'TRANSPORTED_TERMINAL_MISMATCH',column:c,mapped:d,
      aTerminal:ca.terminal,bTerminal:cb.terminal,
    };
    if(!ca.terminal&&!cb.terminal){
      const qa=permuteCpcxQCarrier(
          buildCpcxQCarrier(ca),p
        ),
        qb=buildCpcxQCarrier(cb);
      if(keyCpcxQCarrier(qa)!==keyCpcxQCarrier(qb))return {
        exact:false,seam:'TRANSPORTED_SUCCESSOR_Q_MISMATCH',
        column:c,mapped:d,
      };
    }
    checks.push({
      column:c+1,
      mappedColumn:d+1,
      terminalPlayer:ca.terminal?.player??null,
    });
  }
  return {
    exact:true,
    checkCount:checks.length,
    checks,
    proofRule:'one-step q_o transition commutation verified for every current legal action; qualified q_o rank induction supplies full future-game transport',
  };
}

const children=[];
for(let c=0;c<g.columns;c++){
  const cell=root.heights[c]*g.columns+c,
    p=applyCpcxForcedEvent(root,cell),
    q=buildCpcxQCarrier(p),
    orbit=canonicalizeCpcxQColumnOrbit(p);
  children.push({
    sixthMove:c+1,
    position:p,
    qKey:keyCpcxQCarrier(q),
    qCarrier:q,
    orbitKey:orbit.key,
    orbitPermutation:orbit.permutation.map(x=>x+1),
  });
}

function group(field){
  const m=new Map();
  for(const x of children){
    const k=x[field];
    if(!m.has(k))m.set(k,[]);
    m.get(k).push(x.sixthMove);
  }
  return [...m.entries()].map(([key,moves])=>({key,moves}))
    .sort((a,b)=>a.moves[0]-b.moves[0]);
}

const qoClasses=group('qKey'),
  orbitClasses=group('orbitKey'),
  pairwise=[];
for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
  if(children[i].orbitKey!==children[j].orbitKey)continue;
  const transporter=findCpcxQColumnTransporter(
      children[i].position,children[j].position
    ),
    verification=verifyTransport(
      children[i].position,children[j].position,transporter
    );
  pairwise.push({
    moves:[children[i].sixthMove,children[j].sixthMove],
    permutation:transporter?.permutation.map(x=>x+1)??null,
    exact:verification.exact,
    verification,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.qo-transporter-quotient.v0_1',
  root:'44444',
  q_o:{
    classCount:qoClasses.length,
    classes:qoClasses.map(x=>x.moves),
  },
  qColumnOrbit:{
    classCount:orbitClasses.length,
    classes:orbitClasses.map(x=>x.moves),
    allSevenEquivalent:orbitClasses.length===1,
  },
  children:children.map(x=>({
    sixthMove:x.sixthMove,
    support:Array.from(x.position.heights),
    qResidualCounts:x.qCarrier.residuals.map(r=>r.length),
    orbitPermutation:x.orbitPermutation,
  })),
  pairwiseTransportChecks:pairwise,
  allOrbitTransportChecksPass:pairwise.every(x=>x.exact),
  premises:{
    standardBoard:'7x6',
    q_oAuthority:'Q_CONGRUENCE_FINAL_QUALIFICATION_0_2',
    actionTransport:'exact column bijection of complete q_o carrier',
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
  boundary:'equal q_o column orbit proves ordinary future-game/value equivalence under transported action labels; it does not by itself transport non-q CPCX proof state',
},null,2));

import fs from 'node:fs';
import assert from 'node:assert/strict';

const Z='Z', E='E', O='O';

function zoe(n){
  assert.ok(Number.isInteger(n)&&n>=0);
  if(n===0)return Z;
  return (n&1)?O:E;
}

function pair(s){
  if(s===Z)return [0,0];
  if(s===E)return [1,0];
  if(s===O)return [1,1];
  throw new Error('bad ZOE state');
}

function fromPair(p,o){
  assert.ok(o===0||o===1);
  assert.ok(p===0||p===1);
  assert.ok(!(o&&!p));
  if(!p)return Z;
  return o?O:E;
}

function star(a,b){
  const [pa,oa]=pair(a),[pb,ob]=pair(b);
  return fromPair(pa|pb,oa^ob);
}

let zoeHomomorphismChecks=0;
for(let a=0;a<=128;a++)for(let b=0;b<=128;b++){
  assert.equal(zoe(a+b),star(zoe(a),zoe(b)));
  zoeHomomorphismChecks++;
}

let monoidChecks=0;
for(const a of [Z,E,O]){
  assert.equal(star(Z,a),a);
  assert.equal(star(a,Z),a);
  for(const b of [Z,E,O]){
    assert.equal(star(a,b),star(b,a));
    for(const c of [Z,E,O]){
      assert.equal(star(star(a,b),c),star(a,star(b,c)));
      monoidChecks++;
    }
  }
}
assert.equal(star(E,E),E);
assert.equal(star(O,O),E);
assert.equal(star(E,O),O);

let phaseChecks=0;
for(const H of [0,1]){
  for(const h of [0,1]){
    const k=H^h;
    assert.equal(k,H^h);
    for(const d of [0,1]){
      const row=h^d;
      assert.equal(row,H^k^d);

      // One move in the same column toggles frontier parity and relative-depth parity.
      const kp=k^1;
      const dp=d^1;
      assert.equal(k^d,kp^dp);
      assert.equal(H^k^d,H^kp^dp);
      phaseChecks++;
    }
  }
}

let rankContributionChecks=0;
// Repeating one descriptor's phase checksum n times contributes it iff n is odd.
for(const K of [0,1]){
  for(let n=0;n<=128;n++){
    let direct=0;
    for(let i=0;i<n;i++)direct^=K;
    const grouped=(n&1)?K:0;
    assert.equal(direct,grouped);
    assert.equal(grouped,zoe(n)===O?K:0);
    rankContributionChecks++;
  }
}

// Full rank-parity identity at the bit level for widths through 10 and both H parities.
let rankParityChecks=0;
for(let W=1;W<=10;W++){
  for(const H of [0,1]){
    const total=1<<W;
    for(let mask=0;mask<total;mask++){
      let rankParity=0;
      let kappaXor=0;
      for(let c=0;c<W;c++){
        const h=(mask>>>c)&1;
        rankParity^=h;
        kappaXor^=(H^h);
      }
      assert.equal(rankParity,((W*H)&1)^kappaXor);
      rankParityChecks++;
    }
  }
}

let absorptionChecks=0;
for(const s of [Z,E,O]){
  const [P,Q]=pair(s);
  assert.equal(P&Q,Q); // P_d O_d = O_d.
  absorptionChecks++;
}

// ANF identity for OR, showing representation degree is encoding-dependent.
let anfChecks=0;
for(const a of [0,1])for(const b of [0,1]){
  assert.equal(a|b,a^b^(a&b));
  anfChecks++;
}
for(const a of [0,1])for(const b of [0,1])for(const c of [0,1]){
  const anf=a^b^c^(a&b)^(a&c)^(b&c)^(a&b&c);
  assert.equal(a|b|c,anf);
  anfChecks++;
}

const result={
  schema:'connect4.isomax.isograph_full_decomposition_identity_check.v1',
  date_author_local:'2026-09-30',
  status:'PASS',
  outcomeIndependent:true,
  solvedOutcomesRead:false,
  checks:{
    zoeAdditiveHomomorphism:{pass:true,cases:zoeHomomorphismChecks},
    zoeCommutativeMonoid:{pass:true,cases:monoidChecks},
    rolePhaseRecodingAndMoveGauge:{pass:true,cases:phaseChecks},
    groupedDescriptorRankContribution:{pass:true,cases:rankContributionChecks},
    rankParityReconstruction:{pass:true,cases:rankParityChecks},
    binaryZoeAbsorption:{pass:true,cases:absorptionChecks},
    orToGf2AnfEncoding:{pass:true,cases:anfChecks}
  },
  verifiedIdentities:[
    'kappa = Hmod2 XOR hmod2',
    'rowmod2 = Hmod2 XOR kappa XOR dmod2',
    'move toggles kappa and d parity together for a surviving same-row cell',
    'ZOE(n+m) = ZOE(n) star ZOE(m) with star=(OR,XOR)',
    'descriptor phase checksum repeated n times depends only on n mod 2',
    'rankmod2 = (W*H mod2) XOR XOR_c kappa_c',
    'P_d AND O_d = O_d on valid ZOE states',
    'OR introduces higher GF(2) ANF degree under binary flattening'
  ],
  scopeGuard:[
    'These are algebraic/mechanical identities of the frozen representation.',
    'They do not prove repaired-coordinate Q-V sufficiency on standard 7x6.',
    'They do not prove T2 removal, exact-depth removal, Q-A, Q-F, or a closed scalar decoder.',
    'EW-RS-059 holdout outcomes are not read.'
  ]
};

fs.writeFileSync(
  new URL('./ISOGRAPH_FULL_DECOMPOSITION_IDENTITY_CHECK_0_1.json',import.meta.url),
  JSON.stringify(result,null,2)+'\n'
);

console.log(JSON.stringify(result,null,2));

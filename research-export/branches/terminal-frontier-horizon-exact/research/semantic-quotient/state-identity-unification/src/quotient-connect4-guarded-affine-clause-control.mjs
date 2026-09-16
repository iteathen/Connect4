#!/usr/bin/env node
import assert from 'node:assert/strict';

// Validation-only implementation control for the guarded affine + blocker-clause kernel.
// The symbolic research notes are theorem evidence; this executable exists to catch
// representation/algebra mistakes and must not be cited as proof of an unbounded claim.

class ParityDSU {
  constructor(n) {
    this.parent=Array.from({length:n},(_,i)=>i);
    this.size=Array(n).fill(1);
    this.parity=Array(n).fill(0); // q_i XOR q_parent
    this.fixed=Array(n).fill(null); // absolute q_root when anchored
    this.conflict=false;
  }

  find(x) {
    if(this.parent[x]===x)return [x,0];
    const p=this.parent[x];
    const [r,pp]=this.find(p);
    const px=this.parity[x]^pp;
    this.parent[x]=r;
    this.parity[x]=px;
    return [r,px];
  }

  anchor(x,b) {
    const [r,p]=this.find(x);
    const want=b^p;
    if(this.fixed[r]===null){this.fixed[r]=want;return true;}
    if(this.fixed[r]!==want)this.conflict=true;
    return false;
  }

  union(x,y,b) { // q_x XOR q_y = b
    let [rx,px]=this.find(x),[ry,py]=this.find(y);
    if(rx===ry){if((px^py)!==b)this.conflict=true;return false;}
    const rel=b^px^py; // q_rx XOR q_ry
    if(this.size[rx]<this.size[ry])[rx,ry]=[ry,rx];
    const fx=this.fixed[rx],fy=this.fixed[ry];
    this.parent[ry]=rx;
    this.parity[ry]=rel;
    this.size[rx]+=this.size[ry];
    if(fx!==null&&fy!==null){if((fx^fy)!==rel)this.conflict=true;}
    else if(fx===null&&fy!==null)this.fixed[rx]=fy^rel;
    return true;
  }

  literal(v,player) { // x_v = q_v XOR player
    const [r,p]=this.find(v);
    const flip=p^player;
    const fr=this.fixed[r];
    if(fr!==null)return {fixed:fr^flip};
    return {root:r,flip};
  }

  anchorRootLiteral(lit,value) {
    return this.anchor(lit.root,value^lit.flip);
  }
}

function normalizeClause(dsu,cells,player) {
  const byRoot=new Map();
  for(const v of cells){
    const lit=dsu.literal(v,player);
    if('fixed' in lit){if(lit.fixed===1)return {status:'entailed',literals:[]};continue;}
    let s=byRoot.get(lit.root);
    if(!s){s=new Set();byRoot.set(lit.root,s);}
    s.add(lit.flip);
    if(s.size===2)return {status:'entailed',literals:[]};
  }
  const literals=[];
  for(const [root,flips] of byRoot)literals.push({root,flip:[...flips][0]});
  if(literals.length===0)return {status:'conflict',literals:[]};
  if(literals.length===1)return {status:'unit',literals};
  return {status:'nonlinear',literals};
}

function saturateClauses(dsu,clauses) {
  let changed=true;
  while(changed&&!dsu.conflict){
    changed=false;
    for(const clause of clauses){
      const n=normalizeClause(dsu,clause.cells,clause.player);
      if(n.status==='unit'){
        if(dsu.anchorRootLiteral(n.literals[0],1))changed=true;
      }else if(n.status==='conflict'){
        dsu.conflict=true;
        break;
      }
    }
  }
}

function requirementAffineFeasible(dsu,cells,player) {
  const seen=new Map();
  for(const v of cells){
    const lit=dsu.literal(v,player);
    if('fixed' in lit){if(lit.fixed===1)return false;continue;}
    const prior=seen.get(lit.root);
    if(prior===undefined)seen.set(lit.root,lit.flip);
    else if(prior!==lit.flip)return false;
  }
  return true;
}

function subset(a,b){const B=new Set(b);return a.every(x=>B.has(x));}
function eliminatedByCertifiedClause(requirement,blockers){
  return blockers.some(b=>b.player===requirement.player&&subset(b.cells,requirement.cells));
}
function certRank(localRank,prereqRanks){return Math.max(localRank,...prereqRanks);}
function alternativeRank(...ranks){return Math.min(...ranks);}

// Exact split entails the corresponding pair blocker.
{
  const d=new ParityDSU(2);
  d.union(0,1,1);
  assert.equal(normalizeClause(d,[0,1],0).status,'entailed');
}

// Equality plus a certified pair blocker forces both cells away from the target player.
{
  const d=new ParityDSU(2);
  d.union(0,1,0);
  saturateClauses(d,[{player:0,cells:[0,1]}]);
  assert.equal(d.literal(0,0).fixed,1);
  assert.equal(d.literal(1,0).fixed,1);
  assert.equal(d.conflict,false);
}

// A fixed target-owned literal turns a pair blocker into a unit on its mate.
{
  const d=new ParityDSU(2);
  d.anchor(0,0);
  saturateClauses(d,[{player:0,cells:[0,1]}]);
  assert.equal(d.literal(1,0).fixed,1);
}

// An affine complement relation makes the all-target residual assignment impossible.
{
  const d=new ParityDSU(3);
  d.union(0,2,1);
  assert.equal(requirementAffineFeasible(d,[0,1,2],0),false);
  assert.equal(requirementAffineFeasible(d,[0,1],0),true);
}

// WSL upward closure is exactly blocker-subset coverage.
{
  const blockers=[{player:1,cells:[2,4]}];
  assert.equal(eliminatedByCertifiedClause({player:1,cells:[1,2,4]},blockers),true);
  assert.equal(eliminatedByCertifiedClause({player:1,cells:[2,3]},blockers),false);
  assert.equal(eliminatedByCertifiedClause({player:0,cells:[1,2,4]},blockers),false);
}

// Min-max temporal algebra.
{
  assert.equal(certRank(3,[2,5,4]),5);
  assert.equal(alternativeRank(8,5,7),5);
  assert.equal(alternativeRank(Number.POSITIVE_INFINITY,9),9);
}

// Incompatible guarded facts must be detected, not silently merged.
{
  const d=new ParityDSU(1);
  d.anchor(0,0);
  d.anchor(0,1);
  assert.equal(d.conflict,true);
}

console.log('GUARDED_AFFINE_CLAUSE_CONTROL=PASS');

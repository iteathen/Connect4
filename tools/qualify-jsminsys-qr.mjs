import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  prepareConnect4RbaGeometry,
  prepareConnect4RbaCoordinateScratch,
} from '../vendor/jsminsys/addons/rba-connect4-geometry.mjs';
import {
  connect4RbaBasisFromSupport,
} from '../vendor/jsminsys/addons/rba-connect4-coordinate.mjs';
import {
  connect4RbaFromMoves,
  connect4PositionCode64FromMoves,
} from '../vendor/jsminsys/addons/rba-connect4-ingress.mjs';

function equalU32(a,b,label){
  assert.equal(a.length,b.length,`${label}: length`);
  for(let i=0;i<a.length;i+=1)assert.equal(a[i],b[i],`${label}: word ${i}`);
}
function keyWords(words){return Array.from(words).join(',');}
function shapeCells(g,id){
  const size=g.shapeSize[id],base=id*4,out=new Array(size);
  for(let i=0;i<size;i+=1)out[i]=g.shapeCells[base+i];
  return out;
}
function shapeToken(cells){return cells.join('.');}
function decodeQo(g,root){
  const support=Array.from(root.words.slice(0,g.columns)),n=root.basis.length;
  const players=[[],[]];
  for(let p=0;p<2;p+=1){
    const off=p?g.p1Offset:g.p0Offset;
    for(let i=0;i<n;i+=1)
      if(root.words[off+(i>>>5)]&(1<<(i&31)))
        players[p].push(shapeToken(shapeCells(g,root.basis[i])));
  }
  return {support,p0:players[0],p1:players[1]};
}
function reflectCell(g,cell){
  const row=(cell/g.columns)|0,column=cell%g.columns;
  return row*g.columns+(g.columns-1-column);
}
function reflectQo(g,q){
  const reflectShape=token=>token.split('.').filter(Boolean).map(Number)
    .map(cell=>reflectCell(g,cell)).sort((a,b)=>a-b).join('.');
  return {
    support:q.support.slice().reverse(),
    p0:q.p0.map(reflectShape).sort(shapeTokenCompare),
    p1:q.p1.map(reflectShape).sort(shapeTokenCompare),
  };
}
function shapeTokenCompare(a,b){
  const aa=a.split('.').filter(Boolean).map(Number),bb=b.split('.').filter(Boolean).map(Number);
  if(aa.length!==bb.length)return aa.length-bb.length;
  for(let i=0;i<aa.length;i+=1)if(aa[i]!==bb[i])return aa[i]-bb[i];
  return 0;
}
function qoString(q){
  return `${q.support.join('.')};${q.p0.join('/')};${q.p1.join('/')}`;
}
function orbitId(g,q){
  const a=qoString(q),b=qoString(reflectQo(g,q));
  return a<b?a:b;
}
function checkGeometryReflection(g){
  const map=new Map();
  for(let id=0;id<g.shapeCount;id+=1)map.set(shapeToken(shapeCells(g,id)),id);
  for(let id=0;id<g.shapeCount;id+=1){
    const cells=shapeCells(g,id),
      reflected=cells.map(cell=>reflectCell(g,cell)).sort((a,b)=>a-b),
      expected=map.get(shapeToken(reflected));
    assert.notEqual(expected,undefined,`shape reflection missing id=${id}`);
    assert.equal(g.reflect[id],expected,`shape reflection id=${id}`);
    assert.equal(g.reflect[g.reflect[id]],id,`shape reflection involution id=${id}`);
  }
  for(let c=0;c<g.columns;c+=1)
    assert.equal(g.mirrorColumn[g.mirrorColumn[c]],c,`column reflection involution c=${c}`);
}
function checkBasis(g,root,label){
  const seen=new Uint32Array(g.shapeWordCount),basis=new Uint32Array(g.maxBasis),
    n=connect4RbaBasisFromSupport(g,root.words,0,basis,0,seen);
  assert.equal(n,root.basis.length,`${label}: basis count`);
  for(let i=0;i<n;i+=1)assert.equal(basis[i],root.basis[i],`${label}: basis id ${i}`);
}
function supportRank(g,root){
  let r=0;for(let c=0;c<g.columns;c+=1)r+=root.words[c];return r;
}
function makeChecker(g,label){
  const keyToOrbit=new Map(),orbitToKey=new Map();
  let states=0,mirrors=0,transportEdges=0,collisions=0;
  function check(moves,{transport=false}={}){
    const raw=connect4RbaFromMoves(moves,{geometry:g,canonical:false,positionCode:false}),
      terminal=raw.words[g.metaOffset]&3;
    if(terminal)return {terminal:true};
    assert.equal(raw.words[g.metaOffset]>>>2,supportRank(g,raw),`${label}: rank derived from support`);
    checkBasis(g,raw,`${label}:raw`);
    const canonical=connect4RbaFromMoves(moves,{geometry:g,canonical:true,positionCode:false});
    checkBasis(g,canonical,`${label}:canonical`);
    const mirrorMoves=moves.map(c=>g.columns-1-c),
      mirror=connect4RbaFromMoves(mirrorMoves,{geometry:g,canonical:true,positionCode:false});
    equalU32(canonical.words,mirror.words,`${label}: mirrored q_r words`);
    equalU32(canonical.basis,mirror.basis,`${label}: mirrored q_r basis`);
    const rawQ=decodeQo(g,raw),orbit=orbitId(g,rawQ),key=keyWords(canonical.words),
      canonicalQ=decodeQo(g,canonical);
    assert.equal(orbitId(g,canonicalQ),orbit,`${label}: canonical orbit identity`);
    const oldOrbit=keyToOrbit.get(key);
    if(oldOrbit!==undefined){assert.equal(oldOrbit,orbit,`${label}: key collision crosses q_r orbit`);collisions+=1;}
    else keyToOrbit.set(key,orbit);
    const oldKey=orbitToKey.get(orbit);
    if(oldKey!==undefined)assert.equal(oldKey,key,`${label}: q_r orbit has multiple keys`);
    else orbitToKey.set(orbit,key);
    states+=1;mirrors+=1;

    if(transport){
      for(let c=0;c<g.columns;c+=1){
        if(raw.words[c]>=g.rows)continue;
        const next=[...moves,c],mirroredNext=[...mirrorMoves,g.columns-1-c],
          a=connect4RbaFromMoves(next,{geometry:g,canonical:true,positionCode:false}),
          b=connect4RbaFromMoves(mirroredNext,{geometry:g,canonical:true,positionCode:false});
        assert.equal(a.words[g.metaOffset]&3,b.words[g.metaOffset]&3,`${label}: transported terminal c=${c}`);
        equalU32(a.words,b.words,`${label}: transported child q_r c=${c}`);
        equalU32(a.basis,b.basis,`${label}: transported child basis c=${c}`);
        transportEdges+=1;
      }
    }
    return {terminal:false,key,orbit};
  }
  return {check,summary:()=>({label,states,mirrors,transportEdges,uniqueKeys:keyToOrbit.size,uniqueOrbits:orbitToKey.size,collisionObservations:collisions})};
}

function exhaustive4x4(){
  const g=prepareConnect4RbaGeometry({columns:4,rows:4});
  checkGeometryReflection(g);
  const check=makeChecker(g,'4x4-exhaustive'),seen=new Set(),stack=[[]];
  let positions=0,terminal=0,edges=0;
  while(stack.length){
    const moves=stack.pop(),position=connect4PositionCode64FromMoves(moves,{geometry:g}),
      pkey=`${position.lo}:${position.hi}`;
    if(seen.has(pkey))continue;
    seen.add(pkey);positions+=1;
    const raw=connect4RbaFromMoves(moves,{geometry:g,canonical:false,positionCode:false});
    if(raw.words[g.metaOffset]&3){terminal+=1;continue;}
    check.check(moves,{transport:positions<=12000});
    for(let c=g.columns-1;c>=0;c-=1)if(raw.words[c]<g.rows){stack.push([...moves,c]);edges+=1;}
  }
  return {...check.summary(),physicalPositions:positions,terminalPositions:terminal,generatedEdges:edges};
}

function lcg(seed){
  let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x;};
}
function standard7x6(){
  const g=prepareConnect4RbaGeometry({columns:7,rows:6});
  checkGeometryReflection(g);
  const check=makeChecker(g,'7x6-standard'),rand=lcg(0x51a7c0de),seen=new Set();
  const seeds=[
    [],
    Array.from('45461667',c=>c.charCodeAt(0)-49),
    Array.from('13333111',c=>c.charCodeAt(0)-49),
    [3,2,3,2,4,1,4,1],
    [0,6,1,5,2,4],
  ];
  for(const moves of seeds){
    for(let k=0;k<=moves.length;k++){
      const prefix=moves.slice(0,k);
      try{const raw=connect4RbaFromMoves(prefix,{geometry:g,canonical:false,positionCode:false});
        if(!(raw.words[g.metaOffset]&3))seen.add(prefix.join(''));
      }catch{}
    }
  }
  for(let game=0;game<384;game+=1){
    const moves=[];
    for(let ply=0;ply<36;ply+=1){
      const raw=connect4RbaFromMoves(moves,{geometry:g,canonical:false,positionCode:false});
      if(raw.words[g.metaOffset]&3)break;
      seen.add(moves.join(''));
      const legal=[];for(let c=0;c<g.columns;c+=1)if(raw.words[c]<g.rows)legal.push(c);
      if(!legal.length)break;
      const c=legal[rand()%legal.length];moves.push(c);
    }
  }
  let i=0;
  for(const token of seen){
    const moves=Array.from(token,c=>c.charCodeAt(0)-48);
    check.check(moves,{transport:i<2500});i+=1;
  }
  return {...check.summary(),sampledHistories:seen.size};
}

const bounded=exhaustive4x4(),standard=standard7x6();
const result={
  event:'jsminsys-qr-qualification',
  jsminsys:execFileSync('git',['-C',fileURLToPath(new URL('../vendor/jsminsys',import.meta.url)),'rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  theoremScope:'current JSMinSys exact key as reflection-orbit scalar-value cache realization',
  bounded,
  standard,
  checks:[
    'support deterministically reconstructs ordered basis',
    'coordinate bitsets decode exact residual antichain membership relative to support-derived basis',
    'shape and column reflection are involutions',
    'mirrored legal histories canonicalize to identical full exact keys',
    'independent semantic q_r orbit id and JSMinSys canonical key are bijective over controls',
    'literal action transporter c -> width-1-c preserves terminal token and child canonical key',
    'hash/slot are not used as equality authority; full key equality is required',
  ],
};
console.log(JSON.stringify(result));

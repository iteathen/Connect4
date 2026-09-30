import assert from 'node:assert/strict';
import {familySaturationPairDelta} from './ooo-six-bucket-family-saturation-lib.mjs';

export const SIGN_CHANNEL_MODES=[
  'TOTAL','SIGNED_NET','ABS_NET','UNORDERED_PAIR','SEPARATED'
];

export const SIGN_CHANNEL_GRID=[];
for(const C of SIGN_CHANNEL_MODES)
  for(const D of SIGN_CHANNEL_MODES)
    for(const A of SIGN_CHANNEL_MODES)
      SIGN_CHANNEL_GRID.push({
        C,D,A,
        key:'C='+C+'|D='+D+'|A='+A
      });

export const SELECTED_FAMILY_SATURATION={
  C:'PRESENCE',
  D:'CLIP3',
  A:'CLIP2'
};

function sourceInterval(family,value){
  assert.ok(['C','D','A'].includes(family),'unknown sign-channel family '+family);
  assert.ok(Number.isInteger(value)&&value>=0,'bucket symbol must be a nonnegative integer code');
  if(family==='C'){
    assert.ok(value===0||value===1,'C presence symbol must be 0 or 1');
    return value===0?{lo:0,hi:0}:{lo:1,hi:Infinity};
  }
  if(family==='D'){
    assert.ok(value>=0&&value<=3,'D clip3 symbol must be 0..3');
    return value<3?{lo:value,hi:value}:{lo:3,hi:Infinity};
  }
  assert.ok(value>=0&&value<=2,'A clip2 symbol must be 0..2');
  return value<2?{lo:value,hi:value}:{lo:2,hi:Infinity};
}

function addHi(a,b){return a===Infinity||b===Infinity?Infinity:a+b;}
function subLo(a,b){return b===Infinity?-Infinity:a-b;}
function subHi(a,b){return a===Infinity?Infinity:a-b;}

function sumInterval(a,b){
  return {lo:a.lo+b.lo,hi:addHi(a.hi,b.hi)};
}
function differenceInterval(plus,minus){
  return {lo:subLo(plus.lo,minus.hi),hi:subHi(plus.hi,minus.lo)};
}
function absInterval(x){
  if(x.lo<=0&&x.hi>=0){
    const hi=x.lo===-Infinity||x.hi===Infinity?Infinity:Math.max(-x.lo,x.hi);
    return {lo:0,hi};
  }
  if(x.hi<0)return {lo:-x.hi,hi:x.lo===-Infinity?Infinity:-x.lo};
  return {lo:x.lo,hi:x.hi};
}
function bound(x){
  if(x===Infinity)return '+inf';
  if(x===-Infinity)return '-inf';
  return String(x);
}
function interval(prefix,x){
  return prefix+'=['+bound(x.lo)+','+bound(x.hi)+']';
}
function sourceLabel(family,value){
  if(family==='C'&&value===1)return '1+';
  if(family==='D'&&value===3)return '3+';
  if(family==='A'&&value===2)return '2+';
  return String(value);
}

export function coupleFamilyPair(family,plus,minus,mode){
  assert.ok(SIGN_CHANNEL_MODES.includes(mode),'unknown sign-channel coupling mode '+mode);
  const p=sourceInterval(family,plus),m=sourceInterval(family,minus);
  switch(mode){
    case 'TOTAL':
      return interval('T',sumInterval(p,m));
    case 'SIGNED_NET':
      return interval('N',differenceInterval(p,m));
    case 'ABS_NET':
      return interval('A',absInterval(differenceInterval(p,m)));
    case 'UNORDERED_PAIR': {
      const values=[plus,minus].sort((a,b)=>a-b);
      return 'U='+values.map(v=>sourceLabel(family,v)).join(',');
    }
    case 'SEPARATED':
      return '+='+sourceLabel(family,plus)+',-='+sourceLabel(family,minus);
    default:
      assert.fail('unreachable sign-channel coupling mode '+mode);
  }
}

function parseSelectedSix(raw){
  const m=raw.match(/^C\+=(\d+),C-=(\d+)\|D\+=(\d+),D-=(\d+),A\+=(\d+),A-=(\d+)$/);
  assert.ok(m,'unexpected selected six-bucket signature '+raw);
  return {
    cp:Number(m[1]),cm:Number(m[2]),
    dp:Number(m[3]),dm:Number(m[4]),
    ap:Number(m[5]),am:Number(m[6])
  };
}

export function signChannelPairSignature(raw,candidate){
  const z=parseSelectedSix(raw);
  for(const k of ['C','D','A'])
    assert.ok(SIGN_CHANNEL_MODES.includes(candidate[k]),'invalid '+k+' sign-channel coupling mode');

  return 'C{'+coupleFamilyPair('C',z.cp,z.cm,candidate.C)+'}'+
    '|D{'+coupleFamilyPair('D',z.dp,z.dm,candidate.D)+'}'+
    '|A{'+coupleFamilyPair('A',z.ap,z.am,candidate.A)+'}';
}

export function signChannelPairDelta(aVertex,bVertex,candidate){
  const selected=familySaturationPairDelta(
    aVertex,
    bVertex,
    SELECTED_FAMILY_SATURATION
  );
  return signChannelPairSignature(selected,candidate);
}

export function signChannelTriangleKey(vertices,candidate){
  assert.equal(vertices.length,3,'sign-channel triangle requires three vertices');
  return [
    signChannelPairDelta(vertices[0],vertices[1],candidate),
    signChannelPairDelta(vertices[0],vertices[2],candidate),
    signChannelPairDelta(vertices[1],vertices[2],candidate)
  ].sort().join('|||');
}

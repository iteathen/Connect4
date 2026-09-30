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

export function coupleFamilyPair(plus,minus,mode){
  assert.ok(Number.isInteger(plus)&&plus>=0,'plus bucket must be a nonnegative integer');
  assert.ok(Number.isInteger(minus)&&minus>=0,'minus bucket must be a nonnegative integer');
  assert.ok(SIGN_CHANNEL_MODES.includes(mode),'unknown sign-channel coupling mode '+mode);

  switch(mode){
    case 'TOTAL':
      return 'T='+(plus+minus);
    case 'SIGNED_NET':
      return 'N='+(plus-minus);
    case 'ABS_NET':
      return 'A='+Math.abs(plus-minus);
    case 'UNORDERED_PAIR':
      return 'U='+[plus,minus].sort((a,b)=>a-b).join(',');
    case 'SEPARATED':
      return '+='+plus+',-='+minus;
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

  return 'C{'+coupleFamilyPair(z.cp,z.cm,candidate.C)+'}'+
    '|D{'+coupleFamilyPair(z.dp,z.dm,candidate.D)+'}'+
    '|A{'+coupleFamilyPair(z.ap,z.am,candidate.A)+'}';
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

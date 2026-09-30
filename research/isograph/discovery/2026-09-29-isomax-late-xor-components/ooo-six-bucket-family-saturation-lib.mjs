import assert from 'node:assert/strict';
import {ownerQuotientPairDelta} from './ooo-pair-delta-owner-lib.mjs';
import {transformBucketCount} from './ooo-six-bucket-count-lib.mjs';

export const FAMILY_SATURATION_MODES=['PRESENCE','ZOE','CLIP2','CLIP3'];

function bucketMode(mode){
  assert.ok(FAMILY_SATURATION_MODES.includes(mode),'unknown family saturation mode '+mode);
  return 'BUCKET_'+mode;
}

export const FAMILY_SATURATION_GRID=[];
for(const C of FAMILY_SATURATION_MODES)
  for(const D of FAMILY_SATURATION_MODES)
    for(const A of FAMILY_SATURATION_MODES)
      FAMILY_SATURATION_GRID.push({
        C,D,A,
        key:'C='+C+'|D='+D+'|A='+A
      });

function parseSix(raw){
  const m=raw.match(/^C\+=(\d+),C-=(\d+)\|D\+=(\d+),D-=(\d+),A\+=(\d+),A-=(\d+)$/);
  assert.ok(m,'unexpected six-bucket signature '+raw);
  return {
    cp:Number(m[1]),cm:Number(m[2]),
    dp:Number(m[3]),dm:Number(m[4]),
    ap:Number(m[5]),am:Number(m[6])
  };
}

export function transformSixBucketByFamily(raw,candidate){
  const z=parseSix(raw);
  for(const k of ['C','D','A'])
    assert.ok(FAMILY_SATURATION_MODES.includes(candidate[k]),'invalid '+k+' family saturation mode');

  const c=n=>String(transformBucketCount(n,bucketMode(candidate.C)));
  const d=n=>String(transformBucketCount(n,bucketMode(candidate.D)));
  const a=n=>String(transformBucketCount(n,bucketMode(candidate.A)));

  return 'C+='+c(z.cp)+',C-='+c(z.cm)+
    '|D+='+d(z.dp)+',D-='+d(z.dm)+
    ',A+='+a(z.ap)+',A-='+a(z.am);
}

export function familySaturationPairDelta(aVertex,bVertex,candidate){
  const raw=ownerQuotientPairDelta(aVertex,bVertex,'D_SYMMETRIC_MARGINALS');
  return transformSixBucketByFamily(raw,candidate);
}

export function familySaturationTriangleKey(vertices,candidate){
  assert.equal(vertices.length,3,'family saturation triangle requires three vertices');
  return [
    familySaturationPairDelta(vertices[0],vertices[1],candidate),
    familySaturationPairDelta(vertices[0],vertices[2],candidate),
    familySaturationPairDelta(vertices[1],vertices[2],candidate)
  ].sort().join('|||');
}
